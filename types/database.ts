// Type ini adalah cermin manual dari database/01_schema.sql.
// Idealnya di-generate otomatis via: supabase gen types typescript
// (caranya dijelaskan lengkap di README.md bagian "Update Types Database").
// Untuk sekarang ditulis manual supaya development bisa mulai tanpa
// menunggu Supabase project benar-benar online.

export type UserRole = 'student' | 'teacher' | 'admin' | 'super_admin';
export type UserGender = 'male' | 'female';
export type StudentStatus = 'active' | 'alumni' | 'inactive';
export type AssetStatus = 'available' | 'pending' | 'borrowed' | 'maintenance';
export type AssetCondition = 'good' | 'minor_damage' | 'major_damage' | 'lost';
export type LoanStatus =
  | 'pending_approval'
  | 'approved'
  | 'rejected'
  | 'return_requested'
  | 'returned'
  | 'cancelled';
export type AtkRequestStatus = 'pending_approval' | 'approved' | 'rejected' | 'fulfilled';
export type AcademicYearStatus = 'draft' | 'active' | 'archived';
export type SchoolInfoCategory = 'denah' | 'luas_tanah' | 'tata_ruang' | 'daftar_ruangan';

// supabase-js versi terbaru mewajibkan setiap tabel punya field `Relationships`
// (dipakai untuk type-safe nested select). Karena project ini menulis query
// embed secara manual dan selalu memberi tipe eksplisit lewat `.returns<T>()`,
// kita tidak memanfaatkan auto-inference relasi tsb — cukup suntik array
// kosong ke semua tabel lewat helper generik ini, tanpa perlu mengetik ulang
// setiap definisi tabel di bawah.
type WithRelationships<T extends Record<string, { Row: object; Insert: object; Update: object }>> = {
  [K in keyof T]: T[K] & { Relationships: [] };
};

