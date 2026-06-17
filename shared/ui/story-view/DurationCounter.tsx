import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

type CounterDensity = 'default' | 'dense' | 'compact' | 'dashboard';

const TimeUnit: React.FC<{ value: number; label: string; index: number; density?: CounterDensity }> = ({ value, label, index, density = 'default' }) => {
  const isDense = density === 'dense';
  const isCompact = density === 'compact';
  const isDashboard = density === 'dashboard';

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className="flex flex-col items-center group"
    >
      <div className="relative">
        <span className={`font-black text-white tracking-tighter leading-none block ${
          isCompact
            ? 'text-[clamp(0.95rem,2.2vw,1.6rem)]'
            : isDashboard
              ? 'text-[clamp(1.1rem,3vw,2.8rem)]'
              : isDense
                ? 'text-[clamp(1.15rem,3.2vw,3rem)]'
                : 'text-[clamp(1.25rem,3.5vw,3.2rem)]'
        }`}>
          {String(value).padStart(2, '0')}
        </span>
        <div className="absolute inset-0 bg-primary/20 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>
      <span className={`font-black text-primary uppercase font-mono ${
        isCompact
          ? 'mt-1 tracking-[0.2em] text-[clamp(5px,0.45vw,7px)]'
          : isDashboard
            ? 'mt-1.5 tracking-[0.24em] text-[clamp(6px,0.6vw,8.5px)]'
            : isDense
              ? 'mt-2 tracking-[0.28em] text-[clamp(6.5px,0.7vw,9.5px)]'
              : 'mt-2.5 tracking-[0.32em] text-[clamp(7px,0.8vw,10.5px)]'
      }`}>
        {label}
      </span>
    </motion.div>
  );
};
  
const DurationCounter: React.FC<{ startDate: Date | null; density?: CounterDensity }> = ({ startDate, density = 'default' }) => {
    const [duration, setDuration] = useState<{ years: number; months: number; days: number; hours: number; minutes: number; seconds: number; } | null>(null);
  
    useEffect(() => {
      if (!startDate) {
        setDuration(null);
        return;
      }
      const calculateDuration = () => {
        const now = new Date();
        let years = now.getFullYear() - startDate.getFullYear();
        let months = now.getMonth() - startDate.getMonth();
        let days = now.getDate() - startDate.getDate();
        let hours = now.getHours() - startDate.getHours();
        let minutes = now.getMinutes() - startDate.getMinutes();
        let seconds = now.getSeconds() - startDate.getSeconds();
        if (seconds < 0) { seconds += 60; minutes--; }
        if (minutes < 0) { minutes += 60; hours--; }
        if (hours < 0) { hours += 24; days--; }
        if (days < 0) {
          const daysInLastMonth = new Date(now.getFullYear(), now.getMonth(), 0).getDate();
          days += daysInLastMonth;
          months--;
        }
        if (months < 0) { months += 12; years--; }
        setDuration({ years, months, days, hours, minutes, seconds });
      };
      calculateDuration();
      const interval = setInterval(calculateDuration, 1000);
      return () => clearInterval(interval);
    }, [startDate]);
  
    if (!duration) return null;
  
    const isDashboard = density === 'dashboard';
    const isCompact = density === 'compact';

    return (
      <div className={`grid grid-cols-3 ${isCompact ? 'gap-x-[clamp(2rem,6vw,4rem)] gap-y-4' : isDashboard ? 'gap-x-[clamp(3rem,8vw,6rem)] gap-y-6' : 'gap-x-[clamp(4.5rem,12vw,14rem)] gap-y-[clamp(1.5rem,4vh,2.5rem)]'} text-center max-w-fit mx-auto`}>
        <TimeUnit index={0} value={duration.years} label="Anos" density={density} />
        <TimeUnit index={1} value={duration.months} label="Meses" density={density} />
        <TimeUnit index={2} value={duration.days} label="Dias" density={density} />
        <TimeUnit index={3} value={duration.hours} label="Horas" density={density} />
        <TimeUnit index={4} value={duration.minutes} label="Minutos" density={density} />
        <TimeUnit index={5} value={duration.seconds} label="Segundos" density={density} />
      </div>
    );
};

export default DurationCounter;
