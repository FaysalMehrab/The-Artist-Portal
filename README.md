# 🌟 ModelHub — Investor Demo

A production-grade model hiring platform built with Next.js 14 + Supabase + Vercel.

---

## ⚡ Setup in 4 Steps

### Step 1 — Install dependencies

```bash
npm install
```

---

### Step 2 — Setup Supabase

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Click **"New Project"** → name it `model-platform`
3. Wait ~2 minutes for it to initialize
4. Go to **SQL Editor** → paste the entire contents of `supabase-setup.sql` → click **Run**
5. Go to **Settings → API** and copy:
   - `Project URL`
   - `anon public` key

---

### Step 3 — Configure environment variables

```bash
cp .env.example .env.local
```

Then open `.env.local` and fill in your values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

---

### Step 4 — Run the app

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) 🎉

---

## 🚀 Deploy to Vercel (Make it Live)

1. Push this folder to a **GitHub repo**
2. Go to [vercel.com](https://vercel.com) → **New Project** → Import your repo
3. Add environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Click **Deploy** → done! You get a live URL in ~2 minutes

---

## 📁 Project Structure

```
model-platform/
├── app/
│   ├── page.tsx              ← Homepage (hero, stats, features)
│   ├── models/
│   │   ├── page.tsx          ← Models listing (server)
│   │   └── ModelsClient.tsx  ← Search + filter (client)
│   ├── jobs/
│   │   ├── page.tsx          ← Jobs listing (server)
│   │   ├── JobsClient.tsx    ← Filters + apply modal (client)
│   │   └── post/page.tsx     ← Post a job form
│   ├── register/page.tsx     ← Register (model or agency)
│   ├── layout.tsx            ← Root layout + navbar
│   └── globals.css           ← Global styles
├── components/
│   ├── layout/Navbar.tsx     ← Navigation
│   └── ui/
│       ├── Button.tsx
│       ├── Input.tsx
│       ├── Toast.tsx
│       └── StatsCounter.tsx  ← Animated counters
├── lib/
│   ├── supabase.ts           ← Supabase client
│   ├── db.ts                 ← Database helper functions
│   └── utils.ts              ← cn(), timeAgo()
├── types/index.ts            ← TypeScript types
├── supabase-setup.sql        ← Run this in Supabase SQL editor
└── .env.example              ← Copy to .env.local
```

---

## 🧩 Features

| Feature | Status |
|---|---|
| Homepage with hero & animated stats | ✅ |
| Model profiles grid with search & filters | ✅ |
| Job listings with sidebar filters | ✅ |
| Apply to jobs (saves to Supabase) | ✅ |
| Post a job (saves to Supabase) | ✅ |
| Register as Model (saves to Supabase) | ✅ |
| Register as Agency | ✅ |
| Fully responsive design | ✅ |
| Dark luxury aesthetic | ✅ |

---

## 🔮 Next Steps (After Investor Demo)

- Add Supabase Auth (email/password login)
- Model photo uploads (Supabase Storage)
- Agency dashboard to manage applications
- Stripe Connect for payments
- Model public profile pages (`/models/[id]`)
