'use client'

import React, { useState, useRef, useCallback, useEffect, Fragment } from 'react'
import { toast } from 'sonner'
import * as LucideIcons from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import { gerarIniciaisNome, formatarStatusVisual, formatarDataContextual } from '@/lib/utils'
import { useMounted } from '@/hooks/use-mounted'
import { Usuario, DadosGlobais } from '@/types'

interface GestaoUsuariosProps {
  dadosGlobais: DadosGlobais;
  onAtualizarEstatisticas: () => void;
}

export default function GestaoUsuarios({ dadosGlobais, onAtualizarEstatisticas }: GestaoUsuariosProps) {
  // Estados do módulo
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [modalFormulario, setModalFormulario] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState<Usuario | null>(null);
  const [selecionados, setSelecionados] = useState<string[]>([]);
  const [modalBulkAction, setModalBulkAction] = useState<string | null>(null);
  const [modalDetalhes, setModalDetalhes] = useState<Usuario | null>(null);
  
  // Estados de filtros
  const [filtros, setFiltros] = useState({
    termo: '',
    status: 'todos',
    perfil: 'todos',
    ordenacao: 'nome_asc'
  });
  
  const [paginacao, setPaginacao] = useState({
    pagina: 1,
    itensPorPagina: 9,
    total: 0
  });
  
  const montadoRef = useMounted();
  
  // Carregar usuários com filtros
  const carregarUsuarios = useCallback(async () => {
    if (!montadoRef.current) return;
    
    setCarregando(true);
    setErro(null);
    
    const timeoutId = setTimeout(() => {
      if (montadoRef.current) {
        setCarregando(false);
        setErro('Tempo de carregamento excedido');
      }
    }, 8000);
    
    try {
      // Simulação de API com filtros
      const usuariosMock: Usuario[] = [
        {
          id: '1',
          nome: 'João Silva Santos',
          email: 'joao.silva@empresa.com',
          telefone: '(11) 99999-9999',
          cargo: 'Gerente de Produto',
          perfil: 'admin',
          status: 'ativo',
          data_criacao: '2023-01-15T10:30:00Z',
          ultimo_acesso: '2024-01-15T14:22:00Z'
        },
        {
          id: '2',
          nome: 'Maria Oliveira',
          email: 'maria.oliveira@empresa.com',
          telefone: '(11) 88888-8888',
          cargo: 'Analista RH',
          perfil: 'rh',
          status: 'ativo',
          data_criacao: '2023-02-20T09:15:00Z',
          ultimo_acesso: '2024-01-14T16:45:00Z'
        },
        {
          id: '3',
          nome: 'Pedro Costa Lima',
          email: 'pedro.costa@empresa.com',
          telefone: '(11) 77777-7777',
          cargo: 'Supervisor Vendas',
          perfil: 'supervisor',
          status: 'pendente',
          data_criacao: '2024-01-10T11:00:00Z'
        },
        {
          id: '4',
          nome: 'Ana Paula Ferreira',
          email: 'ana.ferreira@empresa.com',
          telefone: '(11) 66666-6666',
          cargo: 'Designer UX',
          perfil: 'usuario',
          status: 'inativo',
          data_criacao: '2023-06-05T14:30:00Z',
          ultimo_acesso: '2023-12-20T10:15:00Z'
        },
        {
          id: '5',
          nome: 'Carlos Eduardo Mendes',
          email: 'carlos.mendes@empresa.com',
          telefone: '(11) 55555-5555',
          cargo: 'Desenvolvedor Full-Stack',
          perfil: 'usuario',
          status: 'ativo',
          data_criacao: '2023-03-12T08:45:00Z',
          ultimo_acesso: '2024-01-15T09:30:00Z'
        },
        {
          id: '6',
          nome: 'Fernanda Rodrigues',
          email: 'fernanda.rodrigues@empresa.com',
          telefone: '(11) 44444-4444',
          cargo: 'Coordenadora Marketing',
          perfil: 'supervisor',
          status: 'ativo',
          data_criacao: '2023-04-18T13:20:00Z',
          ultimo_acesso: '2024-01-14T18:10:00Z'
        },
        {
          id: '7',
          nome: 'Rafael Almeida',
          email: 'rafael.almeida@empresa.com',
          telefone: '(11) 33333-3333',
          cargo: 'Analista Financeiro',
          perfil: 'usuario',
          status: 'pendente',
          data_criacao: '2024-01-08T15:30:00Z'
        },
        {
          id: '8',
          nome: 'Juliana Santos',
          email: 'juliana.santos@empresa.com',
          telefone: '(11) 22222-2222',
          cargo: 'Gerente Comercial',
          perfil: 'admin',
          status: 'ativo',
          data_criacao: '2023-05-22T10:15:00Z',
          ultimo_acesso: '2024-01-15T11:45:00Z'
        },
        {
          id: '9',
          nome: 'Lucas Pereira',
          email: 'lucas.pereira@empresa.com',
          telefone: '(11) 11111-1111',
          cargo: 'Assistente Administrativo',
          perfil: 'usuario',
          status: 'inativo',
          data_criacao: '2023-07-10T14:00:00Z',
          ultimo_acesso: '2023-12-15T16:20:00Z'
        }
      ];
      
      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      if (montadoRef.current) {
        // Aplicar filtros
        let usuariosFiltrados = usuariosMock;
        
        if (filtros.termo) {
          usuariosFiltrados = usuariosFiltrados.filter(user => 
            user.nome.toLowerCase().includes(filtros.termo.toLowerCase()) ||
            user.email.toLowerCase().includes(filtros.termo.toLowerCase()) ||
            user.cargo.toLowerCase().includes(filtros.termo.toLowerCase())
          );
        }
        
        if (filtros.status !== 'todos') {
          usuariosFiltrados = usuariosFiltrados.filter(user => user.status === filtros.status);
        }
        
        if (filtros.perfil !== 'todos') {
          usuariosFiltrados = usuariosFiltrados.filter(user => user.perfil === filtros.perfil);
        }
        
        // Aplicar ordenação
        usuariosFiltrados.sort((a, b) => {
          switch (filtros.ordenacao) {
            case 'nome_asc':
              return a.nome.localeCompare(b.nome);
            case 'nome_desc':
              return b.nome.localeCompare(a.nome);
            case 'data_asc':
              return new Date(a.data_criacao).getTime() - new Date(b.data_criacao).getTime();
            case 'data_desc':
              return new Date(b.data_criacao).getTime() - new Date(a.data_criacao).getTime();
            default:
              return 0;
          }
        });
        
        setUsuarios(usuariosFiltrados);
        setPaginacao(prev => ({ ...prev, total: usuariosFiltrados.length }));
        setSelecionados([]); // Limpar seleção
      }
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      if (montadoRef.current) {
        setErro('Falha ao carregar usuários. Tente novamente.');
      }
    } finally {
      clearTimeout(timeoutId);
      if (montadoRef.current) {
        setCarregando(false);
      }
    }
  }, [filtros, montadoRef]);
  
  useEffect(() => {
    carregarUsuarios();
  }, [carregarUsuarios]);
  
  // Handlers de filtros
  const handleFiltroChange = useCallback((campo: string, valor: string) => {
    setFiltros(prev => ({ ...prev, [campo]: valor }));
    setPaginacao(prev => ({ ...prev, pagina: 1 }));
  }, []);
  
  const limparFiltros = useCallback(() => {
    setFiltros({
      termo: '',
      status: 'todos',
      perfil: 'todos',
      ordenacao: 'nome_asc'
    });
  }, []);
  
  // Handlers de seleção
  const handleSelecionarTodos = useCallback(() => {
    const todosIds = usuarios.map(user => user.id);
    setSelecionados(prev => prev.length === usuarios.length ? [] : todosIds);
  }, [usuarios]);
  
  const handleSelecionarUsuario = useCallback((id: string) => {
    setSelecionados(prev => 
      prev.includes(id) ? prev.filter(uid => uid !== id) : [...prev, id]
    );
  }, []);
  
  // Handlers de ações
  const handleNovoUsuario = useCallback(() => {
    setUsuarioEditando(null);
    setModalFormulario(true);
  }, []);
  
  const handleEditarUsuario = useCallback((usuario: Usuario) => {
    setUsuarioEditando(usuario);
    setModalFormulario(true);
  }, []);
  
  const handleVerDetalhes = useCallback((usuario: Usuario) => {
    setModalDetalhes(usuario);
  }, []);
  
  const handleBulkAction = useCallback(async (acao: string) => {
    if (selecionados.length === 0) return;
    
    setModalBulkAction(null);
    
    try {
      // Simular API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (montadoRef.current) {
        toast.success(`${acao} executada com sucesso em ${selecionados.length} usuários`);
        setSelecionados([]);
        carregarUsuarios();
        onAtualizarEstatisticas();
      }
    } catch (error) {
      toast.error(`Falha ao executar ${acao}`);
    }
  }, [selecionados, carregarUsuarios, onAtualizarEstatisticas, montadoRef]);
  
  // Calculos derivados
  const filtrosAplicados = filtros.termo !== '' || filtros.status !== 'todos' || filtros.perfil !== 'todos';
  const temUsuarios = usuarios.length > 0;
  const temSelecao = selecionados.length > 0;
  const selecaoCompleta = temUsuarios && selecionados.length === usuarios.length;
  
  return (
    <div className="space-y-6">
      {/* Header com ações */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Lista de Usuários</h2>
          <p className="text-gray-600">
            {usuarios.length > 0 ? `${usuarios.length} usuários encontrados` : 'Nenhum usuário encontrado'}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Ações em lote */}
          {temSelecao && (
            <div className="flex items-center gap-2 mr-4">
              <Badge variant="secondary">
                {selecionados.length} selecionados
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setModalBulkAction('ativar')}
              >
                <LucideIcons.CheckCircle className="h-4 w-4 mr-1" />
                Ativar
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setModalBulkAction('inativar')}
              >
                <LucideIcons.XCircle className="h-4 w-4 mr-1" />
                Inativar
              </Button>
            </div>
          )}
          
          <Button onClick={handleNovoUsuario}>
            <LucideIcons.Plus className="mr-2 h-4 w-4" />
            Novo Usuário
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
                placeholder="Buscar usuários..."
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
              <option value="inativo">Inativo</option>
              <option value="pendente">Pendente</option>
            </select>
            
            <select
              value={filtros.perfil}
              onChange={e => handleFiltroChange('perfil', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="todos">Todos os Perfis</option>
              <option value="admin">Administrador</option>
              <option value="rh">RH</option>
              <option value="supervisor">Supervisor</option>
              <option value="usuario">Usuário</option>
            </select>
            
            <select
              value={filtros.ordenacao}
              onChange={e => handleFiltroChange('ordenacao', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="nome_asc">Nome A-Z</option>
              <option value="nome_desc">Nome Z-A</option>
              <option value="data_asc">Mais Antigos</option>
              <option value="data_desc">Mais Recentes</option>
            </select>
            
            <Button
              variant="outline"
              onClick={limparFiltros}
              disabled={!filtrosAplicados}
              className="w-full"
            >
              <LucideIcons.RefreshCw className="mr-2 h-4 w-4" />
              Limpar
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Estados de UI */}
      {carregando && (
        <div className="flex justify-center items-center py-16">
          <div className="text-center">
            <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-500">Carregando usuários...</p>
          </div>
        </div>
      )}
      
      {!carregando && erro && (
        <div className="bg-red-50 border border-red-200 p-8 rounded-lg text-center">
          <LucideIcons.AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Erro ao carregar dados</h3>
          <p className="text-gray-700 mb-6">{erro}</p>
          <Button onClick={carregarUsuarios}>
            <LucideIcons.RefreshCw className="mr-2 h-4 w-4" />
            Tentar Novamente
          </Button>
        </div>
      )}
      
      {!carregando && !erro && !temUsuarios && (
        <div className="text-center py-16">
          <LucideIcons.Users className="h-16 w-16 text-gray-300 mx-auto mb-6" />
          <h3 className="text-xl font-medium mb-2">
            {filtrosAplicados ? 'Nenhum resultado encontrado' : 'Nenhum usuário cadastrado'}
          </h3>
          <p className="text-gray-500 max-w-md mx-auto mb-8">
            {filtrosAplicados 
              ? 'Nenhum usuário corresponde aos filtros aplicados. Tente ajustar os critérios.'
              : 'Você ainda não tem usuários cadastrados. Comece criando o primeiro usuário.'
            }
          </p>
          
          {filtrosAplicados ? (
            <Button onClick={limparFiltros} variant="outline">
              <LucideIcons.RefreshCw className="mr-2 h-4 w-4" />
              Limpar Filtros
            </Button>
          ) : (
            <Button onClick={handleNovoUsuario}>
              <LucideIcons.Plus className="mr-2 h-4 w-4" />
              Criar Primeiro Usuário
            </Button>
          )}
        </div>
      )}
      
      {/* Lista de usuários */}
      {!carregando && !erro && temUsuarios && (
        <>
          {/* Checkbox seleção global */}
          <div className="flex items-center justify-between py-2 border-b">
            <div className="flex items-center gap-3">
              <Checkbox
                checked={selecaoCompleta}
                onCheckedChange={handleSelecionarTodos}
              />
              <span className="text-sm text-gray-600">
                Selecionar todos ({usuarios.length} usuários)
              </span>
            </div>
            
            <div className="text-sm text-gray-500">
              Página {paginacao.pagina} de {Math.ceil(paginacao.total / paginacao.itensPorPagina)}
            </div>
          </div>
          
          {/* Cards de usuários */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {usuarios.map(usuario => {
              const statusInfo = formatarStatusVisual(usuario.status);
              const StatusIcon = LucideIcons[statusInfo.icone as keyof typeof LucideIcons] as any;
              const selecionado = selecionados.includes(usuario.id);
              
              return (
                <Card key={usuario.id} className={`transition-all hover:shadow-lg ${selecionado ? 'ring-2 ring-blue-500' : ''}`}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Checkbox
                          checked={selecionado}
                          onCheckedChange={() => handleSelecionarUsuario(usuario.id)}
                        />
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={usuario.avatar} />
                          <AvatarFallback>
                            {gerarIniciaisNome(usuario.nome)}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge variant={statusInfo.badge as any}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {statusInfo.texto}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <h3 className="font-semibold text-gray-900 truncate">{usuario.nome}</h3>
                      <p className="text-sm text-gray-600 truncate">{usuario.cargo}</p>
                      <p className="text-sm text-gray-500 truncate">{usuario.email}</p>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-xs capitalize">
                          {usuario.perfil}
                        </Badge>
                        {usuario.ultimo_acesso && (
                          <span className="text-xs text-gray-400">
                            {formatarDataContextual(usuario.ultimo_acesso, 'relativa')}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-4 border-t">
                      <span className="text-xs text-gray-400">
                        Criado em {formatarDataContextual(usuario.data_criacao, 'curta')}
                      </span>
                      
                      <div className="flex gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleVerDetalhes(usuario)}
                        >
                          <LucideIcons.Eye className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditarUsuario(usuario)}
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
        </>
      )}
      
      {/* Modal de detalhes */}
      {modalDetalhes && (
        <Dialog open={true} onOpenChange={() => setModalDetalhes(null)}>
          <DialogContent className="max-w-2xl">
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
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Email</Label>
                  <p className="text-gray-900">{modalDetalhes.email}</p>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-500">Telefone</Label>
                  <p className="text-gray-900">{modalDetalhes.telefone}</p>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-500">Status</Label>
                  <div className="flex items-center gap-2 mt-1">
                    {(() => {
                      const statusInfo = formatarStatusVisual(modalDetalhes.status);
                      const StatusIcon = LucideIcons[statusInfo.icone as keyof typeof LucideIcons] as any;
                      return (
                        <Badge variant={statusInfo.badge as any}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {statusInfo.texto}
                        </Badge>
                      );
                    })()}
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Perfil</Label>
                  <p className="text-gray-900 capitalize">{modalDetalhes.perfil}</p>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-500">Data de Criação</Label>
                  <p className="text-gray-900">{formatarDataContextual(modalDetalhes.data_criacao, 'longa')}</p>
                </div>
                
                {modalDetalhes.ultimo_acesso && (
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Último Acesso</Label>
                    <p className="text-gray-900">{formatarDataContextual(modalDetalhes.ultimo_acesso, 'longa')}</p>
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
                handleEditarUsuario(modalDetalhes);
              }}>
                <LucideIcons.Edit2 className="mr-2 h-4 w-4" />
                Editar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      
      {/* Modal de ação em lote */}
      {modalBulkAction && (
        <Dialog open={true} onOpenChange={() => setModalBulkAction(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmar ação em lote</DialogTitle>
              <DialogDescription>
                Esta ação será aplicada a {selecionados.length} usuários selecionados. 
                Tem certeza que deseja continuar?
              </DialogDescription>
            </DialogHeader>
            
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <LucideIcons.AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-800">Atenção</h4>
                  <p className="text-sm text-yellow-700">
                    Esta ação afetará {selecionados.length} usuários e não pode ser desfeita facilmente.
                  </p>
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setModalBulkAction(null)}>
                Cancelar
              </Button>
              <Button onClick={() => handleBulkAction(modalBulkAction)}>
                Confirmar {modalBulkAction}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      
      {/* Modal de formulário seria implementado aqui */}
      {modalFormulario && (
        <Dialog open={true} onOpenChange={() => setModalFormulario(false)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {usuarioEditando ? 'Editar Usuário' : 'Novo Usuário'}
              </DialogTitle>
              <DialogDescription>
                {usuarioEditando 
                  ? 'Altere as informações do usuário abaixo'
                  : 'Preencha as informações para criar um novo usuário'
                }
              </DialogDescription>
            </DialogHeader>
            
            {/* Placeholder para formulário completo */}
            <div className="space-y-6 py-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nome">Nome Completo</Label>
                  <Input id="nome" placeholder="Digite o nome completo" />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="exemplo@email.com" />
                </div>
                <div>
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input id="telefone" placeholder="(11) 99999-9999" />
                </div>
                <div>
                  <Label htmlFor="cargo">Cargo</Label>
                  <Input id="cargo" placeholder="Ex: Gerente de Produto" />
                </div>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                <div className="flex items-start gap-3">
                  <LucideIcons.Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-800">Formulário Demonstrativo</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      Este é um placeholder do formulário completo que seria implementado com:
                      validação em tempo real, upload de avatar, seleção de perfil/status, 
                      e todos os padrões defensivos da metodologia Product Design AI-Enhanced.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setModalFormulario(false)}>
                Cancelar
              </Button>
              <Button onClick={() => {
                toast.success('Usuário salvo com sucesso!');
                setModalFormulario(false);
                carregarUsuarios();
                onAtualizarEstatisticas();
              }}>
                <LucideIcons.Save className="mr-2 h-4 w-4" />
                {usuarioEditando ? 'Salvar Alterações' : 'Criar Usuário'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}