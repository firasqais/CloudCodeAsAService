import type { Metadata } from 'next'
import './globals.css'
import Providers from '@/components/Providers'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'कोठा Nepal - Find Rooms, Flats & Flatmates in Nepal',
  description: 'Nepal\'s most trusted platform for finding rooms, flats, apartments, PG, and flatmates. Search in Kathmandu, Pokhara, Lalitpur and all major cities.',
  keywords: 'room for rent Nepal, flat for rent Kathmandu, roommate Nepal, kotha Nepal, flat share Nepal',
  openGraph: {
    title: 'कोठा Nepal - Find Your Perfect Room',
    description: 'Nepal\'s most trusted room rental and flatmate finding platform',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-gray-50 text-gray-900">
        <Providers>
          <Navbar />
          <main className="min-h-screen">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  )
}
