import { useState, useCallback, useEffect, useRef } from 'react';

let showToastGlobal = null;

export function useToast() {
  return useCallback((message) => {
    if (showToastGlobal) showToastGlobal(message);
  }, []);
}

export default function Toast() {
  const [message, setMessage] = useState('');
  const [visible, setVisible] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    showToastGlobal = (msg) => {
      setMessage(msg);
      setVisible(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setVisible(false), 2500);
    };
    return () => {
      showToastGlobal = null;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <div className={`toast${visible ? ' show' : ''}`} role="alert" aria-live="polite">
      {message}
    </div>
  );
}
