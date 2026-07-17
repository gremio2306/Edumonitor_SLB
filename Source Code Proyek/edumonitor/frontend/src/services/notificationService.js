import { supabase } from '../config/supabase'

export async function getAllNotifications(userId) {
  if (!supabase || !userId) return []
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) {
    console.error('notificationService.getAllNotifications error:', error)
    return []
  }
  return data || []
}

export async function createNotification({ user_id, type, title, body, related_entity_type, related_entity_id }) {
  if (!supabase) return null
  const { data, error } = await supabase
    .from('notifications')
    .insert({
      user_id,
      type,
      title,
      body,
      related_entity_type,
      related_entity_id,
    })
    .select()
    .single()
  if (error) {
    console.error('notificationService.createNotification error:', error)
    return null
  }
  return data
}

export async function markAsRead(id) {
  if (!supabase) return null
  const { data, error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', id)
    .select()
    .single()
  if (error) {
    console.error('notificationService.markAsRead error:', error)
    return null
  }
  return data
}

export async function getAllSecurityUsers() {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('profiles')
    .select('id')
    .eq('role', 'security')
  if (error) {
    console.error('notificationService.getAllSecurityUsers error:', error)
    return []
  }
  return data || []
}
