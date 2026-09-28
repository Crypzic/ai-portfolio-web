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
2. **Your photo** — save as `assets/images/isaac.jpg`. Until then, an "ID" placeholder shows.
3. **Your domain** — in `index.html`, replace every `https://YOUR-DOMAIN.com` with your live URL
   so link previews on WhatsApp/Instagram show `assets/og-image.jpg`.
4. **Analytics** — create a free Google Analytics 4 property, then paste the Measurement ID
   (`G-XXXXXXXXXX`) into `window.GA_MEASUREMENT_ID` in `index.html`. Tracked events:
   `clip_open`, `whatsapp_click`, `social_click`, `hero_cta`.
