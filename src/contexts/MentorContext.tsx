import React, { createContext, useContext, useState, useEffect } from 'react';
import { MentorPair, Course } from '../types';
import { getMentorPairsByCourse } from '../data/mentors';
import { saveToLocalStorage, getFromLocalStorage } from '../utils/auth';

interface MentorContextType {
  mentorPairs: MentorPair[];
  selectedPair: MentorPair | null;
  loadMentors: (course: Course) => void;
  selectMentorPair: (pair: MentorPair) => void;
  resetSelection: () => void;
}

const MentorContext = createContext<MentorContextType>({
  mentorPairs: [],
  selectedPair: null,
  loadMentors: () => {},
  selectMentorPair: () => {},
  resetSelection: () => {},
});

export const useMentors = () => useContext(MentorContext);

export const MentorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mentorPairs, setMentorPairs] = useState<MentorPair[]>([]);
  const [selectedPair, setSelectedPair] = useState<MentorPair | null>(null);
  
  // Load previously selected mentor pair from localStorage
  useEffect(() => {
    const savedSelection = getFromLocalStorage<string | null>('selectedMentorPair', null);
    if (savedSelection) {
      try {
        const pairData = JSON.parse(savedSelection) as MentorPair;
        setSelectedPair(pairData);
      } catch (error) {
        console.error('Failed to parse saved mentor pair', error);
      }
    }
  }, []);
  
  const loadMentors = (course: Course) => {
    const pairs = getMentorPairsByCourse(course);
    
    if (!Array.isArray(pairs)) {
      console.error('Failed to load mentor pairs');
      setMentorPairs([]);
      return;
    }
    
    // Retrieve available slots data from localStorage if it exists
    const savedSlotsData = getFromLocalStorage<Record<string, number>>('mentorSlots', {});
    
    // Update the pairs with the saved slots data
    const updatedPairs = pairs.map(pair => {
      const key = `${pair.pair[0].name}_${pair.pair[1].name}`;
      const savedSlots = savedSlotsData[key];
      
      return {
        ...pair,
        availableSlots: typeof savedSlots === 'number' ? savedSlots : pair.availableSlots
      };
    });
    
    setMentorPairs(updatedPairs);
  };
  
  const selectMentorPair = (pair: MentorPair) => {
    if (pair.availableSlots <= 0) return;
    
    // Update available slots
    const updatedPairs = mentorPairs.map(p => {
      if (p.pair[0].name === pair.pair[0].name && p.pair[1].name === pair.pair[1].name) {
        return { ...p, availableSlots: p.availableSlots - 1 };
      }
      return p;
    });
    
    // Update selected pair with reduced slots
    const updatedPair = { ...pair, availableSlots: pair.availableSlots - 1 };
    
    // Save the updated slots to localStorage
    const slotsData: Record<string, number> = {};
    updatedPairs.forEach(p => {
      const key = `${p.pair[0].name}_${p.pair[1].name}`;
      slotsData[key] = p.availableSlots;
    });
    
    saveToLocalStorage('mentorSlots', slotsData);
    saveToLocalStorage('selectedMentorPair', JSON.stringify(updatedPair));
    
    setMentorPairs(updatedPairs);
    setSelectedPair(updatedPair);
  };
  
  const resetSelection = () => {
    setSelectedPair(null);
    localStorage.removeItem('selectedMentorPair');
  };
  
  return (
    <MentorContext.Provider 
      value={{ 
        mentorPairs, 
        selectedPair, 
        loadMentors, 
        selectMentorPair,
        resetSelection
      }}
    >
      {children}
    </MentorContext.Provider>
  );
};