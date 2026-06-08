const DEFAULT_EDGE_ERROR_MESSAGE = 'Ocorreu um erro inesperado. Tente novamente.';

const extractMessage = (error: unknown): string | null => {
  if (typeof error === 'string') {
    const trimmed = error.trim();
    return trimmed || null;
  }

  if (error instanceof Error) {
    const trimmed = error.message.trim();
    return trimmed || null;
  }

  if (error && typeof error === 'object' && !Array.isArray(error)) {
    const typedError = error as { message?: unknown; error?: unknown; details?: unknown };
    for (const value of [typedError.message, typedError.error, typedError.details]) {
      const message = extractMessage(value);
      if (message) {
        return message;
      }
    }
  }

  return null;
};

export const getEdgeErrorMessage = (error: unknown, fallback = DEFAULT_EDGE_ERROR_MESSAGE): string => {
  return extractMessage(error) ?? fallback;
};

export const logEdgeError = (scope: string, error: unknown, context: Record<string, unknown> = {}): void => {
  console.error(`[${scope}]`, {
    message: getEdgeErrorMessage(error),
    ...context,
    error,
  });
};

export const createErrorResponse = (
  scope: string,
  error: unknown,
  headers: Record<string, string>,
  status = 400,
  fallback = DEFAULT_EDGE_ERROR_MESSAGE,
): Response => {
  const message = getEdgeErrorMessage(error, fallback);
  logEdgeError(scope, error);

  return new Response(JSON.stringify({ error: message }), {
    headers: { ...headers, 'Content-Type': 'application/json' },
    status,
  });
};
