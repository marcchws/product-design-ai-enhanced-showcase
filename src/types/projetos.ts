// src/types/projetos.ts
export interface Projeto {
  id: string;
  nome: string;
  descricao: string;
  status: 'planejamento' | 'em_andamento' | 'pausado' | 'concluido' | 'cancelado';
  prioridade: 'baixa' | 'media' | 'alta' | 'critica';
  data_inicio: string;
  data_fim: string;
  progresso: number; // 0-100
  orcamento?: number;
  responsavel_id: string;
  equipe_ids: string[];
  cliente_id?: string;
  data_criacao: string;
  data_atualizacao: string;
  meta?: {
    cor_tema?: string;
    icone?: string;
    tags?: string[];
  };
}

export interface Tarefa {
  id: string;
  titulo: string;
  descricao: string;
  status: 'a_fazer' | 'em_progresso' | 'revisao' | 'concluida';
  prioridade: 'baixa' | 'media' | 'alta' | 'critica';
  projeto_id: string;
  responsavel_id?: string;
  data_inicio?: string;
  data_fim?: string;
  tempo_estimado?: number; // horas
  tempo_trabalhado?: number; // horas
  dependencias?: string[]; // IDs de outras tarefas
  data_criacao: string;
  data_atualizacao: string;
}

export interface Atividade {
  id: string;
  tipo: 'criacao' | 'edicao' | 'comentario' | 'status_mudanca' | 'atribuicao';
  autor_id: string;
  projeto_id: string;
  tarefa_id?: string;
  descricao: string;
  detalhes?: any;
  data_criacao: string;
}

export interface PermissoesProjeto {
  [userId: string]: {
    pode_editar: boolean;
    pode_criar_tarefas: boolean;
    pode_atribuir: boolean;
    pode_excluir: boolean;
    pode_ver_orcamento: boolean;
  };
}