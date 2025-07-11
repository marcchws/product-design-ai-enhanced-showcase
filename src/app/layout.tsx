import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'sonner'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Product Design AI-Enhanced | Metodologia Sistemática',
  description: 'Framework sistemático para Product Design com IA que transforma requisitos ambíguos em produtos completos e funcionais.',
  authors: [{ name: 'Marcos Bricches' }],
  keywords: ['product design', 'ai enhanced', 'methodology', 'ux ui', 'design system', 'marcos bricches'],
  openGraph: {
    title: 'Product Design AI-Enhanced',
    description: 'Metodologia sistemática que combina análise inteligente com implementação técnica robusta',
    type: 'website',
    locale: 'pt_BR',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        {children}
        <Toaster position="bottom-right" richColors />
      </body>
    </html>
  )
}