"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";

export default function Navbar() {
  const { user, isAdmin, signOut } = useAuth();
  const { cartCount } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="nav-container">
        <Link href="/">
          <h1 className="logo">Monetbox.</h1>
        </Link>
        
        <ul className={`nav-links ${isMenuOpen ? 'nav-links-active' : ''}`}>
          <li><Link href="/" onClick={() => setIsMenuOpen(false)}>Gallery</Link></li>
          <li className="nav-cart">
             <Link href="/cart" onClick={() => setIsMenuOpen(false)}>
               Cart 
               {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
             </Link>
          </li>
          
          {user ? (
            <>
              {isAdmin && <li><Link href="/admin/dashboard" style={{ color: "var(--accent)" }} onClick={() => setIsMenuOpen(false)}>Admin</Link></li>}
              <li>
                <button onClick={() => { signOut(); setIsMenuOpen(false); }} className="btn-nav-outline">
                  Sign Out
                </button>
              </li>
            </>
          ) : (
            <li><Link href="/login" className="btn-nav-filled" onClick={() => setIsMenuOpen(false)}>Sign In</Link></li>
          )}
        </ul>

        <button className="mobile-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Toggle menu">
          {isMenuOpen ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          )}
        </button>
      </div>
    </nav>
  );
}
