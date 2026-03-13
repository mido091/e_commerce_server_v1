# Production Troubleshooting Guide (Vercel)

If you are still seeing 500 errors after applying the fixes, follow this guide to find the root cause.

## 1. How to Check Vercel Logs
1. Open your **Vercel Dashboard**.
2. Select your **Backend Project**.
3. Click on the **Logs** tab in the top navigation.
4. Perform the action that causes the 500 error (e.g., trying to login).
5. Watch the real-time logs. Look for lines starting with `[ERROR]`.
6. Click on the log entry to see the full **Stack Trace**.

## 2. Common Causes Checklist

### Database Connectivity
- **SSL**: Most cloud databases (Aiven, PlanetScale, DigitalOcean) **require** SSL. I have added `ssl: { rejectUnauthorized: false }` to `db.js`.
- **Whitelisting**: Ensure Vercel's IP addresses can access your database. If using Aiven/AWS, you might need to allow `0.0.0.0/0` if you can't whitelist Vercel dynamic IPs.
- **Env Vars**: Double-check `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, and `DB_PORT` in Vercel Settings.

### JWT & Secrets
- **JWT_SECRET**: Ensure this is set in Vercel. If it's missing, `jwt.sign` will fail silently or throw a 500.
- **NODE_ENV**: Make sure it's set to `production` in Vercel.

### Bcrypt Version
- **bcrypt vs. bcryptjs**: If your local environment uses `bcrypt` but Vercel fails to build it, use `bcryptjs` (which I see is already in your `package.json`).

## 3. Interpreting Error Codes
- `PROTOCOL_CONNECTION_LOST`: Database closed the connection.
- `ER_ACCESS_DENIED_ERROR`: Wrong username or password.
- `ETIMEDOUT`: Server couldn't reach the database (likely firewall/IP whitelist issue).
- `ECONNREFUSED`: Database is down or port is wrong.
