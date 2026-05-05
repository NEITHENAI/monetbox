export interface Painting {
  id: string;
  title: string;
  artist: string;
  artistId: string;
  price: number;
  imageUrls: string[];
  imageUrl?: string; // backward compat with old Firestore docs
  description: string;
  dimensions: string;
  medium: string;
  year: number;
  category: string;
  inStock: boolean;
}

// Helper: safely get the first image from either imageUrls or legacy imageUrl
export function getImageUrl(painting: Painting): string {
  if (painting.imageUrls && painting.imageUrls.length > 0) {
    return painting.imageUrls[0];
  }
  if (painting.imageUrl) {
    return painting.imageUrl;
  }
  return "";
}

export const paintings: Painting[] = [
  {
    id: "1",
    title: "Ethereal Dreams",
    artist: "A. Sterling",
    artistId: "mock-artist-1",
    price: 1200,
    imageUrls: ["https://images.unsplash.com/photo-1541961017774-22349e4a1262?q=80&w=800&auto=format&fit=crop"],
    description: "A mesmerizing abstract piece that captures the essence of dreams through fluid brushstrokes and ethereal colors. This painting evokes a sense of wonder and tranquility.",
    dimensions: "24\" × 36\"",
    medium: "Oil on Canvas",
    year: 2024,
    category: "Abstract",
    inStock: true,
  },
  {
    id: "2",
    title: "Abstract Symphony",
    artist: "J. Doe",
    artistId: "mock-artist-1",
    price: 850,
    imageUrls: ["https://images.unsplash.com/photo-1549887552-cb1071d3e5ca?q=80&w=800&auto=format&fit=crop"],
    description: "A vibrant composition of harmonious colors and bold forms. Each brushstroke contributes to a visual melody that resonates with the viewer's emotions.",
    dimensions: "20\" × 28\"",
    medium: "Acrylic on Canvas",
    year: 2023,
    category: "Abstract",
    inStock: true,
  },
  {
    id: "3",
    title: "The Golden Hour",
    artist: "V. Rivera",
    artistId: "mock-artist-1",
    price: 3400,
    imageUrls: ["https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=800&auto=format&fit=crop"],
    description: "Capturing the magical moment when the sun dips below the horizon, bathing everything in warm, golden light. A masterful study in light and atmosphere.",
    dimensions: "36\" × 48\"",
    medium: "Oil on Canvas",
    year: 2024,
    category: "Landscape",
    inStock: true,
  },
  {
    id: "4",
    title: "Ocean's Whisper",
    artist: "M. Chen",
    artistId: "mock-artist-1",
    price: 920,
    imageUrls: ["https://images.unsplash.com/photo-1578926078201-c6d0901e1273?q=80&w=800&auto=format&fit=crop"],
    description: "Inspired by the rhythmic sounds of the ocean. The cool palette and flowing composition transport you to a serene coastal escape.",
    dimensions: "22\" × 30\"",
    medium: "Watercolor on Paper",
    year: 2023,
    category: "Seascape",
    inStock: true,
  },
  {
    id: "5",
    title: "Midnight Garden",
    artist: "L. Novak",
    artistId: "mock-artist-1",
    price: 2100,
    imageUrls: ["https://images.unsplash.com/photo-1543857778-c4a1a3e0b2eb?q=80&w=800&auto=format&fit=crop"],
    description: "A lush nocturnal scene blooming with dark florals and deep jewel tones. It invites the viewer into a mysterious and enchanting world.",
    dimensions: "30\" × 40\"",
    medium: "Oil on Canvas",
    year: 2024,
    category: "Botanical",
    inStock: true,
  },
  {
    id: "6",
    title: "Urban Pulse",
    artist: "K. Tanaka",
    artistId: "mock-artist-1",
    price: 1750,
    imageUrls: ["https://images.unsplash.com/photo-1515405295579-ba7b45403062?q=80&w=800&auto=format&fit=crop"],
    description: "An energetic depiction of city life, blending geometric forms with dynamic movement. The artwork captures the relentless rhythm of urban existence.",
    dimensions: "28\" × 36\"",
    medium: "Mixed Media",
    year: 2024,
    category: "Contemporary",
    inStock: false,
  },
  {
    id: "7",
    title: "Serenity in Blue",
    artist: "A. Sterling",
    artistId: "mock-artist-1",
    price: 1400,
    imageUrls: ["https://images.unsplash.com/photo-1547891654-e66ed7ebb968?q=80&w=800&auto=format&fit=crop"],
    description: "A calming exploration of blue in all its shades. Layers of translucent color create depth and a profound sense of peace.",
    dimensions: "24\" × 32\"",
    medium: "Acrylic on Canvas",
    year: 2023,
    category: "Abstract",
    inStock: true,
  },
  {
    id: "8",
    title: "Crimson Reverie",
    artist: "D. Okafor",
    artistId: "mock-artist-1",
    price: 2800,
    imageUrls: ["https://images.unsplash.com/photo-1582201942988-13e60e4556ee?q=80&w=800&auto=format&fit=crop"],
    description: "Bold reds and deep crimsons dance across this canvas, evoking passion and intensity. A powerful statement piece for any collection.",
    dimensions: "36\" × 48\"",
    medium: "Oil on Canvas",
    year: 2024,
    category: "Expressionism",
    inStock: true,
  },
];

export const categories = ["All", "Abstract", "Landscape", "Seascape", "Botanical", "Contemporary", "Expressionism"];
