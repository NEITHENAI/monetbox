import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  setDoc,
  query,
  orderBy,
  getDoc,
} from "firebase/firestore";
import { db } from "./firebase";
import { paintings as mockPaintings, type Painting } from "./mockData";

const PAINTINGS_COLLECTION = "paintings";
const METADATA_COLLECTION = "metadata";
const SYSTEM_DOC = "system";

// Seed Firestore with mock data if the collection is empty AND seeding hasn't been disabled
export async function seedPaintingsIfEmpty(): Promise<void> {
  const metaRef = doc(db, METADATA_COLLECTION, SYSTEM_DOC);
  const metaSnap = await getDoc(metaRef);
  
  // If we've already seeded or determined we don't want to seed, stop
  if (metaSnap.exists() && metaSnap.data().initialized) {
    return;
  }

  const snapshot = await getDocs(collection(db, PAINTINGS_COLLECTION));
  if (snapshot.empty) {
    for (const painting of mockPaintings) {
      // Use setDoc with the mock ID to maintain consistency during initial seed
      await setDoc(doc(db, PAINTINGS_COLLECTION, painting.id), painting);
    }
    await setDoc(metaRef, { initialized: true }, { merge: true });
    console.log("Seeded Firestore with mock paintings.");
  } else {
    // If there's already data, mark as initialized anyway
    await setDoc(metaRef, { initialized: true }, { merge: true });
  }
}

// Compress image and return Base64 string
export async function uploadImage(file: File): Promise<string> {
  console.log("Starting Base64 compression for file:", file.name, "Original Size:", file.size);
  
  return new Promise((resolve, reject) => {
    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        
        img.onload = () => {
          // Setup canvas for compression
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800; // Limit width to keep Base64 size small
          const MAX_HEIGHT = 800;
          let width = img.width;
          let height = img.height;

          // Calculate new dimensions maintaining aspect ratio
          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;

          // Draw and compress
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error("Failed to get canvas context"));
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);

          // Export to Base64 (compressing to 0.6 quality JPEG to ensure it fits in Firestore)
          const base64String = canvas.toDataURL('image/jpeg', 0.6);
          console.log("Compression successful. New approx size:", Math.round((base64String.length * 3) / 4), "bytes");
          resolve(base64String);
        };
        
        img.onerror = (err) => reject(new Error("Failed to load image for compression"));
      };
      reader.onerror = (err) => reject(new Error("Failed to read file"));
    } catch (error) {
      console.error("Error initializing Base64 compression:", error);
      reject(error);
    }
  });
}

// Fetch all paintings once
export async function getPaintings(): Promise<Painting[]> {
  const snapshot = await getDocs(
    query(collection(db, PAINTINGS_COLLECTION), orderBy("title"))
  );
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Painting));
}

// Subscribe to real-time painting updates
export function subscribeToPaintings(
  callback: (paintings: Painting[]) => void
) {
  return onSnapshot(
    query(collection(db, PAINTINGS_COLLECTION), orderBy("title")),
    (snapshot) => {
      const data = snapshot.docs.map(
        (d) => ({ id: d.id, ...d.data() } as Painting)
      );
      callback(data);
    }
  );
}

// Add a new painting
export async function addPainting(
  painting: Omit<Painting, "id">
): Promise<string> {
  const docRef = await addDoc(
    collection(db, PAINTINGS_COLLECTION),
    painting
  );
  return docRef.id;
}

export async function updatePainting(
  id: string,
  data: Partial<Painting>
): Promise<boolean> {
  try {
    await updateDoc(doc(db, PAINTINGS_COLLECTION, id), data);
    return true;
  } catch (e) {
    console.error("Update failed", e);
    return false;
  }
}

// Delete a painting
export async function deletePainting(id: string): Promise<boolean> {
  try {
    await deleteDoc(doc(db, PAINTINGS_COLLECTION, id));
    return true;
  } catch (e) {
    console.error("Delete failed", e);
    return false;
  }
}

// ==========================================
// EVENTS API
// ==========================================

const EVENTS_COLLECTION = "events";

export interface GalleryEvent {
  id: string;
  title: string;
  date: string;
  imageUrl: string; // Will store the Base64 string
}

export function subscribeToEvents(
  callback: (events: GalleryEvent[]) => void
) {
  return onSnapshot(
    query(collection(db, EVENTS_COLLECTION), orderBy("date")),
    (snapshot) => {
      const data = snapshot.docs.map(
        (d) => ({ id: d.id, ...d.data() } as GalleryEvent)
      );
      callback(data);
    }
  );
}

export async function addEvent(
  event: Omit<GalleryEvent, "id">
): Promise<string> {
  const docRef = await addDoc(
    collection(db, EVENTS_COLLECTION),
    event
  );
  return docRef.id;
}

export async function deleteEvent(id: string): Promise<boolean> {
  try {
    await deleteDoc(doc(db, EVENTS_COLLECTION, id));
    return true;
  } catch (e) {
    console.error("Delete event failed", e);
    return false;
  }
}

