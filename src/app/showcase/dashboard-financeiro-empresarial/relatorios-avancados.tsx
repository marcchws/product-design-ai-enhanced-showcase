'use client'

import React, { useState, useCallback, useEffect, useMemo } from 'react'
import { toast } from 'sonner'
import * as LucideIcons from 'lucide-react'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface RelatoriosAvancadosProps {
  usuario: any
  dados: any
  carregando: boolean
  erro: string | null
  onRecarregar: () => void
}

interface RelatorioTemplate {
  id: string
  nome: string
  categoria: string
  descricao: string
  tipo: 'financeiro' | 'operacional' | 'gerencial' | 'regulatorio'
  periodicidade: 'diario' | 'semanal' | 'mensal' | 'trimestral' | 'anual' | 'sob_demanda'
  formato: 'pdf' | 'excel' | 'csv' | 'powerbi'
  parametros: RelatorioParametro[]
  ultima_execucao?: string
  proximo_agendamento?: string
  status: 'ativo' | 'inativo' | 'em_desenvolvimento'
}

interface RelatorioParametro {
  id: string
  nome: string
  tipo: 'data' | 'select' | 'multiselect' | 'numero' | 'texto'
  obrigatorio: boolean
  valor_padrao?: string
  opcoes?: string[]
  descricao: string
}

interface RelatorioAgendado {
  id: string
  template_id: string
  nome: string
  destinatarios: string[]
  periodicidade: string
  proximo_envio: string
  status: 'ativo' | 'pausado' | 'falha'
  ultimo_envio?: string
  parametros_salvos: Record<string, any>
}

interface RelatorioHistorico {
  id: string
  template_nome: string
  gerado_por: string
  gerado_em: string
  formato: string
  status: 'sucesso' | 'falha' | 'processando'
  tamanho?: string
  parametros: Record<string, any>
  tempo_execucao?: number
}

