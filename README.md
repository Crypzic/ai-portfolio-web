# Isaac | AI Video Creator — Portfolio

Plain HTML/CSS/JS, no build step. Open `index.html` or upload the folder to any static host.

## Before going live

1. **Your clips** — just upload files with these exact names. No code changes needed; any slot
   without a file shows its coloured placeholder until you add it.

   | Where it shows | File |
   |---|---|
   | Hero background | `assets/videos/hero.mp4` |
   | Carousel: Product Ads | `assets/videos/product-ads.mp4` |
   | Carousel: Fashion | `assets/videos/fashion.mp4` |
   | Carousel: Automotive | `assets/videos/automotive.mp4` |
   | Carousel: Real Estate | `assets/videos/real-estate.mp4` |
   | Carousel: Skincare | `assets/videos/skincare.mp4` |
   | Carousel: UGC / Creators | `assets/videos/ugc.mp4` |
   | Carousel: Social Content | `assets/videos/social.mp4` |
   | "Built to perform" TikTok phone (9:16) | `assets/videos/tiktok.mp4` (uses `ugc.mp4` until added) |
   | "Built to perform" Reels phone (9:16) | `assets/videos/reels.mp4` (uses `fashion.mp4` until added) |
   | "Built to perform" YouTube phone (**16:9**) | `assets/videos/youtube.mp4` |
   | "Built to perform" X phone (**16:9**) | `assets/videos/x.mp4` |

   - Names are **lowercase** and must match exactly (`.mp4`, not `.MP4` or `.mov`).
   - Export as **MP4 (H.264)** with **"Web Optimized" / fast start** on, so playback can begin
     before the whole file downloads. Carousel clips: 720p, aim for **under 3 MB** each.
     Hero: 720p–1080p, **under ~4 MB**, no audio needed.
   - Cards show each clip's opening frame until they reach the centre, then play. No
     separate still images are needed.
   - Longer version for the player (optional): upload `assets/videos/<name>-full.mp4` and add
     `full: true` to that clip's entry in `portfolioItems` in `script.js`.
   - To add or rename categories, edit `portfolioItems` in `script.js`.
2. **Your photo** — `assets/images/isaac.jpg` (used in About and on the pricelists). Replace the file to update it.
3. **Client reviews** — screenshots live in `assets/reviews/` (720px wide .jpg). To add one, drop the file
   there and copy one of the `<figure class="review-card">` blocks in the `#reviews` section of `index.html`.
4. **Your domain** — link previews use `https://ai-skill-website.vercel.app`. If you move to another
   domain, replace it in `index.html` and both pricelist pages.
5. **Analytics** — Google Analytics 4 is on (`G-MJGEMBM6V5`, set in `window.GA_MEASUREMENT_ID` in
   `index.html` and both pricelist pages). Tracked events: `clip_open`, `whatsapp_click`,
   `social_click`, `hero_cta`, and on the pricelists `package_select`.

## Admin dashboard (`/admin`)

Your own stats page: visitors, page views, WhatsApp clicks per button, clips opened, hero
buttons, pricelist package picks, traffic sources, countries, devices, a 30-day chart and a
live activity feed. Runs free on Vercel Hobby + Upstash Redis.

**One-time setup in Vercel:**

1. Project → **Storage** → **Create Database** → **Upstash** (Redis), free plan → connect it to
   this project. This adds the `KV_REST_API_URL` / `KV_REST_API_TOKEN` variables automatically.
2. Project → **Settings → Environment Variables** → add `ADMIN_PASSWORD` with a long password.
3. **Redeploy** (Deployments → ⋯ → Redeploy) so the new variables take effect.

Then open `/admin` and log in. On each phone/laptop you check the site from, tick
**"Don't count my own visits on this device"** so you don't inflate your numbers.

- Tag links you share to see them as a source: `https://ai-skill-website.vercel.app/?ref=instagram_bio`.
- Stats are kept for 40 days. Days are counted in Lagos time.
- GA4 keeps running alongside it. Both get the same events from `trackEvent` in `script.js`
  and `assets/pricing/pricing.js`; the dashboard side lives in `assets/track.js` and `api/`.

## Pricelists (unlisted)

Two hidden pages — nothing on the site links to them and search engines are told not to list
them (`noindex` meta tag + `X-Robots-Tag` header in `vercel.json`). Send the link directly:

- Naira: `/ngn-price`
- Dollars: `/usd-price`

To change prices or packages, edit the `window.PRICELIST` block at the bottom of each page
(`amount` sets the price shown on the card; `message` is the WhatsApp text). Shared styles and
behaviour live in `assets/pricing/`. To retire a link (e.g. after a price change), rename the folder.
