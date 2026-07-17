import { supabase } from '../config/supabase'

export async function getActivePanicAlerts() {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('active_panic_alerts_view')
    .select('*')
  if (error) {
    console.error('panicService.getActivePanicAlerts error:', error)
    return []
  }
  return data || []
}

export async function createPanicAlert({
  student_id,
  location_name,
  triggered_by,
  triggered_by_name,
  triggered_by_role,
}) {
  if (!supabase) throw new Error('Supabase belum dikonfigurasi')

  if (!triggered_by) {
    throw new Error('triggered_by wajib diisi — pastikan profile user sudah ada di tabel profiles')
  }

  const payload = {
    student_id,
    location: location_name || null,
    triggered_by,
    triggered_by_name,
    triggered_by_role,
    status: 'pending',
  }

  console.log('Insert Panic', payload)

  const { data, error } = await supabase
    .from('panic_alerts')
    .insert(payload)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updatePanicAlertStatus(id, status) {
  if (!supabase) return null

  const updateData = { status }
  if (status === 'resolved') {
    updateData.resolved_at = new Date().toISOString()
  }

  const { data, error } = await supabase
    .from('panic_alerts')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('panicService.updatePanicAlertStatus error:', error)
    return null
  }
  return data
}

export function subscribeToPanicAlerts(onInsert, onUpdate) {
  if (!supabase) return null

  const channel = supabase
    .channel('panic-alerts-realtime')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'panic_alerts' },
      async (payload) => {
        const fullAlert = await fetchFullPanicAlert(payload.new.id)
        if (onInsert) onInsert(fullAlert || payload.new)
      },
    )
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'panic_alerts' },
      async (payload) => {
        const fullAlert = await fetchFullPanicAlert(payload.new.id)
        if (onUpdate) onUpdate(fullAlert || payload.new)
      },
    )
    .subscribe()

  return channel
}

async function fetchFullPanicAlert(id) {
  if (!supabase) return null
  const { data } = await supabase
    .from('active_panic_alerts_view')
    .select('*')
    .eq('id', id)
    .single()
  return data
}
