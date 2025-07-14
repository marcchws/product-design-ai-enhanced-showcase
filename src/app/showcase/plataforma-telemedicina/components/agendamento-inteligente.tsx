'use client'

import React, { useState, useCallback, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { toast } from 'sonner'
import * as LucideIcons from 'lucide-react'

interface AgendamentoInteligenteProps {
  dados: any
}

export default function AgendamentoInteligente({ dados }: AgendamentoInteligenteProps) {
  const [data, setData] = useState<Date | undefined>(new Date())
  const [horarioSelecionado, setHorarioSelecionado] = useState<string>('')
  const [modalNovaConsulta, setModalNovaConsulta] = useState(false)
  const [carregandoHorarios, setCarregandoHorarios] = useState(false)
  const [consultasAgendadas, setConsultasAgendadas] = useState([
    {
      id: '1',
      paciente: 'Maria Silva',
      data: '2024-01-15',
      horario: '14:30',
      tipo: 'primeira_consulta',
      status: 'confirmada',
      telefone: '(11) 99999-9999',
      convenio: 'Unimed'
    },
    {
      id: '2',
      paciente: 'João Santos',
      data: '2024-01-15',
      horario: '15:00',
      tipo: 'retorno',
      status: 'pendente',
      telefone: '(11) 88888-8888',
      convenio: 'Particular'
    }
  ])

  const [horariosDisponiveis] = useState([
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
  ])

  const montadoRef = useRef(true)

  useEffect(() => {
    montadoRef.current = true
    return () => { montadoRef.current = false }
  }, [])

  const [novaConsulta, setNovaConsulta] = useState({
    paciente: '',
    telefone: '',
    email: '',
    tipo: 'primeira_consulta',
    convenio: 'particular',
    observacoes: ''
  })

  const handleAgendarConsulta = useCallback(async () => {
    if (!data || !horarioSelecionado || !novaConsulta.paciente) {
      toast.error('Preencha todos os campos obrigatórios')
      return
    }

    setCarregandoHorarios(true)

    try {
      await new Promise(resolve => setTimeout(resolve, 1500))

      const novaConsultaCompleta = {
        id: Date.now().toString(),
        paciente: novaConsulta.paciente,
        data: data.toISOString().split('T')[0],
        horario: horarioSelecionado,
        tipo: novaConsulta.tipo,
        status: 'confirmada',
        telefone: novaConsulta.telefone,
        convenio: novaConsulta.convenio
      }

      if (montadoRef.current) {
        setConsultasAgendadas(prev => [...prev, novaConsultaCompleta])
        setModalNovaConsulta(false)
        setNovaConsulta({
          paciente: '',
          telefone: '',
          email: '',
          tipo: 'primeira_consulta',
          convenio: 'particular',
          observacoes: ''
        })
        setHorarioSelecionado('')
        toast.success('Consulta agendada com sucesso!')
      }
    } catch (error) {
      if (montadoRef.current) {
        toast.error('Erro ao agendar consulta')
      }
    } finally {
      if (montadoRef.current) {
        setCarregandoHorarios(false)
      }
    }
  }, [data, horarioSelecionado, novaConsulta])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmada': return 'bg-green-100 text-green-800'
      case 'pendente': return 'bg-yellow-100 text-yellow-800'
      case 'cancelada': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTipoLabel = (tipo: string) => {
    switch (tipo) {
      case 'primeira_consulta': return 'Primeira Consulta'
      case 'retorno': return 'Retorno'
      case 'urgencia': return 'Urgência'
      default: return tipo
    }
  }

  return (
    <div className="space-y-6">
      {/* Ações principais */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Agendamento Inteligente</h2>
          <p className="text-gray-600">Gerencie consultas e horários disponíveis</p>
        </div>
        <Button onClick={() => setModalNovaConsulta(true)}>
          <LucideIcons.Plus className="mr-2 h-4 w-4" />
          Nova Consulta
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Calendário */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <LucideIcons.Calendar className="mr-2 h-5 w-5" />
              Calendário
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={data}
              onSelect={setData}
              className="rounded-md border"
            />
          </CardContent>
        </Card>

        {/* Horários Disponíveis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <LucideIcons.Clock className="mr-2 h-5 w-5" />
              Horários Disponíveis
              {data && (
                <span className="ml-2 text-sm text-gray-500">
                  {data.toLocaleDateString('pt-BR')}
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-2">
              {horariosDisponiveis.map((horario) => (
                <Button
                  key={horario}
                  variant={horarioSelecionado === horario ? "default" : "outline"}
                  size="sm"
                  onClick={() => setHorarioSelecionado(horario)}
                  className="text-sm"
                >
                  {horario}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Consultas Agendadas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <LucideIcons.List className="mr-2 h-5 w-5" />
            Consultas Agendadas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {consultasAgendadas.map((consulta) => (
              <div key={consulta.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <LucideIcons.User className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium">{consulta.paciente}</div>
                    <div className="text-sm text-gray-500">
                      {getTipoLabel(consulta.tipo)} • {consulta.convenio}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="font-medium">
                      {new Date(consulta.data).toLocaleDateString('pt-BR')} às {consulta.horario}
                    </div>
                    <Badge className={getStatusColor(consulta.status)}>
                      {consulta.status === 'confirmada' ? 'Confirmada' : 
                       consulta.status === 'pendente' ? 'Pendente' : 'Cancelada'}
                    </Badge>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline">
                      <LucideIcons.Edit className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <LucideIcons.Phone className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <LucideIcons.Video className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Modal Nova Consulta */}
      <Dialog open={modalNovaConsulta} onOpenChange={setModalNovaConsulta}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Agendar Nova Consulta</DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="paciente">Nome do Paciente</Label>
              <Input
                id="paciente"
                value={novaConsulta.paciente}
                onChange={(e) => setNovaConsulta(prev => ({ ...prev, paciente: e.target.value }))}
                placeholder="Digite o nome completo"
              />
            </div>
            
            <div>
              <Label htmlFor="telefone">Telefone</Label>
              <Input
                id="telefone"
                value={novaConsulta.telefone}
                onChange={(e) => setNovaConsulta(prev => ({ ...prev, telefone: e.target.value }))}
                placeholder="(11) 99999-9999"
              />
            </div>
            
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={novaConsulta.email}
                onChange={(e) => setNovaConsulta(prev => ({ ...prev, email: e.target.value }))}
                placeholder="email@exemplo.com"
              />
            </div>
            
            <div>
              <Label htmlFor="tipo">Tipo de Consulta</Label>
              <Select 
                value={novaConsulta.tipo} 
                onValueChange={(value) => setNovaConsulta(prev => ({ ...prev, tipo: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="primeira_consulta">Primeira Consulta</SelectItem>
                  <SelectItem value="retorno">Retorno</SelectItem>
                  <SelectItem value="urgencia">Urgência</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="convenio">Convênio</Label>
              <Select 
                value={novaConsulta.convenio} 
                onValueChange={(value) => setNovaConsulta(prev => ({ ...prev, convenio: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o convênio" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="particular">Particular</SelectItem>
                  <SelectItem value="unimed">Unimed</SelectItem>
                  <SelectItem value="bradesco">Bradesco Saúde</SelectItem>
                  <SelectItem value="sul_america">Sul América</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="horario">Horário</Label>
              <Select 
                value={horarioSelecionado} 
                onValueChange={setHorarioSelecionado}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o horário" />
                </SelectTrigger>
                <SelectContent>
                  {horariosDisponiveis.map((horario) => (
                    <SelectItem key={horario} value={horario}>
                      {horario}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalNovaConsulta(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAgendarConsulta} disabled={carregandoHorarios}>
              {carregandoHorarios ? (
                <>
                  <LucideIcons.Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Agendando...
                </>
              ) : (
                <>
                  <LucideIcons.Calendar className="mr-2 h-4 w-4" />
                  Agendar Consulta
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}