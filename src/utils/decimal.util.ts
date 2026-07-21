/**
 * TeslaPrimeCapital — Exact Fixed-Point Decimal Utilities
 * Enforces zero floating-point rounding drift across all financial computations.
 * Never use raw JavaScript numbers or math operators (+, -, *, /) for financial figures.
 */

import Decimal from 'decimal.js';

// Configure decimal.js for strict 20-digit precision with round-half-up banking rules
Decimal.set({ precision: 20, rounding: Decimal.ROUND_HALF_UP });

export class DecimalUtil {
  public static fromString(val: string | number): Decimal {
    try {
      return new Decimal(val);
    } catch (err) {
      throw new Error(`Invalid numeric input for Decimal creation: ${val}`);
    }
  }

  public static add(a: string | Decimal, b: string | Decimal): string {
    return new Decimal(a).add(new Decimal(b)).toFixed(8);
  }

  public static sub(a: string | Decimal, b: string | Decimal): string {
    return new Decimal(a).sub(new Decimal(b)).toFixed(8);
  }

  public static mul(a: string | Decimal, b: string | Decimal): string {
    return new Decimal(a).mul(new Decimal(b)).toFixed(8);
  }

  public static div(a: string | Decimal, b: string | Decimal): string {
    const divisor = new Decimal(b);
    if (divisor.isZero()) {
      throw new Error('Division by zero inside DecimalUtil.div is prohibited.');
    }
    return new Decimal(a).div(divisor).toFixed(8);
  }

  public static formatFiat(val: string | Decimal): string {
    return new Decimal(val).toFixed(2);
  }

  public static formatCrypto(val: string | Decimal): string {
    return new Decimal(val).toFixed(8);
  }

  public static equals(a: string | Decimal, b: string | Decimal): boolean {
    return new Decimal(a).equals(new Decimal(b));
  }

  public static isGreaterThan(a: string | Decimal, b: string | Decimal): boolean {
    return new Decimal(a).greaterThan(new Decimal(b));
  }

  public static isGreaterThanOrEqualTo(a: string | Decimal, b: string | Decimal): boolean {
    return new Decimal(a).greaterThanOrEqualTo(new Decimal(b));
  }

  public static isLessThan(a: string | Decimal, b: string | Decimal): boolean {
    return new Decimal(a).lessThan(new Decimal(b));
  }
}
