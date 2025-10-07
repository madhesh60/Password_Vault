# Password Vault - Backend

Requirements:
- Node 18+
- MongoDB

Setup:
1. copy `.env.example` to `.env` and set MONGO_URI and JWT_SECRET.
2. npm install
3. npm run dev (for development)

API:
- POST /auth/register { email, password, keySalt } -> { token, keySalt }
- POST /auth/login { email, password } -> { token, keySalt }
- Protected routes require Authorization: Bearer <token>
- Vault endpoints: GET /vault, POST /vault, PUT /vault/:id, DELETE /vault/:id
