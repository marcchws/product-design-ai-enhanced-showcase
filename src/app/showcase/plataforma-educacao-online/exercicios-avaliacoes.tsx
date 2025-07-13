'use client'

import React, { useState, useCallback, useRef, useEffect } from 'react'
import { toast } from 'sonner'
import * as LucideIcons from 'lucide-react'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"

interface ExerciciosAvaliacoesProps {
  usuario: any;
  dados: any;
  carregando: boolean;
  erro: string | null;
  onRecarregar: () => void;
}

interface Questao {
  id: number;
  tipo: 'multipla_escolha' | 'verdadeiro_falso' | 'dissertativa' | 'multipla_selecao';
  pergunta: string;
  opcoes?: string[];
  resposta_correta?: string | string[];
  pontos: number;
  explicacao?: string;
}

const questoesMock: Questao[] = [
  {
    id: 1,
    tipo: 'multipla_escolha',
    pergunta: 'Qual hook é usado para gerenciar estado em componentes funcionais React?',
    opcoes: ['useEffect', 'useState', 'useContext', 'useCallback'],
    resposta_correta: 'useState',
    pontos: 10,
    explicacao: 'useState é o hook fundamental para gerenciar estado local em componentes funcionais.'
  },
  {
    id: 2,
    tipo: 'multipla_selecao',
    pergunta: 'Quais são vantagens do Context API? (Selecione todas corretas)',
    opcoes: [
      'Evita prop drilling',
      'Gerencia estado global',
      'Melhora performance automaticamente',
      'Simplifica compartilhamento de dados'
    ],
    resposta_correta: ['Evita prop drilling', 'Gerencia estado global', 'Simplifica compartilhamento de dados'],
    pontos: 15,
    explicacao: 'Context API resolve prop drilling e facilita compartilhamento, mas não melhora performance automaticamente.'
  },
  {
    id: 3,
    tipo: 'verdadeiro_falso',
    pergunta: 'useReducer é sempre melhor que useState para qualquer tipo de estado.',
    resposta_correta: 'false',
    pontos: 10,
    explicacao: 'useReducer é melhor para estado complexo, mas useState é suficiente para casos simples.'
  },
  {
    id: 4,
    tipo: 'dissertativa',
    pergunta: 'Explique quando você usaria useReducer ao invés de useState.',
    pontos: 20,
    explicacao: 'useReducer é preferível para estado complexo com múltiplas sub-valores ou quando o próximo estado depende do anterior.'
  }
];

const EstadoLoading = () => (
  <div className="space-y-4">
    <Card>
      <CardContent className="pt-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="space-y-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-8 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);

