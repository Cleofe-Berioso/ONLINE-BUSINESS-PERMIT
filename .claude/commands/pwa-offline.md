# PWA & Offline Resilience Skill

You are a Progressive Web App and offline resilience specialist for the HoardNest marketplace platform. When invoked, implement or audit PWA capabilities including service workers, caching strategies, offline detection, background sync, and install prompts.

## Context

| Aspect             | Details                                                                            |
| ------------------ | ---------------------------------------------------------------------------------- |
| **Build**          | Create React App (CRA) with custom service worker                                  |
| **PWA Manager**    | `src/utils/pwaManager.ts` (373 lines, PWAManager class)                            |
| **Service Worker** | `public/sw.js` (custom, not CRA default)                                           |
| **Manifest**       | `public/manifest.json` + `public/manifest-pwa.json`                                |
| **Icons**          | Full icon set in `/public/` (Android, Apple, MS, favicon)                          |
| **API Client**     | Axios via `src/api/client.ts` with base URL                                        |
| **WebSocket**      | Socket.IO with auto-reconnect                                                      |
| **Target**         | Mobile-first marketplace (Silay City, Philippines — potential connectivity issues) |

---

## PWA Components

### Component 1: Service Worker (`public/sw.js`)

**Caching Strategies:**

| Resource Type             | Strategy                      | Cache Name            | Max Age         |
| ------------------------- | ----------------------------- | --------------------- | --------------- |
| App shell (HTML, JS, CSS) | Cache-first, network fallback | `hoardnest-shell-v1`  | Until SW update |
| API responses (GET)       | Network-first, cache fallback | `hoardnest-api-v1`    | 5 minutes       |
| Images                    | Cache-first, network fallback | `hoardnest-images-v1` | 7 days          |
| Fonts/static              | Cache-first                   | `hoardnest-static-v1` | 30 days         |

**Service Worker Template:**

```javascript
const CACHE_NAME = "hoardnest-shell-v1";
const API_CACHE = "hoardnest-api-v1";
const IMAGE_CACHE = "hoardnest-images-v1";

const SHELL_ASSETS = ["/", "/index.html", "/manifest.json", "/logo192.png"];

// Install — cache shell assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_ASSETS)),
  );
  self.skipWaiting();
});

// Activate — clean old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((names) =>
        Promise.all(
          names
            .filter(
              (name) =>
                name !== CACHE_NAME &&
                name !== API_CACHE &&
                name !== IMAGE_CACHE,
            )
            .map((name) => caches.delete(name)),
        ),
      ),
  );
  self.clients.claim();
});

// Fetch — routing strategies
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // API requests: network-first
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(networkFirst(event.request, API_CACHE));
    return;
  }

  // Images: cache-first
  if (event.request.destination === "image") {
    event.respondWith(cacheFirst(event.request, IMAGE_CACHE));
    return;
  }

  // App shell: cache-first
  event.respondWith(cacheFirst(event.request, CACHE_NAME));
});
```

---

### Component 2: PWAManager (`src/utils/pwaManager.ts`)

**Current Capabilities:**

- Service worker registration + update handling
- Install prompt capture (`beforeinstallprompt` event)
- Push notification setup (`PushManager.subscribe`)
- Background sync registration (`SyncManager`)
- Online/offline detection with callbacks
- Custom install banner UI
- Cache management (clear, version)

**Key Methods:**

| Method                     | Purpose                                  |
| -------------------------- | ---------------------------------------- |
| `registerServiceWorker()`  | Register SW with update detection        |
| `setupInstallPrompt()`     | Capture deferred install prompt          |
| `setupOnlineDetection()`   | Monitor `online`/`offline` events        |
| `setupPushNotifications()` | Subscribe to push via SW                 |
| `setupBackgroundSync()`    | Register sync events for offline actions |
| `getInstallationStatus()`  | Check if PWA is installed/installable    |
| `promptInstall()`          | Trigger deferred install prompt          |
| `sendPushNotification()`   | Display push notification via SW         |
| `showInstallBanner()`      | Show custom install UI                   |
| `clearCaches()`            | Clear all SW caches                      |

