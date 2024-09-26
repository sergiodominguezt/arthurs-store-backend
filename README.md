# NestJS Payment Processing API

This is a NestJS application for processing credit card payments using the external API called Arthompi. It uses PostgreSQL as the database and TypeORM as the ORM.

## Requirements

- Node.js v18.0.7
- npm (bundled with Node.js v18.0.7)
- PostgreSQL

## Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd <repository-directory>
2. Install the dependencies
   ```bash
   npm install

4. Configure the environment variables:
   ```bash
    DATABASE_HOST=<your-database-host>
    DATABASE_PORT=<your-database-port>
    DATABASE_USER=<your-database-user>
    DATABASE_PASSWORD=<your-database-password>
    DATABASE_NAME=<your-database-name>
    ARTHOMPI_API_KEY=<your-arthompi-api-key>

6. Running the application
   ```bash
   npm run start:dev
   
## API Endpoints
- List Products
    GET http://api-url:3000/products
    Retrieves a list of available products.
- Process Transactions
    POST http://api-url:3000/transaction
    Processes credit card transactions through the Arthompi API.
## Postman Collections
   You can find postman collections in:
      ```bash
      collections/

## Technologies Used
- NestJS: A progressive Node.js framework for building efficient and scalable server-side applications.
- Node.js: JavaScript runtime built on Chrome's V8 JavaScript engine
- TypeORM: An ORM that can run in Node.js, used with TypeScript and JavaScript.
- PostgreSQL: A powerful, open-source object-relational database system.

## Coverage report
[Coverage report screenshot](https://ibb.co/G2ysJsy)
