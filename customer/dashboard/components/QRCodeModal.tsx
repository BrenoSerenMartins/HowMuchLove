import React, { useRef } from 'react';
import { createPortal } from 'react-dom';
import { QRCodeCanvas } from 'qrcode.react';
import { Heart, Share2, Download } from 'lucide-react';
import { useNotification } from '@/app/providers/NotificationProvider';
import { logError } from '@/shared/lib/errors';
import { uiCopy } from '@/shared/lib/ui-copy';
import EliteModal from '@/shared/ui/EliteModal';

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
    <EliteModal
      isOpen={isOpen}
      onClose={onClose}
      hideCloseButton={false}
      orbColor="primary"
    >
        <header className="space-y-[clamp(0.5rem,1.5dvh,1.5rem)] flex-shrink-0 text-center mb-[clamp(1rem,3dvh,2.5rem)]">
            <h2 className="text-[clamp(1.25rem,4dvh,2rem)] font-black text-white uppercase tracking-tighter leading-none">{uiCopy.story.shareTitle}</h2>
            <p className="text-primary italic font-cursive text-[clamp(1rem,3dvh,1.5rem)] lowercase tracking-normal leading-none text-center">
                Eternize cada capítulo.
            </p>
            <div className="h-px w-12 bg-primary/30 mx-auto" />
            <p className="text-[clamp(8px,1.2dvh,10px)] font-medium text-slate-500 leading-relaxed max-w-[240px] mx-auto uppercase tracking-[0.15em] font-mono text-center">
                {uiCopy.story.shareDescription}
            </p>
        </header>
        
        <div ref={qrCodeRef} className="p-[clamp(1rem,2dvh,2rem)] bg-white rounded-[2rem] inline-flex items-center justify-center mx-auto shadow-[0_0_40px_rgba(255,45,85,0.15)] relative flex-shrink min-h-0 mb-[clamp(1.5rem,3dvh,2.5rem)]">
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

        <footer className="w-full space-y-[clamp(0.5rem,1.2dvh,1rem)] flex-shrink-0 mt-auto">
            <EliteButton
                variant="primary"
                onClick={handleWebShare}
                fullWidth
            >
                <Share2 className="w-[clamp(12px,2dvh,16px)] h-[clamp(12px,2dvh,16px)]" />
                Eternizar História
                <Heart className="w-[clamp(10px,1.8dvh,14px)] h-[clamp(10px,1.8dvh,14px)] fill-current ml-0.5" />
            </EliteButton>
            <EliteButton
                variant="secondary"
                onClick={downloadQRCode}
                fullWidth
                icon={Download}
                title="Salvar Convite Digital"
            />
        </footer>
    </EliteModal>
  );
};

export default QRCodeModal;
