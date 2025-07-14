'use client'

import React, { useState, useCallback, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { toast } from 'sonner'
import * as LucideIcons from 'lucide-react'

interface TeleconsultaProps {
  dados: any
}

export default function Teleconsulta({ dados }: TeleconsultaProps) {
  const [consultaAtiva, setConsultaAtiva] = useState<any>(null)
  const [videoAtivo, setVideoAtivo] = useState(false)
  const [audioAtivo, setAudioAtivo] = useState(true)
  const [telasCompartilhadas, setTelasCompartilhadas] = useState(false)
  const [tempoConsulta, setTempoConsulta] = useState(0)
  const [observacoes, setObservacoes] = useState('')
  const [consultasEmAndamento] = useState([
    {
      id: '1',
      paciente: 'Maria Silva',
      idade: 45,
      horario: '14:30',
      tipo: 'Cardiologia',
      status: 'aguardando',
      telefone: '(11) 99999-9999',
      observacoes: 'Paciente com histórico de hipertensão'
    },
    {
      id: '2',
      paciente: 'João Santos',
      idade: 32,
      horario: '15:00',
      tipo: 'Retorno',
      status: 'em_chamada',
      telefone: '(11) 88888-8888',
      observacoes: 'Acompanhamento pós-cirúrgico'
    }
  ])

  const montadoRef = useRef(true)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    montadoRef.current = true
    return () => { 
      montadoRef.current = false
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  const iniciarConsulta = useCallback((consulta: any) => {
    setConsultaAtiva(consulta)
    setVideoAtivo(true)
    setAudioAtivo(true)
    setTempoConsulta(0)
    toast.success(`Consulta iniciada com ${consulta.paciente}`)

    // Iniciar contador de tempo
    intervalRef.current = setInterval(() => {
      if (montadoRef.current) {
        setTempoConsulta(prev => prev + 1)
      }
    }, 1000)
  }, [])

  const finalizarConsulta = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
    
    toast.success('Consulta finalizada com sucesso')
    setConsultaAtiva(null)
    setVideoAtivo(false)
    setAudioAtivo(false)
    setTempoConsulta(0)
    setObservacoes('')
  }, [])

  const toggleVideo = useCallback(() => {
    setVideoAtivo(prev => !prev)
    toast.info(videoAtivo ? 'Câmera desligada' : 'Câmera ligada')
  }, [videoAtivo])

  const toggleAudio = useCallback(() => {
    setAudioAtivo(prev => !prev)
    toast.info(audioAtivo ? 'Microfone desligado' : 'Microfone ligado')
  }, [audioAtivo])

  const compartilharTela = useCallback(() => {
    setTelasCompartilhadas(prev => !prev)
    toast.info(telasCompartilhadas ? 'Parou de compartilhar tela' : 'Compartilhando tela')
  }, [telasCompartilhadas])

  const formatarTempo = (segundos: number) => {
    const mins = Math.floor(segundos / 60)
    const secs = segundos % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'aguardando': return 'bg-yellow-100 text-yellow-800'
      case 'em_chamada': return 'bg-green-100 text-green-800'
      case 'finalizada': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Consulta Ativa */}
      {consultaAtiva && (
        <Card className="border-green-200">
          <CardHeader className="bg-green-50">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <LucideIcons.Video className="mr-2 h-5 w-5 text-green-600" />
                Consulta em Andamento - {consultaAtiva.paciente}
              </div>
              <Badge className="bg-green-100 text-green-800">
                {formatarTempo(tempoConsulta)}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Área de Vídeo */}
              <div className="space-y-4">
                <div className="relative bg-gray-900 rounded-lg aspect-video">
                  <div className="absolute inset-0 flex items-center justify-center">
                    {videoAtivo ? (
                      <div className="text-white text-center">
                        <LucideIcons.Video className="h-16 w-16 mx-auto mb-4" />
                        <p>Vídeo do Paciente</p>
                        <p className="text-sm text-gray-300">{consultaAtiva.paciente}</p>
                      </div>
                    ) : (
                      <div className="text-white text-center">
                        <LucideIcons.VideoOff className="h-16 w-16 mx-auto mb-4" />
                        <p>Vídeo Desligado</p>
                      </div>
                    )}
                  </div>
                  
                  {/* Vídeo do Médico (PIP) */}
                  <div className="absolute bottom-4 right-4 w-32 h-24 bg-blue-600 rounded-lg flex items-center justify-center">
                    <div className="text-white text-center">
                      <LucideIcons.User className="h-8 w-8 mx-auto mb-1" />
                      <p className="text-xs">Você</p>
                    </div>
                  </div>
                </div>
                
                {/* Controles de Vídeo */}
                <div className="flex items-center justify-center space-x-4">
                  <Button
                    variant={audioAtivo ? "default" : "destructive"}
                    size="lg"
                    onClick={toggleAudio}
                    className="rounded-full w-12 h-12"
                  >
                    {audioAtivo ? (
                      <LucideIcons.Mic className="h-5 w-5" />
                    ) : (
                      <LucideIcons.MicOff className="h-5 w-5" />
                    )}
                  </Button>
                  
                  <Button
                    variant={videoAtivo ? "default" : "destructive"}
                    size="lg"
                    onClick={toggleVideo}
                    className="rounded-full w-12 h-12"
                  >
                    {videoAtivo ? (
                      <LucideIcons.Video className="h-5 w-5" />
                    ) : (
                      <LucideIcons.VideoOff className="h-5 w-5" />
                    )}
                  </Button>
                  
                  <Button
                    variant={telasCompartilhadas ? "default" : "outline"}
                    size="lg"
                    onClick={compartilharTela}
                    className="rounded-full w-12 h-12"
                  >
                    <LucideIcons.Monitor className="h-5 w-5" />
                  </Button>
                  
                  <Button
                    variant="destructive"
                    size="lg"
                    onClick={finalizarConsulta}
                    className="rounded-full w-12 h-12"
                  >
                    <LucideIcons.PhoneOff className="h-5 w-5" />
                  </Button>
                </div>
              </div>
              
              {/* Informações e Observações */}
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Informações do Paciente</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div><strong>Nome:</strong> {consultaAtiva.paciente}</div>
                      <div><strong>Idade:</strong> {consultaAtiva.idade} anos</div>
                      <div><strong>Tipo:</strong> {consultaAtiva.tipo}</div>
                      <div><strong>Telefone:</strong> {consultaAtiva.telefone}</div>
                      <div><strong>Observações:</strong> {consultaAtiva.observacoes}</div>
                    </div>
                  </CardContent>
                </Card>
                
                <div>
                  <Label htmlFor="observacoes">Observações da Consulta</Label>
                  <Textarea
                    id="observacoes"
                    value={observacoes}
                    onChange={(e) => setObservacoes(e.target.value)}
                    placeholder="Digite as observações e orientações..."
                    className="mt-2"
                    rows={4}
                  />
                </div>
                
                <div className="flex space-x-2">
                  <Button variant="outline" className="flex-1">
                    <LucideIcons.FileText className="mr-2 h-4 w-4" />
                    Gerar Receita
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <LucideIcons.Calendar className="mr-2 h-4 w-4" />
                    Agendar Retorno
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de Consultas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <LucideIcons.Users className="mr-2 h-5 w-5" />
            Consultas Hoje
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {consultasEmAndamento.map((consulta) => (
              <div key={consulta.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <LucideIcons.User className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium">{consulta.paciente}</div>
                    <div className="text-sm text-gray-500">
                      {consulta.idade} anos • {consulta.tipo}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="font-medium">{consulta.horario}</div>
                    <Badge className={getStatusColor(consulta.status)}>
                      {consulta.status === 'aguardando' ? 'Aguardando' : 
                       consulta.status === 'em_chamada' ? 'Em Chamada' : 'Finalizada'}
                    </Badge>
                  </div>
                  
                  <div className="flex space-x-2">
                    {consulta.status === 'aguardando' && (
                      <Button 
                        size="sm" 
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => iniciarConsulta(consulta)}
                      >
                        <LucideIcons.Video className="mr-2 h-4 w-4" />
                        Iniciar
                      </Button>
                    )}
                    
                    {consulta.status === 'em_chamada' && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => iniciarConsulta(consulta)}
                      >
                        <LucideIcons.Monitor className="mr-2 h-4 w-4" />
                        Entrar
                      </Button>
                    )}
                    
                    <Button size="sm" variant="outline">
                      <LucideIcons.FileText className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}