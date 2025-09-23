import { motion } from 'motion/react';
import { LucideIcon } from 'lucide-react';

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  index: number;
}

export const FeatureCard = ({
  icon: Icon,
  title,
  description,
  index,
}: FeatureCardProps) => {
  return (
    <motion.div
      className="text-center space-y-4 group"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{
        duration: 0.6,
        delay: index * 0.1,
        ease: 'easeOut',
      }}
      whileHover={{ y: -10 }}
    >
      <motion.div
        className="w-14 h-14 rounded-full border border-border bg-background flex items-center justify-center mx-auto"
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.2 }}
      >
        <Icon className="w-7 h-7 text-foreground" />
      </motion.div>

      <motion.div
        className="space-y-2"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ delay: index * 0.1 + 0.3 }}
      >
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        <p className="text-muted-foreground text-sm leading-relaxed">
          {description}
        </p>
      </motion.div>
    </motion.div>
  );
};
