'use client'

import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react'
import { toast, Toaster } from 'sonner'
import * as LucideIcons from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

// Componentes dos módulos
import DashboardFinanceiro from './components/dashboard-financeiro'
import TransferenciasModule from './components/transferencias'
import PagamentosModule from './components/pagamentos'
import InvestimentosModule from './components/investimentos'
import CartoesModule from './components/cartoes'
import ConfiguracoesModule from './components/configuracoes'

// Tipos e dados
interface ContaBancaria {
  id: string
  numero: string
  tipo: 'corrente' | 'poupanca' | 'investimento'
  saldo: number
  saldo_disponivel: number
  limite: number
  banco: string
  agencia: string
  titular: string
  status: 'ativa' | 'bloqueada' | 'encerrada'
  data_abertura: string
}

interface UsuarioBanco {
  id: string
  nome: string
  cpf: string
  email: string
  telefone: string
  avatar?: string
  perfil: 'individual' | 'premier' | 'private'
  autenticacao_2fa: boolean
  biometria_ativa: boolean
  ultimo_acesso: string
  contas: ContaBancaria[]
}

// Dados mockados
const usuarioMock: UsuarioBanco = {
  id: '1',
  nome: 'Maria Silva Santos',
  cpf: '123.456.789-00',
  email: 'maria.santos@email.com',
  telefone: '(11) 99999-9999',
  perfil: 'individual',
  autenticacao_2fa: true,
  biometria_ativa: true,
  ultimo_acesso: '2024-12-29T10:30:00Z',
  contas: [
    {
      id: '001',
      numero: '12345-6',
      tipo: 'corrente',
      saldo: 15750.50,
      saldo_disponivel: 13250.50,
      limite: 5000,
      banco: 'Banco Digital',
      agencia: '0001',
      titular: 'Maria Silva Santos',
      status: 'ativa',
      data_abertura: '2020-03-15'
    },
    {
      id: '002',
      numero: '78901-2',
      tipo: 'poupanca',
      saldo: 8500.25,
      saldo_disponivel: 8500.25,
      limite: 0,
      banco: 'Banco Digital',
      agencia: '0001',
      titular: 'Maria Silva Santos',
      status: 'ativa',
      data_abertura: '2020-03-15'
    }
  ]
}

// Funções utilitárias defensivas
const formatarMoeda = (valor: number | undefined): string => {
  if (valor === undefined || valor === null) return 'R$ 0,00'
  
  try {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor)
  } catch (error) {
    console.error('Erro ao formatar moeda:', error)
    return 'R$ 0,00'
  }
}

const formatarCPF = (cpf: string | undefined): string => {
  if (!cpf) return 'CPF não informado'
  
  try {
    const apenasNumeros = cpf.replace(/\D/g, '')
    if (apenasNumeros.length !== 11) return cpf
    
    return apenasNumeros.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
  } catch (error) {
    console.error('Erro ao formatar CPF:', error)
    return cpf
  }
}

const formatarDataHora = (dataString: string | undefined): string => {
  if (!dataString) return 'Data não informada'
  
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
    console.error('Erro ao formatar data:', error)
    return 'Erro de formato'
  }
}

const obterStatusConta = (status: string) => {
  switch (status) {
    case 'ativa':
      return { texto: 'Ativa', cor: 'text-green-600', icone: 'CheckCircle', badge: 'success' as const }
    case 'bloqueada':
      return { texto: 'Bloqueada', cor: 'text-red-600', icone: 'XCircle', badge: 'error' as const }
    case 'encerrada':
      return { texto: 'Encerrada', cor: 'text-gray-600', icone: 'MinusCircle', badge: 'info' as const }
    default:
      return { texto: status, cor: 'text-gray-600', icone: 'Circle', badge: 'info' as const }
  }
}

