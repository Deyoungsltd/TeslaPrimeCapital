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
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 bg-[#111116]/60 py-20 text-center">
        <svg className="h-14 w-14 text-gray-500 mb-4 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h4 className="text-lg font-extrabold text-white uppercase tracking-wider font-sans">No Transaction Activity Recorded</h4>
        <p className="mt-1.5 max-w-md text-xs text-gray-400 font-sans">
          Your immutable double-entry ledger (`NUMERIC(20,8)`) is currently clear. Initiate a deposit or allocate capital to populate your audit history.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-white/15 bg-[#111116] shadow-tesla">
      <table className="min-w-full divide-y divide-white/10">
        <thead className="bg-[#181822]">
          <tr>
            <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-300 font-mono">Reference ID</th>
            <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-300 font-sans">Operation Type</th>
            <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wider text-gray-300 font-mono">Exact Amount (`NUMERIC(20,8)`)</th>
            <th className="px-5 py-4 text-center text-xs font-bold uppercase tracking-wider text-gray-300 font-sans">Ledger Status</th>
            <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wider text-gray-300 font-mono">Timestamp (UTC)</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/10 bg-[#111116]">
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
        <div className="flex items-center justify-between border-t border-white/10 bg-[#181822] px-6 py-4 text-xs text-gray-400 font-mono">
          <span>Showing latest {transactions.length} of {totalCount} ledger records</span>
          <span className="text-brand-blue font-bold uppercase tracking-wider">Cursor Pagination Active</span>
        </div>
      )}
    </div>
  );
};