// Funções utilitárias
const formatarDataContextual = (dataString: string | undefined): string => {
  if (!dataString) return 'N/A'
  
  try {
    const data = new Date(dataString)
    if (isNaN(data.getTime())) return 'Data inválida'
    
    return data.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch (error) {
    return 'Erro de formato'
  }
}

const formatarStatusRelatorio = (status: string | undefined) => {
  switch (status) {
    case 'sucesso':
      return { texto: 'Sucesso', cor: 'text-green-600', icone: 'CheckCircle', badge: 'default' as const }
    case 'falha':
      return { texto: 'Falha', cor: 'text-red-600', icone: 'XCircle', badge: 'destructive' as const }
    case 'processando':
      return { texto: 'Processando', cor: 'text-blue-600', icone: 'Loader2', badge: 'default' as const }
    case 'ativo':
      return { texto: 'Ativo', cor: 'text-green-600', icone: 'CheckCircle', badge: 'default' as const }
    case 'pausado':
      return { texto: 'Pausado', cor: 'text-yellow-600', icone: 'Pause', badge: 'outline' as const }
    case 'inativo':
      return { texto: 'Inativo', cor: 'text-gray-600', icone: 'Circle', badge: 'secondary' as const }
    default:
      return { texto: 'Indefinido', cor: 'text-gray-500', icone: 'HelpCircle', badge: 'secondary' as const }
  }
}

export default function RelatoriosAvancados({ 
  usuario, 
  dados, 
  carregando, 
  erro, 
  onRecarregar 
}: RelatoriosAvancadosProps) {
  // Estados principais
  const [abaSelecionada, setAbaSelecionada] = useState('templates')
  const [templates, setTemplates] = useState<RelatorioTemplate[]>([])
  const [agendados, setAgendados] = useState<RelatorioAgendado[]>([])
  const [historico, setHistorico] = useState<RelatorioHistorico[]>([])
  
  // Estados de operações
  const [carregandoInterno, setCarregandoInterno] = useState(false)
  const [erroInterno, setErroInterno] = useState<string | null>(null)
  const [modalNovoRelatorio, setModalNovoRelatorio] = useState(false)
  const [modalAgendarRelatorio, setModalAgendarRelatorio] = useState(false)
  const [templateSelecionado, setTemplateSelecionado] = useState<RelatorioTemplate | null>(null)
  const [gerandoRelatorio, setGerandoRelatorio] = useState<string | null>(null)
  
  // Filtros
  const [filtroCategoria, setFiltroCategoria] = useState('todas')
  const [filtroTipo, setFiltroTipo] = useState('todos')
  const [filtroStatus, setFiltroStatus] = useState('todos')
  
  // Prevenção memory leaks
  const montadoRef = React.useRef(true)
  useEffect(() => {
    montadoRef.current = true
    return () => { montadoRef.current = false }
  }, [])
  
// Dados mockados - Templates
const templatesMock: RelatorioTemplate[] = useMemo(() => [
  {
    id: 'tpl-001',
    nome: 'DRE Gerencial',
    categoria: 'Financeiro',
    descricao: 'Demonstrativo de Resultados gerencial mensal',
    tipo: 'financeiro',
    periodicidade: 'mensal',
    formato: 'pdf',
    status: 'ativo',
    ultima_execucao: '2024-01-15T09:30:00',
    proximo_agendamento: '2024-02-15T09:30:00',
    parametros: [
        {
          id: 'periodo',
          nome: 'Período',
          tipo: 'data',
          obrigatorio: true,
          descricao: 'Mês de referência para o relatório'
        },
        {
          id: 'centro_custo',
          nome: 'Centro de Custo',
          tipo: 'multiselect',
          obrigatorio: false,
          opcoes: ['TI', 'Marketing', 'Facilities', 'Administrativo', 'Comercial'],
          descricao: 'Filtrar por centros de custo específicos'
        }
      ]
    },
    {
      id: 'tpl-002',
      nome: 'Fluxo de Caixa Projetado',
      categoria: 'Financeiro',
      descricao: 'Projeção de fluxo de caixa para os próximos 90 dias',
      tipo: 'gerencial',
      periodicidade: 'semanal',
      formato: 'excel',
      status: 'ativo',
      ultima_execucao: '2024-01-14T08:00:00',
      proximo_agendamento: '2024-01-21T08:00:00',
      parametros: [
        {
          id: 'dias_projecao',
          nome: 'Dias de Projeção',
          tipo: 'numero',
          obrigatorio: true,
          valor_padrao: '90',
          descricao: 'Quantidade de dias para projetar'
        },
        {
          id: 'cenario',
          nome: 'Cenário',
          tipo: 'select',
          obrigatorio: true,
          opcoes: ['Otimista', 'Realista', 'Pessimista'],
          valor_padrao: 'Realista',
          descricao: 'Cenário de projeção'
        }
      ]
    },
    {
      id: 'tpl-003',
      nome: 'Análise de Despesas por Categoria',
      categoria: 'Operacional',
      descricao: 'Breakdown detalhado de despesas por categoria e centro de custo',
      tipo: 'operacional',
      periodicidade: 'mensal',
      formato: 'powerbi',
      status: 'ativo',
      ultima_execucao: '2024-01-12T16:45:00',
      parametros: [
        {
          id: 'data_inicio',
          nome: 'Data Início',
          tipo: 'data',
          obrigatorio: true,
          descricao: 'Data inicial do período'
        },
        {
          id: 'data_fim',
          nome: 'Data Fim',
          tipo: 'data',
          obrigatorio: true,
          descricao: 'Data final do período'
        }
      ]
    },
    {
      id: 'tpl-004',
      nome: 'Compliance Fiscal',
      categoria: 'Regulatório',
      descricao: 'Relatório de conformidade fiscal e tributária',
      tipo: 'regulatorio',
      periodicidade: 'trimestral',
      formato: 'pdf',
      status: 'ativo',
      ultima_execucao: '2024-01-01T09:00:00',
      proximo_agendamento: '2024-04-01T09:00:00',
      parametros: [
        {
          id: 'trimestre',
          nome: 'Trimestre',
          tipo: 'select',
          obrigatorio: true,
          opcoes: ['Q1', 'Q2', 'Q3', 'Q4'],
          descricao: 'Trimestre fiscal'
        }
      ]
    },
    {
      id: 'tpl-005',
      nome: 'Dashboard Executivo',
      categoria: 'Gerencial',
      descricao: 'KPIs executivos e métricas estratégicas',
      tipo: 'gerencial',
      periodicidade: 'diario',
      formato: 'pdf',
      status: 'ativo',
      ultima_execucao: '2024-01-15T06:00:00',
      proximo_agendamento: '2024-01-16T06:00:00',
      parametros: []
    }
  ], [])
  
  // Dados mockados - Relatórios Agendados
  const agendadosMock: RelatorioAgendado[] = useMemo(() => [
    {
      id: 'agd-001',
      template_id: 'tpl-001',
      nome: 'DRE Gerencial - Mensal',
      destinatarios: ['cfo@empresa.com', 'controller@empresa.com'],
      periodicidade: 'Mensal (dia 15)',
      proximo_envio: '2024-02-15T09:30:00',
      status: 'ativo',
      ultimo_envio: '2024-01-15T09:30:00',
      parametros_salvos: {
        centro_custo: ['TI', 'Marketing']
      }
    },
    {
      id: 'agd-002',
      template_id: 'tpl-002',
      nome: 'Fluxo de Caixa - Semanal',
      destinatarios: ['cfo@empresa.com', 'tesouraria@empresa.com'],
      periodicidade: 'Semanal (segunda-feira)',
      proximo_envio: '2024-01-22T08:00:00',
      status: 'ativo',
      ultimo_envio: '2024-01-15T08:00:00',
      parametros_salvos: {
        dias_projecao: 90,
        cenario: 'Realista'
      }
    },
    {
      id: 'agd-003',
      template_id: 'tpl-005',
      nome: 'Dashboard CEO - Diário',
      destinatarios: ['ceo@empresa.com'],
      periodicidade: 'Diário (06:00)',
      proximo_envio: '2024-01-16T06:00:00',
      status: 'ativo',
      ultimo_envio: '2024-01-15T06:00:00',
      parametros_salvos: {}
    }
  ], [])
  
  // Dados mockados - Histórico
  const historicoMock: RelatorioHistorico[] = useMemo(() => [
    {
      id: 'hist-001',
      template_nome: 'DRE Gerencial',
      gerado_por: 'Ana Silva (CFO)',
      gerado_em: '2024-01-15T09:30:00',
      formato: 'PDF',
      status: 'sucesso',
      tamanho: '2.3 MB',
      tempo_execucao: 45,
      parametros: {
        periodo: 'Janeiro 2024',
        centro_custo: ['TI', 'Marketing']
      }
    },
    {
      id: 'hist-002',
      template_nome: 'Fluxo de Caixa Projetado',
      gerado_por: 'Sistema Automático',
      gerado_em: '2024-01-15T08:00:00',
      formato: 'Excel',
      status: 'sucesso',
      tamanho: '1.8 MB',
      tempo_execucao: 32,
      parametros: {
        dias_projecao: 90,
        cenario: 'Realista'
      }
    },
    {
      id: 'hist-003',
      template_nome: 'Dashboard Executivo',
      gerado_por: 'Sistema Automático',
      gerado_em: '2024-01-15T06:00:00',
      formato: 'PDF',
      status: 'sucesso',
      tamanho: '1.2 MB',
      tempo_execucao: 18,
      parametros: {}
    },
    {
      id: 'hist-004',
      template_nome: 'Análise de Despesas',
      gerado_por: 'Pedro Santos (Controller)',
      gerado_em: '2024-01-14T16:45:00',
      formato: 'PowerBI',
      status: 'falha',
      tempo_execucao: 120,
      parametros: {
        data_inicio: '2024-01-01',
        data_fim: '2024-01-31'
      }
    }
  ], [])
  
  // Carregar dados
  const carregarRelatorios = useCallback(async () => {
    if (!montadoRef.current) return
    
    setCarregandoInterno(true)
    setErroInterno(null)
    
    const timeoutId = setTimeout(() => {
      if (montadoRef.current) {
        setCarregandoInterno(false)
        setErroInterno('Tempo de carregamento excedido.')
      }
    }, 8000)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      if (montadoRef.current) {
        setTemplates(templatesMock)
        setAgendados(agendadosMock)
        setHistorico(historicoMock)
      }
    } catch (error) {
      console.error('Erro ao carregar relatórios:', error)
      if (montadoRef.current) {
        setErroInterno('Falha ao carregar dados de relatórios.')
      }
    } finally {
      clearTimeout(timeoutId)
      if (montadoRef.current) {
        setCarregandoInterno(false)
      }
    }
  }, [templatesMock, agendadosMock, historicoMock])
  
  // Carregar dados na inicialização
  useEffect(() => {
    carregarRelatorios()
  }, [carregarRelatorios])
  
  // Gerar relatório
  const handleGerarRelatorio = useCallback(async (template: RelatorioTemplate) => {
    setGerandoRelatorio(template.id)
    
    try {
      // Simular geração
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      // Adicionar ao histórico
      const novoHistorico: RelatorioHistorico = {
        id: `hist-${Date.now()}`,
        template_nome: template.nome,
        gerado_por: `${usuario?.nome} (${usuario?.perfil})`,
        gerado_em: new Date().toISOString(),
        formato: template.formato.toUpperCase(),
        status: 'sucesso',
        tamanho: '1.5 MB',
        tempo_execucao: Math.floor(Math.random() * 60) + 15,
        parametros: {}
      }
      
      setHistorico(prev => [novoHistorico, ...prev])
      toast.success(`Relatório "${template.nome}" gerado com sucesso`)
    } catch (error) {
      toast.error('Falha ao gerar relatório')
    } finally {
      setGerandoRelatorio(null)
    }
  }, [usuario])
  
  // Filtrar templates
  const templatesFiltrados = useMemo(() => {
    return templates.filter(template => {
      if (filtroCategoria !== 'todas' && template.categoria !== filtroCategoria) return false
      if (filtroTipo !== 'todos' && template.tipo !== filtroTipo) return false
      if (filtroStatus !== 'todos' && template.status !== filtroStatus) return false
      return true
    })
  }, [templates, filtroCategoria, filtroTipo, filtroStatus])
  
  // Calcular métricas
  const metricas = useMemo(() => {
    const totalTemplates = templates.length
    const templatesAtivos = templates.filter(t => t.status === 'ativo').length
    const agendamentosAtivos = agendados.filter(a => a.status === 'ativo').length
    const relatoriosHoje = historico.filter(h => {
      const dataGeracao = new Date(h.gerado_em)
      const hoje = new Date()
      return dataGeracao.toDateString() === hoje.toDateString()
    }).length
    
    return {
      totalTemplates,
      templatesAtivos,
      agendamentosAtivos,
      relatoriosHoje
    }
  }, [templates, agendados, historico])
  
  // Estados de loading e erro
  const isCarregando = carregando || carregandoInterno
  const erroFinal = erro || erroInterno
  
  if (isCarregando) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-64"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }
  
  if (erroFinal) {
    return (
      <div className="bg-red-50 border border-red-200 p-8 rounded-lg text-center">
        <LucideIcons.AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">Erro ao carregar relatórios</h3>
        <p className="text-gray-700 mb-6">{erroFinal}</p>
        <Button onClick={onRecarregar}>
          <LucideIcons.RefreshCw className="mr-2 h-4 w-4" />
          Tentar Novamente
        </Button>
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      {/* Header com ações */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Relatórios Avançados</h2>
          <p className="text-gray-600">Geração e automação de relatórios financeiros</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button variant="outline">
            <LucideIcons.Settings className="mr-2 h-4 w-4" />
            Configurações
          </Button>
          <Button onClick={() => setModalNovoRelatorio(true)}>
            <LucideIcons.Plus className="mr-2 h-4 w-4" />
            Novo Template
          </Button>
        </div>
      </div>
      
      {/* Métricas resumidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <LucideIcons.FileText className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Templates</p>
                <p className="text-2xl font-bold text-gray-900">{metricas.totalTemplates}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <LucideIcons.CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Ativos</p>
                <p className="text-2xl font-bold text-gray-900">{metricas.templatesAtivos}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <LucideIcons.Clock className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Agendamentos</p>
                <p className="text-2xl font-bold text-gray-900">{metricas.agendamentosAtivos}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <LucideIcons.Download className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Gerados Hoje</p>
                <p className="text-2xl font-bold text-gray-900">{metricas.relatoriosHoje}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Sistema de abas */}
      <Tabs value={abaSelecionada} onValueChange={setAbaSelecionada}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <LucideIcons.FileText className="h-4 w-4" />
            Templates ({templates.length})
          </TabsTrigger>
          <TabsTrigger value="agendados" className="flex items-center gap-2">
            <LucideIcons.Calendar className="h-4 w-4" />
            Agendados ({agendados.length})
          </TabsTrigger>
          <TabsTrigger value="historico" className="flex items-center gap-2">
            <LucideIcons.History className="h-4 w-4" />
            Histórico ({historico.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="templates" className="space-y-6">
          {/* Filtros */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
                  <SelectTrigger>
                    <SelectValue placeholder="Categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todas">Todas as Categorias</SelectItem>
                    <SelectItem value="Financeiro">Financeiro</SelectItem>
                    <SelectItem value="Operacional">Operacional</SelectItem>
                    <SelectItem value="Gerencial">Gerencial</SelectItem>
                    <SelectItem value="Regulatório">Regulatório</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={filtroTipo} onValueChange={setFiltroTipo}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os Tipos</SelectItem>
                    <SelectItem value="financeiro">Financeiro</SelectItem>
                    <SelectItem value="operacional">Operacional</SelectItem>
                    <SelectItem value="gerencial">Gerencial</SelectItem>
                    <SelectItem value="regulatorio">Regulatório</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os Status</SelectItem>
                    <SelectItem value="ativo">Ativo</SelectItem>
                    <SelectItem value="inativo">Inativo</SelectItem>
                    <SelectItem value="em_desenvolvimento">Em Desenvolvimento</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button
                  variant="outline"
                  onClick={() => {
                    setFiltroCategoria('todas')
                    setFiltroTipo('todos')
                    setFiltroStatus('todos')
                  }}
                >
                  <LucideIcons.RefreshCw className="mr-2 h-4 w-4" />
                  Limpar
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {/* Grid de templates */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templatesFiltrados.map((template) => {
              const statusInfo = formatarStatusRelatorio(template.status)
              const IconeStatus = LucideIcons[statusInfo.icone as keyof typeof LucideIcons] as any
              const isGerando = gerandoRelatorio === template.id
              
              return (
                <Card key={template.id} className="relative">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {template.formato === 'pdf' && <LucideIcons.FileText className="h-5 w-5 text-red-600" />}
                        {template.formato === 'excel' && <LucideIcons.FileSpreadsheet className="h-5 w-5 text-green-600" />}
                        {template.formato === 'csv' && <LucideIcons.FileDown className="h-5 w-5 text-blue-600" />}
                        {template.formato === 'powerbi' && <LucideIcons.BarChart3 className="h-5 w-5 text-purple-600" />}
                        <CardTitle className="text-lg">{template.nome}</CardTitle>
                      </div>
                      <Badge variant={statusInfo.badge}>
                        <IconeStatus className="h-3 w-3 mr-1" />
                        {statusInfo.texto}
                      </Badge>
                    </div>
                    <CardDescription>{template.descricao}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Categoria:</span>
                        <span className="font-medium">{template.categoria}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Periodicidade:</span>
                        <span className="font-medium capitalize">{template.periodicidade}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Formato:</span>
                        <span className="font-medium uppercase">{template.formato}</span>
                      </div>
                      {template.ultima_execucao && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Última execução:</span>
                          <span className="font-medium">{formatarDataContextual(template.ultima_execucao)}</span>
                        </div>
                      )}
                      
                      <div className="pt-3 border-t flex space-x-2">
                        <Button 
                          size="sm" 
                          className="flex-1"
                          onClick={() => handleGerarRelatorio(template)}
                          disabled={isGerando || template.status !== 'ativo'}
                        >
                          {isGerando ? (
                            <>
                              <LucideIcons.Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Gerando...
                            </>
                          ) : (
                            <>
                              <LucideIcons.Play className="mr-2 h-4 w-4" />
                              Gerar
                            </>
                          )}
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setTemplateSelecionado(template)
                            setModalAgendarRelatorio(true)
                          }}
                        >
                          <LucideIcons.Calendar className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <LucideIcons.Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>
        
        <TabsContent value="agendados" className="space-y-6">
          {/* Lista de agendamentos */}
          <Card>
            <CardHeader>
              <CardTitle>Relatórios Agendados</CardTitle>
              <CardDescription>
                Relatórios configurados para envio automático
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {agendados.map((agendado) => {
                  const statusInfo = formatarStatusRelatorio(agendado.status)
                  const IconeStatus = LucideIcons[statusInfo.icone as keyof typeof LucideIcons] as any
                  
                  return (
                    <div key={agendado.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className={`p-2 rounded-full ${
                          agendado.status === 'ativo' ? 'bg-green-100' :
                          agendado.status === 'pausado' ? 'bg-yellow-100' :
                          'bg-red-100'
                        }`}>
                          <IconeStatus className={`h-5 w-5 ${statusInfo.cor}`} />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{agendado.nome}</h4>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>{agendado.periodicidade}</span>
                            <span>•</span>
                            <span>{agendado.destinatarios.length} destinatário(s)</span>
                            <span>•</span>
                            <span>Próximo: {formatarDataContextual(agendado.proximo_envio)}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Badge variant={statusInfo.badge}>
                          {statusInfo.texto}
                        </Badge>
                        <Button variant="ghost" size="sm">
                          <LucideIcons.Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          {agendado.status === 'ativo' ? (
                            <LucideIcons.Pause className="h-4 w-4" />
                          ) : (
                            <LucideIcons.Play className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="historico" className="space-y-6">
          {/* Tabela de histórico */}
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Relatórios</CardTitle>
              <CardDescription>
                Registro de todos os relatórios gerados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Relatório
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Gerado Por
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Data/Hora
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tamanho
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {historico.map((item) => {
                      const statusInfo = formatarStatusRelatorio(item.status)
                      const IconeStatus = LucideIcons[statusInfo.icone as keyof typeof LucideIcons] as any
                      
                      return (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{item.template_nome}</div>
                              <div className="text-sm text-gray-500">{item.formato}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.gerado_por}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatarDataContextual(item.gerado_em)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge variant={statusInfo.badge} className="flex items-center gap-1 w-fit">
                              <IconeStatus className="h-3 w-3" />
                              {statusInfo.texto}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.tamanho || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              {item.status === 'sucesso' && (
                                <Button variant="ghost" size="sm">
                                  <LucideIcons.Download className="h-4 w-4" />
                                </Button>
                              )}
                              <Button variant="ghost" size="sm">
                                <LucideIcons.Eye className="h-4 w-4" />
                              </Button>
                              {item.status === 'falha' && (
                                <Button variant="ghost" size="sm">
                                  <LucideIcons.RefreshCw className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Modal Novo Template */}
      <Dialog open={modalNovoRelatorio} onOpenChange={setModalNovoRelatorio}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Novo Template de Relatório</DialogTitle>
            <DialogDescription>
              Configure um novo template de relatório
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div>
              <Label htmlFor="nome">Nome do Template</Label>
              <Input id="nome" placeholder="Ex: DRE Gerencial" />
            </div>
            <div>
              <Label htmlFor="categoria">Categoria</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="financeiro">Financeiro</SelectItem>
                  <SelectItem value="operacional">Operacional</SelectItem>
                  <SelectItem value="gerencial">Gerencial</SelectItem>
                  <SelectItem value="regulatorio">Regulatório</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="periodicidade">Periodicidade</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="diario">Diário</SelectItem>
                  <SelectItem value="semanal">Semanal</SelectItem>
                  <SelectItem value="mensal">Mensal</SelectItem>
                  <SelectItem value="trimestral">Trimestral</SelectItem>
                  <SelectItem value="anual">Anual</SelectItem>
                  <SelectItem value="sob_demanda">Sob Demanda</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="formato">Formato</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="excel">Excel</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="powerbi">Power BI</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea id="descricao" placeholder="Descrição detalhada do relatório" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalNovoRelatorio(false)}>
              Cancelar
            </Button>
            <Button onClick={() => {
              toast.success('Template criado com sucesso')
              setModalNovoRelatorio(false)
            }}>
              Criar Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Modal Agendar Relatório */}
      <Dialog open={modalAgendarRelatorio} onOpenChange={setModalAgendarRelatorio}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Agendar Relatório</DialogTitle>
            <DialogDescription>
              Configure o envio automático de "{templateSelecionado?.nome}"
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="nome_agendamento">Nome do Agendamento</Label>
              <Input 
                id="nome_agendamento" 
                placeholder="Ex: DRE Mensal - Diretoria"
                defaultValue={`${templateSelecionado?.nome} - Automático`}
              />
            </div>
            <div>
              <Label htmlFor="destinatarios">Destinatários (emails separados por vírgula)</Label>
              <Textarea 
                id="destinatarios" 
                placeholder="cfo@empresa.com, controller@empresa.com"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="periodicidade_agendamento">Periodicidade</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="diario">Diário</SelectItem>
                    <SelectItem value="semanal">Semanal</SelectItem>
                    <SelectItem value="mensal">Mensal</SelectItem>
                    <SelectItem value="trimestral">Trimestral</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="horario">Horário</Label>
                <Input id="horario" type="time" defaultValue="09:00" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalAgendarRelatorio(false)}>
              Cancelar
            </Button>
            <Button onClick={() => {
              toast.success('Relatório agendado com sucesso')
              setModalAgendarRelatorio(false)
            }}>
              Agendar Relatório
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}