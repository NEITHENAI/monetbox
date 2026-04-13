"use client";

import React from "react";
import Link from "next/link";
import { type Painting } from "@/lib/mockData";
import styles from "./PaintingCard.module.css";

interface PaintingCardProps {
  painting: Painting;
  index?: number;
}

export default function PaintingCard({ painting, index = 0 }: PaintingCardProps) {
  return (
    <Link 
      href={`/painting/${painting.id}`} 
      className={`${styles.card} glass animate-fade-in`} 
      style={{ animationDelay: `${(index % 4) * 0.15}s` }}
    >
      <div className={styles.imgWrapper}>
        <img src={painting.imageUrl} alt={painting.title} loading="lazy" />
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
          <span className={styles.price}>UGX {painting.price.toLocaleString()}</span>
        </div>
        <p className={styles.artist}>by {painting.artist}</p>
        <div className={styles.cardMeta}>
          <span className="badge badge-gold">{painting.category}</span>
          <span className={styles.medium}>{painting.medium}</span>
        </div>
      </div>
    </Link>
  );
}
