# Books API Week 02 Spec

# Version 1

## Feature 1: Book CRUD Operations and Author References

### Goal
Update the existing Week 01 book API so book documents include a reference to an author and the API supports all CRUD operations for books. Every book route must be documented and testable in Swagger.

### Data Model
Book documents will be stored in the `books` collection.

Required book fields:
- `id`: string, required, custom id such as `b1`
- `authorId`: string, required, references the `id` field of an author document
- `title`: string, required
- `publicationDate`: string, required

Books will continue to use custom string ids instead of MongoDB `_id` values for route parameters.

### Relationship to Authors
Each book will identify its author with an `authorId` field. The value of `authorId` must match the custom `id` value of an existing author document.

When creating or updating a book, the API should reject the request with a `400` status code if the submitted `authorId` does not match an existing author.

### Routes

#### GET /books
Purpose: Return all books.

Success:
- Status code: `200`
- Response body: an array of book objects

Errors:
- `500` if an unexpected server or database error occurs

#### GET /books/:id
Purpose: Return one book by its custom id.

Success:
- Status code: `200`
- Response body: the matching book object

Errors:
- `404` if no book exists with that id
- `500` if an unexpected server or database error occurs

#### POST /books
Purpose: Create a new book.

Request body:

    {
      "id": "b4",
      "authorId": "a1",
      "title": "Example Book Title",
      "publicationDate": "2026-01-15"
    }

Success:
- Status code: `201`
- Response body: the newly created book object

Errors:
- `400` if a required field is missing
- `400` if the `id` already exists
- `400` if the `authorId` does not match an existing author
- `500` if an unexpected server or database error occurs

#### PUT /books/:id
Purpose: Update an existing book.

Request body:

    {
      "authorId": "a2",
      "title": "Updated Book Title",
      "publicationDate": "2026-02-20"
    }

Success:
- Status code: `200`
- Response body: the updated book object

Errors:
- `400` if a required field is missing
- `400` if the `authorId` does not match an existing author
- `404` if no book exists with that id
- `500` if an unexpected server or database error occurs

#### DELETE /books/:id
Purpose: Delete an existing book.

Success:
- Status code: `204`
- Response body: none

Errors:
- `404` if no book exists with that id
- `500` if an unexpected server or database error occurs

### Swagger Documentation
Swagger must document every book route.

### Deployment Expectations
After implementation, the book routes must work locally and from the deployed Render application. The deployed Swagger page at `/api-docs` must allow someone to test every book route from the browser.

## Feature 2: Author CRUD Operations

### Goal
Add an `authors` collection and an API that supports all CRUD operations for authors. Every author route must be documented and testable in Swagger.

### Data Model
Author documents will be stored in the `authors` collection.

Required author fields:
- `id`: string, required, custom id such as `a1`
- `name`: string, required
- `birthYear`: number, required

Authors will use custom string ids instead of MongoDB `_id` values for route parameters, the same as books.

### Relationship to Books
Books point to authors through `books.authorId`, which matches `authors.id`. An author can have many books.

An author who still has books cannot be deleted, because those books would point to an author that no longer exists.

### Routes

#### GET /authors
Purpose: Return all authors.

Success:
- Status code: `200`
- Response body: an array of author objects

Errors:
- `500` if an unexpected server or database error occurs

#### GET /authors/:id
Purpose: Return one author by its custom id.

Success:
- Status code: `200`
- Response body: the matching author object

Errors:
- `404` if no author exists with that id
- `500` if an unexpected server or database error occurs

#### POST /authors
Purpose: Create a new author.

Request body:

    {
      "id": "a4",
      "name": "Example Author",
      "birthYear": 1980
    }

Success:
- Status code: `201`
- Response body: the newly created author object

Errors:
- `400` if a required field is missing
- `400` if the `id` already exists
- `500` if an unexpected server or database error occurs

#### PUT /authors/:id
Purpose: Update an existing author.

Request body:

    {
      "name": "Updated Author",
      "birthYear": 1981
    }

Success:
- Status code: `200`
- Response body: the updated author object

Errors:
- `400` if a required field is missing
- `404` if no author exists with that id
- `500` if an unexpected server or database error occurs

#### DELETE /authors/:id
Purpose: Delete an existing author.

Success:
- Status code: `204`
- Response body: none

Errors:
- `404` if no author exists with that id
- `409` if the author still has books
- `500` if an unexpected server or database error occurs

### Swagger Documentation
Swagger must document every author route.

### Deployment Expectations
After implementation, the author routes must work locally and from the deployed Render application. The deployed Swagger page at `/api-docs` must allow someone to test every author route from the browser.

---

# Evaluation of Version 1

I reviewed Version 1 against four questions, then checked it with AI. These are the problems found and the fix for each.

| Question | Problem in Version 1 | Fix in Version 2 |
|---|---|---|
| Bugs or short-sighted decisions | `publicationDate` has no format, so `"Jan 5"` or `"2020-02-30"` would be accepted | Must be a real date in `YYYY-MM-DD` format |
| Bugs or short-sighted decisions | `birthYear` has no rules, so `"1980"` (a string) or `3000` would be accepted | Must be a whole number from 0 to the current year |
| Bugs or short-sighted decisions | Nothing says whether the `id` can change on `PUT` | The `id` comes from the URL and cannot be changed; an `id` in the body is ignored |
| Bugs or short-sighted decisions | `PUT` with a missing book and a bad `authorId` could return either error | Check order defined: validation (400), then book exists (404), then author exists (400) |
| Security | Clients could send extra fields (or MongoDB operators like `{ "$ne": null }`) that get saved or used in a query | Only the spec's fields are saved; every field must be a string or number of the right type |
| Security | Raw database errors could reach the client | 500 responses only return `{ "message": "Internal server error" }`; details are logged on the server |
| Security | MongoDB's `_id` would leak in responses | Responses use a projection that hides `_id` |
| Efficiency | Checking whether an author has books could count every book | Stop counting at the first match (`limit: 1`) |
| Efficiency | List order is undefined, so results can shuffle between calls | Lists are sorted by `id` |
| Unclear responses | Error bodies are not described | All errors are JSON with a `message`; validation errors add an `errors` array |
| Unclear responses | Malformed JSON would return Express's default HTML page | Malformed JSON returns `400` with a JSON message |

