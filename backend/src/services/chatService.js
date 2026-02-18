import { supabase } from '../db.js';

const MOCK_AI_REPLY = 'Please consult your dentist for proper diagnosis.';

export async function getChatHistory(userId, patientId) {
  const { data, error } = await supabase
    .from('chats')
    .select('id, role, content, created_at')
    .eq('user_id', userId)
    .eq('patient_id', patientId)
    .order('created_at', { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function sendMessage(userId, patientId, message) {
  const { error: err1 } = await supabase
    .from('chats')
    .insert({ user_id: userId, patient_id: patientId, role: 'user', content: message });
  if (err1) throw new Error(err1.message);

  const { data: aiRow, error: err2 } = await supabase
    .from('chats')
    .insert({
      user_id: userId,
      patient_id: patientId,
      role: 'assistant',
      content: MOCK_AI_REPLY,
    })
    .select('id, role, content, created_at')
    .single();
  if (err2) throw new Error(err2.message);
  return aiRow;
}
