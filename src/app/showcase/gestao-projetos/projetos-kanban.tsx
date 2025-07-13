// src/app/showcase/gestao-projetos/projetos-kanban.tsx
'use client'

import React, { useState, useCallback, useMemo } from 'react'
import { toast } from 'sonner'
import * as LucideIcons from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

import { type Projeto, type Tarefa, type Atividade } from '@/types/projetos'
import { formatarDataContextual, formatarStatusVisual, gerarIniciaisNome, truncarTextoInteligente } from '@/lib/utils-defensivas'
import { usuariosMock } from '@/data/mock-usuarios'
import { useMounted } from '@/hooks/use-mounted'

interface DadosGlobais {
  projetos: Projeto[];
  tarefas: Tarefa[];
  atividades: Atividade[];
  estatisticas: any;
}

interface ProjetosKanbanProps {
  dados: DadosGlobais;
  onAtualizarTarefa: (tarefaId: string, novoStatus: string) => void;
}

interface ColunaKanban {
  id: string;
  titulo: string;
  status: string;
  cor: string;
  icone: string;
  limiteWIP?: number;
}

const colunasKanban: ColunaKanban[] = [
  {
    id: 'a_fazer',
    titulo: 'A Fazer',
    status: 'a_fazer',
    cor: 'gray',
    icone: 'Circle',
    limiteWIP: 10
  },
  {
    id: 'em_progresso', 
    titulo: 'Em Progresso',
    status: 'em_progresso',
    cor: 'blue',
    icone: 'Clock',
    limiteWIP: 5
  },
  {
    id: 'revisao',
    titulo: 'Em Revisão',
    status: 'revisao',
    cor: 'yellow',
    icone: 'Eye',
    limiteWIP: 3
  },
  {
    id: 'concluida',
    titulo: 'Concluída',
    status: 'concluida',
    cor: 'green',
    icone: 'CheckCircle'
  }
]

