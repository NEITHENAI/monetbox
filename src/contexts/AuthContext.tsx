"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { onAuthStateChanged, User, signOut as firebaseSignOut } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { getUserRole } from "@/lib/db";

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  isArtist: boolean;
  role: string;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshRole: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAdmin: false,
  isArtist: false,
  role: "user",
  loading: true,
  signOut: async () => {},
  refreshRole: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string>("user");
  const [loading, setLoading] = useState(true);

  const checkRole = useCallback(async (firebaseUser: User) => {
    // Check /admins collection first (matches Firestore rules isAdmin())
    try {
      const adminDoc = await getDoc(doc(db, "admins", firebaseUser.uid));
      if (adminDoc.exists()) {
        setRole("admin");
        return;
      }
    } catch (e) {
      // admins doc doesn't exist or no permission
    }

    // Fallback: check email match for admin
    if (firebaseUser.email === "admin@monetbox.com") {
      setRole("admin");
      return;
    }

    // Check user role from /users collection
    const userRole = await getUserRole(firebaseUser.uid);
    setRole(userRole);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        await checkRole(firebaseUser);
      } else {
        setRole("user");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [checkRole]);

  const isAdmin = role === "admin";
  const isArtist = role === "artist";

  const signOut = async () => {
    await firebaseSignOut(auth);
  };

  const refreshRole = async () => {
    if (user) {
      await checkRole(user);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAdmin, isArtist, role, loading, signOut, refreshRole }}>
      {children}
    </AuthContext.Provider>
  );
};
