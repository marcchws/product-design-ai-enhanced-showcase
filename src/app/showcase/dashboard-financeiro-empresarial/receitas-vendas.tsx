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

interface ReceitasVendasProps {
  usuario: any
  dados: any
  carregando: boolean
  erro: string | null
  onRecarregar: () => void
}

interface TransacaoReceita {
  id: string
  data: string
  cliente: string
  descricao: string
  categoria: string
  valor: number
  status: 'confirmada' | 'pendente' | 'em_analise' | 'cancelada'
  metodo_pagamento: string
  numero_fatura?: string
  vencimento?: string
  observacoes?: string
}

interface FiltrosReceita {
  termo: string
  status: string
  categoria: string
  metodo_pagamento: string
  data_inicio: string
  data_fim: string
  valor_min: string
  valor_max: string
}

// Função para formatação monetária
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

// Função para formatação de data
const formatarDataContextual = (dataString: string | undefined, formato: 'curta' | 'media' | 'relativa' = 'media'): string => {
  if (!dataString) return 'N/A'
  
  try {
    const data = new Date(dataString)
    if (isNaN(data.getTime())) return 'Data inválida'
    
    const agora = new Date()
    const diferenca = agora.getTime() - data.getTime()
    const dias = Math.floor(diferenca / (1000 * 60 * 60 * 24))
    
    switch (formato) {
      case 'relativa':
        if (dias === 0) return 'Hoje'
        if (dias === 1) return 'Ontem'
        if (dias < 7) return `${dias} dias atrás`
        return data.toLocaleDateString('pt-BR')
      
      case 'curta':
        return data.toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: '2-digit'
        })
      
      default:
        return data.toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        })
    }
  } catch (error) {
    return 'Erro de formato'
  }
}

// Função para status visual
const formatarStatusReceita = (status: string | undefined) => {
  switch (status) {
    case 'confirmada':
      return { texto: 'Confirmada', cor: 'text-green-600', icone: 'CheckCircle', badge: 'default' as const }
    case 'pendente':
      return { texto: 'Pendente', cor: 'text-yellow-600', icone: 'Clock', badge: 'secondary' as const }
    case 'em_analise':
      return { texto: 'Em Análise', cor: 'text-blue-600', icone: 'Eye', badge: 'outline' as const }
    case 'cancelada':
      return { texto: 'Cancelada', cor: 'text-red-600', icone: 'XCircle', badge: 'destructive' as const }
    default:
      return { texto: 'Indefinido', cor: 'text-gray-500', icone: 'HelpCircle', badge: 'outline' as const }
  }
}

