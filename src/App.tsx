import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, 
  User, 
  Swords, 
  LogOut, 
  Facebook, 
  Users, 
  LogIn,
  Trophy,
  History
} from 'lucide-react';
import { auth, facebookProvider, googleProvider, db } from './firebase';
import { signInWithPopup, onAuthStateChanged, signOut, User as FirebaseUser } from 'firebase/auth';
import { collection, addDoc, query, orderBy, limit, onSnapshot, serverTimestamp } from 'firebase/firestore';
import ErrorBoundary from './components/ErrorBoundary';
import { PhaserGame } from './game/PhaserGame';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email || undefined,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId || undefined,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

interface Score {
  id: string;
  name: string;
  score: number;
  level: number;
  timestamp: any;
}

export default function App() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [userType, setUserType] = useState<'guest' | 'registered' | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameLoading, setGameLoading] = useState(false);
  const [highScores, setHighScores] = useState<Score[]>([]);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      if (currentUser) setUserType('registered');
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'scores'), orderBy('score', 'desc'), limit(10));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const scores = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Score));
      setHighScores(scores);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'scores');
    });
    return () => unsubscribe();
  }, []);

  const initiateGame = () => {
    setGameLoading(true);
    setTimeout(() => {
      setGameLoading(false);
      setGameStarted(true);
    }, 2500);
  };

  const handleGameOver = async (data: { score: number; level: number }) => {
    if (user || userType === 'guest') {
      try {
        await addDoc(collection(db, 'scores'), {
          uid: user?.uid || 'guest',
          name: user?.displayName || 'Unknown Scout',
          score: data.score,
          level: data.level,
          timestamp: serverTimestamp()
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, 'scores');
      }
    }
  };

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
          <img src={`${import.meta.env.BASE_URL}icon.svg`} className="w-24 h-24 mx-auto mb-8 gold-glow animate-bounce" alt="Icon" />
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
                <div className="flex justify-between w-96 font-mono text-[8px] text-white/20 uppercase tracking-[0.2em]">
                   <span>System//Konda_Reddy</span>
                   <span>Bastion//Live</span>
                </div>
              </div>
            </motion.div>
          ) : gameStarted ? (
            <motion.div key="game-stage" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 overflow-hidden">
              <PhaserGame onGameOver={handleGameOver} />
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
                    <button onClick={() => setGameStarted(false)} className="mt-4 text-[10px] font-mono text-white/20 hover:text-white transition-colors">TERMINATE_SESSION</button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div key="auth-stage" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} className="z-10 w-full max-w-md text-center">
              {showLeaderboard ? (
                <div className="glass-panel p-8 space-y-8 min-h-[500px] flex flex-col">
                  <div className="flex items-center justify-between">
                    <button onClick={() => setShowLeaderboard(false)} className="hud-label hover:text-royal-gold transition-colors">// CLOSE</button>
                    <h2 className="text-xl font-royal gold-glow tracking-widest uppercase">Ancient_Rankings</h2>
                  </div>
                  <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                    {highScores.map((s, idx) => (
                      <div key={s.id} className="flex items-center justify-between border-b border-white/5 pb-2 hover:bg-white/5 transition-colors p-2">
                        <div className="flex items-center gap-4">
                          <span className={`${idx < 3 ? 'text-royal-gold font-bold' : 'text-white/40'} font-mono text-xs w-4`}>{idx + 1}.</span>
                          <span className="text-sm font-medium tracking-wide">{s.name}</span>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-right">
                             <div className="text-[10px] text-white/40 uppercase">Floor</div>
                             <div className="text-xs font-mono">{s.level}</div>
                          </div>
                          <div className="text-right">
                             <div className="text-[10px] text-royal-gold/60 uppercase">Gold</div>
                             <div className="text-sm font-mono gold-glow">{s.score.toLocaleString()}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : user ? (
                <div className="space-y-8">
                  <div className="relative inline-block pb-4">
                    <img src={user.photoURL || `${import.meta.env.BASE_URL}icon.svg`} alt="Avatar" className="w-28 h-28 border border-royal-gold/40 p-2 grayscale" />
                    <div className="absolute -bottom-2 right-1/2 translate-x-1/2 glass-panel p-2"><Shield className="w-5 h-5 gold-glow" /></div>
                  </div>
                  <h1 className="text-4xl font-royal gold-glow tracking-[0.2em]">{user.displayName}</h1>
                  <div className="grid gap-4 mt-12 px-8">
                    <button onClick={initiateGame} className="noble-button w-full py-5">Initiate Escape</button>
                    <div className="grid grid-cols-2 gap-4">
                      <button onClick={() => setShowLeaderboard(true)} className="glass-panel py-3 flex items-center justify-center gap-2 text-[10px] font-mono uppercase tracking-widest hover:border-royal-gold/40 transition-colors">
                        <Trophy className="w-4 h-4 text-royal-gold" /> Rankings
                      </button>
                      <button onClick={handleLogout} className="glass-panel py-3 flex items-center justify-center gap-2 text-[10px] font-mono uppercase tracking-widest hover:text-noble-red transition-colors">
                        <LogOut className="w-4 h-4" /> Exit
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <img src={`${import.meta.env.BASE_URL}icon.svg`} alt="Icon" className="w-40 h-40 mx-auto mb-10 drop-shadow-[0_0_25px_#D4AF37] animate-pulse" />
                  <h1 className="text-5xl md:text-6xl font-royal gold-glow mb-4 tracking-[0.3em]">Legend</h1>
                  <p className="text-royal-gold/40 tracking-[0.6em] font-light text-xs mb-10 underline underline-offset-8">THE BURUJU ESCAPE</p>
                  
                  <div className="flex justify-center gap-6 mb-12 opacity-40">
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-8 h-8 rounded border border-white/20 flex items-center justify-center font-mono text-[10px]">L/R</div>
                      <span className="text-[8px] uppercase tracking-widest font-mono">Move</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-8 h-8 rounded border border-white/20 flex items-center justify-center font-mono text-[10px]">UP</div>
                      <span className="text-[8px] uppercase tracking-widest font-mono">Jump</span>
                    </div>
                  </div>
                  <AnimatePresence mode="wait">
                    {!userType ? (
                      <motion.div key="selection" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1 }} className="grid gap-4 px-10">
                        <button onClick={() => setUserType('registered')} className="noble-button w-full">Citadel Portal</button>
                        <button onClick={() => setUserType('guest')} className="noble-button w-full !border-white/5 opacity-60">Scout Access</button>
                        <button onClick={() => setShowLeaderboard(true)} className="mt-4 text-[10px] font-mono text-white/20 hover:text-royal-gold uppercase tracking-[0.4em] transition-colors flex items-center justify-center gap-2">
                          <History className="w-3 h-3" /> Old Chronicles
                        </button>
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
