import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  MOCK_PROFILES,
  MOCK_JOBS,
  MOCK_MICROTASKS,
  MOCK_FUNDS,
  MOCK_UPDATES,
  MOCK_CONNECTIONS,
  MOCK_NOTABLE,
  MOCK_EVENTS,
  MOCK_MILESTONES,
  MOCK_SOCIETIES,
  MOCK_COMPANIES,
  type Profile,
  type Job,
  type Microtask,
  type Fund,
  type Update,
  type Connection,
  type NotableAlumnus,
  type AlumniEvent,
  type Milestone,
  type Society,
  type CompanyChapter,
} from "./mockData";

import { fetchAllProfiles, fetchAllMicrotasks } from "./supabaseSync";

export const profilesQuery = queryOptions({
  queryKey: ["profiles"],
  queryFn: async (): Promise<Profile[]> => {
    return fetchAllProfiles();
  },
});

export const profileQuery = (id: string) =>
  queryOptions({
    queryKey: ["profile", id],
    queryFn: async (): Promise<Profile | null> => {
      const all = await fetchAllProfiles();
      return all.find((p) => p.id === id) ?? null;
    },
  });

export const connectionsQuery = queryOptions({
  queryKey: ["connections"],
  queryFn: async (): Promise<Connection[]> => {
    try {
      const { data, error } = await supabase.from("connections").select("*");
      if (!error && data && data.length > 0) {
        return data as unknown as Connection[];
      }
    } catch {
      // Fallback
    }
    return MOCK_CONNECTIONS;
  },
});

export const jobsQuery = queryOptions({
  queryKey: ["jobs"],
  queryFn: async (): Promise<Job[]> => {
    try {
      const { data, error } = await supabase.from("jobs").select("*").order("created_at", { ascending: false });
      if (!error && data && data.length > 0) {
        return data as unknown as Job[];
      }
    } catch {
      // Fallback
    }
    return MOCK_JOBS;
  },
});

export const tasksQuery = queryOptions({
  queryKey: ["tasks"],
  queryFn: async (): Promise<Microtask[]> => {
    return fetchAllMicrotasks();
  },
});

export const fundsQuery = queryOptions({
  queryKey: ["funds"],
  queryFn: async (): Promise<Fund[]> => {
    try {
      const { data, error } = await supabase.from("funds").select("*").order("sort");
      if (!error && data && data.length > 0) {
        return data as unknown as Fund[];
      }
    } catch {
      // Fallback
    }
    return MOCK_FUNDS;
  },
});

export const updatesQuery = queryOptions({
  queryKey: ["updates"],
  queryFn: async (): Promise<Update[]> => {
    try {
      const { data, error } = await supabase.from("updates").select("*").order("created_at", { ascending: false });
      if (!error && data && data.length > 0) {
        return data as unknown as Update[];
      }
    } catch {
      // Fallback
    }
    return MOCK_UPDATES;
  },
});

export const notableQuery = queryOptions({
  queryKey: ["notable-alumni"],
  queryFn: async (): Promise<NotableAlumnus[]> => MOCK_NOTABLE,
});

export const eventsQuery = queryOptions({
  queryKey: ["events"],
  queryFn: async (): Promise<AlumniEvent[]> => MOCK_EVENTS,
});

export const milestonesQuery = queryOptions({
  queryKey: ["milestones"],
  queryFn: async (): Promise<Milestone[]> => MOCK_MILESTONES,
});

export const societiesQuery = queryOptions({
  queryKey: ["societies"],
  queryFn: async (): Promise<Society[]> => MOCK_SOCIETIES,
});

export const companiesQuery = queryOptions({
  queryKey: ["company-chapters"],
  queryFn: async (): Promise<CompanyChapter[]> => MOCK_COMPANIES,
});

export const fmtMoney = (n: number, cur = "INR") =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: cur, maximumFractionDigits: 0 }).format(n);

export const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
