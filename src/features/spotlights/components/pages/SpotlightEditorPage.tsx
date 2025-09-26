import React, { useState, useEffect, useCallback } from 'react';
import { useToast } from '../../../../contexts/ToastContext';
import { useParams, useNavigate } from 'react-router-dom';
import { SpotlightsService } from '@features/spotlights/services';
import { useMutationWithRefresh } from '../../../../hooks/useMutationWithRefresh';
import { LoadingSpinner } from '../../../../components/common/LoadingSpinner';
import { ErrorMessage } from '../../../../components/common/ErrorMessage';
import type { Spotlight } from '@features/spotlights/types';

type SpotlightType =
  | 'success_story'
  | 'video_interview'
  | 'tutorial'
  | 'achievement'
  | 'announcement';
type SpotlightStatus = 'published' | 'draft' | 'scheduled' | 'archived';

export const SpotlightEditorPage: React.FC = () => {
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
    content: '',
    type: 'success_story' as SpotlightType,
    status: 'draft' as SpotlightStatus,
    featuredAlumniId: '',
    featuredAlumniName: '',
    featuredAlumniEmail: '',
    videoUrl: '',
    imageUrl: '',
    viewCount: '0',
    likeCount: '0',
    shareCount: '0',
    publishedDate: '',
    scheduledDate: '',
    excerpt: '',
    category: '',
    isFeatured: false,
    allowComments: true,
    allowSharing: true,
    seoTitle: '',
    seoDescription: '',
    notes: '',
  });

  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  // Load spotlight data when in edit mode
  useEffect(() => {
    if (isEditMode && id) {
      loadSpotlight(id);
    }
  }, [id, isEditMode]);

  const loadSpotlight = async (spotlightId: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await SpotlightsService.getSpotlight(spotlightId);

      if (response.success && response.data) {
        const spotlight = response.data;

        // Map spotlight data to form data
        setFormData({
          title: spotlight.title || '',
          content: spotlight.content || '',
          type: spotlight.type || 'success_story',
          status: spotlight.status || 'draft',
          featuredAlumniId: spotlight.featuredAlumniId || '',
          featuredAlumniName: spotlight.featuredAlumniName || '',
          featuredAlumniEmail: '', // Not in the base type, keeping empty
          videoUrl: spotlight.videoUrl || '',
          imageUrl: spotlight.imageUrl || '',
          viewCount: spotlight.viewCount?.toString() || '0',
          likeCount: spotlight.likeCount?.toString() || '0',
          shareCount: spotlight.shareCount?.toString() || '0',
          publishedDate: spotlight.publishedDate
            ? new Date(spotlight.publishedDate).toISOString().slice(0, 16)
            : '',
          scheduledDate: '', // Not in base type, keeping empty
          excerpt: '', // Not in base type, keeping empty
          category: '', // Not in base type, keeping empty
          isFeatured: false, // Not in base type, keeping false
          allowComments: true, // Not in base type, keeping true
          allowSharing: true, // Not in base type, keeping true
          seoTitle: '', // Not in base type, keeping empty
          seoDescription: '', // Not in base type, keeping empty
          notes: '', // Not in base type, keeping empty
        });

        setTags(spotlight.tags || []);
      } else {
        setError(response.error?.message || 'Failed to load spotlight');
      }
    } catch (err) {
      console.error('Error loading spotlight:', err);
      setError('Failed to load spotlight. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleTypeSelect = (type: SpotlightType) => {
    setFormData(prev => ({ ...prev, type }));
  };

  const handleStatusSelect = (status: SpotlightStatus) => {
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

  const toggleFeatured = () => {
    setFormData(prev => ({ ...prev, isFeatured: !prev.isFeatured }));
  };

  const toggleComments = () => {
    setFormData(prev => ({ ...prev, allowComments: !prev.allowComments }));
  };

  const toggleSharing = () => {
    setFormData(prev => ({ ...prev, allowSharing: !prev.allowSharing }));
  };

  const validateForm = (): string | null => {
    if (!formData.title.trim()) {
      return 'Title is required';
    }
    if (!formData.content.trim()) {
      return 'Content is required';
    }
    if (!formData.featuredAlumniName.trim()) {
      return 'Featured Alumni Name is required';
    }
    if (formData.status === 'scheduled' && !formData.scheduledDate) {
      return 'Scheduled date is required when status is scheduled';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      addToast({ type: 'warning', message: validationError });
      return;
    }

    try {
      setIsSaving(true);
      setError(null);

      // Prepare spotlight data for API
      const spotlightData: Omit<Spotlight, 'id' | 'createdAt'> = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        type: formData.type,
        status: formData.status,
        featuredAlumniId: formData.featuredAlumniId || '',
        featuredAlumniName: formData.featuredAlumniName.trim(),
        videoUrl: formData.videoUrl || undefined,
        imageUrl: formData.imageUrl || undefined,
        tags: tags,
        viewCount: parseInt(formData.viewCount) || 0,
        likeCount: parseInt(formData.likeCount) || 0,
        shareCount: parseInt(formData.shareCount) || 0,
        publishedDate: formData.publishedDate || undefined,
      };

      let response;
      if (isEditMode && id) {
        response = await SpotlightsService.updateSpotlight(id, spotlightData);
      } else {
        response = await SpotlightsService.createSpotlight(spotlightData);
      }

      if (response.success) {
        addToast({ type: 'success', message: `Spotlight ${isEditMode ? 'updated' : 'created'} successfully!` });
        navigate('/admin/spotlights');
      } else {
        const msg = response.error?.message || `Failed to ${isEditMode ? 'update' : 'create'} spotlight`;
        setError(msg);
        addToast({ type: 'error', message: msg });
      }
    } catch (err) {
      console.error('Error saving spotlight:', err);
      const msg = `Failed to ${isEditMode ? 'update' : 'create'} spotlight. Please try again.`;
      setError(msg);
      addToast({ type: 'error', message: msg });
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    navigate('/admin/spotlights');
  };

  // Show loading spinner while loading data
  if (isLoading) {
    return (
      <div className="overlay active">
        <div className="spotlights-manager">
          <div className="spotlights-header">
            <h2 className="spotlights-title">Loading Spotlight...</h2>
            <button className="close-btn" onClick={handleClose}>
              &times;
            </button>
          </div>
          <div className="spotlights-body">
            <LoadingSpinner />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="overlay active">
      <div className="spotlights-manager">
        <div className="spotlights-header">
          <h2 className="spotlights-title">
            {isEditMode ? 'Edit Spotlight' : 'Create New Spotlight'}
          </h2>
          <button className="close-btn" onClick={handleClose}>
            &times;
          </button>
        </div>

        <div className="spotlights-body">
          {error && (
            <ErrorMessage error={error} title="Error" />
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              {/* Left Column - Content */}
              <div className="form-section">
                <div className="form-section-title">
                  <div className="form-section-icon"></div>
                  Spotlight Content
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="spotlightTitle">
                    Title *
                  </label>
                  <input
                    type="text"
                    id="spotlightTitle"
                    className="form-input"
                    placeholder="e.g., From Student to Senior Developer: Sarah's Journey"
                    value={formData.title}
                    onChange={e => handleInputChange('title', e.target.value)}
                    required
                    disabled={isSaving}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="spotlightExcerpt">
                    Excerpt
                  </label>
                  <textarea
                    id="spotlightExcerpt"
                    className="form-input form-textarea"
                    placeholder="Brief description for previews and social sharing..."
                    value={formData.excerpt}
                    onChange={e => handleInputChange('excerpt', e.target.value)}
                    disabled={isSaving}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="spotlightContent">
                    Content *
                  </label>
                  <textarea
                    id="spotlightContent"
                    className="form-input form-textarea large"
                    placeholder="Enter the full spotlight content..."
                    value={formData.content}
                    onChange={e => handleInputChange('content', e.target.value)}
                    required
                    rows={12}
                    disabled={isSaving}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="spotlightCategory">
                    Category
                  </label>
                  <input
                    type="text"
                    id="spotlightCategory"
                    className="form-input"
                    placeholder="e.g., Career Growth"
                    value={formData.category}
                    onChange={e =>
                      handleInputChange('category', e.target.value)
                    }
                    disabled={isSaving}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label" htmlFor="imageUrl">
                      Featured Image URL
                    </label>
                    <input
                      type="url"
                      id="imageUrl"
                      className="form-input"
                      placeholder="https://example.com/image.jpg"
                      value={formData.imageUrl}
                      onChange={e =>
                        handleInputChange('imageUrl', e.target.value)
                      }
                      disabled={isSaving}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="videoUrl">
                      Video URL
                    </label>
                    <input
                      type="url"
                      id="videoUrl"
                      className="form-input"
                      placeholder="https://youtube.com/watch?v=..."
                      value={formData.videoUrl}
                      onChange={e =>
                        handleInputChange('videoUrl', e.target.value)
                      }
                      disabled={isSaving}
                    />
                  </div>
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
              </div>

              {/* Right Column - Settings */}
              <div className="form-section">
                <div className="form-section-title">
                  <div className="form-section-icon"></div>
                  Spotlight Settings
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="featuredAlumniName">
                    Featured Alumni Name *
                  </label>
                  <input
                    type="text"
                    id="featuredAlumniName"
                    className="form-input"
                    placeholder="e.g., Sarah Mthembu"
                    value={formData.featuredAlumniName}
                    onChange={e =>
                      handleInputChange('featuredAlumniName', e.target.value)
                    }
                    required
                    disabled={isSaving}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="featuredAlumniEmail">
                    Featured Alumni Email
                  </label>
                  <input
                    type="email"
                    id="featuredAlumniEmail"
                    className="form-input"
                    placeholder="sarah@example.com"
                    value={formData.featuredAlumniEmail}
                    onChange={e =>
                      handleInputChange('featuredAlumniEmail', e.target.value)
                    }
                    disabled={isSaving}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Spotlight Type</label>
                  <div className="status-selector">
                    <div
                      className={`status-option ${formData.type === 'success_story' ? 'selected' : ''} ${isSaving ? 'disabled' : ''}`}
                      onClick={() =>
                        !isSaving && handleTypeSelect('success_story')
                      }
                    >
                      <div className="status-option-title">Success Story</div>
                      <div className="status-option-desc">
                        Alumni success story
                      </div>
                    </div>
                    <div
                      className={`status-option ${formData.type === 'video_interview' ? 'selected' : ''} ${isSaving ? 'disabled' : ''}`}
                      onClick={() =>
                        !isSaving && handleTypeSelect('video_interview')
                      }
                    >
                      <div className="status-option-title">Video Interview</div>
                      <div className="status-option-desc">
                        Video interview content
                      </div>
                    </div>
                    <div
                      className={`status-option ${formData.type === 'tutorial' ? 'selected' : ''} ${isSaving ? 'disabled' : ''}`}
                      onClick={() => !isSaving && handleTypeSelect('tutorial')}
                    >
                      <div className="status-option-title">Tutorial</div>
                      <div className="status-option-desc">
                        Educational tutorial
                      </div>
                    </div>
                    <div
                      className={`status-option ${formData.type === 'achievement' ? 'selected' : ''} ${isSaving ? 'disabled' : ''}`}
                      onClick={() =>
                        !isSaving && handleTypeSelect('achievement')
                      }
                    >
                      <div className="status-option-title">Achievement</div>
                      <div className="status-option-desc">
                        Notable achievement
                      </div>
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Status</label>
                  <div className="status-selector">
                    <div
                      className={`status-option ${formData.status === 'published' ? 'selected' : ''} ${isSaving ? 'disabled' : ''}`}
                      onClick={() =>
                        !isSaving && handleStatusSelect('published')
                      }
                    >
                      <div className="status-option-title">Published</div>
                      <div className="status-option-desc">Live and visible</div>
                    </div>
                    <div
                      className={`status-option ${formData.status === 'draft' ? 'selected' : ''} ${isSaving ? 'disabled' : ''}`}
                      onClick={() => !isSaving && handleStatusSelect('draft')}
                    >
                      <div className="status-option-title">Draft</div>
                      <div className="status-option-desc">Work in progress</div>
                    </div>
                    <div
                      className={`status-option ${formData.status === 'scheduled' ? 'selected' : ''} ${isSaving ? 'disabled' : ''}`}
                      onClick={() =>
                        !isSaving && handleStatusSelect('scheduled')
                      }
                    >
                      <div className="status-option-title">Scheduled</div>
                      <div className="status-option-desc">
                        Scheduled for publishing
                      </div>
                    </div>
                  </div>
                </div>

                {formData.status === 'published' && (
                  <div className="form-group">
                    <label className="form-label" htmlFor="publishedDate">
                      Published Date
                    </label>
                    <input
                      type="datetime-local"
                      id="publishedDate"
                      className="form-input"
                      value={formData.publishedDate}
                      onChange={e =>
                        handleInputChange('publishedDate', e.target.value)
                      }
                      disabled={isSaving}
                    />
                  </div>
                )}

                {formData.status === 'scheduled' && (
                  <div className="form-group">
                    <label className="form-label" htmlFor="scheduledDate">
                      Scheduled Date *
                    </label>
                    <input
                      type="datetime-local"
                      id="scheduledDate"
                      className="form-input"
                      value={formData.scheduledDate}
                      onChange={e =>
                        handleInputChange('scheduledDate', e.target.value)
                      }
                      required={formData.status === 'scheduled'}
                      disabled={isSaving}
                    />
                  </div>
                )}

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label" htmlFor="viewCount">
                      View Count
                    </label>
                    <input
                      type="number"
                      id="viewCount"
                      className="form-input"
                      value={formData.viewCount}
                      onChange={e =>
                        handleInputChange('viewCount', e.target.value)
                      }
                      min="0"
                      disabled={isSaving}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="likeCount">
                      Like Count
                    </label>
                    <input
                      type="number"
                      id="likeCount"
                      className="form-input"
                      value={formData.likeCount}
                      onChange={e =>
                        handleInputChange('likeCount', e.target.value)
                      }
                      min="0"
                      disabled={isSaving}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="shareCount">
                    Share Count
                  </label>
                  <input
                    type="number"
                    id="shareCount"
                    className="form-input"
                    value={formData.shareCount}
                    onChange={e =>
                      handleInputChange('shareCount', e.target.value)
                    }
                    min="0"
                    disabled={isSaving}
                  />
                </div>

                <div className="toggle-group">
                  <div
                    className={`toggle-switch ${formData.isFeatured ? 'active' : ''} ${isSaving ? 'disabled' : ''}`}
                    onClick={() => !isSaving && toggleFeatured()}
                  >
                    <div className="toggle-handle"></div>
                  </div>
                  <label className="toggle-label">Featured Spotlight</label>
                </div>

                <div className="toggle-group">
                  <div
                    className={`toggle-switch ${formData.allowComments ? 'active' : ''} ${isSaving ? 'disabled' : ''}`}
                    onClick={() => !isSaving && toggleComments()}
                  >
                    <div className="toggle-handle"></div>
                  </div>
                  <label className="toggle-label">Allow Comments</label>
                </div>

                <div className="toggle-group">
                  <div
                    className={`toggle-switch ${formData.allowSharing ? 'active' : ''} ${isSaving ? 'disabled' : ''}`}
                    onClick={() => !isSaving && toggleSharing()}
                  >
                    <div className="toggle-handle"></div>
                  </div>
                  <label className="toggle-label">Allow Sharing</label>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="seoTitle">
                    SEO Title
                  </label>
                  <input
                    type="text"
                    id="seoTitle"
                    className="form-input"
                    placeholder="SEO optimized title"
                    value={formData.seoTitle}
                    onChange={e =>
                      handleInputChange('seoTitle', e.target.value)
                    }
                    disabled={isSaving}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="seoDescription">
                    SEO Description
                  </label>
                  <textarea
                    id="seoDescription"
                    className="form-input form-textarea"
                    placeholder="SEO meta description..."
                    value={formData.seoDescription}
                    onChange={e =>
                      handleInputChange('seoDescription', e.target.value)
                    }
                    disabled={isSaving}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="spotlightNotes">
                    Internal Notes
                  </label>
                  <textarea
                    id="spotlightNotes"
                    className="form-input form-textarea"
                    placeholder="Internal notes about this spotlight..."
                    value={formData.notes}
                    onChange={e => handleInputChange('notes', e.target.value)}
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
                disabled={isSaving}
              >
                {isSaving ? (
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
                    Save Spotlight
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
