'use client'

import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import * as LucideIcons from 'lucide-react'

export default function MetodologiaPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="h-8 w-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">PD</span>
              </div>
              <span className="font-bold text-xl">Product Design AI-Enhanced</span>
            </Link>
            
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/metodologia" className="text-blue-600 font-medium">
                Metodologia
              </Link>
              <Link href="/processo" className="text-gray-600 hover:text-gray-900 transition-colors">
                Processo
              </Link>
              <Link href="/showcase" className="text-gray-600 hover:text-gray-900 transition-colors">
                Showcase
              </Link>
              <Link href="/sobre" className="text-gray-600 hover:text-gray-900 transition-colors">
                Sobre
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl lg:text-5xl font-bold mb-6">
              Uma Nova Abordagem para <span className="text-blue-600">Product Design</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Como transformar requisitos ambíguos em produtos completos através de análise sistemática assistida por IA
            </p>
          </div>
        </div>
      </section>

      {/* O Problema */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-16">O Problema que Todo Designer Conhece</h2>
            
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-2xl font-bold mb-6 text-red-600">❌ Cenário Familiar</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-red-600 font-bold text-sm">1</span>
                    </div>
                    <div>
                      <p className="font-medium">Recebo um PRD ambíguo</p>
                      <p className="text-gray-600 text-sm">"usuários devem gerenciar produtos"</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-red-600 font-bold text-sm">2</span>
                    </div>
                    <div>
                      <p className="font-medium">Interpreto baseado na experiência</p>
                      <p className="text-gray-600 text-sm">Suposições sobre funcionalidades e fluxos</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-red-600 font-bold text-sm">3</span>
                    </div>
                    <div>
                      <p className="font-medium">Crio wireframes intuitivamente</p>
                      <p className="text-gray-600 text-sm">Design baseado no que "acho" que precisa</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-red-600 font-bold text-sm">4</span>
                    </div>
                    <div>
                      <p className="font-medium">Descobrimos edge cases tarde</p>
                      <p className="text-gray-600 text-sm">Cenários não previstos aparecem em produção</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-red-600 font-bold text-sm">5</span>
                    </div>
                    <div>
                      <p className="font-medium">Retrabalho infinito</p>
                      <p className="text-gray-600 text-sm">Ajustes constantes e refatorações</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-2xl font-bold mb-6 text-green-600">✅ Nova Abordagem</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-green-600 font-bold text-sm">1</span>
                    </div>
                    <div>
                      <p className="font-medium">Análise sistemática obrigatória</p>
                      <p className="text-gray-600 text-sm">6 camadas de análise antes de qualquer pixel</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-green-600 font-bold text-sm">2</span>
                    </div>
                    <div>
                      <p className="font-medium">IA extrai o que não está explícito</p>
                      <p className="text-gray-600 text-sm">Parsing semântico identifica requisitos ocultos</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-green-600 font-bold text-sm">3</span>
                    </div>
                    <div>
                      <p className="font-medium">Todos os cenários mapeados</p>
                      <p className="text-gray-600 text-sm">Estados UI, fluxos e edge cases previstos</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-green-600 font-bold text-sm">4</span>
                    </div>
                    <div>
                      <p className="font-medium">Design já nasce completo</p>
                      <p className="text-gray-600 text-s m">Código funcional demonstra interações</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-green-600 font-bold text-sm">5</span>
                    </div>
                    <div>
                      <p className="font-medium">Zero surpresas na implementação</p>
                      <p className="text-gray-600 text-sm">Handoff preciso e completo</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Os 8 Pilares */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-4">Os 8 Pilares Fundamentais</h2>
            <p className="text-xl text-gray-600 text-center mb-16 max-w-3xl mx-auto">
              Cada pilar resolve um problema específico do design tradicional
            </p>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  numero: '1',
                  titulo: 'Análise Sistemática Obrigatória',
                  descricao: 'Todo design precedido por análise completa em 6 camadas: contexto, parsing, arquitetura, jornadas, regras e validação técnica.',
                  icone: 'Search',
                  cor: 'blue'
                },
                {
                  numero: '2',
                  titulo: 'Inteligência de Requisitos',
                  descricao: 'Parser semântico extrai requisitos explícitos, infere implícitos e identifica ambiguidades através de padrões conhecidos.',
                  icone: 'Brain',
                  cor: 'purple'
                },
                {
                  numero: '3',
                  titulo: 'Arquitetura de Interface Inteligente',
                  descricao: 'Decisão entre componente único ou sistema modular baseada em métricas objetivas de complexidade UX.',
                  icone: 'Building2',
                  cor: 'green'
                },
                {
                  numero: '4',
                  titulo: 'Mapeamento Completo de Estados',
                  descricao: 'Cada tela trata explicitamente TODOS os estados: loading, vazio, erro, sucesso e variações contextuais.',
                  icone: 'Layers',
                  cor: 'yellow'
                },
                {
                  numero: '5',
                  titulo: 'Prevenção Total de Edge Cases',
                  descricao: 'Design prevê cenários extremos: dados nulos, conexão instável, permissões variáveis, dispositivos diversos.',
                  icone: 'Shield',
                  cor: 'red'
                },
                {
                  numero: '6',
                  titulo: 'Validação Defensiva de UX',
                  descricao: 'Decisões validadas contra heurísticas, acessibilidade, performance e objetivos através de checklists automatizados.',
                  icone: 'CheckCircle',
                  cor: 'indigo'
                },
                {
                  numero: '7',
                  titulo: 'Implementação Técnica Robusta',
                  descricao: 'Design resulta em código funcional com padrões defensivos: tratamento de erros, estados de loading, validações.',
                  icone: 'Code',
                  cor: 'pink'
                },
                {
                  numero: '8',
                  titulo: 'Controle de Qualidade Automatizado',
                  descricao: 'Entrega passa por verificação de completude, qualidade técnica e funcionalidade antes da validação.',
                  icone: 'Award',
                  cor: 'teal'
                }
              ].map((pilar) => {
                const IconeComponente = LucideIcons[pilar.icone as keyof typeof LucideIcons] as any;
                
                return (
                  <Card key={pilar.numero} className="h-full hover:shadow-lg transition-all group">
                    <CardHeader className="text-center">
                      <div className="relative mb-4">
                        <div className={`w-16 h-16 bg-${pilar.cor}-100 rounded-full flex items-center justify-center mx-auto`}>
                          <IconeComponente className={`h-8 w-8 text-${pilar.cor}-600`} />
                        </div>
                      </div>
                      <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">
                        {pilar.titulo}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 text-sm">{pilar.descricao}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Diferencial Competitivo */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-16">Por Que Isso Funciona?</h2>
            
            <div className="space-y-12">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <h3 className="text-2xl font-bold mb-4">🎯 Metodologia vs. Uso Casual de IA</h3>
                  <p className="text-gray-600 mb-4">
                    Enquanto muitos designers usam IA de forma pontual, esta é uma metodologia sistemática que:
                  </p>
                  <ul className="space-y-2 text-gray-700">
                    <li>• Garante análise completa independente da experiência</li>
                    <li>• Elimina viés pessoal através de critérios objetivos</li>
                    <li>• Produz resultados consistentes e reproduzíveis</li>
                    <li>• Inclui validação automática de qualidade</li>
                  </ul>
                </div>
                <div className="bg-blue-50 p-6 rounded-lg">
                  <h4 className="font-bold text-blue-900 mb-3">Exemplo Prático</h4>
                  <p className="text-blue-800 text-sm">
                    Input: "usuários devem gerenciar produtos"<br/><br/>
                    <strong>Análise sistemática identifica:</strong><br/>
                    • 4 entidades (produtos, categorias, usuários, auditoria)<br/>
                    • 23 estados UI diferentes<br/>
                    • 8 fluxos de usuário<br/>
                    • Sistema modular recomendado
                  </p>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="bg-green-50 p-6 rounded-lg order-2 md:order-1">
                  <h4 className="font-bold text-green-900 mb-3">Design Como Engenharia</h4>
                  <p className="text-green-800 text-sm">
                    Não é apenas intuição - é aplicação sistemática de princípios.<br/><br/>
                    Quanto mais estruturado o processo de análise, mais espaço há para criatividade nas soluções.
                  </p>
                </div>
                <div className="order-1 md:order-2">
                  <h3 className="text-2xl font-bold mb-4">🔧 Ponte Design-Desenvolvimento</h3>
                  <p className="text-gray-600 mb-4">
                    A combinação de análise estratégica com implementação técnica cria um diferencial único:
                  </p>
                  <ul className="space-y-2 text-gray-700">
                    <li>• Designers recebem código funcional para validar interações</li>
                    <li>• Developers recebem especificações implementáveis</li>
                    <li>• Stakeholders visualizam resultados concretos</li>
                    <li>• Zero surpresas durante implementação</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Resultados */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-12">Resultados Mensuráveis</h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white/10 p-6 rounded-lg backdrop-blur-sm">
                <div className="text-4xl font-bold mb-2">85%</div>
                <div className="text-lg font-semibold mb-2">Redução de Retrabalho</div>
                <div className="text-sm opacity-90">Menos iterações por má interpretação</div>
              </div>
              
              <div className="bg-white/10 p-6 rounded-lg backdrop-blur-sm">
                <div className="text-4xl font-bold mb-2">60%</div>
                <div className="text-lg font-semibold mb-2">Aceleração do Processo</div>
                <div className="text-sm opacity-90">Design → desenvolvimento mais rápido</div>
              </div>
              
              <div className="bg-white/10 p-6 rounded-lg backdrop-blur-sm">
                <div className="text-4xl font-bold mb-2">95%</div>
                <div className="text-lg font-semibold mb-2">Consistência de Entregas</div>
                <div className="text-sm opacity-90">Qualidade uniforme entre projetos</div>
              </div>
            </div>
            
            <div className="mt-12">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/processo">
                  <LucideIcons.ArrowRight className="mr-2 h-5 w-5" />
                  Ver Como Funciona na Prática
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <Link href="/" className="flex items-center gap-3 mb-4">
                <div className="h-8 w-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">PD</span>
                </div>
                <span className="font-bold">Product Design AI-Enhanced</span>
              </Link>
              <p className="text-gray-400">
                Metodologia sistemática para design de produtos digitais com IA.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Navegação</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/metodologia" className="hover:text-white transition-colors">Metodologia</Link></li>
                <li><Link href="/processo" className="hover:text-white transition-colors">Processo</Link></li>
                <li><Link href="/showcase" className="hover:text-white transition-colors">Showcase</Link></li>
                <li><Link href="/sobre" className="hover:text-white transition-colors">Sobre</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Contato</h3>
              <p className="text-gray-400 mb-2">Marcos Bricches</p>
              <p className="text-gray-400 text-sm">
                Product Designer
              </p>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Marcos Bricches. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}