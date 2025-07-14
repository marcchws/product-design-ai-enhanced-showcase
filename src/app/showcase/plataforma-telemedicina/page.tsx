'use client'

import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react'
import { toast, Toaster } from 'sonner'
import * as LucideIcons from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

// Componentes dos módulos
import AgendamentoInteligente from './components/agendamento-inteligente'
import Teleconsulta from './components/teleconsulta'
import ProntuarioDigital from './components/prontuario-digital'
import PagamentosConvenios from './components/pagamentos-convenios'
import DashboardMedico from './components/dashboard-medico'

// Tipos específicos do sistema
interface UsuarioTelemedicina {
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

// Dados mock para demonstração
const usuarioAtual: UsuarioTelemedicina = {
  id: '1',
  nome: 'Dr. Ricardo Santos',
  email: 'ricardo.santos@clinica.com',
  perfil: 'medico',
  especialidade: 'Cardiologia',
  crm: 'CRM-SP 123456',
  avatar: '/avatars/dr-ricardo.jpg',
  telefone: '(11) 99999-9999',
  status: 'ativo'
}

const estatisticasIniciais = {
  consultas_hoje: 12,
  consultas_semana: 45,
  pacientes_ativos: 234,
  faturamento_mes: 15800,
  avaliacoes_media: 4.8,
  tempo_medio_consulta: 28
}

// Dados mock para todos os módulos
const dadosMockModulos = {
  dashboard: estatisticasIniciais,
  agendamento: {
    consultas_agendadas: 8,
    horarios_disponiveis: 12,
    lista_espera: 3
  },
  teleconsulta: {
    consultas_ativas: 2,
    proximas_consultas: 6,
    equipamentos_ok: true
  },
  prontuario: {
    pacientes_cadastrados: 234,
    prontuarios_atualizados: 156,
    prescricoes_pendentes: 4
  },
  pagamentos: {
    pagamentos_pendentes: 3,
    faturamento_dia: 2400,
    inadimplencia: 2.5
  }
}

// Funções utilitárias defensivas
const gerarIniciaisNome = (nome: string | undefined): string => {
  if (!nome) return '??'
  
  try {
    const nomeLimpo = nome.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    const partesNome = nomeLimpo.trim().split(' ').filter(parte => parte.length > 0)
    
    if (partesNome.length === 0) return '??'
    if (partesNome.length === 1) {
      return partesNome[0].substring(0, 2).toUpperCase()
    }
    
    const primeiraLetra = partesNome[0][0] || '?'
    const ultimaLetra = partesNome[partesNome.length - 1][0] || '?'
    
    return (primeiraLetra + ultimaLetra).toUpperCase()
  } catch (error) {
    console.error('Erro ao gerar iniciais:', error)
    return '??'
  }
}

const formatarMoeda = (valor: number | string | undefined): string => {
  if (valor === undefined || valor === null || valor === '') return 'R$ 0,00'
  
  try {
    const numero = typeof valor === 'string' ? parseFloat(valor) : valor
    
    if (isNaN(numero)) return 'Valor inválido'
    
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(numero)
  } catch (error) {
    console.error('Erro ao formatar moeda:', error)
    return 'Erro de formato'
  }
}

export default function PlataformaTelemedicina() {
  // Estados principais
  const [abaSelecionada, setAbaSelecionada] = useState<string>('dashboard')
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [estatisticas, setEstatisticas] = useState(estatisticasIniciais)
  const [modalSobre, setModalSobre] = useState(false)
  const [notificacoes, setNotificacoes] = useState<any[]>([])
  
  // CORREÇÃO: Todos os módulos marcados como carregados para showcase
  const [estadosModulos, setEstadosModulos] = useState<Record<string, any>>({
    dashboard: { dados: dadosMockModulos.dashboard, carregado: true },
    agendamento: { dados: dadosMockModulos.agendamento, carregado: true },
    teleconsulta: { dados: dadosMockModulos.teleconsulta, carregado: true },
    prontuario: { dados: dadosMockModulos.prontuario, carregado: true },
    pagamentos: { dados: dadosMockModulos.pagamentos, carregado: true }
  })
  
  // Prevenção de memory leaks
  const montadoRef = useRef(true)
  
  useEffect(() => {
    montadoRef.current = true
    
    // Simular carregamento inicial mais rápido para showcase
    carregarDashboard()
    
    return () => {
      montadoRef.current = false
    }
  }, [])
  
  // Carregamento do dashboard
  const carregarDashboard = useCallback(async () => {
    if (!montadoRef.current) return
    
    setCarregando(true)
    setErro(null)
    
    const timeoutId = setTimeout(() => {
      if (montadoRef.current) {
        setCarregando(false)
        setErro('Tempo de carregamento excedido. Tente novamente.')
      }
    }, 10000)
    
    try {
      // Carregamento mais rápido para showcase
      await new Promise(resolve => setTimeout(resolve, 800))
      
      if (montadoRef.current) {
        setEstatisticas(estatisticasIniciais)
        
        // Simular algumas notificações
        setNotificacoes([
          {
            id: '1',
            tipo: 'consulta_proximo',
            mensagem: 'Próxima consulta em 15 minutos',
            timestamp: new Date().toISOString()
          },
          {
            id: '2',
            tipo: 'paciente_chegou',
            mensagem: 'Paciente Maria Silva chegou para consulta',
            timestamp: new Date().toISOString()
          }
        ])
      }
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error)
      if (montadoRef.current) {
        setErro('Falha ao carregar dashboard médico. Verifique sua conexão.')
        toast.error('Erro ao carregar dados')
      }
    } finally {
      clearTimeout(timeoutId)
      if (montadoRef.current) {
        setCarregando(false)
      }
    }
  }, [])
  
