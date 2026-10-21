# Firestore Setup

The Firebase project already has a default Firestore Native database in `asia-south2`. The app is configured to use that region through Firebase Functions. Firestore client rules deny direct access; the authenticated Functions API reads and writes the records.

## One-time Setup

1. In Firebase Console, open **Authentication** and finish the initial setup. The app signs in with Firebase custom tokens; it does not use the demo passwords from the old SQLite seed data.
2. Functions deployment requires the Firebase project to be on the Blaze plan. Review billing before enabling it; Function invocations and Firestore usage can incur charges.
3. For a local SQLite migration, install Google Cloud CLI and authenticate Application Default Credentials, or create a service-account key and keep it outside this repository. Set `GOOGLE_APPLICATION_CREDENTIALS` to that private file path in your local PowerShell session.
4. Set `RADHIKA_SUPERADMIN_PASSWORD` in that same private session to a unique password with at least 12 characters. Do not put it in source control or send it in chat.
5. Deploy the API and deny-by-default rules, then import the existing SQLite records:

   ```powershell
   firebase deploy --only firestore:rules,functions --project radhika-26dd1
   npm run migrate:firestore
   ```

6. The migration sets the super-admin password from `RADHIKA_SUPERADMIN_PASSWORD`, strips plaintext passwords from staff documents, and disables all other seeded staff until a super-admin assigns each a new password. Then redeploy Hosting so `/api/**` routes to the Functions API:

   ```powershell
   firebase deploy --only hosting --project radhika-26dd1
   ```

## Local Development

`npm start` runs the Firebase Hosting, Functions, Auth, and Firestore emulators. The Firestore emulator requires Java. Local emulator data is separate from the production Firestore database.