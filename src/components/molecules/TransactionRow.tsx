import React from 'react';
import { CurrencyDisplay } from '../atoms/CurrencyDisplay';
import { Badge } from '../atoms/Badge';

export interface ITransactionRowProps {
  transactionId: string;
  type: string;
  amount: string;
  currency: string;
  status: string;
  createdAt: string;
}

export const TransactionRow: React.FC<ITransactionRowProps> = ({
  transactionId,
  type,
  amount,
  currency,
  status,
  createdAt,
}) => {
  const isCredit = ['DEPOSIT', 'YIELD_PAYOUT', 'COMMISSION'].includes(type.toUpperCase());

  return (
    <tr className="border-b border-gray-800/80 transition-colors hover:bg-gray-800/30">
      <td className="whitespace-nowrap px-4 py-4 text-xs font-mono font-medium text-gray-300">
        {transactionId}
      </td>
      <td className="whitespace-nowrap px-4 py-4 text-xs font-bold uppercase tracking-wider text-gray-200">
        <span className={isCredit ? 'text-emerald-400 mr-1.5 font-extrabold' : 'text-rose-400 mr-1.5 font-extrabold'}>
          {isCredit ? '+' : '-'}
        </span>
        {type.replace(/_/g, ' ')}
      </td>
      <td className="whitespace-nowrap px-4 py-4 text-right font-mono text-sm">
        <CurrencyDisplay amount={amount} currency={currency} className={isCredit ? 'text-emerald-400' : 'text-gray-100'} />
      </td>
      <td className="whitespace-nowrap px-4 py-4 text-center">
        <Badge status={status} />
      </td>
      <td className="whitespace-nowrap px-4 py-4 text-right text-xs text-gray-400">
        {new Date(createdAt).toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' })}
      </td>
    </tr>
  );
};
