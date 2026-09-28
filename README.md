# Isaac D | AI Creator — Portfolio

Plain HTML/CSS/JS, no build step. Open `index.html` or upload the folder to any static host.

## Before going live

1. **Your clips** — just upload files with these exact names. No code changes needed; any slot
   without a file shows its coloured placeholder until you add it.

   | Where it shows | Video (required) | Still image (optional) |
   |---|---|---|
   | Hero background | `assets/videos/hero.mp4` | `assets/posters/hero.jpg` |
   | Carousel: Product Ads | `assets/videos/product-ads.mp4` | `assets/posters/product-ads.jpg` |
   | Carousel: Fashion | `assets/videos/fashion.mp4` | `assets/posters/fashion.jpg` |
   | Carousel: Automotive | `assets/videos/automotive.mp4` | `assets/posters/automotive.jpg` |
   | Carousel: Real Estate | `assets/videos/real-estate.mp4` | `assets/posters/real-estate.jpg` |
   | Carousel: Skincare | `assets/videos/skincare.mp4` | `assets/posters/skincare.jpg` |
   | Carousel: UGC / Creators (also plays in the "Built to perform" phone) | `assets/videos/ugc.mp4` | `assets/posters/ugc.jpg` |
   | Carousel: Social Content | `assets/videos/social.mp4` | `assets/posters/social.jpg` |

   - Names are **lowercase** and must match exactly (`.mp4`, not `.MP4` or `.mov`).
   - Export as **MP4 (H.264 + AAC)**. Carousel teasers: 720p, 5–8 s, aim for **under 3 MB** each.
     Hero: 1080p, under ~6 MB, no audio needed.
   - Still images: JPG, ~600px wide (the first frame of the clip works well).
   - Longer version for the player (optional): upload `assets/videos/<name>-full.mp4` and add
     `full: true` to that clip's entry in `portfolioItems` in `script.js`.
   - To add or rename categories, edit `portfolioItems` in `script.js`.
2. **Your photo** — `assets/images/isaac.jpg` (used in About and on the pricelists). Replace the file to update it.
3. **Your domain** — link previews use `https://ai-portfolio-web-ashy.vercel.app`. If you move to your own
   domain, replace it in `index.html` and both pricelist pages.
4. **Analytics** — create a free Google Analytics 4 property, then paste the Measurement ID
   (`G-XXXXXXXXXX`) into `window.GA_MEASUREMENT_ID` in `index.html`. Tracked events:
   `clip_open`, `whatsapp_click`, `social_click`, `hero_cta`.

## Pricelists (unlisted)

Two hidden pages — nothing on the site links to them and search engines are told not to list
them (`noindex` meta tag + `X-Robots-Tag` header in `vercel.json`). Send the link directly:

- Naira: `/ngn-price`
- Dollars: `/usd-price`

To change prices or packages, edit the `window.PRICELIST` block at the bottom of each page
(`amount` sets the price shown on the card; `message` is the WhatsApp text). Shared styles and
behaviour live in `assets/pricing/`. To retire a link (e.g. after a price change), rename the folder.
