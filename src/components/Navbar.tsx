"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

export default function Navbar() {
  const { user, isAdmin, signOut } = useAuth();

  return (
    <nav className="navbar glass">
      <div className="nav-container">
        <Link href="/">
          <h1 className="logo">Monetbox.</h1>
        </Link>
        <ul className="nav-links">
          <li><Link href="/">Gallery</Link></li>
          <li><Link href="/cart">Cart</Link></li>
          
          {user ? (
            <>
              {isAdmin && <li><Link href="/admin/dashboard" style={{ color: "var(--accent)" }}>Admin Dashboard</Link></li>}
              <li>
                <button onClick={signOut} style={{ background: "none", border: "none", color: "inherit", font: "inherit", cursor: "pointer", textTransform: "uppercase", padding: "0.5rem 0" }}>
                  Sign Out
                </button>
              </li>
            </>
          ) : (
            <li><Link href="/login">Sign In</Link></li>
          )}
        </ul>
      </div>
    </nav>
  );
}
