import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../utils/supabase';
import LoadingSpinner from './LoadingSpinner';

// Adiciona a classe para ocultar elementos de forma acessível
const visuallyHiddenStyle = `
  .visually-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
  }
`;

declare global {
  interface Window {
    MercadoPago: any;
  }
}

interface TransparentCheckoutFormProps {
  planName: string;
  amount: number;
  onPaymentSuccess: (paymentResult: any) => void;
  onPaymentError: (error: any) => void;
  publicKey: string | null;
}

const TransparentCheckoutForm: React.FC<TransparentCheckoutFormProps> = ({ planName, amount, onPaymentSuccess, onPaymentError, publicKey }) => {
  const [mercadoPago, setMercadoPago] = useState<any>(null);
  const [isSdkReady, setIsSdkReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  const [cardThumbnail, setCardThumbnail] = useState<string | null>(null);
  const [identificationType, setIdentificationType] = useState<string>('');
  const [identificationNumber, setIdentificationNumber] = useState<string>('');
  const [paymentMethodId, setPaymentMethodId] = useState<string | null>(null);
  const [identificationTypes, setIdentificationTypes] = useState<any[]>([]);

  const cardFormRef = useRef<any>(null);

  // Etapa 1: Inicializa a instância do SDK do Mercado Pago
  useEffect(() => {
    if (publicKey && window.MercadoPago) {
      const mp = new window.MercadoPago(publicKey, { locale: 'pt-BR' });
      setMercadoPago(mp);
    }
  }, [publicKey]);

  // Etapa 2: Busca os tipos de documento e sinaliza que o SDK está pronto
  useEffect(() => {
    if (mercadoPago) {
      mercadoPago.getIdentificationTypes()
        .then((types: any) => {
          setIdentificationTypes(types || []);
          if (types && types.length > 0) {
            setIdentificationType(types[0].id);
          }
        })
        .catch((err: any) => {
          console.error('Error fetching identification types:', err);
          setError('Erro ao carregar o formulário de pagamento.');
        })
        .finally(() => {
          setIsSdkReady(true);
        });
    }
  }, [mercadoPago]);

  // Etapa 3: Cria e gerencia o ciclo de vida do cardForm
  useEffect(() => {
    // Só executa quando o SDK estiver pronto e o formulário ainda não foi criado
    if (isSdkReady && mercadoPago && !cardFormRef.current) {
      const form = mercadoPago.cardForm({
        amount: amount.toFixed(2),
        iframe: true,
        form: {
          id: "form-checkout",
          cardholderName: { id: "form-checkout__cardholderName", placeholder: "Nome e sobrenome" },
          identificationType: { id: "form-checkout__identificationType" },
          identificationNumber: { id: "form-checkout__identificationNumber" },
          cardNumber: { id: "form-checkout__cardNumber", placeholder: " " }, // Placeholder vazio para evitar sobreposição
          cardExpirationDate: { id: "form-checkout__cardExpirationDate", placeholder: "MM/AA" },
          securityCode: { id: "form-checkout__securityCode", placeholder: "CVC" },
          installments: { id: "form-checkout__installments" },
          issuer: { id: "form-checkout__issuer" },
        },
        callbacks: {
          onFormMounted: (err: any) => { if (err) console.warn("Form Mounted error:", err); else console.log("Form mounted"); },
          onPaymentMethodsReceived: (err: any, methods: any) => {
            if (err) return;
            if (methods && methods.length > 0) {
              setCardThumbnail(methods[0].thumbnail);
              setPaymentMethodId(methods[0].id);
            }
          },
        },
      });
      cardFormRef.current = form;
    }

    // Função de limpeza: ESSENCIAL para destruir o cardForm quando o componente for desmontado
    return () => {
      if (cardFormRef.current) {
        cardFormRef.current.unmount();
        cardFormRef.current = null;
      }
    };
  }, [isSdkReady, mercadoPago, amount]);

  const handleIdentificationNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    setIdentificationNumber(value);
    if (value.length === 11) setIdentificationType('CPF');
    else if (value.length === 14) setIdentificationType('CNPJ');
  };

  const maskIdentificationNumber = (value: string) => {
    if (value.length <= 11) return value.replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    return value.slice(0, 14).replace(/(\d{2})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1/$2').replace(/(\d{4})(\d{1,2})$/, '$1-$2');
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const cardForm = cardFormRef.current;
    if (!cardForm || loading) return;

    setLoading(true);
    setError(null);
    setFieldErrors({});

    try {
      const token = await cardForm.createCardToken({ identificationType, identificationNumber });
      
      // Pass the token and other details to the parent component to handle the API call
      onPaymentSuccess({
        cardToken: token.token,
        paymentMethodId,
        planName,
        amount
      });

    } catch (err: any) {
      console.error("Error creating card token:", err);
      // Handle field errors from Mercado Pago SDK
      const newFieldErrors: { [key: string]: string } = {};
      if (err && Array.isArray(err)) {
        err.forEach(errorDetail => {
          const fieldMap: { [key: string]: string } = {
            cardholderName: 'cardholderName',
            cardNumber: 'cardNumber',
            expirationDate: 'cardExpirationDate',
            securityCode: 'securityCode',
            identificationNumber: 'identificationNumber',
          };
          const errorField = fieldMap[errorDetail.field] || 'generic';
          newFieldErrors[errorField] = errorDetail.message;
        });
      }
      setFieldErrors(newFieldErrors);
      setError("Alguns dados do cartão estão incorretos.");
      onPaymentError(err);
    } finally {
      setLoading(false);
    }
  };

  const inputClasses = "w-full px-4 py-2.5 bg-black/20 border rounded-lg shadow-inner focus:outline-none focus:ring-2 focus:ring-offset-0 text-white placeholder-slate-400 transition-colors";
  const getFieldClass = (fieldName: string) => fieldErrors[fieldName]      ? 'border-red-500 focus:ring-red-500'
      : 'border-white/20 focus:ring-pink-500';

  return (
    <div className="w-full mx-auto">
      <style>{visuallyHiddenStyle}</style>
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white">Checkout</h2>
        <p className="text-base text-slate-300 mt-1">Plano <span className="font-semibold text-pink-400">{planName}</span> - Total: <span className="font-semibold text-pink-400">R$ {amount.toFixed(2)}</span></p>
      </div>

      {!isSdkReady ? (
        <div className="flex justify-center items-center h-64"><LoadingSpinner /></div>
      ) : (
        <>
          {error && <p className="bg-red-500/20 text-red-300 p-3 rounded-lg text-center text-sm mb-4">{error}</p>}
          <form id="form-checkout" className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <input type="text" id="form-checkout__cardholderName" className={`${inputClasses} ${getFieldClass('cardholderName')}`} placeholder="Nome e sobrenome" />
            </div>
            <div className="relative">
              <div id="form-checkout__cardNumber" className={`mp-input-container h-11 rounded-lg p-3 border bg-white/20 ${getFieldClass('cardNumber')}`}></div>
              {cardThumbnail && <img src={cardThumbnail} alt="Bandeira" className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-auto" />}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div id="form-checkout__cardExpirationDate" className={`mp-input-container h-11 rounded-lg p-3 border bg-white/20 ${getFieldClass('cardExpirationDate')}`}></div>
              <div id="form-checkout__securityCode" className={`mp-input-container h-11 rounded-lg p-3 border bg-white/20 ${getFieldClass('securityCode')}`}></div>
            </div>
            <div>
              <input type="text" className={`${inputClasses} ${getFieldClass('identificationNumber')}`} placeholder="CPF ou CNPJ" value={maskIdentificationNumber(identificationNumber)} onChange={handleIdentificationNumberChange} />
            </div>
            
            {/* Campos que o SDK precisa que existam no DOM, mas que não precisam ser visíveis */}
            <div className="visually-hidden">
              <select id="form-checkout__identificationType" value={identificationType} onChange={() => {}}>
                {identificationTypes.map(type => <option key={type.id} value={type.id}>{type.name}</option>)}
              </select>
              <input type="hidden" id="form-checkout__identificationNumber" value={identificationNumber} />
              <select id="form-checkout__issuer"></select>
              <select id="form-checkout__installments"></select>
            </div>

            <button type="submit" className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold py-3 px-8 rounded-lg shadow-lg" disabled={loading || !isSdkReady}>
              {loading ? 'Processando...' : `Pagar R$ ${amount.toFixed(2)}`}
            </button>

            <div className="mt-4 pt-4 border-t border-white/20 text-center text-slate-400 text-sm">
              <div className="flex items-center justify-center gap-1.5">
                <span>Processado por</span>
                <img 
                  src="https://http2.mlstatic.com/frontend-assets/mp-web-navigation/ui-navigation/5.21.1/mercadopago/logo__large.png" 
                  alt="Mercado Pago" 
                  className="h-5 w-auto"
                />
              </div>
            </div>
          </form>
        </>
      )}
    </div>
  );
};

export default TransparentCheckoutForm;