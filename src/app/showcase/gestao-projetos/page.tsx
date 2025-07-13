// src/app/showcase/gestao-projetos/page.tsx
'use client'

import React, { useState, useCallback, useEffect, useMemo } from 'react'
import { toast, Toaster } from 'sonner'
import * as LucideIcons from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { useMounted } from '@/hooks/use-mounted'

// Importar módulos específicos
import ProjetosDashboard from './projetos-dashboard'
import ProjetosKanban from './projetos-kanban'
import ProjetosTimeline from './projetos-timeline'
import ProjetosRelatorios from './projetos-relatorios'

// Tipos e dados
import { type Projeto, type Tarefa, type Atividade } from '@/types/projetos'
import { projetosMock, tarefasMock, atividadesMock } from '@/data/mock-projetos'
import { usuariosMock } from '@/data/mock-usuarios'

// Utilitárias defensivas
import { formatarDataContextual, formatarStatusVisual, gerarIniciaisNome } from '@/lib/utils-defensivas'

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

export default function GestaoProjetosShowcase() {
  // Estados globais compartilhados entre módulos
  const [dadosGlobais, setDadosGlobais] = useState<DadosGlobais | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const [abaSelecionada, setAbaSelecionada] = useState('dashboard')
  const [abasCarregadas, setAbasCarregadas] = useState<Set<string>>(new Set(['dashboard']))

  // Prevenção memory leak obrigatória
  const montadoRef = useMounted()

  // Estatísticas calculadas
  const estatisticas = useMemo(() => {
    if (!dadosGlobais) return null

    const { projetos, tarefas } = dadosGlobais
    const projetosAtivos = projetos.filter(p => ['planejamento', 'em_andamento'].includes(p.status))
    const tarefasPendentes = tarefas.filter(t => ['a_fazer', 'em_progresso'].includes(t.status))
    const progressoMedio = projetos.reduce((acc, p) => acc + p.progresso, 0) / projetos.length

    return {
      total_projetos: projetos.length,
      projetos_ativos: projetosAtivos.length,
      tarefas_pendentes: tarefasPendentes.length,
      progresso_medio: Math.round(progressoMedio)
    }
  }, [dadosGlobais])

  // Carregamento inicial dos dados
  const carregarDados = useCallback(async () => {
    if (!montadoRef.current) return

    setCarregando(true)
    setErro(null)

    // Timeout contextualizado para dashboard complexo
    const timeoutId = setTimeout(() => {
      if (montadoRef.current) {
        setCarregando(false)
        setErro('Tempo de carregamento excedido. Verifique sua conexão.')
      }
    }, 10000)

    try {
      // Simular carregamento de dados de múltiplas fontes
      await new Promise(resolve => setTimeout(resolve, 1500))

      if (montadoRef.current) {
        const dados: DadosGlobais = {
          projetos: projetosMock,
          tarefas: tarefasMock,
          atividades: atividadesMock.slice(-10), // Últimas 10 atividades
          estatisticas: {
            total_projetos: projetosMock.length,
            projetos_ativos: projetosMock.filter(p => ['planejamento', 'em_andamento'].includes(p.status)).length,
            tarefas_pendentes: tarefasMock.filter(t => ['a_fazer', 'em_progresso'].includes(t.status)).length,
            progresso_medio: Math.round(projetosMock.reduce((acc, p) => acc + p.progresso, 0) / projetosMock.length)
          }
        }

        setDadosGlobais(dados)
        toast.success('Dados carregados com sucesso')
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
      if (montadoRef.current) {
        setErro('Falha ao carregar dados. Tente novamente em alguns instantes.')
        toast.error('Erro ao carregar dashboard')
      }
    } finally {
      clearTimeout(timeoutId)
      if (montadoRef.current) {
        setCarregando(false)
      }
    }
  }, [montadoRef])

  // Carregar dados na inicialização
  useEffect(() => {
    carregarDados()
  }, [carregarDados])

  // Handler para mudança de aba com lazy loading
  const handleMudarAba = useCallback((novaAba: string) => {
    if (novaAba === abaSelecionada) return

    setAbaSelecionada(novaAba)

    // Marcar aba como carregada
    if (!abasCarregadas.has(novaAba)) {
      setAbasCarregadas(prev => {
        const newSet = new Set(prev);
        newSet.add(novaAba);
        return newSet;
      })
    }
  }, [abaSelecionada, abasCarregadas])

  // Configuração das abas com badges dinâmicas
  const configuracaoAbas = useMemo(() => [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icone: 'LayoutDashboard',
      badge: estatisticas?.projetos_ativos || null,
      lazy: false
    },
    {
      id: 'kanban',
      label: 'Kanban',
      icone: 'Kanban',
      badge: estatisticas?.tarefas_pendentes || null,
      lazy: true
    },
    {
      id: 'timeline',
      label: 'Timeline',
      icone: 'Calendar',
      badge: null,
      lazy: true
    },
    {
      id: 'relatorios',
      label: 'Relatórios',
      icone: 'BarChart3',
      badge: null,
      lazy: true
    }
  ], [estatisticas])

  // Estados de UI obrigatórios
  if (carregando) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center py-16">
            <div className="text-center">
              <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-6"></div>
              <h3 className="text-xl font-semibold mb-2">Carregando Dashboard</h3>
              <p className="text-gray-500">Sincronizando dados dos projetos...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (erro) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 p-8 rounded-lg text-center max-w-md mx-auto mt-16">
            <LucideIcons.AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-6" />
            <h3 className="text-xl font-semibold mb-4">Erro no Dashboard</h3>
            <p className="text-gray-700 mb-6">{erro}</p>
            <div className="space-x-3">
              <Button onClick={carregarDados}>
                <LucideIcons.RefreshCw className="mr-2 h-4 w-4" />
                Tentar Novamente
              </Button>
              <Button variant="outline" onClick={() => window.history.back()}>
                <LucideIcons.ArrowLeft className="mr-2 h-4 w-4" />
                Voltar
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!dadosGlobais) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-16">
            <LucideIcons.Database className="h-16 w-16 text-gray-300 mx-auto mb-6" />
            <h3 className="text-xl font-semibold mb-4">Nenhum dado disponível</h3>
            <p className="text-gray-500 mb-6">Não foi possível carregar os dados do dashboard.</p>
            <Button onClick={carregarDados}>
              <LucideIcons.RefreshCw className="mr-2 h-4 w-4" />
              Recarregar
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
      <Toaster position="bottom-right" richColors />
      
      {/* Header com navegação e ações */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.history.back()}
                className="text-gray-600 hover:text-gray-900"
              >
                <LucideIcons.ArrowLeft className="mr-2 h-4 w-4" />
                Voltar ao Showcase
              </Button>
              
              <div className="h-6 w-px bg-gray-300" />
              
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Gestão de Projetos</h1>
                <p className="text-sm text-gray-500">
                  {estatisticas?.total_projetos} projetos • {estatisticas?.projetos_ativos} ativos
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Badge variant="outline" className="text-sm">
                <LucideIcons.TrendingUp className="mr-1 h-3 w-3" />
                {estatisticas?.progresso_medio}% progresso médio
              </Badge>

              <Button>
                <LucideIcons.Plus className="mr-2 h-4 w-4" />
                Novo Projeto
              </Button>

              <Button variant="outline" size="sm">
                <LucideIcons.Info className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard principal com abas */}
      <div className="container mx-auto px-4 py-6">
        <Tabs value={abaSelecionada} onValueChange={handleMudarAba} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white shadow-sm">
            {configuracaoAbas.map(aba => {
              const IconeComponente = LucideIcons[aba.icone as keyof typeof LucideIcons] as any
              const isAtiva = abaSelecionada === aba.id
              
              return (
                <TabsTrigger 
                  key={aba.id}
                  value={aba.id}
                  className="relative data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
                >
                  <div className="flex items-center space-x-2">
                    <IconeComponente className="h-4 w-4" />
                    <span className="font-medium">{aba.label}</span>
                    {aba.badge && (
                      <Badge variant="secondary" className="ml-1 text-xs h-5">
                        {aba.badge}
                      </Badge>
                    )}
                  </div>
                </TabsTrigger>
              )
            })}
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <ProjetosDashboard 
              dados={dadosGlobais}
              onRecarregar={carregarDados}
            />
          </TabsContent>

          <TabsContent value="kanban" className="space-y-6">
            {abasCarregadas.has('kanban') ? (
              <ProjetosKanban 
                dados={dadosGlobais}
                onAtualizarTarefa={(tarefaId, novoStatus) => {
                  // Lógica para atualizar status da tarefa
                  toast.success('Status da tarefa atualizado')
                }}
              />
            ) : (
              <div className="flex justify-center py-12">
                <div className="text-center">
                  <LucideIcons.Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
                  <p className="text-gray-500">Carregando Kanban...</p>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="timeline" className="space-y-6">
            {abasCarregadas.has('timeline') ? (
              <ProjetosTimeline 
                dados={dadosGlobais}
                periodo="mes" 
              />
            ) : (
              <div className="flex justify-center py-12">
                <div className="text-center">
                  <LucideIcons.Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
                  <p className="text-gray-500">Carregando Timeline...</p>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="relatorios" className="space-y-6">
            {abasCarregadas.has('relatorios') ? (
              <ProjetosRelatorios 
                dados={dadosGlobais}
                periodo="trimestre"
              />
            ) : (
              <div className="flex justify-center py-12">
                <div className="text-center">
                  <LucideIcons.Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
                  <p className="text-gray-500">Carregando Relatórios...</p>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}