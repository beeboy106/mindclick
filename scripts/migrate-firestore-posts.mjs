/*
 * One-off migration: Cloud Firestore `posts` -> Supabase feed tables.
 *
 * This script never deletes or changes Firestore. It is safe to rerun after
 * applying 20260926100000_add_firestore_migration_keys.sql because source
 * document IDs are stored in unique legacy_firestore_id columns.
 *
 * Required environment variables:
 *   SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 * Optional (needed when Firestore rules do not allow reading posts publicly):
 *   FIREBASE_ID_TOKEN
 *
 * Run with Node 20+:
 *   node scripts/migrate-firestore-posts.mjs
 */

const FIREBASE_PROJECT_ID = "mindclick-f4bf4";
const FIREBASE_API_KEY = "AIzaSyDBYnMIPYSpcVVp60X2Qny8FRPilnoZSsQ";
const supabaseUrl = process.env.SUPABASE_URL?.replace(/\/$/, "");
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const firebaseIdToken = process.env.FIREBASE_ID_TOKEN;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY before running this migration.");
}

const firestoreBaseUrl = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents`;
const profileCache = new Map();
const summary = { scanned: 0, migrated: 0, skippedPosts: [], migratedComments: 0, skippedComments: [], migratedReactions: 0 };

function decodeFirestoreValue(value) {
  if ("stringValue" in value) return value.stringValue;
  if ("booleanValue" in value) return value.booleanValue;
  if ("integerValue" in value) return Number(value.integerValue);
  if ("doubleValue" in value) return value.doubleValue;
  if ("timestampValue" in value) return value.timestampValue;
  if ("nullValue" in value) return null;
  if ("arrayValue" in value) return (value.arrayValue.values || []).map(decodeFirestoreValue);
  if ("mapValue" in value) return decodeFirestoreFields(value.mapValue.fields || {});
  return null;
}

function decodeFirestoreFields(fields) {
  return Object.fromEntries(Object.entries(fields || {}).map(([key, value]) => [key, decodeFirestoreValue(value)]));
}

function createdAt(source) {
  if (typeof source.timestamp === "number" && Number.isFinite(source.timestamp)) {
    return new Date(source.timestamp).toISOString();
  }
  if (typeof source.createdAt === "string" && !Number.isNaN(Date.parse(source.createdAt))) {
    return new Date(source.createdAt).toISOString();
  }
  return new Date().toISOString();
}

async function request(url, options = {}) {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`${options.method || "GET"} ${url}: ${response.status} ${await response.text()}`);
  }
  if (response.status === 204) return null;
  return response.json();
}

function supabaseHeaders(prefer = "return=representation") {
  return {
    apikey: serviceRoleKey,
    Authorization: `Bearer ${serviceRoleKey}`,
    "Content-Type": "application/json",
    Prefer: prefer,
  };
}

async function profileIdFor(legacyUserId) {
  if (!legacyUserId) return null;
  if (profileCache.has(legacyUserId)) return profileCache.get(legacyUserId);
  const filter = encodeURIComponent(`eq.${legacyUserId}`);
  const rows = await request(`${supabaseUrl}/rest/v1/profiles?select=id&legacy_user_id=${filter}`, {
    headers: supabaseHeaders(),
  });
  const id = rows[0]?.id ?? null;
  profileCache.set(legacyUserId, id);
  return id;
}

async function upsert(table, row, conflict) {
  const rows = await request(`${supabaseUrl}/rest/v1/${table}?on_conflict=${encodeURIComponent(conflict)}`, {
    method: "POST",
    headers: supabaseHeaders("resolution=merge-duplicates,return=representation"),
    body: JSON.stringify(row),
  });
  return rows[0];
}

async function listFirestorePosts() {
  const documents = [];
  let pageToken = "";
  do {
    const params = new URLSearchParams({ pageSize: "100", key: FIREBASE_API_KEY });
    if (pageToken) params.set("pageToken", pageToken);
    const headers = firebaseIdToken ? { Authorization: `Bearer ${firebaseIdToken}` } : {};
    const page = await request(`${firestoreBaseUrl}/posts?${params}`, { headers });
    documents.push(...(page.documents || []));
    pageToken = page.nextPageToken || "";
  } while (pageToken);
  return documents;
}

async function migrateComments(sourcePost, supabasePostId) {
  const sourceComments = Array.isArray(sourcePost.comments) ? sourcePost.comments : [];
  const commentIds = new Map();

  for (let index = 0; index < sourceComments.length; index += 1) {
    const comment = sourceComments[index] || {};
    const sourceCommentId = String(comment.id || comment.commentId || `comment_${index}`);
    const legacyId = `${sourcePost.id}:${sourceCommentId}`;
    const authorProfileId = await profileIdFor(comment.userId || comment.authorId);
    const content = String(comment.content || "").trim().slice(0, 2000);
    if (!authorProfileId || !content) {
      summary.skippedComments.push({ postId: sourcePost.id, commentId: legacyId, reason: !authorProfileId ? "profile missing" : "empty content" });
      continue;
    }
    const migrated = await upsert("post_comments", {
      legacy_firestore_id: legacyId,
      post_id: supabasePostId,
      author_profile_id: authorProfileId,
      content,
      created_at: createdAt(comment),
    }, "legacy_firestore_id");
    commentIds.set(sourceCommentId, migrated.id);
    summary.migratedComments += 1;
  }

  for (let index = 0; index < sourceComments.length; index += 1) {
    const comment = sourceComments[index] || {};
    const sourceCommentId = String(comment.id || comment.commentId || `comment_${index}`);
    const migratedId = commentIds.get(sourceCommentId);
    const parentLegacyId = comment.parentId || comment.replyTo?.commentId;
    const parentId = parentLegacyId ? commentIds.get(String(parentLegacyId)) : null;
    if (!migratedId || !parentId) continue;
    await request(`${supabaseUrl}/rest/v1/post_comments?id=eq.${encodeURIComponent(migratedId)}`, {
      method: "PATCH",
      headers: supabaseHeaders("return=minimal"),
      body: JSON.stringify({ parent_comment_id: parentId }),
    });
  }
}

async function migrateReactions(sourcePost, supabasePostId) {
  for (const legacyUserId of Array.isArray(sourcePost.likes) ? sourcePost.likes : []) {
    const profileId = await profileIdFor(legacyUserId);
    if (!profileId) continue;
    await upsert("post_reactions", { post_id: supabasePostId, profile_id: profileId }, "post_id,profile_id");
    summary.migratedReactions += 1;
  }
}

for (const document of await listFirestorePosts()) {
  const source = { id: document.name.split("/").pop(), ...decodeFirestoreFields(document.fields) };
  summary.scanned += 1;
  const authorProfileId = await profileIdFor(source.authorId);
  if (!authorProfileId) {
    summary.skippedPosts.push({ postId: source.id, reason: "author profile missing" });
    continue;
  }
  const post = await upsert("posts", {
    legacy_firestore_id: source.id,
    author_profile_id: authorProfileId,
    topic_id: source.topicId || null,
    content: String(source.content || ""),
    image_url: source.image || null,
    created_at: createdAt(source),
    updated_at: createdAt(source),
  }, "legacy_firestore_id");
  summary.migrated += 1;
  await migrateComments(source, post.id);
  await migrateReactions(source, post.id);
}

console.log(JSON.stringify(summary, null, 2));
