import React, { useState } from 'react';

function MCQCard({ q, index, onAnswer }) {
  const [selected, setSelected] = useState(null);

  const handlePick = (opt) => {
    if (selected) return;
    const letter = opt.charAt(0);
    setSelected(letter);
    onAnswer(letter === q.answer);
  };

  const getColor = (opt) => {
    if (!selected) return '#333';
    const letter = opt.charAt(0);
    if (letter === q.answer) return '#C8FF00';
    if (letter === selected) return '#FF6B6B';
    return '#222';
  };

  return (
    <div className="nb-card fade-up" style={{ padding: 20, marginBottom: 16 }}>
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'flex-start' }}>
        <span style={{ fontFamily: 'Bebas Neue', fontSize: 24, color: '#333', lineHeight: 1, flexShrink: 0 }}>{String(index + 1).padStart(2, '0')}</span>
        <span style={{ color: '#ddd', fontSize: '0.88rem', fontFamily: 'DM Mono', lineHeight: 1.6 }}>{q.question}</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {q.options.map((opt, i) => (
          <div key={i} onClick={() => handlePick(opt)} style={{ padding: '10px 14px', border: `2px solid ${getColor(opt)}`, cursor: selected ? 'default' : 'pointer', display: 'flex', alignItems: 'center', gap: 10, transition: 'all 0.1s', background: selected && opt.charAt(0) === q.answer ? '#1E1E00' : selected && opt.charAt(0) === selected ? '#1E0000' : 'transparent' }}>
            <span style={{ fontFamily: 'Bebas Neue', fontSize: 14, color: getColor(opt), flexShrink: 0 }}>{opt.charAt(0)}</span>
            <span style={{ fontSize: '0.82rem', fontFamily: 'DM Mono', color: selected ? (opt.charAt(0) === q.answer ? '#C8FF00' : opt.charAt(0) === selected ? '#FF6B6B' : '#444') : '#888' }}>{opt.slice(3)}</span>
          </div>
        ))}
      </div>
      {selected && q.explanation && (
        <div style={{ marginTop: 12, padding: '10px 14px', borderLeft: '3px solid #6BFFE8', background: '#001E1C' }}>
          <span style={{ fontSize: '0.75rem', color: '#6BFFE8', fontFamily: 'DM Mono', lineHeight: 1.6 }}>{q.explanation}</span>
        </div>
      )}
    </div>
  );
}

function ShortCard({ q, index }) {
  const [show, setShow] = useState(false);
  return (
    <div className="nb-card fade-up" style={{ padding: 20, marginBottom: 16 }}>
      <div style={{ display: 'flex', gap: 12, marginBottom: 14, alignItems: 'flex-start' }}>
        <span style={{ fontFamily: 'Bebas Neue', fontSize: 24, color: '#333', lineHeight: 1, flexShrink: 0 }}>S{String(index + 1).padStart(2, '0')}</span>
        <span style={{ color: '#ddd', fontSize: '0.88rem', fontFamily: 'DM Mono', lineHeight: 1.6 }}>{q.question}</span>
      </div>
      <button className="nb-btn" onClick={() => setShow(!show)} style={{ padding: '8px 14px', background: show ? '#FF6B6B' : 'transparent', color: show ? '#0C0C0C' : '#FF6B6B', fontSize: '0.72rem', border: '2px solid #FF6B6B' }}>
        {show ? 'HIDE ANSWER' : 'SHOW ANSWER'}
      </button>
      {show && (
        <div style={{ marginTop: 12, padding: '10px 14px', borderLeft: '3px solid #FF6B6B', background: '#1E0000' }}>
          <span style={{ fontSize: '0.8rem', color: '#FF6B6B', fontFamily: 'DM Mono', lineHeight: 1.7 }}>{q.sample_answer}</span>
        </div>
      )}
    </div>
  );
}

export default function QuizPanel({ quiz, difficulty }) {
  const [scores, setScores] = useState([]);
  const mcqs = quiz?.mcq || [];
  const shorts = quiz?.short_answer || [];
  const correct = scores.filter(Boolean).length;

  return (
    <div>
      {scores.length > 0 && (
        <div style={{ border: '2px solid #C8FF00', background: '#1E1E00', boxShadow: '4px 4px 0 #C8FF00', padding: '16px 20px', marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontFamily: 'DM Mono', color: '#888', fontSize: '0.8rem' }}>SCORE</span>
          <span style={{ fontFamily: 'Bebas Neue', fontSize: 36, color: '#C8FF00', letterSpacing: '0.05em' }}>{correct}/{mcqs.length}</span>
        </div>
      )}

      {mcqs.length > 0 && (
        <>
          <div style={{ fontFamily: 'Bebas Neue', fontSize: 14, letterSpacing: '0.15em', color: '#555', marginBottom: 16 }}>MULTIPLE CHOICE — {mcqs.length} QUESTIONS</div>
          {mcqs.map((q, i) => <MCQCard key={i} q={q} index={i} onAnswer={c => setScores(p => [...p, c])} />)}
        </>
      )}

      {shorts.length > 0 && (
        <>
          <div style={{ fontFamily: 'Bebas Neue', fontSize: 14, letterSpacing: '0.15em', color: '#555', marginBottom: 16, marginTop: 24 }}>SHORT ANSWER — {shorts.length} QUESTIONS</div>
          {shorts.map((q, i) => <ShortCard key={i} q={q} index={i} />)}
        </>
      )}
    </div>
  );
}
