import { createContext, useContext, useState, useCallback } from 'react';
import axios from 'axios';
const RegistrationContext = createContext(null);

/**
 * RegistrationProvider
 * Wraps the app and provides global student-registration state so child
 * components never need to receive registrations / CRUD callbacks as props.
 *
 * Token is passed in as a prop so this context stays decoupled from
 * AuthContext (avoiding circular-context problems).  In practice the
 * parent (App.jsx) threads the token down once via a thin wrapper component.
 */
export const RegistrationProvider = ({ children, token }) => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  // ─── Fetch all registrations for the logged-in user ───────────────────────
  const fetchRegistrations = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/registrations', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();
      if (res.ok && result.success) {
        setRegistrations(result.data || []);
      } else {
        setError(result.message || 'Failed to load registrations.');
      }
    } catch {
      setError('Network error. Unable to load registrations.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  // ─── Add a new registration (multipart/form-data) ─────────────────────────
  const addRegistration = useCallback(
  async (formData) => {
    setUploadProgress(0);

    try {
      const res = await axios.post('/api/registrations', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },

        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percent = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );

            setUploadProgress(percent);
          }
        },
      });

      const result = res.data;

      if (result.success) {
        setRegistrations((prev) => [result.data, ...prev]);
        setUploadProgress(100);

        return {
          success: true,
          data: result.data,
        };
      }

      return {
        success: false,
        errors: result.errors,
        message: result.message,
      };
    } catch (error) {
      const result = error.response?.data;

      return {
        success: false,
        errors: result?.errors,
        message:
          result?.message ||
          'Network error. Unable to submit registration.',
      };
    }
  },
  [token]
);

  // ─── Update an existing registration ──────────────────────────────────────
  const updateRegistration = useCallback(
    async (id, formData) => {
      const res = await fetch(`/api/registrations/${id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const result = await res.json();
      if (res.ok && result.success) {
        setRegistrations((prev) =>
          prev.map((r) => (r.id === id ? result.data : r))
        );
        return { success: true, data: result.data };
      }
      return { success: false, errors: result.errors, message: result.message };
    },
    [token]
  );

  // ─── Delete a registration ─────────────────────────────────────────────────
  const deleteRegistration = useCallback(
    async (id) => {
      const res = await fetch(`/api/registrations/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();
      if (res.ok && result.success) {
        setRegistrations((prev) => prev.filter((r) => r.id !== id));
        return { success: true };
      }
      return { success: false, message: result.message };
    },
    [token]
  );

  return (
    <RegistrationContext.Provider
      value={{
        registrations,
        loading,
        error,
        uploadProgress,
        fetchRegistrations,
        addRegistration,
        updateRegistration,
        deleteRegistration,
      }}
    >
      {children}
    </RegistrationContext.Provider>
  );
};

// ─── Convenience hook ──────────────────────────────────────────────────────
export const useRegistration = () => {
  const ctx = useContext(RegistrationContext);
  if (!ctx) {
    throw new Error('useRegistration must be used within a RegistrationProvider');
  }
  return ctx;
};
