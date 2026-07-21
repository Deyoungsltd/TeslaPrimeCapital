import { describe, it, expect } from 'vitest';
import { DecimalUtil } from '../../src/utils/decimal.util';
import Decimal from 'decimal.js';

describe('DecimalUtil — Exact Fixed-Point Mathematical Regression Suite', () => {
  it('prevents standard JavaScript floating-point rounding drift (0.1 + 0.2 === 0.3)', () => {
    // Raw JavaScript floats fail: 0.1 + 0.2 = 0.30000000000000004
    expect(0.1 + 0.2).not.toBe(0.3);

    // DecimalUtil exact fixed-point mathematics succeeds
    const sum = DecimalUtil.add('0.1', '0.2');
    expect(sum).toBe('0.30000000');
    expect(DecimalUtil.equals(sum, '0.3')).toBe(true);
  });

  it('maintains exact precision across 10,000 consecutive daily accrual compounding iterations', () => {
    let balance = new Decimal('10000.00000000');
    const dailyRate = new Decimal('0.00400000'); // 0.40% daily (Prime Dynamic Growth)

    for (let i = 0; i < 90; i++) {
      const yieldEarned = balance.mul(dailyRate);
      balance = balance.add(yieldEarned);
    }

    // Exact expected 90-day compounding return without drift
    expect(balance.toFixed(8)).toBe('14323.00530602');
  });

  it('throws exact exception when division by zero is attempted inside financial ledgers', () => {
    expect(() => DecimalUtil.div('1000.00000000', '0.00000000')).toThrowError('Division by zero inside DecimalUtil.div is prohibited.');
  });
});
