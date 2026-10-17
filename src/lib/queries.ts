import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const unwrap = <T,>(r: { data: T | null; error: unknown }) => {
  if (r.error) throw r.error;
  return r.data as T;
};

export const profilesQuery = queryOptions({
  queryKey: ["profiles"],
  queryFn: async () => unwrap(await supabase.from("profiles").select("*").order("grad_year", { ascending: false })),
});

export const profileQuery = (id: string) =>
  queryOptions({
    queryKey: ["profile", id],
    queryFn: async () => unwrap(await supabase.from("profiles").select("*").eq("id", id).maybeSingle()),
  });

export const connectionsQuery = queryOptions({
  queryKey: ["connections"],
  queryFn: async () => unwrap(await supabase.from("connections").select("*")),
});

export const jobsQuery = queryOptions({
  queryKey: ["jobs"],
  queryFn: async () => unwrap(await supabase.from("jobs").select("*").order("created_at", { ascending: false })),
});

export const tasksQuery = queryOptions({
  queryKey: ["tasks"],
  queryFn: async () => unwrap(await supabase.from("microtasks").select("*").order("created_at", { ascending: false })),
});

export const fundsQuery = queryOptions({
  queryKey: ["funds"],
  queryFn: async () => unwrap(await supabase.from("funds").select("*").order("sort")),
});

export const updatesQuery = queryOptions({
  queryKey: ["updates"],
  queryFn: async () => unwrap(await supabase.from("updates").select("*").order("created_at", { ascending: false })),
});

export const fmtMoney = (n: number, cur = "INR") =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: cur, maximumFractionDigits: 0 }).format(n);

export const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
