// import React, { useState, useRef } from 'react';
// import { Upload, FileText, Zap } from 'lucide-react';
// import axios from 'axios';

// const API = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000';

// const styles = {
//   panel: {
//     background: 'linear-gradient(135deg, #111118 0%, #1a1a26 100%)',
//     border: '1px solid #2a2a3a',
//     borderRadius: '20px',
//     padding: '40px',
//     animation: 'fadeUp 0.5s ease forwards',
//   },
//   title: {
//     fontFamily: 'Syne, sans-serif',
//     fontSize: '2.2rem',
//     fontWeight: 800,
//     background: 'linear-gradient(135deg, #6c63ff, #43e8b0)',
//     WebkitBackgroundClip: 'text',
//     WebkitTextFillColor: 'transparent',
//     marginBottom: '8px',
//   },
//   subtitle: { color: '#9090a8', fontSize: '1rem', marginBottom: '36px' },
//   label: { display: 'block', color: '#9090a8', fontSize: '0.8rem', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px' },
//   input: {
//     width: '100%', background: '#0a0a0f', border: '1px solid #2a2a3a',
//     borderRadius: '12px', padding: '14px 16px', color: '#e8e8f0',
//     fontSize: '0.95rem', outline: 'none', transition: 'border-color 0.2s',
//     fontFamily: 'DM Sans, sans-serif',
//   },
//   dropzone: (dragging, hasFile) => ({
//     border: `2px dashed ${hasFile ? '#43e8b0' : dragging ? '#6c63ff' : '#2a2a3a'}`,
//     borderRadius: '16px',
//     padding: '40px',
//     textAlign: 'center',
//     cursor: 'pointer',
//     transition: 'all 0.3s',
//     background: hasFile ? 'rgba(67,232,176,0.05)' : dragging ? 'rgba(108,99,255,0.05)' : 'transparent',
//   }),
//   btn: (disabled) => ({
//     width: '100%', padding: '16px', borderRadius: '12px', border: 'none',
//     background: disabled ? '#2a2a3a' : 'linear-gradient(135deg, #6c63ff, #43e8b0)',
//     color: disabled ? '#9090a8' : '#0a0a0f', fontFamily: 'Syne, sans-serif',
//     fontWeight: 700, fontSize: '1rem', cursor: disabled ? 'not-allowed' : 'pointer',
//     transition: 'all 0.3s', letterSpacing: '0.05em',
//   }),
//   diffRow: { display: 'flex', gap: '10px', marginTop: '4px' },
//   diffBtn: (active, color) => ({
//     flex: 1, padding: '10px', borderRadius: '10px', border: `1px solid ${active ? color : '#2a2a3a'}`,
//     background: active ? `${color}18` : 'transparent', color: active ? color : '#9090a8',
//     fontFamily: 'Syne, sans-serif', fontWeight: 600, fontSize: '0.85rem',
//     cursor: 'pointer', transition: 'all 0.2s',
//   }),
//   error: { background: 'rgba(255,101,132,0.1)', border: '1px solid rgba(255,101,132,0.3)', borderRadius: '10px', padding: '12px 16px', color: '#ff6584', fontSize: '0.9rem', marginTop: '16px' },
//   success: { background: 'rgba(67,232,176,0.1)', border: '1px solid rgba(67,232,176,0.3)', borderRadius: '10px', padding: '12px 16px', color: '#43e8b0', fontSize: '0.9rem', marginTop: '16px' },
// };

// const DIFF_COLORS = { Easy: '#43e8b0', Medium: '#f5a623', Hard: '#ff6584' };

// export default function UploadPanel({ onGenerated, onLoading }) {
//   const [file, setFile] = useState(null);
//   const [difficulty, setDifficulty] = useState('Medium');
//   const [dragging, setDragging] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [uploadMsg, setUploadMsg] = useState('');
//   const [step, setStep] = useState('');
//   const fileRef = useRef();

//   const handleDrop = (e) => {
//     e.preventDefault(); setDragging(false);
//     const f = e.dataTransfer.files[0];
//     if (f) setFile(f);
//   };

