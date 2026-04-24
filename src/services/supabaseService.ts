/**
 * Supabase Service
 * 
 * Service for interacting with Supabase backend
 * Replaces the PHP API with Supabase client
 */

import { createClient, SupabaseClient, User } from '@supabase/supabase-js';

// Types
export interface Database {
  public: {
    Tables: {
      categorias: {
        Row: {
          id: string;
          nombre_categoria: string;
          slug: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['categorias']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['categorias']['Insert']>;
      };
      proyectos: {
        Row: {
          id: string;
          categoria_id: string;
          titulo: string;
          descripcion: string;
          cliente: string;
          url: string | null;
          imagen_path: string | null;
          fecha_fin: string | null;
          destacado: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['proyectos']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['proyectos']['Insert']>;
      };
      servicios: {
        Row: {
          id: string;
          titulo: string;
          descripcion_corta: string;
          icono_svg: string | null;
          precio_desde: number | null;
          estado: 'activo' | 'inactivo';
          orden: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['servicios']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['servicios']['Insert']>;
      };
      testimonios: {
        Row: {
          id: string;
          nombre_cliente: string;
          cargo: string | null;
          comentario: string;
          estrellas: number;
          avatar_path: string | null;
          estado: 'activo' | 'inactivo';
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['testimonios']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['testimonios']['Insert']>;
      };
      leads: {
        Row: {
          id: string;
          nombre: string;
          correo: string;
          telefono: string | null;
          mensaje: string;
          servicio_id: string | null;
          estado_gestion: 'nuevo' | 'contactado' | 'cerrado';
          fecha_registro: string;
          ultima_actualizacion: string;
        };
        Insert: Omit<Database['public']['Tables']['leads']['Row'], 'id' | 'fecha_registro' | 'ultima_actualizacion'>;
        Update: Partial<Database['public']['Tables']['leads']['Insert']>;
      };
      user_profiles: {
        Row: {
          id: string;
          nombre: string;
          rol: 'super_admin' | 'admin' | 'editor';
          activo: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['user_profiles']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['user_profiles']['Insert']>;
      };
      configuracion_cms: {
        Row: {
          id: string;
          clave: string;
          valor: string | null;
          tipo: 'texto' | 'numero' | 'boolean' | 'json';
          descripcion: string | null;
          editable: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['configuracion_cms']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['configuracion_cms']['Insert']>;
      };
    };
  };
}

class SupabaseService {
  private supabase: SupabaseClient;
  private serviceRoleClient: SupabaseClient;

  constructor() {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    const serviceRoleKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Missing Supabase configuration');
    }

    // Client for public operations
    this.supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Service role client for admin operations
    if (serviceRoleKey) {
      this.serviceRoleClient = createClient(supabaseUrl, serviceRoleKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      });
    }
  }

  // Authentication
  async signIn(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  }

  async signUp(email: string, password: string, name: string, role: 'admin' | 'editor' = 'admin') {
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role,
        },
      },
    });

    if (error) throw error;
    return data;
  }

  async signOut() {
    const { error } = await this.supabase.auth.signOut();
    if (error) throw error;
  }

  async getCurrentUser(): Promise<User | null> {
    const { data: { user } } = await this.supabase.auth.getUser();
    return user;
  }

