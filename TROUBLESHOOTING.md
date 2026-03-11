# Troubleshooting FastAPI Backend

## Common Issues and Solutions

### 1. "Failed to fetch" Error

**Symptoms:**
- Frontend shows "Failed to fetch" error
- Network tab shows CORS error or connection refused

**Solutions:**

#### Check Backend is Running
```bash
# In backend directory
python run.py
```
You should see: `INFO:     Uvicorn running on http://0.0.0.0:8000`

#### Check CORS Configuration
1. Verify `CORS_ORIGINS` in `backend/.env` includes your frontend URL:
   ```
   CORS_ORIGINS=http://localhost:3000,http://localhost:3001
   ```

2. Restart the backend server after changing `.env`

#### Check Frontend Environment Variable
1. Create or update `.env.local` in project root:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

2. Restart Next.js dev server after adding the variable

#### Test Backend Directly
Open in browser:
- `http://localhost:8000/health` - Should return `{"status": "healthy"}`
- `http://localhost:8000/docs` - Should show Swagger UI
- `http://localhost:8000/api/team` - Should return team data

#### Check Browser Console
- Look for CORS errors
- Check Network tab for failed requests
- Verify the request URL is correct

### 2. Database Connection Errors

**Error:** `invalid dsn: invalid connection option "schema"`

**Solution:** The `clean_database_url()` function in `backend/app/core/database.py` should handle this automatically. If you still see this error:
1. Check your `DATABASE_URL` in `backend/.env`
2. Ensure it doesn't have `?schema=public` (it will be removed automatically)

### 3. CORS Errors

**Error:** `Access to fetch at 'http://localhost:8000/api/...' from origin 'http://localhost:3000' has been blocked by CORS policy`

**Solution:**
1. Verify `CORS_ORIGINS` in `backend/.env` includes `http://localhost:3000`
2. Restart backend server
3. Check browser console for specific CORS error message
4. Ensure `credentials: 'include'` is in fetch calls

### 4. Authentication Issues

**Symptoms:**
- 401 Unauthorized errors
- Cookies not being set

**Solutions:**
1. Check `JWT_SECRET` matches between frontend and backend
2. Ensure cookies are being sent: `credentials: 'include'` in fetch
3. Check browser DevTools > Application > Cookies to see if `auth-token` cookie exists
4. Verify token expiration hasn't passed

### 5. Port Already in Use

**Error:** `Address already in use`

**Solution:**
```bash
# Find process using port 8000
netstat -ano | findstr :8000

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F
```

### 6. Module Import Errors

**Error:** `ModuleNotFoundError` or `NameError`

**Solution:**
1. Ensure all dependencies are installed:
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

2. Check for missing imports in model files (e.g., `Integer` from sqlalchemy)

### 7. Environment Variables Not Loading

**Symptoms:**
- Default values being used instead of `.env` values
- Configuration errors

**Solution:**
1. Ensure `.env` file exists in `backend/` directory
2. Check file is named exactly `.env` (not `.env.local` or `env.example`)
3. Restart the backend server after changing `.env`
4. Verify no syntax errors in `.env` file (no spaces around `=`)

## Quick Health Checks

### Backend Health Check
```bash
# Test backend is running
curl http://localhost:8000/health
# Should return: {"status":"healthy"}
```

### Frontend API URL Check
Open browser console and run:
```javascript
console.log('API URL:', process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000');
```

### CORS Check
Open browser DevTools > Network tab:
1. Make a request from frontend
2. Check response headers for `Access-Control-Allow-Origin`
3. Should see: `Access-Control-Allow-Origin: http://localhost:3000`

## Debugging Steps

1. **Check Backend Logs**
   - Look at terminal where `python run.py` is running
   - Check for error messages or stack traces

2. **Check Frontend Console**
   - Open browser DevTools (F12)
   - Check Console tab for errors
   - Check Network tab for failed requests

3. **Test API Directly**
   - Use browser to visit `http://localhost:8000/api/team`
   - Use Swagger UI at `http://localhost:8000/docs`
   - Use curl or Postman

4. **Verify Environment Variables**
   ```bash
   # Backend
   cd backend
   python -c "from app.core.config import settings; print('CORS:', settings.get_cors_origins())"
   ```

5. **Check Database Connection**
   ```bash
   # Test PostgreSQL connection
   psql -h localhost -U postgres -d inspired_analyst
   ```

## Still Having Issues?

1. Check that both servers are running:
   - Backend: `http://localhost:8000`
   - Frontend: `http://localhost:3000`

2. Verify firewall isn't blocking connections

3. Check if antivirus is interfering

4. Try accessing API directly in browser to rule out CORS

5. Check backend logs for detailed error messages

