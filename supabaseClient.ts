import { createClient } from "@supabase/supabase-js";
import Constants from "expo-constants";

// Works on both Expo Go and EAS builds
const extra = (Constants.expoConfig ?? Constants)?.extra as {
    supabaseUrl: string;
    supabaseAnonKey: string;
};

export const supabase = createClient(extra.supabaseUrl, extra.supabaseAnonKey);
