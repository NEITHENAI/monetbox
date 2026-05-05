"use client";

import React, { useState, useEffect } from "react";
import { getArtists, removeArtist, type ArtistApplication } from "@/lib/db";
import styles from "./dashboard.module.css";

export default function ArtistsPanel({ showToast }: { showToast: (type: string, msg: string) => void }) {
  const [artists, setArtists] = useState<ArtistApplication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArtists();
  }, []);

  const fetchArtists = async () => {
    setLoading(true);
    const data = await getArtists();
    setArtists(data);
    setLoading(false);
  };

  const handleRemove = async (uid: string) => {
    if (window.confirm("Are you sure you want to remove this user from the artists group? Their role will be reverted to 'user'.")) {
      const result = await removeArtist(uid);
      if (result.success) {
        showToast("success", "Artist removed successfully.");
        fetchArtists();
      } else {
        showToast("error", result.error || "Failed to remove artist.");
      }
    }
  };

  if (loading) return <div>Loading artists...</div>;

  return (
    <div className="animate-fade-in">
      <header className={styles.topBar}>
        <div>
          <h1 className={styles.pageTitle}>Current Artists</h1>
          <p className={styles.pageSubtitle}>Manage approved sellers on Monetbox</p>
        </div>
      </header>

      <div className={`${styles.tableContainer} glass`}>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Profile</th>
                <th>Artist / Shop Name</th>
                <th>Contact</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {artists.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: "center", padding: "20px" }}>No artists found.</td>
                </tr>
              ) : (
                artists.map(artist => (
                  <tr key={artist.id || artist.userId}>
                    <td>
                      <img src={artist.profilePictureUrl} alt="Profile" style={{ width: "40px", height: "40px", borderRadius: "50%", objectFit: "cover" }} />
                    </td>
                    <td>
                      <div style={{ fontWeight: "bold" }}>{artist.artistName}</div>
                      <div style={{ fontSize: "0.85rem", color: "var(--text-light)" }}>{artist.shopName}</div>
                    </td>
                    <td>
                      <div style={{ fontSize: "0.85rem" }}>{artist.email || artist.userEmail}</div>
                      <div style={{ fontSize: "0.85rem", color: "var(--text-light)" }}>{artist.phone || "—"}</div>
                    </td>
                    <td>
                      <div className={styles.actions}>
                        <button className="btn-danger btn-sm" onClick={() => handleRemove(artist.userId)}>Revoke Role</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
