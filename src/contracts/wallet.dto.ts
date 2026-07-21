/**
 * TeslaPrimeCapital — Wallet & Transaction DTOs
 */

export interface IWalletBalanceDTO {
  walletId: string;
  currency: string;
  availableBalance: string; // Exact NUMERIC(20,8) string
  lockedBalance: string;
  totalDeposited: string;
  totalWithdrawn: string;
  updatedAt: string;
}

export interface IDepositInitiationRequest {
  amount: string; // e.g. "1000.00000000"
  currency: string;
  gateway: 'STRIPE' | 'COINPAYMENTS' | 'BANK_WIRE';
}

export interface IDepositInitiationResponse {
  transactionId: string;
  status: 'PENDING_REVIEW' | 'PROCESSING';
  checkoutUrl?: string;
  cryptoDepositAddress?: string;
  paymentReference: string;
}

export interface IWithdrawalInitiationRequest {
  amount: string;
  currency: string;
  destinationAddressOrBank: string;
  totpCode: string; // Mandatory MFA
}

export interface IWithdrawalResponseDTO {
  transactionId: string;
  amount: string;
  currency: string;
  status: 'PENDING_REVIEW'; // Enforcing 100% Mandatory Admin Review rule
  message: string;
}

export interface ITransactionDTO {
  id: string;
  transactionId: string;
  userId: string;
  type: 'DEPOSIT' | 'WITHDRAWAL' | 'INVESTMENT_LOCK' | 'YIELD_PAYOUT' | 'COMMISSION' | 'PENALTY' | 'EXCHANGE';
  amount: string;
  currency: string;
  status: 'PENDING_REVIEW' | 'PROCESSING' | 'COMPLETED' | 'REJECTED' | 'FAILED';
  createdAt: string;
}
