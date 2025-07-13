'use client'

import React, { useState, useRef, useCallback, useEffect, useMemo, Fragment } from 'react'
import { toast, Toaster } from 'sonner'
import * as LucideIcons from 'lucide-react'

// Componentes UI com importação individual
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"

// Interfaces TypeScript para sistema hospitalar
interface PacienteHospitalar {
  id: string;
  nome: string;
  cpf: string;
  data_nascimento: string;
  plano_saude: string;
  leito: string;
  status: 'internado' | 'ambulatorial' | 'alta' | 'transferido' | 'obito';
  urgencia: 'critico' | 'alto' | 'medio' | 'baixo' | 'estavel';
  medico_responsavel: string;
  data_admissao: string;
  diagnostico_principal: string;
  alergias: string[];
  medicacoes_ativas: MedicacaoHospitalar[];
  exames_pendentes: ExameHospitalar[];
}

interface MedicacaoHospitalar {
  id: string;
  nome: string;
  dosagem: string;
  via_administracao: string;
  horarios: string[];
  medico_prescritor: string;
  data_prescricao: string;
  status: 'ativa' | 'suspensa' | 'concluida';
  observacoes?: string;
}

interface ExameHospitalar {
  id: string;
  tipo: string;
  solicitante: string;
  data_solicitacao: string;
  urgencia: 'critico' | 'alto' | 'medio' | 'baixo';
  status: 'solicitado' | 'coletado' | 'processando' | 'concluido' | 'cancelado';
  resultado?: string;
  observacoes?: string;
}

interface LeitoHospitalar {
  id: string;
  numero: string;
  setor: string;
  tipo: 'enfermaria' | 'semi_intensivo' | 'uti' | 'isolamento';
  status: 'ocupado' | 'livre' | 'limpeza' | 'manutencao' | 'bloqueado';
  paciente_id?: string;
  equipamentos: string[];
  ultima_limpeza?: string;
}

interface AgendaMedica {
  id: string;
  medico_id: string;
  data: string;
  horario_inicio: string;
  horario_fim: string;
  tipo: 'consulta' | 'cirurgia' | 'procedimento' | 'emergencia';
  paciente_id?: string;
  status: 'agendado' | 'em_andamento' | 'concluido' | 'cancelado';
  observacoes?: string;
}

// Funções utilitárias defensivas específicas para ambiente hospitalar
const gerarIniciaisNome = (nome: string | undefined): string => {
  if (!nome) return '??';
  
  try {
    const nomeLimpo = nome.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const partesNome = nomeLimpo.trim().split(' ').filter(parte => parte.length > 0);
    
    if (partesNome.length === 0) return '??';
    if (partesNome.length === 1) {
      return partesNome[0].substring(0, 2).toUpperCase();
    }
    
    const primeiraLetra = partesNome[0][0] || '?';
    const ultimaLetra = partesNome[partesNome.length - 1][0] || '?';
    
    return (primeiraLetra + ultimaLetra).toUpperCase();
  } catch (error) {
    console.error('Erro ao gerar iniciais:', error);
    return '??';
  }
};

const formatarDataHospitalar = (
  dataString: string | undefined, 
  formato: 'curta' | 'media' | 'longa' | 'relativa' = 'media'
): string => {
  if (!dataString) return 'N/A';
  
  try {
    const data = new Date(dataString);
    
    if (isNaN(data.getTime())) {
      return 'Data inválida';
    }
    
    const agora = new Date();
    const diferenca = agora.getTime() - data.getTime();
    const horas = Math.floor(diferenca / (1000 * 60 * 60));
    const dias = Math.floor(diferenca / (1000 * 60 * 60 * 24));
    
    switch (formato) {
      case 'relativa':
        if (horas < 1) return 'Agora há pouco';
        if (horas < 24) return `${horas}h atrás`;
        if (dias === 1) return 'Ontem';
        if (dias < 7) return `${dias} dias atrás`;
        return data.toLocaleDateString('pt-BR');
      
      case 'curta':
        return data.toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: '2-digit'
        });
      
      case 'longa':
        return data.toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      
      default: // 'media'
        return data.toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });
    }
  } catch (error) {
    console.error('Erro ao formatar data:', error);
    return 'Erro de formato';
  }
};

const formatarUrgenciaHospitalar = (
  urgencia: string | undefined
): { texto: string; cor: string; icone: string; badge: 'default' | 'destructive' | 'outline' | 'secondary' } => {
  if (!urgencia) {
    return { 
      texto: 'Indefinido', 
      cor: 'text-gray-500', 
      icone: 'HelpCircle', 
      badge: 'secondary' 
    };
  }
  
  const urgenciaLower = urgencia.toLowerCase();
  
  switch (urgenciaLower) {
    case 'critico':
      return { 
        texto: 'CRÍTICO', 
        cor: 'text-red-600 animate-pulse', 
        icone: 'AlertTriangle', 
        badge: 'destructive' 
      };
    
    case 'alto':
      return { 
        texto: 'Alto', 
        cor: 'text-orange-600', 
        icone: 'AlertCircle', 
        badge: 'outline' 
      };
    
    case 'medio':
      return { 
        texto: 'Médio', 
        cor: 'text-yellow-600', 
        icone: 'Clock', 
        badge: 'outline' 
      };
    
    case 'baixo':
      return { 
        texto: 'Baixo', 
        cor: 'text-blue-600', 
        icone: 'Info', 
        badge: 'secondary' 
      };
    
    case 'estavel':
      return { 
        texto: 'Estável', 
        cor: 'text-green-600', 
        icone: 'CheckCircle', 
        badge: 'outline' 
      };
    
    default:
      return { 
        texto: urgencia, 
        cor: 'text-gray-600', 
        icone: 'Circle', 
        badge: 'secondary' 
      };
  }
};

