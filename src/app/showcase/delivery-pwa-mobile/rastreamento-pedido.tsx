'use client'

import React, { useState, useCallback, useEffect, useMemo } from 'react'
import { toast } from 'sonner'
import * as LucideIcons from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface Pedido {
  id: string;
  usuario_id: string;
  restaurante: { nome: string };
  itens: Array<{
    produto: { nome: string };
    quantidade: number;
    preco_total: number;
  }>;
  endereco_entrega: {
    logradouro: string;
    numero: string;
    complemento?: string;
    bairro: string;
  };
  metodo_pagamento: {
    tipo: string;
  };
  subtotal: number;
  taxa_entrega: number;
  total: number;
  status: 'confirmado' | 'preparando' | 'saiu_entrega' | 'entregue' | 'cancelado';
  tempo_estimado: number;
  created_at: string;
  entregador?: {
    id: string;
    nome: string;
    telefone: string;
    avaliacao: number;
    localizacao_atual: { latitude: number; longitude: number };
    foto: string;
  };
  tracking: Array<{
    timestamp: string;
    status: string;
    localizacao?: { latitude: number; longitude: number };
    observacao?: string;
  }>;
}

interface Props {
  pedido: Pedido;
  onVoltarInicio: () => void;
  localizacaoUsuario: { latitude: number; longitude: number };
}

const formatarMoeda = (valor: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(valor);
};

