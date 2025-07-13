'use client'

import React, { useState, useCallback, useEffect, useMemo } from 'react'
import { toast } from 'sonner'
import * as LucideIcons from 'lucide-react'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface DashboardOverviewProps {
  usuario: any
  empresa: any
  metricas: any
  dados: any
  carregando: boolean
  erro: string | null
  onRecarregar: () => void
}

interface KPI {
  id: string
  titulo: string
  valor: number
  meta?: number
  variacao: number
  formato: 'moeda' | 'percentual' | 'numero'
  tendencia: 'crescente' | 'decrescente' | 'estavel'
  criticidade: 'alta' | 'media' | 'baixa'
}

interface AlertaFinanceiro {
  id: string
  tipo: 'critico' | 'importante' | 'info'
  titulo: string
  descricao: string
  valor?: number
  data: string
  acao_sugerida: string
}

// Formatação monetária defensiva
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

const formatarPercentual = (valor: number | undefined): string => {
  if (valor === undefined || valor === null || isNaN(valor)) return '0%'
  return `${valor.toFixed(1)}%`
}

const formatarNumero = (valor: number | undefined): string => {
  if (valor === undefined || valor === null || isNaN(valor)) return '0'
  return new Intl.NumberFormat('pt-BR').format(valor)
}

export default function DashboardOverview({ 
  usuario, 
  empresa, 
  metricas, 
  dados, 
  carregando, 
  erro, 
  onRecarregar 
}: DashboardOverviewProps) {
  const [periodoSelecionado, setPeriodoSelecionado] = useState('mes_atual')
  const [tipoVisao, setTipoVisao] = useState<'kpis' | 'graficos' | 'alertas'>('kpis')
  
  // KPIs personalizados por perfil de usuário
  const kpisPorPerfil = useMemo(() => {
    if (!usuario || !metricas) return []
    
    const kpisBase: KPI[] = [
      {
        id: 'receita',
        titulo: 'Receita Total',
        valor: metricas.receita_total,
        meta: 2500000,
        variacao: metricas.variacao_mensal,
        formato: 'moeda',
        tendencia: metricas.variacao_mensal > 0 ? 'crescente' : 'decrescente',
        criticidade: metricas.variacao_mensal < -10 ? 'alta' : 'baixa'
      },
      {
        id: 'lucro',
        titulo: 'Lucro Líquido',
        valor: metricas.lucro_liquido,
        variacao: 12.3,
        formato: 'moeda',
        tendencia: 'crescente',
        criticidade: 'baixa'
      },
      {
        id: 'margem',
        titulo: 'Margem Líquida',
        valor: metricas.margem_liquida,
        meta: 25,
        variacao: 1.2,
        formato: 'percentual',
        tendencia: 'crescente',
        criticidade: metricas.margem_liquida < 15 ? 'alta' : 'baixa'
      },
      {
        id: 'fluxo',
        titulo: 'Fluxo de Caixa',
        valor: metricas.fluxo_caixa_atual,
        variacao: -5.2,
        formato: 'moeda',
        tendencia: 'decrescente',
        criticidade: metricas.fluxo_caixa_atual < 0 ? 'alta' : 'media'
      }
    ]
    
    // Personalizar KPIs baseado no perfil
    switch (usuario.perfil) {
      case 'CEO':
        return kpisBase.concat([
          {
            id: 'crescimento',
            titulo: 'Crescimento Anual',
            valor: 28.5,
            meta: 30,
            variacao: 2.1,
            formato: 'percentual',
            tendencia: 'crescente',
            criticidade: 'baixa'
          }
        ])
      
      case 'CFO':
        return kpisBase.concat([
          {
            id: 'receber',
            titulo: 'Contas a Receber',
            valor: metricas.contas_a_receber,
            variacao: -8.3,
            formato: 'moeda',
            tendencia: 'decrescente',
            criticidade: 'media'
          },
          {
            id: 'pagar',
            titulo: 'Contas a Pagar',
            valor: metricas.contas_a_pagar,
            variacao: 15.2,
            formato: 'moeda',
            tendencia: 'crescente',
            criticidade: 'alta'
          }
        ])
      
      default:
        return kpisBase
    }
  }, [usuario, metricas])
  
  // Alertas financeiros por criticidade
  const alertasFinanceiros = useMemo((): AlertaFinanceiro[] => [
    {
      id: 'alert-001',
      tipo: 'critico',
      titulo: 'Fluxo de Caixa Projetado Negativo',
      descricao: 'Projeção indica fluxo negativo nos próximos 15 dias',
      valor: -85000,
      data: new Date().toISOString(),
      acao_sugerida: 'Acelerar cobrança de clientes em atraso'
    },
    {
      id: 'alert-002', 
      tipo: 'importante',
      titulo: 'Meta de Receita em Risco',
      descricao: 'Receita atual está 12% abaixo da meta mensal',
      data: new Date().toISOString(),
      acao_sugerida: 'Revisar estratégia de vendas'
    },
    {
      id: 'alert-003',
      tipo: 'info',
      titulo: 'Reconciliação Bancária Pendente',
      descricao: '23 transações aguardando reconciliação manual',
      data: new Date().toISOString(),
      acao_sugerida: 'Acessar módulo de reconciliação'
    }
  ], [])
  
  // Componente de KPI individual
  const KPICard = useCallback(({ kpi }: { kpi: KPI }) => {
    const formatarValor = (valor: number, formato: string) => {
      switch (formato) {
        case 'moeda': return formatarMoeda(valor)
        case 'percentual': return formatarPercentual(valor)
        case 'numero': return formatarNumero(valor)
        default: return valor.toString()
      }
    }
    
    const IconeVariacao = kpi.tendencia === 'crescente' ? LucideIcons.TrendingUp : 
                         kpi.tendencia === 'decrescente' ? LucideIcons.TrendingDown : 
                         LucideIcons.Minus
    
    const corVariacao = kpi.variacao > 0 ? 'text-green-600' : kpi.variacao < 0 ? 'text-red-600' : 'text-gray-500'
    const corCriticidade = kpi.criticidade === 'alta' ? 'border-red-200 bg-red-50' : 
                           kpi.criticidade === 'media' ? 'border-yellow-200 bg-yellow-50' : 
                           'border-gray-200 bg-white'
    
    return (
      <Card className={`${corCriticidade} transition-all hover:shadow-md`}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">
            {kpi.titulo}
          </CardTitle>
          <div className={`flex items-center ${corVariacao}`}>
            <IconeVariacao className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {formatarValor(kpi.valor, kpi.formato)}
          </div>
          <div className="flex items-center justify-between">
            <p className={`text-xs ${corVariacao} flex items-center`}>
              {kpi.variacao > 0 ? '+' : ''}{kpi.variacao.toFixed(1)}% vs mês anterior
            </p>
            {kpi.meta && (
              <p className="text-xs text-gray-500">
                Meta: {formatarValor(kpi.meta, kpi.formato)}
              </p>
            )}
          </div>
          {kpi.criticidade === 'alta' && (
            <Badge variant="destructive" className="mt-2 text-xs">
              Atenção Necessária
            </Badge>
          )}
        </CardContent>
      </Card>
    )
  }, [])
  
  // Componente de alerta individual
  const AlertaCard = useCallback(({ alerta }: { alerta: AlertaFinanceiro }) => {
    const iconeAlerta = alerta.tipo === 'critico' ? LucideIcons.AlertTriangle :
                       alerta.tipo === 'importante' ? LucideIcons.Info :
                       LucideIcons.CheckCircle
    
    const corAlerta = alerta.tipo === 'critico' ? 'border-red-200 bg-red-50' :
                     alerta.tipo === 'importante' ? 'border-yellow-200 bg-yellow-50' :
                     'border-blue-200 bg-blue-50'
    
    const corTexto = alerta.tipo === 'critico' ? 'text-red-800' :
                    alerta.tipo === 'importante' ? 'text-yellow-800' :
                    'text-blue-800'
    
    const IconeComponente = iconeAlerta
    
    return (
      <Card className={`${corAlerta} transition-all hover:shadow-md`}>
        <CardContent className="pt-4">
          <div className="flex items-start space-x-3">
            <IconeComponente className={`h-5 w-5 ${corTexto} mt-0.5 flex-shrink-0`} />
            <div className="flex-1 min-w-0">
              <h4 className={`font-medium ${corTexto} mb-1`}>{alerta.titulo}</h4>
              <p className="text-sm text-gray-600 mb-2">{alerta.descricao}</p>
              {alerta.valor && (
                <p className="text-sm font-medium text-gray-900 mb-2">
                  Impacto: {formatarMoeda(alerta.valor)}
                </p>
              )}
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-500">
                  {new Date(alerta.data).toLocaleDateString('pt-BR')}
                </p>
                <Button size="sm" variant="outline" className="text-xs">
                  {alerta.acao_sugerida}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }, [])
  
  // Estados de carregamento e erro
  if (carregando) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }
  
  if (erro) {
    return (
      <div className="bg-red-50 border border-red-200 p-6 rounded-lg text-center">
        <LucideIcons.AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-3" />
        <h3 className="text-lg font-medium text-red-900 mb-2">Erro ao carregar dashboard</h3>
        <p className="text-red-700 mb-4">{erro}</p>
        <Button onClick={onRecarregar} variant="outline">
          <LucideIcons.RefreshCw className="mr-2 h-4 w-4" />
          Tentar Novamente
        </Button>
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      {/* Controles do dashboard */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dashboard Financeiro</h2>
          <p className="text-gray-600">Visão geral • {usuario?.perfil}</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Select value={periodoSelecionado} onValueChange={setPeriodoSelecionado}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Selecione o período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mes_atual">Mês Atual</SelectItem>
              <SelectItem value="ultimo_trimestre">Último Trimestre</SelectItem>
              <SelectItem value="ultimo_ano">Último Ano</SelectItem>
              <SelectItem value="ytd">Year to Date</SelectItem>
            </SelectContent>
          </Select>
          
          <div className="flex rounded-lg border">
            <Button
              variant={tipoVisao === 'kpis' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setTipoVisao('kpis')}
              className="rounded-r-none"
            >
              <LucideIcons.BarChart3 className="h-4 w-4 mr-1" />
              KPIs
            </Button>
            <Button
              variant={tipoVisao === 'alertas' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setTipoVisao('alertas')}
              className="rounded-l-none"
            >
              <LucideIcons.AlertCircle className="h-4 w-4 mr-1" />
              Alertas
            </Button>
          </div>
        </div>
      </div>
      
      {/* Conteúdo principal baseado no tipo de visão */}
      {tipoVisao === 'kpis' && (
        <>
          {/* Grid de KPIs principais */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {kpisPorPerfil.map(kpi => (
              <KPICard key={kpi.id} kpi={kpi} />
            ))}
          </div>
          
          {/* Resumo de alertas críticos */}
          {alertasFinanceiros.filter(a => a.tipo === 'critico').length > 0 && (
            <Card className="border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="text-red-800 flex items-center">
                  <LucideIcons.AlertTriangle className="h-5 w-5 mr-2" />
                  Alertas Críticos ({alertasFinanceiros.filter(a => a.tipo === 'critico').length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {alertasFinanceiros
                    .filter(a => a.tipo === 'critico')
                    .slice(0, 2)
                    .map(alerta => (
                      <div key={alerta.id} className="flex items-center justify-between p-3 bg-white rounded border">
                        <div>
                          <p className="font-medium text-gray-900">{alerta.titulo}</p>
                          <p className="text-sm text-gray-600">{alerta.descricao}</p>
                        </div>
                        <Button size="sm" variant="outline">
                          Resolver
                        </Button>
                      </div>
                    ))}
                  <Button variant="outline" className="w-full" onClick={() => setTipoVisao('alertas')}>
                    Ver Todos os Alertas
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
      
      {tipoVisao === 'alertas' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Alertas e Notificações</h3>
            <Badge variant="secondary">
              {alertasFinanceiros.length} alertas ativos
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {alertasFinanceiros.map(alerta => (
              <AlertaCard key={alerta.id} alerta={alerta} />
            ))}
          </div>
        </div>
      )}
      
      {/* Card de ações rápidas por perfil */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas • {usuario?.perfil}</CardTitle>
          <CardDescription>
            Acesso direto às funcionalidades mais utilizadas para seu perfil
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {usuario?.perfil === 'CFO' && (
              <>
                <Button variant="outline" className="h-20 flex-col">
                  <LucideIcons.TrendingUp className="h-6 w-6 mb-2" />
                  <span className="text-sm">Análise de Receitas</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <LucideIcons.Calculator className="h-6 w-6 mb-2" />
                  <span className="text-sm">Projeções</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <LucideIcons.FileText className="h-6 w-6 mb-2" />
                  <span className="text-sm">Relatórios</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <LucideIcons.Settings className="h-6 w-6 mb-2" />
                  <span className="text-sm">Configurar</span>
                </Button>
              </>
            )}
            
            {usuario?.perfil === 'Analista' && (
              <>
                <Button variant="outline" className="h-20 flex-col">
                  <LucideIcons.Plus className="h-6 w-6 mb-2" />
                  <span className="text-sm">Nova Transação</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <LucideIcons.CheckSquare className="h-6 w-6 mb-2" />
                  <span className="text-sm">Reconciliar</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <LucideIcons.Tag className="h-6 w-6 mb-2" />
                  <span className="text-sm">Categorizar</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <LucideIcons.Upload className="h-6 w-6 mb-2" />
                  <span className="text-sm">Importar</span>
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}