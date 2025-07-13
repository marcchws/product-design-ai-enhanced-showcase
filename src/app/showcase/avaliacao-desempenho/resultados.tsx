'use client'

import React, { useState, useRef, useCallback, useEffect } from 'react'
import { toast } from 'sonner'
import * as LucideIcons from 'lucide-react'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

interface ResultadosProps {
  funcionario: any;
  ciclo: any;
  avaliacoes: any;
}

interface ResultadoCompetencia {
  competencia: string;
  categoria: string;
  autoavaliacao: number;
  media_gestor: number;
  media_pares: number;
  media_subordinados: number;
  media_geral: number;
  comentarios_principais: string[];
}

const resultadosMock: ResultadoCompetencia[] = [
  {
    competencia: 'Comunicação',
    categoria: 'Competências Comportamentais',
    autoavaliacao: 4,
    media_gestor: 4,
    media_pares: 3.5,
    media_subordinados: 4.5,
    media_geral: 4.0,
    comentarios_principais: [
      'Excelente comunicação em apresentações',
      'Poderia melhorar na escuta ativa',
      'Muito clara ao explicar conceitos técnicos'
    ]
  },
  {
    competencia: 'Resolução de Problemas',
    categoria: 'Competências Técnicas',
    autoavaliacao: 3,
    media_gestor: 4,
    media_pares: 4,
    media_subordinados: 3.5,
    media_geral: 3.6,
    comentarios_principais: [
      'Abordagem analítica muito boa',
      'Busca soluções criativas',
      'Às vezes demora para tomar decisões'
    ]
  },
  {
    competencia: 'Liderança',
    categoria: 'Competências de Liderança',
    autoavaliacao: 3,
    media_gestor: 4,
    media_pares: 3,
    media_subordinados: 4,
    media_geral: 3.5,
    comentarios_principais: [
      'Inspira confiança na equipe',
      'Boa em desenvolver pessoas',
      'Poderia ser mais assertiva'
    ]
  }
];

const EstadoLoading = () => (
  <div className="flex items-center justify-center py-16">
    <div className="text-center">
      <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
      <p className="text-gray-500">Compilando resultados da avaliação...</p>
    </div>
  </div>
);

const EstadoVazio = () => (
  <div className="text-center py-16">
    <LucideIcons.BarChart3 className="h-16 w-16 text-gray-300 mx-auto mb-6" />
    <h3 className="text-xl font-medium mb-2">Resultados ainda não disponíveis</h3>
    <p className="text-gray-500 max-w-md mx-auto">
      Os resultados serão liberados após o fechamento do ciclo de avaliação.
    </p>
  </div>
);

