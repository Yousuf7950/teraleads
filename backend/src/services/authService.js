import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { supabase } from '../db.js';

const SALT_ROUNDS = 10;

export async function register(email, password, name) {
  const hashed = await bcrypt.hash(password, SALT_ROUNDS);
  const { data, error } = await supabase
    .from('users')
    .insert({ email, password_hash: hashed, name: name || null })
    .select('id, email, name, created_at')
    .single();
  if (error) {
    const e = new Error(error.message);
    e.code = error.code;
    throw e;
  }
  return data;
}

export async function login(email, password) {
  const { data: user, error } = await supabase
    .from('users')
    .select('id, email, password_hash')
    .eq('email', email)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!user) return null;
  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) return null;
  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
  return { token, user: { id: user.id, email: user.email } };
}
