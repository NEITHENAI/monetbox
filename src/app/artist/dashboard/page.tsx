"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { subscribeToPaintings, addPainting, deletePainting, uploadImage } from "@/lib/db";
import { type Painting, categories } from "@/lib/mockData";

export default function ArtistDashboard() {
  const { user, isArtist } = useAuth();
  const router = useRouter();
  const [paintings, setPaintings] = useState<Painting[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [dimensions, setDimensions] = useState("");
  const [medium, setMedium] = useState("");
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [category, setCategory] = useState(categories[1]);
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user || !isArtist) return;
    
    const unsubscribe = subscribeToPaintings((data) => {
      // Filter paintings by the current artist's ID
      setPaintings(data.filter(p => p.artistId === user.uid));
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user, isArtist]);

  if (!user || !isArtist) {
    return (
      <div style={{ padding: "100px 20px", textAlign: "center" }}>
        <h1 className="serif">Access Denied</h1>
        <p>You must be an approved artist to view this page.</p>
        <button onClick={() => router.push("/")} className="btn-primary" style={{ marginTop: "20px" }}>Back to Gallery</button>
      </div>
    );
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      if (files.length + selectedFiles.length > 4) {
        setError("You can only upload up to 4 images per listing.");
        return;
      }
      setFiles(prev => [...prev, ...selectedFiles].slice(0, 4));
      setError("");
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (files.length === 0) {
      setError("Please upload at least one image.");
      return;
    }
    
    setSubmitting(true);
    setError("");

    try {
      const imageUrls = await Promise.all(files.map(file => uploadImage(file)));
      
      // Assume artistName is derived from email or we just use their email for now if we didn't fetch their specific profile.
      // In a full app, we'd fetch the artistName from the artist_applications or users collection.
      
      await addPainting({
        title,
        artist: user.displayName || user.email?.split("@")[0] || "Unknown Artist",
        artistId: user.uid,
        price: Number(price),
        imageUrls,
        description,
        dimensions,
        medium,
        year: Number(year),
        category,
        inStock: true,
      });

      setShowForm(false);
      // Reset form
      setTitle(""); setPrice(""); setDescription(""); setDimensions(""); setMedium(""); setFiles([]);
    } catch (err: any) {
      setError(err.message || "Failed to add listing.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this listing?")) {
      await deletePainting(id);
    }
  };

  return (
    <div style={{ padding: "100px 20px", maxWidth: "1000px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "40px" }}>
        <h1 className="serif">Artist Dashboard</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          {showForm ? "Cancel" : "Add New Listing"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="glass animate-fade-in" style={{ padding: "30px", marginBottom: "40px", borderRadius: "var(--radius-lg)" }}>
          <h2 className="serif" style={{ marginBottom: "20px" }}>Create New Listing</h2>
          {error && <div className="toast toast-danger" style={{ position: "relative", marginBottom: "20px", transform: "none" }}>{error}</div>}
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
            <div>
              <label style={{ display: "block", marginBottom: "8px" }}>Title</label>
              <input type="text" required className="form-input" value={title} onChange={e => setTitle(e.target.value)} disabled={submitting} />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "8px" }}>Price (UGX)</label>
              <input type="number" required className="form-input" value={price} onChange={e => setPrice(e.target.value)} disabled={submitting} />
            </div>
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", marginBottom: "8px" }}>Description</label>
            <textarea required className="form-input" rows={4} value={description} onChange={e => setDescription(e.target.value)} disabled={submitting}></textarea>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "20px", marginBottom: "20px" }}>
            <div>
              <label style={{ display: "block", marginBottom: "8px" }}>Dimensions</label>
              <input type="text" required placeholder='e.g. 24" × 36"' className="form-input" value={dimensions} onChange={e => setDimensions(e.target.value)} disabled={submitting} />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "8px" }}>Medium</label>
              <input type="text" required placeholder="e.g. Oil on Canvas" className="form-input" value={medium} onChange={e => setMedium(e.target.value)} disabled={submitting} />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "8px" }}>Year</label>
              <input type="number" required className="form-input" value={year} onChange={e => setYear(e.target.value)} disabled={submitting} />
            </div>
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", marginBottom: "8px" }}>Category</label>
            <select className="form-input" value={category} onChange={e => setCategory(e.target.value)} disabled={submitting}>
              {categories.filter(c => c !== "All").map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: "30px" }}>
            <label style={{ display: "block", marginBottom: "8px" }}>Images (Up to 4)</label>
            <input type="file" accept="image/*" multiple onChange={handleFileChange} disabled={submitting || files.length >= 4} className="form-input" />
            
            {files.length > 0 && (
              <div style={{ display: "flex", gap: "10px", marginTop: "15px", flexWrap: "wrap" }}>
                {files.map((f, i) => (
                  <div key={i} style={{ position: "relative", width: "100px", height: "100px", borderRadius: "8px", overflow: "hidden" }}>
                    <img src={URL.createObjectURL(f)} alt="preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    <button type="button" onClick={() => removeFile(i)} style={{ position: "absolute", top: 4, right: 4, background: "rgba(0,0,0,0.5)", color: "white", border: "none", borderRadius: "50%", width: "20px", height: "20px", cursor: "pointer", fontSize: "12px", display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? "Uploading Listing..." : "Publish Listing"}
          </button>
        </form>
      )}

      <div>
        <h2 className="serif" style={{ marginBottom: "20px" }}>Your Active Listings</h2>
        {loading ? (
          <p>Loading your artworks...</p>
        ) : paintings.length === 0 ? (
          <p style={{ color: "var(--text-light)" }}>You haven't uploaded any artworks yet. Click &quot;Add New Listing&quot; to get started.</p>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "20px" }}>
            {paintings.map(painting => (
              <div key={painting.id} className="glass" style={{ padding: "15px", borderRadius: "var(--radius)" }}>
                <img src={painting.imageUrls?.[0] || (painting as any).imageUrl || ""} alt={painting.title} style={{ width: "100%", height: "200px", objectFit: "cover", borderRadius: "var(--radius-sm)", marginBottom: "15px" }} />
                <h3 style={{ fontSize: "1.1rem", marginBottom: "5px" }}>{painting.title}</h3>
                <p style={{ color: "var(--accent)", fontWeight: "bold", marginBottom: "15px" }}>UGX {painting.price.toLocaleString()}</p>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span className={`badge ${painting.inStock ? 'badge-success' : 'badge-danger'}`}>
                    {painting.inStock ? "Available" : "Sold"}
                  </span>
                  <button onClick={() => handleDelete(painting.id)} className="btn-outline btn-sm" style={{ borderColor: "var(--danger)", color: "var(--danger)" }}>
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
