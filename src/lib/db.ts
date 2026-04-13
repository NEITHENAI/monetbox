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
} from "firebase/firestore";
import { db } from "./firebase";
import { paintings as mockPaintings, type Painting } from "./mockData";

const PAINTINGS_COLLECTION = "paintings";

// Seed Firestore with mock data if the collection is empty
export async function seedPaintingsIfEmpty(): Promise<void> {
  const snapshot = await getDocs(collection(db, PAINTINGS_COLLECTION));
  if (snapshot.empty) {
    for (const painting of mockPaintings) {
      await setDoc(doc(db, PAINTINGS_COLLECTION, painting.id), painting);
    }
    console.log("Seeded Firestore with mock paintings.");
  }
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
