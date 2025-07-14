'use client'

import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react'
import { toast, Toaster } from 'sonner'
import * as LucideIcons from 'lucide-react'

import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// Módulos especializados
import DashboardOverview from './dashboard-overview'
import ReceitasVendas from './receitas-vendas'
import DespesasCustos from './despesas-custos'
import FluxoCaixa from './fluxo-caixa'
import RelatoriosAvancados from './relatorios-avancados'
import ConfiguracoesPermissoes from './configuracoes-permissoes'

// Interfaces TypeScript
interface UsuarioFinanceiro {
  id: string
  nome: string
  email: string
  perfil: 'CEO' | 'CFO' | 'Controller' | 'Gerente' | 'Analista' | 'Auditor'
  avatar?: string
  departamento: string
  permissoes: string[]
  ultimo_acesso: string
}

interface MetricasGlobais {
  receita_total: number
  despesa_total: number
  lucro_liquido: number
  margem_liquida: number
  fluxo_caixa_atual: number
  variacao_mensal: number
  contas_a_receber: number
  contas_a_pagar: number
  transacoes_pendentes: number
  alertas_criticos: number
}

interface EmpresaConfig {
  id: string
  nome: string
  cnpj: string
  moeda_base: string
  regime_tributario: string
  plano_contas: string[]
  periodo_fiscal: string
}

// Types for tab data
interface DadosAbaOverview {
  kpis: any[]
  graficos: any[]
  alertas: any[]
}

interface DadosAbaReceitas {
  transacoes: any[]
  categorias: any[]
  trends: any[]
}

interface DadosAbaDespesas {
  lancamentos: any[]
  orcamentos: any[]
  analises: any[]
}

interface DadosAbaFluxoCaixa {
  projecoes: any[]
  cenarios: any[]
  historico: any[]
}

interface DadosAbaRelatorios {
  templates: any[]
  agendados: any[]
  historico: any[]
}

interface DadosAbaConfiguracoes {
  contas: any[]
  usuarios: any[]
  intergracoes: any[]
}

type DadosAba = DadosAbaOverview | DadosAbaReceitas | DadosAbaDespesas | DadosAbaFluxoCaixa | DadosAbaRelatorios | DadosAbaConfiguracoes

// Função utilitária defensiva para formatação monetária
const formatarMoeda = (valor: number | undefined, moeda: string = 'BRL'): string => {
  if (valor === undefined || valor === null || isNaN(valor)) return 'R$ 0,00'
  
  try {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: moeda
    }).format(valor)
  } catch (error) {
    console.error('Erro ao formatar moeda:', error)
    return `${moeda} ${valor.toFixed(2)}`
  }
}

// Função utilitária para status visual
const formatarStatusFinanceiro = (
  valor: number | undefined,
  tipo: 'crescimento' | 'margem' | 'fluxo' = 'crescimento'
): { texto: string; cor: string; icone: string; badge: 'success' | 'warning' | 'error' | 'info' } => {
  if (valor === undefined || valor === null || isNaN(valor)) {
    return { texto: 'N/A', cor: 'text-gray-500', icone: 'HelpCircle', badge: 'info' }
  }
  
  switch (tipo) {
    case 'crescimento':
      if (valor > 0) return { texto: `+${valor.toFixed(1)}%`, cor: 'text-green-600', icone: 'TrendingUp', badge: 'success' }
      if (valor < 0) return { texto: `${valor.toFixed(1)}%`, cor: 'text-red-600', icone: 'TrendingDown', badge: 'error' }
      return { texto: '0%', cor: 'text-gray-600', icone: 'Minus', badge: 'info' }
    
    case 'margem':
      if (valor >= 20) return { texto: `${valor.toFixed(1)}%`, cor: 'text-green-600', icone: 'CheckCircle', badge: 'success' }
      if (valor >= 10) return { texto: `${valor.toFixed(1)}%`, cor: 'text-yellow-600', icone: 'AlertTriangle', badge: 'warning' }
      return { texto: `${valor.toFixed(1)}%`, cor: 'text-red-600', icone: 'XCircle', badge: 'error' }
    
    case 'fluxo':
      if (valor > 0) return { texto: 'Positivo', cor: 'text-green-600', icone: 'ArrowUp', badge: 'success' }
      if (valor < 0) return { texto: 'Negativo', cor: 'text-red-600', icone: 'ArrowDown', badge: 'error' }
      return { texto: 'Neutro', cor: 'text-gray-600', icone: 'Minus', badge: 'info' }
    
    default:
      return { texto: valor.toString(), cor: 'text-gray-600', icone: 'Circle', badge: 'info' }
  }
}

