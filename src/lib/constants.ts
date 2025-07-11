// Constantes do aplicativo
export const APP_CONFIG = {
  name: 'Product Design AI-Enhanced Showcase',
  author: 'Marcos Bricches',
  description: 'Showcase interativo da metodologia Product Design AI-Enhanced',
  version: '1.0.0',
  url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
};

// Configurações da metodologia
export const METODOLOGIA_CONFIG = {
  pilares: 8,
  camadas_analise: 6,
  score_minimo: 90,
  estados_ui_exemplo: 28
};

// Métricas de complexidade
export const METRICAS_COMPLEXIDADE = {
  pesos: {
    entidades: 8,
    telas: 3,
    fluxos: 5,
    estados_ui: 1,
    perfis: 4,
    integracoes: 6
  },
  limites: {
    componente_unico: 20,
    sistema_modular: 21
  }
};

// Configurações de tempo
export const TIMEOUTS = {
  api_padrao: 8000,
  upload: 15000,
  busca: 5000
};

// Cores do design system
export const CORES_SISTEMA = {
  primary: 'blue-600',
  secondary: 'gray-100',
  success: 'green-600',
  warning: 'yellow-500',
  error: 'red-600',
  info: 'blue-500'
};

// Configurações de paginação
export const PAGINACAO = {
  itens_por_pagina_padrao: 10,
  opcoes_itens_por_pagina: [10, 25, 50, 100]
};