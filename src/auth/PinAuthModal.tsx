import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Lock, KeyRound, User, Sparkles, AlertCircle, Copy, Check, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const PinAuthModal: React.FC = () => {
  const { user, loginWithPin, registerWithPin, verifyRecoveryCode, isPinLocked } = useAuth();
  
  const [mode, setMode] = useState<'login' | 'register' | 'recovery' | 'recovery_success'>(
    user ? 'login' : 'register'
  );

  const [pin, setPin] = useState<string>('');
  const [displayName, setDisplayName] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [bio, setBio] = useState<string>('');
  const [recoveryCodeInput, setRecoveryCodeInput] = useState<string>('');
  const [newPin, setNewPin] = useState<string>('');
  const [generatedRecoveryCode, setGeneratedRecoveryCode] = useState<string>('');

  const [error, setError] = useState<string>('');
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Handle keypad digit click
  const handleDigit = (digit: string) => {
    if (pin.length < 6) {
      setPin(prev => prev + digit);
      setError('');
    }
  };

  const handleBackspace = () => {
    setPin(prev => prev.slice(0, -1));
    setError('');
  };

  const handleClear = () => {
    setPin('');
    setError('');
  };

  // Submit Login
  const handleLoginSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (pin.length < 4) {
      setError('Please enter a 4-6 digit PIN');
      return;
    }
    setIsSubmitting(true);
    const success = await loginWithPin(pin);
    setIsSubmitting(false);
    if (!success) {
      setError('Incorrect PIN. Try again or recover your account.');
      setPin('');
    }
  };

  // Submit Registration
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim() || !username.trim()) {
      setError('Please fill in your name and username');
      return;
    }
    if (pin.length < 4) {
      setError('PIN must be at least 4 digits');
      return;
    }

    setIsSubmitting(true);
    setError('');
    try {
      const { recoveryCode } = await registerWithPin(displayName, username, pin, bio);
      setGeneratedRecoveryCode(recoveryCode);
      setMode('recovery_success');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to create account. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Recovery
  const handleRecoverySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !recoveryCodeInput.trim() || newPin.length < 4) {
      setError('Fill in all fields and provide a new 4+ digit PIN.');
      return;
    }
    setIsSubmitting(true);
    const success = await verifyRecoveryCode(username, recoveryCodeInput, newPin);
    setIsSubmitting(false);
    if (!success) {
      setError('Invalid Username or Recovery Code.');
    }
  };

  const copyRecoveryCode = () => {
    navigator.clipboard.writeText(generatedRecoveryCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  if (!isPinLocked && user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-md overflow-hidden bg-slate-900 border border-pink-500/30 rounded-3xl shadow-2xl shadow-pink-500/10 text-white"
      >
        {/* Header Branding */}
        <div className="relative p-6 text-center bg-gradient-to-r from-pink-600 via-rose-500 to-indigo-600">
          <div className="absolute top-2 right-2 opacity-20">
            <Sparkles className="w-16 h-16 text-white" />
          </div>
          <div className="flex items-center justify-center w-16 h-16 mx-auto mb-3 bg-white/10 rounded-2xl backdrop-blur-md border border-white/20 shadow-lg">
            <span className="text-3xl font-black tracking-widest text-white">⚡</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">PingChat</h2>
          <p className="text-xs text-pink-100/90 font-medium tracking-wide mt-0.5">
            Realtime Pink & Blue Encrypted Messenger
          </p>
        </div>

        <div className="p-6 space-y-6">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 p-3 text-sm text-rose-300 bg-rose-950/60 border border-rose-500/40 rounded-xl"
            >
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </motion.div>
          )}

          {/* MODE: LOGIN WITH PIN */}
          {mode === 'login' && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Lock className="w-4 h-4 text-pink-400" />
                  <span className="text-sm font-semibold text-slate-300">Welcome Back, {user?.displayName}!</span>
                </div>
                <p className="text-xs text-slate-400">Enter your secure PIN to unlock</p>
              </div>

              {/* PIN Dots Display */}
              <div className="flex justify-center gap-3">
                {[0, 1, 2, 3, 4, 5].map((index) => (
                  <div
                    key={index}
                    className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${
                      index < pin.length
                        ? 'bg-gradient-to-r from-pink-500 to-sky-400 border-pink-400 scale-110 shadow-lg shadow-pink-500/50'
                        : 'border-slate-700 bg-slate-800'
                    }`}
                  />
                ))}
              </div>

              {/* Virtual Keypad */}
              <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '⌫'].map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => {
                      if (item === 'C') handleClear();
                      else if (item === '⌫') handleBackspace();
                      else handleDigit(item);
                    }}
                    className="flex items-center justify-center h-12 rounded-2xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700/60 active:scale-95 text-lg font-bold text-slate-200 hover:text-pink-300 transition-all shadow-sm"
                  >
                    {item}
                  </button>
                ))}
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => handleLoginSubmit()}
                  disabled={pin.length < 4 || isSubmitting}
                  className="w-full py-3 text-sm font-bold tracking-wide text-white transition-all bg-gradient-to-r from-pink-500 to-indigo-600 rounded-xl hover:from-pink-600 hover:to-indigo-700 disabled:opacity-50 shadow-lg shadow-pink-500/25 active:scale-[0.99]"
                >
                  {isSubmitting ? 'Unlocking...' : 'Unlock PingChat'}
                </button>

                <div className="flex items-center justify-between text-xs text-slate-400 px-1 pt-1">
                  <button
                    type="button"
                    onClick={() => { setMode('recovery'); setError(''); }}
                    className="hover:text-pink-400 transition-colors flex items-center gap-1"
                  >
                    <KeyRound className="w-3.5 h-3.5 text-pink-400" />
                    <span>Forgot PIN?</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setMode('register'); setError(''); setPin(''); }}
                    className="hover:text-pink-400 transition-colors"
                  >
                    Switch Account
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* MODE: REGISTER ACCOUNT WITH PIN */}
          {mode === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div className="text-center mb-2">
                <h3 className="text-lg font-semibold text-slate-100">Create Security Profile</h3>
                <p className="text-xs text-slate-400">Set up your username and secret PIN</p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Display Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 w-4 h-4 text-pink-400" />
                    <input
                      type="text"
                      required
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="e.g. Alex Vance"
                      className="w-full pl-9 pr-3 py-2 text-sm bg-slate-800/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-pink-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Unique Username</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-sm text-pink-400 font-bold">@</span>
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value.toLowerCase())}
                      placeholder="alex_v"
                      className="w-full pl-8 pr-3 py-2 text-sm bg-slate-800/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-pink-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Create 4-6 Digit PIN</label>
                  <input
                    type="password"
                    required
                    maxLength={6}
                    value={pin}
                    onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                    placeholder="••••••"
                    className="w-full px-3 py-2 text-center text-lg tracking-widest font-mono bg-slate-800/80 border border-slate-700 rounded-xl text-pink-300 placeholder-slate-600 focus:outline-none focus:border-pink-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Status Bio (Optional)</label>
                  <input
                    type="text"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="e.g. Ready to chat ⚡"
                    className="w-full px-3 py-2 text-sm bg-slate-800/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-pink-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 mt-2 text-sm font-bold tracking-wide text-white transition-all bg-gradient-to-r from-pink-500 to-indigo-600 rounded-xl hover:from-pink-600 hover:to-indigo-700 shadow-lg shadow-pink-500/25 active:scale-[0.99]"
              >
                {isSubmitting ? 'Creating Account...' : 'Complete & Launch ⚡'}
              </button>

              {user && (
                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => { setMode('login'); setError(''); }}
                    className="text-xs text-pink-400 hover:underline"
                  >
                    Back to PIN Login
                  </button>
                </div>
              )}
            </form>
          )}

          {/* MODE: RECOVERY CODE SUCCESS */}
          {mode === 'recovery_success' && (
            <div className="space-y-4 text-center">
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-emerald-500/20 text-emerald-400 rounded-full border border-emerald-500/40">
                <ShieldCheck className="w-6 h-6" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-white">Save Your Recovery Key!</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Keep this safe. If you forget your PIN, this key will verify your identity across any device.
                </p>
              </div>

              <div className="p-3 bg-slate-800/90 border border-pink-500/40 rounded-xl flex items-center justify-between">
                <span className="font-mono text-sm tracking-wider font-bold text-pink-300">
                  {generatedRecoveryCode}
                </span>
                <button
                  type="button"
                  onClick={copyRecoveryCode}
                  className="p-2 text-xs font-semibold text-pink-400 hover:text-white bg-pink-500/20 hover:bg-pink-500/40 rounded-lg transition-colors flex items-center gap-1"
                >
                  {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedCode ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setPin('');
                }}
                className="w-full py-3 text-sm font-bold text-white bg-gradient-to-r from-pink-500 to-indigo-600 rounded-xl hover:from-pink-600 hover:to-indigo-700 shadow-lg shadow-pink-500/25"
              >
                I Have Saved My Code — Continue
              </button>
            </div>
          )}

          {/* MODE: PIN RECOVERY */}
          {mode === 'recovery' && (
            <form onSubmit={handleRecoverySubmit} className="space-y-4">
              <div className="text-center mb-2">
                <h3 className="text-lg font-semibold text-white">PIN Recovery</h3>
                <p className="text-xs text-slate-400">Verify username & recovery key to set a new PIN</p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Username</label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase())}
                    placeholder="e.g. alex_v"
                    className="w-full px-3 py-2 text-sm bg-slate-800/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-pink-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Recovery Code</label>
                  <input
                    type="text"
                    required
                    value={recoveryCodeInput}
                    onChange={(e) => setRecoveryCodeInput(e.target.value.toUpperCase())}
                    placeholder="PING-XXXX-XXXX"
                    className="w-full px-3 py-2 text-sm font-mono tracking-wider bg-slate-800/80 border border-slate-700 rounded-xl text-pink-300 placeholder-slate-500 focus:outline-none focus:border-pink-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">New 4-6 Digit PIN</label>
                  <input
                    type="password"
                    required
                    maxLength={6}
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                    placeholder="••••••"
                    className="w-full px-3 py-2 text-center text-lg tracking-widest font-mono bg-slate-800/80 border border-slate-700 rounded-xl text-pink-300 placeholder-slate-600 focus:outline-none focus:border-pink-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 text-sm font-bold text-white bg-gradient-to-r from-pink-500 to-indigo-600 rounded-xl hover:from-pink-600 hover:to-indigo-700 shadow-lg shadow-pink-500/25"
              >
                {isSubmitting ? 'Resetting...' : 'Reset PIN & Unlock'}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => { setMode('login'); setError(''); }}
                  className="text-xs text-pink-400 hover:underline"
                >
                  Cancel & Back to PIN Login
                </button>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
};
