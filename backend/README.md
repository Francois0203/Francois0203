# Francois Backend (skeleton)

This folder contains a minimal Express.js backend skeleton with:

- `server.js` — app entry
- `src/app.js` — Express app and middleware registration
- `src/middleware/` — CORS and logger middleware
- `src/routes/` — barrel + a sample route
- `src/controllers/` — barrel + a sample controller

To run:

```bash
cd backend
npm install
npm run dev
```

The CORS middleware is preconfigured to allow requests from:

- `http://localhost:3000/Francois0203`
- `https://francois0203.github.io/Francois0203/`

You can add more origins via the `ALLOWED_ORIGINS` environment variable (comma-separated).