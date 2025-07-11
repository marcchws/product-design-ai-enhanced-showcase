'use client'

import React, { useState, useCallback, useEffect } from 'react'
import * as LucideIcons from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { formatarDataContextual, gerarIniciaisNome } from '@/lib/utils'
import { useMounted } from '@/hooks/use-mounted'
import { DadosGlobais } from '@/types'

interface LogAuditoria {
  id: string;
  usuario_id: string;
  usuario_nome: string;
  acao: string;
  recurso: string;
  detalhes: string;
  ip_address: string;
  user_agent: string;
  data_hora: string;
  resultado: 'sucesso' | 'falha';
  metadata?: Record<string, any>;
}

interface HistoricoAuditoriaProps {
  dadosGlobais: DadosGlobais;
  onAtualizarEstatisticas: () => void;
}

export default function HistoricoAuditoria({ dadosGlobais }: HistoricoAuditoriaProps) {
  const [logs, setLogs] = useState<LogAuditoria[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  
  const [filtros, setFiltros] = useState({
    termo: '',
    acao: 'todas',
    resultado: 'todos',
    periodo: '7d'
  });
  
  const [estatisticas, setEstatisticas] = useState({
    total_acoes: 0,
    acoes_sucesso: 0,
    acoes_falha: 0,
    usuarios_ativos: 0
  });
  
  const montadoRef = useMounted();
  
  // Carregar logs de auditoria
  const carregarLogs = useCallback(async () => {
    if (!montadoRef.current) return;
    
    setCarregando(true);
    setErro(null);
    
    try {
      // Simulação de logs de auditoria
      const logsMock: LogAuditoria[] = [
        {
          id: '1',
          usuario_id: '1',
          usuario_nome: 'João Silva Santos',
          acao: 'criar_usuario',
          recurso: 'usuarios',
          detalhes: 'Criou usuário: Maria Oliveira',
          ip_address: '192.168.1.100',
          user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          data_hora: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 min atrás
          resultado: 'sucesso'
        },
        {
          id: '2',
          usuario_id: '2',
          usuario_nome: 'Maria Oliveira',
          acao: 'editar_perfil',
          recurso: 'perfil',
          detalhes: 'Alterou informações do próprio perfil',
          ip_address: '192.168.1.105',
          user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
          data_hora: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2h atrás
          resultado: 'sucesso'
        },
        {
          id: '3',
          usuario_id: '3',
          usuario_nome: 'Pedro Costa Lima',
          acao: 'login_falha',
          recurso: 'autenticacao',
          detalhes: 'Tentativa de login com senha incorreta',
          ip_address: '192.168.1.110',
          user_agent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15',
          data_hora: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(), // 6h atrás
          resultado: 'falha'
        },
        {
          id: '4',
          usuario_id: '1',
          usuario_nome: 'João Silva Santos',
          acao: 'excluir_usuario',
          recurso: 'usuarios',
          detalhes: 'Removeu usuário: Ana Paula Ferreira',
          ip_address: '192.168.1.100',
          user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          data_hora: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 dia atrás
          resultado: 'sucesso'
        },
        {
          id: '5',
          usuario_id: '4',
          usuario_nome: 'Ana Paula Ferreira',
          acao: 'login',
          recurso: 'autenticacao',
          detalhes: 'Login realizado com sucesso',
          ip_address: '192.168.1.115',
          user_agent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
          data_hora: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 dias atrás
          resultado: 'sucesso'
        },
        {
          id: '6',
          usuario_id: '2',
          usuario_nome: 'Maria Oliveira',
          acao: 'gerar_relatorio',
          recurso: 'relatorios',
          detalhes: 'Gerou relatório de usuários ativos',
          ip_address: '192.168.1.105',
          user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
          data_hora: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), // 3 dias atrás
          resultado: 'sucesso'
        },
        {
          id: '7',
          usuario_id: '5',
          usuario_nome: 'Carlos Eduardo Mendes',
          acao: 'alterar_permissao',
          recurso: 'permissoes',
          detalhes: 'Tentou alterar permissões sem autorização',
          ip_address: '192.168.1.120',
          user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          data_hora: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(), // 5 dias atrás
          resultado: 'falha'
        }
      ];
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (montadoRef.current) {
        // Aplicar filtros
        let logsFiltrados = logsMock;
        
        if (filtros.termo) {
          logsFiltrados = logsFiltrados.filter(log => 
            log.usuario_nome.toLowerCase().includes(filtros.termo.toLowerCase()) ||
            log.acao.toLowerCase().includes(filtros.termo.toLowerCase()) ||
            log.detalhes.toLowerCase().includes(filtros.termo.toLowerCase())
          );
        }
        
        if (filtros.acao !== 'todas') {
          logsFiltrados = logsFiltrados.filter(log => log.acao === filtros.acao);
        }
        
        if (filtros.resultado !== 'todos') {
          logsFiltrados = logsFiltrados.filter(log => log.resultado === filtros.resultado);
        }
        
        // Filtro por período
        const agora = new Date();
        if (filtros.periodo !== 'todos') {
          const dias = parseInt(filtros.periodo.replace('d', ''));
          const dataLimite = new Date(agora.getTime() - dias * 24 * 60 * 60 * 1000);
          logsFiltrados = logsFiltrados.filter(log => 
            new Date(log.data_hora) >= dataLimite
          );
        }
        
        setLogs(logsFiltrados);
        
        // Calcular estatísticas
        setEstatisticas({
          total_acoes: logsFiltrados.length,
          acoes_sucesso: logsFiltrados.filter(log => log.resultado === 'sucesso').length,
          acoes_falha: logsFiltrados.filter(log => log.resultado === 'falha').length,
          usuarios_ativos: Array.from(new Set(logsFiltrados.map(log => log.usuario_id))).length
        });
      }
    } catch (error) {
      if (montadoRef.current) {
        setErro('Falha ao carregar logs de auditoria');
      }
    } finally {
      if (montadoRef.current) {
        setCarregando(false);
      }
    }
  }, [filtros, montadoRef]);
  
  useEffect(() => {
    carregarLogs();
  }, [carregarLogs]);
  
  // Handlers
  const handleFiltroChange = useCallback((campo: string, valor: string) => {
    setFiltros(prev => ({ ...prev, [campo]: valor }));
  }, []);
  
  const limparFiltros = useCallback(() => {
    setFiltros({
      termo: '',
      acao: 'todas',
      resultado: 'todos',
      periodo: '7d'
    });
  }, []);
  
  // Mapear ações para descrições e ícones
  const getAcaoInfo = useCallback((acao: string) => {
    const acoes: Record<string, { label: string; icone: string; cor: string }> = {
      'login': { label: 'Login', icone: 'LogIn', cor: 'green' },
      'login_falha': { label: 'Login Falhado', icone: 'LogIn', cor: 'red' },
      'logout': { label: 'Logout', icone: 'LogOut', cor: 'gray' },
      'criar_usuario': { label: 'Criar Usuário', icone: 'UserPlus', cor: 'blue' },
      'editar_usuario': { label: 'Editar Usuário', icone: 'UserCog', cor: 'orange' },
      'excluir_usuario': { label: 'Excluir Usuário', icone: 'UserMinus', cor: 'red' },
      'editar_perfil': { label: 'Editar Perfil', icone: 'User', cor: 'purple' },
      'alterar_permissao': { label: 'Alterar Permissão', icone: 'Shield', cor: 'yellow' },
      'gerar_relatorio': { label: 'Gerar Relatório', icone: 'FileText', cor: 'indigo' }
    };
    
    return acoes[acao] || { label: acao, icone: 'Activity', cor: 'gray' };
  }, []);

  if (carregando) {
    return (
      <div className="flex justify-center items-center py-16">
        <div className="text-center">
          <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-500">Carregando auditoria...</p>
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
        <Button onClick={carregarLogs}>
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
          <h2 className="text-2xl font-bold text-gray-900">Auditoria do Sistema</h2>
          <p className="text-gray-600">
            Histórico completo de ações realizadas no sistema
          </p>
        </div>
        
        <Button variant="outline">
          <LucideIcons.Download className="mr-2 h-4 w-4" />
          Exportar Logs
        </Button>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <LucideIcons.Activity className="h-6 w-6 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{estatisticas.total_acoes}</div>
            <div className="text-sm text-gray-600">Total de Ações</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <LucideIcons.CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{estatisticas.acoes_sucesso}</div>
            <div className="text-sm text-gray-600">Sucessos</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <LucideIcons.XCircle className="h-6 w-6 text-red-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{estatisticas.acoes_falha}</div>
            <div className="text-sm text-gray-600">Falhas</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <LucideIcons.Users className="h-6 w-6 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{estatisticas.usuarios_ativos}</div>
            <div className="text-sm text-gray-600">Usuários Ativos</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <LucideIcons.Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar logs..."
                value={filtros.termo}
                onChange={e => handleFiltroChange('termo', e.target.value)}
                className="pl-9"
              />
            </div>
            
            <select
              value={filtros.acao}
              onChange={e => handleFiltroChange('acao', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="todas">Todas as Ações</option>
              <option value="login">Login</option>
              <option value="login_falha">Login Falhado</option>
              <option value="criar_usuario">Criar Usuário</option>
              <option value="editar_usuario">Editar Usuário</option>
              <option value="excluir_usuario">Excluir Usuário</option>
              <option value="gerar_relatorio">Gerar Relatório</option>
            </select>
            
            <select
              value={filtros.resultado}
              onChange={e => handleFiltroChange('resultado', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="todos">Todos os Resultados</option>
              <option value="sucesso">Sucesso</option>
              <option value="falha">Falha</option>
            </select>
            
            <select
              value={filtros.periodo}
              onChange={e => handleFiltroChange('periodo', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="1d">Último dia</option>
              <option value="7d">Últimos 7 dias</option>
              <option value="30d">Últimos 30 dias</option>
              <option value="todos">Todos os períodos</option>
            </select>
            
            <Button
              variant="outline"
              onClick={limparFiltros}
              className="w-full"
            >
              <LucideIcons.RefreshCw className="mr-2 h-4 w-4" />
              Limpar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Logs */}
      {logs.length === 0 ? (
        <div className="text-center py-16">
          <LucideIcons.FileSearch className="h-16 w-16 text-gray-300 mx-auto mb-6" />
          <h3 className="text-xl font-medium mb-2">Nenhum log encontrado</h3>
          <p className="text-gray-500 mb-8">
            Nenhum registro corresponde aos filtros aplicados.
          </p>
          <Button onClick={limparFiltros} variant="outline">
            <LucideIcons.RefreshCw className="mr-2 h-4 w-4" />
            Limpar Filtros
          </Button>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Logs de Auditoria</CardTitle>
            <CardDescription>
              {logs.length} registros encontrados
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-4">
              {logs.map(log => {
                const acaoInfo = getAcaoInfo(log.acao);
                const IconeAcao = LucideIcons[acaoInfo.icone as keyof typeof LucideIcons] as any;
                
                return (
                  <div key={log.id} className="flex items-start gap-4 p-4 border rounded-lg hover:bg-gray-50">
                    <Avatar className="h-10 w-10 flex-shrink-0">
                      <AvatarFallback>
                        {gerarIniciaisNome(log.usuario_nome)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`w-8 h-8 bg-${acaoInfo.cor}-100 rounded-full flex items-center justify-center flex-shrink-0`}>
                          <IconeAcao className={`h-4 w-4 text-${acaoInfo.cor}-600`} />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900">{log.usuario_nome}</span>
                            <Badge variant={log.resultado === 'sucesso' ? 'default' : 'destructive'}>
                              {acaoInfo.label}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 truncate">{log.detalhes}</p>
                        </div>
                        
                        <div className="text-right flex-shrink-0">
                          <div className="text-sm text-gray-900">
                            {formatarDataContextual(log.data_hora, 'relativa')}
                          </div>
                          <div className="text-xs text-gray-500">
                            {formatarDataContextual(log.data_hora, 'curta')}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <LucideIcons.Monitor className="h-3 w-3" />
                          {log.ip_address}
                        </span>
                        
                        <span className="flex items-center gap-1">
                          <LucideIcons.Globe className="h-3 w-3" />
                          {log.user_agent.includes('iPhone') ? 'Mobile' : 
                           log.user_agent.includes('Macintosh') ? 'Mac' : 'Windows'}
                        </span>
                        
                        {log.resultado === 'sucesso' ? (
                          <span className="flex items-center gap-1 text-green-600">
                            <LucideIcons.CheckCircle className="h-3 w-3" />
                            Sucesso
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-red-600">
                            <LucideIcons.XCircle className="h-3 w-3" />
                            Falha
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}