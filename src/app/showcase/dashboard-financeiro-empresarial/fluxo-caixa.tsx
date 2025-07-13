'use client'

import React, { useState, useCallback, useEffect, useMemo } from 'react'
import { toast } from 'sonner'
import * as LucideIcons from 'lucide-react'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface FluxoCaixaProps {
  usuario: any
  dados: any
  carregando: boolean
  erro: string | null
  onRecarregar: () => void
}

interface MovimentoCaixa {
  id: string
  data: string
  tipo: 'entrada' | 'saida'
  categoria: string
  descricao: string
  valor: number
  status: 'realizado' | 'projetado'
  conta: string
  responsavel?: string
}

interface ProjecaoCaixa {
  periodo: string
  saldo_inicial: number
  entradas_previstas: number
  saidas_previstas: number
  saldo_final: number
  status: 'positivo' | 'negativo' | 'critico'
}

interface CenarioFluxo {
  id: string
  nome: string
  tipo: 'otimista' | 'realista' | 'pessimista'
  descricao: string
  impacto_entradas: number // percentual
  impacto_saidas: number   // percentual
  saldo_final_projetado: number
}

// Função utilitária para formatação monetária
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
      month: 'short',
      year: 'numeric'
    })
  } catch (error) {
    return 'Erro de formato'
  }
}

const calcularVariacao = (atual: number, anterior: number): number => {
  if (anterior === 0) return 0
  return ((atual - anterior) / anterior) * 100
}

