# EventHub

## Live Demo
Frontend: https://event-hub-analytics-and-testing-pav.vercel.app/
Backend API: https://event-hub-analytics-and-testing.vercel.app/

## Features
- User registration and login
- Event management
- Event registration
- Dashboard and analytics
- File/image uploads
- Responsive design

## Architecture
Frontend (React/Vite)
        ↓
Backend (Node.js + Express)
        ↓
Database
        ↓
Vercel Blob / File Storage

## Deployment
- Frontend: Vercel
- Backend: Vercel
- Database: MongoDB Atlas
- File Storage: Vercel Blob

## Environment Variables

### Frontend
VITE_API_URL= https://event-hub-analytics-and-testing.vercel.app/

### Backend
JWT_SECRET=...
FRONTEND_URL=https://event-hub-analytics-and-testing-pav.vercel.app/
BLOB_READ_WRITE_TOKEN=...

## Local Setup

### Frontend
npm install
npm run dev

### Backend
npm install
npm start

## SEO & Performance
- Added page titles
- Added meta descriptions
- Added image alt text
- Fixed Lighthouse performance/accessibility issues
- Tested responsive layout on mobile and desktop

## Testing
The deployed application was tested on both desktop and mobile screen sizes.
