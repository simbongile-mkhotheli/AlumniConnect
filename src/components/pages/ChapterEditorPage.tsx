import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChaptersService } from '../../services/chaptersService';
import { SponsorsService } from '../../services/sponsorsService';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ErrorMessage } from '../common/ErrorMessage';
import type { Chapter, Sponsor } from '../../types';
import { useToast } from '../../contexts/ToastContext';

type ChapterStatus = 'active' | 'inactive' | 'pending' | 'new';
type ChapterPerformance = 'high' | 'medium' | 'low';

export const ChapterEditorPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  // Loading and error states
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Sponsors data
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [sponsorsLoading, setSponsorsLoading] = useState(true);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    province: '',
    status: 'new' as ChapterStatus,
    performance: 'medium' as ChapterPerformance,
    leadName: '',
    leadEmail: '',
    leadPhone: '',
    leadLinkedIn: '',
    memberCount: '0',
    engagementRate: '0',
    eventsThisMonth: '0',
    meetingVenue: '',
    meetingFrequency: 'monthly',
    description: '',
    sponsor: '',
    isSponsored: false,
  });

  // Toast API
  const { addToast } = useToast();

  const [focusAreas, setFocusAreas] = useState<string[]>([]);
  const [focusAreaInput, setFocusAreaInput] = useState('');

  // Load chapter data when in edit mode
  useEffect(() => {
    if (isEditMode && id) {
      loadChapter(id);
    }
  }, [id, isEditMode]);

  // Load sponsors for the dropdown
  useEffect(() => {
    const loadSponsors = async () => {
      try {
        setSponsorsLoading(true);
        const response = await SponsorsService.getSponsors(1, 100); // Get all sponsors
        if (response.success) {
          setSponsors(response.data || []);
        } else {
          console.warn('Failed to load sponsors:', response.error);
          // Don't fail the whole form if sponsors fail to load
        }
      } catch (err) {
        console.error('Error loading sponsors:', err);
      } finally {
        setSponsorsLoading(false);
      }
    };

    loadSponsors();
  }, []);

  const loadChapter = async (chapterId: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await ChaptersService.getChapter(chapterId);

      if (response.success && response.data) {
        const chapter = response.data;

        // Map chapter data to form data
        setFormData({
          name: chapter.name || '',
          location: chapter.location || '',
          province: chapter.province || '',
            status: chapter.status || 'new',
          performance: chapter.performance || 'medium',
          leadName: chapter.leadName || '',
          leadEmail: chapter.leadEmail || '',
          leadPhone: chapter.leadPhone || '',
          leadLinkedIn: chapter.leadLinkedIn || '',
          memberCount: chapter.memberCount?.toString() || '0',
          engagementRate: chapter.engagementRate?.toString() || '0',
          eventsThisMonth: chapter.eventsThisMonth?.toString() || '0',
          meetingVenue: chapter.meetingVenue || '',
          meetingFrequency: chapter.meetingFrequency || 'monthly',
          description: chapter.description || '',
          sponsor: chapter.sponsor || '',
          isSponsored: chapter.isSponsored || false,
        });

        setFocusAreas(chapter.focusAreas || []);
      } else {
        setError(response.error?.message || 'Failed to load chapter');
      }
    } catch (err) {
      console.error('Error loading chapter:', err);
      setError('Failed to load chapter. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleStatusSelect = (status: ChapterStatus) => {
    setFormData(prev => ({ ...prev, status }));
  };

  const handlePerformanceSelect = (performance: ChapterPerformance) => {
    setFormData(prev => ({ ...prev, performance }));
  };

  const handleFocusAreaInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && focusAreaInput.trim()) {
      e.preventDefault();
      if (!focusAreas.includes(focusAreaInput.trim())) {
        setFocusAreas([...focusAreas, focusAreaInput.trim()]);
      }
      setFocusAreaInput('');
    }
  };

  const removeFocusArea = (areaToRemove: string) => {
    setFocusAreas(focusAreas.filter(area => area !== areaToRemove));
  };

  const toggleSponsored = () => {
    setFormData(prev => ({ ...prev, isSponsored: !prev.isSponsored }));
  };

  const validateForm = (): string | null => {
    if (!formData.name.trim()) {
      return 'Chapter name is required';
    }
    if (!formData.location.trim()) {
      return 'Location is required';
    }
    if (!formData.province) {
      return 'Province is required';
    }
    if (!formData.description.trim()) {
      return 'Description is required';
    }
    if (!formData.leadName.trim()) {
      return 'Chapter lead name is required';
    }
    if (!formData.leadEmail.trim()) {
      return 'Chapter lead email is required';
    }
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.leadEmail)) {
      return 'Please enter a valid email address';
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

      // Prepare chapter data for API
      const chapterData: Omit<Chapter, 'id' | 'createdAt'> = {
        name: formData.name.trim(),
        location: formData.location.trim(),
        province: formData.province,
        status: formData.status,
        performance: formData.performance,
        leadName: formData.leadName.trim(),
        leadEmail: formData.leadEmail.trim(),
        leadPhone: formData.leadPhone || undefined,
        leadLinkedIn: formData.leadLinkedIn || undefined,
        memberCount: parseInt(formData.memberCount) || 0,
        engagementRate: parseFloat(formData.engagementRate) || 0,
        eventsThisMonth: parseInt(formData.eventsThisMonth) || 0,
        meetingVenue: formData.meetingVenue.trim(),
        meetingFrequency: formData.meetingFrequency,
        description: formData.description.trim(),
        focusAreas: focusAreas,
        sponsor: formData.sponsor || undefined,
        isSponsored: formData.isSponsored,
      };

      let response;
      if (isEditMode && id) {
        response = await ChaptersService.updateChapter(id, chapterData);
      } else {
        response = await ChaptersService.createChapter(chapterData);
      }

      if (response.success) {
        // Success toast then navigate
        addToast({
          type: 'success',
          message: `Chapter ${isEditMode ? 'updated' : 'created'} successfully!`,
        });
        navigate('/admin/chapters');
      } else {
        const msg =
          response.error?.message ||
          `Failed to ${isEditMode ? 'update' : 'create'} chapter`;
        setError(msg);
        addToast({ type: 'error', message: msg });
      }
    } catch (err) {
      console.error('Error saving chapter:', err);
      const msg = `Failed to ${isEditMode ? 'update' : 'create'} chapter. Please try again.`;
      setError(msg);
      addToast({ type: 'error', message: msg });
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    navigate('/admin/chapters');
  };

  // Show loading spinner while loading data
  if (isLoading) {
    return (
      <div className="overlay active">
        <div className="chapters-manager">
          <div className="chapters-header">
            <h2 className="chapters-title">Loading Chapter...</h2>
            <button className="close-btn" onClick={handleClose}>
              &times;
            </button>
          </div>
          <div className="chapters-body">
            <LoadingSpinner />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="overlay active">
      <div className="chapters-manager">
        <div className="chapters-header">
          <h2 className="chapters-title">
            {isEditMode ? 'Edit Chapter' : 'Create New Chapter'}
          </h2>
          <button className="close-btn" onClick={handleClose}>
            &times;
          </button>
        </div>

        <div className="chapters-body">
          {error && (
            <ErrorMessage error={error} onRetry={() => setError(null)} />
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              {/* Left Column - Chapter Details */}
              <div className="form-section">
                <div className="form-section-title">
                  <div className="form-section-icon"></div>
                  Chapter Information
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="chapterName">
                    Chapter Name *
                  </label>
                  <input
                    type="text"
                    id="chapterName"
                    className="form-input"
                    placeholder="e.g., Cape Town Tech Hub"
                    value={formData.name}
                    onChange={e => handleInputChange('name', e.target.value)}
                    required
                    disabled={isSaving}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label" htmlFor="chapterLocation">
                      Location *
                    </label>
                    <input
                      type="text"
                      id="chapterLocation"
                      className="form-input"
                      placeholder="e.g., Cape Town"
                      value={formData.location}
                      onChange={e =>
                        handleInputChange('location', e.target.value)
                      }
                      required
                      disabled={isSaving}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="chapterProvince">
                      Province *
                    </label>
                    <select
                      id="chapterProvince"
                      className="form-input form-select"
                      value={formData.province}
                      onChange={e =>
                        handleInputChange('province', e.target.value)
                      }
                      required
                      disabled={isSaving}
                    >
                      <option value="">Select Province</option>
                      <option value="western-cape">Western Cape</option>
                      <option value="gauteng">Gauteng</option>
                      <option value="kwazulu-natal">KwaZulu-Natal</option>
                      <option value="eastern-cape">Eastern Cape</option>
                      <option value="free-state">Free State</option>
                      <option value="limpopo">Limpopo</option>
                      <option value="mpumalanga">Mpumalanga</option>
                      <option value="northern-cape">Northern Cape</option>
                      <option value="north-west">North West</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="chapterDescription">
                    Description *
                  </label>
                  <textarea
                    id="chapterDescription"
                    className="form-input form-textarea large"
                    placeholder="Enter chapter description..."
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
                    <label className="form-label" htmlFor="meetingVenue">
                      Meeting Venue
                    </label>
                    <input
                      type="text"
                      id="meetingVenue"
                      className="form-input"
                      placeholder="e.g., WeWork Cape Town"
                      value={formData.meetingVenue}
                      onChange={e =>
                        handleInputChange('meetingVenue', e.target.value)
                      }
                      disabled={isSaving}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="meetingFrequency">
                      Meeting Frequency
                    </label>
                    <select
                      id="meetingFrequency"
                      className="form-input form-select"
                      value={formData.meetingFrequency}
                      onChange={e =>
                        handleInputChange('meetingFrequency', e.target.value)
                      }
                      disabled={isSaving}
                    >
                      <option value="weekly">Weekly</option>
                      <option value="bi-weekly">Bi-weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="quarterly">Quarterly</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Focus Areas</label>
                  <div className="tag-container">
                    {focusAreas.map(area => (
                      <span key={area} className="tag">
                        {area}
                        <button
                          type="button"
                          className="tag-remove"
                          onClick={() => removeFocusArea(area)}
                          disabled={isSaving}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                    <input
                      type="text"
                      className="tag-input"
                      placeholder="Add focus areas..."
                      value={focusAreaInput}
                      onChange={e => setFocusAreaInput(e.target.value)}
                      onKeyDown={handleFocusAreaInput}
                      disabled={isSaving}
                    />
                  </div>
                  <div className="form-help">
                    Press Enter to add focus areas
                  </div>
                </div>
              </div>

              {/* Right Column - Chapter Settings */}
              <div className="form-section">
                <div className="form-section-title">
                  <div className="form-section-icon"></div>
                  Leadership & Performance
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="leadName">
                    Chapter Lead Name *
                  </label>
                  <input
                    type="text"
                    id="leadName"
                    className="form-input"
                    placeholder="e.g., Sarah Mthembu"
                    value={formData.leadName}
                    onChange={e =>
                      handleInputChange('leadName', e.target.value)
                    }
                    required
                    disabled={isSaving}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label" htmlFor="leadEmail">
                      Lead Email *
                    </label>
                    <input
                      type="email"
                      id="leadEmail"
                      className="form-input"
                      placeholder="sarah@example.com"
                      value={formData.leadEmail}
                      onChange={e =>
                        handleInputChange('leadEmail', e.target.value)
                      }
                      required
                      disabled={isSaving}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="leadPhone">
                      Lead Phone
                    </label>
                    <input
                      type="tel"
                      id="leadPhone"
                      className="form-input"
                      placeholder="+27 82 123 4567"
                      value={formData.leadPhone}
                      onChange={e =>
                        handleInputChange('leadPhone', e.target.value)
                      }
                      disabled={isSaving}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="leadLinkedIn">
                    Lead LinkedIn
                  </label>
                  <input
                    type="url"
                    id="leadLinkedIn"
                    className="form-input"
                    placeholder="https://linkedin.com/in/sarah-mthembu"
                    value={formData.leadLinkedIn}
                    onChange={e =>
                      handleInputChange('leadLinkedIn', e.target.value)
                    }
                    disabled={isSaving}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label" htmlFor="memberCount">
                      Member Count
                    </label>
                    <input
                      type="number"
                      id="memberCount"
                      className="form-input"
                      value={formData.memberCount}
                      onChange={e =>
                        handleInputChange('memberCount', e.target.value)
                      }
                      min="0"
                      disabled={isSaving}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="engagementRate">
                      Engagement Rate (%)
                    </label>
                    <input
                      type="number"
                      id="engagementRate"
                      className="form-input"
                      value={formData.engagementRate}
                      onChange={e =>
                        handleInputChange('engagementRate', e.target.value)
                      }
                      min="0"
                      max="100"
                      step="0.1"
                      disabled={isSaving}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="eventsThisMonth">
                    Events This Month
                  </label>
                  <input
                    type="number"
                    id="eventsThisMonth"
                    className="form-input"
                    value={formData.eventsThisMonth}
                    onChange={e =>
                      handleInputChange('eventsThisMonth', e.target.value)
                    }
                    min="0"
                    disabled={isSaving}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Chapter Status</label>
                  <div className="status-selector">
                    <div
                      className={`status-option ${formData.status === 'active' ? 'selected' : ''} ${isSaving ? 'disabled' : ''}`}
                      onClick={() => !isSaving && handleStatusSelect('active')}
                    >
                      <div className="status-option-title">Active</div>
                      <div className="status-option-desc">
                        Fully operational
                      </div>
                    </div>
                    <div
                      className={`status-option ${formData.status === 'new' ? 'selected' : ''} ${isSaving ? 'disabled' : ''}`}
                      onClick={() => !isSaving && handleStatusSelect('new')}
                    >
                      <div className="status-option-title">New</div>
                      <div className="status-option-desc">
                        Recently established
                      </div>
                    </div>
                    <div
                      className={`status-option ${formData.status === 'inactive' ? 'selected' : ''} ${isSaving ? 'disabled' : ''}`}
                      onClick={() =>
                        !isSaving && handleStatusSelect('inactive')
                      }
                    >
                      <div className="status-option-title">Inactive</div>
                      <div className="status-option-desc">
                        Not currently active
                      </div>
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Performance Level</label>
                  <div className="status-selector">
                    <div
                      className={`status-option ${formData.performance === 'high' ? 'selected' : ''} ${isSaving ? 'disabled' : ''}`}
                      onClick={() =>
                        !isSaving && handlePerformanceSelect('high')
                      }
                    >
                      <div className="status-option-title">
                        High Performance
                      </div>
                      <div className="status-option-desc">80%+ engagement</div>
                    </div>
                    <div
                      className={`status-option ${formData.performance === 'medium' ? 'selected' : ''} ${isSaving ? 'disabled' : ''}`}
                      onClick={() =>
                        !isSaving && handlePerformanceSelect('medium')
                      }
                    >
                      <div className="status-option-title">
                        Medium Performance
                      </div>
                      <div className="status-option-desc">
                        60-79% engagement
                      </div>
                    </div>
                    <div
                      className={`status-option ${formData.performance === 'low' ? 'selected' : ''} ${isSaving ? 'disabled' : ''}`}
                      onClick={() =>
                        !isSaving && handlePerformanceSelect('low')
                      }
                    >
                      <div className="status-option-title">Low Performance</div>
                      <div className="status-option-desc">
                        &lt;60% engagement
                      </div>
                    </div>
                  </div>
                </div>

                <div className="toggle-group">
                  <div
                    className={`toggle-switch ${formData.isSponsored ? 'active' : ''} ${isSaving ? 'disabled' : ''}`}
                    onClick={() => !isSaving && toggleSponsored()}
                  >
                    <div className="toggle-handle"></div>
                  </div>
                  <label className="toggle-label">Has Sponsor</label>
                </div>

                {formData.isSponsored && (
                  <div className="form-group">
                    <label className="form-label" htmlFor="sponsor">
                      Sponsor
                    </label>
                    <select
                      id="sponsor"
                      className="form-input form-select"
                      value={formData.sponsor}
                      onChange={e =>
                        handleInputChange('sponsor', e.target.value)
                      }
                      disabled={isSaving || sponsorsLoading}
                    >
                      <option value="">
                        {sponsorsLoading ? 'Loading sponsors...' : 'Select Sponsor'}
                      </option>
                      {sponsors
                        .filter(sponsor => sponsor.status === 'active') // Only show active sponsors
                        .map(sponsor => (
                          <option key={sponsor.id} value={sponsor.id}>
                            {sponsor.name} ({sponsor.tier})
                          </option>
                        ))}
                    </select>
                  </div>
                )}
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
                    Save Chapter
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
