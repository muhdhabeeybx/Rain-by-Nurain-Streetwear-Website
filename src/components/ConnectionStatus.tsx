import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, AlertCircle } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

export function ConnectionStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [serverStatus, setServerStatus] = useState<'healthy' | 'degraded' | 'offline'>('healthy');
  const [showStatus, setShowStatus] = useState(false);

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

  useEffect(() => {
    const checkServerHealth = async () => {
      try {
        const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-7f3098dc/health`, {
          headers: { 'Authorization': `Bearer ${publicAnonKey}` }
        });
        
        if (response.ok) {
          setServerStatus('healthy');
        } else {
          setServerStatus('degraded');
        }
      } catch (error) {
        setServerStatus('offline');
      }
    };

    // Check immediately and then every 30 seconds
    checkServerHealth();
    const interval = setInterval(checkServerHealth, 30000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Show status indicator when there are issues
    const hasIssues = !isOnline || serverStatus !== 'healthy';
    setShowStatus(hasIssues);
    
    if (hasIssues) {
      // Auto-hide after 10 seconds if back to healthy
      const timer = setTimeout(() => {
        if (isOnline && serverStatus === 'healthy') {
          setShowStatus(false);
        }
      }, 10000);
      
      return () => clearTimeout(timer);
    }
  }, [isOnline, serverStatus]);

  if (!showStatus) return null;

  const getStatusInfo = () => {
    if (!isOnline) {
      return {
        icon: <WifiOff className="w-4 h-4" />,
        text: 'No internet connection',
        color: 'bg-red-500'
      };
    }
    
    if (serverStatus === 'offline') {
      return {
        icon: <AlertCircle className="w-4 h-4" />,
        text: 'Service temporarily unavailable',
        color: 'bg-orange-500'
      };
    }
    
    if (serverStatus === 'degraded') {
      return {
        icon: <Wifi className="w-4 h-4" />,
        text: 'Limited connectivity',
        color: 'bg-yellow-500'
      };
    }
    
    return {
      icon: <Wifi className="w-4 h-4" />,
      text: 'Connected',
      color: 'bg-green-500'
    };
  };

  const status = getStatusInfo();

  return (
    <div className="fixed top-20 right-4 z-50 animate-in slide-in-from-right duration-300">
      <div className={`${status.color} text-white px-3 py-2 rounded-lg shadow-lg flex items-center gap-2 text-sm`}>
        {status.icon}
        <span>{status.text}</span>
      </div>
    </div>
  );
}