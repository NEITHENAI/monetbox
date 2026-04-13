import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Monetbox | Curated Art Gallery",
  description: "Discover and purchase premium paintings from curated artists globally. Elevate your space with handpicked masterpieces.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </head>
      <body>
        <AuthProvider>
          <CartProvider>
            <Navbar />

            {/* Main Content */}
            <main>{children}</main>

            {/* Footer */}
            <footer className="footer">
              <div className="footer-container">
                <div className="footer-brand">
                  <h2 className="serif">Monetbox.</h2>
                  <p>Curated collections from visionary artists around the world. We bring the gallery experience to your doorstep.</p>
                </div>
                <div className="footer-col">
                  <h3>Explore</h3>
                  <ul>
                    <li><Link href="/">Gallery</Link></li>
                    <li><Link href="/#artists">Artists</Link></li>
                    <li><Link href="/#about">About</Link></li>
                  </ul>
                </div>
                <div className="footer-col">
                  <h3>Support</h3>
                  <ul>
                    <li><a href="#">Shipping</a></li>
                    <li><a href="#">Returns</a></li>
                    <li><a href="#">Contact</a></li>
                  </ul>
                </div>
              </div>
              <div className="footer-bottom">
                <p>&copy; 2026 Monetbox. All rights reserved.</p>
                <div className="footer-social">
                  <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">IG</a>
                  <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">TW</a>
                  <a href="https://pinterest.com" target="_blank" rel="noopener noreferrer" aria-label="Pinterest">PN</a>
                </div>
              </div>
            </footer>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
