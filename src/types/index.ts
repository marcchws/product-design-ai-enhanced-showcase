export interface Usuario {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  cargo: string;
  perfil: 'admin' | 'rh' | 'supervisor' | 'usuario';
  status: 'ativo' | 'inativo' | 'pendente';
  data_criacao: string;
  ultimo_acesso?: string;
  avatar?: string;
}

export interface DadosGlobais {
  usuarioLogado: {
    id: string;
    nome: string;
    perfil: 'admin' | 'rh' | 'supervisor';
    permissoes: string[];
  };
  estatisticas: {
    totalUsuarios: number;
    usuariosAtivos: number;
    usuariosPendentes: number;
    ultimaAtualizacao: string;
  };
}

export interface CaseStudy {
  id: string;
  titulo: string;
  descricao: string;
  categoria: 'simples' | 'complexo' | 'avancado';
  complexidade: number;
  url: string;
  tecnologias: string[];
  implementado: boolean;
  preview?: string;
}

export interface MetricasComplexidade {
  entidades: number;
  telas: number;
  fluxos: number;
  estadosUI: number;
  perfisUsuario: number;
  integracoes: number;
  complexidadeTotal: number;
  recomendacao: 'componente-unico' | 'sistema-modular';
}

export interface UsuarioTelemedicina {
  id: string
  nome: string
  email: string
  perfil: 'paciente' | 'medico' | 'admin' | 'convenio'
  especialidade?: string
  crm?: string
  avatar?: string
  telefone: string
  convenio?: string
  status: 'ativo' | 'inativo' | 'verificando'
}

export interface ConsultaTelemedicina {
  id: string
  paciente_id: string
  medico_id: string
  data_agendamento: string
  duracao: number
  especialidade: string
  status: 'agendada' | 'em_andamento' | 'finalizada' | 'cancelada'
  tipo: 'primeira_consulta' | 'retorno' | 'urgencia'
  valor: number
  convenio?: string
  observacoes?: string
}

export interface ProntuarioMedico {
  id: string
  paciente_id: string
  data: string
  tipo: 'consulta' | 'exame' | 'procedimento'
  medico: string
  observacoes: string
  prescricoes: string[]
  anexos?: string[]
}

export interface PagamentoTelemedicina {
  id: string
  consulta_id: string
  paciente: string
  valor: number
  status: 'pago' | 'pendente' | 'processando' | 'cancelado'
  forma_pagamento: string
  convenio: string
  data_pagamento?: string
}