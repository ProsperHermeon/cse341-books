# CSE 341 Books API

A web service built with Express and MongoDB that manages books and their authors. Every route is documented and testable in Swagger.

**Deployed URL:** https://cse341-books-mn20.onrender.com
**API docs (Swagger):** https://cse341-books-mn20.onrender.com/api-docs

## Endpoints

### Authors

| Method | Path | Success | Errors |
|---|---|---|---|
| GET | `/authors` | 200, array of authors | 500 |
| GET | `/authors/:id` | 200, one author | 404, 500 |
| POST | `/authors` | 201, created author | 400 (invalid data or duplicate id), 500 |
| PUT | `/authors/:id` | 200, updated author | 400, 404, 500 |
| DELETE | `/authors/:id` | 204, no body | 404, 409 (author still has books), 500 |

### Books

| Method | Path | Success | Errors |
|---|---|---|---|
| GET | `/books` | 200, array of books | 500 |
| GET | `/books/:id` | 200, one book | 404, 500 |
| POST | `/books` | 201, created book | 400 (invalid data, duplicate id, or unknown authorId), 500 |
| PUT | `/books/:id` | 200, updated book | 400 (invalid data or unknown authorId), 404, 500 |
| DELETE | `/books/:id` | 204, no body | 404, 500 |

Errors are JSON, for example `{ "message": "Book not found" }`. Validation errors also include an `errors` array.

## Data

```json
{ "id": "a1", "name": "Maya Rivera", "birthYear": 1984 }
```

```json
{ "id": "b1", "authorId": "a1", "title": "Patterns of Light", "publicationDate": "2021-08-17" }
```

- `authorId` must match the `id` of an existing author.
- `publicationDate` is an ISO 8601 date (`YYYY-MM-DD`).
- `birthYear` is a whole number from 0 to the current year.
- Routes use the custom `id`, never MongoDB's `_id`, and `_id` is not returned.

## Run locally

1. `npm install`
2. Copy `.env.example` to `.env` and fill in your MongoDB connection string.
3. `npm run swagger` to regenerate `swagger.json` after changing route docs.
4. `npm run dev`
5. Open http://127.0.0.1:3000/api-docs

## Configuration

| Variable | Purpose |
|---|---|
| `PORT` | Local port (Render sets this automatically) |
| `MONGODB_URI` | MongoDB Atlas connection string |
| `MONGODB_DB_NAME` | `cse341-books-db` |

## Project structure

```
server.js                   starts the server after connecting to MongoDB
app.js                      Express app, JSON parsing, Swagger UI, error handling
scripts/swagger.js          builds swagger.json from the comments in src/router.js
src/router.js               routes and their OpenAPI documentation
src/controllers/authors.js  validation and status codes for authors
src/controllers/books.js    validation and status codes for books
src/models/authors.js       author queries
src/models/books.js         book queries and the authorExists check
src/utils/validate.js       shared validation helpers
src/db/connect.js           MongoDB connection
```
