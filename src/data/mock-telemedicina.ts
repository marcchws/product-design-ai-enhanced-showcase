import { UsuarioTelemedicina, ConsultaTelemedicina, ProntuarioMedico, PagamentoTelemedicina } from '../types'

export const usuariosMock: UsuarioTelemedicina[] = [
  {
    id: '1',
    nome: 'Dr. Ricardo Santos',
    email: 'ricardo.santos@clinica.com',
    perfil: 'medico',
    especialidade: 'Cardiologia',
    crm: 'CRM-SP 123456',
    telefone: '(11) 99999-9999',
    status: 'ativo'
  },
  {
    id: '2',
    nome: 'Maria Silva',
    email: 'maria.silva@email.com',
    perfil: 'paciente',
    telefone: '(11) 88888-8888',
    convenio: 'Unimed',
    status: 'ativo'
  }
]

export const consultasMock: ConsultaTelemedicina[] = [
  {
    id: '1',
    paciente_id: '2',
    medico_id: '1',
    data_agendamento: '2024-01-15T14:30:00',
    duracao: 30,
    especialidade: 'Cardiologia',
    status: 'agendada',
    tipo: 'primeira_consulta',
    valor: 150,
    convenio: 'Unimed',
    observacoes: 'Paciente com histórico de hipertensão'
  }
]

export const simularAPITelemedicina = async (
  tipo: 'usuarios' | 'consultas' | 'prontuarios' | 'pagamentos',
  filtros: any = {},
  delay: number = 1500
) => {
  await new Promise(resolve => setTimeout(resolve, delay))
  
  switch (tipo) {
    case 'usuarios':
      return { itens: usuariosMock, total: usuariosMock.length }
    case 'consultas':
      return { itens: consultasMock, total: consultasMock.length }
    default:
      return { itens: [], total: 0 }
  }
}