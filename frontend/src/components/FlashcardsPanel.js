import React, { useState } from 'react';

export default function FlashcardsPanel({ flashcards, difficulty }) {
  const [flipped, setFlipped] = useState({});
  const [mastered, setMastered] = useState({});
  const cards = flashcards?.flashcards || [];
  const masteredCount = Object.values(mastered).filter(Boolean).length;

  return (
    <div>
      {/* Progress bar */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
          <span style={{ fontFamily: 'Bebas Neue', fontSize: 14, letterSpacing: '0.15em', color: '#555' }}>MASTERED</span>
          <span style={{ fontFamily: 'Bebas Neue', fontSize: 28, color: '#C8FF00' }}>{masteredCount}/{cards.length}</span>
        </div>
        <div style={{ height: 4, background: '#1A1A1A', border: '1px solid #333' }}>
          <div style={{ height: '100%', width: `${cards.length ? (masteredCount / cards.length) * 100 : 0}%`, background: '#C8FF00', transition: 'width 0.4s ease' }} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
        {cards.map((card, i) => {
          const isFlipped = flipped[i];
          const isMastered = mastered[i];
          return (
            <div key={i} style={{ height: 180, perspective: 1000, animation: `fadeUp ${0.1 + i * 0.04}s ease forwards` }}>
              <div onClick={() => setFlipped(p => ({ ...p, [i]: !p[i] }))} style={{
                position: 'relative', width: '100%', height: '100%', cursor: 'pointer',
                transformStyle: 'preserve-3d',
                transition: 'transform 0.45s cubic-bezier(0.4,0,0.2,1)',
                transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
              }}>
                {/* Front */}
                <div style={{
                  position: 'absolute', inset: 0, backfaceVisibility: 'hidden',
                  background: isMastered ? '#1E1E00' : '#141414',
                  border: `2px solid ${isMastered ? '#C8FF00' : '#2a2a2a'}`,
                  boxShadow: isMastered ? '4px 4px 0 #C8FF00' : '4px 4px 0 #2a2a2a',
                  padding: 16, display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                }}>
                  <div>
                    {card.category && <div style={{ fontSize: '0.6rem', color: '#444', fontFamily: 'Bebas Neue', letterSpacing: '0.12em', marginBottom: 8 }}>{card.category}</div>}
                    <div style={{ color: isMastered ? '#C8FF00' : '#ddd', fontSize: '0.85rem', fontFamily: 'DM Mono', lineHeight: 1.5 }}>{card.front}</div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#2a2a2a', fontSize: '0.65rem', fontFamily: 'DM Mono' }}>tap to flip</span>
                    <button onClick={e => { e.stopPropagation(); setMastered(p => ({ ...p, [i]: !p[i] })); }}
                      style={{ width: 24, height: 24, border: `2px solid ${isMastered ? '#C8FF00' : '#333'}`, background: isMastered ? '#C8FF00' : 'transparent', color: isMastered ? '#0C0C0C' : '#444', cursor: 'pointer', fontSize: '0.7rem', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      ✓
                    </button>
                  </div>
                </div>

                {/* Back */}
                <div style={{
                  position: 'absolute', inset: 0, backfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)',
                  background: '#0C1A18',
                  border: '2px solid #6BFFE8',
                  boxShadow: '4px 4px 0 #6BFFE8',
                  padding: 16, display: 'flex', flexDirection: 'column', justifyContent: 'center',
                }}>
                  <div style={{ fontSize: '0.6rem', color: '#444', fontFamily: 'Bebas Neue', letterSpacing: '0.12em', marginBottom: 10 }}>ANSWER</div>
                  <div style={{ color: '#6BFFE8', fontSize: '0.83rem', fontFamily: 'DM Mono', lineHeight: 1.6 }}>{card.back}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