const formatarTempo = (dataISO: string): string => {
  const data = new Date(dataISO);
  return data.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const calcularTempoDecorrido = (dataISO: string): string => {
  const agora = new Date();
  const inicio = new Date(dataISO);
  const diferenca = Math.floor((agora.getTime() - inicio.getTime()) / 1000 / 60);
  
  if (diferenca < 1) return 'Agora mesmo';
  if (diferenca === 1) return '1 minuto atrás';
  if (diferenca < 60) return `${diferenca} minutos atrás`;
  
  const horas = Math.floor(diferenca / 60);
  if (horas === 1) return '1 hora atrás';
  return `${horas} horas atrás`;
};

type StatusType = 'confirmado' | 'preparando' | 'saiu_entrega' | 'entregue' | 'cancelado';

const obterStatusInfo = (status: string) => {
  const configs = {
    'confirmado': {
      texto: 'Pedido confirmado',
      cor: 'text-blue-600',
      bgCor: 'bg-blue-100',
      icone: 'CheckCircle',
      descricao: 'Seu pedido foi confirmado e enviado para o restaurante'
    },
    'preparando': {
      texto: 'Preparando',
      cor: 'text-yellow-600',
      bgCor: 'bg-yellow-100',
      icone: 'Clock',
      descricao: 'O restaurante está preparando seu pedido'
    },
    'saiu_entrega': {
      texto: 'Saiu para entrega',
      cor: 'text-orange-600',
      bgCor: 'bg-orange-100',
      icone: 'Truck',
      descricao: 'Seu pedido está a caminho'
    },
    'entregue': {
      texto: 'Entregue',
      cor: 'text-green-600',
      bgCor: 'bg-green-100',
      icone: 'CheckCircle2',
      descricao: 'Pedido entregue com sucesso'
    },
    'cancelado': {
      texto: 'Cancelado',
      cor: 'text-red-600',
      bgCor: 'bg-red-100',
      icone: 'XCircle',
      descricao: 'Pedido cancelado'
    }
  };
  
  return configs[status as StatusType] || configs['confirmado'];
};

export default function RastreamentoPedido({
  pedido,
  onVoltarInicio,
  localizacaoUsuario
}: Props) {
  const [trackingAtualizado, setTrackingAtualizado] = useState(pedido.tracking);
  const [tempoRestante, setTempoRestante] = useState(pedido.tempo_estimado);
  const [carregandoLocalizacao, setCarregandoLocalizacao] = useState(false);

  const montadoRef = React.useRef(true);

  useEffect(() => {
    montadoRef.current = true;
    return () => { montadoRef.current = false; };
  }, []);

  // Simular atualizações em tempo real
  useEffect(() => {
    if (pedido.status === 'entregue' || pedido.status === 'cancelado') return;

    const intervalo = setInterval(() => {
      if (!montadoRef.current) return;

      // Reduzir tempo restante
      setTempoRestante(prev => Math.max(0, prev - 1));

      // Simular progresso do pedido
      const tempoDecorrido = Math.floor((Date.now() - new Date(pedido.created_at).getTime()) / 1000 / 60);
      
      if (tempoDecorrido > 5 && pedido.status === 'confirmado') {
        // Atualizar para preparando após 5 minutos
        const novoTracking = {
          timestamp: new Date().toISOString(),
          status: 'preparando',
          observacao: 'Restaurante iniciou o preparo do seu pedido'
        };
        setTrackingAtualizado(prev => [...prev, novoTracking]);
      } else if (tempoDecorrido > 15 && pedido.status === 'preparando') {
        // Atualizar para saiu_entrega após 15 minutos
        const novoTracking = {
          timestamp: new Date().toISOString(),
          status: 'saiu_entrega',
          observacao: 'Entregador saiu com seu pedido',
          localizacao: { latitude: -23.564200, longitude: -46.657500 }
        };
        setTrackingAtualizado(prev => [...prev, novoTracking]);
      }
    }, 60000); // Atualizar a cada minuto

    return () => clearInterval(intervalo);
  }, [pedido]);

  // Calcular progresso do pedido
  const progressoPedido = useMemo(() => {
    const statusOrder = ['confirmado', 'preparando', 'saiu_entrega', 'entregue'];
    const statusAtual = trackingAtualizado[trackingAtualizado.length - 1]?.status || pedido.status;
    const indiceAtual = statusOrder.indexOf(statusAtual);
    
    if (indiceAtual === -1) return 0;
    return ((indiceAtual + 1) / statusOrder.length) * 100;
  }, [trackingAtualizado, pedido.status]);

  // Status atual
  const statusAtual = trackingAtualizado[trackingAtualizado.length - 1]?.status || pedido.status;
  const infoStatus = obterStatusInfo(statusAtual);

  // Carregar localização do entregador
  const carregarLocalizacaoEntregador = useCallback(async () => {
    if (!pedido.entregador) return;

    setCarregandoLocalizacao(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (montadoRef.current) {
        toast.success('Localização atualizada');
      }
    } catch (error) {
      if (montadoRef.current) {
        toast.error('Erro ao carregar localização');
      }
    } finally {
      if (montadoRef.current) {
        setCarregandoLocalizacao(false);
      }
    }
  }, [pedido.entregador]);

  return (
    <div className="space-y-4">
      {/* Status principal */}
      <Card>
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${infoStatus.bgCor}`}>
              {React.createElement(
                LucideIcons[infoStatus.icone as keyof typeof LucideIcons] as any,
                { className: `h-8 w-8 ${infoStatus.cor}` }
              )}
            </div>
            
            <div>
              <h2 className="text-xl font-bold mb-1">{infoStatus.texto}</h2>
              <p className="text-gray-600">{infoStatus.descricao}</p>
            </div>

            {/* Tempo estimado */}
            {statusAtual !== 'entregue' && statusAtual !== 'cancelado' && (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-center gap-2 text-sm text-gray-600 mb-2">
                  <LucideIcons.Clock className="h-4 w-4" />
                  <span>Tempo estimado</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {tempoRestante > 0 ? `${tempoRestante} min` : 'A qualquer momento'}
                </div>
              </div>
            )}

            {/* Progresso */}
            <div className="space-y-2">
              <Progress value={progressoPedido} className="h-2" />
              <div className="flex justify-between text-xs text-gray-500">
                <span>Confirmado</span>
                <span>Preparando</span>
                <span>Saiu</span>
                <span>Entregue</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Informações do entregador */}
      {pedido.entregador && statusAtual === 'saiu_entrega' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Seu entregador</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-gray-200 rounded-full overflow-hidden">
                <img 
                  src={pedido.entregador.foto}
                  alt={pedido.entregador.nome}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = '/api/placeholder/48/48';
                  }}
                />
              </div>
              
              <div className="flex-1">
                <h3 className="font-medium">{pedido.entregador.nome}</h3>
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <LucideIcons.Star className="h-3 w-3 text-yellow-400 fill-current" />
                  <span>{pedido.entregador.avaliacao}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={carregarLocalizacaoEntregador}
                  disabled={carregandoLocalizacao}
                >
                  {carregandoLocalizacao ? (
                    <LucideIcons.Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <LucideIcons.MapPin className="h-4 w-4" />
                  )}
                </Button>
                
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    if (pedido.entregador?.telefone) {
                      window.open(`tel:${pedido.entregador.telefone}`);
                    }
                  }}
                >
                  <LucideIcons.Phone className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Timeline do pedido */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Acompanhar pedido</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {trackingAtualizado.map((evento, index) => {
              const infoEvento = obterStatusInfo(evento.status);
              const isUltimo = index === trackingAtualizado.length - 1;
              
              return (
                <div key={index} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                      isUltimo ? infoEvento.bgCor : 'bg-gray-100'
                    }`}>
                      {React.createElement(
                        LucideIcons[infoEvento.icone as keyof typeof LucideIcons] as any,
                        { 
                          className: `h-4 w-4 ${
                            isUltimo ? infoEvento.cor : 'text-gray-400'
                          }` 
                        }
                      )}
                    </div>
                    {index < trackingAtualizado.length - 1 && (
                      <div className="w-px h-6 bg-gray-200 mt-2"></div>
                    )}
                  </div>
                  
                  <div className="flex-1 pb-4">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className={`font-medium ${isUltimo ? infoEvento.cor : 'text-gray-600'}`}>
                        {infoEvento.texto}
                      </h4>
                      <span className="text-xs text-gray-500">
                        {formatarTempo(evento.timestamp)}
                      </span>
                    </div>
                    
                    {evento.observacao && (
                      <p className="text-sm text-gray-600">{evento.observacao}</p>
                    )}
                    
                    <p className="text-xs text-gray-500 mt-1">
                      {calcularTempoDecorrido(evento.timestamp)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Detalhes do pedido */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Detalhes do pedido</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Número do pedido</span>
            <span className="font-medium">{pedido.id}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Restaurante</span>
            <span className="font-medium">{pedido.restaurante.nome}</span>
          </div>
          
          <div className="border-t pt-3">
            <h4 className="font-medium mb-2">Itens do pedido</h4>
            <div className="space-y-2">
              {pedido.itens.map((item, index) => (
                <div key={index} className="flex justify-between items-center text-sm">
                  <span>
                    {item.quantidade}x {item.produto.nome}
                  </span>
                  <span className="font-medium">
                    {formatarMoeda(item.preco_total)}
                  </span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="border-t pt-3 space-y-1">
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span>{formatarMoeda(pedido.subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Taxa de entrega</span>
              <span>{formatarMoeda(pedido.taxa_entrega)}</span>
            </div>
            <div className="flex justify-between font-medium border-t pt-1">
              <span>Total</span>
              <span>{formatarMoeda(pedido.total)}</span>
            </div>
          </div>
          
          <div className="border-t pt-3">
            <div className="flex justify-between items-start text-sm">
              <span className="text-gray-600">Endereço de entrega</span>
              <div className="text-right">
                <p className="font-medium">
                  {pedido.endereco_entrega.logradouro}, {pedido.endereco_entrega.numero}
                </p>
                {pedido.endereco_entrega.complemento && (
                  <p className="text-gray-600">{pedido.endereco_entrega.complemento}</p>
                )}
                <p className="text-gray-600">{pedido.endereco_entrega.bairro}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ações */}
      <div className="space-y-3">
        {statusAtual === 'entregue' && (
          <Button variant="outline" className="w-full">
            <LucideIcons.Star className="mr-2 h-4 w-4" />
            Avaliar pedido
          </Button>
        )}
        
        <Button onClick={onVoltarInicio} className="w-full">
          <LucideIcons.Home className="mr-2 h-4 w-4" />
          Fazer novo pedido
        </Button>
      </div>
    </div>
  );
}