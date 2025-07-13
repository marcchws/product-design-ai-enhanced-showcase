// src/app/showcase/gestao-projetos/projetos-relatorios.tsx
'use client'

import React, { useState, useCallback, useMemo } from 'react'
import { toast } from 'sonner'
import * as LucideIcons from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { type Projeto, type Tarefa, type Atividade } from '@/types/projetos'
import { formatarDataContextual, formatarMoeda, formatarStatusVisual, gerarIniciaisNome } from '@/lib/utils-defensivas'
import { usuariosMock } from '@/data/mock-usuarios'

interface DadosGlobais {
  projetos: Projeto[];
  tarefas: Tarefa[];
  atividades: Atividade[];
  estatisticas: any;
}

interface ProjetosRelatoriosProps {
  dados: DadosGlobais;
  periodo: 'mes' | 'trimestre' | 'ano';
}

interface MetricaProjeto {
  projeto: Projeto;
  tarefas_total: number;
  tarefas_concluidas: number;
  taxa_conclusao: number;
  tempo_estimado: number;
  tempo_trabalhado: number;
  eficiencia: number;
  dias_restantes: number;
  status_prazo: 'no_prazo' | 'atrasado' | 'em_risco';
}

interface MetricaUsuario {
  usuario: any;
  projetos_envolvidos: number;
  tarefas_atribuidas: number;
  tarefas_concluidas: number;
  produtividade: number;
  tempo_trabalhado: number;
}

