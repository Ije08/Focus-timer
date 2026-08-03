import React from 'react';
import { X, Calendar as CalendarIcon, Clock, TrendingUp } from 'lucide-react';
import { useTimerStore } from '../store';
import { format, subDays, isSameDay } from 'date-fns';

interface AnalyticsModalProps {
  onClose: () => void;
}

export const AnalyticsModal: React.FC<AnalyticsModalProps> = ({ onClose }) => {
  const { sessions } = useTimerStore();

  // Overview Stats
  const totalFocusSec = sessions.filter(s => s.mode === 'focus').reduce((acc, s) => acc + s.duration, 0);
  const totalHours = Math.floor(totalFocusSec / 3600);
  const totalMinutes = Math.floor((totalFocusSec % 3600) / 60);
  const totalSessions = sessions.filter(s => s.mode === 'focus').length;

  // Simple Heatmap (last 35 days to make a nice 5-week grid)
  const today = new Date();
  const heatmapDays = Array.from({ length: 35 }).map((_, i) => {
    const d = subDays(today, 34 - i); // 34 days ago up to today
    const daySessions = sessions.filter(s => s.mode === 'focus' && isSameDay(new Date(s.timestamp), d));
    const mins = daySessions.reduce((acc, s) => acc + s.duration, 0) / 60;
    
    // Determine intensity (0 to 4)
    let intensity = 0;
    if (mins > 0 && mins <= 25) intensity = 1;
    else if (mins > 25 && mins <= 60) intensity = 2;
    else if (mins > 60 && mins <= 120) intensity = 3;
    else if (mins > 120) intensity = 4;

    return { date: d, mins, intensity };
  });

  const getHeatmapColor = (intensity: number) => {
    switch (intensity) {
      case 1: return '#bfdbfe'; // faint blue
      case 2: return '#60a5fa'; // medium blue
      case 3: return '#3b82f6'; // primary blue
      case 4: return '#1d4ed8'; // deep blue
      default: return 'rgba(0, 0, 0, 0.04)'; // empty
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(255, 255, 255, 0.65)',
      backdropFilter: 'blur(20px)',
      zIndex: 9999,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '20px',
      animation: 'fadeIn 0.2s ease-out'
    }}>
      <div style={{
        background: 'var(--card-glass-bg)',
        border: '1px solid var(--card-glass-border)',
        boxShadow: 'var(--card-shadow)',
        borderRadius: '32px',
        width: '100%',
        maxWidth: '700px',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '32px 32px 20px 32px' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-dark)' }}>상세 분석 및 기록</h2>
          <button onClick={onClose} className="btn-icon" style={{ background: 'rgba(0,0,0,0.05)' }}>
            <X size={24} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div style={{ overflowY: 'auto', padding: '0 32px 32px 32px' }}>
          
          {/* Overview */}
          <div style={{ display: 'flex', gap: '16px', marginBottom: '32px' }}>
            <div style={{ flex: 1, background: 'rgba(255,255,255,0.6)', padding: '20px', borderRadius: '24px', display: 'flex', flexDirection: 'column', gap: '8px', border: '1px solid rgba(255,255,255,0.5)' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}><Clock size={16} /> 총 누적 집중 시간</span>
              <span style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary-blue)', letterSpacing: '-0.5px' }}>{totalHours}h {totalMinutes}m</span>
            </div>
            <div style={{ flex: 1, background: 'rgba(255,255,255,0.6)', padding: '20px', borderRadius: '24px', display: 'flex', flexDirection: 'column', gap: '8px', border: '1px solid rgba(255,255,255,0.5)' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}><TrendingUp size={16} /> 총 집중 세션</span>
              <span style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-dark)', letterSpacing: '-0.5px' }}>{totalSessions} 회</span>
            </div>
          </div>

          {/* Heatmap */}
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px', color: 'var(--text-dark)' }}>최근 35일 집중도 히트맵</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', background: 'rgba(255,255,255,0.4)', padding: '24px', borderRadius: '24px', marginBottom: '36px', border: '1px solid rgba(255,255,255,0.3)' }}>
            {heatmapDays.map((day, i) => (
              <div 
                key={i} 
                title={`${format(day.date, 'yyyy-MM-dd')} : ${Math.round(day.mins)}분 집중`}
                style={{
                  width: 'calc(100% / 7 - 6px)', 
                  aspectRatio: '1/1',
                  background: getHeatmapColor(day.intensity),
                  borderRadius: '8px',
                  cursor: 'help',
                  transition: 'transform 0.1s ease',
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
              />
            ))}
          </div>

          {/* History List */}
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px', color: 'var(--text-dark)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CalendarIcon size={18} /> 모든 타임라인 기록
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {sessions.length === 0 ? (
               <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.4)', borderRadius: '20px' }}>기록이 존재하지 않습니다.</div>
            ) : (
              [...sessions].reverse().map((session) => (
                <div key={session.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.6)', padding: '16px 20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.5)' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-dark)' }}>
                      {session.mode === 'focus' ? '집중 시간' : (session.mode === 'shortBreak' ? '짧은 휴식' : '긴 휴식')}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                      {format(new Date(session.timestamp), 'yyyy년 MM월 dd일 HH:mm')}
                    </span>
                  </div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: session.mode === 'focus' ? 'var(--primary-blue)' : '#10b981' }}>
                    +{Math.round(session.duration / 60)}분
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
