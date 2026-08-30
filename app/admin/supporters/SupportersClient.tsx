'use client';

import { useState, useMemo } from 'react';
import { FaEdit, FaTrash, FaTimes, FaSave, FaCheck, FaBan, FaSearch } from 'react-icons/fa';
import { updateSupporterAction, deleteSupporterAction } from './actions';

export default function SupportersClient({ initialData }: { initialData: any[] }) {
  const [supporters, setSupporters] = useState(initialData);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 🌟 EFFICIENT CLIENT-SIDE SEARCH
  const filteredSupporters = useMemo(() => {
    if (!searchTerm.trim()) return supporters;
    const lowerTerm = searchTerm.toLowerCase().trim();
    
    return supporters.filter(s => {
      const orderId = s.razorpay_order_id?.toLowerCase() || '';
      const paymentId = s.razorpay_payment_id?.toLowerCase() || '';
      const name = s.name?.toLowerCase() || '';
      
      return orderId.includes(lowerTerm) || 
             paymentId.includes(lowerTerm) || 
             name.includes(lowerTerm);
    });
  }, [supporters, searchTerm]);

  // Modal Handlers
  const openEditModal = (supporter: any) => {
    setEditingId(supporter.id);
    setEditForm({ ...supporter });
  };

  const closeModal = () => {
    setEditingId(null);
    setEditForm({});
  };

  // Input Handlers
  const handleInputChange = (field: string, value: any) => {
    setEditForm((prev: any) => ({ ...prev, [field]: value }));
  };

  // Submit Update
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // 🌟 FIX: Bulletproof Serialization. Next.js crashes if you send 'undefined'
      // We force any empty or undefined values to strictly be 'null' or proper types.
      const updatePayload = {
        name: editForm.name || null,
        message: editForm.message || null,
        photo_url: editForm.photo_url || null,
        is_anonymous: Boolean(editForm.is_anonymous),
        status: editForm.status || 'pending',
        order_type: editForm.order_type || 'donation',
        bhajan_count: parseInt(editForm.bhajan_count) || 0,
      };

      const res = await updateSupporterAction(editingId!, updatePayload);
      
      if (res?.success) {
        setSupporters(prev => prev.map(s => s.id === editingId ? { ...s, ...updatePayload } : s));
        closeModal();
      } else {
        // If middleware redirects, res might be undefined or HTML
        alert(`Error updating record: ${res?.error || "Session may have expired. Please refresh the page."}`);
      }
    } catch (err: any) {
      console.error("Save Error:", err);
      alert("Network error or session expired. Please refresh the page and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Delete
  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to permanently delete this record?")) return;
    
    try {
      const res = await deleteSupporterAction(id);
      if (res?.success) {
        setSupporters(prev => prev.filter(s => s.id !== id));
      } else {
        alert(`Error deleting record: ${res?.error || "Session may have expired."}`);
      }
    } catch (err: any) {
      alert("Network error or session expired. Please refresh the page.");
    }
  };

  return (
    <div className="w-full">
      
      {/* 🌟 SEARCH BAR */}
      <div className="mb-6 relative max-w-md">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <FaSearch className="text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search by Order ID, Payment ID, or Name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-11 pr-4 py-3 bg-white dark:bg-[#120c08] border border-gray-200 dark:border-white/10 rounded-2xl text-sm font-medium text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-orange-500 outline-none shadow-sm transition-all"
        />
      </div>

      {/* 🌟 MAIN DATA TABLE */}
      <div className="bg-white dark:bg-[#120c08] border border-gray-200 dark:border-white/10 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
            <thead className="bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white uppercase text-[11px] tracking-wider font-bold border-b border-gray-200 dark:border-white/10">
              <tr>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Name / Anonymous</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Created Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
              {filteredSupporters.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      s.status === 'completed' ? 'bg-green-100 text-green-700' :
                      s.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                    {s.is_anonymous ? <span className="text-gray-400 italic">Anonymous</span> : (s.name || 'N/A')}
                  </td>
                  <td className="px-6 py-4 font-black">₹{s.amount}</td>
                  <td className="px-6 py-4 capitalize">{s.order_type}</td>
                  <td className="px-6 py-4 text-xs">
                    {new Date(s.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-6 py-4 text-right flex items-center justify-end gap-3">
                    <button 
                      onClick={() => openEditModal(s)}
                      className="text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 p-2 rounded-lg transition-colors outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                      title="Edit Record"
                    >
                      <FaEdit />
                    </button>
                    <button 
                      onClick={() => handleDelete(s.id)}
                      className="text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 p-2 rounded-lg transition-colors outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                      title="Delete Record"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredSupporters.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No matching records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 🌟 EDIT MODAL */}
      {editingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#120c08] w-full max-w-3xl rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-white/5">
              <h2 className="text-xl font-black text-gray-900 dark:text-white">Edit Supporter Record</h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 dark:hover:text-white p-2">
                <FaTimes size={20} />
              </button>
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="p-6 overflow-y-auto flex-1">
              <form id="edit-supporter-form" onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* 🔒 LOCKED FIELDS SECTION */}
                <div className="md:col-span-2 bg-gray-50 dark:bg-white/5 rounded-xl p-5 border border-gray-100 dark:border-white/10">
                  <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <FaBan className="text-red-400" /> Locked System Fields
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">Record ID</label>
                      <input type="text" value={editForm.id} disabled className="w-full bg-gray-100 dark:bg-black/20 border border-gray-200 dark:border-white/5 rounded-lg px-3 py-2 text-sm text-gray-500 cursor-not-allowed" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">Transaction Amount</label>
                      <input type="text" value={`₹${editForm.amount}`} disabled className="w-full bg-gray-100 dark:bg-black/20 border border-gray-200 dark:border-white/5 rounded-lg px-3 py-2 text-sm font-black text-gray-500 cursor-not-allowed" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">Razorpay Order ID</label>
                      <input type="text" value={editForm.razorpay_order_id || 'N/A'} disabled className="w-full bg-gray-100 dark:bg-black/20 border border-gray-200 dark:border-white/5 rounded-lg px-3 py-2 text-sm text-gray-500 cursor-not-allowed" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">Razorpay Payment ID</label>
                      <input type="text" value={editForm.razorpay_payment_id || 'N/A'} disabled className="w-full bg-gray-100 dark:bg-black/20 border border-gray-200 dark:border-white/5 rounded-lg px-3 py-2 text-sm text-gray-500 cursor-not-allowed" />
                    </div>
                  </div>
                </div>

                {/* 🔓 EDITABLE FIELDS SECTION */}
                <div className="md:col-span-2 pt-2">
                  <h3 className="text-xs font-black text-orange-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <FaEdit /> Editable Information
                  </h3>
                </div>

                {/* Status Dropdown */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">Payment Status</label>
                  <select 
                    value={editForm.status || 'pending'} 
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    className="w-full bg-white dark:bg-[#1a120b] border border-gray-300 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                  >
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                    <option value="failed">Failed</option>
                    <option value="refunded">Refunded</option>
                  </select>
                </div>

                {/* Order Type Dropdown */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">Order Type</label>
                  <select 
                    value={editForm.order_type || 'donation'} 
                    onChange={(e) => handleInputChange('order_type', e.target.value)}
                    className="w-full bg-white dark:bg-[#1a120b] border border-gray-300 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                  >
                    <option value="donation">Donation</option>
                    <option value="book_builder">Book Builder</option>
                    <option value="premium_access">Premium Access</option>
                  </select>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">Supporter Name</label>
                  <input 
                    type="text" 
                    value={editForm.name || ''} 
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full bg-white dark:bg-[#1a120b] border border-gray-300 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-orange-500 outline-none" 
                    placeholder="Enter full name"
                  />
                </div>

                {/* Bhajan Count */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">Bhajan Count Allocation</label>
                  <input 
                    type="number" 
                    value={editForm.bhajan_count || 0} 
                    onChange={(e) => handleInputChange('bhajan_count', e.target.value)}
                    className="w-full bg-white dark:bg-[#1a120b] border border-gray-300 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-orange-500 outline-none" 
                  />
                </div>

                {/* Is Anonymous Toggle */}
                <div className="flex items-center gap-3 pt-6">
                  <input 
                    type="checkbox" 
                    id="is_anon"
                    checked={!!editForm.is_anonymous} 
                    onChange={(e) => handleInputChange('is_anonymous', e.target.checked)}
                    className="w-5 h-5 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500" 
                  />
                  <label htmlFor="is_anon" className="text-sm font-bold text-gray-700 dark:text-gray-300 cursor-pointer">
                    Keep Supporter Anonymous
                  </label>
                </div>

                {/* Photo URL */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">Photo URL</label>
                  <input 
                    type="text" 
                    value={editForm.photo_url || ''} 
                    onChange={(e) => handleInputChange('photo_url', e.target.value)}
                    className="w-full bg-white dark:bg-[#1a120b] border border-gray-300 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-orange-500 outline-none" 
                    placeholder="https://..."
                  />
                </div>

                {/* Message */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">Public Message</label>
                  <textarea 
                    value={editForm.message || ''} 
                    onChange={(e) => handleInputChange('message', e.target.value)}
                    rows={3}
                    className="w-full bg-white dark:bg-[#1a120b] border border-gray-300 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-orange-500 outline-none resize-none" 
                    placeholder="Enter custom message to display on the wall..."
                  />
                </div>
              </form>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-white/5 flex justify-end gap-3">
              <button 
                type="button" 
                onClick={closeModal}
                className="px-5 py-2.5 rounded-xl font-bold text-gray-600 bg-white border border-gray-300 hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                form="edit-supporter-form"
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl font-bold text-white bg-orange-600 hover:bg-orange-700 flex items-center gap-2 transition-colors disabled:opacity-70 disabled:cursor-not-allowed shadow-md"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <FaSave /> 
                )}
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
}