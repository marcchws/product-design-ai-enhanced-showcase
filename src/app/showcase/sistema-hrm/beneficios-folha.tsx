'use client'

import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react'
import { toast, Toaster } from 'sonner'
import * as LucideIcons from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { gerarIniciaisNome, formatarDataContextual } from '@/lib/utils'
import { formatarMoeda, formatarStatusVisual } from '@/lib/utils-defensivas'
import { useMounted } from '@/hooks/use-mounted'

interface BeneficiosFolhaProps {
  dadosGlobais: any;
  onAtualizarDados: () => void;
}

interface Beneficio {
  id: string;
  nome: string;
  tipo: 'saude' | 'alimentacao' | 'transporte' | 'educacao' | 'lazer' | 'outros';
  valor: number;
  tipo_valor: 'fixo' | 'percentual' | 'variavel';
  fornecedor: string;
  status: 'ativo' | 'inativo' | 'suspenso';
  data_inicio: string;
  data_fim?: string;
  colaboradores_ativos: number;
  custo_mensal: number;
  descricao: string;
}

interface FolhaPagamento {
  id: string;
  colaborador_id: string;
  colaborador_nome: string;
  mes: string;
  ano: string;
  salario_base: number;
  beneficios: number;
  descontos: number;
  salario_liquido: number;
  status: 'processada' | 'paga' | 'pendente' | 'cancelada';
  data_pagamento?: string;
  observacoes?: string;
}

interface RelatorioFinanceiro {
  mes: string;
  ano: string;
  total_folha: number;
  total_beneficios: number;
  total_descontos: number;
  media_salario: number;
  colaboradores_ativos: number;
  variacao_mes_anterior: number;
}

