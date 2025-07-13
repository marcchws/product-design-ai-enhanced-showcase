// src/app/showcase/gestao-projetos/projetos-dashboard.tsx
'use client'

import React, { useState, useCallback, useMemo } from 'react'
import { toast } from 'sonner'
import * as LucideIcons from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import { type Projeto, type Tarefa, type Atividade } from '@/types/projetos'
import { formatarDataContextual, formatarStatusVisual, gerarIniciaisNome, formatarMoeda } from '@/lib/utils-defensivas'
import { usuariosMock } from '@/data/mock-usuarios'

interface DadosGlobais {
  projetos: Projeto[];
  tarefas: Tarefa[];
  atividades: Atividade[];
  estatisticas: {
    total_projetos: number;
    projetos_ativos: number;
    tarefas_pendentes: number;
    progresso_medio: number;
  };
}

interface ProjetosDashboardProps {
  dados: DadosGlobais;
  onRecarregar: () => void;
}

export default function ProjetosDashboard({ dados, onRecarregar }: ProjetosDashboardProps) {
  const [filtroStatus, setFiltroStatus] = useState('todos')
  const [ordenacao, setOrdenacao] = useState('data_atualizacao')

  // Projetos filtrados e ordenados
  const projetosFiltrados = useMemo(() => {
    let projetosFiltrados = dados.projetos

    // Aplicar filtros
    if (filtroStatus !== 'todos') {
      projetosFiltrados = projetosFiltrados.filter(projeto => projeto.status === filtroStatus)
    }

    // Aplicar ordenação
    return projetosFiltrados.sort((a, b) => {
      switch (ordenacao) {
        case 'nome':
          return a.nome.localeCompare(b.nome)
        case 'progresso':
          return b.progresso - a.progresso
        case 'data_fim':
          return new Date(a.data_fim).getTime() - new Date(b.data_fim).getTime()
        default: // data_atualizacao
          return new Date(b.data_atualizacao).getTime() - new Date(a.data_atualizacao).getTime()
      }
    })
  }, [dados.projetos, filtroStatus, ordenacao])

  // Métricas calculadas
  const metricas = useMemo(() => {
    const projetos = dados.projetos
    const tarefas = dados.tarefas
    
    const projetosAtrasados = projetos.filter(p => 
      new Date(p.data_fim) < new Date() && 
      !['concluido', 'cancelado'].includes(p.status)
    ).length

    const tarefasConcluidas = tarefas.filter(t => t.status === 'concluida').length
    const tarefasTotal = tarefas.length
    const taxaConclusao = tarefasTotal > 0 ? Math.round((tarefasConcluidas / tarefasTotal) * 100) : 0

    const orcamentoTotal = projetos.reduce((acc, p) => acc + (p.orcamento || 0), 0)

    return {
      projetos_atrasados: projetosAtrasados,
      taxa_conclusao_tarefas: taxaConclusao,
      orcamento_total: orcamentoTotal,
      usuarios_ativos: new Set(tarefas.map(t => t.responsavel_id).filter(Boolean)).size
    }
  }, [dados])

  // Buscar dados do usuário
  const buscarUsuario = useCallback((userId: string) => {
    return usuariosMock.find(u => u.id === userId)
  }, [])

  // Renderizar card de projeto
  const renderizarProjetoCard = useCallback((projeto: Projeto) => {
    const statusInfo = formatarStatusVisual(projeto.status)
    const responsavel = buscarUsuario(projeto.responsavel_id)
    const tarefasProjeto = dados.tarefas.filter(t => t.projeto_id === projeto.id)
    const tarefasConcluidas = tarefasProjeto.filter(t => t.status === 'concluida').length
    
    const isAtrasado = new Date(projeto.data_fim) < new Date() && 
                     !['concluido', 'cancelado'].includes(projeto.status)
    
    const IconeProjeto = LucideIcons[(projeto.meta?.icone as keyof typeof LucideIcons) || 'Folder'] as any

    return (
      <Card key={projeto.id} className="hover:shadow-lg transition-shadow duration-200">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg bg-${projeto.meta?.cor_tema || 'blue'}-100`}>
                <IconeProjeto className={`h-5 w-5 text-${projeto.meta?.cor_tema || 'blue'}-600`} />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold">{projeto.nome}</CardTitle>
                <CardDescription className="text-sm">
                  {formatarDataContextual(projeto.data_fim, 'relativa')}
                </CardDescription>
              </div>
            </div>
            
            <div className="flex flex-col items-end space-y-2">
              <Badge variant={statusInfo.badge} className="text-xs">
                {statusInfo.texto}
              </Badge>
              {isAtrasado && (
                <Badge variant="destructive" className="text-xs">
                  <LucideIcons.AlertTriangle className="mr-1 h-3 w-3" />
                  Atrasado
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600 line-clamp-2">
            {projeto.descricao}
          </p>

          {/* Progresso */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Progresso</span>
              <span className="font-medium">{projeto.progresso}%</span>
            </div>
            <Progress value={projeto.progresso} className="h-2" />
          </div>

          {/* Tarefas */}
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Tarefas</span>
            <span className="font-medium">
              {tarefasConcluidas}/{tarefasProjeto.length} concluídas
            </span>
          </div>

          {/* Orçamento */}
          {projeto.orcamento && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Orçamento</span>
              <span className="font-medium text-green-600">
                {formatarMoeda(projeto.orcamento)}
              </span>
            </div>
          )}

          {/* Responsável */}
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center space-x-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={responsavel?.avatar} />
                <AvatarFallback className="text-xs">
                  {gerarIniciaisNome(responsavel?.nome)}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm text-gray-600">
                {responsavel?.nome || 'Não atribuído'}
              </span>
            </div>

            <Button variant="ghost" size="sm">
              <LucideIcons.ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }, [dados.tarefas, buscarUsuario])

  return (
    <div className="space-y-6">
      {/* Cards de métricas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projetos</CardTitle>
            <LucideIcons.FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dados.estatisticas.total_projetos}</div>
            <p className="text-xs text-muted-foreground">
              {dados.estatisticas.projetos_ativos} ativos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Conclusão</CardTitle>
            <LucideIcons.CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metricas.taxa_conclusao_tarefas}%</div>
            <p className="text-xs text-muted-foreground">
              das tarefas concluídas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projetos Atrasados</CardTitle>
            <LucideIcons.AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{metricas.projetos_atrasados}</div>
            <p className="text-xs text-muted-foreground">
              precisam atenção
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Orçamento Total</CardTitle>
            <LucideIcons.DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatarMoeda(metricas.orcamento_total)}</div>
            <p className="text-xs text-muted-foreground">
              em projetos ativos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros e controles */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Status</label>
            <Select value={filtroStatus} onValueChange={setFiltroStatus}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="planejamento">Planejamento</SelectItem>
                <SelectItem value="em_andamento">Em Andamento</SelectItem>
                <SelectItem value="pausado">Pausado</SelectItem>
                <SelectItem value="concluido">Concluído</SelectItem>
                <SelectItem value="cancelado">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Ordenar por</label>
            <Select value={ordenacao} onValueChange={setOrdenacao}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Ordenar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="data_atualizacao">Atualização</SelectItem>
                <SelectItem value="nome">Nome</SelectItem>
                <SelectItem value="progresso">Progresso</SelectItem>
                <SelectItem value="data_fim">Prazo</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={onRecarregar}>
            <LucideIcons.RefreshCw className="mr-2 h-4 w-4" />
            Atualizar
          </Button>
          
          <Button size="sm">
            <LucideIcons.Filter className="mr-2 h-4 w-4" />
            Filtros Avançados
          </Button>
        </div>
      </div>

      {/* Lista de projetos */}
      {projetosFiltrados.length === 0 ? (
        <div className="text-center py-12">
          <LucideIcons.FolderX className="h-16 w-16 text-gray-300 mx-auto mb-6" />
          <h3 className="text-xl font-medium mb-2">
            {filtroStatus === 'todos' ? 'Nenhum projeto encontrado' : 'Nenhum projeto com este status'}
          </h3>
          <p className="text-gray-500 max-w-md mx-auto mb-8">
            {filtroStatus === 'todos' 
              ? 'Você ainda não tem projetos cadastrados. Comece criando seu primeiro projeto.'
              : 'Tente ajustar os filtros para encontrar projetos.'
            }
          </p>
          
          {filtroStatus === 'todos' ? (
            <Button>
              <LucideIcons.Plus className="mr-2 h-4 w-4" />
              Criar Primeiro Projeto
            </Button>
          ) : (
            <Button variant="outline" onClick={() => setFiltroStatus('todos')}>
              <LucideIcons.RotateCcw className="mr-2 h-4 w-4" />
              Limpar Filtros
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projetosFiltrados.map(renderizarProjetoCard)}
        </div>
      )}

      {/* Atividades recentes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <LucideIcons.Activity className="mr-2 h-5 w-5" />
            Atividades Recentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {dados.atividades.slice(0, 5).map((atividade) => {
              const autor = buscarUsuario(atividade.autor_id)
              const projeto = dados.projetos.find(p => p.id === atividade.projeto_id)
              
              return (
                <div key={atividade.id} className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={autor?.avatar} />
                    <AvatarFallback className="text-xs">
                      {gerarIniciaisNome(autor?.nome)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">
                      <span className="font-medium">{autor?.nome}</span>
                      {' '}
                      {atividade.descricao}
                    </p>
                    <div className="flex items-center mt-1 space-x-2">
                      <Badge variant="outline" className="text-xs">
                        {projeto?.nome}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {formatarDataContextual(atividade.data_criacao, 'relativa')}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}