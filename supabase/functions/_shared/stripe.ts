const STRIPE_API_URL = 'https://api.stripe.com/v1';

export type StripeFormValue = string | number | boolean | null | undefined;

const encoder = new TextEncoder();

const toHex = (bytes: Uint8Array) =>
  Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');

const extractStripeErrorMessage = (payload: unknown, status: number) => {
  if (typeof payload === 'object' && payload !== null) {
    const errorObject = 'error' in payload ? (payload as Record<string, unknown>).error : null;
    if (typeof errorObject === 'object' && errorObject !== null && 'message' in errorObject) {
      const message = (errorObject as Record<string, unknown>).message;
      if (typeof message === 'string' && message.trim()) {
        return message;
      }
    }
  }

  return `Stripe respondeu com status ${status}.`;
};

const appendFormValue = (form: URLSearchParams, key: string, value: StripeFormValue) => {
  if (value === undefined || value === null || value === '') return;
  form.append(key, typeof value === 'boolean' ? (value ? 'true' : 'false') : String(value));
};

export const buildStripeForm = (entries: Array<[string, StripeFormValue]>) => {
  const form = new URLSearchParams();
  for (const [key, value] of entries) {
    appendFormValue(form, key, value);
  }
  return form;
};

export const stripeRequest = async <T = Record<string, unknown>>(
  apiKey: string,
  path: string,
  init?: {
    method?: 'GET' | 'POST';
    form?: URLSearchParams;
  },
): Promise<T> => {
  const method = init?.method ?? 'POST';
  const headers: HeadersInit = {
    Authorization: `Bearer ${apiKey}`,
  };

  const requestInit: RequestInit = { method, headers };
  if (init?.form) {
    headers['Content-Type'] = 'application/x-www-form-urlencoded';
    requestInit.body = init.form.toString();
  }

  const response = await fetch(`${STRIPE_API_URL}${path}`, requestInit);
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(extractStripeErrorMessage(payload, response.status));
  }

  return payload as T;
};

export const verifyStripeWebhookSignature = async ({
  payload,
  signatureHeader,
  secret,
}: {
  payload: string;
  signatureHeader: string | null;
  secret: string;
}) => {
  if (!signatureHeader) {
    throw new Error('Stripe-Signature ausente.');
  }

  const entries = signatureHeader.split(',').map((entry) => entry.trim());
  const timestamp = entries.find((entry) => entry.startsWith('t='))?.slice(2);
  const signatures = entries
    .filter((entry) => entry.startsWith('v1='))
    .map((entry) => entry.slice(3))
    .filter(Boolean);

  if (!timestamp || signatures.length === 0) {
    throw new Error('Cabeçalho Stripe-Signature inválido.');
  }

  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );

  const signedPayload = `${timestamp}.${payload}`;
  const digest = await crypto.subtle.sign('HMAC', key, encoder.encode(signedPayload));
  const expectedSignature = toHex(new Uint8Array(digest));

  if (!signatures.includes(expectedSignature)) {
    throw new Error('Assinatura do webhook do Stripe inválida.');
  }
};
