import { CaseStudy } from '@/types';

export const caseStudies: CaseStudy[] = [
  // CATEGORIA SIMPLES: Componente Único (≤ 20 pontos)
  {
    id: 'crm-simples',
    titulo: 'CRM Simplificado',
    descricao: 'Sistema básico de gestão de contatos com CRUD essencial, validações defensivas e estados UI completos em componente único.',
    categoria: 'simples',
    complexidade: 18,
    url: '/showcase/crm-simples',
    tecnologias: ['React', 'TypeScript', 'Tailwind', 'Shadcn/UI'],
    implementado: true,
    preview: 'Demonstra arquitetura de componente único com 6 estados UI mapeados e padrões defensivos aplicados.'
  },

  // CATEGORIA COMPLEXO: Sistema Modular (21-100 pontos)
  {
    id: 'gestao-usuarios',
    titulo: 'Sistema de Gestão de Usuários',
    descricao: 'CRUD administrativo completo com múltiplos perfis, sistema de auditoria, bulk actions e controle granular de permissões.',
    categoria: 'complexo',
    complexidade: 52,
    url: '/showcase/gestao-usuarios',
    tecnologias: ['React', 'TypeScript', 'Tailwind', 'Shadcn/UI'],
    implementado: true,
    preview: 'Sistema modular com 4 módulos especializados, 28 estados UI mapeados e arquitetura defensiva completa.'
  },
  {
    id: 'avaliacao-desempenho',
    titulo: 'Sistema de Avaliação de Desempenho',
    descricao: 'Plataforma RH/HRM para digitalização do processo de avaliação 360° com auto-avaliação, feedback estruturado e planos de desenvolvimento.',
    categoria: 'complexo',
    complexidade: 66,
    url: '/showcase/avaliacao-desempenho',
    tecnologias: ['React', 'TypeScript', 'Tailwind', 'Shadcn/UI'],
    implementado: true,
    preview: 'Auto-avaliação progressiva, workflow 360°, dashboard de progresso e analytics de desenvolvimento.'
  },
  {
    id: 'ecommerce-checkout',
    titulo: 'E-commerce Checkout Otimizado',
    descricao: 'Sistema de finalização de compra focado em conversão com validação tempo real, múltiplos métodos de pagamento e recuperação de carrinho.',
    categoria: 'complexo',
    complexidade: 81,
    url: '/showcase/ecommerce-checkout',
    tecnologias: ['React', 'TypeScript', 'Tailwind', 'Shadcn/UI'],
    implementado: true,
    preview: 'Checkout multi-etapas otimizado, validação progressiva e integração com gateways de pagamento.'
  },
  {
    id: 'agendamento-consultas',
    titulo: 'Agendamento de Consultas Médicas',
    descricao: 'HealthTech marketplace para agendamento médico simplificado com busca de especialistas, calendário interativo e validação de convênios.',
    categoria: 'complexo',
    complexidade: 81,
    url: '/showcase/agendamento-consultas',
    tecnologias: ['React', 'TypeScript', 'Tailwind', 'Shadcn/UI'],
    implementado: true,
    preview: 'Busca inteligente de médicos, calendário tempo real e fluxo otimizado para redução de no-shows.'
  },

  // CATEGORIA AVANÇADO: Sistema Modular Ultra-Complexo (> 100 pontos)
  {
    id: 'gestao-projetos',
    titulo: 'Sistema de Gestão de Projetos',
    descricao: 'Plataforma colaborativa para gestão de projetos, equipes e tarefas com kanban interativo, timeline e permissões granulares.',
    categoria: 'avancado',
    complexidade: 124,
    url: '/showcase/gestao-projetos',
    tecnologias: ['React', 'TypeScript', 'Tailwind', 'Shadcn/UI'],
    implementado: true,
    preview: 'Dashboard colaborativo, kanban drag-drop, timeline de projetos e relatórios de produtividade.'
  },
  {
    id: 'plataforma-educacao-online',
    titulo: 'Plataforma de Educação Online',
    descricao: 'EdTech com aprendizado adaptativo, gamificação inteligente, player de vídeo interativo e sistema de avaliações personalizadas.',
    categoria: 'avancado',
    complexidade: 162,
    url: '/showcase/plataforma-educacao-online',
    tecnologias: ['React', 'TypeScript', 'Tailwind', 'Shadcn/UI'],
    implementado: true,
    preview: 'Sistema modular com 6 módulos: dashboard adaptativo, player interativo, gamificação XP/badges e progresso personalizado.'
  },
  {
    id: 'dashboard-financeiro-empresarial',
    titulo: 'Dashboard Financeiro Empresarial',
    descricao: 'FinTech B2B Enterprise para inteligência financeira com análise multiusuário, projeções de cenários e automação de relatórios.',
    categoria: 'avancado',
    complexidade: 170,
    url: '/showcase/dashboard-financeiro-empresarial',
    tecnologias: ['React', 'TypeScript', 'Tailwind', 'Shadcn/UI', 'Charts'],
    implementado: true,
    preview: 'Sistema modular com 6 módulos especializados, dashboard por perfil e workflow de aprovação granular.'
  },
  {
    id: 'sistema-gestao-hospitalar',
    titulo: 'Sistema de Gestão Hospitalar',
    descricao: 'HealthTech mission-critical 24/7 para coordenação de workflows médicos com triagem de emergência, gestão de leitos e centro cirúrgico.',
    categoria: 'avancado',
    complexidade: 232,
    url: '/showcase/sistema-gestao-hospitalar',
    tecnologias: ['React', 'TypeScript', 'Tailwind', 'Shadcn/UI', 'Sonner'],
    implementado: true,
    preview: 'Sistema modular ultra-complexo com 6 módulos especializados, 35 estados UI críticos e operação hospitalar 24/7.'
  },

  // CATEGORIA ESPECIAL: Casos de Uso Específicos
  {
    id: 'saas-onboarding',
    titulo: 'Onboarding SaaS Progressivo',
    descricao: 'Fluxo de onboarding multi-etapas para SaaS com configuração guiada, validações progressivas e personalização por perfil.',
    categoria: 'complexo',
    complexidade: 45,
    url: '/showcase/saas-onboarding',
    tecnologias: ['React', 'TypeScript', 'Tailwind', 'Shadcn/UI'],
    implementado: true,
    preview: 'Fluxo multi-step com validação progressiva, save automático e personalização por tipo de usuário.'
  },
  {
    id: 'ecommerce-dashboard',
    titulo: 'Dashboard E-commerce Administrativo',
    descricao: 'Painel administrativo para e-commerce com gestão de produtos, pedidos, analytics em tempo real e controle de estoque.',
    categoria: 'complexo',
    complexidade: 67,
    url: '/showcase/ecommerce-dashboard',
    tecnologias: ['React', 'TypeScript', 'Tailwind', 'Shadcn/UI', 'Charts'],
    implementado: true,
    preview: 'Dashboard responsivo com métricas tempo real, gestão CRUD completa e relatórios automáticos.'
  },
  {
  id: 'delivery-pwa-mobile',
  titulo: 'App Mobile PWA - Delivery',
  descricao: 'Progressive Web App mobile-first para delivery com geolocalização, tracking em tempo real, checkout multi-etapas e estados offline.',
  categoria: 'complexo',
  complexidade: 129,
  url: '/showcase/delivery-pwa-mobile',
  tecnologias: ['React', 'TypeScript', 'Tailwind', 'Shadcn/UI', 'PWA', 'Geolocation', 'WebSocket'],
  implementado: true,
  preview: 'PWA responsivo com busca inteligente, customização de produtos, carrinho persistente e rastreamento tempo real.'
}
];

