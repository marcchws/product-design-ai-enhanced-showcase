'use client'

import React, { useState, useCallback, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { toast } from 'sonner'
import * as LucideIcons from 'lucide-react'

interface Props {
  alertas: any[];
  maquinas: any[];
  perfilUsuario: string;
}

// Tipos de alertas válidos
type TipoAlerta = 'critico' | 'alto' | 'medio' | 'info';

// Função utilitária para configuração de alerta
const getAlertaConfig = (tipo: string, status: string) => {
  const tipos = {
    'critico': { 
      cor: 'text-red-400', 
      bg: 'bg-red-500/20 border-red-500', 
      badge: 'destructive',
      icone: 'AlertCircle'
    },
    'alto': { 
      cor: 'text-orange-400', 
      bg: 'bg-orange-500/20 border-orange-500', 
      badge: 'secondary',
      icone: 'AlertTriangle'
    },
    'medio': { 
      cor: 'text-yellow-400', 
      bg: 'bg-yellow-500/20 border-yellow-500', 
      badge: 'secondary',
      icone: 'AlertTriangle'
    },
    'info': { 
      cor: 'text-blue-400', 
      bg: 'bg-blue-500/20 border-blue-500', 
      badge: 'default',
      icone: 'Info'
    }
  };
  
  const baseConfig = tipos[tipo as TipoAlerta] || tipos['info'];
  
  if (status === 'resolvido') {
    return {
      ...baseConfig,
      cor: 'text-green-400',
      bg: 'bg-green-500/20 border-green-500',
      badge: 'default'
    };
  }
  
  return baseConfig;
};

export default function AlertasCriticos({ alertas, maquinas, perfilUsuario }: Props) {
  // Estados de interface
  const [filtros, setFiltros] = useState({
    termo: '',
    tipo: 'todos',
    status: 'todos',
    maquina: 'todas',
    periodo: '24h'
  });
  
  const [alertaSelecionado, setAlertaSelecionado] = useState<any | null>(null);
  const [modalResolucao, setModalResolucao] = useState(false);
  const [comentarioResolucao, setComentarioResolucao] = useState('');
  const [processandoAcao, setProcessandoAcao] = useState(false);
  const [visualizacao, setVisualizacao] = useState<'cards' | 'timeline'>('cards');
  
  const montadoRef = React.useRef(true);
  
  React.useEffect(() => {
    montadoRef.current = true;
    return () => { montadoRef.current = false; };
  }, []);
  
  // Filtrar alertas
  const alertasFiltrados = useMemo(() => {
    let resultado = [...alertas];
    
    // Filtro por termo
    if (filtros.termo) {
      const termo = filtros.termo.toLowerCase();
      resultado = resultado.filter(alerta => 
        alerta.titulo.toLowerCase().includes(termo) ||
        alerta.descricao.toLowerCase().includes(termo) ||
        alerta.maquina_id.toLowerCase().includes(termo)
      );
    }
    
    // Filtro por tipo
    if (filtros.tipo !== 'todos') {
      resultado = resultado.filter(alerta => alerta.tipo === filtros.tipo);
    }
    
    // Filtro por status
    if (filtros.status !== 'todos') {
      resultado = resultado.filter(alerta => alerta.status === filtros.status);
    }
    
    // Filtro por máquina
    if (filtros.maquina !== 'todas') {
      resultado = resultado.filter(alerta => alerta.maquina_id === filtros.maquina);
    }
    
    // Filtro por período
    const agora = new Date();
    const limitePeriodo = {
      '1h': new Date(agora.getTime() - 60 * 60 * 1000),
      '24h': new Date(agora.getTime() - 24 * 60 * 60 * 1000),
      '7d': new Date(agora.getTime() - 7 * 24 * 60 * 60 * 1000),
      '30d': new Date(agora.getTime() - 30 * 24 * 60 * 60 * 1000)
    }[filtros.periodo];
    
    if (limitePeriodo) {
      resultado = resultado.filter(alerta => 
        new Date(alerta.data_hora) >= limitePeriodo
      );
    }
    
    // Ordenar por data (mais recentes primeiro)
    resultado.sort((a, b) => new Date(b.data_hora).getTime() - new Date(a.data_hora).getTime());
    
    return resultado;
  }, [alertas, filtros]);
  
  // Estatísticas dos alertas
  const estatisticasAlertas = useMemo(() => {
    const total = alertasFiltrados.length;
    const criticos = alertasFiltrados.filter(a => a.tipo === 'critico').length;
    const ativos = alertasFiltrados.filter(a => a.status === 'ativo').length;
    const resolvidos = alertasFiltrados.filter(a => a.status === 'resolvido').length;
    
    return { total, criticos, ativos, resolvidos };
  }, [alertasFiltrados]);
  
  // Obter máquinas únicas dos alertas
  const maquinasComAlertas = useMemo(() => {
    const maquinasIds = Array.from(new Set(alertas.map(a => a.maquina_id)));
    return maquinas.filter(m => maquinasIds.includes(m.id));
  }, [alertas, maquinas]);
  
  // Handler para mudança de filtros
  const handleFiltroChange = useCallback((campo: string, valor: string) => {
    setFiltros(prev => ({ ...prev, [campo]: valor }));
  }, []);
  
  // Limpar filtros
  const handleLimparFiltros = useCallback(() => {
    setFiltros({
      termo: '',
      tipo: 'todos',
      status: 'todos', 
      maquina: 'todas',
      periodo: '24h'
    });
  }, []);
  
  // Reconhecer alerta
  const handleReconhecerAlerta = useCallback(async (alertaId: string) => {
    if (!montadoRef.current) return;
    
    setProcessandoAcao(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (montadoRef.current) {
        toast.success('Alerta reconhecido com sucesso');
      }
    } catch (error) {
      if (montadoRef.current) {
        toast.error('Falha ao reconhecer alerta');
      }
    } finally {
      if (montadoRef.current) {
        setProcessandoAcao(false);
      }
    }
  }, []);
  
  // Resolver alerta
  const handleResolverAlerta = useCallback(async () => {
    if (!alertaSelecionado || !montadoRef.current) return;
    
    setProcessandoAcao(true);
    
    const timeoutId = setTimeout(() => {
      if (montadoRef.current) {
        setProcessandoAcao(false);
        toast.error('Timeout na resolução do alerta');
      }
    }, 8000);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (montadoRef.current) {
        toast.success('Alerta resolvido com sucesso');
        setModalResolucao(false);
        setComentarioResolucao('');
        setAlertaSelecionado(null);
      }
    } catch (error) {
      if (montadoRef.current) {
        toast.error('Falha ao resolver alerta');
      }
    } finally {
      clearTimeout(timeoutId);
      if (montadoRef.current) {
        setProcessandoAcao(false);
      }
    }
  }, [alertaSelecionado]);
  
  // Calcular tempo decorrido
  const calcularTempoDecorrido = useCallback((dataHora: string): string => {
    const agora = new Date();
    const alerta = new Date(dataHora);
    const diferenca = agora.getTime() - alerta.getTime();
    
    const minutos = Math.floor(diferenca / (1000 * 60));
    const horas = Math.floor(diferenca / (1000 * 60 * 60));
    const dias = Math.floor(diferenca / (1000 * 60 * 60 * 24));
    
    if (dias > 0) return `${dias}d atrás`;
    if (horas > 0) return `${horas}h atrás`;
    if (minutos > 0) return `${minutos}min atrás`;
    return 'Agora';
  }, []);
  
  return (
    <div className="space-y-6">
      {/* Cabeçalho com estatísticas */}
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Sistema de Alertas</h2>
            <p className="text-gray-400">
              Monitoramento e gestão de alertas críticos
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Controles de visualização */}
            <div className="flex border border-slate-600 rounded-lg overflow-hidden">
              <Button
                variant={visualizacao === 'cards' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setVisualizacao('cards')}
                className="rounded-none"
              >
                <LucideIcons.Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={visualizacao === 'timeline' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setVisualizacao('timeline')}
                className="rounded-none"
              >
                <LucideIcons.Clock className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        
        {/* Cards de estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total</p>
                  <p className="text-2xl font-bold text-blue-400">{estatisticasAlertas.total}</p>
                </div>
                <LucideIcons.Bell className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Críticos</p>
                  <p className="text-2xl font-bold text-red-400">{estatisticasAlertas.criticos}</p>
                </div>
                <LucideIcons.AlertCircle className="h-8 w-8 text-red-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Ativos</p>
                  <p className="text-2xl font-bold text-orange-400">{estatisticasAlertas.ativos}</p>
                </div>
                <LucideIcons.AlertTriangle className="h-8 w-8 text-orange-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Resolvidos</p>
                  <p className="text-2xl font-bold text-green-400">{estatisticasAlertas.resolvidos}</p>
                </div>
                <LucideIcons.CheckCircle className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Filtros */}
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            {/* Busca */}
            <div className="relative">
              <LucideIcons.Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar alertas..."
                value={filtros.termo}
                onChange={(e) => handleFiltroChange('termo', e.target.value)}
                className="pl-9 bg-slate-700 border-slate-600 text-white"
              />
            </div>
            
            {/* Tipo */}
            <Select value={filtros.tipo} onValueChange={(valor) => handleFiltroChange('tipo', valor)}>
              <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os Tipos</SelectItem>
                <SelectItem value="critico">Crítico</SelectItem>
                <SelectItem value="alto">Alto</SelectItem>
                <SelectItem value="medio">Médio</SelectItem>
                <SelectItem value="info">Info</SelectItem>
              </SelectContent>
            </Select>
            
            {/* Status */}
            <Select value={filtros.status} onValueChange={(valor) => handleFiltroChange('status', valor)}>
              <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os Status</SelectItem>
                <SelectItem value="ativo">Ativo</SelectItem>
                <SelectItem value="reconhecido">Reconhecido</SelectItem>
                <SelectItem value="resolvido">Resolvido</SelectItem>
              </SelectContent>
            </Select>
            
            {/* Máquina */}
            <Select value={filtros.maquina} onValueChange={(valor) => handleFiltroChange('maquina', valor)}>
              <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                <SelectValue placeholder="Máquina" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas as Máquinas</SelectItem>
                {maquinasComAlertas.map(maquina => (
                  <SelectItem key={maquina.id} value={maquina.id}>{maquina.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {/* Período */}
            <Select value={filtros.periodo} onValueChange={(valor) => handleFiltroChange('periodo', valor)}>
              <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1h">Última Hora</SelectItem>
                <SelectItem value="24h">Últimas 24h</SelectItem>
                <SelectItem value="7d">Últimos 7 dias</SelectItem>
                <SelectItem value="30d">Últimos 30 dias</SelectItem>
              </SelectContent>
            </Select>
            
            {/* Limpar filtros */}
            <Button
              variant="outline"
              onClick={handleLimparFiltros}
              className="border-slate-600 text-gray-300 hover:bg-slate-700"
            >
              <LucideIcons.RefreshCw className="mr-2 h-4 w-4" />
              Limpar
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Lista de alertas */}
      {alertasFiltrados.length === 0 ? (
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="py-16 text-center">
            <LucideIcons.Bell className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-white mb-2">
              Nenhum alerta encontrado
            </h3>
            <p className="text-gray-400 mb-6">
              Nenhum alerta corresponde aos filtros aplicados.
            </p>
            <Button onClick={handleLimparFiltros} variant="outline">
              <LucideIcons.RefreshCw className="mr-2 h-4 w-4" />
              Limpar Filtros
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className={visualizacao === 'cards' ? 'space-y-4' : ''}>
          {visualizacao === 'cards' ? (
            // Visualização em cards
            alertasFiltrados.map(alerta => {
              const config = getAlertaConfig(alerta.tipo, alerta.status);
              const IconeAlerta = LucideIcons[config.icone as keyof typeof LucideIcons] as any;
              const maquina = maquinas.find(m => m.id === alerta.maquina_id);
              
              return (
                <Card key={alerta.id} className={`${config.bg} border-2 transition-all hover:shadow-lg`}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <div className={`p-2 rounded-full ${config.bg}`}>
                          <IconeAlerta className={`h-6 w-6 ${config.cor}`} />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="text-lg font-semibold text-white">{alerta.titulo}</h3>
                            <Badge variant={config.badge as any}>{alerta.tipo.toUpperCase()}</Badge>
                            <Badge variant={alerta.status === 'resolvido' ? 'default' : 'outline'}>
                              {alerta.status.charAt(0).toUpperCase() + alerta.status.slice(1)}
                            </Badge>
                          </div>
                          
                          <p className="text-gray-300 mb-3">{alerta.descricao}</p>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="text-gray-400">Máquina:</span>
                              <p className="text-white font-medium">{maquina?.nome || alerta.maquina_id}</p>
                            </div>
                            
                            <div>
                              <span className="text-gray-400">Tempo:</span>
                              <p className="text-white">{calcularTempoDecorrido(alerta.data_hora)}</p>
                            </div>
                            
                            {alerta.responsavel && (
                              <div>
                                <span className="text-gray-400">Responsável:</span>
                                <p className="text-white">{alerta.responsavel}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col space-y-2 ml-4">
                        {alerta.status === 'ativo' && perfilUsuario !== 'operador' && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleReconhecerAlerta(alerta.id)}
                              disabled={processandoAcao}
                              className="text-xs"
                            >
                              <LucideIcons.Eye className="mr-1 h-3 w-3" />
                              Reconhecer
                            </Button>
                            
                            <Button
                              size="sm"
                              onClick={() => {
                                setAlertaSelecionado(alerta);
                                setModalResolucao(true);
                              }}
                              disabled={processandoAcao}
                              className="text-xs"
                            >
                              <LucideIcons.CheckCircle className="mr-1 h-3 w-3" />
                              Resolver
                            </Button>
                          </>
                        )}
                        
                        {alerta.status === 'reconhecido' && perfilUsuario !== 'operador' && (
                          <Button
                            size="sm"
                            onClick={() => {
                              setAlertaSelecionado(alerta);
                              setModalResolucao(true);
                            }}
                            disabled={processandoAcao}
                            className="text-xs"
                          >
                            <LucideIcons.CheckCircle className="mr-1 h-3 w-3" />
                            Resolver
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            // Visualização em timeline
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Timeline de Alertas</CardTitle>
                <CardDescription className="text-gray-400">
                  Histórico cronológico dos alertas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  {/* Linha do timeline */}
                  <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-slate-600"></div>
                  
                  <div className="space-y-6">
                    {alertasFiltrados.map((alerta, index) => {
                      const config = getAlertaConfig(alerta.tipo, alerta.status);
                      const IconeAlerta = LucideIcons[config.icone as keyof typeof LucideIcons] as any;
                      const maquina = maquinas.find(m => m.id === alerta.maquina_id);
                      
                      return (
                        <div key={alerta.id} className="relative flex items-start space-x-4">
                          {/* Marcador do timeline */}
                          <div className={`relative z-10 p-2 rounded-full ${config.bg} border-2 ${config.bg.replace('bg-', 'border-').replace('/20', '')}`}>
                            <IconeAlerta className={`h-4 w-4 ${config.cor}`} />
                          </div>
                          
                          {/* Conteúdo do alerta */}
                          <div className="flex-1 pb-6">
                            <div className="flex items-center space-x-2 mb-2">
                              <h4 className="text-white font-medium">{alerta.titulo}</h4>
                              <Badge variant={config.badge as any} className="text-xs">
                                {alerta.tipo}
                              </Badge>
                              <Badge variant={alerta.status === 'resolvido' ? 'default' : 'outline'} className="text-xs">
                                {alerta.status}
                              </Badge>
                            </div>
                            
                            <p className="text-gray-300 text-sm mb-2">{alerta.descricao}</p>
                            
                            <div className="flex items-center space-x-4 text-xs text-gray-400">
                              <span>{maquina?.nome || alerta.maquina_id}</span>
                              <span>•</span>
                              <span>{new Date(alerta.data_hora).toLocaleString()}</span>
                              {alerta.responsavel && (
                                <>
                                  <span>•</span>
                                  <span>{alerta.responsavel}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
      
      {/* Modal de resolução de alerta */}
      <Dialog open={modalResolucao} onOpenChange={setModalResolucao}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <LucideIcons.CheckCircle className="h-5 w-5" />
              <span>Resolver Alerta</span>
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Confirme a resolução do alerta e adicione comentários sobre a ação tomada
            </DialogDescription>
          </DialogHeader>
          
          {alertaSelecionado && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-700 rounded-lg">
                <h4 className="font-medium text-white mb-2">{alertaSelecionado.titulo}</h4>
                <p className="text-gray-300 text-sm">{alertaSelecionado.descricao}</p>
                <div className="mt-2 text-xs text-gray-400">
                  {maquinas.find(m => m.id === alertaSelecionado.maquina_id)?.nome || alertaSelecionado.maquina_id}
                </div>
              </div>
              
              <div>
                <label className="text-sm text-gray-400 block mb-2">
                  Comentários da Resolução
                </label>
                <Textarea
                  value={comentarioResolucao}
                  onChange={(e) => setComentarioResolucao(e.target.value)}
                  placeholder="Descreva as ações tomadas para resolver este alerta..."
                  className="bg-slate-700 border-slate-600 text-white resize-none"
                  rows={4}
                />
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setModalResolucao(false);
                setComentarioResolucao('');
                setAlertaSelecionado(null);
              }}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleResolverAlerta}
              disabled={processandoAcao || !comentarioResolucao.trim()}
            >
              {processandoAcao ? (
                <>
                  <LucideIcons.Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Resolvendo...
                </>
              ) : (
                <>
                  <LucideIcons.CheckCircle className="mr-2 h-4 w-4" />
                  Resolver Alerta
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}