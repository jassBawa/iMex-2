'use client';
import Features from '@/components/landing/Features';
import Footer from '@/components/landing/Footer';
import Header from '@/components/landing/Header';
import Hero from '@/components/landing/Hero';
import Link from 'next/link';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero />
      <Features />
      <section className="py-20 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="mb-16 text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-semibold text-foreground font-dm-sans tracking-tight">
              System Overview
            </h2>
            <p className="text-sm md:text-base text-muted-foreground font-ibm-plex-mono">
              Aligned with current deployment and service roles
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="border border-border rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4 text-foreground font-dm-sans">
                Services
              </h3>
              <ul className="text-sm text-muted-foreground space-y-3 font-ibm-plex-mono">
                <li className="flex justify-between">
                  <span className="text-foreground font-medium">API</span>
                  <span className="text-muted-foreground">port 4000</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-foreground font-medium">WebSocket</span>
                  <span className="text-muted-foreground">port 8080</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-foreground font-medium">Engine</span>
                  <span className="text-muted-foreground">
                    orders & liquidations
                  </span>
                </li>
                <li className="flex justify-between">
                  <span className="text-foreground font-medium">Poller</span>
                  <span className="text-muted-foreground">streams prices</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-foreground font-medium">Redis</span>
                  <span className="text-muted-foreground">
                    streams & cache (6379)
                  </span>
                </li>
              </ul>
            </div>

            <div className="border border-border rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4 text-foreground font-dm-sans">
                API Routes
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="text-sm font-medium mb-2 text-foreground font-dm-sans">
                    /auth
                  </div>
                  <ul className="text-xs text-muted-foreground space-y-1 font-ibm-plex-mono">
                    <li>POST /auth/signup</li>
                    <li>GET /auth/signin/verify</li>
                  </ul>
                </div>
                <div>
                  <div className="text-sm font-medium mb-2 text-foreground font-dm-sans">
                    /trade
                  </div>
                  <ul className="text-xs text-muted-foreground space-y-1 font-ibm-plex-mono">
                    <li>POST /trade/create-order</li>
                    <li>POST /trade/close-order</li>
                    <li>GET /trade/get-open-orders</li>
                    <li>GET /trade/get-close-orders</li>
                  </ul>
                </div>
                <div>
                  <div className="text-sm font-medium mb-2 text-foreground font-dm-sans">
                    /balance
                  </div>
                  <ul className="text-xs text-muted-foreground space-y-1 font-ibm-plex-mono">
                    <li>GET /balance/me</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="border border-border rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4 text-foreground font-dm-sans">
                Database Models
              </h3>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <div className="font-semibold mb-2 text-foreground font-dm-sans">
                    User
                  </div>
                  <ul className="text-muted-foreground space-y-1 font-ibm-plex-mono">
                    <li>id · uuid</li>
                    <li>email · unique</li>
                    <li>lastLoggedIn · DateTime</li>
                    <li>balance · Int</li>
                  </ul>
                </div>
                <div>
                  <div className="font-semibold mb-2 text-foreground font-dm-sans">
                    ExistingTrade
                  </div>
                  <ul className="text-muted-foreground space-y-1 font-ibm-plex-mono">
                    <li>id · uuid</li>
                    <li>openPrice / closePrice · Float</li>
                    <li>leverage / pnl · Float</li>
                    <li>quantity · Float</li>
                    <li>side / asset · String</li>
                    <li>liquidated · Boolean</li>
                    <li>userId · String</li>
                    <li>createdAt · DateTime</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 flex items-center justify-center gap-4">
            <Link
              href="/trade"
              className="text-sm px-6 py-3 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-dm-sans font-medium"
            >
              Open Trading
            </Link>
            <Link
              href="/docs"
              className="text-sm px-6 py-3 rounded-md border border-border text-foreground hover:bg-accent hover:text-accent-foreground transition-colors font-dm-sans font-medium"
            >
              Read Documentation
            </Link>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Index;
