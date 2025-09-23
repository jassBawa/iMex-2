import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { motion } from 'motion/react';

export const HeroContent = () => {
  return (
    <div className="text-center space-y-8 max-w-4xl mx-auto">
      <motion.div
        className="space-y-6"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        <motion.div
          className="inline-flex items-center px-4 py-2 rounded-full border border-border bg-muted text-sm text-muted-foreground font-medium"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          🚀 Professional Trading Platform
        </motion.div>

        <motion.h1
          className="text-5xl lg:text-7xl font-bold text-foreground leading-tight tracking-tight font-dm-sans"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          TradePro
        </motion.h1>

        <motion.h2
          className="text-2xl lg:text-3xl font-semibold text-muted-foreground leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          High-Performance Trading Engine
        </motion.h2>

        <motion.p
          className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed font-ibm-plex-mono"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          Built for serious traders. Real-time order execution, automated risk
          management, and institutional-grade infrastructure. Trade with
          confidence on our lightning-fast platform.
        </motion.p>

        <motion.div
          className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto mt-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <div className="text-center space-y-2">
            <div className="text-2xl font-bold text-foreground">⚡</div>
            <div className="text-sm font-semibold text-foreground">
              Ultra-Fast Execution
            </div>
            <div className="text-xs text-muted-foreground">
              Sub-millisecond order processing
            </div>
          </div>
          <div className="text-center space-y-2">
            <div className="text-2xl font-bold text-foreground">🛡️</div>
            <div className="text-sm font-semibold text-foreground">
              Risk Management
            </div>
            <div className="text-xs text-muted-foreground">
              Automated liquidation protection
            </div>
          </div>
          <div className="text-center space-y-2">
            <div className="text-2xl font-bold text-foreground">📊</div>
            <div className="text-sm font-semibold text-foreground">
              Real-Time Data
            </div>
            <div className="text-xs text-muted-foreground">
              Live price feeds & analytics
            </div>
          </div>
        </motion.div>
      </motion.div>

      <motion.div
        className="flex flex-col sm:flex-row gap-4 justify-center"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            asChild
            size="lg"
            className="px-8 py-4 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Link href="/trade">Start Trading</Link>
          </Button>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="px-8 py-4 border border-input bg-background hover:bg-accent"
          >
            <Link href="/docs">View Documentation</Link>
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
};