//   const handleGenerate = async () => {
//     // ✅ FIX: Use correct localStorage key 'studyai_token'
//     const token = localStorage.getItem('studyai_token');

//     if (!file) {
//       setError('Please upload a file first.');
//       return;
//     }
//     if (!token) {
//       setError('Please login with Google first.');
//       return;
//     }

//     setLoading(true);
//     setError('');
//     setUploadMsg('');
//     setStep('Uploading transcript...');
//     onLoading(true);

//     try {
//       // Step 1: Upload & ingest
//       const form = new FormData();
//       form.append('file', file);

//       const up = await axios.post(`${API}/files/upload`, form, {
//         headers: {
//           'Content-Type': 'multipart/form-data',
//           'Authorization': `Bearer ${token}`,
//         },
//         timeout: 60000,
//       });

//       const fileId = up.data.file_id;
//       console.log('Upload response:', up.data);
//       console.log('File ID:', fileId);
//       if (!fileId) throw new Error('Upload succeeded but no file_id returned.');

//       setUploadMsg('File uploaded successfully!');
//       setStep('Generating notes, quiz & flashcards... (this may take 2-3 min)');

//       // Step 2: Generate — token re-read fresh to avoid expiry between calls
//       const freshToken = localStorage.getItem('studyai_token');
//       console.log('Token for generate:', freshToken ? 'present' : 'MISSING');

//       const gen = await axios.post(`${API}/generate`, {
//         file_ids: [fileId],
//         difficulty: difficulty,
//         notes: true,
//         quiz: true,
//         flashcards: true,
//       }, {
//         headers: { 'Authorization': `Bearer ${freshToken}` },
//         timeout: 300000, // 5 min
//       });

//       onGenerated({
//         notes: gen.data.notes,
//         quiz: gen.data.quiz,
//         flashcards: gen.data.flashcards,
//         difficulty,
//       });

//     } catch (err) {
//       console.error('Generation Error:', err);
//       if (err.code === 'ERR_NETWORK' || err.code === 'ECONNABORTED') {
//         setError('Cannot reach server or request timed out. Try again in a moment.');
//       } else if (err.response?.status === 401) {
//         setError('Session expired. Please log in again.');
//       } else if (err.response?.status === 422) {
//         setError('Invalid request data. Check your API key and file.');
//       } else {
//         setError(err.response?.data?.detail || err.message || 'Something went wrong.');
//       }
//     } finally {
//       setLoading(false);
//       onLoading(false);
//       setStep('');
//     }
//   };

//   return (
//     <div style={styles.panel}>
//       <div style={styles.title}>AI Study Generator</div>
//       <div style={styles.subtitle}>Upload a lecture transcript → get notes, quiz & flashcards instantly</div>


//       {/* Dropzone */}
//       <div style={{ marginBottom: '24px' }}>
//         <label style={styles.label}><FileText size={12} style={{ marginRight: 6 }} />Transcript File</label>
//         <div
//           style={styles.dropzone(dragging, !!file)}
//           onClick={() => fileRef.current.click()}
//           onDragOver={e => { e.preventDefault(); setDragging(true); }}
//           onDragLeave={() => setDragging(false)}
//           onDrop={handleDrop}
//         >
//           <input ref={fileRef} type="file" accept=".pdf,.txt,.md" style={{ display: 'none' }} onChange={e => setFile(e.target.files[0])} />
//           <Upload size={32} color={file ? '#43e8b0' : '#9090a8'} style={{ marginBottom: 12 }} />
//           {file ? (
//             <div>
//               <div style={{ color: '#43e8b0', fontWeight: 600 }}>{file.name}</div>
//               <div style={{ color: '#9090a8', fontSize: '0.85rem' }}>{(file.size / 1024).toFixed(1)} KB — click to change</div>
//             </div>
//           ) : (
//             <div>
//               <div style={{ color: '#e8e8f0', fontWeight: 500 }}>Drop your file here</div>
//               <div style={{ color: '#9090a8', fontSize: '0.85rem' }}>Supports .pdf, .txt, .md</div>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Difficulty */}
//       <div style={{ marginBottom: '32px' }}>
//         <label style={styles.label}>Difficulty Level</label>
//         <div style={styles.diffRow}>
//           {['Easy', 'Medium', 'Hard'].map(d => (
//             <button key={d} style={styles.diffBtn(difficulty === d, DIFF_COLORS[d])} onClick={() => setDifficulty(d)}>{d}</button>
//           ))}
//         </div>
//       </div>

