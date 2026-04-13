"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { subscribeToPaintings } from "@/lib/db";
import { useCart } from "@/contexts/CartContext";
import { type Painting } from "@/lib/mockData";
import PaintingCard from "@/components/PaintingCard";
import styles from "./detail.module.css";

export default function PaintingDetail() {
  const params = useParams();
  const { addToCart } = useCart();
  const [paintings, setPaintings] = useState<Painting[]>([]);
  const [loading, setLoading] = useState(true);
  const [addedToCart, setAddedToCart] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToPaintings((data) => {
      setPaintings(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const painting = paintings.find(p => p.id === params.id);

  if (loading) return <div className={styles.loading}>Loading artwork...</div>;

  if (!painting) {
    return (
      <div className={styles.notFound}>
        <h1 className="serif">Painting Not Found</h1>
        <p>The artwork you&apos;re looking for doesn&apos;t exist or has been removed.</p>
        <Link href="/" className="btn-primary">Back to Gallery</Link>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (painting) {
      addToCart(painting);
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2000);
    }
  };

  // Related paintings (same category, different id)
  const related = paintings.filter(p => p.category === painting.category && p.id !== painting.id).slice(0, 3);

  return (
    <div className={styles.container}>
      <div className={styles.breadcrumb}>
        <Link href="/">Gallery</Link>
        <span>/</span>
        <span>{painting.category}</span>
        <span>/</span>
        <span className={styles.breadcrumbActive}>{painting.title}</span>
      </div>

      <div className={styles.detailGrid}>
        {/* Image Section */}
        <div className={styles.imageSection}>
          <div className={`${styles.mainImage} animate-fade-in`}>
            <img src={painting.imageUrl} alt={painting.title} />
            <div className={styles.imageOverlay}>
              <span className="badge badge-gold">{painting.category}</span>
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className={`${styles.infoSection} animate-slide-right`}>
          <div className={styles.artistTag}>
            <div className={styles.artistAvatar}>{painting.artist.charAt(0)}</div>
            <div>
              <p className={styles.artistName}>{painting.artist}</p>
              <p className={styles.artistLabel}>Artist</p>
            </div>
          </div>

          <h1 className={`${styles.paintingTitle} serif`}>{painting.title}</h1>
          <p className={styles.paintingDescription}>{painting.description}</p>

          <div className={styles.detailsList}>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Medium</span>
              <span className={styles.detailValue}>{painting.medium}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Dimensions</span>
              <span className={styles.detailValue}>{painting.dimensions}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Year</span>
              <span className={styles.detailValue}>{painting.year}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Status</span>
              <span className={`badge ${painting.inStock ? 'badge-success' : 'badge-danger'}`}>
                {painting.inStock ? "Available" : "Sold"}
              </span>
            </div>
          </div>

          <div className={styles.priceSection}>
            <div className={styles.priceTag}>
              <span className={styles.priceCurrency}>UGX</span>
              <span className={styles.priceAmount}>{painting.price.toLocaleString()}</span>
            </div>
            <p className={styles.priceNote}>Includes certificate of authenticity</p>
          </div>

          <div className={styles.actionButtons}>
            <button
              className={`btn-primary ${styles.cartBtn}`}
              onClick={handleAddToCart}
              disabled={!painting.inStock || addedToCart}
            >
              {addedToCart ? "✓ Added to Cart" : painting.inStock ? "Add to Cart" : "Sold Out"}
            </button>
            <Link href="/cart" className="btn-outline" style={{ textAlign: 'center' }}>View Cart</Link>
          </div>

          <div className={styles.guarantees}>
            <div className={styles.guarantee}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              <span>Secure Payment</span>
            </div>
            <div className={styles.guarantee}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
              <span>Free Shipping</span>
            </div>
            <div className={styles.guarantee}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
              <span>30-Day Returns</span>
            </div>
          </div>
        </div>
      </div>

      {/* Related Section */}
      {related.length > 0 && (
        <section className={styles.relatedSection}>
          <h2 className="serif">You May Also Like</h2>
          <div className={styles.divider}></div>
          <div className={styles.relatedGrid}>
            {related.map((p, idx) => (
              <PaintingCard key={p.id} painting={p} index={idx} />
            ))}
          </div>
        </section>
      )}

      {addedToCart && (
        <div className="toast toast-success">✓ Added to cart!</div>
      )}
    </div>
  );
}
