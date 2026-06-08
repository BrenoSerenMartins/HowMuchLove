export const validateRequired = (value: string): string | null => {
  if (!value || value.trim() === '') {
    return 'Este campo é obrigatório.';
  }
  return null;
};

export const validateEmail = (email: string): string | null => {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return 'Por favor, insira um email válido.';
  }
  return null;
};

export const validateMinLength = (minLength: number) => (value: string): string | null => {
  if (value.length < minLength) {
    return `Deve ter pelo menos ${minLength} caracteres.`;
  }
  return null;
};

export const validatePassword = [validateRequired, validateMinLength(6)];
