import { motion } from 'motion/react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ModeToggle } from '@/components/ui/mode-toggle';

const Header = () => {
  return (
    <motion.header
      className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-md border border-border flex items-center justify-center">
            <span className="text-foreground font-bold text-sm">TP</span>
          </div>
          <span className="text-lg font-semibold text-foreground tracking-tight">
            TradePro
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {[
            { label: 'Trade', href: '/trade' },
            { label: 'Docs', href: '/docs' },
          ].map((item, index) => (
            <motion.div
              key={item.href}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 + 0.2 }}
            >
              <Link
                href={item.href}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {item.label}
              </Link>
            </motion.div>
          ))}
        </nav>

        <motion.div
          className="flex items-center space-x-4"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <ModeToggle />
          <Button asChild variant="ghost" className="hidden md:inline-flex">
            <Link href="/login">Sign in</Link>
          </Button>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button asChild>
              <Link href="/trade">Trade now</Link>
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </motion.header>
  );
};

export default Header;
