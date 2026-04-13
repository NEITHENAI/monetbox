"use client";

import React, { useState } from "react";
import Link from "next/link";
import { paintings, categories } from "@/lib/mockData";
import styles from "./page.module.css";

export default function Home() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [showAll, setShowAll] = useState(false);

  const filtered = activeCategory === "All" 
    ? paintings 
    : paintings.filter(p => p.category === activeCategory);

  const displayed = showAll ? filtered : filtered.slice(0, 4);

  return (
    <div className={styles.container}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <span className={`${styles.heroTag} animate-fade-in`}>✦ Curated Art Gallery</span>
          <h1 className="animate-fade-in delay-1">Discover<br/>Masterpieces.</h1>
          <p className="animate-fade-in delay-2">
            Curated collections from visionary artists around the world. 
            Elevate your space with original paintings, each one a window to another world.
          </p>
          <div className={`${styles.ctaGroup} animate-fade-in delay-3`}>
            <button className="btn-primary" onClick={() => document.getElementById('gallery')?.scrollIntoView({ behavior: 'smooth' })}>
              Explore Gallery
            </button>
            <Link href="/register" className="btn-outline">Join Free</Link>
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

        {/* Category Filter */}
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

        <div className={styles.grid}>
          {displayed.map((painting, idx) => (
            <Link href={`/painting/${painting.id}`} key={painting.id} className={`${styles.card} glass animate-fade-in`} style={{ animationDelay: `${(idx % 4) * 0.15}s` }}>
              <div className={styles.imgWrapper}>
                <img src={painting.imageUrl} alt={painting.title} />
                <div className={styles.imgOverlay}>
                  <span className="btn-primary btn-sm">View Details</span>
                </div>
                {!painting.inStock && (
                  <span className={`${styles.soldBadge} badge badge-danger`}>Sold</span>
                )}
              </div>
              <div className={styles.cardInfo}>
                <div className={styles.cardHeader}>
                  <h3 className="serif">{painting.title}</h3>
                  <span className={styles.price}>${painting.price.toLocaleString()}</span>
                </div>
                <p className={styles.artist}>by {painting.artist}</p>
                <div className={styles.cardMeta}>
                  <span className="badge badge-gold">{painting.category}</span>
                  <span className={styles.medium}>{painting.medium}</span>
                </div>
              </div>
            </Link>
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

      {/* Newsletter */}
      <section className={styles.newsletter}>
        <div className={styles.newsletterInner}>
          <h2 className="serif">Stay Inspired</h2>
          <p>Get notified about new artworks, artist spotlights, and exclusive offers.</p>
          <div className={styles.newsletterForm}>
            <input type="email" placeholder="Enter your email" className="form-input" />
            <button className="btn-primary">Subscribe</button>
          </div>
        </div>
      </section>
    </div>
  );
}
