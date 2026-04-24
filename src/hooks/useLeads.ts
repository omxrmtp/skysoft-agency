/**
 * useLeads Hook
 * 
 * Custom React hook for managing lead state and operations
 * Handles lead creation, fetching, and status updates with proper error handling
 */

import { useState, useEffect, useCallback } from 'react';
import { apiService, Lead, LeadFormData, PaginatedResponse } from '../services/apiService';

export interface UseLeadsOptions {
  autoFetch?: boolean;
  initialPage?: number;
  initialLimit?: number;
  filters?: {
    status?: string;
    service?: number;
    search?: string;
    date_from?: string;
    date_to?: string;
  };
}

export interface UseLeadsReturn {
  // Data
  leads: Lead[];
  currentLead: Lead | null;
  loading: boolean;
  error: string | null;
  
  // Pagination
  pagination: {
    currentPage: number;
    perPage: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  
  // Actions
  fetchLeads: (page?: number, limit?: number, filters?: UseLeadsOptions['filters']) => Promise<void>;
  fetchLead: (id: number) => Promise<Lead | null>;
  createLead: (leadData: LeadFormData) => Promise<Lead | null>;
  updateLeadStatus: (id: number, status: 'nuevo' | 'contactado' | 'cerrado') => Promise<boolean>;
  deleteLead: (id: number) => Promise<boolean>;
  exportLeads: (filters?: UseLeadsOptions['filters']) => Promise<void>;
  refreshLeads: () => Promise<void>;
  
  // State management
  clearError: () => void;
  setCurrentLead: (lead: Lead | null) => void;
  setFilters: (filters: UseLeadsOptions['filters']) => void;
}

export const useLeads = (options: UseLeadsOptions = {}): UseLeadsReturn => {
  const {
    autoFetch = true,
    initialPage = 1,
    initialLimit = 20,
    filters: initialFilters = {}
  } = options;

  // State
  const [leads, setLeads] = useState<Lead[]>([]);
  const [currentLead, setCurrentLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    currentPage: initialPage,
    perPage: initialLimit,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });
  const [currentFilters, setCurrentFilters] = useState<UseLeadsOptions['filters']>(initialFilters);

