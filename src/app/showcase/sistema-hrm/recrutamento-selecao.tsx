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
import { formatarStatusVisual } from '@/lib/utils-defensivas'
import { useMounted } from '@/hooks/use-mounted'

interface RecrutamentoSelecaoProps {
  dadosGlobais: any;
  onAtualizarDados: () => void;
}

interface Vaga {
  id: string;
  titulo: string;
  departamento: string;
  tipo: 'interna' | 'externa' | 'estagio' | 'temporaria';
  status: 'aberta' | 'em_analise' | 'fechada' | 'cancelada';
  candidatos: number;
  data_abertura: string;
  data_fechamento?: string;
  salario_min: number;
  salario_max: number;
  requisitos: string[];
  responsabilidades: string[];
  beneficios: string[];
  prioridade: 'baixa' | 'media' | 'alta' | 'critica';
  recrutador: string;
}

interface Candidato {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  vaga_id: string;
  status: 'candidatura' | 'triagem' | 'entrevista_rh' | 'entrevista_tecnica' | 'teste' | 'aprovado' | 'rejeitado' | 'contratado';
  data_candidatura: string;
  cv_url?: string;
  linkedin?: string;
  portfolio?: string;
  experiencia_anos: number;
  ultima_empresa?: string;
  salario_pretendido: number;
  disponibilidade: 'imediata' | '15_dias' | '30_dias' | '60_dias';
  observacoes?: string;
  avatar?: string;
  avaliacoes: {
    rh: number;
    tecnica: number;
    cultural: number;
  };
}

