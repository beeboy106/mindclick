import { createClient } from "npm:@supabase/supabase-js@2";
import { createRemoteJWKSet, jwtVerify } from "npm:jose@5";

const firebaseProjectId = "mindclick-f4bf4";
const firebaseJwks = createRemoteJWKSet(
  new URL("https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com"),
);
const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  { auth: { persistSession: false } },
);

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

async function firebaseUser(request: Request) {
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) throw new Error("Missing Firebase ID token");
  const { payload } = await jwtVerify(token, firebaseJwks, {
    issuer: `https://securetoken.google.com/${firebaseProjectId}`,
    audience: firebaseProjectId,
  });
  if (!payload.sub) throw new Error("Invalid Firebase ID token");
  // Firebase puts the provider subjects inside this signed claim.  Do not use
  // a client-supplied Google id here: that would allow somebody to claim a
  // legacy profile that is not theirs.
  const firebaseClaims = payload.firebase as {
    identities?: Record<string, unknown>;
  } | undefined;
  const googleSubjects = firebaseClaims?.identities?.["google.com"];
  const googleSubject = Array.isArray(googleSubjects)
    ? googleSubjects.find((value): value is string => typeof value === "string" && value.length > 0)
    : undefined;

  return {
    firebaseUid: payload.sub,
    email: payload.email as string | undefined,
    legacyUserId: googleSubject ? `google_${googleSubject}` : undefined,
  };
}

type FirebaseUser = Awaited<ReturnType<typeof firebaseUser>>;

async function ownProfile(user: FirebaseUser) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("firebase_uid", user.firebaseUid)
    .maybeSingle();
  if (error) throw error;
  if (data || !user.legacyUserId) return data;

  // A Firebase UID is the primary key for new sessions.  The verified Google
  // subject is a durable fallback for profiles created before a Firebase
  // account was re-linked.  Rebind only after proving ownership from the
  // signed token, never from request JSON.
  const { data: legacyProfile, error: legacyError } = await supabase
    .from("profiles")
    .select("*")
    .eq("legacy_user_id", user.legacyUserId)
    .maybeSingle();
  if (legacyError) throw legacyError;
  if (!legacyProfile || legacyProfile.firebase_uid === user.firebaseUid) return legacyProfile;

  const { data: restoredProfile, error: restoreError } = await supabase
    .from("profiles")
    .update({ firebase_uid: user.firebaseUid, updated_at: new Date().toISOString() })
    .eq("id", legacyProfile.id)
    .select()
    .single();
  if (restoreError) throw restoreError;
  return restoredProfile;
}

