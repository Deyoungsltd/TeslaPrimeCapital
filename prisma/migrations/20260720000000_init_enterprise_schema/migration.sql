-- ==============================================================================
// TeslaPrimeCapital — Master Relational Database Schema (`migration.sql`)
// Phase 3, Milestone 2: Enterprise Database Architecture & Schema Definition
// Enforces exact NUMERIC(20,8) precision, composite indexes, and strict FK rules.
-- ==============================================================================

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('SUPER_ADMIN', 'COMPLIANCE_OFFICER', 'FINANCE_MANAGER', 'SUPPORT_AGENT', 'AFFILIATE_PARTNER', 'INVESTOR');

-- CreateEnum
CREATE TYPE "AccountStatus" AS ENUM ('PENDING_VERIFICATION', 'ACTIVE', 'SUSPENDED', 'LOCKED');

-- CreateEnum
CREATE TYPE "KycTier" AS ENUM ('TIER_0', 'TIER_1', 'TIER_2');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('DEPOSIT', 'WITHDRAWAL', 'INVESTMENT_LOCK', 'YIELD_PAYOUT', 'COMMISSION', 'PENALTY', 'EXCHANGE');

-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('PENDING_REVIEW', 'PROCESSING', 'COMPLETED', 'REJECTED', 'FAILED');

-- CreateEnum
CREATE TYPE "PayoutPolicy" AS ENUM ('LUMP_SUM_MATURITY');

