export const initialStudents = [
  { id: '20240105', name: 'Budi Darmawan', birth: '12 Jan 2016', className: 'Kelas 2-A', category: 'Autisme', initials: 'BD', tone: 'peach', progress: 75 },
  { id: '20240108', name: 'Siti Aminah', birth: '05 Mei 2015', className: 'Kelas 3-C', category: 'ADHD', initials: 'SA', tone: 'purple', progress: 68 },
  { id: '20240212', name: 'Andi Wijaya', birth: '22 Sep 2016', className: 'Kelas 2-A', category: 'Disleksia', initials: 'AW', tone: 'blue', progress: 54 },
  { id: '20240301', name: 'Rina Safitri', birth: '15 Agt 2017', className: 'Kelas 1-B', category: 'Umum', initials: 'RS', tone: 'mint', progress: 82 },
  { id: '20240311', name: 'Rizky Ramadhan', birth: '04 Feb 2016', className: 'Kelas 3-B', category: 'Autisme', initials: 'RR', tone: 'yellow', progress: 84 },
  { id: '20240325', name: 'Nadin Safitri', birth: '18 Jul 2016', className: 'Kelas 2-B', category: 'ADHD', initials: 'NS', tone: 'peach', progress: 72 },
]

export const teachers = [
  { id: 1, name: 'Bpk. Ahmad Subarjo', role: 'Wali Kelas 3A', meta: '12 Siswa', initials: 'AS' },
  { id: 2, name: 'Ibu Siti Aminah', role: 'Terapis Wicara', meta: 'Aktif', initials: 'SA' },
  { id: 3, name: 'Ibu Ratna Dewi', role: 'Kepala Sekolah', meta: 'Admin', initials: 'RD' },
  { id: 4, name: 'Bpk. Bambang Pamungkas', role: 'Guru Olahraga', meta: 'Luar Kota', initials: 'BP' },
]

export const guardians = [
  { id: 1, name: 'Budi Santoso', relation: 'Ayah', child: 'Adit', address: 'Jl. Melati No. 45, Kebayoran Baru, Jakarta Selatan', phone: '0812-3456-7890', initials: 'BS' },
  { id: 2, name: 'Siti Aminah', relation: 'Ibu', child: 'Laras', address: 'Apartemen Green Bay Tower C, Lantai 12, Pluit', phone: '0812-9876-5432', initials: 'SA' },
  { id: 3, name: 'Hendrawan', relation: 'Kakek', child: 'Daffa', address: 'Jl. Kemang Raya No. 12B, Mampang Prapatan', phone: '0811-2233-4455', initials: 'HD' },
]

export const initialReports = [
  { id: 1, studentId: '20240105', student: 'Budi Darmawan', date: '2024-05-24', category: 'Interaksi Sosial', status: 'BSB', score: 80, note: 'Mampu menyelesaikan tugas matematika penjumlahan dasar tanpa bantuan.', author: 'Ibu Maria' },
  { id: 2, studentId: '20240325', student: 'Nadin Safitri', date: '2024-05-24', category: 'Perilaku', status: 'BSH', score: 72, note: 'Mulai berani menyapa teman sebangku dan berbagi alat tulis.', author: 'Ibu Maria' },
  { id: 3, studentId: '20240311', student: 'Rizky Ramadhan', date: '2024-05-23', category: 'Motorik Halus', status: 'MB', score: 25, note: 'Masih membutuhkan bimbingan intensif dalam mengenal huruf vokal.', author: 'Pak Budi' },
]

export const initialNotifications = [
  { id: 1, type: 'danger', title: 'Peringatan Keamanan', body: 'Budi terdeteksi keluar dari zona aman (Area Kelas B). Harap segera lakukan pengecekan.', time: '10:45', unread: true },
  { id: 2, type: 'progress', title: 'Pembaruan Kemajuan', body: 'Siti mencapai target mingguan dalam kemampuan motorik halus.', time: '09:30', unread: true },
  { id: 3, type: 'info', title: 'Pengumuman Sekolah', body: 'Peringatan Hari Disabilitas Internasional akan diadakan hari Jumat depan.', time: 'Kemarin, 16:15', unread: false },
  { id: 4, type: 'note', title: 'Catatan Guru: Ibu Sarah', body: 'Rizky sangat tenang hari ini dan sangat kooperatif saat sesi terapi wicara.', time: 'Kemarin, 14:00', unread: false },
]

export const historyItems = [
  { date: '14 Okt 2023', title: 'Interaksi Sosial', tags: ['Maju Pesat', 'Terapi Wicara'], note: 'Budi menunjukkan inisiatif yang luar biasa hari ini. Ia berhasil memulai percakapan.', tone: 'blue' },
  { date: '12 Okt 2023', title: 'Kemampuan Kognitif', tags: ['Konsisten', 'Akademik'], note: 'Berhasil mengidentifikasi 5 warna primer dengan benar secara berturut-turut.', tone: 'purple' },
  { date: '10 Okt 2023', title: 'Regulasi Emosi', tags: ['Butuh Perhatian', 'Perilaku'], note: 'Terjadi tantrum ringan selama 5 menit saat transisi dari waktu bermain ke jam belajar.', tone: 'red' },
  { date: '08 Okt 2023', title: 'Motorik Halus', tags: ['Berkembang', 'Okupasi'], note: 'Peningkatan dalam memegang sendok dengan benar selama makan siang.', tone: 'orange' },
]
