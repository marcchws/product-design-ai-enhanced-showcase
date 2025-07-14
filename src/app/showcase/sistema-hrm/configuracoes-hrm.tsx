'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import * as LucideIcons from 'lucide-react'
import { useMounted } from '@/hooks/use-mounted'
import { toast } from 'sonner'

interface ParametroSistema {
  id: string;
  nome: string;
  descricao: string;
  valor: boolean;
}

interface Integracao {
  id: string;
  nome: string;
  status: 'ativa' | 'inativa';
  descricao: string;
}

interface ConfiguracoesHRMProps {
  dadosGlobais: any;
  onAtualizarDados: () => void;
}

export default function ConfiguracoesHRM({ dadosGlobais, onAtualizarDados }: ConfiguracoesHRMProps) {
  const [parametros, setParametros] = useState<ParametroSistema[]>([]);
  const [integracoes, setIntegracoes] = useState<Integracao[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const montadoRef = useMounted();

  const carregarConfiguracoes = useCallback(async () => {
    if (!montadoRef.current) return;
    setCarregando(true);
    setErro(null);
    const timeoutId = setTimeout(() => {
      if (montadoRef.current) {
        setCarregando(false);
        setErro('Tempo de carregamento excedido.');
      }
    }, 8000);
    try {
      // Simulação de API
      const response = await new Promise<{ parametros: ParametroSistema[]; integracoes: Integracao[] }>((resolve) => {
        setTimeout(() => {
          resolve({
            parametros: [
              { id: '1', nome: 'Aprovação automática de férias', descricao: 'Permite aprovar férias automaticamente', valor: true },
              { id: '2', nome: 'Notificações por e-mail', descricao: 'Envia notificações importantes por e-mail', valor: false },
              { id: '3', nome: 'Permitir login social', descricao: 'Habilita login via Google/Microsoft', valor: true }
            ],
            integracoes: [
              { id: '1', nome: 'Folha de Pagamento', status: 'ativa', descricao: 'Integração com sistema de folha externo' },
              { id: '2', nome: 'Plataforma de Benefícios', status: 'ativa', descricao: 'Integração com benefícios corporativos' },
              { id: '3', nome: 'Single Sign-On (SSO)', status: 'inativa', descricao: 'Integração com SSO corporativo' }
            ]
          });
        }, 1200);
      });
      if (montadoRef.current) {
        setParametros(response.parametros);
        setIntegracoes(response.integracoes);
      }
    } catch (error) {
      if (montadoRef.current) setErro('Falha ao carregar configurações.');
    } finally {
      clearTimeout(timeoutId);
      if (montadoRef.current) setCarregando(false);
    }
  }, [montadoRef]);

  useEffect(() => { carregarConfiguracoes(); }, [carregarConfiguracoes]);

  const handleToggleParametro = useCallback((id: string) => {
    setParametros(prev => prev.map(p => p.id === id ? { ...p, valor: !p.valor } : p));
    toast.success('Parâmetro atualizado!');
  }, []);

  if (carregando) return <div className="h-48 bg-gray-200 rounded-lg animate-pulse" />;
  if (erro) return <div className="bg-red-50 border p-6 rounded-lg text-center">{erro}</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Configurações do Sistema</h2>
        <Button variant="outline" onClick={() => toast('Funcionalidade avançada em breve!')}>
          <LucideIcons.Settings className="mr-2 h-4 w-4" />Avançado
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Parâmetros do Sistema</CardTitle>
            <CardDescription>Configurações gerais e políticas</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {parametros.map((param) => (
              <div key={param.id} className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{param.nome}</div>
                  <div className="text-xs text-gray-500">{param.descricao}</div>
                </div>
                <Switch checked={param.valor} onCheckedChange={() => handleToggleParametro(param.id)} />
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Integrações</CardTitle>
            <CardDescription>Conexões com sistemas externos</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {integracoes.map((intg) => (
              <div key={intg.id} className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{intg.nome}</div>
                  <div className="text-xs text-gray-500">{intg.descricao}</div>
                </div>
                <Badge variant={intg.status === 'ativa' ? 'default' : 'destructive'}>{intg.status}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 