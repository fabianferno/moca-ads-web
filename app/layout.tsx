import type { Metadata } from 'next'
import { Providers } from '@/components/providers'
import './globals.css'

export const metadata: Metadata = {
  title: 'Moca Ads',
  description: 'Moca Ads',
  generator: 'Moca Ads',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        <Providers partnerId="8c8cd8b3-e234-429c-90ba-c41357561e1b">
          {children}
        </Providers>
      </body>
    </html>
  )
}
