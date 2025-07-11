// src/app/showcase/ecommerce-dashboard/dashboard-overview.tsx
'use client'

import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react'
import { toast } from 'sonner'
import * as LucideIcons from 'lucide-react'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

// Funções utilitárias defensivas
const formatarMoeda = (valor: number | undefined): string => {
  if (valor === undefined || valor === null || isNaN(valor)) return 'R$ 0,00';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(valor);
};

const formatarNumero = (numero: number | undefined): string => {
  if (numero === undefined || numero === null || isNaN(numero)) return '0';
  return new Intl.NumberFormat('pt-BR').format(numero);
};

const calcularVariacao = (atual: number, anterior: number): { percentual: number; tipo: 'positiva' | 'negativa' | 'neutra' } => {
  if (!atual || !anterior) return { percentual: 0, tipo: 'neutra' };
  
  const variacao = ((atual - anterior) / anterior) * 100;
  const tipo = variacao > 0 ? 'positiva' : variacao < 0 ? 'negativa' : 'neutra';
  
  return { percentual: Math.abs(variacao), tipo };
};

const formatarPorcentagem = (valor: number): string => {
  return `${valor.toFixed(1)}%`;
};

interface DashboardOverviewProps {
  dados: any;
  periodo: string;
  carregando?: boolean;
  onRecarregar: () => void;
}

interface MetricaCard {
  titulo: string;
  valor: string;
  variacao?: { percentual: number; tipo: 'positiva' | 'negativa' | 'neutra' };
  icone: string;
  cor: 'blue' | 'green' | 'orange' | 'purple';
}