export default function ProjetosRelatorios({ dados, periodo: periodoInicial }: ProjetosRelatoriosProps) {
  const [periodo, setPeriodo] = useState(periodoInicial)
  const [tipoRelatorio, setTipoRelatorio] = useState('overview')
  const [exportando, setExportando] = useState(false)

  // Calcular métricas por projeto
  const metricasProjetos = useMemo((): MetricaProjeto[] => {
    return dados.projetos.map(projeto => {
      const tarefasProjeto = dados.tarefas.filter(t => t.projeto_id === projeto.id)
      const tarefasConcluidas = tarefasProjeto.filter(t => t.status === 'concluida')
      
      const tempoEstimado = tarefasProjeto.reduce((acc, t) => acc + (t.tempo_estimado || 0), 0)
      const tempoTrabalhado = tarefasProjeto.reduce((acc, t) => acc + (t.tempo_trabalhado || 0), 0)
      
      const dataFim = new Date(projeto.data_fim)
      const agora = new Date()
      const diasRestantes = Math.ceil((dataFim.getTime() - agora.getTime()) / (1000 * 60 * 60 * 24))
      
      let statusPrazo: 'no_prazo' | 'atrasado' | 'em_risco' = 'no_prazo'
      if (diasRestantes < 0 && !['concluido', 'cancelado'].includes(projeto.status)) {
        statusPrazo = 'atrasado'
      } else if (diasRestantes <= 7 && diasRestantes >= 0) {
        statusPrazo = 'em_risco'
      }

      return {
        projeto,
        tarefas_total: tarefasProjeto.length,
        tarefas_concluidas: tarefasConcluidas.length,
        taxa_conclusao: tarefasProjeto.length > 0 ? (tarefasConcluidas.length / tarefasProjeto.length) * 100 : 0,
        tempo_estimado: tempoEstimado,
        tempo_trabalhado: tempoTrabalhado,
        eficiencia: tempoEstimado > 0 ? (tempoTrabalhado / tempoEstimado) * 100 : 0,
        dias_restantes: diasRestantes,
        status_prazo: statusPrazo
      }
    })
  }, [dados])

  // Calcular métricas por usuário
  const metricasUsuarios = useMemo((): MetricaUsuario[] => {
    return usuariosMock.map(usuario => {
      const tarefasUsuario = dados.tarefas.filter(t => t.responsavel_id === usuario.id)
      const tarefasConcluidas = tarefasUsuario.filter(t => t.status === 'concluida')
      const projetosEnvolvidos = new Set(tarefasUsuario.map(t => t.projeto_id)).size
      const tempoTrabalhado = tarefasUsuario.reduce((acc, t) => acc + (t.tempo_trabalhado || 0), 0)

      return {
        usuario,
        projetos_envolvidos: projetosEnvolvidos,
        tarefas_atribuidas: tarefasUsuario.length,
        tarefas_concluidas: tarefasConcluidas.length,
        produtividade: tarefasUsuario.length > 0 ? (tarefasConcluidas.length / tarefasUsuario.length) * 100 : 0,
        tempo_trabalhado: tempoTrabalhado
      }
    }).filter(m => m.tarefas_atribuidas > 0) // Apenas usuários com tarefas
  }, [dados.tarefas])

  // Estatísticas gerais
  const estatisticasGerais = useMemo(() => {
    const projetosAtivos = dados.projetos.filter(p => ['planejamento', 'em_andamento'].includes(p.status))
    const projetosConcluidos = dados.projetos.filter(p => p.status === 'concluido')
    const projetosAtrasados = metricasProjetos.filter(m => m.status_prazo === 'atrasado')
    
    const orcamentoTotal = dados.projetos.reduce((acc, p) => acc + (p.orcamento || 0), 0)
    const orcamentoAtivos = projetosAtivos.reduce((acc, p) => acc + (p.orcamento || 0), 0)
    
    const tempoTotalEstimado = metricasProjetos.reduce((acc, m) => acc + m.tempo_estimado, 0)
    const tempoTotalTrabalhado = metricasProjetos.reduce((acc, m) => acc + m.tempo_trabalhado, 0)
    
    return {
      projetos_ativos: projetosAtivos.length,
      projetos_concluidos: projetosConcluidos.length,
      projetos_atrasados: projetosAtrasados.length,
      taxa_sucesso: dados.projetos.length > 0 ? (projetosConcluidos.length / dados.projetos.length) * 100 : 0,
      orcamento_total: orcamentoTotal,
      orcamento_ativo: orcamentoAtivos,
      tempo_estimado_total: tempoTotalEstimado,
      tempo_trabalhado_total: tempoTotalTrabalhado,
      eficiencia_geral: tempoTotalEstimado > 0 ? (tempoTotalTrabalhado / tempoTotalEstimado) * 100 : 0
    }
  }, [dados.projetos, metricasProjetos])

  // Função para exportar relatório
  const handleExportar = useCallback(async () => {
    setExportando(true)
    
    try {
      // Simular exportação
      await new Promise(resolve => setTimeout(resolve, 2000))
      toast.success('Relatório exportado com sucesso')
    } catch (error) {
      toast.error('Falha ao exportar relatório')
    } finally {
      setExportando(false)
    }
  }, [])

  // Renderizar overview geral
  const renderizarOverview = useCallback(() => (
    <div className="space-y-6">
      {/* Cards de métricas principais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Sucesso</CardTitle>
            <LucideIcons.TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(estatisticasGerais.taxa_sucesso)}%</div>
            <p className="text-xs text-muted-foreground">
              {estatisticasGerais.projetos_concluidos} de {dados.projetos.length} projetos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projetos Atrasados</CardTitle>
            <LucideIcons.AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{estatisticasGerais.projetos_atrasados}</div>
            <p className="text-xs text-muted-foreground">
              de {estatisticasGerais.projetos_ativos} ativos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eficiência de Tempo</CardTitle>
            <LucideIcons.Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(estatisticasGerais.eficiencia_geral)}%</div>
            <p className="text-xs text-muted-foreground">
              {estatisticasGerais.tempo_trabalhado_total}h de {estatisticasGerais.tempo_estimado_total}h
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Orçamento Ativo</CardTitle>
            <LucideIcons.DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatarMoeda(estatisticasGerais.orcamento_ativo)}</div>
            <p className="text-xs text-muted-foreground">
              de {formatarMoeda(estatisticasGerais.orcamento_total)} total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Top projetos por performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Projetos com Melhor Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {metricasProjetos
                .filter(m => m.taxa_conclusao > 0)
                .sort((a, b) => b.taxa_conclusao - a.taxa_conclusao)
                .slice(0, 5)
                .map(metrica => (
                  <div key={metrica.projeto.id} className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{metrica.projeto.nome}</p>
                      <p className="text-xs text-gray-500">
                        {metrica.tarefas_concluidas}/{metrica.tarefas_total} tarefas
                      </p>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <Progress value={metrica.taxa_conclusao} className="w-16 h-2" />
                      <span className="text-sm font-medium w-12 text-right">
                        {Math.round(metrica.taxa_conclusao)}%
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Projetos que Precisam Atenção</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {metricasProjetos
                .filter(m => m.status_prazo === 'atrasado' || m.status_prazo === 'em_risco')
                .sort((a, b) => a.dias_restantes - b.dias_restantes)
                .slice(0, 5)
                .map(metrica => (
                  <div key={metrica.projeto.id} className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{metrica.projeto.nome}</p>
                      <p className="text-xs text-gray-500">
                        {Math.round(metrica.taxa_conclusao)}% concluído
                      </p>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <Badge variant={metrica.status_prazo === 'atrasado' ? 'destructive' : 'outline'}>
                        {metrica.status_prazo === 'atrasado' 
                          ? `${Math.abs(metrica.dias_restantes)} dias atrasado`
                          : `${metrica.dias_restantes} dias restantes`
                        }
                      </Badge>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  ), [estatisticasGerais, metricasProjetos, dados.projetos.length])

  // Renderizar relatório de projetos
  const renderizarRelatorioProjects = useCallback(() => (
    <Card>
      <CardHeader>
        <CardTitle>Relatório Detalhado de Projetos</CardTitle>
        <CardDescription>
          Análise completa de performance por projeto
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Projeto</th>
                <th className="text-left py-2">Status</th>
                <th className="text-right py-2">Progresso</th>
                <th className="text-right py-2">Tarefas</th>
                <th className="text-right py-2">Eficiência</th>
                <th className="text-right py-2">Prazo</th>
                <th className="text-right py-2">Orçamento</th>
              </tr>
            </thead>
            <tbody>
              {metricasProjetos.map(metrica => (
                <tr key={metrica.projeto.id} className="border-b hover:bg-gray-50">
                  <td className="py-3">
                    <div>
                      <p className="font-medium">{metrica.projeto.nome}</p>
                      <p className="text-xs text-gray-500 truncate max-w-48">
                        {metrica.projeto.descricao}
                      </p>
                    </div>
                  </td>
                  <td className="py-3">
                    {/* Map unsupported variants to supported ones */}
                    <Badge variant={
                      formatarStatusVisual(metrica.projeto.status).badge === 'success' ? 'default' : 
                      formatarStatusVisual(metrica.projeto.status).badge === 'warning' ? 'secondary' :
                      formatarStatusVisual(metrica.projeto.status).badge as "default" | "secondary" | "destructive" | "outline"
                    }>
                      {formatarStatusVisual(metrica.projeto.status).texto}
                    </Badge>
                  </td>
                  <td className="py-3 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <Progress value={metrica.taxa_conclusao} className="w-16 h-2" />
                      <span className="font-medium w-12">
                        {Math.round(metrica.taxa_conclusao)}%
                      </span>
                    </div>
                  </td>
                  <td className="py-3 text-right">
                    <span className="font-medium">
                      {metrica.tarefas_concluidas}/{metrica.tarefas_total}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <span className={`font-medium ${
                      metrica.eficiencia > 100 ? 'text-red-600' : 
                      metrica.eficiencia > 80 ? 'text-green-600' : 'text-yellow-600'
                    }`}>
                      {Math.round(metrica.eficiencia)}%
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <Badge variant={
                      metrica.status_prazo === 'atrasado' ? 'destructive' :
                      metrica.status_prazo === 'em_risco' ? 'outline' : 'secondary'
                    }>
                      {metrica.status_prazo === 'atrasado' 
                        ? `${Math.abs(metrica.dias_restantes)}d atraso`
                        : metrica.status_prazo === 'em_risco'
                        ? `${metrica.dias_restantes}d restantes`
                        : 'No prazo'
                      }
                    </Badge>
                  </td>
                  <td className="py-3 text-right font-medium">
                    {metrica.projeto.orcamento ? formatarMoeda(metrica.projeto.orcamento) : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  ), [metricasProjetos])

  // Renderizar relatório de equipe
  const renderizarRelatorioEquipe = useCallback(() => (
    <Card>
      <CardHeader>
        <CardTitle>Relatório de Produtividade da Equipe</CardTitle>
        <CardDescription>
          Performance individual dos colaboradores
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {metricasUsuarios
            .sort((a, b) => b.produtividade - a.produtividade)
            .map(metrica => (
              <div key={metrica.usuario.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-blue-600 font-medium">
                      {gerarIniciaisNome(metrica.usuario.nome)}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-medium">{metrica.usuario.nome}</h4>
                    <p className="text-sm text-gray-500">{metrica.usuario.cargo}</p>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-8 text-center">
                  <div>
                    <p className="text-2xl font-bold">{metrica.projetos_envolvidos}</p>
                    <p className="text-xs text-gray-500">Projetos</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{metrica.tarefas_concluidas}/{metrica.tarefas_atribuidas}</p>
                    <p className="text-xs text-gray-500">Tarefas</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{Math.round(metrica.produtividade)}%</p>
                    <p className="text-xs text-gray-500">Produtividade</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{metrica.tempo_trabalhado}h</p>
                    <p className="text-xs text-gray-500">Tempo</p>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </CardContent>
    </Card>
  ), [metricasUsuarios])

  return (
    <div className="space-y-6">
      {/* Controles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <LucideIcons.BarChart3 className="mr-2 h-5 w-5" />
            Relatórios e Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Período</label>
                    <Select value={periodo} onValueChange={(value) => setPeriodo(value as "mes" | "trimestre" | "ano")}>
                      <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mes">Último Mês</SelectItem>
                    <SelectItem value="trimestre">Último Trimestre</SelectItem>
                    <SelectItem value="ano">Último Ano</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button onClick={handleExportar} disabled={exportando}>
              {exportando ? (
                <>
                  <LucideIcons.Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Exportando...
                </>
              ) : (
                <>
                  <LucideIcons.Download className="mr-2 h-4 w-4" />
                  Exportar PDF
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Conteúdo dos relatórios */}
      <Tabs value={tipoRelatorio} onValueChange={setTipoRelatorio}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="projetos">Projetos</TabsTrigger>
          <TabsTrigger value="equipe">Equipe</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {renderizarOverview()}
        </TabsContent>

        <TabsContent value="projetos" className="space-y-6">
          {renderizarRelatorioProjects()}
        </TabsContent>

        <TabsContent value="equipe" className="space-y-6">
          {renderizarRelatorioEquipe()}
        </TabsContent>
      </Tabs>
    </div>
  )
}