'use client'

import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react'
import { toast, Toaster } from 'sonner'
import * as LucideIcons from 'lucide-react'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// Componentes dos módulos
import AutoAvaliacao from './autoavaliacao'
import AvaliacaoEquipe from './avaliacao-equipe'  
import Resultados from './resultados'

// Funções utilitárias defensivas
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

const formatarDataContextual = (
  dataString: string | undefined, 
  formato: 'curta' | 'media' | 'longa' | 'relativa' = 'media'
): string => {
  if (!dataString) return 'N/A';
  
  try {
    const data = new Date(dataString);
    
    if (isNaN(data.getTime())) {
      return 'Data inválida';
    }
    
    const agora = new Date();
    const diferenca = agora.getTime() - data.getTime();
    const dias = Math.floor(diferenca / (1000 * 60 * 60 * 24));
    
    switch (formato) {
      case 'relativa':
        if (dias === 0) return 'Hoje';
        if (dias === 1) return 'Ontem';
        if (dias < 7) return `${dias} dias atrás`;
        if (dias < 30) return `${Math.floor(dias / 7)} semana(s) atrás`;
        if (dias < 365) return `${Math.floor(dias / 30)} mês(es) atrás`;
        return `${Math.floor(dias / 365)} ano(s) atrás`;
      
      case 'curta':
        return data.toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: '2-digit'
        });
      
      case 'longa':
        return data.toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      
      default:
        return data.toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });
    }
  } catch (error) {
    console.error('Erro ao formatar data:', error);
    return 'Erro de formato';
  }
};

const formatarStatusVisual = (status: string | undefined) => {
  if (!status) {
    return { 
      texto: 'Indefinido', 
      cor: 'text-gray-500', 
      icone: 'HelpCircle', 
      badge: 'secondary' as const
    };
  }
  
  const statusLower = status.toLowerCase();
  
  switch (statusLower) {
    case 'concluida':
    case 'finalizada':
    case 'aprovada':
      return { 
        texto: 'Concluída', 
        cor: 'text-green-600', 
        icone: 'CheckCircle', 
        badge: 'default' as const
      };
    
    case 'pendente':
    case 'em_andamento':
    case 'iniciada':
      return { 
        texto: 'Em Andamento', 
        cor: 'text-yellow-600', 
        icone: 'Clock', 
        badge: 'secondary' as const
      };
    
    case 'nao_iniciada':
    case 'aguardando':
      return { 
        texto: 'Não Iniciada', 
        cor: 'text-blue-600', 
        icone: 'Calendar', 
        badge: 'outline' as const
      };
    
    case 'atrasada':
    case 'vencida':
      return { 
        texto: 'Atrasada', 
        cor: 'text-red-600', 
        icone: 'AlertTriangle', 
        badge: 'destructive' as const
      };
    
    default:
      return { 
        texto: status, 
        cor: 'text-gray-600', 
        icone: 'Circle', 
        badge: 'secondary' as const
      };
  }
};

// Interfaces TypeScript
interface Funcionario {
  id: string;
  nome: string;
  email: string;
  cargo: string;
  time: string;
  gestor: string;
  avatar?: string;
  nivel: 'junior' | 'pleno' | 'senior' | 'especialista' | 'lider';
}

interface CicloAvaliacao {
  id: string;
  nome: string;
  periodo: string;
  data_inicio: string;
  data_fim: string;
  status: string;
  progresso_geral: number;
  total_participantes: number;
  concluidas: number;
}

interface ProgressoUsuario {
  autoavaliacao: {
    status: string;
    progresso: number;
    ultima_atualizacao: string;
  };
  avaliacoes_recebidas: {
    total: number;
    concluidas: number;
    pendentes: number;
  };
  avaliacoes_para_fazer: {
    total: number;
    concluidas: number;
    pendentes: number;
  };
}

// Estados de Loading/Erro/Vazio
const EstadoLoading = ({ mensagem = 'Carregando dados de avaliação...' }) => (
  <div className="flex items-center justify-center py-16">
    <div className="text-center">
      <div className="animate-spin h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
      <p className="text-gray-500">{mensagem}</p>
    </div>
  </div>
);

const EstadoErro = ({ erro, onTentarNovamente }: { erro: string; onTentarNovamente: () => void }) => (
  <div className="bg-red-50 border border-red-200 p-8 rounded-lg text-center">
    <LucideIcons.AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
    <h3 className="text-lg font-medium text-red-900 mb-2">Erro ao carregar dados</h3>
    <p className="text-red-700 mb-6">{erro}</p>
    <Button onClick={onTentarNovamente} variant="outline">
      <LucideIcons.RefreshCw className="mr-2 h-4 w-4" />
      Tentar Novamente
    </Button>
  </div>
);

