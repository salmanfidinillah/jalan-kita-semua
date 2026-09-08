import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import type { User } from "firebase/auth";
import { getFirebaseDb } from "@/lib/firebase/client";

export async function createUserProfile(user: User) {
  const profileRef = doc(getFirebaseDb(), "users", user.uid);

  await setDoc(profileRef, {
    displayName: user.displayName?.trim() || "Pengguna JALANIN",
    email: user.email?.toLowerCase() || "",
    role: "user",
    photoUrl: user.photoURL,
    isActive: true,
    contributionCount: 0,
    reportCount: 0,
    verificationCount: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}