# Node Practical Task

## Features implemented
- Role module: CRUD, add unique access module, remove access module, list with search & pagination.
- User module: CRUD, signup, login (JWT), list with populated roleName & accessModules only.
- Search functionality (partial, case-insensitive) on list APIs.
- Bulk update: same update to many users, and different updates in one DB call.
- Check if a user has access to a module.
- Password hashing (bcrypt), JWT auth.
- Basic error handling.

## How to run
1. Create `.env` (see .env content)
2. `npm install`
3. `npm start`
4. Use Postman to hit endpoints (import the provided Postman collection JSON).

## Endpoints (examples)
- POST `/api/users/signup`
- POST `/api/users/login`
- GET `/api/users?q=pri&page=1&limit=20` (populates role fields)
- POST `/api/roles` (create role)
- POST `/api/roles/:id/access/add` body `{ "module": "orders" }`
- POST `/api/users/bulk/update-same` body `{ "filter": {}, "update": { "lastName": "ABC" } }`
- POST `/api/users/bulk/update-different` body `{ "operations": [{ "_id": "<id>", "update": { "firstName": "X" } }]}`

