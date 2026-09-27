import { supabase } from './supabase';

export type EventRecord = {
  id: string;
  event_code: string;
  title: string;
  start_time: string;
  end_time: string;
  created_by: string | null;
  created_at: string;
};

export type EventInput = {
  event_code: string;
  title: string;
  start_time: string;
  end_time: string;
};

export async function createEvent(event: EventInput): Promise<EventRecord> {
  const { data, error } = await supabase
    .from('events')
    .insert({
      ...event,
      created_by: (await supabase.auth.getUser()).data.user?.id ?? null,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data as EventRecord;
}

export async function getEvents(): Promise<EventRecord[]> {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []) as EventRecord[];
}

export async function getEventByCode(eventCode: string): Promise<EventRecord | null> {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('event_code', eventCode)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data as EventRecord | null;
}