// Estatísticas dos showcases para o dashboard principal
export const showcaseStats = {
  total: caseStudies.length,
  implementados: caseStudies.filter(cs => cs.implementado).length,
  porCategoria: {
    simples: caseStudies.filter(cs => cs.categoria === 'simples').length,
    complexo: caseStudies.filter(cs => cs.categoria === 'complexo').length,
    avancado: caseStudies.filter(cs => cs.categoria === 'avancado').length
  },
  complexidadeMedia: Math.round(
    caseStudies.reduce((acc, cs) => acc + cs.complexidade, 0) / caseStudies.length
  )
};

// Filtros disponíveis para o showcase
export const filtrosShowcase = {
  categorias: [
    { value: 'todos', label: 'Todas as Categorias' },
    { value: 'simples', label: 'Simples (≤20 pontos)' },
    { value: 'complexo', label: 'Complexo (21-100 pontos)' },
    { value: 'avancado', label: 'Avançado (>100 pontos)' }
  ],
  status: [
    { value: 'todos', label: 'Todos os Status' },
    { value: 'implementado', label: 'Implementados' },
    { value: 'desenvolvimento', label: 'Em Desenvolvimento' }
  ],
  ordenacao: [
    { value: 'complexidade_asc', label: 'Complexidade: Crescente' },
    { value: 'complexidade_desc', label: 'Complexidade: Decrescente' },
    { value: 'nome_asc', label: 'Nome: A-Z' },
    { value: 'nome_desc', label: 'Nome: Z-A' }
  ]
};

// Showcases em destaque para landing page
export const showcasesDestaque = caseStudies.filter(cs => 
  ['sistema-gestao-hospitalar', 'dashboard-financeiro-empresarial', 'gestao-usuarios'].includes(cs.id)
);

// Próximos showcases a serem implementados (ordenados por prioridade)
export const proximosShowcases = caseStudies
  .filter(cs => !cs.implementado)
  .sort((a, b) => {
    // Prioridade: complexo < avançado, complexidade crescente
    if (a.categoria !== b.categoria) {
      const ordemCategoria = { 'complexo': 1, 'avancado': 2 };
      return ordemCategoria[a.categoria as keyof typeof ordemCategoria] - 
             ordemCategoria[b.categoria as keyof typeof ordemCategoria];
    }
    return a.complexidade - b.complexidade;
  })
  .slice(0, 3);