export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string;
          user_id: string;
          client_name: string;
          project_name: string;
          type: "mobile" | "web" | "mixed" | "other";
          status: "active" | "paused" | "completed" | "maintenance";
          technologies: string[];
          notes: string | null;
          thumbnail_url: string | null;
          contract_value: number | null;
          paid_amount: number;
          payment_status: "paid" | "partial" | "pending";
          domain_expiry: string | null;
          hosting_expiry: string | null;
          last_contact: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          client_name: string;
          project_name: string;
          type?: "mobile" | "web" | "mixed" | "other";
          status?: "active" | "paused" | "completed" | "maintenance";
          technologies?: string[];
          notes?: string | null;
          thumbnail_url?: string | null;
          contract_value?: number | null;
          paid_amount?: number;
          payment_status?: "paid" | "partial" | "pending";
          domain_expiry?: string | null;
          hosting_expiry?: string | null;
          last_contact?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          client_name?: string;
          project_name?: string;
          type?: "mobile" | "web" | "mixed" | "other";
          status?: "active" | "paused" | "completed" | "maintenance";
          technologies?: string[];
          notes?: string | null;
          thumbnail_url?: string | null;
          contract_value?: number | null;
          paid_amount?: number;
          payment_status?: "paid" | "partial" | "pending";
          domain_expiry?: string | null;
          hosting_expiry?: string | null;
          last_contact?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      credentials: {
        Row: {
          id: string;
          user_id: string;
          project_id: string;
          service: string;
          email: string | null;
          password_enc: string;
          iv: string;
          url: string | null;
          plan: string | null;
          extra_enc: string | null;
          extra_iv: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          project_id: string;
          service: string;
          email?: string | null;
          password_enc: string;
          iv: string;
          url?: string | null;
          plan?: string | null;
          extra_enc?: string | null;
          extra_iv?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          project_id?: string;
          service?: string;
          email?: string | null;
          password_enc?: string;
          iv?: string;
          url?: string | null;
          plan?: string | null;
          extra_enc?: string | null;
          extra_iv?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "credentials_project_id_fkey";
            columns: ["project_id"];
            referencedRelation: "projects";
            referencedColumns: ["id"];
          }
        ];
      };
      clients: {
        Row: {
          id: string;
          user_id: string;
          project_id: string;
          phone: string | null;
          whatsapp: string | null;
          email: string | null;
          preferred_contact: "whatsapp" | "email" | "phone" | null;
          personal_notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          project_id: string;
          phone?: string | null;
          whatsapp?: string | null;
          email?: string | null;
          preferred_contact?: "whatsapp" | "email" | "phone" | null;
          personal_notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          project_id?: string;
          phone?: string | null;
          whatsapp?: string | null;
          email?: string | null;
          preferred_contact?: "whatsapp" | "email" | "phone" | null;
          personal_notes?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "clients_project_id_fkey";
            columns: ["project_id"];
            referencedRelation: "projects";
            referencedColumns: ["id"];
          }
        ];
      };
      invoices: {
        Row: {
          id: string;
          user_id: string;
          project_id: string;
          amount: number;
          status: "paid" | "pending" | "overdue";
          due_date: string | null;
          paid_date: string | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          project_id: string;
          amount: number;
          status?: "paid" | "pending" | "overdue";
          due_date?: string | null;
          paid_date?: string | null;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          project_id?: string;
          amount?: number;
          status?: "paid" | "pending" | "overdue";
          due_date?: string | null;
          paid_date?: string | null;
          notes?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "invoices_project_id_fkey";
            columns: ["project_id"];
            referencedRelation: "projects";
            referencedColumns: ["id"];
          }
        ];
      };
      attachments: {
        Row: {
          id: string;
          user_id: string;
          project_id: string;
          file_url: string;
          file_type: "image" | "pdf" | "other";
          file_name: string;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          project_id: string;
          file_url: string;
          file_type?: "image" | "pdf" | "other";
          file_name: string;
          description?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          project_id?: string;
          file_url?: string;
          file_type?: "image" | "pdf" | "other";
          file_name?: string;
          description?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "attachments_project_id_fkey";
            columns: ["project_id"];
            referencedRelation: "projects";
            referencedColumns: ["id"];
          }
        ];
      };
      health_checks: {
        Row: {
          id: string;
          user_id: string;
          project_id: string;
          service: string;
          status: "up" | "down" | "warning";
          last_check: string;
          response_time: number | null;
          notes: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          project_id: string;
          service: string;
          status?: "up" | "down" | "warning";
          last_check?: string;
          response_time?: number | null;
          notes?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          project_id?: string;
          service?: string;
          status?: "up" | "down" | "warning";
          last_check?: string;
          response_time?: number | null;
          notes?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "health_checks_project_id_fkey";
            columns: ["project_id"];
            referencedRelation: "projects";
            referencedColumns: ["id"];
          }
        ];
      };
      activity_log: {
        Row: {
          id: string;
          user_id: string;
          action: string;
          project_id: string | null;
          device: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          action: string;
          project_id?: string | null;
          device?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          action?: string;
          project_id?: string | null;
          device?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "activity_log_project_id_fkey";
            columns: ["project_id"];
            referencedRelation: "projects";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
    CompositeTypes: {};
  };
}
