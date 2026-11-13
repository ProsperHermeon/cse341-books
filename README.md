# CSE 341 Books API

A read-only web service built with Express and MongoDB that returns book records as JSON.

**Deployed URL:** https://YOUR-RENDER-SERVICE.onrender.com

## Endpoints

| Method | Path | Success | Errors |
|---|---|---|---|
| GET | `/` | 200 `{ "message": "Books API is running" }` | — |
| GET | `/books` | 200, array of books | 500 `{ "message": "Internal server error" }` |
| GET | `/books/:id` | 200, one book | 404 `{ "message": "Book not found" }`, 500 `{ "message": "Internal server error" }` |

### Book shape

```json
{
  "id": "b1",
  "author": "Maya Rivera",
  "title": "Patterns of Light",
  "publicationDate": "2021-08-17"
}
```

`publicationDate` is an ISO 8601 date string (`YYYY-MM-DD`).

## Run locally

1. `npm install`
2. Copy `.env.example` to `.env` and fill in your MongoDB connection string.
3. `npm run dev`
4. Open http://127.0.0.1:3000/books

## Configuration

Settings come from environment variables. The real `.env` file is ignored by Git, and production values are stored in Render's Environment settings.

| Variable | Purpose |
|---|---|
| `PORT` | Local port (Render sets this automatically) |
| `MONGODB_URI` | MongoDB Atlas connection string |
| `MONGODB_DB_NAME` | `cse341-books-db` |

## Project structure

```
server.js                 starts the server after connecting to MongoDB
app.js                    Express app, JSON middleware, root route, router
src/router.js             maps URLs to controllers
src/controllers/books.js  picks status codes and responses
src/models/books.js       database queries
src/db/connect.js         MongoDB connection (connectToDb, getDb)
```