---

### Component 3: Offline Resilience

**Offline Scenarios for HoardNest:**

| Scenario                | Impact               | Strategy                                    |
| ----------------------- | -------------------- | ------------------------------------------- |
| Browsing marketplace    | Can't load new items | Cache-first for recently viewed items       |
| Viewing own orders      | Can't refresh        | Cache recent orders, show "last updated"    |
| Creating an order       | Can't POST           | Queue in IndexedDB, sync on reconnect       |
| Rider tracking delivery | Can't update status  | Queue status updates, sync on reconnect     |
| Chat/notifications      | No real-time         | Reconnect Socket.IO, show offline indicator |

**Offline Detection Hook:**

```typescript
import { useState, useEffect } from "react";

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return isOnline;
}
```

**Offline Queue Pattern:**

```typescript
interface QueuedAction {
  id: string;
  method: "POST" | "PUT" | "DELETE";
  url: string;
  data: any;
  timestamp: number;
}

class OfflineQueue {
  private readonly STORE_KEY = "hoardnest-offline-queue";

  enqueue(action: Omit<QueuedAction, "id" | "timestamp">): void {
    const queue = this.getQueue();
    queue.push({
      ...action,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
    });
    localStorage.setItem(this.STORE_KEY, JSON.stringify(queue));
  }

  async flush(): Promise<void> {
    const queue = this.getQueue();
    for (const action of queue) {
      try {
        await apiClient.request({
          method: action.method,
          url: action.url,
          data: action.data,
        });
        this.dequeue(action.id);
      } catch {
        break; // Stop on first failure, retry later
      }
    }
  }

  private getQueue(): QueuedAction[] {
    const stored = localStorage.getItem(this.STORE_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  private dequeue(id: string): void {
    const queue = this.getQueue().filter((a) => a.id !== id);
    localStorage.setItem(this.STORE_KEY, JSON.stringify(queue));
  }
}
```

---

### Component 4: Manifest Configuration

**Required fields for HoardNest:**

```json
{
  "name": "HoardNest - Silay City Marketplace",
  "short_name": "HoardNest",
  "description": "Community marketplace for Silay City",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#1976d2",
  "orientation": "any",
  "scope": "/",
  "icons": [
    {
      "src": "/android-icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    { "src": "/logo512.png", "sizes": "512x512", "type": "image/png" }
  ],
  "categories": ["shopping", "lifestyle"],
  "lang": "en-PH"
}
```

---

## Audit Checklist

| Check                                | File                         | Severity |
| ------------------------------------ | ---------------------------- | -------- |
| SW registered on app load            | `pwaManager.ts`              | HIGH     |
| SW handles fetch events              | `public/sw.js`               | HIGH     |
| Manifest has required fields         | `public/manifest.json`       | MEDIUM   |
| Icons at 192x192 and 512x512         | `public/`                    | MEDIUM   |
| `<meta name="theme-color">` in HTML  | `public/index.html`          | LOW      |
| Offline fallback page                | `public/sw.js`               | HIGH     |
| Cache versioning for updates         | `public/sw.js`               | HIGH     |
| Online/offline UI indicator          | `pwaManager.ts` or component | MEDIUM   |
| Background sync for write operations | `pwaManager.ts`              | MEDIUM   |
| Install prompt works                 | `pwaManager.ts`              | MEDIUM   |

---

## Example Use Cases

```
/pwa-offline audit                    # Full PWA audit
/pwa-offline caching                  # Review/update caching strategies
/pwa-offline offline-queue            # Implement offline action queue
/pwa-offline install-prompt           # Fix/improve install UX
/pwa-offline push-notifications       # Configure push notifications
/pwa-offline manifest                 # Verify manifest completeness
```