  async getUserProfile(userId: string) {
    const { data, error } = await this.supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  async updateUserProfile(userId: string, updates: Partial<Database['public']['Tables']['user_profiles']['Update']>) {
    const { data, error } = await this.supabase
      .from('user_profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Categories
  async getCategories() {
    const { data, error } = await this.supabase
      .from('categorias')
      .select('*')
      .order('nombre_categoria');

    if (error) throw error;
    return data;
  }

  async createCategory(category: Database['public']['Tables']['categorias']['Insert']) {
    const { data, error } = await this.supabase
      .from('categorias')
      .insert(category)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateCategory(id: string, updates: Database['public']['Tables']['categorias']['Update']) {
    const { data, error } = await this.supabase
      .from('categorias')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteCategory(id: string) {
    const { error } = await this.supabase
      .from('categorias')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // Projects
  async getProjects(options: {
    page?: number;
    limit?: number;
    category?: string;
    featured?: boolean;
    search?: string;
  } = {}) {
    let query = this.supabase
      .from('proyectos')
      .select(`
        *,
        categorias (
          nombre_categoria,
          slug
        )
      `);

    if (options.category) {
      query = query.eq('categorias.slug', options.category);
    }

    if (options.featured !== undefined) {
      query = query.eq('destacado', options.featured);
    }

    if (options.search) {
      query = query.or(`titulo.ilike.%${options.search}%,descripcion.ilike.%${options.search}%,cliente.ilike.%${options.search}%`);
    }

    const { data, error, count } = await query
      .order('fecha_fin', { ascending: false })
      .order('created_at', { ascending: false })
      .range(
        (options.page! - 1) * options.limit!,
        options.page! * options.limit! - 1
      );

    if (error) throw error;

    return {
      data: data || [],
      pagination: {
        current_page: options.page || 1,
        per_page: options.limit || 10,
        total: count || 0,
        total_pages: Math.ceil((count || 0) / (options.limit || 10)),
        has_next: (options.page || 1) * (options.limit || 10) < (count || 0),
        has_prev: (options.page || 1) > 1,
      },
    };
  }

  async getProject(id: string) {
    const { data, error } = await this.supabase
      .from('proyectos')
      .select(`
        *,
        categorias (
          nombre_categoria,
          slug
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  async createProject(project: Database['public']['Tables']['proyectos']['Insert']) {
    const { data, error } = await this.supabase
      .from('proyectos')
      .insert(project)
      .select(`
        *,
        categorias (
          nombre_categoria,
          slug
        )
      `)
      .single();

    if (error) throw error;
    return data;
  }

  async updateProject(id: string, updates: Database['public']['Tables']['proyectos']['Update']) {
    const { data, error } = await this.supabase
      .from('proyectos')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        categorias (
          nombre_categoria,
          slug
        )
      `)
      .single();

    if (error) throw error;
    return data;
  }

  async deleteProject(id: string) {
    const { error } = await this.supabase
      .from('proyectos')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // Services
  async getServices(activeOnly: boolean = true) {
    let query = this.supabase
      .from('servicios')
      .select('*')
      .order('orden', { ascending: true })
      .order('titulo', { ascending: true });

    if (activeOnly) {
      query = query.eq('estado', 'activo');
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  async createService(service: Database['public']['Tables']['servicios']['Insert']) {
    const { data, error } = await this.supabase
      .from('servicios')
      .insert(service)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateService(id: string, updates: Database['public']['Tables']['servicios']['Update']) {
    const { data, error } = await this.supabase
      .from('servicios')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteService(id: string) {
    const { error } = await this.supabase
      .from('servicios')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // Testimonials
  async getTestimonials(activeOnly: boolean = true, limit?: number) {
    let query = this.supabase
      .from('testimonios')
      .select('*')
      .order('created_at', { ascending: false });

    if (activeOnly) {
      query = query.eq('estado', 'activo');
    }

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  async createTestimonial(testimonial: Database['public']['Tables']['testimonios']['Insert']) {
    const { data, error } = await this.supabase
      .from('testimonios')
      .insert(testimonial)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateTestimonial(id: string, updates: Database['public']['Tables']['testimonios']['Update']) {
    const { data, error } = await this.supabase
      .from('testimonios')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteTestimonial(id: string) {
    const { error } = await this.supabase
      .from('testimonios')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // Leads
  async getLeads(options: {
    page?: number;
    limit?: number;
    status?: string;
    service?: string;
    search?: string;
    dateFrom?: string;
    dateTo?: string;
  } = {}) {
    let query = this.supabase
      .from('leads')
      .select(`
        *,
        servicios (
          titulo
        )
      `, { count: 'exact' });

    if (options.status) {
      query = query.eq('estado_gestion', options.status);
    }

    if (options.service) {
      query = query.eq('servicio_id', options.service);
    }

    if (options.search) {
      query = query.or(`nombre.ilike.%${options.search}%,correo.ilike.%${options.search}%,telefono.ilike.%${options.search}%`);
    }

    if (options.dateFrom) {
      query = query.gte('fecha_registro', options.dateFrom);
    }

    if (options.dateTo) {
      query = query.lte('fecha_registro', options.dateTo);
    }

    const { data, error, count } = await query
      .order('fecha_registro', { ascending: false })
      .range(
        (options.page! - 1) * options.limit!,
        options.page! * options.limit! - 1
      );

    if (error) throw error;

    return {
      data: data || [],
      pagination: {
        current_page: options.page || 1,
        per_page: options.limit || 20,
        total: count || 0,
        total_pages: Math.ceil((count || 0) / (options.limit || 20)),
        has_next: (options.page || 1) * (options.limit || 20) < (count || 0),
        has_prev: (options.page || 1) > 1,
      },
    };
  }

  async createLead(lead: Database['public']['Tables']['leads']['Insert']) {
    const { data, error } = await this.supabase
      .from('leads')
      .insert(lead)
      .select(`
        *,
        servicios (
          titulo
        )
      `)
      .single();

    if (error) throw error;
    return data;
  }

  async updateLeadStatus(id: string, status: 'nuevo' | 'contactado' | 'cerrado') {
    const { data, error } = await this.supabase
      .from('leads')
      .update({ estado_gestion: status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteLead(id: string) {
    const { error } = await this.supabase
      .from('leads')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // Configuration
  async getConfig() {
    const { data, error } = await this.supabase
      .from('configuracion_cms')
      .select('clave, valor, tipo')
      .eq('editable', true);

    if (error) throw error;

    // Convert to key-value object
    const config: Record<string, any> = {};
    data.forEach(item => {
      config[item.clave] = item.tipo === 'boolean' 
        ? item.valor === 'true'
        : item.tipo === 'numero'
        ? parseFloat(item.valor || '0')
        : item.valor;
    });

    return config;
  }

  // Dashboard Statistics
  async getDashboardStats() {
    const { data, error } = await this.supabase
      .rpc('get_dashboard_statistics');

    if (error) throw error;
    return data;
  }

  // File Upload
  async uploadFile(file: File, bucket: string = 'images') {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${bucket}/${fileName}`;

    const { data, error } = await this.supabase.storage
      .from(bucket)
      .upload(filePath, file);

    if (error) throw error;

    const { data: { publicUrl } } = this.supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return {
      path: filePath,
      url: publicUrl,
    };
  }

  // Auth state listener
  onAuthStateChange(callback: (event: string, session: any) => void) {
    return this.supabase.auth.onAuthStateChange(callback);
  }
}

// Create and export singleton instance
export const supabaseService = new SupabaseService();

export default supabaseService;
