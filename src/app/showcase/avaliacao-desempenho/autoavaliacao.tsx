'use client'

import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react'
import { toast } from 'sonner'
import * as LucideIcons from 'lucide-react'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

interface Criterio {
  id: string;
  competencia: string;
  categoria: string;
  descricao: string;
  exemplos: string[];
  peso: number;
  escala: {
    valor: number;
    label: string;
    descricao: string;
  }[];
}

interface RespostaAutoavaliacao {
  criterio_id: string;
  nota: number;
  comentario: string;
  exemplos_situacao: string;
}

interface AutoavaliacaoProps {
  funcionario: any;
  ciclo: any;
  progresso: any;
}

const criteriosMock: Criterio[] = [
  {
    id: 'comunicacao',
    competencia: 'Comunicação',
    categoria: 'Competências Comportamentais',
    descricao: 'Capacidade de se expressar de forma clara, ouvir ativamente e adaptar a comunicação ao público',
    exemplos: [
      'Apresentações claras e objetivas',
      'Escuta ativa em reuniões',
      'Comunicação escrita eficaz',
      'Adaptação da linguagem conforme o público'
    ],
    peso: 3,
    escala: [
      { valor: 1, label: 'Insatisfatório', descricao: 'Dificuldade frequente em se comunicar claramente' },
      { valor: 2, label: 'Parcialmente Satisfatório', descricao: 'Comunica-se bem em situações familiares' },
      { valor: 3, label: 'Satisfatório', descricao: 'Comunicação clara e eficaz na maioria das situações' },
      { valor: 4, label: 'Bom', descricao: 'Excelente comunicação, adapta linguagem ao público' },
      { valor: 5, label: 'Excepcional', descricao: 'Comunicador excepcional, inspira e engaja outros' }
    ]
  },
  {
    id: 'resolucao_problemas',
    competencia: 'Resolução de Problemas',
    categoria: 'Competências Técnicas',
    descricao: 'Habilidade para identificar, analisar e resolver problemas de forma criativa e eficiente',
    exemplos: [
      'Análise estruturada de problemas complexos',
      'Proposição de soluções inovadoras',
      'Implementação eficaz de soluções',
      'Aprendizado com problemas anteriores'
    ],
    peso: 4,
    escala: [
      { valor: 1, label: 'Insatisfatório', descricao: 'Tem dificuldade para identificar e resolver problemas' },
      { valor: 2, label: 'Parcialmente Satisfatório', descricao: 'Resolve problemas simples com orientação' },
      { valor: 3, label: 'Satisfatório', descricao: 'Resolve a maioria dos problemas de forma independente' },
      { valor: 4, label: 'Bom', descricao: 'Resolve problemas complexos e ajuda outros' },
      { valor: 5, label: 'Excepcional', descricao: 'Antecipa problemas e cria soluções inovadoras' }
    ]
  },
  {
    id: 'lideranca',
    competencia: 'Liderança',
    categoria: 'Competências de Liderança',
    descricao: 'Capacidade de influenciar, motivar e guiar outros em direção aos objetivos',
    exemplos: [
      'Motivação e engajamento da equipe',
      'Tomada de decisões eficazes',
      'Desenvolvimento de pessoas',
      'Gestão de conflitos'
    ],
    peso: 3,
    escala: [
      { valor: 1, label: 'Insatisfatório', descricao: 'Dificuldade em liderar ou influenciar outros' },
      { valor: 2, label: 'Parcialmente Satisfatório', descricao: 'Lidera em situações específicas' },
      { valor: 3, label: 'Satisfatório', descricao: 'Liderança eficaz em situações rotineiras' },
      { valor: 4, label: 'Bom', descricao: 'Líder respeitado, inspira confiança' },
      { valor: 5, label: 'Excepcional', descricao: 'Líder excepcional que desenvolve outros líderes' }
    ]
  },
  {
    id: 'inovacao',
    competencia: 'Inovação e Criatividade',
    categoria: 'Competências Técnicas',
    descricao: 'Capacidade de gerar ideias criativas e implementar soluções inovadoras',
    exemplos: [
      'Proposição de melhorias em processos',
      'Ideias criativas para produtos/serviços',
      'Adaptação a mudanças',
      'Experimentação de novas abordagens'
    ],
    peso: 2,
    escala: [
      { valor: 1, label: 'Insatisfatório', descricao: 'Resistente a mudanças, poucas ideias novas' },
      { valor: 2, label: 'Parcialmente Satisfatório', descricao: 'Ocasionalmente propõe melhorias' },
      { valor: 3, label: 'Satisfatório', descricao: 'Contribui com ideias e aceita mudanças' },
      { valor: 4, label: 'Bom', descricao: 'Proativo em propor inovações' },
      { valor: 5, label: 'Excepcional', descricao: 'Líder em inovação, influencia mudanças positivas' }
    ]
  }
];