export default function RecrutamentoSelecao({ dadosGlobais, onAtualizarDados }: RecrutamentoSelecaoProps) {
  // Estados principais
  const [vagas, setVagas] = useState<Vaga[]>([]);
  const [candidatos, setCandidatos] = useState<Candidato[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [abaSelecionada, setAbaSelecionada] = useState('vagas');
  
  // Estados de filtros
  const [filtrosVagas, setFiltrosVagas] = useState({
    termo: '',
    departamento: 'todos',
    status: 'todos',
    tipo: 'todos',
    prioridade: 'todos'
  });
  
  const [filtrosCandidatos, setFiltrosCandidatos] = useState({
    termo: '',
    vaga: 'todas',
    status: 'todos'
  });
  
  // Estados de modais
  const [modalVaga, setModalVaga] = useState<Vaga | null>(null);
  const [modalCandidato, setModalCandidato] = useState<Candidato | null>(null);
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
      const response = await new Promise<{ vagas: Vaga[]; candidatos: Candidato[] }>((resolve) => {
        setTimeout(() => {
          resolve({
            vagas: [
              {
                id: '1',
                titulo: 'Desenvolvedor Full Stack Senior',
                departamento: 'Tecnologia',
                tipo: 'externa',
                status: 'aberta',
                candidatos: 12,
                data_abertura: '2024-01-15',
                salario_min: 8000,
                salario_max: 12000,
                requisitos: ['React', 'Node.js', 'TypeScript', '5+ anos experiência'],
                responsabilidades: ['Desenvolvimento de features', 'Code review', 'Mentoria'],
                beneficios: ['Plano de Saúde', 'Vale Refeição', 'Gympass'],
                prioridade: 'alta',
                recrutador: 'Ana Silva'
              },
              {
                id: '2',
                titulo: 'Designer UX/UI Pleno',
                departamento: 'Design',
                tipo: 'externa',
                status: 'em_analise',
                candidatos: 8,
                data_abertura: '2024-01-10',
                data_fechamento: '2024-02-10',
                salario_min: 5000,
                salario_max: 7000,
                requisitos: ['Figma', 'Adobe Creative Suite', '3+ anos experiência'],
                responsabilidades: ['Design de interfaces', 'Prototipagem', 'User Research'],
                beneficios: ['Plano de Saúde', 'Vale Refeição'],
                prioridade: 'media',
                recrutador: 'João Santos'
              },
              {
                id: '3',
                titulo: 'Estagiário de Marketing',
                departamento: 'Marketing',
                tipo: 'estagio',
                status: 'aberta',
                candidatos: 25,
                data_abertura: '2024-01-20',
                salario_min: 1200,
                salario_max: 1500,
                requisitos: ['Cursando Marketing', 'Conhecimento em redes sociais'],
                responsabilidades: ['Gestão de redes sociais', 'Suporte em campanhas'],
                beneficios: ['Vale Refeição', 'Vale Transporte'],
                prioridade: 'baixa',
                recrutador: 'Maria Costa'
              }
            ],
            candidatos: [
              {
                id: '1',
                nome: 'Carlos Ferreira',
                email: 'carlos.ferreira@email.com',
                telefone: '(11) 99999-9999',
                vaga_id: '1',
                status: 'entrevista_tecnica',
                data_candidatura: '2024-01-16',
                experiencia_anos: 6,
                ultima_empresa: 'TechCorp',
                salario_pretendido: 10000,
                disponibilidade: '30_dias',
                linkedin: 'linkedin.com/in/carlos-ferreira',
                portfolio: 'carlosferreira.dev',
                avaliacoes: {
                  rh: 4.5,
                  tecnica: 4.8,
                  cultural: 4.2
                }
              },
              {
                id: '2',
                nome: 'Fernanda Lima',
                email: 'fernanda.lima@email.com',
                telefone: '(11) 88888-8888',
                vaga_id: '2',
                status: 'aprovado',
                data_candidatura: '2024-01-12',
                experiencia_anos: 4,
                ultima_empresa: 'DesignStudio',
                salario_pretendido: 6500,
                disponibilidade: 'imediata',
                linkedin: 'linkedin.com/in/fernanda-lima',
                avaliacoes: {
                  rh: 4.8,
                  tecnica: 4.6,
                  cultural: 4.9
                }
              },
              {
                id: '3',
                nome: 'Roberto Almeida',
                email: 'roberto.almeida@email.com',
                telefone: '(11) 77777-7777',
                vaga_id: '3',
                status: 'candidatura',
                data_candidatura: '2024-01-22',
                experiencia_anos: 0,
                salario_pretendido: 1200,
                disponibilidade: 'imediata',
                observacoes: 'Estudante do 3º ano de Marketing',
                avaliacoes: {
                  rh: 0,
                  tecnica: 0,
                  cultural: 0
                }
              }
            ]
          });
        }, 1500);
      });
      
      if (montadoRef.current) {
        setVagas(response.vagas);
        setCandidatos(response.candidatos);
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
  const handleFiltroVagas = useCallback((campo: string, valor: any) => {
    setFiltrosVagas(prev => ({ ...prev, [campo]: valor }));
  }, []);

  const handleFiltroCandidatos = useCallback((campo: string, valor: any) => {
    setFiltrosCandidatos(prev => ({ ...prev, [campo]: valor }));
  }, []);

  const handleAbrirModalVaga = useCallback((vaga: Vaga | null, modo: 'criar' | 'editar' | 'visualizar') => {
    setModalVaga(vaga);
    setModoModal(modo);
  }, []);

  const handleAbrirModalCandidato = useCallback((candidato: Candidato | null, modo: 'criar' | 'editar' | 'visualizar') => {
    setModalCandidato(candidato);
    setModoModal(modo);
  }, []);

  const handleSalvarVaga = useCallback(async (dados: Partial<Vaga>) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success(
        modoModal === 'criar' 
          ? 'Vaga criada com sucesso' 
          : 'Vaga atualizada com sucesso'
      );
      
      setModalVaga(null);
      carregarDados();
      onAtualizarDados();
    } catch (error) {
      toast.error('Falha ao salvar vaga');
    }
  }, [modoModal, carregarDados, onAtualizarDados]);

  const handleSalvarCandidato = useCallback(async (dados: Partial<Candidato>) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success(
        modoModal === 'criar' 
          ? 'Candidato cadastrado com sucesso' 
          : 'Candidato atualizado com sucesso'
      );
      
      setModalCandidato(null);
      carregarDados();
      onAtualizarDados();
    } catch (error) {
      toast.error('Falha ao salvar candidato');
    }
  }, [modoModal, carregarDados, onAtualizarDados]);

  // Obter status visual
  const getStatusVaga = useCallback((status: string) => {
    const statusInfo = formatarStatusVisual(status);
    return statusInfo;
  }, []);

  const getStatusCandidato = useCallback((status: string) => {
    const statusMap: Record<string, { texto: string; cor: string; badge: any }> = {
      candidatura: { texto: 'Candidatura', cor: 'text-blue-600', badge: 'default' },
      triagem: { texto: 'Em Triagem', cor: 'text-yellow-600', badge: 'secondary' },
      entrevista_rh: { texto: 'Entrevista RH', cor: 'text-purple-600', badge: 'outline' },
      entrevista_tecnica: { texto: 'Entrevista Técnica', cor: 'text-orange-600', badge: 'outline' },
      teste: { texto: 'Teste', cor: 'text-indigo-600', badge: 'outline' },
      aprovado: { texto: 'Aprovado', cor: 'text-green-600', badge: 'default' },
      rejeitado: { texto: 'Rejeitado', cor: 'text-red-600', badge: 'destructive' },
      contratado: { texto: 'Contratado', cor: 'text-green-700', badge: 'default' }
    };
    return statusMap[status] || { texto: status, cor: 'text-gray-600', badge: 'outline' };
  }, []);

  // Calcular progresso do candidato
  const calcularProgressoCandidato = useCallback((status: string) => {
    const etapas = ['candidatura', 'triagem', 'entrevista_rh', 'entrevista_tecnica', 'teste', 'aprovado', 'contratado'];
    const etapaAtual = etapas.indexOf(status);
    return etapaAtual >= 0 ? ((etapaAtual + 1) / etapas.length) * 100 : 0;
  }, []);

  if (carregando) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 bg-gray-200 rounded-lg animate-pulse"></div>
          ))}
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
          <h2 className="text-xl font-semibold">Recrutamento e Seleção</h2>
          <p className="text-gray-600">
            {vagas.length} vagas ativas • {candidatos.length} candidatos em processo
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button onClick={() => handleAbrirModalVaga(null, 'criar')}>
            <LucideIcons.Plus className="mr-2 h-4 w-4" />
            Nova Vaga
          </Button>
          <Button variant="outline" onClick={() => handleAbrirModalCandidato(null, 'criar')}>
            <LucideIcons.UserPlus className="mr-2 h-4 w-4" />
            Novo Candidato
          </Button>
        </div>
      </div>

      {/* Sistema de abas */}
      <Tabs value={abaSelecionada} onValueChange={setAbaSelecionada}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="vagas" className="flex items-center gap-2">
            <LucideIcons.Briefcase className="h-4 w-4" />
            Vagas ({vagas.length})
          </TabsTrigger>
          <TabsTrigger value="candidatos" className="flex items-center gap-2">
            <LucideIcons.Users className="h-4 w-4" />
            Candidatos ({candidatos.length})
          </TabsTrigger>
        </TabsList>

        {/* Aba de Vagas */}
        <TabsContent value="vagas" className="space-y-4">
          {/* Filtros */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="relative">
                  <LucideIcons.Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar vagas..."
                    value={filtrosVagas.termo}
                    onChange={e => handleFiltroVagas('termo', e.target.value)}
                    className="pl-9"
                  />
                </div>
                
                <Select
                  value={filtrosVagas.departamento}
                  onValueChange={valor => handleFiltroVagas('departamento', valor)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Departamento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os Departamentos</SelectItem>
                    <SelectItem value="tecnologia">Tecnologia</SelectItem>
                    <SelectItem value="design">Design</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select
                  value={filtrosVagas.status}
                  onValueChange={valor => handleFiltroVagas('status', valor)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os Status</SelectItem>
                    <SelectItem value="aberta">Aberta</SelectItem>
                    <SelectItem value="em_analise">Em Análise</SelectItem>
                    <SelectItem value="fechada">Fechada</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select
                  value={filtrosVagas.tipo}
                  onValueChange={valor => handleFiltroVagas('tipo', valor)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os Tipos</SelectItem>
                    <SelectItem value="interna">Interna</SelectItem>
                    <SelectItem value="externa">Externa</SelectItem>
                    <SelectItem value="estagio">Estágio</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button variant="outline" onClick={() => setFiltrosVagas({
                  termo: '',
                  departamento: 'todos',
                  status: 'todos',
                  tipo: 'todos',
                  prioridade: 'todos'
                })}>
                  <LucideIcons.RefreshCw className="mr-2 h-4 w-4" />
                  Limpar
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Lista de vagas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {vagas.map((vaga) => {
              const statusInfo = getStatusVaga(vaga.status);
              return (
                <Card key={vaga.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{vaga.titulo}</CardTitle>
                        <CardDescription>{vaga.departamento}</CardDescription>
                      </div>
                      <Badge variant={statusInfo.badge}>
                        {statusInfo.texto}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Candidatos:</span>
                      <span className="font-medium">{vaga.candidatos}</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Salário:</span>
                      <span className="font-medium">
                        R$ {vaga.salario_min.toLocaleString()} - {vaga.salario_max.toLocaleString()}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Prioridade:</span>
                      <Badge variant="outline" className="text-xs">
                        {vaga.prioridade.toUpperCase()}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Recrutador:</span>
                      <span className="font-medium">{vaga.recrutador}</span>
                    </div>
                    
                    <div className="pt-3 border-t">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAbrirModalVaga(vaga, 'visualizar')}
                          className="flex-1"
                        >
                          <LucideIcons.Eye className="h-3 w-3 mr-1" />
                          Ver Detalhes
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAbrirModalVaga(vaga, 'editar')}
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

        {/* Aba de Candidatos */}
        <TabsContent value="candidatos" className="space-y-4">
          {/* Filtros */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <LucideIcons.Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar candidatos..."
                    value={filtrosCandidatos.termo}
                    onChange={e => handleFiltroCandidatos('termo', e.target.value)}
                    className="pl-9"
                  />
                </div>
                
                <Select
                  value={filtrosCandidatos.vaga}
                  onValueChange={valor => handleFiltroCandidatos('vaga', valor)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Vaga" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todas">Todas as Vagas</SelectItem>
                    {vagas.map(vaga => (
                      <SelectItem key={vaga.id} value={vaga.id}>
                        {vaga.titulo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select
                  value={filtrosCandidatos.status}
                  onValueChange={valor => handleFiltroCandidatos('status', valor)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os Status</SelectItem>
                    <SelectItem value="candidatura">Candidatura</SelectItem>
                    <SelectItem value="triagem">Em Triagem</SelectItem>
                    <SelectItem value="entrevista_rh">Entrevista RH</SelectItem>
                    <SelectItem value="entrevista_tecnica">Entrevista Técnica</SelectItem>
                    <SelectItem value="teste">Teste</SelectItem>
                    <SelectItem value="aprovado">Aprovado</SelectItem>
                    <SelectItem value="rejeitado">Rejeitado</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button variant="outline" onClick={() => setFiltrosCandidatos({
                  termo: '',
                  vaga: 'todas',
                  status: 'todos'
                })}>
                  <LucideIcons.RefreshCw className="mr-2 h-4 w-4" />
                  Limpar
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Lista de candidatos */}
          <div className="space-y-4">
            {candidatos.map((candidato) => {
              const statusInfo = getStatusCandidato(candidato.status);
              const vaga = vagas.find(v => v.id === candidato.vaga_id);
              const progresso = calcularProgressoCandidato(candidato.status);
              
              return (
                <Card key={candidato.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={candidato.avatar || undefined} />
                        <AvatarFallback>
                          {gerarIniciaisNome(candidato.nome)}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-medium text-gray-900">{candidato.nome}</h4>
                            <p className="text-sm text-gray-600">{candidato.email}</p>
                            <p className="text-xs text-gray-500">{vaga?.titulo}</p>
                          </div>
                          
                          <Badge variant={statusInfo.badge}>
                            {statusInfo.texto}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                          <div>
                            <span className="text-gray-600">Experiência:</span>
                            <p className="font-medium">{candidato.experiencia_anos} anos</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Salário Pretendido:</span>
                            <p className="font-medium">R$ {candidato.salario_pretendido.toLocaleString()}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Disponibilidade:</span>
                            <p className="font-medium">{candidato.disponibilidade.replace('_', ' ')}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Candidatura:</span>
                            <p className="font-medium">{formatarDataContextual(candidato.data_candidatura, 'curta')}</p>
                          </div>
                        </div>
                        
                        {/* Progresso do processo */}
                        <div className="mb-3">
                          <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                            <span>Progresso do Processo</span>
                            <span>{Math.round(progresso)}%</span>
                          </div>
                          <Progress value={progresso} className="h-2" />
                        </div>
                        
                        {/* Avaliações se disponíveis */}
                        {candidato.avaliacoes && (
                          <div className="flex items-center gap-4 text-xs mb-3">
                            <span className="text-gray-600">Avaliações:</span>
                            <span>RH: {candidato.avaliacoes.rh}/5</span>
                            <span>Técnica: {candidato.avaliacoes.tecnica}/5</span>
                            <span>Cultural: {candidato.avaliacoes.cultural}/5</span>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAbrirModalCandidato(candidato, 'visualizar')}
                            className="flex-1"
                          >
                            <LucideIcons.Eye className="h-3 w-3 mr-1" />
                            Ver Detalhes
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAbrirModalCandidato(candidato, 'editar')}
                          >
                            <LucideIcons.Edit className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* Modal de Vaga */}
      {modalVaga && (
        <Dialog open={true} onOpenChange={() => setModalVaga(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {modoModal === 'criar' ? 'Nova Vaga' :
                 modoModal === 'editar' ? 'Editar Vaga' : modalVaga.titulo}
              </DialogTitle>
              <DialogDescription>
                {modoModal === 'criar' ? 'Preencha os dados da nova vaga' :
                 modoModal === 'editar' ? 'Atualize os dados da vaga' : 'Detalhes completos da vaga'}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Título</Label>
                  <p className="text-gray-700">{modalVaga.titulo}</p>
                </div>
                <div>
                  <Label>Departamento</Label>
                  <p className="text-gray-700">{modalVaga.departamento}</p>
                </div>
                <div>
                  <Label>Status</Label>
                  <Badge variant={getStatusVaga(modalVaga.status).badge}>
                    {getStatusVaga(modalVaga.status).texto}
                  </Badge>
                </div>
                <div>
                  <Label>Candidatos</Label>
                  <p className="text-gray-700">{modalVaga.candidatos}</p>
                </div>
                <div>
                  <Label>Salário</Label>
                  <p className="text-gray-700">
                    R$ {modalVaga.salario_min.toLocaleString()} - {modalVaga.salario_max.toLocaleString()}
                  </p>
                </div>
                <div>
                  <Label>Prioridade</Label>
                  <Badge variant="outline">{modalVaga.prioridade.toUpperCase()}</Badge>
                </div>
              </div>
              
              {modalVaga.requisitos && modalVaga.requisitos.length > 0 && (
                <div>
                  <Label>Requisitos</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {modalVaga.requisitos.map((req, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {req}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {modalVaga.beneficios && modalVaga.beneficios.length > 0 && (
                <div>
                  <Label>Benefícios</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {modalVaga.beneficios.map((ben, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {ben}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setModalVaga(null)}>
                Fechar
              </Button>
              {modoModal !== 'visualizar' && (
                <Button onClick={() => handleSalvarVaga(modalVaga)}>
                  {modoModal === 'criar' ? 'Criar' : 'Salvar'}
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Modal de Candidato */}
      {modalCandidato && (
        <Dialog open={true} onOpenChange={() => setModalCandidato(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {modoModal === 'criar' ? 'Novo Candidato' :
                 modoModal === 'editar' ? 'Editar Candidato' : modalCandidato.nome}
              </DialogTitle>
              <DialogDescription>
                {modoModal === 'criar' ? 'Preencha os dados do candidato' :
                 modoModal === 'editar' ? 'Atualize os dados do candidato' : 'Detalhes completos do candidato'}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={modalCandidato.avatar || undefined} />
                  <AvatarFallback className="text-lg">
                    {gerarIniciaisNome(modalCandidato.nome)}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <h3 className="text-lg font-medium">{modalCandidato.nome}</h3>
                  <p className="text-gray-600">{modalCandidato.email}</p>
                  <p className="text-sm text-gray-500">{modalCandidato.telefone}</p>
                </div>
                
                <Badge variant={getStatusCandidato(modalCandidato.status).badge}>
                  {getStatusCandidato(modalCandidato.status).texto}
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label>Experiência</Label>
                  <p className="text-gray-700">{modalCandidato.experiencia_anos} anos</p>
                </div>
                <div>
                  <Label>Última Empresa</Label>
                  <p className="text-gray-700">{modalCandidato.ultima_empresa || '-'}</p>
                </div>
                <div>
                  <Label>Salário Pretendido</Label>
                  <p className="text-gray-700">R$ {modalCandidato.salario_pretendido.toLocaleString()}</p>
                </div>
                <div>
                  <Label>Disponibilidade</Label>
                  <p className="text-gray-700">{modalCandidato.disponibilidade.replace('_', ' ')}</p>
                </div>
                <div>
                  <Label>Data de Candidatura</Label>
                  <p className="text-gray-700">{formatarDataContextual(modalCandidato.data_candidatura, 'longa')}</p>
                </div>
                <div>
                  <Label>Vaga</Label>
                  <p className="text-gray-700">{vagas.find(v => v.id === modalCandidato.vaga_id)?.titulo}</p>
                </div>
              </div>
              
              {modalCandidato.avaliacoes && (
                <div>
                  <Label>Avaliações</Label>
                  <div className="grid grid-cols-3 gap-4 mt-2">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">{modalCandidato.avaliacoes.rh}</p>
                      <p className="text-xs text-gray-600">RH</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">{modalCandidato.avaliacoes.tecnica}</p>
                      <p className="text-xs text-gray-600">Técnica</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-2xl font-bold text-purple-600">{modalCandidato.avaliacoes.cultural}</p>
                      <p className="text-xs text-gray-600">Cultural</p>
                    </div>
                  </div>
                </div>
              )}
              
              {modalCandidato.observacoes && (
                <div>
                  <Label>Observações</Label>
                  <p className="text-gray-700 mt-1">{modalCandidato.observacoes}</p>
                </div>
              )}
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setModalCandidato(null)}>
                Fechar
              </Button>
              {modoModal !== 'visualizar' && (
                <Button onClick={() => handleSalvarCandidato(modalCandidato)}>
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