-- CreateEnum
CREATE TYPE "InvestmentStatus" AS ENUM ('ACTIVE', 'MATURED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "CommissionStatus" AS ENUM ('PENDING_VESTING', 'CREDITED', 'CLAWED_BACK');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('PASSPORT', 'NATIONAL_ID', 'DRIVERS_LICENSE', 'PROOF_OF_ADDRESS', 'SELFIE');

-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('PENDING_REVIEW', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('SYSTEM', 'TRANSACTION', 'INVESTMENT', 'SECURITY', 'COMMISSION', 'KYC');

-- CreateEnum
CREATE TYPE "TicketCategory" AS ENUM ('GENERAL', 'DEPOSIT_WITHDRAWAL', 'INVESTMENT_PLAN', 'KYC_VERIFICATION', 'SECURITY_2FA');

-- CreateEnum
CREATE TYPE "TicketPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "TicketStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'WAITING_FOR_USER', 'RESOLVED', 'CLOSED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "passwordHash" VARCHAR(255) NOT NULL,
    "firstName" VARCHAR(100) NOT NULL,
    "lastName" VARCHAR(100) NOT NULL,
    "phone" VARCHAR(50),
    "role" "UserRole" NOT NULL DEFAULT 'INVESTOR',
    "status" "AccountStatus" NOT NULL DEFAULT 'PENDING_VERIFICATION',
    "kycTier" "KycTier" NOT NULL DEFAULT 'TIER_0',
    "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT false,
    "twoFactorSecret" VARCHAR(255),
    "backupCodes" JSONB,
    "referralCode" VARCHAR(50) NOT NULL,
    "referredById" TEXT,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "refreshTokenHash" VARCHAR(255) NOT NULL,
    "deviceFingerprint" VARCHAR(255),
    "ipAddress" VARCHAR(64),
    "userAgent" TEXT,
    "expiresAt" TIMESTAMPTZ NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wallets" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "currency" VARCHAR(10) NOT NULL,
    "availableBalance" DECIMAL(20,8) NOT NULL DEFAULT 0.00000000,
    "lockedBalance" DECIMAL(20,8) NOT NULL DEFAULT 0.00000000,
    "totalDeposited" DECIMAL(20,8) NOT NULL DEFAULT 0.00000000,
    "totalWithdrawn" DECIMAL(20,8) NOT NULL DEFAULT 0.00000000,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "wallets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transactions" (
    "id" TEXT NOT NULL,
    "transactionId" VARCHAR(64) NOT NULL,
    "userId" TEXT NOT NULL,
    "walletId" TEXT NOT NULL,
    "type" "TransactionType" NOT NULL DEFAULT 'DEPOSIT',
    "amount" DECIMAL(20,8) NOT NULL,
    "currency" VARCHAR(10) NOT NULL,
    "status" "TransactionStatus" NOT NULL DEFAULT 'PENDING_REVIEW',
    "metadata" JSONB,
    "approvedById" TEXT,
    "idempotencyKey" VARCHAR(128) NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plans" (
    "id" TEXT NOT NULL,
    "planId" VARCHAR(64) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT NOT NULL,
    "minDepositUsd" DECIMAL(20,8) NOT NULL,
    "maxDepositUsd" DECIMAL(20,8) NOT NULL,
    "termDays" INTEGER NOT NULL,
    "dailyRateNumeric" DECIMAL(20,8) NOT NULL,
    "annualPercentageRate" VARCHAR(32) NOT NULL,
    "payoutPolicy" "PayoutPolicy" NOT NULL DEFAULT 'LUMP_SUM_MATURITY',
    "compoundingAllowed" BOOLEAN NOT NULL DEFAULT false,
    "requiresKycTier" "KycTier" NOT NULL DEFAULT 'TIER_0',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "active_investments" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "principalAmount" DECIMAL(20,8) NOT NULL,
    "currentAccruedYield" DECIMAL(20,8) NOT NULL DEFAULT 0.00000000,
    "status" "InvestmentStatus" NOT NULL DEFAULT 'ACTIVE',
    "payoutPolicy" "PayoutPolicy" NOT NULL DEFAULT 'LUMP_SUM_MATURITY',
    "startDate" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "maturityDate" TIMESTAMPTZ NOT NULL,
    "nextAccrualAt" TIMESTAMPTZ NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "active_investments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accrual_logs" (
    "id" TEXT NOT NULL,
    "activeInvestmentId" TEXT NOT NULL,
    "transactionId" TEXT,
    "dailyRateApplied" DECIMAL(20,8) NOT NULL,
    "principalSnapshot" DECIMAL(20,8) NOT NULL,
    "yieldEarned" DECIMAL(20,8) NOT NULL,
    "accrualDate" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "accrual_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "commission_logs" (
    "id" TEXT NOT NULL,
    "referrerId" TEXT NOT NULL,
    "referredUserId" TEXT NOT NULL,
    "activeInvestmentId" VARCHAR(128) NOT NULL,
    "tierLevel" INTEGER NOT NULL,
    "commissionPercentage" DECIMAL(10,4) NOT NULL,
    "qualifyingAmount" DECIMAL(20,8) NOT NULL,
    "commissionEarned" DECIMAL(20,8) NOT NULL,
    "status" "CommissionStatus" NOT NULL DEFAULT 'PENDING_VESTING',
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "commission_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kyc_documents" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "documentType" "DocumentType" NOT NULL,
    "cloudinaryPublicId" VARCHAR(255) NOT NULL,
    "status" "VerificationStatus" NOT NULL DEFAULT 'PENDING_REVIEW',
    "reviewNotes" TEXT,
    "reviewedById" TEXT,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "kyc_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "actorRole" VARCHAR(50) NOT NULL,
    "actionType" VARCHAR(100) NOT NULL,
    "resourceId" VARCHAR(255),
    "oldValue" JSONB,
    "newValue" JSONB,
    "ipAddress" VARCHAR(64),
    "userAgent" TEXT,
    "timestamp" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL DEFAULT 'SYSTEM',
    "title" VARCHAR(150) NOT NULL,
    "message" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "support_tickets" (
    "id" TEXT NOT NULL,
    "ticketNumber" VARCHAR(32) NOT NULL,
    "userId" TEXT NOT NULL,
    "assignedAgentId" TEXT,
    "subject" VARCHAR(200) NOT NULL,
    "category" "TicketCategory" NOT NULL DEFAULT 'GENERAL',
    "priority" "TicketPriority" NOT NULL DEFAULT 'MEDIUM',
    "status" "TicketStatus" NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "support_tickets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "support_messages" (
    "id" TEXT NOT NULL,
    "ticketId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "support_messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndexes
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE UNIQUE INDEX "users_referralCode_key" ON "users"("referralCode");
CREATE INDEX "users_email_status_idx" ON "users"("email", "status");
CREATE INDEX "users_referralCode_idx" ON "users"("referralCode");
CREATE INDEX "users_referredById_idx" ON "users"("referredById");

CREATE UNIQUE INDEX "sessions_refreshTokenHash_key" ON "sessions"("refreshTokenHash");
CREATE INDEX "sessions_userId_idx" ON "sessions"("userId");
CREATE INDEX "sessions_expiresAt_idx" ON "sessions"("expiresAt");

CREATE UNIQUE INDEX "wallets_userId_currency_key" ON "wallets"("userId", "currency");
CREATE INDEX "wallets_userId_idx" ON "wallets"("userId");

CREATE UNIQUE INDEX "transactions_transactionId_key" ON "transactions"("transactionId");
CREATE UNIQUE INDEX "transactions_idempotencyKey_key" ON "transactions"("idempotencyKey");
CREATE INDEX "transactions_userId_type_status_idx" ON "transactions"("userId", "type", "status");
CREATE INDEX "transactions_walletId_status_idx" ON "transactions"("walletId", "status");
CREATE INDEX "transactions_createdAt_idx" ON "transactions"("createdAt");

CREATE UNIQUE INDEX "plans_planId_key" ON "plans"("planId");
CREATE INDEX "plans_isActive_idx" ON "plans"("isActive");

CREATE INDEX "active_investments_userId_status_idx" ON "active_investments"("userId", "status");
CREATE INDEX "active_investments_status_maturityDate_idx" ON "active_investments"("status", "maturityDate");
CREATE INDEX "active_investments_status_nextAccrualAt_idx" ON "active_investments"("status", "nextAccrualAt");

CREATE INDEX "accrual_logs_activeInvestmentId_idx" ON "accrual_logs"("activeInvestmentId");
CREATE INDEX "accrual_logs_accrualDate_idx" ON "accrual_logs"("accrualDate");

CREATE INDEX "commission_logs_referrerId_status_idx" ON "commission_logs"("referrerId", "status");
CREATE INDEX "commission_logs_referredUserId_idx" ON "commission_logs"("referredUserId");

CREATE INDEX "kyc_documents_userId_status_idx" ON "kyc_documents"("userId", "status");
CREATE INDEX "kyc_documents_status_idx" ON "kyc_documents"("status");

CREATE INDEX "audit_logs_userId_actionType_idx" ON "audit_logs"("userId", "actionType");
CREATE INDEX "audit_logs_timestamp_idx" ON "audit_logs"("timestamp");

CREATE INDEX "notifications_userId_read_idx" ON "notifications"("userId", "read");
CREATE INDEX "notifications_createdAt_idx" ON "notifications"("createdAt");

CREATE UNIQUE INDEX "support_tickets_ticketNumber_key" ON "support_tickets"("ticketNumber");
CREATE INDEX "support_tickets_userId_status_idx" ON "support_tickets"("userId", "status");
CREATE INDEX "support_tickets_status_priority_idx" ON "support_tickets"("status", "priority");

CREATE INDEX "support_messages_ticketId_idx" ON "support_messages"("ticketId");
CREATE INDEX "support_messages_senderId_idx" ON "support_messages"("senderId");

-- AddForeignKeys
ALTER TABLE "users" ADD CONSTRAINT "users_referredById_fkey" FOREIGN KEY ("referredById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "wallets" ADD CONSTRAINT "wallets_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "transactions" ADD CONSTRAINT "transactions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "wallets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "active_investments" ADD CONSTRAINT "active_investments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "active_investments" ADD CONSTRAINT "active_investments_planId_fkey" FOREIGN KEY ("planId") REFERENCES "plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "accrual_logs" ADD CONSTRAINT "accrual_logs_activeInvestmentId_fkey" FOREIGN KEY ("activeInvestmentId") REFERENCES "active_investments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "accrual_logs" ADD CONSTRAINT "accrual_logs_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "transactions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "commission_logs" ADD CONSTRAINT "commission_logs_referrerId_fkey" FOREIGN KEY ("referrerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "commission_logs" ADD CONSTRAINT "commission_logs_referredUserId_fkey" FOREIGN KEY ("referredUserId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "kyc_documents" ADD CONSTRAINT "kyc_documents_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "kyc_documents" ADD CONSTRAINT "kyc_documents_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_assignedAgentId_fkey" FOREIGN KEY ("assignedAgentId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "support_messages" ADD CONSTRAINT "support_messages_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "support_tickets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "support_messages" ADD CONSTRAINT "support_messages_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
