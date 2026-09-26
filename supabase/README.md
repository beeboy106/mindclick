# Supabase deployment

1. Link project ref `ohodzvqfyjkvmirpkgqe` with the Supabase CLI, or use the Dashboard editors.
2. Apply both SQL files in timestamp order. If the core migration was already applied, apply only `20260925170000_profile_policy.sql`.
3. Deploy `functions/mindclick-api` with Firebase-token authentication enabled inside the function and Supabase gateway JWT verification disabled:

   `npx supabase functions deploy mindclick-api --project-ref ohodzvqfyjkvmirpkgqe --no-verify-jwt`

4. Hosted Supabase Edge Functions provide `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`. Never copy the service-role key into the mobile app or an `EXPO_PUBLIC_*` variable.
5. A request with an invalid Firebase token should return HTTP 401. HTTP 404 from `/functions/v1/mindclick-api/profile/me` means the function is not deployed under the expected name.

## One-off Firestore feed migration

1. Apply `20260926100000_add_firestore_migration_keys.sql`.
2. Ensure every legacy post author has already signed in once, so their Supabase profile exists. The migration deliberately skips unknown authors rather than creating an incorrect Firebase identity.
3. Set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` locally. Set `FIREBASE_ID_TOKEN` too if Firestore rules require an authenticated read.
4. Run `node scripts/migrate-firestore-posts.mjs`. It only reads Firestore and is safe to rerun; source Firestore document IDs are retained as unique migration keys.
