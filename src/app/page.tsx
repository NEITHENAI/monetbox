"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { categories, type Painting } from "@/lib/mockData";
import { subscribeToPaintings, seedPaintingsIfEmpty } from "@/lib/db";
import { useAuth } from "@/contexts/AuthContext";
import PaintingCard from "@/components/PaintingCard";
import styles from "./page.module.css";

export default function Home() {
  const { user, isAdmin } = useAuth();
  const [paintings, setPaintings] = useState<Painting[]>([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    seedPaintingsIfEmpty();
    const unsubscribe = subscribeToPaintings((data) => {
      setPaintings(data);
    });
    return () => unsubscribe();
  }, []);

  const filtered = paintings.filter(p => {
    const matchesCategory = activeCategory === "All" || p.category === activeCategory;
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         p.artist.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const displayed = showAll ? filtered : filtered.slice(0, 4);

  return (
    <div className={styles.container}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <span className={`${styles.heroTag} animate-fade-in`}>✦ Curated Art Gallery</span>
          <h1 className="animate-fade-in delay-1">Discover<br/>Masterpieces.</h1>
          <p className={styles.subtitle}>
            Discover and acquire extraordinary paintings from independent artists around the globe.
          </p>
          <div className={`${styles.heroActions} animate-fade-in delay-3`}>
            <Link href="#gallery" className="btn-primary">Explore Gallery</Link>
            {!user && (
              <Link href="/register" className="btn-secondary">Join for Free</Link>
            )}
            {isAdmin && (
               <Link href="/admin/dashboard" className="btn-secondary">Go to Dashboard</Link>
            )}
          </div>
        </div>
        <div className={styles.heroOverlay}></div>
        <div className={styles.heroScroll}>
          <div className={styles.scrollIndicator}></div>
        </div>
      </section>

      {/* Features Strip */}
      <section className={styles.features}>
        <div className={styles.featuresInner}>
          <div className={styles.feature}>
            <div className={styles.featureIcon}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
            </div>
            <div>
              <h3>Original Artwork</h3>
              <p>Every piece is unique and authentic</p>
            </div>
          </div>
          <div className={styles.feature}>
            <div className={styles.featureIcon}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
            </div>
            <div>
              <h3>Global Shipping</h3>
              <p>Free insured delivery worldwide</p>
            </div>
          </div>
          <div className={styles.feature}>
            <div className={styles.featureIcon}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>
            <div>
              <h3>Authenticity Guaranteed</h3>
              <p>Certificate with every purchase</p>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section id="gallery" className={styles.gallerySection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionTag}>Collection</span>
          <h2 className="serif">Featured Artworks</h2>
          <p>Handpicked for the discerning collector.</p>
          <div className="divider"></div>
        </div>

        {/* Search and Category Filter */}
        <div className={styles.filterBar}>
          <div className={styles.searchBox}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input 
              type="text" 
              placeholder="Search by title or artist..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
          </div>
          
          <div className={styles.categoryFilter}>
            {categories.map(cat => (
              <button
                key={cat}
                className={`${styles.categoryBtn} ${activeCategory === cat ? styles.categoryActive : ''}`}
                onClick={() => { setActiveCategory(cat); setShowAll(false); }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 && searchQuery && (
          <div className={styles.noResults}>
            <p>No artworks found matching &quot;{searchQuery}&quot;</p>
            <button className="btn-outline btn-sm" onClick={() => setSearchQuery("")}>Clear Search</button>
          </div>
        )}

        <div className={styles.grid}>
          {displayed.map((painting, idx) => (
            <PaintingCard key={painting.id} painting={painting} index={idx} />
          ))}
        </div>

        {filtered.length > 4 && !showAll && (
          <div className={styles.showMore}>
            <button className="btn-outline" onClick={() => setShowAll(true)}>
              View All ({filtered.length} artworks)
            </button>
          </div>
        )}
      </section>

      {/* About Section */}
      <section id="about" className={styles.aboutSection}>
        <div className={styles.aboutGrid}>
          <div className={`${styles.aboutImage} animate-fade-in`}>
            <img src="https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=800&auto=format&fit=crop" alt="Art gallery" />
          </div>
          <div className={`${styles.aboutContent} animate-slide-right`}>
            <span className={styles.sectionTag}>Our Story</span>
            <h2 className="serif">Where Art Meets Home</h2>
            <p>
              Monetbox was born from a simple belief: everyone deserves to live surrounded by art that inspires them. 
              We connect passionate collectors with talented artists from around the globe, making gallery-quality 
              artwork accessible to all.
            </p>
            <p>
              Each piece in our collection is carefully vetted by our team of art consultants, ensuring that only 
              the finest works make it to our gallery. From emerging talents to established names, we celebrate 
              the diversity and depth of contemporary art.
            </p>
            <div className={styles.aboutStats}>
              <div className={styles.aboutStat}>
                <span className={styles.aboutStatValue}>500+</span>
                <span className={styles.aboutStatLabel}>Artworks</span>
              </div>
              <div className={styles.aboutStat}>
                <span className={styles.aboutStatValue}>120+</span>
                <span className={styles.aboutStatLabel}>Artists</span>
              </div>
              <div className={styles.aboutStat}>
                <span className={styles.aboutStatValue}>35+</span>
                <span className={styles.aboutStatLabel}>Countries</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className={styles.newsletter}>
        <div className={styles.newsletterContent}>
          <h2 className="serif">Join Our Collector&apos;s Circle</h2>
          <p>Get early access to new collections and exclusive interviews with featured artists.</p>
          
          {user ? (
            <p style={{ marginTop: "1rem", fontStyle: "italic" }}>You are already subscribed to our inner circle updates!</p>
          ) : (
            <NewsletterForm />
          )}
        </div>
      </section>
    </div>
  );
}

function NewsletterForm() {
  const [status, setStatus] = React.useState<"idle" | "submitting" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("submitting");
    
    const formData = new FormData(e.currentTarget);
    const dataObj = Object.fromEntries(formData.entries());
    
    const payload = {
      ...dataObj,
      access_key: process.env.NEXT_PUBLIC_WEB3FORMS_KEY || "",
      subject: "New Newsletter Subscription - Monetbox",
      from_name: "Monetbox Gallery",
    };

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (data.success) {
        setStatus("success");
      } else {
        setStatus("error");
      }
    } catch (err) {
      console.error("Newsletter error", err);
      setStatus("error");
    }
  };

  if (status === "success") {
    return <p className="animate-fade-in" style={{ color: "var(--accent)", fontStyle: "italic" }}>Welcome to the circle! Check your inbox soon.</p>;
  }

  return (
    <form className={styles.newsletterForm} onSubmit={handleSubmit}>
      <input 
        type="email" 
        name="email"
        placeholder="Enter your email address" 
        required 
        className="form-input" 
        style={{ width: 'auto', minWidth: '300px' }} 
        disabled={status === "submitting"}
      />
      <button type="submit" className="btn-primary" disabled={status === "submitting"}>
        {status === "submitting" ? "Joining..." : "Subscribe"}
      </button>
      {status === "error" && <p style={{ color: "var(--danger)", fontSize: "0.8rem", marginTop: "0.5rem" }}>Something went wrong. Please try again.</p>}
    </form>
  );
}
