import React, { useState, useEffect, useRef } from 'react';
import DatePicker, { registerLocale } from 'react-datepicker';
import { ptBR } from 'date-fns/locale/pt-BR';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { LoveStoryData, StoryImage } from '../types';

registerLocale('pt-BR', ptBR);

// --- Sub-components ---

const AccordionSection: React.FC<{
  title: string;
  sectionId: string;
  openSection: string | null;
  setOpenSection: (sectionId: string | null) => void;
  children: React.ReactNode;
}> = ({ title, sectionId, openSection, setOpenSection, children }) => {
  const isOpen = openSection === sectionId;
  const handleToggle = () => {
    setOpenSection(isOpen ? null : sectionId);
  };

  return (
    <div className="border-b border-slate-200/80">
      <button
        onClick={handleToggle}
        className="w-full flex justify-between items-center py-4 text-left font-semibold text-slate-700 hover:bg-slate-50/50 px-2 rounded-t-md"
      >
        <span>{title}</span>
        <svg className={`w-5 h-5 transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
      </button>
      <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? 'max-h-screen' : 'max-h-0'}`}>
        <div className="p-4 space-y-6">
          {children}
        </div>
      </div>
    </div>
  );
};


const TimeUnit: React.FC<{ value: number; label: string }> = ({ value, label }) => (
  <div className="flex flex-col items-center">
    <span className="text-4xl md:text-6xl font-bold text-white tracking-tighter" style={{ textShadow: '2px 2px 10px rgba(0,0,0,0.4)' }}>
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

  if (!duration) return <div className="text-center"><p className="text-xl sm:text-2xl font-semibold text-white/90">{!startDate ? "Escolha uma data para começar a contar." : "Calculando..."}</p></div>;

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

const SortableImage: React.FC<{ image: StoryImage; onDelete: (id: number) => void }> = ({ image, onDelete }) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: image.id });
    const style = { transform: CSS.Transform.toString(transform), transition };

    return (
        <div ref={setNodeRef} style={style} {...attributes} className="relative group flex items-center bg-slate-100 p-2 rounded-lg shadow-sm">
            <button {...listeners} className="cursor-grab touch-none p-2 text-slate-500 hover:bg-slate-200 rounded-md">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
            </button>
            <img src={image.image_url} alt="Thumbnail" className="w-12 h-12 rounded-md object-cover mx-4" />
            <span className="flex-grow text-sm text-slate-600 truncate">Imagem</span>
            <button onClick={() => onDelete(image.id)} className="absolute top-1 right-1 p-1 bg-black/30 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
        </div>
    );
};


// --- Main Component ---

interface CounterDemoProps {
  initialData?: LoveStoryData | null;
  onSave?: (data: LoveStoryData) => void;
  onImageUpload?: (file: File) => Promise<StoryImage>;
  onImageDelete?: (id: number) => Promise<void>;
  isDashboard?: boolean;
  saveStatus?: 'idle' | 'saving';
  onDirty?: () => void;
  currentPlan?: string | null;
}

const MAX_MESSAGE_LENGTH = 280;
const PLAN_LIMITS: { [key: string]: number } = { 'Sonho': 1, 'Eterno': 10, 'Infinito': 20 };

