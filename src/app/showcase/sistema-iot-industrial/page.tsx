'use client'

import React, { useState, useCallback, useEffect, useMemo } from 'react'
import { toast, Toaster } from 'sonner'
import * as LucideIcons from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

// Importar módulos
import MonitoramentoOverview from './monitoramento-overview'
import MaquinasEquipamentos from './maquinas-equipamentos'
import AlertasCriticos from './alertas-criticos'
import RelatoriosAnalytics from './relatorios-analytics'
import ManutencaoPreditiva from './manutencao-preditiva'

// Interfaces principais
interface SensorData {
  id: string;
  nome: string;
  tipo: 'temperatura' | 'pressao' | 'vibração' | 'umidade' | 'rotacao';
  valor: number;
  unidade: string;
  status: 'normal' | 'atencao' | 'critico' | 'offline';
  maquina_id: string;
  ultima_leitura: string;
  limite_min: number;
  limite_max: number;
}

interface Maquina {
  id: string;
  nome: string;
  linha_producao: string;
  status: 'operando' | 'manutencao' | 'parada' | 'offline';
  eficiencia: number;
  tempo_ativo_horas: number;
  proxima_manutencao: string;
  sensores: SensorData[];
  alertas_ativos: number;
}

interface Alerta {
  id: string;
  tipo: 'critico' | 'alto' | 'medio' | 'info';
  titulo: string;
  descricao: string;
  maquina_id: string;
  sensor_id?: string;
  data_hora: string;
  status: 'ativo' | 'reconhecido' | 'resolvido';
  responsavel?: string;
}

