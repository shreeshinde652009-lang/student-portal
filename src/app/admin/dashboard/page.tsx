'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { StudentApplication, ApplicationStatus } from '@/types/student';
import {
  Users,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Loader2,
  X,
  AlertTriangle,
  Save
} from 'lucide-react';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<StudentApplication[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modals state
  const [selectedStudent, setSelectedStudent] = useState<StudentApplication | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  // Edit form state
  const [editFormData, setEditFormData] = useState<Partial<StudentApplication>>({});
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/admin/login'); return; }
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
      if (profile?.role !== 'admin') { router.push('/admin/login'); return; }
      fetchStudents();
    };
    load();
  }, [router]);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const { data: rows, error: queryError } = await createClient().from('applications').select('*');
      if (queryError) throw queryError;
      const list: StudentApplication[] = (rows || []).map((row) => ({ id: row.id, ...row.personal_data, ...row.academic_data, applicationNumber: row.application_number, userId: row.user_id, status: row.status, createdAt: row.created_at, updatedAt: row.updated_at } as StudentApplication));
      // Sort newest first
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setStudents(list);
    } catch (err) {
      console.error('Error fetching student applications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    sessionStorage.removeItem('isAdmin');
    await createClient().auth.signOut();
    router.push('/admin/login');
  };

  // Filter students based on search and status
  const filteredStudents = students.filter((student) => {
    const query = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !query ||
      student.applicationNumber?.toLowerCase().includes(query) ||
      student.fullName?.toLowerCase().includes(query) ||
      student.email?.toLowerCase().includes(query) ||
      student.mobile?.toLowerCase().includes(query);

    const matchesStatus = statusFilter === 'ALL' || student.status === statusFilter;

    return matchesQuery && matchesStatus;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage) || 1;
  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Status counters
  const totalCount = students.length;
  const pendingCount = students.filter((s) => s.status === 'SUBMITTED' || s.status === 'DRAFT').length;
  const underReviewCount = students.filter((s) => s.status === 'UNDER_REVIEW').length;
  const approvedCount = students.filter((s) => s.status === 'APPROVED').length;
  const rejectedCount = students.filter((s) => s.status === 'REJECTED').length;

  // Actions
  const openViewModal = (student: StudentApplication) => {
    setSelectedStudent(student);
    setViewModalOpen(true);
  };

  const openEditModal = (student: StudentApplication) => {
    setSelectedStudent(student);
    setEditFormData(student);
    setEditModalOpen(true);
  };

  const openDeleteModal = (student: StudentApplication) => {
    setSelectedStudent(student);
    setDeleteModalOpen(true);
  };

  const handleStatusChange = async (studentId: string, newStatus: ApplicationStatus) => {
    try {
      setActionLoading(true);
      const { error } = await createClient().from('applications').update({ status: newStatus, updated_at: new Date().toISOString() }).eq('id', studentId);
      if (error) throw error;
      setStudents((prev) =>
        prev.map((s) => (s.userId === studentId || s.id === studentId ? { ...s, status: newStatus } : s))
      );
      if (selectedStudent) {
        setSelectedStudent({ ...selectedStudent, status: newStatus });
      }
    } catch (err) {
      console.error('Error updating status:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || (!selectedStudent.id && !selectedStudent.userId)) return;

    const docId = selectedStudent.id || selectedStudent.userId;
    setActionLoading(true);

    try {
      const updatedObj = {
        ...editFormData,
        updatedAt: new Date().toISOString(),
      };
      const { error } = await createClient().from('applications').update({ personal_data: updatedObj, updated_at: new Date().toISOString() }).eq('id', docId);
      if (error) throw error;
      setStudents((prev) =>
        prev.map((s) => (s.id === docId || s.userId === docId ? ({ ...s, ...updatedObj } as StudentApplication) : s))
      );
      setEditModalOpen(false);
    } catch (err) {
      console.error('Error updating student record:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteStudent = async () => {
    if (!selectedStudent) return;
    const docId = selectedStudent.id || selectedStudent.userId;
    setActionLoading(true);

    try {
      const { error } = await createClient().from('applications').delete().eq('id', docId);
      if (error) throw error;
      setStudents((prev) => prev.filter((s) => (s.id !== docId && s.userId !== docId)));
      setDeleteModalOpen(false);
    } catch (err) {
      console.error('Error deleting student record:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: ApplicationStatus) => {
    switch (status) {
      case 'APPROVED':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">APPROVED</span>;
      case 'REJECTED':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 border border-red-300">REJECTED</span>;
      case 'UNDER_REVIEW':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-800 border border-indigo-300">UNDER REVIEW</span>;
      case 'DRAFT':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-800 border border-slate-300">DRAFT</span>;
      case 'SUBMITTED':
      default:
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-800 border border-amber-300">SUBMITTED</span>;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-slate-800" />
        <p className="text-sm text-slate-600">Loading Admin Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Admin Header */}
      <div className="bg-slate-900 text-white p-6 rounded-lg shadow-sm border-b-4 border-amber-500 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2 text-amber-400">
            <Users className="w-6 h-6" /> Admin Management Dashboard
          </h1>
          <p className="text-xs text-slate-300 mt-1">State Common Entrance Test Cell - Candidate Admissions Portal</p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-3 py-2 rounded font-medium border border-slate-700 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" /> Logout Admin
        </button>
      </div>

      {/* Metrics Summary Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
          <p className="text-xs text-slate-500 font-semibold uppercase">Total Applications</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">{totalCount}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
          <p className="text-xs text-amber-600 font-semibold uppercase">Pending / Submitted</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">{pendingCount}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
          <p className="text-xs text-indigo-600 font-semibold uppercase">Under Review</p>
          <p className="text-2xl font-bold text-indigo-600 mt-1">{underReviewCount}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
          <p className="text-xs text-emerald-600 font-semibold uppercase font-semibold">Approved</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{approvedCount}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm col-span-2 md:col-span-1">
          <p className="text-xs text-red-600 font-semibold uppercase">Rejected</p>
          <p className="text-2xl font-bold text-red-600 mt-1">{rejectedCount}</p>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search Application #, Name, Email, Mobile..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-slate-800"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-500 shrink-0" />
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="border border-slate-300 rounded px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-slate-800 bg-white w-full md:w-auto"
          >
            <option value="ALL">All Application Statuses</option>
            <option value="DRAFT">DRAFT</option>
            <option value="SUBMITTED">SUBMITTED</option>
            <option value="UNDER_REVIEW">UNDER REVIEW</option>
            <option value="APPROVED">APPROVED</option>
            <option value="REJECTED">REJECTED</option>
          </select>
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-700 text-xs font-bold uppercase border-b border-slate-200">
                <th className="py-3 px-4">Photo</th>
                <th className="py-3 px-4">App Number</th>
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-4">Contact Info</th>
                <th className="py-3 px-4">HSC %</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs text-slate-700">
              {paginatedStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No student applications found matching criteria.
                  </td>
                </tr>
              ) : (
                paginatedStudents.map((student) => (
                  <tr key={student.id || student.userId} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={student.photoUrl || '/placeholder.png'}
                        alt={student.fullName}
                        className="w-9 h-11 object-cover rounded border border-slate-300 bg-slate-100"
                      />
                    </td>
                    <td className="py-3 px-4 font-bold text-blue-900">{student.applicationNumber}</td>
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      {student.fullName}
                      <span className="block text-[10px] text-slate-500 font-normal">DOB: {student.dob}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div>{student.email}</div>
                      <div className="text-slate-500">{student.mobile}</div>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-800">{student.hscPercentage}%</td>
                    <td className="py-3 px-4">{getStatusBadge(student.status)}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openViewModal(student)}
                          title="View Application"
                          className="p-1.5 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openEditModal(student)}
                          title="Edit Student Info"
                          className="p-1.5 rounded bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openDeleteModal(student)}
                          title="Delete Record"
                          className="p-1.5 rounded bg-red-50 text-red-700 hover:bg-red-100 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="bg-slate-50 px-4 py-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-600 gap-2">
          <div>
            Showing <span className="font-semibold">{paginatedStudents.length}</span> of{' '}
            <span className="font-semibold">{filteredStudents.length}</span> entries
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-50"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span>
              Page <span className="font-bold">{currentPage}</span> of <span className="font-bold">{totalPages}</span>
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-50"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* VIEW MODAL */}
      {viewModalOpen && selectedStudent && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-slate-900 text-white p-4 flex justify-between items-center sticky top-0 z-10">
              <h3 className="font-bold text-sm flex items-center gap-2 text-amber-400">
                <Eye className="w-4 h-4" /> Application Details: {selectedStudent.applicationNumber}
              </h3>
              <button onClick={() => setViewModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 text-xs text-slate-800">
              {/* Status Manager Header */}
              <div className="bg-slate-50 p-4 rounded border border-slate-200 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="text-slate-500 block font-semibold">Change Application Status:</span>
                  <div className="mt-1">{getStatusBadge(selectedStudent.status)}</div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(['DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED'] as ApplicationStatus[]).map((st) => (
                    <button
                      key={st}
                      disabled={actionLoading || selectedStudent.status === st}
                      onClick={() => handleStatusChange(selectedStudent.id || selectedStudent.userId, st)}
                      className={`px-2.5 py-1 rounded text-[11px] font-bold border transition-colors ${
                        selectedStudent.status === st
                          ? 'bg-slate-800 text-white border-slate-800'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Student Overview */}
              <div className="flex gap-4 items-start">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={selectedStudent.photoUrl}
                  alt={selectedStudent.fullName}
                  className="w-28 h-36 object-cover border rounded shrink-0"
                />
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 flex-1">
                  <div><span className="text-slate-500 block">Full Name:</span><span className="font-bold text-sm">{selectedStudent.fullName}</span></div>
                  <div><span className="text-slate-500 block">Category:</span><span className="font-semibold">{selectedStudent.category}</span></div>
                  <div><span className="text-slate-500 block">Father Name:</span><span>{selectedStudent.fatherName}</span></div>
                  <div><span className="text-slate-500 block">Mother Name:</span><span>{selectedStudent.motherName}</span></div>
                  <div><span className="text-slate-500 block">DOB:</span><span>{selectedStudent.dob}</span></div>
                  <div><span className="text-slate-500 block">Gender:</span><span>{selectedStudent.gender}</span></div>
                </div>
              </div>

              <hr />

              {/* Contact & Domicile */}
              <div className="grid grid-cols-2 gap-2">
                <div><span className="text-slate-500 block">Email:</span><span className="font-semibold">{selectedStudent.email}</span></div>
                <div><span className="text-slate-500 block">Mobile:</span><span className="font-semibold">{selectedStudent.mobile}</span></div>
                <div><span className="text-slate-500 block">District &amp; State:</span><span>{selectedStudent.district}, {selectedStudent.state}</span></div>
                <div><span className="text-slate-500 block">Domicile Certificate:</span><span className="font-semibold">{selectedStudent.domicileNumber}</span></div>
                <div className="col-span-2"><span className="text-slate-500 block">Address:</span><span>{selectedStudent.address}</span></div>
              </div>

              <hr />

              {/* Academics */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-3 rounded border">
                  <p className="font-bold text-slate-700 mb-1 border-b pb-1">SSC (10th)</p>
                  <p>Board: {selectedStudent.sscBoard}</p>
                  <p>Year: {selectedStudent.sscPassingYear}</p>
                  <p className="font-bold text-blue-700">Percentage: {selectedStudent.sscPercentage}%</p>
                </div>
                <div className="bg-slate-50 p-3 rounded border">
                  <p className="font-bold text-slate-700 mb-1 border-b pb-1">HSC (12th)</p>
                  <p>Board: {selectedStudent.hscBoard}</p>
                  <p>Year: {selectedStudent.hscPassingYear}</p>
                  <p className="font-bold text-blue-700">Percentage: {selectedStudent.hscPercentage}%</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t flex justify-end">
              <button
                onClick={() => setViewModalOpen(false)}
                className="bg-slate-800 text-white px-4 py-1.5 rounded text-xs font-semibold hover:bg-slate-900"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editModalOpen && selectedStudent && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-slate-900 text-white p-4 flex justify-between items-center sticky top-0 z-10">
              <h3 className="font-bold text-sm flex items-center gap-2 text-amber-400">
                <Edit className="w-4 h-4" /> Edit Student Record: {selectedStudent.applicationNumber}
              </h3>
              <button onClick={() => setEditModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Full Name</label>
                  <input
                    type="text"
                    value={editFormData.fullName || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, fullName: e.target.value })}
                    className="w-full border rounded px-2.5 py-1.5 text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Mobile</label>
                  <input
                    type="text"
                    value={editFormData.mobile || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, mobile: e.target.value })}
                    className="w-full border rounded px-2.5 py-1.5 text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Email</label>
                  <input
                    type="email"
                    value={editFormData.email || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                    className="w-full border rounded px-2.5 py-1.5 text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Category</label>
                  <select
                    value={editFormData.category || 'OPEN'}
                    onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
                    className="w-full border rounded px-2 py-1.5 text-xs bg-white"
                  >
                    <option value="OPEN">OPEN</option>
                    <option value="OBC">OBC</option>
                    <option value="SC">SC</option>
                    <option value="ST">ST</option>
                    <option value="EWS">EWS</option>
                    <option value="NT">NT</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">SSC Percentage (%)</label>
                  <input
                    type="text"
                    value={editFormData.sscPercentage || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, sscPercentage: e.target.value })}
                    className="w-full border rounded px-2.5 py-1.5 text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">HSC Percentage (%)</label>
                  <input
                    type="text"
                    value={editFormData.hscPercentage || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, hscPercentage: e.target.value })}
                    className="w-full border rounded px-2.5 py-1.5 text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">District</label>
                  <input
                    type="text"
                    value={editFormData.district || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, district: e.target.value })}
                    className="w-full border rounded px-2.5 py-1.5 text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Domicile Number</label>
                  <input
                    type="text"
                    value={editFormData.domicileNumber || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, domicileNumber: e.target.value })}
                    className="w-full border rounded px-2.5 py-1.5 text-xs"
                    required
                  />
                </div>
              </div>

              <div className="pt-4 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-3 py-1.5 border rounded text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-1.5 bg-slate-900 text-white rounded font-bold hover:bg-slate-800 flex items-center gap-1"
                >
                  {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />} Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {deleteModalOpen && selectedStudent && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <AlertTriangle className="w-8 h-8 shrink-0" />
              <div>
                <h3 className="font-bold text-base text-slate-800">Confirm Record Deletion</h3>
                <p className="text-xs text-slate-500">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded border">
              Are you sure you want to permanently delete the registration record for{' '}
              <span className="font-bold">{selectedStudent.fullName}</span> (App #: {selectedStudent.applicationNumber})?
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="px-4 py-2 border rounded text-xs text-slate-600 hover:bg-slate-100 font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteStudent}
                disabled={actionLoading}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-bold flex items-center gap-1"
              >
                {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />} Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
