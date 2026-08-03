import { useEffect, useRef } from 'react';
import { SkipForward } from 'lucide-react';
import clsx from 'clsx';
import { useTimerStore, type Mode } from '../store';
import { CircularProgress } from './CircularProgress';
import { playEndSound } from '../utils/sound';

export const TimerSection: React.FC = () => {
  const { mode, setMode, isRunning, setIsRunning, timeLeft, setTimeLeft, addSession, durations } = useTimerStore();
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      timerRef.current = window.setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      playEndSound();
      addSession({
        id: crypto.randomUUID(),
        mode,
        duration: durations[mode],
        timestamp: Date.now()
      });
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, timeLeft, mode, setTimeLeft, setIsRunning, addSession]);

  const handleModeChange = (newMode: Mode) => {
    if (isRunning) {
      if (!confirm('타이머가 실행 중입니다. 다른 모드로 전환하시겠습니까?')) return;
    }
    setMode(newMode);
  };

  return (
    <div className="glass-card">
      {/* Mode Selector Tabs Capsule */}
      <div className="tabs-container">
        <button 
          className={clsx('tab-button', mode === 'focus' && 'active')}
          onClick={() => handleModeChange('focus')}
        >
          집중
        </button>
        <button 
          className={clsx('tab-button', mode === 'shortBreak' && 'active')}
          onClick={() => handleModeChange('shortBreak')}
        >
          짧은 휴식
        </button>
        <button 
          className={clsx('tab-button', mode === 'longBreak' && 'active')}
          onClick={() => handleModeChange('longBreak')}
        >
          긴 휴식
        </button>
      </div>

      {/* Circular Timer Visual */}
      <CircularProgress />

      {/* Footer Controls / Skip */}
      <div style={{ display: 'flex', justifyContent: 'center', height: '24px' }}>
        {isRunning && (
          <button 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px', 
              color: 'var(--text-muted)', 
              fontSize: '0.85rem',
              fontWeight: 500,
              padding: '4px 12px',
              borderRadius: '12px',
              background: 'rgba(255, 255, 255, 0.4)'
            }} 
            onClick={() => {
              setIsRunning(false);
              playEndSound();
              const elapsed = durations[mode] - timeLeft;
              if (elapsed > 0) {
                addSession({
                  id: crypto.randomUUID(),
                  mode,
                  duration: elapsed,
                  timestamp: Date.now()
                });
              }
              setTimeLeft(0);
            }}
          >
            <SkipForward size={14} /> 건너뛰기
          </button>
        )}
      </div>
    </div>
  );
};
