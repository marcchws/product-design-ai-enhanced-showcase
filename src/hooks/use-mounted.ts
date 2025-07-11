import { useRef, useEffect } from 'react';

export function useMounted() {
  const montadoRef = useRef(true);
  
  useEffect(() => {
    montadoRef.current = true;
    return () => {
      montadoRef.current = false;
    };
  }, []);
  
  return montadoRef;
}