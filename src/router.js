import { Router } from 'express';
import { listBooks, getBook } from './controllers/books.js';

const router = Router();

router.get('/books', listBooks);
router.get('/books/:id', getBook);

export default router;
