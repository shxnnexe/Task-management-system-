# Task Management System API

An Express and MongoDB API providing user registration and login.

## Requirements

- Node.js 20 or newer
- MongoDB

## Setup

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env` and set `MONGO_URI` and `JWT_SECRET`.
3. Start the API with `npm run dev` or `npm start`.

The API listens on port `5000` by default. Set `PORT` to change it.

## Authentication API

Both endpoints accept JSON with a required `username` and a password of at
least six characters. Usernames are trimmed and lowercased. Registration
assigns the `user` role; clients cannot assign roles. Passwords are hashed
before storage.

### `POST /api/register`

Request:

```json
{
  "username": "sampleuser",
  "password": "secret1"
}
```

Success (`201`):

```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "user": {
      "id": "user-id",
      "username": "sampleuser",
      "role": "user"
    }
  }
}
```

### `POST /api/login`

Success (`200`) returns the same public user fields and a one-day JWT in
`data.token`. Send it as a bearer token when calling protected APIs.

All responses use `success`, `message`, and (for success) `data`. Errors use
`success: false`; validation errors also include an `errors` array. Duplicate
usernames return `409`, invalid credentials return `401`, and invalid input
returns `400`.

## Tests

Run `npm test` to execute the unit and HTTP endpoint tests.
