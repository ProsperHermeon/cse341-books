import { getDb } from '../db/connect.js';

// Hide MongoDB's internal _id so clients only see the fields in the spec.
const PUBLIC_FIELDS = { _id: 0, id: 1, authorId: 1, title: 1, publicationDate: 1 };

export async function getAllBooks() {
  return getDb()
    .collection('books')
    .find({}, { projection: PUBLIC_FIELDS })
    .sort({ id: 1 })
    .toArray();
}

export async function getBookById(id) {
  return getDb()
    .collection('books')
    .findOne({ id }, { projection: PUBLIC_FIELDS });
}

export async function createBook(book) {
  // insertOne adds _id to the object it receives, so insert a copy.
  await getDb().collection('books').insertOne({ ...book });
  return book;
}

export async function updateBook(id, changes) {
  return getDb()
    .collection('books')
    .findOneAndUpdate(
      { id },
      { $set: changes },
      { returnDocument: 'after', projection: PUBLIC_FIELDS }
    );
}

export async function deleteBook(id) {
  const result = await getDb().collection('books').deleteOne({ id });
  return result.deletedCount === 1;
}

// A book's authorId must match the id of a document in the authors collection.
export async function authorExists(authorId) {
  const author = await getDb()
    .collection('authors')
    .findOne({ id: authorId }, { projection: { _id: 1 } });
  return author !== null;
}