Deno.serve(async (request) => {
  try {
    const user = await firebaseUser(request);
    const path = new URL(request.url).pathname.replace(/^.*mindclick-api\/?/, "");
    const payload = request.method === "GET" ? {} : await request.json();

    if (path === "profile/me" && request.method === "GET") {
      const profile = await ownProfile(user);
      if (!profile) return json({ profile: null });
      const [{ data: quiz, error: quizError }, { data: favorites, error: favoritesError }] = await Promise.all([
        supabase.from("quiz_responses").select("*").eq("profile_id", profile.id).maybeSingle(),
        supabase.from("favorites").select("target:profiles!favorites_target_profile_id_fkey(legacy_user_id)").eq("profile_id", profile.id),
      ]);
      if (quizError) throw quizError;
      if (favoritesError) throw favoritesError;
      return json({
        profile,
        quiz,
        favorites: (favorites ?? []).map((item) => item.target?.legacy_user_id).filter(Boolean),
      });
    }

    if (path === "profile/upsert") {
      if (!user.legacyUserId) {
        return json({ error: "Google identity is required to create a profile" }, 400);
      }
      const profileData = {
          firebase_uid: user.firebaseUid,
          legacy_user_id: user.legacyUserId,
          display_name: payload.name ?? "",
          avatar_url: payload.image ?? null,
          faculty: payload.faculty ?? "",
          bio: payload.bio ?? "",
          gender: payload.gender ?? "prefer_not_to_say",
          social_links: payload.socialLinks ?? {},
          gallery_images: payload.galleryImages ?? [],
          has_accepted_policy: Boolean(payload.hasAcceptedPolicy),
          policy_accepted_at: payload.policyAcceptedAt ?? null,
          updated_at: new Date().toISOString(),
      };
      const existingProfile = await ownProfile(user);
      const profileRequest = existingProfile
        ? supabase
          .from("profiles")
          .update(profileData)
          .eq("id", existingProfile.id)
        : supabase
          .from("profiles")
          .insert({
          firebase_uid: user.firebaseUid,
          legacy_user_id: user.legacyUserId,
          ...profileData,
        });
      const { data: profile, error } = await profileRequest
        .select()
        .single();
      if (error) throw error;
      return json({ profile });
    }

    const profile = await ownProfile(user);
    if (!profile) return json({ error: "Create profile first" }, 409);

    if (path === "quiz/upsert") {
      const { data, error } = await supabase
        .from("quiz_responses")
        .upsert({
          profile_id: profile.id,
          completed_categories: payload.completedCategories ?? [],
          category_answers: payload.categoryAnswers ?? [],
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();
      if (error) throw error;
      return json({ quiz: data });
    }

    if (path === "directory/list" && request.method === "GET") {
      const { data, error } = await supabase
        .from("profiles")
        .select("*, quiz:quiz_responses(completed_categories, category_answers)")
        .neq("id", profile.id)
        .limit(500);
      if (error) throw error;
      return json({ profiles: data });
    }

    if (path === "favorites/toggle") {
      const { data: target, error: targetError } = await supabase
        .from("profiles")
        .select("id")
        .eq("legacy_user_id", payload.targetLegacyUserId)
        .maybeSingle();
      if (targetError) throw targetError;
      if (!target) return json({ error: "Target profile not found" }, 404);
      if (target.id === profile.id) return json({ error: "Cannot favorite yourself" }, 400);
      const { error } = payload.active
        ? await supabase.from("favorites").upsert({ profile_id: profile.id, target_profile_id: target.id })
        : await supabase.from("favorites").delete().eq("profile_id", profile.id).eq("target_profile_id", target.id);
      if (error) throw error;
      return json({ active: Boolean(payload.active) });
    }

    if (path === "feed/list" && request.method === "GET") {
      const { data, error } = await supabase
        .from("posts")
        .select("*, author:profiles!posts_author_profile_id_fkey(id, legacy_user_id, display_name, avatar_url), comments:post_comments(*, author:profiles!post_comments_author_profile_id_fkey(id, legacy_user_id, display_name, avatar_url)), reactions:post_reactions(profile:profiles!post_reactions_profile_id_fkey(legacy_user_id))")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return json({ posts: data });
    }

    if (path === "feed/create") {
      const { data, error } = await supabase
        .from("posts")
        .insert({ author_profile_id: profile.id, topic_id: payload.topicId ?? null, content: payload.content ?? "", image_url: payload.image ?? null })
        .select()
        .single();
      if (error) throw error;
      return json({ post: data }, 201);
    }

    if (path === "feed/delete") {
      if (!payload.postId) return json({ error: "postId is required" }, 400);
      const { error } = await supabase
        .from("posts")
        .delete()
        .eq("id", payload.postId)
        .eq("author_profile_id", profile.id);
      if (error) throw error;
      return new Response(null, { status: 204 });
    }

    if (path === "feed/react") {
      if (!payload.postId) return json({ error: "postId is required" }, 400);
      const { error } = payload.active
        ? await supabase.from("post_reactions").upsert({ post_id: payload.postId, profile_id: profile.id })
        : await supabase.from("post_reactions").delete().eq("post_id", payload.postId).eq("profile_id", profile.id);
      if (error) throw error;
      return new Response(null, { status: 204 });
    }

    if (path === "feed/comment") {
      const { data, error } = await supabase
        .from("post_comments")
        .insert({ post_id: payload.postId, author_profile_id: profile.id, parent_comment_id: payload.parentCommentId ?? null, content: payload.content })
        .select()
        .single();
      if (error) throw error;
      return json({ comment: data }, 201);
    }

    return json({ error: "Not found" }, 404);
  } catch (error) {
    console.error(error);
    const message = error instanceof Error ? error.message : "Unexpected error";
    const errorCode = typeof error === "object" && error && "code" in error
      ? String(error.code)
      : "";
    const isAuthError = errorCode.startsWith("ERR_J") || /token|jwt|jws|issuer|audience|signature/i.test(message);
    return json({ error: message }, isAuthError ? 401 : 500);
  }
});
