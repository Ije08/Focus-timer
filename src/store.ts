import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Mode = 'focus' | 'shortBreak' | 'longBreak';

export const DEFAULT_DURATIONS: Record<Mode, number> = {
  focus: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
};

export interface SessionRecord {
  id: string;
  mode: Mode;
  duration: number; // in seconds
  timestamp: number;
}

interface TimerState {
  mode: Mode;
  timeLeft: number;
  isRunning: boolean;
  durations: Record<Mode, number>;
  sessions: SessionRecord[];
  
  setMode: (mode: Mode) => void;
  setTimeLeft: (time: number | ((prev: number) => number)) => void;
  setIsRunning: (isRunning: boolean) => void;
  setDurations: (newDurations: Record<Mode, number>) => void;
  addSession: (session: SessionRecord) => void;
  resetTimer: () => void;
  clearHistory: () => void;
}

export const useTimerStore = create<TimerState>()(
  persist(
    (set) => ({
      mode: 'focus',
      timeLeft: DEFAULT_DURATIONS.focus,
      isRunning: false,
      durations: DEFAULT_DURATIONS,
      sessions: [],

      setMode: (mode) => set((state) => ({ 
        mode, 
        timeLeft: state.durations[mode], 
        isRunning: false 
      })),
      
      setTimeLeft: (time) => set((state) => ({ 
        timeLeft: typeof time === 'function' ? time(state.timeLeft) : time 
      })),
      
      setIsRunning: (isRunning) => set({ isRunning }),

      setDurations: (newDurations) => set((state) => {
        const updatedDurations = { ...state.durations, ...newDurations };
        return {
          durations: updatedDurations,
          timeLeft: updatedDurations[state.mode],
          isRunning: false,
        };
      }),
      
      addSession: (session) => set((state) => ({ 
        sessions: [...state.sessions, session] 
      })),
      
      resetTimer: () => set((state) => ({ 
        timeLeft: state.durations[state.mode], 
        isRunning: false 
      })),

      clearHistory: () => set({ sessions: [] })
    }),
    {
      name: 'focus-timer-storage',
      partialize: (state) => ({ 
        sessions: state.sessions,
        durations: state.durations
      }),
    }
  )
);
