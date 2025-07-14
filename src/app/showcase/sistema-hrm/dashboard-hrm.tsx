'use client'

import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react'
import { toast, Toaster } from 'sonner'
import * as LucideIcons from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { formatarDataContextual } from '@/lib/utils'
import { formatarMoeda } from '@/lib/utils-defensivas'
import { useMounted } from '@/hooks/use-mounted'

interface DashboardHRMProps {
  dadosGlobais: any;
  onAtualizarDados: () => void;
}

interface MetricaTempoReal {
  id: string;
  titulo: string;
  valor: number;
  valorAnterior: number;
  variacao: number;
  tipo: 'positiva' | 'negativa' | 'neutra';
  icone: string;
  cor: string;
  unidade: string;
}

interface AlertaSistema {
  id: string;
  tipo: 'critico' | 'importante' | 'info';
  titulo: string;
  descricao: string;
  acao: string;
  data: string;
  lido: boolean;
}

interface AtividadeRecente {
  id: string;
  tipo: 'admissao' | 'demissao' | 'promocao' | 'treinamento' | 'avaliacao' | 'beneficio';
  titulo: string;
  descricao: string;
  colaborador: string;
  data: string;
  status: 'concluido' | 'pendente' | 'cancelado';
}

export default function DashboardHRM({ dadosGlobais, onAtualizarDados }: DashboardHRMProps) {
  // Estados do dashboard
  const [metricas, setMetricas] = useState<MetricaTempoReal[]>([]);
  const [alertas, setAlertas] = useState<AlertaSistema[]>([]);
  const [atividades, setAtividades] = useState<AtividadeRecente[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [periodoSelecionado, setPeriodoSelecionado] = useState<'hoje' | 'semana' | 'mes' | 'trimestre'>('mes');
  
  const montadoRef = useMounted();

  // Carregar dados do dashboard
  const carregarDadosDashboard = useCallback(async () => {
    if (!montadoRef.current) return;
    
    setCarregando(true);
    setErro(null);
    
    const timeoutId = setTimeout(() => {
      if (montadoRef.current) {
        setCarregando(false);
        setErro('Tempo de carregamento excedido. Tente novamente.');
      }
    }, 8000);
    
    try {
      // Simulação de API - dados do dashboard
      const response = await new Promise<{
        metricas: MetricaTempoReal[];
        alertas: AlertaSistema[];
        atividades: AtividadeRecente[];
      }>((resolve) => {
        setTimeout(() => {
          resolve({
            metricas: [
              {
                id: '1',
                titulo: 'Turnover Mensal',
                valor: 2.3,
                valorAnterior: 3.1,
                variacao: -0.8,
                tipo: 'positiva',
                icone: 'TrendingDown',
                cor: 'text-green-600',
                unidade: '%'
              },
              {
                id: '2',
                titulo: 'Satisfação Geral',
                valor: 4.2,
                valorAnterior: 4.0,
                variacao: 0.2,
                tipo: 'positiva',
                icone: 'Star',
                cor: 'text-yellow-600',
                unidade: '/5.0'
              },
              {
                id: '3',
                titulo: 'Custo por Colaborador',
                valor: 8500,
                valorAnterior: 8200,
                variacao: 300,
                tipo: 'negativa',
                icone: 'DollarSign',
                cor: 'text-red-600',
                unidade: 'R$'
              },
              {
                id: '4',
                titulo: 'Taxa de Conversão',
                valor: 68,
                valorAnterior: 65,
                variacao: 3,
                tipo: 'positiva',
                icone: 'Target',
                cor: 'text-blue-600',
                unidade: '%'
              }
            ],
            alertas: [
              {
                id: '1',
                tipo: 'critico',
                titulo: 'Contratos Vencendo',
                descricao: '3 contratos de colaboradores vencem nos próximos 7 dias',
                acao: 'Renovar Contratos',
                data: new Date().toISOString(),
                lido: false
              },
              {
                id: '2',
                tipo: 'importante',
                titulo: 'Avaliações Pendentes',
                descricao: '15 avaliações de desempenho aguardam conclusão',
                acao: 'Revisar Avaliações',
                data: new Date().toISOString(),
                lido: false
              },
              {
                id: '3',
                tipo: 'info',
                titulo: 'Treinamento Obrigatório',
                descricao: '8 colaboradores precisam completar treinamento de compliance',
                acao: 'Ver Detalhes',
                data: new Date().toISOString(),
                lido: true
              }
            ],
            atividades: [
              {
                id: '1',
                tipo: 'admissao',
                titulo: 'Nova Admissão',
                descricao: 'João Silva foi admitido como Desenvolvedor Pleno',
                colaborador: 'João Silva',
                data: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
                status: 'concluido'
              },
              {
                id: '2',
                tipo: 'promocao',
                titulo: 'Promoção',
                descricao: 'Maria Santos promovida a Gerente de Projetos',
                colaborador: 'Maria Santos',
                data: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
                status: 'concluido'
              },
              {
                id: '3',
                tipo: 'treinamento',
                titulo: 'Treinamento Concluído',
                descricao: 'Curso de Liderança concluído por 12 colaboradores',
                colaborador: 'Equipe de Liderança',
                data: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
                status: 'concluido'
              },
              {
                id: '4',
                tipo: 'avaliacao',
                titulo: 'Avaliação Pendente',
                descricao: 'Avaliação 360° aguarda feedback de 3 avaliadores',
                colaborador: 'Pedro Costa',
                data: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
                status: 'pendente'
              }
            ]
          });
        }, 1200);
      });
      
      if (montadoRef.current) {
        setMetricas(response.metricas);
        setAlertas(response.alertas);
        setAtividades(response.atividades);
      }
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
      if (montadoRef.current) {
        setErro('Falha ao carregar dados do dashboard. Tente novamente.');
      }
    } finally {
      clearTimeout(timeoutId);
      if (montadoRef.current) {
        setCarregando(false);
      }
    }
  }, [montadoRef]);

  useEffect(() => {
    carregarDadosDashboard();
  }, [carregarDadosDashboard]);

  // Marcar alerta como lido
  const marcarAlertaComoLido = useCallback((id: string) => {
    setAlertas(prev => 
      prev.map(alerta => 
        alerta.id === id ? { ...alerta, lido: true } : alerta
      )
    );
  }, []);

  // Obter ícone por tipo de atividade
  const getIconeAtividade = useCallback((tipo: string) => {
    const icones: Record<string, string> = {
      admissao: 'UserPlus',
      demissao: 'UserMinus',
      promocao: 'TrendingUp',
      treinamento: 'GraduationCap',
      avaliacao: 'ClipboardCheck',
      beneficio: 'Gift'
    };
    return icones[tipo] || 'Circle';
  }, []);

  // Obter cor por tipo de atividade
  const getCorAtividade = useCallback((tipo: string) => {
    const cores: Record<string, string> = {
      admissao: 'text-green-600 bg-green-100',
      demissao: 'text-red-600 bg-red-100',
      promocao: 'text-blue-600 bg-blue-100',
      treinamento: 'text-purple-600 bg-purple-100',
      avaliacao: 'text-yellow-600 bg-yellow-100',
      beneficio: 'text-pink-600 bg-pink-100'
    };
    return cores[tipo] || 'text-gray-600 bg-gray-100';
  }, []);

  // Obter cor por status
  const getCorStatus = useCallback((status: string) => {
    const cores: Record<string, string> = {
      concluido: 'text-green-600',
      pendente: 'text-yellow-600',
      cancelado: 'text-red-600'
    };
    return cores[status] || 'text-gray-600';
  }, []);

  if (carregando) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg animate-pulse"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-96 bg-gray-200 rounded-lg animate-pulse"></div>
          <div className="h-96 bg-gray-200 rounded-lg animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (erro) {
    return (
      <div className="bg-red-50 border border-red-200 p-6 rounded-lg text-center">
        <LucideIcons.AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-red-900 mb-2">Erro no Dashboard</h3>
        <p className="text-red-700 mb-6">{erro}</p>
        <Button onClick={carregarDadosDashboard}>
          <LucideIcons.RefreshCw className="mr-2 h-4 w-4" />
          Tentar Novamente
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Seletor de período */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Dashboard Executivo</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Período:</span>
          <Tabs value={periodoSelecionado} onValueChange={(value: any) => setPeriodoSelecionado(value)}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="hoje" className="text-xs">Hoje</TabsTrigger>
              <TabsTrigger value="semana" className="text-xs">Semana</TabsTrigger>
              <TabsTrigger value="mes" className="text-xs">Mês</TabsTrigger>
              <TabsTrigger value="trimestre" className="text-xs">Trimestre</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Métricas em tempo real */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metricas.map((metrica) => {
          const IconeComponente = LucideIcons[metrica.icone as keyof typeof LucideIcons] as any;
          return (
            <Card key={metrica.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                    metrica.cor.replace('text-', 'bg-').replace('-600', '-100')
                  }`}>
                    <IconeComponente className={`h-5 w-5 ${metrica.cor}`} />
                  </div>
                  <Badge 
                    variant={metrica.tipo === 'positiva' ? 'default' : 'destructive'}
                    className="text-xs"
                  >
                    {metrica.variacao > 0 ? '+' : ''}{metrica.variacao}{metrica.unidade}
                  </Badge>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">{metrica.titulo}</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {metrica.unidade === 'R$' ? formatarMoeda(metrica.valor) : metrica.valor}{metrica.unidade !== 'R$' ? metrica.unidade : ''}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    vs {metrica.unidade === 'R$' ? formatarMoeda(metrica.valorAnterior) : metrica.valorAnterior}{metrica.unidade !== 'R$' ? metrica.unidade : ''} anterior
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Conteúdo principal em duas colunas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alertas do Sistema */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LucideIcons.Bell className="h-5 w-5 text-orange-600" />
              Alertas do Sistema
              {alertas.filter(a => !a.lido).length > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {alertas.filter(a => !a.lido).length}
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Ações requeridas e notificações importantes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alertas.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <LucideIcons.CheckCircle className="h-12 w-12 mx-auto mb-3 text-green-500" />
                  <p>Nenhum alerta pendente</p>
                </div>
              ) : (
                alertas.map((alerta) => (
                  <div 
                    key={alerta.id} 
                    className={`p-3 rounded-lg border ${
                      alerta.lido 
                        ? 'bg-gray-50 border-gray-200' 
                        : 'bg-white border-orange-200'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <div className={`h-2 w-2 rounded-full ${
                            alerta.tipo === 'critico' ? 'bg-red-500' :
                            alerta.tipo === 'importante' ? 'bg-orange-500' : 'bg-blue-500'
                          }`} />
                          <h4 className={`font-medium text-sm ${
                            alerta.lido ? 'text-gray-600' : 'text-gray-900'
                          }`}>
                            {alerta.titulo}
                          </h4>
                        </div>
                        <p className={`text-sm ${
                          alerta.lido ? 'text-gray-500' : 'text-gray-700'
                        }`}>
                          {alerta.descricao}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {formatarDataContextual(alerta.data, 'relativa')}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {!alerta.lido && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => marcarAlertaComoLido(alerta.id)}
                          >
                            <LucideIcons.Check className="h-4 w-4" />
                          </Button>
                        )}
                        <Button variant="outline" size="sm">
                          {alerta.acao}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Atividades Recentes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LucideIcons.Activity className="h-5 w-5 text-blue-600" />
              Atividades Recentes
            </CardTitle>
            <CardDescription>
              Últimas ações e eventos do sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {atividades.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <LucideIcons.Clock className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                  <p>Nenhuma atividade recente</p>
                </div>
              ) : (
                atividades.map((atividade) => {
                  const IconeComponente = LucideIcons[getIconeAtividade(atividade.tipo) as keyof typeof LucideIcons] as any;
                  return (
                    <div key={atividade.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50">
                      <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${getCorAtividade(atividade.tipo)}`}>
                        <IconeComponente className="h-4 w-4" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-medium text-sm text-gray-900 truncate">
                            {atividade.titulo}
                          </h4>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${getCorStatus(atividade.status)}`}
                          >
                            {atividade.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">
                          {atividade.descricao}
                        </p>
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-gray-500">
                            {atividade.colaborador}
                          </p>
                          <p className="text-xs text-gray-400">
                            {formatarDataContextual(atividade.data, 'relativa')}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos e análises avançadas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LucideIcons.BarChart3 className="h-5 w-5 text-purple-600" />
            Análise de Tendências
          </CardTitle>
          <CardDescription>
            Evolução dos principais indicadores ao longo do tempo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Turnover */}
            <div>
              <h4 className="font-medium mb-3">Turnover Mensal</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Meta</span>
                  <span className="text-green-600">2.0%</span>
                </div>
                <Progress value={65} className="h-2" />
                <div className="flex justify-between text-sm">
                  <span>Atual</span>
                  <span className="text-blue-600">2.3%</span>
                </div>
              </div>
            </div>

            {/* Satisfação */}
            <div>
              <h4 className="font-medium mb-3">Satisfação Geral</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Meta</span>
                  <span className="text-green-600">4.5</span>
                </div>
                <Progress value={84} className="h-2" />
                <div className="flex justify-between text-sm">
                  <span>Atual</span>
                  <span className="text-blue-600">4.2</span>
                </div>
              </div>
            </div>

            {/* Orçamento */}
            <div>
              <h4 className="font-medium mb-3">Utilização do Orçamento</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Utilizado</span>
                  <span className="text-blue-600">
                    {formatarMoeda(dadosGlobais.estatisticas.orcamentoUtilizado)}
                  </span>
                </div>
                <Progress 
                  value={(dadosGlobais.estatisticas.orcamentoUtilizado / dadosGlobais.estatisticas.orcamentoTotal) * 100} 
                  className="h-2" 
                />
                <div className="flex justify-between text-sm">
                  <span>Total</span>
                  <span className="text-gray-600">
                    {formatarMoeda(dadosGlobais.estatisticas.orcamentoTotal)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 