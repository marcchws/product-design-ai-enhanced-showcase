'use client'

import React, { useState, useCallback, useEffect, useRef } from 'react'
import { toast } from 'sonner'
import * as LucideIcons from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface DashboardProps {
  usuario: any
}

interface Transacao {
  id: string
  tipo: 'transferencia' | 'pagamento' | 'deposito' | 'saque' | 'investimento'
  descricao: string
  valor: number
  data: string
  status: 'concluida' | 'pendente' | 'cancelada'
  conta_origem?: string
  conta_destino?: string
  categoria: string
}

interface Resumo {
  saldo_total: number
  receitas_mes: number
  despesas_mes: number
  investimentos_total: number
  cartoes_limite_usado: number
  cartoes_limite_total: number
}

const transacoesMock: Transacao[] = [
  {
    id: '1',
    tipo: 'transferencia',
    descricao: 'PIX para João Silva',
    valor: -250.00,
    data: '2024-12-29T08:30:00Z',
    status: 'concluida',
    categoria: 'Transferência'
  },
  {
    id: '2',
    tipo: 'pagamento',
    descricao: 'Pagamento de boleto - Energia',
    valor: -185.50,
    data: '2024-12-28T14:15:00Z',
    status: 'concluida',
    categoria: 'Utilidades'
  },
  {
    id: '3',
    tipo: 'deposito',
    descricao: 'Depósito em conta',
    valor: 1500.00,
    data: '2024-12-27T10:00:00Z',
    status: 'concluida',
    categoria: 'Depósito'
  },
  {
    id: '4',
    tipo: 'investimento',
    descricao: 'Aplicação CDB',
    valor: -800.00,
    data: '2024-12-26T16:45:00Z',
    status: 'concluida',
    categoria: 'Investimento'
  },
  {
    id: '5',
    tipo: 'pagamento',
    descricao: 'Cartão de Crédito - Fatura',
    valor: -950.75,
    data: '2024-12-25T11:20:00Z',
    status: 'pendente',
    categoria: 'Cartão'
  }
]

const resumoMock: Resumo = {
  saldo_total: 24250.75,
  receitas_mes: 3200.00,
  despesas_mes: 2180.25,
  investimentos_total: 15600.00,
  cartoes_limite_usado: 1250.00,
  cartoes_limite_total: 5000.00
}

