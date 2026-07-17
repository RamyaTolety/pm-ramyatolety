// Bulk-create test accounts for staff verification (requirements.md:
// "Support 30 test accounts creatable programmatically").
//
// Usage:
//   GOOGLE_APPLICATION_CREDENTIALS=./serviceAccountKey.json \
//     node scripts/seed-test-accounts.mjs --count 30 --project <projectId>
//
// Requires a Firebase service account key (Firebase console > Project
// settings > Service accounts > Generate new private key). Never commit
// that file — it's covered by .gitignore's `*serviceAccountKey*.json` rule.

import { initializeApp, applicationDefault } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

const args = Object.fromEntries(
  process.argv.slice(2).map((arg, i, arr) => {
    if (!arg.startsWith("--")) return [];
    return [arg.slice(2), arr[i + 1]];
  }).filter((pair) => pair.length === 2)
);

const count = Number(args.count ?? 30);
const password = args.password ?? "cohort-test-pass-123";
const projectId = args.project; // optional: also add these emails as project members
const emailPrefix = args.prefix ?? "cohort-test";
const emailDomain = args.domain ?? "example.com";

if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  console.error(
    "Set GOOGLE_APPLICATION_CREDENTIALS to the path of your Firebase service account key first."
  );
  process.exit(1);
}

initializeApp({ credential: applicationDefault() });
const auth = getAuth();
const db = getFirestore();

const emails = Array.from(
  { length: count },
  (_, i) => `${emailPrefix}-${String(i + 1).padStart(2, "0")}@${emailDomain}`
);

const created = [];
for (const email of emails) {
  try {
    const user = await auth.createUser({ email, password });
    created.push(user.email);
    console.log(`created ${user.email}`);
  } catch (err) {
    if (err.code === "auth/email-already-exists") {
      created.push(email);
      console.log(`already exists ${email}`);
    } else {
      console.error(`failed ${email}:`, err.message);
    }
  }
}

if (projectId) {
  const projectRef = db.collection("projects").doc(projectId);
  const snap = await projectRef.get();
  if (!snap.exists) {
    console.error(`Project ${projectId} not found — skipping membership update.`);
  } else {
    const existing = snap.data().memberEmails ?? [];
    const memberEmails = Array.from(new Set([...existing, ...created]));
    await projectRef.update({ memberEmails });
    console.log(`Added ${created.length} accounts as members of project ${projectId}`);
  }
}

console.log(`Done. ${created.length}/${count} accounts ready (password: ${password}).`);
