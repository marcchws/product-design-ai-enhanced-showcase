// src/data/mock-projetos.ts
import { Projeto, Tarefa, Atividade } from '@/types/projetos'

export const projetosMock: Projeto[] = [
  {
    id: '1',
    nome: 'Redesign do E-commerce',
    descricao: 'Modernização completa da interface do e-commerce com foco em conversão e UX.',
    status: 'em_andamento',
    prioridade: 'alta',
    data_inicio: '2024-01-15',
    data_fim: '2024-04-30',
    progresso: 65,
    orcamento: 50000,
    responsavel_id: 'pm-1',
    equipe_ids: ['eq-1'],
    cliente_id: 'cli-1',
    data_criacao: '2024-01-10T09:00:00Z',
    data_atualizacao: '2024-01-25T14:30:00Z',
    meta: {
      cor_tema: 'blue',
      icone: 'ShoppingCart',
      tags: ['design', 'frontend', 'e-commerce']
    }
  },
  {
    id: '2', 
    nome: 'API de Integração Bancária',
    descricao: 'Desenvolvimento de API segura para integração com múltiplos bancos.',
    status: 'planejamento',
    prioridade: 'critica',
    data_inicio: '2024-02-01',
    data_fim: '2024-06-15',
    progresso: 15,
    orcamento: 80000,
    responsavel_id: 'pm-2',
    equipe_ids: ['eq-2'],
    data_criacao: '2024-01-20T10:00:00Z',
    data_atualizacao: '2024-01-28T16:45:00Z',
    meta: {
      cor_tema: 'green',
      icone: 'CreditCard',
      tags: ['backend', 'security', 'fintech']
    }
  },
  {
    id: '3',
    nome: 'App Mobile Delivery',
    descricao: 'Aplicativo mobile para delivery de comida com tracking em tempo real.',
    status: 'concluido',
    prioridade: 'media',
    data_inicio: '2023-09-01',
    data_fim: '2023-12-20',
    progresso: 100,
    orcamento: 35000,
    responsavel_id: 'pm-1',
    equipe_ids: ['eq-3'],
    cliente_id: 'cli-2',
    data_criacao: '2023-08-15T11:00:00Z',
    data_atualizacao: '2023-12-20T18:00:00Z',
    meta: {
      cor_tema: 'orange',
      icone: 'Truck',
      tags: ['mobile', 'react-native', 'delivery']
    }
  },
  {
    id: '4',
    nome: 'Dashboard Analytics',
    descricao: 'Plataforma de analytics em tempo real para métricas de negócio.',
    status: 'em_andamento',
    prioridade: 'alta',
    data_inicio: '2024-01-01',
    data_fim: '2024-03-31',
    progresso: 40,
    orcamento: 60000,
    responsavel_id: 'pm-1',
    equipe_ids: ['eq-1', 'eq-2'],
    data_criacao: '2023-12-15T08:00:00Z',
    data_atualizacao: '2024-01-30T11:20:00Z',
    meta: {
      cor_tema: 'purple',
      icone: 'BarChart3',
      tags: ['analytics', 'dashboard', 'real-time']
    }
  },
  {
    id: '5',
    nome: 'Sistema de Notificações',
    descricao: 'Sistema centralizado de notificações push, email e SMS.',
    status: 'pausado',
    prioridade: 'media',
    data_inicio: '2024-01-10',
    data_fim: '2024-05-10',
    progresso: 25,
    orcamento: 30000,
    responsavel_id: 'pm-2',
    equipe_ids: ['eq-2'],
    data_criacao: '2023-12-20T14:00:00Z',
    data_atualizacao: '2024-01-28T09:15:00Z',
    meta: {
      cor_tema: 'yellow',
      icone: 'Bell',
      tags: ['notifications', 'microservice', 'integration']
    }
  }
];

