const STYLES = `
@keyframes _ls-spin {
  to { transform: rotate(360deg); }
}
@keyframes _ls-pulse {
  0%, 100% { opacity: 1;   transform: scale(1); }
  50%       { opacity: 0.5; transform: scale(0.92); }
}
@keyframes _ls-bar {
  0%   { width: 0%;   }
  40%  { width: 60%;  }
  70%  { width: 80%;  }
  90%  { width: 92%;  }
  100% { width: 100%; }
}
@keyframes _ls-fade {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}
._ls-wrap {
  position: fixed; inset: 0; z-index: 9000;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  background: #f8fafc;
  animation: _ls-fade 0.18s ease both;
}
._ls-logo {
  width: 56px; height: 56px; border-radius: 16px;
  background: linear-gradient(135deg, #800000, #5C0000);
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 8px 28px #80000040;
  animation: _ls-pulse 1.6s ease-in-out infinite;
  margin-bottom: 20px;
}
._ls-ring {
  width: 40px; height: 40px;
  border: 3px solid #f3f4f6;
  border-top-color: #800000;
  border-radius: 50%;
  animation: _ls-spin 0.75s linear infinite;
  margin-bottom: 20px;
}
._ls-bar-track {
  width: 180px; height: 3px; background: #e5e7eb; border-radius: 99px; overflow: hidden;
  margin-bottom: 14px;
}
._ls-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #800000, #C9A027);
  border-radius: 99px;
  animation: _ls-bar 1.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}
._ls-label {
  font-size: 13px; font-weight: 600; color: #9ca3af; letter-spacing: 0.04em;
}
`;

interface Props {
  label?: string;
  variant?: 'logo' | 'spinner';
}

export default function LoadingScreen({ label = 'Loading…', variant = 'logo' }: Props) {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />
      <div className="_ls-wrap">
        {variant === 'logo' ? (
          <div className="_ls-logo">
            {/* "I" lettermark */}
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <rect x="10" y="4" width="4" height="16" rx="2" fill="white"/>
              <rect x="6"  y="4" width="12" height="3" rx="1.5" fill="white"/>
              <rect x="6"  y="17" width="12" height="3" rx="1.5" fill="white"/>
            </svg>
          </div>
        ) : (
          <div className="_ls-ring" />
        )}
        <div className="_ls-bar-track">
          <div className="_ls-bar-fill" />
        </div>
        <span className="_ls-label">{label}</span>
      </div>
    </>
  );
}