//       {/* Generate Button */}
//       <button
//         style={styles.btn(!file || loading)}
//         disabled={!file || loading}
//         onClick={handleGenerate}
//       >
//         {loading ? (
//           <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
//             <span style={{ width: 16, height: 16, border: '2px solid #0a0a0f', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />
//             {step || 'Processing...'}
//           </span>
//         ) : (
//           <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
//             <Zap size={16} /> Generate Everything
//           </span>
//         )}
//       </button>

//       {error && <div style={styles.error}>⚠️ {error}</div>}
//       {uploadMsg && !error && <div style={styles.success}>✓ {uploadMsg}</div>}

//       {/* Backend status hint */}
//       <div style={{ marginTop: 16, padding: '10px 14px', background: '#0a0a0f', borderRadius: '10px', border: '1px solid #2a2a3a', fontSize: '0.78rem', color: '#9090a8' }}>
//         Backend: <a href={API} target="_blank" rel="noreferrer" style={{ color: '#6c63ff' }}>{API}</a> — must show JSON to work
//       </div>

//       {/* Pipeline info */}
//       <div style={{ marginTop: 16, padding: '16px', background: '#0a0a0f', borderRadius: '12px', border: '1px solid #2a2a3a' }}>
//         <div style={{ color: '#9090a8', fontSize: '0.78rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>RAG Pipeline</div>
//         {['Upload transcript', 'Chunk & embed with FAISS', 'Retrieve relevant context', 'Gemini 1.5 Flash generates'].map((s, i) => (
//           <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
//             <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'linear-gradient(135deg, #6c63ff, #43e8b0)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, color: '#0a0a0f', flexShrink: 0 }}>{i + 1}</div>
//             <div style={{ color: '#9090a8', fontSize: '0.82rem' }}>{s}</div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }

import React, { useState, useRef } from 'react';
import { Upload, Key, FileText, Zap } from 'lucide-react';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000';

const styles = {
  panel: {
    background: 'linear-gradient(135deg, #111118 0%, #1a1a26 100%)',
    border: '1px solid #2a2a3a',
    borderRadius: '20px',
    padding: '40px',
    animation: 'fadeUp 0.5s ease forwards',
  },
  title: {
    fontFamily: 'Syne, sans-serif',
    fontSize: '2.2rem',
    fontWeight: 800,
    background: 'linear-gradient(135deg, #6c63ff, #43e8b0)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    marginBottom: '8px',
  },
  subtitle: { 
    color: '#9090a8', 
    fontSize: '1rem', 
    marginBottom: '36px' 
  },
  label: { 
    display: 'block', 
    color: '#9090a8', 
    fontSize: '0.8rem', 
    fontWeight: 500, 
    letterSpacing: '0.1em', 
    textTransform: 'uppercase', 
    marginBottom: '8px' 
  },
  input: {
    width: '100%', 
    background: '#0a0a0f', 
    border: '1px solid #2a2a3a',
    borderRadius: '12px', 
    padding: '14px 16px', 
    color: '#e8e8f0',
    fontSize: '0.95rem', 
    outline: 'none', 
    transition: 'border-color 0.2s',
    fontFamily: 'DM Sans, sans-serif',
  },
  dropzone: (dragging, hasFile) => ({
    border: `2px dashed ${hasFile ? '#43e8b0' : dragging ? '#6c63ff' : '#2a2a3a'}`,
    borderRadius: '16px',
    padding: '40px',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.3s',
    background: hasFile ? 'rgba(67,232,176,0.05)' : dragging ? 'rgba(108,99,255,0.05)' : 'transparent',
  }),
  btn: (disabled) => ({
    width: '100%', 
    padding: '16px', 
    borderRadius: '12px', 
    border: 'none',
    background: disabled ? '#2a2a3a' : 'linear-gradient(135deg, #6c63ff, #43e8b0)',
    color: disabled ? '#9090a8' : '#0a0a0f', 
    fontFamily: 'Syne, sans-serif',
    fontWeight: 700, 
    fontSize: '1rem', 
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.3s', 
    letterSpacing: '0.05em',
  }),
  diffRow: { 
    display: 'flex', 
    gap: '10px', 
    marginTop: '4px' 
  },
  diffBtn: (active, color) => ({
    flex: 1, 
    padding: '10px', 
    borderRadius: '10px', 
    border: `1px solid ${active ? color : '#2a2a3a'}`,
    background: active ? `${color}18` : 'transparent', 
    color: active ? color : '#9090a8',
    fontFamily: 'Syne, sans-serif', 
    fontWeight: 600, 
    fontSize: '0.85rem',
    cursor: 'pointer', 
    transition: 'all 0.2s',
  }),
  error: { 
    background: 'rgba(255,101,132,0.1)', 
    border: '1px solid rgba(255,101,132,0.3)', 
    borderRadius: '10px', 
    padding: '12px 16px', 
    color: '#ff6584', 
    fontSize: '0.9rem', 
    marginTop: '16px' 
  },
  success: { 
    background: 'rgba(67,232,176,0.1)', 
    border: '1px solid rgba(67,232,176,0.3)', 
    borderRadius: '10px', 
    padding: '12px 16px', 
    color: '#43e8b0', 
    fontSize: '0.9rem', 
    marginTop: '16px' 
  },
};

