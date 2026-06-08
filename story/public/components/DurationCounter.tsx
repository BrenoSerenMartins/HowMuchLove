import React, { useState, useEffect } from 'react';

const TimeUnit: React.FC<{ value: number; label: string }> = ({ value, label }) => (
    <div className="flex flex-col items-center">
      <span 
        className="text-4xl md:text-6xl font-bold text-white tracking-tighter" 
        style={{ textShadow: '2px 2px 10px rgba(0,0,0,0.4)' }}
      >
        {String(value).padStart(2, '0')}
      </span>
      <span className="text-[10px] sm:text-xs md:text-sm font-light text-white/80 uppercase tracking-widest" style={{ textShadow: '1px 1px 5px rgba(0,0,0,0.4)' }}>
        {label}
      </span>
    </div>
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
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-4 md:gap-6 text-center">
        <TimeUnit value={duration.years} label="Anos" />
        <TimeUnit value={duration.months} label="Meses" />
        <TimeUnit value={duration.days} label="Dias" />
        <TimeUnit value={duration.hours} label="Horas" />
        <TimeUnit value={duration.minutes} label="Minutos" />
        <TimeUnit value={duration.seconds} label="Segundos" />
      </div>
    );
};

export default DurationCounter;
