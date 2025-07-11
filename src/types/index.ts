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