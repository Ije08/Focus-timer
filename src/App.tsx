import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Settings, AppWindow, Trash2, Check, BarChart2, Download, X } from 'lucide-react';
import { TimerSection } from './components/TimerSection';
import { StatsSection } from './components/StatsSection';
import { AnalyticsModal } from './components/AnalyticsModal';
import { PipWidget } from './components/PipWidget';
import { useTimerStore } from './store';
import './index.css';

function App() {
  const [pipWindow, setPipWindow] = useState<Window | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showClearConfirmModal, setShowClearConfirmModal] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  
  const settingsRef = useRef<HTMLDivElement>(null);
  const { durations, setDurations, clearHistory } = useTimerStore();
  
  const [focusMin, setFocusMin] = useState(Math.floor(durations.focus / 60));
  const [shortBreakMin, setShortBreakMin] = useState(Math.floor(durations.shortBreak / 60));
  const [longBreakMin, setLongBreakMin] = useState(Math.floor(durations.longBreak / 60));

  const isWidget = new URLSearchParams(window.location.search).get('widget') === 'true';

  useEffect(() => {
    setFocusMin(Math.floor(durations.focus / 60));
    setShortBreakMin(Math.floor(durations.shortBreak / 60));
    setLongBreakMin(Math.floor(durations.longBreak / 60));
  }, [durations]);

  // Click outside to close settings dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setShowSettings(false);
      }
    };
    if (showSettings) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSettings]);

  const togglePip = async () => {
    if (pipWindow) {
      pipWindow.close();
      return;
    }
    
    if ('documentPictureInPicture' in window) {
      try {
        const pip = await (window as any).documentPictureInPicture.requestWindow({
          width: 280,
          height: 330,
        });
        
        [...document.styleSheets].forEach((styleSheet) => {
          try {
            const cssRules = [...styleSheet.cssRules].map((rule) => rule.cssText).join('');
            const style = document.createElement('style');
            style.textContent = cssRules;
            pip.document.head.appendChild(style);
          } catch (e) {
            if (styleSheet.href) {
              const link = document.createElement('link');
              link.rel = 'stylesheet';
              link.type = styleSheet.type;
              link.media = styleSheet.media.mediaText;
              link.href = styleSheet.href;
              pip.document.head.appendChild(link);
            }
          }
        });

        pip.document.body.style.display = 'flex';
        pip.document.body.style.justifyContent = 'center';
        pip.document.body.style.alignItems = 'center';
        pip.document.body.style.background = 'linear-gradient(135deg, #dbeafe 0%, #e0e7ff 40%, #f3e8ff 75%, #fae8ff 100%)';
        pip.document.body.style.margin = '0';
        pip.document.body.style.padding = '10px';
        pip.document.body.style.fontFamily = 'Inter, system-ui, -apple-system, sans-serif';

        pip.addEventListener('pagehide', () => {
          setPipWindow(null);
        });

        setPipWindow(pip);
      } catch (error) {
        console.error(error);
        alert('PIP 모드를 실행할 수 없습니다.');
      }
    } else {
      alert('현재 브라우저에서는 Document PIP 기능을 지원하지 않습니다.');
    }
  };

  const handleSaveDurations = () => {
    const f = Math.max(1, focusMin);
    const sb = Math.max(1, shortBreakMin);
    const lb = Math.max(1, longBreakMin);
    
    setDurations({
      focus: f * 60,
      shortBreak: sb * 60,
      longBreak: lb * 60,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  if (isWidget) {
    document.body.style.background = 'transparent';
    return (
      <div style={{ 
        width: '100vw', height: '100vh', 
        background: 'rgba(255, 255, 255, 0.5)', 
        backdropFilter: 'blur(20px)', 
        borderRadius: '24px', 
        overflow: 'hidden', 
        padding: '16px',
        border: '1px solid rgba(255, 255, 255, 0.8)',
        boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
        WebkitAppRegion: 'drag' as any,
        display: 'flex',
        flexDirection: 'column',
        position: 'relative'
      } as any}>
        <button 
          onClick={() => window.close()} 
          style={{ position: 'absolute', top: 16, right: 16, WebkitAppRegion: 'no-drag', background: 'rgba(0,0,0,0.05)', border: 'none', borderRadius: '50%', padding: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' } as any}
        >
          <X size={18} color="#475569" />
        </button>
        <div style={{ flex: 1, WebkitAppRegion: 'no-drag', display: 'flex', flexDirection: 'column' } as any}>
          <PipWidget />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-wrapper">
        <div className="bg-cloud bg-cloud-1"></div>
        <div className="bg-cloud bg-cloud-2"></div>
        <div className="bg-cloud bg-cloud-3"></div>
      </div>

      <div className="app-viewport animate-fade-in">
        <header className="top-header">
          <h1 className="top-header-title">Focus Timer</h1>
          <div className="top-header-actions" style={{ position: 'relative' }}>
            
            {/* Desktop Widget Download */}
            <a 
              href="/downloads/FocusTimer_Widget.zip" 
              download
              className="btn-download" 
              title="데스크톱 위젯 다운로드 (.zip)"
            >
              <Download size={16} />
              <span>위젯 다운로드</span>
            </a>

            {/* Analytics Modal Toggle */}
            <button className="btn-icon" title="상세 기록 분석" onClick={() => setShowAnalytics(true)}>
              <BarChart2 size={20} />
            </button>

            {/* Settings Dropdown Wrapper */}
            <div ref={settingsRef} style={{ position: 'relative', display: 'inline-block' }}>
              <button 
                className="btn-icon" 
                title="설정"
                onClick={() => setShowSettings(!showSettings)}
              >
                <Settings size={20} />
              </button>
              
              {showSettings && (
                <div style={{
                  position: 'absolute',
                  top: '55px',
                  right: '0',
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.9)',
                  borderRadius: '20px',
                  padding: '20px',
                  boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
                  zIndex: 100,
                  width: '260px'
                }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '14px', color: 'var(--text-dark)' }}>타이머 설정 (분)</h4>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '18px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <label style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-muted)' }}>집중 시간</label>
                      <input 
                        type="number" 
                        min="1" 
                        max="180" 
                        value={focusMin} 
                        onChange={(e) => setFocusMin(Number(e.target.value))} 
                        style={{ width: '65px', padding: '6px 8px', borderRadius: '10px', border: '1px solid rgba(0,0,0,0.15)', textAlign: 'center', fontWeight: 600, outline: 'none' }} 
                      />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <label style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-muted)' }}>짧은 휴식</label>
                      <input 
                        type="number" 
                        min="1" 
                        max="60" 
                        value={shortBreakMin} 
                        onChange={(e) => setShortBreakMin(Number(e.target.value))} 
                        style={{ width: '65px', padding: '6px 8px', borderRadius: '10px', border: '1px solid rgba(0,0,0,0.15)', textAlign: 'center', fontWeight: 600, outline: 'none' }} 
                      />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <label style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-muted)' }}>긴 휴식</label>
                      <input 
                        type="number" 
                        min="1" 
                        max="60" 
                        value={longBreakMin} 
                        onChange={(e) => setLongBreakMin(Number(e.target.value))} 
                        style={{ width: '65px', padding: '6px 8px', borderRadius: '10px', border: '1px solid rgba(0,0,0,0.15)', textAlign: 'center', fontWeight: 600, outline: 'none' }} 
                      />
                    </div>
                  </div>

                  <button 
                    className="btn-primary" 
                    style={{ width: '100%', padding: '10px 0', fontSize: '0.9rem', marginBottom: '14px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px' }} 
                    onClick={handleSaveDurations}
                  >
                    {savedSuccess ? <><Check size={16} /> 저장됨</> : '시간 저장'}
                  </button>

                  <div style={{ borderTop: '1px solid rgba(0,0,0,0.08)', paddingTop: '10px' }}>
                    <button 
                      onClick={() => setShowClearConfirmModal(true)}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 10px',
                        borderRadius: '10px',
                        color: '#ef4444',
                        fontWeight: 600,
                        fontSize: '0.85rem'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
                      onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <Trash2 size={16} /> 기록 초기화
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* PIP / Widget Button */}
            <button className="btn-icon" title="위젯 모드 (PIP)" onClick={togglePip}>
              <AppWindow size={20} />
            </button>
          </div>
        </header>

        <main className="dashboard-grid">
          <TimerSection />
          <StatsSection />
        </main>
      </div>

      {/* Picture-in-Picture Portal */}
      {pipWindow && createPortal(
         <PipWidget />,
         pipWindow.document.body
      )}

      {/* Analytics Modal */}
      {showAnalytics && <AnalyticsModal onClose={() => setShowAnalytics(false)} />}

      {/* Custom Clear History Confirmation Modal */}
      {showClearConfirmModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0, 0, 0, 0.4)',
          backdropFilter: 'blur(8px)',
          zIndex: 10000,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '20px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '28px',
            padding: '32px',
            maxWidth: '380px',
            width: '100%',
            boxShadow: '0 20px 50px rgba(0,0,0,0.2)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center'
          }}>
            <div style={{ background: '#fee2e2', color: '#ef4444', borderRadius: '50%', padding: '16px', marginBottom: '18px' }}>
              <Trash2 size={32} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e293b', marginBottom: '8px' }}>기록 초기화</h3>
            <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '24px', lineHeight: 1.5 }}>
              모든 집중 및 휴식 기록이 완전히 삭제됩니다.<br />이 작업은 되돌릴 수 없습니다.
            </p>
            <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
              <button 
                onClick={() => setShowClearConfirmModal(false)}
                style={{ flex: 1, padding: '12px', borderRadius: '14px', background: '#f1f5f9', color: '#475569', fontWeight: 600, border: 'none', cursor: 'pointer' }}
              >
                취소
              </button>
              <button 
                onClick={() => {
                  clearHistory();
                  setShowClearConfirmModal(false);
                  setShowSettings(false);
                }}
                style={{ flex: 1, padding: '12px', borderRadius: '14px', background: '#ef4444', color: '#ffffff', fontWeight: 600, border: 'none', cursor: 'pointer' }}
              >
                초기화
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default App;
