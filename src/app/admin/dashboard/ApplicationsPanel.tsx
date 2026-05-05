"use client";

import React, { useState, useEffect } from "react";
import { getApplications, updateApplicationStatus, type ArtistApplication } from "@/lib/db";
import styles from "./dashboard.module.css";

export default function ApplicationsPanel({ showToast }: { showToast: (type: string, msg: string) => void }) {
  const [applications, setApplications] = useState<ArtistApplication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    const data = await getApplications();
    setApplications(data);
    setLoading(false);
  };

  const handleStatusChange = async (app: ArtistApplication, status: "approved" | "rejected") => {
    const success = await updateApplicationStatus(app.id!, status, app.userId, app);
    if (success) {
      showToast("success", `Application ${status}!`);
      fetchApplications();
    } else {
      showToast("error", "Failed to update application status.");
    }
  };

  if (loading) return <div>Loading applications...</div>;

  return (
    <div className="animate-fade-in">
      <header className={styles.topBar}>
        <div>
          <h1 className={styles.pageTitle}>Seller Applications</h1>
          <p className={styles.pageSubtitle}>Review and manage artist applications</p>
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
                <th>Status</th>
                <th>Date Applied</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {applications.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "20px" }}>No applications found.</td>
                </tr>
              ) : (
                applications.map(app => (
                  <tr key={app.id}>
                    <td>
                      <img src={app.profilePictureUrl} alt="Profile" style={{ width: "40px", height: "40px", borderRadius: "50%", objectFit: "cover" }} />
                    </td>
                    <td>
                      <div style={{ fontWeight: "bold" }}>{app.artistName}</div>
                      <div style={{ fontSize: "0.85rem", color: "var(--text-light)" }}>{app.shopName}</div>
                    </td>
                    <td>
                      <div style={{ fontSize: "0.85rem" }}>{app.email || app.userEmail}</div>
                      <div style={{ fontSize: "0.85rem", color: "var(--text-light)" }}>{app.phone || "—"}</div>
                    </td>
                    <td>
                      <span className={`badge ${app.status === 'approved' ? 'badge-success' : app.status === 'rejected' ? 'badge-danger' : 'badge-gold'}`}>
                        {app.status.toUpperCase()}
                      </span>
                    </td>
                    <td>{new Date(app.createdAt).toLocaleDateString()}</td>
                    <td>
                      {app.status === "pending" && (
                        <div className={styles.actions}>
                          <button className="btn-primary btn-sm" onClick={() => handleStatusChange(app, "approved")}>Approve</button>
                          <button className="btn-danger btn-sm" onClick={() => handleStatusChange(app, "rejected")}>Reject</button>
                        </div>
                      )}
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