const EstadoLoading = () => (
  <div className="flex items-center justify-center py-16">
    <div className="text-center">
      <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
      <p className="text-gray-500">Carregando critérios de avaliação...</p>
    </div>
  </div>
);

export default function AutoAvaliacao({ funcionario, ciclo, progresso }: AutoavaliacaoProps) {
  // Estados principais
  const [criterios, setCriterios] = useState<Criterio[]>([]);
  const [respostas, setRespostas] = useState<Record<string, RespostaAutoavaliacao>>({});
  const [criterioAtual, setCriterioAtual] = useState(0);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [alterado, setAlterado] = useState(false);
  
  // Auto-save
  const [ultimoSalvamento, setUltimoSalvamento] = useState<Date | null>(null);
  const [salvandoAuto, setSalvandoAuto] = useState(false);

  const montadoRef = useRef(true);
  
  useEffect(() => {
    montadoRef.current = true;
    return () => { montadoRef.current = false; };
  }, []);

  // Carregamento inicial
  const carregarDados = useCallback(async () => {
    if (!montadoRef.current) return;
    
    setCarregando(true);
    
    const timeoutId = setTimeout(() => {
      if (montadoRef.current) {
        setCarregando(false);
        toast.error('Tempo de carregamento excedido');
      }
    }, 8000);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (montadoRef.current) {
        setCriterios(criteriosMock);
        
        // Simular dados salvos previamente
        const respostasSalvas: Record<string, RespostaAutoavaliacao> = {};
        criteriosMock.forEach((criterio, index) => {
          if (index < 2) { // Simular progresso parcial
            respostasSalvas[criterio.id] = {
              criterio_id: criterio.id,
              nota: index === 0 ? 4 : 3,
              comentario: index === 0 ? 'Considero que tenho boa comunicação com a equipe.' : '',
              exemplos_situacao: index === 0 ? 'Liderei apresentações para stakeholders.' : ''
            };
          }
        });
        
        setRespostas(respostasSalvas);
        setUltimoSalvamento(new Date());
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      if (montadoRef.current) {
        toast.error('Falha ao carregar critérios');
      }
    } finally {
      clearTimeout(timeoutId);
      if (montadoRef.current) {
        setCarregando(false);
      }
    }
  }, []);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  // Auto-save debounced
  useEffect(() => {
    if (!alterado) return;
    
    const timeoutId = setTimeout(() => {
      salvarProgresso(true);
    }, 3000);
    
    return () => clearTimeout(timeoutId);
  }, [respostas, alterado]);

  // Cálculos de progresso
  const progressoCalculado = useMemo(() => {
    const totalCriterios = criterios.length;
    const criteriosRespondidos = Object.keys(respostas).length;
    return totalCriterios > 0 ? Math.round((criteriosRespondidos / totalCriterios) * 100) : 0;
  }, [criterios, respostas]);

  const criterioAtualData = criterios[criterioAtual];
  const respostaAtual = criterioAtualData ? respostas[criterioAtualData.id] : null;

  // Handlers
  const handleResposta = useCallback((campo: string, valor: any) => {
    if (!criterioAtualData) return;
    
    setRespostas(prev => ({
      ...prev,
      [criterioAtualData.id]: {
        criterio_id: criterioAtualData.id,
        nota: campo === 'nota' ? valor : prev[criterioAtualData.id]?.nota || 0,
        comentario: campo === 'comentario' ? valor : prev[criterioAtualData.id]?.comentario || '',
        exemplos_situacao: campo === 'exemplos_situacao' ? valor : prev[criterioAtualData.id]?.exemplos_situacao || ''
      }
    }));
    
    setAlterado(true);
  }, [criterioAtualData]);

  const salvarProgresso = useCallback(async (autoSave = false) => {
    if (!montadoRef.current) return;
    
    if (autoSave) {
      setSalvandoAuto(true);
    } else {
      setSalvando(true);
    }
    
    const timeoutId = setTimeout(() => {
      if (montadoRef.current) {
        setSalvandoAuto(false);
        setSalvando(false);
        if (!autoSave) {
          toast.error('Tempo de salvamento excedido');
        }
      }
    }, 8000);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      if (montadoRef.current) {
        setUltimoSalvamento(new Date());
        setAlterado(false);
        
        if (!autoSave) {
          toast.success('Progresso salvo com sucesso');
        }
      }
    } catch (error) {
      console.error('Erro ao salvar:', error);
      if (montadoRef.current && !autoSave) {
        toast.error('Falha ao salvar progresso');
      }
    } finally {
      clearTimeout(timeoutId);
      if (montadoRef.current) {
        setSalvandoAuto(false);
        setSalvando(false);
      }
    }
  }, []);

  const submeterAvaliacao = useCallback(async () => {
    if (!montadoRef.current) return;
    
    // Validar se todas as competências foram avaliadas
    const criteriosIncompletos = criterios.filter(c => !respostas[c.id]?.nota);
    
    if (criteriosIncompletos.length > 0) {
      toast.error(`Complete a avaliação de todas as competências (${criteriosIncompletos.length} pendentes)`);
      return;
    }
    
    setSalvando(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (montadoRef.current) {
        toast.success('Auto-avaliação enviada com sucesso!');
        // Aqui seria redirecionado ou atualizado o estado global
      }
    } catch (error) {
      console.error('Erro ao submeter:', error);
      if (montadoRef.current) {
        toast.error('Falha ao enviar avaliação');
      }
    } finally {
      if (montadoRef.current) {
        setSalvando(false);
      }
    }
  }, [criterios, respostas]);

  const proximoCriterio = () => {
    if (criterioAtual < criterios.length - 1) {
      setCriterioAtual(criterioAtual + 1);
    }
  };

  const criterioAnterior = () => {
    if (criterioAtual > 0) {
      setCriterioAtual(criterioAtual - 1);
    }
  };

  if (carregando) return <EstadoLoading />;

  return (
    <div className="space-y-6">
      
      {/* Header com Progresso */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <LucideIcons.User className="h-5 w-5" />
                Auto-avaliação de Desempenho
              </CardTitle>
              <CardDescription>
                Avalie seu próprio desempenho em cada competência
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">{progressoCalculado}%</div>
              <div className="text-sm text-gray-500">Concluído</div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Progress value={progressoCalculado} className="h-3" />
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">
                {Object.keys(respostas).length} de {criterios.length} competências avaliadas
              </span>
              <div className="flex items-center gap-2">
                {ultimoSalvamento && (
                  <span className="text-green-600 text-xs">
                    Salvo {ultimoSalvamento.toLocaleTimeString()}
                  </span>
                )}
                {salvandoAuto && (
                  <div className="flex items-center gap-1 text-blue-600 text-xs">
                    <LucideIcons.Loader2 className="h-3 w-3 animate-spin" />
                    Salvando...
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Lista de Critérios (Sidebar) */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Competências</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-1">
              {criterios.map((criterio, index) => {
                const isAtual = index === criterioAtual;
                const isCompleto = !!respostas[criterio.id]?.nota;
                
                return (
                  <button
                    key={criterio.id}
                    onClick={() => setCriterioAtual(index)}
                    className={`w-full p-3 text-left text-sm transition-colors ${
                      isAtual 
                        ? 'bg-blue-50 border-r-2 border-blue-500' 
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className={`font-medium ${isAtual ? 'text-blue-700' : 'text-gray-900'}`}>
                          {criterio.competencia}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {criterio.categoria}
                        </p>
                      </div>
                      <div className="ml-2">
                        {isCompleto ? (
                          <LucideIcons.CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <LucideIcons.Circle className="h-4 w-4 text-gray-300" />
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Formulário de Avaliação */}
        <div className="lg:col-span-3 space-y-6">
          
          {criterioAtualData && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">{criterioAtualData.competencia}</CardTitle>
                    <Badge variant="outline" className="mt-2">
                      {criterioAtualData.categoria}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-500">
                    {criterioAtual + 1} de {criterios.length}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                
                {/* Descrição */}
                <div>
                  <h4 className="font-medium mb-2">Descrição da Competência</h4>
                  <p className="text-gray-700">{criterioAtualData.descricao}</p>
                </div>

                {/* Exemplos */}
                <div>
                  <h4 className="font-medium mb-2">Exemplos de Comportamentos</h4>
                  <ul className="space-y-1">
                    {criterioAtualData.exemplos.map((exemplo, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                        <LucideIcons.Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        {exemplo}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Escala de Avaliação */}
                <div>
                  <Label className="text-base font-medium">
                    Como você avalia seu desempenho nesta competência?
                  </Label>
                  <RadioGroup
                    value={respostaAtual?.nota?.toString() || ''}
                    onValueChange={(valor) => handleResposta('nota', parseInt(valor))}
                    className="mt-3"
                  >
                    {criterioAtualData.escala.map((nivel) => (
                      <div key={nivel.valor} className="flex items-start space-x-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50">
                        <RadioGroupItem 
                          value={nivel.valor.toString()} 
                          id={`nota-${nivel.valor}`}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <Label 
                            htmlFor={`nota-${nivel.valor}`}
                            className="font-medium cursor-pointer"
                          >
                            {nivel.valor} - {nivel.label}
                          </Label>
                          <p className="text-sm text-gray-600 mt-1">
                            {nivel.descricao}
                          </p>
                        </div>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                {/* Comentários */}
                <div>
                  <Label htmlFor="comentario" className="text-base font-medium">
                    Comentário sobre sua auto-avaliação (opcional)
                  </Label>
                  <Textarea
                    id="comentario"
                    placeholder="Explique sua auto-avaliação nesta competência..."
                    value={respostaAtual?.comentario || ''}
                    onChange={(e) => handleResposta('comentario', e.target.value)}
                    className="mt-2"
                    rows={3}
                  />
                </div>

                {/* Exemplos de Situação */}
                <div>
                  <Label htmlFor="exemplos" className="text-base font-medium">
                    Exemplos de situações onde demonstrou esta competência (opcional)
                  </Label>
                  <Textarea
                    id="exemplos"
                    placeholder="Descreva situações específicas onde aplicou esta competência..."
                    value={respostaAtual?.exemplos_situacao || ''}
                    onChange={(e) => handleResposta('exemplos_situacao', e.target.value)}
                    className="mt-2"
                    rows={3}
                  />
                </div>

                {/* Navegação */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={criterioAnterior}
                    disabled={criterioAtual === 0}
                  >
                    <LucideIcons.ChevronLeft className="mr-2 h-4 w-4" />
                    Anterior
                  </Button>

                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      onClick={() => salvarProgresso(false)}
                      disabled={salvando}
                    >
                      {salvando ? (
                        <LucideIcons.Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <LucideIcons.Save className="mr-2 h-4 w-4" />
                      )}
                      Salvar Progresso
                    </Button>

                    {criterioAtual === criterios.length - 1 ? (
                      <Button
                        onClick={submeterAvaliacao}
                        disabled={salvando || Object.keys(respostas).length < criterios.length}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {salvando ? (
                          <LucideIcons.Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <LucideIcons.Send className="mr-2 h-4 w-4" />
                        )}
                        Finalizar Auto-avaliação
                      </Button>
                    ) : (
                      <Button
                        onClick={proximoCriterio}
                        disabled={criterioAtual === criterios.length - 1}
                      >
                        Próximo
                        <LucideIcons.ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>

              </CardContent>
            </Card>
          )}

          {/* Indicador de Alterações */}
          {alterado && (
            <div className="fixed bottom-4 right-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3 shadow-lg">
              <div className="flex items-center text-yellow-800">
                <LucideIcons.AlertTriangle className="h-4 w-4 mr-2" />
                <span className="text-sm">Alterações não salvas</span>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}