import React, { useState, useEffect, useCallback } from 'react';
import { useToast } from '../../contexts/ToastContext';
import { useParams, useNavigate } from 'react-router-dom';
import { OpportunitiesService } from '@features/opportunities/services';
import { useMutationWithRefresh } from '../../hooks/useMutationWithRefresh';
import { LoadingSpinner } from '../../../../components/common/LoadingSpinner';
import { ErrorMessage } from '../../../../components/common/ErrorMessage';
import type { Opportunity, OpportunityType, OpportunityStatus } from '../../types';
type OpportunityLevel = Opportunity['level'];

export const OpportunityEditorPage: React.FC = () => {
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
    company: '',
    type: 'job' as OpportunityType,
    level: 'entry' as OpportunityLevel,
    location: '',
    isRemote: false,
    salary: '',
    description: '',
    contactEmail: '',
    status: 'pending' as OpportunityStatus,
    applicationCount: '0',
    postedDate: '',
    expiryDate: '',
  });

  const [requirements, setRequirements] = useState<string[]>([]);
  const [requirementInput, setRequirementInput] = useState('');

  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  // Load opportunity data when in edit mode
  useEffect(() => {
    if (isEditMode && id) {
      loadOpportunity(id);
    }
  }, [id, isEditMode]);

  const loadOpportunity = async (opportunityId: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await OpportunitiesService.getOpportunity(opportunityId);

      if (response.success && response.data) {
        const opportunity = response.data;

        // Map opportunity data to form data
        setFormData({
          title: opportunity.title || '',
          company: opportunity.company || '',
          type: opportunity.type || 'job',
          level: opportunity.level || 'entry',
          location: opportunity.location || '',
          isRemote: opportunity.isRemote || false,
          salary: opportunity.salary || '',
          description: opportunity.description || '',
          contactEmail: opportunity.contactEmail || '',
          status: opportunity.status || 'pending',
          applicationCount: opportunity.applicationCount?.toString() || '0',
          postedDate: opportunity.postedDate
            ? new Date(opportunity.postedDate).toISOString().slice(0, 10)
            : new Date().toISOString().slice(0,10),
          expiryDate: opportunity.expiryDate
            ? new Date(opportunity.expiryDate).toISOString().slice(0, 10)
            : '',
        });

        setRequirements(opportunity.requirements || []);
        setTags(opportunity.tags || []);
      } else {
        setError(response.error?.message || 'Failed to load opportunity');
      }
    } catch (err) {
      console.error('Error loading opportunity:', err);
      setError('Failed to load opportunity. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleTypeSelect = (type: OpportunityType) => {
    setFormData(prev => ({ ...prev, type }));
  };

  const handleLevelSelect = (level: OpportunityLevel) => {
    setFormData(prev => ({ ...prev, level }));
  };

  const handleStatusSelect = (status: OpportunityStatus) => {
    setFormData(prev => ({ ...prev, status }));
  };

  const handleRequirementInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && requirementInput.trim()) {
      e.preventDefault();
      if (!requirements.includes(requirementInput.trim())) {
        setRequirements([...requirements, requirementInput.trim()]);
      }
      setRequirementInput('');
    }
  };

  const removeRequirement = (requirementToRemove: string) => {
    setRequirements(requirements.filter(req => req !== requirementToRemove));
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

  const toggleRemote = () => {
    setFormData(prev => ({ ...prev, isRemote: !prev.isRemote }));
  };

  const validateForm = (): string | null => {
    if (!formData.title.trim()) {
      return 'Opportunity title is required';
    }
    if (!formData.company.trim()) {
      return 'Company name is required';
    }
    if (!formData.description.trim()) {
      return 'Description is required';
    }
    if (!formData.contactEmail.trim()) {
      return 'Contact email is required';
    }
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.contactEmail)) {
      return 'Please enter a valid email address';
    }
    if (
      formData.expiryDate &&
      formData.postedDate &&
      new Date(formData.expiryDate) < new Date(formData.postedDate)
    ) {
      return 'Expiry date cannot be before posted date';
    }
    return null;
  };

  const buildPayload = (): Omit<Opportunity,'id'> => ({
    title: formData.title.trim(),
    company: formData.company.trim(),
    type: formData.type,
    level: formData.level,
    location: formData.location.trim(),
    isRemote: formData.isRemote,
    salary: formData.salary || undefined,
    description: formData.description.trim(),
    requirements,
    tags,
    status: formData.status,
    applicationCount: parseInt(formData.applicationCount) || 0,
    viewCount: 0,
    postedDate: formData.postedDate || new Date().toISOString(),
    expiryDate: formData.expiryDate || undefined,
    contactEmail: formData.contactEmail.trim(),
  });

  const mutationFn = useCallback(async () => {
    const payload = buildPayload();
    return isEditMode && id ? OpportunitiesService.updateOpportunity(id, payload) : OpportunitiesService.createOpportunity(payload);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData, requirements, tags, isEditMode, id]);
  const refreshFn = useCallback(async () => OpportunitiesService.getOpportunities(1,50), []);
  const { run: runMutation } = useMutationWithRefresh<any, any>(mutationFn, refreshFn, {
    onSuccess: ({ mutation }) => {
      if (mutation?.success) {
        addToast({ type: 'success', message: `Opportunity ${isEditMode ? 'updated' : 'created'} successfully!` });
        navigate('/admin/opportunities');
      } else if (mutation) {
        const msg = mutation.error?.message || 'Failed to save opportunity';
        setError(msg);
        addToast({ type: 'error', message: msg });
      }
      setIsSaving(false);
    },
    onError: e => { const msg = e?.message || 'Failed to save opportunity'; setError(msg); addToast({ type: 'error', message: msg }); setIsSaving(false); }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validateForm();
  if (validationError) { setError(validationError); addToast({ type: 'warning', message: validationError }); return; }
    setIsSaving(true); runMutation();
  };

  const handleClose = () => {
    navigate('/admin/opportunities');
  };

  // Show loading spinner while loading data
  if (isLoading) {
    return (
      <div className="overlay active">
        <div className="opportunities-manager">
          <div className="opportunities-header">
            <h2 className="opportunities-title">Loading Opportunity...</h2>
            <button className="close-btn" onClick={handleClose}>
              &times;
            </button>
          </div>
          <div className="opportunities-body">
            <LoadingSpinner />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="overlay active">
      <div className="opportunities-manager">
        <div className="opportunities-header">
          <h2 className="opportunities-title">
            {isEditMode ? 'Edit Opportunity' : 'Create New Opportunity'}
          </h2>
          <button className="close-btn" onClick={handleClose}>
            &times;
          </button>
        </div>

        <div className="opportunities-body">
          {error && (
            <ErrorMessage error={error} title="Error" />
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              {/* Left Column - Opportunity Details */}
              <div className="form-section">
                <div className="form-section-title">
                  <div className="form-section-icon"></div>
                  Opportunity Details
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="opportunityTitle">
                    Job Title *
                  </label>
                  <input
                    type="text"
                    id="opportunityTitle"
                    className="form-input"
                    placeholder="e.g., Senior React Developer"
                    value={formData.title}
                    onChange={e => handleInputChange('title', e.target.value)}
                    required
                    disabled={isSaving}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label" htmlFor="opportunityCompany">
                      Company *
                    </label>
                    <input
                      type="text"
                      id="opportunityCompany"
                      className="form-input"
                      placeholder="e.g., TechCorp Solutions"
                      value={formData.company}
                      onChange={e =>
                        handleInputChange('company', e.target.value)
                      }
                      required
                      disabled={isSaving}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="opportunityLocation">
                      Location
                    </label>
                    <input
                      type="text"
                      id="opportunityLocation"
                      className="form-input"
                      placeholder="e.g., Cape Town, South Africa"
                      value={formData.location}
                      onChange={e =>
                        handleInputChange('location', e.target.value)
                      }
                      disabled={isSaving}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label
                    className="form-label"
                    htmlFor="opportunityDescription"
                  >
                    Description *
                  </label>
                  <textarea
                    id="opportunityDescription"
                    className="form-input form-textarea large"
                    placeholder="Enter detailed job description..."
                    value={formData.description}
                    onChange={e =>
                      handleInputChange('description', e.target.value)
                    }
                    required
                    disabled={isSaving}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="opportunitySalary">
                    Salary Range
                  </label>
                  <input
                    type="text"
                    id="opportunitySalary"
                    className="form-input"
                    placeholder="e.g., R50,000 - R80,000 per month"
                    value={formData.salary}
                    onChange={e => handleInputChange('salary', e.target.value)}
                    disabled={isSaving}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="opportunityEmail">
                    Contact Email *
                  </label>
                  <input
                    type="email"
                    id="opportunityEmail"
                    className="form-input"
                    placeholder="hr@techcorp.com"
                    value={formData.contactEmail}
                    onChange={e =>
                      handleInputChange('contactEmail', e.target.value)
                    }
                    required
                    disabled={isSaving}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Requirements</label>
                  <div className="tag-container">
                    {requirements.map(requirement => (
                      <span key={requirement} className="tag">
                        {requirement}
                        <button
                          type="button"
                          className="tag-remove"
                          onClick={() => removeRequirement(requirement)}
                          disabled={isSaving}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                    <input
                      type="text"
                      className="tag-input"
                      placeholder="Add requirements..."
                      value={requirementInput}
                      onChange={e => setRequirementInput(e.target.value)}
                      onKeyDown={handleRequirementInput}
                      disabled={isSaving}
                    />
                  </div>
                  <div className="form-help">
                    Press Enter to add requirements
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

              {/* Right Column - Opportunity Settings */}
              <div className="form-section">
                <div className="form-section-title">
                  <div className="form-section-icon"></div>
                  Opportunity Settings
                </div>

                <div className="form-group">
                  <label className="form-label">Opportunity Type</label>
                  <div className="status-selector">
                    <div
                      className={`status-option ${formData.type === 'job' ? 'selected' : ''} ${isSaving ? 'disabled' : ''}`}
                      onClick={() => !isSaving && handleTypeSelect('job')}
                    >
                      <div className="status-option-title">Full-time Job</div>
                      <div className="status-option-desc">
                        Permanent position
                      </div>
                    </div>
                    <div
                      className={`status-option ${formData.type === 'freelance' ? 'selected' : ''} ${isSaving ? 'disabled' : ''}`}
                      onClick={() => !isSaving && handleTypeSelect('freelance')}
                    >
                      <div className="status-option-title">Freelance</div>
                      <div className="status-option-desc">Contract work</div>
                    </div>
                    <div
                      className={`status-option ${formData.type === 'internship' ? 'selected' : ''} ${isSaving ? 'disabled' : ''}`}
                      onClick={() =>
                        !isSaving && handleTypeSelect('internship')
                      }
                    >
                      <div className="status-option-title">Internship</div>
                      <div className="status-option-desc">
                        Learning opportunity
                      </div>
                    </div>
                    <div
                      className={`status-option ${formData.type === 'collaboration' ? 'selected' : ''} ${isSaving ? 'disabled' : ''}`}
                      onClick={() =>
                        !isSaving && handleTypeSelect('collaboration')
                      }
                    >
                      <div className="status-option-title">Collaboration</div>
                      <div className="status-option-desc">
                        Partnership project
                      </div>
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Experience Level</label>
                  <div className="status-selector">
                    <div
                      className={`status-option ${formData.level === 'entry' ? 'selected' : ''} ${isSaving ? 'disabled' : ''}`}
                      onClick={() => !isSaving && handleLevelSelect('entry')}
                    >
                      <div className="status-option-title">Entry Level</div>
                      <div className="status-option-desc">
                        0-2 years experience
                      </div>
                    </div>
                    <div
                      className={`status-option ${formData.level === 'mid' ? 'selected' : ''} ${isSaving ? 'disabled' : ''}`}
                      onClick={() => !isSaving && handleLevelSelect('mid')}
                    >
                      <div className="status-option-title">Mid Level</div>
                      <div className="status-option-desc">
                        3-5 years experience
                      </div>
                    </div>
                    <div
                      className={`status-option ${formData.level === 'senior' ? 'selected' : ''} ${isSaving ? 'disabled' : ''}`}
                      onClick={() => !isSaving && handleLevelSelect('senior')}
                    >
                      <div className="status-option-title">Senior Level</div>
                      <div className="status-option-desc">
                        5+ years experience
                      </div>
                    </div>
                    <div
                      className={`status-option ${formData.level === 'executive' ? 'selected' : ''} ${isSaving ? 'disabled' : ''}`}
                      onClick={() =>
                        !isSaving && handleLevelSelect('executive')
                      }
                    >
                      <div className="status-option-title">Executive</div>
                      <div className="status-option-desc">
                        Leadership position
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
                        Accepting applications
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
                      className={`status-option ${formData.status === 'filled' ? 'selected' : ''} ${isSaving ? 'disabled' : ''}`}
                      onClick={() => !isSaving && handleStatusSelect('filled')}
                    >
                      <div className="status-option-title">Filled</div>
                      <div className="status-option-desc">Position filled</div>
                    </div>
                    <div
                      className={`status-option ${formData.status === 'expired' ? 'selected' : ''} ${isSaving ? 'disabled' : ''}`}
                      onClick={() => !isSaving && handleStatusSelect('expired')}
                    >
                      <div className="status-option-title">Expired</div>
                      <div className="status-option-desc">
                        No longer available
                      </div>
                    </div>
                  </div>
                </div>

                <div className="toggle-group">
                  <div
                    className={`toggle-switch ${formData.isRemote ? 'active' : ''} ${isSaving ? 'disabled' : ''}`}
                    onClick={() => !isSaving && toggleRemote()}
                  >
                    <div className="toggle-handle"></div>
                  </div>
                  <label className="toggle-label">Remote Work Available</label>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label" htmlFor="postedDate">
                      Posted Date
                    </label>
                    <input
                      type="date"
                      id="postedDate"
                      className="form-input"
                      value={formData.postedDate}
                      onChange={e =>
                        handleInputChange('postedDate', e.target.value)
                      }
                      disabled={isSaving}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="expiryDate">
                      Expiry Date
                    </label>
                    <input
                      type="date"
                      id="expiryDate"
                      className="form-input"
                      value={formData.expiryDate}
                      onChange={e =>
                        handleInputChange('expiryDate', e.target.value)
                      }
                      disabled={isSaving}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="applicationCount">
                    Application Count
                  </label>
                  <input
                    type="number"
                    id="applicationCount"
                    className="form-input"
                    value={formData.applicationCount}
                    onChange={e =>
                      handleInputChange('applicationCount', e.target.value)
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
                    Save Opportunity
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
