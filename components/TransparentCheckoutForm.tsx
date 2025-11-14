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
          installments: { id: "form-checkout__installments", placeholder: "Parcelas" },
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
      const token = await cardForm.createCardToken();
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
            identificationType: 'identificationType'
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

  const getFieldClass = (fieldName: string) => {
    return fieldErrors[fieldName]
      ? 'border-red-500 focus:ring-red-500'
      : 'border-slate-300 focus:ring-pink-500';
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-pink-600 mb-4">Pagar Plano {planName}</h2>
      <p className="text-xl font-semibold text-slate-700 mb-6">Total: R$ {amount.toFixed(2)}</p>

      {!isFormReady ? (
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner />
        </div>
      ) : (
        <>
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          
          <form id="form-checkout" className="space-y-2" onSubmit={handleSubmit}>
            {/* 1. Cardholder Name */}
            <div className="py-2">
              <input
                type="text"
                id="form-checkout__cardholderName"
                data-checkout="cardholderName"
                className={`w-full px-4 py-3 bg-white border rounded-lg shadow-sm focus:outline-none focus:ring-2 ${getFieldClass('cardholderName')}`}
                placeholder="Nome e sobrenome"
              />
              {fieldErrors.cardholderName && <p className="text-red-500 text-xs mt-1">{fieldErrors.cardholderName}</p>}
            </div>

            {/* 2. Card Number */}
            <div className="py-2 relative">
              <div id="form-checkout__cardNumber" className={`mp-input-container h-12 rounded-lg p-3 border ${getFieldClass('cardNumber')}`}></div>
              {cardThumbnail && (
                <img 
                  src={cardThumbnail} 
                  alt="Bandeira do cartão" 
                  className="absolute right-3 top-1/2 -translate-y-1/2 h-6 w-auto"
                />
              )}
              {fieldErrors.cardNumber && <p className="text-red-500 text-xs mt-1">{fieldErrors.cardNumber}</p>}
            </div>

            {/* 3. Expiration Date & CVV */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2">
              <div>
                <div id="form-checkout__cardExpirationDate" className={`mp-input-container h-12 rounded-lg p-3 border ${getFieldClass('cardExpirationDate')}`}></div>
                {fieldErrors.cardExpirationDate && <p className="text-red-500 text-xs mt-1">{fieldErrors.cardExpirationDate}</p>}
              </div>
              <div>
                <div id="form-checkout__securityCode" className={`mp-input-container h-12 rounded-lg p-3 border ${getFieldClass('securityCode')}`}></div>
                {fieldErrors.securityCode && <p className="text-red-500 text-xs mt-1">{fieldErrors.securityCode}</p>}
              </div>
            </div>
            
            {/* 4. Document Number */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2">
              <div>
                <select
                  id="form-checkout__identificationType"
                  data-checkout="identificationType"
                  className={`w-full px-4 py-3 bg-white border rounded-lg shadow-sm focus:outline-none focus:ring-2 ${getFieldClass('identificationType')}`}
                  value={identificationType}
                  onChange={(e) => setIdentificationType(e.target.value)}
                >
                  {identificationTypes.map(type => (
                    <option key={type.id} value={type.id}>{type.name}</option>
                  ))}
                </select>
                {fieldErrors.identificationType && <p className="text-red-500 text-xs mt-1">{fieldErrors.identificationType}</p>}
              </div>
              <div>
                <input
                  type="text"
                  id="form-checkout__identificationNumber"
                  data-checkout="identificationNumber"
                  className={`w-full px-4 py-3 bg-white border rounded-lg shadow-sm focus:outline-none focus:ring-2 ${getFieldClass('identificationNumber')}`}
                  placeholder="Número do documento"
                  value={maskIdentificationNumber(identificationNumber)}
                  onChange={handleIdentificationNumberChange}
                />
                {fieldErrors.identificationNumber && <p className="text-red-500 text-xs mt-1">{fieldErrors.identificationNumber}</p>}
              </div>
            </div>

            <div className="py-2 hidden">
              <select
                id="form-checkout__issuer"
                data-checkout="issuer"
                className={`w-full px-4 py-3 bg-white border rounded-lg shadow-sm focus:outline-none focus:ring-2 ${getFieldClass('issuer')}`}
              ></select>
              {fieldErrors.issuer && <p className="text-red-500 text-xs mt-1">{fieldErrors.issuer}</p>}
            </div>
            
            {/* 5. Installments */}
            <div className="py-2">
              <select
                id="form-checkout__installments"
                data-checkout="installments"
                className={`w-full px-4 py-3 bg-white border rounded-lg shadow-sm focus:outline-none focus:ring-2 ${getFieldClass('installments')}`}
              ></select>
              {fieldErrors.installments && <p className="text-red-500 text-xs mt-1">{fieldErrors.installments}</p>}
            </div>

            <button
              type="submit"
              className="w-full bg-pink-500 text-white font-semibold py-3 px-8 rounded-lg shadow-md hover:bg-pink-600 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading || !cardForm}
            >
              {loading ? 'Processando...' : `Pagar R$ ${amount.toFixed(2)}`}
            </button>
          </form>
        </>
      )}
    </div>
  );
};

export default TransparentCheckoutForm;