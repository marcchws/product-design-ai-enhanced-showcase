'use client'

import React, { useState, useCallback, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { toast } from 'sonner'
import * as LucideIcons from 'lucide-react'

interface PagamentosConveniosProps {
  dados: any
}

export default function PagamentosConvenios({ dados }: PagamentosConveniosProps) {
  const [filtroStatus, setFiltroStatus] = useState('todos')
  const [filtroConvenio, setFiltroConvenio] = useState('todos')
  const [busca, setBusca] = useState('')
  const [carregando, setCarregando] = useState(false)
  
  const [pagamentos] = useState([
    {
      id: '1',
      paciente: 'Maria Silva',
      consulta_data: '2024-01-10',
      valor: 150.00,
      convenio: 'Unimed',
      status: 'pago',
      forma_pagamento: 'Cartão de Crédito',
      data_pagamento: '2024-01-10'
    },
    {
      id: '2',
      paciente: 'João Santos',
      consulta_data: '2024-01-12',
      valor: 200.00,
      convenio: 'Particular',
      status: 'pendente',
      forma_pagamento: 'PIX',
      data_pagamento: null
    },
    {
      id: '3',
      paciente: 'Ana Costa',
      consulta_data: '2024-01-15',
      valor: 180.00,
      convenio: 'Bradesco Saúde',
      status: 'processando',
      forma_pagamento: 'Convênio',
      data_pagamento: null
    }
  ])

  const [estatisticas] = useState({
    faturamento_mes: 15800,
    pagamentos_pendentes: 3,
    taxa_inadimplencia: 2.5,
    receita_media_consulta: 175
  })

  const montadoRef = useRef(true)

  useEffect(() => {
    montadoRef.current = true
    return () => { montadoRef.current = false }
  }, [])

  const pagamentosFiltrados = pagamentos.filter(pagamento => {
    const matchBusca = pagamento.paciente.toLowerCase().includes(busca.toLowerCase())
    const matchStatus = filtroStatus === 'todos' || pagamento.status === filtroStatus
    const matchConvenio = filtroConvenio === 'todos' || pagamento.convenio === filtroConvenio
    
    return matchBusca && matchStatus && matchConvenio
  })

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor)
  }

  const formatarDataContextual = (dataString: string | null) => {
    if (!dataString) return 'N/A'
    const data = new Date(dataString)
    return data.toLocaleDateString('pt-BR')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pago': return 'bg-green-100 text-green-800'
      case 'pendente': return 'bg-yellow-100 text-yellow-800'
      case 'processando': return 'bg-blue-100 text-blue-800'
      case 'cancelado': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusTexto = (status: string) => {
    switch (status) {
      case 'pago': return 'Pago'
      case 'pendente': return 'Pendente'
      case 'processando': return 'Processando'
      case 'cancelado': return 'Cancelado'
      default: return status
    }
  }

  const processarPagamento = useCallback(async (pagamentoId: string) => {
    setCarregando(true)

    try {
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      if (montadoRef.current) {
        toast.success('Pagamento processado com sucesso!')
      }
    } catch (error) {
      if (montadoRef.current) {
        toast.error('Erro ao processar pagamento')
      }
    } finally {
      if (montadoRef.current) {
        setCarregando(false)
      }
    }
  }, [])

  return (
    <div className="space-y-6">
      {/* Estatísticas Financeiras */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <LucideIcons.DollarSign className="h-8 w-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Faturamento Mês</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatarMoeda(estatisticas.faturamento_mes)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <LucideIcons.Clock className="h-8 w-8 text-yellow-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Pendentes</p>
                <p className="text-2xl font-bold text-gray-900">
                  {estatisticas.pagamentos_pendentes}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <LucideIcons.TrendingDown className="h-8 w-8 text-red-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Inadimplência</p>
                <p className="text-2xl font-bold text-gray-900">
                  {estatisticas.taxa_inadimplencia}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <LucideIcons.BarChart3 className="h-8 w-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Ticket Médio</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatarMoeda(estatisticas.receita_media_consulta)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
<div className="relative">
              <LucideIcons.Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar paciente..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select value={filtroStatus} onValueChange={setFiltroStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os Status</SelectItem>
                <SelectItem value="pago">Pago</SelectItem>
                <SelectItem value="pendente">Pendente</SelectItem>
                <SelectItem value="processando">Processando</SelectItem>
                <SelectItem value="cancelado">Cancelado</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filtroConvenio} onValueChange={setFiltroConvenio}>
              <SelectTrigger>
                <SelectValue placeholder="Convênio" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os Convênios</SelectItem>
                <SelectItem value="Particular">Particular</SelectItem>
                <SelectItem value="Unimed">Unimed</SelectItem>
                <SelectItem value="Bradesco Saúde">Bradesco Saúde</SelectItem>
                <SelectItem value="Sul América">Sul América</SelectItem>
              </SelectContent>
            </Select>

            <Button 
              variant="outline" 
              onClick={() => {
                setBusca('')
                setFiltroStatus('todos')
                setFiltroConvenio('todos')
              }}
            >
              <LucideIcons.RefreshCw className="mr-2 h-4 w-4" />
              Limpar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Pagamentos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <LucideIcons.CreditCard className="mr-2 h-5 w-5" />
            Pagamentos e Faturamento
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pagamentosFiltrados.length === 0 ? (
            <div className="text-center py-12">
              <LucideIcons.Inbox className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Nenhum pagamento encontrado</h3>
              <p className="text-gray-500">Nenhum pagamento corresponde aos filtros aplicados.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pagamentosFiltrados.map((pagamento) => (
                <div key={pagamento.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <LucideIcons.User className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium">{pagamento.paciente}</div>
                      <div className="text-sm text-gray-500">
                        Consulta: {formatarDataContextual(pagamento.consulta_data)} • {pagamento.convenio}
                      </div>
                      <div className="text-sm text-gray-500">
                        {pagamento.forma_pagamento}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="font-bold text-lg">{formatarMoeda(pagamento.valor)}</div>
                      <Badge className={getStatusColor(pagamento.status)}>
                        {getStatusTexto(pagamento.status)}
                      </Badge>
                      {pagamento.data_pagamento && (
                        <div className="text-sm text-gray-500 mt-1">
                          Pago em: {formatarDataContextual(pagamento.data_pagamento)}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex space-x-2">
                      {pagamento.status === 'pendente' && (
                        <Button 
                          size="sm" 
                          onClick={() => processarPagamento(pagamento.id)}
                          disabled={carregando}
                        >
                          {carregando ? (
                            <LucideIcons.Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <LucideIcons.CheckCircle className="mr-2 h-4 w-4" />
                              Confirmar
                            </>
                          )}
                        </Button>
                      )}
                      
                      <Button size="sm" variant="outline">
                        <LucideIcons.Eye className="h-4 w-4" />
                      </Button>
                      
                      <Button size="sm" variant="outline">
                        <LucideIcons.Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Relatórios Financeiros */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Faturamento por Convênio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Particular</span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '45%' }}></div>
                  </div>
                  <span className="text-sm font-medium">45%</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span>Unimed</span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: '30%' }}></div>
                  </div>
                  <span className="text-sm font-medium">30%</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span>Bradesco Saúde</span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div className="bg-yellow-600 h-2 rounded-full" style={{ width: '20%' }}></div>
                  </div>
                  <span className="text-sm font-medium">20%</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span>Sul América</span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div className="bg-red-600 h-2 rounded-full" style={{ width: '5%' }}></div>
                  </div>
                  <span className="text-sm font-medium">5%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button className="w-full justify-start" variant="outline">
                <LucideIcons.FileText className="mr-2 h-4 w-4" />
                Gerar Relatório Mensal
              </Button>
              
              <Button className="w-full justify-start" variant="outline">
                <LucideIcons.Download className="mr-2 h-4 w-4" />
                Exportar Pagamentos
              </Button>
              
              <Button className="w-full justify-start" variant="outline">
                <LucideIcons.Bell className="mr-2 h-4 w-4" />
                Enviar Lembretes
              </Button>
              
              <Button className="w-full justify-start" variant="outline">
                <LucideIcons.Settings className="mr-2 h-4 w-4" />
                Configurar Convênios
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}