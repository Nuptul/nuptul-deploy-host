export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      accommodation_categories: {
        Row: {
          created_at: string | null
          description: string | null
          display_order: number | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      accommodation_options: {
        Row: {
          address: string | null
          amenities: string[] | null
          area: string | null
          booking_url: string | null
          category_id: string | null
          coordinates: number[] | null
          created_at: string | null
          description: string | null
          display_order: number | null
          distance_from_venue: string | null
          email: string | null
          featured: boolean | null
          id: string
          image_url: string | null
          is_active: boolean | null
          metadata: Json | null
          name: string
          phone: string | null
          price_range: string | null
          type: string | null
          updated_at: string | null
          website_url: string | null
        }
        Insert: {
          address?: string | null
          amenities?: string[] | null
          area?: string | null
          booking_url?: string | null
          category_id?: string | null
          coordinates?: number[] | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          distance_from_venue?: string | null
          email?: string | null
          featured?: boolean | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          metadata?: Json | null
          name: string
          phone?: string | null
          price_range?: string | null
          type?: string | null
          updated_at?: string | null
          website_url?: string | null
        }
        Update: {
          address?: string | null
          amenities?: string[] | null
          area?: string | null
          booking_url?: string | null
          category_id?: string | null
          coordinates?: number[] | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          distance_from_venue?: string | null
          email?: string | null
          featured?: boolean | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          metadata?: Json | null
          name?: string
          phone?: string | null
          price_range?: string | null
          type?: string | null
          updated_at?: string | null
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "accommodation_options_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "accommodation_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      app_settings: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_public: boolean | null
          setting_key: string
          setting_type: string | null
          setting_value: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          setting_key: string
          setting_type?: string | null
          setting_value?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          setting_key?: string
          setting_type?: string | null
          setting_value?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      bus_seat_bookings: {
        Row: {
          booking_status: string | null
          contact_phone: string | null
          created_at: string | null
          id: string
          passenger_name: string
          seat_number: number | null
          special_requirements: string | null
          transportation_schedule_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          booking_status?: string | null
          contact_phone?: string | null
          created_at?: string | null
          id?: string
          passenger_name: string
          seat_number?: number | null
          special_requirements?: string | null
          transportation_schedule_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          booking_status?: string | null
          contact_phone?: string | null
          created_at?: string | null
          id?: string
          passenger_name?: string
          seat_number?: number | null
          special_requirements?: string | null
          transportation_schedule_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bus_seat_bookings_transportation_schedule_id_fkey"
            columns: ["transportation_schedule_id"]
            isOneToOne: false
            referencedRelation: "transportation_schedules"
            referencedColumns: ["id"]
          },
        ]
      }
      carpool_coordination: {
        Row: {
          available_seats: number | null
          contact_phone: string | null
          contact_preferences: string | null
          coordination_type: string | null
          created_at: string | null
          departure_location: string | null
          departure_time: string | null
          id: string
          special_requirements: string | null
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          available_seats?: number | null
          contact_phone?: string | null
          contact_preferences?: string | null
          coordination_type?: string | null
          created_at?: string | null
          departure_location?: string | null
          departure_time?: string | null
          id?: string
          special_requirements?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          available_seats?: number | null
          contact_phone?: string | null
          contact_preferences?: string | null
          coordination_type?: string | null
          created_at?: string | null
          departure_location?: string | null
          departure_time?: string | null
          id?: string
          special_requirements?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      carpool_participants: {
        Row: {
          carpool_id: string | null
          contact_phone: string | null
          created_at: string | null
          id: string
          participant_user_id: string | null
          passenger_name: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          carpool_id?: string | null
          contact_phone?: string | null
          created_at?: string | null
          id?: string
          participant_user_id?: string | null
          passenger_name: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          carpool_id?: string | null
          contact_phone?: string | null
          created_at?: string | null
          id?: string
          participant_user_id?: string | null
          passenger_name?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "carpool_participants_carpool_id_fkey"
            columns: ["carpool_id"]
            isOneToOne: false
            referencedRelation: "carpool_coordination"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_members: {
        Row: {
          chat_id: string
          id: string
          joined_at: string
          left_at: string | null
          user_id: string
        }
        Insert: {
          chat_id: string
          id?: string
          joined_at?: string
          left_at?: string | null
          user_id: string
        }
        Update: {
          chat_id?: string
          id?: string
          joined_at?: string
          left_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_members_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "direct_chats"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          chat_id: string
          content: string | null
          created_at: string
          file_url: string | null
          id: string
          is_read: boolean
          media_thumbnail: string | null
          media_type: string | null
          media_url: string | null
          message_type: string | null
          recipient_id: string | null
          sender_id: string | null
          user_id: string
        }
        Insert: {
          chat_id: string
          content?: string | null
          created_at?: string
          file_url?: string | null
          id?: string
          is_read?: boolean
          media_thumbnail?: string | null
          media_type?: string | null
          media_url?: string | null
          message_type?: string | null
          recipient_id?: string | null
          sender_id?: string | null
          user_id: string
        }
        Update: {
          chat_id?: string
          content?: string | null
          created_at?: string
          file_url?: string | null
          id?: string
          is_read?: boolean
          media_thumbnail?: string | null
          media_type?: string | null
          media_url?: string | null
          message_type?: string | null
          recipient_id?: string | null
          sender_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "direct_chats"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_categories: {
        Row: {
          category_name: string
          created_at: string | null
          description: string | null
          display_order: number | null
          icon: string | null
          id: string
          is_active: boolean | null
          updated_at: string | null
        }
        Insert: {
          category_name: string
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          updated_at?: string | null
        }
        Update: {
          category_name?: string
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      contact_details: {
        Row: {
          address: string | null
          availability_hours: string | null
          category_id: string | null
          contact_type: string
          created_at: string | null
          display_order: number | null
          email_primary: string | null
          email_secondary: string | null
          emergency_contact: boolean | null
          featured: boolean | null
          id: string
          instructions: string | null
          is_active: boolean | null
          metadata: Json | null
          name: string
          phone_primary: string | null
          phone_secondary: string | null
          role: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          availability_hours?: string | null
          category_id?: string | null
          contact_type: string
          created_at?: string | null
          display_order?: number | null
          email_primary?: string | null
          email_secondary?: string | null
          emergency_contact?: boolean | null
          featured?: boolean | null
          id?: string
          instructions?: string | null
          is_active?: boolean | null
          metadata?: Json | null
          name: string
          phone_primary?: string | null
          phone_secondary?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          availability_hours?: string | null
          category_id?: string | null
          contact_type?: string
          created_at?: string | null
          display_order?: number | null
          email_primary?: string | null
          email_secondary?: string | null
          emergency_contact?: boolean | null
          featured?: boolean | null
          id?: string
          instructions?: string | null
          is_active?: boolean | null
          metadata?: Json | null
          name?: string
          phone_primary?: string | null
          phone_secondary?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contact_details_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "contact_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      content_blocks: {
        Row: {
          content: string | null
          content_type: string | null
          created_at: string | null
          display_order: number | null
          id: string
          is_active: boolean | null
          metadata: Json | null
          page_slug: string
          section_key: string
          title: string | null
          updated_at: string | null
        }
        Insert: {
          content?: string | null
          content_type?: string | null
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          page_slug: string
          section_key: string
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          content?: string | null
          content_type?: string | null
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          page_slug?: string
          section_key?: string
          title?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      conversation_settings: {
        Row: {
          chat_id: string
          id: string
          is_archived: boolean
          is_important: boolean
          is_muted: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          chat_id: string
          id?: string
          is_archived?: boolean
          is_important?: boolean
          is_muted?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          chat_id?: string
          id?: string
          is_archived?: boolean
          is_important?: boolean
          is_muted?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_settings_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "direct_chats"
            referencedColumns: ["id"]
          },
        ]
      }
      dietary_requirements: {
        Row: {
          created_at: string
          custom_requirement: string | null
          dietary_option_id: string | null
          id: string
          notes: string | null
          rsvp_id: string
          severity: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          custom_requirement?: string | null
          dietary_option_id?: string | null
          id?: string
          notes?: string | null
          rsvp_id: string
          severity?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          custom_requirement?: string | null
          dietary_option_id?: string | null
          id?: string
          notes?: string | null
          rsvp_id?: string
          severity?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "dietary_requirements_rsvp_id_fkey"
            columns: ["rsvp_id"]
            isOneToOne: false
            referencedRelation: "rsvps"
            referencedColumns: ["id"]
          },
        ]
      }
      direct_chats: {
        Row: {
          created_at: string
          created_by: string
          id: string
          is_group: boolean
          title: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          is_group?: boolean
          title?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          is_group?: boolean
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      faq_categories: {
        Row: {
          created_at: string
          description: string | null
          display_order: number
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      faq_items: {
        Row: {
          answer: string
          category_id: string | null
          created_at: string
          display_order: number
          id: string
          is_active: boolean | null
          is_featured: boolean | null
          question: string
          updated_at: string
          view_count: number | null
        }
        Insert: {
          answer: string
          category_id?: string | null
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          question: string
          updated_at?: string
          view_count?: number | null
        }
        Update: {
          answer?: string
          category_id?: string | null
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          question?: string
          updated_at?: string
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "faq_items_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "faq_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      faqs: {
        Row: {
          answer: string
          category: string | null
          created_at: string | null
          display_order: number | null
          id: string
          is_active: boolean | null
          is_featured: boolean | null
          question: string
          updated_at: string | null
        }
        Insert: {
          answer: string
          category?: string | null
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          question: string
          updated_at?: string | null
        }
        Update: {
          answer?: string
          category?: string | null
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          question?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      gallery_photos: {
        Row: {
          backstory: string | null
          created_at: string
          display_order: number
          id: string
          image_path: string
          image_url: string
          is_published: boolean
          title: string | null
          updated_at: string
        }
        Insert: {
          backstory?: string | null
          created_at?: string
          display_order?: number
          id?: string
          image_path: string
          image_url: string
          is_published?: boolean
          title?: string | null
          updated_at?: string
        }
        Update: {
          backstory?: string | null
          created_at?: string
          display_order?: number
          id?: string
          image_path?: string
          image_url?: string
          is_published?: boolean
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      gift_registry: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_purchased: boolean | null
          price: number | null
          priority: number | null
          purchased_at: string | null
          purchased_by: string | null
          store_url: string | null
          title: string
          updated_at: string
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_purchased?: boolean | null
          price?: number | null
          priority?: number | null
          purchased_at?: string | null
          purchased_by?: string | null
          store_url?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_purchased?: boolean | null
          price?: number | null
          priority?: number | null
          purchased_at?: string | null
          purchased_by?: string | null
          store_url?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "gift_registry_purchased_by_fkey"
            columns: ["purchased_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      gift_registry_redirects: {
        Row: {
          button_text: string | null
          created_at: string | null
          display_order: number | null
          featured: boolean | null
          id: string
          is_active: boolean | null
          metadata: Json | null
          redirect_url: string
          service_description: string | null
          service_name: string
          updated_at: string | null
        }
        Insert: {
          button_text?: string | null
          created_at?: string | null
          display_order?: number | null
          featured?: boolean | null
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          redirect_url: string
          service_description?: string | null
          service_name: string
          updated_at?: string | null
        }
        Update: {
          button_text?: string | null
          created_at?: string | null
          display_order?: number | null
          featured?: boolean | null
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          redirect_url?: string
          service_description?: string | null
          service_name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      guest_transport_status: {
        Row: {
          created_at: string | null
          id: string
          last_reminder_sent: string | null
          notes: string | null
          status: string | null
          transport_details: Json | null
          transport_method: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          last_reminder_sent?: string | null
          notes?: string | null
          status?: string | null
          transport_details?: Json | null
          transport_method?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          last_reminder_sent?: string | null
          notes?: string | null
          status?: string | null
          transport_details?: Json | null
          transport_method?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      guests: {
        Row: {
          category: string
          created_at: string
          guest_count: number
          guest_names: string
          id: string
          invite_sent: boolean | null
          location: string | null
          mobile: string | null
          notes: string | null
          rsvp_count: number | null
          rsvp_status: string | null
          save_the_date_sent: boolean | null
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          guest_count?: number
          guest_names: string
          id?: string
          invite_sent?: boolean | null
          location?: string | null
          mobile?: string | null
          notes?: string | null
          rsvp_count?: number | null
          rsvp_status?: string | null
          save_the_date_sent?: boolean | null
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          guest_count?: number
          guest_names?: string
          id?: string
          invite_sent?: boolean | null
          location?: string | null
          mobile?: string | null
          notes?: string | null
          rsvp_count?: number | null
          rsvp_status?: string | null
          save_the_date_sent?: boolean | null
          updated_at?: string
        }
        Relationships: []
      }
      message_likes: {
        Row: {
          created_at: string
          id: string
          message_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_likes_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      message_reactions: {
        Row: {
          created_at: string
          id: string
          message_id: string
          reaction_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message_id: string
          reaction_type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message_id?: string
          reaction_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_reactions_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "chat_messages"
            referencedColumns: ["id"]
          },
        ]
      }
      message_replies: {
        Row: {
          chat_id: string
          content: string
          created_at: string
          id: string
          parent_message_id: string
          user_id: string
        }
        Insert: {
          chat_id: string
          content: string
          created_at?: string
          id?: string
          parent_message_id: string
          user_id: string
        }
        Update: {
          chat_id?: string
          content?: string
          created_at?: string
          id?: string
          parent_message_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_replies_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "direct_chats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_replies_parent_message_id_fkey"
            columns: ["parent_message_id"]
            isOneToOne: false
            referencedRelation: "chat_messages"
            referencedColumns: ["id"]
          },
        ]
      }
      message_reports: {
        Row: {
          created_at: string
          id: string
          message_id: string
          report_details: string | null
          report_reason: string
          reported_by: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
        }
        Insert: {
          created_at?: string
          id?: string
          message_id: string
          report_details?: string | null
          report_reason: string
          reported_by: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          id?: string
          message_id?: string
          report_details?: string | null
          report_reason?: string
          reported_by?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_reports_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "chat_messages"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          created_at: string
          id: string
          is_public: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_public?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_public?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      photo_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          photo_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          photo_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          photo_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "photo_comments_photo_id_fkey"
            columns: ["photo_id"]
            isOneToOne: false
            referencedRelation: "photos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "photo_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      photo_gallery: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          display_order: number | null
          id: string
          image_url: string
          is_approved: boolean | null
          is_featured: boolean | null
          metadata: Json | null
          thumbnail_url: string | null
          title: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          image_url: string
          is_approved?: boolean | null
          is_featured?: boolean | null
          metadata?: Json | null
          thumbnail_url?: string | null
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          image_url?: string
          is_approved?: boolean | null
          is_featured?: boolean | null
          metadata?: Json | null
          thumbnail_url?: string | null
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      photo_likes: {
        Row: {
          created_at: string
          id: string
          photo_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          photo_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          photo_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "photo_likes_photo_id_fkey"
            columns: ["photo_id"]
            isOneToOne: false
            referencedRelation: "photos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "photo_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      photos: {
        Row: {
          created_at: string
          description: string | null
          file_path: string
          file_size: number | null
          file_url: string
          height: number | null
          id: string
          is_approved: boolean | null
          mime_type: string | null
          title: string | null
          updated_at: string
          user_id: string
          width: number | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          file_path: string
          file_size?: number | null
          file_url: string
          height?: number | null
          id?: string
          is_approved?: boolean | null
          mime_type?: string | null
          title?: string | null
          updated_at?: string
          user_id: string
          width?: number | null
        }
        Update: {
          created_at?: string
          description?: string | null
          file_path?: string
          file_size?: number | null
          file_url?: string
          height?: number | null
          id?: string
          is_approved?: boolean | null
          mime_type?: string | null
          title?: string | null
          updated_at?: string
          user_id?: string
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "photos_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      poll_notifications: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string | null
          notification_type: string
          poll_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string | null
          notification_type: string
          poll_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string | null
          notification_type?: string
          poll_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "poll_notifications_poll_id_fkey"
            columns: ["poll_id"]
            isOneToOne: false
            referencedRelation: "polls"
            referencedColumns: ["id"]
          },
        ]
      }
      poll_options: {
        Row: {
          created_at: string
          id: string
          option_order: number
          option_text: string
          poll_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          option_order?: number
          option_text: string
          poll_id: string
        }
        Update: {
          created_at?: string
          id?: string
          option_order?: number
          option_text?: string
          poll_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "poll_options_poll_id_fkey"
            columns: ["poll_id"]
            isOneToOne: false
            referencedRelation: "polls"
            referencedColumns: ["id"]
          },
        ]
      }
      poll_votes: {
        Row: {
          created_at: string
          id: string
          option_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          option_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          option_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "poll_votes_option_id_fkey"
            columns: ["option_id"]
            isOneToOne: false
            referencedRelation: "poll_options"
            referencedColumns: ["id"]
          },
        ]
      }
      polls: {
        Row: {
          allow_multiple_selections: boolean | null
          anonymous_voting: boolean | null
          created_at: string
          expires_at: string | null
          id: string
          poll_status: Database["public"]["Enums"]["poll_status"] | null
          poll_type: Database["public"]["Enums"]["poll_type"] | null
          post_id: string
          question: string
          settings: Json | null
          updated_at: string | null
          vote_count: number | null
        }
        Insert: {
          allow_multiple_selections?: boolean | null
          anonymous_voting?: boolean | null
          created_at?: string
          expires_at?: string | null
          id?: string
          poll_status?: Database["public"]["Enums"]["poll_status"] | null
          poll_type?: Database["public"]["Enums"]["poll_type"] | null
          post_id: string
          question: string
          settings?: Json | null
          updated_at?: string | null
          vote_count?: number | null
        }
        Update: {
          allow_multiple_selections?: boolean | null
          anonymous_voting?: boolean | null
          created_at?: string
          expires_at?: string | null
          id?: string
          poll_status?: Database["public"]["Enums"]["poll_status"] | null
          poll_type?: Database["public"]["Enums"]["poll_type"] | null
          post_id?: string
          question?: string
          settings?: Json | null
          updated_at?: string | null
          vote_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "polls_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "social_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      post_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          parent_id: string | null
          post_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          parent_id?: string | null
          post_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          parent_id?: string | null
          post_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "post_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "social_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      post_reactions: {
        Row: {
          created_at: string
          id: string
          post_id: string
          reaction_type: Database["public"]["Enums"]["reaction_type"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          reaction_type: Database["public"]["Enums"]["reaction_type"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          reaction_type?: Database["public"]["Enums"]["reaction_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_reactions_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "social_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address: string | null
          avatar_url: string | null
          country: string | null
          created_at: string
          display_name: string | null
          email: string
          first_name: string | null
          has_plus_one: boolean | null
          id: string
          last_name: string | null
          mobile: string | null
          phone: string | null
          plus_one_email: string | null
          plus_one_invited: boolean | null
          plus_one_name: string | null
          postcode: string | null
          rsvp_completed: boolean | null
          state: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          country?: string | null
          created_at?: string
          display_name?: string | null
          email: string
          first_name?: string | null
          has_plus_one?: boolean | null
          id?: string
          last_name?: string | null
          mobile?: string | null
          phone?: string | null
          plus_one_email?: string | null
          plus_one_invited?: boolean | null
          plus_one_name?: string | null
          postcode?: string | null
          rsvp_completed?: boolean | null
          state?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          country?: string | null
          created_at?: string
          display_name?: string | null
          email?: string
          first_name?: string | null
          has_plus_one?: boolean | null
          id?: string
          last_name?: string | null
          mobile?: string | null
          phone?: string | null
          plus_one_email?: string | null
          plus_one_invited?: boolean | null
          plus_one_name?: string | null
          postcode?: string | null
          rsvp_completed?: boolean | null
          state?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      rsvps: {
        Row: {
          accommodation_needed: boolean | null
          created_at: string
          dietary_restrictions: string | null
          event_id: string
          guest_count: number | null
          id: string
          meal_preference: string | null
          message: string | null
          plus_one_name: string | null
          song_request: string | null
          status: string
          table_assignment: string | null
          transportation_needed: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          accommodation_needed?: boolean | null
          created_at?: string
          dietary_restrictions?: string | null
          event_id: string
          guest_count?: number | null
          id?: string
          meal_preference?: string | null
          message?: string | null
          plus_one_name?: string | null
          song_request?: string | null
          status: string
          table_assignment?: string | null
          transportation_needed?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          accommodation_needed?: boolean | null
          created_at?: string
          dietary_restrictions?: string | null
          event_id?: string
          guest_count?: number | null
          id?: string
          meal_preference?: string | null
          message?: string | null
          plus_one_name?: string | null
          song_request?: string | null
          status?: string
          table_assignment?: string | null
          transportation_needed?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rsvps_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "event_attendance_summary"
            referencedColumns: ["event_id"]
          },
          {
            foreignKeyName: "rsvps_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "wedding_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rsvps_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      social_feed: {
        Row: {
          content: string
          created_at: string | null
          id: string
          image_url: string | null
          is_approved: boolean | null
          is_pinned: boolean | null
          like_count: number | null
          post_type: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          image_url?: string | null
          is_approved?: boolean | null
          is_pinned?: boolean | null
          like_count?: number | null
          post_type?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          image_url?: string | null
          is_approved?: boolean | null
          is_pinned?: boolean | null
          like_count?: number | null
          post_type?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      social_feed_likes: {
        Row: {
          created_at: string | null
          id: string
          post_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          post_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          post_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "social_feed_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "social_feed"
            referencedColumns: ["id"]
          },
        ]
      }
      social_posts: {
        Row: {
          content: string | null
          created_at: string
          id: string
          is_published: boolean
          media_thumbnail: string | null
          media_type: string | null
          media_url: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          id?: string
          is_published?: boolean
          media_thumbnail?: string | null
          media_type?: string | null
          media_url?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string | null
          created_at?: string
          id?: string
          is_published?: boolean
          media_thumbnail?: string | null
          media_type?: string | null
          media_url?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "social_posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      stories: {
        Row: {
          created_at: string
          duration: number | null
          expires_at: string
          id: string
          media_thumbnail: string | null
          media_type: string
          media_url: string
          user_id: string
        }
        Insert: {
          created_at?: string
          duration?: number | null
          expires_at?: string
          id?: string
          media_thumbnail?: string | null
          media_type: string
          media_url: string
          user_id: string
        }
        Update: {
          created_at?: string
          duration?: number | null
          expires_at?: string
          id?: string
          media_thumbnail?: string | null
          media_type?: string
          media_url?: string
          user_id?: string
        }
        Relationships: []
      }
      transportation_categories: {
        Row: {
          created_at: string | null
          description: string | null
          display_order: number | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      transportation_options: {
        Row: {
          booking_phone: string | null
          booking_required: boolean | null
          booking_url: string | null
          capacity_info: string | null
          category_id: string | null
          cost_info: string | null
          created_at: string | null
          description: string | null
          display_order: number | null
          dropoff_locations: string[] | null
          duration_info: string | null
          featured: boolean | null
          id: string
          is_active: boolean | null
          metadata: Json | null
          method_name: string
          pickup_locations: string[] | null
          schedule_info: string | null
          special_notes: string | null
          updated_at: string | null
        }
        Insert: {
          booking_phone?: string | null
          booking_required?: boolean | null
          booking_url?: string | null
          capacity_info?: string | null
          category_id?: string | null
          cost_info?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          dropoff_locations?: string[] | null
          duration_info?: string | null
          featured?: boolean | null
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          method_name: string
          pickup_locations?: string[] | null
          schedule_info?: string | null
          special_notes?: string | null
          updated_at?: string | null
        }
        Update: {
          booking_phone?: string | null
          booking_required?: boolean | null
          booking_url?: string | null
          capacity_info?: string | null
          category_id?: string | null
          cost_info?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          dropoff_locations?: string[] | null
          duration_info?: string | null
          featured?: boolean | null
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          method_name?: string
          pickup_locations?: string[] | null
          schedule_info?: string | null
          special_notes?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transportation_options_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "transportation_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      transportation_schedules: {
        Row: {
          arrival_location: string | null
          arrival_time: string | null
          available_dates: string[] | null
          created_at: string | null
          current_bookings: number | null
          departure_location: string | null
          departure_time: string
          id: string
          is_active: boolean | null
          max_capacity: number | null
          notes: string | null
          transportation_id: string | null
          updated_at: string | null
        }
        Insert: {
          arrival_location?: string | null
          arrival_time?: string | null
          available_dates?: string[] | null
          created_at?: string | null
          current_bookings?: number | null
          departure_location?: string | null
          departure_time: string
          id?: string
          is_active?: boolean | null
          max_capacity?: number | null
          notes?: string | null
          transportation_id?: string | null
          updated_at?: string | null
        }
        Update: {
          arrival_location?: string | null
          arrival_time?: string | null
          available_dates?: string[] | null
          created_at?: string | null
          current_bookings?: number | null
          departure_location?: string | null
          departure_time?: string
          id?: string
          is_active?: boolean | null
          max_capacity?: number | null
          notes?: string | null
          transportation_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transportation_schedules_transportation_id_fkey"
            columns: ["transportation_id"]
            isOneToOne: false
            referencedRelation: "transportation_options"
            referencedColumns: ["id"]
          },
        ]
      }
      user_blocks: {
        Row: {
          blocked_at: string
          blocked_user_id: string
          id: string
          user_id: string
        }
        Insert: {
          blocked_at?: string
          blocked_user_id: string
          id?: string
          user_id: string
        }
        Update: {
          blocked_at?: string
          blocked_user_id?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          id: string
          name: string | null
          phone: string | null
          role: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          id?: string
          name?: string | null
          phone?: string | null
          role?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          id?: string
          name?: string | null
          phone?: string | null
          role?: string | null
          updated_at?: string | null
          user_id?: string | null
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
      venue_images: {
        Row: {
          created_at: string
          description: string | null
          file_size: number | null
          height: number | null
          id: string
          image_order: number
          image_path: string
          image_type: string
          image_url: string
          is_published: boolean
          mime_type: string | null
          title: string | null
          updated_at: string
          venue_id: string
          width: number | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          file_size?: number | null
          height?: number | null
          id?: string
          image_order?: number
          image_path: string
          image_type?: string
          image_url: string
          is_published?: boolean
          mime_type?: string | null
          title?: string | null
          updated_at?: string
          venue_id: string
          width?: number | null
        }
        Update: {
          created_at?: string
          description?: string | null
          file_size?: number | null
          height?: number | null
          id?: string
          image_order?: number
          image_path?: string
          image_type?: string
          image_url?: string
          is_published?: boolean
          mime_type?: string | null
          title?: string | null
          updated_at?: string
          venue_id?: string
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "venue_images_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
      }
      venues: {
        Row: {
          address: string | null
          caption: string | null
          created_at: string
          display_order: number
          id: string
          image_path: string
          image_url: string
          name: string
          quick_facts: Json | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          caption?: string | null
          created_at?: string
          display_order?: number
          id?: string
          image_path: string
          image_url: string
          name: string
          quick_facts?: Json | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          caption?: string | null
          created_at?: string
          display_order?: number
          id?: string
          image_path?: string
          image_url?: string
          name?: string
          quick_facts?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      wedding_events: {
        Row: {
          address: string | null
          created_at: string
          description: string | null
          display_order: number | null
          dress_code: string | null
          end_time: string | null
          event_date: string
          id: string
          is_active: boolean | null
          is_main_event: boolean | null
          location: string | null
          max_guests: number | null
          metadata: Json | null
          name: string | null
          notes: string | null
          requires_rsvp: boolean | null
          start_time: string | null
          title: string
          updated_at: string
          venue_address: string | null
          venue_coordinates: number[] | null
          venue_name: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string
          description?: string | null
          display_order?: number | null
          dress_code?: string | null
          end_time?: string | null
          event_date: string
          id?: string
          is_active?: boolean | null
          is_main_event?: boolean | null
          location?: string | null
          max_guests?: number | null
          metadata?: Json | null
          name?: string | null
          notes?: string | null
          requires_rsvp?: boolean | null
          start_time?: string | null
          title: string
          updated_at?: string
          venue_address?: string | null
          venue_coordinates?: number[] | null
          venue_name?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string
          description?: string | null
          display_order?: number | null
          dress_code?: string | null
          end_time?: string | null
          event_date?: string
          id?: string
          is_active?: boolean | null
          is_main_event?: boolean | null
          location?: string | null
          max_guests?: number | null
          metadata?: Json | null
          name?: string | null
          notes?: string | null
          requires_rsvp?: boolean | null
          start_time?: string | null
          title?: string
          updated_at?: string
          venue_address?: string | null
          venue_coordinates?: number[] | null
          venue_name?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      event_attendance_summary: {
        Row: {
          attending_count: number | null
          declined_count: number | null
          event_date: string | null
          event_id: string | null
          event_name: string | null
          max_guests: number | null
          maybe_count: number | null
          pending_count: number | null
          remaining_capacity: number | null
          total_attending_guests: number | null
          total_rsvps: number | null
          venue_name: string | null
        }
        Relationships: []
      }
      faq_with_categories: {
        Row: {
          answer: string | null
          category_description: string | null
          category_icon: string | null
          category_id: string | null
          category_name: string | null
          category_slug: string | null
          created_at: string | null
          display_order: number | null
          id: string | null
          is_active: boolean | null
          is_featured: boolean | null
          question: string | null
          updated_at: string | null
          view_count: number | null
        }
        Relationships: [
          {
            foreignKeyName: "faq_items_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "faq_categories"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      get_featured_faqs: {
        Args: { limit_count?: number }
        Returns: {
          id: string
          question: string
          answer: string
          category_name: string
          category_icon: string
        }[]
      }
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
      increment_faq_view: {
        Args: { faq_id: string }
        Returns: undefined
      }
      increment_faq_view_count: {
        Args: { faq_id: string }
        Returns: undefined
      }
      is_chat_member: {
        Args: { chat_uuid: string; user_uuid: string }
        Returns: boolean
      }
      safe_upsert_rsvp: {
        Args:
          | {
              p_user_id: string
              p_event_id: string
              p_status: string
              p_guest_count?: number
              p_dietary_restrictions?: string
              p_message?: string
              p_plus_one_name?: string
            }
          | {
              p_user_id: string
              p_event_id: string
              p_status: string
              p_guest_count?: number
              p_dietary_restrictions?: string
              p_message?: string
              p_plus_one_name?: string
              p_table_assignment?: string
              p_meal_preference?: string
              p_song_request?: string
              p_accommodation_needed?: boolean
              p_transportation_needed?: boolean
            }
        Returns: string
      }
    }
    Enums: {
      app_role: "guest" | "admin" | "couple"
      poll_status: "active" | "closed" | "draft"
      poll_type: "multiple_choice" | "yes_no" | "rating"
      reaction_type: "like" | "love" | "laugh" | "wow" | "sad" | "angry"
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
      app_role: ["guest", "admin", "couple"],
      poll_status: ["active", "closed", "draft"],
      poll_type: ["multiple_choice", "yes_no", "rating"],
      reaction_type: ["like", "love", "laugh", "wow", "sad", "angry"],
    },
  },
} as const
