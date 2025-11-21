import React, { useState, useEffect, useRef, useMemo } from 'react';
import DatePicker, { registerLocale } from 'react-datepicker';
import { ptBR } from 'date-fns/locale/pt-BR';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import UpgradeToUnlock from './UpgradeToUnlock';
import StoryPreview from './StoryPreview';
import type { LoveStoryData, StoryImage, Plan } from '../types';

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
    <div className="border-b border-white/20">
      <button
        onClick={handleToggle}
        className="w-full flex justify-between items-center py-4 text-left font-semibold text-white hover:bg-white/10 px-2 rounded-t-md"
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
        <div ref={setNodeRef} style={style} {...attributes} className="relative group flex items-center bg-black/20 p-2 rounded-lg">
            <button {...listeners} className="cursor-grab touch-none p-2 text-slate-400 hover:bg-white/20 rounded-md">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
            </button>
            <img src={image.image_url} alt="Thumbnail" className="w-12 h-12 rounded-md object-cover mx-4" />
            <span className="flex-grow text-sm text-slate-300 truncate">Imagem</span>
            <button onClick={() => onDelete(image.id)} className="absolute top-1 right-1 p-1 text-pink-500 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
            </button>
        </div>
    );
};


// --- Main Component ---

interface CounterDemoProps {
  initialData?: LoveStoryData | null;
  onSave?: (data: LoveStoryData, newFiles: File[], imageIdsToDelete: number[]) => void;
  onCancel?: () => void;
  onImageDelete?: (id: number) => Promise<void>;
  isDashboard?: boolean;
  saveStatus?: 'idle' | 'saving';
  onDirty?: () => void;
  planFeatures: Partial<Plan> | null;
}

