import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { AppProvider, useApp } from '@/context/AppContext';
import { AuthProvider } from '@/context/AuthContext';
import { Risk } from '@/types';

describe('Risk CRUD Operations', () => {
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

  describe('Risk Creation (Requirement 7.1)', () => {
    it('should create a risk with all required properties', () => {
      const { result } = renderHook(() => useApp(), { wrapper });

      const newRisk: Risk = {
        id: 'risk-1',
        title: 'Database Failure',
        description: 'Database might fail under high load',
        probability: 3,
        impact: 4,
        score: 12,
        mitigation: 'Implement database replication and monitoring',
        owner: 'Franco',
        status: 'open',
      };

      act(() => {
        result.current.addRisk(newRisk);
      });

      expect(result.current.risks).toHaveLength(1);
      expect(result.current.risks[0]).toMatchObject({
        title: 'Database Failure',
        description: 'Database might fail under high load',
        probability: 3,
        impact: 4,
        score: 12,
        mitigation: 'Implement database replication and monitoring',
        owner: 'Franco',
        status: 'open',
      });
    });

    it('should auto-generate ID if not provided', () => {
      const { result } = renderHook(() => useApp(), { wrapper });

      const newRisk = {
        title: 'API Timeout',
        description: 'API might timeout',
        probability: 2,
        impact: 3,
        score: 6,
        mitigation: 'Add retry logic',
        owner: 'David',
        status: 'open',
      } as Risk;

      act(() => {
        result.current.addRisk(newRisk);
      });

      expect(result.current.risks[0].id).toBeDefined();
      expect(result.current.risks[0].id).toMatch(/^risk-/);
    });

    it('should throw error if title is missing', () => {
      const { result } = renderHook(() => useApp(), { wrapper });

      const invalidRisk = {
        title: '',
        description: 'Test description',
        probability: 3,
        impact: 4,
        score: 12,
        mitigation: 'Test mitigation',
        owner: 'Franco',
        status: 'open',
      } as Risk;

      expect(() => {
        act(() => {
          result.current.addRisk(invalidRisk);
        });
      }).toThrow('Risk title is required');
    });

    it('should throw error if description is missing', () => {
      const { result } = renderHook(() => useApp(), { wrapper });

      const invalidRisk = {
        title: 'Test Risk',
        description: '',
        probability: 3,
        impact: 4,
        score: 12,
        mitigation: 'Test mitigation',
        owner: 'Franco',
        status: 'open',
      } as Risk;

      expect(() => {
        act(() => {
          result.current.addRisk(invalidRisk);
        });
      }).toThrow('Risk description is required');
    });

    it('should throw error if mitigation is missing', () => {
      const { result } = renderHook(() => useApp(), { wrapper });

      const invalidRisk = {
        title: 'Test Risk',
        description: 'Test description',
        probability: 3,
        impact: 4,
        score: 12,
        mitigation: undefined,
        owner: 'Franco',
        status: 'open',
      } as any;

      expect(() => {
        act(() => {
          result.current.addRisk(invalidRisk);
        });
      }).toThrow('Risk mitigation strategy is required');
    });
  });

  describe('Risk Probability Validation (Requirement 7.2)', () => {
    it('should accept probability values from 1 to 5', () => {
      const { result } = renderHook(() => useApp(), { wrapper });

      for (let prob = 1; prob <= 5; prob++) {
        const risk: Risk = {
          id: `risk-${prob}`,
          title: `Risk ${prob}`,
          description: 'Test',
          probability: prob,
          impact: 3,
          score: prob * 3,
          mitigation: 'Test',
          owner: 'Franco',
          status: 'open',
        };

        act(() => {
          result.current.addRisk(risk);
        });
      }

      expect(result.current.risks).toHaveLength(5);
    });

    it('should reject probability less than 1', () => {
      const { result } = renderHook(() => useApp(), { wrapper });

      const invalidRisk: Risk = {
        id: 'risk-1',
        title: 'Test Risk',
        description: 'Test',
        probability: 0,
        impact: 3,
        score: 0,
        mitigation: 'Test',
        owner: 'Franco',
        status: 'open',
      };

      expect(() => {
        act(() => {
          result.current.addRisk(invalidRisk);
        });
      }).toThrow('Risk probability must be an integer between 1 and 5');
    });

    it('should reject probability greater than 5', () => {
      const { result } = renderHook(() => useApp(), { wrapper });

      const invalidRisk: Risk = {
        id: 'risk-1',
        title: 'Test Risk',
        description: 'Test',
        probability: 6,
        impact: 3,
        score: 18,
        mitigation: 'Test',
        owner: 'Franco',
        status: 'open',
      };

      expect(() => {
        act(() => {
          result.current.addRisk(invalidRisk);
        });
      }).toThrow('Risk probability must be an integer between 1 and 5');
    });

    it('should reject non-integer probability', () => {
      const { result } = renderHook(() => useApp(), { wrapper });

      const invalidRisk: Risk = {
        id: 'risk-1',
        title: 'Test Risk',
        description: 'Test',
        probability: 2.5,
        impact: 3,
        score: 7.5,
        mitigation: 'Test',
        owner: 'Franco',
        status: 'open',
      };

      expect(() => {
        act(() => {
          result.current.addRisk(invalidRisk);
        });
      }).toThrow('Risk probability must be an integer between 1 and 5');
    });
  });

  describe('Risk Impact Validation (Requirement 7.3)', () => {
    it('should accept impact values from 1 to 5', () => {
      const { result } = renderHook(() => useApp(), { wrapper });

      for (let imp = 1; imp <= 5; imp++) {
        const risk: Risk = {
          id: `risk-${imp}`,
          title: `Risk ${imp}`,
          description: 'Test',
          probability: 3,
          impact: imp,
          score: 3 * imp,
          mitigation: 'Test',
          owner: 'Franco',
          status: 'open',
        };

        act(() => {
          result.current.addRisk(risk);
        });
      }

      expect(result.current.risks).toHaveLength(5);
    });

    it('should reject impact less than 1', () => {
      const { result } = renderHook(() => useApp(), { wrapper });

      const invalidRisk: Risk = {
        id: 'risk-1',
        title: 'Test Risk',
        description: 'Test',
        probability: 3,
        impact: 0,
        score: 0,
        mitigation: 'Test',
        owner: 'Franco',
        status: 'open',
      };

      expect(() => {
        act(() => {
          result.current.addRisk(invalidRisk);
        });
      }).toThrow('Risk impact must be an integer between 1 and 5');
    });

    it('should reject impact greater than 5', () => {
      const { result } = renderHook(() => useApp(), { wrapper });

      const invalidRisk: Risk = {
        id: 'risk-1',
        title: 'Test Risk',
        description: 'Test',
        probability: 3,
        impact: 6,
        score: 18,
        mitigation: 'Test',
        owner: 'Franco',
        status: 'open',
      };

      expect(() => {
        act(() => {
          result.current.addRisk(invalidRisk);
        });
      }).toThrow('Risk impact must be an integer between 1 and 5');
    });

    it('should reject non-integer impact', () => {
      const { result } = renderHook(() => useApp(), { wrapper });

      const invalidRisk: Risk = {
        id: 'risk-1',
        title: 'Test Risk',
        description: 'Test',
        probability: 3,
        impact: 3.7,
        score: 11.1,
        mitigation: 'Test',
        owner: 'Franco',
        status: 'open',
      };

      expect(() => {
        act(() => {
          result.current.addRisk(invalidRisk);
        });
      }).toThrow('Risk impact must be an integer between 1 and 5');
    });
  });

  describe('Risk Score Calculation (Requirements 7.4, 7.6)', () => {
    it('should calculate score as probability * impact on creation', () => {
      const { result } = renderHook(() => useApp(), { wrapper });

      const risk: Risk = {
        id: 'risk-1',
        title: 'Test Risk',
        description: 'Test',
        probability: 3,
        impact: 4,
        score: 0, // Will be overridden
        mitigation: 'Test',
        owner: 'Franco',
        status: 'open',
      };

      act(() => {
        result.current.addRisk(risk);
      });

      expect(result.current.risks[0].score).toBe(12);
    });

    it('should recalculate score when probability is updated', () => {
      const { result } = renderHook(() => useApp(), { wrapper });

      const risk: Risk = {
        id: 'risk-1',
        title: 'Test Risk',
        description: 'Test',
        probability: 2,
        impact: 3,
        score: 6,
        mitigation: 'Test',
        owner: 'Franco',
        status: 'open',
      };

      act(() => {
        result.current.addRisk(risk);
      });

      expect(result.current.risks[0].score).toBe(6);

      act(() => {
        result.current.updateRisk('risk-1', { probability: 4 });
      });

      expect(result.current.risks[0].score).toBe(12); // 4 * 3
    });

    it('should recalculate score when impact is updated', () => {
      const { result } = renderHook(() => useApp(), { wrapper });

      const risk: Risk = {
        id: 'risk-1',
        title: 'Test Risk',
        description: 'Test',
        probability: 3,
        impact: 2,
        score: 6,
        mitigation: 'Test',
        owner: 'Franco',
        status: 'open',
      };

      act(() => {
        result.current.addRisk(risk);
      });

      expect(result.current.risks[0].score).toBe(6);

      act(() => {
        result.current.updateRisk('risk-1', { impact: 5 });
      });

      expect(result.current.risks[0].score).toBe(15); // 3 * 5
    });

    it('should recalculate score when both probability and impact are updated', () => {
      const { result } = renderHook(() => useApp(), { wrapper });

      const risk: Risk = {
        id: 'risk-1',
        title: 'Test Risk',
        description: 'Test',
        probability: 2,
        impact: 2,
        score: 4,
        mitigation: 'Test',
        owner: 'Franco',
        status: 'open',
      };

      act(() => {
        result.current.addRisk(risk);
      });

      expect(result.current.risks[0].score).toBe(4);

      act(() => {
        result.current.updateRisk('risk-1', { probability: 5, impact: 5 });
      });

      expect(result.current.risks[0].score).toBe(25); // 5 * 5
    });
  });

  describe('Risk Mitigation Storage (Requirement 7.7)', () => {
    it('should store mitigation text with risk', () => {
      const { result } = renderHook(() => useApp(), { wrapper });

      const risk: Risk = {
        id: 'risk-1',
        title: 'Security Breach',
        description: 'Potential security vulnerability',
        probability: 4,
        impact: 5,
        score: 20,
        mitigation: 'Implement security audit and penetration testing',
        owner: 'Franco',
        status: 'open',
      };

      act(() => {
        result.current.addRisk(risk);
      });

      expect(result.current.risks[0].mitigation).toBe('Implement security audit and penetration testing');
    });

    it('should update mitigation text', () => {
      const { result } = renderHook(() => useApp(), { wrapper });

      const risk: Risk = {
        id: 'risk-1',
        title: 'Test Risk',
        description: 'Test',
        probability: 3,
        impact: 3,
        score: 9,
        mitigation: 'Initial mitigation',
        owner: 'Franco',
        status: 'open',
      };

      act(() => {
        result.current.addRisk(risk);
      });

      act(() => {
        result.current.updateRisk('risk-1', { mitigation: 'Updated mitigation strategy' });
      });

      expect(result.current.risks[0].mitigation).toBe('Updated mitigation strategy');
    });

    it('should allow empty string for mitigation', () => {
      const { result } = renderHook(() => useApp(), { wrapper });

      const risk: Risk = {
        id: 'risk-1',
        title: 'Test Risk',
        description: 'Test',
        probability: 3,
        impact: 3,
        score: 9,
        mitigation: '',
        owner: 'Franco',
        status: 'open',
      };

      act(() => {
        result.current.addRisk(risk);
      });

      expect(result.current.risks[0].mitigation).toBe('');
    });
  });

  describe('Risk Update Operations', () => {
    it('should update risk properties', () => {
      const { result } = renderHook(() => useApp(), { wrapper });

      const risk: Risk = {
        id: 'risk-1',
        title: 'Original Title',
        description: 'Original Description',
        probability: 2,
        impact: 2,
        score: 4,
        mitigation: 'Original Mitigation',
        owner: 'Franco',
        status: 'open',
      };

      act(() => {
        result.current.addRisk(risk);
      });

      act(() => {
        result.current.updateRisk('risk-1', {
          title: 'Updated Title',
          description: 'Updated Description',
          status: 'mitigated',
        });
      });

      expect(result.current.risks[0].title).toBe('Updated Title');
      expect(result.current.risks[0].description).toBe('Updated Description');
      expect(result.current.risks[0].status).toBe('mitigated');
    });

    it('should throw error when updating non-existent risk', () => {
      const { result } = renderHook(() => useApp(), { wrapper });

      expect(() => {
        act(() => {
          result.current.updateRisk('non-existent', { title: 'Test' });
        });
      }).toThrow('Risk with id "non-existent" does not exist');
    });
  });

  describe('Risk Deletion', () => {
    it('should delete a risk', () => {
      const { result } = renderHook(() => useApp(), { wrapper });

      const risk: Risk = {
        id: 'risk-1',
        title: 'Test Risk',
        description: 'Test',
        probability: 3,
        impact: 3,
        score: 9,
        mitigation: 'Test',
        owner: 'Franco',
        status: 'open',
      };

      act(() => {
        result.current.addRisk(risk);
      });

      expect(result.current.risks).toHaveLength(1);

      act(() => {
        result.current.deleteRisk('risk-1');
      });

      expect(result.current.risks).toHaveLength(0);
    });
  });
});
