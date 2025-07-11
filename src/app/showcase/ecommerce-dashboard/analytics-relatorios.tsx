// src/app/showcase/ecommerce-dashboard/analytics-relatorios.tsx
'use client'

import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react'
import { toast } from 'sonner'
import * as LucideIcons from 'lucide-react'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"

// Funções utilitárias defensivas
const formatarPorcentagem = (valor: number | undefined): string => {
  if (valor === undefined || valor === null || isNaN(valor)) return '0%';
  return `${valor.toFixed(1)}%`;
};

const formatarTempo = (tempo: string | undefined): string => {
  if (!tempo) return 'N/A';
  return tempo;
};

const formatarNumero = (numero: number | undefined): string => {
  if (numero === undefined || numero === null || isNaN(numero)) return '0';
  return new Intl.NumberFormat('pt-BR').format(numero);
};

const formatarMoeda = (valor: number | undefined): string => {
  if (valor === undefined || valor === null || isNaN(valor)) return 'R$ 0,00';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(valor);
};

const calcularTendencia = (atual: number, anterior: number): { valor: number; tipo: 'positiva' | 'negativa' | 'neutra' } => {
  if (!atual || !anterior) return { valor: 0, tipo: 'neutra' };
  
  const variacao = ((atual - anterior) / anterior) * 100;
  const tipo = variacao > 0 ? 'positiva' : variacao < 0 ? 'negativa' : 'neutra';
  
  return { valor: Math.abs(variacao), tipo };
};

interface AnalyticsRelatoriosProps {
  dados: any;
  periodo: string;
  carregando?: boolean;
  onRecarregar: () => void;
}

