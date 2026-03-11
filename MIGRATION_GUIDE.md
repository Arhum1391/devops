# FastAPI Migration Guide

This project has been migrated from Next.js API Routes to a FastAPI backend service.

## Architecture Changes

### Before (Next.js API Routes)
- All API endpoints in `src/app/api/`
- Single Next.js server handling both frontend and backend
- Port: 3000

### After (FastAPI Backend)
- Frontend: Next.js (port 3000)
- Backend: FastAPI (port 8000)
- Separate services with CORS configuration

## Setup Instructions

### 1. Backend Setup

```bash
cd backend
pip install -r requirements.txt

# Create .env file from example:
# On Windows (PowerShell):
Copy-Item env.example .env

# On Linux/Mac:
cp env.example .env

# Edit .env with your configuration
python run.py
```

The FastAPI backend will run on `http://localhost:8000`

### 2. Frontend Setup

```bash
# In project root
npm install
# Add to .env.local:
NEXT_PUBLIC_API_URL=http://localhost:8000
npm run dev
```

The Next.js frontend will run on `http://localhost:3000`

### 3. Running Both Services

**Option 1: Separate Terminals**
```bash
# Terminal 1: Backend
cd backend
python run.py

# Terminal 2: Frontend
npm run dev
```

**Option 2: Use a process manager** (PM2, concurrently, etc.)

## Environment Variables

### Backend (.env in backend/)
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secret key for JWT tokens
- `CORS_ORIGINS`: Comma-separated list of allowed origins
- `STRIPE_SECRET_KEY`: Stripe API key
- Other third-party API keys

### Frontend (.env.local)
- `NEXT_PUBLIC_API_URL`: FastAPI backend URL (default: http://localhost:8000)
- Other existing Next.js environment variables

## API Endpoints

All endpoints are now under `/api/` prefix on the FastAPI server:

- `/api/auth/me` - Get current user
- `/api/auth/logout` - Logout
- `/api/admin/api/auth/login` - Admin login
- `/api/team` - Get team members
- `/api/reviews` - Reviews CRUD
- `/api/stripe/*` - Stripe integration
- `/api/calendly/*` - Calendly integration
- `/api/portfolio/*` - Portfolio management
- And more...

See `http://localhost:8000/docs` for full API documentation.

## Database

The FastAPI backend uses the same PostgreSQL database as before. SQLAlchemy models mirror the Prisma schema. Database migrations are still handled by Prisma.

## Authentication

Authentication uses JWT tokens stored in httpOnly cookies. Cookies are set by FastAPI and sent by the frontend with `credentials: 'include'` in fetch requests.

## CORS Configuration

CORS is configured in `backend/app/main.py` to allow requests from the Next.js frontend. Update `CORS_ORIGINS` in backend `.env` for production.

## Development

### Backend Development
- FastAPI auto-reloads on code changes
- API docs available at `/docs` (Swagger) and `/redoc`
- Check logs in terminal

### Frontend Development
- Next.js hot-reloads on code changes
- All API calls now go to FastAPI backend
- Check browser console for API errors

## Troubleshooting

### CORS Errors
- Ensure `CORS_ORIGINS` in backend `.env` includes `http://localhost:3000`
- Check that frontend uses `credentials: 'include'` in fetch calls

### Authentication Issues
- Verify JWT_SECRET matches between frontend and backend
- Check that cookies are being set and sent correctly
- Check browser DevTools > Application > Cookies

### Database Connection
- Ensure PostgreSQL is running
- Verify DATABASE_URL is correct
- Check backend logs for connection errors

## Production Deployment

1. **Backend**: Deploy FastAPI service (e.g., using Docker, Railway, Render)
2. **Frontend**: Deploy Next.js app (e.g., Vercel)
3. **Environment**: Set production environment variables
4. **CORS**: Update `CORS_ORIGINS` to production frontend URL
5. **Database**: Use production PostgreSQL instance

## Notes

- Some endpoints may need additional implementation (portfolio Binance integration, etc.)
- Admin endpoints are under `/api/admin/api/` prefix
- File uploads may need S3 configuration
- Webhook endpoints need proper signature verification

