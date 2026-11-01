import { useState, useEffect, useCallback } from 'react';
import { caseApi, DiscoverClueResponse } from '../api/caseApi.ts';
import { PublicCase, CaseResult } from '../../server/services/serializers.ts';
import { ApiClientError } from '../api/axiosClient.ts';

export function useCase(caseId: string | undefined) {
  const [caseData, setCaseData] = useState<PublicCase | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<ApiClientError | null>(null);

  const [discoveringClueId, setDiscoveringClueId] = useState<string | null>(null);
  const [requestingHint, setRequestingHint] = useState<boolean>(false);
  const [submittingAccusation, setSubmittingAccusation] = useState<boolean>(false);

  const fetchCase = useCallback(async () => {
    if (!caseId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await caseApi.getCase(caseId);
      setCaseData(data);
    } catch (err: unknown) {
      setError(err as ApiClientError);
    } finally {
      setLoading(false);
    }
  }, [caseId]);

  useEffect(() => {
    fetchCase();
  }, [fetchCase]);

  const discoverClue = async (clueId: string): Promise<DiscoverClueResponse['data'] | null> => {
    if (!caseId) return null;
    setDiscoveringClueId(clueId);
    try {
      const result = await caseApi.discoverClue(caseId, clueId);

      setCaseData((prev) => {
        if (!prev) return null;
        const updatedClues = prev.clues.map((c) => {
          if (c.id === clueId) {
            return {
              ...c,
              discovered: true,
              content: result.clue.content,
            };
          }
          return c;
        });

        return {
          ...prev,
          clues: updatedClues,
          progress: result.progress,
        };
      });

      return result;
    } catch (err: unknown) {
      setError(err as ApiClientError);
      return null;
    } finally {
      setDiscoveringClueId(null);
    }
  };

  const claimHint = async () => {
    if (!caseId) return;
    setRequestingHint(true);
    try {
      const result = await caseApi.claimHint(caseId);

      setCaseData((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          hints: [...prev.hints, result.hint],
          progress: result.progress,
        };
      });
    } catch (err: unknown) {
      setError(err as ApiClientError);
    } finally {
      setRequestingHint(false);
    }
  };

  const accuseSuspect = async (suspectId: string): Promise<CaseResult | null> => {
    if (!caseId) return null;
    setSubmittingAccusation(true);
    try {
      const result = await caseApi.accuse(caseId, suspectId);
      setCaseData((prev) => (prev ? { ...prev, status: 'completed' } : null));
      return result;
    } catch (err: unknown) {
      setError(err as ApiClientError);
      throw err;
    } finally {
      setSubmittingAccusation(false);
    }
  };

  return {
    caseData,
    loading,
    error,
    refetch: fetchCase,
    discoverClue,
    discoveringClueId,
    claimHint,
    requestingHint,
    accuseSuspect,
    submittingAccusation,
  };
}
