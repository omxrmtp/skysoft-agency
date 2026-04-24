/**
 * useLeads Hook
 * 
 * Custom React hook for managing lead state and operations with Supabase
 * Handles lead creation, fetching, and status updates with proper error handling
 */

import { useState, useEffect, useCallback } from 'react';
import { supabaseService } from '../services/supabaseService';

// Types from Supabase
type Lead = {
  id: string;
  nombre: string;
  correo: string;
  telefono: string;
  mensaje: string;
  servicio_id: string;
  estado_gestion: 'nuevo' | 'contactado' | 'cerrado';
  fecha_registro: string;
  ultima_actualizacion: string;
};

type LeadFormData = Omit<Lead, 'id' | 'fecha_registro' | 'ultima_actualizacion'>;

export interface UseLeadsOptions {
  autoFetch?: boolean;
  initialPage?: number;
  initialLimit?: number;
  filters?: {
    status?: string;
    service?: string;
    search?: string;
    dateFrom?: string;
    dateTo?: string;
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
  fetchLead: (id: string) => Promise<Lead | null>;
  createLead: (leadData: LeadFormData) => Promise<Lead | null>;
  updateLeadStatus: (id: string, status: 'nuevo' | 'contactado' | 'cerrado') => Promise<boolean>;
  deleteLead: (id: string) => Promise<boolean>;
  exportLeads: (filters?: UseLeadsOptions['filters']) => Promise<void>;
  refreshLeads: () => Promise<void>;
  
  // State management
  setFilters: (filters: UseLeadsOptions['filters']) => void;
  clearError: () => void;
  setCurrentLead: (lead: Lead | null) => void;
  
  // Form helpers
  formData: LeadFormData;
  handleInputChange: (field: keyof LeadFormData) => (value: string) => void;
  resetForm: () => void;
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

      const response = await supabaseService.getLeads({
        page: page || pagination.currentPage,
        limit: limit || pagination.perPage,
        status: filters?.status || currentFilters?.status,
        service: filters?.service || currentFilters?.service,
        search: filters?.search || currentFilters?.search,
        dateFrom: filters?.dateFrom || currentFilters?.dateFrom,
        dateTo: filters?.dateTo || currentFilters?.dateTo,
      });

      setLeads(response.data || []);
      if (response.pagination) {
        setPagination({
          currentPage: response.pagination.current_page,
          perPage: response.pagination.per_page,
          total: response.pagination.total,
          totalPages: response.pagination.total_pages,
          hasNext: response.pagination.has_next,
          hasPrev: response.pagination.has_prev,
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch leads';
      setError(errorMessage);
      console.error('Error fetching leads:', err);
    } finally {
      setLoading(false);
    }
  }, [pagination.currentPage, pagination.perPage, currentFilters]);

  // Fetch single lead - Note: getLead doesn't exist in supabaseService, so we'll find it in the leads array
  const fetchLead = useCallback(async (id: string): Promise<Lead | null> => {
    try {
      setError(null);
      const lead = leads.find(l => l.id === id) || null;
      setCurrentLead(lead);
      return lead;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch lead';
      setError(errorMessage);
      console.error('Error fetching lead:', err);
      return null;
    }
  }, [leads]);

  // Create new lead
  const createLead = useCallback(async (leadData: LeadFormData): Promise<Lead | null> => {
    try {
      setError(null);
      
      // Add default status if not provided
      const leadWithDefaults = {
        ...leadData,
        estado_gestion: 'nuevo' as const,
        telefono: leadData.telefono || '',
        servicio_id: leadData.servicio_id || '',
      };

      const newLead = await supabaseService.createLead(leadWithDefaults);
      
      // Refresh leads list
      await fetchLeads();
      
      return newLead;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create lead';
      setError(errorMessage);
      console.error('Error creating lead:', err);
      return null;
    }
  }, [fetchLeads]);

  // Update lead status
  const updateLeadStatus = useCallback(async (id: string, status: 'nuevo' | 'contactado' | 'cerrado'): Promise<boolean> => {
    try {
      setError(null);
      await supabaseService.updateLeadStatus(id, status);
      
      // Update local state
      setLeads(prev => prev.map(lead => 
        lead.id === id ? { ...lead, estado_gestion: status } : lead
      ));
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update lead status';
      setError(errorMessage);
      console.error('Error updating lead status:', err);
      return false;
    }
  }, []);

  // Delete lead
  const deleteLead = useCallback(async (id: string): Promise<boolean> => {
    try {
      setError(null);
      await supabaseService.deleteLead(id);
      
      // Update local state
      setLeads(prev => prev.filter(lead => lead.id !== id));
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete lead';
      setError(errorMessage);
      console.error('Error deleting lead:', err);
      return false;
    }
  }, []);

  // Export leads - Note: exportLeads doesn't exist in supabaseService, so we'll implement a simple CSV export
  const exportLeads = useCallback(async (filters?: UseLeadsOptions['filters']): Promise<void> => {
    try {
      setError(null);
      setLoading(true);
      
      // Get filtered leads
      const response = await supabaseService.getLeads({
        page: 1,
        limit: 1000, // Get all leads for export
        status: filters?.status || currentFilters?.status,
        service: filters?.service || currentFilters?.service,
        search: filters?.search || currentFilters?.search,
        dateFrom: filters?.dateFrom || currentFilters?.dateFrom,
        dateTo: filters?.dateTo || currentFilters?.dateTo,
      });

      // Create CSV content
      const csvContent = [
        ['ID', 'Nombre', 'Correo', 'Teléfono', 'Mensaje', 'Servicio', 'Estado', 'Fecha Registro']
      ];
      
      response.data.forEach(lead => {
        csvContent.push([
          lead.id,
          lead.nombre,
          lead.correo,
          lead.telefono,
          lead.mensaje,
          lead.servicio_id,
          lead.estado_gestion,
          lead.fecha_registro
        ]);
      });

      // Create and download CSV
      const csvString = csvContent.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
      const blob = new Blob([csvString], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `leads_export_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
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
    await fetchLeads();
  }, [fetchLeads]);

  // Set filters
  const setFilters = useCallback((filters: UseLeadsOptions['filters']) => {
    setCurrentFilters(filters);
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Auto fetch on mount
  useEffect(() => {
    if (autoFetch) {
      fetchLeads();
    }
  }, [autoFetch, fetchLeads]);

  // Form state for lead creation
  const [formData, setFormData] = useState<LeadFormData>({
    nombre: '',
    correo: '',
    telefono: '',
    mensaje: '',
    servicio_id: '',
    estado_gestion: 'nuevo',
  } as LeadFormData);

  // Handle form input changes
  const handleInputChange = useCallback((field: keyof LeadFormData) => (value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  // Reset form
  const resetForm = useCallback(() => {
    setFormData({
      nombre: '',
      correo: '',
      telefono: '',
      mensaje: '',
      servicio_id: '',
      estado_gestion: 'nuevo',
    } as LeadFormData);
  }, []);

  return {
    leads,
    currentLead,
    loading,
    error,
    pagination,
    fetchLeads,
    fetchLead,
    createLead,
    updateLeadStatus,
    deleteLead,
    exportLeads,
    refreshLeads,
    setFilters,
    clearError,
    setCurrentLead,
    // Form helpers
    formData,
    handleInputChange,
    resetForm,
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
      const dashboardStats = await supabaseService.getDashboardStats();
      setStats(dashboardStats);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch stats';
      setError(errorMessage);
      console.error('Error fetching stats:', err);
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
    servicio_id: initialLead?.servicio_id || '',
    estado_gestion: 'nuevo',
  } as LeadFormData);
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
      servicio_id: '',
      estado_gestion: 'nuevo',
    } as LeadFormData);
    setErrors({});
  }, []);

  const submitForm = useCallback(async (): Promise<Lead | null> => {
    if (!validateForm()) {
      return null;
    }

    setIsSubmitting(true);
    try {
      const newLead = await supabaseService.createLead({
        ...formData,
        estado_gestion: 'nuevo',
        telefono: formData.telefono || '',
        servicio_id: formData.servicio_id || '',
      });
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
