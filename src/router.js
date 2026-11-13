import { Router } from 'express';
import { listBooks } from './controllers/books.js';

const router = Router();

router.get('/books', listBooks);

export default router;
