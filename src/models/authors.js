import { getDb } from '../db/connect.js';

// Hide MongoDB's internal _id so clients only see the fields in the spec.
const PUBLIC_FIELDS = { _id: 0, id: 1, name: 1, birthYear: 1 };

export async function getAllAuthors() {
  return getDb()
    .collection('authors')
    .find({}, { projection: PUBLIC_FIELDS })
    .sort({ id: 1 })
    .toArray();
}

export async function getAuthorById(id) {
  return getDb()
    .collection('authors')
    .findOne({ id }, { projection: PUBLIC_FIELDS });
}

export async function createAuthor(author) {
  // insertOne adds _id to the object it receives, so insert a copy.
  await getDb().collection('authors').insertOne({ ...author });
  return author;
}

export async function updateAuthor(id, changes) {
  return getDb()
    .collection('authors')
    .findOneAndUpdate(
      { id },
      { $set: changes },
      { returnDocument: 'after', projection: PUBLIC_FIELDS }
    );
}

export async function deleteAuthor(id) {
  const result = await getDb().collection('authors').deleteOne({ id });
  return result.deletedCount === 1;
}

export async function authorHasBooks(id) {
  const count = await getDb()
    .collection('books')
    .countDocuments({ authorId: id }, { limit: 1 });
  return count > 0;
}
