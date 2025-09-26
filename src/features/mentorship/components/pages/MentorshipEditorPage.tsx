import React, { useState, useEffect, useCallback } from 'react';
import { useToast } from '../../contexts/ToastContext';
import { useParams, useNavigate } from 'react-router-dom';
import { MentorshipService } from '@features/mentorship/services';
import { useMutationWithRefresh } from '../../hooks/useMutationWithRefresh';
import { LoadingSpinner } from '../../../../components/common/LoadingSpinner';
import { ErrorMessage } from '../../../../components/common/ErrorMessage';
import type { Mentorship } from '../../types';

type MentorshipType =
  | 'technical'
  | 'career'
  | 'leadership'
  | 'entrepreneurship'
  | 'general';
type MentorshipStatus =
  | 'active'
  | 'pending'
  | 'completed'
  | 'paused'
  | 'cancelled';

export const MentorshipEditorPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);
  const { addToast } = useToast();

  // Loading and error states
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    type: 'general' as MentorshipType,
    status: 'pending' as MentorshipStatus,
    mentorId: '',
    mentorName: '',
    menteeId: '',
    menteeName: '',
    description: '',
    category: '',
    sessionCount: '0',
    nextSessionDate: '',
    startDate: '',
    endDate: '',
    notes: '',
  });

  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  // Load mentorship data when in edit mode
  useEffect(() => {
    if (isEditMode && id) {
      loadMentorship(id);
    }
  }, [id, isEditMode]);

  const loadMentorship = async (mentorshipId: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await MentorshipService.getMentorship(mentorshipId);

      if (response.success && response.data) {
        const mentorship = response.data;

        // Map mentorship data to form data
        setFormData({
          title: mentorship.title || '',
          type: mentorship.type || 'general',
          status: mentorship.status || 'pending',
          mentorId: mentorship.mentorId || '',
          mentorName: mentorship.mentorName || '',
          menteeId: mentorship.menteeId || '',
          menteeName: mentorship.menteeName || '',
          description: mentorship.description || '',
          category: mentorship.category || '',
          sessionCount: mentorship.sessionCount?.toString() || '0',
          nextSessionDate: mentorship.nextSessionDate
            ? new Date(mentorship.nextSessionDate).toISOString().slice(0, 16)
            : '',
          startDate: mentorship.startDate
            ? new Date(mentorship.startDate).toISOString().slice(0, 10)
            : '',
          endDate: mentorship.endDate
            ? new Date(mentorship.endDate).toISOString().slice(0, 10)
            : '',
          notes: '', // Not in base type, keeping empty
        });

        setTags(mentorship.tags || []);
      } else {
        setError(response.error?.message || 'Failed to load mentorship');
      }
    } catch (err) {
      console.error('Error loading mentorship:', err);
      setError('Failed to load mentorship. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleTypeSelect = (type: MentorshipType) => {
    setFormData(prev => ({ ...prev, type }));
  };

  const handleStatusSelect = (status: MentorshipStatus) => {
    setFormData(prev => ({ ...prev, status }));
  };

  const handleTagInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const validateForm = (): string | null => {
    if (!formData.title.trim()) {
      return 'Mentorship title is required';
    }
    if (!formData.mentorName.trim()) {
      return 'Mentor name is required';
    }
    if (!formData.menteeName.trim()) {
      return 'Mentee name is required';
    }
    if (!formData.description.trim()) {
      return 'Description is required';
    }
    if (
      formData.endDate &&
      formData.startDate &&
      new Date(formData.endDate) < new Date(formData.startDate)
    ) {
      return 'End date cannot be before start date';
    }
    return null;
  };

  // Build payload and mutation/refresh pattern
  const buildPayload = useCallback((): Omit<Mentorship,'id'> => ({
    title: formData.title.trim(),
    type: formData.type,
    status: formData.status,
    mentorId: formData.mentorId || '',
    mentorName: formData.mentorName.trim(),
    menteeId: formData.menteeId || '',
    menteeName: formData.menteeName.trim(),
    description: formData.description.trim(),
    tags,
    sessionCount: parseInt(formData.sessionCount) || 0,
    completedSessions: 0,
    nextSessionDate: formData.nextSessionDate || undefined,
    startDate: formData.startDate || new Date().toISOString(),
    endDate: formData.endDate || undefined,
    category: formData.category.trim(),
  }), [formData, tags]);

  const mutationFn = useCallback(async () => {
    const payload = buildPayload();
    return isEditMode && id
      ? MentorshipService.updateMentorship(id, payload)
      : MentorshipService.createMentorship(payload);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [buildPayload, isEditMode, id]);
  const refreshFn = useCallback(async () => MentorshipService.getMentorships(1,50), []);
  const { run: runMutation, isLoading: mutationLoading } = useMutationWithRefresh<any, any>(mutationFn, refreshFn, {
    onSuccess: ({ mutation }) => {
      if (mutation?.success) {
        addToast({ type: 'success', message: `Mentorship ${isEditMode ? 'updated' : 'created'} successfully!` });
        navigate('/admin/mentorship');
      } else if (mutation) {
        const msg = mutation.error?.message || 'Failed to save mentorship';
        setError(msg);
        addToast({ type: 'error', message: msg });
      }
      setIsSaving(false);
    },
    onError: (e) => { const msg = e?.message || 'Failed to save mentorship'; setError(msg); addToast({ type: 'error', message: msg }); setIsSaving(false); }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validateForm();
  if (validationError) { setError(validationError); addToast({ type: 'warning', message: validationError }); return; }
    setIsSaving(true);
    runMutation();
  };

  const handleClose = () => {
    navigate('/admin/mentorship');
  };

  // Show loading spinner while loading data
  if (isLoading) {
    return (
      <div className="overlay active">
        <div className="mentorship-manager">
          <div className="mentorship-header">
            <h2 className="mentorship-title">Loading Mentorship...</h2>
            <button className="close-btn" onClick={handleClose}>
              &times;
            </button>
          </div>
          <div className="mentorship-body">
            <LoadingSpinner />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="overlay active">
      <div className="mentorship-manager">
        <div className="mentorship-header">
          <h2 className="mentorship-title">
            {isEditMode ? 'Edit Mentorship' : 'Create New Mentorship'}
          </h2>
          <button className="close-btn" onClick={handleClose}>
            &times;
          </button>
        </div>

        <div className="mentorship-body">
          {error && (
            <ErrorMessage error={error} title="Error" />
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              {/* Left Column - Mentorship Details */}
              <div className="form-section">
                <div className="form-section-title">
                  <div className="form-section-icon"></div>
                  Mentorship Details
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="mentorshipTitle">
                    Mentorship Title *
                  </label>
                  <input
                    type="text"
                    id="mentorshipTitle"
                    className="form-input"
                    placeholder="e.g., Frontend Development Mentorship"
                    value={formData.title}
                    onChange={e => handleInputChange('title', e.target.value)}
                    required
                    disabled={isSaving}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="mentorshipDescription">
                    Description *
                  </label>
                  <textarea
                    id="mentorshipDescription"
                    className="form-input form-textarea large"
                    placeholder="Enter mentorship description and goals..."
                    value={formData.description}
                    onChange={e =>
                      handleInputChange('description', e.target.value)
                    }
                    required
                    disabled={isSaving}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label" htmlFor="mentorName">
                      Mentor Name *
                    </label>
                    <input
                      type="text"
                      id="mentorName"
                      className="form-input"
                      placeholder="e.g., Sarah Mthembu"
                      value={formData.mentorName}
                      onChange={e =>
                        handleInputChange('mentorName', e.target.value)
                      }
                      required
                      disabled={isSaving}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="menteeName">
                      Mentee Name *
                    </label>
                    <input
                      type="text"
                      id="menteeName"
                      className="form-input"
                      placeholder="e.g., John Doe"
                      value={formData.menteeName}
                      onChange={e =>
                        handleInputChange('menteeName', e.target.value)
                      }
                      required
                      disabled={isSaving}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label" htmlFor="mentorId">
                      Mentor ID
                    </label>
                    <input
                      type="text"
                      id="mentorId"
                      className="form-input"
                      placeholder="mentor-123"
                      value={formData.mentorId}
                      onChange={e =>
                        handleInputChange('mentorId', e.target.value)
                      }
                      disabled={isSaving}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="menteeId">
                      Mentee ID
                    </label>
                    <input
                      type="text"
                      id="menteeId"
                      className="form-input"
                      placeholder="mentee-456"
                      value={formData.menteeId}
                      onChange={e =>
                        handleInputChange('menteeId', e.target.value)
                      }
                      disabled={isSaving}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="mentorshipCategory">
                    Category
                  </label>
                  <input
                    type="text"
                    id="mentorshipCategory"
                    className="form-input"
                    placeholder="e.g., Web Development"
                    value={formData.category}
                    onChange={e =>
                      handleInputChange('category', e.target.value)
                    }
                    disabled={isSaving}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Tags</label>
                  <div className="tag-container">
                    {tags.map(tag => (
                      <span key={tag} className="tag">
                        {tag}
                        <button
                          type="button"
                          className="tag-remove"
                          onClick={() => removeTag(tag)}
                          disabled={isSaving}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                    <input
                      type="text"
                      className="tag-input"
                      placeholder="Add tags..."
                      value={tagInput}
                      onChange={e => setTagInput(e.target.value)}
                      onKeyDown={handleTagInput}
                      disabled={isSaving}
                    />
                  </div>
                  <div className="form-help">Press Enter to add tags</div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="mentorshipNotes">
                    Internal Notes
                  </label>
                  <textarea
                    id="mentorshipNotes"
                    className="form-input form-textarea"
                    placeholder="Internal notes about this mentorship..."
                    value={formData.notes}
                    onChange={e => handleInputChange('notes', e.target.value)}
                    disabled={isSaving}
                  />
                </div>
              </div>

              {/* Right Column - Mentorship Settings */}
              <div className="form-section">
                <div className="form-section-title">
                  <div className="form-section-icon"></div>
                  Mentorship Settings
                </div>

                <div className="form-group">
                  <label className="form-label">Mentorship Type</label>
                  <div className="status-selector">
                    <div
                      className={`status-option ${formData.type === 'technical' ? 'selected' : ''} ${isSaving ? 'disabled' : ''}`}
                      onClick={() => !isSaving && handleTypeSelect('technical')}
                    >
                      <div className="status-option-title">Technical</div>
                      <div className="status-option-desc">
                        Technical skills focus
                      </div>
                    </div>
                    <div
                      className={`status-option ${formData.type === 'career' ? 'selected' : ''} ${isSaving ? 'disabled' : ''}`}
                      onClick={() => !isSaving && handleTypeSelect('career')}
                    >
                      <div className="status-option-title">Career</div>
                      <div className="status-option-desc">
                        Career development
                      </div>
                    </div>
                    <div
                      className={`status-option ${formData.type === 'leadership' ? 'selected' : ''} ${isSaving ? 'disabled' : ''}`}
                      onClick={() =>
                        !isSaving && handleTypeSelect('leadership')
                      }
                    >
                      <div className="status-option-title">Leadership</div>
                      <div className="status-option-desc">
                        Leadership skills
                      </div>
                    </div>
                    <div
                      className={`status-option ${formData.type === 'entrepreneurship' ? 'selected' : ''} ${isSaving ? 'disabled' : ''}`}
                      onClick={() =>
                        !isSaving && handleTypeSelect('entrepreneurship')
                      }
                    >
                      <div className="status-option-title">
                        Entrepreneurship
                      </div>
                      <div className="status-option-desc">
                        Business & startups
                      </div>
                    </div>
                    <div
                      className={`status-option ${formData.type === 'general' ? 'selected' : ''} ${isSaving ? 'disabled' : ''}`}
                      onClick={() => !isSaving && handleTypeSelect('general')}
                    >
                      <div className="status-option-title">General</div>
                      <div className="status-option-desc">
                        General mentorship
                      </div>
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Status</label>
                  <div className="status-selector">
                    <div
                      className={`status-option ${formData.status === 'active' ? 'selected' : ''} ${isSaving ? 'disabled' : ''}`}
                      onClick={() => !isSaving && handleStatusSelect('active')}
                    >
                      <div className="status-option-title">Active</div>
                      <div className="status-option-desc">
                        Currently ongoing
                      </div>
                    </div>
                    <div
                      className={`status-option ${formData.status === 'pending' ? 'selected' : ''} ${isSaving ? 'disabled' : ''}`}
                      onClick={() => !isSaving && handleStatusSelect('pending')}
                    >
                      <div className="status-option-title">Pending</div>
                      <div className="status-option-desc">
                        Awaiting approval
                      </div>
                    </div>
                    <div
                      className={`status-option ${formData.status === 'completed' ? 'selected' : ''} ${isSaving ? 'disabled' : ''}`}
                      onClick={() =>
                        !isSaving && handleStatusSelect('completed')
                      }
                    >
                      <div className="status-option-title">Completed</div>
                      <div className="status-option-desc">
                        Successfully finished
                      </div>
                    </div>
                    <div
                      className={`status-option ${formData.status === 'paused' ? 'selected' : ''} ${isSaving ? 'disabled' : ''}`}
                      onClick={() => !isSaving && handleStatusSelect('paused')}
                    >
                      <div className="status-option-title">Paused</div>
                      <div className="status-option-desc">
                        Temporarily paused
                      </div>
                    </div>
                    <div
                      className={`status-option ${formData.status === 'cancelled' ? 'selected' : ''} ${isSaving ? 'disabled' : ''}`}
                      onClick={() =>
                        !isSaving && handleStatusSelect('cancelled')
                      }
                    >
                      <div className="status-option-title">Cancelled</div>
                      <div className="status-option-desc">
                        Cancelled mentorship
                      </div>
                    </div>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label" htmlFor="startDate">
                      Start Date
                    </label>
                    <input
                      type="date"
                      id="startDate"
                      className="form-input"
                      value={formData.startDate}
                      onChange={e =>
                        handleInputChange('startDate', e.target.value)
                      }
                      disabled={isSaving}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="endDate">
                      End Date
                    </label>
                    <input
                      type="date"
                      id="endDate"
                      className="form-input"
                      value={formData.endDate}
                      onChange={e =>
                        handleInputChange('endDate', e.target.value)
                      }
                      disabled={isSaving}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="nextSessionDate">
                    Next Session Date
                  </label>
                  <input
                    type="datetime-local"
                    id="nextSessionDate"
                    className="form-input"
                    value={formData.nextSessionDate}
                    onChange={e =>
                      handleInputChange('nextSessionDate', e.target.value)
                    }
                    disabled={isSaving}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="sessionCount">
                    Session Count
                  </label>
                  <input
                    type="number"
                    id="sessionCount"
                    className="form-input"
                    value={formData.sessionCount}
                    onChange={e =>
                      handleInputChange('sessionCount', e.target.value)
                    }
                    min="0"
                    disabled={isSaving}
                  />
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleClose}
                disabled={isSaving}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSaving || mutationLoading}
              >
                {isSaving || mutationLoading ? (
                  <>
                    <LoadingSpinner size="small" />
                    {isEditMode ? 'Updating...' : 'Creating...'}
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
                    Save Mentorship
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
