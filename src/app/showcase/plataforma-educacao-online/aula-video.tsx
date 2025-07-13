'use client'

import React, { useState, useRef, useCallback, useEffect } from 'react'
import { toast } from 'sonner'
import * as LucideIcons from 'lucide-react'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"

interface AulaVideoProps {
  usuario: any;
  dados: any;
  carregando: boolean;
  erro: string | null;
  onRecarregar: () => void;
}

const EstadoLoading = () => (
  <div className="space-y-4">
    <div className="aspect-video bg-gray-200 rounded-lg animate-pulse flex items-center justify-center">
      <LucideIcons.Play className="h-16 w-16 text-gray-400" />
    </div>
    <div className="animate-pulse space-y-2">
      <div className="h-6 bg-gray-200 rounded w-3/4"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
    </div>
  </div>
);

const EstadoSemAula = () => (
  <div className="text-center py-16">
    <LucideIcons.PlayCircle className="h-16 w-16 text-gray-300 mx-auto mb-6" />
    <h3 className="text-xl font-medium mb-2">Nenhuma aula em progresso</h3>
    <p className="text-gray-500 max-w-md mx-auto mb-8">
      Selecione um curso para começar ou continue de onde parou.
    </p>
    <Button>
      <LucideIcons.BookOpen className="mr-2 h-4 w-4" />
      Ver Meus Cursos
    </Button>
  </div>
);

