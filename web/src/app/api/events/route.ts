/**
 * Server-Sent Events API Endpoint
 * Streams real-time updates to connected clients
 */

import { auth } from '@/lib/auth';
import { sseBroadcaster, formatSSEMessage, createSSEEvent } from '@/lib/sse';
import type { SSEEvent } from '@/lib/sse';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return new Response('Unauthorized', { status: 401 });
  }

  const userId = session.user.id;
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // Send initial connection event
      const connectEvent = createSSEEvent('heartbeat', {
        message: 'Connected to real-time updates',
        clientCount: sseBroadcaster.getClientCount() + 1,
      }, userId);
      controller.enqueue(encoder.encode(formatSSEMessage(connectEvent)));

      // Register SSE listener for this user
      const unsubscribe = sseBroadcaster.subscribe(userId, (event: SSEEvent) => {
        try {
          controller.enqueue(encoder.encode(formatSSEMessage(event)));
        } catch {
          // Client disconnected
          unsubscribe();
        }
      });

      // Heartbeat every 30 seconds to keep connection alive
      const heartbeat = setInterval(() => {
        try {
          const hbEvent = createSSEEvent('heartbeat', { timestamp: Date.now() }, userId);
          controller.enqueue(encoder.encode(formatSSEMessage(hbEvent)));
        } catch {
          clearInterval(heartbeat);
          unsubscribe();
        }
      }, 30_000);

      // Cleanup on close
      const cleanup = () => {
        clearInterval(heartbeat);
        unsubscribe();
      };

      // Handle abort signal if available
      if (typeof AbortController !== 'undefined') {
        const ac = new AbortController();
        ac.signal.addEventListener('abort', cleanup);
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no', // Disable Nginx buffering
    },
  });
}
