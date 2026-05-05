"use client";

import React, { useState, useEffect } from "react";
import { subscribeToEvents, type GalleryEvent } from "@/lib/db";
import styles from "./events.module.css";

export default function EventsPage() {
  const [events, setEvents] = useState<GalleryEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [ticketModal, setTicketModal] = useState<{ isOpen: boolean; eventTitle: string; eventPrice: string }>({ isOpen: false, eventTitle: "", eventPrice: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToEvents((data) => {
      setEvents(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const openTicketForm = (eventTitle: string, eventPrice: string) => {
    setTicketModal({ isOpen: true, eventTitle, eventPrice });
  };

  const closeTicketForm = () => {
    setTicketModal({ isOpen: false, eventTitle: "", eventPrice: "" });
  };

  const handleTicketOrder = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const formData = new FormData(e.currentTarget);
    const dataObj = Object.fromEntries(formData.entries());
    
    const payload = {
      ...dataObj,
      access_key: process.env.NEXT_PUBLIC_WEB3FORMS_KEY || "",
      subject: `Ticket Request: ${ticketModal.eventTitle} - Monetbox`,
      from_name: "Monetbox Events",
      event_name: ticketModal.eventTitle,
      ticket_price: ticketModal.eventPrice,
    };

    try {
      const resp = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });
      const data = await resp.json();
      if (data.success) {
        alert("Your ticket request has been received! Our team will contact you shortly.");
        closeTicketForm();
      } else {
        alert("Something went wrong. Please try again.");
      }
    } catch (err) {
      console.error(err);
      alert("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className={styles.loading}>Loading events...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className="serif animate-fade-in">Upcoming Events</h1>
        <p className="animate-fade-in delay-1">
          Join us for exclusive gallery showcases, artist meetups, and immersive exhibitions.
        </p>
        <div className="divider"></div>
      </div>

      {events.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
             <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          </div>
          <h2 className="serif">No Upcoming Events</h2>
          <p>We are currently planning our next showcase. Check back soon!</p>
        </div>
      ) : (
        <div className={styles.eventsGrid}>
          {events.map((event, idx) => (
            <div key={event.id} className={`${styles.eventCard} glass animate-fade-in`} style={{ animationDelay: `${idx * 0.1}s` }}>
              <div className={styles.eventImage}>
                <img src={event.imageUrl} alt={event.title} />
              </div>
              <div className={styles.eventInfo}>
                <div className={styles.eventDate}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                  <span>{event.date}</span>
                </div>
                <div className={styles.eventPrice}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                  <span>UGX {event.price?.toLocaleString() || "Free"}</span>
                </div>
                <h3 className={`${styles.eventTitle} serif`}>{event.title}</h3>
                <button className="btn-primary" onClick={() => openTicketForm(event.title, event.price?.toLocaleString() || "Free")} style={{ width: '100%', marginTop: 'auto' }}>
                  🎫 Get Ticket
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Ticket Modal */}
      {ticketModal.isOpen && (
        <div className={`${styles.modalOverlay} animate-fade-in`}>
          <div className={`${styles.ticketForm} glass animate-scale-in`}>
            <div className={styles.formHeader}>
              <h2 className="serif">Reserve Ticket</h2>
              <button className={styles.closeBtn} onClick={closeTicketForm}>&times;</button>
            </div>
            <p className={styles.formSubtitle}>For: <strong>{ticketModal.eventTitle}</strong> — <span style={{ color: "var(--accent)" }}>UGX {ticketModal.eventPrice}</span></p>
            
            <form onSubmit={handleTicketOrder}>
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
                  <label className="form-label">Phone Number</label>
                  <input name="phone" className="form-input" required placeholder="+256..." />
                </div>
                <div className="form-group">
                  <label className="form-label">Number of Tickets</label>
                  <select name="quantity" className="form-input" required>
                    <option value="1">1 Ticket</option>
                    <option value="2">2 Tickets</option>
                    <option value="3">3 Tickets</option>
                    <option value="4+">4+ Tickets</option>
                  </select>
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Special Requirements (Optional)</label>
                  <textarea name="requirements" className="form-input form-textarea" placeholder="Any dietary or accessibility requirements..."></textarea>
                </div>
              </div>
              <div className={styles.formActions}>
                <button type="button" className="btn-secondary" onClick={closeTicketForm}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? "Sending Request..." : "Request Ticket"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
