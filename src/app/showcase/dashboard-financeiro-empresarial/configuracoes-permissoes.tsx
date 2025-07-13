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
import { Switch } from "@/components/ui/switch"

interface ConfiguracoesPermissoesProps {
  usuario: any
  empresa: any
  dados: any
  carregando: boolean
  erro: string | null
  onRecarregar: () => void
  onAtualizarEmpresa: (empresa: any) => void
}

interface ContaBancaria {
  id: string
  banco: string
  agencia: string
  conta: string
  tipo: 'corrente' | 'poupanca' | 'investimento'
  saldo: number
  status: 'ativa' | 'inativa' | 'bloqueada'
  ultima_sincronizacao: string
  auto_reconciliacao: boolean
}

interface IntegracaoSistema {
  id: string
  nome: string
  tipo: 'erp' | 'crm' | 'banco' | 'contabil' | 'fiscal' | 'rh'
  status: 'conectado' | 'desconectado' | 'erro' | 'configurando'
  ultima_sincronizacao?: string
  configuracoes: Record<string, any>
  logs_recentes: LogIntegracao[]
}

interface LogIntegracao {
  id: string
  timestamp: string
  tipo: 'info' | 'sucesso' | 'warning' | 'erro'
  mensagem: string
  detalhes?: string
}

interface UsuarioSistema {
  id: string
  nome: string
  email: string
  perfil: 'CEO' | 'CFO' | 'Controller' | 'Gerente' | 'Analista' | 'Auditor'
  status: 'ativo' | 'inativo' | 'bloqueado'
  ultimo_acesso: string
  permissoes: PermissaoUsuario[]
  departamento: string
}

interface PermissaoUsuario {
  modulo: string
  acoes: ('visualizar' | 'criar' | 'editar' | 'deletar' | 'aprovar')[]
}

interface ConfiguracaoSistema {
  categoria: string
  configuracoes: {
    chave: string
    nome: string
    valor: any
    tipo: 'boolean' | 'string' | 'number' | 'select'
    opcoes?: string[]
    descricao: string
    requer_reinicio?: boolean
  }[]
}

// Formatação de data contextual
const formatarDataContextual = (dataString: string | undefined): string => {
  if (!dataString) return 'N/A'
  
  try {
    const data = new Date(dataString)
    if (isNaN(data.getTime())) return 'Data inválida'
    
    const agora = new Date()
    const diferenca = agora.getTime() - data.getTime()
    const minutos = Math.floor(diferenca / (1000 * 60))
    
    if (minutos < 1) return 'Agora mesmo'
    if (minutos < 60) return `${minutos} min atrás`
    
    const horas = Math.floor(minutos / 60)
    if (horas < 24) return `${horas}h atrás`
    
    return data.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  } catch (error) {
    return 'Erro de formato'
  }
}

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

const formatarStatusIntegracao = (status: string | undefined) => {
  switch (status) {
    case 'conectado':
      return { texto: 'Conectado', cor: 'text-green-600', icone: 'CheckCircle', badge: 'default' as const }
    case 'desconectado':
      return { texto: 'Desconectado', cor: 'text-gray-600', icone: 'Circle', badge: 'secondary' as const }
    case 'erro':
      return { texto: 'Erro', cor: 'text-red-600', icone: 'AlertCircle', badge: 'destructive' as const }
    case 'configurando':
      return { texto: 'Configurando', cor: 'text-blue-600', icone: 'Settings', badge: 'default' as const }
    default:
      return { texto: 'Indefinido', cor: 'text-gray-500', icone: 'HelpCircle', badge: 'secondary' as const }
  }
}

