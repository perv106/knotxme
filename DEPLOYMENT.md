# Deployment Guide

This guide takes you from this folder on your computer to a live, working
platform. There are three pieces to deploy:

1. **Database** — MongoDB Atlas (free tier)
2. **Backend API** — Render (free tier) — *Netlify cannot run this*
3. **Frontend** — Netlify (free tier)

> ⚠️ **Important:** Netlify only hosts static files (HTML/CSS/JS) — it cannot
> run a persistent Node/Express server. That's why the backend goes to Render
> instead. This is normal for full-stack apps: static frontend on Netlify,
> API on a Node-friendly host, database on Atlas. Everything is still free at
> this scale.

---

## Part 1 — Push the project to GitHub

1. Create a new, empty repository on GitHub (don't initialize it with a README).
2. From the project's root folder on your computer:

```bash
cd knotxme
git init
git add .
git commit -m "Initial commit — Knotxme full-stack platform"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO.git
git push -u origin main
```

`.env` files are already listed in `.gitignore`, so your secrets won't be
pushed. Good — never commit real credentials.

---

## Part 2 — Set up the database (MongoDB Atlas)

1. Go to [mongodb.com/atlas](https://www.mongodb.com/atlas) and create a free account.
2. Create a new **free (M0) cluster**.
3. Under **Database Access**, create a database user with a username and password (save these).
4. Under **Network Access**, click **Add IP Address** → **Allow Access From Anywhere** (`0.0.0.0/0`). This is required since Render's servers have dynamic IPs.
5. Click **Connect** on your cluster → **Drivers** → copy the connection string. It looks like:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/knotxme?retryWrites=true&w=majority
   ```
6. Replace `<username>` and `<password>` with the credentials from step 3, and make sure the database name (`knotxme` above) is included in the path. Save this full string — you'll need it in the next step.

---

## Part 3 — Deploy the backend (Render)

1. Go to [render.com](https://render.com) and sign up / log in with GitHub.
2. Click **New +** → **Blueprint**, and select your GitHub repo. Render will
   detect the included `render.yaml` and pre-fill a service called
   `knotxme-backend`.
   - If you'd rather set it up manually: **New +** → **Web Service** → select
     your repo → set **Root Directory** to `backend` → **Build Command**:
     `npm install` → **Start Command**: `npm start`.
3. Under **Environment**, add these variables (Render will prompt for the
   ones marked `sync: false` in `render.yaml`):
   | Key | Value |
   |---|---|
   | `MONGO_URI` | the Atlas connection string from Part 2 |
   | `JWT_SECRET` | any long random string (Render can auto-generate this) |
   | `JWT_EXPIRES_IN` | `7d` |
   | `FRONTEND_URL` | your Netlify URL — you can fill this in after Part 4, then redeploy |
   | `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` | optional — leave blank to have password-reset emails log to the server console instead of sending real emails |
4. Click **Create Web Service**. Wait for the build to finish, then copy your
   live backend URL, e.g. `https://knotxme-backend.onrender.com`.
5. Test it by visiting `https://knotxme-backend.onrender.com/api/health` in
   your browser — you should see `{"status":"ok", ...}`.

> Render's free tier spins down after inactivity, so the first request after
> a quiet period can take ~30 seconds to wake up. This is normal on the free
> plan.

### Create your first admin account

Render's free tier doesn't give you an interactive shell, so the easiest way
to run the admin-creation script is from your own computer, pointed at your
live database:

```bash
cd backend
# temporarily set MONGO_URI in your local .env to the Atlas connection string
npm run create-admin
```

Follow the prompts to set an admin email and password. You can now log in at
`your-site.netlify.app/admin-login.html` once the frontend is live.

---

## Part 4 — Deploy the frontend (Netlify)

1. Open `frontend/public/js/config.js` in your code editor and replace the
   placeholder URL with your real backend URL from Part 3:

   ```js
   return "https://knotxme-backend.onrender.com/api";
   ```

   Commit and push this change:
   ```bash
   git add frontend/public/js/config.js
   git commit -m "Point frontend at live backend"
   git push
   ```

2. Go to [netlify.com](https://netlify.com) and sign up / log in with GitHub.
3. Click **Add new site** → **Import an existing project** → choose your GitHub repo.
4. Netlify should auto-detect the settings from `netlify.toml`:
   - **Base directory:** `frontend/public`
   - **Publish directory:** `.` (relative to base)
   - **Build command:** *(leave blank — this is a static site, no build step needed)*
5. Click **Deploy site**. Netlify will give you a URL like
   `https://random-name-12345.netlify.app`. You can rename this under
   **Site settings → Change site name**, or attach a custom domain there too.

---

## Part 5 — Connect the two (CORS)

Your backend only accepts requests from the `FRONTEND_URL` you configured in
Part 3. Now that you have your real Netlify URL:

1. Go back to your Render service → **Environment**.
2. Update `FRONTEND_URL` to your Netlify URL (e.g. `https://knotxme.netlify.app`).
3. Save — Render will automatically redeploy the backend with the new setting.

---

## You're live 🎉

- Public site: `https://your-site.netlify.app`
- Brand/Creator login: `https://your-site.netlify.app/login.html`
- Admin login: `https://your-site.netlify.app/admin-login.html`
- Backend health check: `https://your-backend.onrender.com/api/health`

### Updating the site later

Any time you push a change to `main` on GitHub, both Netlify and Render will
automatically rebuild and redeploy — no manual steps needed.

### Troubleshooting

| Symptom | Likely cause |
|---|---|
| Login/signup does nothing, console shows a CORS error | `FRONTEND_URL` on Render doesn't match your real Netlify URL exactly (check for trailing slashes) |
| "Network error" on every API call | `config.js` still points at `localhost` or the wrong Render URL |
| First request after a while is very slow | Normal — Render's free tier sleeps after inactivity |
| Password reset emails never arrive | You haven't set `SMTP_*` variables — check the Render service logs, the email content is printed there instead |
| Admin login says invalid credentials | You haven't run `npm run create-admin` against your live database yet |
