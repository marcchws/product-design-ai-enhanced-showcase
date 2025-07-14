'use client'

import React, { useState, useCallback, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { toast } from 'sonner'
import * as LucideIcons from 'lucide-react'

interface Props {
  maquinas: any[];
  alertas: any[];
  perfilUsuario: string;
}

// Tipos de manutenção
const tiposManutencao = [
  { id: 'preventiva', nome: 'Preventiva', cor: 'bg-blue-500', icone: 'Calendar' },
  { id: 'corretiva', nome: 'Corretiva', cor: 'bg-red-500', icone: 'AlertTriangle' },
  { id: 'preditiva', nome: 'Preditiva', cor: 'bg-purple-500', icone: 'Brain' },
  { id: 'melhorias', nome: 'Melhorias', cor: 'bg-green-500', icone: 'TrendingUp' }
];

// Função utilitária para calcular score de risco
const calcularScoreRisco = (maquina: any, alertas: any[]): number => {
  let score = 0;
  
  // Alertas críticos ativos
  const alertasCriticos = alertas.filter(a => 
    a.maquina_id === maquina.id && 
    a.tipo === 'critico' && 
    a.status === 'ativo'
  ).length;
  score += alertasCriticos * 30;
  
  // Eficiência baixa
  if (maquina.eficiencia < 70) score += 25;
  else if (maquina.eficiencia < 85) score += 15;
  
  // Tempo desde última manutenção (simulado)
  const tempoUltimaManutencao = Math.random() * 90; // dias
  if (tempoUltimaManutencao > 60) score += 20;
  else if (tempoUltimaManutencao > 30) score += 10;
  
  // Sensores em estado crítico
  const sensoresCriticos = maquina.sensores.filter((s: { status: string }) => s.status === 'critico').length;
  score += sensoresCriticos * 15;
  
  return Math.min(score, 100);
};

// Função utilitária para categoria de risco
const obterCategoriaRisco = (score: number) => {
  if (score >= 80) return { nivel: 'crítico', cor: 'text-red-400', bg: 'bg-red-500/20 border-red-500' };
  if (score >= 60) return { nivel: 'alto', cor: 'text-orange-400', bg: 'bg-orange-500/20 border-orange-500' };
  if (score >= 40) return { nivel: 'médio', cor: 'text-yellow-400', bg: 'bg-yellow-500/20 border-yellow-500' };
  return { nivel: 'baixo', cor: 'text-green-400', bg: 'bg-green-500/20 border-green-500' };
};

export default function ManutencaoPreditiva({ maquinas, alertas, perfilUsuario }: Props) {
  // Estados de interface
  const [filtroRisco, setFiltroRisco] = useState<string>('todos');
  const [modalAgendamento, setModalAgendamento] = useState(false);
  const [maquinaSelecionada, setMaquinaSelecionada] = useState<any | null>(null);
  const [agendamento, setAgendamento] = useState({
    tipo: 'preventiva',
    data: new Date(),
    prioridade: 'media',
    tecnico: '',
    descricao: '',
    estimativa_horas: '',
    pecas_necessarias: ''
  });
  const [processandoAgendamento, setProcessandoAgendamento] = useState(false);
  const [cronogramaManutencao] = useState([
    {
      id: 'mnt_001',
      maquina_id: 'maq_001',
      tipo: 'preventiva',
      data_agendada: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      tecnico: 'Carlos Silva',
      status: 'agendada',
      prioridade: 'alta',
      descricao: 'Troca de filtros e lubrificação geral'
    },
    {
      id: 'mnt_002',
      maquina_id: 'maq_003',
      tipo: 'corretiva',
      data_agendada: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
      tecnico: 'Ana Santos',
      status: 'em_execucao',
      prioridade: 'crítica',
      descricao: 'Reparo de sensor de temperatura'
    }
  ]);
  
  const montadoRef = React.useRef(true);
  
  React.useEffect(() => {
    montadoRef.current = true;
    return () => { montadoRef.current = false; };
  }, []);
  
  // Análise preditiva das máquinas
  const analisePredicao = useMemo(() => {
    const maquinasComRisco = maquinas.map(maquina => ({
      ...maquina,
      scoreRisco: calcularScoreRisco(maquina, alertas),
      proximaManutencao: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      tempoEstimadoFalha: Math.random() * 60 + 30 // dias
    })).sort((a, b) => b.scoreRisco - a.scoreRisco);
    
    const estatisticas = {
      critico: maquinasComRisco.filter(m => m.scoreRisco >= 80).length,
      alto: maquinasComRisco.filter(m => m.scoreRisco >= 60 && m.scoreRisco < 80).length,
      medio: maquinasComRisco.filter(m => m.scoreRisco >= 40 && m.scoreRisco < 60).length,
      baixo: maquinasComRisco.filter(m => m.scoreRisco < 40).length
    };
    
    return { maquinasComRisco, estatisticas };
  }, [maquinas, alertas]);
  
  // Filtrar máquinas por nível de risco
  const maquinasFiltradas = useMemo(() => {
    if (filtroRisco === 'todos') return analisePredicao.maquinasComRisco;
    
    const filtros = {
      'critico': (m: any) => m.scoreRisco >= 80,
      'alto': (m: any) => m.scoreRisco >= 60 && m.scoreRisco < 80,
      'medio': (m: any) => m.scoreRisco >= 40 && m.scoreRisco < 60,
      'baixo': (m: any) => m.scoreRisco < 40
    };
    
    return analisePredicao.maquinasComRisco.filter(
      filtroRisco in filtros ? filtros[filtroRisco as keyof typeof filtros] : () => true
    );
  }, [analisePredicao.maquinasComRisco, filtroRisco]);
  
  // Próximas manutenções
  const proximasManutencoes = useMemo(() => {
    return cronogramaManutencao
      .filter(m => new Date(m.data_agendada) >= new Date())
      .sort((a, b) => new Date(a.data_agendada).getTime() - new Date(b.data_agendada).getTime())
      .slice(0, 5);
  }, [cronogramaManutencao]);
  
  // Abrir modal de agendamento
  const handleAbrirAgendamento = useCallback((maquina: any) => {
    setMaquinaSelecionada(maquina);
    setModalAgendamento(true);
    
    // Sugerir tipo baseado no score de risco
    const tipoSugerido = maquina.scoreRisco >= 80 ? 'corretiva' : 'preventiva';
    setAgendamento(prev => ({
      ...prev,
      tipo: tipoSugerido,
      data: new Date(Date.now() + 24 * 60 * 60 * 1000), // amanhã
      descricao: '',
      tecnico: '',
      estimativa_horas: '',
      pecas_necessarias: ''
    }));
  }, []);
  
  // Confirmar agendamento
  const handleConfirmarAgendamento = useCallback(async () => {
    if (!maquinaSelecionada || !montadoRef.current) return;
    
    setProcessandoAgendamento(true);
    
    const timeoutId = setTimeout(() => {
      if (montadoRef.current) {
        setProcessandoAgendamento(false);
        toast.error('Timeout no agendamento da manutenção');
      }
    }, 8000);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (montadoRef.current) {
        toast.success('Manutenção agendada com sucesso', {
          description: `${agendamento.tipo} para ${maquinaSelecionada.nome} em ${agendamento.data.toLocaleDateString()}`,
          action: {
            label: 'Ver Cronograma',
            onClick: () => {}
          }
        });
        
        setModalAgendamento(false);
        setMaquinaSelecionada(null);
      }
    } catch (error) {
      if (montadoRef.current) {
        toast.error('Falha no agendamento da manutenção');
      }
    } finally {
      clearTimeout(timeoutId);
      if (montadoRef.current) {
        setProcessandoAgendamento(false);
      }
    }
  }, [maquinaSelecionada, agendamento]);
  
  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Manutenção Preditiva</h2>
          <p className="text-gray-400">
            Análise inteligente e agendamento de manutenções
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Badge variant="outline" className="text-white border-gray-600">
            IA Preditiva Ativa
          </Badge>
        </div>
      </div>
      
      {/* Estatísticas de risco */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-red-950/50 border-red-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-400">Risco Crítico</p>
                <p className="text-2xl font-bold text-red-300">{analisePredicao.estatisticas.critico}</p>
              </div>
              <LucideIcons.AlertCircle className="h-8 w-8 text-red-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-orange-950/50 border-orange-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-400">Risco Alto</p>
                <p className="text-2xl font-bold text-orange-300">{analisePredicao.estatisticas.alto}</p>
              </div>
              <LucideIcons.AlertTriangle className="h-8 w-8 text-orange-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-yellow-950/50 border-yellow-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-400">Risco Médio</p>
                <p className="text-2xl font-bold text-yellow-300">{analisePredicao.estatisticas.medio}</p>
              </div>
              <LucideIcons.Clock className="h-8 w-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-green-950/50 border-green-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-400">Risco Baixo</p>
                <p className="text-2xl font-bold text-green-300">{analisePredicao.estatisticas.baixo}</p>
              </div>
              <LucideIcons.CheckCircle className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Filtros e controles */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <label className="text-sm text-gray-400">Filtrar por risco:</label>
          <Select value={filtroRisco} onValueChange={setFiltroRisco}>
            <SelectTrigger className="w-48 bg-slate-700 border-slate-600 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os Níveis</SelectItem>
              <SelectItem value="critico">Crítico</SelectItem>
              <SelectItem value="alto">Alto</SelectItem>
              <SelectItem value="medio">Médio</SelectItem>
              <SelectItem value="baixo">Baixo</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="text-sm text-gray-400">
          {maquinasFiltradas.length} máquinas encontradas
        </div>
      </div>
      
      {/* Lista de máquinas com análise preditiva */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Coluna esquerda - Análise de risco */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Análise de Risco Preditiva</h3>
          
          {maquinasFiltradas.length === 0 ? (
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="py-8 text-center">
                <LucideIcons.Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400">Nenhuma máquina encontrada com este nível de risco</p>
              </CardContent>
            </Card>
          ) : (
            maquinasFiltradas.map(maquina => {
              const risco = obterCategoriaRisco(maquina.scoreRisco);
              
              return (
                <Card key={maquina.id} className={`${risco.bg} border-2 transition-all hover:shadow-lg`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="text-lg font-semibold text-white">{maquina.nome}</h4>
                        <p className="text-gray-400 text-sm">{maquina.linha_producao}</p>
                      </div>
                      
                      <div className="text-right">
                        <div className={`text-2xl font-bold ${risco.cor}`}>{maquina.scoreRisco}</div>
                        <div className="text-xs text-gray-400">Score de Risco</div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      {/* Barra de risco */}
                      <div>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-gray-400">Nível de Risco</span>
                          <Badge className={risco.bg}>{risco.nivel.toUpperCase()}</Badge>
                        </div>
                        <div className="w-full bg-slate-700 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${risco.cor.replace('text-', 'bg-')}`}
                            style={{ width: `${maquina.scoreRisco}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      {/* Métricas */}
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-400">Eficiência:</span>
                          <p className="text-white font-medium">{Math.round(maquina.eficiencia)}%</p>
                        </div>
                        <div>
                          <span className="text-gray-400">Tempo est. falha:</span>
                          <p className="text-white font-medium">{Math.round(maquina.tempoEstimadoFalha)}d</p>
                        </div>
                      </div>
                      
                      {/* Alertas ativos */}
                      {maquina.alertas_ativos > 0 && (
                        <div className="flex items-center justify-between p-2 bg-red-900/30 rounded border border-red-800">
                          <div className="flex items-center space-x-2">
                            <LucideIcons.AlertTriangle className="h-4 w-4 text-red-400" />
                            <span className="text-red-300 text-sm">Alertas críticos</span>
                          </div>
                          <Badge variant="destructive">{maquina.alertas_ativos}</Badge>
                        </div>
                      )}
                      
                      {/* Próxima manutenção */}
                      <div className="text-xs text-gray-400">
                        Próxima manutenção: {new Date(maquina.proximaManutencao).toLocaleDateString()}
                      </div>
                      
                      {/* Ações */}
                      {perfilUsuario !== 'operador' && (
                        <div className="flex space-x-2 pt-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleAbrirAgendamento(maquina)}
                            className="flex-1 text-xs"
                          >
                            <LucideIcons.Calendar className="mr-1 h-3 w-3" />
                            Agendar
                          </Button>
                          
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 text-xs"
                          >
                            <LucideIcons.Brain className="mr-1 h-3 w-3" />
                            Análise IA
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
        
        {/* Coluna direita - Cronograma de manutenções */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Próximas Manutenções</h3>
          
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white text-base">Cronograma</CardTitle>
              <CardDescription className="text-gray-400">
                Manutenções agendadas para os próximos dias
              </CardDescription>
            </CardHeader>
            <CardContent>
              {proximasManutencoes.length === 0 ? (
                <div className="text-center py-8">
                  <LucideIcons.Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-400">Nenhuma manutenção agendada</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {proximasManutencoes.map(manutencao => {
                    const tipo = tiposManutencao.find(t => t.id === manutencao.tipo);
                    const IconeTipo = LucideIcons[tipo?.icone as keyof typeof LucideIcons] as any;
                    const maquina = maquinas.find(m => m.id === manutencao.maquina_id);
                    
                    const statusConfig = {
                      'agendada': { cor: 'text-blue-400', bg: 'bg-blue-500/20' },
                      'em_execucao': { cor: 'text-orange-400', bg: 'bg-orange-500/20' },
                      'concluida': { cor: 'text-green-400', bg: 'bg-green-500/20' }
                    }[manutencao.status] || { cor: 'text-gray-400', bg: 'bg-gray-500/20' };
                    
                    return (
                      <div key={manutencao.id} className={`p-4 rounded-lg border ${statusConfig.bg} border-slate-600`}>
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <div className={`p-1 rounded ${tipo?.cor || 'bg-gray-500'}`}>
                              <IconeTipo className="h-3 w-3 text-white" />
                            </div>
                            <div>
                              <h4 className="text-white font-medium text-sm">{tipo?.nome}</h4>
                              <p className="text-gray-400 text-xs">{maquina?.nome}</p>
                            </div>
                          </div>
                          
                          <Badge variant={manutencao.prioridade === 'crítica' ? 'destructive' : 'secondary'} className="text-xs">
                            {manutencao.prioridade}
                          </Badge>
                        </div>
                        
                        <p className="text-gray-300 text-sm mb-2">{manutencao.descricao}</p>
                        
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center space-x-4">
                            <span className="text-gray-400">
                              📅 {new Date(manutencao.data_agendada).toLocaleDateString()}
                            </span>
                            <span className="text-gray-400">
                              👤 {manutencao.tecnico}
                            </span>
                          </div>
                          
                          <Badge className={statusConfig.bg}>
                            {manutencao.status.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Insights da IA */}
          <Card className="bg-purple-950/50 border-purple-800">
            <CardHeader>
              <CardTitle className="text-purple-400 text-base flex items-center space-x-2">
                <LucideIcons.Brain className="h-4 w-4" />
                <span>Insights da IA</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-start space-x-2">
                  <LucideIcons.TrendingUp className="h-4 w-4 text-purple-400 mt-0.5" />
                  <p className="text-purple-200">
                    <strong>Padrão identificado:</strong> Máquinas da Linha A apresentam 23% mais alertas de temperatura nos últimos 7 dias.
                  </p>
                </div>
                
                <div className="flex items-start space-x-2">
                  <LucideIcons.Calendar className="h-4 w-4 text-purple-400 mt-0.5" />
                  <p className="text-purple-200">
                    <strong>Recomendação:</strong> Antecipe a manutenção preventiva da Máquina 003 em 5 dias baseado nos padrões de degração.
                  </p>
                </div>
                
                <div className="flex items-start space-x-2">
                  <LucideIcons.Zap className="h-4 w-4 text-purple-400 mt-0.5" />
                  <p className="text-purple-200">
                    <strong>Economia projetada:</strong> Implementar as recomendações pode reduzir custos de manutenção em 18%.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Modal de agendamento de manutenção */}
      <Dialog open={modalAgendamento} onOpenChange={setModalAgendamento}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <LucideIcons.Calendar className="h-5 w-5" />
              <span>Agendar Manutenção - {maquinaSelecionada?.nome}</span>
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Configure os detalhes da manutenção baseado na análise preditiva
            </DialogDescription>
          </DialogHeader>
          
          {maquinaSelecionada && (
            <div className="space-y-4">
              {/* Informações da máquina */}
              <div className="p-4 bg-slate-700 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-white">{maquinaSelecionada.nome}</h4>
                    <p className="text-gray-400 text-sm">{maquinaSelecionada.linha_producao}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-red-400">{maquinaSelecionada.scoreRisco}</div>
                    <div className="text-xs text-gray-400">Score de Risco</div>
                  </div>
                </div>
              </div>
              
              {/* Configurações da manutenção */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400 block mb-2">Tipo de Manutenção</label>
                  <Select
                    value={agendamento.tipo}
                    onValueChange={(valor) => setAgendamento(prev => ({ ...prev, tipo: valor }))}
                  >
                    <SelectTrigger className="bg-slate-700 border-slate-600">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {tiposManutencao.map(tipo => (
                        <SelectItem key={tipo.id} value={tipo.id}>{tipo.nome}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm text-gray-400 block mb-2">Prioridade</label>
                  <Select
                    value={agendamento.prioridade}
                    onValueChange={(valor) => setAgendamento(prev => ({ ...prev, prioridade: valor }))}
                  >
                    <SelectTrigger className="bg-slate-700 border-slate-600">
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
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400 block mb-2">Data Agendada</label>
                  <Input
                    type="datetime-local"
                    value={agendamento.data.toISOString().slice(0, 16)}
                    onChange={(e) => setAgendamento(prev => ({ ...prev, data: new Date(e.target.value) }))}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                
                <div>
                  <label className="text-sm text-gray-400 block mb-2">Estimativa (horas)</label>
                  <Input
                    type="number"
                    placeholder="Ex: 4"
                    value={agendamento.estimativa_horas}
                    onChange={(e) => setAgendamento(prev => ({ ...prev, estimativa_horas: e.target.value }))}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
              </div>
              
              <div>
                <label className="text-sm text-gray-400 block mb-2">Técnico Responsável</label>
                <Select
                  value={agendamento.tecnico}
                  onValueChange={(valor) => setAgendamento(prev => ({ ...prev, tecnico: valor }))}
                >
                  <SelectTrigger className="bg-slate-700 border-slate-600">
                    <SelectValue placeholder="Selecione o técnico" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="carlos">Carlos Silva - Mecânica</SelectItem>
                    <SelectItem value="ana">Ana Santos - Eletrônica</SelectItem>
                    <SelectItem value="joao">João Oliveira - Pneumática</SelectItem>
                    <SelectItem value="maria">Maria Costa - Geral</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm text-gray-400 block mb-2">Descrição dos Serviços</label>
                <Textarea
                  value={agendamento.descricao}
                  onChange={(e) => setAgendamento(prev => ({ ...prev, descricao: e.target.value }))}
                  placeholder="Descreva os serviços que serão realizados..."
                  className="bg-slate-700 border-slate-600 text-white resize-none"
                  rows={3}
                />
              </div>
              
              <div>
                <label className="text-sm text-gray-400 block mb-2">Peças Necessárias</label>
                <Textarea
                  value={agendamento.pecas_necessarias}
                  onChange={(e) => setAgendamento(prev => ({ ...prev, pecas_necessarias: e.target.value }))}
                  placeholder="Liste as peças que podem ser necessárias..."
                  className="bg-slate-700 border-slate-600 text-white resize-none"
                  rows={2}
                />
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setModalAgendamento(false);
                setMaquinaSelecionada(null);
              }}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleConfirmarAgendamento}
              disabled={processandoAgendamento || !agendamento.tipo || !agendamento.tecnico || !agendamento.descricao}
            >
              {processandoAgendamento ? (
                <>
                  <LucideIcons.Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Agendando...
                </>
              ) : (
                <>
                  <LucideIcons.Calendar className="mr-2 h-4 w-4" />
                  Confirmar Agendamento
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}