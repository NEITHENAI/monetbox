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
  where,
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
  price: number;
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

// ==========================================
// USER ROLES & APPLICATIONS API
// ==========================================

const USERS_COLLECTION = "users";
const APPLICATIONS_COLLECTION = "artist_applications";

export interface UserRole {
  uid: string;
  role: "admin" | "artist" | "user";
}

export interface ArtistApplication {
  id?: string;
  userId: string;
  userEmail: string;
  shopName: string;
  artistName: string;
  email: string;
  phone: string;
  profilePictureUrl: string;
  status: "pending" | "approved" | "rejected";
  createdAt: number;
}

export async function getUserRole(uid: string): Promise<string> {
  try {
    const docSnap = await getDoc(doc(db, USERS_COLLECTION, uid));
    if (docSnap.exists()) {
      return docSnap.data().role || "user";
    }
    return "user";
  } catch (e) {
    console.error("Error getting user role:", e);
    return "user";
  }
}

export async function updateUserRole(uid: string, role: "admin" | "artist" | "user", extraData?: Record<string, any>): Promise<boolean> {
  try {
    await setDoc(doc(db, USERS_COLLECTION, uid), { id: uid, role, updatedAt: Date.now(), ...extraData }, { merge: true });
    return true;
  } catch (e) {
    console.error("Error updating user role:", e);
    return false;
  }
}

export async function submitArtistApplication(app: Omit<ArtistApplication, "id" | "status" | "createdAt">): Promise<boolean> {
  try {
    await addDoc(collection(db, APPLICATIONS_COLLECTION), {
      ...app,
      status: "pending",
      createdAt: Date.now(),
    });
    return true;
  } catch (e) {
    console.error("Error submitting application:", e);
    return false;
  }
}

export async function getUserApplication(userId: string): Promise<ArtistApplication | null> {
  try {
    const snapshot = await getDocs(
      query(
        collection(db, APPLICATIONS_COLLECTION),
        where("userId", "==", userId)
      )
    );
    if (snapshot.empty) return null;
    // Get the most recent application
    const sorted = snapshot.docs
      .map(d => ({ id: d.id, ...d.data() } as ArtistApplication))
      .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    return sorted[0];
  } catch (e) {
    console.error("Error getting user application:", e);
    return null;
  }
}

// Only get pending applications for admin review
export async function getApplications(): Promise<ArtistApplication[]> {
  try {
    const snapshot = await getDocs(
      query(collection(db, APPLICATIONS_COLLECTION), where("status", "==", "pending"))
    );
    return snapshot.docs
      .map((d) => ({ id: d.id, ...d.data() } as ArtistApplication))
      .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  } catch (e) {
    console.error("Error getting applications:", e);
    return [];
  }
}

export async function updateApplicationStatus(id: string, status: "approved" | "rejected", userId: string, applicationData?: ArtistApplication): Promise<boolean> {
  try {
    await updateDoc(doc(db, APPLICATIONS_COLLECTION, id), { status });
    if (status === "approved" && applicationData) {
      await updateUserRole(userId, "artist", {
        shopName: applicationData.shopName,
        artistName: applicationData.artistName,
        profilePictureUrl: applicationData.profilePictureUrl,
        email: applicationData.email,
        phone: applicationData.phone,
      });
    } else if (status === "approved") {
      await updateUserRole(userId, "artist");
    }
    return true;
  } catch (e) {
    console.error("Error updating application status:", e);
    return false;
  }
}

export async function getArtists(): Promise<ArtistApplication[]> {
  try {
    const snapshot = await getDocs(
      query(collection(db, APPLICATIONS_COLLECTION), where("status", "==", "approved"))
    );
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as ArtistApplication));
  } catch (e) {
    console.error("Error getting artists:", e);
    return [];
  }
}

export async function removeArtist(uid: string): Promise<boolean> {
  try {
    // Revoke the role in /users
    await updateUserRole(uid, "user");
    // Also update their application status back to rejected
    try {
      const appSnapshot = await getDocs(
        query(
          collection(db, APPLICATIONS_COLLECTION),
          where("userId", "==", uid),
          where("status", "==", "approved")
        )
      );
      for (const appDoc of appSnapshot.docs) {
        await updateDoc(doc(db, APPLICATIONS_COLLECTION, appDoc.id), { status: "rejected" });
      }
    } catch (e2) {
      console.error("Error revoking application status:", e2);
    }
    return true;
  } catch (e) {
    console.error("Error removing artist:", e);
    return false;
  }
}



