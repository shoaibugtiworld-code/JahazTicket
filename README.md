# Jahaz Ticket

Flight search + markup-transparent pricing — Next.js + Duffel API + Supabase (guest/login).

## Setup (GitHub web editor + Vercel)

1. Yeh sab files apne GitHub repo mein daalein (root mein), commit karein.
2. Vercel Dashboard → Project → **Settings → Environment Variables** mein yeh add karein:
   - `DUFFEL_API_KEY` — Duffel dashboard se test/live key
   - `MARKUP_PERCENT` — `10` (ya jo % chahein)
   - `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase anon/public key
3. Vercel khud build/deploy kar dega (Next.js auto-detect ho jaata hai).
4. Deploy hone ke baad `/login` page pehle khulega — Guest ya Email login.

## Kaise kaam karta hai

- `pages/index.js` — Flights Search UI (aapke screenshot jaisa).
- `pages/api/flights/search.js` — Duffel ko call karta hai, phir server-side har price par `MARKUP_PERCENT` add karta hai. Frontend ko sirf final price milta hai, base price kabhi nahi bheja jata.
- `pages/login.js` — Guest session (localStorage) ya Supabase magic-link email login.

## Agla qadam

- Booking/payment flow abhi shamil nahi — pehle search + markup test karein.
- Jab real ticket issue karna ho, Duffel ka booking/payment API alag se integrate hoga (yeh agla step hai).
- Local Pakistani airlines (AirBlue, SereneAir, AirSial) Duffel list mein hain ya nahi — yeh confirm karna zaroori hai, sab shamil nahi hoteen.
