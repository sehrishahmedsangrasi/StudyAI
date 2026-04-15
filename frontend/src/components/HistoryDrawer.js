import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000';
const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('studyai_token')}` });

export default function HistoryDrawer({ open, history, onLoad, onDelete }) {
  const [deletingId, setDeletingId] = useState(null);
  const [confirmId, setConfirmId] = useState(null);
  const timeoutRef = useRef(null);

  // Auto-dismiss confirm popover after 4s
  useEffect(() => {
    if (confirmId) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setConfirmId(null), 4000);
    }
    return () => clearTimeout(timeoutRef.current);
  }, [confirmId]);

  const handleDeleteClick = (e, genId) => {
    e.stopPropagation();
    setConfirmId(genId);
  };

  const handleConfirm = async (e, genId) => {
    e.stopPropagation();
    setConfirmId(null);
    setDeletingId(genId);
    try {
      await axios.delete(`${API}/history/${genId}`, { headers: authHeaders() });
      onDelete(genId);
    } catch (err) {
      console.error('Delete failed', err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleCancel = (e) => {
    e.stopPropagation();
    setConfirmId(null);
    clearTimeout(timeoutRef.current);
  };

  if (!open) return null;

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 200,
      animation: 'slideUp 0.25s cubic-bezier(0.16,1,0.3,1) forwards'
    }}>
      <div style={{
        background: '#141414', border: '2px solid #fff', borderBottom: 'none',
        boxShadow: '0 -6px 0 #fff', maxHeight: '55vh',
        overflow: 'hidden', display: 'flex', flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{ padding: '14px 24px', borderBottom: '2px solid #222', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <span style={{ fontFamily: 'Bebas Neue', fontSize: 22, letterSpacing: '0.1em', color: '#C8FF00' }}>HISTORY</span>
          <span style={{ color: '#444', fontSize: '0.7rem', fontFamily: 'DM Mono' }}>{history.length} sessions saved</span>
        </div>

        {/* Content */}
        <div style={{ overflowY: 'auto', padding: '16px 24px 24px' }}>
          {history.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#2a2a2a', fontFamily: 'DM Mono', fontSize: '0.8rem' }}>
              // no history yet — generate something first
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12 }}>
              {history.map((gen, i) => {
                const isConfirming = confirmId === gen.id;
                const isDeleting = deletingId === gen.id;
                return (
                  <div
                    key={gen.id}
                    className="nb-card"
                    onClick={() => !isConfirming && onLoad(gen)}
                    style={{
                      padding: '14px 16px', cursor: 'pointer', background: '#1A1A1A',
                      animation: `fadeUp ${0.05 + i * 0.04}s ease forwards`,
                      position: 'relative', transition: 'opacity 0.2s',
                      opacity: isDeleting ? 0.4 : 1,
                    }}
                  >
                    <div style={{ fontSize: '0.78rem', color: '#F5F5F5', fontFamily: 'Syne, sans-serif', fontWeight: 600, marginBottom: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: 28 }}>
                      {gen.title}
                    </div>

                    <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 8 }}>
                      {gen.notes && <span style={{ fontSize: '0.6rem', background: '#1E1E00', color: '#C8FF00', border: '1px solid #C8FF00', padding: '2px 6px' }}>NOTES</span>}
                      {gen.quiz && <span style={{ fontSize: '0.6rem', background: '#1E0000', color: '#FF6B6B', border: '1px solid #FF6B6B', padding: '2px 6px' }}>QUIZ</span>}
                      {gen.flashcards && <span style={{ fontSize: '0.6rem', background: '#001E1C', color: '#6BFFE8', border: '1px solid #6BFFE8', padding: '2px 6px' }}>CARDS</span>}
                      <span style={{ fontSize: '0.6rem', background: '#1A1A1A', color: '#444', border: '1px solid #2a2a2a', padding: '2px 6px' }}>{gen.difficulty}</span>
                    </div>

                    <div style={{ fontSize: '0.62rem', color: '#333', fontFamily: 'DM Mono' }}>
                      {new Date(gen.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </div>

                    {/* Delete trigger button */}
                    <button
                      onClick={(e) => handleDeleteClick(e, gen.id)}
                      disabled={isDeleting}
                      style={{
                        position: 'absolute', top: 10, right: 10,
                        background: isConfirming ? '#FF6B6B22' : 'transparent',
                        border: `1px solid ${isConfirming ? '#FF6B6B' : '#2a2a2a'}`,
                        color: isConfirming ? '#FF6B6B' : '#444',
                        width: 22, height: 22, cursor: 'pointer',
                        fontSize: '0.7rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 900, transition: 'all 0.15s', fontFamily: 'DM Mono',
                      }}
                      title="Delete this session"
                    >
                      {isDeleting ? '…' : '×'}
                    </button>

                    {/* Confirmation popover */}
                    {isConfirming && (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          position: 'absolute', top: 36, right: 10, zIndex: 10,
                          background: '#141414', border: '1px solid #FF6B6B',
                          padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: 6,
                          minWidth: 110, animation: 'fadeIn 0.12s ease',
                        }}
                      >
                        <span style={{ fontSize: '0.62rem', color: '#FF6B6B', fontFamily: 'DM Mono', whiteSpace: 'nowrap' }}>
                          Delete session?
                        </span>
                        <div style={{ display: 'flex', gap: 5 }}>
                          <button
                            onClick={(e) => handleConfirm(e, gen.id)}
                            style={{
                              flex: 1, background: '#FF6B6B', border: 'none',
                              color: '#0C0C0C', fontSize: '0.6rem', padding: '4px 0',
                              cursor: 'pointer', fontWeight: 700, fontFamily: 'DM Mono',
                            }}
                          >
                            YES
                          </button>
                          <button
                            onClick={handleCancel}
                            style={{
                              flex: 1, background: 'transparent', border: '1px solid #2a2a2a',
                              color: '#666', fontSize: '0.6rem', padding: '4px 0',
                              cursor: 'pointer', fontFamily: 'DM Mono',
                            }}
                          >
                            NO
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
