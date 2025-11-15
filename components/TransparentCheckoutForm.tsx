import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase'; // Import the supabase client
import LoadingSpinner from './LoadingSpinner'; // Import the spinner

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
  const [cardForm, setCardForm] = useState<any>(null);
  const [identificationTypes, setIdentificationTypes] = useState<any[]>([]);
  const [isFormReady, setIsFormReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  const [cardThumbnail, setCardThumbnail] = useState<string | null>(null);
  const [identificationType, setIdentificationType] = useState<string>('');
  const [identificationNumber, setIdentificationNumber] = useState<string>('');

  // Initialize Mercado Pago SDK
  useEffect(() => {
    if (window.MercadoPago && publicKey) {
      const mp = new window.MercadoPago(publicKey, {
        locale: 'pt-BR',
      });
      setMercadoPago(mp);
    }
  }, [publicKey]);

  // Get Identification Types to enable the form
  useEffect(() => {
    if (mercadoPago) {
      mercadoPago.getIdentificationTypes()
        .then((types: any) => {
          if (types) {
            setIdentificationTypes(types);
            if (types.length > 0) {
              setIdentificationType(types[0].id); // Set default identification type
            }
            setIsFormReady(true); // Enable form once types are loaded
          }
        })
        .catch((err: any) => {
          console.error('Error fetching identification types:', err);
          setError('Erro ao carregar o formulário de pagamento.');
        });
    }
  }, [mercadoPago]);

  // Create Card Form
  useEffect(() => {
    if (isFormReady && mercadoPago) {
      const form = mercadoPago.cardForm({
        amount: amount.toFixed(2),
        iframe: true,
        form: {
          id: "form-checkout",
          cardholderName: { id: "form-checkout__cardholderName", placeholder: "Nome e sobrenome" },
          identificationType: { id: "form-checkout__identificationType", placeholder: "Tipo de documento" },
          identificationNumber: { id: "form-checkout__identificationNumber", placeholder: "Número do documento" },
          cardNumber: { id: "form-checkout__cardNumber", placeholder: "Número do cartão" },
          cardExpirationDate: { id: "form-checkout__cardExpirationDate", placeholder: "MM/YY" },
          securityCode: { id: "form-checkout__securityCode", placeholder: "CVC" },
          installments: { id: "form-checkout__installments", placeholder: "Selecione as parcelas" },
          issuer: { id: "form-checkout__issuer", placeholder: "Banco emissor" },
        },
        callbacks: {
          onFormMounted: (error: any) => {
            if (error) {
              console.warn("Form Mounted handling error: ", error);
              return;
            }
            console.log("Form mounted");
          },
          onPaymentMethodsReceived: (error: any, paymentMethods: any) => {
            if (error) {
              setCardThumbnail(null);
              return console.error('Payment Methods Error:', error);
            }
            if (paymentMethods && paymentMethods.length > 0) {
              setCardThumbnail(paymentMethods[0].thumbnail);
            } else {
              setCardThumbnail(null);
            }
          },
          onInstallmentsReceived: (error: any, installments: any) => {
            if (error) return console.error('Installments Error:', error);
            console.log('Installments Received:', installments);
          },
        },
      });
      setCardForm(form);

      return () => {
        console.log('Unmounting card form...');
        form?.unmount();
      };
    }
  }, [isFormReady, mercadoPago, amount]);

  const handleIdentificationNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ''); // Remove non-digits
    setIdentificationNumber(value);

    if (value.length === 11) {
      setIdentificationType('CPF');
    } else if (value.length === 14) {
      setIdentificationType('CNPJ');
    }
  };

  const maskIdentificationNumber = (value: string) => {
    if (value.length <= 11) { // CPF mask
      return value
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    } else { // CNPJ mask
      return value
        .slice(0, 14) // Ensure it doesn't exceed 14 digits
        .replace(/(\d{2})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1/$2')
        .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!cardForm || loading) { // Prevent double submission
      console.error("CardForm not ready or already submitting");
      return;
    }

    setLoading(true);
    setError(null);
    setFieldErrors({});

    try {
      const token = await cardForm.createCardToken({
        identificationType: identificationType,
        identificationNumber: identificationNumber,
      });
      console.log("Card Token created via onSubmit:", token);

      // Invoke the Edge Function
      const { data: paymentResult, error: functionError } = await supabase.functions.invoke('process-payment', {
        body: {
          planName: planName,
          cardToken: token.token,
        },
      });

      if (functionError) {
        throw new Error(functionError.message);
      }

      onPaymentSuccess(paymentResult);
    } catch (err: any) {
      console.error("Error creating card token via onSubmit:", err);
      const newFieldErrors: { [key: string]: string } = {};
      if (err && Array.isArray(err)) {
        err.forEach(errorDetail => {
          const fieldMap: { [key: string]: string } = {
            cardholderName: 'cardholderName',
            cardNumber: 'cardNumber',
            expirationDate: 'cardExpirationDate',
            securityCode: 'securityCode',
            identificationNumber: 'identificationNumber',
            identificationType: 'identificationType',
          };
          const errorField = fieldMap[errorDetail.field] || errorDetail.field || 'generic';
          newFieldErrors[errorField] = errorDetail.message;
        });
      }
      setFieldErrors(newFieldErrors);
      setError("Alguns dados estão incorretos. Por favor, verifique os campos destacados.");
      onPaymentError(err);
    } finally {
      setLoading(false);
    }
  };

  const inputClasses = "w-full px-4 py-2.5 bg-black/20 border rounded-lg shadow-inner focus:outline-none focus:ring-2 focus:ring-offset-0 text-white placeholder-slate-400 transition-colors";
  const getFieldClass = (fieldName: string) => {
    return fieldErrors[fieldName]
      ? 'border-red-500 focus:ring-red-500'
      : 'border-white/20 focus:ring-pink-500';
  };

  return (
    <div className="w-full mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white">Checkout</h2>
        <p className="text-base text-slate-300 mt-1">Plano <span className="font-semibold text-pink-400">{planName}</span> - Total: <span className="font-semibold text-pink-400">R$ {amount.toFixed(2)}</span></p>
      </div>

      {!isFormReady ? (
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner />
        </div>
      ) : (
        <>
          {error && <p className="bg-red-500/20 text-red-300 p-3 rounded-lg text-center text-sm mb-4">{error}</p>}
          
          <form id="form-checkout" className="space-y-6" onSubmit={handleSubmit}>
            {/* 1. Cardholder Name */}
            <div>
              <input
                type="text"
                id="form-checkout__cardholderName"
                data-checkout="cardholderName"
                className={`${inputClasses} ${getFieldClass('cardholderName')}`}
                placeholder="Nome e sobrenome"
              />
              {fieldErrors.cardholderName && <p className="text-red-400 text-xs mt-1">{fieldErrors.cardholderName}</p>}
            </div>

            {/* 2. Card Number */}
            <div className="relative">
              <div id="form-checkout__cardNumber" className={`mp-input-container h-11 rounded-lg p-3 border ${getFieldClass('cardNumber')}`}></div>
              {cardThumbnail && (
                <img 
                  src={cardThumbnail} 
                  alt="Bandeira do cartão" 
                  className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-auto"
                />
              )}
              {fieldErrors.cardNumber && <p className="text-red-400 text-xs mt-1">{fieldErrors.cardNumber}</p>}
            </div>

            {/* 3. Expiration Date & CVV */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div id="form-checkout__cardExpirationDate" className={`mp-input-container h-11 rounded-lg p-3 border ${getFieldClass('cardExpirationDate')}`}></div>
                {fieldErrors.cardExpirationDate && <p className="text-red-400 text-xs mt-1">{fieldErrors.cardExpirationDate}</p>}
              </div>
              <div>
                <div id="form-checkout__securityCode" className={`mp-input-container h-11 rounded-lg p-3 border ${getFieldClass('securityCode')}`}></div>
                {fieldErrors.securityCode && <p className="text-red-400 text-xs mt-1">{fieldErrors.securityCode}</p>}
              </div>
            </div>
            
            {/* 4. Document Number */}
            <div>
              {/* Hidden Select for SDK */}
              <div className="hidden">
                <select
                  id="form-checkout__identificationType"
                  data-checkout="identificationType"
                  value={identificationType}
                  readOnly
                >
                  {identificationTypes.map(type => (
                    <option key={type.id} value={type.id}>{type.name}</option>
                  ))}
                </select>
              </div>
              
              {/* Hidden Input for SDK to read unmasked value */}
              <input type="hidden" id="form-checkout__identificationNumber" data-checkout="identificationNumber" value={identificationNumber} />

              {/* Visible Input for User Interaction */}
              <div>
                <input
                  type="text"
                  className={`${inputClasses} ${getFieldClass('identificationNumber')}`}
                  placeholder="CPF ou CNPJ"
                  value={maskIdentificationNumber(identificationNumber)}
                  onChange={handleIdentificationNumberChange}
                />
                {fieldErrors.identificationNumber && <p className="text-red-400 text-xs mt-1">{fieldErrors.identificationNumber}</p>}
              </div>
            </div>

            <div className="hidden">
              <select
                id="form-checkout__issuer"
                data-checkout="issuer"
                className={`${inputClasses} ${getFieldClass('issuer')}`}
              ></select>
              {fieldErrors.issuer && <p className="text-red-400 text-xs mt-1">{fieldErrors.issuer}</p>}
            </div>
            
            {/* 5. Installments */}
            <div>
              <select
                id="form-checkout__installments"
                data-checkout="installments"
                className={`${inputClasses} ${getFieldClass('installments')}`}
              ></select>
              {fieldErrors.installments && <p className="text-red-400 text-xs mt-1">{fieldErrors.installments}</p>}
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold py-3 px-8 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 disabled:from-slate-600 disabled:to-slate-700 disabled:text-slate-400 disabled:cursor-not-allowed"
              disabled={loading || !cardForm}
            >
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
