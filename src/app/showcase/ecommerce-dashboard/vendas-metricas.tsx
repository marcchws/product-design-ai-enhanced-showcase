// src/app/showcase/ecommerce-dashboard/vendas-metricas.tsx
'use client'

import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react'
import { toast } from 'sonner'
import * as LucideIcons from 'lucide-react'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

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

const formatarDataGrafico = (dataString: string): string => {
  try {
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  } catch {
    return 'Data inválida';
  }
};

interface VendasMetricasProps {
  dados: any;
  periodo: string;
  carregando?: boolean;
  onRecarregar: () => void;
}

export default function VendasMetricas({ dados, periodo, carregando, onRecarregar }: VendasMetricasProps) {
  const [visualizacao, setVisualizacao] = useState<'grafico' | 'tabela'>('grafico');
  const [filtroCategoria, setFiltroCategoria] = useState('todas');
  const [ordenacao, setOrdenacao] = useState('receita');
  
  const montadoRef = useRef(true);
  
  useEffect(() => {
    montadoRef.current = true;
    return () => { montadoRef.current = false; };
  }, []);

  // Métricas calculadas de vendas
  const metricas = useMemo(() => {
    if (!dados?.vendasPorDia) return null;

    const vendasTotal = dados.vendasPorDia.reduce((acc: number, dia: any) => acc + (dia.vendas || 0), 0);
    const mediaDiaria = vendasTotal / dados.vendasPorDia.length;
    const menorVenda = Math.min(...dados.vendasPorDia.map((dia: any) => dia.vendas || 0));
    const maiorVenda = Math.max(...dados.vendasPorDia.map((dia: any) => dia.vendas || 0));

    return {
      total: vendasTotal,
      mediaDiaria,
      menorVenda,
      maiorVenda,
      crescimento: vendasTotal > 0 ? ((vendasTotal - vendasTotal * 0.8) / (vendasTotal * 0.8)) * 100 : 0
    };
  }, [dados]);

  // Top produtos ordenados
  const topProdutos = useMemo(() => {
    if (!dados?.topProdutos) return [];

    return [...dados.topProdutos].sort((a, b) => {
      if (ordenacao === 'receita') return b.receita - a.receita;
      if (ordenacao === 'vendas') return b.vendas - a.vendas;
      return a.nome.localeCompare(b.nome);
    });
  }, [dados?.topProdutos, ordenacao]);

  // Dados do gráfico processados
  const dadosGrafico = useMemo(() => {
    if (!dados?.vendasPorDia) return [];
    
    return dados.vendasPorDia.map((dia: any, index: number) => ({
      ...dia,
      dataFormatada: formatarDataGrafico(dia.data),
      tendencia: index > 0 ? dia.vendas - dados.vendasPorDia[index - 1].vendas : 0
    }));
  }, [dados?.vendasPorDia]);

  // Renderizar gráfico simples com CSS
  const renderizarGrafico = useCallback(() => {
    if (!dadosGrafico.length) return null;

    const maxVenda = Math.max(...dadosGrafico.map((d: { vendas: any }) => d.vendas));
    
    return (
      <div className="space-y-4">
        <div className="flex items-end justify-between h-64 bg-gray-50 rounded-lg p-4 gap-1">
          {dadosGrafico.map((dia: { vendas: number | undefined; tendencia: number; dataFormatada: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined }, index: React.Key | null | undefined) => {
            const altura = ((dia.vendas ?? 0) / maxVenda) * 100;
            const cor = dia.tendencia >= 0 ? 'bg-green-500' : 'bg-red-500';
            
            return (
              <div key={index} className="flex-1 flex flex-col items-center group">
                <div 
                  className={`w-full ${cor} rounded-t transition-all hover:opacity-80 cursor-pointer relative`}
                  style={{ height: `${altura}%` }}
                  title={`${dia.dataFormatada}: ${formatarMoeda(dia.vendas)}`}
                >
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {formatarMoeda(dia.vendas)}
                  </div>
                </div>
                <span className="text-xs text-gray-500 mt-1 transform -rotate-45 origin-left">
                  {dia.dataFormatada}
                </span>
              </div>
            );
          })}
        </div>
        
        <div className="flex items-center justify-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span>Crescimento</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span>Queda</span>
          </div>
        </div>
      </div>
    );
  }, [dadosGrafico]);

  // Estado de loading
  if (carregando) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
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
        <Card className="animate-pulse">
          <CardContent className="p-6">
            <div className="h-64 bg-gray-200 rounded"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Métricas de Vendas */}
      {metricas && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Métricas de Vendas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total do Período</p>
                    <p className="text-2xl font-bold text-gray-900">{formatarMoeda(metricas.total)}</p>
                  </div>
                  <LucideIcons.TrendingUp className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Média Diária</p>
                    <p className="text-2xl font-bold text-gray-900">{formatarMoeda(metricas.mediaDiaria)}</p>
                  </div>
                  <LucideIcons.Calendar className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Melhor Dia</p>
                    <p className="text-2xl font-bold text-gray-900">{formatarMoeda(metricas.maiorVenda)}</p>
                  </div>
                  <LucideIcons.Award className="h-8 w-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Crescimento</p>
                    <p className="text-2xl font-bold text-green-600">+{metricas.crescimento.toFixed(1)}%</p>
                  </div>
                  <LucideIcons.ArrowUp className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Gráfico de Vendas */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Vendas por Dia</CardTitle>
              <CardDescription>
                Evolução das vendas nos últimos {periodo}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={visualizacao === 'grafico' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setVisualizacao('grafico')}
              >
                <LucideIcons.BarChart3 className="h-4 w-4 mr-1" />
                Gráfico
              </Button>
              <Button
                variant={visualizacao === 'tabela' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setVisualizacao('tabela')}
              >
                <LucideIcons.Table className="h-4 w-4 mr-1" />
                Tabela
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {visualizacao === 'grafico' ? (
            renderizarGrafico()
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Data</th>
                    <th className="text-right py-2">Vendas</th>
                    <th className="text-right py-2">Tendência</th>
                  </tr>
                </thead>
                <tbody>
                  {dadosGrafico.map((dia: { dataFormatada: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; vendas: number | undefined; tendencia: number | undefined }, index: React.Key | null | undefined) => (
                    <tr key={index} className="border-b">
                      <td className="py-2">{dia.dataFormatada}</td>
                      <td className="py-2 text-right font-medium">{formatarMoeda(dia.vendas)}</td>
                      <td className="py-2 text-right">
                        {(dia.tendencia ?? 0) >= 0 ? (
                          <span className="text-green-600 flex items-center justify-end">
                            <LucideIcons.ArrowUp className="h-3 w-3 mr-1" />
                            {formatarMoeda(dia.tendencia)}
                          </span>
                        ) : (
                          <span className="text-red-600 flex items-center justify-end">
                            <LucideIcons.ArrowDown className="h-3 w-3 mr-1" />
                            {formatarMoeda(Math.abs(dia.tendencia ?? 0))}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top Produtos */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Top Produtos</CardTitle>
              <CardDescription>
                Produtos com melhor performance no período
              </CardDescription>
            </div>
            <Select value={ordenacao} onValueChange={setOrdenacao}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="receita">Receita</SelectItem>
                <SelectItem value="vendas">Quantidade</SelectItem>
                <SelectItem value="nome">Nome</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topProdutos.map((produto, index) => (
              <div key={produto.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full font-bold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{produto.nome}</p>
                    <p className="text-sm text-gray-500">{formatarNumero(produto.vendas)} unidades vendidas</p>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="font-bold text-gray-900">{formatarMoeda(produto.receita)}</p>
                  <p className="text-sm text-gray-500">
                    {formatarMoeda(produto.receita / produto.vendas)} por unidade
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Análise e Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LucideIcons.Lightbulb className="h-5 w-5" />
            Insights de Vendas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Oportunidades</h4>
              <div className="space-y-3">
                <div className="flex items-start gap-3 text-sm">
                  <LucideIcons.Target className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Foco em produtos high-ticket</p>
                    <p className="text-gray-600">3 produtos representam 60% da receita</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 text-sm">
                  <LucideIcons.TrendingUp className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Vendas crescendo consistentemente</p>
                    <p className="text-gray-600">Últimos 7 dias acima da média</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Recomendações</h4>
              <div className="space-y-3">
                <div className="flex items-start gap-3 text-sm">
                  <LucideIcons.Megaphone className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Promover produtos complementares</p>
                    <p className="text-gray-600">Cross-sell para aumentar ticket médio</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 text-sm">
                  <LucideIcons.Calendar className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Campanhas sazonais</p>
                    <p className="text-gray-600">Aproveitar picos de venda identificados</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}