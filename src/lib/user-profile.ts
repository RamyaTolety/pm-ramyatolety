import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "./firebase";

export async function markIntroPending(uid: string) {
  return setDoc(doc(db, "users", uid), { hasSeenIntro: false }, { merge: true });
}

export async function markIntroSeen(uid: string) {
  return setDoc(doc(db, "users", uid), { hasSeenIntro: true }, { merge: true });
}

export function subscribeToUserProfile(
  uid: string,
  callback: (hasSeenIntro: boolean | null) => void
) {
  return onSnapshot(
    doc(db, "users", uid),
    (snap) => {
      callback(snap.exists() ? (snap.data().hasSeenIntro ?? null) : null);
    },
    () => {
      // e.g. permission-denied because the Firestore rule for users/{userId}
      // hasn't been published yet — fall back to null so callers can rely on
      // their existing localStorage-based logic instead.
      callback(null);
    }
  );
}
