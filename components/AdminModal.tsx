import React, { useEffect, useState } from 'react';
import { User } from '../types';
import { getAllUsers } from '../services/authService';
import { X, Database, Shield, Server, RefreshCw } from 'lucide-react';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminModal: React.FC<AdminModalProps> = ({ isOpen, onClose }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    const data = await getAllUsers();
    setUsers(data);
    setLoading(false);
  };

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-800/50">
           <div className="flex items-center gap-3">
             <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
                <Database className="w-5 h-5" />
             </div>
             <div>
               <h2 className="text-lg font-bold text-white flex items-center gap-2">
                 System Database
                 <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 border border-slate-700 text-slate-400 font-mono">
                   local_storage_v1
                 </span>
               </h2>
               <p className="text-xs text-slate-400">View registered users stored in browser memory</p>
             </div>
           </div>
           <button 
             onClick={onClose} 
             className="text-slate-400 hover:text-white transition-colors"
           >
             <X className="w-5 h-5" />
           </button>
        </div>

        {/* Content */}
        <div className="p-6 bg-slate-950">
          
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2 text-xs text-slate-500">
               <Server className="w-3 h-3" />
               <span>Status: <span className="text-emerald-400 font-bold">ONLINE</span></span>
            </div>
            <button 
              onClick={fetchUsers} 
              className="text-xs flex items-center gap-2 text-cyan-400 hover:text-cyan-300"
            >
              <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
              Refresh Data
            </button>
          </div>

          <div className="border border-slate-800 rounded-lg overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-900 text-slate-400 text-xs uppercase font-semibold">
                <tr>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">User Profile</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {users.length === 0 && !loading ? (
                   <tr>
                     <td colSpan={4} className="px-4 py-8 text-center text-slate-500 italic">
                        No users found in database.
                     </td>
                   </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-900/50 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-slate-500">{user.id}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                           <img src={user.avatarUrl} alt="" className="w-6 h-6 rounded-full" />
                           <div>
                             <div className="font-bold text-slate-200">{user.name}</div>
                             <div className="text-xs text-slate-500">{user.email}</div>
                           </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                         <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                            <Shield className="w-3 h-3" /> USER
                         </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                         <span className="text-xs text-emerald-500 font-bold">Active</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          <div className="mt-4 p-3 bg-slate-900/50 border border-slate-800 rounded-lg text-[10px] text-slate-500 font-mono">
             Storage Path: window.localStorage['sky_x_users_db']
          </div>
        </div>
      </div>
    </div>
  );
};