export const tarefasMock: Tarefa[] = [
  {
    id: 't-1',
    titulo: 'Criar wireframes das principais telas',
    descricao: 'Wireframes de alta fidelidade para home, produto, carrinho e checkout.',
    status: 'concluida',
    prioridade: 'alta',
    projeto_id: '1',
    responsavel_id: 'des-1',
    data_inicio: '2024-01-15',
    data_fim: '2024-01-25',
    tempo_estimado: 40,
    tempo_trabalhado: 38,
    data_criacao: '2024-01-15T09:00:00Z',
    data_atualizacao: '2024-01-25T17:30:00Z'
  },
  {
    id: 't-2',
    titulo: 'Implementar componentes do design system',
    descricao: 'Criar biblioteca de componentes reutilizáveis baseada nos wireframes.',
    status: 'em_progresso',
    prioridade: 'alta',
    projeto_id: '1',
    responsavel_id: 'dev-1',
    data_inicio: '2024-01-26',
    data_fim: '2024-02-15',
    tempo_estimado: 60,
    tempo_trabalhado: 32,
    dependencias: ['t-1'],
    data_criacao: '2024-01-20T10:00:00Z',
    data_atualizacao: '2024-02-05T14:20:00Z'
  },
  {
    id: 't-3',
    titulo: 'Configurar ambiente de desenvolvimento',
    descricao: 'Setup inicial do projeto, configuração de CI/CD e ambientes.',
    status: 'a_fazer',
    prioridade: 'media',
    projeto_id: '2',
    responsavel_id: 'dev-2',
    data_inicio: '2024-02-01',
    data_fim: '2024-02-10',
    tempo_estimado: 20,
    tempo_trabalhado: 0,
    data_criacao: '2024-01-25T11:00:00Z',
    data_atualizacao: '2024-01-25T11:00:00Z'
  },
  {
    id: 't-4',
    titulo: 'Implementar autenticação JWT',
    descricao: 'Sistema de autenticação seguro com refresh tokens.',
    status: 'em_progresso',
    prioridade: 'critica',
    projeto_id: '2',
    responsavel_id: 'dev-2',
    data_inicio: '2024-01-28',
    data_fim: '2024-02-20',
    tempo_estimado: 35,
    tempo_trabalhado: 12,
    data_criacao: '2024-01-28T09:00:00Z',
    data_atualizacao: '2024-02-01T16:45:00Z'
  },
  {
    id: 't-5',
    titulo: 'Testes de integração completos',
    descricao: 'Suite completa de testes para todas as funcionalidades do app.',
    status: 'concluida',
    prioridade: 'alta',
    projeto_id: '3',
    responsavel_id: 'qa-1',
    data_inicio: '2023-11-15',
    data_fim: '2023-12-10',
    tempo_estimado: 50,
    tempo_trabalhado: 52,
    data_criacao: '2023-11-15T08:00:00Z',
    data_atualizacao: '2023-12-10T18:30:00Z'
  },
  {
    id: 't-6',
    titulo: 'Dashboard de métricas principais',
    descricao: 'Criar dashboard com KPIs principais de negócio.',
    status: 'revisao',
    prioridade: 'alta',
    projeto_id: '4',
    responsavel_id: 'dev-1',
    data_inicio: '2024-01-15',
    data_fim: '2024-02-10',
    tempo_estimado: 45,
    tempo_trabalhado: 41,
    data_criacao: '2024-01-15T10:00:00Z',
    data_atualizacao: '2024-02-08T15:20:00Z'
  },
  {
    id: 't-7',
    titulo: 'Configuração de templates de email',
    descricao: 'Templates responsivos para diferentes tipos de notificação.',
    status: 'a_fazer',
    prioridade: 'media',
    projeto_id: '5',
    responsavel_id: 'des-2',
    data_inicio: '2024-02-15',
    data_fim: '2024-03-01',
    tempo_estimado: 25,
    tempo_trabalhado: 0,
    data_criacao: '2024-01-20T14:00:00Z',
    data_atualizacao: '2024-01-20T14:00:00Z'
  }
];

export const atividadesMock: Atividade[] = [
  {
    id: 'a-1',
    tipo: 'status_mudanca',
    autor_id: 'des-1',
    projeto_id: '1',
    tarefa_id: 't-1',
    descricao: 'Tarefa "Criar wireframes das principais telas" marcada como concluída',
    detalhes: { status_anterior: 'em_progresso', status_novo: 'concluida' },
    data_criacao: '2024-01-25T17:30:00Z'
  },
  {
    id: 'a-2',
    tipo: 'comentario',
    autor_id: 'pm-1',
    projeto_id: '1',
    tarefa_id: 't-2',
    descricao: 'Lembrar de incluir componentes para dark mode na biblioteca',
    data_criacao: '2024-02-05T14:20:00Z'
  },
  {
    id: 'a-3',
    tipo: 'criacao',
    autor_id: 'pm-2',
    projeto_id: '2',
    descricao: 'Projeto "API de Integração Bancária" criado',
    data_criacao: '2024-01-20T10:00:00Z'
  },
  {
    id: 'a-4',
    tipo: 'atribuicao',
    autor_id: 'pm-1',
    projeto_id: '4',
    tarefa_id: 't-6',
    descricao: 'Tarefa "Dashboard de métricas principais" atribuída para dev-1',
    detalhes: { responsavel_anterior: null, responsavel_novo: 'dev-1' },
    data_criacao: '2024-01-15T10:00:00Z'
  },
  {
    id: 'a-5',
    tipo: 'edicao',
    autor_id: 'pm-2',
    projeto_id: '5',
    descricao: 'Status do projeto alterado para "pausado"',
    detalhes: { campo: 'status', valor_anterior: 'em_andamento', valor_novo: 'pausado' },
    data_criacao: '2024-01-28T09:15:00Z'
  },
  {
    id: 'a-6',
    tipo: 'status_mudanca',
    autor_id: 'dev-1',
    projeto_id: '4',
    tarefa_id: 't-6',
    descricao: 'Tarefa "Dashboard de métricas principais" movida para revisão',
    detalhes: { status_anterior: 'em_progresso', status_novo: 'revisao' },
    data_criacao: '2024-02-08T15:20:00Z'
  },
  {
    id: 'a-7',
    tipo: 'comentario',
    autor_id: 'qa-1',
    projeto_id: '4',
    tarefa_id: 't-6',
    descricao: 'Dashboard está funcionando bem, apenas ajustar responsividade mobile',
    data_criacao: '2024-02-08T16:45:00Z'
  },
  {
    id: 'a-8',
    tipo: 'criacao',
    autor_id: 'pm-1',
    projeto_id: '4',
    descricao: 'Projeto "Dashboard Analytics" criado',
    data_criacao: '2023-12-15T08:00:00Z'
  }
];