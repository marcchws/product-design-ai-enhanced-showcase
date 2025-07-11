// src/app/showcase/onboarding-saas/etapa-integracoes.tsx
'use client'

import React, { useState, useRef, useCallback, useEffect } from 'react'
import { toast } from 'sonner'
import * as LucideIcons from 'lucide-react'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface EtapaIntegracoesProps {
  dados: any;
  onAtualizarDados: (dados: any) => void;
  onProxima: () => void;
  onAnterior: () => void;
  salvando: boolean;
  etapaAtual: number;
  totalEtapas: number;
}

export default function EtapaIntegracoes({
  dados,
  onAtualizarDados,
  onProxima,
  onAnterior,
  salvando,
  etapaAtual,
  totalEtapas
}: EtapaIntegracoesProps) {
  const [conectando, setConectando] = useState<string | null>(null);
  const [busca, setBusca] = useState('');
  
  const montadoRef = useRef(true);

  useEffect(() => {
    montadoRef.current = true;
    return () => { montadoRef.current = false; };
  }, []);

  const integracoes = [
    {
      id: 'slack',
      nome: 'Slack',
      descricao: 'Comunicação em equipe e notificações',
      icone: 'MessageSquare',
      cor: 'text-purple-600 bg-purple-100',
      categoria: 'Comunicação',
      popular: true,
      conectado: dados.integracoes?.includes('slack') || false
    },
    {
      id: 'google-workspace',
      nome: 'Google Workspace',
      descricao: 'Gmail, Calendar, Drive e Docs',
      icone: 'Mail',
      cor: 'text-blue-600 bg-blue-100',
      categoria: 'Produtividade',
      popular: true,
      conectado: dados.integracoes?.includes('google-workspace') || false
    },
    {
      id: 'github',
      nome: 'GitHub',
      descricao: 'Repositórios e controle de versão',
      icone: 'Github',
      cor: 'text-gray-600 bg-gray-100',
      categoria: 'Desenvolvimento',
      popular: true,
      conectado: dados.integracoes?.includes('github') || false
    },
    {
      id: 'zapier',
      nome: 'Zapier',
      descricao: 'Automação entre milhares de apps',
      icone: 'Zap',
      cor: 'text-orange-600 bg-orange-100',
      categoria: 'Automação',
      popular: true,
      conectado: dados.integracoes?.includes('zapier') || false
    },
    {
      id: 'trello',
      nome: 'Trello',
      descricao: 'Gestão de projetos com boards',
      icone: 'Kanban',
      cor: 'text-blue-600 bg-blue-100',
      categoria: 'Projeto',
      popular: false,
      conectado: dados.integracoes?.includes('trello') || false
    },
    {
      id: 'salesforce',
      nome: 'Salesforce',
      descricao: 'CRM e gestão de vendas',
      icone: 'Users',
      cor: 'text-blue-600 bg-blue-100',
      categoria: 'CRM',
      popular: false,
      conectado: dados.integracoes?.includes('salesforce') || false
    },
    {
      id: 'hubspot',
      nome: 'HubSpot',
      descricao: 'Marketing e automação de vendas',
      icone: 'Target',
      cor: 'text-orange-600 bg-orange-100',
      categoria: 'Marketing',
      popular: false,
      conectado: dados.integracoes?.includes('hubspot') || false
    },
    {
      id: 'jira',
      nome: 'Jira',
      descricao: 'Gestão ágil e tracking de issues',
      icone: 'Bug',
      cor: 'text-blue-600 bg-blue-100',
      categoria: 'Desenvolvimento',
      popular: false,
      conectado: dados.integracoes?.includes('jira') || false
    },
    {
      id: 'asana',
      nome: 'Asana',
      descricao: 'Gestão de tarefas e projetos',
      icone: 'CheckSquare',
      cor: 'text-pink-600 bg-pink-100',
      categoria: 'Projeto',
      popular: false,
      conectado: dados.integracoes?.includes('asana') || false
    },
    {
      id: 'microsoft-365',
      nome: 'Microsoft 365',
      descricao: 'Office, Teams e OneDrive',
      icone: 'Monitor',
      cor: 'text-blue-600 bg-blue-100',
      categoria: 'Produtividade',
      popular: false,
      conectado: dados.integracoes?.includes('microsoft-365') || false
    }
  ];

  // Filtrar integrações com base na busca
  const integracoesFiltradas = integracoes.filter(integracao =>
    integracao.nome.toLowerCase().includes(busca.toLowerCase()) ||
    integracao.categoria.toLowerCase().includes(busca.toLowerCase()) ||
    integracao.descricao.toLowerCase().includes(busca.toLowerCase())
  );

  // Agrupar por categoria
  const integracoesPorCategoria = integracoesFiltradas.reduce((acc, integracao) => {
    if (!acc[integracao.categoria]) {
      acc[integracao.categoria] = [];
    }
    acc[integracao.categoria].push(integracao);
    return acc;
  }, {} as Record<string, typeof integracoes>);

  const handleConectar = useCallback(async (integracaoId: string) => {
    if (!montadoRef.current) return;

    setConectando(integracaoId);

    try {
      // Simulação de conexão
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const integracaoAtual = integracoes.find(i => i.id === integracaoId);
      const novasIntegracoes = dados.integracoes?.includes(integracaoId)
        ? dados.integracoes.filter((id: string) => id !== integracaoId)
        : [...(dados.integracoes || []), integracaoId];
      
      onAtualizarDados({ integracoes: novasIntegracoes });
      
      const acao = dados.integracoes?.includes(integracaoId) ? 'desconectada' : 'conectada';
      toast.success(`${integracaoAtual?.nome} ${acao} com sucesso!`);
      
    } catch (error) {
      toast.error('Erro ao conectar integração');
    } finally {
      if (montadoRef.current) {
        setConectando(null);
      }
    }
  }, [dados.integracoes, onAtualizarDados]);

  const handleProxima = useCallback(() => {
    toast.success('Integrações configuradas! Vamos para o tutorial.');
    onProxima();
  }, [onProxima]);

  const renderizarIntegracao = useCallback((integracao: typeof integracoes[0]) => {
    const IconeComponente = LucideIcons[integracao.icone as keyof typeof LucideIcons] as any;
    const isConectando = conectando === integracao.id;
    const isConectada = integracao.conectado;

    return (
      <Card
        key={integracao.id}
        className={`transition-all hover:shadow-md ${
          isConectada ? 'border-green-500 bg-green-50' : 'border-gray-200'
        }`}
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${integracao.cor}`}>
                <IconeComponente className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-medium text-gray-900">{integracao.nome}</h3>
                  {integracao.popular && (
                    <Badge variant="secondary" className="text-xs">
                      Popular
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-gray-600">{integracao.descricao}</p>
              </div>
            </div>
            
            <Button
              variant={isConectada ? "outline" : "default"}
              size="sm"
              onClick={() => handleConectar(integracao.id)}
              disabled={isConectando}
              className={isConectada ? 'border-green-500 text-green-700' : ''}
            >
              {isConectando ? (
                <>
                  <LucideIcons.Loader2 className="mr-1 h-3 w-3 animate-spin" />
                  Conectando...
                </>
              ) : isConectada ? (
                <>
                  <LucideIcons.Check className="mr-1 h-3 w-3" />
                  Conectado
                </>
              ) : (
                <>
                  <LucideIcons.Plus className="mr-1 h-3 w-3" />
                  Conectar
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }, [conectando, handleConectar]);

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LucideIcons.Plug className="h-5 w-5" />
            Conectar Integrações
          </CardTitle>
          <CardDescription>
            Conecte suas ferramentas favoritas para uma experiência integrada. 
            Esta etapa é opcional - você pode fazer isso depois.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Busca */}
          <div className="relative">
            <LucideIcons.Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar integrações..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Integrações Populares */}
          {!busca && (
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">Integrações Populares</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {integracoes.filter(i => i.popular).map(renderizarIntegracao)}
              </div>
            </div>
          )}

          {/* Todas as Integrações por Categoria */}
          <div className="space-y-6">
            {!busca && <h3 className="font-medium text-gray-900">Todas as Integrações</h3>}
            
            {Object.entries(integracoesPorCategoria).map(([categoria, integracoesCategoria]) => (
              <div key={categoria} className="space-y-3">
                <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  {categoria}
                  <Badge variant="outline" className="text-xs">
                    {integracoesCategoria.length}
                  </Badge>
                </h4>
                <div className="grid grid-cols-1 gap-3">
                  {integracoesCategoria.map(renderizarIntegracao)}
                </div>
              </div>
            ))}
          </div>

          {integracoesFiltradas.length === 0 && (
            <div className="text-center py-8">
              <LucideIcons.Search className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhuma integração encontrada
              </h3>
              <p className="text-gray-500">
                Tente buscar por outro termo ou navegue pelas categorias
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resumo das integrações conectadas */}
      {dados.integracoes && dados.integracoes.length > 0 && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <LucideIcons.CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-green-900 mb-2">
                  {dados.integracoes.length} integrações configuradas
                </h3>
                <div className="flex flex-wrap gap-2">
                  {dados.integracoes.map((integracaoId: string) => {
                    const integracao = integracoes.find(i => i.id === integracaoId);
                    return integracao ? (
                      <Badge key={integracaoId} variant="secondary" className="bg-green-100 text-green-800">
                        {integracao.nome}
                      </Badge>
                    ) : null;
                  })}
                </div>
                <p className="text-sm text-green-700 mt-2">
                  Suas ferramentas estarão sincronizadas automaticamente após a conclusão do setup.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Informações sobre integrações */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <LucideIcons.Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-blue-900 mb-2">Sobre as Integrações</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Todas as conexões são seguras e criptografadas</li>
                <li>• Você pode adicionar ou remover integrações a qualquer momento</li>
                <li>• Algumas integrações podem ter planos premium específicos</li>
                <li>• Os dados são sincronizados em tempo real</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ações */}
      <div className="flex justify-between items-center pt-6">
        <Button
          variant="outline"
          onClick={onAnterior}
          disabled={salvando}
        >
          <LucideIcons.ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
        
        <div className="text-sm text-gray-500">
          Etapa {etapaAtual + 1} de {totalEtapas} • Opcional
        </div>
        
        <Button 
          onClick={handleProxima}
          disabled={salvando}
        >
          {salvando ? (
            <>
              <LucideIcons.Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              Continuar Tutorial
              <LucideIcons.ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}