  // Configuração das abas com badges dinâmicas
  const configuracaoAbas = useMemo(() => [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icone: 'LayoutDashboard',
      badge: null,
      lazy: false
    },
    {
      id: 'agendamento',
      label: 'Agendamento',
      icone: 'Calendar',
      badge: dadosMockModulos.agendamento.consultas_agendadas,
      lazy: false // CORREÇÃO: não é mais lazy para showcase
    },
    {
      id: 'teleconsulta',
      label: 'Teleconsulta',
      icone: 'Video',
      badge: dadosMockModulos.teleconsulta.consultas_ativas,
      lazy: false // CORREÇÃO: não é mais lazy para showcase
    },
    {
      id: 'prontuario',
      label: 'Prontuário',
      icone: 'FileText',
      badge: dadosMockModulos.prontuario.prescricoes_pendentes,
      lazy: false // CORREÇÃO: não é mais lazy para showcase
    },
    {
      id: 'pagamentos',
      label: 'Pagamentos',
      icone: 'CreditCard',
      badge: dadosMockModulos.pagamentos.pagamentos_pendentes,
      lazy: false // CORREÇÃO: não é mais lazy para showcase
    }
  ], [])
  
  // Handler para mudança de aba - SIMPLIFICADO para showcase
  const handleMudarAba = useCallback((novaAba: string) => {
    if (novaAba === abaSelecionada) return
    
    setAbaSelecionada(novaAba)
    
    // Feedback visual de que a aba mudou
    toast.info(`Navegando para ${configuracaoAbas.find(aba => aba.id === novaAba)?.label}`)
  }, [abaSelecionada, configuracaoAbas])
  
  // Renderização das abas - CORREÇÃO: sem disabled
  const renderizarAba = useCallback((aba: typeof configuracaoAbas[0]) => {
    const IconeComponente = LucideIcons[aba.icone as keyof typeof LucideIcons] as any
    const isAtiva = abaSelecionada === aba.id
    
    return (
      <TabsTrigger 
        key={aba.id}
        value={aba.id} 
        className="relative"
        // CORREÇÃO: removido disabled para showcase
      >
        <div className="flex items-center gap-2">
          <IconeComponente className="h-4 w-4" />
          <span>{aba.label}</span>
          {aba.badge && (
            <Badge variant="secondary" className="ml-1 text-xs">
              {aba.badge}
            </Badge>
          )}
        </div>
      </TabsTrigger>
    )
  }, [abaSelecionada])
  
  // Estado de loading global
  if (carregando) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold mb-2">Carregando Plataforma</h2>
          <p className="text-gray-600">Inicializando sistema de telemedicina...</p>
        </div>
      </div>
    )
  }
  
  // Estado de erro global
  if (erro) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 p-8 rounded-lg text-center max-w-md">
          <LucideIcons.AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Erro no Sistema</h2>
          <p className="text-gray-700 mb-6">{erro}</p>
          <Button onClick={carregarDashboard} className="w-full">
            <LucideIcons.RefreshCw className="mr-2 h-4 w-4" />
            Tentar Novamente
          </Button>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50">
      <Toaster position="bottom-right" richColors />
      
      {/* Header do Sistema */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo e Navegação */}
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <LucideIcons.Heart className="h-8 w-8 text-blue-600 mr-2" />
                <h1 className="text-xl font-bold text-gray-900">TeleMed Pro</h1>
              </div>
              
              <nav className="hidden md:ml-8 md:flex md:space-x-8">
                <Button variant="ghost" size="sm">
                  <LucideIcons.ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar ao Showcase
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setModalSobre(true)}>
                  <LucideIcons.Info className="mr-2 h-4 w-4" />
                  Sobre Este Sistema
                </Button>
              </nav>
            </div>
            
            {/* Notificações e Perfil */}
            <div className="flex items-center space-x-4">
              {/* Notificações */}
              <div className="relative">
                <Button variant="ghost" size="sm">
                  <LucideIcons.Bell className="h-5 w-5" />
                  {notificacoes.length > 0 && (
                    <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs">
                      {notificacoes.length}
                    </Badge>
                  )}
                </Button>
              </div>
              
              {/* Perfil do Usuário */}
              <div className="flex items-center space-x-3">
                <div className="hidden md:block text-right">
                  <div className="text-sm font-medium text-gray-900">{usuarioAtual.nome}</div>
                  <div className="text-sm text-gray-500">{usuarioAtual.especialidade}</div>
                </div>
                <Avatar className="h-8 w-8">
                  <AvatarImage src={usuarioAtual.avatar} />
                  <AvatarFallback className="bg-blue-100 text-blue-600">
                    {gerarIniciaisNome(usuarioAtual.nome)}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      {/* Conteúdo Principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Estatísticas Rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <LucideIcons.Calendar className="h-8 w-8 text-blue-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Hoje</p>
                  <p className="text-2xl font-bold text-gray-900">{estatisticas.consultas_hoje}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <LucideIcons.Users className="h-8 w-8 text-green-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Pacientes</p>
                  <p className="text-2xl font-bold text-gray-900">{estatisticas.pacientes_ativos}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <LucideIcons.Star className="h-8 w-8 text-yellow-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Avaliação</p>
                  <p className="text-2xl font-bold text-gray-900">{estatisticas.avaliacoes_media}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <LucideIcons.Clock className="h-8 w-8 text-purple-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Tempo Médio</p>
                  <p className="text-2xl font-bold text-gray-900">{estatisticas.tempo_medio_consulta}min</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <LucideIcons.TrendingUp className="h-8 w-8 text-red-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Semana</p>
                  <p className="text-2xl font-bold text-gray-900">{estatisticas.consultas_semana}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <LucideIcons.DollarSign className="h-8 w-8 text-orange-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Faturamento</p>
                  <p className="text-lg font-bold text-gray-900">{formatarMoeda(estatisticas.faturamento_mes)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Sistema de Abas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <LucideIcons.Activity className="mr-2 h-5 w-5" />
              Sistema de Telemedicina
            </CardTitle>
            <CardDescription>
              Plataforma completa para consultas médicas remotas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={abaSelecionada} onValueChange={handleMudarAba} className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                {configuracaoAbas.map(renderizarAba)}
              </TabsList>
              
              <TabsContent value="dashboard" className="mt-6">
                <DashboardMedico dados={estadosModulos.dashboard?.dados} />
              </TabsContent>
              
              <TabsContent value="agendamento" className="mt-6">
                <AgendamentoInteligente dados={estadosModulos.agendamento?.dados} />
              </TabsContent>
              
              <TabsContent value="teleconsulta" className="mt-6">
                <Teleconsulta dados={estadosModulos.teleconsulta?.dados} />
              </TabsContent>
              
              <TabsContent value="prontuario" className="mt-6">
                <ProntuarioDigital dados={estadosModulos.prontuario?.dados} />
              </TabsContent>
              
              <TabsContent value="pagamentos" className="mt-6">
                <PagamentosConvenios dados={estadosModulos.pagamentos?.dados} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>
      
      {/* Modal Sobre o Sistema */}
      <Dialog open={modalSobre} onOpenChange={setModalSobre}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <LucideIcons.Info className="mr-2 h-5 w-5" />
              Sobre Este Sistema - Plataforma de Telemedicina
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-3">Análise de Complexidade</h3>
              <ul className="space-y-2 text-sm">
                <li><strong>Entidades:</strong> 6 principais (Pacientes, Médicos, Consultas, etc.)</li>
                <li><strong>Fluxos:</strong> 8 jornadas de usuário mapeadas</li>
                <li><strong>Estados UI:</strong> 35 estados identificados</li>
                <li><strong>Perfis:</strong> 4 tipos de usuário diferentes</li>
                <li><strong>Integrações:</strong> 5 APIs externas</li>
                <li><strong>Complexidade Total:</strong> 78 pontos → Sistema Modular</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-3">Tecnologias Demonstradas</h3>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">React + TypeScript</Badge>
                <Badge variant="outline">Sistema Modular</Badge>
                <Badge variant="outline">Estados UI Completos</Badge>
                <Badge variant="outline">Responsividade</Badge>
                <Badge variant="outline">Acessibilidade</Badge>
                <Badge variant="outline">Multi-perfil</Badge>
                <Badge variant="outline">Compliance LGPD</Badge>
                <Badge variant="outline">WebRTC</Badge>
              </div>
            </div>
          </div>
          
          <div className="mt-6">
            <h3 className="font-semibold mb-3">Estados UI Implementados (35 total)</h3>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <strong>Primários (8):</strong>
                <ul className="mt-1 space-y-1">
                  <li>• Loading inicial/ação</li>
                  <li>• Consultas carregadas</li>
                  <li>• Erro de conexão</li>
                  <li>• Agenda vazia</li>
                </ul>
              </div>
              <div>
                <strong>Condicionais (12):</strong>
                <ul className="mt-1 space-y-1">
                  <li>• Perfil médico/paciente</li>
                  <li>• Primeira consulta</li>
                  <li>• Consulta em andamento</li>
                  <li>• Pagamento pendente</li>
                </ul>
              </div>
              <div>
                <strong>Interação (15):</strong>
                <ul className="mt-1 space-y-1">
                  <li>• Agendamento hover</li>
                  <li>• Video call active</li>
                  <li>• Prescrição focus</li>
                  <li>• Notificação toast</li>
                </ul>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}