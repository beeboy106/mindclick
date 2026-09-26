// Supabase is accessed only through Edge Functions. Firebase remains the identity provider.
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = () => Boolean(supabaseUrl && supabaseAnonKey);

export async function callSupabaseApi(path, firebaseIdToken, body = undefined) {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase ยังไม่ได้ตั้งค่า");
  }
  if (!firebaseIdToken) {
    throw new Error("ไม่พบ Firebase session");
  }

  const res = await fetch(`${supabaseUrl}/functions/v1/mindclick-api/${path}`, {
    method: body === undefined ? "GET" : "POST",
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${firebaseIdToken}`,
      "Content-Type": "application/json",
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });

  if (!res.ok) {
    const message = await res.text();
    throw new Error(message || `Supabase HTTP ${res.status}`);
  }
  return res.status === 204 ? null : res.json();
}

export const getSupabaseAccount = (firebaseIdToken) =>
  callSupabaseApi("profile/me", firebaseIdToken);

export const upsertSupabaseProfile = (firebaseIdToken, profile) =>
  callSupabaseApi("profile/upsert", firebaseIdToken, profile);

export const upsertSupabaseQuiz = (firebaseIdToken, quiz) =>
  callSupabaseApi("quiz/upsert", firebaseIdToken, quiz);

export const getSupabaseDirectory = (firebaseIdToken) =>
  callSupabaseApi("directory/list", firebaseIdToken);

export const setSupabaseFavorite = (firebaseIdToken, targetLegacyUserId, active) =>
  callSupabaseApi("favorites/toggle", firebaseIdToken, { targetLegacyUserId, active });

export const getSupabaseFeed = (firebaseIdToken) =>
  callSupabaseApi("feed/list", firebaseIdToken);

export const createSupabasePost = (firebaseIdToken, post) =>
  callSupabaseApi("feed/create", firebaseIdToken, post);

export const deleteSupabasePost = (firebaseIdToken, postId) =>
  callSupabaseApi("feed/delete", firebaseIdToken, { postId });

export const setSupabaseReaction = (firebaseIdToken, postId, active) =>
  callSupabaseApi("feed/react", firebaseIdToken, { postId, active });

export const createSupabaseComment = (firebaseIdToken, comment) =>
  callSupabaseApi("feed/comment", firebaseIdToken, comment);
