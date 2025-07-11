// src/app/showcase/ecommerce-dashboard/pedidos-gestao.tsx
'use client'

import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react'
import { toast } from 'sonner'
import * as LucideIcons from 'lucide-react'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"

// Funções utilitárias defensivas
const formatarMoeda = (valor: number | undefined): string => {
  if (valor === undefined || valor === null || isNaN(valor)) return 'R$ 0,00';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(valor);
};

const formatarDataRelativa = (dataString: string): string => {
  try {
    const data = new Date(dataString);
    const agora = new Date();
    const diferenca = agora.getTime() - data.getTime();
    const dias = Math.floor(diferenca / (1000 * 60 * 60 * 24));
    
    if (dias === 0) return 'Hoje';
    if (dias === 1) return 'Ontem';
    if (dias < 7) return `${dias} dias atrás`;
    return data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  } catch {
    return 'Data inválida';
  }
};

const formatarStatusVisual = (status: string) => {
  const configs = {
    'pendente': { 
      label: 'Pendente', 
      variant: 'destructive' as const, 
      icone: 'Clock',
      cor: 'text-red-600 bg-red-100'
    },
    'processando': { 
      label: 'Processando', 
      variant: 'secondary' as const, 
      icone: 'Loader2',
      cor: 'text-yellow-600 bg-yellow-100'
    },
    'enviado': { 
      label: 'Enviado', 
      variant: 'outline' as const, 
      icone: 'Truck',
      cor: 'text-blue-600 bg-blue-100'
    },
    'entregue': { 
      label: 'Entregue', 
      variant: 'default' as const, 
      icone: 'CheckCircle',
      cor: 'text-green-600 bg-green-100'
    }
  };
  
  return configs[status as keyof typeof configs] || configs.pendente;
};

interface PedidosGestaoProps {
  dados: any;
  periodo: string;
  carregando?: boolean;
  onRecarregar: () => void;
}

