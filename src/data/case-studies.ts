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
    implementado: true,
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
    implementado: true,
    preview: 'Fluxo multi-etapas com validações e feedback em tempo real.'
  },
  {
  id: 'gestao-projetos',
  titulo: 'Sistema de Gestão de Projetos',
  descricao: 'Plataforma colaborativa para gerenciar projetos, equipes e tarefas com permissões granulares e acompanhamento em tempo real.',
  categoria: 'complexo',
  complexidade: 124,
  url: '/showcase/gestao-projetos', 
  tecnologias: ['React', 'TypeScript', 'Tailwind', 'Shadcn/UI'],
  implementado: true,
  preview: 'Dashboard colaborativo, kanban de tarefas, timeline de projetos e relatórios de produtividade.',
  },
  {
  id: 'ecommerce-checkout',
  titulo: 'E-commerce Checkout Otimizado', 
  descricao: 'Sistema de finalização de compra com foco em conversão, incluindo validação de estoque em tempo real, cálculo automático de frete, múltiplos métodos de pagamento (cartão, PIX, boleto) e recuperação de carrinho abandonado.',
  categoria: 'complexo',
  complexidade: 89,
  url: '/showcase/ecommerce-checkout',
  tecnologias: ['React', 'TypeScript', 'Tailwind', 'Shadcn/UI'],
  implementado: true,
  preview: 'Checkout multi-etapas com validação progressiva, auto-complete de endereço por CEP, desconto PIX, frete grátis promocional e otimizações de conversão.'
}
];