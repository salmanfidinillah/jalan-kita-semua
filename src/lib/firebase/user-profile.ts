import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import type { User } from "firebase/auth";
import { getFirebaseDb } from "@/lib/firebase/client";

export type UserRole = "user" | "admin";

export async function createUserProfile(user: User) {
  const db = getFirebaseDb();
  const profileRef = doc(db, "users", user.uid);
  const existingProfile = await getDoc(profileRef);

  const profile = {
    displayName: user.displayName?.trim() || "Pengguna JALANIN",
    email: user.email?.toLowerCase() || "",
    photoUrl: user.photoURL,
    updatedAt: serverTimestamp(),
  };

  if (existingProfile.exists()) {
    // Never overwrite a server-managed role or contribution counters during login.
    await setDoc(profileRef, profile, { merge: true });
    return existingProfile.data()?.role === "admin" ? "admin" : "user" as UserRole;
  }

  await setDoc(profileRef, {
    ...profile,
    role: "user",
    isActive: true,
    contributionCount: 0,
    reportCount: 0,
    verificationCount: 0,
    createdAt: serverTimestamp(),
  });

  return "user" as UserRole;
}
