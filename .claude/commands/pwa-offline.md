# PWA Offline — OBPS Progressive Web App Management

## Purpose

Manage the PWA capabilities of the Online Business Permit System — service worker, caching strategies, offline page, install prompt, and manifest configuration.

## Usage

```
/pwa-offline <task-or-issue>
```

## PWA Architecture

```
public/
├── manifest.json          # PWA manifest (name, icons, display)
├── sw.js                  # Service worker (cache strategies)
├── offline.html           # Offline fallback page
└── icons/                 # App icons (72-512px)
    ├── icon-72x72.png
    ├── icon-96x96.png
    ├── icon-128x128.png
    ├── icon-144x144.png
    ├── icon-152x152.png
    ├── icon-192x192.png
    ├── icon-384x384.png
    └── icon-512x512.png

src/
├── components/pwa/        # PWA install prompt component
└── app/layout.tsx         # <link rel="manifest"> registration
```

## Service Worker (`public/sw.js`)

### Caching Strategy

| Resource                        | Strategy               | Description                            |
| ------------------------------- | ---------------------- | -------------------------------------- |
| Static assets (CSS, JS, images) | Cache First            | Serve from cache, update in background |
| API responses                   | Network First          | Try network, fall back to cache        |
| HTML pages                      | Stale While Revalidate | Serve cached, update from network      |
| Offline page                    | Precache               | Always available                       |

### Key Implementation

```javascript
// Cache name versioning
const CACHE_NAME = "obps-v1";
const OFFLINE_URL = "/offline.html";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([OFFLINE_URL, "/icons/icon-192x192.png"]);
    }),
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(OFFLINE_URL)),
    );
  }
});
```

## Manifest Configuration

```json
{
  "name": "Online Business Permit System",
  "short_name": "OBPS",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#0070f3",
  "icons": [...]
}
```

## Install Prompt

- Component: `src/components/pwa/install-prompt.tsx`
- Listens for `beforeinstallprompt` event
- Shows custom UI banner when installable
- Tracks installation via analytics

## Icon Generation

```bash
# Generate all icon sizes from a source image
node scripts/generate-icons.js
```

## Offline Capabilities

| Feature                                | Offline Support                  |
| -------------------------------------- | -------------------------------- |
| View cached applications               | ✅ (if previously loaded)        |
| Submit new application                 | ❌ (requires server)             |
| Track status                           | ❌ (real-time, requires network) |
| View static pages (FAQs, Requirements) | ✅ (if cached)                   |
| Login                                  | ❌ (requires auth server)        |

## Testing PWA

1. **Chrome DevTools** → Application tab → Service Workers
2. **Lighthouse** → PWA audit
3. **Network tab** → Offline mode checkbox
4. **Application tab** → Manifest validation

## Checklist

- [ ] `manifest.json` has all required fields
- [ ] Service worker registered in layout
- [ ] `offline.html` exists and displays helpful message
- [ ] All icon sizes generated (72 to 512px)
- [ ] Cache versioning implemented (bump on deploy)
- [ ] Old caches cleaned up on activate event
- [ ] Install prompt shown to returning visitors
- [ ] Lighthouse PWA score > 90
