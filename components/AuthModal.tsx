
import React, { useState } from 'react';
import { User } from '../types';
import { login, register } from '../services/authService';
import { X, Mail, Lock, User as UserIcon, Loader2, ArrowRight, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      let user: User;
      if (isLogin) {
        user = await login(email, password);
        onAuthSuccess(user);
        onClose();
      } else {
        user = await register(name, email, password);
        // If register returns successfully (meaning no email confirm needed), log them in
        onAuthSuccess(user);
        onClose();
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Authentication failed";
      setError(msg);
      // If the error is actually a "Check your email" instruction, switch to login view for convenience
      if (!isLogin && msg.includes("check your email")) {
        setIsLogin(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const isInfoMessage = error && (error.toLowerCase().includes('check your email') || error.toLowerCase().includes('verify'));

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            onClick={onClose}
          ></motion.div>

          {/* Modal Content */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden"
          >
            
            {/* Header */}
            <div className="px-6 py-5 border-b border-slate-800 flex justify-between items-center bg-slate-800/50">
               <div>
                 <h2 className="text-xl font-bold text-white tracking-tight">
                   {isLogin ? 'Welcome Back' : 'Join the Network'}
                 </h2>
                 <p className="text-xs text-slate-400 mt-1">
                   {isLogin ? 'Access your dashboard' : 'Create your secure account'}
                 </p>
               </div>
               <button 
                 onClick={onClose} 
                 className="text-slate-400 hover:text-white transition-colors p-1 hover:bg-slate-700 rounded-full"
               >
                 <X className="w-5 h-5" />
               </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              
              <AnimatePresence mode='wait'>
                {!isLogin && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="space-y-1.5 overflow-hidden"
                  >
                     <label className="text-xs font-semibold text-slate-400 ml-1">Full Name</label>
                     <div className="relative group">
                        <UserIcon className="absolute left-3 top-3 w-4 h-4 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
                        <input 
                          type="text" 
                          required={!isLogin}
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded-lg py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                          placeholder="John Doe"
                        />
                     </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-1.5">
                 <label className="text-xs font-semibold text-slate-400 ml-1">Email Address</label>
                 <div className="relative group">
                    <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
                    <input 
                      type="email" 
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                      placeholder="name@example.com"
                    />
                 </div>
              </div>

              <div className="space-y-1.5">
                 <label className="text-xs font-semibold text-slate-400 ml-1">Password</label>
                 <div className="relative group">
                    <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
                    <input 
                      type="password" 
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                      placeholder="••••••••"
                    />
                 </div>
              </div>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={clsx(
                    "p-3 rounded-lg text-xs flex items-start gap-2 border",
                    isInfoMessage 
                      ? "bg-blue-500/10 border-blue-500/20 text-blue-400" 
                      : "bg-red-500/10 border-red-500/20 text-red-400"
                )}>
                   <div className={clsx("mt-0.5", isInfoMessage ? "text-blue-500" : "text-red-500")}>
                      {isInfoMessage ? <Info className="w-3.5 h-3.5" /> : <span className="w-1.5 h-1.5 rounded-full bg-red-500 block"></span>}
                   </div>
                   <span className="leading-snug">{error}</span>
                </motion.div>
              )}

              <button 
                type="submit"
                disabled={loading}
                className="w-full mt-4 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-lg shadow-lg shadow-cyan-900/20 hover:shadow-cyan-900/40 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed group"
              >
                 {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                 ) : (
                    <>
                      {isLogin ? 'Sign In' : 'Create Account'}
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                 )}
              </button>
            </form>

            {/* Footer */}
            <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 text-center">
               <p className="text-xs text-slate-400">
                 {isLogin ? "Don't have an account? " : "Already have an account? "}
                 <button 
                   onClick={() => {
                     setIsLogin(!isLogin);
                     setError(null);
                   }}
                   className="font-bold text-cyan-400 hover:text-cyan-300 transition-colors ml-1"
                 >
                   {isLogin ? "Sign up" : "Log in"}
                 </button>
               </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