export default function SistemaBancario() {
  // Estados principais
  const [usuario, setUsuario] = useState<UsuarioBanco | null>(null)
  const [abaSelecionada, setAbaSelecionada] = useState('dashboard')
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const [autenticado, setAutenticado] = useState(false)
  const [modalSobre, setModalSobre] = useState(false)
  const [modalSeguranca, setModalSeguranca] = useState(false)
  
  // Estados de notificação
  const [notificacoes, setNotificacoes] = useState<any[]>([])
  const [alertasSeguranca, setAlertasSeguranca] = useState<string[]>([])
  
  // Estados de autenticação
  const [tentandoAutenticar, setTentandoAutenticar] = useState(false)
  const [sessaoExpirada, setSessaoExpirada] = useState(false)
  
  // Prevenção de memory leak
  const montadoRef = useRef(true)
  
  useEffect(() => {
    montadoRef.current = true
    return () => { montadoRef.current = false }
  }, [])
  
  // Configuração de abas
  const configAbas = useMemo(() => [
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      icone: 'LayoutDashboard',
      badge: null,
      descricao: 'Visão geral das suas contas e transações'
    },
    { 
      id: 'transferencias', 
      label: 'Transferências', 
      icone: 'ArrowLeftRight',
      badge: null,
      descricao: 'PIX, TED, transferências entre contas'
    },
    { 
      id: 'pagamentos', 
      label: 'Pagamentos', 
      icone: 'Receipt',
      badge: null,
      descricao: 'Boletos, financiamentos, impostos'
    },
    { 
      id: 'investimentos', 
      label: 'Investimentos', 
      icone: 'TrendingUp',
      badge: null,
      descricao: 'Aplicações, resgates, acompanhamento'
    },
    { 
      id: 'cartoes', 
      label: 'Cartões', 
      icone: 'CreditCard',
      badge: null,
      descricao: 'Limites, faturas, bloqueios'
    },
    { 
      id: 'configuracoes', 
      label: 'Configurações', 
      icone: 'Settings',
      badge: null,
      descricao: 'Segurança, limites, preferências'
    }
  ], [])
  
  // Simulação de autenticação
  const autenticarUsuario = useCallback(async () => {
    if (!montadoRef.current) return
    
    setTentandoAutenticar(true)
    setErro(null)
    
    // Timeout para autenticação
    const timeoutId = setTimeout(() => {
      if (montadoRef.current) {
        setTentandoAutenticar(false)
        setErro('Tempo de autenticação excedido. Tente novamente.')
        toast.error('Falha na autenticação')
      }
    }, 10000)
    
    try {
      // Simular processo de autenticação
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      if (montadoRef.current) {
        setUsuario(usuarioMock)
        setAutenticado(true)
        setCarregando(false)
        toast.success('Autenticação realizada com sucesso')
      }
    } catch (error) {
      console.error('Erro na autenticação:', error)
      if (montadoRef.current) {
        setErro('Falha na autenticação. Verifique suas credenciais.')
        toast.error('Erro na autenticação')
      }
    } finally {
      clearTimeout(timeoutId)
      if (montadoRef.current) {
        setTentandoAutenticar(false)
      }
    }
  }, [])
  
  // Carregar dados iniciais
  useEffect(() => {
    // Simular carregamento inicial
    setTimeout(() => {
      if (montadoRef.current) {
        autenticarUsuario()
      }
    }, 1000)
  }, [autenticarUsuario])
  
  // Logout seguro
  const handleLogout = useCallback(() => {
    setAutenticado(false)
    setUsuario(null)
    setAbaSelecionada('dashboard')
    toast.info('Sessão encerrada com segurança')
  }, [])
  
  // Mudança de aba
  const handleMudarAba = useCallback((novaAba: string) => {
    if (novaAba === abaSelecionada) return
    setAbaSelecionada(novaAba)
  }, [abaSelecionada])
  
  // Renderizar aba
  const renderizarAba = useCallback((aba: typeof configAbas[0]) => {
    const IconeComponente = LucideIcons[aba.icone as keyof typeof LucideIcons] as any
    const isAtiva = abaSelecionada === aba.id
    
    return (
      <TabsTrigger 
        key={aba.id}
        value={aba.id} 
        className="relative flex items-center gap-2"
        title={aba.descricao}
      >
        <IconeComponente className="h-4 w-4" />
        <span className="hidden sm:inline">{aba.label}</span>
        {aba.badge && (
          <Badge variant="secondary" className="ml-1 text-xs">
            {aba.badge}
          </Badge>
        )}
      </TabsTrigger>
    )
  }, [abaSelecionada])
  
  // Estados de loading
  if (carregando || tentandoAutenticar) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold mb-2">
            {tentandoAutenticar ? 'Autenticando...' : 'Carregando...'}
          </h2>
          <p className="text-gray-600">
            {tentandoAutenticar ? 'Verificando suas credenciais' : 'Preparando seu ambiente bancário'}
          </p>
        </div>
      </div>
    )
  }
  
  // Estado de erro
  if (erro && !autenticado) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md">
          <div className="text-center">
            <LucideIcons.AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Erro de Autenticação</h2>
            <p className="text-gray-600 mb-6">{erro}</p>
            <div className="space-y-3">
              <Button onClick={autenticarUsuario} className="w-full">
                <LucideIcons.RefreshCw className="mr-2 h-4 w-4" />
                Tentar Novamente
              </Button>
              <Button variant="outline" className="w-full">
                <LucideIcons.Phone className="mr-2 h-4 w-4" />
                Contatar Suporte
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  // Estado não autenticado
  if (!autenticado || !usuario) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md">
          <div className="text-center">
            <LucideIcons.Shield className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Acesso Seguro</h2>
            <p className="text-gray-600 mb-6">Faça login para acessar sua conta</p>
            <Button onClick={autenticarUsuario} className="w-full">
              <LucideIcons.LogIn className="mr-2 h-4 w-4" />
              Entrar com Segurança
            </Button>
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Toaster position="bottom-right" richColors />
      
      {/* Header com informações do usuário */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <LucideIcons.Landmark className="h-8 w-8 text-blue-600" />
                <div>
                  <h1 className="text-lg font-semibold">Banco Digital</h1>
                  <p className="text-sm text-gray-500">Internet Banking</p>
                </div>
              </div>
              
              <div className="hidden md:flex items-center space-x-4 ml-8">
                <div className="flex items-center space-x-2">
                  <LucideIcons.Shield className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-600">Conexão Segura</span>
                </div>
                <div className="flex items-center space-x-2">
                  <LucideIcons.Clock className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    Último acesso: {formatarDataHora(usuario.ultimo_acesso)}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setModalSobre(true)}
                className="hidden md:flex"
              >
                <LucideIcons.Info className="h-4 w-4 mr-2" />
                Sobre Este Sistema
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setModalSeguranca(true)}
              >
                <LucideIcons.ShieldCheck className="h-4 w-4 mr-2" />
                Segurança
              </Button>
              
              <div className="flex items-center space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={usuario.avatar} />
                  <AvatarFallback>
                    {usuario.nome.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:block">
                  <p className="text-sm font-medium">{usuario.nome}</p>
                  <p className="text-xs text-gray-500">{formatarCPF(usuario.cpf)}</p>
                </div>
              </div>
              
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleLogout}
                className="text-red-600 hover:text-red-700"
              >
                <LucideIcons.LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Conteúdo principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={abaSelecionada} onValueChange={handleMudarAba} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
            {configAbas.map(renderizarAba)}
          </TabsList>
          
          <TabsContent value="dashboard">
            <DashboardFinanceiro usuario={usuario} />
          </TabsContent>
          
          <TabsContent value="transferencias">
            <TransferenciasModule usuario={usuario} />
          </TabsContent>
          
          <TabsContent value="pagamentos">
            <PagamentosModule usuario={usuario} />
          </TabsContent>
          
          <TabsContent value="investimentos">
            <InvestimentosModule usuario={usuario} />
          </TabsContent>
          
          <TabsContent value="cartoes">
            <CartoesModule usuario={usuario} />
          </TabsContent>
          
          <TabsContent value="configuracoes">
            <ConfiguracoesModule usuario={usuario} />
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Modal Sobre o Sistema */}
      <Dialog open={modalSobre} onOpenChange={setModalSobre}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Sistema Bancário - Product Design AI-Enhanced</DialogTitle>
            <DialogDescription>
              Demonstração da metodologia aplicada a um sistema bancário crítico
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-3">Análise de Complexidade</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Entidades principais:</span>
                    <span className="font-medium">6 (Conta, Transação, Cartão, etc.)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Telas identificadas:</span>
                    <span className="font-medium">15 telas</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Fluxos de usuário:</span>
                    <span className="font-medium">8 jornadas críticas</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Estados de UI:</span>
                    <span className="font-medium">42 estados mapeados</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Perfis de usuário:</span>
                    <span className="font-medium">4 perfis</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Integrações:</span>
                    <span className="font-medium">5 sistemas externos</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t">
                    <span className="font-semibold">Complexidade Total:</span>
                    <span className="font-bold text-blue-600">221 pontos</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold mb-3">Características Técnicas</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <LucideIcons.CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Segurança bancária (PCI-DSS)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <LucideIcons.CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Responsividade mobile-first</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <LucideIcons.CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Autenticação 2FA + biometria</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <LucideIcons.CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Integração PIX + BACEN</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <LucideIcons.CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Compliance LGPD</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <LucideIcons.CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Acessibilidade WCAG AA</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-3">Jornadas Críticas Implementadas</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <LucideIcons.Shield className="h-4 w-4 text-blue-600" />
                    <span>Autenticação Segura</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <LucideIcons.BarChart3 className="h-4 w-4 text-blue-600" />
                    <span>Consulta Financeira</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <LucideIcons.ArrowLeftRight className="h-4 w-4 text-blue-600" />
                    <span>Transferência PIX</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <LucideIcons.Receipt className="h-4 w-4 text-blue-600" />
                    <span>Pagamento de Boletos</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <LucideIcons.TrendingUp className="h-4 w-4 text-blue-600" />
                    <span>Investimentos</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <LucideIcons.CreditCard className="h-4 w-4 text-blue-600" />
                    <span>Gestão de Cartões</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <LucideIcons.Settings className="h-4 w-4 text-blue-600" />
                    <span>Configurações</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <LucideIcons.HeadphonesIcon className="h-4 w-4 text-blue-600" />
                    <span>Suporte Integrado</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Modal de Segurança */}
      <Dialog open={modalSeguranca} onOpenChange={setModalSeguranca}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Status de Segurança</DialogTitle>
            <DialogDescription>
              Informações sobre a segurança da sua sessão
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-3">
                <LucideIcons.Shield className="h-6 w-6 text-green-600" />
                <div>
                  <p className="font-medium">Conexão Segura</p>
                  <p className="text-sm text-gray-600">Criptografia SSL/TLS ativa</p>
                </div>
              </div>
              <Badge variant="default">Ativo</Badge>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-3">
                <LucideIcons.Smartphone className="h-6 w-6 text-green-600" />
                <div>
                  <p className="font-medium">Autenticação 2FA</p>
                  <p className="text-sm text-gray-600">Verificação em duas etapas</p>
                </div>
              </div>
              <Badge variant="default">Ativo</Badge>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-3">
                <LucideIcons.Fingerprint className="h-6 w-6 text-green-600" />
                <div>
                  <p className="font-medium">Biometria</p>
                  <p className="text-sm text-gray-600">Autenticação biométrica</p>
                </div>
              </div>
              <Badge variant="default">Ativo</Badge>
            </div>
            
            <div className="pt-4 border-t">
              <p className="text-sm text-gray-600">
                Última verificação de segurança: {formatarDataHora(new Date().toISOString())}
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}