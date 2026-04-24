/**
 * Contact Form Component
 * 
 * React component for lead submission with form validation
 * and integration with the SkySoft API
 */

import { useState, useEffect } from 'react';
import { supabaseService } from '../../services/supabaseService';

interface Service {
  id: string;
  titulo: string;
  descripcion_corta: string;
  precio_desde?: number;
  estado: 'activo' | 'inactivo';
}

interface LeadFormData {
  nombre: string;
  correo: string;
  telefono: string;
  mensaje: string;
  servicio_id: string;
  estado_gestion: 'nuevo' | 'contactado' | 'cerrado';
}

interface ContactFormProps {
  onLeadSubmitted?: (lead: any) => void;
  onSubmitError?: (error: string) => void;
  className?: string;
  showServiceSelect?: boolean;
  buttonText?: string;
}

export const ContactForm: React.FC<ContactFormProps> = ({
  onLeadSubmitted,
  onSubmitError,
  className = '',
  showServiceSelect = true,
  buttonText = 'Send Message',
}) => {
  const [services, setServices] = useState<Service[]>([]);
  const [loadingServices, setLoadingServices] = useState(false);
  const [servicesError, setServicesError] = useState<string | null>(null);

  const [formData, setFormData] = useState<LeadFormData>({
    nombre: '',
    correo: '',
    telefono: '',
    mensaje: '',
    servicio_id: '',
    estado_gestion: 'nuevo',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch services on component mount
  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoadingServices(true);
        setServicesError(null);
        const servicesList = await supabaseService.getServices(true);
        setServices(servicesList || []);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to load services';
        setServicesError(errorMessage);
        console.error('Error fetching services:', error);
      } finally {
        setLoadingServices(false);
      }
    };

    fetchServices();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>): void => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
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
    } else if (formData.mensaje.length < 10) {
      newErrors.mensaje = 'Message must be at least 10 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const submittedLead = await supabaseService.createLead(formData);
      
      if (onLeadSubmitted) {
        onLeadSubmitted(submittedLead);
      }
      
      // Reset form after successful submission
      setFormData({
        nombre: '',
        correo: '',
        telefono: '',
        mensaje: '',
        servicio_id: '',
        estado_gestion: 'nuevo',
      });
      
      // Show success message (you could integrate with a toast library)
      console.log('Lead submitted successfully:', submittedLead);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to submit form';
      setErrors({ submit: errorMessage });
      
      if (onSubmitError) {
        onSubmitError(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`contact-form ${className}`}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
            Get in Touch
          </h2>
          <p className="text-gray-600 text-center mb-8">
            We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </div>

        {/* Name Field */}
        <div>
          <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-2">
            Full Name *
          </label>
          <input
            type="text"
            id="nombre"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.nombre ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="John Doe"
            disabled={isSubmitting}
          />
          {errors.nombre && (
            <p className="mt-1 text-sm text-red-600">{errors.nombre}</p>
          )}
        </div>

        {/* Email Field */}
        <div>
          <label htmlFor="correo" className="block text-sm font-medium text-gray-700 mb-2">
            Email Address *
          </label>
          <input
            type="email"
            id="correo"
            name="correo"
            value={formData.correo}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.correo ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="john@example.com"
            disabled={isSubmitting}
          />
          {errors.correo && (
            <p className="mt-1 text-sm text-red-600">{errors.correo}</p>
          )}
        </div>

        {/* Phone Field */}
        <div>
          <label htmlFor="telefono" className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number
          </label>
          <input
            type="tel"
            id="telefono"
            name="telefono"
            value={formData.telefono || ''}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.telefono ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="+1 (555) 123-4567"
            disabled={isSubmitting}
          />
          {errors.telefono && (
            <p className="mt-1 text-sm text-red-600">{errors.telefono}</p>
          )}
        </div>

        {/* Service Selection */}
        {showServiceSelect && (
          <div>
            <label htmlFor="servicio_id" className="block text-sm font-medium text-gray-700 mb-2">
              Service of Interest
            </label>
            {loadingServices ? (
              <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                <span className="text-gray-500">Loading services...</span>
              </div>
            ) : servicesError ? (
              <div className="w-full px-3 py-2 border border-red-300 rounded-md bg-red-50">
                <span className="text-red-500">Failed to load services</span>
              </div>
            ) : (
              <select
                id="servicio_id"
                name="servicio_id"
                value={formData.servicio_id || ''}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.servicio_id ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={isSubmitting}
              >
                <option value="">Select a service (optional)</option>
                {services.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.titulo}
                    {service.precio_desde && ` - From $${service.precio_desde}`}
                  </option>
                ))}
              </select>
            )}
            {errors.servicio_id && (
              <p className="mt-1 text-sm text-red-600">{errors.servicio_id}</p>
            )}
          </div>
        )}

        {/* Message Field */}
        <div>
          <label htmlFor="mensaje" className="block text-sm font-medium text-gray-700 mb-2">
            Message *
          </label>
          <textarea
            id="mensaje"
            name="mensaje"
            value={formData.mensaje}
            onChange={handleChange}
            rows={5}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none ${
              errors.mensaje ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Tell us about your project or requirements..."
            disabled={isSubmitting}
          />
          {errors.mensaje && (
            <p className="mt-1 text-sm text-red-600">{errors.mensaje}</p>
          )}
          <p className="mt-1 text-sm text-gray-500">
            {formData.mensaje.length}/500 characters
          </p>
        </div>

        {/* Submit Error */}
        {errors.submit && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {errors.submit}
          </div>
        )}

        {/* Submit Button */}
        <div>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
              isSubmitting
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isSubmitting ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Sending...
              </span>
            ) : (
              buttonText
            )}
          </button>
        </div>

        {/* Privacy Notice */}
        <div className="text-xs text-gray-500 text-center">
          <p>
            By submitting this form, you agree to our{' '}
            <a href="/privacy" className="text-blue-600 hover:text-blue-500">
              Privacy Policy
            </a>{' '}
            and{' '}
            <a href="/terms" className="text-blue-600 hover:text-blue-500">
              Terms of Service
            </a>
            .
          </p>
        </div>
      </form>

      {/* Contact Information */}
      <div className="mt-8 pt-8 border-t border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Other Ways to Reach Us</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="flex justify-center items-center w-12 h-12 bg-blue-100 rounded-full mx-auto mb-3">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            <h4 className="font-medium text-gray-900">Phone</h4>
            <p className="text-gray-600 text-sm mt-1">+1 (555) 123-4567</p>
          </div>
          
          <div className="text-center">
            <div className="flex justify-center items-center w-12 h-12 bg-blue-100 rounded-full mx-auto mb-3">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h4 className="font-medium text-gray-900">Email</h4>
            <p className="text-gray-600 text-sm mt-1">contact@skysoft.com</p>
          </div>
          
          <div className="text-center">
            <div className="flex justify-center items-center w-12 h-12 bg-blue-100 rounded-full mx-auto mb-3">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h4 className="font-medium text-gray-900">Office</h4>
            <p className="text-gray-600 text-sm mt-1">123 Tech Street, Silicon Valley, CA</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactForm;
