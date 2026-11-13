import { getDb } from '../db/connect.js';

const COLLECTION = 'books';

// Hide MongoDB's internal _id so clients only see the fields in the spec.
const PUBLIC_FIELDS = { _id: 0, id: 1, author: 1, title: 1, publicationDate: 1 };

export async function getAllBooks() {
  return getDb()
    .collection(COLLECTION)
    .find({}, { projection: PUBLIC_FIELDS })
    .sort({ id: 1 })
    .toArray();
}
