# Knotxme — Full-Stack Platform

Knotxme connects brands that need creators with creators who need brands. This
repo contains the **original Knotxme frontend design, unchanged**, now wired
up to a real backend: authentication, role-based dashboards, a database, and
an admin panel.

The public marketing site (Home, About, Platform Overview, Results, Contact)
works exactly as it did before — same layout, colors, type, animations. What's
new is everything *behind* the "Login" and "Sign Up" buttons in the header.

---

## What's in here

```
knotxme/
├── frontend/public/        Static site — deploy this to Netlify
│   ├── index.html           Original marketing site (untouched design)
│   ├── login.html            Brand / Creator login
│   ├── signup.html           Brand / Creator signup
│   ├── forgot-password.html
│   ├── reset-password.html
│   ├── admin-login.html      Separate admin login
│   ├── brand-dashboard.html
│   ├── creator-dashboard.html
│   ├── admin-dashboard.html
│   ├── css/style.css         All original styles (extracted, unchanged) + additive dashboard/auth styles
│   └── js/                   Original site scripts (extracted, unchanged) + new API/auth scripts
│
├── backend/                 Node/Express API — deploy this to Render (or similar)
│   ├── server.js
│   ├── config/db.js          MongoDB connection
│   ├── models/               Login, BrandProfile, CreatorProfile, CampaignRequirement
│   ├── controllers/          Business logic per role
│   ├── routes/                API routes per role
│   ├── middleware/            JWT auth, role-based access control, error handling
│   ├── utils/                 Excel export, email sending
│   ├── seed/createAdmin.js    Script to create your first admin account
│   └── .env.example
│
├── render.yaml               One-click backend deploy config for Render
├── netlify.toml               Frontend deploy config for Netlify
└── DEPLOYMENT.md              Step-by-step guide to go live
```

---

## How it works

### Public vs. private

- **Public, no login required:** Home, About, Platform Overview, Results, Contact
  (all inside `index.html`, exactly as before).
- **Requires login:** everything else — brand dashboard, creator dashboard, admin panel.

### Roles

There are three account types, each with separate login: **Creator**, **Brand**,
and **Admin** (admin accounts are never created through public signup — see
"Creating your first admin" below).

### Privacy by design

- Brands never see a directory of all creators — only campaign-matched opportunities are shown to creators, and only after a brand posts a requirement.
- Creators never see a directory of all brands.
- The public site never exposes any creator or brand's private data.

### Database structure

Four separate collections, matching the original spec exactly:

1. **Login** — email, hashed password, role, account status, timestamps only. No profile data.
2. **BrandProfile** — company info, socials, requirement history.
3. **CreatorProfile** — creator info, niche, followers, campaign history.
4. **CampaignRequirement** — one new record per requirement a brand submits. Nothing is ever overwritten, so brands never lose previous submissions.

---

## Running it locally

You'll need [Node.js 18+](https://nodejs.org) and either a local MongoDB instance
or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster.

```bash
# 1. Install backend dependencies
cd backend
npm install

# 2. Configure environment variables
cp .env.example .env
# then open .env and fill in MONGO_URI and JWT_SECRET at minimum

# 3. Start the backend (http://localhost:5000)
npm run dev

# 4. In a separate terminal, create your first admin account
npm run create-admin
```

Then serve the frontend as static files. From the project root:

```bash
npx http-server frontend/public -p 8080 -c-1
```

Open `http://localhost:8080` in your browser. The site works exactly like
before — click **Sign Up** to create a brand or creator account, or go to
`http://localhost:8080/admin-login.html` to log in with the admin account you
just created.

> Tip: from the project root you can also run `npm run dev` (after `npm
> install` at the root) to start both the backend and a static frontend
> server together, using `concurrently`.

---

## Deploying it live

See **[DEPLOYMENT.md](./DEPLOYMENT.md)** for the full step-by-step guide to
putting this on GitHub, hosting the backend + database, and publishing the
frontend on Netlify.

---

## Security notes

- Passwords are hashed with **bcrypt** (12 rounds) — never stored in plain text.
- Sessions use **JWT** tokens, sent as `Authorization: Bearer <token>`.
- All dashboard and admin routes are protected by middleware that checks both
  authentication (`authMiddleware.js`) and role (`roleMiddleware.js`).
- Login attempts and password-reset requests are rate-limited.
- All secrets (DB connection string, JWT secret, email credentials) live in
  `.env`, which is git-ignored and must never be committed.

## Support / next steps

This is a working MVP of the full spec. Natural next additions once you're
live: campaign messaging between a brand and the creator who accepted their
requirement, file uploads for creator portfolios, and email notifications
when a requirement is accepted (the email utility in `backend/utils/sendEmail.js`
is already wired up for this — just add your SMTP credentials).
