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

interface DespesasCustosProps {
  usuario: any
  dados: any
  carregando: boolean
  erro: string | null
  onRecarregar: () => void
}

interface Despesa {
  id: string
  data: string
  fornecedor: string
  descricao: string
  categoria: string
  subcategoria: string
  valor: number
  status: 'paga' | 'pendente' | 'aprovada' | 'rejeitada' | 'vencida'
  metodo_pagamento?: string
  numero_nota?: string
  vencimento?: string
  centro_custo: string
  aprovador?: string
  observacoes?: string
  anexos?: string[]
}

interface Orcamento {
  id: string
  categoria: string
  orcado: number
  realizado: number
  periodo: string
  responsavel: string
  status: 'dentro_limite' | 'proximo_limite' | 'excedido'
}

interface FiltrosDespesa {
  termo: string
  status: string
  categoria: string
  centro_custo: string
  fornecedor: string
  data_inicio: string
  data_fim: string
  valor_min: string
  valor_max: string
  aprovador: string
}

// Funções utilitárias defensivas
const formatarMoeda = (valor: number | undefined): string => {
  if (valor === undefined || valor === null || isNaN(valor)) return 'R$ 0,00'
  
  try {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor)
  } catch (error) {
    return `R$ ${valor.toFixed(2)}`
  }
}

const formatarDataContextual = (dataString: string | undefined): string => {
  if (!dataString) return 'N/A'
  
  try {
    const data = new Date(dataString)
    if (isNaN(data.getTime())) return 'Data inválida'
    
    return data.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  } catch (error) {
    return 'Erro de formato'
  }
}

const formatarStatusDespesa = (status: string | undefined) => {
  switch (status) {
    case 'paga':
      return { texto: 'Paga', cor: 'text-green-600', icone: 'CheckCircle', badge: 'default' as const }
    case 'pendente':
      return { texto: 'Pendente', cor: 'text-yellow-600', icone: 'Clock', badge: 'secondary' as const }
    case 'aprovada':
      return { texto: 'Aprovada', cor: 'text-blue-600', icone: 'ThumbsUp', badge: 'outline' as const }
    case 'rejeitada':
      return { texto: 'Rejeitada', cor: 'text-red-600', icone: 'ThumbsDown', badge: 'destructive' as const }
    case 'vencida':
      return { texto: 'Vencida', cor: 'text-red-600', icone: 'AlertTriangle', badge: 'destructive' as const }
    default:
      return { texto: 'Indefinido', cor: 'text-gray-500', icone: 'HelpCircle', badge: 'outline' as const }
  }
}

const calcularPercentualOrcamento = (realizado: number, orcado: number): number => {
  if (orcado === 0) return 0
  return (realizado / orcado) * 100
}

