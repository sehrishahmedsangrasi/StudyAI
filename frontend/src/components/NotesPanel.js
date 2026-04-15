import React, { useState } from 'react';

const Tag = ({ children, color }) => (
  <span style={{ display: 'inline-block', fontSize: '0.7rem', border: `1px solid ${color}`, color, padding: '3px 8px', marginRight: 6, marginBottom: 6, fontFamily: 'Syne, sans-serif', fontWeight: 700, letterSpacing: '0.08em' }}>{children}</span>
);

function QAItem({ qa, index }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: '1px solid #1E1E1E', overflow: 'hidden' }}>
      <div onClick={() => setOpen(!open)} style={{ padding: '12px 0', cursor: 'pointer', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <span style={{ color: '#333', fontFamily: 'Bebas Neue', fontSize: 16, flexShrink: 0, marginTop: 1 }}>Q{String(index + 1).padStart(2, '0')}</span>
        <span style={{ color: open ? '#C8FF00' : '#aaa', fontSize: '0.83rem', fontFamily: 'DM Mono', lineHeight: 1.5, flex: 1, transition: 'color 0.15s' }}>{qa.question}</span>
        <span style={{ color: '#333', flexShrink: 0, display: 'inline-block', transform: open ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }}>›</span>
      </div>
      {open && (
        <div style={{ paddingBottom: 14, paddingLeft: 36 }}>
          <div style={{ fontSize: '0.82rem', color: '#6BFFE8', fontFamily: 'DM Mono', lineHeight: 1.7, borderLeft: '2px solid #6BFFE8', paddingLeft: 12 }}>{qa.answer}</div>
        </div>
      )}
    </div>
  );
}

