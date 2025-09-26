import React, { useState, useEffect, useCallback } from 'react';
import { useToast } from '../../contexts/ToastContext';
import { useParams, useNavigate } from 'react-router-dom';
import { useApiData } from '../../hooks';
import { QAService } from '../../services/qaService';
import { useMutationWithRefresh } from '../../hooks/useMutationWithRefresh';
import { EditorLayout } from '../layout/EditorLayout';
import { LoadingSpinner } from '../common/LoadingSpinner';

// Basic domain types
export type QAType = 'question' | 'answer' | 'discussion';
export type QAStatus = 'published' | 'pending' | 'flagged' | 'archived';
export type QACategory = 'technical' | 'career' | 'academic' | 'general';

interface QAFormState {
  title: string;
  content: string;
  type: QAType;
  status: QAStatus;
  category: QACategory;
  authorId: string;
  authorName: string;
  answerCount: string;
  viewCount: string;
  voteCount: string;
  commentCount: string;
  participantCount: string;
  isSticky: boolean;
  isFeatured: boolean;
  allowComments: boolean;
  allowVoting: boolean;
  notes: string;
}

const defaultFormState: QAFormState = {
  title: '',
  content: '',
  type: 'question',
  status: 'pending',
  category: 'general',
  authorId: '',
  authorName: '',
  answerCount: '0',
  viewCount: '0',
  voteCount: '0',
  commentCount: '0',
  participantCount: '0',
  isSticky: false,
  isFeatured: false,
  allowComments: true,
  allowVoting: true,
  notes: '',
};

