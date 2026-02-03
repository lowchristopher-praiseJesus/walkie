import { useApp } from '../context/AppContext';
import defaultBg from '../assets/default-bg.png';
import lunarBg from '../assets/lunar-bg.png';

export function PageWrapper({ children, centered = false }) {
  const { config } = useApp();
  const isLunarTheme = config.theme === 'lunar';
  const backgroundImage = isLunarTheme ? lunarBg : defaultBg;

  return (
    <div
      className="min-h-screen flex flex-col relative"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'contain',
        backgroundPosition: 'center top',
        backgroundRepeat: 'no-repeat',
        backgroundColor: isLunarTheme ? '#1a0a0a' : '#09090b'
      }}
    >
      {/* Overlay for readability */}
      <div className={`fixed inset-0 pointer-events-none ${isLunarTheme ? 'bg-black/50' : 'bg-black/40'}`}></div>

      <div className={`relative z-10 flex-1 ${centered ? 'flex flex-col justify-center' : ''}`}>
        {children}
      </div>
    </div>
  );
}

export default PageWrapper;
