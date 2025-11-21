import React from 'react';
import type { LoveStoryData } from '../types';
import DurationCounter from './DurationCounter';

interface DashboardSummaryProps {
  storyData: LoveStoryData;
  onEdit: () => void;
}

const DashboardSummary: React.FC<DashboardSummaryProps> = ({ storyData, onEdit }) => {
  const { startDate, images } = storyData;
  const date = startDate ? new Date(startDate) : null;
  const mainImage = images && images.length > 0 ? images[0].image_url : 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D';

  return (
    <div className="bg-black/20 backdrop-blur-lg border border-white/10 rounded-2xl shadow-lg p-6 text-white text-center">
      
      <div 
        className="relative w-full h-72 rounded-xl shadow-lg overflow-hidden mb-6"
      >
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${mainImage})` }}
        ></div>
        <div className="absolute inset-0 bg-black/30"></div>
      </div>

      <h2 className="text-2xl font-bold mb-4">Eternizando cada segundo</h2>
      
      <div className="mb-6">
        <DurationCounter startDate={date} />
      </div>

      <button
        onClick={onEdit}
        className="w-full sm:w-auto bg-white/20 text-center border border-white/20 text-white font-semibold py-2 px-6 rounded-lg shadow-sm hover:bg-white/30 hover:-translate-y-0.5 transition-all duration-200"
      >
        Editar História
      </button>
    </div>
  );
};

export default DashboardSummary;
