import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import NotesPanel from './components/NotesPanel';
import QuizPanel from './components/QuizPanel';
import FlashcardsPanel from './components/FlashcardsPanel';
import HistoryDrawer from './components/HistoryDrawer';

const API = 'http://127.0.0.1:8000';

// ── Auth helpers ──────────────────────────────────────────────────────────────
const getToken = () => localStorage.getItem('studyai_token');
const getUser = () => { try { return JSON.parse(localStorage.getItem('studyai_user') || 'null'); } catch { return null; } };
const authHeaders = () => ({ Authorization: `Bearer ${getToken()}` });

// ── Noise texture overlay ─────────────────────────────────────────────────────
const Noise = () => (
  <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, opacity: 0.03,
    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'repeat', backgroundSize: '128px 128px'
  }} />
);

// ── Login Screen ──────────────────────────────────────────────────────────────
function LoginScreen() {
  const [hovered, setHovered] = useState(false);

  const handleGoogleLogin = async () => {
    const res = await axios.get(`${API}/auth/google`);
    window.location.href = res.data.url;
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0C0C0C', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, position: 'relative', overflow: 'hidden' }}>
      <Noise />

      {/* Big decorative text */}
      <div style={{ position: 'absolute', top: -20, left: -10, fontFamily: 'Bebas Neue', fontSize: 'clamp(120px, 20vw, 220px)', color: '#1A1A1A', lineHeight: 1, userSelect: 'none', zIndex: 0 }}>STUDY</div>
      <div style={{ position: 'absolute', bottom: -20, right: -10, fontFamily: 'Bebas Neue', fontSize: 'clamp(120px, 20vw, 220px)', color: '#1A1A1A', lineHeight: 1, userSelect: 'none', zIndex: 0 }}>AI</div>

      {/* Accent squares */}
      <div style={{ position: 'absolute', top: 60, right: 80, width: 40, height: 40, background: '#C8FF00', border: '2px solid #fff', boxShadow: '4px 4px 0 #fff' }} />
      <div style={{ position: 'absolute', bottom: 100, left: 60, width: 24, height: 24, background: '#FF6B6B', border: '2px solid #fff', boxShadow: '3px 3px 0 #fff' }} />
      <div style={{ position: 'absolute', top: '40%', right: 40, width: 16, height: 16, background: '#6BFFE8', border: '2px solid #fff' }} />

      {/* Main card */}
      <div className="nb-card fade-up" style={{ position: 'relative', zIndex: 1, padding: '48px 40px', maxWidth: 420, width: '100%', background: '#141414' }}>
        {/* Tag */}
        <div style={{ display: 'inline-block', background: '#C8FF00', color: '#0C0C0C', fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase', padding: '4px 10px', marginBottom: 24, border: '2px solid #0C0C0C' }}>
          Beta — Free for students
        </div>

        <h1 style={{ fontFamily: 'Bebas Neue', fontSize: 72, lineHeight: 0.9, marginBottom: 8, letterSpacing: '0.02em' }}>
          STUDY<br />
          <span style={{ color: '#C8FF00', WebkitTextStroke: '1px #C8FF00' }}>AI</span>
        </h1>

        <p style={{ color: '#666', fontSize: '0.82rem', lineHeight: 1.7, marginBottom: 36, fontFamily: 'DM Mono' }}>
          Drop your lecture files.<br />
          Get notes, quizzes & flashcards.<br />
          <span style={{ color: '#C8FF00' }}>No cap.</span>
        </p>

        <button
          className="nb-btn"
          onClick={handleGoogleLogin}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          style={{ width: '100%', padding: '16px 24px', background: hovered ? '#C8FF00' : '#F5F5F5', color: '#0C0C0C', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}
        >
          <svg width="18" height="18" viewBox="0 0 48 48">
            <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
            <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
            <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
            <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
          </svg>
          Continue with Google
        </button>

        <p style={{ color: '#333', fontSize: '0.7rem', textAlign: 'center', marginTop: 16, fontFamily: 'DM Mono' }}>
          your files stay yours. always.
        </p>
      </div>
    </div>
  );
}

// ── Header ────────────────────────────────────────────────────────────────────
function Header({ user, onHistoryToggle, historyOpen }) {
  return (
    <header style={{ borderBottom: '2px solid #fff', padding: '0 24px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#0C0C0C', position: 'sticky', top: 0, zIndex: 50 }}>
      <div style={{ fontFamily: 'Bebas Neue', fontSize: 28, letterSpacing: '0.1em' }}>
        STUDY<span style={{ color: '#C8FF00' }}>AI</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button className="nb-btn" onClick={onHistoryToggle}
          style={{ padding: '6px 14px', background: historyOpen ? '#C8FF00' : 'transparent', color: historyOpen ? '#0C0C0C' : '#F5F5F5', fontSize: '0.75rem' }}>
          HISTORY
        </button>
        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {user.avatar && <img src={user.avatar} alt="" style={{ width: 28, height: 28, border: '2px solid #fff', borderRadius: 0 }} />}
            <span style={{ fontSize: '0.75rem', color: '#666', fontFamily: 'DM Mono' }}>{user.name?.split(' ')[0]}</span>
            <button onClick={() => { localStorage.clear(); window.location.reload(); }}
              style={{ background: 'transparent', border: 'none', color: '#444', cursor: 'pointer', fontSize: '0.7rem', fontFamily: 'DM Mono' }}>
              [logout]
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

// ── File row ──────────────────────────────────────────────────────────────────
function FileRow({ file, selected, onToggle, onRemove }) {
  const [shaking, setShaking] = useState(false);

  const handleRemove = (e) => {
    e.stopPropagation();
    setShaking(true);
    setTimeout(() => { setShaking(false); onRemove(file.id); }, 400);
  };

  return (
    <div onClick={() => onToggle(file.id)} style={{
      display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
      border: `2px solid ${selected ? '#C8FF00' : '#333'}`,
      background: selected ? '#1E1E00' : '#141414',
      boxShadow: selected ? '3px 3px 0 #C8FF00' : '2px 2px 0 #333',
      marginBottom: 8, cursor: 'pointer', transition: 'all 0.1s',
      animation: shaking ? 'tilt 0.2s ease 2' : 'none',
    }}>
      <div style={{ width: 16, height: 16, border: `2px solid ${selected ? '#C8FF00' : '#555'}`, background: selected ? '#C8FF00' : 'transparent', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {selected && <span style={{ color: '#0C0C0C', fontSize: '0.6rem', fontWeight: 900, lineHeight: 1 }}>✓</span>}
      </div>
      <span style={{ flex: 1, fontSize: '0.78rem', color: selected ? '#C8FF00' : '#aaa', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: 'DM Mono' }}>
        {file.filename || file.name}
      </span>
      <span style={{ fontSize: '0.65rem', color: '#444', flexShrink: 0 }}>{file.chunks}c</span>
      <button onClick={handleRemove} style={{ background: 'transparent', border: 'none', color: '#444', cursor: 'pointer', padding: '0 2px', fontSize: '0.9rem', lineHeight: 1 }}>×</button>
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(getUser());
  const [token, setToken] = useState(getToken());

  const [files, setFiles] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadErr, setUploadErr] = useState('');

  const [wantNotes, setWantNotes] = useState(true);
  const [wantQuiz, setWantQuiz] = useState(true);
  const [wantFlash, setWantFlash] = useState(true);
  const [difficulty, setDifficulty] = useState('Medium');

  const [generating, setGenerating] = useState(false);
  const [genErr, setGenErr] = useState('');
  const [result, setResult] = useState(null);
  const [activeTab, setActiveTab] = useState('notes');

  const [history, setHistory] = useState([]);
  const [historyOpen, setHistoryOpen] = useState(false);

  const fileRef = useRef();

  // Handle OAuth redirect
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get('token');
    if (t) {
      const u = { name: params.get('name'), avatar: params.get('avatar'), email: params.get('email') };
      localStorage.setItem('studyai_token', t);
      localStorage.setItem('studyai_user', JSON.stringify(u));
      setToken(t); setUser(u);
      window.history.replaceState({}, '', '/');
    }
  }, []);

  // Load files + history on login
  useEffect(() => {
    if (!token) return;
    axios.get(`${API}/files`, { headers: authHeaders() })
      .then(r => setFiles(r.data.files || []))
      .catch(() => {});
    axios.get(`${API}/history`, { headers: authHeaders() })
      .then(r => setHistory(r.data.generations || []))
      .catch(() => {});

    // Restore last result from localStorage
    const saved = localStorage.getItem('studyai_last_result');
    if (saved) { try { setResult(JSON.parse(saved)); } catch {} }
  }, [token]);

  const handleUpload = async (e) => {
    const picked = Array.from(e.target.files);
    if (!picked.length) return;
    setUploading(true); setUploadErr('');
    for (const f of picked) {
      try {
        const form = new FormData();
        form.append('file', f);
        const res = await axios.post(`${API}/files/upload`, form, { headers: authHeaders(), timeout: 60000 });
        setFiles(prev => [...prev, { id: res.data.file_id, filename: res.data.filename, chunks: res.data.chunks }]);
      } catch (err) {
        setUploadErr(err.response?.data?.detail || err.message);
      }
    }
    setUploading(false); e.target.value = '';
  };

  const handleRemove = async (fileId) => {
    await axios.delete(`${API}/files/${fileId}`, { headers: authHeaders() });
    setFiles(prev => prev.filter(f => f.id !== fileId));
    setSelectedFiles(prev => prev.filter(id => id !== fileId));
  };

  const toggleFile = (id) =>
    setSelectedFiles(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const handleGenerate = async () => {
    if (!selectedFiles.length || (!wantNotes && !wantQuiz && !wantFlash)) return;
    setGenerating(true); setGenErr(''); setResult(null);
    try {
      const res = await axios.post(`${API}/generate`, {
        file_ids: selectedFiles, difficulty,
        notes: wantNotes, quiz: wantQuiz, flashcards: wantFlash,
      }, { headers: authHeaders(), timeout: 180000 });
      const r = { ...res.data, difficulty };
      setResult(r);
      localStorage.setItem('studyai_last_result', JSON.stringify(r));
      setActiveTab(wantNotes ? 'notes' : wantQuiz ? 'quiz' : 'flashcards');
      // Refresh history
      axios.get(`${API}/history`, { headers: authHeaders() }).then(r => setHistory(r.data.generations || []));
    } catch (err) {
      setGenErr(err.response?.data?.detail || err.message || 'Generation failed.');
    } finally { setGenerating(false); }
  };

  const loadFromHistory = (gen) => {
    setResult({ notes: gen.notes, quiz: gen.quiz, flashcards: gen.flashcards, difficulty: gen.difficulty });
    localStorage.setItem('studyai_last_result', JSON.stringify(gen));
    setActiveTab(gen.notes ? 'notes' : gen.quiz ? 'quiz' : 'flashcards');
    setHistoryOpen(false);
  };

  const DIFF = { Easy: '#6BFFE8', Medium: '#C8FF00', Hard: '#FF6B6B' };
  const TABS = [
    { id: 'notes', label: 'NOTES', color: '#C8FF00', show: !!result?.notes },
    { id: 'quiz', label: 'QUIZ', color: '#FF6B6B', show: !!result?.quiz },
    { id: 'flashcards', label: 'CARDS', color: '#6BFFE8', show: !!result?.flashcards },
  ].filter(t => t.show);

  if (!token || !user) return <LoginScreen />;

  return (
    <div style={{ minHeight: '100vh', background: '#0C0C0C', position: 'relative' }}>
      <Noise />
      <Header user={user} onHistoryToggle={() => setHistoryOpen(!historyOpen)} historyOpen={historyOpen} />

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 0, minHeight: 'calc(100vh - 56px)', position: 'relative', zIndex: 1 }}>

        {/* ── LEFT SIDEBAR ── */}
        <div style={{ borderRight: '2px solid #222', padding: 20, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Files section */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontFamily: 'Bebas Neue', fontSize: 18, letterSpacing: '0.1em', color: '#C8FF00' }}>FILES</span>
              <button className="nb-btn" onClick={() => fileRef.current.click()} disabled={uploading}
                style={{ padding: '5px 10px', background: 'transparent', color: '#F5F5F5', fontSize: '0.7rem' }}>
                {uploading ? '...' : '+ ADD'}
              </button>
              <input ref={fileRef} type="file" accept=".pdf,.txt,.md" multiple style={{ display: 'none' }} onChange={handleUpload} />
            </div>

            {uploadErr && <div style={{ fontSize: '0.72rem', color: '#FF6B6B', marginBottom: 8, fontFamily: 'DM Mono', border: '1px solid #FF6B6B', padding: '6px 8px' }}>{uploadErr}</div>}

            {files.length === 0 ? (
              <div style={{ border: '2px dashed #2a2a2a', padding: '24px 16px', textAlign: 'center', color: '#333', fontSize: '0.75rem', fontFamily: 'DM Mono' }}>
                // drop files here<br />
                <span style={{ fontSize: '0.65rem' }}>.pdf .txt .md</span>
              </div>
            ) : files.map(f => (
              <FileRow key={f.id} file={f} selected={selectedFiles.includes(f.id)} onToggle={toggleFile} onRemove={handleRemove} />
            ))}
          </div>

          {/* Divider */}
          {files.length > 0 && <div style={{ height: 2, background: '#1E1E1E' }} />}

          {/* Generate controls */}
          {files.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <span style={{ fontFamily: 'Bebas Neue', fontSize: 18, letterSpacing: '0.1em', color: '#F5F5F5' }}>GENERATE</span>

              {/* Output toggles */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {[
                  { label: 'NOTES + Q&A', state: wantNotes, set: setWantNotes, color: '#C8FF00' },
                  { label: 'QUIZ', state: wantQuiz, set: setWantQuiz, color: '#FF6B6B' },
                  { label: 'FLASHCARDS', state: wantFlash, set: setWantFlash, color: '#6BFFE8' },
                ].map(({ label, state, set, color }) => (
                  <div key={label} onClick={() => set(!state)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', border: `2px solid ${state ? color : '#2a2a2a'}`, background: state ? `${color}12` : 'transparent', cursor: 'pointer', transition: 'all 0.1s' }}>
                    <div style={{ width: 14, height: 14, border: `2px solid ${state ? color : '#444'}`, background: state ? color : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {state && <span style={{ color: '#0C0C0C', fontSize: '0.55rem', fontWeight: 900 }}>✓</span>}
                    </div>
                    <span style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '0.75rem', color: state ? color : '#555', letterSpacing: '0.08em' }}>{label}</span>
                  </div>
                ))}
              </div>

              {/* Difficulty */}
              <div style={{ display: 'flex', gap: 6 }}>
                {['Easy', 'Medium', 'Hard'].map(d => (
                  <button key={d} className="nb-btn" onClick={() => setDifficulty(d)}
                    style={{ flex: 1, padding: '6px 4px', background: difficulty === d ? DIFF[d] : 'transparent', color: difficulty === d ? '#0C0C0C' : '#555', fontSize: '0.65rem', border: `2px solid ${difficulty === d ? DIFF[d] : '#333'}` }}>
                    {d.toUpperCase()}
                  </button>
                ))}
              </div>

              {genErr && <div style={{ fontSize: '0.72rem', color: '#FF6B6B', border: '1px solid #FF6B6B', padding: '8px 10px', fontFamily: 'DM Mono', lineHeight: 1.5 }}>⚠ {genErr}</div>}

              <button className="nb-btn" onClick={handleGenerate}
                disabled={!selectedFiles.length || (!wantNotes && !wantQuiz && !wantFlash) || generating}
                style={{ padding: '14px', background: generating ? '#1E1E00' : '#C8FF00', color: '#0C0C0C', fontSize: '0.85rem', textAlign: 'center', width: '100%' }}>
                {generating ? (
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    <span style={{ width: 12, height: 12, border: '2px solid #0C0C0C', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />
                    PROCESSING...
                  </span>
                ) : 'RUN →'}
              </button>

              {!selectedFiles.length && <div style={{ fontSize: '0.65rem', color: '#333', textAlign: 'center', fontFamily: 'DM Mono' }}>// select files above</div>}
            </div>
          )}
        </div>

        {/* ── MAIN CONTENT ── */}
        <div style={{ padding: 28, overflowY: 'auto' }}>
          {!result ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: 400 }}>
              {/* Empty state — big typography */}
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'Bebas Neue', fontSize: 'clamp(60px, 10vw, 110px)', lineHeight: 0.9, color: '#1A1A1A', marginBottom: 24 }}>
                  UPLOAD.<br />SELECT.<br /><span style={{ color: '#C8FF00' }}>GENERATE.</span>
                </div>
                <p style={{ color: '#333', fontSize: '0.78rem', fontFamily: 'DM Mono', lineHeight: 1.8 }}>
                  {files.length === 0 ? '// add your lecture files on the left' : selectedFiles.length === 0 ? '// click files to select them' : '// hit RUN when ready'}
                </p>
              </div>
            </div>
          ) : (
            <div className="fade-up">
              {/* Tabs */}
              <div style={{ display: 'flex', gap: 0, marginBottom: 24, borderBottom: '2px solid #222' }}>
                {TABS.map(({ id, label, color }) => (
                  <button key={id} onClick={() => setActiveTab(id)} style={{ padding: '12px 24px', background: 'transparent', border: 'none', borderBottom: `3px solid ${activeTab === id ? color : 'transparent'}`, color: activeTab === id ? color : '#444', fontFamily: 'Bebas Neue', fontSize: 18, letterSpacing: '0.1em', cursor: 'pointer', transition: 'all 0.15s', marginBottom: -2 }}>
                    {label}
                  </button>
                ))}
                <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: '0.65rem', color: '#333', fontFamily: 'DM Mono' }}>{result.difficulty}</span>
                  <button onClick={() => { setResult(null); localStorage.removeItem('studyai_last_result'); }}
                    style={{ background: 'transparent', border: '1px solid #333', color: '#444', padding: '4px 10px', cursor: 'pointer', fontSize: '0.65rem', fontFamily: 'DM Mono' }}>
                    clear
                  </button>
                </div>
              </div>

              {activeTab === 'notes' && result.notes && <NotesPanel notes={result.notes} />}
              {activeTab === 'quiz' && result.quiz && <QuizPanel quiz={result.quiz} difficulty={result.difficulty} />}
              {activeTab === 'flashcards' && result.flashcards && <FlashcardsPanel flashcards={result.flashcards} difficulty={result.difficulty} />}
            </div>
          )}
        </div>
      </div>

      {/* History drawer */}
      <HistoryDrawer open={historyOpen} history={history} onLoad={loadFromHistory} onDelete={(id) => setHistory(prev => prev.filter(g => g.id !== id))} />
      {historyOpen && <div onClick={() => setHistoryOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 190, background: 'rgba(0,0,0,0.6)' }} />}
    </div>
  );
}