import { AlertTriangle, ArrowRight, CheckCircle2, Loader2, MapPin, MessageSquareText, Users, X } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../config/supabase'
import { useAuth } from '../context/AuthContext'
import { useApp } from '../context/AppContext'
import * as panicService from '../services/panicService'
import * as notificationService from '../services/notificationService'

export default function EmergencyPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { showToast } = useApp()

  const [students, setStudents] = useState([])
  const [studentsLoading, setStudentsLoading] = useState(true)
  const [selectedStudentId, setSelectedStudentId] = useState('')
  const [note, setNote] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  

  useEffect(() => {
    async function fetchStudents() {
      if (!supabase) {
        setStudentsLoading(false)
        return
      }

      console.log('[EmergencyPage] Fetching students...')

      const { data: studentsData, error: studentsError } = await supabase
        .from('students')
        .select('id, name, class_id')
        .order('name')

      console.log('[EmergencyPage] Students data:', studentsData)
      console.log('[EmergencyPage] Students error:', studentsError)

      if (studentsError) {
        console.error('[EmergencyPage] ERROR:', studentsError.message)
        showToast(studentsError.message, 'error')
        setStudentsLoading(false)
        return
      }

      if (!studentsData || studentsData.length === 0) {
        console.log('[EmergencyPage] No students returned (RLS filtered or empty table)')
        setStudents([])
        setStudentsLoading(false)
        return
      }

      const classIds = [...new Set(studentsData.map(s => s.class_id).filter(Boolean))]
      console.log('[EmergencyPage] Fetching classes for IDs:', classIds)

      const { data: classesData, error: classesError } = await supabase
        .from('classes')
        .select('id, name')
        .in('id', classIds.length > 0 ? classIds : [0])

      console.log('[EmergencyPage] Classes data:', classesData)
      console.log('[EmergencyPage] Classes error:', classesError)

      const classMap = {}
      if (!classesError && classesData) {
        classesData.forEach(c => { classMap[c.id] = c.name })
      }

      setStudents(
        studentsData.map((s) => ({
          id: s.id,
          name: s.name,
          class_name: classMap[s.class_id] || '',
          className: classMap[s.class_id] || '',
        }))
      )
      setStudentsLoading(false)
    }

    fetchStudents()
  }, [showToast])

  if (!user) {
    return (
      <div className="emergency-wrapper">
        <div className="emergency-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
          <span style={{ opacity: 0.6 }}>Memuat data pengguna...</span>
        </div>
      </div>
    )
  }

  console.log('Current User', user)

  const selectedStudent = useMemo(
    () => students.find((s) => String(s.id) === selectedStudentId) || null,
    [students, selectedStudentId],
  )

  const classLocation = selectedStudent?.className || selectedStudent?.class_name || ''

  const sortedStudents = useMemo(
    () => [...students].sort((a, b) => (a.name || '').localeCompare(b.name || '')),
    [students],
  )

  const triggerPanic = useCallback(async () => {
    if (!user?.id || !selectedStudent) return
    setSending(true)

    try {
      const locationValue = classLocation + (note.trim() ? ' — ' + note.trim() : '')
      await panicService.createPanicAlert({
        student_id: selectedStudent.id,
        location_name: locationValue,
        triggered_by: user.id,
        triggered_by_name: user.name,
        triggered_by_role: user.role,
      })

      const securityUsers = await notificationService.getAllSecurityUsers()
      
      for (const sec of securityUsers) {
        await notificationService.createNotification({
          user_id: sec.id,
          type: 'danger',
          title: 'PERINGATAN DARURAT',
          body: `${selectedStudent.name} — ${classLocation}${note.trim() ? ' · ' + note.trim() : ''}`,
          related_entity_type: 'panic_alert',
        })
      }

      showToast('Panic alert berhasil dikirim ke petugas keamanan!')
      setSent(true)
    } catch (err) {
      showToast('Gagal mengirim panic alert: ' + err.message, 'error')
    } finally {
      setSending(false)
    }
  }, [user, selectedStudent, classLocation, note, showToast])

  const hasStudents = students.length > 0
  const canSubmit = selectedStudent && !sending && !sent && hasStudents

  return (
    <div className="emergency-wrapper">
      <div className="emergency-page">
        <button className="emergency-close" onClick={() => navigate(-1)}><X /></button>

        {sent ? (
          <>
            <div className="emergency-symbol" style={{ background: '#22c55e', color: 'white' }}>
              <CheckCircle2 size={50} />
            </div>
            <h1>ALERT TERKIRIM</h1>
            <h2>Petugas keamanan telah diberitahu</h2>

            <div className="emergency-summary-card">
              <div className="emergency-summary-row">
                <Users size={16} />
                <span>{selectedStudent?.name || '-'}</span>
              </div>
              <div className="emergency-summary-row">
                <MapPin size={16} />
                <span>{classLocation || '-'}</span>
              </div>
              {note.trim() && (
                <div className="emergency-summary-row">
                  <MessageSquareText size={16} />
                  <span>{note.trim()}</span>
                </div>
              )}
            </div>

            <button className="emergency-main-action" onClick={() => navigate(-1)}>
              <ArrowRight /> Kembali
            </button>
          </>
        ) : (
          <>
            <div className="emergency-symbol">
              <AlertTriangle size={50} />
            </div>
            <h1>KIRIM PANIC ALERT</h1>
            <h2>Konfirmasi data siswa</h2>

            <div className="emergency-form">
              <label className="emergency-field">
                <span>Pilih Siswa</span>
                {studentsLoading ? (
                  <div style={{ padding: '8px 0', opacity: 0.6 }}>
                    <Loader2 size={16} className="spin" style={{ display: 'inline', marginRight: 6 }} />
                    Memuat data siswa...
                  </div>
                ) : !hasStudents ? (
                  <div style={{ padding: '8px 0', opacity: 0.6 }}>
                    Belum ada data siswa.
                  </div>
                ) : (
                  <select
                    value={selectedStudentId}
                    onChange={(e) => setSelectedStudentId(e.target.value)}
                  >
                    <option value="">— Pilih siswa —</option>
                    {sortedStudents.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                )}
              </label>

              <label className="emergency-field">
                <span>Lokasi Kelas</span>
                <input
                  type="text"
                  value={classLocation}
                  readOnly
                  placeholder="Pilih siswa terlebih dahulu"
                />
              </label>

              <label className="emergency-field">
                <span>Catatan (opsional)</span>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Contoh: Siswa mengalami kejang, Sesak nafas, dll."
                  rows={3}
                />
              </label>
            </div>

            <button
              className="emergency-main-action"
              onClick={triggerPanic}
              disabled={!canSubmit}
            >
              {sending ? (
                <><Loader2 size={20} className="spin" /> Mengirim...</>
              ) : (
                <><AlertTriangle size={20} /> Kirim Panic Alert</>
              )}
            </button>

            <button
              className="emergency-secondary-action"
              onClick={() => navigate(-1)}
            >
              <X size={20} /> Batal
            </button>
          </>
        )}
      </div>
    </div>
  )
}
