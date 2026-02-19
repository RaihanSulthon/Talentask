// AFTER
import { useState } from 'react';

export const validate = (field, value, formData = {}, isLogin = false) => {
  switch (field) {
    case 'displayName':
      if (!value || !value.trim()) return 'Full name is required';
      if (value.trim().length < 3) return 'Name must be at least 3 characters';
      if (value.trim().length > 50) return 'Name must be under 50 characters';
      if (!/^[a-zA-Z\s]+$/.test(value.trim())) return 'Name can only contain letters and spaces';
      return '';
    case 'email':
      if (!value || !value.trim()) return 'Email is required';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Enter a valid email address';
      return '';
    case 'password':
      if (!value) return 'Password is required';
      if (value.length < 6) return 'Password must be at least 6 characters';
      return '';
    case 'confirmPassword':
      if (!value) return 'Please confirm your password';
      if (value !== formData.password) return 'Passwords do not match';
      return '';
    default:
      return '';
  }
};

export const useAuthForm = () => {
  const [formData, setFormData] = useState({});
  const [fieldErrors, setFieldErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError('');
    // Re-validate on change if already touched
    if (touched[field]) {
      setFieldErrors(prev => ({
        ...prev,
        [field]: validate(field, value, { ...formData, [field]: value }),
      }));
    }
  };

  const touchField = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    setFieldErrors(prev => ({
      ...prev,
      [field]: validate(field, formData[field], formData),
    }));
  };

  const validateAll = (isLogin) => {
    const fields = isLogin
      ? ['email', 'password']
      : ['displayName', 'email', 'password', 'confirmPassword'];
    const errors = {};
    fields.forEach(f => {
      errors[f] = validate(f, formData[f], formData, isLogin);
    });
    setFieldErrors(errors);
    setTouched(fields.reduce((acc, f) => ({ ...acc, [f]: true }), {}));
    return Object.values(errors).every(e => !e);
  };

  const handleSubmit = async (submitFn, isLogin = false) => {
    if (!validateAll(isLogin)) return;
    setLoading(true);
    setError('');
    try {
      await submitFn(formData);
    } catch (err) {
      // Map Firebase error codes to friendly messages
      const code = err.code || '';
      if (code === 'auth/user-not-found' || code === 'auth/wrong-password' || code === 'auth/invalid-credential')
        setError('Invalid email or password. Please try again.');
      else if (code === 'auth/email-already-in-use')
        setError('This email is already registered. Try signing in.');
      else if (code === 'auth/too-many-requests')
        setError('Too many attempts. Please try again later.');
      else
        setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { formData, fieldErrors, touched, loading, error, updateField, touchField, handleSubmit };
};