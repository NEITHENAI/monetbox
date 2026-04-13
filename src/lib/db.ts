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
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
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
  const storageRef = ref(storage, `paintings/${Date.now()}_${file.name}`);
  const snapshot = await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(snapshot.ref);
  return downloadURL;
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
