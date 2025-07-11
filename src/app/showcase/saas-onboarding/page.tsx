// src/app/showcase/onboarding-saas/page.tsx
'use client'

import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react'
import { toast, Toaster } from 'sonner'
import * as LucideIcons from 'lucide-react'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// Importar etapas especializadas
import EtapaBoasVindas from './etapa-boas-vindas'
import EtapaInformacoesPessoais from './etapa-informacoes-pessoais'
import EtapaConfiguracaoEmpresa from './etapa-configuracao-empresa'
import EtapaPreferencias from './etapa-preferencias'
import EtapaIntegracoes from './etapa-integracoes'
import EtapaTutorialInterativo from './etapa-tutorial-interativo'
import EtapaConclusao from './etapa-conclusao'

// Funções utilitárias defensivas obrigatórias
const gerarIniciaisNome = (nome: string | undefined): string => {
  if (!nome) return '??';
  
  try {
    const nomeLimpo = nome.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const partesNome = nomeLimpo.trim().split(' ').filter(parte => parte.length > 0);
    
    if (partesNome.length === 0) return '??';
    if (partesNome.length === 1) {
      return partesNome[0].substring(0, 2).toUpperCase();
    }
    
    const primeiraLetra = partesNome[0][0] || '?';
    const ultimaLetra = partesNome[partesNome.length - 1][0] || '?';
    
    return (primeiraLetra + ultimaLetra).toUpperCase();
  } catch (error) {
    console.error('Erro ao gerar iniciais:', error);
    return '??';
  }
};

const calcularProgresso = (etapaAtual: number, totalEtapas: number): number => {
  if (totalEtapas === 0) return 0;
  return Math.round((etapaAtual / totalEtapas) * 100);
};

interface DadosOnboarding {
  // Informações pessoais
  nome: string;
  email: string;
  cargo: string;
  telefone: string;
  avatar?: File | null;
  
  // Informações da empresa
  nomeEmpresa: string;
  tamanhoEmpresa: string;
  setor: string;
  website: string;
  
  // Preferências
  objetivo: string;
  experiencia: string;
  notificacoes: {
    email: boolean;
    push: boolean;
    relatorios: boolean;
  };
  
  // Integrações
  integracoes: string[];
  
  // Tutorial
  tutorialCompleto: boolean;
  etapas_concluidas: string[];
}

interface EtapaOnboarding {
  id: string;
  titulo: string;
  descricao: string;
  icone: string;
  obrigatoria: boolean;
  concluida: boolean;
  dados_necessarios: string[];
}

