import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronDown, 
  Calendar, 
  MessageSquare, 
  Image as ImageIcon, 
  Music, 
  Lock, 
  Layout, 
  Plus, 
  Trash2, 
  GripVertical,
  MousePointer2,
  Save,
  X,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import DatePicker, { registerLocale } from 'react-datepicker';
import { ptBR } from 'date-fns/locale/pt-BR';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import UpgradeToUnlock from './UpgradeToUnlock';
import StoryPreview from './StoryPreview';
import type { LoveStoryData, StoryImage, PlanFeatures } from '@/types';
import { resolvePlanCapabilities } from '@/shared/lib/plans';
import { uiCopy } from '@/shared/lib/ui-copy';

registerLocale('pt-BR', ptBR);

// --- Sub-components ---

const AccordionSection: React.FC<{
  title: string;
  icon: React.ReactNode;
  sectionId: string;
  openSection: string | null;
  setOpenSection: (sectionId: string | null) => void;
  children: React.ReactNode;
}> = ({ title, icon, sectionId, openSection, setOpenSection, children }) => {
  const isOpen = openSection === sectionId;
  const handleToggle = () => {
    setOpenSection(isOpen ? null : sectionId);
  };

  return (
    <div className="border-b border-white/5 last:border-0">
      <button
        onClick={handleToggle}
        className={`w-full flex justify-between items-center py-6 text-left font-black uppercase tracking-[0.15em] text-[10px] transition-all px-4 rounded-xl ${
          isOpen ? 'bg-white/5 text-primary' : 'text-slate-400 hover:text-white hover:bg-white/[0.02]'
        }`}
      >
        <div className="flex items-center gap-4">
          <div className={`${isOpen ? 'text-primary' : 'text-slate-500'}`}>
            {icon}
          </div>
          <span>{title}</span>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          <ChevronDown className={`w-4 h-4 ${isOpen ? 'text-primary' : 'text-slate-600'}`} />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="p-6 pt-2 space-y-6">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const SortableImage: React.FC<{ image: StoryImage; onDelete: (id: number) => void }> = ({ image, onDelete }) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: image.id });
    const style = { transform: CSS.Transform.toString(transform), transition };

    return (
        <div ref={setNodeRef} style={style} {...attributes} className="relative group flex items-center bg-white/[0.03] border border-white/5 p-3 rounded-2xl mb-2 hover:bg-white/[0.05] transition-colors">
            <button {...listeners} className="cursor-grab touch-none p-2 text-slate-500 hover:text-white transition-colors">
                <GripVertical className="w-4 h-4" />
            </button>
            <div className="w-12 h-12 rounded-xl overflow-hidden border border-white/10 mx-4">
                <img src={image.image_url} alt="Thumbnail" className="w-full h-full object-cover" />
            </div>
            <span className="flex-grow text-[11px] font-black uppercase tracking-widest text-slate-400 truncate">{uiCopy.editor.imageItem}</span>
            <button 
              onClick={() => onDelete(image.id)} 
              className="p-2 text-slate-500 hover:text-primary transition-colors"
              title="Excluir imagem"
            >
                <Trash2 className="w-4 h-4" />
            </button>
        </div>
    );
};


// --- Main Component ---

interface CounterDemoProps {
  initialData?: LoveStoryData | null;
  onSave?: (data: LoveStoryData, newFiles: File[], imageIdsToDelete: number[]) => Promise<void> | void;
  onCancel?: () => void;
  onImageDelete?: (id: number) => Promise<void>;
  isDashboard?: boolean;
  saveStatus?: 'idle' | 'saving';
  onDirty?: () => void;
  planFeatures: Partial<PlanFeatures> | null;
}

