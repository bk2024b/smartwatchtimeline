import './globals.css';
import { display, body, mono } from '@/lib/fonts';
import { Nav } from '@/components/UI';
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
      <body className={`${display.variable} ${body.variable} ${mono.variable} font-body bg-page text-fg`}>
        <header className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
          <Nav />
        </header>
        <main className="max-w-6xl mx-auto px-4 sm:px-6 pb-16">{children}</main>
        {/*
          TODO once accounts exist: Google Analytics / Microsoft Clarity /
          ad network script tags go here, same pattern as EarbudsTimeline's
          components/GoogleAnalytics.js + MicrosoftClarity.js — not stubbed
          with placeholder IDs since a fake ID would silently fail instead
          of erroring, which is worse than just not having it yet.
        */}
      </body>
    </html>
  );
}
