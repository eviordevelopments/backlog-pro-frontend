import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { AppProvider, useApp } from '@/context/AppContext';
import { AuthProvider } from '@/context/AuthContext';
import { ProfitShare } from '@/types';

describe('Profit Sharing Operations', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <AuthProvider>
      <AppProvider>{children}</AppProvider>
    </AuthProvider>
  );

  beforeEach(() => {
    localStorage.clear();
    // Prevent sample data from being loaded
    localStorage.setItem('hasInitialized', 'true');
  });

  describe('Revenue Validation (Requirement 8.1)', () => {
    it('should accept non-negative revenue values', () => {
      const { result } = renderHook(() => useApp(), { wrapper });

      const shares: ProfitShare[] = [
        { memberId: '1', memberName: 'Pedro', percentage: 50, amount: 0 },
        { memberId: '2', memberName: 'David', percentage: 50, amount: 0 },
      ];

      act(() => {
        result.current.updateProfitShares(shares, 100000);
      });

      expect(result.current.profitShares).toHaveLength(2);
      expect(result.current.profitShares[0].amount).toBe(50000);
      expect(result.current.profitShares[1].amount).toBe(50000);
    });

    it('should accept zero revenue', () => {
      const { result } = renderHook(() => useApp(), { wrapper });

      const shares: ProfitShare[] = [
        { memberId: '1', memberName: 'Pedro', percentage: 100, amount: 0 },
      ];

      act(() => {
        result.current.updateProfitShares(shares, 0);
      });

      expect(result.current.profitShares[0].amount).toBe(0);
    });

    it('should reject negative revenue', () => {
      const { result } = renderHook(() => useApp(), { wrapper });

      const shares: ProfitShare[] = [
        { memberId: '1', memberName: 'Pedro', percentage: 100, amount: 0 },
      ];

      expect(() => {
        act(() => {
          result.current.updateProfitShares(shares, -1000);
        });
      }).toThrow('Total revenue must be a non-negative numeric value');
    });

    it('should reject non-numeric revenue', () => {
      const { result } = renderHook(() => useApp(), { wrapper });

      const shares: ProfitShare[] = [
        { memberId: '1', memberName: 'Pedro', percentage: 100, amount: 0 },
      ];

      expect(() => {
        act(() => {
          result.current.updateProfitShares(shares, NaN);
        });
      }).toThrow('Total revenue must be a non-negative numeric value');
    });

    it('should reject infinite revenue', () => {
      const { result } = renderHook(() => useApp(), { wrapper });

      const shares: ProfitShare[] = [
        { memberId: '1', memberName: 'Pedro', percentage: 100, amount: 0 },
      ];

      expect(() => {
        act(() => {
          result.current.updateProfitShares(shares, Infinity);
        });
      }).toThrow('Total revenue must be a non-negative numeric value');
    });
  });

  describe('Percentage Allocation (Requirement 8.2)', () => {
    it('should accept percentage values between 0 and 100', () => {
      const { result } = renderHook(() => useApp(), { wrapper });

      const shares: ProfitShare[] = [
        { memberId: '1', memberName: 'Pedro', percentage: 0, amount: 0 },
        { memberId: '2', memberName: 'David', percentage: 25, amount: 0 },
        { memberId: '3', memberName: 'Morena', percentage: 50, amount: 0 },
        { memberId: '4', memberName: 'Franco', percentage: 25, amount: 0 },
      ];

      act(() => {
        result.current.updateProfitShares(shares);
      });

      expect(result.current.profitShares).toHaveLength(4);
    });

    it('should accept 0% percentage', () => {
      const { result } = renderHook(() => useApp(), { wrapper });

      const shares: ProfitShare[] = [
        { memberId: '1', memberName: 'Pedro', percentage: 0, amount: 0 },
      ];

      act(() => {
        result.current.updateProfitShares(shares);
      });

      expect(result.current.profitShares[0].percentage).toBe(0);
    });

    it('should accept 100% percentage', () => {
      const { result } = renderHook(() => useApp(), { wrapper });

      const shares: ProfitShare[] = [
        { memberId: '1', memberName: 'Pedro', percentage: 100, amount: 0 },
      ];

      act(() => {
        result.current.updateProfitShares(shares);
      });

      expect(result.current.profitShares[0].percentage).toBe(100);
    });

    it('should reject negative percentage', () => {
      const { result } = renderHook(() => useApp(), { wrapper });

      const shares: ProfitShare[] = [
        { memberId: '1', memberName: 'Pedro', percentage: -10, amount: 0 },
      ];

      expect(() => {
        act(() => {
          result.current.updateProfitShares(shares);
        });
      }).toThrow('Percentage for Pedro must be between 0 and 100');
    });

    it('should reject percentage greater than 100', () => {
      const { result } = renderHook(() => useApp(), { wrapper });

      const shares: ProfitShare[] = [
        { memberId: '1', memberName: 'Pedro', percentage: 150, amount: 0 },
      ];

      expect(() => {
        act(() => {
          result.current.updateProfitShares(shares);
        });
      }).toThrow('Percentage for Pedro must be between 0 and 100');
    });

    it('should reject non-numeric percentage', () => {
      const { result } = renderHook(() => useApp(), { wrapper });

      const shares: ProfitShare[] = [
        { memberId: '1', memberName: 'Pedro', percentage: NaN, amount: 0 },
      ];

      expect(() => {
        act(() => {
          result.current.updateProfitShares(shares);
        });
      }).toThrow('Percentage for Pedro must be between 0 and 100');
    });

    it('should reject infinite percentage', () => {
      const { result } = renderHook(() => useApp(), { wrapper });

      const shares: ProfitShare[] = [
        { memberId: '1', memberName: 'Pedro', percentage: Infinity, amount: 0 },
      ];

      expect(() => {
        act(() => {
          result.current.updateProfitShares(shares);
        });
      }).toThrow('Percentage for Pedro must be between 0 and 100');
    });
  });

  describe('Amount Calculation (Requirements 8.3, 8.5)', () => {
    it('should calculate individual amounts as (percentage / 100) * revenue', () => {
      const { result } = renderHook(() => useApp(), { wrapper });

      const shares: ProfitShare[] = [
        { memberId: '1', memberName: 'Pedro', percentage: 25, amount: 0 },
        { memberId: '2', memberName: 'David', percentage: 25, amount: 0 },
        { memberId: '3', memberName: 'Morena', percentage: 30, amount: 0 },
        { memberId: '4', memberName: 'Franco', percentage: 20, amount: 0 },
      ];

      const totalRevenue = 100000;

      act(() => {
        result.current.updateProfitShares(shares, totalRevenue);
      });

      expect(result.current.profitShares[0].amount).toBe(25000); // 25% of 100000
      expect(result.current.profitShares[1].amount).toBe(25000); // 25% of 100000
      expect(result.current.profitShares[2].amount).toBe(30000); // 30% of 100000
      expect(result.current.profitShares[3].amount).toBe(20000); // 20% of 100000
    });

    it('should auto-recalculate amounts when revenue changes', () => {
      const { result } = renderHook(() => useApp(), { wrapper });

      const shares: ProfitShare[] = [
        { memberId: '1', memberName: 'Pedro', percentage: 50, amount: 0 },
        { memberId: '2', memberName: 'David', percentage: 50, amount: 0 },
      ];

      // First calculation with 100000
      act(() => {
        result.current.updateProfitShares(shares, 100000);
      });

      expect(result.current.profitShares[0].amount).toBe(50000);
      expect(result.current.profitShares[1].amount).toBe(50000);

      // Recalculate with 200000
      const updatedShares = result.current.profitShares;
      act(() => {
        result.current.updateProfitShares(updatedShares, 200000);
      });

      expect(result.current.profitShares[0].amount).toBe(100000);
      expect(result.current.profitShares[1].amount).toBe(100000);
    });

    it('should handle decimal percentages correctly', () => {
      const { result } = renderHook(() => useApp(), { wrapper });

      const shares: ProfitShare[] = [
        { memberId: '1', memberName: 'Pedro', percentage: 33.33, amount: 0 },
        { memberId: '2', memberName: 'David', percentage: 33.33, amount: 0 },
        { memberId: '3', memberName: 'Morena', percentage: 33.34, amount: 0 },
      ];

      const totalRevenue = 100000;

      act(() => {
        result.current.updateProfitShares(shares, totalRevenue);
      });

      expect(result.current.profitShares[0].amount).toBeCloseTo(33330, 0);
      expect(result.current.profitShares[1].amount).toBeCloseTo(33330, 0);
      expect(result.current.profitShares[2].amount).toBeCloseTo(33340, 0);
    });

    it('should calculate zero amount for zero percentage', () => {
      const { result } = renderHook(() => useApp(), { wrapper });

      const shares: ProfitShare[] = [
        { memberId: '1', memberName: 'Pedro', percentage: 0, amount: 0 },
        { memberId: '2', memberName: 'David', percentage: 100, amount: 0 },
      ];

      const totalRevenue = 100000;

      act(() => {
        result.current.updateProfitShares(shares, totalRevenue);
      });

      expect(result.current.profitShares[0].amount).toBe(0);
      expect(result.current.profitShares[1].amount).toBe(100000);
    });

    it('should calculate zero amount for zero revenue', () => {
      const { result } = renderHook(() => useApp(), { wrapper });

      const shares: ProfitShare[] = [
        { memberId: '1', memberName: 'Pedro', percentage: 50, amount: 0 },
        { memberId: '2', memberName: 'David', percentage: 50, amount: 0 },
      ];

      act(() => {
        result.current.updateProfitShares(shares, 0);
      });

      expect(result.current.profitShares[0].amount).toBe(0);
      expect(result.current.profitShares[1].amount).toBe(0);
    });

    it('should not recalculate amounts when revenue is not provided', () => {
      const { result } = renderHook(() => useApp(), { wrapper });

      const shares: ProfitShare[] = [
        { memberId: '1', memberName: 'Pedro', percentage: 50, amount: 12345 },
        { memberId: '2', memberName: 'David', percentage: 50, amount: 67890 },
      ];

      act(() => {
        result.current.updateProfitShares(shares);
      });

      // Amounts should remain unchanged when revenue is not provided
      expect(result.current.profitShares[0].amount).toBe(12345);
      expect(result.current.profitShares[1].amount).toBe(67890);
    });
  });

  describe('Amount Validation', () => {
    it('should reject negative amounts', () => {
      const { result } = renderHook(() => useApp(), { wrapper });

      const shares: ProfitShare[] = [
        { memberId: '1', memberName: 'Pedro', percentage: 50, amount: -1000 },
      ];

      expect(() => {
        act(() => {
          result.current.updateProfitShares(shares);
        });
      }).toThrow('Amount for Pedro must be a non-negative numeric value');
    });

    it('should reject non-numeric amounts', () => {
      const { result } = renderHook(() => useApp(), { wrapper });

      const shares: ProfitShare[] = [
        { memberId: '1', memberName: 'Pedro', percentage: 50, amount: NaN },
      ];

      expect(() => {
        act(() => {
          result.current.updateProfitShares(shares);
        });
      }).toThrow('Amount for Pedro must be a non-negative numeric value');
    });

    it('should reject infinite amounts', () => {
      const { result } = renderHook(() => useApp(), { wrapper });

      const shares: ProfitShare[] = [
        { memberId: '1', memberName: 'Pedro', percentage: 50, amount: Infinity },
      ];

      expect(() => {
        act(() => {
          result.current.updateProfitShares(shares);
        });
      }).toThrow('Amount for Pedro must be a non-negative numeric value');
    });
  });

  describe('localStorage Persistence', () => {
    it('should persist profit shares to localStorage', () => {
      const { result } = renderHook(() => useApp(), { wrapper });

      const shares: ProfitShare[] = [
        { memberId: '1', memberName: 'Pedro', percentage: 50, amount: 50000 },
        { memberId: '2', memberName: 'David', percentage: 50, amount: 50000 },
      ];

      act(() => {
        result.current.updateProfitShares(shares, 100000);
      });

      const stored = localStorage.getItem('profitShares');
      expect(stored).toBeTruthy();
      
      const parsed = JSON.parse(stored!);
      expect(parsed).toHaveLength(2);
      expect(parsed[0].amount).toBe(50000);
      expect(parsed[1].amount).toBe(50000);
    });
  });
});
