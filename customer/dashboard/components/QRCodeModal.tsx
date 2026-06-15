import React, { useRef } from 'react';
import { createPortal } from 'react-dom';
import { QRCodeCanvas } from 'qrcode.react';
import { Heart, Share2, Download, X } from 'lucide-react';
import { useNotification } from '@/app/providers/NotificationProvider';
import { logError } from '@/shared/lib/errors';
import { uiCopy } from '@/shared/lib/ui-copy';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  title: string;
}

const QRCodeModal: React.FC<QRCodeModalProps> = ({ isOpen, onClose, url, title }) => {
  const qrCodeRef = useRef<HTMLDivElement>(null);
  const { addToast } = useNotification();

  if (!isOpen) return null;

  const downloadQRCode = () => {
    if (qrCodeRef.current) {
      const canvas = qrCodeRef.current.querySelector('canvas');
      if (canvas) {
        const pngUrl = canvas
          .toDataURL('image/png')
          .replace('image/png', 'image/octet-stream');
        let downloadLink = document.createElement('a');
        downloadLink.href = pngUrl;
        downloadLink.download = `qrcode-historia-de-amor.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        addToast(uiCopy.story.downloadSuccess, 'success');
      }
    }
  };

  const handleWebShare = async () => {
    const shareData = {
      title: title,
      text: `Veja nossa história de amor: ${title}`,
      url: url,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        addToast(uiCopy.story.shareSuccess, 'success');
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          logError('customer/dashboard/QRCodeModal.share', err, { url });
          addToast(uiCopy.story.shareError, 'error');
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        addToast(uiCopy.story.copySuccess, 'success');
      } catch (err) {
        logError('customer/dashboard/QRCodeModal.copyLink', err, { url });
        addToast(uiCopy.story.copyError, 'error');
      }
    }
  };

  return createPortal(
    <div 
      className="fixed inset-0 bg-black/92 backdrop-blur-xl flex justify-center items-center z-[9999] p-[clamp(1rem,5dvh,4rem)] animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="relative bg-[#0a0a0a] border border-white/10 rounded-[clamp(2.5rem,5dvh,3.5rem)] shadow-[0_50px_100px_-20px_rgba(0,0,0,1)] p-[clamp(1.5rem,4dvh,3rem)] max-w-[clamp(280px,90vw,380px)] max-h-[92dvh] w-full flex flex-col justify-center transform transition-all overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-[50px] rounded-full -mr-16 -mt-16 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col items-center justify-center space-y-[clamp(1rem,3dvh,2.5rem)] overflow-y-auto hide-scrollbar min-h-0">
            <header className="space-y-[clamp(0.5rem,1.5dvh,1.5rem)] flex-shrink-0 text-center">
                <h2 className="text-[clamp(1.25rem,4dvh,2rem)] font-black text-white uppercase tracking-tighter leading-none">{uiCopy.story.shareTitle}</h2>
                <p className="text-primary italic font-cursive text-[clamp(1rem,3dvh,1.5rem)] lowercase tracking-normal leading-none text-center">
                    Eternize cada capítulo.
                </p>
                <div className="h-px w-12 bg-primary/30 mx-auto" />
                <p className="text-[clamp(8px,1.2dvh,10px)] font-medium text-slate-500 leading-relaxed max-w-[240px] mx-auto uppercase tracking-[0.15em] font-mono text-center">
                    {uiCopy.story.shareDescription}
                </p>
            </header>
            
            <div ref={qrCodeRef} className="p-[clamp(1rem,2dvh,2rem)] bg-white rounded-[2rem] inline-flex items-center justify-center shadow-[0_0_40px_rgba(255,45,85,0.15)] relative flex-shrink min-h-0">
                <div className="absolute -top-2 -right-2 p-1.5 rounded-full bg-primary text-white shadow-lg z-10">
                    <Heart className="w-[clamp(10px,2dvh,16px)] h-[clamp(10px,2dvh,16px)] fill-current" />
                </div>
                <div className="w-full h-full flex items-center justify-center overflow-hidden rounded-xl">
                  <QRCodeCanvas 
                    value={url} 
                    size={200} 
                    style={{ width: 'clamp(100px, 25dvh, 180px)', height: 'clamp(100px, 25dvh, 180px)' }}
                    bgColor="#FFFFFF" 
                    fgColor="#000000" 
                    level="H" 
                  />
                </div>
            </div>

            <footer className="w-full space-y-[clamp(0.5rem,1.2dvh,1rem)] flex-shrink-0">
                <button
                    onClick={handleWebShare}
                    className="w-full flex items-center justify-center gap-3 py-[clamp(0.75rem,2dvh,1.25rem)] bg-primary text-white font-black uppercase tracking-[0.2em] text-[clamp(8px,1.1dvh,10px)] rounded-xl shadow-[0_15px_30px_-5px_rgba(255,45,85,0.4)] hover:shadow-[0_20px_40px_-8px_rgba(255,45,85,0.5)] transition-all hover:-translate-y-0.5 active:scale-[0.98]"
                >
                    <Share2 className="w-[clamp(12px,2dvh,16px)] h-[clamp(12px,2dvh,16px)]" />
                    Eternizar História
                    <Heart className="w-[clamp(10px,1.8dvh,14px)] h-[clamp(10px,1.8dvh,14px)] fill-current ml-0.5" />
                </button>
                <button
                    onClick={downloadQRCode}
                    className="w-full flex items-center justify-center gap-3 py-[clamp(0.5rem,1.5dvh,1rem)] bg-white/5 border border-white/5 text-slate-400 font-black uppercase tracking-[0.2em] text-[clamp(7px,1dvh,9px)] rounded-lg hover:bg-white/10 hover:text-white transition-all"
                >
                    <Download className="w-[clamp(12px,1.8dvh,16px)] h-[clamp(12px,1.8dvh,16px)]" />
                    Salvar Convite Digital
                </button>
            </footer>
        </div>

        <button 
          onClick={onClose}
          className="absolute top-[clamp(1rem,3dvh,2rem)] right-[clamp(1rem,3dvh,2rem)] text-slate-600 hover:text-white transition-colors z-20 group"
        >
          <X className="w-[clamp(1.25rem,3dvh,1.75rem)] h-[clamp(1.25rem,3dvh,1.75rem)] group-hover:rotate-90 transition-transform duration-300" />
        </button>
      </div>
    </div>,
    document.body
  );
};

export default QRCodeModal;
