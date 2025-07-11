// src/app/showcase/onboarding-saas/etapa-tutorial-interativo.tsx
'use client'

import React, { useState, useRef, useCallback, useEffect } from 'react'
import { toast } from 'sonner'
import * as LucideIcons from 'lucide-react'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

interface EtapaTutorialInterativoProps {
  dados: any;
  onAtualizarDados: (dados: any) => void;
  onProxima: () => void;
  onAnterior: () => void;
  salvando: boolean;
  etapaAtual: number;
  totalEtapas: number;
}

export default function EtapaTutorialInterativo({
  dados,
  onAtualizarDados,
  onProxima,
  onAnterior,
  salvando,
  etapaAtual,
  totalEtapas
}: EtapaTutorialInterativoProps) {
  const [etapaTutorial, setEtapaTutorial] = useState(0);
  const [tutorialIniciado, setTutorialIniciado] = useState(false);
  const [etapasConcluidasTutorial, setEtapasConcluidasTutorial] = useState<string[]>([]);
  
  const montadoRef = useRef(true);

  useEffect(() => {
    montadoRef.current = true;
    return () => { montadoRef.current = false; };
  }, []);

  const etapasTutorial = [
    {
      id: 'navegacao',
      titulo: 'Navegação Principal',
      descricao: 'Aprenda a navegar entre as principais seções',
      icone: 'Map',
      duracao: '2 min',
      interativo: true,
      conteudo: {
        explicacao: 'O menu principal está sempre disponível na lateral esquerda. Clique nos ícones para acessar diferentes seções.',
        passos: [
          'Observe o menu lateral com todas as opções',
          'Clique em "Dashboard" para ver a visão geral',
          'Navegue para "Projetos" e depois "Configurações"',
          'Use o botão de busca para encontrar funcionalidades'
        ]
      }
    },
    {
      id: 'dashboard',
      titulo: 'Dashboard e Métricas',
      descricao: 'Entenda como interpretar os dados principais',
      icone: 'BarChart3',
      duracao: '3 min',
      interativo: true,
      conteudo: {
        explicacao: 'O dashboard mostra um resumo das informações mais importantes do seu negócio.',
        passos: [
          'Veja os cards de métricas no topo',
          'Analise os gráficos de tendência',
          'Use os filtros de período',
          'Explore os detalhes clicando nos elementos'
        ]
      }
    },
    {
      id: 'criacao',
      titulo: 'Criando seu Primeiro Projeto',
      descricao: 'Vamos criar um projeto de exemplo juntos',
      icone: 'Plus',
      duracao: '4 min',
      interativo: true,
      conteudo: {
        explicacao: 'Projetos são a forma de organizar seu trabalho. Vamos criar um exemplo.',
        passos: [
          'Clique no botão "+" no menu principal',
          'Preencha o nome: "Meu Primeiro Projeto"',
          'Escolha uma cor e ícone',
          'Adicione uma descrição',
          'Salve o projeto'
        ]
      }
    },
    {
      id: 'colaboracao',
      titulo: 'Convidando sua Equipe',
      descricao: 'Saiba como adicionar colaboradores',
      icone: 'Users',
      duracao: '2 min',
      interativo: true,
      conteudo: {
        explicacao: 'Trabalhe em equipe convidando colegas para colaborar nos seus projetos.',
        passos: [
          'Acesse as configurações do projeto',
          'Clique em "Convidar membros"',
          'Digite o email do colaborador',
          'Defina as permissões',
          'Envie o convite'
        ]
      }
    },
    {
      id: 'personalizacao',
      titulo: 'Personalizando a Interface',
      descricao: 'Ajuste a plataforma às suas necessidades',
      icone: 'Palette',
      duracao: '3 min',
      interativo: true,
      conteudo: {
        explicacao: 'Personalize a interface para trabalhar da forma que você prefere.',
        passos: [
          'Acesse "Configurações" > "Aparência"',
          'Escolha entre tema claro ou escuro',
          'Ajuste o layout do dashboard',
          'Configure notificações',
          'Salve suas preferências'
        ]
      }
    }
  ];

  const progressoTutorial = (etapasConcluidasTutorial.length / etapasTutorial.length) * 100;

  const handleIniciarTutorial = useCallback(() => {
    setTutorialIniciado(true);
    setEtapaTutorial(0);
    toast.success('Tutorial iniciado! Vamos começar a explorar.');
  }, []);

  const handleConcluirEtapaTutorial = useCallback((etapaId: string) => {
    if (!etapasConcluidasTutorial.includes(etapaId)) {
      const novasEtapas = [...etapasConcluidasTutorial, etapaId];
      setEtapasConcluidasTutorial(novasEtapas);
      
      const etapaAtual = etapasTutorial.find(e => e.id === etapaId);
      toast.success(`"${etapaAtual?.titulo}" concluído!`);
      
      // Próxima etapa automaticamente
      const proximoIndice = etapasTutorial.findIndex(e => e.id === etapaId) + 1;
      if (proximoIndice < etapasTutorial.length) {
        setTimeout(() => {
          setEtapaTutorial(proximoIndice);
        }, 1000);
      }
    }
  }, [etapasConcluidasTutorial, etapasTutorial]);

  const handleConcluirTutorial = useCallback(() => {
    onAtualizarDados({ 
      tutorialCompleto: true,
      etapas_concluidas: etapasConcluidasTutorial 
    });
    toast.success('Tutorial concluído! Você está pronto para usar a plataforma.');
    onProxima();
  }, [etapasConcluidasTutorial, onAtualizarDados, onProxima]);

  const handlePularTutorial = useCallback(() => {
    onAtualizarDados({ 
      tutorialCompleto: true,
      etapas_concluidas: [] 
    });
    toast.info('Tutorial pulado. Você pode acessá-lo depois em Ajuda > Tutorial.');
    onProxima();
  }, [onAtualizarDados, onProxima]);

  const renderizarEtapaTutorial = useCallback((etapa: typeof etapasTutorial[0], indice: number) => {
    const IconeComponente = LucideIcons[etapa.icone as keyof typeof LucideIcons] as any;
    const isConcluida = etapasConcluidasTutorial.includes(etapa.id);
    const isAtual = etapaTutorial === indice && tutorialIniciado;
    const isAcessivel = indice <= etapaTutorial || isConcluida;

    return (
      <Card
        key={etapa.id}
        className={`transition-all cursor-pointer ${
          isAtual 
            ? 'border-blue-500 bg-blue-50 shadow-md' 
            : isConcluida 
              ? 'border-green-500 bg-green-50'
              : 'border-gray-200'
        } ${!isAcessivel ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md'}`}
        onClick={() => isAcessivel && setEtapaTutorial(indice)}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              isConcluida 
                ? 'bg-green-500 text-white'
                : isAtual 
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-400'
            }`}>
              {isConcluida ? (
                <LucideIcons.Check className="h-5 w-5" />
              ) : (
                <IconeComponente className="h-5 w-5" />
              )}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <h3 className={`font-medium ${isAtual ? 'text-blue-900' : 'text-gray-900'}`}>
                  {etapa.titulo}
                </h3>
                <Badge variant="outline" className="text-xs">
                  {etapa.duracao}
                </Badge>
              </div>
              <p className="text-sm text-gray-600 mb-2">{etapa.descricao}</p>
              
              {isAtual && tutorialIniciado && (
                <div className="space-y-3 mt-4 p-3 bg-white rounded-lg border">
                  <p className="text-sm text-gray-700">{etapa.conteudo.explicacao}</p>
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-900">Passos:</h4>
                    <ol className="text-sm text-gray-600 space-y-1">
                      {etapa.conteudo.passos.map((passo, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="w-4 h-4 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium mt-0.5 flex-shrink-0">
                            {i + 1}
                          </span>
                          {passo}
                        </li>
                      ))}
                    </ol>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleConcluirEtapaTutorial(etapa.id)}
                    className="w-full"
                  >
                    <LucideIcons.CheckCircle className="mr-2 h-4 w-4" />
                    Marcar como Concluído
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }, [etapaTutorial, tutorialIniciado, etapasConcluidasTutorial, handleConcluirEtapaTutorial]);

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LucideIcons.PlayCircle className="h-5 w-5" />
            Tutorial Interativo
          </CardTitle>
          <CardDescription>
            Aprenda a usar a plataforma com um tutorial prático e interativo. 
            Demora apenas 15 minutos e você estará pronto para começar!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!tutorialIniciado ? (
            // Tela inicial do tutorial
            <div className="text-center space-y-6">
              <div className="w-24 h-24 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto">
                <LucideIcons.Rocket className="h-12 w-12 text-white" />
              </div>
              
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Vamos fazer um tour pela plataforma!
                </h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  Um tutorial rápido e prático para você dominar as principais funcionalidades.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <LucideIcons.Clock className="h-6 w-6 text-blue-600" />
                  </div>
                  <h4 className="font-medium text-gray-900">15 minutos</h4>
                  <p className="text-sm text-gray-600">Tutorial completo</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <LucideIcons.Mouse className="h-6 w-6 text-green-600" />
                  </div>
                  <h4 className="font-medium text-gray-900">Interativo</h4>
                  <p className="text-sm text-gray-600">Pratique enquanto aprende</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <LucideIcons.BookOpen className="h-6 w-6 text-purple-600" />
                  </div>
                  <h4 className="font-medium text-gray-900">5 módulos</h4>
                  <p className="text-sm text-gray-600">Funcionalidades essenciais</p>
                </div>
              </div>

              <div className="flex gap-3 justify-center">
                <Button
                  variant="outline"
                  onClick={handlePularTutorial}
                >
                  Pular Tutorial
                </Button>
                <Button
                  onClick={handleIniciarTutorial}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  <LucideIcons.Play className="mr-2 h-4 w-4" />
                  Iniciar Tutorial
                </Button>
              </div>
            </div>
          ) : (
            // Tutorial em andamento
            <div className="space-y-6">
              {/* Progresso */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    Progresso do Tutorial
                  </span>
                  <span className="text-sm text-gray-500">
                    {etapasConcluidasTutorial.length} de {etapasTutorial.length} concluídos
                  </span>
                </div>
                <Progress value={progressoTutorial} className="h-2" />
              </div>

              {/* Etapas do tutorial */}
              <div className="space-y-4">
                {etapasTutorial.map(renderizarEtapaTutorial)}
              </div>

              {/* Ações do tutorial */}
              {etapasConcluidasTutorial.length === etapasTutorial.length && (
                <Card className="bg-green-50 border-green-200">
                  <CardContent className="p-6 text-center">
                    <LucideIcons.Trophy className="h-12 w-12 text-green-600 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-green-900 mb-2">
                      Parabéns! Tutorial Concluído!
                    </h3>
                    <p className="text-green-700 mb-4">
                      Você agora conhece as principais funcionalidades da plataforma.
                    </p>
                    <Button
                      onClick={handleConcluirTutorial}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <LucideIcons.CheckCircle className="mr-2 h-4 w-4" />
                      Finalizar Tutorial
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dicas adicionais */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <LucideIcons.Lightbulb className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-blue-900 mb-2">Dicas para aproveitar melhor</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Você pode refazer o tutorial a qualquer momento em Ajuda {'>'} Tutorial</li>
                <li>• Use o atalho "?" para abrir a ajuda contextual em qualquer tela</li>
                <li>• Explore os tooltips passando o mouse sobre os elementos</li>
                <li>• Nossa base de conhecimento tem artigos detalhados sobre cada funcionalidade</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ações */}
      <div className="flex justify-between items-center pt-6">
        <Button
          variant="outline"
          onClick={onAnterior}
          disabled={salvando}
        >
          <LucideIcons.ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
        
        <div className="text-sm text-gray-500">
          Etapa {etapaAtual + 1} de {totalEtapas}
        </div>
        
        <Button 
          onClick={handlePularTutorial}
          disabled={salvando}
          variant="outline"
        >
          Pular por Agora
        </Button>
      </div>
    </div>
  );
}