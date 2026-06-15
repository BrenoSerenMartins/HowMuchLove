import React, { useRef } from 'react';
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

  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-md flex justify-center items-center z-[999] p-4 animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="relative bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,1)] p-10 max-w-sm w-full text-center transform transition-all overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-[50px] rounded-full -mr-16 -mt-16 pointer-events-none" />
        
        <div className="relative z-10 space-y-8">
            <div className="space-y-3">
                <h2 className="text-2xl font-black text-white uppercase tracking-tighter leading-none">{uiCopy.story.shareTitle}</h2>
                <p className="text-primary italic font-cursive text-xl lowercase tracking-normal">
                    Eternize cada capítulo.
                </p>
                <div className="h-px w-12 bg-primary/30 mx-auto" />
                <p className="text-[10px] font-medium text-slate-500 leading-relaxed max-w-[240px] mx-auto uppercase tracking-[0.2em] font-mono">
                    {uiCopy.story.shareDescription}
                </p>
            </div>
            
            <div ref={qrCodeRef} className="p-6 bg-white rounded-[2rem] inline-block shadow-[0_0_40px_rgba(255,45,85,0.15)] relative">
                <div className="absolute -top-2 -right-2 p-2 rounded-full bg-primary text-white shadow-lg">
                    <Heart className="w-3 h-3 fill-current" />
                </div>
                <QRCodeCanvas value={url} size={200} bgColor="#FFFFFF" fgColor="#000000" level="H" />
            </div>

            <div className="pt-2 space-y-3">
                <button
                    onClick={handleWebShare}
                    className="w-full flex items-center justify-center gap-3 py-5 bg-primary text-white font-black uppercase tracking-[0.2em] text-[10px] rounded-2xl shadow-[0_20px_40px_-10px_rgba(255,45,85,0.4)] hover:shadow-[0_25px_50px_-12px_rgba(255,45,85,0.5)] transition-all hover:-translate-y-1 active:scale-[0.98]"
                >
                    <Share2 className="w-4 h-4" />
                    Eternizar História
                    <Heart className="w-3.5 h-3.5 fill-current ml-1" />
                </button>
                <button
                    onClick={downloadQRCode}
                    className="w-full flex items-center justify-center gap-3 py-4 bg-white/5 border border-white/5 text-slate-400 font-black uppercase tracking-[0.2em] text-[9px] rounded-xl hover:bg-white/10 hover:text-white transition-all"
                >
                    <Download className="w-4 h-4" />
                    Salvar Convite Digital
                </button>
            </div>
        </div>

        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-slate-600 hover:text-white transition-colors z-20"
        >
          <X className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

export default QRCodeModal;
