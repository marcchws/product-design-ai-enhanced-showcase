'use client'

import React, { useState, useCallback, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import * as LucideIcons from 'lucide-react'

interface Props {
  dados: any;
  websocketConectado: boolean;
  perfilUsuario: string;
}

// Função utilitária para status visual de sensor
const formatarStatusSensor = (status: string) => {
  const configs = {
    'normal': { 
      cor: 'text-green-400', 
      bg: 'bg-green-500/20 border-green-500/50', 
      icone: 'CheckCircle',
      texto: 'Normal'
    },
    'atencao': { 
      cor: 'text-yellow-400', 
      bg: 'bg-yellow-500/20 border-yellow-500/50', 
      icone: 'AlertTriangle',
      texto: 'Atenção'
    },
    'critico': { 
      cor: 'text-red-400', 
      bg: 'bg-red-500/20 border-red-500/50', 
      icone: 'AlertCircle',
      texto: 'Crítico'
    },
    'offline': { 
      cor: 'text-gray-400', 
      bg: 'bg-gray-500/20 border-gray-500/50', 
      icone: 'WifiOff',
      texto: 'Offline'
    }
  };
  
  return configs[status] || configs['offline'];
};

// Função utilitária para ícone de sensor por tipo
const obterIconeSensor = (tipo: string) => {
  const icones = {
    'temperatura': 'Thermometer',
    'pressao': 'Gauge',
    'vibração': 'Activity',
    'umidade': 'Droplets',
    'rotacao': 'RotateCw'
  };
  
  return icones[tipo] || 'Sensor';
};

export default function MonitoramentoOverview({ dados, websocketConectado, perfilUsuario }: Props) {
  const [linhaFiltro, setLinhaFiltro] = useState<string>('todas');
  
  // Análise de dados em tempo real
  const analiseTempoReal = useMemo(() => {
    const sensoresPorStatus = dados.sensores.reduce((acc, sensor) => {
      acc[sensor.status] = (acc[sensor.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const maquinasPorLinha = dados.maquinas.reduce((acc, maquina) => {
      if (!acc[maquina.linha_producao]) {
        acc[maquina.linha_producao] = {
          total: 0,
          operando: 0,
          eficiencia_media: 0
        };
      }
      
      acc[maquina.linha_producao].total++;
      if (maquina.status === 'operando') {
        acc[maquina.linha_producao].operando++;
      }
      acc[maquina.linha_producao].eficiencia_media += maquina.eficiencia;
      
      return acc;
    }, {} as Record<string, any>);
    
    // Calcular eficiência média por linha
    Object.keys(maquinasPorLinha).forEach(linha => {
      maquinasPorLinha[linha].eficiencia_media = 
        Math.round(maquinasPorLinha[linha].eficiencia_media / maquinasPorLinha[linha].total);
    });
    
    return {
      sensoresPorStatus,
      maquinasPorLinha,
      alertasCriticos: dados.alertas.filter(a => a.tipo === 'critico' && a.status === 'ativo'),
      tendenciaEficiencia: Math.random() > 0.5 ? 'subindo' : 'estavel' // Simulado
    };
  }, [dados]);
  
  const linhasProducao = Object.keys(analiseTempoReal.maquinasPorLinha);
  const maquinasFiltradas = linhaFiltro === 'todas' 
    ? dados.maquinas 
    : dados.maquinas.filter(m => m.linha_producao === linhaFiltro);
  
  return (
    <div className="space-y-6">
      {/* Cabeçalho com filtros */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Dashboard de Monitoramento</h2>
          <p className="text-gray-400">
            Visão em tempo real do chão de fábrica • Última atualização: {new Date().toLocaleTimeString()}
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Badge 
            variant={websocketConectado ? "default" : "destructive"}
            className="flex items-center gap-1"
          >
            <div className={`h-2 w-2 rounded-full ${websocketConectado ? 'bg-green-500' : 'bg-red-500'}`}></div>
            {websocketConectado ? 'Tempo Real' : 'Desconectado'}
          </Badge>
          
          <select
            value={linhaFiltro}
            onChange={(e) => setLinhaFiltro(e.target.value)}
            className="bg-slate-800 border border-slate-600 rounded-md px-3 py-1 text-white text-sm"
          >
            <option value="todas">Todas as Linhas</option>
            {linhasProducao.map(linha => (
              <option key={linha} value={linha}>{linha}</option>
            ))}
          </select>
        </div>
      </div>
      
      {/* Cards de status por linha de produção */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {linhasProducao.map(linha => {
          const info = analiseTempoReal.maquinasPorLinha[linha];
          const porcentagemOperando = Math.round((info.operando / info.total) * 100);
          
          return (
            <Card key={linha} className="bg-slate-800 border-slate-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-white flex items-center justify-between">
                  {linha}
                  <Badge variant={porcentagemOperando >= 80 ? "default" : porcentagemOperando >= 50 ? "secondary" : "destructive"}>
                    {porcentagemOperando}%
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Operando:</span>
                    <span className="text-green-400">{info.operando}/{info.total}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Eficiência:</span>
                    <span className="text-blue-400">{info.eficiencia_media}%</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${porcentagemOperando}%` }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      {/* Alertas críticos em destaque */}
      {analiseTempoReal.alertasCriticos.length > 0 && (
        <Card className="bg-red-950/50 border-red-800">
          <CardHeader>
            <CardTitle className="text-red-400 flex items-center gap-2">
              <LucideIcons.AlertTriangle className="h-5 w-5" />
              Alertas Críticos Ativos ({analiseTempoReal.alertasCriticos.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analiseTempoReal.alertasCriticos.slice(0, 3).map(alerta => (
                <div key={alerta.id} className="flex items-center justify-between p-3 bg-red-900/30 rounded-lg border border-red-800/50">
                  <div className="flex items-center space-x-3">
                    <LucideIcons.AlertCircle className="h-5 w-5 text-red-400" />
                    <div>
                      <p className="text-white font-medium">{alerta.titulo}</p>
                      <p className="text-red-200 text-sm">{alerta.descricao}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-red-300 text-sm">{new Date(alerta.data_hora).toLocaleTimeString()}</p>
                    <Badge variant="destructive" className="text-xs">
                      {alerta.maquina_id}
                    </Badge>
                  </div>
                </div>
              ))}
              
              {analiseTempoReal.alertasCriticos.length > 3 && (
                <Button variant="outline" className="w-full text-red-400 border-red-800 hover:bg-red-900/30">
                  Ver todos os {analiseTempoReal.alertasCriticos.length} alertas críticos
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Grid de máquinas com status visual */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">
            Status das Máquinas {linhaFiltro !== 'todas' && `- ${linhaFiltro}`}
          </CardTitle>
          <CardDescription className="text-gray-400">
            Visão geral do status operacional e sensores
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {maquinasFiltradas.map(maquina => {
              const statusConfig = {
                'operando': { cor: 'border-green-500 bg-green-500/10', badge: 'default', texto: 'Operando' },
                'manutencao': { cor: 'border-yellow-500 bg-yellow-500/10', badge: 'secondary', texto: 'Manutenção' },
                'parada': { cor: 'border-orange-500 bg-orange-500/10', badge: 'secondary', texto: 'Parada' },
                'offline': { cor: 'border-gray-500 bg-gray-500/10', badge: 'outline', texto: 'Offline' }
              };
              
              const config = statusConfig[maquina.status] || statusConfig['offline'];
              
              return (
                <Card key={maquina.id} className={`${config.cor} border-2`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-white text-base">{maquina.nome}</CardTitle>
                      <Badge variant={config.badge as any}>{config.texto}</Badge>
                    </div>
                    <CardDescription className="text-gray-400">
                      {maquina.linha_producao}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {/* Eficiência */}
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-400">Eficiência:</span>
                        <span className="text-white font-medium">{Math.round(maquina.eficiencia)}%</span>
                      </div>
                      
                      {/* Sensores */}
                      <div>
                        <p className="text-sm text-gray-400 mb-2">Sensores:</p>
                        <div className="grid grid-cols-2 gap-2">
                          {maquina.sensores.slice(0, 4).map(sensor => {
                            const statusSensor = formatarStatusSensor(sensor.status);
                            const IconeSensor = LucideIcons[obterIconeSensor(sensor.tipo) as keyof typeof LucideIcons] as any;
                            
                            return (
                              <div 
                                key={sensor.id}
                                className={`p-2 rounded border ${statusSensor.bg} ${statusSensor.cor}`}
                              >
                                <div className="flex items-center justify-between">
                                  <IconeSensor className="h-3 w-3" />
                                  <span className="text-xs">{sensor.valor}{sensor.unidade}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      
                      {/* Alertas ativos */}
                      {maquina.alertas_ativos > 0 && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-400">Alertas:</span>
                          <Badge variant="destructive" className="text-xs">
                            {maquina.alertas_ativos}
                          </Badge>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>
      
      {/* Resumo de sensores por status */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Status Geral dos Sensores</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(analiseTempoReal.sensoresPorStatus).map(([status, quantidade]) => {
              const statusConfig = formatarStatusSensor(status);
              const IconeStatus = LucideIcons[statusConfig.icone as keyof typeof LucideIcons] as any;
              
              return (
                <div key={status} className={`p-4 rounded-lg border ${statusConfig.bg}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-lg font-bold ${statusConfig.cor}`}>{quantidade}</p>
                      <p className="text-sm text-gray-400">{statusConfig.texto}</p>
                    </div>
                    <IconeStatus className={`h-6 w-6 ${statusConfig.cor}`} />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}