import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQaFeed } from '../../hooks/useQaFeed';

interface QAQuestion {
  id: string;
  question: string;
  votes: number;
  answers: number;
  author: string;
  timeAgo: string;
}

interface CommunityQACardProps {
  onCreateQA?: () => void;
  onClose?: () => void;
  hideCreate?: boolean; // when true (e.g. StandardDashboard) suppress admin create action
}

export function CommunityQACard({ onCreateQA, onClose, hideCreate = false }: CommunityQACardProps) {
  const { items, loading, error } = useQaFeed({ limitQuestions: 5 });

  // Safely derive questions; wrap in useMemo & try/catch so unexpected data can't crash entire dashboard
  const derived: QAQuestion[] = useMemo(() => {
    try {
      if (!items || !Array.isArray(items)) return [];
      return items
        .filter((i: any) => i && i.type === 'question')
        .map((i: any) => ({
          id: i.id ?? `qa-missing-${Math.random().toString(36).slice(2)}`,
          question: i.title || i.question || i.content || 'Untitled question',
          votes: Number(i.voteCount ?? i.votes ?? 0) || 0,
          answers: Number(i.answerCount ?? (Array.isArray(i.answers) ? i.answers.length : 0)) || 0,
          author: i.authorName || i.author || 'Anonymous',
          timeAgo: 'recent',
        }));
    } catch (e) {
      console.error('[CommunityQACard] Failed transforming QA items:', e, { rawItems: items });
      return [];
    }
  }, [items]);

  const fallback: QAQuestion[] = [
    {
      id: 'seed-1',
      question: 'How do I transition from frontend to full-stack development?',
      votes: 12,
      answers: 3,
      author: 'Michael R.',
      timeAgo: '2 hours ago',
    },
    {
      id: 'seed-2',
      question: 'Best practices for remote team collaboration?',
      votes: 8,
      answers: 5,
      author: 'Lisa T.',
      timeAgo: '5 hours ago',
    },
  ];
  const questions: QAQuestion[] = derived.length ? derived : fallback;

  const formatTimeAgo = (timeAgo: string): string => {
    return timeAgo;
  };

  const handleCreateQA = () => {
    console.log('➕ Create Q&A clicked');
    if (onCreateQA) {
      onCreateQA();
    }
  };

  const handleClose = () => {
    console.log('❌ Close clicked');
    if (onClose) {
      onClose();
    }
  };

  return (
    <div className="admin-card">
      <div className="admin-card-header">
        <div className="admin-card-title">Community Q&A</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {!hideCreate && (
            <button
              className="admin-card-action primary"
              onClick={handleCreateQA}
              title="Create New Q&A"
              style={{
                padding: '8px 16px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow =
                  '0 4px 12px rgba(102, 126, 234, 0.3)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              ➕ Create Q&A
            </button>
          )}
          {onClose && (
            <button
              className="admin-card-action close"
              onClick={handleClose}
              title="Close"
              style={{
                padding: '8px',
                background: 'rgba(239, 68, 68, 0.1)',
                color: '#dc2626',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '32px',
                height: '32px',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
                e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.2)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              ❌
            </button>
          )}
        </div>
      </div>
      <div className="admin-card-body" style={{ padding: 0 }}>
        {loading && (
          <div style={{ padding: '16px', fontSize: '12px', opacity: 0.7 }}>
            Loading Q&A...
          </div>
        )}
        {error && !loading && (
          <div style={{ padding: '16px', fontSize: '12px', color: '#dc2626' }}>
            Failed to load community Q&A: {error}
          </div>
        )}
        {!loading && !error && derived.length === 0 && (
          <div style={{ padding: '16px', fontSize: '12px', opacity: 0.7 }}>
            No questions available yet.
          </div>
        )}
        {!loading && questions.map(item => (
          <div key={item.id} className="admin-list-item">
            <div className="item-info">
              <div className="item-title">
                <Link
                  to={`/qa/${item.id}`}
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  {item.question}
                </Link>
              </div>
              <div className="item-subtitle">
                Asked by {item.author} • {formatTimeAgo(item.timeAgo)}
                <span className="status-badge info">👍 {item.votes} votes</span>
                <span className="status-badge success">
                  {item.answers} answers
                </span>
              </div>
            </div>
            <div className="item-actions">
              <Link to={`/qa/${item.id}`} className="item-btn primary">
                View
              </Link>
            </div>
          </div>
        ))}
      </div>
      <div
        style={{
          padding: '16px 24px',
          textAlign: 'right',
          borderTop: '1px solid #f1f3f4',
        }}
      >
        <Link to="/qa" className="btn btn-outline">
          View all Q&A →
        </Link>
      </div>
    </div>
  );
}