const formatarStatusLeitoHospitalar = (
  status: string | undefined
): { texto: string; cor: string; icone: string; badge: 'default' | 'destructive' | 'outline' | 'secondary' } => {
  if (!status) {
    return { 
      texto: 'Indefinido', 
      cor: 'text-gray-500', 
      icone: 'HelpCircle', 
      badge: 'secondary' 
    };
  }
  
  const statusLower = status.toLowerCase();
  
  switch (statusLower) {
    case 'ocupado':
      return { 
        texto: 'Ocupado', 
        cor: 'text-red-600', 
        icone: 'UserCheck', 
        badge: 'destructive' 
      };
    
    case 'livre':
      return { 
        texto: 'Livre', 
        cor: 'text-green-600', 
        icone: 'CheckCircle', 
        badge: 'outline' 
      };
    
    case 'limpeza':
      return { 
        texto: 'Limpeza', 
        cor: 'text-blue-600', 
        icone: 'Sparkles', 
        badge: 'secondary' 
      };
    
    case 'manutencao':
      return { 
        texto: 'Manutenção', 
        cor: 'text-orange-600', 
        icone: 'Wrench', 
        badge: 'outline' 
      };
    
    case 'bloqueado':
      return { 
        texto: 'Bloqueado', 
        cor: 'text-gray-600', 
        icone: 'Ban', 
        badge: 'secondary' 
      };
    
    default:
      return { 
        texto: status, 
        cor: 'text-gray-600', 
        icone: 'Circle', 
        badge: 'secondary' 
      };
  }
};

// Dados mock para sistema hospitalar
const pacientesMock: PacienteHospitalar[] = [
  {
    id: '1',
    nome: 'Maria Santos Silva',
    cpf: '123.456.789-00',
    data_nascimento: '1965-03-15',
    plano_saude: 'Unimed',
    leito: '101-A',
    status: 'internado',
    urgencia: 'critico',
    medico_responsavel: 'Dr. João Cardiologista',
    data_admissao: '2024-07-10T08:30:00Z',
    diagnostico_principal: 'Infarto Agudo do Miocárdio',
    alergias: ['Dipirona', 'Penicilina'],
    medicacoes_ativas: [
      {
        id: 'm1',
        nome: 'Aspirina',
        dosagem: '100mg',
        via_administracao: 'Oral',
        horarios: ['08:00', '20:00'],
        medico_prescritor: 'Dr. João Cardiologista',
        data_prescricao: '2024-07-10T09:00:00Z',
        status: 'ativa'
      }
    ],
    exames_pendentes: [
      {
        id: 'e1',
        tipo: 'Ecocardiograma',
        solicitante: 'Dr. João Cardiologista',
        data_solicitacao: '2024-07-12T10:00:00Z',
        urgencia: 'alto',
        status: 'solicitado'
      }
    ]
  },
  {
    id: '2',
    nome: 'Carlos Eduardo Oliveira',
    cpf: '987.654.321-00',
    data_nascimento: '1978-11-22',
    plano_saude: 'Bradesco Saúde',
    leito: '205-B',
    status: 'internado',
    urgencia: 'medio',
    medico_responsavel: 'Dra. Ana Pneumologista',
    data_admissao: '2024-07-11T14:15:00Z',
    diagnostico_principal: 'Pneumonia Bacteriana',
    alergias: [],
    medicacoes_ativas: [
      {
        id: 'm2',
        nome: 'Amoxicilina',
        dosagem: '500mg',
        via_administracao: 'Oral',
        horarios: ['08:00', '14:00', '20:00'],
        medico_prescritor: 'Dra. Ana Pneumologista',
        data_prescricao: '2024-07-11T15:00:00Z',
        status: 'ativa'
      }
    ],
    exames_pendentes: [
      {
        id: 'e2',
        tipo: 'Raio-X Tórax',
        solicitante: 'Dra. Ana Pneumologista',
        data_solicitacao: '2024-07-13T08:00:00Z',
        urgencia: 'medio',
        status: 'coletado'
      }
    ]
  },
  {
    id: '3',
    nome: 'José Roberto Costa',
    cpf: '456.789.123-00',
    data_nascimento: '1943-07-08',
    plano_saude: 'SUS',
    leito: '310-A',
    status: 'internado',
    urgencia: 'alto',
    medico_responsavel: 'Dr. Paulo Geriatra',
    data_admissao: '2024-07-09T16:45:00Z',
    diagnostico_principal: 'Insuficiência Cardíaca Congestiva',
    alergias: ['Contraste iodado'],
    medicacoes_ativas: [
      {
        id: 'm3',
        nome: 'Furosemida',
        dosagem: '40mg',
        via_administracao: 'Endovenosa',
        horarios: ['06:00', '18:00'],
        medico_prescritor: 'Dr. Paulo Geriatra',
        data_prescricao: '2024-07-09T17:00:00Z',
        status: 'ativa'
      }
    ],
    exames_pendentes: []
  },
  {
    id: '4',
    nome: 'Ana Paula Ferreira',
    cpf: '789.123.456-00',
    data_nascimento: '1992-05-30',
    plano_saude: 'Hapvida',
    leito: '102-B',
    status: 'internado',
    urgencia: 'estavel',
    medico_responsavel: 'Dra. Lucia Obstetra',
    data_admissao: '2024-07-12T22:30:00Z',
    diagnostico_principal: 'Pós-parto Normal',
    alergias: [],
    medicacoes_ativas: [
      {
        id: 'm4',
        nome: 'Paracetamol',
        dosagem: '750mg',
        via_administracao: 'Oral',
        horarios: ['08:00', '14:00', '20:00', '02:00'],
        medico_prescritor: 'Dra. Lucia Obstetra',
        data_prescricao: '2024-07-12T23:00:00Z',
        status: 'ativa'
      }
    ],
    exames_pendentes: []
  }
];