export interface Database {
  public: {
    Tables: WithRelationships<{
      profiles: {
        Row: {
          id: string;
          full_name: string;
          role: UserRole;
          gender: UserGender;
          avatar_url: string | null;
          phone: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          role?: UserRole;
          gender: UserGender;
          avatar_url?: string | null;
          phone?: string | null;
        };
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
      };
      academic_years: {
        Row: {
          id: string;
          label: string;
          status: AcademicYearStatus;
          started_at: string | null;
          ended_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          label: string;
          status?: AcademicYearStatus;
          started_at?: string | null;
          ended_at?: string | null;
        };
        Update: Partial<Database['public']['Tables']['academic_years']['Insert']>;
      };
      classes: {
        Row: {
          id: string;
          name: string;
          grade_level: 10 | 11 | 12;
          major: string | null;
          academic_year_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          grade_level: 10 | 11 | 12;
          major?: string | null;
          academic_year_id: string;
        };
        Update: Partial<Database['public']['Tables']['classes']['Insert']>;
      };
      students: {
        Row: {
          profile_id: string;
          class_id: string | null;
          nisn: string | null;
          status: StudentStatus;
          graduated_at: string | null;
          created_at: string;
        };
        Insert: {
          profile_id: string;
          class_id?: string | null;
          nisn?: string | null;
          status?: StudentStatus;
        };
        Update: Partial<Database['public']['Tables']['students']['Insert']>;
      };
      asset_categories: {
        Row: { id: string; name: string; created_at: string };
        Insert: { id?: string; name: string };
        Update: Partial<Database['public']['Tables']['asset_categories']['Insert']>;
      };
      assets: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          category_id: string | null;
          image_url: string | null;
          location: string | null;
          total_stock: number;
          available_stock: number;
          status: AssetStatus;
          is_deleted: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          category_id?: string | null;
          image_url?: string | null;
          location?: string | null;
          total_stock: number;
          available_stock: number;
          status?: AssetStatus;
        };
        Update: Partial<Database['public']['Tables']['assets']['Insert']> & { is_deleted?: boolean };
      };
      atk_items: {
        Row: {
          id: string;
          name: string;
          image_url: string | null;
          stock: number;
          unit: string;
          is_deleted: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          image_url?: string | null;
          stock: number;
          unit?: string;
        };
        Update: Partial<Database['public']['Tables']['atk_items']['Insert']> & { is_deleted?: boolean };
      };
      loans: {
        Row: {
          id: string;
          borrower_id: string;
          academic_year_id: string;
          status: LoanStatus;
          notes: string | null;
          rejected_reason: string | null;
          approved_by: string | null;
          approved_at: string | null;
          returned_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          borrower_id: string;
          academic_year_id: string;
          status?: LoanStatus;
          notes?: string | null;
        };
        Update: Partial<Database['public']['Tables']['loans']['Insert']> & {
          rejected_reason?: string | null;
          approved_by?: string | null;
          approved_at?: string | null;
          returned_at?: string | null;
        };
      };
      loan_items: {
        Row: {
          id: string;
          loan_id: string;
          asset_id: string;
          quantity: number;
          condition_on_return: AssetCondition | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          loan_id: string;
          asset_id: string;
          quantity: number;
        };
        Update: Partial<Database['public']['Tables']['loan_items']['Insert']> & {
          condition_on_return?: AssetCondition | null;
        };
      };
      atk_requests: {
        Row: {
          id: string;
          requester_id: string;
          academic_year_id: string;
          status: AtkRequestStatus;
          rejected_reason: string | null;
          approved_by: string | null;
          approved_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          requester_id: string;
          academic_year_id: string;
          status?: AtkRequestStatus;
        };
        Update: Partial<Database['public']['Tables']['atk_requests']['Insert']> & {
          rejected_reason?: string | null;
          approved_by?: string | null;
          approved_at?: string | null;
        };
      };
      atk_request_items: {
        Row: { id: string; request_id: string; atk_item_id: string; quantity: number };
        Insert: { id?: string; request_id: string; atk_item_id: string; quantity: number };
        Update: Partial<Database['public']['Tables']['atk_request_items']['Insert']>;
      };
      activity_logs: {
        Row: {
          id: string;
          actor_id: string | null;
          action: string;
          target_type: string;
          target_id: string;
          academic_year_id: string | null;
          metadata: Record<string, unknown>;
          created_at: string;
        };
        Insert: never; // Tabel ini HANYA diisi lewat trigger database, bukan dari client.
        Update: never;
      };
      school_information: {
        Row: {
          id: string;
          title: string;
          category: SchoolInfoCategory;
          image_url: string;
          description: string | null;
          display_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          category: SchoolInfoCategory;
          image_url: string;
          description?: string | null;
          display_order?: number;
        };
        Update: Partial<Database['public']['Tables']['school_information']['Insert']>;
      };
      system_settings: {
        Row: { key: string; value: unknown; updated_at: string };
        Insert: { key: string; value: unknown };
        Update: { value: unknown };
      };
      stock_opname_sessions: {
        Row: {
          id: string;
          conducted_by: string;
          academic_year_id: string;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          conducted_by: string;
          academic_year_id: string;
          notes?: string | null;
        };
        Update: Partial<Database['public']['Tables']['stock_opname_sessions']['Insert']>;
      };
      stock_opname_items: {
        Row: {
          id: string;
          session_id: string;
          asset_id: string | null;
          atk_item_id: string | null;
          system_stock: number;
          physical_stock: number;
          discrepancy: number;
        };
        Insert: {
          id?: string;
          session_id: string;
          asset_id?: string | null;
          atk_item_id?: string | null;
          system_stock: number;
          physical_stock: number;
        };
        Update: Partial<Database['public']['Tables']['stock_opname_items']['Insert']>;
      };
    }>;
    Views: Record<string, never>;
    Functions: {
      promote_academic_year: {
        Args: { new_academic_year_id: string };
        Returns: undefined;
      };
      current_user_role: {
        Args: Record<string, never>;
        Returns: UserRole;
      };
      is_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      log_maintenance_toggle: {
        Args: { is_active: boolean; custom_message: string | null; ends_at: string | null };
        Returns: undefined;
      };
      is_login_rate_limited: {
        Args: { p_email: string };
        Returns: boolean;
      };
      record_failed_login: {
        Args: { p_email: string };
        Returns: undefined;
      };
      clear_login_attempts: {
        Args: { p_email: string };
        Returns: undefined;
      };
    };
  };
}
