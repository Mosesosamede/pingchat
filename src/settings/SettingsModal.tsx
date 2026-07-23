import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import {
  X, Palette, ShieldCheck, KeyRound, Download, Upload, Volume2,
  Check, Copy, Sparkles, User, RefreshCw, Zap
} from 'lucide-react';
import { motion } from 'motion/react';
import { playPingSound } from '../../lib/audio';

interface SettingsModalProps {
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
  const {
    user, theme, setTheme, isE2EEEnabled, setIsE2EEEnabled, e2eKey, setE2eKey,
    updateProfile, updatePin
  } = useAuth();
  
  const { exportBackupJSON, importBackupJSON } = useChat();

  const [activeTab, setActiveTab] = useState<'appearance' | 'privacy' | 'security' | 'backup' | 'profile'>('appearance');

  // Profile Edit State
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [photoURL, setPhotoURL] = useState(user?.photoURL || '');

  // PIN Change State
  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [pinMsg, setPinMsg] = useState<{ text: string; isError: boolean } | null>(null);

  // Backup state
  const [backupJSON, setBackupJSON] = useState('');
  const [importInput, setImportInput] = useState('');
  const [backupCopied, setBackupCopied] = useState(false);
  const [importSuccess, setImportSuccess] = useState<boolean | null>(null);

  const [profileSuccess, setProfileSuccess] = useState(false);

