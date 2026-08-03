import { useTimerStore, type Mode } from '../store';
import { playStartSound, playEndSound } from '../utils/sound';

export const PipWidget = () => {
  const { timeLeft, mode, setMode, isRunning, setIsRunning, resetTimer, durations, setTimeLeft, addSession } = useTimerStore();

  const totalDuration = durations[mode];
  const progress = ((totalDuration - timeLeft) / totalDuration) * 100;

  const radius = 68;
  const stroke = 6;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  const getColor = () => {
    switch (mode) {
      case 'focus': return '#3b82f6';
      case 'shortBreak': return '#10b981';
      case 'longBreak': return '#8b5cf6';
      default: return '#3b82f6';
    }
  };

  const handleModeChange = (newMode: Mode) => {
    if (isRunning) {
      if (!confirm('타이머가 실행 중입니다. 전환하시겠습니까?')) return;
    }
    setMode(newMode);
  };

  const handleMainAction = () => {
    if (timeLeft === 0) {
      resetTimer();
      setIsRunning(true);
      playStartSound();
    } else {
      if (!isRunning) playStartSound();
      setIsRunning(!isRunning);
    }
  };

  const handleSkip = () => {
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
  };

  const accentColor = getColor();

  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '10px',
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
      userSelect: 'none',
      padding: '4px 0'
    }}>
      {/* Mode Selector Capsule */}
      <div style={{
        display: 'flex',
        gap: '4px',
        background: 'rgba(0, 0, 0, 0.05)',
        padding: '3px',
        borderRadius: '999px',
      }}>
        <button
          onClick={() => handleModeChange('focus')}
          style={{
            padding: '4px 10px',
            borderRadius: '999px',
            fontSize: '0.72rem',
            fontWeight: mode === 'focus' ? 700 : 500,
            border: 'none',
            background: mode === 'focus' ? '#ffffff' : 'transparent',
            color: mode === 'focus' ? '#3b82f6' : '#64748b',
            boxShadow: mode === 'focus' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
            cursor: 'pointer',
          }}
        >
          집중
        </button>
        <button
          onClick={() => handleModeChange('shortBreak')}
          style={{
            padding: '4px 10px',
            borderRadius: '999px',
            fontSize: '0.72rem',
            fontWeight: mode === 'shortBreak' ? 700 : 500,
            border: 'none',
            background: mode === 'shortBreak' ? '#ffffff' : 'transparent',
            color: mode === 'shortBreak' ? '#10b981' : '#64748b',
            boxShadow: mode === 'shortBreak' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
            cursor: 'pointer',
          }}
        >
          짧은 휴식
        </button>
        <button
          onClick={() => handleModeChange('longBreak')}
          style={{
            padding: '4px 10px',
            borderRadius: '999px',
            fontSize: '0.72rem',
            fontWeight: mode === 'longBreak' ? 700 : 500,
            border: 'none',
            background: mode === 'longBreak' ? '#ffffff' : 'transparent',
            color: mode === 'longBreak' ? '#8b5cf6' : '#64748b',
            boxShadow: mode === 'longBreak' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
            cursor: 'pointer',
          }}
        >
          긴 휴식
        </button>
      </div>

      {/* Compact Circular Progress */}
      <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <svg
          height={radius * 2}
          width={radius * 2}
          style={{ transform: 'rotate(-90deg)' }}
        >
          <circle
            stroke="rgba(0, 0, 0, 0.06)"
            fill="transparent"
            strokeWidth={stroke}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
          <circle
            stroke={accentColor}
            fill="transparent"
            strokeWidth={stroke}
            strokeDasharray={circumference + ' ' + circumference}
            style={{ strokeDashoffset, transition: 'stroke-dashoffset 0.8s ease-in-out' }}
            strokeLinecap="round"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
        </svg>

        <span style={{
          position: 'absolute',
          fontSize: '1.9rem',
          fontWeight: 800,
          color: '#1e293b',
          letterSpacing: '-1px',
        }}>
          {formattedTime}
        </span>
      </div>

      {/* Compact Controls */}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <button
          onClick={handleMainAction}
          style={{
            padding: '7px 24px',
            borderRadius: '999px',
            border: 'none',
            background: accentColor,
            color: '#fff',
            fontWeight: 700,
            fontSize: '0.85rem',
            cursor: 'pointer',
            transition: 'opacity 0.15s',
          }}
          onMouseOver={(e) => e.currentTarget.style.opacity = '0.85'}
          onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
        >
          {timeLeft === 0 ? '재시작' : (isRunning ? '일시정지' : '시작')}
        </button>

        {isRunning && (
          <button
            onClick={handleSkip}
            style={{
              padding: '7px 14px',
              borderRadius: '999px',
              border: '1.5px solid rgba(0,0,0,0.12)',
              background: 'rgba(255,255,255,0.7)',
              color: '#64748b',
              fontWeight: 600,
              fontSize: '0.8rem',
              cursor: 'pointer',
              transition: 'background 0.15s',
            }}
            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.95)'}
            onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.7)'}
          >
            건너뛰기
          </button>
        )}
      </div>
    </div>
  );
};