const EstadoVazio = () => (
  <div className="text-center py-16">
    <LucideIcons.Users className="h-16 w-16 text-gray-300 mx-auto mb-6" />
    <h3 className="text-xl font-medium mb-2">Nenhum ciclo de avaliação ativo</h3>
    <p className="text-gray-500 max-w-md mx-auto mb-8">
      Não há ciclos de avaliação em andamento no momento. 
      Entre em contato com o RH para mais informações.
    </p>
  </div>
);

export default function SistemaAvaliacaoDesempenho() {
  // Estados globais do sistema
  const [abaSelecionada, setAbaSelecionada] = useState<string>('overview');
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  
  // Dados principais
  const [funcionarioAtual, setFuncionarioAtual] = useState<Funcionario | null>(null);
  const [cicloAtual, setCicloAtual] = useState<CicloAvaliacao | null>(null);
  const [progressoUsuario, setProgressoUsuario] = useState<ProgressoUsuario | null>(null);
  
  // Estados por aba
  const [dadosPorAba, setDadosPorAba] = useState<Record<string, any>>({});
  const [carregandoPorAba, setCarregandoPorAba] = useState<Record<string, boolean>>({});
  const [abasCarregadas, setAbasCarregadas] = useState<Set<string>>(new Set(['overview']));

  // Prevenção de memory leaks
  const montadoRef = useRef(true);
  
  useEffect(() => {
    montadoRef.current = true;
    return () => {
      montadoRef.current = false;
    };
  }, []);

  // Configuração de abas com badges dinâmicas
  const configuracaoAbas = useMemo(() => [
    { 
      id: 'overview', 
      label: 'Visão Geral', 
      icone: 'LayoutDashboard',
      badge: null,
      lazy: false
    },
    { 
      id: 'autoavaliacao', 
      label: 'Auto-avaliação', 
      icone: 'User',
      badge: progressoUsuario?.autoavaliacao.status === 'pendente' ? 'Pendente' : null,
      lazy: true
    },
    { 
      id: 'avaliar-equipe', 
      label: 'Avaliar Equipe', 
      icone: 'Users',
      badge: progressoUsuario?.avaliacoes_para_fazer.pendentes || null,
      lazy: true
    },
    { 
      id: 'resultados', 
      label: 'Resultados', 
      icone: 'BarChart3',
      badge: null,
      lazy: true
    }
  ], [progressoUsuario]);

  // Carregamento inicial defensivo
  const carregarDadosIniciais = useCallback(async () => {
    if (!montadoRef.current) return;
    
    setCarregando(true);
    setErro(null);
    
    const timeoutId = setTimeout(() => {
      if (montadoRef.current) {
        setCarregando(false);
        setErro('Tempo de carregamento excedido. Verifique sua conexão.');
      }
    }, 10000);
    
    try {
      // Simular carregamento de dados iniciais
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (montadoRef.current) {
        // Dados mock do funcionário atual
        setFuncionarioAtual({
          id: '1',
          nome: 'Ana Silva Santos',
          email: 'ana.santos@empresa.com',
          cargo: 'Analista de Produto Sênior',
          time: 'Produto Digital',
          gestor: 'Carlos Roberto Lima',
          nivel: 'senior'
        });
        
        // Dados mock do ciclo atual
        setCicloAtual({
          id: 'ciclo-2024-s2',
          nome: 'Avaliação de Desempenho 2024 - 2º Semestre',
          periodo: '2024 S2',
          data_inicio: '2024-07-01',
          data_fim: '2024-07-31',
          status: 'em_andamento',
          progresso_geral: 68,
          total_participantes: 156,
          concluidas: 106
        });
        
        // Dados mock do progresso
        setProgressoUsuario({
          autoavaliacao: {
            status: 'em_andamento',
            progresso: 75,
            ultima_atualizacao: '2024-07-15T10:30:00Z'
          },
          avaliacoes_recebidas: {
            total: 4,
            concluidas: 2,
            pendentes: 2
          },
          avaliacoes_para_fazer: {
            total: 3,
            concluidas: 1,
            pendentes: 2
          }
        });
      }
    } catch (error) {
      console.error('Erro ao carregar dados iniciais:', error);
      if (montadoRef.current) {
        setErro('Falha ao carregar dados. Tente novamente em alguns instantes.');
      }
    } finally {
      clearTimeout(timeoutId);
      if (montadoRef.current) {
        setCarregando(false);
      }
    }
  }, []);

  useEffect(() => {
    carregarDadosIniciais();
  }, [carregarDadosIniciais]);

  // Carregamento por aba
  const carregarDadosAba = useCallback(async (abaId: string) => {
    if (!montadoRef.current) return;
    
    if (abasCarregadas.has(abaId) && dadosPorAba[abaId]) {
      return;
    }
    
    setCarregandoPorAba(prev => ({ ...prev, [abaId]: true }));
    
    const timeoutId = setTimeout(() => {
      if (montadoRef.current) {
        setCarregandoPorAba(prev => ({ ...prev, [abaId]: false }));
        toast.error('Tempo de carregamento excedido');
      }
    }, 8000);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      if (montadoRef.current) {
        // Dados específicos por aba serão carregados pelos componentes filhos
        setAbasCarregadas(prev => {
          const newSet = new Set(prev);
          newSet.add(abaId);
          return newSet;
        });
      }
    } catch (error) {
      console.error(`Erro ao carregar aba ${abaId}:`, error);
      if (montadoRef.current) {
        toast.error('Falha ao carregar dados da aba');
      }
    } finally {
      clearTimeout(timeoutId);
      if (montadoRef.current) {
        setCarregandoPorAba(prev => ({ ...prev, [abaId]: false }));
      }
    }
  }, [abasCarregadas, dadosPorAba]);

  const handleMudarAba = useCallback((novaAba: string) => {
    if (novaAba === abaSelecionada) return;
    
    setAbaSelecionada(novaAba);
    
    const configAba = configuracaoAbas.find(aba => aba.id === novaAba);
    if (configAba?.lazy && !abasCarregadas.has(novaAba)) {
      setTimeout(() => {
        if (montadoRef.current) {
          carregarDadosAba(novaAba);
        }
      }, 150);
    }
  }, [abaSelecionada, configuracaoAbas, abasCarregadas, carregarDadosAba]);

  const renderizarAba = useCallback((aba: typeof configuracaoAbas[0]) => {
    const IconeComponente = LucideIcons[aba.icone as keyof typeof LucideIcons] as any;
    const isCarregando = carregandoPorAba[aba.id];
    
    return (
      <TabsTrigger 
        key={aba.id}
        value={aba.id} 
        className="relative"
        disabled={isCarregando}
      >
        <div className="flex items-center gap-2">
          {isCarregando ? (
            <LucideIcons.Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <IconeComponente className="h-4 w-4" />
          )}
          <span>{aba.label}</span>
          {aba.badge && (
            <Badge variant="secondary" className="ml-1 text-xs">
              {aba.badge}
            </Badge>
          )}
        </div>
      </TabsTrigger>
    );
  }, [carregandoPorAba]);

  // Estados de UI obrigatórios
  if (carregando) return <EstadoLoading />;
  if (erro) return <EstadoErro erro={erro} onTentarNovamente={carregarDadosIniciais} />;
  if (!funcionarioAtual || !cicloAtual || !progressoUsuario) return <EstadoVazio />;

  const statusCiclo = formatarStatusVisual(cicloAtual.status);
  const IconeStatus = LucideIcons[statusCiclo.icone as keyof typeof LucideIcons] as any;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Toaster position="bottom-right" richColors />
      
      {/* Header do Sistema */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" asChild>
                <a href="/showcase" className="flex items-center">
                  <LucideIcons.ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar aos Showcases
                </a>
              </Button>
              
              <div className="h-6 w-px bg-gray-300" />
              
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Sistema de Avaliação de Desempenho
                </h1>
                <p className="text-sm text-gray-500">
                  Ciclo: {cicloAtual.nome}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <LucideIcons.Info className="h-4 w-4 mr-2" />
                Sobre Este Sistema
              </Button>
              
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{funcionarioAtual.nome}</p>
                  <p className="text-xs text-gray-500">{funcionarioAtual.cargo}</p>
                </div>
                <Avatar className="h-8 w-8">
                  <AvatarImage src={funcionarioAtual.avatar} />
                  <AvatarFallback className="text-xs">
                    {gerarIniciaisNome(funcionarioAtual.nome)}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Cards de Status do Ciclo */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Status do Ciclo</CardTitle>
                <IconeStatus className={`h-5 w-5 ${statusCiclo.cor}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Badge variant={statusCiclo.badge}>{statusCiclo.texto}</Badge>
                <p className="text-xs text-gray-500">
                  Até {formatarDataContextual(cicloAtual.data_fim, 'curta')}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Progresso Geral</CardTitle>
                <LucideIcons.TrendingUp className="h-5 w-5 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold">{cicloAtual.progresso_geral}%</span>
                </div>
                <Progress value={cicloAtual.progresso_geral} className="h-2" />
                <p className="text-xs text-gray-500">
                  {cicloAtual.concluidas} de {cicloAtual.total_participantes} concluídas
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Sua Auto-avaliação</CardTitle>
                <LucideIcons.User className="h-5 w-5 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold">{progressoUsuario.autoavaliacao.progresso}%</span>
                </div>
                <Progress value={progressoUsuario.autoavaliacao.progresso} className="h-2" />
                <p className="text-xs text-gray-500">
                  Atualizada {formatarDataContextual(progressoUsuario.autoavaliacao.ultima_atualizacao, 'relativa')}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Pendências</CardTitle>
                <LucideIcons.Clock className="h-5 w-5 text-yellow-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-lg font-semibold">
                  {progressoUsuario.avaliacoes_para_fazer.pendentes}
                </div>
                <p className="text-xs text-gray-500">
                  Avaliações para fazer
                </p>
                {progressoUsuario.avaliacoes_recebidas.pendentes > 0 && (
                  <p className="text-xs text-gray-500">
                    +{progressoUsuario.avaliacoes_recebidas.pendentes} aguardando recebimento
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sistema de Abas Modular */}
        <Tabs value={abaSelecionada} onValueChange={handleMudarAba} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            {configuracaoAbas.map(renderizarAba)}
          </TabsList>

          {/* Overview */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Resumo do Funcionário */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <LucideIcons.User className="h-5 w-5" />
                    Seus Dados
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={funcionarioAtual.avatar} />
                      <AvatarFallback className="text-lg">
                        {gerarIniciaisNome(funcionarioAtual.nome)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-lg">{funcionarioAtual.nome}</h3>
                      <p className="text-gray-600">{funcionarioAtual.cargo}</p>
                      <p className="text-sm text-gray-500">{funcionarioAtual.time}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Gestor Direto</p>
                      <p className="text-sm">{funcionarioAtual.gestor}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Nível</p>
                      <Badge variant="outline" className="text-xs">
                        {funcionarioAtual.nivel}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Próximos Passos */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <LucideIcons.CheckSquare className="h-5 w-5" />
                    Próximos Passos
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {progressoUsuario.autoavaliacao.status !== 'concluida' && (
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <LucideIcons.User className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="text-sm font-medium">Completar Auto-avaliação</p>
                          <p className="text-xs text-gray-500">
                            {progressoUsuario.autoavaliacao.progresso}% concluída
                          </p>
                        </div>
                      </div>
                      <Button size="sm" onClick={() => setAbaSelecionada('autoavaliacao')}>
                        Continuar
                      </Button>
                    </div>
                  )}
                  
                  {progressoUsuario.avaliacoes_para_fazer.pendentes > 0 && (
                    <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <LucideIcons.Users className="h-5 w-5 text-yellow-600" />
                        <div>
                          <p className="text-sm font-medium">
                            Avaliar Equipe ({progressoUsuario.avaliacoes_para_fazer.pendentes} pendentes)
                          </p>
                          <p className="text-xs text-gray-500">
                            Avaliações de membros da sua equipe
                          </p>
                        </div>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => setAbaSelecionada('avaliar-equipe')}>
                        Avaliar
                      </Button>
                    </div>
                  )}
                  
                  {progressoUsuario.avaliacoes_recebidas.concluidas > 0 && (
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <LucideIcons.BarChart3 className="h-5 w-5 text-green-600" />
                        <div>
                          <p className="text-sm font-medium">Ver Resultados</p>
                          <p className="text-xs text-gray-500">
                            {progressoUsuario.avaliacoes_recebidas.concluidas} avaliações disponíveis
                          </p>
                        </div>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => setAbaSelecionada('resultados')}>
                        Ver
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Timeline do Ciclo */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LucideIcons.Calendar className="h-5 w-5" />
                  Timeline do Ciclo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0 w-3 h-3 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Início do Ciclo</p>
                      <p className="text-xs text-gray-500">
                        {formatarDataContextual(cicloAtual.data_inicio, 'longa')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0 w-3 h-3 bg-blue-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Período de Auto-avaliação</p>
                      <p className="text-xs text-gray-500">Em andamento</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0 w-3 h-3 bg-gray-300 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Fechamento do Ciclo</p>
                      <p className="text-xs text-gray-500">
                        {formatarDataContextual(cicloAtual.data_fim, 'longa')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0 w-3 h-3 bg-gray-300 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Feedback Individual</p>
                      <p className="text-xs text-gray-500">Após fechamento</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Auto-avaliação */}
          <TabsContent value="autoavaliacao">
            <AutoAvaliacao 
              funcionario={funcionarioAtual}
              ciclo={cicloAtual}
              progresso={progressoUsuario.autoavaliacao}
            />
          </TabsContent>

          {/* Avaliação de Equipe */}
          <TabsContent value="avaliar-equipe">
            <AvaliacaoEquipe 
              funcionario={funcionarioAtual}
              ciclo={cicloAtual}
              pendencias={progressoUsuario.avaliacoes_para_fazer}
            />
          </TabsContent>

          {/* Resultados */}
          <TabsContent value="resultados">
            <Resultados 
              funcionario={funcionarioAtual}
              ciclo={cicloAtual}
              avaliacoes={progressoUsuario.avaliacoes_recebidas}
            />
          </TabsContent>

        </Tabs>
      </div>
    </div>
  );
}