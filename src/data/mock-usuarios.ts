import { Usuario } from '@/types';

export const usuariosMock: Usuario[] = [
  {
    id: '1',
    nome: 'João Silva Santos',
    email: 'joao.silva@empresa.com',
    telefone: '(11) 99999-9999',
    cargo: 'Gerente de Produto',
    perfil: 'admin',
    status: 'ativo',
    data_criacao: '2023-01-15T10:30:00Z',
    ultimo_acesso: '2024-01-15T14:22:00Z'
  },
  {
    id: '2',
    nome: 'Maria Oliveira',
    email: 'maria.oliveira@empresa.com',
    telefone: '(11) 88888-8888',
    cargo: 'Analista RH',
    perfil: 'rh',
    status: 'ativo',
    data_criacao: '2023-02-20T09:15:00Z',
    ultimo_acesso: '2024-01-14T16:45:00Z'
  },
  {
    id: '3',
    nome: 'Pedro Costa Lima',
    email: 'pedro.costa@empresa.com',
    telefone: '(11) 77777-7777',
    cargo: 'Supervisor Vendas',
    perfil: 'supervisor',
    status: 'pendente',
    data_criacao: '2024-01-10T11:00:00Z'
  },
  {
    id: '4',
    nome: 'Ana Paula Ferreira',
    email: 'ana.ferreira@empresa.com',
    telefone: '(11) 66666-6666',
    cargo: 'Designer UX',
    perfil: 'usuario',
    status: 'inativo',
    data_criacao: '2023-06-05T14:30:00Z',
    ultimo_acesso: '2023-12-20T10:15:00Z'
  },
  {
    id: '5',
    nome: 'Carlos Eduardo Mendes',
    email: 'carlos.mendes@empresa.com',
    telefone: '(11) 55555-5555',
    cargo: 'Desenvolvedor Full-Stack',
    perfil: 'usuario',
    status: 'ativo',
    data_criacao: '2023-03-12T08:45:00Z',
    ultimo_acesso: '2024-01-15T09:30:00Z'
  },
  {
    id: '6',
    nome: 'Fernanda Rodrigues',
    email: 'fernanda.rodrigues@empresa.com',
    telefone: '(11) 44444-4444',
    cargo: 'Coordenadora Marketing',
    perfil: 'supervisor',
    status: 'ativo',
    data_criacao: '2023-04-18T13:20:00Z',
    ultimo_acesso: '2024-01-14T18:10:00Z'
  },
  {
    id: '7',
    nome: 'Rafael Almeida',
    email: 'rafael.almeida@empresa.com',
    telefone: '(11) 33333-3333',
    cargo: 'Analista Financeiro',
    perfil: 'usuario',
    status: 'pendente',
    data_criacao: '2024-01-08T15:30:00Z'
  },
  {
    id: '8',
    nome: 'Juliana Santos',
    email: 'juliana.santos@empresa.com',
    telefone: '(11) 22222-2222',
    cargo: 'Gerente Comercial',
    perfil: 'admin',
    status: 'ativo',
    data_criacao: '2023-05-22T10:15:00Z',
    ultimo_acesso: '2024-01-15T11:45:00Z'
  },
  {
    id: '9',
    nome: 'Lucas Pereira',
    email: 'lucas.pereira@empresa.com',
    telefone: '(11) 11111-1111',
    cargo: 'Assistente Administrativo',
    perfil: 'usuario',
    status: 'inativo',
    data_criacao: '2023-07-10T14:00:00Z',
    ultimo_acesso: '2023-12-15T16:20:00Z'
  },
  {
    id: '10',
    nome: 'Beatriz Costa',
    email: 'beatriz.costa@empresa.com',
    telefone: '(11) 99988-7766',
    cargo: 'Analista de Dados',
    perfil: 'usuario',
    status: 'ativo',
    data_criacao: '2023-08-14T11:20:00Z',
    ultimo_acesso: '2024-01-15T08:15:00Z'
  }
];

export const gerarUsuariosMock = (quantidade: number = 10): Usuario[] => {
  return usuariosMock.slice(0, quantidade);
};