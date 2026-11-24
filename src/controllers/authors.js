import {
  getAllAuthors,
  getAuthorById,
  createAuthor as createAuthorInDb,
  updateAuthor as updateAuthorInDb,
  deleteAuthor as deleteAuthorInDb,
  authorHasBooks
} from '../models/authors.js';
import { isNonEmptyString, isValidBirthYear } from '../utils/validate.js';

const SERVER_ERROR = { message: 'Internal server error' };
const NOT_FOUND = { message: 'Author not found' };

// Checks name and birthYear. Returns a list of problems (empty when valid).
function validateAuthorFields(body) {
  const errors = [];
  if (!isNonEmptyString(body?.name)) {
    errors.push('name is required and must be a non-empty string');
  }
  if (!isValidBirthYear(body?.birthYear)) {
    errors.push('birthYear is required and must be a whole number between 0 and the current year');
  }
  return errors;
}

export async function listAuthors(req, res) {
  try {
    const authors = await getAllAuthors();
    return res.status(200).json(authors);
  } catch (error) {
    console.error('Error getting authors:', error);
    return res.status(500).json(SERVER_ERROR);
  }
}

export async function getAuthor(req, res) {
  try {
    const author = await getAuthorById(req.params.id);

    if (!author) {
      return res.status(404).json(NOT_FOUND);
    }

    return res.status(200).json(author);
  } catch (error) {
    console.error(`Error getting author ${req.params.id}:`, error);
    return res.status(500).json(SERVER_ERROR);
  }
}

export async function createAuthor(req, res) {
  const errors = validateAuthorFields(req.body);
  if (!isNonEmptyString(req.body?.id)) {
    errors.unshift('id is required and must be a non-empty string');
  }
  if (errors.length > 0) {
    return res.status(400).json({ message: 'Invalid author data', errors });
  }

  // Only keep the fields in the spec so clients cannot add extra fields.
  const author = {
    id: req.body.id.trim(),
    name: req.body.name.trim(),
    birthYear: req.body.birthYear
  };

  try {
    if (await getAuthorById(author.id)) {
      return res.status(400).json({ message: `An author with id "${author.id}" already exists` });
    }

    const created = await createAuthorInDb(author);
    return res.status(201).json(created);
  } catch (error) {
    console.error('Error creating author:', error);
    return res.status(500).json(SERVER_ERROR);
  }
}

export async function updateAuthor(req, res) {
  const errors = validateAuthorFields(req.body);
  if (errors.length > 0) {
    return res.status(400).json({ message: 'Invalid author data', errors });
  }

  const changes = { name: req.body.name.trim(), birthYear: req.body.birthYear };

  try {
    const updated = await updateAuthorInDb(req.params.id, changes);

    if (!updated) {
      return res.status(404).json(NOT_FOUND);
    }

    return res.status(200).json(updated);
  } catch (error) {
    console.error(`Error updating author ${req.params.id}:`, error);
    return res.status(500).json(SERVER_ERROR);
  }
}

export async function deleteAuthor(req, res) {
  try {
    const author = await getAuthorById(req.params.id);

    if (!author) {
      return res.status(404).json(NOT_FOUND);
    }

    // Deleting an author who still has books would leave those books pointing
    // at an author that no longer exists, so the request is refused.
    if (await authorHasBooks(req.params.id)) {
      return res.status(409).json({
        message: 'Cannot delete an author who still has books. Delete or reassign those books first.'
      });
    }

    await deleteAuthorInDb(req.params.id);
    return res.status(204).send();
  } catch (error) {
    console.error(`Error deleting author ${req.params.id}:`, error);
    return res.status(500).json(SERVER_ERROR);
  }
}
