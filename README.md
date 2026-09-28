# Isaac D | AI Creator — Portfolio

Plain HTML/CSS/JS, no build step. Open `index.html` or upload the folder to any static host.

## Before going live

1. **Your clips** — put them in `assets/videos/` and update the `portfolioItems` list at the
   top of the portfolio section in `script.js`:
   ```js
   { label: 'Product Ads', color1: '#8d6bff', color2: '#2c1f5c',
     src: 'assets/videos/product-ads.mp4',
     poster: 'assets/posters/product-ads.jpg' },
   ```
   - Export as **MP4 (H.264 + AAC)**. Carousel teasers: 720p, 5–8 s, aim for **under 3 MB** each.
   - `poster` is a still frame (JPG, ~600px wide). It's shown before a clip loads.
   - Optional `full: 'assets/videos/product-ads-full.mp4'` plays a longer/sharper version
     when someone taps the clip. Without it, the teaser plays.
   - Hero video: set the `src` of `#hero-video` in `index.html` (1080p, under ~6 MB, no audio needed).
2. **Your photo** — `assets/images/isaac.jpg` (used in About and on the pricelists). Replace the file to update it.
3. **Your domain** — link previews use `https://ai-portfolio-web-ashy.vercel.app`. If you move to your own
   domain, replace it in `index.html` and both pricelist pages.
4. **Analytics** — create a free Google Analytics 4 property, then paste the Measurement ID
   (`G-XXXXXXXXXX`) into `window.GA_MEASUREMENT_ID` in `index.html`. Tracked events:
   `clip_open`, `whatsapp_click`, `social_click`, `hero_cta`.

## Pricelists (unlisted)

Two hidden pages — nothing on the site links to them and search engines are told not to list
them (`noindex` meta tag + `X-Robots-Tag` header in `vercel.json`). Send the link directly:

- Naira: `/rates-ngn-39gpn4/`
- Dollars: `/rates-usd-aqdkhs/`

To change prices or packages, edit the `window.PRICELIST` block at the bottom of each page
(`amount` sets the price shown on the card; `message` is the WhatsApp text). Shared styles and
behaviour live in `assets/pricing/`. To retire a link (e.g. after a price change), rename the folder.