export default function SistemaIoTIndustrial() {
  // Estados globais do sistema
  const [abaSelecionada, setAbaSelecionada] = useState<string>('overview');
  const [dadosGlobais, setDadosGlobais] = useState({
    maquinas: [] as Maquina[],
    sensores: [] as SensorData[],
    alertas: [] as Alerta[],
    estatisticas: {
      maquinas_operando: 0,
      total_alertas_criticos: 0,
      eficiencia_media: 0,
      sensores_offline: 0
    }
  });
  
  const [carregandoGlobal, setCarregandoGlobal] = useState(true);
  const [erroGlobal, setErroGlobal] = useState<string | null>(null);
  const [websocketConectado, setWebsocketConectado] = useState(false);
  const [perfilUsuario] = useState<'operador' | 'supervisor' | 'manutencao' | 'gerente'>('supervisor');
  
  // Prevenção memory leak obrigatória
  const montadoRef = React.useRef(true);
  const sensoresRef = React.useRef<SensorData[]>([]);
  
  useEffect(() => {
    montadoRef.current = true;
    return () => {
      montadoRef.current = false;
    };
  }, []);
  
  // Simulação de dados IoT
  const gerarDadosIoT = useCallback((): { maquinas: Maquina[], sensores: SensorData[], alertas: Alerta[] } => {
    const linhasProducao = ['Linha A', 'Linha B', 'Linha C', 'Linha D'];
    const tiposSensor = ['temperatura', 'pressao', 'vibração', 'umidade', 'rotacao'] as const;
    
    const maquinas: Maquina[] = [];
    const sensores: SensorData[] = [];
    const alertas: Alerta[] = [];
    
    // Gerar máquinas
    for (let i = 1; i <= 12; i++) {
      const statusOptions = ['operando', 'manutencao', 'parada', 'offline'] as const;
      const status = statusOptions[Math.floor(Math.random() * statusOptions.length)];
      
      const maquina: Maquina = {
        id: `maq_${i.toString().padStart(3, '0')}`,
        nome: `Máquina ${i.toString().padStart(3, '0')}`,
        linha_producao: linhasProducao[Math.floor(Math.random() * linhasProducao.length)],
        status,
        eficiencia: status === 'operando' ? 75 + Math.random() * 20 : Math.random() * 30,
        tempo_ativo_horas: Math.floor(Math.random() * 8760),
        proxima_manutencao: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        sensores: [],
        alertas_ativos: 0
      };
      
      // Gerar sensores para cada máquina
      for (let j = 1; j <= 4; j++) {
        const tipo = tiposSensor[Math.floor(Math.random() * tiposSensor.length)];
        const valorBase = {
          temperatura: 45,
          pressao: 2.5,
          vibração: 0.8,
          umidade: 45,
          rotacao: 1800
        }[tipo];
        
        const valor = valorBase + (Math.random() - 0.5) * valorBase * 0.3;
        const limiteMin = valorBase * 0.7;
        const limiteMax = valorBase * 1.3;
        
        let sensorStatus: 'normal' | 'atencao' | 'critico' | 'offline' = 'normal';
        if (valor < limiteMin || valor > limiteMax) {
          sensorStatus = Math.random() > 0.5 ? 'critico' : 'atencao';
        }
        if (maquina.status === 'offline') {
          sensorStatus = 'offline';
        }
        
        const sensor: SensorData = {
          id: `sensor_${maquina.id}_${j}`,
          nome: `${tipo.charAt(0).toUpperCase() + tipo.slice(1)} ${j}`,
          tipo,
          valor: Math.round(valor * 100) / 100,
          unidade: {
            temperatura: '°C',
            pressao: 'bar',
            vibração: 'mm/s',
            umidade: '%',
            rotacao: 'RPM'
          }[tipo],
          status: sensorStatus,
          maquina_id: maquina.id,
          ultima_leitura: new Date().toISOString(),
          limite_min: limiteMin,
          limite_max: limiteMax
        };
        
        sensores.push(sensor);
        maquina.sensores.push(sensor);
        
        // Gerar alertas para sensores críticos
        if (sensorStatus === 'critico' || sensorStatus === 'atencao') {
          const alerta: Alerta = {
            id: `alert_${sensor.id}_${Date.now()}`,
            tipo: sensorStatus === 'critico' ? 'critico' : 'alto',
            titulo: `${tipo} fora do limite`,
            descricao: `${sensor.nome} registrou ${valor}${sensor.unidade}, ultrapassando limite ${sensorStatus === 'critico' ? 'crítico' : 'de atenção'}`,
            maquina_id: maquina.id,
            sensor_id: sensor.id,
            data_hora: new Date().toISOString(),
            status: Math.random() > 0.7 ? 'reconhecido' : 'ativo',
            responsavel: Math.random() > 0.5 ? 'João Silva' : undefined
          };
          
          alertas.push(alerta);
          maquina.alertas_ativos++;
        }
      }
      
      maquinas.push(maquina);
    }
    
    return { maquinas, sensores, alertas };
  }, []);
  
  // Carregamento inicial de dados
  const carregarDadosIniciais = useCallback(async () => {
    if (!montadoRef.current) return;
    
    setCarregandoGlobal(true);
    setErroGlobal(null);
    
    const timeoutId = setTimeout(() => {
      if (montadoRef.current) {
        setCarregandoGlobal(false);
        setErroGlobal('Timeout na conexão com sensores. Verifique a rede industrial.');
      }
    }, 8000);
    
    try {
      // Simular carregamento de dados
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const dadosIoT = gerarDadosIoT();
      
      if (montadoRef.current) {
        const estatisticas = {
          maquinas_operando: dadosIoT.maquinas.filter(m => m.status === 'operando').length,
          total_alertas_criticos: dadosIoT.alertas.filter(a => a.tipo === 'critico' && a.status === 'ativo').length,
          eficiencia_media: Math.round(dadosIoT.maquinas.reduce((acc, m) => acc + m.eficiencia, 0) / dadosIoT.maquinas.length),
          sensores_offline: dadosIoT.sensores.filter(s => s.status === 'offline').length
        };
        
        setDadosGlobais({
          ...dadosIoT,
          estatisticas
        });
        
        // Atualizar ref para uso no intervalo
        sensoresRef.current = dadosIoT.sensores;
        
        setWebsocketConectado(true);
        toast.success('Sistema IoT conectado com sucesso');
      }
    } catch (error) {
      console.error('Erro ao carregar dados IoT:', error);
      if (montadoRef.current) {
        setErroGlobal('Falha na conexão com o sistema IoT. Verifique a conectividade dos sensores.');
      }
    } finally {
      clearTimeout(timeoutId);
      if (montadoRef.current) {
        setCarregandoGlobal(false);
      }
    }
  }, [gerarDadosIoT]);
  
  // Simulação de dados em tempo real
  useEffect(() => {
    if (!websocketConectado) return;
    
    const interval = setInterval(() => {
      if (montadoRef.current && sensoresRef.current.length > 0) {
        // Simular atualização de alguns sensores
        const sensoresAtualizados = sensoresRef.current.map(sensor => {
          if (Math.random() > 0.8) { // 20% chance de atualizar
            const novoValor = sensor.valor + (Math.random() - 0.5) * sensor.valor * 0.1;
            let novoStatus = sensor.status;
            
            if (novoValor < sensor.limite_min || novoValor > sensor.limite_max) {
              novoStatus = Math.random() > 0.5 ? 'critico' : 'atencao';
            } else {
              novoStatus = 'normal';
            }
            
            return {
              ...sensor,
              valor: Math.round(novoValor * 100) / 100,
              status: novoStatus,
              ultima_leitura: new Date().toISOString()
            };
          }
          return sensor;
        });
        
        setDadosGlobais(prev => ({
          ...prev,
          sensores: sensoresAtualizados
        }));
        
        // Atualizar ref com os novos dados
        sensoresRef.current = sensoresAtualizados;
      }
    }, 3000); // Atualizar a cada 3 segundos
    
    return () => clearInterval(interval);
  }, [websocketConectado]);
  
  useEffect(() => {
    carregarDadosIniciais();
  }, [carregarDadosIniciais]);
  
  // Configuração das abas
  const configAbas = useMemo(() => [
    {
      id: 'overview',
      label: 'Overview',
      icone: 'LayoutDashboard',
      badge: websocketConectado ? dadosGlobais.estatisticas.total_alertas_criticos : null,
      badgeVariant: 'destructive' as const
    },
    {
      id: 'maquinas',
      label: 'Máquinas',
      icone: 'Cog',
      badge: dadosGlobais.estatisticas.maquinas_operando,
      badgeVariant: 'default' as const
    },
    {
      id: 'alertas',
      label: 'Alertas',
      icone: 'AlertTriangle',
      badge: dadosGlobais.alertas.filter(a => a.status === 'ativo').length,
      badgeVariant: dadosGlobais.alertas.filter(a => a.status === 'ativo' && a.tipo === 'critico').length > 0 ? 'destructive' as const : 'secondary' as const
    },
    {
      id: 'relatorios',
      label: 'Relatórios',
      icone: 'BarChart3',
      badge: null,
      badgeVariant: 'default' as const
    },
    {
      id: 'manutencao',
      label: 'Manutenção',
      icone: 'Wrench',
      badge: dadosGlobais.maquinas.filter(m => m.status === 'manutencao').length,
      badgeVariant: 'secondary' as const
    }
  ], [
    websocketConectado,
    dadosGlobais.estatisticas.total_alertas_criticos,
    dadosGlobais.estatisticas.maquinas_operando,
    dadosGlobais.alertas.length,
    dadosGlobais.maquinas.length
  ]);
  
  // Estados de loading e erro
  if (carregandoGlobal) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="flex items-center justify-center mb-6">
            <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full"></div>
          </div>
          <h2 className="text-2xl font-bold mb-2">Conectando ao Sistema IoT</h2>
          <p className="text-gray-300">Estabelecendo comunicação com sensores industriais...</p>
          <div className="mt-6 flex items-center justify-center space-x-2">
            <div className="h-2 w-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="h-2 w-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="h-2 w-2 bg-blue-500 rounded-full animate-bounce"></div>
          </div>
        </div>
      </div>
    );
  }
  
  if (erroGlobal) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-gray-900 flex items-center justify-center">
        <div className="bg-red-950 border border-red-800 p-8 rounded-lg text-center max-w-md">
          <LucideIcons.AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Falha na Conexão IoT</h2>
          <p className="text-red-200 mb-6">{erroGlobal}</p>
          <div className="space-y-2">
            <p className="text-sm text-red-300">Verifique:</p>
            <ul className="text-sm text-red-200 text-left space-y-1">
              <li>• Conectividade de rede industrial</li>
              <li>• Status dos gateways IoT</li>
              <li>• Configuração de sensores</li>
            </ul>
          </div>
          <Button 
            onClick={carregarDadosIniciais}
            className="mt-6 bg-red-600 hover:bg-red-700"
          >
            <LucideIcons.RefreshCw className="mr-2 h-4 w-4" />
            Tentar Reconectar
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-gray-900">
      <Toaster position="bottom-right" richColors />
      
      {/* Header com status de conexão */}
      <div className="bg-slate-800 border-b border-slate-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <LucideIcons.Activity className="h-6 w-6 text-blue-400" />
              <h1 className="text-xl font-bold text-white">Sistema IoT Industrial</h1>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className={`h-2 w-2 rounded-full ${websocketConectado ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm text-gray-300">
                {websocketConectado ? 'Conectado' : 'Desconectado'}
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Badge variant="outline" className="text-white border-gray-600">
              Perfil: {perfilUsuario.charAt(0).toUpperCase() + perfilUsuario.slice(1)}
            </Badge>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.history.back()}
              className="text-gray-300 border-gray-600 hover:bg-gray-700"
            >
              <LucideIcons.ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
          </div>
        </div>
      </div>
      
      {/* Estatísticas rápidas */}
      <div className="px-6 py-4 bg-slate-800/50">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Máquinas Operando</p>
                  <p className="text-2xl font-bold text-green-400">
                    {dadosGlobais.estatisticas.maquinas_operando}/{dadosGlobais.maquinas.length}
                  </p>
                </div>
                <LucideIcons.Cog className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Alertas Críticos</p>
                  <p className="text-2xl font-bold text-red-400">
                    {dadosGlobais.estatisticas.total_alertas_criticos}
                  </p>
                </div>
                <LucideIcons.AlertTriangle className="h-8 w-8 text-red-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Eficiência Média</p>
                  <p className="text-2xl font-bold text-blue-400">
                    {dadosGlobais.estatisticas.eficiencia_media}%
                  </p>
                </div>
                <LucideIcons.TrendingUp className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Sensores Offline</p>
                  <p className="text-2xl font-bold text-orange-400">
                    {dadosGlobais.estatisticas.sensores_offline}
                  </p>
                </div>
                <LucideIcons.WifiOff className="h-8 w-8 text-orange-400" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Navegação principal */}
      <div className="px-6">
        <Tabs value={abaSelecionada} onValueChange={setAbaSelecionada} className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-slate-800">
            {configAbas.map(aba => {
              const IconeComponente = LucideIcons[aba.icone as keyof typeof LucideIcons] as any;
              
              return (
                <TabsTrigger 
                  key={aba.id}
                  value={aba.id}
                  className="relative data-[state=active]:bg-slate-700 text-gray-300"
                >
                  <div className="flex items-center gap-2">
                    <IconeComponente className="h-4 w-4" />
                    <span className="hidden sm:inline">{aba.label}</span>
                    {aba.badge !== null && aba.badge > 0 && (
                      <Badge variant={aba.badgeVariant} className="ml-1 text-xs px-1 py-0">
                        {aba.badge}
                      </Badge>
                    )}
                  </div>
                </TabsTrigger>
              );
            })}
          </TabsList>
          
          {/* Conteúdo das abas */}
          <div className="mt-6">
            <TabsContent value="overview" className="mt-0">
              <MonitoramentoOverview 
                dados={dadosGlobais}
                websocketConectado={websocketConectado}
                perfilUsuario={perfilUsuario}
              />
            </TabsContent>
            
            <TabsContent value="maquinas" className="mt-0">
              <MaquinasEquipamentos 
                maquinas={dadosGlobais.maquinas}
                sensores={dadosGlobais.sensores}
                perfilUsuario={perfilUsuario}
              />
            </TabsContent>
            
            <TabsContent value="alertas" className="mt-0">
              <AlertasCriticos 
                alertas={dadosGlobais.alertas}
                maquinas={dadosGlobais.maquinas}
                perfilUsuario={perfilUsuario}
              />
            </TabsContent>
            
            <TabsContent value="relatorios" className="mt-0">
              <RelatoriosAnalytics 
                dados={dadosGlobais}
                perfilUsuario={perfilUsuario}
              />
            </TabsContent>
            
            <TabsContent value="manutencao" className="mt-0">
              <ManutencaoPreditiva 
                maquinas={dadosGlobais.maquinas}
                alertas={dadosGlobais.alertas}
                perfilUsuario={perfilUsuario}
              />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}