export default function BeneficiosFolha({ dadosGlobais, onAtualizarDados }: BeneficiosFolhaProps) {
  // Estados principais
  const [beneficios, setBeneficios] = useState<Beneficio[]>([]);
  const [folhaPagamento, setFolhaPagamento] = useState<FolhaPagamento[]>([]);
  const [relatorioFinanceiro, setRelatorioFinanceiro] = useState<RelatorioFinanceiro | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [abaSelecionada, setAbaSelecionada] = useState('beneficios');
  
  // Estados de filtros
  const [filtrosBeneficios, setFiltrosBeneficios] = useState({
    termo: '',
    tipo: 'todos',
    status: 'todos',
    fornecedor: 'todos'
  });
  
  const [filtrosFolha, setFiltrosFolha] = useState({
    mes: new Date().getMonth() + 1,
    ano: new Date().getFullYear(),
    status: 'todos'
  });
  
  // Estados de modais
  const [modalBeneficio, setModalBeneficio] = useState<Beneficio | null>(null);
  const [modalFolha, setModalFolha] = useState<FolhaPagamento | null>(null);
  const [modoModal, setModoModal] = useState<'criar' | 'editar' | 'visualizar'>('visualizar');
  
  const montadoRef = useMounted();

  // Carregar dados
  const carregarDados = useCallback(async () => {
    if (!montadoRef.current) return;
    
    setCarregando(true);
    setErro(null);
    
    const timeoutId = setTimeout(() => {
      if (montadoRef.current) {
        setCarregando(false);
        setErro('Tempo de carregamento excedido. Tente novamente.');
      }
    }, 8000);
    
    try {
      // Simulação de API
      const response = await new Promise<{
        beneficios: Beneficio[];
        folhaPagamento: FolhaPagamento[];
        relatorioFinanceiro: RelatorioFinanceiro;
      }>((resolve) => {
        setTimeout(() => {
          resolve({
            beneficios: [
              {
                id: '1',
                nome: 'Plano de Saúde Unimed',
                tipo: 'saude',
                valor: 350,
                tipo_valor: 'fixo',
                fornecedor: 'Unimed',
                status: 'ativo',
                data_inicio: '2020-01-01',
                colaboradores_ativos: 245,
                custo_mensal: 85750,
                descricao: 'Plano de saúde empresarial com cobertura nacional'
              },
              {
                id: '2',
                nome: 'Vale Refeição',
                tipo: 'alimentacao',
                valor: 25,
                tipo_valor: 'fixo',
                fornecedor: 'Sodexo',
                status: 'ativo',
                data_inicio: '2020-01-01',
                colaboradores_ativos: 318,
                custo_mensal: 7950,
                descricao: 'Vale refeição diário para todos os colaboradores'
              },
              {
                id: '3',
                nome: 'Vale Transporte',
                tipo: 'transporte',
                valor: 6,
                tipo_valor: 'fixo',
                fornecedor: 'VR Benefícios',
                status: 'ativo',
                data_inicio: '2020-01-01',
                colaboradores_ativos: 280,
                custo_mensal: 1680,
                descricao: 'Vale transporte para colaboradores que utilizam transporte público'
              },
              {
                id: '4',
                nome: 'Gympass',
                tipo: 'lazer',
                valor: 89,
                tipo_valor: 'fixo',
                fornecedor: 'Gympass',
                status: 'ativo',
                data_inicio: '2021-06-01',
                colaboradores_ativos: 156,
                custo_mensal: 13884,
                descricao: 'Acesso a academias e atividades físicas'
              },
              {
                id: '5',
                nome: 'Auxílio Educação',
                tipo: 'educacao',
                valor: 500,
                tipo_valor: 'variavel',
                fornecedor: 'Interno',
                status: 'ativo',
                data_inicio: '2022-01-01',
                colaboradores_ativos: 45,
                custo_mensal: 22500,
                descricao: 'Auxílio para cursos e certificações'
              }
            ],
            folhaPagamento: [
              {
                id: '1',
                colaborador_id: '1',
                colaborador_nome: 'Ana Silva',
                mes: '3',
                ano: '2024',
                salario_base: 8500,
                beneficios: 1200,
                descontos: 850,
                salario_liquido: 8850,
                status: 'paga',
                data_pagamento: '2024-03-05'
              },
              {
                id: '2',
                colaborador_id: '2',
                colaborador_nome: 'João Santos',
                mes: '3',
                ano: '2024',
                salario_base: 6500,
                beneficios: 950,
                descontos: 650,
                salario_liquido: 6800,
                status: 'paga',
                data_pagamento: '2024-03-05'
              },
              {
                id: '3',
                colaborador_id: '3',
                colaborador_nome: 'Maria Costa',
                mes: '3',
                ano: '2024',
                salario_base: 5500,
                beneficios: 800,
                descontos: 550,
                salario_liquido: 5750,
                status: 'processada'
              }
            ],
            relatorioFinanceiro: {
              mes: '3',
              ano: '2024',
              total_folha: 1250000,
              total_beneficios: 145000,
              total_descontos: 125000,
              media_salario: 6500,
              colaboradores_ativos: 318,
              variacao_mes_anterior: 2.3
            }
          });
        }, 1500);
      });
      
      if (montadoRef.current) {
        setBeneficios(response.beneficios);
        setFolhaPagamento(response.folhaPagamento);
        setRelatorioFinanceiro(response.relatorioFinanceiro);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      if (montadoRef.current) {
        setErro('Falha ao carregar dados. Tente novamente.');
      }
    } finally {
      clearTimeout(timeoutId);
      if (montadoRef.current) {
        setCarregando(false);
      }
    }
  }, [montadoRef]);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  // Handlers
  const handleFiltroBeneficios = useCallback((campo: string, valor: any) => {
    setFiltrosBeneficios(prev => ({ ...prev, [campo]: valor }));
  }, []);

  const handleFiltroFolha = useCallback((campo: string, valor: any) => {
    setFiltrosFolha(prev => ({ ...prev, [campo]: valor }));
  }, []);

  const handleAbrirModalBeneficio = useCallback((beneficio: Beneficio | null, modo: 'criar' | 'editar' | 'visualizar') => {
    setModalBeneficio(beneficio);
    setModoModal(modo);
  }, []);

  const handleAbrirModalFolha = useCallback((folha: FolhaPagamento | null, modo: 'criar' | 'editar' | 'visualizar') => {
    setModalFolha(folha);
    setModoModal(modo);
  }, []);

  const handleSalvarBeneficio = useCallback(async (dados: Partial<Beneficio>) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success(
        modoModal === 'criar' 
          ? 'Benefício criado com sucesso' 
          : 'Benefício atualizado com sucesso'
      );
      
      setModalBeneficio(null);
      carregarDados();
      onAtualizarDados();
    } catch (error) {
      toast.error('Falha ao salvar benefício');
    }
  }, [modoModal, carregarDados, onAtualizarDados]);

  const handleSalvarFolha = useCallback(async (dados: Partial<FolhaPagamento>) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success(
        modoModal === 'criar' 
          ? 'Folha criada com sucesso' 
          : 'Folha atualizada com sucesso'
      );
      
      setModalFolha(null);
      carregarDados();
      onAtualizarDados();
    } catch (error) {
      toast.error('Falha ao salvar folha');
    }
  }, [modoModal, carregarDados, onAtualizarDados]);

  // Obter ícone por tipo de benefício
  const getIconeBeneficio = useCallback((tipo: string) => {
    const icones: Record<string, string> = {
      saude: 'Heart',
      alimentacao: 'Utensils',
      transporte: 'Car',
      educacao: 'GraduationCap',
      lazer: 'Gamepad2',
      outros: 'Gift'
    };
    return icones[tipo] || 'Circle';
  }, []);

  // Obter cor por tipo de benefício
  const getCorBeneficio = useCallback((tipo: string) => {
    const cores: Record<string, string> = {
      saude: 'text-red-600 bg-red-100',
      alimentacao: 'text-orange-600 bg-orange-100',
      transporte: 'text-blue-600 bg-blue-100',
      educacao: 'text-purple-600 bg-purple-100',
      lazer: 'text-green-600 bg-green-100',
      outros: 'text-gray-600 bg-gray-100'
    };
    return cores[tipo] || 'text-gray-600 bg-gray-100';
  }, []);

  // Calcular estatísticas
  const estatisticasBeneficios = useMemo(() => {
    const totalCusto = beneficios.reduce((acc, ben) => acc + ben.custo_mensal, 0);
    const totalColaboradores = beneficios.reduce((acc, ben) => acc + ben.colaboradores_ativos, 0);
    const beneficiosAtivos = beneficios.filter(ben => ben.status === 'ativo').length;
    
    return {
      totalCusto,
      totalColaboradores,
      beneficiosAtivos,
      mediaPorColaborador: totalColaboradores > 0 ? totalCusto / totalColaboradores : 0
    };
  }, [beneficios]);

  if (carregando) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg animate-pulse"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-96 bg-gray-200 rounded-lg animate-pulse"></div>
          <div className="h-96 bg-gray-200 rounded-lg animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (erro) {
    return (
      <div className="bg-red-50 border border-red-200 p-6 rounded-lg text-center">
        <LucideIcons.AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-red-900 mb-2">Erro ao Carregar</h3>
        <p className="text-red-700 mb-6">{erro}</p>
        <Button onClick={carregarDados}>
          <LucideIcons.RefreshCw className="mr-2 h-4 w-4" />
          Tentar Novamente
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Benefícios e Folha de Pagamento</h2>
          <p className="text-gray-600">
            Gestão de benefícios e processamento de folha salarial
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button onClick={() => handleAbrirModalBeneficio(null, 'criar')}>
            <LucideIcons.Plus className="mr-2 h-4 w-4" />
            Novo Benefício
          </Button>
          <Button variant="outline" onClick={() => handleAbrirModalFolha(null, 'criar')}>
            <LucideIcons.FileText className="mr-2 h-4 w-4" />
            Processar Folha
          </Button>
        </div>
      </div>

      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Custo Total Benefícios</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatarMoeda(estatisticasBeneficios.totalCusto)}
                </p>
                <p className="text-xs text-green-600">Mensal</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <LucideIcons.DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Benefícios Ativos</p>
                <p className="text-2xl font-bold text-gray-900">
                  {estatisticasBeneficios.beneficiosAtivos}
                </p>
                <p className="text-xs text-blue-600">Programas</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <LucideIcons.Gift className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Colaboradores Beneficiados</p>
                <p className="text-2xl font-bold text-gray-900">
                  {estatisticasBeneficios.totalColaboradores}
                </p>
                <p className="text-xs text-purple-600">Ativos</p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <LucideIcons.Users className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Média por Colaborador</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatarMoeda(estatisticasBeneficios.mediaPorColaborador)}
                </p>
                <p className="text-xs text-orange-600">Mensal</p>
              </div>
              <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <LucideIcons.Calculator className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sistema de abas */}
      <Tabs value={abaSelecionada} onValueChange={setAbaSelecionada}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="beneficios" className="flex items-center gap-2">
            <LucideIcons.Gift className="h-4 w-4" />
            Benefícios
          </TabsTrigger>
          <TabsTrigger value="folha" className="flex items-center gap-2">
            <LucideIcons.FileText className="h-4 w-4" />
            Folha de Pagamento
          </TabsTrigger>
          <TabsTrigger value="relatorios" className="flex items-center gap-2">
            <LucideIcons.BarChart3 className="h-4 w-4" />
            Relatórios
          </TabsTrigger>
        </TabsList>

        {/* Aba de Benefícios */}
        <TabsContent value="beneficios" className="space-y-4">
          {/* Filtros */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <LucideIcons.Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar benefícios..."
                    value={filtrosBeneficios.termo}
                    onChange={e => handleFiltroBeneficios('termo', e.target.value)}
                    className="pl-9"
                  />
                </div>
                
                <Select
                  value={filtrosBeneficios.tipo}
                  onValueChange={valor => handleFiltroBeneficios('tipo', valor)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os Tipos</SelectItem>
                    <SelectItem value="saude">Saúde</SelectItem>
                    <SelectItem value="alimentacao">Alimentação</SelectItem>
                    <SelectItem value="transporte">Transporte</SelectItem>
                    <SelectItem value="educacao">Educação</SelectItem>
                    <SelectItem value="lazer">Lazer</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select
                  value={filtrosBeneficios.status}
                  onValueChange={valor => handleFiltroBeneficios('status', valor)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os Status</SelectItem>
                    <SelectItem value="ativo">Ativo</SelectItem>
                    <SelectItem value="inativo">Inativo</SelectItem>
                    <SelectItem value="suspenso">Suspenso</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button variant="outline" onClick={() => setFiltrosBeneficios({
                  termo: '',
                  tipo: 'todos',
                  status: 'todos',
                  fornecedor: 'todos'
                })}>
                  <LucideIcons.RefreshCw className="mr-2 h-4 w-4" />
                  Limpar
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Lista de benefícios */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {beneficios.map((beneficio) => {
              const IconeComponente = LucideIcons[getIconeBeneficio(beneficio.tipo) as keyof typeof LucideIcons] as any;
              const statusInfo = formatarStatusVisual(beneficio.status);
              
              return (
                <Card key={beneficio.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${getCorBeneficio(beneficio.tipo)}`}>
                        <IconeComponente className="h-5 w-5" />
                      </div>
                      <Badge variant={statusInfo.badge}>
                        {statusInfo.texto}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-3">
                    <div>
                      <h4 className="font-medium text-gray-900">{beneficio.nome}</h4>
                      <p className="text-sm text-gray-600">{beneficio.fornecedor}</p>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Valor:</span>
                        <span className="font-medium">
                          {beneficio.tipo_valor === 'percentual' ? `${beneficio.valor}%` : formatarMoeda(beneficio.valor)}
                        </span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-600">Colaboradores:</span>
                        <span className="font-medium">{beneficio.colaboradores_ativos}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-600">Custo Mensal:</span>
                        <span className="font-medium">{formatarMoeda(beneficio.custo_mensal)}</span>
                      </div>
                    </div>
                    
                    <div className="pt-3 border-t">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAbrirModalBeneficio(beneficio, 'visualizar')}
                          className="flex-1"
                        >
                          <LucideIcons.Eye className="h-3 w-3 mr-1" />
                          Ver Detalhes
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAbrirModalBeneficio(beneficio, 'editar')}
                        >
                          <LucideIcons.Edit className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Aba de Folha de Pagamento */}
        <TabsContent value="folha" className="space-y-4">
          {/* Filtros */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Select
                  value={filtrosFolha.mes.toString()}
                  onValueChange={valor => handleFiltroFolha('mes', parseInt(valor))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Mês" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(mes => (
                      <SelectItem key={mes} value={mes.toString()}>
                        {new Date(2024, mes - 1).toLocaleDateString('pt-BR', { month: 'long' })}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select
                  value={filtrosFolha.ano.toString()}
                  onValueChange={valor => handleFiltroFolha('ano', parseInt(valor))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Ano" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(ano => (
                      <SelectItem key={ano} value={ano.toString()}>
                        {ano}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select
                  value={filtrosFolha.status}
                  onValueChange={valor => handleFiltroFolha('status', valor)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os Status</SelectItem>
                    <SelectItem value="processada">Processada</SelectItem>
                    <SelectItem value="paga">Paga</SelectItem>
                    <SelectItem value="pendente">Pendente</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button variant="outline" onClick={() => setFiltrosFolha({
                  mes: new Date().getMonth() + 1,
                  ano: new Date().getFullYear(),
                  status: 'todos'
                })}>
                  <LucideIcons.RefreshCw className="mr-2 h-4 w-4" />
                  Limpar
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Lista de folha de pagamento */}
          <div className="space-y-4">
            {folhaPagamento.map((folha) => {
              const statusInfo = formatarStatusVisual(folha.status);
              
              return (
                <Card key={folha.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage />
                          <AvatarFallback>
                            {gerarIniciaisNome(folha.colaborador_nome)}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div>
                          <h4 className="font-medium text-gray-900">{folha.colaborador_nome}</h4>
                          <p className="text-sm text-gray-600">
                            {new Date(2024, parseInt(folha.mes) - 1).toLocaleDateString('pt-BR', { month: 'long' })}/{folha.ano}
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant={statusInfo.badge}>
                            {statusInfo.texto}
                          </Badge>
                        </div>
                        
                        <div className="text-sm space-y-1">
                          <div className="flex justify-between gap-4">
                            <span className="text-gray-600">Base:</span>
                            <span className="font-medium">{formatarMoeda(folha.salario_base)}</span>
                          </div>
                          <div className="flex justify-between gap-4">
                            <span className="text-gray-600">Benefícios:</span>
                            <span className="font-medium text-green-600">+{formatarMoeda(folha.beneficios)}</span>
                          </div>
                          <div className="flex justify-between gap-4">
                            <span className="text-gray-600">Descontos:</span>
                            <span className="font-medium text-red-600">-{formatarMoeda(folha.descontos)}</span>
                          </div>
                          <div className="flex justify-between gap-4 border-t pt-1">
                            <span className="text-gray-900 font-medium">Líquido:</span>
                            <span className="font-bold text-gray-900">{formatarMoeda(folha.salario_liquido)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 mt-4 pt-4 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAbrirModalFolha(folha, 'visualizar')}
                        className="flex-1"
                      >
                        <LucideIcons.Eye className="h-3 w-3 mr-1" />
                        Ver Detalhes
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAbrirModalFolha(folha, 'editar')}
                      >
                        <LucideIcons.Edit className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Aba de Relatórios */}
        <TabsContent value="relatorios" className="space-y-4">
          {relatorioFinanceiro && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Resumo Financeiro */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <LucideIcons.DollarSign className="h-5 w-5 text-green-600" />
                    Resumo Financeiro
                  </CardTitle>
                  <CardDescription>
                    {new Date(2024, parseInt(relatorioFinanceiro.mes) - 1).toLocaleDateString('pt-BR', { month: 'long' })}/{relatorioFinanceiro.ano}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">
                        {formatarMoeda(relatorioFinanceiro.total_folha)}
                      </p>
                      <p className="text-sm text-gray-600">Total Folha</p>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">
                        {formatarMoeda(relatorioFinanceiro.total_beneficios)}
                      </p>
                      <p className="text-sm text-gray-600">Total Benefícios</p>
                    </div>
                    <div className="text-center p-4 bg-red-50 rounded-lg">
                      <p className="text-2xl font-bold text-red-600">
                        {formatarMoeda(relatorioFinanceiro.total_descontos)}
                      </p>
                      <p className="text-sm text-gray-600">Total Descontos</p>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <p className="text-2xl font-bold text-purple-600">
                        {formatarMoeda(relatorioFinanceiro.media_salario)}
                      </p>
                      <p className="text-sm text-gray-600">Média Salarial</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span>Variação vs mês anterior:</span>
                    <Badge variant={relatorioFinanceiro.variacao_mes_anterior >= 0 ? 'default' : 'destructive'}>
                      {relatorioFinanceiro.variacao_mes_anterior >= 0 ? '+' : ''}{relatorioFinanceiro.variacao_mes_anterior}%
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Distribuição de Benefícios */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <LucideIcons.PieChart className="h-5 w-5 text-blue-600" />
                    Distribuição de Benefícios
                  </CardTitle>
                  <CardDescription>
                    Custo por tipo de benefício
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {beneficios.map((beneficio) => {
                      const percentual = (beneficio.custo_mensal / estatisticasBeneficios.totalCusto) * 100;
                      return (
                        <div key={beneficio.id} className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-medium">{beneficio.nome}</span>
                            <span className="text-gray-600">{formatarMoeda(beneficio.custo_mensal)}</span>
                          </div>
                          <Progress value={percentual} className="h-2" />
                          <p className="text-xs text-gray-500">{percentual.toFixed(1)}% do total</p>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Modal de Benefício */}
      {modalBeneficio && (
        <Dialog open={true} onOpenChange={() => setModalBeneficio(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {modoModal === 'criar' ? 'Novo Benefício' :
                 modoModal === 'editar' ? 'Editar Benefício' : modalBeneficio.nome}
              </DialogTitle>
              <DialogDescription>
                {modoModal === 'criar' ? 'Preencha os dados do novo benefício' :
                 modoModal === 'editar' ? 'Atualize os dados do benefício' : 'Detalhes completos do benefício'}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Nome</Label>
                  <p className="text-gray-700">{modalBeneficio.nome}</p>
                </div>
                <div>
                  <Label>Fornecedor</Label>
                  <p className="text-gray-700">{modalBeneficio.fornecedor}</p>
                </div>
                <div>
                  <Label>Valor</Label>
                  <p className="text-gray-700">
                    {modalBeneficio.tipo_valor === 'percentual' ? `${modalBeneficio.valor}%` : formatarMoeda(modalBeneficio.valor)}
                  </p>
                </div>
                <div>
                  <Label>Status</Label>
                  <Badge variant={formatarStatusVisual(modalBeneficio.status).badge}>
                    {formatarStatusVisual(modalBeneficio.status).texto}
                  </Badge>
                </div>
                <div>
                  <Label>Colaboradores Ativos</Label>
                  <p className="text-gray-700">{modalBeneficio.colaboradores_ativos}</p>
                </div>
                <div>
                  <Label>Custo Mensal</Label>
                  <p className="text-gray-700">{formatarMoeda(modalBeneficio.custo_mensal)}</p>
                </div>
              </div>
              
              <div>
                <Label>Descrição</Label>
                <p className="text-gray-700 mt-1">{modalBeneficio.descricao}</p>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setModalBeneficio(null)}>
                Fechar
              </Button>
              {modoModal !== 'visualizar' && (
                <Button onClick={() => handleSalvarBeneficio(modalBeneficio)}>
                  {modoModal === 'criar' ? 'Criar' : 'Salvar'}
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Modal de Folha */}
      {modalFolha && (
        <Dialog open={true} onOpenChange={() => setModalFolha(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {modoModal === 'criar' ? 'Nova Folha' :
                 modoModal === 'editar' ? 'Editar Folha' : `Folha - ${modalFolha.colaborador_nome}`}
              </DialogTitle>
              <DialogDescription>
                {modoModal === 'criar' ? 'Preencha os dados da nova folha' :
                 modoModal === 'editar' ? 'Atualize os dados da folha' : 'Detalhes completos da folha'}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Colaborador</Label>
                  <p className="text-gray-700">{modalFolha.colaborador_nome}</p>
                </div>
                <div>
                  <Label>Período</Label>
                  <p className="text-gray-700">
                    {new Date(2024, parseInt(modalFolha.mes) - 1).toLocaleDateString('pt-BR', { month: 'long' })}/{modalFolha.ano}
                  </p>
                </div>
                <div>
                  <Label>Salário Base</Label>
                  <p className="text-gray-700">{formatarMoeda(modalFolha.salario_base)}</p>
                </div>
                <div>
                  <Label>Status</Label>
                  <Badge variant={formatarStatusVisual(modalFolha.status).badge}>
                    {formatarStatusVisual(modalFolha.status).texto}
                  </Badge>
                </div>
                <div>
                  <Label>Benefícios</Label>
                  <p className="text-green-600 font-medium">+{formatarMoeda(modalFolha.beneficios)}</p>
                </div>
                <div>
                  <Label>Descontos</Label>
                  <p className="text-red-600 font-medium">-{formatarMoeda(modalFolha.descontos)}</p>
                </div>
                <div className="col-span-2">
                  <Label>Salário Líquido</Label>
                  <p className="text-2xl font-bold text-gray-900">{formatarMoeda(modalFolha.salario_liquido)}</p>
                </div>
              </div>
              
              {modalFolha.observacoes && (
                <div>
                  <Label>Observações</Label>
                  <p className="text-gray-700 mt-1">{modalFolha.observacoes}</p>
                </div>
              )}
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setModalFolha(null)}>
                Fechar
              </Button>
              {modoModal !== 'visualizar' && (
                <Button onClick={() => handleSalvarFolha(modalFolha)}>
                  {modoModal === 'criar' ? 'Criar' : 'Salvar'}
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
} 