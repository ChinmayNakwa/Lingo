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
          created_at: string;
        };
        Insert: {
          id?: never;
          word: string;
          phonetic?: string | null;
          audio_url?: string | null;
          meanings: Meaning[];
          created_at?: string;
        };
        Update: {
          id?: never;
          word?: string;
          phonetic?: string | null;
          audio_url?: string | null;
          meanings?: Meaning[];
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
        };
        Insert: {
          user_id?: string;
          word_id: number;
          note?: string | null;
          source?: string | null;
          created_at?: string;
        };
        Update: {
          user_id?: string;
          word_id?: number;
          note?: string | null;
          source?: string | null;
          created_at?: string;
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
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};