  // Save profile
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile({ displayName, bio, photoURL });
    setProfileSuccess(true);
    setTimeout(() => setProfileSuccess(false), 2000);
  };

  // Change PIN
  const handleChangePin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPin.length < 4) {
      setPinMsg({ text: 'New PIN must be at least 4 digits', isError: true });
      return;
    }
    const success = await updatePin(oldPin, newPin);
    if (success) {
      setPinMsg({ text: 'PIN updated successfully!', isError: false });
      setOldPin('');
      setNewPin('');
    } else {
      setPinMsg({ text: 'Incorrect current PIN', isError: true });
    }
  };

  // Handle Export Backup
  const handleGenerateBackup = () => {
    const json = exportBackupJSON();
    setBackupJSON(json);
  };

  const handleCopyBackup = () => {
    navigator.clipboard.writeText(backupJSON);
    setBackupCopied(true);
    setTimeout(() => setBackupCopied(false), 2000);
  };

  // Handle Import Backup
  const handleRestoreBackup = async () => {
    if (!importInput.trim()) return;
    const res = await importBackupJSON(importInput);
    setImportSuccess(res);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-2xl bg-slate-900 border border-pink-500/30 rounded-3xl overflow-hidden text-white shadow-2xl flex flex-col md:flex-row h-[550px]"
      >
        {/* Left Settings Sidebar */}
        <div className="w-full md:w-56 bg-slate-950 p-4 border-r border-slate-800 flex flex-col justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-6 px-2">
              <div className="p-1.5 bg-pink-500/20 text-pink-400 rounded-xl">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="font-bold text-sm tracking-wide text-white">Settings</span>
            </div>

            <nav className="space-y-1">
              {[
                { id: 'appearance', label: 'Appearance', icon: Palette },
                { id: 'privacy', label: 'Privacy & E2EE', icon: ShieldCheck },
                { id: 'security', label: 'PIN & Security', icon: KeyRound },
                { id: 'backup', label: 'Backup & Restore', icon: Download },
                { id: 'profile', label: 'Edit Profile', icon: User },
              ].map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as any)}
                    className={`w-full px-3 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2.5 ${
                      isActive
                        ? 'bg-gradient-to-r from-pink-500 to-indigo-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="pt-4 border-t border-slate-800 px-2">
            <button
              onClick={playPingSound}
              className="w-full py-2 text-xs font-bold text-pink-300 bg-pink-500/10 hover:bg-pink-500/20 border border-pink-500/30 rounded-xl transition-all flex items-center justify-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>Test Ping Chime</span>
            </button>
          </div>
        </div>

        {/* Right Content View */}
        <div className="flex-1 p-6 overflow-y-auto relative flex flex-col justify-between bg-slate-900">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="space-y-6">
            {/* TAB: APPEARANCE */}
            {activeTab === 'appearance' && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-lg font-bold text-white">Theme & Visuals</h3>
                  <p className="text-xs text-slate-400">Choose your color palette and display mode</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: 'pink-blue', name: 'Pink & Blue Cyber', color: 'from-pink-500 to-sky-400' },
                    { id: 'dark', name: 'Midnight Dark', color: 'from-slate-800 to-slate-950' },
                    { id: 'light', name: 'Pure Light', color: 'from-rose-100 to-sky-100 text-slate-900' },
                    { id: 'neon', name: 'Electric Sky', color: 'from-cyan-400 to-pink-500' },
                  ].map(t => (
                    <button
                      key={t.id}
                      onClick={() => setTheme(t.id as any)}
                      className={`p-4 rounded-2xl border-2 transition-all flex flex-col gap-2 ${
                        theme === t.id
                          ? 'border-pink-500 bg-pink-500/10 shadow-lg shadow-pink-500/20'
                          : 'border-slate-800 bg-slate-800/50 hover:border-slate-700'
                      }`}
                    >
                      <div className={`w-full h-8 rounded-xl bg-gradient-to-r ${t.color}`} />
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span>{t.name}</span>
                        {theme === t.id && <Check className="w-4 h-4 text-pink-400" />}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: PRIVACY & E2EE */}
            {activeTab === 'privacy' && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-lg font-bold text-white">End-to-End Encryption</h3>
                  <p className="text-xs text-slate-400">Encrypt messages client-side before sending to Firestore</p>
                </div>

                <div className="p-4 bg-slate-800/80 border border-slate-700 rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="text-sm font-bold block text-white">Client-Side E2EE</span>
                    <span className="text-xs text-slate-400">Encrypt text with AES-GCM 256-bit keys</span>
                  </div>
                  <button
                    onClick={() => setIsE2EEEnabled(!isE2EEEnabled)}
                    className={`w-12 h-6 rounded-full transition-colors relative p-1 ${
                      isE2EEEnabled ? 'bg-pink-500' : 'bg-slate-700'
                    }`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                      isE2EEEnabled ? 'translate-x-6' : 'translate-x-0'
                    }`} />
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Custom Secret Passphrase</label>
                  <input
                    type="password"
                    value={e2eKey}
                    onChange={(e) => setE2eKey(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-slate-800 border border-slate-700 rounded-xl text-pink-300 font-mono"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">Both participants should match passphrases for private deciphering.</p>
                </div>
              </div>
            )}

            {/* TAB: SECURITY */}
            {activeTab === 'security' && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-lg font-bold text-white">PIN Security</h3>
                  <p className="text-xs text-slate-400">Update your PIN authentication code</p>
                </div>

                {pinMsg && (
                  <div className={`p-3 text-xs rounded-xl ${pinMsg.isError ? 'bg-rose-950 text-rose-300' : 'bg-emerald-950 text-emerald-300'}`}>
                    {pinMsg.text}
                  </div>
                )}

                <form onSubmit={handleChangePin} className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Current PIN</label>
                    <input
                      type="password"
                      maxLength={6}
                      value={oldPin}
                      onChange={(e) => setOldPin(e.target.value.replace(/\D/g, ''))}
                      className="w-full px-3 py-2 text-sm bg-slate-800 border border-slate-700 rounded-xl text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">New 4-6 Digit PIN</label>
                    <input
                      type="password"
                      maxLength={6}
                      value={newPin}
                      onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                      className="w-full px-3 py-2 text-sm bg-slate-800 border border-slate-700 rounded-xl text-pink-300 font-mono"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 text-xs font-bold text-white bg-pink-500 hover:bg-pink-600 rounded-xl shadow-md"
                  >
                    Update PIN
                  </button>
                </form>

                <div className="p-3 bg-slate-800/60 border border-slate-700/60 rounded-2xl">
                  <span className="text-xs font-bold text-slate-300 block mb-1">Your Account Recovery Key:</span>
                  <span className="font-mono text-xs text-pink-300 font-bold">{user?.recoveryCode}</span>
                </div>
              </div>
            )}

            {/* TAB: BACKUP & RESTORE */}
            {activeTab === 'backup' && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-lg font-bold text-white">Cross-Device Migration & Backup</h3>
                  <p className="text-xs text-slate-400">Export or restore your chat history JSON across devices</p>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={handleGenerateBackup}
                    className="w-full py-2.5 text-xs font-bold text-white bg-gradient-to-r from-pink-500 to-indigo-600 rounded-xl flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Generate Backup JSON</span>
                  </button>

                  {backupJSON && (
                    <div className="space-y-2">
                      <textarea
                        readOnly
                        rows={4}
                        value={backupJSON}
                        className="w-full p-2 text-[10px] font-mono bg-slate-950 border border-slate-800 rounded-xl text-slate-300"
                      />
                      <button
                        onClick={handleCopyBackup}
                        className="px-3 py-1.5 text-xs font-bold text-pink-300 bg-pink-500/20 rounded-lg flex items-center gap-1"
                      >
                        {backupCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{backupCopied ? 'Copied Backup!' : 'Copy JSON'}</span>
                      </button>
                    </div>
                  )}

                  <div className="pt-2 border-t border-slate-800">
                    <label className="block text-xs font-medium text-slate-300 mb-1">Restore from Backup JSON</label>
                    <textarea
                      rows={3}
                      value={importInput}
                      onChange={(e) => setImportInput(e.target.value)}
                      placeholder="Paste backup JSON string here..."
                      className="w-full p-2 text-xs font-mono bg-slate-800 border border-slate-700 rounded-xl text-white"
                    />
                    <button
                      onClick={handleRestoreBackup}
                      className="mt-2 w-full py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl flex items-center justify-center gap-2"
                    >
                      <Upload className="w-4 h-4" />
                      <span>Import & Restore</span>
                    </button>
                    {importSuccess === true && <p className="text-xs text-emerald-400 mt-1">Backup restored successfully!</p>}
                    {importSuccess === false && <p className="text-xs text-rose-400 mt-1">Invalid backup JSON data.</p>}
                  </div>
                </div>
              </div>
            )}

            {/* TAB: EDIT PROFILE */}
            {activeTab === 'profile' && (
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-white">User Profile</h3>
                  <p className="text-xs text-slate-400">Update display name, avatar, and status bio</p>
                </div>

                {profileSuccess && (
                  <div className="p-2 text-xs bg-emerald-950 text-emerald-300 rounded-xl">Profile updated!</div>
                )}

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Display Name</label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-slate-800 border border-slate-700 rounded-xl text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Avatar Image URL</label>
                  <input
                    type="text"
                    value={photoURL}
                    onChange={(e) => setPhotoURL(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-slate-800 border border-slate-700 rounded-xl text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Bio / Status</label>
                  <input
                    type="text"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-slate-800 border border-slate-700 rounded-xl text-white"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 text-xs font-bold text-white bg-pink-500 hover:bg-pink-600 rounded-xl shadow-md"
                >
                  Save Profile Changes
                </button>
              </form>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
