import React, { useState, useEffect, useRef } from 'react';
import DatePicker, { registerLocale } from 'react-datepicker';
import { ptBR } from 'date-fns/locale/pt-BR';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import UpgradeToUnlock from './UpgradeToUnlock';
import { PLAN_FEATURES } from '../utils/planConfig';
import StoryPreview from './StoryPreview';
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
  onSave?: (data: LoveStoryData, newFiles: File[]) => void; // Modified onSave
  onImageDelete?: (id: number) => Promise<void>;
  isDashboard?: boolean;
  saveStatus?: 'idle' | 'saving';
  onDirty?: () => void;
  currentPlan?: string | null;
}

const MAX_MESSAGE_LENGTH = 280;

const CounterDemo: React.FC<CounterDemoProps> = ({ initialData, onSave, onImageDelete, isDashboard, saveStatus, onDirty, currentPlan }) => {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [message, setMessage] = useState('');
  const [images, setImages] = useState<StoryImage[]>([]);
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]); // New state for files
  const [layoutPosition, setLayoutPosition] = useState<'top' | 'center' | 'bottom'>('bottom');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [isYoutubeUrlValid, setIsYoutubeUrlValid] = useState(false);
  const [storyPassword, setStoryPassword] = useState('');
  const [entryButtonText, setEntryButtonText] = useState('');
  const [errors, setErrors] = useState<{ startDate?: string; message?: string, images?: string }>({});
  const [openSection, setOpenSection] = useState<string | null>('content');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));

  const plan = currentPlan || 'Gratis';
  const features = PLAN_FEATURES[plan as keyof typeof PLAN_FEATURES] || PLAN_FEATURES['Gratis'];
  const imageLimit = features.imageLimit;
  const limitReached = images.length >= imageLimit;

  useEffect(() => {
    if (initialData) {
      setStartDate(initialData.startDate ? new Date(initialData.startDate) : null);
      setMessage(initialData.message || '');
      setImages(initialData.images || []);
      setLayoutPosition(initialData.layoutPosition || 'bottom');
      setYoutubeUrl(initialData.youtubeUrl || '');
      setEntryButtonText(initialData.entryButtonText || '');
      setNewImageFiles([]); // Reset local files on data load
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
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      onDirty?.();
      
      // Add the file to our local file state
      setNewImageFiles(prevFiles => [...prevFiles, file]);

      // Create a temporary local URL for preview
      const localUrl = URL.createObjectURL(file);
      const tempId = Date.now(); // Use a temporary ID for the key and sorting
      
      // Add a temporary image object to the images array for preview
      setImages(currentImages => [
        ...currentImages,
        { id: tempId, image_url: localUrl, display_order: currentImages.length }
      ]);
    }
  };

  const handleDeleteImage = (id: number) => {
    onDirty?.();
    setImages(currentImages => currentImages.filter(img => img.id !== id));
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
      images, // Pass the full list, including local blobs
      layoutPosition,
      youtubeUrl: features.allowYoutube ? youtubeUrl : '',
      storyPassword: features.allowPasswordProtection ? storyPassword : '',
      entryButtonText: features.allowCustomButton ? entryButtonText : '',
    };
    onSave(storyData, newImageFiles);
    setNewImageFiles([]); // Clear local files after initiating save
  };
  
  const handleLayoutChange = (position: 'top' | 'center' | 'bottom') => { onDirty?.(); setLayoutPosition(position); };
  
  const handleScrollToPricing = () => {
    document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
  };

  const previewStoryData = {
    startDate: startDate?.toISOString(),
    message,
    images,
    layoutPosition,
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
                <label className="block text-sm font-medium text-slate-600 mb-2">Fotos de vocês ({isDashboard ? `${images.length}/${imageLimit}` : '1/1'})</label>
                {isDashboard && (
                  <div className="space-y-2 max-h-72 overflow-y-auto p-2 bg-slate-50 border rounded-lg">
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                      <SortableContext items={images.map(i => i.id)} strategy={verticalListSortingStrategy}>
                        {images.map(image => <SortableImage key={image.id} image={image} onDelete={handleDeleteImage} />)}
                      </SortableContext>
                    </DndContext>
                  </div>
                )}
                <div className="min-h-[1.25rem] mt-1">
                  {errors.images && <p className="text-red-500 text-sm">{errors.images}</p>}
                </div>
                <input type="file" id="images" accept="image/*" onChange={handleFileChange} ref={fileInputRef} className="hidden" disabled={isDashboard && limitReached} />
                <UpgradeToUnlock isFeatureAllowed={!isDashboard || !limitReached} message={`Você atingiu o limite de ${imageLimit} imagem(ns). Faça um upgrade para adicionar mais.`}>
                  <button onClick={() => fileInputRef.current?.click()} disabled={isDashboard && limitReached} className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-slate-100 text-slate-700 font-semibold rounded-lg shadow-sm hover:bg-slate-200 transition-colors text-sm mt-3 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                      Adicionar Foto
                  </button>
                </UpgradeToUnlock>
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
              <UpgradeToUnlock isFeatureAllowed={features.allowYoutube} message="Adicione uma música de fundo do YouTube à sua história.">
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
                      disabled={!features.allowYoutube}
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
              </UpgradeToUnlock>
            </AccordionSection>

            <AccordionSection title="Configurações de Acesso" sectionId="access" openSection={openSection} setOpenSection={setOpenSection}>
              <UpgradeToUnlock isFeatureAllowed={features.allowPasswordProtection} message="Proteja sua história com uma senha.">
                <div>
                  <label htmlFor="storyPassword" className="block text-sm font-medium text-slate-600 mb-2">Senha da História (Opcional)</label>
                  <input
                    type="password"
                    id="storyPassword"
                    value={storyPassword}
                    onChange={(e) => { onDirty?.(); setStoryPassword(e.target.value); }}
                    placeholder="Digite para definir ou alterar a senha"
                    className="block w-full px-4 py-3 bg-white border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
                    disabled={!features.allowPasswordProtection}
                  />
                </div>
              </UpgradeToUnlock>
              <UpgradeToUnlock isFeatureAllowed={features.allowCustomButton} message="Personalize o texto do botão de entrada da sua história.">
                <div>
                  <label htmlFor="entryButtonText" className="block text-sm font-medium text-slate-600 mb-2">Texto do Botão de Entrada (Opcional)</label>
                  <input
                    type="text"
                    id="entryButtonText"
                    value={entryButtonText}
                    onChange={(e) => { onDirty?.(); setEntryButtonText(e.target.value); }}
                    placeholder="Ex: Entrar, Ver nossa história..."
                    className="block w-full px-4 py-3 bg-white border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
                    disabled={!features.allowCustomButton}
                  />
                </div>
              </UpgradeToUnlock>
            </AccordionSection>
          </div>
          {isDashboard && (
            <button onClick={handleSave} disabled={saveStatus === 'saving'} className="w-full font-bold py-3 px-8 rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105 !mt-8 bg-pink-500 text-white hover:bg-pink-600 disabled:bg-pink-300">
              {saveStatus === 'saving' ? 'Salvando...' : 'Salvar História'}
            </button>
          )}
        </div>
        <div className="lg:col-span-3 flex flex-col gap-6">
          <div className="w-full h-full min-h-[500px]">
            <StoryPreview storyData={previewStoryData} />
          </div>
          {!isDashboard && (
            <button 
              onClick={handleScrollToPricing}
              className="w-full font-bold py-3 px-8 rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105 !mt-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:shadow-xl"
            >
              Salvar e Compartilhar
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CounterDemo;