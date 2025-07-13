'use client'

import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import * as LucideIcons from 'lucide-react'

export default function SobrePage() {
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
              <Link href="/metodologia" className="text-gray-600 hover:text-gray-900 transition-colors">
                Metodologia
              </Link>
              <Link href="/processo" className="text-gray-600 hover:text-gray-900 transition-colors">
                Processo
              </Link>
              <Link href="/showcase" className="text-gray-600 hover:text-gray-900 transition-colors">
                Showcase
              </Link>
              <Link href="/sobre" className="text-blue-600 font-medium">
                Sobre
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h1 className="text-4xl lg:text-5xl font-bold mb-6">
                  Olá, eu sou <span className="text-blue-600">Marcos Bricches</span>
                </h1>
                <p className="text-xl text-gray-600 mb-8">
                  Product Designer com 3+ anos de experiência, especializado em metodologias AI-enhanced 
                  e criação de sistemas que amplificam a capacidade criativa através de processos sistemáticos.
                </p>
                
                <div className="flex flex-wrap gap-3 mb-8">
                  <Badge variant="default">Product Designer</Badge>
                  <Badge variant="outline">AI-enhanced</Badge>
                  <Badge variant="outline">UX Designer</Badge>
                </div>
                
                <div className="flex gap-4">
                  <Button asChild>
                    <Link href="/showcase">
                      <LucideIcons.Rocket className="mr-2 h-4 w-4" />
                      Ver Meu Trabalho
                    </Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="#contato">
                      <LucideIcons.Mail className="mr-2 h-4 w-4" />
                      Entrar em Contato
                    </Link>
                  </Button>
                </div>
              </div>
              
              <div className="text-center">
                <div className="relative">
                    <div className="w-64 h-64 relative mx-auto">
                    <img 
                      src="/profile-photo.png" 
                      alt="Marcos Bricches"
                      className="w-full h-full object-cover rounded-full border-4 border-white shadow-lg"
                    />
                    </div>
                  <div className="absolute -bottom-4 -right-4 bg-white rounded-full p-3 shadow-lg">
                    <LucideIcons.Sparkles className="h-8 w-8 text-yellow-500" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filosofia */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Minha Filosofia de Design</h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              <Card>
                <CardContent className="p-8">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <LucideIcons.Brain className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold mb-4">Design é Engenharia Criativa</h3>
                  <p className="text-gray-600">
                    Não acredito que bom design seja apenas intuição. É aplicação sistemática de princípios, 
                    onde processo bem pensado libera criatividade em vez de limitá-la.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-8">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                    <LucideIcons.Zap className="h-6 w-6 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-bold mb-4">IA Como Amplificador</h3>
                  <p className="text-gray-600">
                    IA não substitui criatividade humana - amplifica nossa capacidade analítica. 
                    Uso ferramentas como Claude para garantir que nenhum detalhe passe despercebido.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-8">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                    <LucideIcons.Code className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold mb-4">Ponte Design-Desenvolvimento</h3>
                  <p className="text-gray-600">
                    Minhas habilidades técnicas (Next.js, TypeScript) me permitem criar protótipos funcionais, 
                    facilitando comunicação com equipes de desenvolvimento.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-8">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                    <LucideIcons.Target className="h-6 w-6 text-orange-600" />
                  </div>
                  <h3 className="text-xl font-bold mb-4">Execução {'>'} Planejamento</h3>
                  <p className="text-gray-600">
                    Meu perfil é naturalmente executor. Prefiro iterar rapidamente com protótipos funcionais 
                    do que passar muito tempo apenas no planejamento teórico.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Jornada */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-16">Minha Jornada</h2>
            
            <div className="space-y-8">
              <Card>
                <CardContent className="p-8">
                  <div className="flex items-start gap-6">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <LucideIcons.Rocket className="h-8 w-8 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold">Product Designer - Devio</h3>
                        <Badge variant="default">Atual</Badge>
                      </div>
                      <p className="text-gray-600 mb-4">
                        Fev 2023 - Presente | Desenvolvimento da metodologia Product Design AI-Enhanced
                      </p>
                      <ul className="text-gray-700 space-y-2">
                        <li>• Criação de framework proprietário para design sistemático com IA</li>
                        <li>• Resultados: 101% aumento em produtividade, 50% redução de tempo</li>
                        <li>• Implementação de padrões defensivos e validação automatizada</li>
                        <li>• Desenvolvimento de métricas objetivas para decisões arquiteturais</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-8">
                  <div className="flex items-start gap-6">
                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <LucideIcons.Users className="h-8 w-8 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-2">UX Designer - Mestres da Web</h3>
                      <p className="text-gray-600 mb-4">
                        Nov 2021 - Jan 2023 | Projetos múltiplos, ERPs, pesquisa estratégica
                      </p>
                      <ul className="text-gray-700 space-y-2">
                        <li>• Design de sistemas complexos para diversos clientes</li>
                        <li>• Pesquisa de usuário e validação de interfaces</li>
                        <li>• Criação de design systems escaláveis</li>
                        <li>• Primeiras experimentações com automação de processos</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-8">
                  <div className="flex items-start gap-6">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <LucideIcons.GraduationCap className="h-8 w-8 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-2">Formação Contínua</h3>
                      <p className="text-gray-600 mb-4">
                        Investimento constante em aprendizado e desenvolvimento
                      </p>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-semibold mb-2">Certificações Tera:</h4>
                          <ul className="text-sm text-gray-600 space-y-1">
                            <li>• Digital Product Design</li>
                            <li>• Behavioral Design</li>
                            <li>• Design e Negócios</li>
                            <li>• UX Research</li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-2">Outras Certificações:</h4>
                          <ul className="text-sm text-gray-600 space-y-1">
                            <li>• Google UX Design</li>
                            <li>• Figma Advanced</li>
                            <li>• Design Gráfico FMU</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Skills */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-16">Competências Principais</h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              <Card>
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <LucideIcons.Palette className="h-8 w-8 text-blue-600" />
                  </div>
                  <CardTitle>Design</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Product Design</li>
                    <li>• UX Research</li>
                    <li>• Design Systems</li>
                    <li>• Design Thinking</li>
                    <li>• Behavioral Design</li>
                  </ul>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <LucideIcons.Code className="h-8 w-8 text-purple-600" />
                  </div>
                  <CardTitle>Técnico</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Next.js & React</li>
                    <li>• TypeScript</li>
                    <li>• Tailwind CSS</li>
                    <li>• Figma Advanced</li>
                    <li>• Shadcn/UI</li>
                  </ul>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <LucideIcons.Sparkles className="h-8 w-8 text-green-600" />
                  </div>
                  <CardTitle>IA & Automação</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Claude AI Integration</li>
                    <li>• Process Automation</li>
                    <li>• Methodology Development</li>
                    <li>• RAG Systems</li>
                    <li>• AI-Enhanced Workflows</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Diferencial */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-12">Meu Diferencial Competitivo</h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              <Card>
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold mb-4">Metodologia Própria</h3>
                  <p className="text-gray-600 mb-4">
                    Desenvolvi um framework sistemático que combina análise inteligente de requisitos 
                    com implementação técnica robusta, eliminando o gap entre design e desenvolvimento.
                  </p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• 6 camadas de análise obrigatória</li>
                    <li>• Métricas objetivas para decisões</li>
                    <li>• Validação automatizada de qualidade</li>
                    <li>• Código funcional como entrega</li>
                  </ul>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold mb-4">Perfil Híbrido Único</h3>
                  <p className="text-gray-600 mb-4">
                    Product Designer + Front-end + Criador de Metodologias + 
                    Especialista em IA que resulta em soluções mais completas e implementáveis.
                  </p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Design strategy + Technical execution</li>
                    <li>• Protótipos funcionais, não apenas visuais</li>
                    <li>• Comunicação fluida com developers</li>
                    <li>• Processo sistemático, resultados criativos</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Contato */}
      <section id="contato" className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-6">Vamos Conversar?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Interessado em metodologias AI-enhanced, processos sistemáticos de design 
            ou quer discutir oportunidades de colaboração?
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button size="lg" variant="secondary" asChild>
              <a href="mailto:marcos.bricches@gmail.com">
                <LucideIcons.Mail className="mr-2 h-5 w-5" />
                marcos.bricches@gmail.com
              </a>
            </Button>
            
            <Button size="lg" variant="outline" className="border-white text-blue-600 hover:bg-white hover:text-blue-600" asChild>
              <a href="https://linkedin.com/in/marcosbricches" target="_blank" rel="noopener noreferrer">
                <LucideIcons.Linkedin className="mr-2 h-5 w-5" />
                LinkedIn
              </a>
            </Button>
          </div>
          
          <div className="max-w-2xl mx-auto">
            <h3 className="text-xl font-semibold mb-4">Sempre aberto para discutir:</h3>
            <div className="grid md:grid-cols-2 gap-4 text-left">
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <LucideIcons.CheckCircle className="h-4 w-4" />
                  <span>Metodologias de design sistemático</span>
                </li>
                <li className="flex items-center gap-2">
                  <LucideIcons.CheckCircle className="h-4 w-4" />
                  <span>Integração IA em processos criativos</span>
                </li>
                <li className="flex items-center gap-2">
                  <LucideIcons.CheckCircle className="h-4 w-4" />
                  <span>Otimização de workflows de design</span>
                </li>
              </ul>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <LucideIcons.CheckCircle className="h-4 w-4" />
                  <span>Product design strategy</span>
                </li>
                <li className="flex items-center gap-2">
                  <LucideIcons.CheckCircle className="h-4 w-4" />
                  <span>Technical prototyping</span>
                </li>
                <li className="flex items-center gap-2">
                  <LucideIcons.CheckCircle className="h-4 w-4" />
                  <span>Oportunidades de colaboração</span>
                </li>
              </ul>
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
                Metodologia sistemática criada por Marcos Bricches para design de produtos digitais com IA.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Contato</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="mailto:marcos.bricches@gmail.com" className="hover:text-white transition-colors">
                    marcos.bricches@gmail.com
                  </a>
                </li>
                <li>
                  <a href="https://linkedin.com/in/marcosbricches" className="hover:text-white transition-colors">
                    LinkedIn
                  </a>
                </li>
                <li>Product Designer & AI Methodologist</li>
              </ul>
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
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Marcos Bricches. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}