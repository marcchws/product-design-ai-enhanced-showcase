// src/app/showcase/onboarding-saas/etapa-configuracao-empresa.tsx
'use client'

import React, { useState, useRef, useCallback, useEffect } from 'react'
import { toast } from 'sonner'
import * as LucideIcons from 'lucide-react'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

interface EtapaConfiguracaoEmpresaProps {
  dados: any;
  onAtualizarDados: (dados: any) => void;
  onProxima: () => void;
  onAnterior: () => void;
  salvando: boolean;
  etapaAtual: number;
  totalEtapas: number;
}

export default function EtapaConfiguracaoEmpresa({
  dados,
  onAtualizarDados,
  onProxima,
  onAnterior,
  salvando,
  etapaAtual,
  totalEtapas
}: EtapaConfiguracaoEmpresaProps) {
  const [erros, setErros] = useState<Record<string, string>>({});
  const [tentouEnviar, setTentouEnviar] = useState(false);
  const [validandoWebsite, setValidandoWebsite] = useState(false);
  
  const montadoRef = useRef(true);

  useEffect(() => {
    montadoRef.current = true;
    return () => { montadoRef.current = false; };
  }, []);

  // Validação em tempo real após primeira tentativa
  useEffect(() => {
    if (tentouEnviar) {
      const timeoutId = setTimeout(() => {
        validarFormulario();
      }, 300);
      
      return () => clearTimeout(timeoutId);
    }
  }, [dados, tentouEnviar]);

  const validarFormulario = useCallback(() => {
    const novosErros: Record<string, string> = {};

    // Nome da empresa obrigatório
    if (!dados.nomeEmpresa || dados.nomeEmpresa.trim().length === 0) {
      novosErros.nomeEmpresa = 'Nome da empresa é obrigatório';
    } else if (dados.nomeEmpresa.trim().length < 2) {
      novosErros.nomeEmpresa = 'Nome deve ter ao menos 2 caracteres';
    }

    // Tamanho da empresa obrigatório
    if (!dados.tamanhoEmpresa) {
      novosErros.tamanhoEmpresa = 'Selecione o tamanho da empresa';
    }

    // Setor obrigatório
    if (!dados.setor) {
      novosErros.setor = 'Selecione o setor da empresa';
    }

    // Website opcional mas se preenchido deve ser válido
    if (dados.website && dados.website.trim().length > 0) {
      const websiteRegex = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
      if (!websiteRegex.test(dados.website)) {
        novosErros.website = 'Website deve ter formato válido (ex: empresa.com)';
      }
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

  // Validação de website com debounce
  const validarWebsite = useCallback(async (website: string) => {
    if (!website || !/^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/.test(website)) return;
    
    setValidandoWebsite(true);
    
    try {
      // Simulação de validação de website
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (montadoRef.current) {
        toast.success('Website válido!');
      }
    } catch (error) {
      console.error('Erro ao validar website:', error);
    } finally {
      if (montadoRef.current) {
        setValidandoWebsite(false);
      }
    }
  }, []);

  useEffect(() => {
    if (dados.website && !erros.website) {
      const timeoutId = setTimeout(() => {
        validarWebsite(dados.website);
      }, 1000);
      
      return () => clearTimeout(timeoutId);
    }
  }, [dados.website, erros.website, validarWebsite]);

  const handleProxima = useCallback(() => {
    setTentouEnviar(true);
    
    if (validarFormulario()) {
      toast.success('Informações da empresa salvas!');
      onProxima();
    } else {
      toast.error('Corrija os erros antes de continuar');
    }
  }, [validarFormulario, onProxima]);

  const getFieldClass = useCallback((campo: string) => {
    if (erros[campo]) return 'border-red-500 focus:border-red-500 focus:ring-red-500';
    if (tentouEnviar && !erros[campo] && dados[campo]) return 'border-green-500';
    return '';
  }, [erros, tentouEnviar, dados]);

  const setoresDisponiveis = [
    { valor: 'tecnologia', label: 'Tecnologia', icone: 'Laptop' },
    { valor: 'financeiro', label: 'Serviços Financeiros', icone: 'DollarSign' },
    { valor: 'saude', label: 'Saúde', icone: 'Heart' },
    { valor: 'educacao', label: 'Educação', icone: 'GraduationCap' },
    { valor: 'varejo', label: 'Varejo', icone: 'ShoppingBag' },
    { valor: 'manufatura', label: 'Manufatura', icone: 'Factory' },
    { valor: 'consultoria', label: 'Consultoria', icone: 'Users' },
    { valor: 'marketing', label: 'Marketing', icone: 'Megaphone' },
    { valor: 'outro', label: 'Outro', icone: 'MoreHorizontal' }
  ];

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LucideIcons.Building2 className="h-5 w-5" />
            Configuração da Empresa
          </CardTitle>
          <CardDescription>
            Essas informações nos ajudam a personalizar recursos para sua organização
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Informações básicas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="nomeEmpresa">Nome da Empresa *</Label>
              <Input
                id="nomeEmpresa"
                value={dados.nomeEmpresa || ''}
                onChange={(e) => handleChange('nomeEmpresa', e.target.value)}
                className={getFieldClass('nomeEmpresa')}
                placeholder="Nome da sua empresa"
              />
              {erros.nomeEmpresa && (
                <p className="text-red-500 text-sm flex items-center">
                  <LucideIcons.AlertCircle className="h-4 w-4 mr-1" />
                  {erros.nomeEmpresa}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website da Empresa</Label>
              <div className="relative">
                <Input
                  id="website"
                  value={dados.website || ''}
                  onChange={(e) => handleChange('website', e.target.value)}
                  className={getFieldClass('website')}
                  placeholder="www.empresa.com"
                />
                {validandoWebsite && (
                  <div className="absolute right-3 top-3">
                    <LucideIcons.Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                  </div>
                )}
              </div>
              {erros.website && (
                <p className="text-red-500 text-sm flex items-center">
                  <LucideIcons.AlertCircle className="h-4 w-4 mr-1" />
                  {erros.website}
                </p>
              )}
            </div>
          </div>

          {/* Tamanho da empresa */}
          <div className="space-y-3">
            <Label>Tamanho da Empresa *</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { valor: '1-10', label: '1-10 funcionários', badge: 'Startup' },
                { valor: '11-50', label: '11-50 funcionários', badge: 'Pequena' },
                { valor: '51-200', label: '51-200 funcionários', badge: 'Média' },
                { valor: '200+', label: '200+ funcionários', badge: 'Grande' }
              ].map((tamanho) => (
                <Card
                  key={tamanho.valor}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    dados.tamanhoEmpresa === tamanho.valor
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200'
                  }`}
                  onClick={() => handleChange('tamanhoEmpresa', tamanho.valor)}
                >
                  <CardContent className="p-4 text-center">
                    <Badge variant="outline" className="mb-2">
                      {tamanho.badge}
                    </Badge>
                    <p className="text-sm font-medium">{tamanho.label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            {erros.tamanhoEmpresa && (
              <p className="text-red-500 text-sm flex items-center">
                <LucideIcons.AlertCircle className="h-4 w-4 mr-1" />
                {erros.tamanhoEmpresa}
              </p>
            )}
          </div>

          {/* Setor da empresa */}
          <div className="space-y-3">
            <Label>Setor da Empresa *</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {setoresDisponiveis.map((setor) => {
                const IconeComponente = LucideIcons[setor.icone as keyof typeof LucideIcons] as any;
                
                return (
                  <Card
                    key={setor.valor}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      dados.setor === setor.valor
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200'
                    }`}
                    onClick={() => handleChange('setor', setor.valor)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          dados.setor === setor.valor
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          <IconeComponente className="h-4 w-4" />
                        </div>
                        <span className="text-sm font-medium">{setor.label}</span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
            {erros.setor && (
              <p className="text-red-500 text-sm flex items-center">
                <LucideIcons.AlertCircle className="h-4 w-4 mr-1" />
                {erros.setor}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Benefícios baseados no setor */}
      {dados.setor && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <LucideIcons.Sparkles className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-green-900 mb-2">
                  Recursos personalizados para {setoresDisponiveis.find(s => s.valor === dados.setor)?.label}
                </h3>
                <ul className="text-sm text-green-800 space-y-1">
                  {dados.setor === 'tecnologia' && (
                    <>
                      <li>• Integrações com GitHub, Jira e Slack</li>
                      <li>• Templates para roadmaps de produto</li>
                      <li>• Métricas de desenvolvimento ágil</li>
                    </>
                  )}
                  {dados.setor === 'financeiro' && (
                    <>
                      <li>• Compliance e auditoria automatizada</li>
                      <li>• Relatórios regulatórios pré-configurados</li>
                      <li>• Integração com sistemas bancários</li>
                    </>
                  )}
                  {dados.setor === 'saude' && (
                    <>
                      <li>• Conformidade com LGPD/HIPAA</li>
                      <li>• Gestão de prontuários eletrônicos</li>
                      <li>• Relatórios de qualidade assistencial</li>
                    </>
                  )}
                  {!['tecnologia', 'financeiro', 'saude'].includes(dados.setor) && (
                    <>
                      <li>• Dashboards personalizados para seu setor</li>
                      <li>• Integrações relevantes pré-configuradas</li>
                      <li>• Templates específicos da indústria</li>
                    </>
                  )}
                </ul>
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