const leitosMock: LeitoHospitalar[] = [
  {
    id: '1',
    numero: '101-A',
    setor: 'Cardiologia',
    tipo: 'semi_intensivo',
    status: 'ocupado',
    paciente_id: '1',
    equipamentos: ['Monitor cardíaco', 'Oxímetro', 'Bomba de infusão'],
    ultima_limpeza: '2024-07-10T06:00:00Z'
  },
  {
    id: '2',
    numero: '101-B',
    setor: 'Cardiologia',
    tipo: 'enfermaria',
    status: 'livre',
    equipamentos: ['Monitor básico'],
    ultima_limpeza: '2024-07-13T08:00:00Z'
  },
  {
    id: '3',
    numero: '205-A',
    setor: 'Pneumologia',
    tipo: 'enfermaria',
    status: 'limpeza',
    equipamentos: ['Oxímetro', 'Nebulizador'],
    ultima_limpeza: '2024-07-13T09:00:00Z'
  },
  {
    id: '4',
    numero: '205-B',
    setor: 'Pneumologia',
    tipo: 'enfermaria',
    status: 'ocupado',
    paciente_id: '2',
    equipamentos: ['Monitor básico', 'Oxímetro'],
    ultima_limpeza: '2024-07-11T06:00:00Z'
  },
  {
    id: '5',
    numero: '310-A',
    setor: 'Geriatria',
    tipo: 'enfermaria',
    status: 'ocupado',
    paciente_id: '3',
    equipamentos: ['Monitor cardíaco', 'Oxímetro'],
    ultima_limpeza: '2024-07-09T06:00:00Z'
  },
  {
    id: '6',
    numero: '102-B',
    setor: 'Maternidade',
    tipo: 'enfermaria',
    status: 'ocupado',
    paciente_id: '4',
    equipamentos: ['Monitor básico'],
    ultima_limpeza: '2024-07-12T20:00:00Z'
  }
];

const agendaMedicaMock: AgendaMedica[] = [
  {
    id: '1',
    medico_id: 'med1',
    data: '2024-07-13',
    horario_inicio: '08:00',
    horario_fim: '12:00',
    tipo: 'consulta',
    status: 'agendado'
  },
  {
    id: '2',
    medico_id: 'med2',
    data: '2024-07-13',
    horario_inicio: '14:00',
    horario_fim: '18:00',
    tipo: 'cirurgia',
    paciente_id: '5',
    status: 'agendado',
    observacoes: 'Cirurgia cardíaca - sala 3'
  }
];

