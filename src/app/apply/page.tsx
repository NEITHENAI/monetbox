"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { submitArtistApplication, uploadImage, getUserApplication, type ArtistApplication } from "@/lib/db";

export default function ApplyPage() {
  const { user, isArtist, refreshRole } = useAuth();
  const router = useRouter();
  
  const [shopName, setShopName] = useState("");
  const [artistName, setArtistName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState("");
  const [existingApp, setExistingApp] = useState<ArtistApplication | null>(null);

  useEffect(() => {
    if (!user) { setPageLoading(false); return; }

    // Check if they already have an application
    getUserApplication(user.uid).then((app) => {
      if (app) {
        setExistingApp(app);
        // If approved, refresh role so navbar updates
        if (app.status === "approved") {
          refreshRole();
        }
      }
      setPageLoading(false);
    });
  }, [user, refreshRole]);

  useEffect(() => {
    if (user?.email) setEmail(user.email);
  }, [user]);

  // Not signed in
  if (!user) {
    return (
      <div style={{ padding: "100px 20px", textAlign: "center" }}>
        <h1 className="serif">Please sign in to apply</h1>
        <button onClick={() => router.push("/login")} className="btn-primary" style={{ marginTop: "20px" }}>Sign In</button>
      </div>
    );
  }

  if (pageLoading) {
    return <div style={{ padding: "100px 20px", textAlign: "center" }}>Loading...</div>;
  }

  // ---- STATUS SCREENS ----

  // APPROVED — show success and link to dashboard
  if (existingApp && existingApp.status === "approved") {
    return (
      <div style={{ padding: "100px 20px", textAlign: "center", maxWidth: "600px", margin: "0 auto" }}>
        <div style={{ fontSize: "48px", color: "var(--success)", marginBottom: "20px" }}>🎉</div>
        <h1 className="serif">You&apos;re Approved!</h1>
        <p style={{ marginTop: "20px", color: "var(--text-light)" }}>
          Congratulations! Your application to become a seller on Monetbox has been approved. You can now access your Artist Dashboard to start listing your artworks.
        </p>
        <div className="glass" style={{ padding: "20px", marginTop: "30px", borderRadius: "var(--radius-lg)", textAlign: "left" }}>
          <p><strong>Shop Name:</strong> {existingApp.shopName}</p>
          <p><strong>Artist Name:</strong> {existingApp.artistName}</p>
          <p><strong>Status:</strong> <span className="badge badge-success">APPROVED</span></p>
        </div>
        <Link href="/artist/dashboard" className="btn-primary" style={{ display: "inline-block", marginTop: "30px" }}>
          Go to Artist Dashboard
        </Link>
      </div>
    );
  }

  // PENDING — show waiting message
  if (existingApp && existingApp.status === "pending") {
    return (
      <div style={{ padding: "100px 20px", textAlign: "center", maxWidth: "600px", margin: "0 auto" }}>
        <div style={{ fontSize: "48px", marginBottom: "20px" }}>⏳</div>
        <h1 className="serif">Application Pending</h1>
        <p style={{ marginTop: "20px", color: "var(--text-light)" }}>
          Your application to become a seller is currently under review. Our team will get back to you soon. Thank you for your patience!
        </p>
        <div className="glass" style={{ padding: "20px", marginTop: "30px", borderRadius: "var(--radius-lg)", textAlign: "left" }}>
          <p><strong>Shop Name:</strong> {existingApp.shopName}</p>
          <p><strong>Artist Name:</strong> {existingApp.artistName}</p>
          <p><strong>Email:</strong> {existingApp.email}</p>
          <p><strong>Phone:</strong> {existingApp.phone}</p>
          <p><strong>Status:</strong> <span className="badge badge-gold">PENDING</span></p>
        </div>
        <button onClick={() => router.push("/")} className="btn-outline" style={{ marginTop: "30px" }}>Back to Gallery</button>
      </div>
    );
  }

  // REJECTED — show rejection with retry option
  if (existingApp && existingApp.status === "rejected") {
    return (
      <div style={{ padding: "100px 20px", textAlign: "center", maxWidth: "600px", margin: "0 auto" }}>
        <div style={{ fontSize: "48px", marginBottom: "20px" }}>❌</div>
        <h1 className="serif">Application Rejected</h1>
        <p style={{ marginTop: "20px", color: "var(--text-light)" }}>
          Unfortunately, your previous application was not approved. You are welcome to try again with updated details.
        </p>
        <div className="glass" style={{ padding: "20px", marginTop: "30px", borderRadius: "var(--radius-lg)", textAlign: "left" }}>
          <p><strong>Shop Name:</strong> {existingApp.shopName}</p>
          <p><strong>Artist Name:</strong> {existingApp.artistName}</p>
          <p><strong>Status:</strong> <span className="badge badge-danger">REJECTED</span></p>
        </div>
        <button onClick={() => setExistingApp(null)} className="btn-primary" style={{ marginTop: "30px" }}>
          Try Again
        </button>
      </div>
    );
  }

  // ---- APPLICATION FORM ----

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shopName || !artistName || !email || !phone || !file) {
      setError("All fields are required.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const profilePictureUrl = await uploadImage(file);
      const result = await submitArtistApplication({
        userId: user.uid,
        userEmail: user.email || "",
        shopName,
        artistName,
        email,
        phone,
        profilePictureUrl,
      });

      if (result.success) {
        // Refresh to show pending status
        const app = await getUserApplication(user.uid);
        setExistingApp(app);
      } else {
        setError("Failed to submit application: " + result.error);
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "100px 20px", maxWidth: "600px", margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: "40px" }}>
        <span className="badge badge-gold" style={{ marginBottom: "10px" }}>Join Us</span>
        <h1 className="serif">Become a Seller</h1>
        <p style={{ color: "var(--text-light)", marginTop: "10px" }}>
          Share your masterpieces with the world. Apply to become an artist on Monetbox.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="glass" style={{ padding: "40px", borderRadius: "var(--radius-lg)" }}>
        {error && <div className="toast toast-danger" style={{ position: "relative", marginBottom: "20px", transform: "none" }}>{error}</div>}
        
        <div style={{ marginBottom: "20px" }}>
          <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>Shop Name</label>
          <input type="text" className="form-input" value={shopName} onChange={(e) => setShopName(e.target.value)} placeholder="e.g. Studio Sterling" disabled={loading} />
        </div>

        <div style={{ marginBottom: "20px" }}>
          <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>Artist Name</label>
          <input type="text" className="form-input" value={artistName} onChange={(e) => setArtistName(e.target.value)} placeholder="e.g. A. Sterling" disabled={loading} />
        </div>

        <div style={{ marginBottom: "20px" }}>
          <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>Email Address</label>
          <input type="email" className="form-input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" disabled={loading} />
        </div>

        <div style={{ marginBottom: "20px" }}>
          <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>Phone Number</label>
          <input type="tel" className="form-input" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+256..." disabled={loading} />
        </div>

        <div style={{ marginBottom: "30px" }}>
          <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>Profile Picture</label>
          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            <div style={{ width: "80px", height: "80px", borderRadius: "50%", backgroundColor: "var(--surface)", overflow: "hidden", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              {file ? (
                <img src={URL.createObjectURL(file)} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--text-light)" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              )}
            </div>
            <input type="file" accept="image/*" onChange={(e) => { if (e.target.files && e.target.files[0]) setFile(e.target.files[0]); }} disabled={loading} style={{ flex: 1 }} />
          </div>
        </div>

        <button type="submit" className="btn-primary" style={{ width: "100%" }} disabled={loading}>
          {loading ? "Submitting Application..." : "Apply Now"}
        </button>
      </form>
    </div>
  );
}
