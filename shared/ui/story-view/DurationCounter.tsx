import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const TimeUnit: React.FC<{ value: number; label: string; index: number }> = ({ value, label, index }) => (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className="flex flex-col items-center group"
    >
      <div className="relative">
        <span className="text-[clamp(2.5rem,8vw,8rem)] font-black text-white tracking-tighter leading-none block">
          {String(value).padStart(2, '0')}
        </span>
        <div className="absolute inset-0 bg-primary/20 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>
      <span className="text-[clamp(8px,1vw,12px)] font-black text-primary uppercase tracking-[0.4em] mt-6 font-mono">
        {label}
      </span>
    </motion.div>
);
  
const DurationCounter: React.FC<{ startDate: Date | null }> = ({ startDate }) => {
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
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-6 md:gap-10 text-center">
        <TimeUnit index={0} value={duration.years} label="Anos" />
        <TimeUnit index={1} value={duration.months} label="Meses" />
        <TimeUnit index={2} value={duration.days} label="Dias" />
        <TimeUnit index={3} value={duration.hours} label="Horas" />
        <TimeUnit index={4} value={duration.minutes} label="Minutos" />
        <TimeUnit index={5} value={duration.seconds} label="Segundos" />
      </div>
    );
};

export default DurationCounter;
