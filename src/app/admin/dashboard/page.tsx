"use client";

import React, { useState, useEffect, useRef } from "react";
import { type Painting } from "@/lib/mockData";
import { subscribeToPaintings, addPainting, updatePainting, deletePainting, seedPaintingsIfEmpty, uploadImage } from "@/lib/db";
import styles from "./dashboard.module.css";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const { user, isAdmin, loading, signOut } = useAuth();
  const router = useRouter();
  
  const [paintingsList, setPaintingsList] = useState<Painting[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: string; message: string } | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Form state
  const [form, setForm] = useState({
    title: "", artist: "", price: "", imageUrl: "", description: "",
    dimensions: "", medium: "", year: "", category: "Abstract",
  });
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Subscribe to Firestore paintings in real-time
  useEffect(() => {
    seedPaintingsIfEmpty();
    const unsubscribe = subscribeToPaintings((data) => {
      setPaintingsList(data);
      setDataLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const showToast = (type: string, message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const resetForm = () => {
    setForm({ title: "", artist: "", price: "", imageUrl: "", description: "", dimensions: "", medium: "", year: "", category: "Abstract" });
    setEditingId(null);
    setShowForm(false);
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    console.log("Submit started", { form, selectedFile });
    try {
      let finalImageUrl = form.imageUrl;

      // Upload file if selected
      if (selectedFile) {
        showToast("info", "Processing and compressing image...");
        finalImageUrl = await uploadImage(selectedFile);
        showToast("info", "Image processed successfully!");
      }

      showToast("info", "Saving painting details...");
      if (editingId) {
        const success = await updatePainting(editingId, { ...form, imageUrl: finalImageUrl, price: Number(form.price), year: Number(form.year) });
        if (success) {
          showToast("success", "Painting updated successfully!");
        } else {
          showToast("error", "Failed to update painting in database.");
        }
      } else {
        const newId = await addPainting({
          ...form,
          imageUrl: finalImageUrl,
          price: Number(form.price),
          year: Number(form.year),
          inStock: true,
        });
        if (newId) {
          showToast("success", "Painting added successfully!");
        } else {
          showToast("error", "Failed to add painting to database.");
        }
      }
      resetForm();
    } catch (err: any) {
      console.error("Submission error:", err);
      showToast("error", `Error: ${err.message || "Something went wrong during submission."}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      // Create a temporary preview URL
      const previewUrl = URL.createObjectURL(file);
      setForm(prev => ({ ...prev, imageUrl: previewUrl }));
    }
  };

  const handleEdit = (p: Painting) => {
    setForm({
      title: p.title, artist: p.artist, price: String(p.price), imageUrl: p.imageUrl,
      description: p.description, dimensions: p.dimensions, medium: p.medium,
      year: String(p.year), category: p.category,
    });
    setEditingId(p.id);
    setShowForm(true);
    setSelectedFile(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this painting from the gallery? This action cannot be undone.")) {
      const success = await deletePainting(id);
      if (success) {
        showToast("success", "Painting deleted successfully");
      } else {
        showToast("error", "Failed to delete painting");
      }
    }
  };

  const handleToggleStock = async (id: string) => {
    const painting = paintingsList.find(p => p.id === id);
    if (painting) {
      const success = await updatePainting(id, { inStock: !painting.inStock });
      if (!success) {
        showToast("error", "Failed to update stock status");
      }
    }
  };

  const handleLogout = async () => {
    await signOut();
    router.push("/login");
  };

  if (loading || dataLoading || !user || !isAdmin) return null;

  return (
    <div className={styles.container}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <h2 className="serif">Monetbox</h2>
          <span className="badge badge-gold">Admin</span>
        </div>
        <nav className={styles.sidebarNav}>
          <a href="#" className={styles.navItemActive}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
            Dashboard
          </a>
          <a href="#" className={styles.navItem}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
            Paintings
          </a>
          <a href="#" className={styles.navItem}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
            Customers
          </a>
          <a href="#" className={styles.navItem}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            Revenue
          </a>
        </nav>
        <button className={`${styles.logoutBtn}`} onClick={handleLogout}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16,17 21,12 16,7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          Logout
        </button>
      </aside>

      {/* Main Content */}
      <div className={styles.main}>
        {/* Header */}
        <header className={styles.topBar}>
          <div>
            <h1 className={styles.pageTitle}>Dashboard</h1>
            <p className={styles.pageSubtitle}>Manage your art collection</p>
          </div>
          <button className="btn-primary" onClick={() => { resetForm(); setShowForm(true); }}>
            + Add Painting
          </button>
        </header>

        {/* Stats */}
        <div className={styles.statsGrid}>
          <div className={`${styles.statCard} glass`}>
            <div className={styles.statIcon} style={{ background: 'var(--accent-muted)', color: 'var(--accent)' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
            </div>
            <div>
              <p className={styles.statValue}>{paintingsList.length}</p>
              <p className={styles.statLabel}>Total Paintings</p>
            </div>
          </div>
          <div className={`${styles.statCard} glass`}>
            <div className={styles.statIcon} style={{ background: 'var(--success-muted)', color: 'var(--success)' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <div>
              <p className={styles.statValue}>{paintingsList.filter(p => p.inStock).length}</p>
              <p className={styles.statLabel}>In Stock</p>
            </div>
          </div>
          <div className={`${styles.statCard} glass`}>
            <div className={styles.statIcon} style={{ background: 'var(--danger-muted)', color: 'var(--danger)' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
            </div>
            <div>
              <p className={styles.statValue}>{paintingsList.filter(p => !p.inStock).length}</p>
              <p className={styles.statLabel}>Sold Out</p>
            </div>
          </div>
          <div className={`${styles.statCard} glass`}>
            <div className={styles.statIcon} style={{ background: 'var(--accent-muted)', color: 'var(--accent)' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            </div>
            <div>
              <p className={styles.statValue}>UGX {paintingsList.reduce((s, p) => s + p.price, 0).toLocaleString()}</p>
              <p className={styles.statLabel}>Total Value</p>
            </div>
          </div>
        </div>

        {/* Add/Edit Form */}
        {showForm && (
          <div className={`${styles.formPanel} glass animate-scale-in`}>
            <div className={styles.formHeader}>
              <h2>{editingId ? "Edit Painting" : "Add New Painting"}</h2>
              <button className={styles.closeBtn} onClick={resetForm}>&times;</button>
            </div>
            <form onSubmit={handleSubmit} className={styles.formGrid}>
              <div className="form-group">
                <label className="form-label">Title</label>
                <input className="form-input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Artist</label>
                <input className="form-input" value={form.artist} onChange={e => setForm({ ...form, artist: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Price (UGX)</label>
                <input className="form-input" type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Painting Image</label>
                <div className={styles.fileUploadWrapper}>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleFileChange} 
                    ref={fileInputRef}
                    className={styles.fileInput}
                    id="painting-upload"
                  />
                  <label htmlFor="painting-upload" className={styles.fileLabel}>
                    {selectedFile ? selectedFile.name : "Choose image file..."}
                  </label>
                </div>
                {form.imageUrl && (
                  <div className={styles.imagePreview}>
                    <img src={form.imageUrl} alt="Preview" />
                  </div>
                )}
              </div>
              <div className="form-group">
                <label className="form-label">Dimensions</label>
                <input className="form-input" value={form.dimensions} onChange={e => setForm({ ...form, dimensions: e.target.value })} placeholder='24" × 36"' />
              </div>
              <div className="form-group">
                <label className="form-label">Medium</label>
                <input className="form-input" value={form.medium} onChange={e => setForm({ ...form, medium: e.target.value })} placeholder="Oil on Canvas" />
              </div>
              <div className="form-group">
                <label className="form-label">Year</label>
                <input className="form-input" type="number" value={form.year} onChange={e => setForm({ ...form, year: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Category</label>
                <select className="form-input" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                  <option>Abstract</option>
                  <option>Landscape</option>
                  <option>Seascape</option>
                  <option>Botanical</option>
                  <option>Contemporary</option>
                  <option>Expressionism</option>
                  <option>Portrait</option>
                </select>
              </div>
              <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                <label className="form-label">Description</label>
                <textarea className="form-input form-textarea" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className={styles.formActions}>
                <button type="button" className="btn-secondary" onClick={resetForm} disabled={isUploading}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={isUploading}>
                  {isUploading ? "Uploading..." : (editingId ? "Save Changes" : "Add Painting")}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Paintings Table */}
        <div className={`${styles.tableContainer} glass`}>
          <div className={styles.tableHeader}>
            <h2>All Paintings</h2>
            <span className={styles.tableCount}>{paintingsList.length} items</span>
          </div>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Painting</th>
                  <th>Artist</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paintingsList.map(painting => (
                  <tr key={painting.id}>
                    <td>
                      <div className={styles.paintingCell}>
                        <img src={painting.imageUrl} alt={painting.title} className={styles.tableThumb} />
                        <span>{painting.title}</span>
                      </div>
                    </td>
                    <td>{painting.artist}</td>
                    <td><span className="badge badge-gold">{painting.category}</span></td>
                    <td className={styles.priceCell}>UGX {painting.price.toLocaleString()}</td>
                    <td>
                      <button
                        className={`badge ${painting.inStock ? 'badge-success' : 'badge-danger'}`}
                        onClick={() => handleToggleStock(painting.id)}
                        style={{ cursor: 'pointer', border: 'none' }}
                      >
                        {painting.inStock ? "In Stock" : "Sold Out"}
                      </button>
                    </td>
                    <td>
                      <div className={styles.actions}>
                        <button className="btn-secondary btn-sm" onClick={() => handleEdit(painting)}>Edit</button>
                        <button className="btn-danger btn-sm" onClick={() => handleDelete(painting.id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`toast toast-${toast.type}`}>{toast.message}</div>
      )}
    </div>
  );
}
