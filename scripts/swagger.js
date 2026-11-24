import { writeFileSync } from 'node:fs';
import swaggerJsdoc from 'swagger-jsdoc';

const definition = {
  openapi: '3.0.3',
  info: {
    title: 'Books API',
    version: '2.0.0',
    description:
      'CSE 341 Books and Authors API. Books reference authors through authorId, ' +
      'which must match the id of an existing author.'
  },
  tags: [
    { name: 'Authors', description: 'Create, read, update and delete authors' },
    { name: 'Books', description: 'Create, read, update and delete books' }
  ],
  components: {
    schemas: {
      Author: {
        type: 'object',
        required: ['id', 'name', 'birthYear'],
        properties: {
          id: { type: 'string', example: 'a1' },
          name: { type: 'string', example: 'Maya Rivera' },
          birthYear: { type: 'integer', example: 1984 }
        }
      },
      AuthorInput: {
        type: 'object',
        required: ['name', 'birthYear'],
        properties: {
          name: { type: 'string', example: 'Updated Author' },
          birthYear: { type: 'integer', example: 1981 }
        }
      },
      Book: {
        type: 'object',
        required: ['id', 'authorId', 'title', 'publicationDate'],
        properties: {
          id: { type: 'string', example: 'b1' },
          authorId: { type: 'string', example: 'a1' },
          title: { type: 'string', example: 'Patterns of Light' },
          publicationDate: { type: 'string', format: 'date', example: '2021-08-17' }
        }
      },
      BookInput: {
        type: 'object',
        required: ['authorId', 'title', 'publicationDate'],
        properties: {
          authorId: { type: 'string', example: 'a2' },
          title: { type: 'string', example: 'Updated Book Title' },
          publicationDate: { type: 'string', format: 'date', example: '2026-02-20' }
        }
      },
      Message: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Internal server error' }
        }
      },
      ValidationError: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Invalid author data' },
          errors: {
            type: 'array',
            items: { type: 'string' },
            example: ['name is required and must be a non-empty string']
          }
        }
      }
    }
  }
};

const spec = swaggerJsdoc({ definition, apis: ['./src/router.js'] });

writeFileSync('swagger.json', `${JSON.stringify(spec, null, 2)}\n`);
console.log(`swagger.json written with ${Object.keys(spec.paths).length} paths`);
