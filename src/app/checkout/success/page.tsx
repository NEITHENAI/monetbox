"use client";

import React from "react";
import Link from "next/link";
import styles from "./success.module.css";

export default function SuccessPage() {
  return (
    <div className={styles.container}>
      <div className={`${styles.card} glass animate-scale-in`}>
        <div className={styles.iconWrapper}>
          <div className={styles.checkIcon}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
        </div>
        
        <h1 className="serif">Order Received</h1>
        <p className={styles.subtitle}>Thank you for choosing Monetbox. Your request is being processed.</p>
        
        <div className={styles.divider}></div>
        
        <div className={styles.nextSteps}>
          <h3>What happens next?</h3>
          <ul>
            <li>
              <span className={styles.stepNumber}>1</span>
              <p>Our curator will review your order details immediately.</p>
            </li>
            <li>
              <span className={styles.stepNumber}>2</span>
              <p><strong>You will be contacted very soon</strong> via email or WhatsApp to finalize payment.</p>
            </li>
            <li>
              <span className={styles.stepNumber}>3</span>
              <p>Once confirmed, your artwork will be professionally packed and shipped.</p>
            </li>
          </ul>
        </div>
        
        <div className={styles.actions}>
          <Link href="/" className="btn-primary">Back to Gallery</Link>
          <Link href="/cart" className="btn-secondary">View Cart</Link>
        </div>
      </div>
    </div>
  );
}