export default function DespesasCustos({ 
  usuario, 
  dados, 
  carregando, 
  erro, 
  onRecarregar 
}: DespesasCustosProps) {
  // Estados principais
  const [abaSelecionada, setAbaSelecionada] = useState('despesas')
  const [despesas, setDespesas] = useState<Despesa[]>([])
  const [orcamentos, setOrcamentos] = useState<Orcamento[]>([])
  const [totalDespesas, setTotalDespesas] = useState(0)
  const [pagina, setPagina] = useState(1)
  const [itensPorPagina, setItensPorPagina] = useState(25)
  const [ordenacao, setOrdenacao] = useState({ campo: 'data', direcao: 'desc' })
  
  // Estados de filtros
  const [filtros, setFiltros] = useState<FiltrosDespesa>({
    termo: '',
    status: 'todas',
    categoria: 'todas',
    centro_custo: 'todos',
    fornecedor: 'todos',
    data_inicio: '',
    data_fim: '',
    valor_min: '',
    valor_max: '',
    aprovador: 'todos'
  })
  
  // Estados de operações
  const [carregandoInterno, setCarregandoInterno] = useState(false)
  const [erroInterno, setErroInterno] = useState<string | null>(null)
  const [selecionados, setSelecionados] = useState<string[]>([])
  const [modalNovaDespesa, setModalNovaDespesa] = useState(false)
  const [modalAprovacao, setModalAprovacao] = useState(false)
  const [despesaAprovacao, setDespesaAprovacao] = useState<Despesa | null>(null)
  
  // Prevenção memory leaks
  const montadoRef = React.useRef(true)
  useEffect(() => {
    montadoRef.current = true
    return () => { montadoRef.current = false }
  }, [])
  
  // Dados mockados - Despesas
  const despesasMock: Despesa[] = useMemo(() => [
    {
      id: 'dsp-001',
      data: '2024-01-15',
      fornecedor: 'TechSupply Informática',
      descricao: 'Licenças de software - Microsoft Office 365',
      categoria: 'Tecnologia',
      subcategoria: 'Software',
      valor: 15600,
      status: 'paga',
      metodo_pagamento: 'Transferência',
      numero_nota: 'NF-2024-001',
      centro_custo: 'TI',
      aprovador: 'Carlos Silva',
      observacoes: 'Renovação anual das licenças'
    },
    {
      id: 'dsp-002',
      data: '2024-01-14',
      fornecedor: 'Energia Sustentável SA',
      descricao: 'Conta de energia elétrica - Janeiro 2024',
      categoria: 'Utilities',
      subcategoria: 'Energia',
      valor: 8900,
      status: 'pendente',
      numero_nota: 'CONTA-2024-001',
      vencimento: '2024-01-25',
      centro_custo: 'Facilities',
      observacoes: 'Consumo acima da média'
    },
    {
      id: 'dsp-003',
      data: '2024-01-12',
      fornecedor: 'Marketing Digital Pro',
      descricao: 'Campanha publicitária - Google Ads',
      categoria: 'Marketing',
      subcategoria: 'Publicidade Online',
      valor: 25000,
      status: 'aprovada',
      centro_custo: 'Marketing',
      aprovador: 'Ana Costa',
      observacoes: 'Campanha para Q1 2024'
    },
    {
      id: 'dsp-004',
      data: '2024-01-10',
      fornecedor: 'Office Solutions Ltda',
      descricao: 'Material de escritório e suprimentos',
      categoria: 'Administrativo',
      subcategoria: 'Material de Escritório',
      valor: 3200,
      status: 'rejeitada',
      centro_custo: 'Administrativo',
      aprovador: 'Pedro Santos',
      observacoes: 'Quantidade excessiva solicitada'
    },
    {
      id: 'dsp-005',
      data: '2024-01-08',
      fornecedor: 'Viagens Corporativas',
      descricao: 'Passagens aéreas - Reunião cliente SP',
      categoria: 'Viagens',
      subcategoria: 'Transporte',
      valor: 1800,
      status: 'vencida',
      vencimento: '2024-01-20',
      centro_custo: 'Comercial',
      observacoes: 'Pagamento em atraso'
    },
    {
      id: 'dsp-006',
      data: '2024-01-05',
      fornecedor: 'CloudHost Serviços',
      descricao: 'Hospedagem e serviços cloud - Janeiro',
      categoria: 'Tecnologia',
      subcategoria: 'Infraestrutura',
      valor: 4500,
      status: 'paga',
      metodo_pagamento: 'Cartão Corporativo',
      centro_custo: 'TI'
    }
  ], [])
  
  // Dados mockados - Orçamentos
  const orcamentosMock: Orcamento[] = useMemo(() => [
    {
      id: 'orc-001',
      categoria: 'Tecnologia',
      orcado: 50000,
      realizado: 20100,
      periodo: 'Janeiro 2024',
      responsavel: 'Carlos Silva',
      status: 'dentro_limite'
    },
    {
      id: 'orc-002',
      categoria: 'Marketing',
      orcado: 30000,
      realizado: 25000,
      periodo: 'Janeiro 2024',
      responsavel: 'Ana Costa',
      status: 'proximo_limite'
    },
    {
      id: 'orc-003',
      categoria: 'Utilities',
      orcado: 10000,
      realizado: 8900,
      periodo: 'Janeiro 2024',
      responsavel: 'João Lima',
      status: 'dentro_limite'
    },
    {
      id: 'orc-004',
      categoria: 'Administrativo',
      orcado: 5000,
      realizado: 6200,
      periodo: 'Janeiro 2024',
      responsavel: 'Pedro Santos',
      status: 'excedido'
    },
    {
      id: 'orc-005',
      categoria: 'Viagens',
      orcado: 8000,
      realizado: 1800,
      periodo: 'Janeiro 2024',
      responsavel: 'Maria Silva',
      status: 'dentro_limite'
    }
  ], [])
  
  // Carregar dados com filtros
  const carregarDespesas = useCallback(async () => {
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
      await new Promise(resolve => setTimeout(resolve, 1200))
      
      let despesasFiltradas = [...despesasMock]
      
      // Aplicar filtros
      if (filtros.termo) {
        despesasFiltradas = despesasFiltradas.filter(d => 
          d.fornecedor.toLowerCase().includes(filtros.termo.toLowerCase()) ||
          d.descricao.toLowerCase().includes(filtros.termo.toLowerCase()) ||
          d.numero_nota?.toLowerCase().includes(filtros.termo.toLowerCase())
        )
      }
      
      if (filtros.status !== 'todas') {
        despesasFiltradas = despesasFiltradas.filter(d => d.status === filtros.status)
      }
      
      if (filtros.categoria !== 'todas') {
        despesasFiltradas = despesasFiltradas.filter(d => d.categoria === filtros.categoria)
      }
      
      if (filtros.centro_custo !== 'todos') {
        despesasFiltradas = despesasFiltradas.filter(d => d.centro_custo === filtros.centro_custo)
      }
      
      // Ordenação
      despesasFiltradas.sort((a, b) => {
        const fator = ordenacao.direcao === 'asc' ? 1 : -1
        
        switch (ordenacao.campo) {
          case 'data':
            return fator * (new Date(a.data).getTime() - new Date(b.data).getTime())
          case 'valor':
            return fator * (a.valor - b.valor)
          case 'fornecedor':
            return fator * a.fornecedor.localeCompare(b.fornecedor)
          default:
            return 0
        }
      })
      
      if (montadoRef.current) {
        setDespesas(despesasFiltradas)
        setOrcamentos(orcamentosMock)
        setTotalDespesas(despesasFiltradas.length)
        setSelecionados([])
      }
    } catch (error) {
      console.error('Erro ao carregar despesas:', error)
      if (montadoRef.current) {
        setErroInterno('Falha ao carregar dados de despesas.')
      }
    } finally {
      clearTimeout(timeoutId)
      if (montadoRef.current) {
        setCarregandoInterno(false)
      }
    }
  }, [filtros, ordenacao, despesasMock, orcamentosMock])
  
  // Carregar dados quando filtros mudam
  useEffect(() => {
    carregarDespesas()
  }, [carregarDespesas])
  
  // Handlers para filtros
  const handleFiltroChange = useCallback((campo: string, valor: any) => {
    setFiltros(prev => ({ ...prev, [campo]: valor }))
    setPagina(1)
  }, [])
  
  const handleLimparFiltros = useCallback(() => {
    setFiltros({
      termo: '',
      status: 'todas',
      categoria: 'todas',
      centro_custo: 'todos',
      fornecedor: 'todos',
      data_inicio: '',
      data_fim: '',
      valor_min: '',
      valor_max: '',
      aprovador: 'todos'
    })
    setPagina(1)
  }, [])
  
  // Handlers para seleção
  const handleSelecionarTodos = useCallback(() => {
    const despesasPagina = despesas.slice((pagina - 1) * itensPorPagina, pagina * itensPorPagina)
    const todosSelecionados = despesasPagina.every(d => selecionados.includes(d.id))
    
    if (todosSelecionados) {
      setSelecionados(prev => prev.filter(id => !despesasPagina.some(d => d.id === id)))
    } else {
      setSelecionados(prev => Array.from(new Set([...prev, ...despesasPagina.map(d => d.id)])))
    }
  }, [despesas, pagina, itensPorPagina, selecionados])
  
  const handleSelecionarItem = useCallback((id: string) => {
    setSelecionados(prev => 
      prev.includes(id) 
        ? prev.filter(itemId => itemId !== id)
        : [...prev, id]
    )
  }, [])
  
  // Handler para aprovação
  const handleAprovar = useCallback((despesa: Despesa, aprovar: boolean) => {
    // Simular aprovação/rejeição
    setDespesas(prev => prev.map(d => 
      d.id === despesa.id 
        ? { ...d, status: aprovar ? 'aprovada' : 'rejeitada', aprovador: usuario?.nome }
        : d
    ))
    
    toast.success(`Despesa ${aprovar ? 'aprovada' : 'rejeitada'} com sucesso`)
    setModalAprovacao(false)
    setDespesaAprovacao(null)
  }, [usuario])
  
  // Verificar se há filtros aplicados
  const filtrosAplicados = useMemo(() => {
    return Object.values(filtros).some(value => 
      value !== '' && value !== 'todas' && value !== 'todos'
    )
  }, [filtros])
  
  // Calcular métricas das despesas
  const metricasDespesas = useMemo(() => {
    const total = despesas.reduce((acc, d) => acc + d.valor, 0)
    const pagas = despesas.filter(d => d.status === 'paga').reduce((acc, d) => acc + d.valor, 0)
    const pendentes = despesas.filter(d => d.status === 'pendente').reduce((acc, d) => acc + d.valor, 0)
    const vencidas = despesas.filter(d => d.status === 'vencida').reduce((acc, d) => acc + d.valor, 0)
    
    return { total, pagas, pendentes, vencidas }
  }, [despesas])
  
  // Paginação
  const totalPaginas = Math.ceil(totalDespesas / itensPorPagina)
  const despesasPaginadas = despesas.slice((pagina - 1) * itensPorPagina, pagina * itensPorPagina)
  
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
        <h3 className="text-lg font-medium mb-2">Erro ao carregar despesas</h3>
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
          <h2 className="text-2xl font-bold text-gray-900">Despesas e Custos</h2>
          <p className="text-gray-600">Gestão de despesas e controle orçamentário</p>
        </div>
        
        <div className="flex items-center space-x-3">
          {selecionados.length > 0 && (
            <div className="flex items-center space-x-2">
              <Badge variant="secondary">
                {selecionados.length} selecionadas
              </Badge>
              {usuario?.perfil === 'CFO' && (
                <Button variant="outline" size="sm">
                  <LucideIcons.Check className="h-4 w-4 mr-1" />
                  Aprovar Lote
                </Button>
              )}
              <Button variant="outline" size="sm">
                <LucideIcons.FileDown className="h-4 w-4 mr-1" />
                Exportar
              </Button>
            </div>
          )}
          
          <Button onClick={() => setModalNovaDespesa(true)}>
            <LucideIcons.Plus className="mr-2 h-4 w-4" />
            Nova Despesa
          </Button>
        </div>
      </div>
      
      {/* Métricas resumidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <LucideIcons.CreditCard className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Despesas</p>
                <p className="text-2xl font-bold text-gray-900">{formatarMoeda(metricasDespesas.total)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <LucideIcons.CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pagas</p>
                <p className="text-2xl font-bold text-gray-900">{formatarMoeda(metricasDespesas.pagas)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <LucideIcons.Clock className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pendentes</p>
                <p className="text-2xl font-bold text-gray-900">{formatarMoeda(metricasDespesas.pendentes)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <LucideIcons.AlertTriangle className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Vencidas</p>
                <p className="text-2xl font-bold text-gray-900">{formatarMoeda(metricasDespesas.vencidas)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Sistema de abas */}
      <Tabs value={abaSelecionada} onValueChange={setAbaSelecionada}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="despesas" className="flex items-center gap-2">
            <LucideIcons.Receipt className="h-4 w-4" />
            Despesas ({despesas.length})
          </TabsTrigger>
          <TabsTrigger value="orcamentos" className="flex items-center gap-2">
            <LucideIcons.Target className="h-4 w-4" />
            Orçamentos ({orcamentos.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="despesas" className="space-y-6">
          {/* Filtros avançados */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="relative">
                  <LucideIcons.Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar fornecedor, descrição..."
                    value={filtros.termo}
                    onChange={e => handleFiltroChange('termo', e.target.value)}
                    className="pl-9"
                  />
                </div>
                
                <Select
                  value={filtros.status}
                  onValueChange={valor => handleFiltroChange('status', valor)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todas">Todos os Status</SelectItem>
                    <SelectItem value="paga">Paga</SelectItem>
                    <SelectItem value="pendente">Pendente</SelectItem>
                    <SelectItem value="aprovada">Aprovada</SelectItem>
                    <SelectItem value="rejeitada">Rejeitada</SelectItem>
                    <SelectItem value="vencida">Vencida</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select
                  value={filtros.categoria}
                  onValueChange={valor => handleFiltroChange('categoria', valor)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todas">Todas as Categorias</SelectItem>
                    <SelectItem value="Tecnologia">Tecnologia</SelectItem>
                    <SelectItem value="Marketing">Marketing</SelectItem>
                    <SelectItem value="Utilities">Utilities</SelectItem>
                    <SelectItem value="Administrativo">Administrativo</SelectItem>
                    <SelectItem value="Viagens">Viagens</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select
                  value={filtros.centro_custo}
                  onValueChange={valor => handleFiltroChange('centro_custo', valor)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Centro de Custo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os Centros</SelectItem>
                    <SelectItem value="TI">TI</SelectItem>
                    <SelectItem value="Marketing">Marketing</SelectItem>
                    <SelectItem value="Facilities">Facilities</SelectItem>
                    <SelectItem value="Administrativo">Administrativo</SelectItem>
                    <SelectItem value="Comercial">Comercial</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button
                  variant="outline"
                  onClick={handleLimparFiltros}
                  disabled={!filtrosAplicados}
                >
                  <LucideIcons.RefreshCw className="mr-2 h-4 w-4" />
                  Limpar
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {/* Lista de despesas */}
          {despesas.length === 0 && !isCarregando ? (
            <div className="text-center py-16">
              <LucideIcons.Receipt className="h-16 w-16 text-gray-300 mx-auto mb-6" />
              <h3 className="text-xl font-medium mb-2">
                {filtrosAplicados ? 'Nenhuma despesa encontrada' : 'Nenhuma despesa cadastrada'}
              </h3>
              <p className="text-gray-500 max-w-md mx-auto mb-8">
                {filtrosAplicados 
                  ? 'Nenhuma despesa corresponde aos filtros aplicados.'
                  : 'Você ainda não tem despesas cadastradas.'
                }
              </p>
              
              {filtrosAplicados ? (
                <Button onClick={handleLimparFiltros} variant="outline">
                  <LucideIcons.RefreshCw className="mr-2 h-4 w-4" />
                  Limpar Filtros
                </Button>
              ) : (
                <Button onClick={() => setModalNovaDespesa(true)}>
                  <LucideIcons.Plus className="mr-2 h-4 w-4" />
                  Adicionar Primeira Despesa
                </Button>
              )}
            </div>
          ) : (
            <>
              {/* Controles de visualização */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Checkbox
                    checked={despesasPaginadas.length > 0 && despesasPaginadas.every(d => selecionados.includes(d.id))}
                    onCheckedChange={handleSelecionarTodos}
                  />
                  <span className="text-sm text-gray-600">
                    Selecionar todos ({despesasPaginadas.length} itens)
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">Itens por página:</span>
                  <Select
                    value={itensPorPagina.toString()}
                    onValueChange={(valor) => {
                      setItensPorPagina(Number(valor))
                      setPagina(1)
                    }}
                  >
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="25">25</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {/* Tabela de despesas */}
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="px-6 py-3 text-left">
                            <Checkbox
                              checked={despesasPaginadas.length > 0 && despesasPaginadas.every(d => selecionados.includes(d.id))}
                              onCheckedChange={handleSelecionarTodos}
                            />
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Data
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Fornecedor
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Descrição
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Valor
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Ações
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {despesasPaginadas.map((despesa) => {
                          const statusInfo = formatarStatusDespesa(despesa.status)
                          const IconeStatus = LucideIcons[statusInfo.icone as keyof typeof LucideIcons] as any
                          
                          return (
                            <tr key={despesa.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4">
                                <Checkbox
                                  checked={selecionados.includes(despesa.id)}
                                  onCheckedChange={() => handleSelecionarItem(despesa.id)}
                                />
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {formatarDataContextual(despesa.data)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div>
                                  <div className="text-sm font-medium text-gray-900">{despesa.fornecedor}</div>
                                  <div className="text-sm text-gray-500">{despesa.categoria}</div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="text-sm text-gray-900">{despesa.descricao}</div>
                                <div className="text-sm text-gray-500">
                                  {despesa.numero_nota} • {despesa.centro_custo}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">{formatarMoeda(despesa.valor)}</div>
                                {despesa.vencimento && (
                                  <div className="text-sm text-gray-500">
                                    Venc: {formatarDataContextual(despesa.vencimento)}
                                  </div>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <Badge variant={statusInfo.badge} className="flex items-center gap-1 w-fit">
                                  <IconeStatus className="h-3 w-3" />
                                  {statusInfo.texto}
                                </Badge>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <div className="flex items-center space-x-2">
                                  <Button variant="ghost" size="sm">
                                    <LucideIcons.Eye className="h-4 w-4" />
                                  </Button>
                                  {(despesa.status === 'pendente' || despesa.status === 'aprovada') && 
                                   usuario?.perfil === 'CFO' && (
                                    <Button 
                                      variant="ghost" 
                                      size="sm"
                                      onClick={() => {
                                        setDespesaAprovacao(despesa)
                                        setModalAprovacao(true)
                                      }}
                                    >
                                      <LucideIcons.Check className="h-4 w-4" />
                                    </Button>
                                  )}
                                  <Button variant="ghost" size="sm">
                                    <LucideIcons.Download className="h-4 w-4" />
                                  </Button>
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
              
              {/* Paginação */}
              {totalPaginas > 1 && (
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500">
                    Mostrando {(pagina - 1) * itensPorPagina + 1} até {Math.min(pagina * itensPorPagina, totalDespesas)} de {totalDespesas} despesas
                  </p>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setPagina(Math.max(1, pagina - 1))}
                      disabled={pagina <= 1}
                    >
                      <LucideIcons.ChevronLeft className="h-4 w-4" />
                    </Button>
                    
                    {Array.from({ length: Math.min(5, totalPaginas) })
                      .map((_, i) => {
                        const numeroPagina = Math.max(1, Math.min(pagina - 2 + i, totalPaginas))
                        return (
                          <Button
                            key={numeroPagina}
                            variant={pagina === numeroPagina ? "default" : "outline"}
                            size="sm"
                            onClick={() => setPagina(numeroPagina)}
                            className="min-w-[40px]"
                          >
                            {numeroPagina}
                          </Button>
                        )
                      })}
                    
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setPagina(Math.min(totalPaginas, pagina + 1))}
                      disabled={pagina >= totalPaginas}
                    >
                      <LucideIcons.ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </TabsContent>
        
        <TabsContent value="orcamentos" className="space-y-6">
          {/* Grid de orçamentos */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {orcamentos.map((orcamento) => {
              const percentual = calcularPercentualOrcamento(orcamento.realizado, orcamento.orcado)
              const statusCor = orcamento.status === 'excedido' ? 'text-red-600' :
                              orcamento.status === 'proximo_limite' ? 'text-yellow-600' :
                              'text-green-600'
              const corBarra = orcamento.status === 'excedido' ? 'bg-red-500' :
                              orcamento.status === 'proximo_limite' ? 'bg-yellow-500' :
                              'bg-green-500'
              
              return (
                <Card key={orcamento.id} className="relative">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{orcamento.categoria}</CardTitle>
                      <Badge variant={
                        orcamento.status === 'excedido' ? 'destructive' :
                        orcamento.status === 'proximo_limite' ? 'secondary' :
                        'default'
                      }>
                        {orcamento.status === 'excedido' ? 'Excedido' :
                         orcamento.status === 'proximo_limite' ? 'Próximo ao Limite' :
                         'Dentro do Limite'}
                      </Badge>
                    </div>
                    <CardDescription>{orcamento.periodo}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between text-sm">
                        <span>Realizado:</span>
                        <span className="font-medium">{formatarMoeda(orcamento.realizado)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Orçado:</span>
                        <span className="font-medium">{formatarMoeda(orcamento.orcado)}</span>
                      </div>
                      
                      {/* Barra de progresso */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progresso</span>
                          <span className={`font-medium ${statusCor}`}>
                            {percentual.toFixed(1)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${corBarra}`}
                            style={{ width: `${Math.min(100, percentual)}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div className="pt-2 border-t">
                        <div className="flex items-center justify-between text-sm text-gray-600">
                          <span>Responsável:</span>
                          <span>{orcamento.responsavel}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm text-gray-600 mt-1">
                          <span>Disponível:</span>
                          <span className={orcamento.orcado - orcamento.realizado >= 0 ? 'text-green-600' : 'text-red-600'}>
                            {formatarMoeda(orcamento.orcado - orcamento.realizado)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Modal Nova Despesa */}
      <Dialog open={modalNovaDespesa} onOpenChange={setModalNovaDespesa}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Nova Despesa</DialogTitle>
            <DialogDescription>
              Adicione uma nova despesa para aprovação
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div>
              <Label htmlFor="fornecedor">Fornecedor</Label>
              <Input id="fornecedor" placeholder="Nome do fornecedor" />
            </div>
            <div>
              <Label htmlFor="valor">Valor</Label>
              <Input id="valor" type="number" placeholder="0,00" />
            </div>
            <div>
              <Label htmlFor="data">Data</Label>
              <Input id="data" type="date" />
            </div>
            <div>
              <Label htmlFor="vencimento">Vencimento</Label>
              <Input id="vencimento" type="date" />
            </div>
            <div>
              <Label htmlFor="categoria">Categoria</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tecnologia">Tecnologia</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="utilities">Utilities</SelectItem>
                  <SelectItem value="administrativo">Administrativo</SelectItem>
                  <SelectItem value="viagens">Viagens</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="centro_custo">Centro de Custo</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ti">TI</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="facilities">Facilities</SelectItem>
                  <SelectItem value="administrativo">Administrativo</SelectItem>
                  <SelectItem value="comercial">Comercial</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea id="descricao" placeholder="Descrição detalhada da despesa" />
            </div>
            <div className="col-span-2">
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea id="observacoes" placeholder="Observações adicionais" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalNovaDespesa(false)}>
              Cancelar
            </Button>
            <Button onClick={() => {
              toast.success('Despesa criada e enviada para aprovação')
              setModalNovaDespesa(false)
            }}>
              Salvar Despesa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Modal Aprovação */}
      <Dialog open={modalAprovacao} onOpenChange={setModalAprovacao}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Aprovar/Rejeitar Despesa</DialogTitle>
            <DialogDescription>
              Analise os detalhes da despesa antes de tomar uma decisão
            </DialogDescription>
          </DialogHeader>
          {despesaAprovacao && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Fornecedor:</span>
                  <p>{despesaAprovacao.fornecedor}</p>
                </div>
                <div>
                  <span className="font-medium">Valor:</span>
                  <p className="text-lg font-bold">{formatarMoeda(despesaAprovacao.valor)}</p>
                </div>
                <div>
                  <span className="font-medium">Categoria:</span>
                  <p>{despesaAprovacao.categoria}</p>
                </div>
                <div>
                  <span className="font-medium">Centro de Custo:</span>
                  <p>{despesaAprovacao.centro_custo}</p>
                </div>
                <div className="col-span-2">
                  <span className="font-medium">Descrição:</span>
                  <p>{despesaAprovacao.descricao}</p>
                </div>
                {despesaAprovacao.observacoes && (
                  <div className="col-span-2">
                    <span className="font-medium">Observações:</span>
                    <p>{despesaAprovacao.observacoes}</p>
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => handleAprovar(despesaAprovacao!, false)}
              className="text-red-600 border-red-600 hover:bg-red-50"
            >
              <LucideIcons.X className="mr-2 h-4 w-4" />
              Rejeitar
            </Button>
            <Button 
              onClick={() => handleAprovar(despesaAprovacao!, true)}
              className="bg-green-600 hover:bg-green-700"
            >
              <LucideIcons.Check className="mr-2 h-4 w-4" />
              Aprovar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}