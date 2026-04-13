import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import { AuthProvider } from "@/contexts/AuthContext";
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
            <div className="footer-col">
              <h3>Legal</h3>
              <ul>
                <li><a href="#">Privacy Policy</a></li>
                <li><a href="#">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2026 Monetbox. All rights reserved.</p>
            <div className="footer-social">
              <a href="#" aria-label="Instagram">✦</a>
              <a href="#" aria-label="Twitter">✦</a>
              <a href="#" aria-label="Pinterest">✦</a>
            </div>
          </div>
        </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
