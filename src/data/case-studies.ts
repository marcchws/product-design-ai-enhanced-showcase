import { CaseStudy } from '@/types';

export const caseStudies: CaseStudy[] = [
  // 🏆 SHOWCASES MAIS IMPRESSIONANTES (Ordem de impacto visual e tecnológico)
  
  // 1. SISTEMA BANCÁRIO - Máxima complexidade + Segurança crítica
  {
    id: 'sistema-bancario',
    titulo: 'Sistema Bancário de Internet Banking',
    descricao: 'Sistema bancário completo com PIX, TED, pagamentos, investimentos e cartões. Demonstra segurança crítica (2FA, biometria), compliance PCI-DSS, workflows múltiplos e responsividade mobile-first. Exemplo de alta complexidade transformada em UX simples.',
    categoria: 'avancado',
    complexidade: 221,
    url: '/showcase/sistema-bancario',
    tecnologias: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS', 'Shadcn/UI', 'Sonner'],
    implementado: true,
    preview: 'Sistema bancário com 6 módulos integrados: Dashboard financeiro, Transferências (PIX/TED), Pagamentos, Investimentos, Cartões e Configurações. Implementa autenticação 2FA, biometria, segurança bancária e compliance PCI-DSS.',
  },

  // 2. SISTEMA HOSPITALAR - Mission-critical 24/7
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

  // 3. SISTEMA HRM - Workflows complexos + Multi-perfil
  {
    id: 'sistema-hrm',
    titulo: 'Sistema de Gestão de Recursos Humanos (HRM)',
    descricao: 'Sistema completo de gestão de pessoas com múltiplos módulos integrados: dashboard executivo, gestão de colaboradores, recrutamento e seleção, benefícios e folha, treinamento e desenvolvimento, relatórios analíticos e configurações avançadas. Demonstra integração de workflows complexos, múltiplos perfis de usuário e regras de negócio sofisticadas.',
    categoria: 'avancado',
    complexidade: 195,
    url: '/showcase/sistema-hrm',
    tecnologias: [
      'React',
      'TypeScript',
      'Next.js',
      'Tailwind CSS',
      'Shadcn/UI',
      'Sistema Modular',
      'Multi-perfil',
      'Workflows Complexos',
      'Estados UI Completos',
      'Padrões Defensivos'
    ],
    implementado: true,
    preview: 'Sistema HRM com 7 módulos especializados: Dashboard com métricas em tempo real, Gestão de Colaboradores com CRUD completo, Recrutamento com workflow de candidatos, Benefícios e Folha integrados, Treinamento com progresso, Relatórios analíticos e Configurações avançadas. Implementa 35+ estados UI, 4 perfis de usuário e integração completa de dados.',
  },

  // 4. PORTAL GOVERNO DIGITAL - Acessibilidade extrema
  {
    id: 'portal-governo-digital',
    titulo: 'Portal de Governo Digital',
    descricao: 'Portal público com máxima acessibilidade (WCAG AAA) e suporte para múltipla literacia digital',
    categoria: 'avancado',
    complexidade: 172,
    url: '/showcase/portal-governo-digital',
    tecnologias: ['React', 'TypeScript', 'Tailwind CSS', 'Shadcn/UI', 'Acessibilidade WCAG AAA'],
    implementado: true,
    preview: 'Demonstra design inclusivo extremo com controles de acessibilidade, autenticação Gov.br simulada e transparência pública',
  },

  // 5. DASHBOARD FINANCEIRO - Enterprise B2B
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

  // 6. SISTEMA IOT INDUSTRIAL - Tecnologia emergente
  {
    id: 'sistema-iot-industrial',
    titulo: 'Sistema IoT Industrial',
    descricao: 'Monitoramento em tempo real e manutenção preditiva para ambientes industriais',
    categoria: 'complexo',
    complexidade: 178,
    url: '/showcase/sistema-iot-industrial',
    tecnologias: ['React', 'TypeScript', 'IoT', 'WebSocket', 'IA Preditiva'],
    implementado: true,
    preview: 'Dashboard completo com monitoramento 24/7, alertas críticos, manutenção preditiva e relatórios analytics para chão de fábrica.'
  },

  // 7. GESTÃO ESTOQUE LOGÍSTICA - Sistema empresarial completo
  {
    id: 'gestao-estoque-logistica',
    titulo: 'Sistema de Gestão de Estoque e Logística',
    descricao: 'Sistema completo para controle de estoque, movimentações, fornecedores e alertas automáticos. Demonstra arquitetura modular com 5 módulos especializados, controle de estoque em tempo real, workflows de movimentação e sistema de alertas inteligente para produtos com estoque baixo.',
    categoria: 'avancado',
    complexidade: 156,
    url: '/showcase/gestao-estoque-logistica',
    tecnologias: [
      'React',
      'TypeScript',
      'Next.js',
      'Tailwind CSS',
      'Shadcn/UI',
      'Sistema Modular',
      'Multi-perfil',
      'Estados UI Completos',
      'Padrões Defensivos',
      'Alertas Inteligentes'
    ],
    implementado: true,
    preview: 'Sistema modular com 5 módulos: Gestão de Produtos com CRUD completo, Movimentações de Estoque com histórico detalhado, Gestão de Fornecedores, Relatórios Analíticos e Alertas Automáticos. Implementa 28 estados UI, controle de estoque em tempo real e sistema de notificações para produtos com estoque baixo.',
  },

  // 8. PLATAFORMA EDUCAÇÃO ONLINE - EdTech inovadora
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

  // 9. DELIVERY PWA MOBILE - Mobile-first + PWA
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
  },

  // 10. GESTÃO PROJETOS - Colaboração + Kanban
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

  // 11. PLATAFORMA TELEMEDICINA - HealthTech moderna
  {
    id: 'plataforma-telemedicina',
    titulo: 'Plataforma de Telemedicina',
    descricao: 'Sistema completo para consultas médicas remotas com múltiplos perfis de usuário, agendamento inteligente, teleconsultas via WebRTC, prontuário eletrônico integrado e gestão de pagamentos por convênio.',
    categoria: 'avancado',
    complexidade: 78,
    url: '/showcase/plataforma-telemedicina',
    tecnologias: [
      'React',
      'TypeScript', 
      'Sistema Modular',
      'WebRTC',
      'Multi-perfil',
      'Compliance LGPD',
      'Responsividade',
      'Estados UI Completos'
    ],
    implementado: true,
    preview: 'Demonstra workflows multi-stakeholder complexos (paciente, médico, clínica, convênio), teleconsultas em tempo real, prontuário eletrônico com histórico completo e sistema de pagamentos integrado com convênios.',
  },

  // 12. ECOMMERCE CHECKOUT - Conversão otimizada
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

  // 13. AGENDAMENTO CONSULTAS - HealthTech marketplace
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

  // 14. ECOMMERCE DASHBOARD - Analytics empresarial
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

  // 15. AVALIAÇÃO DESEMPENHO - RH/HRM sofisticado
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

  // 16. GESTÃO USUÁRIOS - Admin sofisticado
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

  // 17. SAAS ONBOARDING - UX progressiva
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

  // 18. CRM SIMPLES - Componente único (menos impressionante)
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

// Showcases em destaque para landing page (top 3 mais impressionantes)
export const showcasesDestaque = caseStudies.filter(cs => 
  ['sistema-bancario', 'sistema-gestao-hospitalar', 'sistema-hrm'].includes(cs.id)
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