export default function AulaVideo({ 
  usuario, 
  dados, 
  carregando, 
  erro, 
  onRecarregar 
}: AulaVideoProps) {
  // Estados do player
  const [reproduzindo, setReproduzindo] = useState(false);
  const [progresso, setProgresso] = useState(0);
  const [volume, setVolume] = useState(80);
  const [velocidade, setVelocidade] = useState(1);
  const [telacheia, setTelacheia] = useState(false);
  const [legendas, setLegendas] = useState(true);
  
  // Estados de interação
  const [nota, setNota] = useState('');
  const [notas, setNotas] = useState<Array<{id: number; tempo: number; texto: string}>>([]);
  const [marcadores, setMarcadores] = useState<Array<{id: number; tempo: number; titulo: string}>>([]);

  const montadoRef = useRef(true);
  const videoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    montadoRef.current = true;
    return () => { montadoRef.current = false; };
  }, []);

  // Simular aula atual
  const aulaAtual = {
    id: 1,
    titulo: 'Context API e useReducer - React Avançado',
    curso: 'React Avançado',
    duracao: '25:30',
    descricao: 'Aprenda a gerenciar estado complexo em aplicações React usando Context API combinado com useReducer.',
    instrutor: 'Carlos Mendes',
    recursos: ['Código fonte', 'Slides', 'Exercícios práticos'],
    proxima_aula: 'Custom Hooks Avançados'
  };

  // Controles do player
  const toggleReproducao = useCallback(() => {
    setReproduzindo(prev => !prev);
    toast.success(reproduzindo ? 'Pausado' : 'Reproduzindo');
  }, [reproduzindo]);

  const alterarVelocidade = useCallback((novaVelocidade: number) => {
    setVelocidade(novaVelocidade);
    toast.info(`Velocidade: ${novaVelocidade}x`);
  }, []);

  const adicionarNota = useCallback(() => {
    if (!nota.trim()) return;

    const novaNota = {
      id: Date.now(),
      tempo: progresso,
      texto: nota
    };

    setNotas(prev => [...prev, novaNota]);
    setNota('');
    toast.success('Nota adicionada!');
  }, [nota, progresso]);

  const marcarMomento = useCallback(() => {
    const novoMarcador = {
      id: Date.now(),
      tempo: progresso,
      titulo: `Marcador ${progresso.toFixed(0)}%`
    };

    setMarcadores(prev => [...prev, novoMarcador]);
    toast.success('Momento marcado!');
  }, [progresso]);

  const pularPara = useCallback((tempo: number) => {
    setProgresso(tempo);
    toast.info(`Pulando para ${tempo.toFixed(0)}%`);
  }, []);

  const concluirAula = useCallback(() => {
    toast.success('Aula concluída!', {
      description: 'Próxima aula desbloqueada'
    });
  }, []);

  // Estados UI obrigatórios
  if (carregando) return <EstadoLoading />;
  if (!aulaAtual) return <EstadoSemAula />;

  return (
    <div className="space-y-6">
      {/* Player de vídeo */}
      <Card>
        <CardContent className="p-0">
          <div 
            ref={videoRef}
            className={`relative ${telacheia ? 'fixed inset-0 z-50 bg-black' : 'aspect-video'} bg-gray-900 rounded-t-lg overflow-hidden`}
          >
            {/* Área do vídeo simulada */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center">
              <div className="text-center text-white">
                <LucideIcons.Play className="h-24 w-24 mx-auto mb-4 opacity-80" />
                <p className="text-lg">Player de Vídeo Simulado</p>
                <p className="text-sm opacity-75">{aulaAtual.titulo}</p>
              </div>
            </div>

            {/* Controles de overlay */}
            <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-all flex items-center justify-center group">
              <Button
                size="lg"
                variant="secondary"
                className="opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={toggleReproducao}
              >
                {reproduzindo ? (
                  <LucideIcons.Pause className="h-8 w-8" />
                ) : (
                  <LucideIcons.Play className="h-8 w-8" />
                )}
              </Button>
            </div>

            {/* Barra de progresso no vídeo */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black to-transparent">
              <div className="space-y-2">
                <Progress value={progresso} className="h-1 bg-white/20" />
                <div className="flex items-center justify-between text-white text-sm">
                  <span>{Math.round(progresso)}% • {(progresso * 25.5 / 100).toFixed(1)}min</span>
                  <span>{aulaAtual.duracao}</span>
                </div>
              </div>
            </div>

            {/* Marcadores visuais */}
            <div className="absolute bottom-16 left-4 right-4">
              <div className="flex space-x-1">
                {marcadores.map(marcador => (
                  <button
                    key={marcador.id}
                    className="w-2 h-8 bg-yellow-500 rounded-sm opacity-75 hover:opacity-100"
                    style={{ marginLeft: `${marcador.tempo}%` }}
                    onClick={() => pularPara(marcador.tempo)}
                    title={marcador.titulo}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Controles do player */}
          <div className="p-4 bg-gray-50 border-t">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleReproducao}
                >
                  {reproduzindo ? (
                    <LucideIcons.Pause className="h-4 w-4" />
                  ) : (
                    <LucideIcons.Play className="h-4 w-4" />
                  )}
                </Button>

                <div className="flex items-center space-x-2">
                  <LucideIcons.Volume2 className="h-4 w-4" />
                  <div className="w-20">
                    <Slider
                      value={[volume]}
                      onValueChange={([valor]) => setVolume(valor)}
                      max={100}
                      step={1}
                      className="h-1"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-1">
                  {[0.5, 1, 1.25, 1.5, 2].map(vel => (
                    <Button
                      key={vel}
                      variant={velocidade === vel ? "default" : "ghost"}
                      size="sm"
                      onClick={() => alterarVelocidade(vel)}
                      className="text-xs px-2"
                    >
                      {vel}x
                    </Button>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={marcarMomento}
                >
                  <LucideIcons.Bookmark className="h-4 w-4" />
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setLegendas(!legendas)}
                >
                  <LucideIcons.Captions className="h-4 w-4" />
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setTelacheia(!telacheia)}
                >
                  <LucideIcons.Maximize className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informações da aula */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-xl">{aulaAtual.titulo}</CardTitle>
                  <CardDescription className="mt-1">
                    {aulaAtual.curso} • {aulaAtual.instrutor}
                  </CardDescription>
                </div>
                <Badge variant="outline">
                  {Math.round(progresso)}% concluído
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">{aulaAtual.descricao}</p>
              
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium mb-2">Recursos da Aula</h4>
                  <div className="flex flex-wrap gap-2">
                    {aulaAtual.recursos.map(recurso => (
                      <Button key={recurso} variant="outline" size="sm">
                        <LucideIcons.Download className="mr-2 h-3 w-3" />
                        {recurso}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <Button variant="outline">
                    <LucideIcons.ChevronLeft className="mr-2 h-4 w-4" />
                    Aula Anterior
                  </Button>
                  
                  <Button onClick={concluirAula}>
                    Próxima Aula
                    <LucideIcons.ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notas da aula */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Minhas Notas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Textarea
                    placeholder="Adicione uma nota sobre este momento da aula..."
                    value={nota}
                    onChange={(e) => setNota(e.target.value)}
                    className="flex-1"
                    rows={2}
                  />
                  <Button onClick={adicionarNota} disabled={!nota.trim()}>
                    <LucideIcons.Plus className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-3">
                  {notas.map(nota => (
                    <div key={nota.id} className="flex gap-3 p-3 bg-blue-50 rounded-lg">
                      <div className="text-xs text-blue-600 font-mono bg-blue-100 px-2 py-1 rounded">
                        {nota.tempo.toFixed(0)}%
                      </div>
                      <p className="text-sm flex-1">{nota.texto}</p>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => pularPara(nota.tempo)}
                      >
                        <LucideIcons.Play className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                  
                  {notas.length === 0 && (
                    <p className="text-gray-500 text-sm text-center py-4">
                      Nenhuma nota adicionada ainda
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Playlist e marcadores */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Marcadores</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {marcadores.map(marcador => (
                  <button
                    key={marcador.id}
                    className="w-full text-left p-2 hover:bg-gray-50 rounded flex items-center justify-between group"
                    onClick={() => pularPara(marcador.tempo)}
                  >
                    <div>
                      <p className="text-sm font-medium">{marcador.titulo}</p>
                      <p className="text-xs text-gray-500">{marcador.tempo.toFixed(0)}%</p>
                    </div>
                    <LucideIcons.Play className="h-3 w-3 opacity-0 group-hover:opacity-100" />
                  </button>
                ))}
                
                {marcadores.length === 0 && (
                  <p className="text-gray-500 text-sm text-center py-4">
                    Nenhum marcador criado
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Próxima Aula</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <LucideIcons.PlayCircle className="h-12 w-12 text-blue-600 mx-auto mb-3" />
                <h4 className="font-medium mb-1">{aulaAtual.proxima_aula}</h4>
                <p className="text-sm text-gray-500 mb-3">
                  Será desbloqueada ao concluir esta aula
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  disabled={progresso < 90}
                >
                  <LucideIcons.Lock className="mr-2 h-3 w-3" />
                  Bloqueada
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Simulador de progresso automático */}
      <div className="fixed bottom-4 right-4 opacity-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            const novoProgresso = Math.min(100, progresso + 10);
            setProgresso(novoProgresso);
            toast.info(`Progresso: ${novoProgresso}%`);
          }}
        >
          +10% Progresso
        </Button>
      </div>
    </div>
  );
}