export default function FluxoCaixa({ 
  usuario, 
  dados, 
  carregando, 
  erro, 
  onRecarregar 
}: FluxoCaixaProps) {
  // Estados principais
  const [abaSelecionada, setAbaSelecionada] = useState('historico')
  const [periodoSelecionado, setPeriodoSelecionado] = useState('proximo_mes')
  const [cenarioSelecionado, setCenarioSelecionado] = useState('realista')
  const [tipoVisualizacao, setTipoVisualizacao] = useState<'diario' | 'semanal' | 'mensal'>('semanal')
  
  // Handler para tipo de visualização
  const handleTipoVisualizacaoChange = (value: string) => {
    setTipoVisualizacao(value as 'diario' | 'semanal' | 'mensal')
  }
  
  // Estados de dados
  const [movimentos, setMovimentos] = useState<MovimentoCaixa[]>([])
  const [projecoes, setProjecoes] = useState<ProjecaoCaixa[]>([])
  const [cenarios, setCenarios] = useState<CenarioFluxo[]>([])
  const [carregandoInterno, setCarregandoInterno] = useState(false)
  const [erroInterno, setErroInterno] = useState<string | null>(null)
  
  // Prevenção memory leaks
  const montadoRef = React.useRef(true)
  useEffect(() => {
    montadoRef.current = true
    return () => { montadoRef.current = false }
  }, [])
  
  // Dados mockados - Movimentos
  const movimentosMock: MovimentoCaixa[] = useMemo(() => [
    {
      id: 'mov-001',
      data: '2024-01-15',
      tipo: 'entrada',
      categoria: 'Receita de Vendas',
      descricao: 'Pagamento TechCorp Solutions',
      valor: 45000,
      status: 'realizado',
      conta: 'Conta Corrente Principal',
      responsavel: 'Sistema Automático'
    },
    {
      id: 'mov-002',
      data: '2024-01-14',
      tipo: 'saida',
      categoria: 'Despesas Operacionais',
      descricao: 'Conta de energia elétrica',
      valor: 8900,
      status: 'realizado',
      conta: 'Conta Corrente Principal'
    },
    {
      id: 'mov-003',
      data: '2024-01-20',
      tipo: 'entrada',
      categoria: 'Receita de Vendas',
      descricao: 'Pagamento StartupXYZ (projetado)',
      valor: 28500,
      status: 'projetado',
      conta: 'Conta Corrente Principal'
    },
    {
      id: 'mov-004',
      data: '2024-01-18',
      tipo: 'saida',
      categoria: 'Folha de Pagamento',
      descricao: 'Salários e encargos Janeiro',
      valor: 85000,
      status: 'projetado',
      conta: 'Conta Corrente Principal'
    },
    {
      id: 'mov-005',
      data: '2024-01-22',
      tipo: 'entrada',
      categoria: 'Receita de Vendas',
      descricao: 'Renovação Enterprise Corp',
      valor: 120000,
      status: 'projetado',
      conta: 'Conta Corrente Principal'
    }
  ], [])
  
  // Dados mockados - Projeções
  const projecoesMock: ProjecaoCaixa[] = useMemo(() => [
    {
      periodo: 'Semana 3 Janeiro',
      saldo_inicial: 340000,
      entradas_previstas: 148500,
      saidas_previstas: 93900,
      saldo_final: 394600,
      status: 'positivo'
    },
    {
      periodo: 'Semana 4 Janeiro',
      saldo_inicial: 394600,
      entradas_previstas: 75000,
      saidas_previstas: 120000,
      saldo_final: 349600,
      status: 'positivo'
    },
    {
      periodo: 'Semana 1 Fevereiro',
      saldo_inicial: 349600,
      entradas_previstas: 45000,
      saidas_previstas: 95000,
      saldo_final: 299600,
      status: 'positivo'
    },
    {
      periodo: 'Semana 2 Fevereiro',
      saldo_inicial: 299600,
      entradas_previstas: 25000,
      saidas_previstas: 180000,
      saldo_final: 144600,
      status: 'negativo'
    },
    {
      periodo: 'Semana 3 Fevereiro',
      saldo_inicial: 144600,
      entradas_previstas: 85000,
      saidas_previstas: 75000,
      saldo_final: 154600,
      status: 'critico'
    }
  ], [])
  
  // Dados mockados - Cenários
  const cenariosMock: CenarioFluxo[] = useMemo(() => [
    {
      id: 'cen-001',
      nome: 'Cenário Otimista',
      tipo: 'otimista',
      descricao: 'Recebimentos em dia + vendas 20% acima',
      impacto_entradas: 20,
      impacto_saidas: -5,
      saldo_final_projetado: 450000
    },
    {
      id: 'cen-002',
      nome: 'Cenário Realista',
      tipo: 'realista',
      descricao: 'Projeção baseada em histórico',
      impacto_entradas: 0,
      impacto_saidas: 0,
      saldo_final_projetado: 340000
    },
    {
      id: 'cen-003',
      nome: 'Cenário Pessimista',
      tipo: 'pessimista',
      descricao: 'Atraso em recebimentos + despesas extras',
      impacto_entradas: -15,
      impacto_saidas: 10,
      saldo_final_projetado: 180000
    }
  ], [])
  
  // Carregar dados
  const carregarFluxoCaixa = useCallback(async () => {
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
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      if (montadoRef.current) {
        setMovimentos(movimentosMock)
        setProjecoes(projecoesMock)
        setCenarios(cenariosMock)
      }
    } catch (error) {
      console.error('Erro ao carregar fluxo de caixa:', error)
      if (montadoRef.current) {
        setErroInterno('Falha ao carregar dados do fluxo de caixa.')
      }
    } finally {
      clearTimeout(timeoutId)
      if (montadoRef.current) {
        setCarregandoInterno(false)
      }
    }
  }, [movimentosMock, projecoesMock, cenariosMock])
  
  // Carregar dados na inicialização
  useEffect(() => {
    carregarFluxoCaixa()
  }, [carregarFluxoCaixa])
  
  // Calcular métricas do fluxo
  const metricas = useMemo(() => {
    const totalEntradas = movimentos
      .filter(m => m.tipo === 'entrada')
      .reduce((acc, m) => acc + m.valor, 0)
    
    const totalSaidas = movimentos
      .filter(m => m.tipo === 'saida')
      .reduce((acc, m) => acc + m.valor, 0)
    
    const saldoAtual = 340000 // Saldo inicial mockado
    const fluxoLiquido = totalEntradas - totalSaidas
    const projetado30dias = projecoes[projecoes.length - 1]?.saldo_final || 0
    
    return {
      saldoAtual,
      totalEntradas,
      totalSaidas,
      fluxoLiquido,
      projetado30dias,
      variacao: calcularVariacao(projetado30dias, saldoAtual)
    }
  }, [movimentos, projecoes])
  
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
        <h3 className="text-lg font-medium mb-2">Erro ao carregar fluxo de caixa</h3>
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
      {/* Header com controles */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Fluxo de Caixa</h2>
          <p className="text-gray-600">Análise e projeções financeiras</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Select value={periodoSelecionado} onValueChange={setPeriodoSelecionado}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="proximo_mes">Próximo Mês</SelectItem>
              <SelectItem value="proximos_3_meses">Próximos 3 Meses</SelectItem>
              <SelectItem value="proximo_trimestre">Próximo Trimestre</SelectItem>
              <SelectItem value="proximo_semestre">Próximo Semestre</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline">
            <LucideIcons.Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
        </div>
      </div>
      
      {/* Métricas principais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <LucideIcons.Wallet className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Saldo Atual</p>
                <p className="text-2xl font-bold text-gray-900">{formatarMoeda(metricas.saldoAtual)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <LucideIcons.TrendingUp className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Entradas</p>
                <p className="text-2xl font-bold text-gray-900">{formatarMoeda(metricas.totalEntradas)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <LucideIcons.TrendingDown className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Saídas</p>
                <p className="text-2xl font-bold text-gray-900">{formatarMoeda(metricas.totalSaidas)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <LucideIcons.BarChart3 className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Fluxo Líquido</p>
                <p className={`text-2xl font-bold ${metricas.fluxoLiquido >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatarMoeda(metricas.fluxoLiquido)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Sistema de abas */}
      <Tabs value={abaSelecionada} onValueChange={setAbaSelecionada}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="historico" className="flex items-center gap-2">
            <LucideIcons.History className="h-4 w-4" />
            Histórico
          </TabsTrigger>
          <TabsTrigger value="projecoes" className="flex items-center gap-2">
            <LucideIcons.TrendingUp className="h-4 w-4" />
            Projeções
          </TabsTrigger>
          <TabsTrigger value="cenarios" className="flex items-center gap-2">
            <LucideIcons.GitBranch className="h-4 w-4" />
            Cenários
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="historico" className="space-y-6">
          {/* Movimentações recentes */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Movimentações Recentes</CardTitle>
                <div className="flex items-center space-x-2">
                  <Select value={tipoVisualizacao} onValueChange={handleTipoVisualizacaoChange}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="diario">Diário</SelectItem>
                      <SelectItem value="semanal">Semanal</SelectItem>
                      <SelectItem value="mensal">Mensal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {movimentos.map((movimento) => (
                  <div 
                    key={movimento.id} 
                    className={`flex items-center justify-between p-4 rounded-lg border ${
                      movimento.status === 'projetado' ? 'border-dashed border-blue-300 bg-blue-50' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`p-2 rounded-full ${
                        movimento.tipo === 'entrada' ? 'bg-green-100' : 'bg-red-100'
                      }`}>
                        {movimento.tipo === 'entrada' ? (
                          <LucideIcons.ArrowDownLeft className="h-5 w-5 text-green-600" />
                        ) : (
                          <LucideIcons.ArrowUpRight className="h-5 w-5 text-red-600" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium text-gray-900">{movimento.descricao}</h4>
                          {movimento.status === 'projetado' && (
                            <Badge variant="outline" className="text-blue-600 border-blue-600">
                              Projetado
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>{movimento.categoria}</span>
                          <span>•</span>
                          <span>{formatarDataContextual(movimento.data)}</span>
                          <span>•</span>
                          <span>{movimento.conta}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-semibold ${
                        movimento.tipo === 'entrada' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {movimento.tipo === 'entrada' ? '+' : '-'}{formatarMoeda(movimento.valor)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="projecoes" className="space-y-6">
          {/* Alerta de fluxo crítico */}
          {projecoes.some(p => p.status === 'critico' || p.status === 'negativo') && (
            <Card className="border-yellow-200 bg-yellow-50">
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <LucideIcons.AlertTriangle className="h-6 w-6 text-yellow-600 mr-3" />
                  <div>
                    <h4 className="font-medium text-yellow-800">Atenção: Fluxo de Caixa Crítico</h4>
                    <p className="text-sm text-yellow-700">
                      Projeções indicam possível fluxo negativo nos próximos períodos. 
                      Revise as estratégias de cobrança e despesas.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Timeline de projeções */}
          <Card>
            <CardHeader>
              <CardTitle>Projeção de Fluxo - Próximas Semanas</CardTitle>
              <CardDescription>
                Baseado no histórico e compromissos conhecidos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {projecoes.map((projecao, index) => (
                  <div key={index} className="relative">
                    {/* Linha conectora */}
                    {index < projecoes.length - 1 && (
                      <div className="absolute left-6 top-12 w-0.5 h-16 bg-gray-200"></div>
                    )}
                    
                    <div className="flex items-start space-x-4">
                      <div className={`p-2 rounded-full ${
                        projecao.status === 'positivo' ? 'bg-green-100' :
                        projecao.status === 'critico' ? 'bg-yellow-100' :
                        'bg-red-100'
                      }`}>
                        <div className={`h-3 w-3 rounded-full ${
                          projecao.status === 'positivo' ? 'bg-green-600' :
                          projecao.status === 'critico' ? 'bg-yellow-600' :
                          'bg-red-600'
                        }`}></div>
                      </div>
                      
                      <div className="flex-1 bg-white border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-gray-900">{projecao.periodo}</h4>
                          <Badge variant={
                            projecao.status === 'positivo' ? 'default' :
                            projecao.status === 'critico' ? 'secondary' :
                            'destructive'
                          }>
                            {projecao.status === 'positivo' ? 'Positivo' :
                             projecao.status === 'critico' ? 'Crítico' :
                             'Negativo'}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Saldo Inicial:</span>
                            <p className="font-medium">{formatarMoeda(projecao.saldo_inicial)}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Entradas:</span>
                            <p className="font-medium text-green-600">+{formatarMoeda(projecao.entradas_previstas)}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Saídas:</span>
                            <p className="font-medium text-red-600">-{formatarMoeda(projecao.saidas_previstas)}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Saldo Final:</span>
                            <p className={`font-bold ${
                              projecao.saldo_final >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {formatarMoeda(projecao.saldo_final)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="cenarios" className="space-y-6">
          {/* Seletor de cenário */}
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Análise de Cenários</h3>
            <Select value={cenarioSelecionado} onValueChange={setCenarioSelecionado}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Selecione o cenário" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="otimista">Cenário Otimista</SelectItem>
                <SelectItem value="realista">Cenário Realista</SelectItem>
                <SelectItem value="pessimista">Cenário Pessimista</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Cards de cenários */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {cenarios.map((cenario) => (
              <Card 
                key={cenario.id} 
                className={`cursor-pointer transition-all ${
                  cenario.tipo === cenarioSelecionado 
                    ? 'ring-2 ring-blue-500 bg-blue-50' 
                    : 'hover:shadow-md'
                }`}
                onClick={() => setCenarioSelecionado(cenario.tipo)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{cenario.nome}</CardTitle>
                    <div className={`p-2 rounded-full ${
                      cenario.tipo === 'otimista' ? 'bg-green-100' :
                      cenario.tipo === 'realista' ? 'bg-blue-100' :
                      'bg-red-100'
                    }`}>
                      {cenario.tipo === 'otimista' && <LucideIcons.TrendingUp className="h-5 w-5 text-green-600" />}
                      {cenario.tipo === 'realista' && <LucideIcons.Target className="h-5 w-5 text-blue-600" />}
                      {cenario.tipo === 'pessimista' && <LucideIcons.TrendingDown className="h-5 w-5 text-red-600" />}
                    </div>
                  </div>
                  <CardDescription>{cenario.descricao}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Impacto Entradas:</span>
                      <span className={cenario.impacto_entradas >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {cenario.impacto_entradas >= 0 ? '+' : ''}{cenario.impacto_entradas}%
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Impacto Saídas:</span>
                      <span className={cenario.impacto_saidas <= 0 ? 'text-green-600' : 'text-red-600'}>
                        {cenario.impacto_saidas >= 0 ? '+' : ''}{cenario.impacto_saidas}%
                      </span>
                    </div>
                    <div className="pt-2 border-t">
                      <div className="flex justify-between">
                        <span className="font-medium">Saldo Projetado:</span>
                        <span className={`font-bold ${
                          cenario.saldo_final_projetado >= 200000 ? 'text-green-600' :
                          cenario.saldo_final_projetado >= 100000 ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                          {formatarMoeda(cenario.saldo_final_projetado)}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {/* Ações recomendadas baseadas no cenário */}
          <Card>
            <CardHeader>
              <CardTitle>Ações Recomendadas - {cenarios.find(c => c.tipo === cenarioSelecionado)?.nome}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {cenarioSelecionado === 'pessimista' && (
                  <>
                    <div className="flex items-center space-x-3 p-3 bg-red-50 rounded-lg border border-red-200">
                      <LucideIcons.AlertTriangle className="h-5 w-5 text-red-600" />
                      <div>
                        <p className="font-medium text-red-800">Acelerar Cobrança</p>
                        <p className="text-sm text-red-600">Contactar clientes com faturas em aberto</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                      <LucideIcons.Scissors className="h-5 w-5 text-yellow-600" />
                      <div>
                        <p className="font-medium text-yellow-800">Revisar Despesas</p>
                        <p className="text-sm text-yellow-600">Adiar gastos não essenciais</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <LucideIcons.CreditCard className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium text-blue-800">Avaliar Linha de Crédito</p>
                        <p className="text-sm text-blue-600">Negociar reserva de emergência</p>
                      </div>
                    </div>
                  </>
                )}
                
                {cenarioSelecionado === 'realista' && (
                  <>
                    <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <LucideIcons.Eye className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium text-blue-800">Monitorar Projeções</p>
                        <p className="text-sm text-blue-600">Acompanhar realizações vs projetado</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg border border-green-200">
                      <LucideIcons.Target className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="font-medium text-green-800">Manter Estratégia</p>
                        <p className="text-sm text-green-600">Continuar operações normais</p>
                      </div>
                    </div>
                  </>
                )}
                
                {cenarioSelecionado === 'otimista' && (
                  <>
                    <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg border border-green-200">
                      <LucideIcons.TrendingUp className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="font-medium text-green-800">Investir em Crescimento</p>
                        <p className="text-sm text-green-600">Aproveitar folga para expansão</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <LucideIcons.PiggyBank className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium text-blue-800">Construir Reservas</p>
                        <p className="text-sm text-blue-600">Aumentar fundo de emergência</p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}