import { motion } from 'framer-motion';
import { Package, AlertTriangle, XCircle } from 'lucide-react';

interface StatsCardsProps {
  stats: {
    total: number;
    expiringSoon: number;
    expired: number;
  };
}

export function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      title: 'Total Productos',
      value: stats.total,
      icon: Package,
      gradient: 'from-red-500 to-red-600',
      bgColor: 'bg-red-50',
    },
    {
      title: 'Próximos a Vencer',
      value: stats.expiringSoon,
      icon: AlertTriangle,
      gradient: 'from-amber-500 to-orange-500',
      bgColor: 'bg-amber-50',
    },
    {
      title: 'Vencidos',
      value: stats.expired,
      icon: XCircle,
      gradient: 'from-slate-700 to-slate-800',
      bgColor: 'bg-slate-100',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {cards.map((card, index) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className={`relative overflow-hidden ${card.bgColor} border border-slate-200 rounded-2xl p-6 shadow-sm`}
        >
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-14 h-14 bg-gradient-to-br ${card.gradient} rounded-2xl flex items-center justify-center shadow-lg`}>
                <card.icon className="w-7 h-7 text-white" />
              </div>
            </div>
            <p className="text-sm font-semibold text-slate-600 mb-2">
              {card.title}
            </p>
            <motion.p
              key={card.value}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              className={`text-5xl font-bold bg-gradient-to-r ${card.gradient} bg-clip-text text-transparent`}
            >
              {card.value}
            </motion.p>
          </div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/30 rounded-full -mr-16 -mt-16"></div>
        </motion.div>
      ))}
    </div>
  );
}