const DIFF_COLORS = { Easy: '#43e8b0', Medium: '#f5a623', Hard: '#ff6584' };

export default function UploadPanel({ onGenerated, onLoading }) {
  const [apiKey, setApiKey] = useState('');
  const [file, setFile] = useState(null);
  const [difficulty, setDifficulty] = useState('Medium');
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploadMsg, setUploadMsg] = useState('');
  const [step, setStep] = useState('');
  const fileRef = useRef();

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) setFile(f);
  };

  const handleGenerate = async () => {
    if (!apiKey || !file) return;
    setLoading(true);
    setError('');
    setUploadMsg('');
    setStep('Uploading transcript...');
    onLoading(true);

    try {
      // Step 1: Upload & ingest — direct to backend
      const form = new FormData();
      form.append('file', file);
      form.append('api_key', apiKey);
      const up = await axios.post(`${API}/upload`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 60000,
      });
      setUploadMsg(up.data.message);
      setStep('Generating notes, quiz & flashcards...');

      // Step 2: Generate all — direct to backend
      const gen = await axios.post(`${API}/generate/all`, {
        api_key: apiKey,
        difficulty
      }, { timeout: 120000 });

      onGenerated({
        notes: gen.data.notes,
        quiz: gen.data.quiz,
        flashcards: gen.data.flashcards,
        difficulty
      });
    } catch (err) {
      if (err.code === 'ERR_NETWORK' || err.code === 'ECONNREFUSED') {
        setError('Cannot reach backend. Make sure uvicorn is running on port 8000.');
      } else {
        setError(err.response?.data?.detail || err.message || 'Something went wrong.');
      }
    } finally {
      setLoading(false);
      onLoading(false);
      setStep('');
    }
  };

  return (
    <div style={styles.panel}>
      <div style={styles.title}>AI Study Generator</div>
      <div style={styles.subtitle}>Upload a lecture transcript → get notes, quiz & flashcards instantly</div>

      {/* API Key */}
      <div style={{ marginBottom: '24px' }}>
        <label style={styles.label}>
          <Key size={12} style={{ marginRight: 6 }} />
          Gemini API Key
        </label>
        <input
          style={styles.input}
          type="password"
          placeholder="AIza..."
          value={apiKey}
          onChange={e => setApiKey(e.target.value)}
          onFocus={e => e.target.style.borderColor = '#6c63ff'}
          onBlur={e => e.target.style.borderColor = '#2a2a3a'}
        />
        <div style={{ color: '#9090a8', fontSize: '0.78rem', marginTop: 6 }}>
          Free key from <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" style={{ color: '#6c63ff' }}>Google AI Studio</a>
        </div>
      </div>

      {/* Dropzone */}
      <div style={{ marginBottom: '24px' }}>
        <label style={styles.label}>
          <FileText size={12} style={{ marginRight: 6 }} />
          Transcript File
        </label>
        <div
          style={styles.dropzone(dragging, !!file)}
          onClick={() => fileRef.current.click()}
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
        >
          <input 
            ref={fileRef} 
            type="file" 
            accept=".pdf,.txt,.md" 
            style={{ display: 'none' }} 
            onChange={e => setFile(e.target.files[0])} 
          />
          <Upload size={32} color={file ? '#43e8b0' : '#9090a8'} style={{ marginBottom: 12 }} />
          {file ? (
            <div>
              <div style={{ color: '#43e8b0', fontWeight: 600 }}>{file.name}</div>
              <div style={{ color: '#9090a8', fontSize: '0.85rem' }}>
                {(file.size / 1024).toFixed(1)} KB — click to change
              </div>
            </div>
          ) : (
            <div>
              <div style={{ color: '#e8e8f0', fontWeight: 500 }}>Drop your file here</div>
              <div style={{ color: '#9090a8', fontSize: '0.85rem' }}>Supports .pdf, .txt, .md</div>
            </div>
          )}
        </div>
      </div>

      {/* Difficulty */}
      <div style={{ marginBottom: '32px' }}>
        <label style={styles.label}>Difficulty Level</label>
        <div style={styles.diffRow}>
          {['Easy', 'Medium', 'Hard'].map(d => (
            <button 
              key={d} 
              style={styles.diffBtn(difficulty === d, DIFF_COLORS[d])} 
              onClick={() => setDifficulty(d)}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Generate Button */}
      <button
        style={styles.btn(!apiKey || !file || loading)}
        disabled={!apiKey || !file || loading}
        onClick={handleGenerate}
      >
        {loading ? (
          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <span style={{ 
              width: 16, 
              height: 16, 
              border: '2px solid #0a0a0f', 
              borderTopColor: 'transparent', 
              borderRadius: '50%', 
              display: 'inline-block', 
              animation: 'spin 0.8s linear infinite' 
            }} />
            {step || 'Processing...'}
          </span>
        ) : (
          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <Zap size={16} /> Generate Everything
          </span>
        )}
      </button>

      {error && <div style={styles.error}>⚠️ {error}</div>}
      {uploadMsg && !error && <div style={styles.success}>✓ {uploadMsg}</div>}

      {/* Backend status hint */}
      <div style={{ marginTop: 16, padding: '10px 14px', background: '#0a0a0f', borderRadius: '10px', border: '1px solid #2a2a3a', fontSize: '0.78rem', color: '#9090a8' }}>
        Backend: <a href="http://127.0.0.1:8000" target="_blank" rel="noreferrer" style={{ color: '#6c63ff' }}>http://127.0.0.1:8000</a> — must show JSON to work
      </div>

      {/* Pipeline info */}
      <div style={{ marginTop: 16, padding: '16px', background: '#0a0a0f', borderRadius: '12px', border: '1px solid #2a2a3a' }}>
        <div style={{ color: '#9090a8', fontSize: '0.78rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>
          RAG Pipeline
        </div>
        {['Upload transcript', 'Chunk & embed with FAISS', 'Retrieve relevant context', 'Gemini 1.5 Flash generates'].map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <div style={{ 
              width: 20, 
              height: 20, 
              borderRadius: '50%', 
              background: 'linear-gradient(135deg, #6c63ff, #43e8b0)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              fontSize: '0.7rem', 
              fontWeight: 700, 
              color: '#0a0a0f', 
              flexShrink: 0 
            }}>
              {i + 1}
            </div>
            <div style={{ color: '#9090a8', fontSize: '0.82rem' }}>{s}</div>
          </div>
        ))}
      </div>
    </div>
  );
}