---

# Version 2

## Shared Rules (both features)
- All request and response bodies are JSON.
- Routes use custom string ids (`a1`, `b1`), never MongoDB `_id`. `_id` is never returned.
- Only the fields listed in the data model are saved. Extra fields in a request body are ignored.
- String fields must be non-empty after trimming spaces.
- Lists are sorted by `id`.
- Error bodies:
  - Not found: `{ "message": "Book not found" }` or `{ "message": "Author not found" }`
  - Validation: `{ "message": "Invalid book data", "errors": ["title is required and must be a non-empty string"] }`
  - Duplicate id: `{ "message": "A book with id \"b1\" already exists" }`
  - Unknown author: `{ "message": "No author exists with id \"a999\"" }`
  - Server error: `{ "message": "Internal server error" }`, with no stack trace or database details
  - Malformed JSON body: `400` with `{ "message": "Request body must be valid JSON" }`
  - Unknown route: `404` with `{ "message": "Route not found" }`

## Feature 1: Book CRUD Operations and Author References

### Data Model (`books` collection)

| Field | Type | Rules |
|---|---|---|
| `id` | string | Required on create, unique, cannot be changed |
| `authorId` | string | Required, must match the `id` of an existing author |
| `title` | string | Required, non-empty |
| `publicationDate` | string | Required, a real date in `YYYY-MM-DD` format |

Example:

    { "id": "b1", "authorId": "a1", "title": "Patterns of Light", "publicationDate": "2021-08-17" }

Existing Week 01 books are updated to replace the `author` name with an `authorId`.

### Routes

| Route | Success | Errors |
|---|---|---|
| `GET /books` | `200`, array of books sorted by `id` | `500` |
| `GET /books/:id` | `200`, the book | `404`, `500` |
| `POST /books` | `201`, the created book | `400` invalid or missing field, `400` duplicate `id`, `400` unknown `authorId`, `500` |
| `PUT /books/:id` | `200`, the updated book | `400` invalid or missing field, `404` book not found, `400` unknown `authorId`, `500` |
| `DELETE /books/:id` | `204`, no body | `404`, `500` |

`POST /books` body: `id`, `authorId`, `title`, `publicationDate` (all required).
`PUT /books/:id` body: `authorId`, `title`, `publicationDate` (all required; the whole book is replaced except its `id`).

Check order for `POST`: validate fields (400) → duplicate `id` (400) → author exists (400) → insert (201).
Check order for `PUT`: validate fields (400) → book exists (404) → author exists (400) → update (200).

## Feature 2: Author CRUD Operations

### Data Model (`authors` collection)

| Field | Type | Rules |
|---|---|---|
| `id` | string | Required on create, unique, cannot be changed |
| `name` | string | Required, non-empty |
| `birthYear` | number | Required, a whole number from 0 to the current year |

Example:

    { "id": "a1", "name": "Maya Rivera", "birthYear": 1984 }

### Routes

| Route | Success | Errors |
|---|---|---|
| `GET /authors` | `200`, array of authors sorted by `id` | `500` |
| `GET /authors/:id` | `200`, the author | `404`, `500` |
| `POST /authors` | `201`, the created author | `400` invalid or missing field, `400` duplicate `id`, `500` |
| `PUT /authors/:id` | `200`, the updated author | `400` invalid or missing field, `404`, `500` |
| `DELETE /authors/:id` | `204`, no body | `404`, `409` author still has books, `500` |

`POST /authors` body: `id`, `name`, `birthYear` (all required).
`PUT /authors/:id` body: `name`, `birthYear` (both required).

### Deleting an author who still has books
`DELETE /authors/:id` returns `409 Conflict` with `{ "message": "Cannot delete an author who still has books. Delete or reassign those books first." }`. Nothing is deleted. The client must delete those books, or move them to another author with `PUT /books/:id`, before the author can be deleted. `409` fits because the request is valid but conflicts with the current state of the data.

## Swagger Documentation
- Swagger UI is served at `/api-docs`, generated with `npm run swagger` from OpenAPI comments in `src/router.js` into `swagger.json`.
- Every route lists every status code it can return, with an example error body.
- `POST` and `PUT` routes include a `requestBody` with a schema and an example, so they can be run with **Try it out**.
- Shared schemas: `Author`, `AuthorInput`, `Book`, `BookInput`, `Message`, `ValidationError`.

## Deployment Expectations
- Render redeploys from `main` after each merged pull request.
- Every route is tested from the deployed `/api-docs` page, including at least one error case per write route.
- The Atlas `authors` collection holds at least 3 authors, and every book's `authorId` matches one of them.

## Out of Scope for Week 02
- Authentication and authorization.
- Paging and filtering (for example `GET /authors/:id/books`).
- A unique index on `id` in MongoDB. The API checks for duplicates before inserting, which is enough for this project; a unique index would also stop two requests that arrive at the same moment.