export default function DashboardOverview({ dados, periodo, carregando, onRecarregar }: DashboardOverviewProps) {
  const montadoRef = useRef(true);
  
  useEffect(() => {
    montadoRef.current = true;
    return () => { montadoRef.current = false; };
  }, []);

  // Métricas principais calculadas
  const metricas = useMemo((): MetricaCard[] => {
    if (!dados) return [];

    const variacaoVendas = calcularVariacao(dados.vendas?.totalMes || 0, dados.vendas?.totalMesAnterior || 0);
    
    return [
      {
        titulo: 'Vendas do Mês',
        valor: formatarMoeda(dados.vendas?.totalMes),
        variacao: variacaoVendas,
        icone: 'TrendingUp',
        cor: 'green'
      },
      {
        titulo: 'Pedidos Hoje',
        valor: formatarNumero(dados.pedidos?.totalHoje),
        icone: 'ShoppingCart',
        cor: 'blue'
      },
      {
        titulo: 'Produtos Ativos',
        valor: formatarNumero(dados.produtos?.totalAtivos),
        icone: 'Package',
        cor: 'purple'
      },
      {
        titulo: 'Clientes Ativos',
        valor: formatarNumero(dados.clientes?.totalAtivos),
        icone: 'Users',
        cor: 'orange'
      }
    ];
  }, [dados]);

  // Status dos pedidos para gráfico de rosca
  const statusPedidos = useMemo(() => {
    if (!dados?.pedidos) return [];

    const total = dados.pedidos.pendentes + dados.pedidos.processando + dados.pedidos.enviados + dados.pedidos.entregues;
    
    return [
      {
        status: 'Pendentes',
        quantidade: dados.pedidos.pendentes,
        porcentagem: total > 0 ? (dados.pedidos.pendentes / total) * 100 : 0,
        cor: 'bg-red-500'
      },
      {
        status: 'Processando',
        quantidade: dados.pedidos.processando,
        porcentagem: total > 0 ? (dados.pedidos.processando / total) * 100 : 0,
        cor: 'bg-yellow-500'
      },
      {
        status: 'Enviados',
        quantidade: dados.pedidos.enviados,
        porcentagem: total > 0 ? (dados.pedidos.enviados / total) * 100 : 0,
        cor: 'bg-blue-500'
      },
      {
        status: 'Entregues',
        quantidade: dados.pedidos.entregues,
        porcentagem: total > 0 ? (dados.pedidos.entregues / total) * 100 : 0,
        cor: 'bg-green-500'
      }
    ];
  }, [dados]);

  // Alertas e notificações
  const alertas = useMemo(() => {
    if (!dados) return [];

    const alertasList = [];

    if (dados.produtos?.estoqueMinimo > 0) {
      alertasList.push({
        tipo: 'warning' as const,
        titulo: 'Estoque Baixo',
        descricao: `${dados.produtos.estoqueMinimo} produtos com estoque baixo`,
        acao: 'Verificar Produtos'
      });
    }

    if (dados.produtos?.semEstoque > 0) {
      alertasList.push({
        tipo: 'error' as const,
        titulo: 'Produtos Esgotados',
        descricao: `${dados.produtos.semEstoque} produtos sem estoque`,
        acao: 'Reabastecer'
      });
    }

    if (dados.pedidos?.pendentes > 20) {
      alertasList.push({
        tipo: 'info' as const,
        titulo: 'Muitos Pedidos Pendentes',
        descricao: `${dados.pedidos.pendentes} pedidos aguardando processamento`,
        acao: 'Processar Pedidos'
      });
    }

    return alertasList;
  }, [dados]);

  // Renderizar métrica individual
  const renderizarMetrica = useCallback((metrica: MetricaCard) => {
    const IconeComponente = LucideIcons[metrica.icone as keyof typeof LucideIcons] as any;
    
    const coresIcone = {
      blue: 'text-blue-600 bg-blue-100',
      green: 'text-green-600 bg-green-100',
      orange: 'text-orange-600 bg-orange-100',
      purple: 'text-purple-600 bg-purple-100'
    };

    return (
      <Card key={metrica.titulo} className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 mb-1">{metrica.titulo}</p>
              <p className="text-2xl font-bold text-gray-900">{metrica.valor}</p>
              
              {metrica.variacao && (
                <div className="flex items-center mt-2">
                  {metrica.variacao.tipo === 'positiva' ? (
                    <LucideIcons.TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                  ) : metrica.variacao.tipo === 'negativa' ? (
                    <LucideIcons.TrendingDown className="h-4 w-4 text-red-600 mr-1" />
                  ) : (
                    <LucideIcons.Minus className="h-4 w-4 text-gray-400 mr-1" />
                  )}
                  <span className={`text-sm font-medium ${
                    metrica.variacao.tipo === 'positiva' ? 'text-green-600' :
                    metrica.variacao.tipo === 'negativa' ? 'text-red-600' : 'text-gray-500'
                  }`}>
                    {formatarPorcentagem(metrica.variacao.percentual)}
                  </span>
                  <span className="text-sm text-gray-500 ml-1">vs mês anterior</span>
                </div>
              )}
            </div>
            
            <div className={`p-3 rounded-full ${coresIcone[metrica.cor]}`}>
              <IconeComponente className="h-6 w-6" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }, []);

  // Estado de loading
  if (carregando) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                    <div className="h-8 bg-gray-200 rounded w-32"></div>
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                  </div>
                  <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
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
      {/* Métricas Principais */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Visão Geral</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {metricas.map(renderizarMetrica)}
        </div>
      </div>

      {/* Status dos Pedidos e Alertas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status dos Pedidos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LucideIcons.PieChart className="h-5 w-5" />
              Status dos Pedidos
            </CardTitle>
            <CardDescription>
              Distribuição atual dos pedidos por status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {statusPedidos.map(item => (
                <div key={item.status}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${item.cor}`}></div>
                      <span className="text-sm font-medium">{item.status}</span>
                    </div>
                    <span className="text-sm text-gray-600">
                      {item.quantidade} ({formatarPorcentagem(item.porcentagem)})
                    </span>
                  </div>
                  <Progress value={item.porcentagem} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Alertas e Notificações */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LucideIcons.Bell className="h-5 w-5" />
              Alertas
              {alertas.length > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {alertas.length}
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Notificações importantes que precisam de atenção
            </CardDescription>
          </CardHeader>
          <CardContent>
            {alertas.length === 0 ? (
              <div className="text-center py-8">
                <LucideIcons.CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                <p className="text-gray-500">Tudo certo! Nenhum alerta no momento.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {alertas.map((alerta, index) => {
                  const icones = {
                    warning: { icone: 'AlertTriangle', cor: 'text-yellow-600 bg-yellow-100' },
                    error: { icone: 'XCircle', cor: 'text-red-600 bg-red-100' },
                    info: { icone: 'Info', cor: 'text-blue-600 bg-blue-100' }
                  };
                  
                  const config = icones[alerta.tipo];
                  const IconeComponente = LucideIcons[config.icone as keyof typeof LucideIcons] as any;
                  
                  return (
                    <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className={`p-1.5 rounded-full ${config.cor}`}>
                        <IconeComponente className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{alerta.titulo}</p>
                        <p className="text-sm text-gray-600">{alerta.descricao}</p>
                      </div>
                      <Button variant="outline" size="sm">
                        {alerta.acao}
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Atividade Recente */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LucideIcons.Activity className="h-5 w-5" />
            Atividade Recente
          </CardTitle>
          <CardDescription>
            Últimas atividades importantes na sua loja
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              {
                acao: 'Novo pedido recebido',
                detalhes: 'Pedido #1245 - R$ 459,90',
                tempo: 'há 5 minutos',
                icone: 'ShoppingCart',
                cor: 'text-green-600'
              },
              {
                acao: 'Produto com estoque baixo',
                detalhes: 'Smartphone Galaxy S23 - 3 unidades restantes',
                tempo: 'há 15 minutos',
                icone: 'AlertTriangle',
                cor: 'text-yellow-600'
              },
              {
                acao: 'Pedido enviado',
                detalhes: 'Pedido #1243 enviado via Correios',
                tempo: 'há 32 minutos',
                icone: 'Truck',
                cor: 'text-blue-600'
              },
              {
                acao: 'Cliente cadastrado',
                detalhes: 'Novo cliente: João Silva',
                tempo: 'há 1 hora',
                icone: 'UserPlus',
                cor: 'text-purple-600'
              },
              {
                acao: 'Produto adicionado',
                detalhes: 'Notebook Dell Inspiron 15',
                tempo: 'há 2 horas',
                icone: 'Package',
                cor: 'text-indigo-600'
              }
            ].map((atividade, index) => {
              const IconeComponente = LucideIcons[atividade.icone as keyof typeof LucideIcons] as any;
              
              return (
                <div key={index} className="flex items-center gap-3 py-2">
                  <div className="flex-shrink-0">
                    <IconeComponente className={`h-5 w-5 ${atividade.cor}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{atividade.acao}</p>
                    <p className="text-sm text-gray-500">{atividade.detalhes}</p>
                  </div>
                  <div className="flex-shrink-0">
                    <span className="text-xs text-gray-400">{atividade.tempo}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Ações Rápidas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LucideIcons.Zap className="h-5 w-5" />
            Ações Rápidas
          </CardTitle>
          <CardDescription>
            Acesso rápido às principais funcionalidades
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Adicionar Produto', icone: 'Plus', cor: 'bg-blue-500 hover:bg-blue-600' },
              { label: 'Processar Pedidos', icone: 'PlayCircle', cor: 'bg-green-500 hover:bg-green-600' },
              { label: 'Ver Relatórios', icone: 'BarChart3', cor: 'bg-purple-500 hover:bg-purple-600' },
              { label: 'Configurações', icone: 'Settings', cor: 'bg-gray-500 hover:bg-gray-600' }
            ].map(acao => {
              const IconeComponente = LucideIcons[acao.icone as keyof typeof LucideIcons] as any;
              
              return (
                <Button
                  key={acao.label}
                  variant="outline"
                  className="h-20 flex-col gap-2 hover:shadow-md transition-all"
                  onClick={() => toast.info(`Redirecionando para ${acao.label}`)}
                >
                  <IconeComponente className="h-6 w-6" />
                  <span className="text-xs font-medium">{acao.label}</span>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}