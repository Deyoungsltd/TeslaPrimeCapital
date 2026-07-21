# TeslaPrimeCapital — Role-Based Access Control (RBAC) Specification

---

## 1. Enterprise RBAC Architecture & Least Privilege Principle

**TeslaPrimeCapital** enforces strict separation of duties and the **Principle of Least Privilege**. System authorization is driven by explicit hierarchical role definitions combined with granular permission checks embedded inside API route middlewares and Next.js server actions.

### 1.1 Hierarchical Role Definitions
| Role Identifier | Primary Responsibility & Operational Scope | Hierarchical Rank |
| :--- | :--- | :--- |
| **`SUPER_ADMIN`** | Absolute system governance. Can configure investment plans, manage system configuration, override system limits, assign internal roles, and view all audit ledgers. Cannot directly disburse withdrawals without `FINANCE_MANAGER` co-signature. | Rank 100 (Highest) |
| **`COMPLIANCE_OFFICER`** | Regulatory oversight. Responsible exclusively for reviewing, approving, or rejecting Know Your Customer (KYC) submissions, viewing proof of identity documents, investigating AML alerts, and freezing suspicious user wallets. | Rank 80 |
| **`FINANCE_MANAGER`** | Treasury management. Responsible for reconciling incoming bank wire deposits, auditing daily accrual worker logs, monitoring liquidity pool reserves, and co-signing large withdrawal disbursement requests. | Rank 80 |
| **`SUPPORT_AGENT`** | Customer resolution desk. Can view non-sensitive user profile metadata, review active investment schedules, and respond to support tickets. Strictly restricted from viewing KYC ID documents, balances, passwords, or modifying wallet states. | Rank 50 |
| **`AFFILIATE_PARTNER`** | Institutional or syndicate partner. Can access specialized multi-tier referral analytics, bulk export commission reports, and configure custom campaign landing parameters. | Rank 20 |
| **`INVESTOR`** | Standard retail or VIP customer. Can manage personal profile, deposit funds, browse and purchase investment plans, track daily yields, request withdrawals, and submit support tickets. | Rank 10 (Base) |

---

## 2. Granular Permission Evaluation Middleware

Every backend API endpoint requires explicit permission verification before processing:
```typescript
// Architectural Middleware Specification Example
export const requirePermission = (requiredPermission: PermissionScope) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const userRole = req.user.role;
    const permissions = RolePermissionMatrix[userRole];
    
    if (!permissions || !permissions.includes(requiredPermission)) {
      await logSecurityAudit({
        userId: req.user.id,
        actionType: 'UNAUTHORIZED_ACCESS_ATTEMPT',
        resource: req.originalUrl,
        requiredPermission
      });
      return res.status(403).json({
        success: false,
        error: { code: 'ERR_FORBIDDEN', message: 'Insufficient role permissions for requested action.' }
      });
    }
    next();
  };
};
```
