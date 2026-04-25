import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Hook for auto-logout on user inactivity
 * @param {number} inactivityMinutes - Minutes of inactivity before logout (default: 15)
 * @param {number} warningMinutes - Minutes to show warning before logout (default: 1)
 */
export function useAutoLogout(inactivityMinutes = 15, warningMinutes = 1) {
  const navigate = useNavigate();
  const inactivityTimeout = useRef(null);
  const warningTimeout = useRef(null);
  const isWarningShown = useRef(false);

  const handleLogout = () => {
    localStorage.removeItem('user');
    isWarningShown.current = false;
    window.location.href = '/';
  };

  const resetTimer = () => {
    // Clear existing timers
    if (inactivityTimeout.current) clearTimeout(inactivityTimeout.current);
    if (warningTimeout.current) clearTimeout(warningTimeout.current);
    isWarningShown.current = false;

    const inactivityMs = inactivityMinutes * 60 * 1000;
    const warningMs = (inactivityMinutes - warningMinutes) * 60 * 1000;

    // Show warning before logout
    if (warningMinutes > 0) {
      warningTimeout.current = setTimeout(() => {
        if (!isWarningShown.current) {
          isWarningShown.current = true;
          const message = `Your session will expire in ${warningMinutes} minute(s) due to inactivity.`;
          
          // Show alert or toast notification
          alert(message);
          // You can replace alert with a toast notification library like react-toastify
        }
      }, warningMs);
    }

    // Logout after inactivity timeout
    inactivityTimeout.current = setTimeout(() => {
      handleLogout();
    }, inactivityMs);
  };

  useEffect(() => {
    // User interaction events
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];

    const handleUserActivity = () => {
      resetTimer();
    };

    // Add event listeners
    events.forEach(event => {
      document.addEventListener(event, handleUserActivity);
    });

    // Initialize timer on mount
    resetTimer();

    // Cleanup
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleUserActivity);
      });
      if (inactivityTimeout.current) clearTimeout(inactivityTimeout.current);
      if (warningTimeout.current) clearTimeout(warningTimeout.current);
    };
  }, [inactivityMinutes, warningMinutes]);
}
