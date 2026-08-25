# EventHub

## Live Demo

Frontend: Not deployed yet

Backend/API: Not deployed yet

## Architecture

EventHub is a React 19 single-page application built with Vite. It communicates with an Express REST API using `fetch` and Axios. The API handles JWT authentication, registration CRUD operations, image uploads, and analytics data. The intended production architecture is two Vercel projects: the `frontend` Vite build served as static assets and the `backend` Express app deployed as a Vercel Node.js function. JSON files are currently used as local storage for users and registrations.

## Features

- User signup, login, JWT validation, and logout
- Event registration with image upload and validation
- Registered-event list with loading, empty, error, and success states
- Analytics bar, line, and donut charts
- Date-range filtering
- Responsive dashboard and authentication screens
- Vitest, Jest/Supertest, and Playwright test suites

## Local Setup

1. Install frontend dependencies: `cd frontend && npm install`
2. Install backend dependencies: `cd backend && npm install`
3. Copy `frontend/.env.example` to `frontend/.env.local` and set `VITE_API_URL` to `http://localhost:5000`.
4. Copy `backend/.env.example` to `backend/.env` and set a private `JWT_SECRET`.
5. Start the backend: `cd backend && npm start`
6. Start the frontend in another terminal: `cd frontend && npm run dev`

## Environment Variables

Frontend:

```env
VITE_API_URL=http://localhost:5000
```

Backend:

```env
PORT=5000
JWT_SECRET=your-private-secret
FRONTEND_URL=http://localhost:5173
```

## Vercel Deployment

Deploy `frontend` and `backend` as separate Vercel projects. The frontend uses the Vite preset, `npm run build`, and `dist` as its output directory. The backend uses `backend/server.js` as its Express entry point and requires no build command. Configure `VITE_API_URL` on the frontend with the backend deployment URL, and `FRONTEND_URL` plus `JWT_SECRET` on the backend with the frontend URL and a secret value. Redeploy after changing frontend environment variables.

Note: the current JSON-file storage is suitable for local development but is not durable across serverless instances. A production deployment should migrate users, registrations, and uploads to managed storage before relying on persistent production data.

## Testing

Frontend:

```bash
cd frontend
npm run test:run
```

Backend:

```bash
cd backend
npm test
```

E2E:

```bash
npx playwright test
```

## Performance

### Lighthouse Before

Not run: no deployed frontend URL is available in this workspace.

### Issues Fixed

1. Template page title and description: replaced Vite metadata with EventHub SEO metadata.
2. Generic image alternatives: registration images now use descriptive, user-specific alt text.
3. Initial JavaScript size: authentication and dashboard pages are route-level lazy-loaded.

### Lighthouse After

Not run: deployment and a deployed audit require Vercel authentication and live URLs.