'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { toast } from 'sonner'
import * as LucideIcons from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import { useMounted } from '@/hooks/use-mounted'
import { DadosGlobais } from '@/types'
import { Fragment } from 'react'

interface Perfil {
  id: string;
  nome: string;
  descricao: string;
  permissoes: string[];
  usuarios_count: number;
  cor: string;
  editavel: boolean;
}

interface Permissao {
  id: string;
  nome: string;
  descricao: string;
  categoria: string;
}

interface GestaoPerfsProps {
  dadosGlobais: DadosGlobais;
  onAtualizarEstatisticas: () => void;
}

export default function GestaoPerfs({ dadosGlobais, onAtualizarEstatisticas }: GestaoPerfsProps) {
  const [perfis, setPerfis] = useState<Perfil[]>([]);
  const [permissoes, setPermissoes] = useState<Permissao[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [modalPerfil, setModalPerfil] = useState<Perfil | null>(null);
  const [modalNovoPerfil, setModalNovoPerfil] = useState(false);
  
  const montadoRef = useMounted();
  
  // Carregar dados
  const carregarDados = useCallback(async () => {
    if (!montadoRef.current) return;
    
    setCarregando(true);
    setErro(null);
    
    try {
      // Simulação de dados de perfis
      const perfisMock: Perfil[] = [
        {
          id: 'admin',
          nome: 'Administrador',
          descricao: 'Acesso completo a todas as funcionalidades do sistema',
          permissoes: ['usuarios:create', 'usuarios:edit', 'usuarios:delete', 'usuarios:view', 'perfis:manage', 'auditoria:view', 'config:manage'],
          usuarios_count: 3,
          cor: 'red',
          editavel: false
        },
        {
          id: 'rh',
          nome: 'Recursos Humanos',
          descricao: 'Gestão de usuários e relatórios de RH',
          permissoes: ['usuarios:create', 'usuarios:edit', 'usuarios:view', 'relatorios:rh'],
          usuarios_count: 2,
          cor: 'blue',
          editavel: true
        },
        {
          id: 'supervisor',
          nome: 'Supervisor',
          descricao: 'Supervisão de equipes e relatórios básicos',
          permissoes: ['usuarios:view', 'relatorios:equipe'],
          usuarios_count: 4,
          cor: 'green',
          editavel: true
        },
        {
          id: 'usuario',
          nome: 'Usuário Padrão',
          descricao: 'Acesso básico ao sistema',
          permissoes: ['profile:edit'],
          usuarios_count: 15,
          cor: 'gray',
          editavel: false
        }
      ];
      
      const permissoesMock: Permissao[] = [
        { id: 'usuarios:create', nome: 'Criar Usuários', descricao: 'Pode criar novos usuários', categoria: 'Usuários' },
        { id: 'usuarios:edit', nome: 'Editar Usuários', descricao: 'Pode editar informações de usuários', categoria: 'Usuários' },
        { id: 'usuarios:delete', nome: 'Excluir Usuários', descricao: 'Pode excluir usuários do sistema', categoria: 'Usuários' },
        { id: 'usuarios:view', nome: 'Visualizar Usuários', descricao: 'Pode visualizar lista de usuários', categoria: 'Usuários' },
        { id: 'perfis:manage', nome: 'Gerenciar Perfis', descricao: 'Pode criar e editar perfis de usuário', categoria: 'Perfis' },
        { id: 'auditoria:view', nome: 'Ver Auditoria', descricao: 'Pode visualizar logs de auditoria', categoria: 'Auditoria' },
        { id: 'config:manage', nome: 'Configurações', descricao: 'Pode alterar configurações do sistema', categoria: 'Sistema' },
        { id: 'relatorios:rh', nome: 'Relatórios RH', descricao: 'Acesso a relatórios de recursos humanos', categoria: 'Relatórios' },
        { id: 'relatorios:equipe', nome: 'Relatórios Equipe', descricao: 'Relatórios da própria equipe', categoria: 'Relatórios' },
        { id: 'profile:edit', nome: 'Editar Perfil', descricao: 'Pode editar o próprio perfil', categoria: 'Perfil' }
      ];
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (montadoRef.current) {
        setPerfis(perfisMock);
        setPermissoes(permissoesMock);
      }
    } catch (error) {
      if (montadoRef.current) {
        setErro('Falha ao carregar perfis e permissões');
      }
    } finally {
      if (montadoRef.current) {
        setCarregando(false);
      }
    }
  }, [montadoRef]);
  
  useEffect(() => {
    carregarDados();
  }, [carregarDados]);
  
  // Agrupar permissões por categoria
  const permissoesPorCategoria = permissoes.reduce((acc, permissao) => {
    if (!acc[permissao.categoria]) {
      acc[permissao.categoria] = [];
    }
    acc[permissao.categoria].push(permissao);
    return acc;
  }, {} as Record<string, Permissao[]>);
  
  const handleEditarPerfil = useCallback((perfil: Perfil) => {
    if (!perfil.editavel) {
      toast.error('Este perfil não pode ser editado');
      return;
    }
    setModalPerfil(perfil);
  }, []);
  
  const handleSalvarPerfil = useCallback(async () => {
    try {
      // Simular salvamento
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Perfil salvo com sucesso!');
      setModalPerfil(null);
      setModalNovoPerfil(false);
      carregarDados();
    } catch (error) {
      toast.error('Falha ao salvar perfil');
    }
  }, [carregarDados]);

  if (carregando) {
    return (
      <div className="flex justify-center items-center py-16">
        <div className="text-center">
          <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-500">Carregando perfis...</p>
        </div>
      </div>
    );
  }

  if (erro) {
    return (
      <div className="bg-red-50 border border-red-200 p-8 rounded-lg text-center">
        <LucideIcons.AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">Erro ao carregar dados</h3>
        <p className="text-gray-700 mb-6">{erro}</p>
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
          <h2 className="text-2xl font-bold text-gray-900">Perfis e Permissões</h2>
          <p className="text-gray-600">
            Gerencie perfis de acesso e permissões do sistema
          </p>
        </div>
        
        <Button onClick={() => setModalNovoPerfil(true)}>
          <LucideIcons.Plus className="mr-2 h-4 w-4" />
          Novo Perfil
        </Button>
      </div>

      {/* Lista de Perfis */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {perfis.map(perfil => (
          <Card key={perfil.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className={`w-4 h-4 rounded-full bg-${perfil.cor}-500`}></div>
                <Badge variant="secondary">
                  {perfil.usuarios_count} usuários
                </Badge>
              </div>
              <CardTitle className="text-lg">{perfil.nome}</CardTitle>
              <CardDescription className="text-sm">{perfil.descricao}</CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-3">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Permissões:</Label>
                  <p className="text-sm text-gray-700">{perfil.permissoes.length} definidas</p>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => setModalPerfil(perfil)}
                  >
                    <LucideIcons.Eye className="mr-1 h-3 w-3" />
                    Ver
                  </Button>
                  
                  {perfil.editavel && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditarPerfil(perfil)}
                    >
                      <LucideIcons.Edit2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
                
                {!perfil.editavel && (
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <LucideIcons.Lock className="h-3 w-3" />
                    <span>Perfil do sistema</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Matriz de Permissões */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LucideIcons.Grid3X3 className="h-5 w-5" />
            Matriz de Permissões
          </CardTitle>
          <CardDescription>
            Visualização rápida das permissões por perfil
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left p-3 border-b">Permissão</th>
                  {perfis.map(perfil => (
                    <th key={perfil.id} className="text-center p-3 border-b">
                      <div className="flex flex-col items-center gap-1">
                        <div className={`w-3 h-3 rounded-full bg-${perfil.cor}-500`}></div>
                        <span className="text-xs">{perfil.nome}</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Object.entries(permissoesPorCategoria).map(([categoria, perms]) => (
                  <Fragment key={categoria}>
                    <tr>
                      <td colSpan={perfis.length + 1} className="p-3 bg-gray-50 font-medium text-sm">
                        {categoria}
                      </td>
                    </tr>
                    {perms.map(permissao => (
                      <tr key={permissao.id} className="hover:bg-gray-50">
                        <td className="p-3 border-b">
                          <div>
                            <div className="font-medium text-sm">{permissao.nome}</div>
                            <div className="text-xs text-gray-500">{permissao.descricao}</div>
                          </div>
                        </td>
                        {perfis.map(perfil => (
                          <td key={`${perfil.id}-${permissao.id}`} className="text-center p-3 border-b">
                            {perfil.permissoes.includes(permissao.id) ? (
                              <LucideIcons.CheckCircle className="h-4 w-4 text-green-600 mx-auto" />
                            ) : (
                              <LucideIcons.Minus className="h-4 w-4 text-gray-300 mx-auto" />
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Modal de visualização/edição de perfil */}
      {modalPerfil && (
        <Dialog open={true} onOpenChange={() => setModalPerfil(null)}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <div className={`w-4 h-4 rounded-full bg-${modalPerfil.cor}-500`}></div>
                {modalPerfil.nome}
                {!modalPerfil.editavel && (
                  <Badge variant="outline">
                    <LucideIcons.Lock className="h-3 w-3 mr-1" />
                    Sistema
                  </Badge>
                )}
              </DialogTitle>
              <DialogDescription>{modalPerfil.descricao}</DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              <div className="grid md:grid-cols-3 gap-4 text-center">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{modalPerfil.usuarios_count}</div>
                  <div className="text-sm text-blue-800">Usuários</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{modalPerfil.permissoes.length}</div>
                  <div className="text-sm text-green-800">Permissões</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {Object.keys(permissoesPorCategoria).filter(cat => 
                      permissoesPorCategoria[cat].some(p => modalPerfil.permissoes.includes(p.id))
                    ).length}
                  </div>
                  <div className="text-sm text-purple-800">Categorias</div>
                </div>
              </div>
              
              <div>
                <Label className="text-base font-semibold">Permissões do Perfil</Label>
                <div className="mt-3 space-y-4">
                  {Object.entries(permissoesPorCategoria).map(([categoria, perms]) => {
                    const permissoesCategoria = perms.filter(p => modalPerfil.permissoes.includes(p.id));
                    
                    if (permissoesCategoria.length === 0) return null;
                    
                    return (
                      <div key={categoria}>
                        <h4 className="font-medium text-gray-900 mb-2">{categoria}</h4>
                        <div className="grid md:grid-cols-2 gap-2">
                          {permissoesCategoria.map(permissao => (
                            <div key={permissao.id} className="flex items-center gap-2 p-2 bg-green-50 rounded">
                              <LucideIcons.CheckCircle className="h-4 w-4 text-green-600" />
                              <div>
                                <div className="text-sm font-medium">{permissao.nome}</div>
                                <div className="text-xs text-gray-600">{permissao.descricao}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setModalPerfil(null)}>
                Fechar
              </Button>
              {modalPerfil.editavel && (
                <Button onClick={() => handleEditarPerfil(modalPerfil)}>
                  <LucideIcons.Edit2 className="mr-2 h-4 w-4" />
                  Editar Perfil
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Modal de novo perfil */}
      {modalNovoPerfil && (
        <Dialog open={true} onOpenChange={() => setModalNovoPerfil(false)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Criar Novo Perfil</DialogTitle>
              <DialogDescription>
                Defina um novo perfil de acesso com permissões específicas
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nome">Nome do Perfil</Label>
                  <Input id="nome" placeholder="Ex: Gerente de Vendas" />
                </div>
                <div>
                  <Label htmlFor="cor">Cor</Label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md">
                    <option value="blue">Azul</option>
                    <option value="green">Verde</option>
                    <option value="purple">Roxo</option>
                    <option value="orange">Laranja</option>
                  </select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea id="descricao" placeholder="Descreva as responsabilidades deste perfil..." />
              </div>
              
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                <div className="flex items-start gap-3">
                  <LucideIcons.Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-800">Formulário Demonstrativo</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      Aqui seria implementado o sistema completo de seleção de permissões por categoria,
                      com checkboxes, validações e preview das permissões selecionadas.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setModalNovoPerfil(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSalvarPerfil}>
                <LucideIcons.Save className="mr-2 h-4 w-4" />
                Criar Perfil
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}