export const QAEditorPage: React.FC = () => {
  const { addToast } = useToast();
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState<QAFormState>(defaultFormState);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  // Fetch existing item only in edit mode
  const { data: qaItemResponse, loading: loadingQAItem, error: qaItemError } = useApiData(
    () => (id ? QAService.getQAItem(id) : Promise.resolve(null)),
    [id],
    { enabled: isEditMode, cacheKey: `qa-item-${id}`, cacheDuration: 5 * 60 * 1000 }
  );

  // Build payload (stable reference via useCallback dependencies on formData & tags)
  const buildPayload = useCallback(() => ({
    title: formData.title.trim(),
    content: formData.content.trim(),
    type: formData.type,
    status: formData.status,
    category: formData.category,
    authorId: formData.authorId.trim() || undefined,
    authorName: formData.authorName.trim(),
    tags,
    answerCount: parseInt(formData.answerCount) || 0,
    viewCount: parseInt(formData.viewCount) || 0,
    voteCount: parseInt(formData.voteCount) || 0,
    commentCount: parseInt(formData.commentCount) || 0,
    participantCount: parseInt(formData.participantCount) || 0,
    isSticky: formData.isSticky,
    isFeatured: formData.isFeatured,
    allowComments: formData.allowComments,
    allowVoting: formData.allowVoting,
    notes: formData.notes.trim() || undefined,
  }), [formData, tags]);

  // Mutation function (create or update)
  const mutationFn = useCallback(async () => {
    const payload = buildPayload();
    return isEditMode && id
      ? QAService.updateQAItem(id, payload)
      : QAService.createQAItem(payload as any);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [buildPayload, isEditMode, id]);

  // Refresh list after mutation (first page, generous limit)
  const refreshFn = useCallback(async () => QAService.getQAItems(1, 50), []);

  const { run: runMutation, isLoading: isSaving, error: mutationError } = useMutationWithRefresh<any, any>(mutationFn, refreshFn, {
    onSuccess: ({ mutation }) => {
      if (mutation?.success) {
        addToast({
          type: 'success',
          message: `Q&A item ${isEditMode ? 'updated' : 'created'} successfully!`,
          description: isEditMode ? 'Changes saved.' : 'Item created and ready.'
        });
        navigate('/admin/qa');
      } else if (mutation) {
        const msg = mutation.error?.message || 'Failed to save Q&A item';
        addToast({ type: 'error', message: 'Save failed', description: msg });
        console.error('Failed to save Q&A item', mutation.error);
      }
    },
    onError: (e) => {
      const msg = e?.message || 'Failed to save Q&A item';
      addToast({ type: 'error', message: 'Save failed', description: msg });
      console.error('Q&A save failed:', e);
    }
  });

  // Populate form when data loads in edit mode
  useEffect(() => {
    if (isEditMode && qaItemResponse?.data) {
      const qaItem = qaItemResponse.data;
      setFormData((prev) => ({
        ...prev,
        title: qaItem.title || '',
        content: qaItem.content || '',
        type: (qaItem.type || 'question') as QAType,
        status: (qaItem.status || 'pending') as QAStatus,
        category: (qaItem.category || 'general') as QACategory,
        authorId: qaItem.authorId || '',
        authorName: qaItem.authorName || '',
        answerCount: qaItem.answerCount?.toString() || '0',
        viewCount: qaItem.viewCount?.toString() || '0',
        voteCount: qaItem.voteCount?.toString() || '0',
        commentCount: qaItem.commentCount?.toString() || '0',
        participantCount: qaItem.participantCount?.toString() || '0',
      }));
      setTags(qaItem.tags || []);
    }
  }, [isEditMode, qaItemResponse]);

  // Generic field change
  const setField = (field: keyof QAFormState, value: string | boolean) => {
    setFormData((p) => ({ ...p, [field]: value }));
  };

  // Tag management
  const handleTagKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const val = tagInput.trim();
      if (!tags.includes(val)) setTags([...tags, val]);
      setTagInput('');
    }
  };
  const removeTag = (tag: string) => setTags(tags.filter((t) => t !== tag));

  // Submit handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Basic validation
    if (!formData.title.trim()) {
      addToast({ type: 'warning', message: 'Title required', description: 'Please provide a title.' });
      return;
    }
    if (!formData.content.trim()) {
      addToast({ type: 'warning', message: 'Content required', description: 'Enter the main content.' });
      return;
    }
    if (!formData.authorName.trim()) {
      addToast({ type: 'warning', message: 'Author name required', description: 'Provide the author name.' });
      return;
    }
    runMutation();
  };

  const handleClose = () => navigate('/admin/qa');

  // Scroll to top on mount so overlay starts at top (polyfill to silence jsdom "Not implemented" errors)
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        if (typeof window.scrollTo !== 'function') {
          (window as any).scrollTo = () => {};
        }
        // Some jsdom versions define scrollTo but throw; wrap call separately
        try {
          window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
        } catch {
          // Override with no-op to prevent subsequent errors
          (window as any).scrollTo = () => {};
        }
      }
    } catch {
      /* ignore */
    }
  }, []);

  return (
    <EditorLayout
      title={isEditMode ? 'Edit Q&A Item' : 'Create New Q&A Item'}
      onClose={handleClose}
      loading={isEditMode && loadingQAItem}
      error={isEditMode ? (qaItemError as Error | null) : null}
      errorTitle="Failed to load Q&A item"
      onRetry={() => window.location.reload()}
      overlayClassName="qa-editor-overlay"
    >
      {/* Only render form when not loading initial data or when in create mode */}
      {(!isEditMode || !loadingQAItem) && !qaItemError && (
        <form onSubmit={handleSubmit} className="qa-form">
          <div className="form-grid">
            {/* Left column */}
            <div className="form-section">
              <div className="form-section-title">
                <div className="form-section-icon" />
                Content Information
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="qaTitle">Title *</label>
                <input
                  id="qaTitle"
                  className="form-input"
                  required
                  placeholder="e.g., How do I optimize React application performance?"
                  value={formData.title}
                  onChange={(e) => setField('title', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="qaContent">Content *</label>
                <textarea
                  id="qaContent"
                  className="form-input form-textarea large"
                  required
                  rows={12}
                  placeholder="Enter the full content of your question, answer, or discussion..."
                  value={formData.content}
                  onChange={(e) => setField('content', e.target.value)}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label" htmlFor="authorName">Author Name *</label>
                  <input
                    id="authorName"
                    className="form-input"
                    required
                    placeholder="e.g., Sarah Mthembu"
                    value={formData.authorName}
                    onChange={(e) => setField('authorName', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="authorId">Author ID</label>
                  <input
                    id="authorId"
                    className="form-input"
                    placeholder="Author user ID"
                    value={formData.authorId}
                    onChange={(e) => setField('authorId', e.target.value)}
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Tags</label>
                <div className="tag-container">
                  {tags.map((tag) => (
                    <span key={tag} className="tag">
                      {tag}
                      <button
                        type="button"
                        className="tag-remove"
                        onClick={() => removeTag(tag)}
                        aria-label={`Remove tag ${tag}`}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  <input
                    className="tag-input"
                    placeholder="Add tags..."
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleTagKey}
                  />
                </div>
                <div className="form-help">Press Enter to add tags</div>
              </div>
            </div>

            {/* Right column */}
            <div className="form-section">
              <div className="form-section-title">
                <div className="form-section-icon" />
                Q&A Settings
              </div>

              {/* Type selector */}
              <div className="form-group">
                <label className="form-label">Content Type</label>
                <div className="status-selector">
                  {(['question', 'answer', 'discussion'] as QAType[]).map((t) => (
                    <div
                      key={t}
                      className={`status-option ${formData.type === t ? 'selected' : ''}`}
                      onClick={() => setField('type', t)}
                    >
                      <div className="status-option-title">{t.charAt(0).toUpperCase() + t.slice(1)}</div>
                      <div className="status-option-desc">
                        {t === 'question'
                          ? 'Seeking answers'
                          : t === 'answer'
                          ? 'Providing solution'
                          : 'Open conversation'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Category selector */}
              <div className="form-group">
                <label className="form-label">Category</label>
                <div className="status-selector">
                  {(['technical', 'career', 'academic', 'general'] as QACategory[]).map((c) => (
                    <div
                      key={c}
                      className={`status-option ${formData.category === c ? 'selected' : ''}`}
                      onClick={() => setField('category', c)}
                    >
                      <div className="status-option-title">{c.charAt(0).toUpperCase() + c.slice(1)}</div>
                      <div className="status-option-desc">
                        {c === 'technical'
                          ? 'Technical topics'
                          : c === 'career'
                          ? 'Career advice'
                          : c === 'academic'
                          ? 'Academic topics'
                          : 'General discussion'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status selector */}
              <div className="form-group">
                <label className="form-label">Status</label>
                <div className="status-selector">
                  {(['published', 'pending', 'flagged', 'archived'] as QAStatus[]).map((s) => (
                    <div
                      key={s}
                      className={`status-option ${formData.status === s ? 'selected' : ''}`}
                      onClick={() => setField('status', s)}
                    >
                      <div className="status-option-title">{s.charAt(0).toUpperCase() + s.slice(1)}</div>
                      <div className="status-option-desc">
                        {s === 'published'
                          ? 'Live and visible'
                          : s === 'pending'
                          ? 'Awaiting review'
                          : s === 'flagged'
                          ? 'Flagged for review'
                          : 'Archived/hidden'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Metrics row */}
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label" htmlFor="answerCount">Answers</label>
                  <input
                    id="answerCount"
                    type="number"
                    className="form-input"
                    min={0}
                    value={formData.answerCount}
                    onChange={(e) => setField('answerCount', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="viewCount">Views</label>
                  <input
                    id="viewCount"
                    type="number"
                    className="form-input"
                    min={0}
                    value={formData.viewCount}
                    onChange={(e) => setField('viewCount', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="voteCount">Votes</label>
                  <input
                    id="voteCount"
                    type="number"
                    className="form-input"
                    min={0}
                    value={formData.voteCount}
                    onChange={(e) => setField('voteCount', e.target.value)}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label" htmlFor="commentCount">Comments</label>
                  <input
                    id="commentCount"
                    type="number"
                    className="form-input"
                    min={0}
                    value={formData.commentCount}
                    onChange={(e) => setField('commentCount', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="participantCount">Participants</label>
                  <input
                    id="participantCount"
                    type="number"
                    className="form-input"
                    min={0}
                    value={formData.participantCount}
                    onChange={(e) => setField('participantCount', e.target.value)}
                  />
                </div>
              </div>

              {/* Toggles */}
              <div className="form-row toggles-row">
                <label className="toggle">
                  <input
                    type="checkbox"
                    checked={formData.isSticky}
                    onChange={() => setField('isSticky', !formData.isSticky)}
                  />
                  <span>Sticky</span>
                </label>
                <label className="toggle">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={() => setField('isFeatured', !formData.isFeatured)}
                  />
                  <span>Featured</span>
                </label>
                <label className="toggle">
                  <input
                    type="checkbox"
                    checked={formData.allowComments}
                    onChange={() => setField('allowComments', !formData.allowComments)}
                  />
                  <span>Comments</span>
                </label>
                <label className="toggle">
                  <input
                    type="checkbox"
                    checked={formData.allowVoting}
                    onChange={() => setField('allowVoting', !formData.allowVoting)}
                  />
                  <span>Voting</span>
                </label>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="notes">Notes</label>
                <textarea
                  id="notes"
                  className="form-input form-textarea"
                  rows={3}
                  placeholder="Internal moderation notes"
                  value={formData.notes}
                  onChange={(e) => setField('notes', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="editor-actions">
            <button
              type="button"
              className="btn secondary"
              onClick={handleClose}
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn primary"
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <LoadingSpinner size="small" />
                  <span style={{ marginLeft: 8 }}>Saving...</span>
                </>
              ) : (
                <>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                    <polyline points="17,21 17,13 7,13 7,21" />
                    <polyline points="7,3 7,8 15,8" />
                  </svg>
                  <span style={{ marginLeft: 6 }}>{isEditMode ? 'Update' : 'Create'} Q&A Item</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </EditorLayout>
  );
};

export default QAEditorPage;
