'use client'

import React, { useState, useRef, useCallback, useEffect } from 'react'
import { toast } from 'sonner'
import * as LucideIcons from 'lucide-react'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface AvaliacaoEquipeProps {
  funcionario: any;
  ciclo: any;
  pendencias: any;
}

interface MembroEquipe {
  id: string;
  nome: string;
  email: string;
  cargo: string;
  avatar?: string;
  status_avaliacao: 'pendente' | 'em_andamento' | 'concluida';
  data_limite: string;
  relacionamento: 'subordinado_direto' | 'par' | 'feedback_360';
}

const equipeMock: MembroEquipe[] = [
  {
    id: '1',
    nome: 'João Silva',
    email: 'joao.silva@empresa.com',
    cargo: 'Analista de Produto Júnior',
    status_avaliacao: 'pendente',
    data_limite: '2024-07-25',
    relacionamento: 'subordinado_direto'
  },
  {
    id: '2',
    nome: 'Maria Santos',
    email: 'maria.santos@empresa.com',
    cargo: 'UX Designer Pleno',
    status_avaliacao: 'em_andamento',
    data_limite: '2024-07-25',
    relacionamento: 'subordinado_direto'
  },
  {
    id: '3',
    nome: 'Pedro Oliveira',
    email: 'pedro.oliveira@empresa.com',
    cargo: 'Analista de Produto Sênior',
    status_avaliacao: 'concluida',
    data_limite: '2024-07-25',
    relacionamento: 'par'
  }
];

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