const CounterDemo: React.FC<CounterDemoProps> = ({ initialData, onSave, onCancel, onImageDelete, isDashboard, saveStatus, onDirty, planFeatures }) => {
  const [localData, setLocalData] = useState<LoveStoryData>({
    startDate: null, message: '', images: [], layoutPosition: 'bottom', youtubeUrl: '', storyPassword: '', entryButtonText: '',
  });
  
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [imageIdsToDelete, setImageIdsToDelete] = useState<number[]>([]); // New state
  const [openSection, setOpenSection] = useState<string | null>('content');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));

  // Use useMemo to recalculate features only when planFeatures changes
  const features = useMemo(() => ({
    imageLimit: planFeatures?.image_limit ?? 1,
    allowYoutube: planFeatures?.allow_youtube ?? false,
    allowPasswordProtection: planFeatures?.allow_password_protection ?? false,
    allowCustomButton: planFeatures?.allow_custom_button ?? false,
  }), [planFeatures]);
  
  const limitReached = localData.images.length >= features.imageLimit;

  useEffect(() => {
    if (initialData) {
      setLocalData({
        startDate: initialData.startDate || null, message: initialData.message || '', images: initialData.images || [],
        layoutPosition: initialData.layoutPosition || 'bottom', youtubeUrl: initialData.youtubeUrl || '',
        storyPassword: initialData.storyPassword || '', entryButtonText: initialData.entryButtonText || '',
      });
      setNewImageFiles([]);
      setImageIdsToDelete([]); // Reset on new data
    }
  }, [initialData]);

  const updateLocalData = (field: keyof LoveStoryData, value: any) => {
    onDirty?.();
    setLocalData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      onDirty?.();
      setNewImageFiles(prevFiles => [...prevFiles, file]);
      const localUrl = URL.createObjectURL(file);
      const tempId = Date.now();
      // Add originalFilename to correlate in the backend
      updateLocalData('images', [...localData.images, { id: tempId, image_url: localUrl, display_order: localData.images.length, originalFilename: file.name }]);
    }
  };

  const handleDeleteImage = (id: number) => {
    // Check if the image was part of the initial data loaded from the DB
    const isNewImage = !initialData?.images.some(initialImg => initialImg.id === id);
    
    // Only add pre-existing images to the deletion list
    if (!isNewImage) {
      setImageIdsToDelete(prev => [...prev, id]);
    }
    
    updateLocalData('images', localData.images.filter(img => img.id !== id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = localData.images.findIndex(item => item.id === active.id);
      const newIndex = localData.images.findIndex(item => item.id === over.id);
      
      const reorderedImages = arrayMove(localData.images, oldIndex, newIndex);
      
      // Update the display_order property for each image to match its new index
      const finalImages = reorderedImages.map((image, index) => ({
        ...image,
        display_order: index,
      }));

      updateLocalData('images', finalImages);
    }
  };

  const handleSave = async () => {
    if (!onSave) return;
    onSave(localData, newImageFiles, imageIdsToDelete); // Pass the deletion list
    setNewImageFiles([]);
    setImageIdsToDelete([]);
  };
  
  const handleScrollToPricing = () => {
    document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
  };

  const inputClasses = "w-full px-4 py-3 bg-black/20 border border-white/20 rounded-lg shadow-inner focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-pink-400 focus:bg-black/30 text-white placeholder-slate-400 transition-colors";

  return (
    <div className="bg-black/30 backdrop-blur-2xl p-4 md:p-8 rounded-2xl shadow-lg border border-white/20">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
        {/* --- Editor Panel --- */}
        <div className="lg:col-span-2">
          <h3 className="font-bold text-xl mb-4 text-white px-2">Editor da História</h3>
          <div className="border-t border-white/20">
            <AccordionSection title="Conteúdo Principal" sectionId="content" openSection={openSection} setOpenSection={setOpenSection}>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Quando tudo começou?</label>
                <DatePicker
                  selected={localData.startDate ? new Date(localData.startDate) : null}
                  onChange={(d: Date | null) => updateLocalData('startDate', d ? d.toISOString() : null)}
                  dateFormat="dd/MM/yyyy" placeholderText="dd/mm/aaaa" maxDate={new Date()} locale="pt-BR"
                  className={inputClasses}
                />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-slate-300 mb-2">Deixe uma mensagem surpresa</label>
                <textarea
                  id="message" value={localData.message} onChange={(e) => updateLocalData('message', e.target.value)}
                  placeholder="Escreva algo especial aqui..." rows={3}
                  className={`${inputClasses} resize-none`}
                ></textarea>
              </div>
            </AccordionSection>

            <AccordionSection title="Mídia e Aparência" sectionId="media" openSection={openSection} setOpenSection={setOpenSection}>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Fotos de vocês ({isDashboard ? `${localData.images.length}/${features.imageLimit}` : '1/1'})</label>
                {isDashboard && (
                  <div className="space-y-2 max-h-72 overflow-y-auto p-2 bg-black/20 border border-white/10 rounded-lg">
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                      <SortableContext items={localData.images.map(i => i.id)} strategy={verticalListSortingStrategy}>
                        {localData.images.map(image => <SortableImage key={image.id} image={image} onDelete={handleDeleteImage} />)}
                      </SortableContext>
                    </DndContext>
                  </div>
                )}
                <input type="file" id="images" accept="image/*" onChange={handleFileChange} ref={fileInputRef} className="hidden" disabled={isDashboard && limitReached} />
                <UpgradeToUnlock isFeatureAllowed={!isDashboard || !limitReached} message={`Você atingiu o limite de ${features.imageLimit} imagem(ns). Faça um upgrade para adicionar mais.`}>
                  <button onClick={() => fileInputRef.current?.click()} disabled={isDashboard && limitReached} className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-black/20 text-slate-200 font-semibold rounded-lg shadow-sm hover:bg-black/30 transition-colors text-sm mt-3 disabled:bg-slate-700/50 disabled:text-slate-400 disabled:cursor-not-allowed">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                      Adicionar Foto
                  </button>
                </UpgradeToUnlock>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Posição do contador</label>
                <div className="grid grid-cols-3 gap-2 p-1 bg-black/20 rounded-lg">
                    {(['top', 'center', 'bottom'] as const).map(pos => (
                        <button
                          key={pos} onClick={() => updateLocalData('layoutPosition', pos)}
                          className={`px-3 py-2 text-sm font-semibold rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-pink-400 ${localData.layoutPosition === pos ? 'bg-black/20 text-pink-400 shadow' : 'text-slate-300 hover:bg-black/10'}`}>
                          {pos === 'top' ? 'Superior' : pos === 'center' ? 'Centro' : 'Inferior'}
                        </button>
                    ))}
                </div>
              </div>
              <UpgradeToUnlock isFeatureAllowed={features.allowYoutube} message="Adicione uma música de fundo do YouTube à sua história.">
                <div>
                  <label htmlFor="youtubeUrl" className="block text-sm font-medium text-slate-300 mb-2">Música do YouTube (Opcional)</label>
                  <input type="text" id="youtubeUrl" value={localData.youtubeUrl} onChange={(e) => updateLocalData('youtubeUrl', e.target.value)} placeholder="Cole o link do YouTube aqui"
                    className={`${inputClasses} pr-10`} disabled={!features.allowYoutube}
                  />
                </div>
              </UpgradeToUnlock>
            </AccordionSection>

            <AccordionSection title="Configurações de Acesso" sectionId="access" openSection={openSection} setOpenSection={setOpenSection}>
              <UpgradeToUnlock isFeatureAllowed={features.allowPasswordProtection} message="Proteja sua história com uma senha.">
                <div>
                  <label htmlFor="storyPassword" className="block text-sm font-medium text-slate-300 mb-2">Senha da História (Opcional)</label>
                  <input type="password" id="storyPassword" value={localData.storyPassword} onChange={(e) => updateLocalData('storyPassword', e.target.value)}
                    placeholder="Digite para definir ou alterar" className={inputClasses} disabled={!features.allowPasswordProtection}
                  />
                </div>
              </UpgradeToUnlock>
              <UpgradeToUnlock isFeatureAllowed={features.allowCustomButton} message="Personalize o texto do botão de entrada da sua história.">
                <div>
                  <label htmlFor="entryButtonText" className="block text-sm font-medium text-slate-300 mb-2">Texto do Botão de Entrada (Opcional)</label>
                  <input type="text" id="entryButtonText" value={localData.entryButtonText} onChange={(e) => updateLocalData('entryButtonText', e.target.value)}
                    placeholder="Ex: Entrar, Ver nossa história..." className={inputClasses} disabled={!features.allowCustomButton}
                  />
                </div>
              </UpgradeToUnlock>
            </AccordionSection>
          </div>
          {isDashboard && (
            <div className="flex flex-col sm:flex-row-reverse gap-4 mt-8">
              <button onClick={handleSave} disabled={saveStatus === 'saving'} className="w-full font-bold py-3 px-8 rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105 bg-pink-500 text-white hover:bg-pink-600 disabled:bg-pink-300">
                {saveStatus === 'saving' ? 'Salvando...' : 'Salvar História'}
              </button>
              {onCancel && (
                <button onClick={onCancel} disabled={saveStatus === 'saving'} className="w-full sm:w-auto font-semibold py-3 px-8 rounded-lg transition-colors duration-300 bg-black/20 hover:bg-black/40 text-slate-200">
                  Cancelar
                </button>
              )}
            </div>
          )}
        </div>

        {/* --- Preview "Monitor" --- */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          <div className="w-full h-full min-h-[600px] bg-black/40 rounded-xl shadow-2xl p-2 border-2 border-white/30">
            <div className="flex items-center gap-1.5 px-2 mb-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
            <div className="bg-slate-900 h-[550px] overflow-y-scroll rounded-md relative">
              <StoryPreview storyData={localData} />
            </div>
          </div>
          {!isDashboard && (
            <button 
              onClick={handleScrollToPricing}
              className="w-full font-bold py-3 px-8 rounded-lg shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 !mt-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:shadow-xl"
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
