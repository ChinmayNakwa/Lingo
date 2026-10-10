// Mirrors supabase/migrations. Update both together.

export type Definition = {
  definition: string;
  example?: string;
};

export type Meaning = {
  partOfSpeech: string;
  definitions: Definition[];
  synonyms: string[];
};

export type Database = {
  public: {
    Tables: {
      words: {
        Row: {
          id: number;
          word: string;
          phonetic: string | null;
          audio_url: string | null;
          meanings: Meaning[];
          forms: string[];
          created_at: string;
        };
        Insert: {
          id?: never;
          word: string;
          phonetic?: string | null;
          audio_url?: string | null;
          meanings: Meaning[];
          forms?: string[];
          created_at?: string;
        };
        Update: {
          id?: never;
          word?: string;
          phonetic?: string | null;
          audio_url?: string | null;
          meanings?: Meaning[];
          forms?: string[];
          created_at?: string;
        };
        Relationships: [];
      };
      user_words: {
        Row: {
          user_id: string;
          word_id: number;
          note: string | null;
          source: string | null;
          created_at: string;
          review_box: number;
          next_review_at: string;
          last_reviewed_at: string | null;
          lapses: number;
        };
        Insert: {
          user_id?: string;
          word_id: number;
          note?: string | null;
          source?: string | null;
          created_at?: string;
          review_box?: number;
          next_review_at?: string;
          last_reviewed_at?: string | null;
          lapses?: number;
        };
        Update: {
          user_id?: string;
          word_id?: number;
          note?: string | null;
          source?: string | null;
          created_at?: string;
          review_box?: number;
          next_review_at?: string;
          last_reviewed_at?: string | null;
          lapses?: number;
        };
        Relationships: [
          {
            foreignKeyName: "user_words_word_id_fkey";
            columns: ["word_id"];
            isOneToOne: false;
            referencedRelation: "words";
            referencedColumns: ["id"];
          },
        ];
      };
      sentences: {
        Row: {
          id: number;
          user_id: string;
          word_id: number;
          body: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: never;
          user_id?: string;
          word_id: number;
          body: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: never;
          user_id?: string;
          word_id?: number;
          body?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "sentences_user_id_word_id_fkey";
            columns: ["user_id", "word_id"];
            isOneToOne: true;
            referencedRelation: "user_words";
            referencedColumns: ["user_id", "word_id"];
          },
        ];
      };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};