const CounterDemo: React.FC<CounterDemoProps> = ({ initialData, onSave, onCancel, onImageDelete, isDashboard, saveStatus, onDirty, planFeatures }) => {
  const [localData, setLocalData] = useState<LoveStoryData>({
    startDate: null, message: '', images: [], layoutPosition: 'bottom', youtubeUrl: '', storyPassword: '', removePassword: false, requiresPassword: false, entryButtonText: '',
  });
  
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [imageIdsToDelete, setImageIdsToDelete] = useState<number[]>([]); 
  const [openSection, setOpenSection] = useState<string | null>('content');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));

  const features = useMemo(() => resolvePlanCapabilities(planFeatures), [planFeatures]);
  
  const limitReached = localData.images.length >= features.imageLimit;

  useEffect(() => {
    if (initialData) {
      setLocalData({
        startDate: initialData.startDate || null, message: initialData.message || '', images: initialData.images || [],
        layoutPosition: initialData.layoutPosition || 'bottom', youtubeUrl: initialData.youtubeUrl || '',
        storyPassword: initialData.storyPassword || '', removePassword: false, requiresPassword: initialData.requiresPassword || false, entryButtonText: initialData.entryButtonText || '',
      });
      setNewImageFiles([]);
      setImageIdsToDelete([]);
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
      updateLocalData('images', [...localData.images, { id: tempId, image_url: localUrl, display_order: localData.images.length, originalFilename: file.name }]);
    }
  };

  const handleDeleteImage = (id: number) => {
    const isNewImage = !initialData?.images.some(initialImg => initialImg.id === id);
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
      
      const reorderedImages = arrayMove<StoryImage>(localData.images, oldIndex, newIndex);
      const finalImages: StoryImage[] = reorderedImages.map((image, index) => ({
        ...image,
        display_order: index,
      }));

      updateLocalData('images', finalImages);
    }
  };

  const handleSave = async () => {
    if (!onSave) return;
    await onSave(localData, newImageFiles, imageIdsToDelete);
    setNewImageFiles([]);
    setImageIdsToDelete([]);
  };

  const handleRemovePasswordToggle = (checked: boolean) => {
    onDirty?.();
    setLocalData(prev => ({
      ...prev,
      removePassword: checked,
      storyPassword: checked ? '' : prev.storyPassword,
    }));
  };
  
  const handleScrollToPricing = () => {
    document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="relative">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-[clamp(2rem,6vw,6rem)] items-start">
        {/* --- Editor Panel --- */}
        <div className="lg:col-span-5 order-2 lg:order-1">
          <div className="flex items-center gap-4 mb-12 px-2">
            <div className="p-3 rounded-2xl bg-primary/10 text-primary border border-primary/20 shadow-[0_0_15px_rgba(255,45,85,0.2)]">
              <Layout className="w-6 h-6" />
            </div>
            <div>
                <h3 className="font-black uppercase tracking-[0.3em] text-[clamp(10px,0.8vw,12px)] text-white/90">Painel de Criação</h3>
                <p className="text-[clamp(9px,0.7vw,11px)] font-bold text-slate-500 uppercase tracking-widest mt-1 font-mono">Personalize sua História</p>
            </div>
          </div>

          <div className="space-y-4">
            <AccordionSection 
              title={uiCopy.editor.contentSection} 
              icon={<Calendar className="w-5 h-5" />}
              sectionId="content" 
              openSection={openSection} 
              setOpenSection={setOpenSection}
            >
              <div className="space-y-6">
                <div>
                  <label className="block text-[clamp(9px,0.7vw,11px)] font-black uppercase tracking-[0.2em] text-slate-500 mb-4 ml-1">{uiCopy.editor.startedWhen}</label>
                  <div className="relative group">
                    <DatePicker
                      selected={localData.startDate ? new Date(localData.startDate) : null}
                      onChange={(d: Date | null) => updateLocalData('startDate', d ? d.toISOString() : null)}
                      dateFormat="dd/MM/yyyy" placeholderText="dd/mm/aaaa" maxDate={new Date()} locale="pt-BR"
                      className="input-elite !py-5"
                    />
                    <Calendar className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600 group-focus-within:text-primary transition-colors pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label htmlFor="message" className="block text-[clamp(9px,0.7vw,11px)] font-black uppercase tracking-[0.2em] text-slate-500 mb-4 ml-1">{uiCopy.editor.messageLabel}</label>
                  <div className="relative group">
                    <textarea
                      id="message" value={localData.message} onChange={(e) => updateLocalData('message', e.target.value)}
                      placeholder={uiCopy.editor.messagePlaceholder} rows={5}
                      className="input-elite resize-none !py-5"
                    ></textarea>
                    <MessageSquare className="absolute right-5 top-5 w-5 h-5 text-slate-600 group-focus-within:text-primary transition-colors pointer-events-none" />
                  </div>
                </div>
              </div>
            </AccordionSection>

            <AccordionSection 
              title={uiCopy.editor.mediaSection} 
              icon={<ImageIcon className="w-5 h-5" />}
              sectionId="media" 
              openSection={openSection} 
              setOpenSection={setOpenSection}
            >
              <div className="space-y-8">
                <div>
                  <div className="flex justify-between items-center mb-4 ml-1">
                    <label className="block text-[clamp(9px,0.7vw,11px)] font-black uppercase tracking-[0.2em] text-slate-500">{uiCopy.editor.photosLabel}</label>
                    <span className="text-[10px] font-mono font-black text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
                      {isDashboard ? `${localData.images.length}/${features.imageLimit}` : '1/1'}
                    </span>
                  </div>
                  
                  {isDashboard && localData.images.length > 0 && (
                    <div className="space-y-2 mb-6 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                        <SortableContext items={localData.images.map(i => i.id)} strategy={verticalListSortingStrategy}>
                          {localData.images.map(image => <SortableImage key={image.id} image={image} onDelete={handleDeleteImage} />)}
                        </SortableContext>
                      </DndContext>
                    </div>
                  )}
                  
                  <input type="file" id="images" accept="image/*" onChange={handleFileChange} ref={fileInputRef} className="hidden" disabled={isDashboard && limitReached} />
                  <UpgradeToUnlock isFeatureAllowed={!isDashboard || !limitReached} message={uiCopy.editor.imageLimitMessage(features.imageLimit)}>
                    <button 
                      onClick={() => fileInputRef.current?.click()} 
                      disabled={isDashboard && limitReached} 
                      className="w-full btn-secondary !py-5 group border-dashed"
                    >
                        <Plus className="w-5 h-5 text-primary transition-transform group-hover:rotate-90" />
                        {uiCopy.editor.addPhoto}
                    </button>
                  </UpgradeToUnlock>
                </div>
                <div>
                  <label className="block text-[clamp(9px,0.7vw,11px)] font-black uppercase tracking-[0.2em] text-slate-500 mb-4 ml-1">{uiCopy.editor.positionLabel}</label>
                  <div className="grid grid-cols-3 gap-3 p-2 bg-white/[0.03] rounded-2xl border border-white/5 shadow-inner">
                      {(['top', 'center', 'bottom'] as const).map(pos => (
                          <button
                            key={pos} onClick={() => updateLocalData('layoutPosition', pos)}
                            className={`py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${
                              localData.layoutPosition === pos 
                                ? 'bg-primary text-white shadow-[0_8px_20px_rgba(255,45,85,0.4)] scale-[1.02]' 
                                : 'text-slate-500 hover:text-white hover:bg-white/5'
                            }`}
                          >
                            {pos === 'top' ? uiCopy.editor.top : pos === 'center' ? uiCopy.editor.center : uiCopy.editor.bottom}
                          </button>
                      ))}
                  </div>
                </div>
                <UpgradeToUnlock isFeatureAllowed={features.allowYoutube} message={uiCopy.editor.youtubeUpgradeMessage}>
                  <div>
                    <label htmlFor="youtubeUrl" className="block text-[clamp(9px,0.7vw,11px)] font-black uppercase tracking-[0.2em] text-slate-500 mb-4 ml-1">{uiCopy.editor.youtubeLabel}</label>
                    <div className="relative group">
                      <input type="text" id="youtubeUrl" value={localData.youtubeUrl} onChange={(e) => updateLocalData('youtubeUrl', e.target.value)} placeholder={uiCopy.editor.youtubePlaceholder}
                        className="input-elite pr-14 !py-5" disabled={!features.allowYoutube}
                      />
                      <Music className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600 group-focus-within:text-primary transition-colors pointer-events-none" />
                    </div>
                  </div>
                </UpgradeToUnlock>
              </div>
            </AccordionSection>

            <AccordionSection 
              title={uiCopy.editor.accessSection} 
              icon={<Lock className="w-5 h-5" />}
              sectionId="access" 
              openSection={openSection} 
              setOpenSection={setOpenSection}
            >
              <div className="space-y-6">
                <UpgradeToUnlock isFeatureAllowed={features.allowPasswordProtection} message={uiCopy.editor.passwordUpgradeMessage}>
                  <div>
                    <label htmlFor="storyPassword" className="block text-[clamp(9px,0.7vw,11px)] font-black uppercase tracking-[0.2em] text-slate-500 mb-4 ml-1">{uiCopy.editor.passwordLabel}</label>
                    <div className="relative group">
                      <input type="password" id="storyPassword" value={localData.storyPassword} onChange={(e) => updateLocalData('storyPassword', e.target.value)}
                        placeholder={localData.requiresPassword ? uiCopy.editor.passwordPlaceholderKeep : uiCopy.editor.passwordPlaceholderSet} 
                        className="input-elite pr-14 !py-5" 
                        disabled={!features.allowPasswordProtection || localData.removePassword}
                      />
                      <Lock className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600 group-focus-within:text-primary transition-colors pointer-events-none" />
                    </div>
                    {localData.requiresPassword && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 p-6 rounded-2xl bg-white/[0.02] border border-white/5 shadow-inner">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-relaxed mb-6">
                          {uiCopy.editor.passwordHelper}
                        </p>
                        <label className="flex items-center gap-4 cursor-pointer group">
                          <div className="relative flex items-center">
                            <input
                              type="checkbox"
                              checked={!!localData.removePassword}
                              onChange={(e) => handleRemovePasswordToggle(e.target.checked)}
                              className="sr-only"
                            />
                            <div className={`w-12 h-6 rounded-full transition-colors duration-300 ${localData.removePassword ? 'bg-primary' : 'bg-white/10'}`}>
                              <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform duration-300 ${localData.removePassword ? 'translate-x-6' : ''}`} />
                            </div>
                          </div>
                          <span className="text-[11px] font-black uppercase tracking-widest text-slate-300 group-hover:text-white transition-colors">{uiCopy.editor.removePassword}</span>
                        </label>
                      </motion.div>
                    )}
                  </div>
                </UpgradeToUnlock>
                <UpgradeToUnlock isFeatureAllowed={features.allowCustomButton} message={uiCopy.editor.customButtonUpgradeMessage}>
                  <div>
                    <label htmlFor="entryButtonText" className="block text-[clamp(9px,0.7vw,11px)] font-black uppercase tracking-[0.2em] text-slate-500 mb-4 ml-1">{uiCopy.editor.entryButtonLabel}</label>
                    <div className="relative group">
                      <input type="text" id="entryButtonText" value={localData.entryButtonText} onChange={(e) => updateLocalData('entryButtonText', e.target.value)}
                        placeholder={uiCopy.editor.entryButtonPlaceholder} className="input-elite pr-14 !py-5" disabled={!features.allowCustomButton}
                      />
                      <MousePointer2 className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600 group-focus-within:text-primary transition-colors pointer-events-none" />
                    </div>
                  </div>
                </UpgradeToUnlock>
              </div>
            </AccordionSection>
          </div>
          
          {isDashboard && (
            <div className="flex flex-col sm:flex-row gap-4 mt-12 px-2">
              <button 
                onClick={handleSave} 
                disabled={saveStatus === 'saving'} 
                className="btn-primary flex-grow !py-5"
              >
                {saveStatus === 'saving' ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    {uiCopy.editor.saving}
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    {uiCopy.editor.save}
                  </>
                )}
              </button>
              {onCancel && (
                <button 
                  onClick={onCancel} 
                  disabled={saveStatus === 'saving'} 
                  className="btn-secondary !py-5"
                >
                  <X className="w-4 h-4" />
                  {uiCopy.editor.cancel}
                </button>
              )}
            </div>
          )}
        </div>

        {/* --- Preview --- */}
        <div className="lg:col-span-7 order-1 lg:order-2">
          <div className="sticky top-32">
            <div className="flex items-center gap-4 mb-12 px-2">
              <div className="p-3 rounded-2xl bg-primary/10 text-primary border border-primary/20 shadow-[0_0_15px_rgba(255,45,85,0.2)]">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                  <h3 className="font-black uppercase tracking-[0.3em] text-[clamp(10px,0.8vw,12px)] text-white/90">Visualização em Tempo Real</h3>
                  <p className="text-[clamp(9px,0.7vw,11px)] font-bold text-slate-500 uppercase tracking-widest mt-1 font-mono">Como seu Amor verá</p>
              </div>
            </div>
            
            <div className="card-elite aspect-[9/16] max-h-[85vh] w-full max-w-[500px] mx-auto relative overflow-hidden ring-1 ring-white/10 shadow-[0_100px_150px_-50px_rgba(0,0,0,1)]">
              <StoryPreview storyData={localData} plan={planFeatures} />
            </div>
            
            {!isDashboard && (
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleScrollToPricing}
                className="btn-primary w-full max-w-[500px] mx-auto flex mt-12 !py-6 shadow-[0_30px_60px_-10px_rgba(255,45,85,0.4)] text-[11px]"
              >
                {uiCopy.editor.saveAndShare}
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CounterDemo;
