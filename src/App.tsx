import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, 
  User, 
  Swords, 
  LogOut, 
  Facebook, 
  Users, 
  LogIn 
} from 'lucide-react';
import { auth, facebookProvider, googleProvider } from './firebase';
import { signInWithPopup, onAuthStateChanged, signOut, User as FirebaseUser } from 'firebase/auth';
import ErrorBoundary from './components/ErrorBoundary';
import { PhaserGame } from './game/PhaserGame';

export default function App() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [userType, setUserType] = useState<'guest' | 'registered' | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameLoading, setGameLoading] = useState(false);

  const initiateGame = () => {
    setGameLoading(true);
    setTimeout(() => {
      setGameLoading(false);
      setGameStarted(true);
    }, 2500);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      if (currentUser) setUserType('registered');
    });
    return () => unsubscribe();
  }, []);

  const handleSocialLogin = async (provider: any) => {
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Citadel Entry Failed:', error);
    }
  };

  const handleLogout = () => signOut(auth);

  if (loading) {
    return (
      <div className="min-h-screen bg-fort-bg flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-noble-red/5 animate-pulse" />
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative z-10 text-center">
          <img src="/icon.svg" className="w-24 h-24 mx-auto mb-8 gold-glow animate-bounce" alt="Icon" />
          <div className="text-royal-gold font-royal tracking-[0.5em] text-sm">Synchronizing Chronicles...</div>
        </motion.div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="cinematic-vignette" />
      <div className="film-grain" />
      <div className="scanlines" />

      <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden selection:bg-royal-gold/30">
        <div className="absolute inset-0 z-0 h-full w-full bg-[radial-gradient(#ffffff10_1px,transparent_1px)] [background-size:40px_40px] opacity-20" />

        <AnimatePresence mode="wait">
          {gameLoading ? (
            <motion.div 
              key="game-loading"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 1.1, filter: "blur(20px)" }}
              className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center"
            >
              <div className="space-y-12 text-center">
                <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 2 }} className="text-royal-gold font-royal text-4xl tracking-[0.4em]">
                  EXTRACTING_LEGEND...
                </motion.div>
                <div className="w-96 h-1 bg-white/5 relative overflow-hidden">
                  <motion.div initial={{ x: "-100%" }} animate={{ x: "0%" }} transition={{ duration: 2.5 }} className="absolute inset-0 bg-royal-gold shadow-[0_0_20px_#D4AF37]" />
                </div>
              </div>
            </motion.div>
          ) : gameStarted ? (
            <motion.div key="game-stage" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 overflow-hidden">
              <PhaserGame />
              <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="fixed inset-0 z-50 p-8 flex flex-col justify-between pointer-events-none">
                <div className="flex justify-between items-start">
                  <div className="glass-panel p-4 flex gap-8 items-center pointer-events-auto">
                    <div className="flex flex-col"><span className="hud-label">Location</span><span className="hud-value tracking-tight">Konda Reddy Buruju</span></div>
                    <div className="w-px h-8 bg-white/10" />
                    <div className="flex flex-col"><span className="hud-label">Objective</span><span className="hud-value text-red-500 animate-pulse">Escape Internal Bastion</span></div>
                  </div>
                </div>
                <div className="flex justify-between items-end">
                  <div className="relative pointer-events-auto">
                    <div className="w-48 h-48 rounded-full glass-panel border-2 border-royal-gold/20 overflow-hidden relative">
                      <div className="absolute inset-0 bg-fort-bg opacity-50" />
                      <motion.div animate={{ rotate: 360 }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }} className="absolute inset-0 bg-gradient-to-t from-royal-gold/5" />
                      <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-white rounded-full" />
                    </div>
                    <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 glass-panel px-4 py-1 rounded-full"><span className="text-[9px] font-mono text-zinc-400 tracking-widest">TUNNEL LEVEL 01</span></div>
                  </div>
                  <div className="flex flex-col gap-4 items-end pointer-events-auto text-right">
                    <div className="w-64 h-2 bg-white/10 rounded-full overflow-hidden relative"><motion.div initial={{ width: 0 }} animate={{ width: "85%" }} className="h-full bg-green-500" /><span className="absolute right-2 text-[8px] font-mono leading-none">HP</span></div>
                    <button onClick={() => setGameStarted(false)} className="mt-4 text-[10px] font-mono text-white/20 hover:text-white transition-colors">TERMINATE_SESSION</button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div key="auth-stage" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} className="z-10 w-full max-w-md text-center">
              {user ? (
                <div className="space-y-8">
                  <div className="relative inline-block pb-4">
                    <img src={user.photoURL || '/icon.svg'} alt="Avatar" className="w-28 h-28 border border-royal-gold/40 p-2 grayscale" />
                    <div className="absolute -bottom-2 right-1/2 translate-x-1/2 glass-panel p-2"><Shield className="w-5 h-5 gold-glow" /></div>
                  </div>
                  <h1 className="text-4xl font-royal gold-glow tracking-[0.2em]">{user.displayName}</h1>
                  <div className="grid gap-4 mt-12 px-8">
                    <button onClick={initiateGame} className="noble-button w-full py-5">Initiate Escape</button>
                    <button onClick={handleLogout} className="text-[10px] font-mono text-white/20 hover:text-noble-red uppercase">Terminating_Session</button>
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <img src="/icon.svg" alt="Icon" className="w-40 h-40 mx-auto mb-10 drop-shadow-[0_0_25px_#D4AF37] animate-pulse" />
                  <h1 className="text-5xl md:text-6xl font-royal gold-glow mb-4 tracking-[0.3em]">Legend</h1>
                  <p className="text-royal-gold/40 tracking-[0.6em] font-light text-xs mb-16 underline underline-offset-8">THE BURUJU ESCAPE</p>
                  <AnimatePresence mode="wait">
                    {!userType ? (
                      <motion.div key="selection" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1 }} className="grid gap-4 px-10">
                        <button onClick={() => setUserType('registered')} className="noble-button w-full">Citadel Portal</button>
                        <button onClick={() => setUserType('guest')} className="noble-button w-full !border-white/5 opacity-60">Scout Access</button>
                      </motion.div>
                    ) : (
                      <motion.div key="login-form" initial={{ opacity: 0, filter: "blur(10px)" }} animate={{ opacity: 1, filter: "blur(0)" }} className="space-y-8 glass-panel p-10 mx-6">
                        <div className="flex justify-between items-center mb-2">
                           <button onClick={() => setUserType(null)} className="hud-label hover:text-royal-gold">// RETURN</button>
                           <h2 className="text-lg tracking-[0.3em]">Access_Matrix</h2>
                        </div>
                        {userType === 'registered' ? (
                          <div className="space-y-4">
                            <button onClick={() => handleSocialLogin(facebookProvider)} className="w-full py-4 bg-[#1877F2]/10 border border-[#1877F2]/30 text-white rounded-none flex items-center justify-center gap-4 hover:bg-[#1877F2]/20"><Facebook className="w-5 h-5" /><span className="font-mono text-xs uppercase tracking-widest">Meta_Secure_Login</span></button>
                            <button onClick={() => handleSocialLogin(googleProvider)} className="w-full py-4 bg-white/5 border border-white/10 text-white rounded-none flex items-center justify-center gap-4 hover:bg-white/10"><img src="https://www.google.com/favicon.ico" className="w-4 h-4 grayscale" alt="Google" /><span className="font-mono text-xs uppercase tracking-widest">Chronicle_ID</span></button>
                          </div>
                        ) : (
                          <div className="space-y-6">
                            <p className="hud-label opacity-60 text-center lowercase">Scout data is volatile and will not be immortalized.</p>
                            <button onClick={initiateGame} className="noble-button w-full">Scout Entry</button>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
        <footer className="fixed bottom-8 text-[9px] tracking-[1em] opacity-10 uppercase font-mono w-full text-center">KONDA REDDY BURUJU // v1.0.42</footer>
      </div>
    </ErrorBoundary>
  );
}
