import { supabase } from '../config/supabase'

const titleMap = {
  teacher: 'Guru',
  admin: 'Administrator',
  guardian: 'Wali Murid',
  security: 'Petugas Keamanan',
}

function makeInitials(name) {
  return String(name)
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n.charAt(0).toUpperCase())
    .join('')
}

async function getUserProfile(userId) {
  if (!supabase) return null
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle()
  if (error) return null
  return data
}

async function ensureProfile(user, userMeta) {
  if (!supabase || !user) return null

  let profile = await getUserProfile(user.id)
  if (profile) return profile

  const meta = userMeta || user.user_metadata || {}
  const { error } = await supabase.from('profiles').insert({
    id: user.id,
    email: user.email,
    name: meta.name || user.email?.split('@')[0] || 'Pengguna',
    role: meta.role || 'teacher',
  })
  if (error) return null

  return await getUserProfile(user.id)
}

function buildUserSession(user, profile) {
  if (!user || !profile) return null

  const meta = user.user_metadata || {}

  return {
    id: profile.id,
    email: user.email,
    role: profile.role,
    name: profile.name,
    title: titleMap[profile.role] || 'Pengguna',
    initials: meta.initials || makeInitials(profile.name),
  }
}

export async function login(email, password) {
  if (!supabase) throw new Error('Supabase belum dikonfigurasi. Isi VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY di .env.local')

  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error || !data?.user) return null

  const profile = await ensureProfile(data.user)
  return buildUserSession(data.user, profile)
}

export async function register({ name, email, password, role }) {
  if (!supabase) throw new Error('Supabase belum dikonfigurasi. Isi VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY di .env.local')

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name, role, initials: makeInitials(name) },
    },
  })
  if (error || !data?.user) return null

  const profile = await ensureProfile(data.user, { name, role })
  return buildUserSession(data.user, profile)
}

export async function getCurrentUser() {
  if (!supabase) return null

  const { data } = await supabase.auth.getSession()
  if (!data?.session?.user) return null

  const profile = await ensureProfile(data.session.user)
  return buildUserSession(data.session.user, profile)
}

export async function logout() {
  if (!supabase) return
  await supabase.auth.signOut()
}

export function getDummyUsers() {
  return [
    { email: 'admin@edumonitor.com', role: 'admin', name: 'Sarah', title: 'Administrator', initials: 'SA' },
    { email: 'teacher@edumonitor.com', role: 'teacher', name: 'Bu Maria', title: 'Guru', initials: 'BM' },
    { email: 'security@edumonitor.com', role: 'security', name: 'Pak Dimas', title: 'Petugas Keamanan', initials: 'PD' },
    { email: 'guardian@edumonitor.com', role: 'guardian', name: 'Ibu Sari', title: 'Wali Murid', initials: 'IS' },
  ]
}
