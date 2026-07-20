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
    <tr className="border-b border-[#18181b] transition-colors duration-150 hover:bg-[#18181b]">
      <td className="whitespace-nowrap px-4 py-4 text-xs font-mono font-medium text-gray-300">
        {transactionId}
      </td>
      <td className="whitespace-nowrap px-4 py-4 text-xs font-bold uppercase tracking-wider text-white">
        <span className={isCredit ? 'text-emerald-400 mr-1.5 font-extrabold' : 'text-rose-400 mr-1.5 font-extrabold'}>
          {isCredit ? '+' : '-'}
        </span>
        {type.replace(/_/g, ' ')}
      </td>
      <td className="whitespace-nowrap px-4 py-4 text-right font-mono text-sm font-semibold">
        <CurrencyDisplay amount={amount} currency={currency} className={isCredit ? 'text-emerald-400' : 'text-white'} />
      </td>
      <td className="whitespace-nowrap px-4 py-4 text-center">
        <Badge status={status} />
      </td>
      <td className="whitespace-nowrap px-4 py-4 text-right text-xs text-gray-400 font-mono">
        {new Date(createdAt).toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' })}
      </td>
    </tr>
  );
};