export default function Resultados({ funcionario, ciclo, avaliacoes }: ResultadosProps) {
  const [carregando, setCarregando] = useState(true);
  const [resultados, setResultados] = useState<ResultadoCompetencia[]>([]);
  const [competenciaSelecionada, setCompetenciaSelecionada] = useState<string | null>(null);
  
  const montadoRef = useRef(true);
  
  useEffect(() => {
    montadoRef.current = true;
    return () => { montadoRef.current = false; };
  }, []);

  const carregarResultados = useCallback(async () => {
    if (!montadoRef.current) return;
    
    setCarregando(true);
    
    const timeoutId = setTimeout(() => {
      if (montadoRef.current) {
        setCarregando(false);
        toast.error('Tempo de carregamento excedido');
      }
    }, 8000);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (montadoRef.current) {
        setResultados(resultadosMock);
      }
    } catch (error) {
      console.error('Erro ao carregar resultados:', error);
      if (montadoRef.current) {
        toast.error('Falha ao carregar resultados');
      }
    } finally {
      clearTimeout(timeoutId);
      if (montadoRef.current) {
        setCarregando(false);
      }
    }
  }, []);

  useEffect(() => {
    carregarResultados();
  }, [carregarResultados]);

  const mediaGeral = resultados.length > 0 
    ? resultados.reduce((acc, r) => acc + r.media_geral, 0) / resultados.length 
    : 0;

  const getCorNota = (nota: number): string => {
    if (nota >= 4.5) return 'text-green-600';
    if (nota >= 3.5) return 'text-blue-600';
    if (nota >= 2.5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getCorProgress = (nota: number): string => {
    if (nota >= 4.5) return 'bg-green-500';
    if (nota >= 3.5) return 'bg-blue-500';
    if (nota >= 2.5) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (carregando) return <EstadoLoading />;
  
  if (resultados.length === 0) return <EstadoVazio />;

  return (
    <div className="space-y-6">
      
      {/* Header com Resumo Geral */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className={`text-3xl font-bold ${getCorNota(mediaGeral)}`}>
                {mediaGeral.toFixed(1)}
              </div>
              <p className="text-sm text-gray-600 mt-1">Nota Geral</p>
              <div className="mt-2">
                <Progress 
                  value={(mediaGeral / 5) * 100} 
                  className="h-2"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {avaliacoes.concluidas}
              </div>
              <p className="text-sm text-gray-600 mt-1">Avaliações Recebidas</p>
              <p className="text-xs text-gray-500 mt-2">
                de {avaliacoes.total} esperadas
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                85%
              </div>
              <p className="text-sm text-gray-600 mt-1">Percentil da Empresa</p>
              <p className="text-xs text-gray-500 mt-2">
                Acima de 85% dos funcionários
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Competências por Categoria */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LucideIcons.BarChart3 className="h-5 w-5" />
            Resultados por Competência
          </CardTitle>
          <CardDescription>
            Comparação entre auto-avaliação e avaliações recebidas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {resultados.map((resultado) => (
              <div key={resultado.competencia} className="space-y-3">
                
                {/* Header da Competência */}
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">{resultado.competencia}</h4>
                    <Badge variant="outline" className="text-xs mt-1">
                      {resultado.categoria}
                    </Badge>
                  </div>
                  <div className={`text-lg font-bold ${getCorNota(resultado.media_geral)}`}>
                    {resultado.media_geral.toFixed(1)}
                  </div>
                </div>

                {/* Gráfico de Comparação */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
<div>
                    <p className="text-gray-600 mb-1">Auto-avaliação</p>
                    <div className="flex items-center gap-2">
                      <Progress 
                        value={(resultado.autoavaliacao / 5) * 100}
                        className="flex-1 h-2"
                      />
                      <span className="font-medium w-8">{resultado.autoavaliacao.toFixed(1)}</span>
                    </div>
                  </div>

                  <div>
                    <p className="text-gray-600 mb-1">Gestor</p>
                    <div className="flex items-center gap-2">
                      <Progress 
                        value={(resultado.media_gestor / 5) * 100}
                        className="flex-1 h-2"
                      />
                      <span className="font-medium w-8">{resultado.media_gestor.toFixed(1)}</span>
                    </div>
                  </div>

                  <div>
                    <p className="text-gray-600 mb-1">Pares</p>
                    <div className="flex items-center gap-2">
                      <Progress 
                        value={(resultado.media_pares / 5) * 100}
                        className="flex-1 h-2"
                      />
                      <span className="font-medium w-8">{resultado.media_pares.toFixed(1)}</span>
                    </div>
                  </div>

                  <div>
                    <p className="text-gray-600 mb-1">Subordinados</p>
                    <div className="flex items-center gap-2">
                      <Progress 
                        value={(resultado.media_subordinados / 5) * 100}
                        className="flex-1 h-2"
                      />
                      <span className="font-medium w-8">{resultado.media_subordinados.toFixed(1)}</span>
                    </div>
                  </div>
                </div>

                {/* Comentários Principais */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h5 className="font-medium text-sm">Principais Feedbacks</h5>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setCompetenciaSelecionada(
                        competenciaSelecionada === resultado.competencia ? null : resultado.competencia
                      )}
                    >
                      {competenciaSelecionada === resultado.competencia ? (
                        <LucideIcons.ChevronUp className="h-4 w-4" />
                      ) : (
                        <LucideIcons.ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  
                  {competenciaSelecionada === resultado.competencia && (
                    <div className="space-y-2">
                      {resultado.comentarios_principais.map((comentario, index) => (
                        <div key={index} className="flex items-start gap-2 text-sm">
                          <LucideIcons.MessageCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">{comentario}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Separador */}
                {resultado !== resultados[resultados.length - 1] && (
                  <div className="border-b border-gray-200 my-6"></div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Plano de Desenvolvimento */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LucideIcons.Target className="h-5 w-5" />
            Plano de Desenvolvimento Sugerido
          </CardTitle>
          <CardDescription>
            Baseado nos resultados da sua avaliação
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            
            {/* Pontos Fortes */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-medium text-green-800 mb-3 flex items-center gap-2">
                <LucideIcons.TrendingUp className="h-4 w-4" />
                Pontos Fortes Identificados
              </h4>
              <ul className="space-y-2">
                {resultados
                  .filter(r => r.media_geral >= 4.0)
                  .map((resultado) => (
                    <li key={resultado.competencia} className="flex items-center gap-2 text-sm text-green-700">
                      <LucideIcons.Check className="h-4 w-4" />
                      <span>
                        <strong>{resultado.competencia}:</strong> Desempenho consistente ({resultado.media_geral.toFixed(1)}/5.0)
                      </span>
                    </li>
                  ))
                }
              </ul>
            </div>

            {/* Oportunidades de Melhoria */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-800 mb-3 flex items-center gap-2">
                <LucideIcons.Target className="h-4 w-4" />
                Oportunidades de Desenvolvimento
              </h4>
              <ul className="space-y-3">
                {resultados
                  .filter(r => r.media_geral < 4.0)
                  .map((resultado) => (
                    <li key={resultado.competencia} className="text-sm text-blue-700">
                      <div className="flex items-start gap-2">
                        <LucideIcons.ArrowUpCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="font-medium">{resultado.competencia}</span>
                          <span className="ml-2">({resultado.media_geral.toFixed(1)}/5.0)</span>
                          <p className="mt-1 text-xs text-blue-600">
                            Sugestão: Participar de treinamentos específicos e buscar mentoria
                          </p>
                        </div>
                      </div>
                    </li>
                  ))
                }
              </ul>
            </div>

            {/* Ações Recomendadas */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-medium text-yellow-800 mb-3 flex items-center gap-2">
                <LucideIcons.Lightbulb className="h-4 w-4" />
                Ações Recomendadas para o Próximo Período
              </h4>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm text-yellow-700">
                  <LucideIcons.BookOpen className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>Participar do curso "Liderança Situacional" oferecido pela empresa</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-yellow-700">
                  <LucideIcons.Users className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>Buscar mentoria com líderes seniores para desenvolvimento de competências de liderança</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-yellow-700">
                  <LucideIcons.MessageSquare className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>Praticar técnicas de escuta ativa em reuniões e conversas com a equipe</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-yellow-700">
                  <LucideIcons.Target className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>Definir metas específicas de desenvolvimento com seu gestor</span>
                </li>
              </ul>
            </div>

          </div>
        </CardContent>
      </Card>

      {/* Histórico de Avaliações */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LucideIcons.TrendingUp className="h-5 w-5" />
            Evolução Histórica
          </CardTitle>
          <CardDescription>
            Comparação com ciclos anteriores
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">3.8</div>
                <p className="text-sm text-gray-600">2024 S1</p>
                <p className="text-xs text-gray-500">Ciclo Anterior</p>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{mediaGeral.toFixed(1)}</div>
                <p className="text-sm text-gray-600">2024 S2</p>
                <p className="text-xs text-gray-500">Ciclo Atual</p>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center gap-1">
                  <LucideIcons.TrendingUp className="h-5 w-5 text-green-500" />
                  <span className="text-lg font-bold text-green-600">+{(mediaGeral - 3.8).toFixed(1)}</span>
                </div>
                <p className="text-sm text-gray-600">Evolução</p>
                <p className="text-xs text-green-600">Melhoria consistente</p>
              </div>
            </div>

            <div className="pt-4 border-t">
              <p className="text-sm text-gray-600 text-center">
                Parabéns! Você demonstrou crescimento em todas as competências avaliadas.
              </p>
            </div>

          </div>
        </CardContent>
      </Card>

      {/* Ações */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Button className="flex-1" onClick={() => toast.info('Exportando relatório completo')}>
          <LucideIcons.Download className="mr-2 h-4 w-4" />
          Exportar Relatório Completo
        </Button>
        
        <Button variant="outline" className="flex-1" onClick={() => toast.info('Agendando conversa com gestor')}>
          <LucideIcons.Calendar className="mr-2 h-4 w-4" />
          Agendar Conversa com Gestor
        </Button>
        
        <Button variant="outline" className="flex-1" onClick={() => toast.info('Criando plano de desenvolvimento')}>
          <LucideIcons.Target className="mr-2 h-4 w-4" />
          Criar Plano de Desenvolvimento
        </Button>
      </div>

    </div>
  );
}