'use client'

import React, { useState, useCallback, useMemo } from 'react'
import { toast } from 'sonner'
import * as LucideIcons from 'lucide-react'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface ProgressoGamificacaoProps {
  usuario: any;
  dados: any;
  carregando: boolean;
  erro: string | null;
  onRecarregar: () => void;
}

interface Achievement {
  id: string;
  titulo: string;
  descricao: string;
  icone: string;
  categoria: 'estudo' | 'social' | 'desempenho' | 'tempo';
  pontos_xp: number;
  conquistado: boolean;
  data_conquista?: string;
  progresso?: number;
  meta?: number;
}

interface RankingUsuario {
  posicao: number;
  nome: string;
  avatar?: string;
  pontos_xp: number;
  badges: number;
  nivel: string;
}

const achievementsMock: Achievement[] = [
  {
    id: 'first-course',
    titulo: 'Primeiro Passo',
    descricao: 'Complete seu primeiro curso',
    icone: 'BookOpen',
    categoria: 'estudo',
    pontos_xp: 100,
    conquistado: true,
    data_conquista: '2024-06-15'
  },
  {
    id: 'streak-7',
    titulo: 'Dedicação Semanal',
    descricao: 'Estude por 7 dias consecutivos',
    icone: 'Flame',
    categoria: 'tempo',
    pontos_xp: 200,
    conquistado: true,
    data_conquista: '2024-07-08'
  },
  {
    id: 'streak-30',
    titulo: 'Mestre da Consistência',
    descricao: 'Estude por 30 dias consecutivos',
    icone: 'Crown',
    categoria: 'tempo',
    pontos_xp: 500,
    conquistado: false,
    progresso: 12,
    meta: 30
  },
  {
    id: 'quiz-master',
    titulo: 'Quiz Master',
    descricao: 'Acerte 90% ou mais em 10 quizzes',
    icone: 'Target',
    categoria: 'desempenho',
    pontos_xp: 300,
    conquistado: false,
    progresso: 6,
    meta: 10
  },
  {
    id: 'social-learner',
    titulo: 'Aprendiz Social',
    descricao: 'Participe de 5 discussões em cursos',
    icone: 'Users',
    categoria: 'social',
    pontos_xp: 150,
    conquistado: false,
    progresso: 2,
    meta: 5
  },
  {
    id: 'night-owl',
    titulo: 'Coruja da Madrugada',
    descricao: 'Complete 10 aulas após 22h',
    icone: 'Moon',
    categoria: 'tempo',
    pontos_xp: 250,
    conquistado: false,
    progresso: 7,
    meta: 10
  }
];

const rankingMock: RankingUsuario[] = [
  {
    posicao: 1,
    nome: 'Maria Santos',
    avatar: '',
    pontos_xp: 4850,
    badges: 8,
    nivel: 'avancado'
  },
  {
    posicao: 2,
    nome: 'João Silva',
    avatar: '',
    pontos_xp: 3920,
    badges: 6,
    nivel: 'intermediario'
  },
  {
    posicao: 3,
    nome: 'Ana Carolina Silva', // Usuário atual
    avatar: '',
    pontos_xp: 2840,
    badges: 3,
    nivel: 'intermediario'
  },
  {
    posicao: 4,
    nome: 'Pedro Costa',
    avatar: '',
    pontos_xp: 2650,
    badges: 4,
    nivel: 'intermediario'
  },
  {
    posicao: 5,
    nome: 'Laura Oliveira',
    avatar: '',
    pontos_xp: 2430,
    badges: 3,
    nivel: 'iniciante'
  }
];