// Componente principal do sistema hospitalar
export default function SistemaGestaoHospitalar() {
  // Estados globais do sistema hospitalar
  const [abaSelecionada, setAbaSelecionada] = useState<string>('emergencia');
  const [pacientes, setPacientes] = useState<PacienteHospitalar[]>([]);
  const [leitos, setLeitos] = useState<LeitoHospitalar[]>([]);
  const [agenda, setAgenda] = useState<AgendaMedica[]>([]);
  
  // Estados de controle
  const [carregandoPorAba, setCarregandoPorAba] = useState<Record<string, boolean>>({});
  const [erroPorAba, setErroPorAba] = useState<Record<string, string | null>>({});
  const [abasCarregadas, setAbasCarregadas] = useState<Set<string>>(new Set(['emergencia']));
  const [alertasCriticos, setAlertasCriticos] = useState<number>(0);
  
  // Prevenção de memory leaks obrigatória
  const montadoRef = useRef(true);
  
  useEffect(() => {
    montadoRef.current = true;
    
    // Carregar dados da aba inicial
    carregarDadosAba('emergencia');
    
    // Simular contagem de alertas críticos
    const pacientesCriticos = pacientesMock.filter(p => p.urgencia === 'critico').length;
    setAlertasCriticos(pacientesCriticos);
    
    return () => {
      montadoRef.current = false;
    };
  }, []);
  
  // Configuração de abas do sistema hospitalar
  const configuracaoAbas = useMemo(() => [
    { 
      id: 'emergencia', 
      label: 'Emergência', 
      icone: 'AlertTriangle',
      badge: alertasCriticos > 0 ? alertasCriticos : null,
      cor: alertasCriticos > 0 ? 'text-red-600' : 'text-gray-600',
      lazy: false
    },
    { 
      id: 'internacao', 
      label: 'Internação', 
      icone: 'Bed',
      badge: pacientes.filter(p => p.status === 'internado').length || null,
      cor: 'text-blue-600',
      lazy: true
    },
    { 
      id: 'cirurgia', 
      label: 'Cirurgia', 
      icone: 'Scissors',
      badge: agenda.filter(a => a.tipo === 'cirurgia' && a.status === 'agendado').length || null,
      cor: 'text-purple-600',
      lazy: true
    },
    { 
      id: 'leitos', 
      label: 'Leitos', 
      icone: 'Building',
      badge: leitos.filter(l => l.status === 'livre').length || null,
      cor: 'text-green-600',
      lazy: true
    },
    { 
      id: 'laboratorio', 
      label: 'Laboratório', 
      icone: 'FlaskConical',
      badge: null,
      cor: 'text-orange-600',
      lazy: true
    },
    { 
      id: 'farmacia', 
      label: 'Farmácia', 
      icone: 'Pill',
      badge: null,
      cor: 'text-teal-600',
      lazy: true
    }
  ], [alertasCriticos, pacientes.length, agenda.length, leitos.length]);
  
  // Carregamento de dados por aba
  const carregarDadosAba = useCallback(async (abaId: string) => {
    if (!montadoRef.current) return;
    
    if (abasCarregadas.has(abaId)) {
      return;
    }
    
    setCarregandoPorAba(prev => ({ ...prev, [abaId]: true }));
    setErroPorAba(prev => ({ ...prev, [abaId]: null }));
    
    const timeoutId = setTimeout(() => {
      if (montadoRef.current) {
        setCarregandoPorAba(prev => ({ ...prev, [abaId]: false }));
        setErroPorAba(prev => ({ 
          ...prev, 
          [abaId]: 'Tempo de carregamento excedido. Sistema hospitalar requer conexão estável.' 
        }));
      }
    }, 8000);
    
    try {
      // Simular carregamento de dados específicos por aba
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (montadoRef.current) {
        // Carregar dados específicos baseado na aba
        switch (abaId) {
          case 'emergencia':
          case 'internacao':
            setPacientes(pacientesMock);
            break;
          case 'leitos':
            setLeitos(leitosMock);
            break;
          case 'cirurgia':
            setAgenda(agendaMedicaMock);
            break;
          default:
            // Outras abas podem ter dados específicos
            break;
        }
        
        setAbasCarregadas(prev => {
          const newSet = new Set(prev);
          newSet.add(abaId);
          return newSet;
        });
        toast.success(`Dados de ${abaId} carregados com sucesso`);
      }
    } catch (error) {
      console.error(`Erro ao carregar aba ${abaId}:`, error);
      if (montadoRef.current) {
        setErroPorAba(prev => ({ 
          ...prev, 
          [abaId]: 'Falha ao carregar dados. Verifique a conexão e tente novamente.' 
        }));
        toast.error(`Falha ao carregar dados de ${abaId}`);
      }
    } finally {
      clearTimeout(timeoutId);
      if (montadoRef.current) {
        setCarregandoPorAba(prev => ({ ...prev, [abaId]: false }));
      }
    }
  }, [abasCarregadas]);
  
  // Handler para mudança de aba
  const handleMudarAba = useCallback((novaAba: string) => {
    if (novaAba === abaSelecionada) return;
    
    setAbaSelecionada(novaAba);
    
    const configAba = configuracaoAbas.find(aba => aba.id === novaAba);
    if (configAba?.lazy && !abasCarregadas.has(novaAba)) {
      setTimeout(() => {
        if (montadoRef.current) {
          carregarDadosAba(novaAba);
        }
      }, 150);
    }
  }, [abaSelecionada, configuracaoAbas, abasCarregadas, carregarDadosAba]);
  
  // Renderização das abas com badges específicas para hospital
  const renderizarAba = useCallback((aba: typeof configuracaoAbas[0]) => {
    const IconeComponente = LucideIcons[aba.icone as keyof typeof LucideIcons] as any;
    const isAtiva = abaSelecionada === aba.id;
    const isCarregando = carregandoPorAba[aba.id];
    
    return (
      <TabsTrigger 
        key={aba.id}
        value={aba.id} 
        className="relative data-[state=active]:bg-white"
        disabled={isCarregando}
      >
        <div className="flex items-center gap-2">
          {isCarregando ? (
            <LucideIcons.Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <IconeComponente className={`h-4 w-4 ${aba.cor}`} />
          )}
          <span>{aba.label}</span>
          {aba.badge && (
            <Badge 
              variant={aba.id === 'emergencia' && aba.badge ? 'destructive' : 'secondary'} 
              className="ml-1 text-xs"
            >
              {aba.badge}
            </Badge>
          )}
        </div>
      </TabsTrigger>
    );
  }, [abaSelecionada, carregandoPorAba]);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100">
      <Toaster position="bottom-right" richColors />
      
      {/* Header do sistema hospitalar */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <LucideIcons.Heart className="h-8 w-8 text-red-500" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Sistema Hospitalar</h1>
                  <p className="text-sm text-gray-600">Gestão Integrada de Pacientes</p>
                </div>
              </div>
              
              {/* Alertas críticos no header */}
              {alertasCriticos > 0 && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 px-3 py-2 rounded-lg">
                  <LucideIcons.AlertTriangle className="h-5 w-5 text-red-600 animate-pulse" />
                  <span className="text-red-800 font-medium">
                    {alertasCriticos} paciente(s) crítico(s)
                  </span>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm">
                <LucideIcons.ArrowLeft className="mr-2 h-4 w-4" />
                Voltar ao Portfolio
              </Button>
              
              <Button variant="outline" size="sm">
                <LucideIcons.Info className="mr-2 h-4 w-4" />
                Sobre Este Sistema
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Sistema de abas principal */}
      <div className="max-w-7xl mx-auto p-6">
        <Tabs value={abaSelecionada} onValueChange={handleMudarAba} className="h-full">
          <TabsList className="grid w-full grid-cols-6 mb-6 bg-gray-100">
            {configuracaoAbas.map(renderizarAba)}
          </TabsList>
          
          {/* Conteúdo da aba Emergência */}
          <TabsContent value="emergencia" className="mt-0">
            <ModuloEmergencia 
              pacientes={pacientes.filter(p => ['critico', 'alto'].includes(p.urgencia))}
              carregando={carregandoPorAba.emergencia}
              erro={erroPorAba.emergencia}
              onRecarregar={() => carregarDadosAba('emergencia')}
            />
          </TabsContent>
          
          {/* Conteúdo da aba Internação */}
          <TabsContent value="internacao" className="mt-0">
            <ModuloInternacao 
              pacientes={pacientes.filter(p => p.status === 'internado')}
              carregando={carregandoPorAba.internacao}
              erro={erroPorAba.internacao}
              onRecarregar={() => carregarDadosAba('internacao')}
            />
          </TabsContent>
          
          {/* Conteúdo da aba Cirurgia */}
          <TabsContent value="cirurgia" className="mt-0">
            <ModuloCirurgia 
              agenda={agenda}
              carregando={carregandoPorAba.cirurgia}
              erro={erroPorAba.cirurgia}
              onRecarregar={() => carregarDadosAba('cirurgia')}
            />
          </TabsContent>
          
          {/* Conteúdo da aba Leitos */}
          <TabsContent value="leitos" className="mt-0">
            <ModuloLeitos 
              leitos={leitos}
              carregando={carregandoPorAba.leitos}
              erro={erroPorAba.leitos}
              onRecarregar={() => carregarDadosAba('leitos')}
            />
          </TabsContent>
          
          {/* Conteúdo da aba Laboratório */}
          <TabsContent value="laboratorio" className="mt-0">
            <ModuloLaboratorio 
              exames={pacientes.flatMap(p => p.exames_pendentes)}
              carregando={carregandoPorAba.laboratorio}
              erro={erroPorAba.laboratorio}
              onRecarregar={() => carregarDadosAba('laboratorio')}
            />
          </TabsContent>
          
          {/* Conteúdo da aba Farmácia */}
          <TabsContent value="farmacia" className="mt-0">
            <ModuloFarmacia 
              medicacoes={pacientes.flatMap(p => p.medicacoes_ativas)}
              carregando={carregandoPorAba.farmacia}
              erro={erroPorAba.farmacia}
              onRecarregar={() => carregarDadosAba('farmacia')}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// Módulo de Emergência - Pacientes críticos
function ModuloEmergencia({ 
  pacientes, 
  carregando, 
  erro, 
  onRecarregar 
}: {
  pacientes: PacienteHospitalar[];
  carregando?: boolean;
  erro?: string | null;
  onRecarregar: () => void;
}) {
  if (carregando) {
    return (
      <div className="flex justify-center items-center py-16">
        <div className="text-center">
          <div className="animate-spin h-10 w-10 border-4 border-red-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-500">Carregando dados de emergência...</p>
        </div>
      </div>
    );
  }
  
  if (erro) {
    return (
      <div className="bg-red-50 border border-red-200 p-8 rounded-lg text-center">
        <LucideIcons.AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">Erro no sistema de emergência</h3>
        <p className="text-gray-700 mb-6">{erro}</p>
        <Button onClick={onRecarregar} variant="destructive">
          <LucideIcons.RefreshCw className="mr-2 h-4 w-4" />
          Reconectar Sistema Crítico
        </Button>
      </div>
    );
  }
  
  if (!pacientes.length) {
    return (
      <div className="text-center py-16">
        <LucideIcons.CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-6" />
        <h3 className="text-xl font-medium mb-2">Nenhuma emergência ativa</h3>
        <p className="text-gray-500 max-w-md mx-auto mb-8">
          Todos os pacientes estão em condição estável. O sistema está monitorando continuamente.
        </p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-red-600">Central de Emergência</h2>
          <p className="text-gray-600">{pacientes.length} paciente(s) requerem atenção prioritária</p>
        </div>
        <Button onClick={onRecarregar} variant="outline">
          <LucideIcons.RefreshCw className="mr-2 h-4 w-4" />
          Atualizar
        </Button>
      </div>
      
      <div className="grid gap-4">
        {pacientes.map(paciente => {
          const urgencia = formatarUrgenciaHospitalar(paciente.urgencia);
          
          return (
            <Card key={paciente.id} className="border-l-4 border-l-red-500">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback className="bg-red-100 text-red-700">
                        {gerarIniciaisNome(paciente.nome)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">{paciente.nome}</CardTitle>
                      <CardDescription>Leito {paciente.leito} • {paciente.medico_responsavel}</CardDescription>
                    </div>
                  </div>
                  
                  <Badge variant={urgencia.badge} className={urgencia.cor}>
                    <LucideIcons.TriangleAlert className="h-3 w-3 mr-1" />
                    {urgencia.texto}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Diagnóstico</p>
                    <p className="text-sm">{paciente.diagnostico_principal}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-600">Admissão</p>
                    <p className="text-sm">{formatarDataHospitalar(paciente.data_admissao, 'relativa')}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-600">Plano de Saúde</p>
                    <p className="text-sm">{paciente.plano_saude}</p>
                  </div>
                </div>
                
                {paciente.alergias.length > 0 && (
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <LucideIcons.AlertTriangle className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm font-medium text-yellow-800">Alergias:</span>
                      <span className="text-sm text-yellow-700">{paciente.alergias.join(', ')}</span>
                    </div>
                  </div>
                )}
                
                <div className="flex justify-end gap-2 mt-4">
                  <Button size="sm" variant="outline">
                    <LucideIcons.FileText className="mr-2 h-4 w-4" />
                    Prontuário
                  </Button>
                  <Button size="sm" variant="outline">
                    <LucideIcons.Activity className="mr-2 h-4 w-4" />
                    Sinais Vitais
                  </Button>
                  <Button size="sm">
                    <LucideIcons.Stethoscope className="mr-2 h-4 w-4" />
                    Atender
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// Módulo de Internação - Todos os pacientes internados
function ModuloInternacao({ 
  pacientes, 
  carregando, 
  erro, 
  onRecarregar 
}: {
  pacientes: PacienteHospitalar[];
  carregando?: boolean;
  erro?: string | null;
  onRecarregar: () => void;
}) {
  const [filtroUrgencia, setFiltroUrgencia] = useState('todos');
  const [filtroSetor, setFiltroSetor] = useState('todos');
  
  const pacientesFiltrados = useMemo(() => {
    return pacientes.filter(paciente => {
      const matchUrgencia = filtroUrgencia === 'todos' || paciente.urgencia === filtroUrgencia;
      // Para o filtro de setor, extraímos do leito (assumindo formato "XXX-A" onde XXX indica setor)
      const setor = paciente.leito?.substring(0, 1) || '';
      const matchSetor = filtroSetor === 'todos' || setor === filtroSetor;
      
      return matchUrgencia && matchSetor;
    });
  }, [pacientes, filtroUrgencia, filtroSetor]);
  
  if (carregando) {
    return (
      <div className="flex justify-center items-center py-16">
        <div className="text-center">
          <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-500">Carregando dados de internação...</p>
        </div>
      </div>
    );
  }
  
  if (erro) {
    return (
      <div className="bg-red-50 border border-red-200 p-8 rounded-lg text-center">
        <LucideIcons.AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">Erro ao carregar internações</h3>
        <p className="text-gray-700 mb-6">{erro}</p>
        <Button onClick={onRecarregar}>
          <LucideIcons.RefreshCw className="mr-2 h-4 w-4" />
          Tentar Novamente
        </Button>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-blue-600">Pacientes Internados</h2>
          <p className="text-gray-600">{pacientesFiltrados.length} de {pacientes.length} paciente(s)</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Select value={filtroUrgencia} onValueChange={setFiltroUrgencia}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Urgência" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todas as Urgências</SelectItem>
              <SelectItem value="critico">Crítico</SelectItem>
              <SelectItem value="alto">Alto</SelectItem>
              <SelectItem value="medio">Médio</SelectItem>
              <SelectItem value="baixo">Baixo</SelectItem>
              <SelectItem value="estavel">Estável</SelectItem>
            </SelectContent>
          </Select>
          
          <Button onClick={onRecarregar} variant="outline">
            <LucideIcons.RefreshCw className="mr-2 h-4 w-4" />
            Atualizar
          </Button>
        </div>
      </div>
      
      {pacientesFiltrados.length === 0 ? (
        <div className="text-center py-16">
          <LucideIcons.Bed className="h-16 w-16 text-gray-300 mx-auto mb-6" />
          <h3 className="text-xl font-medium mb-2">Nenhum paciente encontrado</h3>
          <p className="text-gray-500 max-w-md mx-auto">
            Não há pacientes internados que correspondam aos filtros selecionados.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {pacientesFiltrados.map(paciente => {
            const urgencia = formatarUrgenciaHospitalar(paciente.urgencia);
            
            return (
              <Card key={paciente.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>
                          {gerarIniciaisNome(paciente.nome)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">{paciente.nome}</CardTitle>
                        <CardDescription>
                          Leito {paciente.leito} • {paciente.medico_responsavel}
                        </CardDescription>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge variant={urgencia.badge} className={urgencia.cor}>
                        <LucideIcons.Bed className="h-3 w-3 mr-1" />
                        {urgencia.texto}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Diagnóstico</p>
                      <p className="text-sm">{paciente.diagnostico_principal}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-600">Internação</p>
                      <p className="text-sm">{formatarDataHospitalar(paciente.data_admissao, 'relativa')}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-600">Plano</p>
                      <p className="text-sm">{paciente.plano_saude}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-600">Medicações</p>
                      <p className="text-sm">{paciente.medicacoes_ativas.length} ativa(s)</p>
                    </div>
                  </div>
                  
                  {paciente.exames_pendentes.length > 0 && (
                    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <LucideIcons.FlaskConical className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-800">
                          {paciente.exames_pendentes.length} exame(s) pendente(s)
                        </span>
                      </div>
                      <div className="text-sm text-blue-700">
                        {paciente.exames_pendentes.map(exame => exame.tipo).join(', ')}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex justify-end gap-2">
                    <Button size="sm" variant="outline">
                      <LucideIcons.FileText className="mr-2 h-4 w-4" />
                      Evolução
                    </Button>
                    <Button size="sm" variant="outline">
                      <LucideIcons.Pill className="mr-2 h-4 w-4" />
                      Prescrições
                    </Button>
                    <Button size="sm">
                      <LucideIcons.UserCheck className="mr-2 h-4 w-4" />
                      Visitar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Módulo de Cirurgia
function ModuloCirurgia({ 
  agenda, 
  carregando, 
  erro, 
  onRecarregar 
}: {
  agenda: AgendaMedica[];
  carregando?: boolean;
  erro?: string | null;
  onRecarregar: () => void;
}) {
  if (carregando) {
    return (
      <div className="flex justify-center items-center py-16">
        <div className="text-center">
          <div className="animate-spin h-10 w-10 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-500">Carregando agenda cirúrgica...</p>
        </div>
      </div>
    );
  }
  
  if (erro) {
    return (
      <div className="bg-red-50 border border-red-200 p-8 rounded-lg text-center">
        <LucideIcons.AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">Erro ao carregar agenda cirúrgica</h3>
        <p className="text-gray-700 mb-6">{erro}</p>
        <Button onClick={onRecarregar}>
          <LucideIcons.RefreshCw className="mr-2 h-4 w-4" />
          Tentar Novamente
        </Button>
      </div>
    );
  }
  
  const cirurgias = agenda.filter(item => item.tipo === 'cirurgia');
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-purple-600">Centro Cirúrgico</h2>
          <p className="text-gray-600">{cirurgias.length} cirurgia(s) agendada(s)</p>
        </div>
        <Button onClick={onRecarregar} variant="outline">
          <LucideIcons.RefreshCw className="mr-2 h-4 w-4" />
          Atualizar Agenda
        </Button>
      </div>
      
      {cirurgias.length === 0 ? (
        <div className="text-center py-16">
          <LucideIcons.Scissors className="h-16 w-16 text-gray-300 mx-auto mb-6" />
          <h3 className="text-xl font-medium mb-2">Nenhuma cirurgia agendada</h3>
          <p className="text-gray-500 max-w-md mx-auto">
            Não há procedimentos cirúrgicos agendados para hoje.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {cirurgias.map(cirurgia => (
            <Card key={cirurgia.id} className="border-l-4 border-l-purple-500">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Cirurgia Programada</CardTitle>
                    <CardDescription>
                      {cirurgia.horario_inicio} - {cirurgia.horario_fim}
                    </CardDescription>
                  </div>
                  <Badge variant="secondary">
                    <LucideIcons.Clock className="h-3 w-3 mr-1" />
                    {cirurgia.status}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Data</p>
                    <p className="text-sm">{formatarDataHospitalar(cirurgia.data)}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-600">Médico</p>
                    <p className="text-sm">Dr. Cirurgião Responsável</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-600">Paciente</p>
                    <p className="text-sm">Paciente ID: {cirurgia.paciente_id || 'N/A'}</p>
                  </div>
                </div>
                
                {cirurgia.observacoes && (
                  <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                    <p className="text-sm text-purple-800">{cirurgia.observacoes}</p>
                  </div>
                )}
                
                <div className="flex justify-end gap-2 mt-4">
                  <Button size="sm" variant="outline">
                    <LucideIcons.Calendar className="mr-2 h-4 w-4" />
                    Reagendar
                  </Button>
                  <Button size="sm">
                    <LucideIcons.PlayCircle className="mr-2 h-4 w-4" />
                    Iniciar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// Módulo de Leitos
function ModuloLeitos({ 
  leitos, 
  carregando, 
  erro, 
  onRecarregar 
}: {
  leitos: LeitoHospitalar[];
  carregando?: boolean;
  erro?: string | null;
  onRecarregar: () => void;
}) {
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [filtroSetor, setFiltroSetor] = useState('todos');
  
  const leitosFiltrados = useMemo(() => {
    return leitos.filter(leito => {
      const matchStatus = filtroStatus === 'todos' || leito.status === filtroStatus;
      const matchSetor = filtroSetor === 'todos' || leito.setor === filtroSetor;
      
      return matchStatus && matchSetor;
    });
  }, [leitos, filtroStatus, filtroSetor]);
  
  const estatisticas = useMemo(() => {
    return {
      total: leitos.length,
      ocupados: leitos.filter(l => l.status === 'ocupado').length,
      livres: leitos.filter(l => l.status === 'livre').length,
      limpeza: leitos.filter(l => l.status === 'limpeza').length,
      manutencao: leitos.filter(l => l.status === 'manutencao').length
    };
  }, [leitos]);
  
  if (carregando) {
    return (
      <div className="flex justify-center items-center py-16">
        <div className="text-center">
          <div className="animate-spin h-10 w-10 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-500">Carregando status dos leitos...</p>
        </div>
      </div>
    );
  }
  
  if (erro) {
    return (
      <div className="bg-red-50 border border-red-200 p-8 rounded-lg text-center">
        <LucideIcons.AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">Erro ao carregar leitos</h3>
        <p className="text-gray-700 mb-6">{erro}</p>
        <Button onClick={onRecarregar}>
          <LucideIcons.RefreshCw className="mr-2 h-4 w-4" />
          Tentar Novamente
        </Button>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-green-600">Gestão de Leitos</h2>
          <p className="text-gray-600">{leitosFiltrados.length} de {leitos.length} leito(s)</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Select value={filtroStatus} onValueChange={setFiltroStatus}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="ocupado">Ocupado</SelectItem>
              <SelectItem value="livre">Livre</SelectItem>
              <SelectItem value="limpeza">Limpeza</SelectItem>
              <SelectItem value="manutencao">Manutenção</SelectItem>
            </SelectContent>
          </Select>
          
          <Button onClick={onRecarregar} variant="outline">
            <LucideIcons.RefreshCw className="mr-2 h-4 w-4" />
            Atualizar
          </Button>
        </div>
      </div>
      
      {/* Estatísticas dos leitos */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">{estatisticas.total}</div>
            <div className="text-sm text-gray-600">Total</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{estatisticas.ocupados}</div>
            <div className="text-sm text-gray-600">Ocupados</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{estatisticas.livres}</div>
            <div className="text-sm text-gray-600">Livres</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{estatisticas.limpeza}</div>
            <div className="text-sm text-gray-600">Limpeza</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{estatisticas.manutencao}</div>
            <div className="text-sm text-gray-600">Manutenção</div>
          </CardContent>
        </Card>
      </div>
      
      {/* Lista de leitos */}
      <div className="grid gap-4">
        {leitosFiltrados.map(leito => {
          const status = formatarStatusLeitoHospitalar(leito.status);
          
          return (
            <Card key={leito.id} className={`border-l-4 ${
              leito.status === 'ocupado' ? 'border-l-red-500' :
              leito.status === 'livre' ? 'border-l-green-500' :
              leito.status === 'limpeza' ? 'border-l-blue-500' :
              leito.status === 'manutencao' ? 'border-l-orange-500' :
              'border-l-gray-500'
            }`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Leito {leito.numero}</CardTitle>
                    <CardDescription>{leito.setor} • {leito.tipo.replace('_', ' ')}</CardDescription>
                  </div>
                  
                  <Badge variant={status.badge} className={status.cor}>
                    <LucideIcons.Bed className="h-3 w-3 mr-1" />
                    {status.texto}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Equipamentos</p>
                    <p className="text-sm">{leito.equipamentos.join(', ')}</p>
                  </div>
                  
                  {leito.ultima_limpeza && (
                    <div>
                      <p className="text-sm font-medium text-gray-600">Última Limpeza</p>
                      <p className="text-sm">{formatarDataHospitalar(leito.ultima_limpeza, 'relativa')}</p>
                    </div>
                  )}
                  
                  {leito.paciente_id && (
                    <div>
                      <p className="text-sm font-medium text-gray-600">Paciente</p>
                      <p className="text-sm">ID: {leito.paciente_id}</p>
                    </div>
                  )}
                </div>
                
                <div className="flex justify-end gap-2 mt-4">
                  {leito.status === 'livre' && (
                    <Button size="sm">
                      <LucideIcons.UserPlus className="mr-2 h-4 w-4" />
                      Internar Paciente
                    </Button>
                  )}
                  
                  {leito.status === 'ocupado' && (
                    <Button size="sm" variant="outline">
                      <LucideIcons.UserMinus className="mr-2 h-4 w-4" />
                      Dar Alta
                    </Button>
                  )}
                  
                  {leito.status === 'limpeza' && (
                    <Button size="sm" variant="outline">
                      <LucideIcons.CheckCircle className="mr-2 h-4 w-4" />
                      Marcar Limpo
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// Módulo de Laboratório
function ModuloLaboratorio({ 
  exames, 
  carregando, 
  erro, 
  onRecarregar 
}: {
  exames: ExameHospitalar[];
  carregando?: boolean;
  erro?: string | null;
  onRecarregar: () => void;
}) {
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [filtroUrgencia, setFiltroUrgencia] = useState('todos');
  
  const examesFiltrados = useMemo(() => {
    return exames.filter(exame => {
      const matchStatus = filtroStatus === 'todos' || exame.status === filtroStatus;
      const matchUrgencia = filtroUrgencia === 'todos' || exame.urgencia === filtroUrgencia;
      
      return matchStatus && matchUrgencia;
    });
  }, [exames, filtroStatus, filtroUrgencia]);
  
  if (carregando) {
    return (
      <div className="flex justify-center items-center py-16">
        <div className="text-center">
          <div className="animate-spin h-10 w-10 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-500">Carregando exames laboratoriais...</p>
        </div>
      </div>
    );
  }
  
  if (erro) {
    return (
      <div className="bg-red-50 border border-red-200 p-8 rounded-lg text-center">
        <LucideIcons.AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">Erro ao carregar exames</h3>
        <p className="text-gray-700 mb-6">{erro}</p>
        <Button onClick={onRecarregar}>
          <LucideIcons.RefreshCw className="mr-2 h-4 w-4" />
          Tentar Novamente
        </Button>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-orange-600">Laboratório</h2>
          <p className="text-gray-600">{examesFiltrados.length} de {exames.length} exame(s)</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Select value={filtroStatus} onValueChange={setFiltroStatus}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os Status</SelectItem>
              <SelectItem value="solicitado">Solicitado</SelectItem>
              <SelectItem value="coletado">Coletado</SelectItem>
              <SelectItem value="processando">Processando</SelectItem>
              <SelectItem value="concluido">Concluído</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={filtroUrgencia} onValueChange={setFiltroUrgencia}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Urgência" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todas</SelectItem>
              <SelectItem value="critico">Crítico</SelectItem>
              <SelectItem value="alto">Alto</SelectItem>
              <SelectItem value="medio">Médio</SelectItem>
              <SelectItem value="baixo">Baixo</SelectItem>
            </SelectContent>
          </Select>
          
          <Button onClick={onRecarregar} variant="outline">
            <LucideIcons.RefreshCw className="mr-2 h-4 w-4" />
            Atualizar
          </Button>
        </div>
      </div>
      
      {examesFiltrados.length === 0 ? (
        <div className="text-center py-16">
          <LucideIcons.FlaskConical className="h-16 w-16 text-gray-300 mx-auto mb-6" />
          <h3 className="text-xl font-medium mb-2">Nenhum exame encontrado</h3>
          <p className="text-gray-500 max-w-md mx-auto">
            Não há exames que correspondam aos filtros selecionados.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {examesFiltrados.map(exame => {
            const urgencia = formatarUrgenciaHospitalar(exame.urgencia);
            
            return (
              <Card key={exame.id} className="border-l-4 border-l-orange-500">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{exame.tipo}</CardTitle>
                      <CardDescription>Solicitado por: {exame.solicitante}</CardDescription>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge variant={urgencia.badge} className={urgencia.cor}>
                        <LucideIcons.User className="h-3 w-3 mr-1" />
                        {urgencia.texto}
                      </Badge>
                      
                      <Badge variant="secondary">
                        {exame.status}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Data Solicitação</p>
                      <p className="text-sm">{formatarDataHospitalar(exame.data_solicitacao, 'relativa')}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-600">Status</p>
                      <p className="text-sm capitalize">{exame.status.replace('_', ' ')}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-600">Urgência</p>
                      <p className="text-sm">{urgencia.texto}</p>
                    </div>
                  </div>
                  
                  {exame.resultado && (
                    <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm font-medium text-green-800 mb-1">Resultado:</p>
                      <p className="text-sm text-green-700">{exame.resultado}</p>
                    </div>
                  )}
                  
                  {exame.observacoes && (
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm font-medium text-blue-800 mb-1">Observações:</p>
                      <p className="text-sm text-blue-700">{exame.observacoes}</p>
                    </div>
                  )}
                  
                  <div className="flex justify-end gap-2 mt-4">
                    {exame.status === 'solicitado' && (
                      <Button size="sm">
                        <LucideIcons.PlayCircle className="mr-2 h-4 w-4" />
                        Coletar
                      </Button>
                    )}
                    
                    {exame.status === 'concluido' && (
                      <Button size="sm" variant="outline">
                        <LucideIcons.Download className="mr-2 h-4 w-4" />
                        Baixar Resultado
                      </Button>
                    )}
                    
                    <Button size="sm" variant="outline">
                      <LucideIcons.FileText className="mr-2 h-4 w-4" />
                      Detalhes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Módulo de Farmácia
function ModuloFarmacia({ 
  medicacoes, 
  carregando, 
  erro, 
  onRecarregar 
}: {
  medicacoes: MedicacaoHospitalar[];
  carregando?: boolean;
  erro?: string | null;
  onRecarregar: () => void;
}) {
  const [filtroStatus, setFiltroStatus] = useState('todos');
  
  const medicacoesFiltradas = useMemo(() => {
    return medicacoes.filter(medicacao => {
      const matchStatus = filtroStatus === 'todos' || medicacao.status === filtroStatus;
      return matchStatus;
    });
  }, [medicacoes, filtroStatus]);
  
  if (carregando) {
    return (
      <div className="flex justify-center items-center py-16">
        <div className="text-center">
          <div className="animate-spin h-10 w-10 border-4 border-teal-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-500">Carregando dados da farmácia...</p>
        </div>
      </div>
    );
  }
  
  if (erro) {
    return (
      <div className="bg-red-50 border border-red-200 p-8 rounded-lg text-center">
        <LucideIcons.AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">Erro ao carregar medicações</h3>
        <p className="text-gray-700 mb-6">{erro}</p>
        <Button onClick={onRecarregar}>
          <LucideIcons.RefreshCw className="mr-2 h-4 w-4" />
          Tentar Novamente
        </Button>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-teal-600">Farmácia Hospitalar</h2>
          <p className="text-gray-600">{medicacoesFiltradas.length} de {medicacoes.length} medicação(ões)</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Select value={filtroStatus} onValueChange={setFiltroStatus}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="ativa">Ativa</SelectItem>
              <SelectItem value="suspensa">Suspensa</SelectItem>
              <SelectItem value="concluida">Concluída</SelectItem>
            </SelectContent>
          </Select>
          
          <Button onClick={onRecarregar} variant="outline">
            <LucideIcons.RefreshCw className="mr-2 h-4 w-4" />
            Atualizar
          </Button>
        </div>
      </div>
      
      {medicacoesFiltradas.length === 0 ? (
        <div className="text-center py-16">
          <LucideIcons.Pill className="h-16 w-16 text-gray-300 mx-auto mb-6" />
          <h3 className="text-xl font-medium mb-2">Nenhuma medicação encontrada</h3>
          <p className="text-gray-500 max-w-md mx-auto">
            Não há medicações que correspondam aos filtros selecionados.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {medicacoesFiltradas.map(medicacao => (
            <Card key={medicacao.id} className="border-l-4 border-l-teal-500">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{medicacao.nome}</CardTitle>
                    <CardDescription>
                      {medicacao.dosagem} • {medicacao.via_administracao}
                    </CardDescription>
                  </div>
                  
                  <Badge variant={
                    medicacao.status === 'ativa' ? 'outline' :
                    medicacao.status === 'suspensa' ? 'destructive' : 'secondary'
                  } className={
                    medicacao.status === 'ativa' ? 'text-green-600 border-green-300' :
                    medicacao.status === 'suspensa' ? 'bg-yellow-100 border-yellow-300 text-yellow-800 hover:bg-yellow-100' : ''
                  }>
                    {medicacao.status}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Prescritor</p>
                    <p className="text-sm">{medicacao.medico_prescritor}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-600">Data Prescrição</p>
                    <p className="text-sm">{formatarDataHospitalar(medicacao.data_prescricao, 'relativa')}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-600">Horários</p>
                    <p className="text-sm">{medicacao.horarios.join(', ')}</p>
                  </div>
                </div>
                
                {medicacao.observacoes && (
                  <div className="mt-4 p-3 bg-teal-50 border border-teal-200 rounded-lg">
                    <p className="text-sm font-medium text-teal-800 mb-1">Observações:</p>
                    <p className="text-sm text-teal-700">{medicacao.observacoes}</p>
                  </div>
                )}
                
                <div className="flex justify-end gap-2 mt-4">
                  {medicacao.status === 'ativa' && (
                    <>
                      <Button size="sm" variant="outline">
                        <LucideIcons.Clock className="mr-2 h-4 w-4" />
                        Administrar
                      </Button>
                      <Button size="sm" variant="outline">
                        <LucideIcons.PauseCircle className="mr-2 h-4 w-4" />
                        Suspender
                      </Button>
                    </>
                  )}
                  
                  <Button size="sm" variant="outline">
                    <LucideIcons.Edit className="mr-2 h-4 w-4" />
                    Editar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}