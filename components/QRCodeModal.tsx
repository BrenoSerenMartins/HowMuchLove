import React, { useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { useNotification } from '../contexts/NotificationContext';

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
        addToast('QR Code baixado com sucesso!', 'success');
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
        addToast('Link compartilhado com sucesso!', 'success');
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.error('Share failed:', err);
          addToast('Falha ao compartilhar o link.', 'error');
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        addToast('Link copiado para a área de transferência!', 'success');
      } catch (err) {
        console.error('Failed to copy link:', err);
        addToast('Falha ao copiar o link.', 'error');
      }
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/70 backdrop-blur-md flex justify-center items-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="relative bg-black/30 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold text-white mb-2">Compartilhe sua História</h2>
        <p className="text-slate-300 mb-6">Baixe o QR Code ou compartilhe o link diretamente.</p>
        
        <div ref={qrCodeRef} className="p-4 bg-white rounded-lg inline-block">
          <QRCodeCanvas value={url} size={256} bgColor="#FFFFFF" fgColor="#000000" />
        </div>

        <div className="mt-6 space-y-4">
          <button
            onClick={downloadQRCode}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold rounded-lg shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
            Baixar QR Code
          </button>
          <button
            onClick={handleWebShare}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white/10 border border-white/20 text-white font-semibold rounded-lg hover:bg-white/20 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12s-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"></path></svg>
            Compartilhar Link
          </button>
        </div>

        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
        >
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
      </div>
    </div>
  );
};

export default QRCodeModal;