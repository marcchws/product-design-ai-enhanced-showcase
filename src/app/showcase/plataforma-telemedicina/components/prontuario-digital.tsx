'use client'

import React, { useState, useCallback, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { toast } from 'sonner'
import * as LucideIcons from 'lucide-react'

interface ProntuarioDigitalProps {
  dados: any
}

export default function ProntuarioDigital({ dados }: ProntuarioDigitalProps) {
  const [pacienteSelecionado, setPacienteSelecionado] = useState<any>(null)
  const [busca, setBusca] = useState('')
  const [carregando, setCarregando] = useState(false)
  const [novoPrescricao, setNovaPrescricao] = useState('')
  
  const [pacientes] = useState([
    {
      id: '1',
      nome: 'Maria Silva',
      idade: 45,
      cpf: '123.456.789-00',
      telefone: '(11) 99999-9999',
      email: 'maria.silva@email.com',
      convenio: 'Unimed',
      ultima_consulta: '2024-01-10',
      historico: [
        {
          data: '2024-01-10',
          tipo: 'Consulta',
          medico: 'Dr. Ricardo Santos',
          observacoes: 'Paciente apresentou melhora significativa na pressão arterial.',
          prescricoes: ['Losartana 50mg - 1x ao dia', 'Hidroclorotiazida 25mg - 1x ao dia']
        },
        {
          data: '2024-01-05',
          tipo: 'Exame',
          medico: 'Dr. Ricardo Santos',
          observacoes: 'Exame de sangue - Colesterol total: 180mg/dL',
          prescricoes: []
        }
      ]
    },
    {
      id: '2',
      nome: 'João Santos',
      idade: 32,
      cpf: '987.654.321-00',
      telefone: '(11) 88888-8888',
      email: 'joao.santos@email.com',
      convenio: 'Particular',
      ultima_consulta: '2024-01-08',
      historico: [
        {
          data: '2024-01-08',
          tipo: 'Consulta',
          medico: 'Dr. Ricardo Santos',
          observacoes: 'Acompanhamento pós-cirúrgico. Cicatrização dentro do esperado.',
          prescricoes: ['Dipirona 500mg - 8/8h se dor', 'Omeprazol 20mg - 1x ao dia']
        }
      ]
    }
  ])

  const montadoRef = useRef(true)

  useEffect(() => {
    montadoRef.current = true
    return () => { montadoRef.current = false }
  }, [])

  const pacientesFiltrados = pacientes.filter(paciente =>
    paciente.nome.toLowerCase().includes(busca.toLowerCase()) ||
    paciente.cpf.includes(busca)
  )

  const selecionarPaciente = useCallback((paciente: any) => {
    setPacienteSelecionado(paciente)
  }, [])

  const adicionarPrescricao = useCallback(async () => {
    if (!novoPrescricao.trim()) {
      toast.error('Digite a prescrição')
      return
    }

    setCarregando(true)

    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      if (montadoRef.current) {
        toast.success('Prescrição adicionada com sucesso')
        setNovaPrescricao('')
      }
    } catch (error) {
      if (montadoRef.current) {
        toast.error('Erro ao adicionar prescrição')
      }
    } finally {
      if (montadoRef.current) {
        setCarregando(false)
      }
    }
  }, [novoPrescricao])

  const formatarDataContextual = (dataString: string) => {
    const data = new Date(dataString)
    return data.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de Pacientes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <LucideIcons.Users className="mr-2 h-5 w-5" />
              Pacientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="relative">
                <LucideIcons.Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar paciente..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="pl-9"
                />
              </div>
              
              <div className="space-y-2">
                {pacientesFiltrados.map((paciente) => (
                  <div
                    key={paciente.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      pacienteSelecionado?.id === paciente.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => selecionarPaciente(paciente)}
                  >
                    <div className="font-medium">{paciente.nome}</div>
                    <div className="text-sm text-gray-500">{paciente.idade} anos</div>
                    <div className="text-sm text-gray-500">{paciente.convenio}</div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Prontuário do Paciente */}
        <div className="lg:col-span-2">
          {pacienteSelecionado ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <LucideIcons.FileText className="mr-2 h-5 w-5" />
                  Prontuário - {pacienteSelecionado.nome}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="dados" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="dados">Dados Pessoais</TabsTrigger>
                    <TabsTrigger value="historico">Histórico</TabsTrigger>
                    <TabsTrigger value="prescricoes">Prescrições</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="dados" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Nome Completo</Label>
                        <Input value={pacienteSelecionado.nome} readOnly />
                      </div>
                      <div>
                        <Label>Idade</Label>
                        <Input value={`${pacienteSelecionado.idade} anos`} readOnly />
                      </div>
                      <div>
                        <Label>CPF</Label>
                        <Input value={pacienteSelecionado.cpf} readOnly />
                      </div>
                      <div>
                        <Label>Telefone</Label>
                        <Input value={pacienteSelecionado.telefone} readOnly />
                      </div>
                      <div>
                        <Label>Email</Label>
                        <Input value={pacienteSelecionado.email} readOnly />
                      </div>
                      <div>
                        <Label>Convênio</Label>
                        <Input value={pacienteSelecionado.convenio} readOnly />
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="historico" className="space-y-4">
                    <div className="space-y-4">
                      {pacienteSelecionado.historico.map((registro: any, index: number) => (
                        <Card key={index}>
                          <CardContent className="pt-4">
                            <div className="flex items-center justify-between mb-2">
                              <Badge variant="outline">
                                {registro.tipo}
                              </Badge>
                              <span className="text-sm text-gray-500">
                                {formatarDataContextual(registro.data)}
                              </span>
                            </div>
                            <div className="space-y-2">
                              <div><strong>Médico:</strong> {registro.medico}</div>
                              <div><strong>Observações:</strong> {registro.observacoes}</div>
                              {registro.prescricoes.length > 0 && (
                                <div>
                                  <strong>Prescrições:</strong>
                                  <ul className="ml-4 mt-1 space-y-1">
                                    {registro.prescricoes.map((prescricao: string, idx: number) => (
                                      <li key={idx} className="text-sm">• {prescricao}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="prescricoes" className="space-y-4">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="nova-prescricao">Nova Prescrição</Label>
                        <Textarea
                          id="nova-prescricao"
                          value={novoPrescricao}
                          onChange={(e) => setNovaPrescricao(e.target.value)}
                          placeholder="Digite a prescrição médica..."
                          className="mt-2"
                        />
                        <Button 
                          onClick={adicionarPrescricao}
                          disabled={carregando}
                          className="mt-2"
                        >
                          {carregando ? (
                            <>
                              <LucideIcons.Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Adicionando...
                            </>
                          ) : (
                            <>
                              <LucideIcons.Plus className="mr-2 h-4 w-4" />
                              Adicionar Prescrição
                            </>
                          )}
                        </Button>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">Prescrições Recentes</h4>
                        <div className="space-y-2">
                          {pacienteSelecionado.historico
                            .filter((h: any) => h.prescricoes.length > 0)
                            .map((registro: any, index: number) => (
                              <Card key={index}>
                                <CardContent className="pt-4">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium">{registro.medico}</span>
                                    <span className="text-sm text-gray-500">
                                      {formatarDataContextual(registro.data)}
                                    </span>
                                  </div>
                                  <ul className="space-y-1">
                                    {registro.prescricoes.map((prescricao: string, idx: number) => (
                                      <li key={idx} className="text-sm">• {prescricao}</li>
                                    ))}
                                  </ul>
                                </CardContent>
                              </Card>
                            ))}
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-16">
                <div className="text-center">
                  <LucideIcons.FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Nenhum paciente selecionado</h3>
                  <p className="text-gray-500">Selecione um paciente da lista para ver seu prontuário</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}