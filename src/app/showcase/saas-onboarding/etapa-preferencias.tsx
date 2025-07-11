// src/app/showcase/onboarding-saas/etapa-preferencias.tsx
'use client'

import React, { useState, useRef, useCallback, useEffect } from 'react'
import { toast } from 'sonner'
import * as LucideIcons from 'lucide-react'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Badge } from "@/components/ui/badge"

interface EtapaPreferenciasProps {
  dados: any;
  onAtualizarDados: (dados: any) => void;
  onProxima: () => void;
  onAnterior: () => void;
  salvando: boolean;
  etapaAtual: number;
  totalEtapas: number;
}

export default function EtapaPreferencias({
  dados,
  onAtualizarDados,
  onProxima,
  onAnterior,
  salvando,
  etapaAtual,
  totalEtapas
}: EtapaPreferenciasProps) {
  const [erros, setErros] = useState<Record<string, string>>({});
  const [tentouEnviar, setTentouEnviar] = useState(false);
  
  const montadoRef = useRef(true);

  useEffect(() => {
    montadoRef.current = true;
    return () => { montadoRef.current = false; };
  }, []);

  const validarFormulario = useCallback(() => {
    const novosErros: Record<string, string> = {};

    // Objetivo é obrigatório
    if (!dados.objetivo) {
      novosErros.objetivo = 'Selecione seu principal objetivo';
    }

    // Experiência é obrigatória
    if (!dados.experiencia) {
      novosErros.experiencia = 'Selecione seu nível de experiência';
    }

    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  }, [dados]);

  const handleChange = useCallback((campo: string, valor: any) => {
    onAtualizarDados({ [campo]: valor });
    
    // Limpar erro quando campo é editado
    if (erros[campo]) {
      setErros(prev => {
        const novos = { ...prev };
        delete novos[campo];
        return novos;
      });
    }
  }, [onAtualizarDados, erros]);

  const handleNotificacaoChange = useCallback((tipo: string, valor: boolean) => {
    const novasNotificacoes = {
      ...dados.notificacoes,
      [tipo]: valor
    };
    onAtualizarDados({ notificacoes: novasNotificacoes });
  }, [dados.notificacoes, onAtualizarDados]);

  const handleProxima = useCallback(() => {
    setTentouEnviar(true);
    
    if (validarFormulario()) {
      toast.success('Preferências configuradas com sucesso!');
      onProxima();
    } else {
      toast.error('Complete todas as informações obrigatórias');
    }
  }, [validarFormulario, onProxima]);

  const objetivos = [
    {
      valor: 'aumentar-vendas',
      titulo: 'Aumentar Vendas',
      descricao: 'Foco em crescimento de receita e conversão',
      icone: 'TrendingUp',
      cor: 'text-green-600 bg-green-100'
    },
    {
      valor: 'melhorar-eficiencia',
      titulo: 'Melhorar Eficiência',
      descricao: 'Otimizar processos e produtividade',
      icone: 'Zap',
      cor: 'text-blue-600 bg-blue-100'
    },
    {
      valor: 'gestao-equipe',
      titulo: 'Gestão de Equipe',
      descricao: 'Coordenar e acompanhar times',
      icone: 'Users',
      cor: 'text-purple-600 bg-purple-100'
    },
    {
      valor: 'analytics-insights',
      titulo: 'Analytics e Insights',
      descricao: 'Tomar decisões baseadas em dados',
      icone: 'BarChart3',
      cor: 'text-orange-600 bg-orange-100'
    },
    {
      valor: 'automatizar-processos',
      titulo: 'Automatizar Processos',
      descricao: 'Reduzir trabalho manual repetitivo',
      icone: 'Bot',
      cor: 'text-indigo-600 bg-indigo-100'
    },
    {
      valor: 'outros',
      titulo: 'Outros Objetivos',
      descricao: 'Necessidades específicas ou múltiplos focos',
      icone: 'Target',
      cor: 'text-gray-600 bg-gray-100'
    }
  ];

  const niveisExperiencia = [
    {
      valor: 'iniciante',
      titulo: 'Iniciante',
      descricao: 'Primeira vez usando este tipo de ferramenta',
      recomendacao: 'Recomendamos tutoriais guiados e suporte estendido'
    },
    {
      valor: 'intermediario',
      titulo: 'Intermediário',
      descricao: 'Já usei ferramentas similares antes',
      recomendacao: 'Setup padrão com dicas contextuais'
    },
    {
      valor: 'avancado',
      titulo: 'Avançado',
      descricao: 'Sou experiente em ferramentas de produtividade',
      recomendacao: 'Acesso completo a recursos avançados desde o início'
    }
  ];

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LucideIcons.Settings className="h-5 w-5" />
            Preferências e Objetivos
          </CardTitle>
          <CardDescription>
            Personalize sua experiência baseada em seus objetivos e nível de experiência
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Principal Objetivo */}
          <div className="space-y-4">
            <div>
              <Label className="text-base font-medium">Qual é seu principal objetivo? *</Label>
              <p className="text-sm text-gray-500 mt-1">
                Isso nos ajuda a priorizar os recursos mais importantes para você
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {objetivos.map((objetivo) => {
                const IconeComponente = LucideIcons[objetivo.icone as keyof typeof LucideIcons] as any;
                const isSelected = dados.objetivo === objetivo.valor;
                
                return (
                  <Card
                    key={objetivo.valor}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleChange('objetivo', objetivo.valor)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${objetivo.cor} transition-colors`}>
                          <IconeComponente className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 mb-1">{objetivo.titulo}</h3>
                          <p className="text-sm text-gray-600">{objetivo.descricao}</p>
                        </div>
                        {isSelected && (
                          <LucideIcons.CheckCircle className="h-5 w-5 text-blue-600" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
            
            {erros.objetivo && (
              <p className="text-red-500 text-sm flex items-center">
                <LucideIcons.AlertCircle className="h-4 w-4 mr-1" />
                {erros.objetivo}
              </p>
            )}
          </div>

          {/* Nível de Experiência */}
          <div className="space-y-4">
            <div>
              <Label className="text-base font-medium">Qual seu nível de experiência? *</Label>
              <p className="text-sm text-gray-500 mt-1">
                Vamos ajustar a complexidade da interface e tutoriais
              </p>
            </div>
            
            <RadioGroup
              value={dados.experiencia || ''}
              onValueChange={(valor) => handleChange('experiencia', valor)}
              className="space-y-3"
            >
              {niveisExperiencia.map((nivel) => (
                <div key={nivel.valor} className="flex items-start space-x-3">
                  <RadioGroupItem
                    value={nivel.valor}
                    id={nivel.valor}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <Label htmlFor={nivel.valor} className="cursor-pointer">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{nivel.titulo}</span>
                        {dados.experiencia === nivel.valor && (
                          <Badge variant="secondary">Selecionado</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-1">{nivel.descricao}</p>
                      <p className="text-xs text-blue-600 font-medium">{nivel.recomendacao}</p>
                    </Label>
                  </div>
                </div>
              ))}
            </RadioGroup>
            
            {erros.experiencia && (
              <p className="text-red-500 text-sm flex items-center">
                <LucideIcons.AlertCircle className="h-4 w-4 mr-1" />
                {erros.experiencia}
              </p>
            )}
          </div>

          {/* Preferências de Notificação */}
          <div className="space-y-4">
            <div>
              <Label className="text-base font-medium">Preferências de Notificação</Label>
              <p className="text-sm text-gray-500 mt-1">
                Escolha como e quando você quer receber atualizações
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="notif-email"
                  checked={dados.notificacoes?.email ?? true}
                  onCheckedChange={(checked) => handleNotificacaoChange('email', checked as boolean)}
                />
                <div className="space-y-1">
                  <Label htmlFor="notif-email" className="cursor-pointer font-medium">
                    Notificações por Email
                  </Label>
                  <p className="text-sm text-gray-600">
                    Updates importantes, relatórios semanais e novidades da plataforma
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Checkbox
                  id="notif-push"
                  checked={dados.notificacoes?.push ?? false}
                  onCheckedChange={(checked) => handleNotificacaoChange('push', checked as boolean)}
                />
                <div className="space-y-1">
                  <Label htmlFor="notif-push" className="cursor-pointer font-medium">
                    Notificações Push
                  </Label>
                  <p className="text-sm text-gray-600">
                    Alertas instantâneos no navegador para ações urgentes
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Checkbox
                  id="notif-relatorios"
                  checked={dados.notificacoes?.relatorios ?? true}
                  onCheckedChange={(checked) => handleNotificacaoChange('relatorios', checked as boolean)}
                />
                <div className="space-y-1">
                  <Label htmlFor="notif-relatorios" className="cursor-pointer font-medium">
                    Relatórios Automáticos
                  </Label>
                  <p className="text-sm text-gray-600">
                    Resumos de performance e insights personalizados
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preview da experiência personalizada */}
      {dados.objetivo && dados.experiencia && (
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <LucideIcons.Sparkles className="h-6 w-6 text-blue-600 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-blue-900 mb-3">
                  Sua experiência será personalizada!
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <h4 className="font-medium text-blue-800 mb-2">Dashboard Principal:</h4>
                    <ul className="text-blue-700 space-y-1">
                      {dados.objetivo === 'aumentar-vendas' && (
                        <>
                          <li>• Métricas de vendas em destaque</li>
                          <li>• Funil de conversão prioritário</li>
                          <li>• Alertas de oportunidades</li>
                        </>
                      )}
                      {dados.objetivo === 'melhorar-eficiencia' && (
                        <>
                          <li>• Indicadores de produtividade</li>
                          <li>• Automações sugeridas</li>
                          <li>• Análise de tempo gasto</li>
                        </>
                      )}
                      {dados.objetivo === 'gestao-equipe' && (
                        <>
                          <li>• Painel de performance da equipe</li>
                          <li>• Distribuição de tarefas</li>
                          <li>• Comunicação centralizada</li>
                        </>
                      )}
                      {!['aumentar-vendas', 'melhorar-eficiencia', 'gestao-equipe'].includes(dados.objetivo) && (
                        <>
                          <li>• Dashboard focado no seu objetivo</li>
                          <li>• Widgets personalizados</li>
                          <li>• Métricas relevantes</li>
                        </>
                      )}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-blue-800 mb-2">Nível de Interface:</h4>
                    <ul className="text-blue-700 space-y-1">
                      {dados.experiencia === 'iniciante' && (
                        <>
                          <li>• Tutoriais interativos</li>
                          <li>• Dicas contextuais</li>
                          <li>• Interface simplificada</li>
                        </>
                      )}
                      {dados.experiencia === 'intermediario' && (
                        <>
                          <li>• Tooltips quando necessário</li>
                          <li>• Recursos padrão habilitados</li>
                          <li>• Atalhos básicos</li>
                        </>
                      )}
                      {dados.experiencia === 'avancado' && (
                        <>
                          <li>• Todos os recursos disponíveis</li>
                          <li>• Atalhos de teclado</li>
                          <li>• Personalização avançada</li>
                        </>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Ações */}
      <div className="flex justify-between items-center pt-6">
        <Button
          variant="outline"
          onClick={onAnterior}
          disabled={salvando}
        >
          <LucideIcons.ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
        
        <div className="text-sm text-gray-500">
          Etapa {etapaAtual + 1} de {totalEtapas}
        </div>
        
        <Button 
          onClick={handleProxima}
          disabled={salvando}
        >
          {salvando ? (
            <>
              <LucideIcons.Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              Continuar
              <LucideIcons.ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}