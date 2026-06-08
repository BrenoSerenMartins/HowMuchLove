import React, { useState, useCallback } from 'react';
import { uiCopy } from '@/shared/lib/ui-copy';

type ValidatorFunction = (value: string) => string | null;
type ValidationRules<T> = {
  [K in keyof T]?: ValidatorFunction | ValidatorFunction[];
};
// FIX: Add 'form' property to allow for form-level errors.
type FormErrors<T> = {
  [K in keyof T]?: string;
} & {
  form?: string;
};

export const useFormValidator = <T extends Record<string, any>>(
  initialValues: T,
  validationRules: ValidationRules<T>
) => {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<FormErrors<T>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = useCallback(() => {
    const newErrors: FormErrors<T> = {};
    for (const key in validationRules) {
      const rules = validationRules[key as keyof T];
      const value = values[key as keyof T];
      if (rules) {
        const rulesArray = Array.isArray(rules) ? rules : [rules];
        for (const rule of rulesArray) {
          const error = rule(value);
          if (error) {
            newErrors[key as keyof T] = error;
            break; 
          }
        }
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [values, validationRules]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setValues(prev => ({ ...prev, [name]: value }));
    // Clear error on change
    if (errors[name as keyof T]) {
        setErrors(prev => ({...prev, [name]: undefined}));
    }
  };

  const handleSubmit = (callback: (values: T) => Promise<void>) => async (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      setIsSubmitting(true);
      try {
        await callback(values);
      } catch(err: any) {
        // Allow the callback to throw an error to be displayed
        setErrors({ form: err.message || uiCopy.common.unexpectedError });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return {
    values,
    errors,
    isSubmitting,
    handleChange,
    handleSubmit,
    setErrors,
  };
};
