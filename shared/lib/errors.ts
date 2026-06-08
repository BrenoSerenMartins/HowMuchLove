import { uiCopy } from './ui-copy';

const DEFAULT_ERROR_MESSAGE: string = uiCopy.common.unexpectedError;

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
};

const extractMessage = (value: unknown): string | null => {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed || null;
  }

  if (value instanceof Error) {
    const trimmed = value.message.trim();
    return trimmed || null;
  }

  if (Array.isArray(value)) {
    const messages = value
      .map(extractMessage)
      .filter((message): message is string => Boolean(message));

    return messages.length > 0 ? messages.join(' ') : null;
  }

  if (isRecord(value)) {
    for (const key of ['message', 'error', 'details']) {
      const message = extractMessage(value[key]);
      if (message) {
        return message;
      }
    }
  }

  return null;
};

export const getStringProperty = (value: unknown, key: string): string | null => {
  if (!isRecord(value)) {
    return null;
  }

  const candidate = value[key];
  if (typeof candidate !== 'string') {
    return null;
  }

  const trimmed = candidate.trim();
  return trimmed || null;
};

export const errorMessages = {
  generic: DEFAULT_ERROR_MESSAGE,
  auth: uiCopy.auth.sessionError,
  storyNotFound: 'Esta história não foi encontrada.',
  storyLoad: uiCopy.story.loadErrorDescription,
  storyPassword: uiCopy.story.passwordInvalid,
  storySave: uiCopy.story.saveError,
  plansLoad: uiCopy.pricing.loadError,
  checkoutLoad: uiCopy.payment.checkoutUnavailable,
  payment: uiCopy.payment.genericError,
} as const;

export const getErrorMessage = (error: unknown, fallback: string = DEFAULT_ERROR_MESSAGE): string => {
  return extractMessage(error) ?? fallback;
};

export const getPayloadErrorMessage = (payload: unknown, fallback: string = DEFAULT_ERROR_MESSAGE): string => {
  if (!isRecord(payload)) {
    return fallback;
  }

  const errorMessage = extractMessage(payload.error);
  if (errorMessage) {
    return errorMessage;
  }

  if (payload.success === false) {
    const successFlaggedMessage = extractMessage(payload.message);
    if (successFlaggedMessage) {
      return successFlaggedMessage;
    }
  }

  return fallback;
};

export const getApiErrorMessage = (
  error: unknown,
  payload: unknown,
  fallback: string = DEFAULT_ERROR_MESSAGE,
): string => {
  const payloadError = getPayloadErrorMessage(payload, '');
  if (payloadError) {
    return payloadError;
  }

  return getErrorMessage(error, fallback);
};

export const logError = (scope: string, error: unknown, context: Record<string, unknown> = {}): void => {
  console.error(`[${scope}]`, {
    message: getErrorMessage(error),
    ...context,
    error,
  });
};