export default function AnalyticsRelatorios({ dados, periodo, carregando, onRecarregar }: AnalyticsRelatoriosProps) {
  const [abaAnalytics, setAbaAnalytics] = useState('performance');
  const [periodoComparacao, setPeriodoComparacao] = useState('mes-anterior');
  const [exportando, setExportando] = useState(false);
  
  const montadoRef = useRef(true);
  
  useEffect(() => {
    montadoRef.current = true;
    return () => { montadoRef.current = false; };
  }, []);

  // Métricas principais de performance
  const metricas = useMemo(() => {
    if (!dados?.metricas) return null;

    return {
      conversao: dados.metricas.conversao || 0,
      carrinhoAbandonado: dados.metricas.carrinhoAbandonado || 0,
      ticketMedio: dados.metricas.ticketMedio || 0,
      tempoSessao: dados.metricas.tempoSessao || '0:00'
    };
  }, [dados?.metricas]);

  // Dados de origem de tráfego
  const origemTrafego = useMemo(() => {
    if (!dados?.origemTrafego) return [];

    // Define o mapa de cores para cada tipo de origem
    const coresOrigemMap = {
      'Orgânico': 'bg-green-500',
      'Pago': 'bg-blue-500',
      'Social': 'bg-purple-500',
      'Email': 'bg-orange-500',
      'Direto': 'bg-gray-500'
    } as const;
    
    type OrigemTipo = keyof typeof coresOrigemMap;

    return dados.origemTrafego.map((origem: any) => ({
      ...origem,
      cor: coresOrigemMap[origem.origem as OrigemTipo] || 'bg-gray-500'
    }));
  }, [dados?.origemTrafego]);

  // Dados simulados para demonstração
  const dadosSimulados = useMemo(() => ({
    vendaPorHora: Array.from({ length: 24 }, (_, i) => ({
      hora: i,
      vendas: Math.floor(Math.random() * 100) + 20
    })),
    
    funil: [
      { etapa: 'Visitantes', valor: 12450, taxa: 100 },
      { etapa: 'Visualizaram Produto', valor: 8920, taxa: 71.6 },
      { etapa: 'Adicionaram ao Carrinho', valor: 2340, taxa: 18.8 },
      { etapa: 'Iniciaram Checkout', valor: 1560, taxa: 12.5 },
      { etapa: 'Finalizaram Compra', valor: 890, taxa: 7.2 }
    ],
    
    dispositivosUsuarios: [
      { dispositivo: 'Desktop', usuarios: 4560, porcentagem: 45.6 },
      { dispositivo: 'Mobile', usuarios: 3890, porcentagem: 38.9 },
      { dispositivo: 'Tablet', usuarios: 1550, porcentagem: 15.5 }
    ],
    
    retencaoClientes: [
      { periodo: 'Dia 1', retencao: 100 },
      { periodo: 'Dia 7', retencao: 65 },
      { periodo: 'Dia 30', retencao: 42 },
      { periodo: 'Dia 90', retencao: 28 },
      { periodo: 'Dia 180', retencao: 18 }
    ]
  }), []);

  // Handler para exportar relatórios
  const handleExportarRelatorio = useCallback(async (formato: 'pdf' | 'excel') => {
    if (!montadoRef.current) return;

    setExportando(true);

    try {
      // Simulação de exportação
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      toast.success(`Relatório ${formato.toUpperCase()} gerado com sucesso`);
    } catch (error) {
      toast.error('Erro ao gerar relatório');
    } finally {
      if (montadoRef.current) {
        setExportando(false);
      }
    }
  }, []);

  // Renderizar gráfico de barras simples
  const renderizarGraficoBarras = useCallback((dados: any[], chaveValor: string, titulo: string) => {
    const maxValor = Math.max(...dados.map(d => d[chaveValor]));
    
    return (
      <div className="space-y-4">
        <h4 className="font-medium text-gray-900">{titulo}</h4>
        <div className="space-y-3">
          {dados.map((item, index) => {
            const porcentagem = (item[chaveValor] / maxValor) * 100;
            
            return (
              <div key={index} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>{item.hora ? `${item.hora}h` : item.etapa || item.dispositivo || item.periodo}</span>
                  <span className="font-medium">
                    {typeof item[chaveValor] === 'number' ? formatarNumero(item[chaveValor]) : item[chaveValor]}
                    {item.taxa && ` (${item.taxa}%)`}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${porcentagem}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }, []);

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
      {/* Métricas Principais */}
      {metricas && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Analytics & Relatórios</h2>
            <div className="flex items-center gap-2">
              <Select value={periodoComparacao} onValueChange={setPeriodoComparacao}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mes-anterior">vs Mês Anterior</SelectItem>
                  <SelectItem value="ano-anterior">vs Ano Anterior</SelectItem>
                  <SelectItem value="periodo-anterior">vs Período Anterior</SelectItem>
                </SelectContent>
              </Select>
              
              <Button
                variant="outline"
                onClick={() => handleExportarRelatorio('excel')}
                disabled={exportando}
              >
                {exportando ? (
                  <LucideIcons.Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <LucideIcons.Download className="h-4 w-4 mr-2" />
                )}
                Exportar
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Taxa de Conversão</p>
                    <p className="text-2xl font-bold text-gray-900">{formatarPorcentagem(metricas.conversao)}</p>
                    <div className="flex items-center mt-1">
                      <LucideIcons.TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                      <span className="text-xs text-green-600">+0.3% este mês</span>
                    </div>
                  </div>
                  <LucideIcons.Target className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Carrinho Abandonado</p>
                    <p className="text-2xl font-bold text-gray-900">{formatarPorcentagem(metricas.carrinhoAbandonado)}</p>
                    <div className="flex items-center mt-1">
                      <LucideIcons.TrendingDown className="h-3 w-3 text-red-600 mr-1" />
                      <span className="text-xs text-red-600">-2.1% este mês</span>
                    </div>
                  </div>
                  <LucideIcons.ShoppingCart className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Ticket Médio</p>
                    <p className="text-2xl font-bold text-gray-900">{formatarMoeda(metricas.ticketMedio)}</p>
                    <div className="flex items-center mt-1">
                      <LucideIcons.TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                      <span className="text-xs text-green-600">+5.4% este mês</span>
                    </div>
                  </div>
                  <LucideIcons.DollarSign className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Tempo de Sessão</p>
                    <p className="text-2xl font-bold text-gray-900">{formatarTempo(metricas.tempoSessao)}</p>
                    <div className="flex items-center mt-1">
                      <LucideIcons.TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                      <span className="text-xs text-green-600">+12s este mês</span>
                    </div>
                  </div>
                  <LucideIcons.Clock className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Abas de Analytics */}
      <Tabs value={abaAnalytics} onValueChange={setAbaAnalytics} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="trafego">Tráfego</TabsTrigger>
          <TabsTrigger value="usuarios">Usuários</TabsTrigger>
          <TabsTrigger value="relatorios">Relatórios</TabsTrigger>
        </TabsList>

        {/* Aba Performance */}
        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Vendas por Hora */}
            <Card>
              <CardHeader>
                <CardTitle>Vendas por Hora</CardTitle>
                <CardDescription>Distribuição de vendas ao longo do dia</CardDescription>
              </CardHeader>
              <CardContent>
                {renderizarGraficoBarras(dadosSimulados.vendaPorHora, 'vendas', '')}
              </CardContent>
            </Card>

            {/* Funil de Conversão */}
            <Card>
              <CardHeader>
                <CardTitle>Funil de Conversão</CardTitle>
                <CardDescription>Jornada do visitante até a compra</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dadosSimulados.funil.map((etapa, index) => (
                    <div key={index} className="relative">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">{etapa.etapa}</span>
                        <span className="text-sm text-gray-600">
                          {formatarNumero(etapa.valor)} ({etapa.taxa}%)
                        </span>
                      </div>
                      <Progress value={etapa.taxa} className="h-3" />
                      
                      {index < dadosSimulados.funil.length - 1 && (
                        <div className="flex items-center justify-center mt-2">
                          <LucideIcons.ChevronDown className="h-4 w-4 text-gray-400" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Dispositivos dos Usuários */}
          <Card>
            <CardHeader>
              <CardTitle>Dispositivos dos Usuários</CardTitle>
              <CardDescription>Preferências de dispositivo dos seus clientes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {dadosSimulados.dispositivosUsuarios.map((dispositivo, index) => (
                  <div key={index} className="text-center">
                    <div className="mb-4">
                      {dispositivo.dispositivo === 'Desktop' && <LucideIcons.Monitor className="h-12 w-12 text-blue-600 mx-auto" />}
                      {dispositivo.dispositivo === 'Mobile' && <LucideIcons.Smartphone className="h-12 w-12 text-green-600 mx-auto" />}
                      {dispositivo.dispositivo === 'Tablet' && <LucideIcons.Tablet className="h-12 w-12 text-purple-600 mx-auto" />}
                    </div>
                    <h3 className="font-medium text-gray-900">{dispositivo.dispositivo}</h3>
                    <p className="text-2xl font-bold text-gray-900">{formatarNumero(dispositivo.usuarios)}</p>
                    <p className="text-sm text-gray-500">{dispositivo.porcentagem}% do total</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba Tráfego */}
        <TabsContent value="trafego" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Origem do Tráfego */}
            <Card>
              <CardHeader>
                <CardTitle>Origem do Tráfego</CardTitle>
                <CardDescription>De onde vêm seus visitantes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {origemTrafego.map((origem: { cor: any; origem: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; visitantes: number | undefined; porcentagem: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined }, index: React.Key | null | undefined) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full ${origem.cor}`}></div>
                        <span className="font-medium">{origem.origem}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatarNumero(origem.visitantes)}</p>
                        <p className="text-sm text-gray-500">{origem.porcentagem}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Páginas Mais Visitadas */}
            <Card>
              <CardHeader>
                <CardTitle>Páginas Mais Visitadas</CardTitle>
                <CardDescription>Conteúdo mais popular do seu site</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { pagina: '/produtos/smartphone-galaxy', visualizacoes: 8940, taxa: 34.2 },
                    { pagina: '/produtos/notebook-dell', visualizacoes: 6720, taxa: 25.7 },
                    { pagina: '/categoria/eletronicos', visualizacoes: 4560, taxa: 17.4 },
                    { pagina: '/ofertas', visualizacoes: 3210, taxa: 12.3 },
                    { pagina: '/conta/login', visualizacoes: 2680, taxa: 10.3 }
                  ].map((pagina, index) => (
                    <div key={index} className="flex items-center justify-between py-2">
                      <div className="flex-1">
                        <p className="font-medium text-sm truncate">{pagina.pagina}</p>
                        <Progress value={pagina.taxa} className="h-1 mt-1" />
                      </div>
                      <div className="text-right ml-4">
                        <p className="font-medium text-sm">{formatarNumero(pagina.visualizacoes)}</p>
                        <p className="text-xs text-gray-500">{pagina.taxa}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Aba Usuários */}
        <TabsContent value="usuarios" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Retenção de Clientes */}
            <Card>
              <CardHeader>
                <CardTitle>Retenção de Clientes</CardTitle>
                <CardDescription>Taxa de retorno dos clientes ao longo do tempo</CardDescription>
              </CardHeader>
              <CardContent>
                {renderizarGraficoBarras(dadosSimulados.retencaoClientes, 'retencao', '')}
              </CardContent>
            </Card>

            {/* Demografia dos Usuários */}
            <Card>
              <CardHeader>
                <CardTitle>Demografia dos Usuários</CardTitle>
                <CardDescription>Perfil demográfico dos seus clientes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium mb-3">Faixa Etária</h4>
                    <div className="space-y-2">
                      {[
                        { faixa: '18-24 anos', porcentagem: 18.5 },
                        { faixa: '25-34 anos', porcentagem: 34.2 },
                        { faixa: '35-44 anos', porcentagem: 28.7 },
                        { faixa: '45-54 anos', porcentagem: 12.3 },
                        { faixa: '55+ anos', porcentagem: 6.3 }
                      ].map((faixa, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-sm">{faixa.faixa}</span>
                          <div className="flex items-center gap-2">
                            <Progress value={faixa.porcentagem} className="w-20 h-2" />
                            <span className="text-sm font-medium w-12">{faixa.porcentagem}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-3">Gênero</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <LucideIcons.User className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                        <p className="font-bold text-lg">52.3%</p>
                        <p className="text-sm text-gray-600">Feminino</p>
                      </div>
                      <div className="text-center">
                        <LucideIcons.User className="h-8 w-8 text-green-600 mx-auto mb-2" />
                        <p className="font-bold text-lg">47.7%</p>
                        <p className="text-sm text-gray-600">Masculino</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Aba Relatórios */}
        <TabsContent value="relatorios" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Relatórios Personalizados</CardTitle>
              <CardDescription>
                Gere relatórios detalhados para análise aprofundada do seu negócio
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  {
                    titulo: 'Relatório de Vendas',
                    descricao: 'Análise completa de vendas, produtos e performance',
                    icone: 'BarChart3',
                    cor: 'text-blue-600 bg-blue-100'
                  },
                  {
                    titulo: 'Relatório de Clientes',
                    descricao: 'Comportamento, demografia e análise de clientes',
                    icone: 'Users',
                    cor: 'text-green-600 bg-green-100'
                  },
                  {
                    titulo: 'Relatório de Inventário',
                    descricao: 'Status de estoque, produtos e movimentação',
                    icone: 'Package',
                    cor: 'text-purple-600 bg-purple-100'
                  },
                  {
                    titulo: 'Relatório Financeiro',
                    descricao: 'Receitas, custos e análise de lucratividade',
                    icone: 'DollarSign',
                    cor: 'text-orange-600 bg-orange-100'
                  },
                  {
                    titulo: 'Relatório de Tráfego',
                    descricao: 'Origem de visitantes, comportamento e conversão',
                    icone: 'TrendingUp',
                    cor: 'text-pink-600 bg-pink-100'
                  },
                  {
                    titulo: 'Relatório Customizado',
                    descricao: 'Crie um relatório personalizado às suas necessidades',
                    icone: 'Settings',
                    cor: 'text-gray-600 bg-gray-100'
                  }
                ].map((relatorio, index) => {
                  const IconeComponente = LucideIcons[relatorio.icone as keyof typeof LucideIcons] as any;
                  
                  return (
                    <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className={`p-3 rounded-full ${relatorio.cor}`}>
                            <IconeComponente className="h-6 w-6" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900 mb-2">{relatorio.titulo}</h3>
                            <p className="text-sm text-gray-600 mb-4">{relatorio.descricao}</p>
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleExportarRelatorio('pdf')}
                                disabled={exportando}
                              >
                                <LucideIcons.FileText className="h-3 w-3 mr-1" />
                                PDF
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleExportarRelatorio('excel')}
                                disabled={exportando}
                              >
                                <LucideIcons.FileSpreadsheet className="h-3 w-3 mr-1" />
                                Excel
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Agendamento de Relatórios */}
          <Card>
            <CardHeader>
              <CardTitle>Relatórios Automáticos</CardTitle>
              <CardDescription>
                Configure o envio automático de relatórios por email
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { nome: 'Relatório Semanal de Vendas', frequencia: 'Toda segunda-feira', ativo: true },
                  { nome: 'Resumo Mensal Executivo', frequencia: 'Todo dia 1º', ativo: true },
                  { nome: 'Alerta de Estoque Baixo', frequencia: 'Diário', ativo: false },
                  { nome: 'Performance de Marketing', frequencia: 'Quinzenal', ativo: true }
                ].map((agendamento, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{agendamento.nome}</p>
                      <p className="text-sm text-gray-600">{agendamento.frequencia}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={agendamento.ativo ? 'default' : 'secondary'}>
                        {agendamento.ativo ? 'Ativo' : 'Inativo'}
                      </Badge>
                      <Button variant="outline" size="sm">
                        <LucideIcons.Edit className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}