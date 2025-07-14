'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import * as LucideIcons from 'lucide-react'
import { useMounted } from '@/hooks/use-mounted'
import { toast } from 'sonner'

interface Relatorio {
  id: string;
  titulo: string;
  descricao: string;
  valor: number;
  variacao: number;
  unidade: string;
  icone: string;
  cor: string;
}

interface RelatoriosAnalyticsProps {
  dadosGlobais: any;
  onAtualizarDados: () => void;
}

export default function RelatoriosAnalytics({ dadosGlobais, onAtualizarDados }: RelatoriosAnalyticsProps) {
  const [relatorios, setRelatorios] = useState<Relatorio[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const montadoRef = useMounted();

  const carregarRelatorios = useCallback(async () => {
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
      const response = await new Promise<Relatorio[]>((resolve) => {
        setTimeout(() => {
          resolve([
            {
              id: '1',
              titulo: 'Turnover Anual',
              descricao: 'Taxa de rotatividade de colaboradores no ano',
              valor: 18.2,
              variacao: -1.3,
              unidade: '%',
              icone: 'TrendingDown',
              cor: 'text-green-600'
            },
            {
              id: '2',
              titulo: 'Satisfação Média',
              descricao: 'Média de satisfação dos colaboradores',
              valor: 4.3,
              variacao: 0.1,
              unidade: '/5',
              icone: 'Star',
              cor: 'text-yellow-600'
            },
            {
              id: '3',
              titulo: 'Custo Médio por Colaborador',
              descricao: 'Custo anual médio considerando folha e benefícios',
              valor: 102000,
              variacao: 2000,
              unidade: 'R$',
              icone: 'DollarSign',
              cor: 'text-blue-600'
            }
          ]);
        }, 1200);
      });
      if (montadoRef.current) setRelatorios(response);
    } catch (error) {
      if (montadoRef.current) setErro('Falha ao carregar relatórios.');
    } finally {
      clearTimeout(timeoutId);
      if (montadoRef.current) setCarregando(false);
    }
  }, [montadoRef]);

  useEffect(() => { carregarRelatorios(); }, [carregarRelatorios]);

  if (carregando) return <div className="h-48 bg-gray-200 rounded-lg animate-pulse" />;
  if (erro) return <div className="bg-red-50 border p-6 rounded-lg text-center">{erro}</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Relatórios & Analytics</h2>
        <Button variant="outline" onClick={() => toast('Exportação em breve!')}>
          <LucideIcons.Download className="mr-2 h-4 w-4" />Exportar Dados
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {relatorios.map((relatorio) => {
          const IconeComponente = LucideIcons[relatorio.icone as keyof typeof LucideIcons] as any;
          return (
            <Card key={relatorio.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <IconeComponente className={`h-5 w-5 ${relatorio.cor}`} />
                  {relatorio.titulo}
                </CardTitle>
                <CardDescription>{relatorio.descricao}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2 text-2xl font-bold">
                  {relatorio.unidade === 'R$' ? 'R$ ' : ''}{relatorio.valor}{relatorio.unidade !== 'R$' ? relatorio.unidade : ''}
                  <Badge variant={relatorio.variacao >= 0 ? 'default' : 'destructive'} className="ml-2 text-xs">
                    {relatorio.variacao >= 0 ? '+' : ''}{relatorio.variacao}{relatorio.unidade}
                  </Badge>
                </div>
                <Progress value={Math.abs(relatorio.variacao) * 10} className="h-2" />
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
} 