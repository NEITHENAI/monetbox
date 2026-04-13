"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import styles from "./cart.module.css";

interface CartItem {
  id: string;
  title: string;
  artist: string;
  price: number;
  imageUrl: string;
  quantity: number;
}

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("monetbox_cart");
    if (stored) {
      setCart(JSON.parse(stored));
    }
    setLoading(false);
  }, []);

  const updateCart = (newCart: CartItem[]) => {
    setCart(newCart);
    localStorage.setItem("monetbox_cart", JSON.stringify(newCart));
  };

  const removeItem = (id: string) => {
    updateCart(cart.filter(item => item.id !== id));
  };

  const clearCart = () => {
    updateCart([]);
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = cart.length > 0 ? 0 : 0; // Free shipping
  const total = subtotal + shipping;

  if (loading) return null;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className="serif animate-fade-in">Your Cart</h1>
        <p className="animate-fade-in delay-1">
          {cart.length === 0 ? "Your cart is empty" : `${cart.length} item${cart.length > 1 ? "s" : ""} in your cart`}
        </p>
        <div className="divider"></div>
      </div>

      {cart.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
          </div>
          <h2 className="serif">Nothing Here Yet</h2>
          <p>Explore our gallery and find the perfect piece for your space.</p>
          <Link href="/" className="btn-primary">Browse Gallery</Link>
        </div>
      ) : (
        <div className={styles.cartLayout}>
          {/* Cart Items */}
          <div className={styles.itemsList}>
            {cart.map((item, idx) => (
              <div key={item.id} className={`${styles.cartItem} glass animate-fade-in`} style={{ animationDelay: `${idx * 0.1}s` }}>
                <div className={styles.itemImage}>
                  <img src={item.imageUrl} alt={item.title} />
                </div>
                <div className={styles.itemInfo}>
                  <div className={styles.itemTop}>
                    <div>
                      <Link href={`/painting/${item.id}`} className={styles.itemTitle}>
                        <h3 className="serif">{item.title}</h3>
                      </Link>
                      <p className={styles.itemArtist}>by {item.artist}</p>
                    </div>
                    <button className={styles.removeBtn} onClick={() => removeItem(item.id)} aria-label="Remove item">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                    </button>
                  </div>
                  <div className={styles.itemBottom}>
                    <span className={styles.itemPrice}>${item.price.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}

            <button className={styles.clearBtn} onClick={clearCart}>
              Clear Cart
            </button>
          </div>

          {/* Order Summary */}
          <div className={`${styles.summary} glass animate-slide-right`}>
            <h2 className={styles.summaryTitle}>Order Summary</h2>

            <div className={styles.summaryLines}>
              <div className={styles.summaryLine}>
                <span>Subtotal</span>
                <span>${subtotal.toLocaleString()}</span>
              </div>
              <div className={styles.summaryLine}>
                <span>Shipping</span>
                <span className={styles.freeShipping}>Free</span>
              </div>
              <div className={styles.summaryLine}>
                <span>Insurance</span>
                <span>Included</span>
              </div>
            </div>

            <div className={styles.summaryTotal}>
              <span>Total</span>
              <span className={styles.totalAmount}>${total.toLocaleString()}</span>
            </div>

            <button className={`btn-primary ${styles.checkoutBtn}`}>
              Proceed to Checkout
            </button>

            <div className={styles.summaryGuarantees}>
              <div className={styles.summaryGuarantee}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                <span>Secure checkout</span>
              </div>
              <div className={styles.summaryGuarantee}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
                <span>30-day returns</span>
              </div>
              <div className={styles.summaryGuarantee}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
                <span>All cards accepted</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
