import { supabase } from '../db.js';

export async function createPatient(userId, data) {
  const { name, email, phone, dob, medical_notes } = data;
  const { data: row, error } = await supabase
    .from('patients')
    .insert({
      user_id: userId,
      name,
      email: email || null,
      phone: phone || null,
      dob: dob || null,
      medical_notes: medical_notes || null,
    })
    .select('id, name, email, phone, dob, medical_notes, created_at, updated_at')
    .single();
  if (error) throw new Error(error.message);
  return row;
}

export async function getPatients(userId, page = 1, limit = 10) {
  const offset = (page - 1) * limit;
  const { count, error: countError } = await supabase
    .from('patients')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);
  if (countError) throw new Error(countError.message);
  const total = count ?? 0;

  const { data: patients, error } = await supabase
    .from('patients')
    .select('id, name, email, phone, dob, medical_notes, created_at, updated_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);
  if (error) throw new Error(error.message);
  return { patients: patients ?? [], total, page, limit };
}

export async function getPatientById(userId, id) {
  const { data, error } = await supabase
    .from('patients')
    .select('id, name, email, phone, dob, medical_notes, created_at, updated_at')
    .eq('id', id)
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}

export async function updatePatient(userId, id, data) {
  const { name, email, phone, dob, medical_notes } = data;
  const { data: row, error } = await supabase
    .from('patients')
    .update({
      name,
      email: email ?? null,
      phone: phone ?? null,
      dob: dob ?? null,
      medical_notes: medical_notes ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('user_id', userId)
    .select('id, name, email, phone, dob, medical_notes, created_at, updated_at')
    .single();
  if (error) throw new Error(error.message);
  return row;
}

export async function deletePatient(userId, id) {
  const { error } = await supabase
    .from('patients')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);
  if (error) throw new Error(error.message);
  return true;
}