  // Fetch leads with pagination and filters
  const fetchLeads = useCallback(async (
    page?: number,
    limit?: number,
    filters?: UseLeadsOptions['filters']
  ): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiService.getLeads({
        page: page || pagination.currentPage,
        limit: limit || pagination.perPage,
        ...filters,
        ...currentFilters,
      });

      setLeads(response.data);
      setPagination(response.pagination);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch leads';
      setError(errorMessage);
      console.error('Error fetching leads:', err);
    } finally {
      setLoading(false);
    }
  }, [pagination.currentPage, pagination.perPage, currentFilters]);

  // Fetch single lead
  const fetchLead = useCallback(async (id: number): Promise<Lead | null> => {
    try {
      setLoading(true);
      setError(null);

      const lead = await apiService.getLead(id);
      setCurrentLead(lead);
      return lead;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch lead';
      setError(errorMessage);
      console.error('Error fetching lead:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Create new lead
  const createLead = useCallback(async (leadData: LeadFormData): Promise<Lead | null> => {
    try {
      setLoading(true);
      setError(null);

      const newLead = await apiService.createLead(leadData);
      
      // Add to local state if successful
      setLeads(prev => [newLead, ...prev]);
      
      // Show success notification (you could integrate with a toast library)
      console.log('Lead created successfully:', newLead);
      
      return newLead;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create lead';
      setError(errorMessage);
      console.error('Error creating lead:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update lead status
  const updateLeadStatus = useCallback(async (
    id: number,
    status: 'nuevo' | 'contactado' | 'cerrado'
  ): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      await apiService.updateLeadStatus(id, status);
      
      // Update local state
      setLeads(prev => prev.map(lead => 
        lead.id === id ? { ...lead, estado_gestion: status } : lead
      ));
      
      // Update current lead if it's the same
      if (currentLead && currentLead.id === id) {
        setCurrentLead({ ...currentLead, estado_gestion: status });
      }
      
      console.log(`Lead ${id} status updated to ${status}`);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update lead status';
      setError(errorMessage);
      console.error('Error updating lead status:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [currentLead]);

  // Delete lead
  const deleteLead = useCallback(async (id: number): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      await apiService.deleteLead(id);
      
      // Remove from local state
      setLeads(prev => prev.filter(lead => lead.id !== id));
      
      // Clear current lead if it's the same
      if (currentLead && currentLead.id === id) {
        setCurrentLead(null);
      }
      
      console.log(`Lead ${id} deleted successfully`);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete lead';
      setError(errorMessage);
      console.error('Error deleting lead:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [currentLead]);

  // Export leads
  const exportLeads = useCallback(async (filters?: UseLeadsOptions['filters']): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const blob = await apiService.exportLeads(filters || currentFilters);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `leads_export_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      console.log('Leads exported successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to export leads';
      setError(errorMessage);
      console.error('Error exporting leads:', err);
    } finally {
      setLoading(false);
    }
  }, [currentFilters]);

  // Refresh leads (re-fetch with current parameters)
  const refreshLeads = useCallback(async (): Promise<void> => {
    await fetchLeads(pagination.currentPage, pagination.perPage, currentFilters);
  }, [fetchLeads, pagination.currentPage, pagination.perPage, currentFilters]);

  // Clear error
  const clearError = useCallback((): void => {
    setError(null);
  }, []);

  // Set filters
  const setFilters = useCallback((filters: UseLeadsOptions['filters']): void => {
    setCurrentFilters(filters);
  }, []);

  // Auto-fetch on mount
  useEffect(() => {
    if (autoFetch) {
      fetchLeads(initialPage, initialLimit, initialFilters);
    }
  }, [autoFetch, fetchLeads, initialPage, initialLimit]);

  return {
    // Data
    leads,
    currentLead,
    loading,
    error,
    
    // Pagination
    pagination,
    
    // Actions
    fetchLeads,
    fetchLead,
    createLead,
    updateLeadStatus,
    deleteLead,
    exportLeads,
    refreshLeads,
    
    // State management
    clearError,
    setCurrentLead,
    setFilters,
  };
};

// Additional hook for lead statistics
export const useLeadStats = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const leadStats = await apiService.getLeadStats();
      setStats(leadStats);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch lead statistics';
      setError(errorMessage);
      console.error('Error fetching lead stats:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    loading,
    error,
    refreshStats: fetchStats,
  };
};

// Hook for lead form handling
export const useLeadForm = (initialLead?: Partial<LeadFormData>) => {
  const [formData, setFormData] = useState<LeadFormData>({
    nombre: initialLead?.nombre || '',
    correo: initialLead?.correo || '',
    telefono: initialLead?.telefono || '',
    mensaje: initialLead?.mensaje || '',
    servicio_id: initialLead?.servicio_id || undefined,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'Name is required';
    }

    if (!formData.correo.trim()) {
      newErrors.correo = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.correo)) {
      newErrors.correo = 'Invalid email format';
    }

    if (!formData.mensaje.trim()) {
      newErrors.mensaje = 'Message is required';
    } else if (formData.mensaje.trim().length < 10) {
      newErrors.mensaje = 'Message must be at least 10 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleChange = useCallback((field: keyof LeadFormData, value: string | number | undefined) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  }, [errors]);

  const resetForm = useCallback((): void => {
    setFormData({
      nombre: '',
      correo: '',
      telefono: '',
      mensaje: '',
      servicio_id: undefined,
    });
    setErrors({});
  }, []);

  const submitForm = useCallback(async (): Promise<Lead | null> => {
    if (!validateForm()) {
      return null;
    }

    setIsSubmitting(true);
    try {
      const newLead = await apiService.createLead(formData);
      resetForm();
      return newLead;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit lead';
      setErrors({ submit: errorMessage });
      return null;
    } finally {
      setIsSubmitting(false);
    }
  }, [validateForm, formData, resetForm]);

  return {
    formData,
    errors,
    isSubmitting,
    handleChange,
    validateForm,
    resetForm,
    submitForm,
  };
};

export default useLeads;
