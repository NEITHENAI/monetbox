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
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { db, storage } from "./firebase";
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

// Upload an image to Firebase Storage and return the URL
export async function uploadImage(file: File): Promise<string> {
  console.log("Starting upload for file:", file.name, "Size:", file.size);
  
  return new Promise((resolve, reject) => {
    try {
      const storageRef = ref(storage, `paintings/${Date.now()}_${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      // Add a manual timeout of 30 seconds
      const timeout = setTimeout(() => {
        uploadTask.cancel();
        reject(new Error("Upload timed out after 30 seconds. Please check your internet connection or Firebase Storage rules."));
      }, 30000);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log("Upload is " + progress + "% done");
        },
        (error) => {
          clearTimeout(timeout);
          console.error("Upload failed with error:", error);
          reject(error);
        },
        async () => {
          clearTimeout(timeout);
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            console.log("Upload successful! URL:", downloadURL);
            resolve(downloadURL);
          } catch (err) {
            console.error("Error getting download URL:", err);
            reject(err);
          }
        }
      );
    } catch (error) {
      console.error("Error initializing upload:", error);
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
