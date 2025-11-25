import { useState, useEffect } from 'react';
import { Search, UserPlus, Trash2, Eye, Award, Calendar } from 'lucide-react';

function AdminStudents() {
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  // Veritabanından öğrencileri çek
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    
    fetch('http://localhost:5000/api/admin/students', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        setStudents(data.map(student => ({
          ...student,
          status: 'active'
        })));
        setLoading(false);
      })
      .catch(err => {
        console.error('Öğrenciler yüklenirken hata:', err);
        setLoading(false);
      });
  }, []);

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewDetails = (student) => {
    setSelectedStudent(student);
    setShowDetails(true);
  };

  const handleDeleteStudent = (id) => {
    if (window.confirm('Bu öğrenciyi silmek istediğinizden emin misiniz?')) {
      setStudents(students.filter(s => s.id !== id));
    }
  };

  const getScoreColor = (score) => {
    if (score >= 85) return 'text-green-600 bg-green-100';
    if (score >= 70) return 'text-blue-600 bg-blue-100';
    if (score >= 50) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Öğrenciler Yönetimi</h1>
        
      </div>

      {/* İstatistikler */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="text-gray-500 text-sm mb-1">Toplam Öğrenci</div>
          <div className="text-3xl font-bold text-gray-800">{students.length}</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="text-gray-500 text-sm mb-1">Aktif Öğrenci</div>
          <div className="text-3xl font-bold text-green-600">
            {students.filter(s => s.status === 'active').length}
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="text-gray-500 text-sm mb-1">Ortalama Puan</div>
          <div className="text-3xl font-bold text-blue-600">
 {students.length > 0
  ? Math.round(
      students.reduce((acc, s) => acc + (s.avgScore || 0), 0) / students.length
    )
  : 0}

          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="text-gray-500 text-sm mb-1">Toplam Sınav</div>
          <div className="text-3xl font-bold text-purple-600">
            {students.reduce((acc, s) => acc + s.totalTests, 0)}
          </div>
        </div>
      </div>

      {/* Arama */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Öğrenci adı veya email ile ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Öğrenci Listesi */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Yükleniyor...</div>
        ) : filteredStudents.length === 0 ? (
          <div className="p-8 text-center text-gray-500">Öğrenci bulunamadı</div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Öğrenci</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Sınav Sayısı</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Ortalama</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Son Sınav</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">
                        {student.name.charAt(0)}
                      </div>
                      <div className="ml-3">
                        <div className="font-medium text-gray-900">{student.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{student.email}</td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center gap-1 text-sm font-medium text-gray-700">
                      <Award size={16} />
                      {student.totalTests}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(student.avgScore ?? 0)}`}>
                      {student.avgScore}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center gap-1 text-sm text-gray-500">
                      <Calendar size={16} />
                      {new Date(student.lastTest).toLocaleDateString('tr-TR')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button 
                        onClick={() => handleViewDetails(student)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        title="Detayları Gör"
                      >
                        <Eye size={18} />
                      </button>
                      <button 
                        onClick={() => handleDeleteStudent(student.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Sil"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Detay Modal */}
      {showDetails && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowDetails(false)}>
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-2xl font-bold mb-4">{selectedStudent.name}</h2>
            <div className="space-y-3">
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-600">Email:</span>
                <span className="font-medium">{selectedStudent.email}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-600">Toplam Sınav:</span>
                <span className="font-medium">{selectedStudent.totalTests}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-600">Ortalama Puan:</span>
                <span className="font-medium">{selectedStudent.avgScore}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-600">Son Sınav:</span>
                <span className="font-medium">{new Date(selectedStudent.lastTest).toLocaleDateString('tr-TR')}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-600">Durum:</span>
                <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  Aktif
                </span>
              </div>
            </div>
            <button 
              onClick={() => setShowDetails(false)}
              className="mt-6 w-full bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 rounded-lg transition"
            >
              Kapat
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminStudents;