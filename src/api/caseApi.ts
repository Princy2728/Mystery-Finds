import { apiClient } from './axiosClient.ts';
import {
  PublicCase,
  CaseProgress,
  PublicClue,
  PublicHint,
  CaseResult,
} from '../../server/services/serializers.ts';

export interface CreateCaseResponse {
  success: boolean;
  data: {
    case: PublicCase;
  };
}

export interface GetCaseResponse {
  success: boolean;
  data: {
    case: PublicCase;
  };
}

export interface DiscoverClueResponse {
  success: boolean;
  data: {
    clue: {
      id: string;
      title: string;
      content: string;
    };
    alreadyDiscovered: boolean;
    progress: CaseProgress;
  };
}

export interface ClaimHintResponse {
  success: boolean;
  data: {
    hint: PublicHint;
    progress: CaseProgress;
  };
}

export interface AccuseResponse {
  success: boolean;
  data: {
    result: CaseResult;
  };
}

export interface GetResultResponse {
  success: boolean;
  data: {
    result: CaseResult;
  };
}

export const caseApi = {
  async createCase(premise: string, difficulty: 'easy' | 'medium' | 'hard'): Promise<PublicCase> {
    const res = await apiClient.post<CreateCaseResponse>('/cases', { premise, difficulty });
    return res.data.data.case;
  },

  async getCase(id: string): Promise<PublicCase> {
    const res = await apiClient.get<GetCaseResponse>(`/cases/${id}`);
    return res.data.data.case;
  },

  async discoverClue(id: string, clueId: string): Promise<DiscoverClueResponse['data']> {
    const res = await apiClient.post<DiscoverClueResponse>(`/cases/${id}/clues/${clueId}/discover`);
    return res.data.data;
  },

  async claimHint(id: string): Promise<ClaimHintResponse['data']> {
    const res = await apiClient.post<ClaimHintResponse>(`/cases/${id}/hints`);
    return res.data.data;
  },

  async accuse(id: string, suspectId: string): Promise<CaseResult> {
    const res = await apiClient.post<AccuseResponse>(`/cases/${id}/accuse`, { suspectId });
    return res.data.data.result;
  },

  async getResult(id: string): Promise<CaseResult> {
    const res = await apiClient.get<GetResultResponse>(`/cases/${id}/result`);
    return res.data.data.result;
  },

  async getHealth(): Promise<{ status: string; db: string }> {
    const res = await apiClient.get<{ success: boolean; data: { status: string; db: string } }>('/health');
    return res.data.data;
  },
};
