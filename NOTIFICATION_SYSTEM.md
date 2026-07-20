# TeslaPrimeCapital — Real-Time Notification System Specification

---

## 1. Multi-Channel Notification Engine Architecture

The platform includes a real-time notification engine that unifies in-app alerts, transactional emails, and future expansion hooks for SMS and push notifications into a single standardized dispatch service (`NotificationService`).

### 1.1 Channel Routing Taxonomy
When a notification event (`NotificationEvent`) is emitted, the engine evaluates the user's explicit communication preferences stored in `User.notificationPreferences` (`JSONB`) and dispatches across permitted channels:
- **In-App Notification Center:** Always active for critical system alerts (`YIELD_RECEIVED`, `DEPOSIT_CONFIRMED`, `SECURITY_ALERT`). Stored inside the `Notification` database table and streamed immediately to active web sessions via **Server-Sent Events (SSE)** or **WebSocket** connections (`/api/v1/notifications/stream`).
- **Email Channel:** Dispatched to `email-queue` if the user opted in or if the alert category is marked as `MANDATORY_SECURITY` (e.g., password changes, new device login).
- **Push / SMS Hook:** Architecture exposes structured `IFullNotificationHook` interfaces allowing rapid integration with Twilio (SMS) and Firebase Cloud Messaging (FCM/Web Push) during Phase 2/3 expansion.

---

## 2. In-App Alert Bell & Badge Synchronization

To ensure responsive user feedback without overwhelming database read capacity:
1. **Unread Counter Caching:** Every user's unread notification badge count (`unread_count:user_{ID}`) is maintained directly inside **Redis** atomic integer counters (`INCR / DECR`).
2. **Lightweight Polling / SSE Fallback:** When the Next.js dashboard loads, the navbar component fetches the unread count via a lightweight endpoint (`GET /api/v1/notifications/unread-count`, < 5ms response time directly from Redis).
3. **Optimistic UI Mark-as-Read:** When the user clicks "Mark all as read", the frontend optimistically zeroes out the badge counter, while the backend fires an asynchronous batch update query (`UPDATE notifications SET read = true WHERE userId = ID AND read = false`) and resets the Redis counter to `0`.
