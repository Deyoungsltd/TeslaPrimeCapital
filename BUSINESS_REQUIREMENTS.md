# TeslaPrimeCapital — Business & Financial Requirements Specification

---

## 1. Global Financial Model & Revenue Architecture

**TeslaPrimeCapital** operates as a structured digital asset wealth management and capital allocation platform. The business model generates sustainable revenue through a combination of asset management fees, spread on multi-currency conversions, early withdrawal penalties, and performance fees on high-yield investment tiers.

### 1.1 Revenue Streams
- **Management & Administration Fee:** A fixed or percentage-based annual fee (e.g., 0.5% to 1.5% annualized, accrued daily) deducted from active capital allocations within institutional plans.
- **Spread & Exchange Fee:** A configurable margin (e.g., 0.75% to 1.5%) applied during automated fiat-to-crypto or crypto-to-fiat wallet conversions.
- **Early Withdrawal & Cancellation Penalty:** If a user terminates a fixed-term investment plan prior to scheduled maturity, a structured penalty (e.g., forfeiture of accrued interest + 5% principal deduction) is applied to protect platform liquidity.
- **Performance / Success Fee:** For high-yield or dynamic trading strategies, the platform retains a configurable percentage (e.g., 10% to 20%) of profits generated above a pre-defined high-water mark.

---

## 2. Investment Yield & Capital Allocation Logic

The platform must support multiple distinct yield calculation algorithms to accommodate varying risk profiles and product structures:

### 2.1 Plan Structure Taxonomy
| Plan Category | Minimum Deposit | Maximum Deposit | Term Length | Accrual & Payout Schedule | Principal Return | Compounding Option |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Starter Fixed Yield** | $100 | $4,999 | 30 Days | Lump Sum at Maturity | 100% at Maturity | No (Lump Sum Payout) |
| **Prime Dynamic Growth** | $5,000 | $49,999 | 90 Days | Lump Sum at Maturity | Rollover / Return | Optional Rollover at Maturity |
| **Institutional Apex** | $50,000 | $1,000,000+ | 180 / 365 Days | Lump Sum at Maturity | Rollover / Return | Optional Rollover at Maturity |

### 2.2 Mathematical Accrual Formulas
To maintain strict auditability, all accruals are calculated using exact integer or exact fixed-point decimal mathematics:
- **Simple Fixed Accrual (Daily):**
  $$	ext{Daily Yield} = rac{	ext{Principal} 	imes 	ext{Annualized Rate (APR)}}{365}$$
- **Daily Compounding Accrual:**
  $$	ext{New Balance}_{t} = 	ext{Balance}_{t-1} 	imes \left(1 + rac{	ext{APR}}{365}
ight)$$
- **Precision Requirement:** All calculations must maintain at least 8 decimal places (`NUMERIC(20,8)`) during computation. Rounding to display accuracy (2 decimals for fiat, 6-8 decimals for crypto) only occurs at the presentation layer (`Next.js` UI) or final transaction receipt.

---

## 3. Global Jurisdiction & Multi-Currency Strategy

### 3.1 Supported Fiat & Crypto Currencies
The system architecture must natively process, store, and convert multiple currency units:
- **Fiat Currencies:** United States Dollar (`USD` - Base Accounting Currency), Euro (`EUR`), British Pound Sterling (`GBP`), and Japanese Yen (`JPY`).
- **Digital Assets:** Bitcoin (`BTC`), Ethereum (`ETH`), Tether (`USDT` on ERC-20 and TRC-20 networks), and USD Coin (`USDC`).

### 3.2 Currency Conversion & Oracle Integration
When a user deposits crypto into a fiat-denominated investment plan (or vice-versa), the system:
1. Queries a redundant multi-source price oracle (e.g., Chainlink, Binance API, CoinGecko Pro) with automated circuit breakers for sudden volatility (>10% deviation within 5 minutes freezes conversions).
2. Locks the conversion exchange rate for a 60-second execution window during checkout.
3. Records the exact conversion rate, source currency amount, fee deducted, and destination balance inside an immutable `ExchangeLog` entity.

---

## 4. Affiliate & Referral Commission Rules

To drive organic global acquisition, the platform implements a multi-tier affiliate reward system:

### 4.1 Commission Hierarchy
- **Tier 1 (Direct Referral):** 5.0% commission on eligible transaction volume.
- **Tier 2 (Indirect - Sub-referral):** 2.0% commission on eligible transaction volume.
- **Tier 3 (Extended Sub-referral):** 1.0% commission on eligible transaction volume.

### 4.2 Attribution & Payout Rules
- **Attribution Persistence:** Referral relationships are bound upon account creation via a unique referral code/URL parameter (`?ref=USER_ID`). Once bound, the hierarchy is immutable unless overridden by a `SUPER_ADMIN`.
- **Qualifying Event Options:**
  - *Option A (Deposit-Based):* Commission triggers instantly upon successful deposit clearing. (Risk: Users may deposit, earn referral commissions for secondary accounts, and immediately withdraw principal).
  - *Option B (Investment-Based - APPROVED POLICY):* Commission triggers strictly when the referred user locks capital into an **Active Investment Plan**. If the plan is terminated prior to term completion, unvested commission is clawed back or future payouts are offset. If the plan is cancelled early, unvested commission is clawed back or future payouts are offset.

---

## 5. Regulatory & Compliance Considerations

### 5.1 Anti-Money Laundering (AML) & Sanctions Screening
- **Geographic Geo-Fencing:** Automated IP and address screening against FATF Blacklisted countries and OFAC sanctioned territories (e.g., North Korea, Iran, Syria). Access from blocked jurisdictions is rejected at the API gateway layer.
- **Transaction Velocity & Threshold Monitoring:** Automated flag generation for:
  - Single deposits/withdrawals exceeding $10,000 equivalent (requires `COMPLIANCE_OFFICER` sign-off).
  - Cumulative 24-hour deposits exceeding $25,000 equivalent.
  - Structuring behavior (multiple deposits just below reporting thresholds, e.g., three $9,500 deposits in 48 hours).
