'use client'

import React, { useState, useCallback, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from 'sonner'
import * as LucideIcons from 'lucide-react'

interface Props {
  dados: any;
  perfilUsuario: string;
}

// Tipos de relatórios disponíveis
const tiposRelatorio = [
  {
    id: 'eficiencia',
    nome: 'Eficiência Operacional',
    descricao: 'Análise de performance das máquinas',
    icone: 'TrendingUp',
    categoria: 'operacional'
  },
  {
    id: 'disponibilidade',
    nome: 'Disponibilidade de Equipamentos',
    descricao: 'Tempo ativo vs inativo das máquinas',
    icone: 'Clock',
    categoria: 'operacional'
  },
  {
    id: 'alertas',
    nome: 'Histórico de Alertas',
    descricao: 'Análise temporal dos alertas gerados',
    icone: 'AlertTriangle',
    categoria: 'manutencao'
  },
  {
    id: 'sensores',
    nome: 'Performance de Sensores',
    descricao: 'Estatísticas dos sensores por tipo',
    icone: 'Activity',
    categoria: 'tecnico'
  },
  {
    id: 'manutencao',
    nome: 'Manutenção Preventiva',
    descricao: 'Cronograma e histórico de manutenções',
    icone: 'Wrench',
    categoria: 'manutencao'
  },
  {
    id: 'consumo',
    nome: 'Consumo Energético',
    descricao: 'Análise de consumo por linha/máquina',
    icone: 'Zap',
    categoria: 'sustentabilidade'
  }
];

export default function RelatoriosAnalytics({ dados, perfilUsuario }: Props) {
  // Estados de interface
  const [relatorioSelecionado, setRelatorioSelecionado] = useState<string | null>(null);
  const [modalGeracao, setModalGeracao] = useState(false);
  const [parametrosRelatorio, setParametrosRelatorio] = useState({
    periodo: '7d',
    formato: 'pdf',
    maquinas: [] as string[],
    incluirGraficos: true,
    incluirDetalhes: true,
    enviarEmail: false,
    emailDestinatario: ''
  });
  const [gerandoRelatorio, setGerandoRelatorio] = useState(false);
  const [relatoriosRecentes, setRelatoriosRecentes] = useState([
    {
      id: 'rel_001',
      tipo: 'eficiencia',
      nome: 'Eficiência Operacional - Semana 42',
      data_geracao: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      formato: 'pdf',
      tamanho: '2.4 MB',
      status: 'concluido'
    },
    {
      id: 'rel_002',
      tipo: 'alertas',
      nome: 'Histórico de Alertas - Outubro',
      data_geracao: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      formato: 'excel',
      tamanho: '856 KB',
      status: 'concluido'
    }
  ]);
  
  const montadoRef = React.useRef(true);
  
  React.useEffect(() => {
    montadoRef.current = true;
    return () => { montadoRef.current = false; };
  }, []);
  
  // Analytics em tempo real
  const analytics = useMemo(() => {
    const totalMaquinas = dados.maquinas.length;
    const maquinasOperando = dados.maquinas.filter(m => m.status === 'operando').length;
    const eficienciaMedia = Math.round(
      dados.maquinas.reduce((acc, m) => acc + m.eficiencia, 0) / totalMaquinas
    );
    
    const alertasPorTipo = dados.alertas.reduce((acc, alerta) => {
      acc[alerta.tipo] = (acc[alerta.tipo] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const sensoresPorStatus = dados.sensores.reduce((acc, sensor) => {
      acc[sensor.status] = (acc[sensor.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Tendências simuladas
    const tendencias = {
      eficiencia: Math.random() > 0.5 ? 'subindo' : 'estavel',
      disponibilidade: Math.random() > 0.3 ? 'subindo' : 'descendo',
      alertas: Math.random() > 0.4 ? 'descendo' : 'subindo'
    };
    
    return {
      totalMaquinas,
      maquinasOperando,
      eficienciaMedia,
      disponibilidade: Math.round((maquinasOperando / totalMaquinas) * 100),
      alertasPorTipo,
      sensoresPorStatus,
      tendencias
    };
  }, [dados]);
  
  // Filtrar relatórios por categoria baseado no perfil
  const relatoriosDisponiveis = useMemo(() => {
    const permissoesPorPerfil = {
      'operador': ['operacional'],
      'supervisor': ['operacional', 'manutencao'],
      'manutencao': ['manutencao', 'tecnico'],
      'gerente': ['operacional', 'manutencao', 'tecnico', 'sustentabilidade']
    };
    
    const categoriasPermitidas = permissoesPorPerfil[perfilUsuario] || ['operacional'];
    
    return tiposRelatorio.filter(rel => 
      categoriasPermitidas.includes(rel.categoria)
    );
  }, [perfilUsuario]);
  
  // Abrir modal de geração
  const handleGerarRelatorio = useCallback((tipoId: string) => {
    setRelatorioSelecionado(tipoId);
    setModalGeracao(true);
    setParametrosRelatorio(prev => ({
      ...prev,
      maquinas: [],
      emailDestinatario: ''
    }));
  }, []);
  
  // Gerar relatório
  const handleConfirmarGeracao = useCallback(async () => {
    if (!relatorioSelecionado || !montadoRef.current) return;
    
    setGerandoRelatorio(true);
    
    const timeoutId = setTimeout(() => {
      if (montadoRef.current) {
        setGerandoRelatorio(false);
        toast.error('Timeout na geração do relatório');
      }
    }, 15000); // Timeout maior para relatórios
    
    try {
      // Simular tempo de geração baseado na complexidade
      const tempoGeracao = parametrosRelatorio.incluirGraficos ? 3000 : 1500;
      await new Promise(resolve => setTimeout(resolve, tempoGeracao));
      
      if (montadoRef.current) {
        const novoRelatorio = {
          id: `rel_${Date.now()}`,
          tipo: relatorioSelecionado,
          nome: `${tiposRelatorio.find(t => t.id === relatorioSelecionado)?.nome} - ${new Date().toLocaleDateString()}`,
          data_geracao: new Date().toISOString(),
          formato: parametrosRelatorio.formato,
          tamanho: `${(Math.random() * 5 + 0.5).toFixed(1)} MB`,
          status: 'concluido'
        };
        
        setRelatoriosRecentes(prev => [novoRelatorio, ...prev.slice(0, 4)]);
        
        toast.success('Relatório gerado com sucesso', {
          description: parametrosRelatorio.enviarEmail ? 
            'O relatório foi enviado para o email especificado' : 
            'O relatório está disponível para download',
          action: {
            label: 'Ver Relatórios',
            onClick: () => {}
          }
        });
        
        setModalGeracao(false);
        setRelatorioSelecionado(null);
      }
    } catch (error) {
      if (montadoRef.current) {
        toast.error('Falha na geração do relatório');
      }
    } finally {
      clearTimeout(timeoutId);
      if (montadoRef.current) {
        setGerandoRelatorio(false);
      }
    }
  }, [relatorioSelecionado, parametrosRelatorio]);
  
  // Download de relatório
  const handleDownloadRelatorio = useCallback(async (relatorioId: string) => {
    toast.promise(
      new Promise(resolve => setTimeout(resolve, 2000)),
      {
        loading: 'Preparando download...',
        success: 'Download iniciado com sucesso',
        error: 'Falha no download do relatório'
      }
    );
  }, []);
  
  // Obter ícone de tendência
  const obterIconeTendencia = (tendencia: string) => {
    switch (tendencia) {
      case 'subindo': return { icone: 'TrendingUp', cor: 'text-green-400' };
      case 'descendo': return { icone: 'TrendingDown', cor: 'text-red-400' };
      default: return { icone: 'Minus', cor: 'text-gray-400' };
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Relatórios e Analytics</h2>
          <p className="text-gray-400">
            Análises de performance e relatórios customizados
          </p>
        </div>
        
        <Badge variant="outline" className="text-white border-gray-600">
          Perfil: {perfilUsuario.charAt(0).toUpperCase() + perfilUsuario.slice(1)}
        </Badge>
      </div>
      
      {/* KPIs principais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Eficiência Média</p>
                <div className="flex items-center space-x-2">
                  <p className="text-2xl font-bold text-blue-400">{analytics.eficienciaMedia}%</p>
                  {(() => {
                    const { icone, cor } = obterIconeTendencia(analytics.tendencias.eficiencia);
                    const IconeTendencia = LucideIcons[icone as keyof typeof LucideIcons] as any;
                    return <IconeTendencia className={`h-4 w-4 ${cor}`} />;
                  })()}
                </div>
              </div>
              <LucideIcons.TrendingUp className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Disponibilidade</p>
                <div className="flex items-center space-x-2">
                  <p className="text-2xl font-bold text-green-400">{analytics.disponibilidade}%</p>
                  {(() => {
                    const { icone, cor } = obterIconeTendencia(analytics.tendencias.disponibilidade);
                    const IconeTendencia = LucideIcons[icone as keyof typeof LucideIcons] as any;
                    return <IconeTendencia className={`h-4 w-4 ${cor}`} />;
                  })()}
                </div>
              </div>
              <LucideIcons.Clock className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Alertas Ativos</p>
                <div className="flex items-center space-x-2">
                  <p className="text-2xl font-bold text-orange-400">
                    {Object.values(analytics.alertasPorTipo).reduce((a, b) => a + b, 0)}
                  </p>
                  {(() => {
                    const { icone, cor } = obterIconeTendencia(analytics.tendencias.alertas);
                    const IconeTendencia = LucideIcons[icone as keyof typeof LucideIcons] as any;
                    return <IconeTendencia className={`h-4 w-4 ${cor}`} />;
                  })()}
                </div>
              </div>
              <LucideIcons.AlertTriangle className="h-8 w-8 text-orange-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Sensores Online</p>
                <p className="text-2xl font-bold text-cyan-400">
                  {analytics.sensoresPorStatus.normal + analytics.sensoresPorStatus.atencao + analytics.sensoresPorStatus.critico || 0}
                </p>
              </div>
              <LucideIcons.Activity className="h-8 w-8 text-cyan-400" />
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Tipos de relatórios disponíveis */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Relatórios Disponíveis</CardTitle>
          <CardDescription className="text-gray-400">
            Selecione o tipo de relatório para gerar análises customizadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {relatoriosDisponiveis.map(relatorio => {
              const IconeRelatorio = LucideIcons[relatorio.icone as keyof typeof LucideIcons] as any;
              
              return (
                <Card key={relatorio.id} className="bg-slate-700 border-slate-600 hover:bg-slate-650 transition-colors cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <div className="p-2 bg-blue-500/20 rounded-lg">
                        <IconeRelatorio className="h-5 w-5 text-blue-400" />
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="font-medium text-white mb-1">{relatorio.nome}</h3>
                        <p className="text-sm text-gray-400 mb-3">{relatorio.descricao}</p>
                        
                        <Button
                          size="sm"
                          onClick={() => handleGerarRelatorio(relatorio.id)}
                          className="w-full"
                        >
                          <LucideIcons.FileText className="mr-2 h-3 w-3" />
                          Gerar Relatório
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>
      
      {/* Relatórios recentes */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Relatórios Recentes</CardTitle>
          <CardDescription className="text-gray-400">
            Histórico dos últimos relatórios gerados
          </CardDescription>
        </CardHeader>
        <CardContent>
          {relatoriosRecentes.length === 0 ? (
            <div className="text-center py-8">
              <LucideIcons.FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400">Nenhum relatório gerado ainda</p>
            </div>
          ) : (
            <div className="space-y-3">
              {relatoriosRecentes.map(relatorio => {
                const tipoInfo = tiposRelatorio.find(t => t.id === relatorio.tipo);
                const IconeTipo = LucideIcons[tipoInfo?.icone as keyof typeof LucideIcons] as any;
                
                return (
                  <div key={relatorio.id} className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-500/20 rounded">
                        <IconeTipo className="h-4 w-4 text-blue-400" />
                      </div>
                      
                      <div>
                        <h4 className="text-white font-medium">{relatorio.nome}</h4>
                        <div className="flex items-center space-x-2 text-sm text-gray-400">
                          <span>{new Date(relatorio.data_geracao).toLocaleString()}</span>
                          <span>•</span>
                          <span>{relatorio.formato.toUpperCase()}</span>
                          <span>•</span>
                          <span>{relatorio.tamanho}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Badge variant={relatorio.status === 'concluido' ? 'default' : 'secondary'}>
                        {relatorio.status === 'concluido' ? 'Concluído' : 'Processando'}
                      </Badge>
                      
                      {relatorio.status === 'concluido' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDownloadRelatorio(relatorio.id)}
                        >
                          <LucideIcons.Download className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Modal de geração de relatório */}
      <Dialog open={modalGeracao} onOpenChange={setModalGeracao}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <LucideIcons.FileText className="h-5 w-5" />
              <span>Gerar Relatório</span>
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Configure os parâmetros para gerar o relatório personalizado
            </DialogDescription>
          </DialogHeader>
          
          {relatorioSelecionado && (
            <div className="space-y-6">
              {/* Informações do relatório */}
              <div className="p-4 bg-slate-700 rounded-lg">
                <h3 className="font-medium text-white mb-2">
                  {tiposRelatorio.find(t => t.id === relatorioSelecionado)?.nome}
                </h3>
                <p className="text-gray-400 text-sm">
                  {tiposRelatorio.find(t => t.id === relatorioSelecionado)?.descricao}
                </p>
              </div>
              
              {/* Configurações */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400 block mb-2">Período</label>
                  <Select
                    value={parametrosRelatorio.periodo}
                    onValueChange={(valor) => setParametrosRelatorio(prev => ({ ...prev, periodo: valor }))}
                  >
                    <SelectTrigger className="bg-slate-700 border-slate-600">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="24h">Últimas 24 horas</SelectItem>
                      <SelectItem value="7d">Últimos 7 dias</SelectItem>
                      <SelectItem value="30d">Últimos 30 dias</SelectItem>
                      <SelectItem value="3m">Últimos 3 meses</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm text-gray-400 block mb-2">Formato</label>
                  <Select
                    value={parametrosRelatorio.formato}
                    onValueChange={(valor) => setParametrosRelatorio(prev => ({ ...prev, formato: valor }))}
                  >
                    <SelectTrigger className="bg-slate-700 border-slate-600">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF</SelectItem>
                      <SelectItem value="excel">Excel</SelectItem>
                      <SelectItem value="csv">CSV</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {/* Máquinas específicas */}
              <div>
                <label className="text-sm text-gray-400 block mb-2">
                  Máquinas (deixe vazio para incluir todas)
                </label>
                <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                  {dados.maquinas.slice(0, 8).map(maquina => (
                    <div key={maquina.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={maquina.id}
                        checked={parametrosRelatorio.maquinas.includes(maquina.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setParametrosRelatorio(prev => ({
                              ...prev,
                              maquinas: [...prev.maquinas, maquina.id]
                            }));
                          } else {
                            setParametrosRelatorio(prev => ({
                              ...prev,
                              maquinas: prev.maquinas.filter(id => id !== maquina.id)
                            }));
                          }
                        }}
                      />
                      <label htmlFor={maquina.id} className="text-sm text-gray-300 cursor-pointer">
                        {maquina.nome}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Opções avançadas */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-300">Opções Avançadas</h4>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="incluir-graficos"
                    checked={parametrosRelatorio.incluirGraficos}
                    onCheckedChange={(checked) => setParametrosRelatorio(prev => ({ ...prev, incluirGraficos: checked }))}
                  />
                  <label htmlFor="incluir-graficos" className="text-sm text-gray-300 cursor-pointer">
                    Incluir gráficos e visualizações
                  </label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="incluir-detalhes"
                    checked={parametrosRelatorio.incluirDetalhes}
                    onCheckedChange={(checked) => setParametrosRelatorio(prev => ({ ...prev, incluirDetalhes: checked }))}
                  />
                  <label htmlFor="incluir-detalhes" className="text-sm text-gray-300 cursor-pointer">
                    Incluir dados detalhados
                  </label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="enviar-email"
                    checked={parametrosRelatorio.enviarEmail}
                    onCheckedChange={(checked) => setParametrosRelatorio(prev => ({ ...prev, enviarEmail: checked }))}
                  />
                  <label htmlFor="enviar-email" className="text-sm text-gray-300 cursor-pointer">
                    Enviar por email
                  </label>
                </div>
                
                {parametrosRelatorio.enviarEmail && (
                  <Input
                    placeholder="Email do destinatário"
                    type="email"
                    value={parametrosRelatorio.emailDestinatario}
                    onChange={(e) => setParametrosRelatorio(prev => ({ ...prev, emailDestinatario: e.target.value }))}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                )}
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalGeracao(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleConfirmarGeracao}
              disabled={gerandoRelatorio || (parametrosRelatorio.enviarEmail && !parametrosRelatorio.emailDestinatario)}
            >
              {gerandoRelatorio ? (
                <>
                  <LucideIcons.Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Gerando...
                </>
              ) : (
                <>
                  <LucideIcons.FileText className="mr-2 h-4 w-4" />
                  Gerar Relatório
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}