export default function OnboardingSaaS() {
  // Estados principais
  const [etapaAtual, setEtapaAtual] = useState(0);
  const [dadosOnboarding, setDadosOnboarding] = useState<DadosOnboarding>({
    nome: '',
    email: '',
    cargo: '',
    telefone: '',
    avatar: null,
    nomeEmpresa: '',
    tamanhoEmpresa: '',
    setor: '',
    website: '',
    objetivo: '',
    experiencia: '',
    notificacoes: {
      email: true,
      push: false,
      relatorios: true
    },
    integracoes: [],
    tutorialCompleto: false,
    etapas_concluidas: []
  });
  
  const [salvandoProgresso, setSalvandoProgresso] = useState(false);
  const [modoPreview, setModoPreview] = useState(false);
  const [tempoInicio, setTempoInicio] = useState<Date | null>(null);

  const montadoRef = useRef(true);

  // Configuração das etapas
  const etapas = useMemo((): EtapaOnboarding[] => [
    {
      id: 'boas-vindas',
      titulo: 'Boas-vindas',
      descricao: 'Bem-vindo ao nosso SaaS',
      icone: 'Heart',
      obrigatoria: false,
      concluida: true,
      dados_necessarios: []
    },
    {
      id: 'informacoes-pessoais',
      titulo: 'Informações Pessoais',
      descricao: 'Conte-nos sobre você',
      icone: 'User',
      obrigatoria: true,
      concluida: dadosOnboarding.nome !== '' && dadosOnboarding.email !== '',
      dados_necessarios: ['nome', 'email', 'cargo']
    },
    {
      id: 'configuracao-empresa',
      titulo: 'Configuração da Empresa',
      descricao: 'Informações da sua organização',
      icone: 'Building2',
      obrigatoria: true,
      concluida: dadosOnboarding.nomeEmpresa !== '' && dadosOnboarding.tamanhoEmpresa !== '',
      dados_necessarios: ['nomeEmpresa', 'tamanhoEmpresa', 'setor']
    },
    {
      id: 'preferencias',
      titulo: 'Preferências',
      descricao: 'Personalize sua experiência',
      icone: 'Settings',
      obrigatoria: true,
      concluida: dadosOnboarding.objetivo !== '' && dadosOnboarding.experiencia !== '',
      dados_necessarios: ['objetivo', 'experiencia']
    },
    {
      id: 'integracoes',
      titulo: 'Integrações',
      descricao: 'Conecte suas ferramentas',
      icone: 'Plug',
      obrigatoria: false,
      concluida: true, // Opcional, sempre considerada concluída
      dados_necessarios: []
    },
    {
      id: 'tutorial-interativo',
      titulo: 'Tutorial Interativo',
      descricao: 'Aprenda a usar o sistema',
      icone: 'PlayCircle',
      obrigatoria: true,
      concluida: dadosOnboarding.tutorialCompleto,
      dados_necessarios: ['tutorialCompleto']
    },
    {
      id: 'conclusao',
      titulo: 'Conclusão',
      descricao: 'Você está pronto!',
      icone: 'CheckCircle',
      obrigatoria: false,
      concluida: false,
      dados_necessarios: []
    }
  ], [dadosOnboarding]);

  // Inicialização e prevenção de memory leaks
  useEffect(() => {
    montadoRef.current = true;
    setTempoInicio(new Date());
    
    return () => {
      montadoRef.current = false;
    };
  }, []);

  // Salvar progresso automaticamente
  useEffect(() => {
    const salvarProgresso = async () => {
      if (!montadoRef.current) return;
      
      try {
        // Simulação de salvamento automático
        await new Promise(resolve => setTimeout(resolve, 500));
        // console.log('Progresso salvo automaticamente');
      } catch (error) {
        console.error('Erro ao salvar progresso:', error);
      }
    };

    const timeoutId = setTimeout(salvarProgresso, 2000);
    return () => clearTimeout(timeoutId);
  }, [dadosOnboarding, etapaAtual]);

  // Cálculos derivados
  const progressoTotal = calcularProgresso(etapaAtual, etapas.length - 1);
  const etapasObrigatoriasConcluidas = etapas.filter(e => e.obrigatoria).every(e => e.concluida);
  const tempoDecorrido = tempoInicio ? new Date().getTime() - tempoInicio.getTime() : 0;
  const tempoDecorridoMinutos = Math.floor(tempoDecorrido / 60000);

  // Handlers principais
  const handleProximaEtapa = useCallback(async () => {
    if (etapaAtual < etapas.length - 1) {
      setSalvandoProgresso(true);
      
      try {
        // Simulação de validação e salvamento
        await new Promise(resolve => setTimeout(resolve, 800));
        
        if (montadoRef.current) {
          setEtapaAtual(prev => prev + 1);
          toast.success('Progresso salvo com sucesso');
        }
      } catch (error) {
        toast.error('Erro ao salvar progresso');
      } finally {
        if (montadoRef.current) {
          setSalvandoProgresso(false);
        }
      }
    }
  }, [etapaAtual, etapas.length]);

  const handleEtapaAnterior = useCallback(() => {
    if (etapaAtual > 0) {
      setEtapaAtual(prev => prev - 1);
    }
  }, [etapaAtual]);

  const handleIrParaEtapa = useCallback((indice: number) => {
    if (indice >= 0 && indice < etapas.length) {
      // Só permite navegar para etapas anteriores ou a próxima imediata
      if (indice <= etapaAtual + 1) {
        setEtapaAtual(indice);
      }
    }
  }, [etapaAtual, etapas.length]);

  const handleAtualizarDados = useCallback((novosDados: Partial<DadosOnboarding>) => {
    setDadosOnboarding(prev => ({ ...prev, ...novosDados }));
  }, []);

  const handleConcluirOnboarding = useCallback(async () => {
    if (!etapasObrigatoriasConcluidas) {
      toast.error('Complete todas as etapas obrigatórias antes de continuar');
      return;
    }

    setSalvandoProgresso(true);

    try {
      // Simulação de conclusão
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success('Onboarding concluído com sucesso! Redirecionando...');
      
      // Simulação de redirecionamento
      setTimeout(() => {
        toast.info('Redirecionando para o dashboard principal...');
      }, 1500);
      
    } catch (error) {
      toast.error('Erro ao finalizar onboarding');
    } finally {
      if (montadoRef.current) {
        setSalvandoProgresso(false);
      }
    }
  }, [etapasObrigatoriasConcluidas]);

  // Renderizar indicador de etapa
  const renderizarIndicadorEtapa = useCallback((etapa: EtapaOnboarding, indice: number) => {
    const IconeComponente = LucideIcons[etapa.icone as keyof typeof LucideIcons] as any;
    const isAtual = indice === etapaAtual;
    const isConcluida = etapa.concluida;
    const isAcessivel = indice <= etapaAtual + 1;

    let statusClass = 'bg-gray-200 text-gray-400';
    if (isConcluida) statusClass = 'bg-green-500 text-white';
    else if (isAtual) statusClass = 'bg-blue-500 text-white';
    else if (isAcessivel) statusClass = 'bg-gray-300 text-gray-600';

    return (
      <div 
        key={etapa.id}
        className={`flex items-center gap-3 p-3 rounded-lg transition-all cursor-pointer hover:bg-gray-50 ${
          isAtual ? 'bg-blue-50 border border-blue-200' : ''
        }`}
        onClick={() => isAcessivel && handleIrParaEtapa(indice)}
      >
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${statusClass} transition-colors`}>
          {isConcluida ? (
            <LucideIcons.Check className="h-5 w-5" />
          ) : (
            <IconeComponente className="h-5 w-5" />
          )}
        </div>
        
        <div className="flex-1">
          <p className={`font-medium ${isAtual ? 'text-blue-900' : 'text-gray-900'}`}>
            {etapa.titulo}
          </p>
          <p className="text-sm text-gray-500">{etapa.descricao}</p>
        </div>

        <div className="flex items-center gap-2">
          {etapa.obrigatoria && (
            <Badge variant="outline" className="text-xs">
              Obrigatório
            </Badge>
          )}
          {isConcluida && (
            <LucideIcons.CheckCircle className="h-4 w-4 text-green-500" />
          )}
        </div>
      </div>
    );
  }, [etapaAtual, handleIrParaEtapa]);

  // Renderizar conteúdo da etapa atual
  const renderizarConteudoEtapa = useCallback(() => {
    const etapa = etapas[etapaAtual];
    if (!etapa) return null;

    const propsComuns = {
      dados: dadosOnboarding,
      onAtualizarDados: handleAtualizarDados,
      onProxima: handleProximaEtapa,
      onAnterior: handleEtapaAnterior,
      salvando: salvandoProgresso,
      etapaAtual: etapaAtual,
      totalEtapas: etapas.length
    };

    switch (etapa.id) {
      case 'boas-vindas':
        return <EtapaBoasVindas {...propsComuns} />;
      case 'informacoes-pessoais':
        return <EtapaInformacoesPessoais {...propsComuns} />;
      case 'configuracao-empresa':
        return <EtapaConfiguracaoEmpresa {...propsComuns} />;
      case 'preferencias':
        return <EtapaPreferencias {...propsComuns} />;
      case 'integracoes':
        return <EtapaIntegracoes {...propsComuns} />;
      case 'tutorial-interativo':
        return <EtapaTutorialInterativo {...propsComuns} />;
      case 'conclusao':
        return <EtapaConclusao {...propsComuns} onConcluir={handleConcluirOnboarding} />;
      default:
        return <div>Etapa não encontrada</div>;
    }
  }, [etapaAtual, etapas, dadosOnboarding, handleAtualizarDados, handleProximaEtapa, handleEtapaAnterior, salvandoProgresso, handleConcluirOnboarding]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Toaster position="bottom-right" richColors />
      
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <LucideIcons.Zap className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">Configuração Inicial</h1>
                <p className="text-sm text-gray-500">Vamos configurar sua conta em poucos minutos</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Progresso geral */}
              <div className="hidden sm:flex items-center space-x-3">
                <span className="text-sm text-gray-600">Progresso:</span>
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${progressoTotal}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-gray-900">{progressoTotal}%</span>
              </div>
              
              {/* Avatar do usuário */}
              {dadosOnboarding.nome && (
                <Avatar className="h-8 w-8">
                  <AvatarImage src={dadosOnboarding.avatar ? URL.createObjectURL(dadosOnboarding.avatar) : undefined} />
                  <AvatarFallback className="text-xs">
                    {gerarIniciaisNome(dadosOnboarding.nome)}
                  </AvatarFallback>
                </Avatar>
              )}
              
              {/* Toggle modo preview */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setModoPreview(!modoPreview)}
              >
                <LucideIcons.Eye className="h-4 w-4 mr-1" />
                {modoPreview ? 'Modo Normal' : 'Preview'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Layout principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar com etapas */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="text-lg">Etapas do Setup</CardTitle>
                <CardDescription>
                  {etapas.filter(e => e.concluida).length} de {etapas.filter(e => e.obrigatoria).length} obrigatórias concluídas
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {etapas.map(renderizarIndicadorEtapa)}
                
                {/* Informações adicionais */}
                <div className="pt-4 border-t space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Tempo decorrido:</span>
                    <span className="font-medium">{tempoDecorridoMinutos}min</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Etapa atual:</span>
                    <span className="font-medium">{etapaAtual + 1} de {etapas.length}</span>
                  </div>
                  
                  {!etapasObrigatoriasConcluidas && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <div className="flex items-start gap-2">
                        <LucideIcons.AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-yellow-800">Etapas pendentes</p>
                          <p className="text-xs text-yellow-700">Complete as etapas obrigatórias para continuar</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Conteúdo principal */}
          <div className="lg:col-span-3">
            <div className="space-y-6">
              {/* Progresso mobile */}
              <div className="lg:hidden">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Progresso geral</span>
                  <span className="text-sm text-gray-600">{progressoTotal}%</span>
                </div>
                <Progress value={progressoTotal} className="h-2" />
              </div>

              {/* Conteúdo da etapa atual */}
              <div className="min-h-[600px]">
                {renderizarConteudoEtapa()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de preview (modo demonstração) */}
      {modoPreview && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LucideIcons.Eye className="h-5 w-5" />
                Modo Preview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">
                Este é um showcase interativo demonstrando um sistema completo de onboarding para SaaS.
              </p>
              
              <div className="space-y-2">
                <h4 className="font-medium">Funcionalidades demonstradas:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Wizard de setup em múltiplas etapas</li>
                  <li>• Validação progressiva de dados</li>
                  <li>• Tutorial interativo</li>
                  <li>• Sistema de integração</li>
                  <li>• Salvamento automático</li>
                  <li>• Interface responsiva</li>
                </ul>
              </div>
              
              <Button 
                onClick={() => setModoPreview(false)} 
                className="w-full"
              >
                Continuar Demo
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}