// Função para gerar iniciais com suporte a nomes complexos
const gerarIniciaisNome = (nome: string | undefined): string => {
  if (!nome) return '??'
  
  try {
    const nomeLimpo = nome.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    const partesNome = nomeLimpo.trim().split(' ').filter(parte => parte.length > 0)
    
    if (partesNome.length === 0) return '??'
    if (partesNome.length === 1) return partesNome[0].substring(0, 2).toUpperCase()
    
    const primeiraLetra = partesNome[0][0] || '?'
    const ultimaLetra = partesNome[partesNome.length - 1][0] || '?'
    
    return (primeiraLetra + ultimaLetra).toUpperCase()
  } catch (error) {
    console.error('Erro ao gerar iniciais:', error)
    return '??'
  }
}

export default function DashboardFinanceiroEmpresarial() {
  // Estados principais do orquestrador
  const [abaSelecionada, setAbaSelecionada] = useState<string>('overview')
  const [usuarioAtual, setUsuarioAtual] = useState<UsuarioFinanceiro | null>(null)
  const [empresa, setEmpresa] = useState<EmpresaConfig | null>(null)
  const [metricas, setMetricas] = useState<MetricasGlobais | null>(null)
  const [carregandoGlobal, setCarregandoGlobal] = useState(true)
  const [erroGlobal, setErroGlobal] = useState<string | null>(null)
  
  // Estados por aba para lazy loading
  const [dadosPorAba, setDadosPorAba] = useState<Record<string, DadosAba>>({})
  const [carregandoPorAba, setCarregandoPorAba] = useState<Record<string, boolean>>({})
  const [erroPorAba, setErroPorAba] = useState<Record<string, string | null>>({})
  const [abasCarregadas, setAbasCarregadas] = useState<Set<string>>(new Set(['overview']))
  
  // Prevenção de memory leaks obrigatória
  const montadoRef = useRef(true)
  useEffect(() => {
    montadoRef.current = true
    return () => { montadoRef.current = false }
  }, [])
  
  // Configuração de abas por perfil de usuário
  const configuracaoAbas = useMemo(() => {
    const abasBase = [
      { 
        id: 'overview', 
        label: 'Dashboard', 
        icone: 'LayoutDashboard',
        badge: metricas?.alertas_criticos || null,
        lazy: false,
        perfisPermitidos: ['CEO', 'CFO', 'Controller', 'Gerente', 'Analista', 'Auditor']
      },
      { 
        id: 'receitas', 
        label: 'Receitas', 
        icone: 'TrendingUp',
        badge: null,
        lazy: true,
        perfisPermitidos: ['CEO', 'CFO', 'Controller', 'Gerente', 'Analista']
      },
      { 
        id: 'despesas', 
        label: 'Despesas', 
        icone: 'TrendingDown',
        badge: null,
        lazy: true,
        perfisPermitidos: ['CEO', 'CFO', 'Controller', 'Gerente', 'Analista']
      },
      { 
        id: 'fluxo-caixa', 
        label: 'Fluxo de Caixa', 
        icone: 'BarChart3',
        badge: null,
        lazy: true,
        perfisPermitidos: ['CEO', 'CFO', 'Controller']
      },
      { 
        id: 'relatorios', 
        label: 'Relatórios', 
        icone: 'FileText',
        badge: null,
        lazy: true,
        perfisPermitidos: ['CEO', 'CFO', 'Controller', 'Auditor']
      },
      { 
        id: 'configuracoes', 
        label: 'Configurações', 
        icone: 'Settings',
        badge: null,
        lazy: true,
        perfisPermitidos: ['CEO', 'CFO', 'Controller']
      }
    ]
    
    // Filtrar abas baseado no perfil do usuário
    return abasBase.filter(aba => 
      !usuarioAtual || aba.perfisPermitidos.includes(usuarioAtual.perfil)
    )
  }, [metricas, usuarioAtual])
  
  // Carregamento inicial de dados globais
  const carregarDadosGlobais = useCallback(async () => {
    if (!montadoRef.current) return
    
    setCarregandoGlobal(true)
    setErroGlobal(null)
    
    const timeoutId = setTimeout(() => {
      if (montadoRef.current) {
        setCarregandoGlobal(false)
        setErroGlobal('Tempo de carregamento excedido. Verifique sua conexão.')
      }
    }, 10000) // Timeout estendido para dados financeiros críticos
    
    try {
      // Simular carregamento de dados principais
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      if (!montadoRef.current) return
      
      // Dados mockados do usuário
      const usuarioMock: UsuarioFinanceiro = {
        id: 'user-001',
        nome: 'Ana Silva',
        email: 'ana.silva@empresa.com',
        perfil: 'CFO',
        departamento: 'Financeiro',
        permissoes: ['dashboard', 'receitas', 'despesas', 'fluxo-caixa', 'relatorios', 'configuracoes'],
        ultimo_acesso: new Date().toISOString()
      }
      
      // Dados mockados da empresa
      const empresaMock: EmpresaConfig = {
        id: 'emp-001',
        nome: 'TechCorp Soluções Ltda',
        cnpj: '12.345.678/0001-90',
        moeda_base: 'BRL',
        regime_tributario: 'Lucro Presumido',
        plano_contas: ['Receitas', 'Despesas', 'Ativos', 'Passivos'],
        periodo_fiscal: 'Janeiro a Dezembro'
      }
      
      // Métricas mockadas
      const metricasMock: MetricasGlobais = {
        receita_total: 2450000,
        despesa_total: 1890000,
        lucro_liquido: 560000,
        margem_liquida: 22.85,
        fluxo_caixa_atual: 340000,
        variacao_mensal: 8.5,
        contas_a_receber: 180000,
        contas_a_pagar: 95000,
        transacoes_pendentes: 12,
        alertas_criticos: 3
      }
      
      if (montadoRef.current) {
        setUsuarioAtual(usuarioMock)
        setEmpresa(empresaMock)
        setMetricas(metricasMock)
        
        toast.success('Dashboard carregado com sucesso')
      }
    } catch (error) {
      console.error('Erro ao carregar dados globais:', error)
      if (montadoRef.current) {
        setErroGlobal('Falha ao carregar dados do dashboard. Tente novamente.')
        toast.error('Erro ao carregar dashboard')
      }
    } finally {
      clearTimeout(timeoutId)
      if (montadoRef.current) {
        setCarregandoGlobal(false)
      }
    }
  }, [])
  
  // Definir tipo para as abas válidas
  type TabId = 'overview' | 'receitas' | 'despesas' | 'fluxo-caixa' | 'relatorios' | 'configuracoes';
  
  // Carregamento lazy por aba
  const carregarDadosAba = useCallback(async (abaId: string) => {
    if (!montadoRef.current) return
    
    // Evitar recarregamento desnecessário
    if (abasCarregadas.has(abaId) && dadosPorAba[abaId]) {
      return
    }
    
    setCarregandoPorAba(prev => ({ ...prev, [abaId]: true }))
    setErroPorAba(prev => ({ ...prev, [abaId]: null }))
    
    const timeoutId = setTimeout(() => {
      if (montadoRef.current) {
        setCarregandoPorAba(prev => ({ ...prev, [abaId]: false }))
        setErroPorAba(prev => ({ 
          ...prev, 
          [abaId]: 'Tempo de carregamento excedido. Tente novamente.' 
        }))
      }
    }, 8000)
    
    try {
      // Simular carregamento específico por aba
      await new Promise(resolve => setTimeout(resolve, 800))
      
      if (montadoRef.current) {
        // Dados mockados específicos por aba
        const dadosAba: Record<TabId, DadosAba> = {
          overview: { kpis: [], graficos: [], alertas: [] },
          receitas: { transacoes: [], categorias: [], trends: [] },
          despesas: { lancamentos: [], orcamentos: [], analises: [] },
          'fluxo-caixa': { projecoes: [], cenarios: [], historico: [] },
          relatorios: { templates: [], agendados: [], historico: [] },
          configuracoes: { contas: [], usuarios: [], intergracoes: [] }
        }
        
        setDadosPorAba(prev => ({ ...prev, [abaId]: dadosAba[abaId as TabId] || {} }))
        setAbasCarregadas(prev => {
          const newSet = new Set(prev);
          newSet.add(abaId);
          return newSet;
        })
      }
    } catch (error) {
      console.error(`Erro ao carregar aba ${abaId}:`, error)
      if (montadoRef.current) {
        setErroPorAba(prev => ({ 
          ...prev, 
          [abaId]: 'Falha ao carregar dados. Tente novamente.' 
        }))
      }
    } finally {
      clearTimeout(timeoutId)
      if (montadoRef.current) {
        setCarregandoPorAba(prev => ({ ...prev, [abaId]: false }))
      }
    }
  }, [abasCarregadas, dadosPorAba])
  
  // Handler para mudança de aba com lazy loading
  const handleMudarAba = useCallback((novaAba: string) => {
    if (novaAba === abaSelecionada) return
    
    setAbaSelecionada(novaAba)
    
    // Lazy loading se necessário
    const configAba = configuracaoAbas.find(aba => aba.id === novaAba)
    if (configAba?.lazy && !abasCarregadas.has(novaAba)) {
      setTimeout(() => {
        if (montadoRef.current) {
          carregarDadosAba(novaAba)
        }
      }, 150)
    }
  }, [abaSelecionada, configuracaoAbas, abasCarregadas, carregarDadosAba])
  
  // Inicialização
  useEffect(() => {
    const init = async () => {
      await carregarDadosGlobais()
      await carregarDadosAba('overview')
    }
    init()
  }, [carregarDadosGlobais, carregarDadosAba])
  
  // Renderização das abas com badges dinâmicas
  const renderizarAba = useCallback((aba: typeof configuracaoAbas[0]) => {
    const IconeComponente = LucideIcons[aba.icone as keyof typeof LucideIcons] as React.ComponentType<{ className?: string }>
    const isCarregando = carregandoPorAba[aba.id]
    
    return (
      <TabsTrigger 
        key={aba.id}
        value={aba.id} 
        className="relative"
        disabled={isCarregando}
      >
        <div className="flex items-center gap-2">
          {isCarregando ? (
            <LucideIcons.Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <IconeComponente className="h-4 w-4" />
          )}
          <span>{aba.label}</span>
          {aba.badge && aba.badge > 0 && (
            <Badge variant="destructive" className="ml-1 text-xs">
              {aba.badge}
            </Badge>
          )}
        </div>
      </TabsTrigger>
    )
  }, [carregandoPorAba])
  
  // Estados de carregamento global
  if (carregandoGlobal) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <h3 className="text-xl font-semibold mb-2">Carregando Dashboard Financeiro</h3>
          <p className="text-gray-600">Sincronizando dados bancários e métricas...</p>
        </div>
      </div>
    )
  }
  
  if (erroGlobal) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 p-8 rounded-lg text-center max-w-md">
          <LucideIcons.AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Erro ao carregar dashboard</h3>
          <p className="text-gray-700 mb-6">{erroGlobal}</p>
          <Button onClick={carregarDadosGlobais}>
            <LucideIcons.RefreshCw className="mr-2 h-4 w-4" />
            Tentar Novamente
          </Button>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
      <Toaster position="bottom-right" richColors />
      
      {/* Header principal com dados da empresa */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <LucideIcons.Building2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{empresa?.nome}</h1>
                <p className="text-sm text-gray-500">CNPJ: {empresa?.cnpj}</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Métricas resumidas no header */}
            <div className="hidden md:flex items-center space-x-6 text-sm">
              <div className="text-center">
                <p className="text-gray-500">Receita Total</p>
                <p className="font-semibold text-green-600">
                  {formatarMoeda(metricas?.receita_total)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-gray-500">Lucro Líquido</p>
                <p className="font-semibold text-blue-600">
                  {formatarMoeda(metricas?.lucro_liquido)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-gray-500">Margem</p>
                <p className={`font-semibold ${formatarStatusFinanceiro(metricas?.margem_liquida, 'margem').cor}`}>
                  {formatarStatusFinanceiro(metricas?.margem_liquida, 'margem').texto}
                </p>
              </div>
            </div>
            
            {/* Perfil do usuário */}
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{usuarioAtual?.nome}</p>
                <p className="text-xs text-gray-500">{usuarioAtual?.perfil} • {usuarioAtual?.departamento}</p>
              </div>
              <Avatar>
                <AvatarImage src={usuarioAtual?.avatar} />
                <AvatarFallback>{gerarIniciaisNome(usuarioAtual?.nome)}</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </div>
      
      {/* Sistema de navegação por abas */}
      <div className="p-6">
        <Tabs value={abaSelecionada} onValueChange={handleMudarAba} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 h-12">
            {configuracaoAbas.map(renderizarAba)}
          </TabsList>
          
          {/* Conteúdo das abas */}
          <TabsContent value="overview" className="space-y-6">
            <DashboardOverview 
              usuario={usuarioAtual}
              empresa={empresa}
              metricas={metricas}
              dados={dadosPorAba.overview}
              carregando={carregandoPorAba.overview}
              erro={erroPorAba.overview}
              onRecarregar={() => carregarDadosAba('overview')}
            />
          </TabsContent>
          
          <TabsContent value="receitas" className="space-y-6">
            <ReceitasVendas
              usuario={usuarioAtual}
              dados={dadosPorAba.receitas}
              carregando={carregandoPorAba.receitas}
              erro={erroPorAba.receitas}
              onRecarregar={() => carregarDadosAba('receitas')}
            />
          </TabsContent>
          
          <TabsContent value="despesas" className="space-y-6">
            <DespesasCustos
              usuario={usuarioAtual}
              dados={dadosPorAba.despesas}
              carregando={carregandoPorAba.despesas}
              erro={erroPorAba.despesas}
              onRecarregar={() => carregarDadosAba('despesas')}
            />
          </TabsContent>
          
          <TabsContent value="fluxo-caixa" className="space-y-6">
            <FluxoCaixa
              usuario={usuarioAtual}
              dados={dadosPorAba['fluxo-caixa']}
              carregando={carregandoPorAba['fluxo-caixa']}
              erro={erroPorAba['fluxo-caixa']}
              onRecarregar={() => carregarDadosAba('fluxo-caixa')}
            />
          </TabsContent>
          
          <TabsContent value="relatorios" className="space-y-6">
            <RelatoriosAvancados
              usuario={usuarioAtual}
              dados={dadosPorAba.relatorios}
              carregando={carregandoPorAba.relatorios}
              erro={erroPorAba.relatorios}
              onRecarregar={() => carregarDadosAba('relatorios')}
            />
          </TabsContent>
          
          <TabsContent value="configuracoes" className="space-y-6">
            <ConfiguracoesPermissoes
              usuario={usuarioAtual}
              empresa={empresa}
              dados={dadosPorAba.configuracoes}
              carregando={carregandoPorAba.configuracoes}
              erro={erroPorAba.configuracoes}
              onRecarregar={() => carregarDadosAba('configuracoes')}
              onAtualizarEmpresa={setEmpresa}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}