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
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/15 bg-[#111116] p-5 shadow-tesla">
        <div className="flex flex-wrap gap-2.5 font-mono">
          {['ALL', 'SYSTEM', 'TRANSACTION', 'INVESTMENT', 'SECURITY', 'COMMISSION', 'KYC'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all duration-150 ${
                selectedCategory === cat
                  ? 'bg-brand-blue text-white shadow-blue-glow border border-white/30 scale-105'
                  : 'bg-[#181824] border border-white/10 text-gray-400 hover:bg-[#222230] hover:text-white'
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

      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/15 bg-[#111116]/60 p-16 text-center text-xs text-gray-400 font-mono">
            No notification alerts recorded in this category.
          </div>
        ) : (
          filtered.map((n) => (
            <div
              key={n.id}
              className={`flex flex-col justify-between gap-4 rounded-2xl border p-6 transition-all duration-200 sm:flex-row sm:items-center ${
                n.read
                  ? 'border-white/10 bg-[#14141a] opacity-75'
                  : 'border-brand-blue/50 bg-[#111116] shadow-tesla'
              }`}
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-3">
                  <Badge status={n.type} />
                  <span className="text-base font-extrabold text-white tracking-tight font-sans">{n.title}</span>
                  {!n.read && <span className="h-2.5 w-2.5 rounded-full bg-brand-blue animate-pulse shadow-blue-glow" />}
                </div>
                <p className="text-xs text-gray-300 leading-relaxed max-w-3xl font-sans">{n.message}</p>
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
