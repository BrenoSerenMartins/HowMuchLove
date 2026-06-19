import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CalendarDays, Sparkles } from 'lucide-react';
import type { LoveStoryData } from '@/types';

const formatDateLabel = (value: string | null): string => {
  if (!value) return 'Sem data definida';
  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) return 'Sem data definida';
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(parsedDate);
};

const DashboardTimeUnit: React.FC<{ value: number; label: string; index: number }> = ({ value, label, index }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className="flex flex-col items-center group"
    >
      <div className="relative">
        <span className="font-black text-white tracking-tighter leading-none block text-[clamp(1.25rem,3.2vw,3.2rem)]">
          {String(value).padStart(2, '0')}
        </span>
        <div className="absolute inset-0 bg-primary/20 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>
      <span className="font-black text-primary uppercase font-mono mt-1.5 tracking-[0.26em] text-[clamp(6px,0.7vw,9px)]">
        {label}
      </span>
    </motion.div>
  );
};

const DashboardCounter: React.FC<{ startDate: Date | null }> = ({ startDate }) => {
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

    return (
      <div className="grid grid-cols-3 gap-4 sm:gap-5 md:gap-6 text-center max-w-fit mx-auto">
        <DashboardTimeUnit index={0} value={duration.years} label="Anos" />
        <DashboardTimeUnit index={1} value={duration.months} label="Meses" />
        <DashboardTimeUnit index={2} value={duration.days} label="Dias" />
        <DashboardTimeUnit index={3} value={duration.hours} label="Horas" />
        <DashboardTimeUnit index={4} value={duration.minutes} label="Minutos" />
        <DashboardTimeUnit index={5} value={duration.seconds} label="Segundos" />
      </div>
    );
};

const DashboardHero: React.FC<{
  storyData: LoveStoryData;
}> = ({ storyData }) => {
  const startDate = storyData.startDate ? new Date(storyData.startDate) : null;
  const validStartDate = startDate && !Number.isNaN(startDate.getTime()) ? startDate : null;
  const planName = typeof storyData.plan === 'string'
    ? storyData.plan
    : Array.isArray(storyData.plan)
      ? storyData.plan[0]?.name || 'Gratis'
      : storyData.plan?.name || 'Gratis';

  return (
    <div className="mx-auto w-full max-w-5xl space-y-12 text-center relative group">
        {/* Heartbeat Ambient Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 blur-[120px] rounded-full animate-glow-pulse pointer-events-none z-0" />

        <div className="relative z-10 space-y-12">
            <h2 className="text-fluid-h2 font-black text-white tracking-tighter uppercase leading-none drop-shadow-[0_0_20px_rgba(255,255,255,0.15)]">
                A nossa história <br/>
                <span className="text-primary italic font-cursive text-4xl lowercase tracking-normal px-2 opacity-80">começou há:</span>
            </h2>

            <div className="py-4 transform scale-[1.1] md:scale-[1.25] lg:scale-[1.4] transition-transform duration-1000 filter drop-shadow-[0_0_30px_rgba(255,45,85,0.3)]">
                <DashboardCounter startDate={validStartDate} />
            </div>

            <div className="mx-auto flex w-fit items-center justify-center gap-8 py-4 opacity-60 hover:opacity-100 transition-opacity duration-500">
                <div className="flex items-center gap-3 text-slate-400">
                    <CalendarDays className="w-4 h-4 text-primary/40" />
                    <span className="text-[11px] font-bold uppercase tracking-[0.3em] font-mono">
                        Desde {formatDateLabel(storyData.startDate)}
                    </span>
                </div>
                <div className="w-1.5 h-1.5 rounded-full bg-white/10" />
                <div className="flex items-center gap-3">
                    <Sparkles className="w-4 h-4 text-primary/40" />
                    <span className="text-[11px] font-black uppercase tracking-[0.3em] font-mono text-primary/80">
                        {planName} Tier
                    </span>
                </div>
            </div>
        </div>
    </div>
  );
};

export default DashboardHero;
