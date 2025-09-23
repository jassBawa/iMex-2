import { motion } from 'motion/react';
import Link from 'next/link';
import { FeatureCard } from '@/components/landing/feature-card';
import { Smartphone, BarChart3, Shield, Zap } from 'lucide-react';

const Features = () => {
  const features = [
    {
      icon: BarChart3,
      title: 'Real-Time Trading',
      description:
        'Execute orders with sub-millisecond latency using our high-performance engine',
    },
    {
      icon: Shield,
      title: 'Risk Management',
      description:
        'Automated liquidation system with customizable stop-loss and take-profit',
    },
    {
      icon: Zap,
      title: 'Live Price Feeds',
      description:
        'Direct connection to exchange APIs for real-time market data',
    },
    {
      icon: Smartphone,
      title: 'Web Interface',
      description:
        'Clean, responsive trading interface accessible from any device',
    },
  ];

  return (
    <section className="py-20 border-t border-border/50" id="features">
      <div className="container mx-auto px-4">
        <motion.div
          className="text-center space-y-4 mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <motion.h2
            className="text-3xl lg:text-4xl font-semibold text-black font-dm-sans tracking-tight"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Professional Trading Infrastructure
          </motion.h2>
          <motion.p
            className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed font-ibm-plex-mono"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            Built with institutional-grade technology. Microservices
            architecture, Redis streams, and real-time risk management for
            serious traders.
          </motion.p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-4xl mx-auto">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} index={index} />
          ))}
        </div>

        <div className="mt-12 flex justify-center">
          <ButtonRow />
        </div>
      </div>
    </section>
  );
};

export default Features;

const ButtonRow = () => {
  return (
    <div className="flex items-center gap-4">
      <Link
        href="/trade"
        className="text-sm px-6 py-3 rounded-md border border-gray-200 text-black hover:bg-gray-50 transition-colors font-dm-sans font-medium"
      >
        Start Trading
      </Link>
      <Link
        href="/docs"
        className="text-sm px-6 py-3 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-dm-sans font-medium"
      >
        View Documentation
      </Link>
    </div>
  );
};
