import { supabase } from './supabase';

export type AttendanceRecord = {
  id: string;
  student_id: string;
  event_id: string;
  scanned_at: string;
  event_title?: string;
  event_code?: string;
};

export async function registerAttendanceForUser(eventId: string, studentId: string): Promise<{ success: boolean; message: string; eventTitle?: string }> {
  const { error } = await supabase.from('attendance').insert({
    student_id: studentId,
    event_id: eventId,
  });

  if (error) {
    if (error.code === '23505') {
      return {
        success: false,
        message: 'Already registered for this event.',
      };
    }

    throw error;
  }

  return {
    success: true,
    message: 'Attendance recorded!',
  };
}

export async function getMyAttendance(studentId: string): Promise<AttendanceRecord[]> {
  const { data, error } = await supabase
    .from('attendance')
    .select('id, student_id, event_id, scanned_at, events(event_code, title)')
    .eq('student_id', studentId)
    .order('scanned_at', { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []).map((row: any) => ({
    id: row.id,
    student_id: row.student_id,
    event_id: row.event_id,
    scanned_at: row.scanned_at,
    event_title: row.events?.title,
    event_code: row.events?.event_code,
  }));
}