export default function ProjetosKanban({ dados, onAtualizarTarefa }: ProjetosKanbanProps) {
  // Estados para filtros e controles
  const [projetoSelecionado, setProjetoSelecionado] = useState('todos')
  const [responsavelSelecionado, setResponsavelSelecionado] = useState('todos')
  const [prioridadeSelecionada, setPrioridadeSelecionada] = useState('todas')
  const [termoBusca, setTermoBusca] = useState('')
  
  // Estados para modal de tarefa
  const [modalTarefa, setModalTarefa] = useState<Tarefa | null>(null)
  const [editandoTarefa, setEditandoTarefa] = useState(false)
  const [salvandoTarefa, setSalvandoTarefa] = useState(false)
  
  // Estados para arrastar e soltar
  const [arrastando, setArrastando] = useState<string | null>(null)
  const [colunaDestaque, setColunaDestaque] = useState<string | null>(null)

  const montadoRef = useMounted()

  // Buscar dados do usuário  
  const buscarUsuario = useCallback((userId: string) => {
    return usuariosMock.find(u => u.id === userId)
  }, [])

  // Filtrar tarefas baseado nos filtros aplicados
  const tarefasFiltradas = useMemo(() => {
    let tarefas = dados.tarefas

    // Filtro por projeto
    if (projetoSelecionado !== 'todos') {
      tarefas = tarefas.filter(t => t.projeto_id === projetoSelecionado)
    }

    // Filtro por responsável
    if (responsavelSelecionado !== 'todos') {
      tarefas = tarefas.filter(t => t.responsavel_id === responsavelSelecionado)
    }

    // Filtro por prioridade
    if (prioridadeSelecionada !== 'todas') {
      tarefas = tarefas.filter(t => t.prioridade === prioridadeSelecionada)
    }

    // Filtro por termo de busca
    if (termoBusca.trim()) {
      const termo = termoBusca.toLowerCase()
      tarefas = tarefas.filter(t => 
        t.titulo.toLowerCase().includes(termo) ||
        t.descricao.toLowerCase().includes(termo)
      )
    }

    return tarefas
  }, [dados.tarefas, projetoSelecionado, responsavelSelecionado, prioridadeSelecionada, termoBusca])

  // Agrupar tarefas por coluna
  const tarefasPorColuna = useMemo(() => {
    const agrupadas: Record<string, Tarefa[]> = {}
    
    colunasKanban.forEach(coluna => {
      agrupadas[coluna.status] = tarefasFiltradas.filter(t => t.status === coluna.status)
    })
    
    return agrupadas
  }, [tarefasFiltradas])

  // Handlers para drag and drop
  const handleDragStart = useCallback((e: React.DragEvent, tarefaId: string) => {
    setArrastando(tarefaId)
    e.dataTransfer.setData('text/plain', tarefaId)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent, colunaStatus: string) => {
    e.preventDefault()
    setColunaDestaque(colunaStatus)
  }, [])

  const handleDragLeave = useCallback(() => {
    setColunaDestaque(null)
  }, [])

  const handleDrop = useCallback(async (e: React.DragEvent, novoStatus: string) => {
    e.preventDefault()
    
    const tarefaId = e.dataTransfer.getData('text/plain')
    if (!tarefaId || !montadoRef.current) return

    setArrastando(null)
    setColunaDestaque(null)

    try {
      onAtualizarTarefa(tarefaId, novoStatus)
      toast.success('Status da tarefa atualizado')
    } catch (error) {
      toast.error('Falha ao atualizar tarefa')
    }
  }, [onAtualizarTarefa, montadoRef])

  // Salvar alterações na tarefa
  const handleSalvarTarefa = useCallback(async (tarefaAtualizada: Partial<Tarefa>) => {
    if (!modalTarefa || !montadoRef.current) return

    setSalvandoTarefa(true)
    
    const timeoutId = setTimeout(() => {
      if (montadoRef.current) {
        setSalvandoTarefa(false)
        toast.error('Tempo de salvamento excedido')
      }
    }, 8000)

    try {
      // Simular salvamento
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      if (montadoRef.current) {
        toast.success('Tarefa atualizada com sucesso')
        setModalTarefa(null)
        setEditandoTarefa(false)
      }
    } catch (error) {
      if (montadoRef.current) {
        toast.error('Falha ao salvar tarefa')
      }
    } finally {
      clearTimeout(timeoutId)
      if (montadoRef.current) {
        setSalvandoTarefa(false)
      }
    }
  }, [modalTarefa, montadoRef])

  // Renderizar card de tarefa
  const renderizarTarefaCard = useCallback((tarefa: Tarefa) => {
    const projeto = dados.projetos.find(p => p.id === tarefa.projeto_id)
    const responsavel = tarefa.responsavel_id ? buscarUsuario(tarefa.responsavel_id) : null
    const prioridadeInfo = formatarStatusVisual(tarefa.prioridade)
    
    const isAtrasada = tarefa.data_fim && 
      new Date(tarefa.data_fim) < new Date() && 
      tarefa.status !== 'concluida'

    const progressoTempo = tarefa.tempo_estimado && tarefa.tempo_trabalhado 
      ? Math.min(100, (tarefa.tempo_trabalhado / tarefa.tempo_estimado) * 100)
      : 0

    return (
      <Card 
        key={tarefa.id}
        className={`cursor-pointer hover:shadow-md transition-shadow duration-200 ${
          arrastando === tarefa.id ? 'opacity-50' : ''
        }`}
        draggable
        onDragStart={(e) => handleDragStart(e, tarefa.id)}
        onClick={() => setModalTarefa(tarefa)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-sm font-medium line-clamp-2">
                {tarefa.titulo}
              </CardTitle>
              {projeto && (
                <CardDescription className="text-xs mt-1">
                  {projeto.nome}
                </CardDescription>
              )}
            </div>
            
            <div className="flex flex-col items-end space-y-1 ml-2">
              <Badge 
                variant={prioridadeInfo.badge as "default" | "secondary" | "destructive" | "outline"} 
                className="text-xs"
              >
                {tarefa.prioridade}
              </Badge>
              {isAtrasada && (
                <Badge variant="destructive" className="text-xs">
                  <LucideIcons.AlertTriangle className="mr-1 h-2 w-2" />
                  Atrasada
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {tarefa.descricao && (
            <p className="text-xs text-gray-600 line-clamp-2">
              {truncarTextoInteligente(tarefa.descricao, 80, 'descricao')}
            </p>
          )}

          {/* Progresso de tempo */}
          {tarefa.tempo_estimado && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Tempo</span>
                <span className="font-medium">
                  {tarefa.tempo_trabalhado || 0}h / {tarefa.tempo_estimado}h
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1">
                <div 
                  className={`h-1 rounded-full ${
                    progressoTempo > 100 ? 'bg-red-500' : 'bg-blue-500'
                  }`}
                  style={{ width: `${Math.min(100, progressoTempo)}%` }}
                />
              </div>
            </div>
          )}

          {/* Data de prazo */}
          {tarefa.data_fim && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">Prazo</span>
              <span className={isAtrasada ? 'text-red-600 font-medium' : 'text-gray-600'}>
                {formatarDataContextual(tarefa.data_fim, 'relativa')}
              </span>
            </div>
          )}

          {/* Responsável */}
          <div className="flex items-center justify-between pt-2 border-t">
            {responsavel ? (
              <div className="flex items-center space-x-2">
                <Avatar className="h-5 w-5">
                  <AvatarImage src={responsavel.avatar} />
                  <AvatarFallback className="text-xs">
                    {gerarIniciaisNome(responsavel.nome)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs text-gray-600">
                  {responsavel.nome}
                </span>
              </div>
            ) : (
              <span className="text-xs text-gray-400">Não atribuída</span>
            )}

            <div className="flex items-center space-x-1">
              {tarefa.dependencias && tarefa.dependencias.length > 0 && (
                <LucideIcons.Link className="h-3 w-3 text-gray-400" />
              )}
              <LucideIcons.MessageSquare className="h-3 w-3 text-gray-400" />
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }, [dados.projetos, buscarUsuario, arrastando, handleDragStart])

  // Renderizar coluna do kanban
  const renderizarColuna = useCallback((coluna: ColunaKanban) => {
    const tarefas = tarefasPorColuna[coluna.status] || []
    const IconeColuna = LucideIcons[coluna.icone as keyof typeof LucideIcons] as any
    const isDestaque = colunaDestaque === coluna.status
    const isLimiteExcedido = coluna.limiteWIP && tarefas.length > coluna.limiteWIP

    return (
      <div
        key={coluna.id}
        className={`bg-gray-50 rounded-lg p-4 min-h-[600px] transition-colors duration-200 ${
          isDestaque ? 'bg-blue-50 border-2 border-blue-300' : ''
        }`}
        onDragOver={(e) => handleDragOver(e, coluna.status)}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDrop(e, coluna.status)}
      >
        {/* Header da coluna */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <IconeColuna className={`h-4 w-4 text-${coluna.cor}-600`} />
            <h3 className="font-medium text-gray-900">{coluna.titulo}</h3>
            <Badge variant="secondary" className="text-xs">
              {tarefas.length}
            </Badge>
          </div>

          {coluna.limiteWIP && (
            <Badge 
              variant={isLimiteExcedido ? "destructive" : "outline"}
              className="text-xs"
            >
              WIP: {tarefas.length}/{coluna.limiteWIP}
            </Badge>
          )}
        </div>

        {/* Lista de tarefas */}
        <div className="space-y-3">
          {tarefas.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <IconeColuna className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Nenhuma tarefa</p>
            </div>
          ) : (
            tarefas.map(renderizarTarefaCard)
          )}
        </div>

        {/* Botão para adicionar tarefa */}
        <Button 
          variant="ghost" 
          className="w-full mt-4 border-2 border-dashed border-gray-300 hover:border-gray-400"
          onClick={() => {
            // Lógica para criar nova tarefa
            toast.info('Funcionalidade de criar tarefa em desenvolvimento')
          }}
        >
          <LucideIcons.Plus className="mr-2 h-4 w-4" />
          Adicionar Tarefa
        </Button>
      </div>
    )
  }, [tarefasPorColuna, colunaDestaque, handleDragOver, handleDragLeave, handleDrop, renderizarTarefaCard])

  // Verificar se existem filtros aplicados
  const filtrosAplicados = useMemo(() => {
    return projetoSelecionado !== 'todos' ||
           responsavelSelecionado !== 'todos' ||
           prioridadeSelecionada !== 'todas' ||
           termoBusca.trim() !== ''
  }, [projetoSelecionado, responsavelSelecionado, prioridadeSelecionada, termoBusca])

  // Limpar todos os filtros
  const handleLimparFiltros = useCallback(() => {
    setProjetoSelecionado('todos')
    setResponsavelSelecionado('todos')
    setPrioridadeSelecionada('todas')
    setTermoBusca('')
  }, [])

  return (
    <div className="space-y-6">
      {/* Controles e filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <LucideIcons.Kanban className="mr-2 h-5 w-5" />
            Quadro Kanban
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <LucideIcons.Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar tarefas..."
                value={termoBusca}
                onChange={(e) => setTermoBusca(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select
              value={projetoSelecionado}
              onValueChange={setProjetoSelecionado}
            >
              <SelectTrigger>
                <SelectValue placeholder="Projeto" />
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

            <Select
              value={responsavelSelecionado}
              onValueChange={setResponsavelSelecionado}
            >
              <SelectTrigger>
                <SelectValue placeholder="Responsável" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os Responsáveis</SelectItem>
                {usuariosMock.map(usuario => (
                  <SelectItem key={usuario.id} value={usuario.id}>
                    {usuario.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={prioridadeSelecionada}
              onValueChange={setPrioridadeSelecionada}
            >
              <SelectTrigger>
                <SelectValue placeholder="Prioridade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas as Prioridades</SelectItem>
                <SelectItem value="baixa">Baixa</SelectItem>
                <SelectItem value="media">Média</SelectItem>
                <SelectItem value="alta">Alta</SelectItem>
                <SelectItem value="critica">Crítica</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={handleLimparFiltros}
                disabled={!filtrosAplicados}
                className="flex-1"
              >
                <LucideIcons.RefreshCw className="mr-2 h-4 w-4" />
                Limpar
              </Button>
            </div>
          </div>

          {filtrosAplicados && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <LucideIcons.Filter className="inline mr-1 h-4 w-4" />
                Exibindo {tarefasFiltradas.length} tarefas filtradas de {dados.tarefas.length} totais
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quadro Kanban */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 overflow-x-auto">
        {colunasKanban.map(renderizarColuna)}
      </div>

      {/* Modal de detalhes da tarefa */}
      {modalTarefa && (
        <Dialog open={true} onOpenChange={() => setModalTarefa(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                <span>{modalTarefa.titulo}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditandoTarefa(!editandoTarefa)}
                >
                  <LucideIcons.Edit className="mr-2 h-4 w-4" />
                  {editandoTarefa ? 'Cancelar' : 'Editar'}
                </Button>
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              {editandoTarefa ? (
                // Formulário de edição
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="titulo">Título</Label>
                    <Input
                      id="titulo"
                      defaultValue={modalTarefa.titulo}
                      disabled={salvandoTarefa}
                    />
                  </div>

                  <div>
                    <Label htmlFor="descricao">Descrição</Label>
                    <Textarea
                      id="descricao"
                      defaultValue={modalTarefa.descricao}
                      disabled={salvandoTarefa}
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="status">Status</Label>
                      <Select defaultValue={modalTarefa.status}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="a_fazer">A Fazer</SelectItem>
                          <SelectItem value="em_progresso">Em Progresso</SelectItem>
                          <SelectItem value="revisao">Em Revisão</SelectItem>
                          <SelectItem value="concluida">Concluída</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="prioridade">Prioridade</Label>
                      <Select defaultValue={modalTarefa.prioridade}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="baixa">Baixa</SelectItem>
                          <SelectItem value="media">Média</SelectItem>
                          <SelectItem value="alta">Alta</SelectItem>
                          <SelectItem value="critica">Crítica</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              ) : (
                // Visualização dos dados
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Descrição</h4>
                    <p className="text-gray-600">{modalTarefa.descricao || 'Sem descrição'}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-1">Status</h4>
                      <Badge variant={formatarStatusVisual(modalTarefa.status).badge as "default" | "secondary" | "destructive" | "outline"}>
                        {formatarStatusVisual(modalTarefa.status).texto}
                      </Badge>
                    </div>

                    <div>
                      <h4 className="font-medium mb-1">Prioridade</h4>
                      <Badge variant={formatarStatusVisual(modalTarefa.prioridade).badge as "default" | "secondary" | "destructive" | "outline"}>
                        {modalTarefa.prioridade}
                      </Badge>
                    </div>
                  </div>

                  {modalTarefa.tempo_estimado && (
                    <div>
                      <h4 className="font-medium mb-1">Tempo</h4>
                      <p className="text-gray-600">
                        {modalTarefa.tempo_trabalhado || 0}h trabalhadas de {modalTarefa.tempo_estimado}h estimadas
                      </p>
                    </div>
                  )}

                  {modalTarefa.data_fim && (
                    <div>
                      <h4 className="font-medium mb-1">Prazo</h4>
                      <p className="text-gray-600">
                        {formatarDataContextual(modalTarefa.data_fim, 'longa')}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {editandoTarefa && (
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setEditandoTarefa(false)}
                  disabled={salvandoTarefa}
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={() => handleSalvarTarefa({})}
                  disabled={salvandoTarefa}
                >
                  {salvandoTarefa ? (
                    <>
                      <LucideIcons.Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <LucideIcons.Save className="mr-2 h-4 w-4" />
                      Salvar
                    </>
                  )}
                </Button>
              </DialogFooter>
            )}
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}