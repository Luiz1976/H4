import { useEffect, useState } from "react";

export function OnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div 
      className="fixed top-4 right-4 z-[99999] flex items-center gap-2 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-full shadow-lg border border-gray-200/50"
      data-testid="online-status-indicator"
    >
      <div className="relative flex items-center justify-center">
        {/* Ponto central pulsante */}
        <div 
          className={`w-2.5 h-2.5 rounded-full ${
            isOnline ? 'bg-green-500' : 'bg-red-500'
          } animate-pulse relative z-10`}
        />
        
        {/* Ondas expansivas (apenas quando online) */}
        {isOnline && (
          <>
            <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-green-500/40 animate-ping" 
                 style={{ animationDuration: '2s' }} 
            />
            <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-green-500/20 animate-ping" 
                 style={{ animationDuration: '2s', animationDelay: '0.5s' }} 
            />
          </>
        )}
        
        {/* Pulso contínuo quando offline */}
        {!isOnline && (
          <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-red-500/30 animate-pulse" />
        )}
      </div>
      
      {/* Texto sempre visível */}
      <span 
        className={`text-xs font-medium ${
          isOnline ? 'text-green-600' : 'text-red-600'
        }`}
        data-testid="online-status-text"
      >
        {isOnline ? 'ONLINE' : 'OFFLINE'}
      </span>
    </div>
  );
}
