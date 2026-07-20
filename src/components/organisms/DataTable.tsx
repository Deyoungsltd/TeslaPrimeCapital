'use client';

import React from 'react';
import { TransactionRow } from '../molecules/TransactionRow';

export interface ITransactionItem {
  id: string;
  transactionId: string;
  type: string;
  amount: string;
  currency: string;
  status: string;
  createdAt: string;
}

export const DataTable: React.FC<{ transactions: ITransactionItem[]; totalCount?: number }> = ({ transactions, totalCount }) => {
  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-brand-border bg-brand-card/60 py-16 text-center">
        <svg className="h-12 w-12 text-gray-500 mb-3 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h4 className="text-base font-bold text-gray-200 uppercase tracking-wider font-sans">No Transaction Activity Recorded</h4>
        <p className="mt-1 max-w-sm text-xs text-gray-400">
          Your immutable double-entry ledger (`NUMERIC(20,8)`) is currently clear. Initiate a deposit or allocate capital to populate your audit history.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-brand-border bg-brand-card shadow-tesla">
      <table className="min-w-full divide-y divide-[#222226]">
        <thead className="bg-[#18181b]">
          <tr>
            <th className="px-4 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-gray-400 font-mono">Reference ID</th>
            <th className="px-4 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-gray-400">Operation Type</th>
            <th className="px-4 py-3.5 text-right text-xs font-bold uppercase tracking-wider text-gray-400">Exact Amount (`NUMERIC(20,8)`)</th>
            <th className="px-4 py-3.5 text-center text-xs font-bold uppercase tracking-wider text-gray-400">Ledger Status</th>
            <th className="px-4 py-3.5 text-right text-xs font-bold uppercase tracking-wider text-gray-400 font-mono">Timestamp (UTC)</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#18181b] bg-brand-card">
          {transactions.map((tx) => (
            <TransactionRow
              key={tx.id}
              transactionId={tx.transactionId}
              type={tx.type}
              amount={tx.amount}
              currency={tx.currency}
              status={tx.status}
              createdAt={tx.createdAt}
            />
          ))}
        </tbody>
      </table>
      {totalCount !== undefined && totalCount > transactions.length && (
        <div className="flex items-center justify-between border-t border-[#222226] bg-[#18181b] px-6 py-3 text-xs text-gray-400 font-mono">
          <span>Showing latest {transactions.length} of {totalCount} ledger records</span>
          <span className="text-white font-bold uppercase tracking-wider">Cursor Pagination Active</span>
        </div>
      )}
    </div>
  );
};
