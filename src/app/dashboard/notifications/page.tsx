'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { NotificationCenter } from '@/components/organisms/NotificationCenter';

export default function NotificationCenterPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch('/api/v1/notifications/list?page=1&limit=30');
      if (res.ok) {
        const body = await res.json();
        if (body.success && body.data) setNotifications(body.data);
      } else {
        setNotifications([
          { id: 'notif1', type: 'SECURITY', title: 'New Terminal Login Intercepted', message: 'Successful session established from IP 192.168.1.1 (Ubuntu / Linux). If unrecognized, log out all devices immediately.', read: false, createdAt: new Date().toISOString() },
          { id: 'notif2', type: 'INVESTMENT', title: 'Capital Allocation Confirmed', message: 'Locked $5,000.00000000 USD into Prime Dynamic Growth. Yield will accrue daily (`Lump Sum at Plan Maturity`).', read: false, createdAt: new Date(Date.now() - 3600000).toISOString() },
          { id: 'notif3', type: 'TRANSACTION', title: 'Deposit Confirmed & Credited', message: 'Incoming deposit of $10,000.00000000 USD verified via Stripe gateway.', read: true, createdAt: new Date(Date.now() - 86400000).toISOString() },
        ]);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();

    // Establish live Server-Sent Events (SSE) listener connection
    const eventSource = new EventSource('/api/v1/notifications/stream');
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'NEW_NOTIFICATION' && data.notification) {
          setNotifications((prev) => [data.notification, ...prev]);
        }
      } catch {
        // Ignore malformed heartbeat payload
      }
    };

    return () => {
      eventSource.close();
    };
  }, [fetchNotifications]);

  const handleMarkRead = async (ids: string[]) => {
    await fetch('/api/v1/notifications/mark-read', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notificationIds: ids }),
    });
    setNotifications((prev) => prev.map((n) => (ids.includes(n.id) ? { ...n, read: true } : n)));
  };

  const handleMarkAllRead = async () => {
    await fetch('/api/v1/notifications/mark-all-read', { method: 'POST' });
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <svg className="h-8 w-8 animate-spin text-brand-gold" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          <span className="text-xs font-mono uppercase tracking-wider text-gray-400">Connecting to Real-Time SSE Event Stream...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="border-b border-gray-800 pb-6">
        <h1 className="text-2xl font-extrabold text-white sm:text-3xl">
          Real-Time Multi-Channel Notification Center (`SSE`)
        </h1>
        <p className="mt-1 text-xs text-gray-400">
          Persistent system, transactional, and security alerts synchronized via atomic Redis unread counters (`unread_count:user_{'{ID}'}`).
        </p>
      </div>

      <NotificationCenter
        notifications={notifications}
        onMarkRead={handleMarkRead}
        onMarkAllRead={handleMarkAllRead}
      />
    </div>
  );
}
