'use client';
import Link from 'next/link';
import Header from '@/components/landing/Header';

const Docs = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-5xl mx-auto">
          <div className="text-center my-20">
            <h1 className="text-4xl md:text-6xl font-medium text-foreground leading-tight mb-6 font-dm-sans tracking-tight">
              TradePro{' '}
              <span className="italic font-instrument-serif tracking-normal">
                Documentation
              </span>
            </h1>
            <p className="text-sm md:text-md text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed font-ibm-plex-mono">
              Explore the technical architecture and implementation details of a
              high-performance trading engine.
            </p>
          </div>

          <div className="border border-border mb-16">
            <div className="border-b border-border px-8 py-6">
              <h2 className="text-2xl font-semibold text-foreground font-dm-sans tracking-tight">
                System Architecture
              </h2>
            </div>
            <div className="p-8">
              <div className="text-center mb-8">
                <img
                  src="/architecture.png"
                  alt="TradePro System Architecture"
                  className="w-full max-w-4xl mx-auto border border-border"
                />
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed max-w-4xl mx-auto">
                The system follows a microservices architecture with three core
                components communicating through Redis streams. Real-time price
                data flows from external exchanges through WebSocket
                connections, gets processed by the trading engine, and triggers
                automatic liquidations based on leverage and risk parameters.
              </p>
            </div>
          </div>

          {/* Core Components */}
          <div className="border border-border mb-16">
            <div className="border-b border-border px-8 py-6">
              <h2 className="text-2xl font-semibold text-foreground font-dm-sans tracking-tight">
                Core Components & Implementation
              </h2>
            </div>
            <div className="p-8 space-y-12">
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-6 font-dm-sans">
                  Trading Engine
                </h3>
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="text-lg font-medium mb-4 font-dm-sans">
                      Order Processing Logic
                    </h4>
                    <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
                      <p>
                        The trading engine processes orders through Redis
                        streams with real-time price validation:
                      </p>
                      <div className="bg-muted p-4 font-ibm-plex-mono text-xs">
                        <div>
                          • Validates user balance against required margin
                        </div>
                        <div>
                          • Calculates opening price based on bid/ask spread
                        </div>
                        <div>• Deducts margin: (price × qty) / leverage</div>
                        <div>
                          • Stores order in memory for real-time monitoring
                        </div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-lg font-medium mb-4 font-dm-sans">
                      Liquidation Mechanism
                    </h4>
                    <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
                      <p>
                        Automatic liquidation system runs on every price update:
                      </p>
                      <div className="bg-muted p-4 font-ibm-plex-mono text-xs">
                        <div>• Take Profit: buy orders when price ≥ target</div>
                        <div>• Stop Loss: sell orders when price ≤ target</div>
                        <div>
                          • Margin Call: when remaining margin ≤ 5% of initial
                        </div>
                        <div>
                          • PnL calculation: (closing - opening) × qty × side
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8">
                  <h4 className="text-lg font-medium mb-4 font-dm-sans">
                    Redis Stream Communication
                  </h4>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="border border-border p-4">
                      <h5 className="font-medium mb-2">
                        engine-stream (Input)
                      </h5>
                      <div className="text-xs font-ibm-plex-mono text-muted-foreground space-y-1">
                        <div>price-update: Real-time price data</div>
                        <div>create-order: New order requests</div>
                        <div>close-order: Manual order closures</div>
                      </div>
                    </div>
                    <div className="border border-border p-4">
                      <h5 className="font-medium mb-2">
                        callback-queue (Output)
                      </h5>
                      <div className="text-xs font-ibm-plex-mono text-muted-foreground space-y-1">
                        <div>created: Order successfully created</div>
                        <div>closed: Order liquidated/closed</div>
                        <div>insufficient_balance: Margin not met</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-foreground mb-6 font-dm-sans">
                  Price Poller & WebSocket Integration
                </h3>
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="text-lg font-medium mb-4 font-dm-sans">
                      WebSocket Connection
                    </h4>
                    <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
                      <p>
                        Connects to Backpack Exchange for real-time BTC_USDC
                        price feeds:
                      </p>
                      <div className="bg-black text-white p-4 font-ibm-plex-mono text-xs">
                        {`const subscribeMessage = {
  method: "SUBSCRIBE",
  params: ["bookTicker.BTC_USDC"],
  id: 1
};`}
                      </div>
                      <p>
                        Streams bid/ask prices directly to the trading engine
                        via Redis.
                      </p>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-lg font-medium mb-4 font-dm-sans">
                      Price Processing
                    </h4>
                    <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
                      <p>
                        Every price update triggers immediate liquidation
                        checks:
                      </p>
                      <div className="bg-muted p-4 font-ibm-plex-mono text-xs">
                        <div>• Bid price: Used for sell order executions</div>
                        <div>• Ask price: Used for buy order executions</div>
                        <div>• Mid price: (bid + ask) / 2 for display</div>
                        <div>• Spread: Difference between bid and ask</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Web Server Details */}
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-6 font-dm-sans">
                  Web Server & API Layer
                </h3>
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="text-lg font-medium mb-4 font-dm-sans">
                      Authentication & Middleware
                    </h4>
                    <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
                      <p>
                        JWT-based authentication with middleware protection:
                      </p>
                      <div className="bg-muted p-4 font-ibm-plex-mono text-xs">
                        <div>• Token generation on login</div>
                        <div>
                          • Middleware validates JWT on protected routes
                        </div>
                        <div>
                          • User context injection for order association
                        </div>
                        <div>• Session management for persistent auth</div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-lg font-medium mb-4 font-dm-sans">
                      Order Lifecycle Management
                    </h4>
                    <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
                      <p>Complete order management with async communication:</p>
                      <div className="bg-muted p-4 font-ibm-plex-mono text-xs">
                        <div>• Creates order in pending state</div>
                        <div>• Sends to engine via Redis stream</div>
                        <div>• Waits for callback confirmation</div>
                        <div>• Updates database with final status</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="border border-border mb-16">
            <div className="border-b border-border px-8 py-6">
              <h2 className="text-2xl font-semibold text-foreground font-dm-sans tracking-tight">
                API Routes
              </h2>
              <p className="text-sm text-muted-foreground mt-2 font-ibm-plex-mono">
                Base URL: http://localhost:4000/api/v1
              </p>
            </div>
            <div className="p-8">
              <div className="grid md:grid-cols-3 gap-8">
                <div>
                  <h3 className="text-lg font-semibold mb-6 font-dm-sans">
                    /auth
                  </h3>
                  <div className="space-y-3 font-ibm-plex-mono text-sm">
                    <div className="flex justify-between items-center py-2 border-b border-border">
                      <span className="bg-gray-900 text-white px-3 py-1 text-xs">
                        POST
                      </span>
                      <span className="text-muted-foreground">
                        /auth/signup
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="bg-gray-900 text-white px-3 py-1 text-xs">
                        GET
                      </span>
                      <span className="text-muted-foreground">
                        /auth/signin/verify
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-muted rounded text-xs text-muted-foreground">
                    <div className="font-medium mb-1">Protected routes:</div>
                    <div>GET /auth/protected-route-test</div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-6 font-dm-sans">
                    /trade
                  </h3>
                  <div className="space-y-3 font-ibm-plex-mono text-sm">
                    <div className="flex justify-between items-center py-2 border-b border-border">
                      <span className="bg-gray-900 text-white px-3 py-1 text-xs">
                        POST
                      </span>
                      <span className="text-muted-foreground">
                        /trade/create-order
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-border">
                      <span className="bg-gray-900 text-white px-3 py-1 text-xs">
                        POST
                      </span>
                      <span className="text-muted-foreground">
                        /trade/close-order
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-border">
                      <span className="bg-gray-900 text-white px-3 py-1 text-xs">
                        GET
                      </span>
                      <span className="text-muted-foreground">
                        /trade/get-open-orders
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="bg-gray-900 text-white px-3 py-1 text-xs">
                        GET
                      </span>
                      <span className="text-muted-foreground">
                        /trade/get-close-orders
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-muted rounded text-xs text-muted-foreground">
                    <div className="font-medium mb-1">
                      All routes protected:
                    </div>
                    <div>Requires authMiddleware</div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-6 font-dm-sans">
                    /balance
                  </h3>
                  <div className="space-y-3 font-ibm-plex-mono text-sm">
                    <div className="flex justify-between items-center py-2">
                      <span className="bg-gray-900 text-white px-3 py-1 text-xs">
                        GET
                      </span>
                      <span className="text-muted-foreground">/balance/me</span>
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-muted rounded text-xs text-muted-foreground">
                    <div className="font-medium mb-1">Protected route:</div>
                    <div>Returns user balance</div>
                  </div>
                </div>
              </div>

              <div className="mt-8 p-6 bg-muted rounded-lg">
                <h4 className="text-lg font-semibold mb-4 font-dm-sans">
                  Route Structure & File Organization
                </h4>
                <div className="font-ibm-plex-mono text-sm text-muted-foreground space-y-3">
                  <div>
                    <span className="font-medium text-foreground">
                      📁 Main Router
                    </span>
                    <div className="ml-4 text-xs text-muted-foreground">
                      apps/api/src/routes/index.ts
                    </div>
                    <div className="ml-4 text-xs mt-1">
                      • Mounts: /auth, /trade, /balance
                    </div>
                  </div>

                  <div>
                    <span className="font-medium text-foreground">
                      📁 Auth Router
                    </span>
                    <div className="ml-4 text-xs text-muted-foreground">
                      apps/api/src/routes/auth.routes.ts
                    </div>
                    <div className="ml-4 text-xs mt-1 space-y-1">
                      <div>• POST /signup → signupHandler</div>
                      <div>• GET /signin/verify → signInVerify</div>
                      <div>• GET /protected-route-test → authMiddleware</div>
                    </div>
                  </div>

                  <div>
                    <span className="font-medium text-foreground">
                      📁 Trade Router
                    </span>
                    <div className="ml-4 text-xs text-muted-foreground">
                      apps/api/src/routes/trade.routes.ts
                    </div>
                    <div className="ml-4 text-xs mt-1 space-y-1">
                      <div>
                        • POST /create-order → authMiddleware + createOrder
                      </div>
                      <div>
                        • POST /close-order → authMiddleware + closeOrder
                      </div>
                      <div>
                        • GET /get-open-orders → authMiddleware +
                        fetchOpenOrders
                      </div>
                      <div>
                        • GET /get-close-orders → authMiddleware +
                        fetchCloseOrders
                      </div>
                    </div>
                  </div>

                  <div>
                    <span className="font-medium text-foreground">
                      📁 Balance Router
                    </span>
                    <div className="ml-4 text-xs text-muted-foreground">
                      apps/api/src/routes/balance.route.ts
                    </div>
                    <div className="ml-4 text-xs mt-1 space-y-1">
                      <div>• GET /me → authMiddleware + getUserBalance</div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-border">
                    <div className="text-xs">
                      <span className="font-medium text-foreground">
                        Middleware Chain:
                      </span>
                      <div className="ml-2 mt-1">
                        authMiddleware → Controller → Response
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Database Schema */}
          <div className="border border-border mb-16">
            <div className="border-b border-border px-8 py-6">
              <h2 className="text-2xl font-semibold text-foreground font-dm-sans tracking-tight">
                Database Schema
              </h2>
              <p className="text-sm text-muted-foreground mt-2 font-ibm-plex-mono">
                PostgreSQL with Prisma ORM • Schema:
                packages/db/prisma/schema.prisma
              </p>
            </div>
            <div className="p-8">
              <div className="grid lg:grid-cols-2 gap-8">
                {/* User Model */}
                <div className="bg-muted rounded-lg border border-border overflow-hidden">
                  <div className="bg-gray-900 text-white px-6 py-3">
                    <h3 className="text-lg font-semibold font-ibm-plex-mono">
                      model User
                    </h3>
                  </div>
                  <div className="p-6">
                    <div className="bg-white rounded border font-ibm-plex-mono text-sm overflow-hidden">
                      <div className="bg-muted px-4 py-2 text-xs font-medium text-muted-foreground border-b">
                        Prisma Schema Definition
                      </div>
                      <div className="p-4 space-y-3">
                        <div className="flex items-start">
                          <span className="text-blue-600 font-medium mr-2">
                            id
                          </span>
                          <span className="text-foreground">String</span>
                          <span className="text-purple-600 ml-2">@id</span>
                          <span className="text-green-600 ml-1">
                            @default(uuid())
                          </span>
                        </div>
                        <div className="flex items-start">
                          <span className="text-blue-600 font-medium mr-2">
                            email
                          </span>
                          <span className="text-foreground">String</span>
                          <span className="text-purple-600 ml-2">@unique</span>
                        </div>
                        <div className="flex items-start">
                          <span className="text-blue-600 font-medium mr-2">
                            lastLoggedIn
                          </span>
                          <span className="text-foreground">DateTime</span>
                        </div>
                        <div className="flex items-start">
                          <span className="text-blue-600 font-medium mr-2">
                            balance
                          </span>
                          <span className="text-foreground">Int</span>
                        </div>
                        <div className="flex items-start">
                          <span className="text-blue-600 font-medium mr-2">
                            existingTrades
                          </span>
                          <span className="text-foreground">
                            ExistingTrade[]
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ExistingTrade Model */}
                <div className="bg-muted rounded-lg border border-border overflow-hidden">
                  <div className="bg-gray-900 text-white px-6 py-3">
                    <h3 className="text-lg font-semibold font-ibm-plex-mono">
                      model ExistingTrade
                    </h3>
                  </div>
                  <div className="p-6">
                    <div className="bg-white rounded border font-ibm-plex-mono text-sm overflow-hidden">
                      <div className="bg-muted px-4 py-2 text-xs font-medium text-muted-foreground border-b">
                        Prisma Schema Definition
                      </div>
                      <div className="p-4 space-y-3 max-h-80 overflow-y-auto">
                        <div className="flex items-start">
                          <span className="text-blue-600 font-medium mr-2">
                            id
                          </span>
                          <span className="text-foreground">String</span>
                          <span className="text-purple-600 ml-2">@id</span>
                          <span className="text-green-600 ml-1">
                            @default(uuid())
                          </span>
                        </div>
                        <div className="flex items-start">
                          <span className="text-blue-600 font-medium mr-2">
                            openPrice
                          </span>
                          <span className="text-foreground">Float</span>
                        </div>
                        <div className="flex items-start">
                          <span className="text-blue-600 font-medium mr-2">
                            closePrice
                          </span>
                          <span className="text-foreground">Float</span>
                        </div>
                        <div className="flex items-start">
                          <span className="text-blue-600 font-medium mr-2">
                            leverage
                          </span>
                          <span className="text-foreground">Float</span>
                        </div>
                        <div className="flex items-start">
                          <span className="text-blue-600 font-medium mr-2">
                            pnl
                          </span>
                          <span className="text-foreground">Float</span>
                        </div>
                        <div className="flex items-start">
                          <span className="text-blue-600 font-medium mr-2">
                            slippage
                          </span>
                          <span className="text-foreground">Float</span>
                        </div>
                        <div className="flex items-start">
                          <span className="text-blue-600 font-medium mr-2">
                            quantity
                          </span>
                          <span className="text-foreground">Float</span>
                        </div>
                        <div className="flex items-start">
                          <span className="text-blue-600 font-medium mr-2">
                            side
                          </span>
                          <span className="text-foreground">String</span>
                        </div>
                        <div className="flex items-start">
                          <span className="text-blue-600 font-medium mr-2">
                            asset
                          </span>
                          <span className="text-foreground">String</span>
                        </div>
                        <div className="flex items-start">
                          <span className="text-blue-600 font-medium mr-2">
                            liquidated
                          </span>
                          <span className="text-foreground">Boolean</span>
                        </div>
                        <div className="flex items-start">
                          <span className="text-blue-600 font-medium mr-2">
                            userId
                          </span>
                          <span className="text-foreground">String</span>
                        </div>
                        <div className="flex items-start">
                          <span className="text-blue-600 font-medium mr-2">
                            reason
                          </span>
                          <span className="text-foreground">String?</span>
                        </div>
                        <div className="flex items-start">
                          <span className="text-blue-600 font-medium mr-2">
                            createdAt
                          </span>
                          <span className="text-foreground">DateTime</span>
                          <span className="text-green-600 ml-2">
                            @default(now())
                          </span>
                        </div>
                        <div className="flex items-start">
                          <span className="text-blue-600 font-medium mr-2">
                            user
                          </span>
                          <span className="text-foreground">User</span>
                          <span className="text-orange-600 ml-2">
                            @relation
                          </span>
                          <span className="text-muted-foreground ml-1">
                            (fields: [userId], references: [id])
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Database Configuration */}
              <div className="mt-8 grid md:grid-cols-3 gap-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <div className="flex items-center mb-3">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                      <span className="text-white text-sm font-bold">DB</span>
                    </div>
                    <h4 className="font-semibold text-foreground">Database</h4>
                  </div>
                  <div className="font-ibm-plex-mono text-sm text-muted-foreground">
                    <div>
                      <span className="font-medium">Provider:</span> PostgreSQL
                    </div>
                    <div>
                      <span className="font-medium">Connection:</span>{' '}
                      env("DATABASE_URL")
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <div className="flex items-center mb-3">
                    <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center mr-3">
                      <span className="text-white text-sm font-bold">P</span>
                    </div>
                    <h4 className="font-semibold text-foreground">ORM</h4>
                  </div>
                  <div className="font-ibm-plex-mono text-sm text-muted-foreground">
                    <div>
                      <span className="font-medium">Framework:</span> Prisma
                    </div>
                    <div>
                      <span className="font-medium">Client:</span>{' '}
                      @prisma/client
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                  <div className="flex items-center mb-3">
                    <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center mr-3">
                      <span className="text-white text-sm font-bold">📁</span>
                    </div>
                    <h4 className="font-semibold text-foreground">Schema</h4>
                  </div>
                  <div className="font-ibm-plex-mono text-sm text-muted-foreground">
                    <div>
                      <span className="font-medium">Location:</span>
                    </div>
                    <div className="text-xs break-all">
                      packages/db/prisma/schema.prisma
                    </div>
                  </div>
                </div>
              </div>

              {/* Relationship Diagram */}
              <div className="mt-8 bg-muted rounded-lg p-6">
                <h4 className="text-lg font-semibold mb-4 text-foreground">
                  Entity Relationship
                </h4>
                <div className="flex items-center justify-center space-x-8">
                  <div className="bg-white border-2 border-blue-300 rounded-lg p-4 text-center min-w-[120px]">
                    <div className="font-semibold text-blue-600 mb-2">User</div>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <div>id (PK)</div>
                      <div>email</div>
                      <div>balance</div>
                    </div>
                  </div>

                  <div className="flex flex-col items-center">
                    <div className="text-2xl text-muted-foreground">1</div>
                    <div className="w-8 h-0.5 bg-gray-400"></div>
                    <div className="text-2xl text-muted-foreground">∞</div>
                  </div>

                  <div className="bg-white border-2 border-green-300 rounded-lg p-4 text-center min-w-[140px]">
                    <div className="font-semibold text-green-600 mb-2">
                      ExistingTrade
                    </div>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <div>id (PK)</div>
                      <div>userId (FK)</div>
                      <div>openPrice</div>
                      <div>closePrice</div>
                      <div>pnl</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Technical Deep Dive */}
          <div className="border border-border mb-16">
            <div className="border-b border-border px-8 py-6">
              <h2 className="text-2xl font-semibold text-foreground font-dm-sans tracking-tight">
                Technical Deep Dive
              </h2>
            </div>
            <div className="p-8 space-y-12">
              {/* Real-time Data Flow */}
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-6 font-dm-sans">
                  Real-time Data Flow
                </h3>
                <div className="space-y-6">
                  <div className="border border-border p-6">
                    <h4 className="text-lg font-semibold mb-4 font-dm-sans">
                      Price Update Sequence
                    </h4>
                    <div className="grid md:grid-cols-4 gap-4 text-sm">
                      <div className="text-center">
                        <div className="bg-muted p-3 rounded mb-2">
                          <div className="font-ibm-plex-mono text-xs">
                            Backpack Exchange
                          </div>
                        </div>
                        <div className="text-muted-foreground">
                          WebSocket price feed
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="bg-muted p-3 rounded mb-2">
                          <div className="font-ibm-plex-mono text-xs">
                            Price Poller
                          </div>
                        </div>
                        <div className="text-muted-foreground">
                          Parse & validate data
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="bg-muted p-3 rounded mb-2">
                          <div className="font-ibm-plex-mono text-xs">
                            Redis Stream
                          </div>
                        </div>
                        <div className="text-muted-foreground">
                          Queue price updates
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="bg-muted p-3 rounded mb-2">
                          <div className="font-ibm-plex-mono text-xs">
                            Trading Engine
                          </div>
                        </div>
                        <div className="text-muted-foreground">
                          Process liquidations
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border border-border p-6">
                    <h4 className="text-lg font-semibold mb-4 font-dm-sans">
                      Order Creation Sequence
                    </h4>
                    <div className="grid md:grid-cols-5 gap-3 text-sm">
                      <div className="text-center">
                        <div className="bg-muted p-3 rounded mb-2">
                          <div className="font-ibm-plex-mono text-xs">
                            Web UI
                          </div>
                        </div>
                        <div className="text-muted-foreground">
                          User places order
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="bg-muted p-3 rounded mb-2">
                          <div className="font-ibm-plex-mono text-xs">
                            API Server
                          </div>
                        </div>
                        <div className="text-muted-foreground">
                          Validate & auth
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="bg-muted p-3 rounded mb-2">
                          <div className="font-ibm-plex-mono text-xs">
                            Redis Stream
                          </div>
                        </div>
                        <div className="text-muted-foreground">
                          Queue order request
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="bg-muted p-3 rounded mb-2">
                          <div className="font-ibm-plex-mono text-xs">
                            Trading Engine
                          </div>
                        </div>
                        <div className="text-muted-foreground">
                          Process & execute
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="bg-muted p-3 rounded mb-2">
                          <div className="font-ibm-plex-mono text-xs">
                            Callback
                          </div>
                        </div>
                        <div className="text-muted-foreground">
                          Confirm to API
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Risk Management */}
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-6 font-dm-sans">
                  Risk Management & Liquidation Engine
                </h3>
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="text-lg font-semibold mb-4 font-dm-sans">
                      Margin Calculation
                    </h4>
                    <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
                      <div className="bg-black text-white p-4 font-ibm-plex-mono text-xs">
                        {`// Required margin calculation
const requiredMargin = (openingPrice * qty) / leverage;

// Remaining margin after PnL
const currentPnl = side === 'buy' 
  ? (currentPrice - openingPrice) * qty
  : (openingPrice - currentPrice) * qty;

const remainingMargin = initialMargin + currentPnl;`}
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold mb-4 font-dm-sans">
                      Liquidation Triggers
                    </h4>
                    <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
                      <div className="bg-muted p-4 space-y-2">
                        <div className="font-medium">
                          Automatic Liquidation When:
                        </div>
                        <div className="font-ibm-plex-mono text-xs space-y-1">
                          <div>• Remaining margin ≤ 5% of initial margin</div>
                          <div>• Take profit price is reached</div>
                          <div>• Stop loss price is triggered</div>
                          <div>• Manual closure by user</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Performance Optimizations */}
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-6 font-dm-sans">
                  Performance & Scalability
                </h3>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="border border-border p-6">
                    <h4 className="text-lg font-semibold mb-4 font-dm-sans">
                      In-Memory Processing
                    </h4>
                    <div className="text-sm text-muted-foreground space-y-2">
                      <div>
                        • Open orders stored in memory for instant access
                      </div>
                      <div>• Price updates trigger immediate calculations</div>
                      <div>• Periodic database snapshots every 10 seconds</div>
                      <div>• Recovery from database on restart</div>
                    </div>
                  </div>
                  <div className="border border-border p-6">
                    <h4 className="text-lg font-semibold mb-4 font-dm-sans">
                      Async Communication
                    </h4>
                    <div className="text-sm text-muted-foreground space-y-2">
                      <div>• Redis streams for decoupled services</div>
                      <div>• Non-blocking order processing</div>
                      <div>• Promise-based callback system</div>
                      <div>• Timeout handling for failed operations</div>
                    </div>
                  </div>
                  <div className="border border-border p-6">
                    <h4 className="text-lg font-semibold mb-4 font-dm-sans">
                      Error Handling
                    </h4>
                    <div className="text-sm text-muted-foreground space-y-2">
                      <div>• Graceful WebSocket reconnection</div>
                      <div>• Database transaction rollbacks</div>
                      <div>• Redis connection recovery</div>
                      <div>• Comprehensive logging system</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="border border-border mb-16">
            <div className="border-b border-border px-8 py-6">
              <h2 className="text-2xl font-semibold text-foreground font-dm-sans tracking-tighter">
                Docker Setup
              </h2>
            </div>
            <div className="p-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-medium mb-4 font-dm-sans">
                    Production Services
                  </h3>
                  <div className="bg-black text-white p-4 font-ibm-plex-mono text-sm">
                    {`# docker-compose.deployment.yml
services:
  api:
    build: ./docker/api.dockerfile
    ports: ["4000:4000"]
    environment: [DATABASE_URL, JWT_SECRET, ...]
    
  ws:
    build: ./docker/ws.dockerfile  
    ports: ["8080:8080"]
    environment: [REDIS_URL, WS_PORT]
    
  engine:
    build: ./docker/engine.dockerfile
    environment: [DATABASE_URL, REDIS_URL]
    
  poller:
    build: ./docker/poller.dockerfile
    environment: [REDIS_URL]
    
  redis:
    image: redis
    ports: ["6379:6379"]
    healthcheck: redis-cli ping`}
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-4 font-dm-sans">
                    Service Architecture
                  </h3>
                  <div className="space-y-4 text-sm text-muted-foreground">
                    <div>
                      <div className="font-medium mb-1">
                        API Server (Port 4000)
                      </div>
                      <div>• Express.js REST API with auth middleware</div>
                      <div>
                        • Handles user auth, order creation, balance queries
                      </div>
                      <div>• Routes: /auth, /trade, /balance</div>
                    </div>
                    <div>
                      <div className="font-medium mb-1">
                        WebSocket Server (Port 8080)
                      </div>
                      <div>• Real-time price feeds and order updates</div>
                      <div>• Connects to Redis streams for live data</div>
                    </div>
                    <div>
                      <div className="font-medium mb-1">Trading Engine</div>
                      <div>• Processes orders and liquidations</div>
                      <div>• Monitors price updates for risk management</div>
                    </div>
                    <div>
                      <div className="font-medium mb-1">Price Poller</div>
                      <div>• Fetches market data from exchanges</div>
                      <div>• Streams to Redis for engine consumption</div>
                    </div>
                    <div>
                      <div className="font-medium mb-1">Redis</div>
                      <div>• Message streams between services</div>
                      <div>• Health checks and persistent data</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center">
            <div className="border border-border p-12">
              <h2 className="text-3xl font-medium text-foreground mb-6 font-dm-sans">
                Ready to get{' '}
                <span className="italic font-instrument-serif tracking-normal">
                  started
                </span>
                ?
              </h2>
              <p className="text-sm md:text-md text-foreground mb-8 max-w-2xl mx-auto leading-relaxed font-ibm-plex-mono">
                Set up your development environment and start building with
                MarketSim. Join the world of limitless trading opportunities.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center">
                <Link
                  href="/trade"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-3 rounded-md text-sm font-medium transition-colors w-full sm:w-auto text-center"
                >
                  Start Trading
                </Link>
                <a
                  href="https://github.com/jassBawa/imex-2"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border border-input bg-background hover:bg-accent hover:text-accent-foreground px-8 py-3 rounded-md text-sm font-medium transition-colors w-full sm:w-auto text-center"
                >
                  View on GitHub
                </a>
              </div>

              {/* Social Links */}
              <div className="mt-8 pt-6 border-t border-border">
                <div className="flex justify-center items-center space-x-6">
                  <a
                    href="https://github.com/jassBawa/imex-2"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                    </svg>
                    <span className="text-sm font-medium">GitHub</span>
                  </a>

                  <a
                    href="https://x.com/jaspreetbawa_"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                    <span className="text-sm font-medium">Twitter</span>
                  </a>
                </div>
                <p className="text-xs text-muted-foreground mt-4 font-ibm-plex-mono">
                  Built by <span className="font-medium">@jaspreetbawa_</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Docs;
