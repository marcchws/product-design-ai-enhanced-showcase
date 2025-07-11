// src/app/showcase/ecommerce-dashboard/page.tsx
'use client'

import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react'
import { toast, Toaster } from 'sonner'
import * as LucideIcons from 'lucide-react'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Importar módulos especializados
import DashboardOverview from './dashboard-overview'
import VendasMetricas from './vendas-metricas'
import PedidosGestao from './pedidos-gestao'
import ProdutosInventario from './produtos-inventario'
import AnalyticsRelatorios from './analytics-relatorios'

// Funções utilitárias defensivas obrigatórias
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

interface DadosLoja {
  vendas: {
    totalHoje: number;
    totalMes: number;
    totalMesAnterior: number;
    totalAno: number;
  };
  pedidos: {
    totalHoje: number;
    totalMes: number;
    pendentes: number;
    processando: number;
    enviados: number;
    entregues: number;
  };
  produtos: {
    totalAtivos: number;
    emEstoque: number;
    estoqueMinimo: number;
    semEstoque: number;
  };
  clientes: {
    totalAtivos: number;
    novosMes: number;
    recorrentes: number;
  };
}

export default function EcommerceDashboard() {
  // Estados globais compartilhados
  const [abaSelecionada, setAbaSelecionada] = useState<string>('overview');
  const [dadosLoja, setDadosLoja] = useState<DadosLoja | null>(null);
  const [carregandoDados, setCarregandoDados] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [periodoSelecionado, setPeriodoSelecionado] = useState('30d');
  const [lojaAtiva, setLojaAtiva] = useState('loja-principal');
  
  // Estados por módulo para performance
  const [dadosPorModulo, setDadosPorModulo] = useState<Record<string, any>>({});
  const [carregandoPorModulo, setCarregandoPorModulo] = useState<Record<string, boolean>>({});
  const [modulosCarregados, setModulosCarregados] = useState<Set<string>>(new Set(['overview']));

  const montadoRef = useRef(true);

  // Configuração de abas do dashboard
  const configuracaoAbas = useMemo(() => [
    { 
      id: 'overview', 
      label: 'Overview', 
      icone: 'LayoutDashboard',
      badge: null,
      lazy: false
    },
    { 
      id: 'vendas', 
      label: 'Vendas', 
      icone: 'TrendingUp',
      badge: dadosLoja?.vendas.totalHoje ? formatarMoeda(dadosLoja.vendas.totalHoje) : null,
      lazy: true
    },
    { 
      id: 'pedidos', 
      label: 'Pedidos', 
      icone: 'ShoppingCart',
      badge: dadosLoja?.pedidos.pendentes || null,
      lazy: true
    },
    { 
      id: 'produtos', 
      label: 'Produtos', 
      icone: 'Package',
      badge: dadosLoja?.produtos.estoqueMinimo || null,
      lazy: true
    },
    { 
      id: 'analytics', 
      label: 'Analytics', 
      icone: 'BarChart3',
      badge: null,
      lazy: true
    }
  ], [dadosLoja]);

  // Inicialização e prevenção de memory leaks
  useEffect(() => {
    montadoRef.current = true;
    carregarDadosGerais();
    
    return () => {
      montadoRef.current = false;
    };
  }, []);

  // Carregar dados gerais da loja
  const carregarDadosGerais = useCallback(async () => {
    if (!montadoRef.current) return;

    setCarregandoDados(true);
    setErro(null);

    const timeoutId = setTimeout(() => {
      if (montadoRef.current) {
        setCarregandoDados(false);
        setErro('Tempo de carregamento excedido. Verifique sua conexão.');
      }
    }, 8000);

    try {
      // Simulação de API - dados realistas de e-commerce
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const dadosSimulados: DadosLoja = {
        vendas: {
          totalHoje: 15430.50,
          totalMes: 245680.75,
          totalMesAnterior: 198450.30,
          totalAno: 2340567.90
        },
        pedidos: {
          totalHoje: 47,
          totalMes: 892,
          pendentes: 23,
          processando: 15,
          enviados: 31,
          entregues: 823
        },
        produtos: {
          totalAtivos: 1547,
          emEstoque: 1423,
          estoqueMinimo: 89,
          semEstoque: 35
        },
        clientes: {
          totalAtivos: 8940,
          novosMes: 567,
          recorrentes: 2340
        }
      };

      if (montadoRef.current) {
        setDadosLoja(dadosSimulados);
        setDadosPorModulo(prev => ({ ...prev, overview: dadosSimulados }));
        toast.success('Dashboard carregado com sucesso');
      }
    } catch (error) {
      console.error('Erro ao carregar dados da loja:', error);
      if (montadoRef.current) {
        setErro('Falha ao carregar dados do dashboard. Tente novamente.');
      }
    } finally {
      clearTimeout(timeoutId);
      if (montadoRef.current) {
        setCarregandoDados(false);
      }
    }
  }, []);

  // Carregamento lazy por módulo
  const carregarDadosModulo = useCallback(async (moduloId: string) => {
    if (!montadoRef.current || modulosCarregados.has(moduloId)) return;

    setCarregandoPorModulo(prev => ({ ...prev, [moduloId]: true }));

    const timeoutId = setTimeout(() => {
      if (montadoRef.current) {
        setCarregandoPorModulo(prev => ({ ...prev, [moduloId]: false }));
        toast.error(`Timeout ao carregar módulo ${moduloId}`);
      }
    }, 10000);

    try {
      // Simulação de dados específicos por módulo
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const dadosModulo = await simularDadosModulo(moduloId);
      
      if (montadoRef.current) {
        setDadosPorModulo(prev => ({ ...prev, [moduloId]: dadosModulo }));
        setModulosCarregados(prev => {
          const newSet = new Set(prev);
          newSet.add(moduloId);
          return newSet;
        });
      }
    } catch (error) {
      console.error(`Erro ao carregar módulo ${moduloId}:`, error);
    } finally {
      clearTimeout(timeoutId);
      if (montadoRef.current) {
        setCarregandoPorModulo(prev => ({ ...prev, [moduloId]: false }));
      }
    }
  }, [modulosCarregados]);

  // Simulação de dados específicos por módulo
  const simularDadosModulo = async (moduloId: string) => {
    switch (moduloId) {
      case 'vendas':
        return {
          vendasPorDia: Array.from({ length: 30 }, (_, i) => ({
            data: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            vendas: Math.floor(Math.random() * 50000) + 10000
          })),
          topProdutos: [
            { id: 1, nome: 'Smartphone Galaxy S23', vendas: 89, receita: 89000 },
            { id: 2, nome: 'Notebook Dell Inspiron', vendas: 45, receita: 135000 },
            { id: 3, nome: 'Fone JBL Bluetooth', vendas: 123, receita: 24600 }
          ]
        };
      
      case 'pedidos':
        return {
          pedidosRecentes: Array.from({ length: 20 }, (_, i) => ({
            id: `PED-${1000 + i}`,
            cliente: `Cliente ${i + 1}`,
            valor: Math.floor(Math.random() * 2000) + 100,
            status: ['pendente', 'processando', 'enviado', 'entregue'][Math.floor(Math.random() * 4)],
            data: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
          }))
        };
      
      case 'produtos':
        return {
          produtos: Array.from({ length: 50 }, (_, i) => ({
            id: i + 1,
            nome: `Produto ${i + 1}`,
            preco: Math.floor(Math.random() * 1000) + 50,
            estoque: Math.floor(Math.random() * 200),
            categoria: ['Eletrônicos', 'Roupas', 'Casa', 'Esportes'][Math.floor(Math.random() * 4)],
            status: Math.random() > 0.8 ? 'inativo' : 'ativo'
          }))
        };
      
      case 'analytics':
        return {
          metricas: {
            conversao: 3.45,
            carrinhoAbandonado: 67.8,
            ticketMedio: 245.67,
            tempoSessao: '4:23'
          },
          origemTrafego: [
            { origem: 'Orgânico', visitantes: 45670, porcentagem: 34.2 },
            { origem: 'Pago', visitantes: 32450, porcentagem: 24.3 },
            { origem: 'Social', visitantes: 28900, porcentagem: 21.6 },
            { origem: 'Email', visitantes: 26780, porcentagem: 20.0 }
          ]
        };
      
      default:
        return {};
    }
  };

  // Handler para mudança de aba com lazy loading
  const handleMudarAba = useCallback((novaAba: string) => {
    if (novaAba === abaSelecionada) return;

    setAbaSelecionada(novaAba);

    // Carregar dados do módulo se necessário
    const configAba = configuracaoAbas.find(aba => aba.id === novaAba);
    if (configAba?.lazy && !modulosCarregados.has(novaAba)) {
      setTimeout(() => {
        if (montadoRef.current) {
          carregarDadosModulo(novaAba);
        }
      }, 150);
    }
  }, [abaSelecionada, configuracaoAbas, modulosCarregados, carregarDadosModulo]);

  // Renderização de badge com estado
  const renderizarBadge = useCallback((aba: typeof configuracaoAbas[0]) => {
    if (!aba.badge) return null;
    
    const isNumerico = !isNaN(Number(aba.badge));
    const variant = isNumerico && Number(aba.badge) > 0 ? 'destructive' : 'secondary';
    
    return (
      <Badge variant={variant} className="ml-1 text-xs">
        {aba.badge}
      </Badge>
    );
  }, []);

  // Estado de loading global
  if (carregandoDados) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Carregando Dashboard</h3>
          <p className="text-gray-500">Preparando seus dados de e-commerce...</p>
        </div>
      </div>
    );
  }

  // Estado de erro
  if (erro) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <LucideIcons.AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-4">Erro no Dashboard</h3>
          <p className="text-gray-600 mb-6">{erro}</p>
          <Button onClick={carregarDadosGerais}>
            <LucideIcons.RefreshCw className="mr-2 h-4 w-4" />
            Tentar Novamente
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="bottom-right" richColors />
      
      {/* Header do Dashboard */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <LucideIcons.Store className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Dashboard E-commerce</h1>
                <p className="text-sm text-gray-500">Loja Principal - Última atualização: agora</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Seletor de período */}
              <Select value={periodoSelecionado} onValueChange={setPeriodoSelecionado}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">7 dias</SelectItem>
                  <SelectItem value="30d">30 dias</SelectItem>
                  <SelectItem value="90d">90 dias</SelectItem>
                  <SelectItem value="1y">1 ano</SelectItem>
                </SelectContent>
              </Select>
              
              {/* Seletor de loja */}
              <Select value={lojaAtiva} onValueChange={setLojaAtiva}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="loja-principal">Loja Principal</SelectItem>
                  <SelectItem value="loja-secundaria">Loja Secundária</SelectItem>
                  <SelectItem value="todas">Todas as Lojas</SelectItem>
                </SelectContent>
              </Select>
              
              <Button variant="outline" onClick={carregarDadosGerais}>
                <LucideIcons.RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Navegação por abas */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Tabs value={abaSelecionada} onValueChange={handleMudarAba} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-white border shadow-sm">
            {configuracaoAbas.map(aba => {
              const IconeComponente = LucideIcons[aba.icone as keyof typeof LucideIcons] as any;
              const isCarregando = carregandoPorModulo[aba.id];
              
              return (
                <TabsTrigger 
                  key={aba.id}
                  value={aba.id}
                  className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
                  disabled={isCarregando}
                >
                  <div className="flex items-center gap-2">
                    {isCarregando ? (
                      <LucideIcons.Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <IconeComponente className="h-4 w-4" />
                    )}
                    <span className="hidden sm:inline">{aba.label}</span>
                    {renderizarBadge(aba)}
                  </div>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {/* Conteúdo das abas */}
          <TabsContent value="overview" className="space-y-6">
            <DashboardOverview
              dados={dadosPorModulo.overview || dadosLoja}
              periodo={periodoSelecionado}
              carregando={carregandoPorModulo.overview}
              onRecarregar={() => carregarDadosGerais()}
            />
          </TabsContent>

          <TabsContent value="vendas" className="space-y-6">
            <VendasMetricas
              dados={dadosPorModulo.vendas}
              periodo={periodoSelecionado}
              carregando={carregandoPorModulo.vendas}
              onRecarregar={() => carregarDadosModulo('vendas')}
            />
          </TabsContent>

          <TabsContent value="pedidos" className="space-y-6">
            <PedidosGestao
              dados={dadosPorModulo.pedidos}
              periodo={periodoSelecionado}
              carregando={carregandoPorModulo.pedidos}
              onRecarregar={() => carregarDadosModulo('pedidos')}
            />
          </TabsContent>

          <TabsContent value="produtos" className="space-y-6">
            <ProdutosInventario
              dados={dadosPorModulo.produtos}
              periodo={periodoSelecionado}
              carregando={carregandoPorModulo.produtos}
              onRecarregar={() => carregarDadosModulo('produtos')}
            />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <AnalyticsRelatorios
              dados={dadosPorModulo.analytics}
              periodo={periodoSelecionado}
              carregando={carregandoPorModulo.analytics}
              onRecarregar={() => carregarDadosModulo('analytics')}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}