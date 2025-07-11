import { CaseStudy } from '@/types';

export const caseStudies: CaseStudy[] = [
  {
    id: 'gestao-usuarios',
    titulo: 'Sistema de Gestão de Usuários',
    descricao: 'CRUD completo com múltiplos perfis, auditoria e bulk actions. Demonstra arquitetura modular e estados UI completos.',
    categoria: 'complexo',
    complexidade: 52,
    url: '/showcase/gestao-usuarios',
    tecnologias: ['React', 'TypeScript', 'Tailwind', 'Shadcn/UI'],
    implementado: true,
    preview: 'Sistema administrativo com 28 estados UI mapeados e implementados.'
  },
  {
    id: 'crm-simples',
    titulo: 'CRM Simplificado',
    descricao: 'Sistema básico de gestão de contatos com funcionalidades essenciais de CRUD. Exemplo perfeito de componente único.',
    categoria: 'simples',
    complexidade: 18,
    url: '/showcase/crm-simples',
    tecnologias: ['React', 'TypeScript', 'Tailwind'],
    implementado: true,
    preview: 'Exemplo de componente único para funcionalidades simples com 6 estados UI.'
  },
  {
    id: 'ecommerce-dashboard',
    titulo: 'Dashboard E-commerce',
    descricao: 'Painel administrativo para e-commerce com gestão de produtos, pedidos e analytics em tempo real.',
    categoria: 'avancado',
    complexidade: 67,
    url: '/showcase/ecommerce-dashboard',
    tecnologias: ['React', 'TypeScript', 'Charts', 'Real-time'],
    implementado: false,
    preview: 'Dashboard responsivo com métricas e gestão completa de produtos.'
  },
  {
    id: 'saas-onboarding',
    titulo: 'Onboarding SaaS',
    descricao: 'Fluxo de onboarding progressivo para SaaS com configuração guiada e validações.',
    categoria: 'complexo',
    complexidade: 45,
    url: '/showcase/saas-onboarding',
    tecnologias: ['React', 'Multi-step Forms', 'Progress Tracking'],
    implementado: false,
    preview: 'Fluxo multi-etapas com validações e feedback em tempo real.'
  }
];