export default function DashboardFinanceiro({ usuario }: DashboardProps) {
  const [transacoes, setTransacoes] = useState<Transacao[]>([])
  const [resumo, setResumo] = useState<Resumo | null>(null)
  const [carregandoResumo, setCarregandoResumo] = useState(true)
  const [carregandoTransacoes, setCarregandoTransacoes] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const [periodo, setPeriodo] = useState('30')
  const [tipoTransacao, setTipoTransacao] = useState('todas')
  
  const montadoRef = useRef(true)
  
  useEffect(() => {
    montadoRef.current = true
    return () => { montadoRef.current = false }
  }, [])
  
  const formatarMoeda = useCallback((valor: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor)
  }, [])
  
  const formatarDataRelativa = useCallback((dataString: string): string => {
    const data = new Date(dataString)
    const agora = new Date()
    const diferenca = agora.getTime() - data.getTime()
    const dias = Math.floor(diferenca / (1000 * 60 * 60 * 24))
    
    if (dias === 0) return 'Hoje'
    if (dias === 1) return 'Ontem'
    if (dias < 7) return `${dias} dias atrás`
    
    return data.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit'
    })
  }, [])
  
  const obterIconeTransacao = useCallback((tipo: string) => {
    switch (tipo) {
      case 'transferencia':
        return { icone: 'ArrowLeftRight', cor: 'text-blue-600' }
      case 'pagamento':
        return { icone: 'Receipt', cor: 'text-orange-600' }
      case 'deposito':
        return { icone: 'Plus', cor: 'text-green-600' }
      case 'saque':
        return { icone: 'Minus', cor: 'text-red-600' }
      case 'investimento':
        return { icone: 'TrendingUp', cor: 'text-purple-600' }
      default:
        return { icone: 'Circle', cor: 'text-gray-600' }
    }
  }, [])
  
  const obterStatusTransacao = useCallback((status: string) => {
    switch (status) {
      case 'concluida':
        return { texto: 'Concluída', cor: 'text-green-600', badge: 'default' as const }
      case 'pendente':
        return { texto: 'Pendente', cor: 'text-yellow-600', badge: 'secondary' as const }
      case 'cancelada':
        return { texto: 'Cancelada', cor: 'text-red-600', badge: 'destructive' as const }
      default:
        return { texto: status, cor: 'text-gray-600', badge: 'outline' as const }
    }
  }, [])
  
  const carregarResumo = useCallback(async () => {
    if (!montadoRef.current) return
    
    setCarregandoResumo(true)
    setErro(null)
    
    const timeoutId = setTimeout(() => {
      if (montadoRef.current) {
        setCarregandoResumo(false)
        setErro('Tempo de carregamento excedido')
      }
    }, 8000)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      if (montadoRef.current) {
        setResumo(resumoMock)
      }
    } catch (error) {
      console.error('Erro ao carregar resumo:', error)
      if (montadoRef.current) {
        setErro('Falha ao carregar resumo financeiro')
      }
    } finally {
      clearTimeout(timeoutId)
      if (montadoRef.current) {
        setCarregandoResumo(false)
      }
    }
  }, [])
  
  const carregarTransacoes = useCallback(async () => {
    if (!montadoRef.current) return
    
    setCarregandoTransacoes(true)
    
    const timeoutId = setTimeout(() => {
      if (montadoRef.current) {
        setCarregandoTransacoes(false)
        setErro('Tempo de carregamento excedido')
      }
    }, 8000)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1200))
      
      if (montadoRef.current) {
        let transacoesFiltradas = transacoesMock
        
        if (tipoTransacao !== 'todas') {
          transacoesFiltradas = transacoesFiltradas.filter(t => t.tipo === tipoTransacao)
        }
        
        setTransacoes(transacoesFiltradas)
      }
    } catch (error) {
      console.error('Erro ao carregar transações:', error)
      if (montadoRef.current) {
        setErro('Falha ao carregar transações')
      }
    } finally {
      clearTimeout(timeoutId)
      if (montadoRef.current) {
        setCarregandoTransacoes(false)
      }
    }
  }, [tipoTransacao])
  
  useEffect(() => {
    carregarResumo()
    carregarTransacoes()
  }, [carregarResumo, carregarTransacoes])
  
  const handleAtualizarDados = useCallback(() => {
    carregarResumo()
    carregarTransacoes()
    toast.success('Dados atualizados')
  }, [carregarResumo, carregarTransacoes])
  
  if (erro) {
    return (
      <div className="bg-red-50 border border-red-200 p-8 rounded-lg text-center">
        <LucideIcons.AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">Erro ao carregar dashboard</h3>
        <p className="text-gray-700 mb-6">{erro}</p>
        <Button onClick={handleAtualizarDados}>
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
          <h2 className="text-2xl font-bold">Dashboard Financeiro</h2>
          <p className="text-gray-600">Visão geral das suas finanças</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            onClick={handleAtualizarDados}
            disabled={carregandoResumo || carregandoTransacoes}
          >
            <LucideIcons.RefreshCw className="mr-2 h-4 w-4" />
            Atualizar
          </Button>
          <Button>
            <LucideIcons.Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
        </div>
      </div>
      
      {/* Cards de resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Saldo Total</CardTitle>
          </CardHeader>
          <CardContent>
            {carregandoResumo ? (
              <div className="animate-pulse space-y-2">
                <div className="h-8 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            ) : (
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {formatarMoeda(resumo?.saldo_total || 0)}
                </p>
                <p className="text-sm text-gray-500">Todas as contas</p>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Receitas do Mês</CardTitle>
          </CardHeader>
          <CardContent>
            {carregandoResumo ? (
              <div className="animate-pulse space-y-2">
                <div className="h-8 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            ) : (
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {formatarMoeda(resumo?.receitas_mes || 0)}
                </p>
                <p className="text-sm text-gray-500">Dezembro 2024</p>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Despesas do Mês</CardTitle>
          </CardHeader>
          <CardContent>
            {carregandoResumo ? (
              <div className="animate-pulse space-y-2">
                <div className="h-8 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            ) : (
              <div>
                <p className="text-2xl font-bold text-red-600">
                  {formatarMoeda(resumo?.despesas_mes || 0)}
                </p>
                <p className="text-sm text-gray-500">Dezembro 2024</p>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Investimentos</CardTitle>
          </CardHeader>
          <CardContent>
            {carregandoResumo ? (
              <div className="animate-pulse space-y-2">
                <div className="h-8 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            ) : (
              <div>
                <p className="text-2xl font-bold text-blue-600">
                  {formatarMoeda(resumo?.investimentos_total || 0)}
                </p>
                <p className="text-sm text-gray-500">Patrimônio investido</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Contas do usuário */}
      <Card>
        <CardHeader>
          <CardTitle>Suas Contas</CardTitle>
          <CardDescription>Saldos e informações das suas contas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {usuario.contas.map((conta: any) => {
              const statusInfo = obterStatusTransacao(conta.status)
              const IconeConta = conta.tipo === 'corrente' ? LucideIcons.Wallet : LucideIcons.PiggyBank
              
              return (
                <div key={conta.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <IconeConta className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">
                        Conta {conta.tipo === 'corrente' ? 'Corrente' : 'Poupança'}
                      </p>
                      <p className="text-sm text-gray-600">
                        Ag. {conta.agencia} | Conta {conta.numero}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-lg">
                      {formatarMoeda(conta.saldo)}
                    </p>
                    <div className="flex items-center gap-2">
                      <Badge variant={statusInfo.badge}>
                        {statusInfo.texto}
                      </Badge>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
      
      {/* Transações recentes */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Transações Recentes</CardTitle>
              <CardDescription>Últimas movimentações das suas contas</CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <Select value={tipoTransacao} onValueChange={setTipoTransacao}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Tipo de transação" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas as transações</SelectItem>
                  <SelectItem value="transferencia">Transferências</SelectItem>
                  <SelectItem value="pagamento">Pagamentos</SelectItem>
                  <SelectItem value="deposito">Depósitos</SelectItem>
                  <SelectItem value="investimento">Investimentos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {carregandoTransacoes ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="animate-pulse flex items-center space-x-4">
                  <div className="h-12 w-12 bg-gray-200 rounded-lg"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                  <div className="text-right">
                    <div className="h-6 bg-gray-200 rounded w-20 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-16"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : transacoes.length === 0 ? (
            <div className="text-center py-12">
              <LucideIcons.FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Nenhuma transação encontrada</h3>
              <p className="text-gray-500">
                {tipoTransacao === 'todas' 
                  ? 'Não há transações para exibir no momento'
                  : `Não há transações do tipo "${tipoTransacao}" para exibir`
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {transacoes.map((transacao) => {
                const iconeInfo = obterIconeTransacao(transacao.tipo)
                const statusInfo = obterStatusTransacao(transacao.status)
                const IconeTransacao = LucideIcons[iconeInfo.icone as keyof typeof LucideIcons] as any
                
                return (
                  <div key={transacao.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center space-x-4">
                      <div className={`p-2 rounded-lg ${iconeInfo.cor.includes('blue') ? 'bg-blue-100' : 
                        iconeInfo.cor.includes('green') ? 'bg-green-100' : 
                        iconeInfo.cor.includes('red') ? 'bg-red-100' : 
                        iconeInfo.cor.includes('orange') ? 'bg-orange-100' : 
                        iconeInfo.cor.includes('purple') ? 'bg-purple-100' : 'bg-gray-100'}`}>
                        <IconeTransacao className={`h-6 w-6 ${iconeInfo.cor}`} />
                      </div>
                      <div>
                        <p className="font-medium">{transacao.descricao}</p>
                        <p className="text-sm text-gray-600">
                          {transacao.categoria} • {formatarDataRelativa(transacao.data)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${transacao.valor > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {transacao.valor > 0 ? '+' : ''}{formatarMoeda(transacao.valor)}
                      </p>
                      <Badge variant={statusInfo.badge}>
                        {statusInfo.texto}
                      </Badge>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}