const EstadoLoading = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[...Array(3)].map((_, i) => (
        <Card key={i}>
          <CardContent className="pt-6">
            <div className="animate-pulse space-y-3">
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-2 bg-gray-200 rounded"></div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);

const gerarIniciaisNome = (nome: string): string => {
  const partesNome = nome.trim().split(' ');
  if (partesNome.length === 0) return '??';
  if (partesNome.length === 1) return partesNome[0].substring(0, 2).toUpperCase();
  
  const primeiraLetra = partesNome[0][0] || '?';
  const ultimaLetra = partesNome[partesNome.length - 1][0] || '?';
  return (primeiraLetra + ultimaLetra).toUpperCase();
};

export default function ProgressoGamificacao({ 
  usuario, 
  dados, 
  carregando, 
  erro, 
  onRecarregar 
}: ProgressoGamificacaoProps) {
  const [abaSelecionada, setAbaSelecionada] = useState('overview');

  // Cálculos de progresso
  const nivelAtual = useMemo(() => {
    const xp = usuario?.pontos_xp || 0;
    if (xp < 1000) return { nome: 'Iniciante', proximo: 'Intermediário', xp_necessario: 1000 };
    if (xp < 3000) return { nome: 'Intermediário', proximo: 'Avançado', xp_necessario: 3000 };
    if (xp < 6000) return { nome: 'Avançado', proximo: 'Expert', xp_necessario: 6000 };
    return { nome: 'Expert', proximo: 'Mestre', xp_necessario: 10000 };
  }, [usuario?.pontos_xp]);

  const progressoProximoNivel = useMemo(() => {
    const xp = usuario?.pontos_xp || 0;
    const baseAtual = nivelAtual.nome === 'Iniciante' ? 0 : 
                     nivelAtual.nome === 'Intermediário' ? 1000 : 
                     nivelAtual.nome === 'Avançado' ? 3000 : 6000;
    const progressoAtual = xp - baseAtual;
    const necessarioParaProximo = nivelAtual.xp_necessario - baseAtual;
    return (progressoAtual / necessarioParaProximo) * 100;
  }, [usuario?.pontos_xp, nivelAtual]);

  const achievementsConquistados = useMemo(() => 
    achievementsMock.filter(a => a.conquistado), []
  );

  const achievementsPendentes = useMemo(() => 
    achievementsMock.filter(a => !a.conquistado), []
  );

  const posicaoRanking = useMemo(() => 
    rankingMock.find(r => r.nome === usuario?.nome)?.posicao || 0, [usuario?.nome]
  );

  const coletarRecompensa = useCallback((achievementId: string) => {
    const achievement = achievementsMock.find(a => a.id === achievementId);
    if (achievement) {
      toast.success(`+${achievement.pontos_xp} XP coletados!`, {
        description: achievement.titulo
      });
    }
  }, []);

  if (carregando) return <EstadoLoading />;

  return (
    <div className="space-y-6">
      {/* Header com estatísticas principais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="h-12 w-12 bg-blue-600 rounded-lg flex items-center justify-center">
                <LucideIcons.Zap className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-blue-900">{usuario?.pontos_xp || 0}</p>
                <p className="text-sm text-blue-600">Total XP</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="h-12 w-12 bg-green-600 rounded-lg flex items-center justify-center">
                <LucideIcons.Award className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-green-900">{achievementsConquistados.length}</p>
                <p className="text-sm text-green-600">Conquistas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="h-12 w-12 bg-purple-600 rounded-lg flex items-center justify-center">
                <LucideIcons.TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-purple-900">#{posicaoRanking}</p>
                <p className="text-sm text-purple-600">Ranking</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="h-12 w-12 bg-orange-600 rounded-lg flex items-center justify-center">
                <LucideIcons.Flame className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-orange-900">{usuario?.streak_dias || 0}</p>
                <p className="text-sm text-orange-600">Dias Streak</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progresso de nível */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LucideIcons.Star className="h-5 w-5 text-yellow-500" />
            Progresso de Nível
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-lg">{nivelAtual.nome}</p>
                <p className="text-sm text-gray-500">
                  {(nivelAtual.xp_necessario - (usuario?.pontos_xp || 0)).toLocaleString()} XP para {nivelAtual.proximo}
                </p>
              </div>
              <Badge variant="secondary" className="text-lg px-3 py-1">
                Nível {nivelAtual.nome === 'Iniciante' ? '1' : 
                      nivelAtual.nome === 'Intermediário' ? '2' : 
                      nivelAtual.nome === 'Avançado' ? '3' : '4'}
              </Badge>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>{usuario?.pontos_xp || 0} XP</span>
                <span>{nivelAtual.xp_necessario} XP</span>
              </div>
              <Progress value={progressoProximoNivel} className="h-3" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navegação por abas */}
      <Tabs value={abaSelecionada} onValueChange={setAbaSelecionada}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="achievements">Conquistas</TabsTrigger>
          <TabsTrigger value="ranking">Ranking</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Estatísticas detalhadas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Atividade Semanal</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map((dia, index) => {
                    const ativo = index < 5; // Simular atividade
                    return (
                      <div key={dia} className="flex items-center justify-between">
                        <span className="text-sm">{dia}</span>
                        <div className="flex items-center gap-2">
                          <div className={`w-4 h-4 rounded-full ${ativo ? 'bg-green-500' : 'bg-gray-200'}`} />
                          <span className="text-sm text-gray-500">
                            {ativo ? `${Math.floor(Math.random() * 3) + 1}h` : '0h'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Metas Mensais</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Horas de Estudo</span>
                      <span>32/40h</span>
                    </div>
                    <Progress value={80} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Cursos Concluídos</span>
                      <span>2/3</span>
                    </div>
                    <Progress value={67} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Exercícios Resolvidos</span>
                      <span>45/50</span>
                    </div>
                    <Progress value={90} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Conquistas recentes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Conquistas Recentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {achievementsConquistados.slice(-4).map(achievement => {
                  const IconeAchievement = LucideIcons[achievement.icone as keyof typeof LucideIcons] as any;
                  
                  return (
                    <div key={achievement.id} className="flex items-center gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="h-10 w-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                        <IconeAchievement className="h-5 w-5 text-yellow-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-yellow-900">{achievement.titulo}</h4>
                        <p className="text-sm text-yellow-700">+{achievement.pontos_xp} XP</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-6">
          {/* Achievements conquistados */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Conquistas Desbloqueadas ({achievementsConquistados.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {achievementsConquistados.map(achievement => {
                  const IconeAchievement = LucideIcons[achievement.icone as keyof typeof LucideIcons] as any;
                  
                  return (
                    <div key={achievement.id} className="flex items-start gap-4 p-4 border rounded-lg bg-green-50 border-green-200">
                      <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <IconeAchievement className="h-6 w-6 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-green-900">{achievement.titulo}</h4>
                        <p className="text-sm text-green-700 mb-2">{achievement.descricao}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-green-600">+{achievement.pontos_xp} XP</span>
                          <Badge variant="outline" className="text-xs">
                            {achievement.data_conquista && new Date(achievement.data_conquista).toLocaleDateString('pt-BR')}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Achievements pendentes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Próximas Conquistas ({achievementsPendentes.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {achievementsPendentes.map(achievement => {
                  const IconeAchievement = LucideIcons[achievement.icone as keyof typeof LucideIcons] as any;
                  const progressoPorcentagem = achievement.progresso && achievement.meta 
                    ? (achievement.progresso / achievement.meta) * 100 
                    : 0;
                  
                  return (
                    <div key={achievement.id} className="flex items-start gap-4 p-4 border rounded-lg">
                      <div className="h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <IconeAchievement className="h-6 w-6 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold">{achievement.titulo}</h4>
                        <p className="text-sm text-gray-600 mb-2">{achievement.descricao}</p>
                        
                        {achievement.progresso !== undefined && achievement.meta && (
                          <div className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span>Progresso</span>
                              <span>{achievement.progresso}/{achievement.meta}</span>
                            </div>
                            <Progress value={progressoPorcentagem} className="h-2" />
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-sm text-gray-500">+{achievement.pontos_xp} XP</span>
                          <Badge variant="secondary">{achievement.categoria}</Badge>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ranking" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Ranking Global</CardTitle>
              <CardDescription>Top estudantes da plataforma</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {rankingMock.map((user, index) => {
                  const isUsuarioAtual = user.nome === usuario?.nome;
                  
                  return (
                    <div 
                      key={user.posicao} 
                      className={`flex items-center gap-4 p-3 rounded-lg border ${
                        isUsuarioAtual ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${
                        user.posicao === 1 ? 'bg-yellow-100 text-yellow-800' :
                        user.posicao === 2 ? 'bg-gray-100 text-gray-800' :
                        user.posicao === 3 ? 'bg-orange-100 text-orange-800' :
                        'bg-gray-50 text-gray-600'
                      }`}>
                        {user.posicao === 1 ? '🥇' : 
                         user.posicao === 2 ? '🥈' : 
                         user.posicao === 3 ? '🥉' : 
                         user.posicao}
                      </div>
                      
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback>{gerarIniciaisNome(user.nome)}</AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className={`font-medium ${isUsuarioAtual ? 'text-blue-900' : ''}`}>
                            {user.nome}
                            {isUsuarioAtual && <span className="text-blue-600">(Você)</span>}
                          </h4>
                          <Badge variant="outline" className="text-xs">
                            {user.nivel}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>{user.pontos_xp.toLocaleString()} XP</span>
                          <span>{user.badges} badges</span>
                        </div>
                      </div>
                      
                      {isUsuarioAtual && (
                        <div className="text-right">
                          <Badge variant="secondary">Sua posição</Badge>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}