const CounterDemo: React.FC<CounterDemoProps> = ({ initialData, onSave, onImageUpload, onImageDelete, isDashboard, saveStatus, onDirty, currentPlan }) => {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [message, setMessage] = useState('');
  const [images, setImages] = useState<StoryImage[]>([]);
  const [layoutPosition, setLayoutPosition] = useState<'top' | 'center' | 'bottom'>('bottom');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [isYoutubeUrlValid, setIsYoutubeUrlValid] = useState(false);
  const [storyPassword, setStoryPassword] = useState('');
  const [entryButtonText, setEntryButtonText] = useState('');
  const [errors, setErrors] = useState<{ startDate?: string; message?: string, images?: string }>({});
  const [openSection, setOpenSection] = useState<string | null>('content');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));

  const imageLimit = PLAN_LIMITS[currentPlan || ''] || 1;
  const limitReached = images.length >= imageLimit;

  useEffect(() => {
    if (initialData) {
      setStartDate(initialData.startDate ? new Date(initialData.startDate) : null);
      setMessage(initialData.message || '');
      setImages(initialData.images || []);
      setLayoutPosition(initialData.layoutPosition || 'bottom');
      setYoutubeUrl(initialData.youtubeUrl || '');
      setEntryButtonText(initialData.entryButtonText || '');
      // Do NOT set the password field. It's for changing/setting only.
    }
  }, [initialData]);

  useEffect(() => {
    const extractYouTubeID = (url: string): string | null => {
        if (!url) return null;
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };
    setIsYoutubeUrlValid(!!extractYouTubeID(youtubeUrl));
  }, [youtubeUrl]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0 && onImageUpload) {
      onDirty?.();
      const file = event.target.files[0];
      setErrors(prev => ({ ...prev, images: 'Enviando imagem...' }));
      try {
        const newImage = await onImageUpload(file);
        setImages(currentImages => [...currentImages, newImage]);
        setErrors(prev => ({ ...prev, images: undefined }));
      } catch (error: any) {
        console.error("Upload failed", error);
        setErrors(prev => ({ ...prev, images: error.message || 'O upload da imagem falhou.' }));
      }
    }
  };

  const handleDeleteImage = async (id: number) => {
    if (!onImageDelete) return;
    onDirty?.();
    const originalImages = images;
    setImages(currentImages => currentImages.filter(img => img.id !== id));
    try {
      await onImageDelete(id);
    } catch (error) {
      console.error("Delete failed", error);
      setErrors(prev => ({ ...prev, images: 'Falha ao deletar a imagem.' }));
      setImages(originalImages); // Revert on failure
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      onDirty?.();
      setImages((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleSave = async () => {
    if (!onSave) return;
    const storyData: LoveStoryData = {
      startDate: startDate ? startDate.toISOString() : null,
      message,
      images,
      layoutPosition,
      youtubeUrl,
      storyPassword, // Always send the password field
      entryButtonText,
    };
    onSave(storyData);
  };
  
  const handleLayoutChange = (position: 'top' | 'center' | 'bottom') => { onDirty?.(); setLayoutPosition(position); };
  
  // Helper functions for layout classes
  const getLayoutContainerClasses = (position: 'top' | 'center' | 'bottom') => {
    switch(position) {
      case 'top': return 'justify-start';
      case 'center': return 'justify-center items-center';
      case 'bottom': default: return 'justify-end';
    }
  };
  
  const getLayoutPanelClasses = (position: 'top' | 'center' | 'bottom') => {
    switch(position) {
      case 'top': return 'w-full bg-gradient-to-b from-black/70 via-black/50 to-transparent pt-6 pb-16 px-4 md:pt-8 md:px-8';
      case 'center': return 'w-full max-w-4xl bg-black/40 backdrop-blur-sm rounded-2xl p-6 md:p-8';
      case 'bottom': default: return 'w-full bg-gradient-to-t from-black/70 via-black/50 to-transparent pt-16 pb-6 px-4 md:pb-8 md:px-8';
    }
  };

  return (
    <div className="bg-white/60 backdrop-blur-md p-4 md:p-8 rounded-2xl shadow-lg border border-slate-200/80">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
        <div className="lg:col-span-2">
          <h3 className="font-bold text-xl mb-4 text-slate-700 px-2">Editor da História</h3>
          <div className="border-t border-slate-200/80">
            <AccordionSection title="Conteúdo Principal" sectionId="content" openSection={openSection} setOpenSection={setOpenSection}>
              {/* Date Picker */}
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">Quando tudo começou?</label>
                <DatePicker
                  selected={startDate} onChange={(d) => { onDirty?.(); setStartDate(d); }} dateFormat="dd/MM/yyyy" placeholderText="dd/mm/aaaa" maxDate={new Date()} locale="pt-BR"
                  className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
                />
              </div>
              {/* Message Textarea */}
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-slate-600 mb-2">Deixe uma mensagem surpresa</label>
                <textarea
                  id="message" value={message} onChange={(e) => { onDirty?.(); setMessage(e.target.value); }} placeholder="Escreva algo especial aqui..." rows={3}
                  className="block w-full px-4 py-3 bg-white border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
                ></textarea>
                <div className="text-right mt-1"><span className={`text-sm ${message.length > MAX_MESSAGE_LENGTH ? 'text-red-500' : 'text-slate-500'}`}>{message.length}/{MAX_MESSAGE_LENGTH}</span></div>
              </div>
            </AccordionSection>

            <AccordionSection title="Mídia e Aparência" sectionId="media" openSection={openSection} setOpenSection={setOpenSection}>
              {/* Image Uploader */}
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">Fotos de vocês ({images.length}/{imageLimit})</label>
                <div className="space-y-2 max-h-72 overflow-y-auto p-2 bg-slate-50 border rounded-lg">
                  <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={images.map(i => i.id)} strategy={verticalListSortingStrategy}>
                      {images.map(image => <SortableImage key={image.id} image={image} onDelete={handleDeleteImage} />)}
                    </SortableContext>
                  </DndContext>
                </div>
                <div className="min-h-[1.25rem] mt-1">
                  {errors.images && <p className="text-red-500 text-sm">{errors.images}</p>}
                </div>
                <input type="file" id="images" accept="image/*" onChange={handleFileChange} ref={fileInputRef} className="hidden" disabled={limitReached} />
                <button onClick={() => fileInputRef.current?.click()} disabled={limitReached} className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-slate-100 text-slate-700 font-semibold rounded-lg shadow-sm hover:bg-slate-200 transition-colors text-sm mt-3 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                    Adicionar Foto
                </button>
                {limitReached && <p className="text-sm text-slate-500 mt-2 text-center">Você atingiu o limite de {imageLimit} imagem(ns) do seu plano.</p>}
              </div>
              {/* Layout Position Controls */}
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">Posição do contador</label>
                <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 rounded-lg">
                    {(['top', 'center', 'bottom'] as ('top' | 'center' | 'bottom')[]).map(pos => (
                        <button
                          key={pos} onClick={() => handleLayoutChange(pos)}
                          className={`px-3 py-2 text-sm font-semibold rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-pink-400 ${layoutPosition === pos ? 'bg-white text-pink-600 shadow' : 'text-slate-600 hover:bg-slate-200'}`}>
                          {pos === 'top' ? 'Superior' : pos === 'center' ? 'Centro' : 'Inferior'}
                        </button>
                    ))}
                </div>
              </div>
              {/* YouTube URL Input */}
              {(currentPlan === 'Eterno' || currentPlan === 'Infinito') && (
                <div>
                  <label htmlFor="youtubeUrl" className="block text-sm font-medium text-slate-600 mb-2">Música do YouTube (Opcional)</label>
                  <div className="relative">
                    <input
                      type="text"
                      id="youtubeUrl"
                      value={youtubeUrl}
                      onChange={(e) => { onDirty?.(); setYoutubeUrl(e.target.value); }}
                      placeholder="Cole o link do YouTube aqui"
                      className="block w-full px-4 py-3 bg-white border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 pr-10"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      {youtubeUrl && (
                        isYoutubeUrlValid ? (
                          <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                        ) : (
                          <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        )
                      )}
                    </div>
                  </div>
                </div>
              )}
            </AccordionSection>

            <AccordionSection title="Configurações de Acesso" sectionId="access" openSection={openSection} setOpenSection={setOpenSection}>
              {/* Story Password Input */}
              {(currentPlan === 'Eterno' || currentPlan === 'Infinito') && (
                <div>
                  <label htmlFor="storyPassword" className="block text-sm font-medium text-slate-600 mb-2">Senha da História (Opcional)</label>
                  <input
                    type="password"
                    id="storyPassword"
                    value={storyPassword}
                    onChange={(e) => { onDirty?.(); setStoryPassword(e.target.value); }}
                    placeholder="Digite para definir ou alterar a senha"
                    className="block w-full px-4 py-3 bg-white border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
                  />
                </div>
              )}
              {/* Entry Button Text Input */}
              {(currentPlan === 'Eterno' || currentPlan === 'Infinito') && (
                <div>
                  <label htmlFor="entryButtonText" className="block text-sm font-medium text-slate-600 mb-2">Texto do Botão de Entrada (Opcional)</label>
                  <input
                    type="text"
                    id="entryButtonText"
                    value={entryButtonText}
                    onChange={(e) => { onDirty?.(); setEntryButtonText(e.target.value); }}
                    placeholder="Ex: Entrar, Ver nossa história..."
                    className="block w-full px-4 py-3 bg-white border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
                  />
                </div>
              )}
              {/* Message for Sonho plan */}
              {currentPlan === 'Sonho' && (
                <p className="text-sm text-slate-500 text-center">Recursos como senha, música de fundo e mais estão disponíveis nos planos superiores. ✨</p>
              )}
            </AccordionSection>
          </div>
          {isDashboard && (
            <button onClick={handleSave} disabled={saveStatus === 'saving'} className="w-full font-bold py-3 px-8 rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105 !mt-8 bg-pink-500 text-white hover:bg-pink-600 disabled:bg-pink-300">
              {saveStatus === 'saving' ? 'Salvando...' : 'Salvar História'}
            </button>
          )}
        </div>
        <div className="lg:col-span-3 flex flex-col gap-6">
          <div 
            className={`relative w-full min-h-[450px] overflow-hidden flex flex-col bg-romantic-gradient bg-cover bg-center rounded-xl shadow-inner ${getLayoutContainerClasses(layoutPosition)}`}
            style={{ backgroundImage: images.length > 0 ? `url(${images[0].image_url})` : undefined }}
          >
            {images.length > 0 && <div className="absolute inset-0 bg-black/40 z-0"></div>}
            <div className={`relative z-10 ${getLayoutPanelClasses(layoutPosition)}`}>
              <div className="max-w-4xl mx-auto space-y-6">
                <DurationCounter startDate={startDate} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CounterDemo;