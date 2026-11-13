export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      categories: {
        Row: {
          created_at: string;
          description: string | null;
          id: string;
          name: string;
          slug: string;
          sort_order: number;
          updated_at: string;
        };
        ComputedFields: never;
        Insert: {
          created_at?: string;
          description?: string | null;
          id?: string;
          name: string;
          slug: string;
          sort_order?: number;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          id?: string;
          name?: string;
          slug?: string;
          sort_order?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      delivery_zone_states: {
        Row: {
          state: string;
          zone_id: string;
        };
        ComputedFields: never;
        Insert: {
          state: string;
          zone_id: string;
        };
        Update: {
          state?: string;
          zone_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "delivery_zone_states_zone_id_fkey";
            columns: ["zone_id"];
            isOneToOne: false;
            referencedRelation: "delivery_zones";
            referencedColumns: ["id"];
          },
        ];
      };
      delivery_zones: {
        Row: {
          created_at: string;
          fee: number;
          free_over: number | null;
          id: string;
          is_active: boolean;
          max_days: number;
          min_days: number;
          name: string;
          sort_order: number;
          updated_at: string;
        };
        ComputedFields: never;
        Insert: {
          created_at?: string;
          fee: number;
          free_over?: number | null;
          id?: string;
          is_active?: boolean;
          max_days: number;
          min_days: number;
          name: string;
          sort_order?: number;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          fee?: number;
          free_over?: number | null;
          id?: string;
          is_active?: boolean;
          max_days?: number;
          min_days?: number;
          name?: string;
          sort_order?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      order_events: {
        Row: {
          created_at: string;
          created_by: string | null;
          id: number;
          is_internal: boolean;
          message: string;
          order_id: string;
          status: Database["public"]["Enums"]["order_status"] | null;
        };
        ComputedFields: never;
        Insert: {
          created_at?: string;
          created_by?: string | null;
          id?: never;
          is_internal?: boolean;
          message: string;
          order_id: string;
          status?: Database["public"]["Enums"]["order_status"] | null;
        };
        Update: {
          created_at?: string;
          created_by?: string | null;
          id?: never;
          is_internal?: boolean;
          message?: string;
          order_id?: string;
          status?: Database["public"]["Enums"]["order_status"] | null;
        };
        Relationships: [
          {
            foreignKeyName: "order_events_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
        ];
      };
      order_items: {
        Row: {
          color_name: string | null;
          created_at: string;
          id: string;
          image_path: string | null;
          line_total: number | null;
          order_id: string;
          product_id: string;
          product_name: string;
          product_slug: string;
          quantity: number;
          size: string;
          unit_price: number;
          variant_id: string;
        };
        ComputedFields: never;
        Insert: {
          color_name?: string | null;
          created_at?: string;
          id?: string;
          image_path?: string | null;
          line_total?: never;
          order_id: string;
          product_id: string;
          product_name: string;
          product_slug: string;
          quantity: number;
          size: string;
          unit_price: number;
          variant_id: string;
        };
        Update: {
          color_name?: string | null;
          created_at?: string;
          id?: string;
          image_path?: string | null;
          line_total?: never;
          order_id?: string;
          product_id?: string;
          product_name?: string;
          product_slug?: string;
          quantity?: number;
          size?: string;
          unit_price?: number;
          variant_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "order_items_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "order_items_variant_id_fkey";
            columns: ["variant_id"];
            isOneToOne: false;
            referencedRelation: "product_variants";
            referencedColumns: ["id"];
          },
        ];
      };
      orders: {
        Row: {
          access_token: string;
          address_line1: string | null;
          address_line2: string | null;
          carrier: string | null;
          city: string | null;
          created_at: string;
          currency: string;
          delivery_fee: number;
          delivery_note: string | null;
          delivery_zone_id: string | null;
          discount_total: number;
          email: string;
          fulfillment: Database["public"]["Enums"]["fulfillment_method"];
          full_name: string;
          id: string;
          needs_review: boolean;
          number: string;
          paid_at: string | null;
          payment_reference: string;
          phone: string;
          pickup_location_id: string | null;
          reserved_until: string | null;
          review_reason: string | null;
          state: string | null;
          status: Database["public"]["Enums"]["order_status"];
          subtotal: number;
          total: number;
          tracking_number: string | null;
          updated_at: string;
          user_id: string | null;
        };
        ComputedFields: never;
        Insert: {
          access_token?: string;
          address_line1?: string | null;
          address_line2?: string | null;
          carrier?: string | null;
          city?: string | null;
          created_at?: string;
          currency?: string;
          delivery_fee: number;
          delivery_note?: string | null;
          delivery_zone_id?: string | null;
          discount_total?: number;
          email: string;
          fulfillment: Database["public"]["Enums"]["fulfillment_method"];
          full_name: string;
          id?: string;
          needs_review?: boolean;
          number?: string;
          paid_at?: string | null;
          payment_reference: string;
          phone: string;
          pickup_location_id?: string | null;
          reserved_until?: string | null;
          review_reason?: string | null;
          state?: string | null;
          status?: Database["public"]["Enums"]["order_status"];
          subtotal: number;
          total: number;
          tracking_number?: string | null;
          updated_at?: string;
          user_id?: string | null;
        };
        Update: {
          access_token?: string;
          address_line1?: string | null;
          address_line2?: string | null;
          carrier?: string | null;
          city?: string | null;
          created_at?: string;
          currency?: string;
          delivery_fee?: number;
          delivery_note?: string | null;
          delivery_zone_id?: string | null;
          discount_total?: number;
          email?: string;
          fulfillment?: Database["public"]["Enums"]["fulfillment_method"];
          full_name?: string;
          id?: string;
          needs_review?: boolean;
          number?: string;
          paid_at?: string | null;
          payment_reference?: string;
          phone?: string;
          pickup_location_id?: string | null;
          reserved_until?: string | null;
          review_reason?: string | null;
          state?: string | null;
          status?: Database["public"]["Enums"]["order_status"];
          subtotal?: number;
          total?: number;
          tracking_number?: string | null;
          updated_at?: string;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "orders_delivery_zone_id_fkey";
            columns: ["delivery_zone_id"];
            isOneToOne: false;
            referencedRelation: "delivery_zones";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "orders_pickup_location_id_fkey";
            columns: ["pickup_location_id"];
            isOneToOne: false;
            referencedRelation: "pickup_locations";
            referencedColumns: ["id"];
          },
        ];
      };
      payment_events: {
        Row: {
          event: string;
          id: number;
          payload: NonNullable<Json>;
          provider: string;
          received_at: string;
          reference: string | null;
        };
        ComputedFields: never;
        Insert: {
          event: string;
          id?: never;
          payload: NonNullable<Json>;
          provider?: string;
          received_at?: string;
          reference?: string | null;
        };
        Update: {
          event?: string;
          id?: never;
          payload?: NonNullable<Json>;
          provider?: string;
          received_at?: string;
          reference?: string | null;
        };
        Relationships: [];
      };
      pickup_locations: {
        Row: {
          address: string;
          city: string;
          created_at: string;
          hours: string | null;
          id: string;
          instructions: string | null;
          is_active: boolean;
          name: string;
          sort_order: number;
          state: string;
          updated_at: string;
        };
        ComputedFields: never;
        Insert: {
          address: string;
          city: string;
          created_at?: string;
          hours?: string | null;
          id?: string;
          instructions?: string | null;
          is_active?: boolean;
          name: string;
          sort_order?: number;
          state: string;
          updated_at?: string;
        };
        Update: {
          address?: string;
          city?: string;
          created_at?: string;
          hours?: string | null;
          id?: string;
          instructions?: string | null;
          is_active?: boolean;
          name?: string;
          sort_order?: number;
          state?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      product_images: {
        Row: {
          alt: string;
          created_at: string;
          height: number | null;
          id: string;
          path: string;
          product_id: string;
          sort_order: number;
          width: number | null;
        };
        ComputedFields: never;
        Insert: {
          alt?: string;
          created_at?: string;
          height?: number | null;
          id?: string;
          path: string;
          product_id: string;
          sort_order?: number;
          width?: number | null;
        };
        Update: {
          alt?: string;
          created_at?: string;
          height?: number | null;
          id?: string;
          path?: string;
          product_id?: string;
          sort_order?: number;
          width?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      product_variants: {
        Row: {
          created_at: string;
          id: string;
          product_id: string;
          size: string;
          sku: string | null;
          sort_order: number;
          stock: number;
          updated_at: string;
        };
        ComputedFields: never;
        Insert: {
          created_at?: string;
          id?: string;
          product_id: string;
          size: string;
          sku?: string | null;
          sort_order?: number;
          stock?: number;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          product_id?: string;
          size?: string;
          sku?: string | null;
          sort_order?: number;
          stock?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      products: {
        Row: {
          category_id: string;
          color_hex: string | null;
          color_name: string | null;
          compare_at_price: number | null;
          created_at: string;
          description: string;
          details: string[];
          id: string;
          is_featured: boolean;
          name: string;
          price: number;
          published_at: string | null;
          search: unknown;
          slug: string;
          sort_order: number;
          status: Database["public"]["Enums"]["product_status"];
          style_code: string | null;
          updated_at: string;
        };
        ComputedFields: never;
        Insert: {
          category_id: string;
          color_hex?: string | null;
          color_name?: string | null;
          compare_at_price?: number | null;
          created_at?: string;
          description?: string;
          details?: string[];
          id?: string;
          is_featured?: boolean;
          name: string;
          price: number;
          published_at?: string | null;
          search?: never;
          slug: string;
          sort_order?: number;
          status?: Database["public"]["Enums"]["product_status"];
          style_code?: string | null;
          updated_at?: string;
        };
        Update: {
          category_id?: string;
          color_hex?: string | null;
          color_name?: string | null;
          compare_at_price?: number | null;
          created_at?: string;
          description?: string;
          details?: string[];
          id?: string;
          is_featured?: boolean;
          name?: string;
          price?: number;
          published_at?: string | null;
          search?: never;
          slug?: string;
          sort_order?: number;
          status?: Database["public"]["Enums"]["product_status"];
          style_code?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          created_at: string;
          email: string;
          full_name: string | null;
          id: string;
          phone: string | null;
          role: Database["public"]["Enums"]["user_role"];
          updated_at: string;
        };
        ComputedFields: never;
        Insert: {
          created_at?: string;
          email: string;
          full_name?: string | null;
          id: string;
          phone?: string | null;
          role?: Database["public"]["Enums"]["user_role"];
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          email?: string;
          full_name?: string | null;
          id?: string;
          phone?: string | null;
          role?: Database["public"]["Enums"]["user_role"];
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      cancel_pending_order: { Args: { p_message: string; p_reference: string }; Returns: boolean };
      claim_guest_orders: { Args: Record<PropertyKey, never>; Returns: number };
      confirm_payment: {
        Args: { p_amount: number; p_currency: string; p_paid_at?: string; p_reference: string };
        Returns: {
          newly_flagged: boolean;
          newly_paid: boolean;
          order_id: string;
          order_number: string;
          order_status: Database["public"]["Enums"]["order_status"];
        }[];
      };
      create_order: {
        Args: {
          p_address_line1?: string;
          p_address_line2?: string;
          p_city?: string;
          p_delivery_note?: string;
          p_email: string;
          p_fulfillment: Database["public"]["Enums"]["fulfillment_method"];
          p_full_name: string;
          p_items: Json;
          p_phone: string;
          p_pickup_location_id?: string;
          p_reservation_minutes?: number;
          p_state?: string;
          p_user_id?: string;
        };
        Returns: {
          access_token: string;
          address_line1: string | null;
          address_line2: string | null;
          carrier: string | null;
          city: string | null;
          created_at: string;
          currency: string;
          delivery_fee: number;
          delivery_note: string | null;
          delivery_zone_id: string | null;
          discount_total: number;
          email: string;
          fulfillment: Database["public"]["Enums"]["fulfillment_method"];
          full_name: string;
          id: string;
          needs_review: boolean;
          number: string;
          paid_at: string | null;
          payment_reference: string;
          phone: string;
          pickup_location_id: string | null;
          reserved_until: string | null;
          review_reason: string | null;
          state: string | null;
          status: Database["public"]["Enums"]["order_status"];
          subtotal: number;
          total: number;
          tracking_number: string | null;
          updated_at: string;
          user_id: string | null;
        };
        SetofOptions: {
          from: "*";
          to: "orders";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      is_admin: { Args: Record<PropertyKey, never>; Returns: boolean };
      release_expired_orders: { Args: Record<PropertyKey, never>; Returns: number };
      resolve_order_review: {
        Args: { p_note: string; p_order_id: string };
        Returns: {
          access_token: string;
          address_line1: string | null;
          address_line2: string | null;
          carrier: string | null;
          city: string | null;
          created_at: string;
          currency: string;
          delivery_fee: number;
          delivery_note: string | null;
          delivery_zone_id: string | null;
          discount_total: number;
          email: string;
          fulfillment: Database["public"]["Enums"]["fulfillment_method"];
          full_name: string;
          id: string;
          needs_review: boolean;
          number: string;
          paid_at: string | null;
          payment_reference: string;
          phone: string;
          pickup_location_id: string | null;
          reserved_until: string | null;
          review_reason: string | null;
          state: string | null;
          status: Database["public"]["Enums"]["order_status"];
          subtotal: number;
          total: number;
          tracking_number: string | null;
          updated_at: string;
          user_id: string | null;
        };
        SetofOptions: {
          from: "*";
          to: "orders";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      save_product: { Args: { p_id?: string; p_product: Json; p_variants: Json }; Returns: string };
      update_order_status: {
        Args: {
          p_carrier?: string;
          p_message?: string;
          p_order_id: string;
          p_status: Database["public"]["Enums"]["order_status"];
          p_tracking_number?: string;
        };
        Returns: {
          access_token: string;
          address_line1: string | null;
          address_line2: string | null;
          carrier: string | null;
          city: string | null;
          created_at: string;
          currency: string;
          delivery_fee: number;
          delivery_note: string | null;
          delivery_zone_id: string | null;
          discount_total: number;
          email: string;
          fulfillment: Database["public"]["Enums"]["fulfillment_method"];
          full_name: string;
          id: string;
          needs_review: boolean;
          number: string;
          paid_at: string | null;
          payment_reference: string;
          phone: string;
          pickup_location_id: string | null;
          reserved_until: string | null;
          review_reason: string | null;
          state: string | null;
          status: Database["public"]["Enums"]["order_status"];
          subtotal: number;
          total: number;
          tracking_number: string | null;
          updated_at: string;
          user_id: string | null;
        };
        SetofOptions: {
          from: "*";
          to: "orders";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
    };
    Enums: {
      fulfillment_method: "delivery" | "pickup";
      order_status:
        | "pending_payment"
        | "paid"
        | "processing"
        | "shipped"
        | "delivered"
        | "cancelled"
        | "refunded";
      product_status: "draft" | "active" | "archived";
      user_role: "customer" | "admin";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema["CompositeTypes"] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      fulfillment_method: ["delivery", "pickup"],
      order_status: [
        "pending_payment",
        "paid",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
        "refunded",
      ],
      product_status: ["draft", "active", "archived"],
      user_role: ["customer", "admin"],
    },
  },
} as const;
