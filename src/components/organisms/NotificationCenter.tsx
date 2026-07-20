'use client';

import React, { useState } from 'react';
import { Button } from '../atoms/Button';
import { Badge } from '../atoms/Badge';

export interface INotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export const NotificationCenter: React.FC<{
  notifications: INotificationItem[];
  onMarkRead: (ids: string[]) => Promise<void>;
  onMarkAllRead: () => Promise<void>;
}> = ({ notifications, onMarkRead, onMarkAllRead }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set());
  const [isMarkingAll, setIsMarkingAll] = useState(false);

  const filtered = selectedCategory === 'ALL'
    ? notifications
    : notifications.filter((n) => n.type === selectedCategory);

  const handleSingleRead = async (id: string) => {
    setLoadingIds((prev) => new Set(prev).add(id));
    try {
      await onMarkRead([id]);
    } finally {
      setLoadingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const handleAllRead = async () => {
    setIsMarkingAll(true);
    try {
      await onMarkAllRead();
    } finally {
      setIsMarkingAll(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-brand-border bg-brand-card p-4 shadow-tesla">
        <div className="flex flex-wrap gap-2">
          {['ALL', 'SYSTEM', 'TRANSACTION', 'INVESTMENT', 'SECURITY', 'COMMISSION', 'KYC'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-md px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider transition-all duration-150 font-mono ${
                selectedCategory === cat
                  ? 'bg-white text-black shadow-sm'
                  : 'bg-[#18181b] border border-[#27272a] text-gray-400 hover:bg-[#222226] hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        <Button variant="outline" size="sm" onClick={handleAllRead} isLoading={isMarkingAll}>
          Mark All as Read (`Optimistic Sync`)
        </Button>
      </div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-brand-border bg-brand-card/40 p-12 text-center text-xs text-gray-400 font-mono">
            No notification alerts recorded in this category.
          </div>
        ) : (
          filtered.map((n) => (
            <div
              key={n.id}
              className={`flex flex-col justify-between gap-4 rounded-xl border p-5 transition-all duration-200 sm:flex-row sm:items-center ${
                n.read
                  ? 'border-[#222226] bg-[#141416] opacity-75'
                  : 'border-white/30 bg-brand-card shadow-tesla'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <Badge status={n.type} />
                  <span className="text-sm font-bold text-white tracking-tight">{n.title}</span>
                  {!n.read && <span className="h-2 w-2 rounded-full bg-brand-blue animate-pulse" />}
                </div>
                <p className="text-xs text-gray-300 leading-relaxed max-w-2xl">{n.message}</p>
                <span className="block text-[10px] text-gray-400 font-mono pt-1">
                  {new Date(n.createdAt).toLocaleString()}
                </span>
              </div>

              <div>
                {!n.read && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleSingleRead(n.id)}
                    isLoading={loadingIds.has(n.id)}
                  >
                    Acknowledge
                  </Button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
