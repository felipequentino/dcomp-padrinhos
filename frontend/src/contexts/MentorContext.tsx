import React, { createContext, useContext, useState, useCallback } from 'react';
import type { MentorPair, Course } from '../types';
import { fetchPairs } from '../lib/api';

interface MentorContextType {
  mentorPairs: MentorPair[];
  selectedPair: MentorPair | null;
  loadMentors: (course: Course) => Promise<void>;
  selectMentorPair: (pair: MentorPair) => void;
  resetSelection: () => void;
  loading: boolean;
  error: string | null;
}

const MentorContext = createContext<MentorContextType>({
  mentorPairs: [],
  selectedPair: null,
  loadMentors: async () => {},
  selectMentorPair: () => {},
  resetSelection: () => {},
  loading: false,
  error: null,
});

export const useMentors = () => useContext(MentorContext);

export const MentorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mentorPairs, setMentorPairs] = useState<MentorPair[]>([]);
  const [selectedPair, setSelectedPair] = useState<MentorPair | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadMentors = useCallback(async (course: Course) => {
    setLoading(true);
    setError(null);
    try {
      const pairs = await fetchPairs(course);
      setMentorPairs(Array.isArray(pairs) ? pairs : []);
    } catch (e) {
      setMentorPairs([]);
      setError(e instanceof Error ? e.message : 'Erro ao carregar duplas');
    } finally {
      setLoading(false);
    }
  }, []);

  const selectMentorPair = (pair: MentorPair) => {
    setSelectedPair(pair);
  };

  const resetSelection = () => {
    setSelectedPair(null);
  };

  return (
    <MentorContext.Provider
      value={{
        mentorPairs,
        selectedPair,
        loadMentors,
        selectMentorPair,
        resetSelection,
        loading,
        error,
      }}
    >
      {children}
    </MentorContext.Provider>
  );
};
