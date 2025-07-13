// src/hooks/use-mounted.ts
'use client'

import { useRef, useEffect } from 'react'

/**
 * Hook para prevenção de memory leaks
 * 
 * OBRIGATÓRIO em todos os componentes que fazem operações assíncronas
 * Garante que estado não seja atualizado em componentes desmontados
 */
export const useMounted = () => {
  const montadoRef = useRef(true)

  useEffect(() => {
    montadoRef.current = true
    
    return () => {
      montadoRef.current = false
    }
  }, [])

  return montadoRef
}