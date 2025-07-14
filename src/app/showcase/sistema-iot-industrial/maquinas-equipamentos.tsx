'use client'

import React, { useState, useCallback, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from 'sonner'
import * as LucideIcons from 'lucide-react'

interface Props {
  maquinas: any[];
  sensores: any[];
  perfilUsuario: string;
}

// Função utilitária para formatação de tempo ativo
const formatarTempoAtivo = (horas: number): string => {
  if (horas < 24) return `${Math.round(horas)}h`;
  if (horas < 168) return `${Math.round(horas / 24)}d`;
  if (horas < 8760) return `${Math.round(horas / 168)}sem`;
  return `${Math.round(horas / 8760)}anos`;
};

// Função utilitária para ícone por tipo de sensor
const obterIconeSensor = (tipo: string) => {
  const icones: Record<string, string> = {
    'temperatura': 'Thermometer',
    'pressao': 'Gauge', 
    'vibração': 'Activity',
    'umidade': 'Droplets',
    'rotacao': 'RotateCw'
  };
  return icones[tipo as keyof typeof icones] || 'Sensor';
};

export default function MaquinasEquipamentos({ maquinas, sensores, perfilUsuario }: Props) {
  // Estados de interface
  const [filtros, setFiltros] = useState({
    termo: '',
    status: 'todos',
    linha: 'todas',
    ordenacao: 'nome'
  });
  
  const [maquinaSelecionada, setMaquinaSelecionada] = useState<any | null>(null);
  const [modalDetalhes, setModalDetalhes] = useState(false);
  const [modalManutencao, setModalManutencao] = useState(false);
  const [visualizacao, setVisualizacao] = useState<'cards' | 'tabela'>('cards');
  const [executandoAcao, setExecutandoAcao] = useState(false);
  
  const montadoRef = React.useRef(true);
  
  React.useEffect(() => {
    montadoRef.current = true;
    return () => { montadoRef.current = false; };
  }, []);
  
  // Lógica de filtros
  const maquinasFiltradas = useMemo(() => {
    let resultado = [...maquinas];
    
    // Filtro por termo de busca
    if (filtros.termo) {
      const termo = filtros.termo.toLowerCase();
      resultado = resultado.filter(maquina => 
        maquina.nome.toLowerCase().includes(termo) ||
        maquina.linha_producao.toLowerCase().includes(termo) ||
        maquina.id.toLowerCase().includes(termo)
      );
    }
    
    // Filtro por status
    if (filtros.status !== 'todos') {
      resultado = resultado.filter(maquina => maquina.status === filtros.status);
    }
    
    // Filtro por linha
    if (filtros.linha !== 'todas') {
      resultado = resultado.filter(maquina => maquina.linha_producao === filtros.linha);
    }
    
    // Ordenação
    resultado.sort((a, b) => {
      switch (filtros.ordenacao) {
        case 'nome':
          return a.nome.localeCompare(b.nome);
        case 'eficiencia':
          return b.eficiencia - a.eficiencia;
        case 'alertas':
          return b.alertas_ativos - a.alertas_ativos;
        case 'linha':
          return a.linha_producao.localeCompare(b.linha_producao);
        default:
          return 0;
      }
    });
    
    return resultado;
  }, [maquinas, filtros]);
  
  // Obter linhas de produção únicas
  const linhasProducao = useMemo(() => {
    return [...new Set(maquinas.map(m => m.linha_producao))];
  }, [maquinas]);
  
  // Handler para alterar filtros
  const handleFiltroChange = useCallback((campo: string, valor: string) => {
    setFiltros(prev => ({ ...prev, [campo]: valor }));
  }, []);
  
  // Limpar filtros
  const handleLimparFiltros = useCallback(() => {
    setFiltros({
      termo: '',
      status: 'todos',
      linha: 'todas',
      ordenacao: 'nome'
    });
  }, []);
  
  // Abrir detalhes da máquina
  const handleVerDetalhes = useCallback((maquina: any) => {
    setMaquinaSelecionada(maquina);
    setModalDetalhes(true);
  }, []);
  
  // Agendar manutenção
  const handleAgendarManutencao = useCallback(async (maquina: any) => {
    setMaquinaSelecionada(maquina);
    setModalManutencao(true);
  }, []);
  
  // Executar ação na máquina
  const handleAcaoMaquina = useCallback(async (maquinaId: string, acao: string) => {
    if (!montadoRef.current) return;
    
    setExecutandoAcao(true);
    
    const timeoutId = setTimeout(() => {
      if (montadoRef.current) {
        setExecutandoAcao(false);
        toast.error('Timeout na comunicação com a máquina');
      }
    }, 5000);
    
    try {
      // Simular ação na máquina
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (montadoRef.current) {
        toast.success(`${acao} executada com sucesso em ${maquinaId}`);
        setModalDetalhes(false);
        setModalManutencao(false);
      }
    } catch (error) {
      if (montadoRef.current) {
        toast.error(`Falha ao executar ${acao}`);
      }
    } finally {
      clearTimeout(timeoutId);
      if (montadoRef.current) {
        setExecutandoAcao(false);
      }
    }
  }, []);
  
  // Configurações de status visual
  const getStatusConfig = (status: string) => {
    const configs: Record<string, { cor: string; bg: string; badge: string; icone: string }> = {
      'operando': { 
        cor: 'text-green-400', 
        bg: 'bg-green-500/20 border-green-500', 
        badge: 'default',
        icone: 'Play'
      },
      'manutencao': { 
        cor: 'text-yellow-400', 
        bg: 'bg-yellow-500/20 border-yellow-500', 
        badge: 'secondary',
        icone: 'Wrench'
      },
      'parada': { 
        cor: 'text-orange-400', 
        bg: 'bg-orange-500/20 border-orange-500', 
        badge: 'secondary',
        icone: 'Pause'
      },
      'offline': { 
        cor: 'text-gray-400', 
        bg: 'bg-gray-500/20 border-gray-500', 
        badge: 'outline',
        icone: 'WifiOff'
      }
    };
    return configs[status as keyof typeof configs] || configs['offline'];
  };
  
  return (
    <div className="space-y-6">
      {/* Cabeçalho com filtros */}
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Máquinas e Equipamentos</h2>
            <p className="text-gray-400">
              {maquinasFiltradas.length} de {maquinas.length} máquinas
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
                variant={visualizacao === 'tabela' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setVisualizacao('tabela')}
                className="rounded-none"
              >
                <LucideIcons.Table className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        
        {/* Filtros */}
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {/* Busca */}
              <div className="relative">
                <LucideIcons.Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar máquinas..."
                  value={filtros.termo}
                  onChange={(e) => handleFiltroChange('termo', e.target.value)}
                  className="pl-9 bg-slate-700 border-slate-600 text-white"
                />
              </div>
              
              {/* Status */}
              <Select value={filtros.status} onValueChange={(valor) => handleFiltroChange('status', valor)}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os Status</SelectItem>
                  <SelectItem value="operando">Operando</SelectItem>
                  <SelectItem value="manutencao">Manutenção</SelectItem>
                  <SelectItem value="parada">Parada</SelectItem>
                  <SelectItem value="offline">Offline</SelectItem>
                </SelectContent>
              </Select>
              
              {/* Linha de produção */}
              <Select value={filtros.linha} onValueChange={(valor) => handleFiltroChange('linha', valor)}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue placeholder="Linha" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas as Linhas</SelectItem>
                  {linhasProducao.map(linha => (
                    <SelectItem key={linha} value={linha}>{linha}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {/* Ordenação */}
              <Select value={filtros.ordenacao} onValueChange={(valor) => handleFiltroChange('ordenacao', valor)}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nome">Nome</SelectItem>
                  <SelectItem value="eficiencia">Eficiência</SelectItem>
                  <SelectItem value="alertas">Alertas</SelectItem>
                  <SelectItem value="linha">Linha de Produção</SelectItem>
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
      </div>
      
      {/* Lista de máquinas */}
      {maquinasFiltradas.length === 0 ? (
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="py-16 text-center">
            <LucideIcons.Cog className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-white mb-2">
              Nenhuma máquina encontrada
            </h3>
            <p className="text-gray-400 mb-6">
              Nenhuma máquina corresponde aos filtros aplicados.
            </p>
            <Button onClick={handleLimparFiltros} variant="outline">
              <LucideIcons.RefreshCw className="mr-2 h-4 w-4" />
              Limpar Filtros
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className={visualizacao === 'cards' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : ''}>
          {visualizacao === 'cards' ? (
            // Visualização em cards
            maquinasFiltradas.map(maquina => {
              const statusConfig = getStatusConfig(maquina.status);
              const IconeStatus = LucideIcons[statusConfig.icone as keyof typeof LucideIcons] as any;
              
              return (
                <Card key={maquina.id} className={`${statusConfig.bg} border-2 transition-all hover:shadow-lg`}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-white text-lg">{maquina.nome}</CardTitle>
                      <Badge variant={statusConfig.badge as any} className="flex items-center gap-1">
                        <IconeStatus className="h-3 w-3" />
                        {maquina.status.charAt(0).toUpperCase() + maquina.status.slice(1)}
                      </Badge>
                    </div>
                    <CardDescription className="text-gray-400">
                      {maquina.linha_producao} • ID: {maquina.id}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* Métricas principais */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-slate-700/50 rounded-lg">
                        <p className="text-2xl font-bold text-blue-400">{Math.round(maquina.eficiencia)}%</p>
                        <p className="text-xs text-gray-400">Eficiência</p>
                      </div>
                      <div className="text-center p-3 bg-slate-700/50 rounded-lg">
                        <p className="text-2xl font-bold text-green-400">{formatarTempoAtivo(maquina.tempo_ativo_horas)}</p>
                        <p className="text-xs text-gray-400">Tempo Ativo</p>
                      </div>
                    </div>
                    
                    {/* Sensores */}
                    <div>
                      <p className="text-sm text-gray-400 mb-2">Sensores ({maquina.sensores.length})</p>
                      <div className="grid grid-cols-2 gap-2">
                        {maquina.sensores.slice(0, 4).map((sensor: any) => {
                          const IconeSensor = LucideIcons[obterIconeSensor(sensor.tipo) as keyof typeof LucideIcons] as any;
                          const corStatus = {
                            'normal': 'text-green-400',
                            'atencao': 'text-yellow-400', 
                            'critico': 'text-red-400',
                            'offline': 'text-gray-400'
                          }[sensor.status as keyof typeof corStatus];
                          
                          return (
                            <div key={sensor.id} className="flex items-center space-x-2 text-xs">
                              <IconeSensor className={`h-3 w-3 ${corStatus}`} />
                              <span className="text-gray-300 truncate">{sensor.nome}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    
                    {/* Alertas ativos */}
                    {maquina.alertas_ativos > 0 && (
                      <div className="flex items-center justify-between p-2 bg-red-900/30 rounded border border-red-800">
                        <div className="flex items-center space-x-2">
                          <LucideIcons.AlertTriangle className="h-4 w-4 text-red-400" />
                          <span className="text-red-300 text-sm">Alertas ativos</span>
                        </div>
                        <Badge variant="destructive">{maquina.alertas_ativos}</Badge>
                      </div>
                    )}
                    
                    {/* Próxima manutenção */}
                    <div className="text-xs text-gray-400">
                      Próxima manutenção: {new Date(maquina.proxima_manutencao).toLocaleDateString()}
                    </div>
                    
                    {/* Ações */}
                    <div className="flex space-x-2 pt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleVerDetalhes(maquina)}
                        className="flex-1 text-xs"
                      >
                        <LucideIcons.Eye className="mr-1 h-3 w-3" />
                        Detalhes
                      </Button>
                      
                      {perfilUsuario !== 'operador' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAgendarManutencao(maquina)}
                          className="flex-1 text-xs"
                        >
                          <LucideIcons.Calendar className="mr-1 h-3 w-3" />
                          Manutenção
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            // Visualização em tabela
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-700">
                      <tr>
                        <th className="text-left p-4 text-gray-300 font-medium">Máquina</th>
                        <th className="text-left p-4 text-gray-300 font-medium">Linha</th>
                        <th className="text-left p-4 text-gray-300 font-medium">Status</th>
                        <th className="text-left p-4 text-gray-300 font-medium">Eficiência</th>
                        <th className="text-left p-4 text-gray-300 font-medium">Sensores</th>
                        <th className="text-left p-4 text-gray-300 font-medium">Alertas</th>
                        <th className="text-left p-4 text-gray-300 font-medium">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {maquinasFiltradas.map((maquina, index) => {
                        const statusConfig = getStatusConfig(maquina.status);
                        const IconeStatus = LucideIcons[statusConfig.icone as keyof typeof LucideIcons] as any;
                        
                        return (
                          <tr key={maquina.id} className={`border-b border-slate-700 ${index % 2 === 0 ? 'bg-slate-800' : 'bg-slate-750'}`}>
                            <td className="p-4">
                              <div>
                                <p className="text-white font-medium">{maquina.nome}</p>
                                <p className="text-gray-400 text-sm">{maquina.id}</p>
                              </div>
                            </td>
                            <td className="p-4 text-gray-300">{maquina.linha_producao}</td>
                            <td className="p-4">
                              <Badge variant={statusConfig.badge as any} className="flex items-center gap-1 w-fit">
                                <IconeStatus className="h-3 w-3" />
                                {maquina.status}
                              </Badge>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center space-x-2">
                                <span className="text-white">{Math.round(maquina.eficiencia)}%</span>
                                <div className="w-16 bg-slate-600 rounded-full h-2">
                                  <div 
                                    className="bg-blue-500 h-2 rounded-full"
                                    style={{ width: `${maquina.eficiencia}%` }}
                                  ></div>
                                </div>
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="flex space-x-1">
                                {['normal', 'atencao', 'critico', 'offline'].map(status => {
                                  const count = maquina.sensores.filter((s: any) => s.status === status).length;
                                  if (count === 0) return null;
                                  
                                  const cor = {
                                    'normal': 'bg-green-500',
                                    'atencao': 'bg-yellow-500',
                                    'critico': 'bg-red-500', 
                                    'offline': 'bg-gray-500'
                                  }[status as keyof typeof cor];
                                  
                                  return (
                                    <Badge key={status} className={`${cor} text-white text-xs px-1`}>
                                      {count}
                                    </Badge>
                                  );
                                })}
                              </div>
                            </td>
                            <td className="p-4">
                              {maquina.alertas_ativos > 0 ? (
                                <Badge variant="destructive">{maquina.alertas_ativos}</Badge>
                              ) : (
                                <span className="text-gray-500">-</span>
                              )}
                            </td>
                            <td className="p-4">
                              <div className="flex space-x-1">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleVerDetalhes(maquina)}
                                  className="h-8 w-8 p-0"
                                >
                                  <LucideIcons.Eye className="h-4 w-4" />
                                </Button>
                                
                                {perfilUsuario !== 'operador' && (
                                  <Button
                                    size="sm"
                                    variant="ghost" 
                                    onClick={() => handleAgendarManutencao(maquina)}
                                    className="h-8 w-8 p-0"
                                  >
                                    <LucideIcons.Calendar className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
      
      {/* Modal de detalhes da máquina */}
      <Dialog open={modalDetalhes} onOpenChange={setModalDetalhes}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <LucideIcons.Cog className="h-5 w-5" />
              <span>Detalhes - {maquinaSelecionada?.nome}</span>
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Informações detalhadas e status dos sensores
            </DialogDescription>
          </DialogHeader>
          
          {maquinaSelecionada && (
            <div className="space-y-6">
              {/* Informações gerais */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-slate-700 border-slate-600">
                  <CardContent className="p-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-400">{Math.round(maquinaSelecionada.eficiencia)}%</p>
                      <p className="text-sm text-gray-400">Eficiência Atual</p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-slate-700 border-slate-600">
                  <CardContent className="p-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-400">{formatarTempoAtivo(maquinaSelecionada.tempo_ativo_horas)}</p>
                      <p className="text-sm text-gray-400">Tempo Ativo</p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-slate-700 border-slate-600">
                  <CardContent className="p-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-orange-400">{maquinaSelecionada.alertas_ativos}</p>
                      <p className="text-sm text-gray-400">Alertas Ativos</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Lista detalhada de sensores */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Sensores ({maquinaSelecionada.sensores.length})</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {maquinaSelecionada.sensores.map((sensor: any) => {
                    const IconeSensor = LucideIcons[obterIconeSensor(sensor.tipo) as keyof typeof LucideIcons] as any;
                    const statusConfig = {
                      'normal': { cor: 'text-green-400', bg: 'bg-green-500/20' },
                      'atencao': { cor: 'text-yellow-400', bg: 'bg-yellow-500/20' },
                      'critico': { cor: 'text-red-400', bg: 'bg-red-500/20' },
                      'offline': { cor: 'text-gray-400', bg: 'bg-gray-500/20' }
                    }[sensor.status as keyof typeof statusConfig];
                    
                    return (
                      <Card key={sensor.id} className={`bg-slate-700 border-slate-600 ${statusConfig.bg}`}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <IconeSensor className={`h-4 w-4 ${statusConfig.cor}`} />
                              <span className="font-medium">{sensor.nome}</span>
                            </div>
                            <Badge className={statusConfig.bg}>{sensor.status}</Badge>
                          </div>
                          
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-400">Valor atual:</span>
                              <span className={statusConfig.cor}>{sensor.valor}{sensor.unidade}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Limite mín:</span>
                              <span className="text-gray-300">{sensor.limite_min}{sensor.unidade}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Limite máx:</span>
                              <span className="text-gray-300">{sensor.limite_max}{sensor.unidade}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Última leitura:</span>
                              <span className="text-gray-300">{new Date(sensor.ultima_leitura).toLocaleTimeString()}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalDetalhes(false)}>
              Fechar
            </Button>
            {perfilUsuario !== 'operador' && (
              <Button 
                onClick={() => handleAcaoMaquina(maquinaSelecionada?.id, 'Reset Sistema')}
                disabled={executandoAcao}
              >
                {executandoAcao ? (
                  <>
                    <LucideIcons.Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Executando...
                  </>
                ) : (
                  <>
                    <LucideIcons.RotateCcw className="mr-2 h-4 w-4" />
                    Reset Sistema
                  </>
                )}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Modal de agendamento de manutenção */}
      <Dialog open={modalManutencao} onOpenChange={setModalManutencao}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <LucideIcons.Calendar className="h-5 w-5" />
              <span>Agendar Manutenção - {maquinaSelecionada?.nome}</span>
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Programar manutenção preventiva ou corretiva
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 block mb-2">Tipo de Manutenção</label>
              <Select defaultValue="preventiva">
                <SelectTrigger className="bg-slate-700 border-slate-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="preventiva">Preventiva</SelectItem>
                  <SelectItem value="corretiva">Corretiva</SelectItem>
                  <SelectItem value="preditiva">Preditiva</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm text-gray-400 block mb-2">Data Programada</label>
              <Input 
                type="datetime-local"
                className="bg-slate-700 border-slate-600 text-white"
                defaultValue={new Date().toISOString().slice(0, 16)}
              />
            </div>
            
            <div>
              <label className="text-sm text-gray-400 block mb-2">Descrição</label>
              <textarea 
                className="w-full p-3 bg-slate-700 border border-slate-600 rounded-md text-white resize-none"
                rows={3}
                placeholder="Descreva os serviços a serem realizados..."
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalManutencao(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={() => handleAcaoMaquina(maquinaSelecionada?.id, 'Agendar Manutenção')}
              disabled={executandoAcao}
            >
              {executandoAcao ? (
                <>
                  <LucideIcons.Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Agendando...
                </>
              ) : (
                <>
                  <LucideIcons.Calendar className="mr-2 h-4 w-4" />
                  Agendar
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}