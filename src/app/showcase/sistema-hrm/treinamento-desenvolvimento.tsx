'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { toast } from 'sonner'
import * as LucideIcons from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { useMounted } from '@/hooks/use-mounted'

interface Treinamento {
  id: string;
  titulo: string;
  tipo: 'obrigatorio' | 'opcional' | 'desenvolvimento' | 'compliance';
  modalidade: 'presencial' | 'online' | 'hibrido';
  duracao: number;
  instrutor: string;
  data_inicio: string;
  data_fim: string;
  vagas_total: number;
  vagas_disponiveis: number;
  status: 'agendado' | 'em_andamento' | 'concluido' | 'cancelado';
  participantes: string[];
  certificacao: boolean;
}

interface TreinamentoDesenvolvimentoProps {
  dadosGlobais: any;
  onAtualizarDados: () => void;
}

export default function TreinamentoDesenvolvimento({ dadosGlobais, onAtualizarDados }: TreinamentoDesenvolvimentoProps) {
  const [treinamentos, setTreinamentos] = useState<Treinamento[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [modalTreinamento, setModalTreinamento] = useState<Treinamento | null>(null);
  const [modoModal, setModoModal] = useState<'visualizar' | 'criar' | 'editar'>('visualizar');
  const montadoRef = useMounted();

  const carregarTreinamentos = useCallback(async () => {
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
      const response = await new Promise<Treinamento[]>((resolve) => {
        setTimeout(() => {
          resolve([
            {
              id: '1',
              titulo: 'Onboarding Corporativo',
              tipo: 'obrigatorio',
              modalidade: 'online',
              duracao: 8,
              instrutor: 'RH',
              data_inicio: '2024-04-01',
              data_fim: '2024-04-02',
              vagas_total: 100,
              vagas_disponiveis: 20,
              status: 'em_andamento',
              participantes: ['Ana', 'João', 'Maria'],
              certificacao: true
            },
            {
              id: '2',
              titulo: 'Compliance LGPD',
              tipo: 'compliance',
              modalidade: 'online',
              duracao: 4,
              instrutor: 'Jurídico',
              data_inicio: '2024-03-10',
              data_fim: '2024-03-10',
              vagas_total: 50,
              vagas_disponiveis: 0,
              status: 'concluido',
              participantes: ['Ana', 'João'],
              certificacao: true
            },
            {
              id: '3',
              titulo: 'Liderança e Gestão',
              tipo: 'desenvolvimento',
              modalidade: 'presencial',
              duracao: 16,
              instrutor: 'Consultoria Externa',
              data_inicio: '2024-05-05',
              data_fim: '2024-05-06',
              vagas_total: 30,
              vagas_disponiveis: 10,
              status: 'agendado',
              participantes: [],
              certificacao: false
            }
          ]);
        }, 1200);
      });
      if (montadoRef.current) setTreinamentos(response);
    } catch (error) {
      if (montadoRef.current) setErro('Falha ao carregar treinamentos.');
    } finally {
      clearTimeout(timeoutId);
      if (montadoRef.current) setCarregando(false);
    }
  }, [montadoRef]);

  useEffect(() => { carregarTreinamentos(); }, [carregarTreinamentos]);

  if (carregando) return <div className="h-48 bg-gray-200 rounded-lg animate-pulse" />;
  if (erro) return <div className="bg-red-50 border p-6 rounded-lg text-center">{erro}</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Treinamento & Desenvolvimento</h2>
        <Button onClick={() => { setModalTreinamento(null); setModoModal('criar'); }}>
          <LucideIcons.Plus className="mr-2 h-4 w-4" />Novo Treinamento
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {treinamentos.map((treinamento) => (
          <Card key={treinamento.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LucideIcons.GraduationCap className="h-5 w-5 text-purple-600" />
                {treinamento.titulo}
                {treinamento.certificacao && <Badge variant="secondary">Certificação</Badge>}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Badge variant="outline">{treinamento.tipo.toUpperCase()}</Badge>
                <Badge variant="outline">{treinamento.modalidade}</Badge>
                <Badge variant="outline">{treinamento.status}</Badge>
              </div>
              <div className="text-sm text-gray-600">Instrutor: {treinamento.instrutor}</div>
              <div className="text-sm text-gray-600">Duração: {treinamento.duracao}h</div>
              <div className="text-sm text-gray-600">Início: {treinamento.data_inicio}</div>
              <div className="text-sm text-gray-600">Vagas: {treinamento.vagas_disponiveis}/{treinamento.vagas_total}</div>
              <Progress value={((treinamento.vagas_total - treinamento.vagas_disponiveis) / treinamento.vagas_total) * 100} className="h-2" />
              <Button variant="outline" size="sm" onClick={() => { setModalTreinamento(treinamento); setModoModal('visualizar'); }}>
                <LucideIcons.Eye className="h-4 w-4 mr-1" />Ver Detalhes
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
      {/* Modal de Treinamento */}
      {modalTreinamento && (
        <Dialog open={true} onOpenChange={() => setModalTreinamento(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{modalTreinamento.titulo}</DialogTitle>
              <DialogDescription>Detalhes do treinamento</DialogDescription>
            </DialogHeader>
            <div className="space-y-2">
              <div><strong>Tipo:</strong> {modalTreinamento.tipo}</div>
              <div><strong>Modalidade:</strong> {modalTreinamento.modalidade}</div>
              <div><strong>Instrutor:</strong> {modalTreinamento.instrutor}</div>
              <div><strong>Duração:</strong> {modalTreinamento.duracao}h</div>
              <div><strong>Data:</strong> {modalTreinamento.data_inicio} a {modalTreinamento.data_fim}</div>
              <div><strong>Status:</strong> {modalTreinamento.status}</div>
              <div><strong>Certificação:</strong> {modalTreinamento.certificacao ? 'Sim' : 'Não'}</div>
              <div><strong>Participantes:</strong> {modalTreinamento.participantes.join(', ')}</div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setModalTreinamento(null)}>Fechar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
} 