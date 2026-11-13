import { getAllBooks, getBookById } from '../models/books.js';

export async function listBooks(req, res) {
  try {
    const books = await getAllBooks();
    return res.status(200).json(books);
  } catch (error) {
    console.error('Error getting books:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

export async function getBook(req, res) {
  try {
    const book = await getBookById(req.params.id);

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    return res.status(200).json(book);
  } catch (error) {
    console.error(`Error getting book ${req.params.id}:`, error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