export default function ReceitasVendas({ 
  usuario, 
  dados, 
  carregando, 
  erro, 
  onRecarregar 
}: ReceitasVendasProps) {
  // Estados principais
  const [transacoes, setTransacoes] = useState<TransacaoReceita[]>([])
  const [totalTransacoes, setTotalTransacoes] = useState(0)
  const [pagina, setPagina] = useState(1)
  const [itensPorPagina, setItensPorPagina] = useState(25)
  const [visualizacao, setVisualizacao] = useState<'lista' | 'cards' | 'tabela'>('tabela')
  const [ordenacao, setOrdenacao] = useState({ campo: 'data', direcao: 'desc' })
  
  // Estados de filtros
  const [filtros, setFiltros] = useState<FiltrosReceita>({
    termo: '',
    status: 'todas',
    categoria: 'todas',
    metodo_pagamento: 'todos',
    data_inicio: '',
    data_fim: '',
    valor_min: '',
    valor_max: ''
  })
  
  // Estados de operações
  const [carregandoInterno, setCarregandoInterno] = useState(false)
  const [erroInterno, setErroInterno] = useState<string | null>(null)
  const [selecionados, setSelecionados] = useState<string[]>([])
  const [modalNovaReceita, setModalNovaReceita] = useState(false)
  const [modalExportar, setModalExportar] = useState(false)
  
  // Prevenção memory leaks
  const montadoRef = React.useRef(true)
  useEffect(() => {
    montadoRef.current = true
    return () => { montadoRef.current = false }
  }, [])
  
  // Dados mockados
  const transacoesMock: TransacaoReceita[] = useMemo(() => [
    {
      id: 'rcv-001',
      data: '2024-01-15',
      cliente: 'TechCorp Solutions',
      descricao: 'Serviços de Consultoria - Janeiro 2024',
      categoria: 'Consultoria',
      valor: 45000,
      status: 'confirmada',
      metodo_pagamento: 'Transferência',
      numero_fatura: 'FAT-2024-001',
      observacoes: 'Pagamento recebido conforme contrato'
    },
    {
      id: 'rcv-002', 
      data: '2024-01-12',
      cliente: 'StartupXYZ Ltda',
      descricao: 'Desenvolvimento de Software - Milestone 2',
      categoria: 'Desenvolvimento',
      valor: 28500,
      status: 'pendente',
      metodo_pagamento: 'Boleto',
      numero_fatura: 'FAT-2024-002',
      vencimento: '2024-01-20',
      observacoes: 'Aguardando pagamento'
    },
    {
      id: 'rcv-003',
      data: '2024-01-10', 
      cliente: 'Enterprise Corp',
      descricao: 'Licença Software Anual',
      categoria: 'Licenciamento',
      valor: 120000,
      status: 'confirmada',
      metodo_pagamento: 'PIX',
      numero_fatura: 'FAT-2024-003'
    },
    {
      id: 'rcv-004',
      data: '2024-01-08',
      cliente: 'Innovation Hub',
      descricao: 'Treinamento Técnico - Equipe',
      categoria: 'Treinamento',
      valor: 15000,
      status: 'em_analise',
      metodo_pagamento: 'Cartão',
      numero_fatura: 'FAT-2024-004',
      observacoes: 'Verificando dados do pagamento'
    },
    {
      id: 'rcv-005',
      data: '2024-01-05',
      cliente: 'Digital Agency',
      descricao: 'Projeto Website Institucional',
      categoria: 'Desenvolvimento',
      valor: 32000,
      status: 'cancelada',
      metodo_pagamento: 'Transferência',
      numero_fatura: 'FAT-2024-005',
      observacoes: 'Cancelado a pedido do cliente'
    }
  ], [])
  
  // Carregar dados com filtros
  const carregarReceitas = useCallback(async () => {
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
      // Simular aplicação de filtros
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      let transacoesFiltradas = [...transacoesMock]
      
      // Aplicar filtros
      if (filtros.termo) {
        transacoesFiltradas = transacoesFiltradas.filter(t => 
          t.cliente.toLowerCase().includes(filtros.termo.toLowerCase()) ||
          t.descricao.toLowerCase().includes(filtros.termo.toLowerCase()) ||
          t.numero_fatura?.toLowerCase().includes(filtros.termo.toLowerCase())
        )
      }
      
      if (filtros.status !== 'todas') {
        transacoesFiltradas = transacoesFiltradas.filter(t => t.status === filtros.status)
      }
      
      if (filtros.categoria !== 'todas') {
        transacoesFiltradas = transacoesFiltradas.filter(t => t.categoria === filtros.categoria)
      }
      
      if (filtros.metodo_pagamento !== 'todos') {
        transacoesFiltradas = transacoesFiltradas.filter(t => t.metodo_pagamento === filtros.metodo_pagamento)
      }
      
      // Ordenação
      transacoesFiltradas.sort((a, b) => {
        const fator = ordenacao.direcao === 'asc' ? 1 : -1
        
        switch (ordenacao.campo) {
          case 'data':
            return fator * (new Date(a.data).getTime() - new Date(b.data).getTime())
          case 'valor':
            return fator * (a.valor - b.valor)
          case 'cliente':
            return fator * a.cliente.localeCompare(b.cliente)
          default:
            return 0
        }
      })
      
      if (montadoRef.current) {
        setTransacoes(transacoesFiltradas)
        setTotalTransacoes(transacoesFiltradas.length)
        setSelecionados([]) // Limpar seleção
      }
    } catch (error) {
      console.error('Erro ao carregar receitas:', error)
      if (montadoRef.current) {
        setErroInterno('Falha ao carregar dados de receitas.')
      }
    } finally {
      clearTimeout(timeoutId)
      if (montadoRef.current) {
        setCarregandoInterno(false)
      }
    }
  }, [filtros, ordenacao, transacoesMock])
  
  // Carregar dados quando filtros mudam
  useEffect(() => {
    carregarReceitas()
  }, [carregarReceitas])
  
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
      metodo_pagamento: 'todos',
      data_inicio: '',
      data_fim: '',
      valor_min: '',
      valor_max: ''
    })
    setPagina(1)
  }, [])
  
  // Handlers para seleção
  const handleSelecionarTodos = useCallback(() => {
    const transacoesPagina = transacoes.slice((pagina - 1) * itensPorPagina, pagina * itensPorPagina)
    const todosSelecionados = transacoesPagina.every(t => selecionados.includes(t.id))
    
    if (todosSelecionados) {
      setSelecionados(prev => prev.filter(id => !transacoesPagina.some(t => t.id === id)))
    } else {
      setSelecionados(prev => Array.from(new Set([...prev, ...transacoesPagina.map(t => t.id)])))
    }
  }, [transacoes, pagina, itensPorPagina, selecionados])
  
  const handleSelecionarItem = useCallback((id: string) => {
    setSelecionados(prev => 
      prev.includes(id) 
        ? prev.filter(itemId => itemId !== id)
        : [...prev, id]
    )
  }, [])
  
  // Verificar se há filtros aplicados
  const filtrosAplicados = useMemo(() => {
    return filtros.termo !== '' || 
           filtros.status !== 'todas' || 
           filtros.categoria !== 'todas' ||
           filtros.metodo_pagamento !== 'todos' ||
           filtros.data_inicio !== '' ||
           filtros.data_fim !== '' ||
           filtros.valor_min !== '' ||
           filtros.valor_max !== ''
  }, [filtros])
  
  // Calcular métricas da página atual
  const metricas = useMemo(() => {
    const total = transacoes.reduce((acc, t) => acc + t.valor, 0)
    const confirmadas = transacoes.filter(t => t.status === 'confirmada').reduce((acc, t) => acc + t.valor, 0)
    const pendentes = transacoes.filter(t => t.status === 'pendente').reduce((acc, t) => acc + t.valor, 0)
    
    return { total, confirmadas, pendentes }
  }, [transacoes])
  
  // Paginação
  const totalPaginas = Math.ceil(totalTransacoes / itensPorPagina)
  const transacoesPaginadas = transacoes.slice((pagina - 1) * itensPorPagina, pagina * itensPorPagina)
  
  // Estados de loading e erro
  const isCarregando = carregando || carregandoInterno
  const erroFinal = erro || erroInterno
  
  if (isCarregando) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="pt-6">
                <div className="h-8 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <Card className="animate-pulse">
          <CardContent className="pt-6">
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-12 bg-gray-200 rounded"></div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }
  
  if (erroFinal) {
    return (
      <div className="bg-red-50 border border-red-200 p-8 rounded-lg text-center">
        <LucideIcons.AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">Erro ao carregar receitas</h3>
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
          <h2 className="text-2xl font-bold text-gray-900">Receitas e Vendas</h2>
          <p className="text-gray-600">
            {totalTransacoes > 0 ? `${totalTransacoes} transações encontradas` : 'Nenhuma transação encontrada'}
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          {selecionados.length > 0 && (
            <div className="flex items-center space-x-2">
              <Badge variant="secondary">
                {selecionados.length} selecionadas
              </Badge>
              <Button variant="outline" size="sm">
                <LucideIcons.FileDown className="h-4 w-4 mr-1" />
                Exportar
              </Button>
            </div>
          )}
          
          <Button onClick={() => setModalNovaReceita(true)}>
            <LucideIcons.Plus className="mr-2 h-4 w-4" />
            Nova Receita
          </Button>
        </div>
      </div>
      
      {/* Métricas resumidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <LucideIcons.DollarSign className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Receitas</p>
                <p className="text-2xl font-bold text-gray-900">{formatarMoeda(metricas.total)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <LucideIcons.CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Confirmadas</p>
                <p className="text-2xl font-bold text-gray-900">{formatarMoeda(metricas.confirmadas)}</p>
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
                <p className="text-2xl font-bold text-gray-900">{formatarMoeda(metricas.pendentes)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Filtros avançados */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <LucideIcons.Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar cliente, descrição..."
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
                <SelectItem value="confirmada">Confirmada</SelectItem>
                <SelectItem value="pendente">Pendente</SelectItem>
                <SelectItem value="em_analise">Em Análise</SelectItem>
                <SelectItem value="cancelada">Cancelada</SelectItem>
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
                <SelectItem value="Consultoria">Consultoria</SelectItem>
                <SelectItem value="Desenvolvimento">Desenvolvimento</SelectItem>
                <SelectItem value="Licenciamento">Licenciamento</SelectItem>
                <SelectItem value="Treinamento">Treinamento</SelectItem>
              </SelectContent>
            </Select>
            
            <Select
              value={filtros.metodo_pagamento}
              onValueChange={valor => handleFiltroChange('metodo_pagamento', valor)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Método" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os Métodos</SelectItem>
                <SelectItem value="Transferência">Transferência</SelectItem>
                <SelectItem value="PIX">PIX</SelectItem>
                <SelectItem value="Boleto">Boleto</SelectItem>
                <SelectItem value="Cartão">Cartão</SelectItem>
              </SelectContent>
            </Select>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleLimparFiltros}
                disabled={!filtrosAplicados}
                className="flex-1"
              >
                <LucideIcons.RefreshCw className="mr-2 h-4 w-4" />
                Limpar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Lista de transações */}
      {transacoes.length === 0 && !isCarregando ? (
        <div className="text-center py-16">
          <LucideIcons.Receipt className="h-16 w-16 text-gray-300 mx-auto mb-6" />
          <h3 className="text-xl font-medium mb-2">
            {filtrosAplicados ? 'Nenhuma receita encontrada' : 'Nenhuma receita cadastrada'}
          </h3>
          <p className="text-gray-500 max-w-md mx-auto mb-8">
            {filtrosAplicados 
              ? 'Nenhuma receita corresponde aos filtros aplicados. Tente ajustar os critérios de busca.'
              : 'Você ainda não tem receitas cadastradas. Comece adicionando sua primeira receita.'
            }
          </p>
          
          {filtrosAplicados ? (
            <Button onClick={handleLimparFiltros} variant="outline">
              <LucideIcons.RefreshCw className="mr-2 h-4 w-4" />
              Limpar Filtros
            </Button>
          ) : (
            <Button onClick={() => setModalNovaReceita(true)}>
              <LucideIcons.Plus className="mr-2 h-4 w-4" />
              Adicionar Primeira Receita
            </Button>
          )}
        </div>
      ) : (
        <>
          {/* Controles de visualização */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Checkbox
                checked={transacoesPaginadas.length > 0 && transacoesPaginadas.every(t => selecionados.includes(t.id))}
                onCheckedChange={handleSelecionarTodos}
              />
              <span className="text-sm text-gray-600">
                Selecionar todos ({transacoesPaginadas.length} itens)
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
          
          {/* Tabela de transações */}
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left">
                        <Checkbox
                          checked={transacoesPaginadas.length > 0 && transacoesPaginadas.every(t => selecionados.includes(t.id))}
                          onCheckedChange={handleSelecionarTodos}
                        />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Data
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cliente
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
                    {transacoesPaginadas.map((transacao) => {
                      const statusInfo = formatarStatusReceita(transacao.status)
                      const IconeStatus = LucideIcons[statusInfo.icone as keyof typeof LucideIcons] as any
                      
                      return (
                        <tr key={transacao.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <Checkbox
                              checked={selecionados.includes(transacao.id)}
                              onCheckedChange={() => handleSelecionarItem(transacao.id)}
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatarDataContextual(transacao.data)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{transacao.cliente}</div>
                              <div className="text-sm text-gray-500">{transacao.categoria}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">{transacao.descricao}</div>
                            {transacao.numero_fatura && (
                              <div className="text-sm text-gray-500">{transacao.numero_fatura}</div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{formatarMoeda(transacao.valor)}</div>
                            <div className="text-sm text-gray-500">{transacao.metodo_pagamento}</div>
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
                              <Button variant="ghost" size="sm">
                                <LucideIcons.Edit className="h-4 w-4" />
                              </Button>
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
                Mostrando {(pagina - 1) * itensPorPagina + 1} até {Math.min(pagina * itensPorPagina, totalTransacoes)} de {totalTransacoes} transações
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
      
      {/* Modal Nova Receita */}
      <Dialog open={modalNovaReceita} onOpenChange={setModalNovaReceita}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Nova Receita</DialogTitle>
            <DialogDescription>
              Adicione uma nova transação de receita ao sistema
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div>
              <Label htmlFor="cliente">Cliente</Label>
              <Input id="cliente" placeholder="Nome do cliente" />
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
              <Label htmlFor="categoria">Categoria</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="consultoria">Consultoria</SelectItem>
                  <SelectItem value="desenvolvimento">Desenvolvimento</SelectItem>
                  <SelectItem value="licenciamento">Licenciamento</SelectItem>
                  <SelectItem value="treinamento">Treinamento</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Input id="descricao" placeholder="Descrição da receita" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalNovaReceita(false)}>
              Cancelar
            </Button>
            <Button onClick={() => {
              toast.success('Receita adicionada com sucesso')
              setModalNovaReceita(false)
            }}>
              Salvar Receita
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}