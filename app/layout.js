import './globals.css';
import { display, body, mono } from '@/lib/fonts';
import { Nav, Footer } from '@/components/UI';
import { SITE_URL, ogDefaults } from '@/lib/seo';

export function generateMetadata() {
  return {
    metadataBase: new URL(SITE_URL),
    title: 'SmartwatchTimeline — The Complete History of Smartwatches',
    description: 'Every smartwatch, every generation, compared on the specs that matter — battery life, health sensors, and price.',
    alternates: { canonical: '/' },
    openGraph: {
      ...ogDefaults('/'),
      title: 'SmartwatchTimeline',
      description: 'Every smartwatch, every generation, compared on the specs that matter.',
      images: ['/og-image.png'],
    },
  };
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className={`${display.variable} ${body.variable} ${mono.variable} font-body bg-page text-fg min-h-screen`}>
        <a href="#main-content" className="skip-link">Skip to content</a>
        <header className="max-w-6xl mx-auto px-4 sm:px-6 py-5 sm:py-6">
          <Nav />
        </header>
        <main id="main-content" className="max-w-6xl mx-auto px-4 sm:px-6 pb-16 min-h-[60vh]">
          {children}
        </main>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-8">
          <Footer />
        </div>
      </body>
    </html>
  );
}