const formatarStatusVisual = (status: string) => {
  switch (status) {
    case 'concluida':
      return { 
        texto: 'Concluída', 
        cor: 'text-green-600', 
        icone: 'CheckCircle', 
        badge: 'default' as const
      };
    case 'em_andamento':
      return { 
        texto: 'Em Andamento', 
        cor: 'text-yellow-600', 
        icone: 'Clock', 
        badge: 'secondary' as const
      };
    case 'pendente':
      return { 
        texto: 'Pendente', 
        cor: 'text-red-600', 
        icone: 'AlertCircle', 
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

const EstadoLoading = () => (
  <div className="flex items-center justify-center py-16">
    <div className="text-center">
      <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
      <p className="text-gray-500">Carregando equipe para avaliação...</p>
    </div>
  </div>
);

const EstadoVazio = () => (
  <div className="text-center py-16">
    <LucideIcons.Users className="h-16 w-16 text-gray-300 mx-auto mb-6" />
    <h3 className="text-xl font-medium mb-2">Nenhuma avaliação pendente</h3>
    <p className="text-gray-500 max-w-md mx-auto">
      Você não possui avaliações de equipe pendentes no ciclo atual.
    </p>
  </div>
);

export default function AvaliacaoEquipe({ funcionario, ciclo, pendencias }: AvaliacaoEquipeProps) {
  const [carregando, setCarregando] = useState(true);
  const [equipe, setEquipe] = useState<MembroEquipe[]>([]);
  const [filtroStatus, setFiltroStatus] = useState<string>('todos');
  
  const montadoRef = useRef(true);
  
  useEffect(() => {
    montadoRef.current = true;
    return () => { montadoRef.current = false; };
  }, []);

  const carregarEquipe = useCallback(async () => {
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
        setEquipe(equipeMock);
      }
    } catch (error) {
      console.error('Erro ao carregar equipe:', error);
      if (montadoRef.current) {
        toast.error('Falha ao carregar dados da equipe');
      }
    } finally {
      clearTimeout(timeoutId);
      if (montadoRef.current) {
        setCarregando(false);
      }
    }
  }, []);

  useEffect(() => {
    carregarEquipe();
  }, [carregarEquipe]);

  const equipeFiltrada = equipe.filter(membro => {
    if (filtroStatus === 'todos') return true;
    return membro.status_avaliacao === filtroStatus;
  });

  const estatisticas = {
    total: equipe.length,
    pendentes: equipe.filter(m => m.status_avaliacao === 'pendente').length,
    em_andamento: equipe.filter(m => m.status_avaliacao === 'em_andamento').length,
    concluidas: equipe.filter(m => m.status_avaliacao === 'concluida').length
  };

  const iniciarAvaliacao = (membro: MembroEquipe) => {
    toast.success(`Iniciando avaliação de ${membro.nome}`);
    // Aqui abriria o formulário de avaliação específico
  };

  const continuarAvaliacao = (membro: MembroEquipe) => {
    toast.info(`Continuando avaliação de ${membro.nome}`);
    // Aqui abriria o formulário com progresso salvo
  };

  if (carregando) return <EstadoLoading />;
  
  if (equipe.length === 0) return <EstadoVazio />;

  return (
    <div className="space-y-6">
      
      {/* Header com Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold">{estatisticas.total}</p>
              </div>
              <LucideIcons.Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pendentes</p>
                <p className="text-2xl font-bold text-red-600">{estatisticas.pendentes}</p>
              </div>
              <LucideIcons.AlertCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Em Andamento</p>
                <p className="text-2xl font-bold text-yellow-600">{estatisticas.em_andamento}</p>
              </div>
              <LucideIcons.Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Concluídas</p>
                <p className="text-2xl font-bold text-green-600">{estatisticas.concluidas}</p>
              </div>
              <LucideIcons.CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LucideIcons.Users className="h-5 w-5" />
            Avaliações de Equipe
          </CardTitle>
          <CardDescription>
            Gerencie as avaliações dos membros da sua equipe
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={filtroStatus} onValueChange={setFiltroStatus}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="todos">
                Todos ({estatisticas.total})
              </TabsTrigger>
              <TabsTrigger value="pendente">
                Pendentes ({estatisticas.pendentes})
              </TabsTrigger>
              <TabsTrigger value="em_andamento">
                Em Andamento ({estatisticas.em_andamento})
              </TabsTrigger>
              <TabsTrigger value="concluida">
                Concluídas ({estatisticas.concluidas})
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>

      {/* Lista da Equipe */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {equipeFiltrada.map((membro) => {
          const statusInfo = formatarStatusVisual(membro.status_avaliacao);
          const IconeStatus = LucideIcons[statusInfo.icone as keyof typeof LucideIcons] as any;
          const dataLimite = new Date(membro.data_limite);
          const hoje = new Date();
          const diasRestantes = Math.ceil((dataLimite.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
          const isAtrasado = diasRestantes < 0 && membro.status_avaliacao !== 'concluida';
          
          return (
            <Card key={membro.id} className={`transition-all hover:shadow-md ${
              isAtrasado ? 'border-red-200 bg-red-50' : ''
            }`}>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  
                  {/* Header do Card */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={membro.avatar} />
                        <AvatarFallback>
                          {gerarIniciaisNome(membro.nome)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold">{membro.nome}</h3>
                        <p className="text-sm text-gray-600">{membro.cargo}</p>
                      </div>
                    </div>
                    <IconeStatus className={`h-5 w-5 ${statusInfo.cor}`} />
                  </div>

                  {/* Status e Prazo */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge variant={statusInfo.badge}>
                        {statusInfo.texto}
                      </Badge>
                      <span className={`text-xs ${
                        isAtrasado ? 'text-red-600 font-medium' : 'text-gray-500'
                      }`}>
                        {isAtrasado 
                          ? `${Math.abs(diasRestantes)} dias atrasado`
                          : `${diasRestantes} dias restantes`
                        }
                      </span>
                    </div>
                    
                    <div className="text-xs text-gray-500">
                      <span className="capitalize">
                        {membro.relacionamento.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  {/* Ações */}
                  <div className="pt-2 border-t">
                    {membro.status_avaliacao === 'pendente' && (
                      <Button 
                        className="w-full" 
                        onClick={() => iniciarAvaliacao(membro)}
                      >
                        <LucideIcons.Play className="mr-2 h-4 w-4" />
                        Iniciar Avaliação
                      </Button>
                    )}
                    
                    {membro.status_avaliacao === 'em_andamento' && (
                      <Button 
                        className="w-full" 
                        variant="outline"
                        onClick={() => continuarAvaliacao(membro)}
                      >
                        <LucideIcons.Edit className="mr-2 h-4 w-4" />
                        Continuar Avaliação
                      </Button>
                    )}
                    
                    {membro.status_avaliacao === 'concluida' && (
                      <Button 
                        className="w-full" 
                        variant="secondary"
                        onClick={() => toast.info('Visualizando avaliação concluída')}
                      >
                        <LucideIcons.Eye className="mr-2 h-4 w-4" />
                        Ver Avaliação
                      </Button>
                    )}
                  </div>

                  {/* Alerta de Atraso */}
                  {isAtrasado && (
                    <div className="bg-red-100 border border-red-200 rounded-lg p-2">
                      <div className="flex items-center gap-2">
                        <LucideIcons.AlertTriangle className="h-4 w-4 text-red-600" />
                        <span className="text-xs text-red-700 font-medium">
                          Avaliação em atraso
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {equipeFiltrada.length === 0 && (
        <div className="text-center py-12">
          <LucideIcons.Filter className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Nenhum resultado encontrado</h3>
          <p className="text-gray-500">
            Nenhum membro da equipe corresponde ao filtro selecionado.
          </p>
        </div>
      )}

    </div>
  );
}