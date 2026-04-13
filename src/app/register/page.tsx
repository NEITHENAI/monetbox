"use client";

import React, { useState } from "react";
import Link from "next/link";
import styles from "../login/login.module.css";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // Try to update name
      await updateProfile(userCredential.user, {
        displayName: name
      });
      router.push("/");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to create an account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.formWrapper}>
        <div className={`${styles.formCard} glass animate-scale-in`}>
          <div className={styles.accentBar}></div>

          <div className={styles.header}>
            <h1 className="serif">Join Monetbox</h1>
            <p>Create your account and start collecting</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="name">Full Name</label>
              <input
                id="name"
                type="text"
                className="form-input"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-email">Email Address</label>
              <input
                id="reg-email"
                type="email"
                className="form-input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-password">Password</label>
              <input
                id="reg-password"
                type="password"
                className="form-input"
                placeholder="Min. 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="confirm-password">Confirm Password</label>
              <input
                id="confirm-password"
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            {error && <p className="form-error">{error}</p>}

            <button type="submit" className={`btn-primary ${styles.submitBtn}`} disabled={loading}>
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <div className={styles.footer}>
            <p>Already have an account? <Link href="/login" className={styles.link}>Sign in</Link></p>
          </div>
        </div>

        <div className={`${styles.sideArt} animate-fade-in delay-2`}>
          <div className={styles.sideContent}>
            <h2 className="serif">Start Your Collection</h2>
            <p>Get access to exclusive artworks, artist profiles, and curated recommendations.</p>
            <div className={styles.stats}>
              <div className={styles.stat}>
                <span className={styles.statValue}>Free</span>
                <span className={styles.statLabel}>Shipping</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statValue}>30-Day</span>
                <span className={styles.statLabel}>Returns</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statValue}>Secure</span>
                <span className={styles.statLabel}>Payment</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
