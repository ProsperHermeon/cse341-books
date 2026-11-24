import { readFileSync } from 'node:fs';
import express from 'express';
import swaggerUi from 'swagger-ui-express';
import router from './src/router.js';

const swaggerDocument = JSON.parse(
  readFileSync(new URL('./swagger.json', import.meta.url), 'utf8')
);

const app = express();

app.use(express.json());

app.get('/', (req, res) => {
  return res.status(200).json({
    message: 'Books API is running',
    docs: '/api-docs'
  });
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use(router);

// Unknown routes get a JSON 404 instead of Express's default HTML page.
app.use((req, res) => {
  return res.status(404).json({ message: 'Route not found' });
});

// Malformed JSON bodies get a safe 400; anything else is a safe 500.
// Express only treats a function as an error handler when it has 4 parameters.
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'Request body must be valid JSON' });
  }
  console.error('Unhandled error:', err);
  return res.status(500).json({ message: 'Internal server error' });
});

export default app;