export function exportNotesToPDF(notes, title = 'Study Notes') {
  const win = window.open('', '_blank');
  const sections = [];

  if (notes.summary) {
    sections.push(`<div class="section"><div class="section-label">SUMMARY</div><p>${notes.summary}</p></div>`);
  }
  if (notes.key_concepts?.length) {
    sections.push(`<div class="section"><div class="section-label">KEY CONCEPTS</div><div class="tags">${notes.key_concepts.map(c => `<span class="tag">${c}</span>`).join('')}</div></div>`);
  }
  if (notes.definitions && Object.keys(notes.definitions).length) {
    const defs = Object.entries(notes.definitions).map(([t, d]) =>
      `<div class="def"><div class="def-term">${t}</div><div class="def-val">${d}</div></div>`
    ).join('');
    sections.push(`<div class="section"><div class="section-label">DEFINITIONS</div>${defs}</div>`);
  }
  if (notes.qa_pairs?.length) {
    const qas = notes.qa_pairs.map((qa, i) =>
      `<div class="qa"><div class="q">Q${String(i+1).padStart(2,'0')}. ${qa.question}</div><div class="a">→ ${qa.answer}</div></div>`
    ).join('');
    sections.push(`<div class="section"><div class="section-label">Q&A — ${notes.qa_pairs.length} QUESTIONS</div>${qas}</div>`);
  }
  if (notes.takeaways?.length) {
    const tks = notes.takeaways.map((t, i) => `<div class="takeaway"><span class="tk-num">${String(i+1).padStart(2,'0')}.</span><span>${t}</span></div>`).join('');
    sections.push(`<div class="section"><div class="section-label">TAKEAWAYS</div>${tks}</div>`);
  }

  win.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8">
<title>${title}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Mono:wght@400;500&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #0C0C0C; color: #F5F5F5; font-family: 'DM Mono', monospace; padding: 48px; max-width: 860px; margin: 0 auto; }
  h1 { font-family: 'Bebas Neue', sans-serif; font-size: 52px; letter-spacing: 0.05em; margin-bottom: 4px; }
  h1 span { color: #C8FF00; }
  .meta { color: #444; font-size: 11px; margin-bottom: 40px; }
  .section { border: 2px solid #2a2a2a; padding: 20px; margin-bottom: 20px; page-break-inside: avoid; }
  .section-label { font-family: 'Bebas Neue', sans-serif; font-size: 13px; letter-spacing: 0.2em; color: #555; margin-bottom: 14px; }
  p { font-size: 13px; line-height: 1.8; color: #ccc; }
  .tags { display: flex; flex-wrap: wrap; gap: 6px; }
  .tag { border: 1px solid #C8FF00; color: #C8FF00; padding: 3px 10px; font-size: 11px; font-weight: 700; letter-spacing: 0.08em; }
  .def { border-left: 3px solid #C8FF00; padding-left: 12px; margin-bottom: 12px; }
  .def-term { color: #C8FF00; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px; }
  .def-val { color: #888; font-size: 12px; line-height: 1.6; }
  .qa { margin-bottom: 14px; padding-bottom: 14px; border-bottom: 1px solid #1E1E1E; }
  .q { color: #ddd; font-size: 12px; line-height: 1.5; margin-bottom: 6px; }
  .a { color: #6BFFE8; font-size: 12px; line-height: 1.6; border-left: 2px solid #6BFFE8; padding-left: 10px; }
  .takeaway { display: flex; gap: 10px; margin-bottom: 10px; font-size: 12px; line-height: 1.6; color: #bbb; }
  .tk-num { color: #FF6B6B; font-family: 'Bebas Neue', sans-serif; font-size: 14px; flex-shrink: 0; }
  @media print { body { background: #fff; color: #000; } .section { border-color: #ddd; } .section-label { color: #999; } p,.def-val,.a,.takeaway { color: #333; } .tag { border-color: #666; color: #000; } .def-term { color: #000; } .a { color: #005a4e; border-color: #005a4e; } .tk-num { color: #c00; } }
</style>
</head><body>
<h1>STUDY<span>AI</span></h1>
<div class="meta">Generated on ${new Date().toLocaleDateString()} · StudyAI Generator</div>
${sections.join('')}
<script>window.onload = () => window.print();</script>
</body></html>`);
  win.document.close();
}

export default function NotesPanel({ notes }) {
  if (!notes) return null;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Export button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button className="nb-btn" onClick={() => exportNotesToPDF(notes)}
          style={{ padding: '8px 16px', background: 'transparent', color: '#C8FF00', fontSize: '0.72rem', border: '2px solid #C8FF00', display: 'flex', alignItems: 'center', gap: 6 }}>
          ↓ EXPORT PDF
        </button>
      </div>

      {notes.summary && (
        <div className="nb-card fade-up" style={{ padding: 20 }}>
          <div style={{ fontFamily: 'Bebas Neue', fontSize: 13, letterSpacing: '0.15em', color: '#555', marginBottom: 12 }}>SUMMARY</div>
          <p style={{ color: '#ccc', lineHeight: 1.8, fontSize: '0.85rem', fontFamily: 'DM Mono' }}>{notes.summary}</p>
        </div>
      )}

      {notes.key_concepts?.length > 0 && (
        <div className="nb-card fade-up" style={{ padding: 20 }}>
          <div style={{ fontFamily: 'Bebas Neue', fontSize: 13, letterSpacing: '0.15em', color: '#555', marginBottom: 12 }}>KEY CONCEPTS</div>
          <div>{notes.key_concepts.map((c, i) => <Tag key={i} color="#C8FF00">{c}</Tag>)}</div>
        </div>
      )}

      {notes.definitions && Object.keys(notes.definitions).length > 0 && (
        <div className="nb-card fade-up" style={{ padding: 20 }}>
          <div style={{ fontFamily: 'Bebas Neue', fontSize: 13, letterSpacing: '0.15em', color: '#555', marginBottom: 12 }}>DEFINITIONS</div>
          {Object.entries(notes.definitions).map(([term, def], i) => (
            <div key={i} style={{ borderLeft: '3px solid #C8FF00', paddingLeft: 12, marginBottom: 12 }}>
              <div style={{ color: '#C8FF00', fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '0.82rem', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{term}</div>
              <div style={{ color: '#888', fontSize: '0.8rem', fontFamily: 'DM Mono', lineHeight: 1.6 }}>{def}</div>
            </div>
          ))}
        </div>
      )}

      {notes.qa_pairs?.length > 0 && (
        <div className="nb-card fade-up" style={{ padding: 20 }}>
          <div style={{ fontFamily: 'Bebas Neue', fontSize: 13, letterSpacing: '0.15em', color: '#555', marginBottom: 4 }}>Q&A — {notes.qa_pairs.length} QUESTIONS</div>
          <div style={{ color: '#2a2a2a', fontSize: '0.65rem', fontFamily: 'DM Mono', marginBottom: 16 }}>// click any question to reveal answer</div>
          {notes.qa_pairs.map((qa, i) => <QAItem key={i} qa={qa} index={i} />)}
        </div>
      )}

      {notes.takeaways?.length > 0 && (
        <div className="nb-card fade-up" style={{ padding: 20 }}>
          <div style={{ fontFamily: 'Bebas Neue', fontSize: 13, letterSpacing: '0.15em', color: '#555', marginBottom: 12 }}>TAKEAWAYS</div>
          {notes.takeaways.map((t, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 10, alignItems: 'flex-start' }}>
              <span style={{ color: '#FF6B6B', flexShrink: 0, fontFamily: 'Bebas Neue', fontSize: 14, marginTop: 1 }}>{String(i + 1).padStart(2, '0')}.</span>
              <span style={{ color: '#bbb', fontSize: '0.82rem', fontFamily: 'DM Mono', lineHeight: 1.6 }}>{t}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}