"use client";

import React, { useState } from "react";
import Link from "next/link";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import styles from "./login.module.css";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    // Strict Admin Override Check - Ensure exactly this password before attempting auth
    if (email === "admin@monetbox.com" && password !== "Kyeyuneneithen1$") {
      setError("Invalid credentials.");
      return;
    }

    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Let AuthContext handle redirect or state changes, but we can proactively route
      if (email === "admin@monetbox.com") {
        router.push("/admin/dashboard");
      } else {
        router.push("/");
      }
    } catch (err: any) {
      console.error(err);
      // Simplified error for security, or specific message
      setError("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.formWrapper}>
        <div className={`${styles.formCard} glass animate-scale-in`}>
          {/* Decorative accent */}
          <div className={styles.accentBar}></div>

          <div className={styles.header}>
            <h1 className="serif">Welcome Back</h1>
            <p>Sign in to your Monetbox account</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                className="form-input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && <p className="form-error">{error}</p>}

            <button type="submit" className={`btn-primary ${styles.submitBtn}`} disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className={styles.footer}>
            <p>Don&apos;t have an account? <Link href="/register" className={styles.link}>Create one</Link></p>
          </div>
        </div>

        {/* Side Art */}
        <div className={`${styles.sideArt} animate-fade-in delay-2`}>
          <div className={styles.sideContent}>
            <h2 className="serif">Discover Art That Speaks</h2>
            <p>Join thousands of collectors who find their perfect piece on Monetbox.</p>
            <div className={styles.stats}>
              <div className={styles.stat}>
                <span className={styles.statValue}>500+</span>
                <span className={styles.statLabel}>Artworks</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statValue}>120+</span>
                <span className={styles.statLabel}>Artists</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statValue}>2K+</span>
                <span className={styles.statLabel}>Collectors</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
