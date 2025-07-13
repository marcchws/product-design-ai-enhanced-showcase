'use client'

import React, { useState, useCallback, useMemo } from 'react'
import { toast } from 'sonner'
import * as LucideIcons from 'lucide-react'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"

interface CursosCatalogoProps {
  usuario: any;
  dados: any;
  carregando: boolean;
  erro: string | null;
  onRecarregar: () => void;
}

const EstadoLoading = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <Card key={i}>
          <CardContent className="pt-6">
            <div className="animate-pulse space-y-4">
              <div className="h-40 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);

const EstadoErro = ({ erro, onTentar }: { erro: string; onTentar: () => void }) => (
  <div className="bg-red-50 border border-red-200 p-8 rounded-lg text-center">
    <LucideIcons.AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
    <h3 className="text-lg font-medium text-red-900 mb-2">Erro ao Carregar Cursos</h3>
    <p className="text-red-700 mb-6">{erro}</p>
    <Button onClick={onTentar} variant="outline">
      <LucideIcons.RefreshCw className="mr-2 h-4 w-4" />
      Recarregar Catálogo
    </Button>
  </div>
);

export default function CursosCatalogo({ 
  usuario, 
  dados, 
  carregando, 
  erro, 
  onRecarregar 
}: CursosCatalogoProps) {
  const [filtros, setFiltros] = useState({
    termo: '',
    categoria: 'todas',
    nivel: 'todos',
    tipo: 'todos' // todos, gratuitos, premium
  });

  const [visualizacao, setVisualizacao] = useState<'grid' | 'lista'>('grid');

  // Handler para mudança de filtros
  const handleFiltroChange = useCallback((campo: string, valor: string) => {
    setFiltros(prev => ({ ...prev, [campo]: valor }));
  }, []);

  // Inscrever em curso
  const inscreverCurso = useCallback((cursoId: number) => {
    toast.success('Inscrição realizada!', {
      description: 'Você foi inscrito no curso com sucesso'
    });
  }, []);

  // Continuar curso
  const continuarCurso = useCallback((cursoId: number) => {
    toast.info('Redirecionando...', {
      description: 'Abrindo a próxima aula'
    });
  }, []);

  // Estados UI obrigatórios
  if (carregando) return <EstadoLoading />;
  if (erro) return <EstadoErro erro={erro} onTentar={onRecarregar} />;

  return (
    <div className="space-y-6">
      {/* Cabeçalho e filtros */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Catálogo de Cursos</h2>
          <p className="text-gray-600">
            {dados?.total || 0} cursos disponíveis para você
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={visualizacao === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setVisualizacao('grid')}
          >
            <LucideIcons.Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            variant={visualizacao === 'lista' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setVisualizacao('lista')}
          >
            <LucideIcons.List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <LucideIcons.Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar cursos..."
                value={filtros.termo}
                onChange={e => handleFiltroChange('termo', e.target.value)}
                className="pl-9"
              />
            </div>

            <Select
              value={filtros.categoria}
              onValueChange={valor => handleFiltroChange('categoria', valor)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas as Categorias</SelectItem>
                <SelectItem value="desenvolvimento">Desenvolvimento</SelectItem>
                <SelectItem value="design">Design</SelectItem>
                <SelectItem value="data-science">Data Science</SelectItem>
                <SelectItem value="marketing">Marketing</SelectItem>
                <SelectItem value="negocios">Negócios</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filtros.nivel}
              onValueChange={valor => handleFiltroChange('nivel', valor)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Nível" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os Níveis</SelectItem>
                <SelectItem value="iniciante">Iniciante</SelectItem>
                <SelectItem value="intermediario">Intermediário</SelectItem>
                <SelectItem value="avancado">Avançado</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filtros.tipo}
              onValueChange={valor => handleFiltroChange('tipo', valor)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os Tipos</SelectItem>
                <SelectItem value="gratuitos">Gratuitos</SelectItem>
                <SelectItem value="premium">Premium</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Meus cursos em progresso */}
      {dados?.meus_cursos?.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold mb-4">Meus Cursos</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {dados.meus_cursos.map((curso: any) => (
              <Card key={curso.id} className="bg-blue-50 border-blue-200">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="font-semibold">{curso.titulo}</h4>
                      <p className="text-sm text-gray-600">
                        Última aula: {new Date(curso.ultima_aula).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <Badge variant="secondary">{curso.progresso}%</Badge>
                  </div>

                  <div className="space-y-3">
                    <Progress value={curso.progresso} className="h-2" />
                    <Button 
                      onClick={() => continuarCurso(curso.id)}
                      className="w-full"
                    >
                      <LucideIcons.Play className="mr-2 h-4 w-4" />
                      Continuar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Cursos em destaque */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Cursos em Destaque</h3>
        
        {visualizacao === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dados?.em_destaque?.map((curso: any) => (
              <Card key={curso.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  {/* Thumbnail do curso */}
                  <div className="h-40 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg mb-4 flex items-center justify-center">
                    <LucideIcons.PlayCircle className="h-12 w-12 text-blue-600" />
                  </div>

                  <div className="space-y-3">
                    <div>
                      <h4 className="font-semibold text-lg">{curso.titulo}</h4>
                      <p className="text-sm text-gray-600">por {curso.instrutor}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <LucideIcons.Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <span className="text-sm">{curso.rating}</span>
                      </div>
                      <span className="text-sm text-gray-500">•</span>
                      <span className="text-sm text-gray-500">{curso.alunos} alunos</span>
                      <span className="text-sm text-gray-500">•</span>
                      <span className="text-sm text-gray-500">{curso.duracao}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <Badge variant="outline">{curso.nivel}</Badge>
                      <span className="font-semibold text-lg">{curso.preco}</span>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {curso.tags?.slice(0, 3).map((tag: string) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <Button 
                      onClick={() => inscreverCurso(curso.id)}
                      className="w-full"
                    >
                      <LucideIcons.BookOpen className="mr-2 h-4 w-4" />
                      Inscrever-se
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          /* Visualização em lista */
          <div className="space-y-4">
            {dados?.em_destaque?.map((curso: any) => (
              <Card key={curso.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-6">
                    <div className="h-24 w-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <LucideIcons.PlayCircle className="h-8 w-8 text-blue-600" />
                    </div>

                    <div className="flex-1 space-y-2">
                      <div>
                        <h4 className="font-semibold text-lg">{curso.titulo}</h4>
                        <p className="text-sm text-gray-600">por {curso.instrutor}</p>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <LucideIcons.Star className="h-4 w-4 text-yellow-500 fill-current" />
                          <span className="text-sm">{curso.rating}</span>
                        </div>
                        <span className="text-sm text-gray-500">{curso.alunos} alunos</span>
                        <span className="text-sm text-gray-500">{curso.duracao}</span>
                        <Badge variant="outline">{curso.nivel}</Badge>
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {curso.tags?.map((tag: string) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="font-semibold text-lg mb-3">{curso.preco}</p>
                      <Button onClick={() => inscreverCurso(curso.id)}>
                        <LucideIcons.BookOpen className="mr-2 h-4 w-4" />
                        Inscrever-se
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Categorias populares */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Categorias Populares</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {dados?.categorias?.map((categoria: string) => (
            <Button
              key={categoria}
              variant="outline"
              className="h-16 flex flex-col"
              onClick={() => handleFiltroChange('categoria', categoria.toLowerCase().replace(' ', '-'))}
            >
              <LucideIcons.Folder className="h-6 w-6 mb-1" />
              <span className="text-sm">{categoria}</span>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}