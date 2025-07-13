'use client'

import React, { useState, useCallback } from 'react'
import { toast } from 'sonner'
import * as LucideIcons from 'lucide-react'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface DashboardAprendizadoProps {
  usuario: any;
  dados: any;
  carregando: boolean;
  erro: string | null;
  onRecarregar: () => void;
}

// Estados UI específicos para dashboard educacional
const EstadoLoading = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[...Array(3)].map((_, i) => (
        <Card key={i}>
          <CardContent className="pt-6">
            <div className="animate-pulse space-y-3">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              <div className="h-2 bg-gray-200 rounded"></div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
    <div className="text-center py-8">
      <LucideIcons.BookOpen className="h-8 w-8 text-blue-600 mx-auto animate-pulse" />
      <p className="text-gray-500 mt-2">Carregando seu dashboard...</p>
    </div>
  </div>
);

const EstadoErro = ({ erro, onTentar }: { erro: string; onTentar: () => void }) => (
  <div className="bg-red-50 border border-red-200 p-8 rounded-lg text-center">
    <LucideIcons.AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
    <h3 className="text-lg font-medium text-red-900 mb-2">Erro no Dashboard</h3>
    <p className="text-red-700 mb-6">{erro}</p>
    <Button onClick={onTentar} variant="outline">
      <LucideIcons.RefreshCw className="mr-2 h-4 w-4" />
      Recarregar Dashboard
    </Button>
  </div>
);

const EstadoVazio = () => (
  <div className="text-center py-16">
    <LucideIcons.BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-6" />
    <h3 className="text-xl font-medium mb-2">Bem-vindo à sua jornada de aprendizado!</h3>
    <p className="text-gray-500 max-w-md mx-auto mb-8">
      Você ainda não iniciou nenhum curso. Explore nosso catálogo e comece a aprender hoje mesmo.
    </p>
    <Button>
      <LucideIcons.Search className="mr-2 h-4 w-4" />
      Explorar Cursos
    </Button>
  </div>
);

export default function DashboardAprendizado({ 
  usuario, 
  dados, 
  carregando, 
  erro, 
  onRecarregar 
}: DashboardAprendizadoProps) {
  const [expandirCurso, setExpandirCurso] = useState<number | null>(null);

  // Função para continuar curso
  const continuarCurso = useCallback((cursoId: number) => {
    toast.success('Redirecionando para a aula...', {
      description: 'Continuando de onde você parou'
    });
    // Lógica de navegação
  }, []);

  // Estados UI obrigatórios
  if (carregando) return <EstadoLoading />;
  if (erro) return <EstadoErro erro={erro} onTentar={onRecarregar} />;
  if (!dados?.cursos_em_progresso?.length) return <EstadoVazio />;

  return (
    <div className="space-y-8">
      {/* Cabeçalho motivacional */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-lg">
        <h2 className="text-2xl font-bold mb-2">
          Olá, {usuario?.nome?.split(' ')[0]}! 👋
        </h2>
        <p className="opacity-90">
          Você está no streak de {usuario?.streak_dias} dias. Continue assim!
        </p>
      </div>

      {/* Resumo de progresso */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <LucideIcons.BookOpen className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold">{dados.cursos_em_progresso?.length || 0}</p>
                <p className="text-sm text-gray-500">Cursos em Progresso</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <LucideIcons.Clock className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold">{dados.proximas_aulas?.length || 0}</p>
                <p className="text-sm text-gray-500">Próximas Aulas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <LucideIcons.Trophy className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold">{dados.achievements_recentes?.length || 0}</p>
                <p className="text-sm text-gray-500">Novos Achievements</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <LucideIcons.Flame className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold">{usuario?.streak_dias}</p>
                <p className="text-sm text-gray-500">Dias de Streak</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cursos em progresso */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Continue Aprendendo</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {dados.cursos_em_progresso?.map((curso: any) => (
            <Card key={curso.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="font-semibold text-lg mb-1">{curso.titulo}</h4>
                    <p className="text-sm text-gray-500">{curso.tempo_restante} restantes</p>
                  </div>
                  <Badge variant="outline">
                    {curso.progresso}%
                  </Badge>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Progresso</span>
                      <span>{curso.progresso}%</span>
                    </div>
                    <Progress value={curso.progresso} className="h-2" />
                  </div>

                  <Button 
                    onClick={() => continuarCurso(curso.id)}
                    className="w-full"
                  >
                    <LucideIcons.Play className="mr-2 h-4 w-4" />
                    Continuar Curso
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Próximas aulas */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Próximas Aulas</h3>
        <div className="space-y-3">
          {dados.proximas_aulas?.map((aula: any) => (
            <Card key={aula.id} className="hover:shadow-md transition-shadow">
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <LucideIcons.Play className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">{aula.titulo}</h4>
                      <p className="text-sm text-gray-500">{aula.curso} • {aula.duracao}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <LucideIcons.PlayCircle className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Achievements recentes */}
      {dados.achievements_recentes?.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold mb-4">Conquistas Recentes</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dados.achievements_recentes.map((achievement: any) => {
              const IconeAchievement = LucideIcons[achievement.icone as keyof typeof LucideIcons] as any;
              
              return (
                <Card key={achievement.id} className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
                  <CardContent className="pt-4">
                    <div className="flex items-center space-x-3">
                      <div className="h-12 w-12 bg-yellow-100 rounded-full flex items-center justify-center">
                        <IconeAchievement className="h-6 w-6 text-yellow-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-yellow-900">{achievement.titulo}</h4>
                        <p className="text-sm text-yellow-700">
                          Conquistado em {new Date(achievement.conquistado_em).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}