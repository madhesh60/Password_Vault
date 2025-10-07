Password Vault (MVP)
====================

This repository includes a minimal Password Vault (frontend + backend) designed to be privacy-first:
- Client-side encryption (AES-GCM) using Web Crypto API derived from your account password via PBKDF2.
- Server stores only encrypted blobs (ciphertext + iv) and cannot see plaintext vault item details.
- Simple auth (email + password) for account management.

What's inside
- /backend — Node.js + Express + TypeScript API, MongoDB models.
- /frontend — Vite + React + TypeScript single-page app.

Quickstart (local)
1. Start MongoDB locally.
2. Backend:
   - cd backend
   - cp .env.example .env and edit values
   - npm install
   - npm run dev
3. Frontend:
   - cd frontend
   - npm install
   - npm run dev
4. Open the frontend (default Vite port 5173)

Short crypto note
Client uses PBKDF2 (200k iterations, SHA-256) to derive a 256-bit AES-GCM key from your password and a per-account salt. AES-GCM provides authenticated encryption so the server stores only base64 ciphertext and iv.

Deliverables included:
- Full source for frontend and backend.
- This README explaining setup.

