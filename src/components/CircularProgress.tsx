import { useTimerStore } from '../store';
import { playStartSound } from '../utils/sound';

export const CircularProgress: React.FC = () => {
  const { timeLeft, mode, isRunning, setIsRunning, resetTimer, durations } = useTimerStore();
  
  const totalDuration = durations[mode];
  const progress = ((totalDuration - timeLeft) / totalDuration) * 100;
  
  const radius = 165;
  const stroke = 12;
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

  const getLabel = () => {
    switch (mode) {
      case 'focus': return '집중 시간';
      case 'shortBreak': return '휴식 시간';
      case 'longBreak': return '긴 휴식 시간';
      default: return '';
    }
  };

  return (
    <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '32px 0 20px 0' }}>
      <svg
        height={radius * 2}
        width={radius * 2}
        style={{ transform: 'rotate(-90deg)', filter: 'drop-shadow(0px 8px 16px rgba(59, 130, 246, 0.15))' }}
      >
        {/* Outer Background Track */}
        <circle
          stroke="rgba(255, 255, 255, 0.6)"
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        {/* Progress Fill */}
        <circle
          stroke={getColor()}
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

      <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <span style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 500 }}>
          {getLabel()}
        </span>
        <span style={{ fontSize: '3.75rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.1, letterSpacing: '-1px' }}>
          {formattedTime}
        </span>
        <button 
          className="btn-primary" 
          style={{ marginTop: '20px', backgroundColor: getColor(), minWidth: '130px' }}
          onClick={() => {
            if (timeLeft === 0) {
              resetTimer();
              setIsRunning(true);
              playStartSound();
            } else {
              if (!isRunning) playStartSound();
              setIsRunning(!isRunning);
            }
          }}
        >
          {timeLeft === 0 ? '새로 시작' : (isRunning ? '일시정지' : '시작하기')}
        </button>
        {timeLeft < totalDuration && !isRunning && (
          <button 
            style={{ marginTop: '10px', color: 'var(--text-tertiary)', fontSize: '0.85rem', fontWeight: 500 }}
            onClick={resetTimer}
          >
            리셋
          </button>
        )}
      </div>
    </div>
  );
};
