"use client";

import React, { useState, useEffect, useRef } from "react";
import { subscribeToEvents, addEvent, deleteEvent, uploadImage, type GalleryEvent } from "@/lib/db";
import styles from "./dashboard.module.css";

interface EventsPanelProps {
  showToast: (type: string, message: string) => void;
}

export default function EventsPanel({ showToast }: EventsPanelProps) {
  const [eventsList, setEventsList] = useState<GalleryEvent[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const [form, setForm] = useState({ title: "", date: "", imageUrl: "" });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const unsubscribe = subscribeToEvents((data) => {
      setEventsList(data);
    });
    return () => unsubscribe();
  }, []);

  const resetForm = () => {
    setForm({ title: "", date: "", imageUrl: "" });
    setSelectedFile(null);
    setShowForm(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      const previewUrl = URL.createObjectURL(file);
      setForm(prev => ({ ...prev, imageUrl: previewUrl }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    try {
      let finalImageUrl = form.imageUrl;
      if (selectedFile) {
        showToast("info", "Processing and compressing image...");
        finalImageUrl = await uploadImage(selectedFile);
        showToast("info", "Image processed successfully!");
      }

      if (!finalImageUrl) {
        showToast("error", "Image is required for an event");
        setIsUploading(false);
        return;
      }

      await addEvent({
        title: form.title,
        date: form.date,
        imageUrl: finalImageUrl,
      });

      showToast("success", "Event added successfully!");
      resetForm();
    } catch (err: any) {
      console.error(err);
      showToast("error", `Error: ${err.message || "Failed to add event"}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this event? This action cannot be undone.")) {
      const success = await deleteEvent(id);
      if (success) {
        showToast("success", "Event deleted successfully");
      } else {
        showToast("error", "Failed to delete event");
      }
    }
  };

  return (
    <>
      <header className={styles.topBar}>
        <div>
          <h1 className={styles.pageTitle}>Events</h1>
          <p className={styles.pageSubtitle}>Manage your upcoming gallery events</p>
        </div>
        <button className="btn-primary" onClick={() => { resetForm(); setShowForm(true); }}>
          + Add Event
        </button>
      </header>

      <div className={styles.statsGrid}>
        <div className={`${styles.statCard} glass`}>
          <div className={styles.statIcon} style={{ background: 'var(--accent-muted)', color: 'var(--accent)' }}>
             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          </div>
          <div>
            <p className={styles.statValue}>{eventsList.length}</p>
            <p className={styles.statLabel}>Total Events</p>
          </div>
        </div>
      </div>

      {showForm && (
        <div className={`${styles.formPanel} glass animate-scale-in`}>
          <div className={styles.formHeader}>
            <h2>Add New Event</h2>
            <button className={styles.closeBtn} onClick={resetForm}>&times;</button>
          </div>
          <form onSubmit={handleSubmit} className={styles.formGrid}>
            <div className="form-group" style={{ gridColumn: "1 / -1" }}>
              <label className="form-label">Event Title</label>
              <input className="form-input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required placeholder="e.g. Summer Abstract Showcase" />
            </div>
            <div className="form-group" style={{ gridColumn: "1 / -1" }}>
              <label className="form-label">Date and Time</label>
              <input className="form-input" type="text" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required placeholder="e.g. August 15th, 2026 at 6:00 PM" />
            </div>
            
            <div className="form-group" style={{ gridColumn: "1 / -1" }}>
              <label className="form-label">Event Cover Image</label>
              <div className={styles.fileUploadWrapper}>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileChange} 
                  ref={fileInputRef}
                  className={styles.fileInput}
                  id="event-upload"
                  required={!form.imageUrl}
                />
                <label htmlFor="event-upload" className={styles.fileLabel}>
                  {selectedFile ? selectedFile.name : "Choose image file..."}
                </label>
              </div>
              {form.imageUrl && (
                <div className={styles.imagePreview}>
                  <img src={form.imageUrl} alt="Preview" />
                </div>
              )}
            </div>
            <div className={styles.formActions}>
              <button type="button" className="btn-secondary" onClick={resetForm} disabled={isUploading}>Cancel</button>
              <button type="submit" className="btn-primary" disabled={isUploading}>
                {isUploading ? "Uploading..." : "Add Event"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className={`${styles.tableContainer} glass`}>
        <div className={styles.tableHeader}>
          <h2>Upcoming Events</h2>
        </div>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Event</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {eventsList.map(item => (
                <tr key={item.id}>
                  <td>
                    <div className={styles.paintingCell}>
                      <img src={item.imageUrl} alt={item.title} className={styles.tableThumb} />
                      <span>{item.title}</span>
                    </div>
                  </td>
                  <td>{item.date}</td>
                  <td>
                    <div className={styles.actions}>
                      <button className="btn-danger btn-sm" onClick={() => handleDelete(item.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
              {eventsList.length === 0 && (
                <tr>
                  <td colSpan={3} style={{ textAlign: "center", color: "var(--muted)", padding: "2rem" }}>No events scheduled yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
