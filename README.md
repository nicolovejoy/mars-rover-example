# Mars Rover Photo Browser

Browse raw photos from NASA's Perseverance rover on Mars. Select a sol (mission day), filter by camera, and flip through images beamed back from the surface.

**Live:** https://mars-rover-example.pages.dev

## How it works

The app pulls images from [NASA's raw image feed](https://mars.nasa.gov/rss/api/) for the Mars 2020 (Perseverance) mission. No API key required. Photos are cached in localStorage for 5 minutes to keep things snappy.

## Tech

- [Svelte 4](https://svelte.dev) — UI framework
- [Vite](https://vitejs.dev) — build tool
- [Cloudflare Pages](https://pages.cloudflare.com) — hosting
- NASA Mars 2020 RSS API — data source

## Run locally

```
npm install
npm run dev
```

## Deploy

```
npm run build
wrangler pages deploy dist --project-name mars-rover-example
```
