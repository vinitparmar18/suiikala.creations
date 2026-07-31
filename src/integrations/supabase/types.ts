export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      addresses: {
        Row: {
          city: string
          country: string
          created_at: string
          id: string
          is_default: boolean
          label: string | null
          line1: string
          line2: string | null
          name: string
          phone: string
          pincode: string
          state: string
          user_id: string
        }
        Insert: {
          city: string
          country?: string
          created_at?: string
          id?: string
          is_default?: boolean
          label?: string | null
          line1: string
          line2?: string | null
          name: string
          phone: string
          pincode: string
          state: string
          user_id: string
        }
        Update: {
          city?: string
          country?: string
          created_at?: string
          id?: string
          is_default?: boolean
          label?: string | null
          line1?: string
          line2?: string | null
          name?: string
          phone?: string
          pincode?: string
          state?: string
          user_id?: string
        }
        Relationships: []
      }
      banners: {
        Row: {
          active: boolean
          created_at: string
          id: string
          image: string | null
          link: string | null
          position: string
          sort_order: number
          subtitle: string | null
          title: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          image?: string | null
          link?: string | null
          position?: string
          sort_order?: number
          subtitle?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          image?: string | null
          link?: string | null
          position?: string
          sort_order?: number
          subtitle?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          active: boolean
          created_at: string
          description: string | null
          id: string
          image: string | null
          name: string
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          description?: string | null
          id?: string
          image?: string | null
          name: string
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          description?: string | null
          id?: string
          image?: string | null
          name?: string
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      coupons: {
        Row: {
          active: boolean
          code: string
          created_at: string
          discount_percent: number
          min_subtotal: number
        }
        Insert: {
          active?: boolean
          code: string
          created_at?: string
          discount_percent: number
          min_subtotal?: number
        }
        Update: {
          active?: boolean
          code?: string
          created_at?: string
          discount_percent?: number
          min_subtotal?: number
        }
        Relationships: []
      }
      order_items: {
        Row: {
          id: string
          image: string | null
          name: string
          order_id: string
          price: number
          product_slug: string
          qty: number
        }
        Insert: {
          id?: string
          image?: string | null
          name: string
          order_id: string
          price: number
          product_slug: string
          qty: number
        }
        Update: {
          id?: string
          image?: string | null
          name?: string
          order_id?: string
          price?: number
          product_slug?: string
          qty?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_status_history: {
        Row: {
          created_at: string
          id: string
          note: string | null
          order_id: string
          status: string
        }
        Insert: {
          created_at?: string
          id?: string
          note?: string | null
          order_id: string
          status: string
        }
        Update: {
          created_at?: string
          id?: string
          note?: string | null
          order_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_status_history_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          coupon_code: string | null
          created_at: string
          discount: number
          id: string
          notes: string | null
          order_number: string
          payment_method: string
          payment_status: string
          razorpay_order_id: string | null
          razorpay_payment_id: string | null
          shipping: number
          shipping_address: Json
          status: string
          subtotal: number
          tax: number
          total: number
          updated_at: string
          user_id: string
        }
        Insert: {
          coupon_code?: string | null
          created_at?: string
          discount?: number
          id?: string
          notes?: string | null
          order_number?: string
          payment_method: string
          payment_status?: string
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          shipping?: number
          shipping_address: Json
          status?: string
          subtotal: number
          tax?: number
          total: number
          updated_at?: string
          user_id: string
        }
        Update: {
          coupon_code?: string | null
          created_at?: string
          discount?: number
          id?: string
          notes?: string | null
          order_number?: string
          payment_method?: string
          payment_status?: string
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          shipping?: number
          shipping_address?: Json
          status?: string
          subtotal?: number
          tax?: number
          total?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      product_variants: {
        Row: {
          created_at: string
          id: string
          name: string
          price: number | null
          product_id: string
          sku: string | null
          stock: number
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          price?: number | null
          product_id: string
          sku?: string | null
          stock?: number
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          price?: number | null
          product_id?: string
          sku?: string | null
          stock?: number
        }
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          active: boolean
          badge: string | null
          category: string | null
          collection: string | null
          compare_at: number | null
          created_at: string
          description: string | null
          featured: boolean
          id: string
          image: string | null
          images: Json
          material: string | null
          name: string
          new_launch: boolean
          price: number
          rating: number
          review_count: number
          seo_description: string | null
          seo_title: string | null
          slug: string
          stock: number
          tagline: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          badge?: string | null
          category?: string | null
          collection?: string | null
          compare_at?: number | null
          created_at?: string
          description?: string | null
          featured?: boolean
          id?: string
          image?: string | null
          images?: Json
          material?: string | null
          name: string
          new_launch?: boolean
          price?: number
          rating?: number
          review_count?: number
          seo_description?: string | null
          seo_title?: string | null
          slug: string
          stock?: number
          tagline?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          badge?: string | null
          category?: string | null
          collection?: string | null
          compare_at?: number | null
          created_at?: string
          description?: string | null
          featured?: boolean
          id?: string
          image?: string | null
          images?: Json
          material?: string | null
          name?: string
          new_launch?: boolean
          price?: number
          rating?: number
          review_count?: number
          seo_description?: string | null
          seo_title?: string | null
          slug?: string
          stock?: number
          tagline?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          approved: boolean
          body: string | null
          created_at: string
          id: string
          order_id: string | null
          product_slug: string
          rating: number
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          approved?: boolean
          body?: string | null
          created_at?: string
          id?: string
          order_id?: string | null
          product_slug: string
          rating: number
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          approved?: boolean
          body?: string | null
          created_at?: string
          id?: string
          order_id?: string | null
          product_slug?: string
          rating?: number
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      store_settings: {
        Row: {
          contact_email: string | null
          contact_phone: string | null
          currency: string
          facebook_url: string | null
          free_shipping_min: number
          gst_number: string | null
          gst_rate: number
          id: number
          instagram_url: string | null
          notif_order_email: boolean
          notif_ship_email: boolean
          payment_cod_enabled: boolean
          payment_razorpay_enabled: boolean
          return_policy: string | null
          seo_description: string | null
          seo_title: string | null
          shipping_express: number
          shipping_policy: string | null
          shipping_standard: number
          store_name: string
          twitter_url: string | null
          updated_at: string
          whatsapp_number: string | null
        }
        Insert: {
          contact_email?: string | null
          contact_phone?: string | null
          currency?: string
          facebook_url?: string | null
          free_shipping_min?: number
          gst_number?: string | null
          gst_rate?: number
          id?: number
          instagram_url?: string | null
          notif_order_email?: boolean
          notif_ship_email?: boolean
          payment_cod_enabled?: boolean
          payment_razorpay_enabled?: boolean
          return_policy?: string | null
          seo_description?: string | null
          seo_title?: string | null
          shipping_express?: number
          shipping_policy?: string | null
          shipping_standard?: number
          store_name?: string
          twitter_url?: string | null
          updated_at?: string
          whatsapp_number?: string | null
        }
        Update: {
          contact_email?: string | null
          contact_phone?: string | null
          currency?: string
          facebook_url?: string | null
          free_shipping_min?: number
          gst_number?: string | null
          gst_rate?: number
          id?: number
          instagram_url?: string | null
          notif_order_email?: boolean
          notif_ship_email?: boolean
          payment_cod_enabled?: boolean
          payment_razorpay_enabled?: boolean
          return_policy?: string | null
          seo_description?: string | null
          seo_title?: string | null
          shipping_express?: number
          shipping_policy?: string | null
          shipping_standard?: number
          store_name?: string
          twitter_url?: string | null
          updated_at?: string
          whatsapp_number?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "customer"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "customer"],
    },
  },
} as const
