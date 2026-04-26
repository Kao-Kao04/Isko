const STYLES = `
@keyframes _ls-spin {
  to { transform: rotate(360deg); }
}
@keyframes _ls-pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50%       { opacity: 0.85; transform: scale(0.96); }
}
@keyframes _ls-fade-in {
  from { opacity: 0; }
  to   { opacity: 1; }
}
@keyframes _ls-text-up {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}
._ls-wrap {
  position: fixed; inset: 0; z-index: 9999;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  background: linear-gradient(135deg, #5C0000 0%, #800000 50%, #2A0000 100%);
  animation: _ls-fade-in 0.2s ease both;
  gap: 0;
}
._ls-logo-ring {
  width: 88px; height: 88px; border-radius: 50%;
  background: rgba(255,255,255,0.12);
  border: 2px solid rgba(201,160,39,0.35);
  display: flex; align-items: center; justify-content: center;
  animation: _ls-pulse 1.8s ease-in-out infinite;
  margin-bottom: 20px;
}
._ls-logo-ring img {
  width: 48px; height: 48px;
  filter: brightness(0) invert(1);
}
._ls-name {
  font-size: 22px; font-weight: 800; color: #fff;
  letter-spacing: -0.02em;
  animation: _ls-text-up 0.5s ease 0.15s both;
  margin-bottom: 6px;
}
._ls-tagline {
  font-size: 11px; font-weight: 600; color: rgba(201,160,39,0.75);
  letter-spacing: 0.1em; text-transform: uppercase;
  animation: _ls-text-up 0.5s ease 0.25s both;
  margin-bottom: 32px;
}
._ls-spinner {
  width: 28px; height: 28px;
  border: 2.5px solid rgba(255,255,255,0.15);
  border-top-color: rgba(255,255,255,0.7);
  border-radius: 50%;
  animation: _ls-spin 0.75s linear infinite;
}
`;

interface Props {
  label?: string;
  variant?: 'logo' | 'spinner';
}

export default function LoadingScreen({ label = 'Loading…', variant = 'logo' }: Props) {
  void label;
  void variant;
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />
      <div className="_ls-wrap">
        <div className="_ls-logo-ring">
          <img src="/assets/Gemini_Generated_Image_b3g7t6b3g7t6b3g7-removebg-preview.png" alt="IskoMo" />
        </div>
        <div className="_ls-name">IskoMo</div>
        <div className="_ls-tagline">PUP Main · OSFA Portal</div>
        <div className="_ls-spinner" />
      </div>
    </>
  );
}