export default function ExerciciosAvaliacoes({ 
  usuario, 
  dados, 
  carregando, 
  erro, 
  onRecarregar 
}: ExerciciosAvaliacoesProps) {
  const [quizAtivo, setQuizAtivo] = useState(false);
  const [questaoAtual, setQuestaoAtual] = useState(0);
  const [respostas, setRespostas] = useState<Record<number, any>>({});
  const [quizConcluido, setQuizConcluido] = useState(false);
  const [pontuacao, setPontuacao] = useState(0);
  const [tempoRestante, setTempoRestante] = useState(20 * 60); // 20 minutos em segundos
  const [mostrarResultados, setMostrarResultados] = useState(false);

  const montadoRef = useRef(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    montadoRef.current = true;
    return () => { 
      montadoRef.current = false;
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Timer do quiz
  useEffect(() => {
    if (quizAtivo && !quizConcluido && tempoRestante > 0) {
      timerRef.current = setInterval(() => {
        setTempoRestante(prev => {
          if (prev <= 1) {
            finalizarQuiz();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      };
    }
  }, [quizAtivo, quizConcluido, tempoRestante]);

  const formatarTempo = useCallback((segundos: number) => {
    const minutos = Math.floor(segundos / 60);
    const segs = segundos % 60;
    return `${minutos.toString().padStart(2, '0')}:${segs.toString().padStart(2, '0')}`;
  }, []);

  const iniciarQuiz = useCallback(() => {
    setQuizAtivo(true);
    setQuestaoAtual(0);
    setRespostas({});
    setQuizConcluido(false);
    setPontuacao(0);
    setMostrarResultados(false);
    setTempoRestante(20 * 60);
    toast.success('Quiz iniciado! Boa sorte!');
  }, []);

  const responderQuestao = useCallback((questaoId: number, resposta: any) => {
    setRespostas(prev => ({ ...prev, [questaoId]: resposta }));
  }, []);

  const proximaQuestao = useCallback(() => {
    if (questaoAtual < questoesMock.length - 1) {
      setQuestaoAtual(prev => prev + 1);
    } else {
      finalizarQuiz();
    }
  }, [questaoAtual]);

  const questaoAnterior = useCallback(() => {
    if (questaoAtual > 0) {
      setQuestaoAtual(prev => prev - 1);
    }
  }, [questaoAtual]);

  const finalizarQuiz = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    setQuizConcluido(true);
    
    // Calcular pontuação
    let pontos = 0;
    questoesMock.forEach(questao => {
      const resposta = respostas[questao.id];
      if (!resposta) return;

      switch (questao.tipo) {
        case 'multipla_escolha':
        case 'verdadeiro_falso':
          if (resposta === questao.resposta_correta) {
            pontos += questao.pontos;
          }
          break;
        case 'multipla_selecao':
          const respostasCorretas = questao.resposta_correta as string[];
          const respostasUsuario = Array.isArray(resposta) ? resposta : [];
          if (respostasCorretas.length === respostasUsuario.length &&
              respostasCorretas.every(r => respostasUsuario.includes(r))) {
            pontos += questao.pontos;
          }
          break;
        case 'dissertativa':
          // Para dissertativas, simular pontuação (em um sistema real seria avaliação manual/IA)
          if (resposta && resposta.length > 50) {
            pontos += Math.floor(questao.pontos * 0.8); // 80% da pontuação
          }
          break;
      }
    });

    setPontuacao(pontos);
    toast.success(`Quiz finalizado! Pontuação: ${pontos}/${questoesMock.reduce((total, q) => total + q.pontos, 0)}`);
  }, [respostas]);

  const mostrarResultadosDetalhados = useCallback(() => {
    setMostrarResultados(true);
  }, []);

  const reiniciarQuiz = useCallback(() => {
    setQuizAtivo(false);
    setQuestaoAtual(0);
    setRespostas({});
    setQuizConcluido(false);
    setPontuacao(0);
    setMostrarResultados(false);
    setTempoRestante(20 * 60);
  }, []);

  // Estados UI obrigatórios
  if (carregando) return <EstadoLoading />;

  // Interface principal de exercícios
  if (!quizAtivo) {
    return (
      <div className="space-y-6">
        {/* Resumo de exercícios */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <LucideIcons.PenTool className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-2xl font-bold">{dados?.pendentes || 8}</p>
                  <p className="text-sm text-gray-500">Exercícios Pendentes</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <LucideIcons.CheckCircle className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-2xl font-bold">{dados?.concluidos_hoje || 3}</p>
                  <p className="text-sm text-gray-500">Concluídos Hoje</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <LucideIcons.Target className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-2xl font-bold">85%</p>
                  <p className="text-sm text-gray-500">Taxa de Acerto</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quiz disponível */}
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">Quiz: JavaScript ES6+</CardTitle>
                <CardDescription>
                  Teste seus conhecimentos sobre recursos modernos do JavaScript
                </CardDescription>
              </div>
              <Badge variant="secondary">Intermediário</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="flex items-center gap-2">
                <LucideIcons.HelpCircle className="h-4 w-4 text-blue-600" />
                <span className="text-sm">15 questões</span>
              </div>
              <div className="flex items-center gap-2">
                <LucideIcons.Clock className="h-4 w-4 text-blue-600" />
                <span className="text-sm">20 minutos</span>
              </div>
              <div className="flex items-center gap-2">
                <LucideIcons.Award className="h-4 w-4 text-blue-600" />
                <span className="text-sm">100 XP</span>
              </div>
            </div>

            <Button onClick={iniciarQuiz} size="lg" className="w-full md:w-auto">
              <LucideIcons.PlayCircle className="mr-2 h-5 w-5" />
              Iniciar Quiz
            </Button>
          </CardContent>
        </Card>

        {/* Projetos práticos */}
        <Card>
          <CardHeader>
            <CardTitle>Projetos Práticos</CardTitle>
            <CardDescription>Aplique seus conhecimentos em projetos reais</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dados?.projetos?.map((projeto: any) => (
                <div key={projeto.titulo} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium">{projeto.titulo}</h4>
                    <p className="text-sm text-gray-500">
                      Prazo: {new Date(projeto.prazo).toLocaleDateString('pt-BR')}
                    </p>
                    <div className="mt-2">
                      <Progress value={projeto.progresso} className="h-2" />
                      <p className="text-xs text-gray-500 mt-1">{projeto.progresso}% concluído</p>
                    </div>
                  </div>
                  <div className="ml-4">
                    <Badge variant={projeto.status === 'em_progresso' ? 'default' : 'outline'}>
                      {projeto.status === 'em_progresso' ? 'Em progresso' : 'Pendente'}
                    </Badge>
                  </div>
                </div>
              )) || (
                <div className="text-center py-8">
                  <LucideIcons.FolderOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Nenhum projeto disponível no momento</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Interface do quiz ativo
  const questao = questoesMock[questaoAtual];
  const respostaAtual = respostas[questao.id];
  const progressoQuiz = ((questaoAtual + 1) / questoesMock.length) * 100;

  if (quizConcluido && mostrarResultados) {
    // Tela de resultados detalhados
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Resultados Detalhados</CardTitle>
            <CardDescription>
              Pontuação: {pontuacao}/{questoesMock.reduce((total, q) => total + q.pontos, 0)} pontos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {questoesMock.map((q, index) => {
                const resposta = respostas[q.id];
                const isCorreta = (() => {
                  switch (q.tipo) {
                    case 'multipla_escolha':
                    case 'verdadeiro_falso':
                      return resposta === q.resposta_correta;
                    case 'multipla_selecao':
                      const corretas = q.resposta_correta as string[];
                      const usuario = Array.isArray(resposta) ? resposta : [];
                      return corretas.length === usuario.length && 
                             corretas.every(r => usuario.includes(r));
                    case 'dissertativa':
                      return resposta && resposta.length > 50;
                    default:
                      return false;
                  }
                })();

                return (
                  <div key={q.id} className={`p-4 border rounded-lg ${isCorreta ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-sm font-medium">Questão {index + 1}</span>
                      <div className="flex items-center gap-2">
                        {isCorreta ? (
                          <LucideIcons.CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <LucideIcons.XCircle className="h-4 w-4 text-red-600" />
                        )}
                        <span className="text-sm">{isCorreta ? q.pontos : 0}/{q.pontos} pts</span>
                      </div>
                    </div>
                    
                    <p className="font-medium mb-2">{q.pergunta}</p>
                    
                    {q.tipo !== 'dissertativa' && (
                      <div className="space-y-1 mb-2">
                        <p className="text-sm">
                          <strong>Sua resposta:</strong> {
                            Array.isArray(resposta) ? resposta.join(', ') : (resposta || 'Não respondida')
                          }
                        </p>
                        <p className="text-sm text-green-700">
                          <strong>Resposta correta:</strong> {
                            Array.isArray(q.resposta_correta) 
                              ? q.resposta_correta.join(', ') 
                              : q.resposta_correta
                          }
                        </p>
                      </div>
                    )}
                    
                    {q.explicacao && (
                      <div className="mt-3 p-3 bg-blue-50 rounded border-l-4 border-blue-400">
                        <p className="text-sm text-blue-800">
                          <strong>Explicação:</strong> {q.explicacao}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            
            <div className="flex justify-center mt-8">
              <Button onClick={reiniciarQuiz}>
                <LucideIcons.RotateCcw className="mr-2 h-4 w-4" />
                Fazer Novamente
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (quizConcluido) {
    // Tela de conclusão do quiz
    const percentualAcerto = (pontuacao / questoesMock.reduce((total, q) => total + q.pontos, 0)) * 100;
    
    return (
      <div className="space-y-6">
        <Card className="text-center">
          <CardContent className="pt-8 pb-8">
            <div className="mb-6">
              {percentualAcerto >= 80 ? (
                <LucideIcons.Trophy className="h-16 w-16 text-yellow-500 mx-auto" />
              ) : percentualAcerto >= 60 ? (
                <LucideIcons.Award className="h-16 w-16 text-blue-500 mx-auto" />
              ) : (
                <LucideIcons.Target className="h-16 w-16 text-gray-500 mx-auto" />
              )}
            </div>
            
            <h2 className="text-2xl font-bold mb-2">Quiz Concluído!</h2>
            <p className="text-gray-600 mb-6">
              {percentualAcerto >= 80 ? 'Excelente resultado!' : 
               percentualAcerto >= 60 ? 'Bom trabalho!' : 
               'Continue estudando!'}
            </p>
            
            <div className="space-y-4">
              <div className="text-4xl font-bold text-blue-600">
                {pontuacao}/{questoesMock.reduce((total, q) => total + q.pontos, 0)}
              </div>
              <p className="text-gray-500">pontos conquistados</p>
              
              <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                <div>
                  <p className="text-lg font-semibold">{percentualAcerto.toFixed(0)}%</p>
                  <p className="text-sm text-gray-500">Taxa de acerto</p>
                </div>
                <div>
                  <p className="text-lg font-semibold">+{Math.floor(pontuacao * 2)} XP</p>
                  <p className="text-sm text-gray-500">Experiência ganha</p>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
              <Button onClick={mostrarResultadosDetalhados} variant="outline">
                <LucideIcons.Eye className="mr-2 h-4 w-4" />
                Ver Resultados Detalhados
              </Button>
              <Button onClick={reiniciarQuiz}>
                <LucideIcons.RotateCcw className="mr-2 h-4 w-4" />
                Fazer Novamente
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Interface do quiz em andamento
  return (
    <div className="space-y-6">
      {/* Header do quiz */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold">Quiz: JavaScript ES6+</h2>
              <p className="text-sm text-gray-500">
                Questão {questaoAtual + 1} de {questoesMock.length}
              </p>
            </div>
            <div className="text-right">
              <div className="text-lg font-mono font-semibold text-blue-600">
                {formatarTempo(tempoRestante)}
              </div>
              <p className="text-xs text-gray-500">Tempo restante</p>
            </div>
          </div>
          
          <Progress value={progressoQuiz} className="h-2" />
        </CardContent>
      </Card>

      {/* Questão atual */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {questao.pergunta}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline">{questao.pontos} pontos</Badge>
            <Badge variant="secondary">
              {questao.tipo.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {questao.tipo === 'multipla_escolha' && (
              <RadioGroup
                value={respostaAtual || ''}
                onValueChange={(valor) => responderQuestao(questao.id, valor)}
              >
                {questao.opcoes?.map((opcao, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <RadioGroupItem value={opcao} id={`opcao-${index}`} />
                    <Label htmlFor={`opcao-${index}`} className="flex-1 cursor-pointer">
                      {opcao}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            )}

            {questao.tipo === 'multipla_selecao' && (
              <div className="space-y-2">
                {questao.opcoes?.map((opcao, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Checkbox
                      id={`checkbox-${index}`}
                      checked={respostaAtual?.includes(opcao) || false}
                      onCheckedChange={(checked) => {
                        const respostasAtuais = respostaAtual || [];
                        if (checked) {
                          responderQuestao(questao.id, [...respostasAtuais, opcao]);
                        } else {
                          responderQuestao(questao.id, respostasAtuais.filter((r: string) => r !== opcao));
                        }
                      }}
                    />
                    <Label htmlFor={`checkbox-${index}`} className="flex-1 cursor-pointer">
                      {opcao}
                    </Label>
                  </div>
                ))}
              </div>
            )}

            {questao.tipo === 'verdadeiro_falso' && (
              <RadioGroup
                value={respostaAtual || ''}
                onValueChange={(valor) => responderQuestao(questao.id, valor)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="true" id="verdadeiro" />
                  <Label htmlFor="verdadeiro" className="cursor-pointer">Verdadeiro</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="false" id="falso" />
                  <Label htmlFor="falso" className="cursor-pointer">Falso</Label>
                </div>
              </RadioGroup>
            )}

            {questao.tipo === 'dissertativa' && (
              <div className="space-y-2">
                <Textarea
                  placeholder="Digite sua resposta aqui..."
                  value={respostaAtual || ''}
                  onChange={(e) => responderQuestao(questao.id, e.target.value)}
                  className="min-h-[120px]"
                />
                <p className="text-xs text-gray-500">
                  Mínimo 50 caracteres. Atual: {(respostaAtual || '').length}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Navegação */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={questaoAnterior}
          disabled={questaoAtual === 0}
        >
          <LucideIcons.ChevronLeft className="mr-2 h-4 w-4" />
          Anterior
        </Button>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={finalizarQuiz}
          >
            Finalizar Quiz
          </Button>
          
          <Button
            onClick={proximaQuestao}
            disabled={!respostaAtual}
          >
            {questaoAtual === questoesMock.length - 1 ? 'Finalizar' : 'Próxima'}
            <LucideIcons.ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Indicador de questões */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-2">
            {questoesMock.map((_, index) => (
              <button
                key={index}
                className={`w-8 h-8 rounded-full text-xs font-medium transition-colors ${
                  index === questaoAtual
                    ? 'bg-blue-600 text-white'
                    : respostas[questoesMock[index].id]
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                onClick={() => setQuestaoAtual(index)}
              >
                {index + 1}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Clique nos números para navegar entre as questões
          </p>
        </CardContent>
      </Card>
    </div>
  );
}