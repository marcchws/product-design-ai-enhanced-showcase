// src/app/showcase/gestao-projetos/projetos-timeline.tsx
'use client'

import React, { useState, useCallback, useMemo } from 'react'
import { toast } from 'sonner'
import * as LucideIcons from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { type Projeto, type Tarefa, type Atividade } from '@/types/projetos'
import { formatarDataContextual, formatarStatusVisual, gerarIniciaisNome } from '@/lib/utils-defensivas'
import { usuariosMock } from '@/data/mock-usuarios'

interface DadosGlobais {
  projetos: Projeto[];
  tarefas: Tarefa[];
  atividades: Atividade[];
  estatisticas: any;
}

interface ProjetosTimelineProps {
  dados: DadosGlobais;
  periodo: 'semana' | 'mes' | 'trimestre';
}

interface EventoTimeline {
  id: string;
  tipo: 'projeto' | 'tarefa' | 'atividade';
  titulo: string;
  descricao: string;
  data: string;
  projeto_id: string;
  autor_id?: string;
  status?: string;
  cor: string;
  icone: string;
}

export default function ProjetosTimeline({ dados, periodo: periodoInicial }: ProjetosTimelineProps) {
  const [periodo, setPeriodo] = useState(periodoInicial)
  const [visualizacao, setVisualizacao] = useState<'timeline' | 'calendario'>('timeline')
  const [filtroTipo, setFiltroTipo] = useState('todos')
  const [projetoSelecionado, setProjetoSelecionado] = useState('todos')

  // Buscar dados do usuário
  const buscarUsuario = useCallback((userId: string) => {
    return usuariosMock.find(u => u.id === userId)
  }, [])

  // Gerar eventos da timeline
  const eventos = useMemo((): EventoTimeline[] => {
    const eventosLista: EventoTimeline[] = []

    // Eventos de projetos
    dados.projetos.forEach(projeto => {
      // Início do projeto
      eventosLista.push({
        id: `projeto-inicio-${projeto.id}`,
        tipo: 'projeto',
        titulo: `Projeto "${projeto.nome}" iniciado`,
        descricao: projeto.descricao,
        data: projeto.data_inicio,
        projeto_id: projeto.id,
        status: projeto.status,
        cor: projeto.meta?.cor_tema || 'blue',
        icone: 'Play'
      })

      // Fim do projeto (se concluído)
      if (projeto.status === 'concluido') {
        eventosLista.push({
          id: `projeto-fim-${projeto.id}`,
          tipo: 'projeto',
          titulo: `Projeto "${projeto.nome}" concluído`,
          descricao: `Concluído com ${projeto.progresso}% de progresso`,
          data: projeto.data_atualizacao,
          projeto_id: projeto.id,
          status: projeto.status,
          cor: 'green',
          icone: 'CheckCircle'
        })
      }
    })

    // Eventos de tarefas
    dados.tarefas.forEach(tarefa => {
      const projeto = dados.projetos.find(p => p.id === tarefa.projeto_id)
      
      if (tarefa.status === 'concluida') {
        eventosLista.push({
          id: `tarefa-${tarefa.id}`,
          tipo: 'tarefa',
          titulo: `Tarefa "${tarefa.titulo}" concluída`,
          descricao: `Projeto: ${projeto?.nome}`,
          data: tarefa.data_atualizacao,
          projeto_id: tarefa.projeto_id,
          autor_id: tarefa.responsavel_id,
          status: tarefa.status,
          cor: 'green',
          icone: 'CheckSquare'
        })
      }
    })

    // Eventos de atividades
    dados.atividades.forEach(atividade => {
      const projeto = dados.projetos.find(p => p.id === atividade.projeto_id)
      
      let icone = 'Activity'
      let cor = 'blue'
      
      switch (atividade.tipo) {
        case 'criacao':
          icone = 'Plus'
          cor = 'green'
          break
        case 'edicao':
          icone = 'Edit'
          cor = 'blue'
          break
        case 'comentario':
          icone = 'MessageCircle'
          cor = 'purple'
          break
        case 'status_mudanca':
          icone = 'ArrowRight'
          cor = 'orange'
          break
        case 'atribuicao':
          icone = 'UserPlus'
          cor = 'cyan'
          break
      }

      eventosLista.push({
        id: `atividade-${atividade.id}`,
        tipo: 'atividade',
        titulo: atividade.descricao,
        descricao: `Projeto: ${projeto?.nome}`,
        data: atividade.data_criacao,
        projeto_id: atividade.projeto_id,
        autor_id: atividade.autor_id,
        cor,
        icone
      })
    })

    return eventosLista.sort((a, b) => 
      new Date(b.data).getTime() - new Date(a.data).getTime()
    )
  }, [dados])

  // Filtrar eventos
  const eventosFiltrados = useMemo(() => {
    let eventosFiltrados = eventos

    // Filtro por tipo
    if (filtroTipo !== 'todos') {
      eventosFiltrados = eventosFiltrados.filter(evento => evento.tipo === filtroTipo)
    }

    // Filtro por projeto
    if (projetoSelecionado !== 'todos') {
      eventosFiltrados = eventosFiltrados.filter(evento => evento.projeto_id === projetoSelecionado)
    }

    // Filtro por período
    const agora = new Date()
    let dataLimite = new Date()
    
    switch (periodo) {
      case 'semana':
        dataLimite.setDate(agora.getDate() - 7)
        break
      case 'mes':
        dataLimite.setMonth(agora.getMonth() - 1)
        break
      case 'trimestre':
        dataLimite.setMonth(agora.getMonth() - 3)
        break
    }

    eventosFiltrados = eventosFiltrados.filter(evento => 
      new Date(evento.data) >= dataLimite
    )

    return eventosFiltrados
  }, [eventos, filtroTipo, projetoSelecionado, periodo])

  // Agrupar eventos por data
  const eventosAgrupados = useMemo(() => {
    const agrupados: Record<string, EventoTimeline[]> = {}
    
    eventosFiltrados.forEach(evento => {
      const dataKey = new Date(evento.data).toISOString().split('T')[0]
      if (!agrupados[dataKey]) {
        agrupados[dataKey] = []
      }
      agrupados[dataKey].push(evento)
    })

    return Object.entries(agrupados)
      .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
  }, [eventosFiltrados])

  // Renderizar evento individual
  const renderizarEvento = useCallback((evento: EventoTimeline) => {
    const autor = evento.autor_id ? buscarUsuario(evento.autor_id) : null
    const projeto = dados.projetos.find(p => p.id === evento.projeto_id)
    const IconeEvento = LucideIcons[evento.icone as keyof typeof LucideIcons] as any

    return (
      <div key={evento.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
        <div className={`p-2 rounded-full bg-${evento.cor}-100 flex-shrink-0`}>
          <IconeEvento className={`h-4 w-4 text-${evento.cor}-600`} />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="text-sm font-medium text-gray-900 line-clamp-2">
                {evento.titulo}
              </h4>
              <p className="text-xs text-gray-500 mt-1">
                {evento.descricao}
              </p>
            </div>
            
            <span className="text-xs text-gray-400 ml-2 flex-shrink-0">
              {formatarDataContextual(evento.data, 'curta')}
            </span>
          </div>

          <div className="flex items-center mt-2 space-x-2">
            {projeto && (
              <Badge variant="outline" className="text-xs">
                {projeto.nome}
              </Badge>
            )}
            
            {autor && (
              <div className="flex items-center space-x-1">
                <Avatar className="h-4 w-4">
                  <AvatarImage src={autor.avatar} />
                  <AvatarFallback className="text-xs">
                    {gerarIniciaisNome(autor.nome)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs text-gray-500">
                  {autor.nome}
                </span>
              </div>
            )}

            <Badge 
              variant="secondary" 
              className="text-xs capitalize"
            >
              {evento.tipo}
            </Badge>
          </div>
        </div>
      </div>
    )
  }, [buscarUsuario, dados.projetos])

  // Renderizar view de calendário
  const renderizarCalendario = useCallback(() => {
    // Simplificado - em implementação real usaria biblioteca como react-big-calendar
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <LucideIcons.Calendar className="mr-2 h-5 w-5" />
            Visualização em Calendário
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <LucideIcons.Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Em Desenvolvimento</h3>
            <p className="text-gray-500">
              A visualização em calendário estará disponível em breve.
            </p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => setVisualizacao('timeline')}
            >
              <LucideIcons.ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para Timeline
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }, [])

  return (
    <div className="space-y-6">
      {/* Controles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <LucideIcons.Clock className="mr-2 h-5 w-5" />
            Timeline de Atividades
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Período</label>
                <Select 
                  value={periodo} 
                  onValueChange={(value) => setPeriodo(value as "semana" | "mes" | "trimestre")}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="semana">Última Semana</SelectItem>
                    <SelectItem value="mes">Último Mês</SelectItem>
                    <SelectItem value="trimestre">Último Trimestre</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Tipo</label>
                <Select value={filtroTipo} onValueChange={setFiltroTipo}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="projeto">Projetos</SelectItem>
                    <SelectItem value="tarefa">Tarefas</SelectItem>
                    <SelectItem value="atividade">Atividades</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Projeto</label>
                <Select value={projetoSelecionado} onValueChange={setProjetoSelecionado}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os Projetos</SelectItem>
                    {dados.projetos.map(projeto => (
                      <SelectItem key={projeto.id} value={projeto.id}>
                        {projeto.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Tabs value={visualizacao} onValueChange={setVisualizacao as any}>
              <TabsList>
                <TabsTrigger value="timeline">
                  <LucideIcons.List className="mr-2 h-4 w-4" />
                  Timeline
                </TabsTrigger>
                <TabsTrigger value="calendario">
                  <LucideIcons.Calendar className="mr-2 h-4 w-4" />
                  Calendário
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas do período */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <LucideIcons.Activity className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total de Eventos</p>
                <p className="text-2xl font-bold">{eventosFiltrados.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <LucideIcons.FolderOpen className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Projetos Ativos</p>
                <p className="text-2xl font-bold">
                  {eventosFiltrados.filter(e => e.tipo === 'projeto').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <LucideIcons.CheckSquare className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tarefas Concluídas</p>
                <p className="text-2xl font-bold">
                  {eventosFiltrados.filter(e => e.tipo === 'tarefa').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <LucideIcons.Users className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Colaboradores</p>
                <p className="text-2xl font-bold">
                  {new Set(eventosFiltrados.map(e => e.autor_id).filter(Boolean)).size}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Conteúdo principal */}
      {visualizacao === 'calendario' ? (
        renderizarCalendario()
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Timeline de Eventos</CardTitle>
            <CardDescription>
              {eventosFiltrados.length} eventos encontrados no período selecionado
            </CardDescription>
          </CardHeader>
          <CardContent>
            {eventosAgrupados.length === 0 ? (
              <div className="text-center py-12">
                <LucideIcons.Calendar className="h-16 w-16 text-gray-300 mx-auto mb-6" />
                <h3 className="text-xl font-medium mb-2">Nenhum evento encontrado</h3>
                <p className="text-gray-500 max-w-md mx-auto mb-8">
                  Não há eventos para o período e filtros selecionados. 
                  Tente ajustar os critérios de busca.
                </p>
                <Button 
                  variant="outline"
                  onClick={() => {
                    setFiltroTipo('todos')
                    setProjetoSelecionado('todos')
                    setPeriodo('mes')
                  }}
                >
                  <LucideIcons.RefreshCw className="mr-2 h-4 w-4" />
                  Limpar Filtros
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {eventosAgrupados.map(([data, eventos]) => (
                  <div key={data} className="relative">
                    {/* Linha da timeline */}
                    <div className="absolute left-6 top-8 bottom-0 w-px bg-gray-200" />
                    
                    {/* Header da data */}
                    <div className="flex items-center mb-4">
                      <div className="bg-white border-2 border-gray-200 rounded-full p-2 z-10">
                        <LucideIcons.Calendar className="h-4 w-4 text-gray-600" />
                      </div>
                      <h3 className="ml-4 text-lg font-semibold text-gray-900">
                        {formatarDataContextual(data, 'longa')}
                      </h3>
                      <Badge variant="secondary" className="ml-2">
                        {eventos.length} eventos
                      </Badge>
                    </div>

                    {/* Eventos do dia */}
                    <div className="ml-12 space-y-2">
                      {eventos.map(renderizarEvento)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}