"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useCart } from "@/contexts/CartContext";
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
  const { cart, removeFromCart, clearCart } = useCart();
  const [loading, setLoading] = useState(true);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setLoading(false);
  }, []);

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = 0; // Free shipping
  const total = subtotal + shipping;

  const handleWhatsAppCheckout = () => {
    const itemsList = cart.map(item => `• ${item.title} by ${item.artist} — UGX ${item.price.toLocaleString()}`).join('%0A');
    const message = `Hello Monetbox! 🎨%0A%0AI would like to purchase the following artwork(s):%0A%0A${itemsList}%0A%0ATotal: UGX ${total.toLocaleString()}%0A%0APlease let me know how to proceed with payment. Thank you!`;
    window.open(`https://wa.me/256701862309?text=${message}`, '_blank');
    clearCart();
    window.location.href = "/checkout/success";
  };

  const handleFormOrder = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const formData = new FormData(e.currentTarget);
    formData.append("access_key", process.env.NEXT_PUBLIC_WEB3FORMS_KEY || "");
    formData.append("subject", "New Artwork Order - Monetbox");
    formData.append("from_name", "Monetbox Checkout");
    
    const itemsList = cart.map(item => `• ${item.title} by ${item.artist} (UGX ${item.price})`).join('\n');
    formData.append("order_items", itemsList);
    formData.append("order_total", `UGX ${total.toLocaleString()}`);

    try {
      const resp = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData,
      });
      const data = await resp.json();
      if (data.success) {
        clearCart();
        window.location.href = "/checkout/success";
      } else {
        alert("Something went wrong. Please try again or use WhatsApp.");
      }
    } catch (err) {
      console.error(err);
      alert("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return null;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className="serif animate-fade-in">{showOrderForm ? "Checkout Details" : "Your Cart"}</h1>
        <p className="animate-fade-in delay-1">
          {showOrderForm ? "Please provide your billing information" : (cart.length === 0 ? "Your cart is empty" : `${cart.length} item${cart.length > 1 ? "s" : ""} in your cart`)}
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
      ) : showOrderForm ? (
        <div className={`${styles.formOverlay} animate-scale-in`}>
          <form className={`${styles.orderForm} glass`} onSubmit={handleFormOrder}>
            <div className={styles.formGrid}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input name="name" className="form-input" required placeholder="John Doe" />
              </div>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input name="email" type="email" className="form-input" required placeholder="john@example.com" />
              </div>
              <div className="form-group">
                <label className="form-label">Country</label>
                <input name="country" className="form-input" required placeholder="Uganda" />
              </div>
              <div className="form-group">
                <label className="form-label">District / City</label>
                <input name="district" className="form-input" required placeholder="Kampala" />
              </div>
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input name="phone" className="form-input" required placeholder="+256..." />
              </div>
              <div className="form-group">
                <label className="form-label">WhatsApp (Optional)</label>
                <input name="whatsapp" className="form-input" placeholder="+256..." />
              </div>
            </div>
            <div className={styles.formActions}>
              <button type="button" className="btn-secondary" onClick={() => setShowOrderForm(false)}>Back to Cart</button>
              <button type="submit" className="btn-primary" disabled={isSubmitting}>
                {isSubmitting ? "Processing..." : "Place Order"}
              </button>
            </div>
          </form>
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
                    <button className={styles.removeBtn} onClick={() => removeFromCart(item.id)} aria-label="Remove item">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                    </button>
                  </div>
                  <div className={styles.itemBottom}>
                    <span className={styles.itemPrice}>UGX {item.price.toLocaleString()}</span>
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
                <span>UGX {subtotal.toLocaleString()}</span>
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
              <span className={styles.totalAmount}>UGX {total.toLocaleString()}</span>
            </div>

            <div className={styles.checkoutActions}>
              <button className={`btn-primary ${styles.checkoutBtn}`} onClick={handleWhatsAppCheckout}>
                💬 Order via WhatsApp
              </button>
              <button className={`btn-outline ${styles.formCheckoutBtn}`} onClick={() => setShowOrderForm(true)}>
                📝 Order via Form
              </button>
            </div>

            <div className={styles.summaryGuarantees}>
              <div className={styles.summaryGuarantee}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                <span>Premium Quality</span>
              </div>
              <div className={styles.summaryGuarantee}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
                <span>Insured Global Shipping</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
