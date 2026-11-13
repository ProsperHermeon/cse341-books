import app from './app.js';
import { connectToDb } from './src/db/connect.js';

const PORT = process.env.PORT;

if (!PORT) {
  throw new Error('PORT is not defined. Check your .env file.');
}

try {
  await connectToDb();
  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
} catch (error) {
  console.error('Failed to connect to MongoDB:', error.message);
  process.exit(1);
}
