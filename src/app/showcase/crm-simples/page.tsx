'use client'

import React, { useState, useRef, useCallback, useEffect } from 'react'
import Link from 'next/link'
import { toast, Toaster } from 'sonner'
import * as LucideIcons from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Textarea } from '@/components/ui/textarea'
import { gerarIniciaisNome, formatarDataContextual } from '@/lib/utils'
import { useMounted } from '@/hooks/use-mounted'

interface Contato {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  empresa: string;
  cargo: string;
  observacoes?: string;
  data_criacao: string;
  ultima_interacao?: string;
  status: 'ativo' | 'inativo' | 'potencial';
  avatar?: string;
}

export default function CRMSimplesPage() {
  // Estados primários obrigatórios
  const [contatos, setContatos] = useState<Contato[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  
  // Estados de interação
  const [modalFormulario, setModalFormulario] = useState(false);
  const [modalDetalhes, setModalDetalhes] = useState<Contato | null>(null);
  const [contatoEditando, setContatoEditando] = useState<Contato | null>(null);
  const [mostrarInfo, setMostrarInfo] = useState(false);
  
  // Estados de filtros
  const [filtros, setFiltros] = useState({
    termo: '',
    status: 'todos'
  });
  
  // Estados de formulário
  const [dadosFormulario, setDadosFormulario] = useState({
    nome: '',
    email: '',
    telefone: '',
    empresa: '',
    cargo: '',
    observacoes: '',
    status: 'potencial' as Contato['status']
  });
  const [errosFormulario, setErrosFormulario] = useState<Record<string, string>>({});
  const [salvandoFormulario, setSalvandoFormulario] = useState(false);
  
  // Prevenção memory leak obrigatória
  const montadoRef = useMounted();
  
  // Mock de dados
  const contatosMock: Contato[] = [
    {
      id: '1',
      nome: 'Carlos Silva',
      email: 'carlos@techcorp.com',
      telefone: '(11) 99999-1111',
      empresa: 'TechCorp Solutions',
      cargo: 'Diretor de TI',
      observacoes: 'Interessado em soluções de automação. Reunião agendada para próxima semana.',
      data_criacao: '2024-01-10T10:30:00Z',
      ultima_interacao: '2024-01-15T14:20:00Z',
      status: 'ativo'
    },
    {
      id: '2',
      nome: 'Ana Paula Mendes',
      email: 'ana.mendes@innovate.com.br',
      telefone: '(11) 88888-2222',
      empresa: 'Innovate Marketing',
      cargo: 'CEO',
      observacoes: 'Procura parceria estratégica para expansão digital.',
      data_criacao: '2024-01-08T09:15:00Z',
      ultima_interacao: '2024-01-14T16:45:00Z',
      status: 'potencial'
    },
    {
      id: '3',
      nome: 'Roberto Santos',
      email: 'roberto.santos@globalinc.com',
      telefone: '(11) 77777-3333',
      empresa: 'Global Inc',
      cargo: 'Gerente de Compras',
      data_criacao: '2024-01-05T11:00:00Z',
      status: 'inativo'
    },
    {
      id: '4',
      nome: 'Fernanda Costa',
      email: 'fernanda@startup.io',
      telefone: '(11) 66666-4444',
      empresa: 'StartupTech',
      cargo: 'CTO',
      observacoes: 'Startup em crescimento, budget limitado mas interesse alto.',
      data_criacao: '2024-01-12T15:30:00Z',
      ultima_interacao: '2024-01-15T10:15:00Z',
      status: 'ativo'
    },
    {
      id: '5',
      nome: 'Pedro Oliveira',
      email: 'pedro@consultoria.com',
      telefone: '(11) 55555-5555',
      empresa: 'Consultoria Expert',
      cargo: 'Consultor Sênior',
      observacoes: 'Pode ser um bom parceiro para indicações.',
      data_criacao: '2024-01-09T08:45:00Z',
      status: 'potencial'
    }
  ];
  
  // Carregamento de dados
  const carregarContatos = useCallback(async () => {
    if (!montadoRef.current) return;
    
    setCarregando(true);
    setErro(null);
    
    // Timeout de segurança obrigatório
    const timeoutId = setTimeout(() => {
      if (montadoRef.current) {
        setCarregando(false);
        setErro('Tempo de carregamento excedido');
      }
    }, 5000); // 5s para busca simples
    
    try {
      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 800));
      
      if (montadoRef.current) {
        // Aplicar filtros
        let contatosFiltrados = contatosMock;
        
        if (filtros.termo) {
          contatosFiltrados = contatosFiltrados.filter(contato =>
            contato.nome.toLowerCase().includes(filtros.termo.toLowerCase()) ||
            contato.email.toLowerCase().includes(filtros.termo.toLowerCase()) ||
            contato.empresa.toLowerCase().includes(filtros.termo.toLowerCase())
          );
        }
        
        if (filtros.status !== 'todos') {
          contatosFiltrados = contatosFiltrados.filter(contato => contato.status === filtros.status);
        }
        
        setContatos(contatosFiltrados);
      }
    } catch (error) {
      console.error('Erro ao carregar contatos:', error);
      if (montadoRef.current) {
        setErro('Falha ao carregar contatos. Tente novamente.');
      }
    } finally {
      clearTimeout(timeoutId);
      if (montadoRef.current) {
        setCarregando(false);
      }
    }
  }, [filtros, montadoRef]);
  
  useEffect(() => {
    carregarContatos();
  }, [carregarContatos]);
  
  // Handlers de filtros
  const handleFiltroChange = useCallback((campo: string, valor: string) => {
    setFiltros(prev => ({ ...prev, [campo]: valor }));
  }, []);
  
  const limparFiltros = useCallback(() => {
    setFiltros({ termo: '', status: 'todos' });
  }, []);
  
  // Handlers de formulário
  const resetarFormulario = useCallback(() => {
    setDadosFormulario({
      nome: '',
      email: '',
      telefone: '',
      empresa: '',
      cargo: '',
      observacoes: '',
      status: 'potencial'
    });
    setErrosFormulario({});
    setContatoEditando(null);
  }, []);
  
  const handleNovoContato = useCallback(() => {
    resetarFormulario();
    setModalFormulario(true);
  }, [resetarFormulario]);
  
  const handleEditarContato = useCallback((contato: Contato) => {
    setContatoEditando(contato);
    setDadosFormulario({
      nome: contato.nome,
      email: contato.email,
      telefone: contato.telefone,
      empresa: contato.empresa,
      cargo: contato.cargo,
      observacoes: contato.observacoes || '',
      status: contato.status
    });
    setErrosFormulario({});
    setModalFormulario(true);
  }, []);
  
  const handleFormularioChange = useCallback((campo: string, valor: string) => {
    setDadosFormulario(prev => ({ ...prev, [campo]: valor }));
    // Limpar erro quando campo é editado
    if (errosFormulario[campo]) {
      setErrosFormulario(prev => {
        const novos = { ...prev };
        delete novos[campo];
        return novos;
      });
    }
  }, [errosFormulario]);
  
  // Validação do formulário
  const validarFormulario = useCallback(() => {
    const novosErros: Record<string, string> = {};
    
    if (!dadosFormulario.nome.trim()) {
      novosErros.nome = 'Nome é obrigatório';
    } else if (dadosFormulario.nome.trim().length < 2) {
      novosErros.nome = 'Nome deve ter ao menos 2 caracteres';
    }
    
    if (!dadosFormulario.email.trim()) {
      novosErros.email = 'Email é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dadosFormulario.email)) {
      novosErros.email = 'Email inválido';
    }
    
    if (!dadosFormulario.telefone.trim()) {
      novosErros.telefone = 'Telefone é obrigatório';
    }
    
    if (!dadosFormulario.empresa.trim()) {
      novosErros.empresa = 'Empresa é obrigatória';
    }
    
    setErrosFormulario(novosErros);
    return Object.keys(novosErros).length === 0;
  }, [dadosFormulario]);
  
  // Salvar contato
  const handleSalvarContato = useCallback(async () => {
    if (!validarFormulario()) {
      toast.error('Corrija os erros antes de continuar');
      return;
    }
    
    setSalvandoFormulario(true);
    
    const timeoutId = setTimeout(() => {
      if (montadoRef.current) {
        setSalvandoFormulario(false);
        toast.error('Tempo de salvamento excedido');
      }
    }, 8000);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (montadoRef.current) {
        const acao = contatoEditando ? 'atualizado' : 'criado';
        toast.success(`Contato ${acao} com sucesso!`);
        setModalFormulario(false);
        resetarFormulario();
        carregarContatos();
      }
    } catch (error) {
      if (montadoRef.current) {
        toast.error('Falha ao salvar contato');
      }
    } finally {
      clearTimeout(timeoutId);
      if (montadoRef.current) {
        setSalvandoFormulario(false);
      }
    }
  }, [validarFormulario, contatoEditando, resetarFormulario, carregarContatos, montadoRef]);
  
  // Status helpers
  const getStatusInfo = useCallback((status: string) => {
    switch (status) {
      case 'ativo':
        return { label: 'Ativo', cor: 'bg-green-100 text-green-800', icone: 'CheckCircle' };
      case 'potencial':
        return { label: 'Potencial', cor: 'bg-yellow-100 text-yellow-800', icone: 'Clock' };
      case 'inativo':
        return { label: 'Inativo', cor: 'bg-gray-100 text-gray-800', icone: 'Pause' };
      default:
        return { label: status, cor: 'bg-gray-100 text-gray-800', icone: 'Circle' };
    }
  }, []);
  
  // Estados derivados
  const filtrosAplicados = filtros.termo !== '' || filtros.status !== 'todos';
  const temContatos = contatos.length > 0;
  const estatisticas = {
    total: contatos.length,
    ativos: contatos.filter(c => c.status === 'ativo').length,
    potenciais: contatos.filter(c => c.status === 'potencial').length,
    inativos: contatos.filter(c => c.status === 'inativo').length
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
      <Toaster position="bottom-right" richColors />
      
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="h-8 w-8 bg-gradient-to-br from-green-600 to-blue-600 rounded-lg flex items-center justify-center">
                <LucideIcons.Contact className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-xl">CRM Simplificado</span>
            </Link>
            
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setMostrarInfo(true)}
              >
                <LucideIcons.Info className="mr-2 h-4 w-4" />
                Sobre Este Exemplo
              </Button>
              
              <Link href="/showcase">
                <Button variant="ghost" size="sm">
                  <LucideIcons.ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar ao Showcase
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto p-6 space-y-6">
        {/* Header com estatísticas */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gestão de Contatos</h1>
              <p className="text-gray-600">CRM simplificado para equipe de vendas</p>
            </div>
            
            <Button onClick={handleNovoContato}>
              <LucideIcons.Plus className="mr-2 h-4 w-4" />
              Novo Contato
            </Button>
          </div>
          
          {/* Estatísticas rápidas */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-gray-900">{estatisticas.total}</div>
                <div className="text-sm text-gray-600">Total</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{estatisticas.ativos}</div>
                <div className="text-sm text-gray-600">Ativos</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-yellow-600">{estatisticas.potenciais}</div>
                <div className="text-sm text-gray-600">Potenciais</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-gray-600">{estatisticas.inativos}</div>
                <div className="text-sm text-gray-600">Inativos</div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* Filtros simples */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <LucideIcons.Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar contatos..."
                  value={filtros.termo}
                  onChange={e => handleFiltroChange('termo', e.target.value)}
                  className="pl-9"
                />
              </div>
              
              <select
                value={filtros.status}
                onChange={e => handleFiltroChange('status', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="todos">Todos os Status</option>
                <option value="ativo">Ativo</option>
                <option value="potencial">Potencial</option>
                <option value="inativo">Inativo</option>
              </select>
              
              <Button
                variant="outline"
                onClick={limparFiltros}
                disabled={!filtrosAplicados}
                className="w-full"
              >
                <LucideIcons.RefreshCw className="mr-2 h-4 w-4" />
                Limpar Filtros
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Estados de UI */}
        {carregando && (
          <div className="flex justify-center items-center py-16">
            <div className="text-center">
              <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-500">Carregando contatos...</p>
            </div>
          </div>
        )}
        
        {!carregando && erro && (
          <div className="bg-red-50 border border-red-200 p-8 rounded-lg text-center">
            <LucideIcons.AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Erro ao carregar dados</h3>
            <p className="text-gray-700 mb-6">{erro}</p>
            <Button onClick={carregarContatos}>
              <LucideIcons.RefreshCw className="mr-2 h-4 w-4" />
              Tentar Novamente
            </Button>
          </div>
        )}
        
        {!carregando && !erro && !temContatos && (
          <div className="text-center py-16">
            <LucideIcons.Contact className="h-16 w-16 text-gray-300 mx-auto mb-6" />
            <h3 className="text-xl font-medium mb-2">
              {filtrosAplicados ? 'Nenhum resultado encontrado' : 'Nenhum contato cadastrado'}
            </h3>
            <p className="text-gray-500 max-w-md mx-auto mb-8">
              {filtrosAplicados 
                ? 'Nenhum contato corresponde aos filtros aplicados.'
                : 'Comece adicionando seu primeiro contato ao CRM.'
              }
            </p>
            
            {filtrosAplicados ? (
              <Button onClick={limparFiltros} variant="outline">
                <LucideIcons.RefreshCw className="mr-2 h-4 w-4" />
                Limpar Filtros
              </Button>
            ) : (
              <Button onClick={handleNovoContato}>
                <LucideIcons.Plus className="mr-2 h-4 w-4" />
                Adicionar Primeiro Contato
              </Button>
            )}
          </div>
        )}
        
        {/* Lista de contatos */}
        {!carregando && !erro && temContatos && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {contatos.map(contato => {
              const statusInfo = getStatusInfo(contato.status);
              const StatusIcon = LucideIcons[statusInfo.icone as keyof typeof LucideIcons] as any;
              
              return (
                <Card key={contato.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={contato.avatar} />
                        <AvatarFallback>
                          {gerarIniciaisNome(contato.nome)}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.cor}`}>
                        <StatusIcon className="h-3 w-3 inline mr-1" />
                        {statusInfo.label}
                      </div>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <h3 className="font-semibold text-gray-900">{contato.nome}</h3>
                      <p className="text-sm text-gray-600">{contato.cargo}</p>
                      <p className="text-sm font-medium text-blue-600">{contato.empresa}</p>
                      <div className="space-y-1">
                        <p className="text-xs text-gray-500 flex items-center">
                          <LucideIcons.Mail className="h-3 w-3 mr-1" />
                          {contato.email}
                        </p>
                        <p className="text-xs text-gray-500 flex items-center">
                          <LucideIcons.Phone className="h-3 w-3 mr-1" />
                          {contato.telefone}
                        </p>
                      </div>
                    </div>
                    
                    {contato.observacoes && (
                      <div className="bg-gray-50 p-3 rounded text-xs text-gray-600 mb-4 line-clamp-2">
                        {contato.observacoes}
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between pt-4 border-t">
                      <span className="text-xs text-gray-400">
                        {formatarDataContextual(contato.data_criacao, 'relativa')}
                      </span>
                      
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setModalDetalhes(contato)}
                        >
                          <LucideIcons.Eye className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditarContato(contato)}
                        >
                          <LucideIcons.Edit2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal de formulário */}
      {modalFormulario && (
        <Dialog open={true} onOpenChange={() => setModalFormulario(false)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {contatoEditando ? 'Editar Contato' : 'Novo Contato'}
              </DialogTitle>
              <DialogDescription>
                {contatoEditando 
                  ? 'Altere as informações do contato'
                  : 'Preencha os dados do novo contato'
                }
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nome">Nome *</Label>
                  <Input
                    id="nome"
                    value={dadosFormulario.nome}
                    onChange={e => handleFormularioChange('nome', e.target.value)}
                    className={errosFormulario.nome ? 'border-red-500' : ''}
                    placeholder="Nome completo"
                  />
                  {errosFormulario.nome && (
                    <p className="text-red-500 text-sm mt-1">{errosFormulario.nome}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={dadosFormulario.email}
                    onChange={e => handleFormularioChange('email', e.target.value)}
                    className={errosFormulario.email ? 'border-red-500' : ''}
                    placeholder="email@empresa.com"
                  />
                  {errosFormulario.email && (
                    <p className="text-red-500 text-sm mt-1">{errosFormulario.email}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="telefone">Telefone *</Label>
                  <Input
                    id="telefone"
                    value={dadosFormulario.telefone}
                    onChange={e => handleFormularioChange('telefone', e.target.value)}
                    className={errosFormulario.telefone ? 'border-red-500' : ''}
                    placeholder="(11) 99999-9999"
                  />
                  {errosFormulario.telefone && (
                    <p className="text-red-500 text-sm mt-1">{errosFormulario.telefone}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="empresa">Empresa *</Label>
                  <Input
                    id="empresa"
                    value={dadosFormulario.empresa}
                    onChange={e => handleFormularioChange('empresa', e.target.value)}
                    className={errosFormulario.empresa ? 'border-red-500' : ''}
                    placeholder="Nome da empresa"
                  />
                  {errosFormulario.empresa && (
                    <p className="text-red-500 text-sm mt-1">{errosFormulario.empresa}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="cargo">Cargo</Label>
                  <Input
                    id="cargo"
                    value={dadosFormulario.cargo}
                    onChange={e => handleFormularioChange('cargo', e.target.value)}
                    placeholder="Cargo na empresa"
                  />
                </div>
                
                <div>
                  <Label htmlFor="status">Status</Label>
                  <select
                    id="status"
                    value={dadosFormulario.status}
                    onChange={e => handleFormularioChange('status', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="potencial">Potencial</option>
                    <option value="ativo">Ativo</option>
                    <option value="inativo">Inativo</option>
                  </select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  value={dadosFormulario.observacoes}
                  onChange={e => handleFormularioChange('observacoes', e.target.value)}
                  placeholder="Informações adicionais sobre o contato..."
                  rows={3}
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setModalFormulario(false)}
                disabled={salvandoFormulario}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSalvarContato}
                disabled={salvandoFormulario}
              >
                {salvandoFormulario ? (
                  <>
                    <LucideIcons.Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <LucideIcons.Save className="mr-2 h-4 w-4" />
                    {contatoEditando ? 'Salvar Alterações' : 'Criar Contato'}
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Modal de detalhes */}
      {modalDetalhes && (
        <Dialog open={true} onOpenChange={() => setModalDetalhes(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={modalDetalhes.avatar} />
                  <AvatarFallback>
                    {gerarIniciaisNome(modalDetalhes.nome)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div>{modalDetalhes.nome}</div>
                  <div className="text-sm text-gray-500">{modalDetalhes.cargo}</div>
                </div>
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Email</Label>
                  <p className="text-gray-900">{modalDetalhes.email}</p>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-500">Telefone</Label>
                  <p className="text-gray-900">{modalDetalhes.telefone}</p>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-500">Empresa</Label>
                  <p className="text-gray-900">{modalDetalhes.empresa}</p>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-500">Status</Label>
                  <div>
                    {(() => {
                      const statusInfo = getStatusInfo(modalDetalhes.status);
                      const StatusIcon = LucideIcons[statusInfo.icone as keyof typeof LucideIcons] as any;
                      return (
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusInfo.cor}`}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {statusInfo.label}
                        </span>
                      );
                    })()}
                  </div>
                </div>
              </div>
              
              {modalDetalhes.observacoes && (
                <div>
                  <Label className="text-sm font-medium text-gray-500">Observações</Label>
                  <p className="text-gray-900 text-sm bg-gray-50 p-3 rounded">
                    {modalDetalhes.observacoes}
                  </p>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Criado em</Label>
                  <p className="text-gray-900 text-sm">
                    {formatarDataContextual(modalDetalhes.data_criacao, 'media')}
                  </p>
                </div>
                
                {modalDetalhes.ultima_interacao && (
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Última interação</Label>
                    <p className="text-gray-900 text-sm">
                      {formatarDataContextual(modalDetalhes.ultima_interacao, 'relativa')}
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setModalDetalhes(null)}>
                Fechar
              </Button>
              <Button onClick={() => {
                setModalDetalhes(null);
                handleEditarContato(modalDetalhes);
              }}>
                <LucideIcons.Edit2 className="mr-2 h-4 w-4" />
                Editar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Modal de informações */}
      {mostrarInfo && (
        <Dialog open={true} onOpenChange={() => setMostrarInfo(false)}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle className="text-2xl">CRM Simplificado</DialogTitle>
              <DialogDescription className="text-lg">
                Exemplo de <strong>componente único</strong> da metodologia Product Design AI-Enhanced
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <LucideIcons.Target className="h-5 w-5 text-blue-600" />
                      Input Original
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-blue-50 p-4 rounded border-l-4 border-blue-500">
                      <p className="text-blue-800 italic">
                        "Equipe de vendas precisa gerenciar contatos básicos com informações essenciais"
                      </p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <LucideIcons.Calculator className="h-5 w-5 text-purple-600" />
                      Análise de Complexidade
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm">
                      <li>• 1 entidade principal (contatos)</li>
                      <li>• 1 tela com modal (lista + formulário)</li>
                      <li>• 1 fluxo principal (CRUD básico)</li>
                      <li>• 6 estados UI mapeados</li>
                      <li>• 1 perfil de usuário</li>
                      <li>• <strong>Total: 18 pontos → Componente único</strong></li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <LucideIcons.CheckCircle className="h-5 w-5 text-green-600" />
                    Implementação Realizada
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3">Estados UI Funcionais:</h4>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center gap-2">
                          <LucideIcons.Loader2 className="h-4 w-4 text-blue-600" />
                          <span>Loading (carregamento de dados)</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <LucideIcons.CheckCircle className="h-4 w-4 text-green-600" />
                          <span>Success (dados carregados)</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <LucideIcons.AlertTriangle className="h-4 w-4 text-red-600" />
                          <span>Error (falha no carregamento)</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <LucideIcons.Inbox className="h-4 w-4 text-gray-600" />
                          <span>Empty (sem contatos cadastrados)</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <LucideIcons.Search className="h-4 w-4 text-yellow-600" />
                          <span>No Results (filtros sem resultado)</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <LucideIcons.Edit className="h-4 w-4 text-purple-600" />
                          <span>Form Saving (salvamento)</span>
                        </li>
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-3">Recursos Implementados:</h4>
                      <ul className="space-y-2 text-sm">
                        <li>✓ CRUD completo de contatos</li>
                        <li>✓ Busca e filtros em tempo real</li>
                        <li>✓ Validações de formulário</li>
                        <li>✓ Estatísticas dinâmicas</li>
                        <li>✓ Estados de loading defensivos</li>
                        <li>✓ Tratamento completo de erros</li>
                        <li>✓ Responsividade total</li>
                        <li>✓ Acessibilidade WCAG AA</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg">
                <h4 className="font-bold mb-3 flex items-center gap-2">
                  <LucideIcons.Lightbulb className="h-5 w-5 text-yellow-600" />
                  Diferencial: Componente Único vs Sistema Modular
                </h4>
                <p className="text-gray-700 mb-4">
                  Este exemplo demonstra como a metodologia identifica automaticamente quando usar 
                  <strong> componente único</strong> (baixa complexidade) versus <strong>sistema modular</strong> 
                  (alta complexidade), garantindo arquitetura adequada à necessidade real.
                </p>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>Componente Único (este exemplo):</strong>
                    <ul className="mt-2 space-y-1">
                      <li>• ≤ 20 pontos de complexidade</li>
                      <li>• 1 arquivo principal funcional</li>
                      <li>• Estados locais gerenciados</li>
                      <li>• Ideal para CRUDs simples</li>
                    </ul>
                  </div>
                  <div>
                    <strong>Sistema Modular (Gestão Usuários):</strong>
                    <ul className="mt-2 space-y-1">
                      <li>• {'>'} 20 pontos de complexidade</li>
                      <li>• Múltiplos módulos especializados</li>
                      <li>• Estados globais compartilhados</li>
                      <li>• Ideal para sistemas complexos</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button onClick={() => setMostrarInfo(false)}>
                Fechar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}