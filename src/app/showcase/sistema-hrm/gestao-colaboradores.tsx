'use client'

import React, { useState, useRef, useCallback, useEffect, useMemo, Fragment } from 'react'
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
import { gerarIniciaisNome, formatarDataContextual } from '@/lib/utils'
import { formatarMoeda, formatarStatusVisual } from '@/lib/utils-defensivas'
import { useMounted } from '@/hooks/use-mounted'

interface GestaoColaboradoresProps {
  dadosGlobais: any;
  onAtualizarDados: () => void;
}

interface Colaborador {
  id: string;
  nome: string;
  email: string;
  cargo: string;
  departamento: string;
  data_admissao: string;
  salario: number;
  status: 'ativo' | 'inativo' | 'ferias' | 'licenca' | 'demitido';
  tipo_contrato: 'clt' | 'pj' | 'estagiario' | 'temporario';
  nivel_hierarquico: 'junior' | 'pleno' | 'senior' | 'lider' | 'gerente' | 'diretor';
  avatar?: string;
  telefone: string;
  endereco: string;
  dependentes: number;
  beneficios: string[];
  ultima_avaliacao?: string;
  proxima_avaliacao?: string;
}

export default function GestaoColaboradores({ dadosGlobais, onAtualizarDados }: GestaoColaboradoresProps) {
  // Estados principais
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [pagina, setPagina] = useState(1);
  const [itensPorPagina, setItensPorPagina] = useState(10);
  const [totalItens, setTotalItens] = useState(0);
  
  // Estados de filtros
  const [filtros, setFiltros] = useState({
    termo: '',
    departamento: 'todos',
    status: 'todos',
    tipo_contrato: 'todos',
    nivel_hierarquico: 'todos'
  });
  
  // Estados de seleção e ações
  const [selecionados, setSelecionados] = useState<string[]>([]);
  const [modalAcaoLote, setModalAcaoLote] = useState<string | null>(null);
  const [modalColaborador, setModalColaborador] = useState<Colaborador | null>(null);
  const [modoModal, setModoModal] = useState<'criar' | 'editar' | 'visualizar'>('visualizar');
  
  // Estados de visualização
  const [visualizacao, setVisualizacao] = useState<'lista' | 'cards' | 'tabela'>('cards');
  const [ordenacao, setOrdenacao] = useState({ campo: 'nome', direcao: 'asc' });
  
  const montadoRef = useMounted();

  // Carregar colaboradores
  const carregarColaboradores = useCallback(async () => {
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
      // Simulação de API - dados de colaboradores
      const response = await new Promise<{ colaboradores: Colaborador[]; total: number }>((resolve) => {
        setTimeout(() => {
          resolve({
            colaboradores: [
              {
                id: '1',
                nome: 'Ana Silva',
                email: 'ana.silva@empresa.com',
                cargo: 'Gerente de RH',
                departamento: 'Recursos Humanos',
                data_admissao: '2020-03-15',
                salario: 8500,
                status: 'ativo',
                tipo_contrato: 'clt',
                nivel_hierarquico: 'gerente',
                telefone: '(11) 99999-9999',
                endereco: 'São Paulo, SP',
                dependentes: 2,
                beneficios: ['Vale Refeição', 'Plano de Saúde', 'Vale Transporte'],
                ultima_avaliacao: '2024-01-15',
                proxima_avaliacao: '2024-07-15'
              },
              {
                id: '2',
                nome: 'João Santos',
                email: 'joao.santos@empresa.com',
                cargo: 'Desenvolvedor Full Stack',
                departamento: 'Tecnologia',
                data_admissao: '2021-08-20',
                salario: 6500,
                status: 'ativo',
                tipo_contrato: 'clt',
                nivel_hierarquico: 'pleno',
                telefone: '(11) 88888-8888',
                endereco: 'São Paulo, SP',
                dependentes: 1,
                beneficios: ['Vale Refeição', 'Plano de Saúde', 'Gympass'],
                ultima_avaliacao: '2024-02-10',
                proxima_avaliacao: '2024-08-10'
              },
              {
                id: '3',
                nome: 'Maria Costa',
                email: 'maria.costa@empresa.com',
                cargo: 'Designer UX/UI',
                departamento: 'Design',
                data_admissao: '2022-01-10',
                salario: 5500,
                status: 'ferias',
                tipo_contrato: 'clt',
                nivel_hierarquico: 'junior',
                telefone: '(11) 77777-7777',
                endereco: 'São Paulo, SP',
                dependentes: 0,
                beneficios: ['Vale Refeição', 'Plano de Saúde'],
                ultima_avaliacao: '2024-01-20',
                proxima_avaliacao: '2024-07-20'
              },
              {
                id: '4',
                nome: 'Pedro Oliveira',
                email: 'pedro.oliveira@empresa.com',
                cargo: 'Analista de Marketing',
                departamento: 'Marketing',
                data_admissao: '2021-11-05',
                salario: 4800,
                status: 'ativo',
                tipo_contrato: 'pj',
                nivel_hierarquico: 'pleno',
                telefone: '(11) 66666-6666',
                endereco: 'São Paulo, SP',
                dependentes: 1,
                beneficios: ['Vale Refeição'],
                ultima_avaliacao: '2024-02-05',
                proxima_avaliacao: '2024-08-05'
              },
              {
                id: '5',
                nome: 'Carla Ferreira',
                email: 'carla.ferreira@empresa.com',
                cargo: 'Estagiária de Administração',
                departamento: 'Administrativo',
                data_admissao: '2024-01-15',
                salario: 1200,
                status: 'ativo',
                tipo_contrato: 'estagiario',
                nivel_hierarquico: 'junior',
                telefone: '(11) 55555-5555',
                endereco: 'São Paulo, SP',
                dependentes: 0,
                beneficios: ['Vale Refeição', 'Vale Transporte'],
                proxima_avaliacao: '2024-07-15'
              }
            ],
            total: 5
          });
        }, 1500);
      });
      
      if (montadoRef.current) {
        setColaboradores(response.colaboradores);
        setTotalItens(response.total);
      }
    } catch (error) {
      console.error('Erro ao carregar colaboradores:', error);
      if (montadoRef.current) {
        setErro('Falha ao carregar colaboradores. Tente novamente.');
      }
    } finally {
      clearTimeout(timeoutId);
      if (montadoRef.current) {
        setCarregando(false);
      }
    }
  }, [montadoRef]);

  useEffect(() => {
    carregarColaboradores();
  }, [carregarColaboradores]);

  // Cálculos derivados
  const totalPaginas = Math.ceil(totalItens / itensPorPagina);
  const temItens = colaboradores.length > 0;
  const temSelecao = selecionados.length > 0;
  const selecaoCompleta = temItens && selecionados.length === colaboradores.length;

  // Handlers
  const handleFiltroChange = useCallback((campo: string, valor: any) => {
    setFiltros(prev => ({ ...prev, [campo]: valor }));
    setPagina(1);
  }, []);

  const handleLimparFiltros = useCallback(() => {
    setFiltros({
      termo: '',
      departamento: 'todos',
      status: 'todos',
      tipo_contrato: 'todos',
      nivel_hierarquico: 'todos'
    });
    setPagina(1);
  }, []);

  const handleSelecionarTodos = useCallback(() => {
    if (selecaoCompleta) {
      setSelecionados([]);
    } else {
      setSelecionados(colaboradores.map(col => col.id));
    }
  }, [selecaoCompleta, colaboradores]);

  const handleSelecionarColaborador = useCallback((id: string) => {
    setSelecionados(prev => 
      prev.includes(id) 
        ? prev.filter(itemId => itemId !== id)
        : [...prev, id]
    );
  }, []);

  const handleAcaoLote = useCallback(async (acao: string) => {
    if (selecionados.length === 0) return;
    
    setModalAcaoLote(null);
    
    try {
      // Simulação de API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success(`${acao} executada com sucesso em ${selecionados.length} colaborador(es)`);
      setSelecionados([]);
      carregarColaboradores();
      onAtualizarDados();
    } catch (error) {
      toast.error(`Falha ao executar ${acao}`);
    }
  }, [selecionados, carregarColaboradores, onAtualizarDados]);

  const handleAbrirModal = useCallback((colaborador: Colaborador | null, modo: 'criar' | 'editar' | 'visualizar') => {
    setModalColaborador(colaborador);
    setModoModal(modo);
  }, []);

  const handleSalvarColaborador = useCallback(async (dados: Partial<Colaborador>) => {
    try {
      // Simulação de API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success(
        modoModal === 'criar' 
          ? 'Colaborador criado com sucesso' 
          : 'Colaborador atualizado com sucesso'
      );
      
      setModalColaborador(null);
      carregarColaboradores();
      onAtualizarDados();
    } catch (error) {
      toast.error('Falha ao salvar colaborador');
    }
  }, [modoModal, carregarColaboradores, onAtualizarDados]);

  // Renderizar card de colaborador
  const renderizarCardColaborador = useCallback((colaborador: Colaborador) => {
    const statusInfo = formatarStatusVisual(colaborador.status);
    const isSelecionado = selecionados.includes(colaborador.id);
    
    return (
      <Card key={colaborador.id} className={`hover:shadow-md transition-all ${
        isSelecionado ? 'ring-2 ring-blue-500' : ''
      }`}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Checkbox
              checked={isSelecionado}
              onCheckedChange={() => handleSelecionarColaborador(colaborador.id)}
              className="mt-1"
            />
            
            <Avatar className="h-12 w-12">
              <AvatarImage src={colaborador.avatar} />
              <AvatarFallback>
                {gerarIniciaisNome(colaborador.nome)}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-medium text-gray-900 truncate">{colaborador.nome}</h4>
                  <p className="text-sm text-gray-600">{colaborador.cargo}</p>
                  <p className="text-xs text-gray-500">{colaborador.departamento}</p>
                </div>
                
                <Badge variant={statusInfo.badge}>
                  {statusInfo.texto}
                </Badge>
              </div>
              
              <div className="space-y-1 text-sm text-gray-600">
                <p className="flex items-center gap-1">
                  <LucideIcons.Mail className="h-3 w-3" />
                  {colaborador.email}
                </p>
                <p className="flex items-center gap-1">
                  <LucideIcons.Phone className="h-3 w-3" />
                  {colaborador.telefone}
                </p>
                <p className="flex items-center gap-1">
                  <LucideIcons.Calendar className="h-3 w-3" />
                  Admissão: {formatarDataContextual(colaborador.data_admissao, 'curta')}
                </p>
                <p className="flex items-center gap-1">
                  <LucideIcons.DollarSign className="h-3 w-3" />
                  {formatarMoeda(colaborador.salario)}
                </p>
              </div>
              
              <div className="flex items-center gap-2 mt-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAbrirModal(colaborador, 'visualizar')}
                >
                  <LucideIcons.Eye className="h-3 w-3 mr-1" />
                  Ver
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAbrirModal(colaborador, 'editar')}
                >
                  <LucideIcons.Edit className="h-3 w-3 mr-1" />
                  Editar
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }, [selecionados, handleSelecionarColaborador, handleAbrirModal]);

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
        <Button onClick={carregarColaboradores}>
          <LucideIcons.RefreshCw className="mr-2 h-4 w-4" />
          Tentar Novamente
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com ações */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Gestão de Colaboradores</h2>
          <p className="text-gray-600">
            {totalItens} colaborador(es) cadastrado(s)
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {temSelecao && (
            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                {selecionados.length} selecionados
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setModalAcaoLote('ativar')}
              >
                <LucideIcons.CheckCircle className="h-4 w-4 mr-1" />
                Ativar
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setModalAcaoLote('inativar')}
              >
                <LucideIcons.XCircle className="h-4 w-4 mr-1" />
                Inativar
              </Button>
            </div>
          )}
          
          <div className="flex items-center gap-1 border rounded-lg p-1">
            <Button
              variant={visualizacao === 'cards' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setVisualizacao('cards')}
            >
              <LucideIcons.Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={visualizacao === 'lista' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setVisualizacao('lista')}
            >
              <LucideIcons.List className="h-4 w-4" />
            </Button>
            <Button
              variant={visualizacao === 'tabela' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setVisualizacao('tabela')}
            >
              <LucideIcons.Table className="h-4 w-4" />
            </Button>
          </div>
          
          <Button onClick={() => handleAbrirModal(null, 'criar')}>
            <LucideIcons.Plus className="mr-2 h-4 w-4" />
            Novo Colaborador
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <LucideIcons.Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar colaboradores..."
                value={filtros.termo}
                onChange={e => handleFiltroChange('termo', e.target.value)}
                className="pl-9"
              />
            </div>
            
            <Select
              value={filtros.departamento}
              onValueChange={valor => handleFiltroChange('departamento', valor)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Departamento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os Departamentos</SelectItem>
                <SelectItem value="tecnologia">Tecnologia</SelectItem>
                <SelectItem value="marketing">Marketing</SelectItem>
                <SelectItem value="rh">Recursos Humanos</SelectItem>
                <SelectItem value="administrativo">Administrativo</SelectItem>
              </SelectContent>
            </Select>
            
            <Select
              value={filtros.status}
              onValueChange={valor => handleFiltroChange('status', valor)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os Status</SelectItem>
                <SelectItem value="ativo">Ativo</SelectItem>
                <SelectItem value="inativo">Inativo</SelectItem>
                <SelectItem value="ferias">Férias</SelectItem>
                <SelectItem value="licenca">Licença</SelectItem>
              </SelectContent>
            </Select>
            
            <Select
              value={filtros.tipo_contrato}
              onValueChange={valor => handleFiltroChange('tipo_contrato', valor)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Tipo Contrato" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os Tipos</SelectItem>
                <SelectItem value="clt">CLT</SelectItem>
                <SelectItem value="pj">PJ</SelectItem>
                <SelectItem value="estagiario">Estagiário</SelectItem>
                <SelectItem value="temporario">Temporário</SelectItem>
              </SelectContent>
            </Select>
            
            <Button
              variant="outline"
              onClick={handleLimparFiltros}
              className="flex-1"
            >
              <LucideIcons.RefreshCw className="mr-2 h-4 w-4" />
              Limpar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de colaboradores */}
      {!temItens ? (
        <div className="text-center py-16">
          <LucideIcons.Users className="h-16 w-16 text-gray-300 mx-auto mb-6" />
          <h3 className="text-xl font-medium mb-2">Nenhum colaborador encontrado</h3>
          <p className="text-gray-500 max-w-md mx-auto mb-8">
            Não há colaboradores cadastrados que correspondam aos filtros aplicados.
          </p>
          <Button onClick={handleLimparFiltros} variant="outline">
            <LucideIcons.RefreshCw className="mr-2 h-4 w-4" />
            Limpar Filtros
          </Button>
        </div>
      ) : (
        <>
          {/* Checkbox seleção global */}
          <div className="flex items-center justify-between py-2 border-b">
            <div className="flex items-center gap-3">
              <Checkbox
                checked={selecaoCompleta}
                onCheckedChange={handleSelecionarTodos}
              />
              <span className="text-sm text-gray-600">
                Selecionar todos ({colaboradores.length} colaboradores)
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">
                Itens por página:
              </span>
              <Select
                value={itensPorPagina.toString()}
                onValueChange={(valor) => {
                  setItensPorPagina(Number(valor));
                  setPagina(1);
                }}
              >
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Renderização por tipo de visualização */}
          <div className={
            visualizacao === 'cards' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' :
            visualizacao === 'lista' ? 'space-y-2' :
            'overflow-x-auto'
          }>
            {colaboradores.map(renderizarCardColaborador)}
          </div>
        </>
      )}

      {/* Modal de ação em lote */}
      {modalAcaoLote && (
        <Dialog open={true} onOpenChange={() => setModalAcaoLote(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmar ação em lote</DialogTitle>
              <DialogDescription>
                Esta ação será aplicada a {selecionados.length} colaborador(es) selecionado(s). 
                Tem certeza que deseja continuar?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setModalAcaoLote(null)}>
                Cancelar
              </Button>
              <Button onClick={() => handleAcaoLote(modalAcaoLote)}>
                Confirmar {modalAcaoLote}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Modal de colaborador */}
      {modalColaborador !== null && (
        <Dialog open={true} onOpenChange={() => setModalColaborador(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {modoModal === 'criar' ? 'Novo Colaborador' :
                 modoModal === 'editar' ? 'Editar Colaborador' : 'Detalhes do Colaborador'}
              </DialogTitle>
              <DialogDescription>
                {modoModal === 'criar' ? 'Preencha os dados do novo colaborador' :
                 modoModal === 'editar' ? 'Atualize os dados do colaborador' : 'Informações completas do colaborador'}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={modalColaborador?.avatar} />
                  <AvatarFallback className="text-lg">
                    {gerarIniciaisNome(modalColaborador?.nome)}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <h3 className="text-lg font-medium">{modalColaborador?.nome || 'Novo Colaborador'}</h3>
                  <p className="text-gray-600">{modalColaborador?.cargo || 'Cargo'}</p>
                  <p className="text-sm text-gray-500">{modalColaborador?.departamento || 'Departamento'}</p>
                </div>
                
                {modalColaborador && (
                  <Badge variant={formatarStatusVisual(modalColaborador.status).badge}>
                    {formatarStatusVisual(modalColaborador.status).texto}
                  </Badge>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label>Email</Label>
                  <p className="text-gray-700">{modalColaborador?.email || '-'}</p>
                </div>
                <div>
                  <Label>Telefone</Label>
                  <p className="text-gray-700">{modalColaborador?.telefone || '-'}</p>
                </div>
                <div>
                  <Label>Data de Admissão</Label>
                  <p className="text-gray-700">
                    {modalColaborador?.data_admissao ? formatarDataContextual(modalColaborador.data_admissao, 'longa') : '-'}
                  </p>
                </div>
                <div>
                  <Label>Salário</Label>
                  <p className="text-gray-700">
                    {modalColaborador?.salario ? formatarMoeda(modalColaborador.salario) : '-'}
                  </p>
                </div>
                <div>
                  <Label>Tipo de Contrato</Label>
                  <p className="text-gray-700">{modalColaborador?.tipo_contrato?.toUpperCase() || '-'}</p>
                </div>
                <div>
                  <Label>Nível Hierárquico</Label>
                  <p className="text-gray-700">{modalColaborador?.nivel_hierarquico || '-'}</p>
                </div>
              </div>
              
              {modalColaborador?.beneficios && modalColaborador.beneficios.length > 0 && (
                <div>
                  <Label>Benefícios</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {modalColaborador.beneficios.map((beneficio, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {beneficio}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setModalColaborador(null)}>
                Fechar
              </Button>
              {modoModal !== 'visualizar' && (
                <Button onClick={() => handleSalvarColaborador(modalColaborador || {})}>
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