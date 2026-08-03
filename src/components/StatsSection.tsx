import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import clsx from 'clsx';
import { useTimerStore } from '../store';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import { ko } from 'date-fns/locale';

export const StatsSection: React.FC = () => {
  const { sessions } = useTimerStore();
  const [viewMode, setViewMode] = useState<'daily' | 'weekly'>('daily');

  const today = new Date();

  // Helper to format seconds -> Xh Ym Zs
  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);

    if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
    return `${minutes}m ${seconds}s`;
  };

  // --- Daily Stats Calculation ---
  const todaysSessions = sessions.filter(s => isSameDay(new Date(s.timestamp), today));
  const todaysFocusSessions = todaysSessions.filter(s => s.mode === 'focus');
  const todaysCompletedCount = todaysFocusSessions.length;
  const todaysTotalFocusSec = todaysFocusSessions.reduce((acc, s) => acc + s.duration, 0);

  const targetSessions = 4;
  const todaysCompletionRate = Math.min(100, Math.round((todaysCompletedCount / targetSessions) * 100));

  // --- Weekly Stats Calculation (This Week: Mon ~ Sun) ---
  const currentWeekStart = startOfWeek(today, { weekStartsOn: 1 }); // Monday
  
  const currentWeekSessions = sessions.filter(s => {
    const sessionDate = new Date(s.timestamp);
    const endOfWeek = addDays(currentWeekStart, 7);
    return sessionDate >= currentWeekStart && sessionDate < endOfWeek;
  });

  const weeklyFocusSec = currentWeekSessions
    .filter(s => s.mode === 'focus')
    .reduce((acc, s) => acc + s.duration, 0);

  const weeklyBreakSec = currentWeekSessions
    .filter(s => s.mode === 'shortBreak' || s.mode === 'longBreak')
    .reduce((acc, s) => acc + s.duration, 0);

  // --- Weekly Chart Data (Mon ~ Sun order) ---
  const weeklyChartData = Array.from({ length: 7 }).map((_, i) => {
    const date = addDays(currentWeekStart, i);
    const daySessions = sessions.filter(s => isSameDay(new Date(s.timestamp), date));
    
    const focusSec = daySessions
      .filter(s => s.mode === 'focus')
      .reduce((acc, s) => acc + s.duration, 0);

    const breakSec = daySessions
      .filter(s => s.mode === 'shortBreak' || s.mode === 'longBreak')
      .reduce((acc, s) => acc + s.duration, 0);

    return {
      name: format(date, 'EEE', { locale: ko }), // 월, 화, 수, 목, 금, 토, 일
      focusMins: Math.round((focusSec / 60) * 10) / 10,
      breakMins: Math.round((breakSec / 60) * 10) / 10,
    };
  });

  // --- Daily Chart Data (Starting from the first recorded session hour today) ---
  let startHour = today.getHours();
  if (todaysSessions.length > 0) {
    startHour = Math.min(...todaysSessions.map(s => new Date(s.timestamp).getHours()));
  }

  const numSlots = 7;
  const dailyChartData = Array.from({ length: numSlots }).map((_, i) => {
    const slotHour = (startHour + i) % 24;
    const label = `${String(slotHour).padStart(2, '0')}시`;
    
    const binSessions = todaysFocusSessions.filter(s => {
      const h = new Date(s.timestamp).getHours();
      return h === slotHour;
    });

    const focusSec = binSessions.reduce((acc, s) => acc + s.duration, 0);

    return {
      name: label,
      focusMins: Math.round((focusSec / 60) * 10) / 10,
    };
  });

  const chartData = viewMode === 'daily' ? dailyChartData : weeklyChartData;

  return (
    <div className="glass-card">
      {/* View Switcher Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-dark)', letterSpacing: '-0.3px' }}>
          {viewMode === 'daily' ? '오늘의 기록' : '이번 주 기록'}
        </h3>
        
        {/* Toggle Pills */}
        <div style={{
          display: 'flex',
          gap: '4px',
          background: 'rgba(255, 255, 255, 0.45)',
          backdropFilter: 'blur(10px)',
          padding: '4px',
          borderRadius: '9999px',
          border: '1px solid rgba(255, 255, 255, 0.7)'
        }}>
          <button
            className={clsx('tab-button', viewMode === 'daily' && 'active')}
            style={{ padding: '6px 14px', fontSize: '0.8rem' }}
            onClick={() => setViewMode('daily')}
          >
            일간
          </button>
          <button
            className={clsx('tab-button', viewMode === 'weekly' && 'active')}
            style={{ padding: '6px 14px', fontSize: '0.8rem' }}
            onClick={() => setViewMode('weekly')}
          >
            주간
          </button>
        </div>
      </div>
      
      {/* Metrics List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
        {viewMode === 'daily' ? (
          <>
            <div className="metric-row">
              <span className="metric-label">집중 세션</span>
              <span className="metric-value">{todaysCompletedCount} 세션</span>
            </div>
            <div className="metric-row">
              <span className="metric-label">총 집중 시간</span>
              <span className="metric-value">{formatTime(todaysTotalFocusSec)}</span>
            </div>
            <div className="metric-row">
              <span className="metric-label">달성률</span>
              <span className="metric-value">{todaysCompletionRate}%</span>
            </div>
          </>
        ) : (
          <>
            <div className="metric-row">
              <span className="metric-label">주간 총 집중</span>
              <span className="metric-value" style={{ color: 'var(--primary-blue)' }}>{formatTime(weeklyFocusSec)}</span>
            </div>
            <div className="metric-row">
              <span className="metric-label">주간 총 휴식</span>
              <span className="metric-value" style={{ color: '#10b981' }}>{formatTime(weeklyBreakSec)}</span>
            </div>
            <div className="metric-row">
              <span className="metric-label">총 기록 세션</span>
              <span className="metric-value">{currentWeekSessions.length} 회</span>
            </div>
          </>
        )}
      </div>

      {/* Bar Chart */}
      <div style={{ flex: 1, minHeight: '190px', marginTop: 'auto' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: 'var(--text-muted)', fontSize: 11, fontWeight: 500 }} 
              dy={6}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: 'var(--text-light)', fontSize: 11 }}
              tickFormatter={(value) => `${value}m`}
            />
            <Tooltip 
              formatter={(value: any) => [`${value}분`, '']} 
              contentStyle={{ background: 'rgba(255, 255, 255, 0.9)', borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
            />
            {viewMode === 'weekly' && <Legend iconType="circle" wrapperStyle={{ paddingTop: '8px', fontSize: '12px' }} />}
            
            {viewMode === 'daily' ? (
              <Bar dataKey="focusMins" name="집중 시간" fill="var(--primary-blue)" radius={[6, 6, 6, 6]} barSize={16} />
            ) : (
              <>
                <Bar dataKey="focusMins" name="집중 시간" stackId="a" fill="var(--primary-blue)" radius={[0, 0, 4, 4]} barSize={16} />
                <Bar dataKey="breakMins" name="휴식 시간" stackId="a" fill="#10b981" radius={[4, 4, 0, 0]} barSize={16} />
              </>
            )}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
