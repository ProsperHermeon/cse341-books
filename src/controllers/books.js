import {
  getAllBooks,
  getBookById,
  createBook as createBookInDb,
  updateBook as updateBookInDb,
  deleteBook as deleteBookInDb,
  authorExists
} from '../models/books.js';
import { isNonEmptyString, isIsoDate } from '../utils/validate.js';

const SERVER_ERROR = { message: 'Internal server error' };
const NOT_FOUND = { message: 'Book not found' };

// Checks authorId, title and publicationDate. Returns a list of problems.
function validateBookFields(body) {
  const errors = [];
  if (!isNonEmptyString(body?.authorId)) {
    errors.push('authorId is required and must be a non-empty string');
  }
  if (!isNonEmptyString(body?.title)) {
    errors.push('title is required and must be a non-empty string');
  }
  if (!isIsoDate(body?.publicationDate)) {
    errors.push('publicationDate is required and must be a valid date in YYYY-MM-DD format');
  }
  return errors;
}

export async function listBooks(req, res) {
  try {
    const books = await getAllBooks();
    return res.status(200).json(books);
  } catch (error) {
    console.error('Error getting books:', error);
    return res.status(500).json(SERVER_ERROR);
  }
}

export async function getBook(req, res) {
  try {
    const book = await getBookById(req.params.id);

    if (!book) {
      return res.status(404).json(NOT_FOUND);
    }

    return res.status(200).json(book);
  } catch (error) {
    console.error(`Error getting book ${req.params.id}:`, error);
    return res.status(500).json(SERVER_ERROR);
  }
}

export async function createBook(req, res) {
  const errors = validateBookFields(req.body);
  if (!isNonEmptyString(req.body?.id)) {
    errors.unshift('id is required and must be a non-empty string');
  }
  if (errors.length > 0) {
    return res.status(400).json({ message: 'Invalid book data', errors });
  }

  // Only keep the fields in the spec so clients cannot add extra fields.
  const book = {
    id: req.body.id.trim(),
    authorId: req.body.authorId.trim(),
    title: req.body.title.trim(),
    publicationDate: req.body.publicationDate
  };

  try {
    if (await getBookById(book.id)) {
      return res.status(400).json({ message: `A book with id "${book.id}" already exists` });
    }

    if (!(await authorExists(book.authorId))) {
      return res.status(400).json({ message: `No author exists with id "${book.authorId}"` });
    }

    const created = await createBookInDb(book);
    return res.status(201).json(created);
  } catch (error) {
    console.error('Error creating book:', error);
    return res.status(500).json(SERVER_ERROR);
  }
}

export async function updateBook(req, res) {
  const errors = validateBookFields(req.body);
  if (errors.length > 0) {
    return res.status(400).json({ message: 'Invalid book data', errors });
  }

  const changes = {
    authorId: req.body.authorId.trim(),
    title: req.body.title.trim(),
    publicationDate: req.body.publicationDate
  };

  try {
    if (!(await getBookById(req.params.id))) {
      return res.status(404).json(NOT_FOUND);
    }

    if (!(await authorExists(changes.authorId))) {
      return res.status(400).json({ message: `No author exists with id "${changes.authorId}"` });
    }

    const updated = await updateBookInDb(req.params.id, changes);
    return res.status(200).json(updated);
  } catch (error) {
    console.error(`Error updating book ${req.params.id}:`, error);
    return res.status(500).json(SERVER_ERROR);
  }
}

export async function deleteBook(req, res) {
  try {
    const deleted = await deleteBookInDb(req.params.id);

    if (!deleted) {
      return res.status(404).json(NOT_FOUND);
    }

    return res.status(204).send();
  } catch (error) {
    console.error(`Error deleting book ${req.params.id}:`, error);
    return res.status(500).json(SERVER_ERROR);
  }
}