export default function PedidosGestao({ dados, periodo, carregando, onRecarregar }: PedidosGestaoProps) {
  // Estados para gestão de pedidos
  const [filtros, setFiltros] = useState({
    busca: '',
    status: 'todos',
    periodo: '7d'
  });
  
  const [selecionados, setSelecionados] = useState<string[]>([]);
  const [modalAcao, setModalAcao] = useState<{ tipo: string; pedidos: string[] } | null>(null);
  const [processandoAcao, setProcessandoAcao] = useState(false);
  const [visualizacao, setVisualizacao] = useState<'lista' | 'kanban'>('lista');

  const montadoRef = useRef(true);
  
  useEffect(() => {
    montadoRef.current = true;
    return () => { montadoRef.current = false; };
  }, []);

  // Pedidos filtrados
  const pedidosFiltrados = useMemo(() => {
    if (!dados?.pedidosRecentes) return [];

    return dados.pedidosRecentes.filter((pedido: any) => {
      const matchBusca = !filtros.busca || 
        pedido.id.toLowerCase().includes(filtros.busca.toLowerCase()) ||
        pedido.cliente.toLowerCase().includes(filtros.busca.toLowerCase());
      
      const matchStatus = filtros.status === 'todos' || pedido.status === filtros.status;
      
      return matchBusca && matchStatus;
    });
  }, [dados?.pedidosRecentes, filtros]);

  // Estatísticas dos pedidos
  const estatisticas = useMemo(() => {
    if (!dados?.pedidosRecentes) return null;

    const pedidos = dados.pedidosRecentes;
    const total = pedidos.length;
    const valorTotal = pedidos.reduce((acc: number, p: any) => acc + (p.valor || 0), 0);
    const ticketMedio = total > 0 ? valorTotal / total : 0;

    const porStatus = pedidos.reduce((acc: any, pedido: any) => {
      acc[pedido.status] = (acc[pedido.status] || 0) + 1;
      return acc;
    }, {});

    return {
      total,
      valorTotal,
      ticketMedio,
      porStatus
    };
  }, [dados?.pedidosRecentes]);

  // Colunas do Kanban
  const colunasKanban = useMemo(() => {
    const colunas = [
      { id: 'pendente', titulo: 'Pendentes', cor: 'border-red-200 bg-red-50' },
      { id: 'processando', titulo: 'Processando', cor: 'border-yellow-200 bg-yellow-50' },
      { id: 'enviado', titulo: 'Enviados', cor: 'border-blue-200 bg-blue-50' },
      { id: 'entregue', titulo: 'Entregues', cor: 'border-green-200 bg-green-50' }
    ];

    return colunas.map(coluna => ({
      ...coluna,
      pedidos: pedidosFiltrados.filter((p: { status: string }) => p.status === coluna.id)
    }));
  }, [pedidosFiltrados]);

  // Handlers para ações em lote
  const handleSelecionarTodos = useCallback(() => {
    if (selecionados.length === pedidosFiltrados.length) {
      setSelecionados([]);
    } else {
      setSelecionados(pedidosFiltrados.map((p: { id: any }) => p.id));
    }
  }, [selecionados.length, pedidosFiltrados]);

  const handleSelecionarPedido = useCallback((pedidoId: string) => {
    setSelecionados(prev => 
      prev.includes(pedidoId) 
        ? prev.filter(id => id !== pedidoId)
        : [...prev, pedidoId]
    );
  }, []);

  const handleAcaoLote = useCallback(async (tipo: string) => {
    if (selecionados.length === 0) return;

    setModalAcao({ tipo, pedidos: selecionados });
  }, [selecionados]);

  const confirmarAcaoLote = useCallback(async () => {
    if (!modalAcao || !montadoRef.current) return;

    setProcessandoAcao(true);

    try {
      // Simulação de API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success(`${modalAcao.tipo} executado em ${modalAcao.pedidos.length} pedidos`);
      setSelecionados([]);
      setModalAcao(null);
      onRecarregar();
    } catch (error) {
      toast.error(`Erro ao executar ${modalAcao.tipo}`);
    } finally {
      if (montadoRef.current) {
        setProcessandoAcao(false);
      }
    }
  }, [modalAcao, onRecarregar]);

  // Renderizar pedido individual
  const renderizarPedido = useCallback((pedido: any, kanban = false) => {
    const statusConfig = formatarStatusVisual(pedido.status);
    const IconeStatus = LucideIcons[statusConfig.icone as keyof typeof LucideIcons] as any;

    const cardClass = kanban 
      ? "p-3 bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
      : "p-4 bg-white border rounded-lg hover:shadow-md transition-shadow";

    return (
      <div key={pedido.id} className={cardClass}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {!kanban && (
              <Checkbox
                checked={selecionados.includes(pedido.id)}
                onCheckedChange={() => handleSelecionarPedido(pedido.id)}
              />
            )}
            <span className="font-medium text-sm">{pedido.id}</span>
          </div>
          <Badge variant={statusConfig.variant}>
            <IconeStatus className="h-3 w-3 mr-1" />
            {statusConfig.label}
          </Badge>
        </div>
        
        <div className="space-y-1">
          <p className="font-medium text-gray-900">{pedido.cliente}</p>
          <p className="text-lg font-bold text-green-600">{formatarMoeda(pedido.valor)}</p>
          <p className="text-xs text-gray-500">{formatarDataRelativa(pedido.data)}</p>
        </div>

        {!kanban && (
          <div className="flex items-center gap-2 mt-3">
            <Button variant="outline" size="sm">
              <LucideIcons.Eye className="h-3 w-3 mr-1" />
              Ver
            </Button>
            <Button variant="outline" size="sm">
              <LucideIcons.Edit className="h-3 w-3 mr-1" />
              Editar
            </Button>
          </div>
        )}
      </div>
    );
  }, [selecionados, handleSelecionarPedido]);

  // Estado de loading
  if (carregando) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                  <div className="h-8 bg-gray-200 rounded w-32"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Estatísticas de Pedidos */}
      {estatisticas && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Gestão de Pedidos</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total de Pedidos</p>
                    <p className="text-2xl font-bold text-gray-900">{estatisticas.total}</p>
                  </div>
                  <LucideIcons.ShoppingCart className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Valor Total</p>
                    <p className="text-2xl font-bold text-gray-900">{formatarMoeda(estatisticas.valorTotal)}</p>
                  </div>
                  <LucideIcons.DollarSign className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Ticket Médio</p>
                    <p className="text-2xl font-bold text-gray-900">{formatarMoeda(estatisticas.ticketMedio)}</p>
                  </div>
                  <LucideIcons.TrendingUp className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pendentes</p>
                    <p className="text-2xl font-bold text-red-600">{estatisticas.porStatus.pendente || 0}</p>
                  </div>
                  <LucideIcons.Clock className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Controles e Filtros */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <LucideIcons.Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por ID ou cliente..."
                  value={filtros.busca}
                  onChange={(e) => setFiltros(prev => ({ ...prev, busca: e.target.value }))}
                  className="pl-9"
                />
              </div>
              
              <Select
                value={filtros.status}
                onValueChange={(valor) => setFiltros(prev => ({ ...prev, status: valor }))}
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos Status</SelectItem>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="processando">Processando</SelectItem>
                  <SelectItem value="enviado">Enviado</SelectItem>
                  <SelectItem value="entregue">Entregue</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              {/* Ações em lote */}
              {selecionados.length > 0 && (
                <div className="flex items-center gap-2 mr-4">
                  <Badge variant="secondary">
                    {selecionados.length} selecionados
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAcaoLote('processar')}
                  >
                    <LucideIcons.Play className="h-4 w-4 mr-1" />
                    Processar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAcaoLote('enviar')}
                  >
                    <LucideIcons.Truck className="h-4 w-4 mr-1" />
                    Enviar
                  </Button>
                </div>
              )}

              {/* Toggle de visualização */}
              <div className="flex items-center gap-1 border rounded-lg p-1">
                <Button
                  variant={visualizacao === 'lista' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setVisualizacao('lista')}
                >
                  <LucideIcons.List className="h-4 w-4" />
                </Button>
                <Button
                  variant={visualizacao === 'kanban' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setVisualizacao('kanban')}
                >
                  <LucideIcons.Columns className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista/Kanban de Pedidos */}
      {pedidosFiltrados.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <LucideIcons.Inbox className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum pedido encontrado</h3>
            <p className="text-gray-500">
              {filtros.busca || filtros.status !== 'todos' 
                ? 'Nenhum pedido corresponde aos filtros aplicados.' 
                : 'Não há pedidos no período selecionado.'
              }
            </p>
          </CardContent>
        </Card>
      ) : visualizacao === 'lista' ? (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Lista de Pedidos ({pedidosFiltrados.length})</CardTitle>
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={selecionados.length === pedidosFiltrados.length && pedidosFiltrados.length > 0}
                  onCheckedChange={handleSelecionarTodos}
                />
                <span className="text-sm text-gray-600">Selecionar todos</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pedidosFiltrados.map((pedido: any) => renderizarPedido(pedido, false))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {colunasKanban.map(coluna => (
            <Card key={coluna.id} className={`${coluna.cor} border-2`}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center justify-between">
                  {coluna.titulo}
                  <Badge variant="outline">
                    {coluna.pedidos.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {coluna.pedidos.map((pedido: any) => renderizarPedido(pedido, true))}
                {coluna.pedidos.length === 0 && (
                  <div className="text-center py-8 text-gray-500 text-sm">
                    Nenhum pedido {coluna.titulo.toLowerCase()}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal de confirmação para ações em lote */}
      {modalAcao && (
        <Dialog open={true} onOpenChange={() => !processandoAcao && setModalAcao(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmar Ação em Lote</DialogTitle>
              <DialogDescription>
                Você está prestes a {modalAcao.tipo} {modalAcao.pedidos.length} pedidos selecionados.
                Esta ação não pode ser desfeita. Deseja continuar?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setModalAcao(null)}
                disabled={processandoAcao}
              >
                Cancelar
              </Button>
              <Button 
                onClick={confirmarAcaoLote}
                disabled={processandoAcao}
              >
                {processandoAcao ? (
                  <>
                    <LucideIcons.Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processando...
                  </>
                ) : (
                  `Confirmar ${modalAcao.tipo}`
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}