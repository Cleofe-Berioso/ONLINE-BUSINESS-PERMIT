/**
 * Server-Sent Events (SSE) for Real-Time Updates
 * Live application status updates and slot availability
 */

// ============================================================================
// SSE Event Types
// ============================================================================

export type SSEEventType =
  | 'application_status_changed'
  | 'document_verified'
  | 'claim_scheduled'
  | 'permit_issued'
  | 'slot_availability_changed'
  | 'notification'
  | 'heartbeat';

export interface SSEEvent {
  type: SSEEventType;
  data: Record<string, unknown>;
  userId?: string;
  timestamp: string;
}

// ============================================================================
// In-Memory Client Registry (production should use Redis Pub/Sub)
// ============================================================================

type ClientCallback = (event: SSEEvent) => void;

class SSEBroadcaster {
  private clients: Map<string, Set<ClientCallback>> = new Map();

  /**
   * Register a client for a specific user
   */
  subscribe(userId: string, callback: ClientCallback): () => void {
    if (!this.clients.has(userId)) {
      this.clients.set(userId, new Set());
    }
    this.clients.get(userId)!.add(callback);

    // Return unsubscribe function
    return () => {
      const userClients = this.clients.get(userId);
      if (userClients) {
        userClients.delete(callback);
        if (userClients.size === 0) {
          this.clients.delete(userId);
        }
      }
    };
  }

  /**
   * Send event to a specific user
   */
  sendToUser(userId: string, event: SSEEvent): void {
    const userClients = this.clients.get(userId);
    if (userClients) {
      userClients.forEach((callback) => callback(event));
    }
  }

  /**
   * Broadcast event to all connected clients
   */
  broadcast(event: SSEEvent): void {
    this.clients.forEach((callbacks) => {
      callbacks.forEach((callback) => callback(event));
    });
  }

  /**
   * Get connected client count
   */
  getClientCount(): number {
    let count = 0;
    this.clients.forEach((callbacks) => {
      count += callbacks.size;
    });
    return count;
  }
}

// Singleton broadcaster
export const sseBroadcaster = new SSEBroadcaster();

// ============================================================================
// Helper: Create SSE Event
// ============================================================================

export function createSSEEvent(
  type: SSEEventType,
  data: Record<string, unknown>,
  userId?: string
): SSEEvent {
  return {
    type,
    data,
    userId,
    timestamp: new Date().toISOString(),
  };
}

// ============================================================================
// Helper: Format SSE Message
// ============================================================================

export function formatSSEMessage(event: SSEEvent): string {
  return `event: ${event.type}\ndata: ${JSON.stringify(event)}\n\n`;
}

// ============================================================================
// High-Level Broadcast Functions
// ============================================================================

export function broadcastApplicationStatusChange(
  userId: string,
  applicationId: string,
  applicationNumber: string,
  newStatus: string,
  previousStatus?: string
): void {
  sseBroadcaster.sendToUser(
    userId,
    createSSEEvent('application_status_changed', {
      applicationId,
      applicationNumber,
      newStatus,
      previousStatus,
    }, userId)
  );
}

export function broadcastDocumentVerified(
  userId: string,
  documentId: string,
  documentName: string,
  status: string
): void {
  sseBroadcaster.sendToUser(
    userId,
    createSSEEvent('document_verified', {
      documentId,
      documentName,
      status,
    }, userId)
  );
}

export function broadcastSlotAvailabilityChange(
  scheduleDate: string,
  timeSlotId: string,
  remainingSlots: number
): void {
  sseBroadcaster.broadcast(
    createSSEEvent('slot_availability_changed', {
      scheduleDate,
      timeSlotId,
      remainingSlots,
    })
  );
}

export function broadcastNotification(
  userId: string,
  title: string,
  message: string,
  actionUrl?: string
): void {
  sseBroadcaster.sendToUser(
    userId,
    createSSEEvent('notification', {
      title,
      message,
      actionUrl,
    }, userId)
  );
}
