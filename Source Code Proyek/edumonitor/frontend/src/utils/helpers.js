export function createInitials(name = '') {
  return String(name)
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export function formatTeacherId(id) {
  const value = String(id)
  return value.startsWith('GRU-') ? value : `GRU-${value.padStart(3, '0')}`
}

export function formatGuardianId(id) {
  const value = String(id)
  return value.startsWith('WLI-') ? value : `WLI-${value.padStart(3, '0')}`
}

export function daysInPeriod(period) {
  if (period === 'Mingguan') return 7
  if (period === 'Bulanan') return 30
  return 180
}

export function scoreFromStatus(status) {
  return status === 'BB' ? 20 : status === 'MB' ? 45 : status === 'BSH' ? 75 : 95
}

export function statusFromScore(score) {
  return score >= 80 ? 'BSB' : score >= 60 ? 'BSH' : 'MB'
}

export function formatDateGroup(dateStr) {
  const today = new Date()
  const parts = dateStr.split('-')
  const date = new Date(+parts[0], +parts[1] - 1, +parts[2])
  const diff = Math.round((today - date) / (1000 * 60 * 60 * 24))

  if (diff === 0) {
    const d = date.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }).toUpperCase()
    return `HARI INI, ${d}`
  }
  if (diff === 1) {
    const d = date.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }).toUpperCase()
    return `KEMARIN, ${d}`
  }
  return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }).toUpperCase()
}

export function getDestination(role) {
  if (role === 'security') return '/security'
  if (role === 'guardian') return '/child-monitoring'
  return '/home'
}

export function getFallbackPath(role) {
  if (role === 'guardian') return '/child-monitoring'
  if (role === 'security') return '/security'
  return '/home'
}

export function roleProfiles() {
  return {
    teacher: { name: 'Bu Maria', title: 'Guru Kelas', initials: 'BM' },
    admin: { name: 'Sarah', title: 'Administrator', initials: 'SA' },
    security: { name: 'Pak Dimas', title: 'Petugas Keamanan', initials: 'PD' },
    guardian: { name: 'Ibu Sari', title: 'Wali Murid', initials: 'IS' },
  }
}
