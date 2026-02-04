import { useState } from 'react';

export const useAuthForm = () => {
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (submitFn) => {
    setLoading(true);
    setError('');
    
    try {
      await submitFn(formData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { formData, loading, error, updateField, handleSubmit };
};