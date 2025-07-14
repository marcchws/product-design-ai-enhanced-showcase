'use client'

import React, { useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import * as LucideIcons from 'lucide-react'

interface DashboardMedicoProps {
  dados: any
}

export default function DashboardMedico({ dados }: DashboardMedicoProps) {
  const [consultasHoje] = useState([
    {
      id: '1',
      paciente: 'Maria Silva',
      horario: '14:30',
      tipo: 'Cardiologia - Consulta',
      status: 'agendada',
      avatar: '/avatars/maria.jpg'
    },
    {
      id: '2',
      paciente: 'João Santos',
      horario: '15:00',
      tipo: 'Cardiologia - Retorno',
      status: 'em_andamento',
      avatar: '/avatars/joao.jpg'
    },
    {
      id: '3',
      paciente: 'Ana Costa',
      horario: '15:30',
      tipo: 'Cardiologia - Urgência',
      status: 'agendada',
      avatar: '/avatars/ana.jpg'
    }
  ])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'agendada': return 'bg-blue-100 text-blue-800'
      case 'em_andamento': return 'bg-green-100 text-green-800'
      case 'finalizada': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Próximas Consultas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <LucideIcons.Clock className="mr-2 h-5 w-5" />
            Próximas Consultas - Hoje
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {consultasHoje.map((consulta) => (
              <div key={consulta.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <LucideIcons.User className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium">{consulta.paciente}</div>
                    <div className="text-sm text-gray-500">{consulta.tipo}</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <div className="font-medium">{consulta.horario}</div>
                    <Badge className={getStatusColor(consulta.status)}>
                      {consulta.status === 'agendada' ? 'Agendada' : 
                       consulta.status === 'em_andamento' ? 'Em Andamento' : 'Finalizada'}
                    </Badge>
                  </div>
                  
                  {consulta.status === 'em_andamento' ? (
                    <Button size="sm" className="bg-green-600 hover:bg-green-700">
                      <LucideIcons.Video className="mr-2 h-4 w-4" />
                      Entrar
                    </Button>
                  ) : (
                    <Button size="sm" variant="outline">
                      <LucideIcons.Eye className="mr-2 h-4 w-4" />
                      Detalhes
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Gráficos e Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Consultas por Semana</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center">
                <LucideIcons.BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">Gráfico de consultas</p>
                <p className="text-sm text-gray-400">Dados simulados</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Avaliações dos Pacientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Excelente</span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                  </div>
                  <span className="text-sm">85%</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span>Bom</span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '12%' }}></div>
                  </div>
                  <span className="text-sm">12%</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span>Regular</span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div className="bg-yellow-600 h-2 rounded-full" style={{ width: '3%' }}></div>
                  </div>
                  <span className="text-sm">3%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}