export default function ConfiguracoesPermissoes({ 
  usuario, 
  empresa, 
  dados, 
  carregando, 
  erro, 
  onRecarregar,
  onAtualizarEmpresa
}: ConfiguracoesPermissoesProps) {
  // Estados principais
  const [abaSelecionada, setAbaSelecionada] = useState('empresa')
  const [contas, setContas] = useState<ContaBancaria[]>([])
  const [integracoes, setIntegracoes] = useState<IntegracaoSistema[]>([])
  const [usuarios, setUsuarios] = useState<UsuarioSistema[]>([])
  const [configuracoesSistema, setConfiguracoesSistema] = useState<ConfiguracaoSistema[]>([])
  
  // Estados de operações
  const [carregandoInterno, setCarregandoInterno] = useState(false)
  const [erroInterno, setErroInterno] = useState<string | null>(null)
  const [modalNovaConta, setModalNovaConta] = useState(false)
  const [modalNovoUsuario, setModalNovoUsuario] = useState(false)
  const [modalConfigurarIntegracao, setModalConfigurarIntegracao] = useState(false)
  const [integracaoSelecionada, setIntegracaoSelecionada] = useState<IntegracaoSistema | null>(null)
  const [configuracoesPendentes, setConfiguracoesPendentes] = useState<Record<string, any>>({})
  
  // Prevenção memory leaks
  const montadoRef = React.useRef(true)
  useEffect(() => {
    montadoRef.current = true
    return () => { montadoRef.current = false }
  }, [])
  
  // Dados mockados - Contas Bancárias
  const contasMock: ContaBancaria[] = useMemo(() => [
    {
      id: 'conta-001',
      banco: 'Banco do Brasil',
      agencia: '1234-5',
      conta: '12345-6',
      tipo: 'corrente',
      saldo: 340000,
      status: 'ativa',
      ultima_sincronizacao: '2024-01-15T14:30:00',
      auto_reconciliacao: true
    },
    {
      id: 'conta-002',
      banco: 'Itaú Unibanco',
      agencia: '5678-9',
      conta: '67890-1',
      tipo: 'corrente',
      saldo: 125000,
      status: 'ativa',
      ultima_sincronizacao: '2024-01-15T14:25:00',
      auto_reconciliacao: true
    },
    {
      id: 'conta-003',
      banco: 'Santander',
      agencia: '9012-3',
      conta: '34567-8',
      tipo: 'investimento',
      saldo: 500000,
      status: 'ativa',
      ultima_sincronizacao: '2024-01-15T09:00:00',
      auto_reconciliacao: false
    }
  ], [])
  
  // Dados mockados - Integrações
  const integracoesMock: IntegracaoSistema[] = useMemo(() => [
    {
      id: 'int-001',
      nome: 'Open Banking - Banco do Brasil',
      tipo: 'banco',
      status: 'conectado',
      ultima_sincronizacao: '2024-01-15T14:30:00',
      configuracoes: {
        auto_sync: true,
        intervalo_minutos: 30
      },
      logs_recentes: [
        {
          id: 'log-001',
          timestamp: '2024-01-15T14:30:00',
          tipo: 'sucesso',
          mensagem: 'Sincronização realizada com sucesso',
          detalhes: '15 transações importadas'
        }
      ]
    },
    {
      id: 'int-002',
      nome: 'SAP ERP',
      tipo: 'erp',
      status: 'conectado',
      ultima_sincronizacao: '2024-01-15T12:00:00',
      configuracoes: {
        auto_sync: true,
        modulos: ['FI', 'CO']
      },
      logs_recentes: [
        {
          id: 'log-002',
          timestamp: '2024-01-15T12:00:00',
          tipo: 'sucesso',
          mensagem: 'Importação de centros de custo concluída'
        }
      ]
    },
    {
      id: 'int-003',
      nome: 'Contábil Digital',
      tipo: 'contabil',
      status: 'erro',
      ultima_sincronizacao: '2024-01-14T18:00:00',
      configuracoes: {
        auto_sync: false
      },
      logs_recentes: [
        {
          id: 'log-003',
          timestamp: '2024-01-15T08:00:00',
          tipo: 'erro',
          mensagem: 'Falha na autenticação',
          detalhes: 'Token de acesso expirado'
        }
      ]
    }
  ], [])
  
  // Dados mockados - Usuários
  const usuariosMock: UsuarioSistema[] = useMemo(() => [
    {
      id: 'user-001',
      nome: 'Ana Silva',
      email: 'ana.silva@empresa.com',
      perfil: 'CFO',
      status: 'ativo',
      ultimo_acesso: '2024-01-15T14:30:00',
      departamento: 'Financeiro',
      permissoes: [
        { modulo: 'dashboard', acoes: ['visualizar'] },
        { modulo: 'receitas', acoes: ['visualizar', 'criar', 'editar', 'deletar'] },
        { modulo: 'despesas', acoes: ['visualizar', 'criar', 'editar', 'deletar', 'aprovar'] },
        { modulo: 'relatorios', acoes: ['visualizar', 'criar'] },
        { modulo: 'configuracoes', acoes: ['visualizar', 'editar'] }
      ]
    },
    {
      id: 'user-002',
      nome: 'Carlos Santos',
      email: 'carlos.santos@empresa.com',
      perfil: 'Controller',
      status: 'ativo',
      ultimo_acesso: '2024-01-15T13:45:00',
      departamento: 'Financeiro',
      permissoes: [
        { modulo: 'dashboard', acoes: ['visualizar'] },
        { modulo: 'receitas', acoes: ['visualizar', 'criar', 'editar'] },
        { modulo: 'despesas', acoes: ['visualizar', 'criar', 'editar', 'aprovar'] },
        { modulo: 'relatorios', acoes: ['visualizar', 'criar'] }
      ]
    },
    {
      id: 'user-003',
      nome: 'Maria Oliveira',
      email: 'maria.oliveira@empresa.com',
      perfil: 'Analista',
      status: 'ativo',
      ultimo_acesso: '2024-01-15T16:20:00',
      departamento: 'Financeiro',
      permissoes: [
        { modulo: 'dashboard', acoes: ['visualizar'] },
        { modulo: 'receitas', acoes: ['visualizar', 'criar', 'editar'] },
        { modulo: 'despesas', acoes: ['visualizar', 'criar', 'editar'] }
      ]
    }
  ], [])
  
  // Dados mockados - Configurações do Sistema
  const configuracoesSistemaMock: ConfiguracaoSistema[] = useMemo(() => [
    {
      categoria: 'Geral',
      configuracoes: [
        {
          chave: 'moeda_padrao',
          nome: 'Moeda Padrão',
          valor: 'BRL',
          tipo: 'select',
          opcoes: ['BRL', 'USD', 'EUR'],
          descricao: 'Moeda padrão para exibição de valores'
        },
        {
          chave: 'fuso_horario',
          nome: 'Fuso Horário',
          valor: 'America/Sao_Paulo',
          tipo: 'select',
          opcoes: ['America/Sao_Paulo', 'UTC', 'America/New_York'],
          descricao: 'Fuso horário para relatórios e agendamentos'
        },
        {
          chave: 'backup_automatico',
          nome: 'Backup Automático',
          valor: true,
          tipo: 'boolean',
          descricao: 'Realizar backup automático dos dados'
        }
      ]
    },
    {
      categoria: 'Segurança',
      configuracoes: [
        {
          chave: 'sessao_timeout',
          nome: 'Timeout de Sessão (minutos)',
          valor: 60,
          tipo: 'number',
          descricao: 'Tempo para logout automático por inatividade'
        },
        {
          chave: 'auditoria_completa',
          nome: 'Auditoria Completa',
          valor: true,
          tipo: 'boolean',
          descricao: 'Registrar todas as ações do sistema'
        },
        {
          chave: 'ip_restrito',
          nome: 'Restringir por IP',
          valor: false,
          tipo: 'boolean',
          descricao: 'Permitir acesso apenas de IPs específicos'
        }
      ]
    },
    {
      categoria: 'Notificações',
      configuracoes: [
        {
          chave: 'email_alertas',
          nome: 'Alertas por Email',
          valor: true,
          tipo: 'boolean',
          descricao: 'Enviar alertas críticos por email'
        },
        {
          chave: 'slack_integration',
          nome: 'Integração Slack',
          valor: false,
          tipo: 'boolean',
          descricao: 'Enviar notificações para Slack'
        }
      ]
    }
  ], [])
  
  // Carregar dados
  const carregarConfiguracoes = useCallback(async () => {
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
      
      if (montadoRef.current) {
        setContas(contasMock)
        setIntegracoes(integracoesMock)
        setUsuarios(usuariosMock)
        setConfiguracoesSistema(configuracoesSistemaMock)
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error)
      if (montadoRef.current) {
        setErroInterno('Falha ao carregar configurações do sistema.')
      }
    } finally {
      clearTimeout(timeoutId)
      if (montadoRef.current) {
        setCarregandoInterno(false)
      }
    }
  }, [contasMock, integracoesMock, usuariosMock, configuracoesSistemaMock])
  
  // Carregar dados na inicialização
  useEffect(() => {
    carregarConfiguracoes()
  }, [carregarConfiguracoes])
  
  // Salvar configuração
  const handleSalvarConfiguracao = useCallback((categoria: string, chave: string, valor: any) => {
    setConfiguracoesPendentes(prev => ({
      ...prev,
      [`${categoria}.${chave}`]: valor
    }))
    
    // Aplicar alteração localmente
    setConfiguracoesSistema(prev => prev.map(cat => {
      if (cat.categoria === categoria) {
        return {
          ...cat,
          configuracoes: cat.configuracoes.map(config => 
            config.chave === chave ? { ...config, valor } : config
          )
        }
      }
      return cat
    }))
  }, [])
  
  // Aplicar configurações pendentes
  const handleAplicarConfiguracoes = useCallback(async () => {
    try {
      // Simular salvamento
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      setConfiguracoesPendentes({})
      toast.success('Configurações aplicadas com sucesso')
    } catch (error) {
      toast.error('Falha ao aplicar configurações')
    }
  }, [])
  
  // Verificar se há alterações pendentes
  const temAlteracoesPendentes = Object.keys(configuracoesPendentes).length > 0
  
  // Calcular métricas
  const metricas = useMemo(() => {
    const totalContas = contas.length
    const contasAtivas = contas.filter(c => c.status === 'ativa').length
    const saldoTotal = contas.reduce((acc, c) => acc + c.saldo, 0)
    const integracoesConectadas = integracoes.filter(i => i.status === 'conectado').length
    const usuariosAtivos = usuarios.filter(u => u.status === 'ativo').length
    
    return {
      totalContas,
      contasAtivas,
      saldoTotal,
      integracoesConectadas,
      usuariosAtivos
    }
  }, [contas, integracoes, usuarios])
  
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
        <h3 className="text-lg font-medium mb-2">Erro ao carregar configurações</h3>
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
      {/* Header com indicador de alterações */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Configurações e Permissões</h2>
          <p className="text-gray-600">Gestão do sistema e controle de acesso</p>
        </div>
        
        {temAlteracoesPendentes && (
          <div className="flex items-center space-x-3">
            <Badge variant="default" className="flex items-center gap-1 bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-yellow-200">
              <LucideIcons.AlertCircle className="h-3 w-3" />
              {Object.keys(configuracoesPendentes).length} alteração(ões) pendente(s)
            </Badge>
            <Button onClick={handleAplicarConfiguracoes}>
              <LucideIcons.Save className="mr-2 h-4 w-4" />
              Aplicar Alterações
            </Button>
          </div>
        )}
      </div>
      
      {/* Métricas resumidas */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <LucideIcons.Building className="h-6 w-6 text-blue-600" />
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-600">Contas Bancárias</p>
                <p className="text-lg font-bold text-gray-900">{metricas.contasAtivas}/{metricas.totalContas}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <LucideIcons.Wallet className="h-6 w-6 text-green-600" />
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-600">Saldo Total</p>
                <p className="text-lg font-bold text-gray-900">{formatarMoeda(metricas.saldoTotal)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <LucideIcons.Zap className="h-6 w-6 text-purple-600" />
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-600">Integrações</p>
                <p className="text-lg font-bold text-gray-900">{metricas.integracoesConectadas}/{integracoes.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <LucideIcons.Users className="h-6 w-6 text-orange-600" />
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-600">Usuários Ativos</p>
                <p className="text-lg font-bold text-gray-900">{metricas.usuariosAtivos}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <LucideIcons.Shield className="h-6 w-6 text-red-600" />
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-600">Segurança</p>
                <p className="text-lg font-bold text-green-600">OK</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Sistema de abas */}
      <Tabs value={abaSelecionada} onValueChange={setAbaSelecionada}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="empresa" className="flex items-center gap-2">
            <LucideIcons.Building className="h-4 w-4" />
            Empresa
          </TabsTrigger>
          <TabsTrigger value="contas" className="flex items-center gap-2">
            <LucideIcons.CreditCard className="h-4 w-4" />
            Contas
          </TabsTrigger>
          <TabsTrigger value="integracoes" className="flex items-center gap-2">
            <LucideIcons.Zap className="h-4 w-4" />
            Integrações
          </TabsTrigger>
          <TabsTrigger value="usuarios" className="flex items-center gap-2">
            <LucideIcons.Users className="h-4 w-4" />
            Usuários
          </TabsTrigger>
          <TabsTrigger value="sistema" className="flex items-center gap-2">
            <LucideIcons.Settings className="h-4 w-4" />
            Sistema
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="empresa" className="space-y-6">
          {/* Informações da empresa */}
          <Card>
            <CardHeader>
              <CardTitle>Informações da Empresa</CardTitle>
              <CardDescription>
                Dados cadastrais e configurações fiscais
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="nome_empresa">Nome da Empresa</Label>
                  <Input 
                    id="nome_empresa" 
                    defaultValue={empresa?.nome}
                    onChange={(e) => {
                      // Simular alteração local
                      if (onAtualizarEmpresa) {
                        onAtualizarEmpresa({ ...empresa, nome: e.target.value })
                      }
                    }}
                  />
                </div>
                <div>
                  <Label htmlFor="cnpj">CNPJ</Label>
                  <Input id="cnpj" defaultValue={empresa?.cnpj} readOnly />
                </div>
                <div>
                  <Label htmlFor="regime_tributario">Regime Tributário</Label>
                  <Select defaultValue={empresa?.regime_tributario}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Simples Nacional">Simples Nacional</SelectItem>
                      <SelectItem value="Lucro Presumido">Lucro Presumido</SelectItem>
                      <SelectItem value="Lucro Real">Lucro Real</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="periodo_fiscal">Período Fiscal</Label>
                  <Select defaultValue={empresa?.periodo_fiscal}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Janeiro a Dezembro">Janeiro a Dezembro</SelectItem>
                      <SelectItem value="Julho a Junho">Julho a Junho</SelectItem>
                      <SelectItem value="Outubro a Setembro">Outubro a Setembro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t">
                <h4 className="font-medium mb-4">Plano de Contas</h4>
                <div className="space-y-2">
                  {empresa?.plano_contas?.map((conta: string, index: number) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span>{conta}</span>
                      <Button variant="ghost" size="sm">
                        <LucideIcons.Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="mt-3">
                  <LucideIcons.Plus className="mr-2 h-4 w-4" />
                  Adicionar Conta
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="contas" className="space-y-6">
          {/* Lista de contas bancárias */}
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Contas Bancárias</h3>
            <Button onClick={() => setModalNovaConta(true)}>
              <LucideIcons.Plus className="mr-2 h-4 w-4" />
              Nova Conta
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {contas.map((conta) => (
              <Card key={conta.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{conta.banco}</CardTitle>
                    <Badge variant={conta.status === 'ativa' ? 'default' : 'secondary'}>
                      {conta.status}
                    </Badge>
                  </div>
                  <CardDescription>
                    Ag: {conta.agencia} • Conta: {conta.conta}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Tipo:</span>
                      <span className="text-sm font-medium capitalize">{conta.tipo}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Saldo:</span>
                      <span className="text-sm font-bold">{formatarMoeda(conta.saldo)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Última Sync:</span>
                      <span className="text-sm">{formatarDataContextual(conta.ultima_sincronizacao)}</span>
                    </div>
                    
                    <div className="flex items-center justify-between pt-3 border-t">
                      <div className="flex items-center space-x-2">
                        <Switch 
                          checked={conta.auto_reconciliacao}
                          onCheckedChange={() => {
                            // Simular toggle
                            setContas(prev => prev.map(c => 
                              c.id === conta.id 
                                ? { ...c, auto_reconciliacao: !c.auto_reconciliacao }
                                : c
                            ))
                          }}
                        />
                        <span className="text-xs">Auto Reconciliação</span>
                      </div>
                      <Button variant="ghost" size="sm">
                        <LucideIcons.Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="integracoes" className="space-y-6">
          {/* Lista de integrações */}
          <div className="space-y-4">
            {integracoes.map((integracao) => {
              const statusInfo = formatarStatusIntegracao(integracao.status)
              const IconeStatus = LucideIcons[statusInfo.icone as keyof typeof LucideIcons] as any
              
              return (
                <Card key={integracao.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`p-3 rounded-full ${
                          integracao.status === 'conectado' ? 'bg-green-100' :
                          integracao.status === 'erro' ? 'bg-red-100' :
                          'bg-gray-100'
                        }`}>
                          {integracao.tipo === 'banco' && <LucideIcons.Building className="h-6 w-6" />}
                          {integracao.tipo === 'erp' && <LucideIcons.Database className="h-6 w-6" />}
                          {integracao.tipo === 'contabil' && <LucideIcons.Calculator className="h-6 w-6" />}
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{integracao.nome}</h4>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span className="capitalize">{integracao.tipo}</span>
                            {integracao.ultima_sincronizacao && (
                              <>
                                <span>•</span>
                                <span>Última sync: {formatarDataContextual(integracao.ultima_sincronizacao)}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <Badge variant={statusInfo.badge} className="flex items-center gap-1">
                          <IconeStatus className="h-3 w-3" />
                          {statusInfo.texto}
                        </Badge>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setIntegracaoSelecionada(integracao)
                            setModalConfigurarIntegracao(true)
                          }}
                        >
                          <LucideIcons.Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    {/* Logs recentes */}
                    {integracao.logs_recentes.length > 0 && (
                      <div className="mt-4 pt-4 border-t">
                        <h5 className="text-sm font-medium text-gray-700 mb-2">Logs Recentes</h5>
                        <div className="space-y-1">
                          {integracao.logs_recentes.slice(0, 2).map((log) => (
                            <div key={log.id} className="flex items-center space-x-2 text-xs">
                              <div className={`w-2 h-2 rounded-full ${
                                log.tipo === 'sucesso' ? 'bg-green-500' :
                                log.tipo === 'erro' ? 'bg-red-500' :
                                'bg-yellow-500'
                              }`}></div>
                              <span className="text-gray-500">{formatarDataContextual(log.timestamp)}</span>
                              <span>{log.mensagem}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>
        
        <TabsContent value="usuarios" className="space-y-6">
          {/* Lista de usuários */}
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Usuários do Sistema</h3>
            <Button onClick={() => setModalNovoUsuario(true)}>
              <LucideIcons.Plus className="mr-2 h-4 w-4" />
              Novo Usuário
            </Button>
          </div>
          
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Usuário
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Perfil
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Último Acesso
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
                    {usuarios.map((usuario) => (
                      <tr key={usuario.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{usuario.nome}</div>
                            <div className="text-sm text-gray-500">{usuario.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{usuario.perfil}</div>
                            <div className="text-sm text-gray-500">{usuario.departamento}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatarDataContextual(usuario.ultimo_acesso)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant={usuario.status === 'ativo' ? 'default' : 'secondary'}>
                            {usuario.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="sm">
                              <LucideIcons.Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <LucideIcons.Shield className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <LucideIcons.MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="sistema" className="space-y-6">
          {/* Configurações do sistema */}
          {configuracoesSistema.map((categoria) => (
            <Card key={categoria.categoria}>
              <CardHeader>
                <CardTitle>{categoria.categoria}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {categoria.configuracoes.map((config) => (
                    <div key={config.chave} className="flex items-center justify-between">
                      <div className="flex-1">
                        <Label className="text-sm font-medium">{config.nome}</Label>
                        <p className="text-xs text-gray-500 mt-1">{config.descricao}</p>
                      </div>
                      <div className="w-48">
                        {config.tipo === 'boolean' && (
                          <Switch
                            checked={config.valor}
                            onCheckedChange={(checked) => 
                              handleSalvarConfiguracao(categoria.categoria, config.chave, checked)
                            }
                          />
                        )}
                        {config.tipo === 'string' && (
                          <Input
                            value={config.valor}
                            onChange={(e) => 
                              handleSalvarConfiguracao(categoria.categoria, config.chave, e.target.value)
                            }
                          />
                        )}
                        {config.tipo === 'number' && (
                          <Input
                            type="number"
                            value={config.valor}
                            onChange={(e) => 
                              handleSalvarConfiguracao(categoria.categoria, config.chave, Number(e.target.value))
                            }
                          />
                        )}
                        {config.tipo === 'select' && (
                          <Select
                            value={config.valor}
                            onValueChange={(value) => 
                              handleSalvarConfiguracao(categoria.categoria, config.chave, value)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {config.opcoes?.map((opcao) => (
                                <SelectItem key={opcao} value={opcao}>
                                  {opcao}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
      
      {/* Modais */}
      <Dialog open={modalNovaConta} onOpenChange={setModalNovaConta}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Conta Bancária</DialogTitle>
            <DialogDescription>
              Adicione uma nova conta para sincronização
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div>
              <Label htmlFor="banco">Banco</Label>
              <Input id="banco" placeholder="Nome do banco" />
            </div>
            <div>
              <Label htmlFor="tipo_conta">Tipo</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Tipo da conta" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="corrente">Corrente</SelectItem>
                  <SelectItem value="poupanca">Poupança</SelectItem>
                  <SelectItem value="investimento">Investimento</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="agencia">Agência</Label>
              <Input id="agencia" placeholder="0000-0" />
            </div>
            <div>
              <Label htmlFor="conta">Conta</Label>
              <Input id="conta" placeholder="00000-0" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalNovaConta(false)}>
              Cancelar
            </Button>
            <Button onClick={() => {
              toast.success('Conta adicionada com sucesso')
              setModalNovaConta(false)
            }}>
              Adicionar Conta
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={modalNovoUsuario} onOpenChange={setModalNovoUsuario}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Usuário</DialogTitle>
            <DialogDescription>
              Adicione um novo usuário ao sistema
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div>
              <Label htmlFor="nome_usuario">Nome</Label>
              <Input id="nome_usuario" placeholder="Nome completo" />
            </div>
            <div>
              <Label htmlFor="email_usuario">Email</Label>
              <Input id="email_usuario" type="email" placeholder="usuario@empresa.com" />
            </div>
            <div>
              <Label htmlFor="perfil_usuario">Perfil</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o perfil" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CEO">CEO</SelectItem>
                  <SelectItem value="CFO">CFO</SelectItem>
                  <SelectItem value="Controller">Controller</SelectItem>
                  <SelectItem value="Gerente">Gerente</SelectItem>
                  <SelectItem value="Analista">Analista</SelectItem>
                  <SelectItem value="Auditor">Auditor</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="departamento_usuario">Departamento</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o departamento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Financeiro">Financeiro</SelectItem>
                  <SelectItem value="Administrativo">Administrativo</SelectItem>
                  <SelectItem value="Comercial">Comercial</SelectItem>
                  <SelectItem value="TI">TI</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalNovoUsuario(false)}>
              Cancelar
            </Button>
            <Button onClick={() => {
              toast.success('Usuário criado com sucesso')
              setModalNovoUsuario(false)
            }}>
              Criar Usuário
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}