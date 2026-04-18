# PWA & Offline Skill (`/pwa-offline`)

**Purpose**: Progressive Web App capabilities and offline support.

## PWA Components

### 1. Manifest
File: `public/manifest.json`
- App name, icon, colors
- Start URL: `/dashboard`
- Icons: 72px, 192px, 512px
- Display: standalone

### 2. Service Worker
File: `public/sw.js`
Strategies:
- **Cache-first**: Static assets (JS, CSS, icons)
- **Network-first**: API responses
- **Stale-while-revalidate**: User-specific data

### 3. Registration
File: `src/components/pwa/service-worker-registration.tsx`

```typescript
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/sw.js");
}
```

### 4. Offline Fallback
File: `public/offline.html`
- Friendly message when offline
- Linked from service worker 404 handling

## Service Worker Strategies

### Cache First
```javascript
// Static assets
const response = await caches.match(request);
if (response) return response;
return fetch(request);
```

### Network First
```javascript
// API calls
try {
  return await fetch(request);
} catch {
  return await caches.match(request);
}
```

### Stale While Revalidate
```javascript
// User data
const cached = await caches.match(request);
const fresh = fetch(request).then(r => {
  caches.open('dynamic').then(c => c.put(request, r));
  return r;
});
return cached || fresh;
```

## Offline Features

### Available Offline
- View previously loaded data
- View offline page
- See last sync time

### Requires Connection
- Create new application
- Upload documents
- Make payments
- Real-time updates

## Testing Offline

**DevTools**:
1. F12 → Application tab
2. Service Workers section
3. Check "Offline" box
4. Page should still render with cached data

**Testing Connection loss**:
```typescript
// Simulate offline
navigator.onLine = false;

// Test offline page
fetch("/nonexistent").catch(() => {
  // Show offline.html
});
```

## Caching Strategy

```javascript
// Cache versioning
const cacheName = 'v1-2026-04-18';

// On install
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(cacheName).then(cache => {
      return cache.addAll([
        '/',
        '/offline.html',
        '/static/app.js',
        '/static/app.css',
      ]);
    })
  );
});

// On fetch
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  
  e.respondWith(
    caches.match(e.request).then(response => {
      return response || fetch(e.request);
    })
  );
});
```

## PWA Audit

```javascript
// Run in browser console
await navigator.serviceWorker.getRegistrations();
// Should show 1 registration
```

File: Check all 3 exist:
- [ ] public/manifest.json
- [ ] public/sw.js
- [ ] src/components/pwa/service-worker-registration.tsx

