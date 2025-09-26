import React, { useState, useEffect, useCallback } from 'react';
import { useToast } from '../../contexts/ToastContext';
import { useParams, useNavigate } from 'react-router-dom';
import { PartnersService } from '../../services/partnersService';
import { useMutationWithRefresh } from '../../hooks/useMutationWithRefresh';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ErrorMessage } from '../common/ErrorMessage';
import type { Partner } from '../../types';

// Use widened unions aligned with central types; include other possible values
type PartnerType = Partner['type'];
type PartnerStatus = Partner['status'];

export const PartnerEditorPage: React.FC = () => {
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
    name: '',
    type: 'hiring' as PartnerType,
    status: 'pending' as PartnerStatus,
    logo: '',
    description: '',
    website: '',
    contactEmail: '',
    jobOpportunities: '0',
    alumniHired: '0',
    hireRate: '0',
    partnershipSince: '',
    notes: '',
  });

  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  // Load partner data when in edit mode
  useEffect(() => {
    if (isEditMode && id) {
      loadPartner(id);
    }
  }, [id, isEditMode]);

  const loadPartner = async (partnerId: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await PartnersService.getPartner(partnerId);

      if (response.success && response.data) {
        const partner = response.data;

        // Map partner data to form data
        setFormData({
          name: partner.name || '',
          type: partner.type || 'hiring',
          status: partner.status || 'pending',
          logo: partner.logo || '',
          description: partner.description || '',
          website: partner.website || '',
          contactEmail: partner.contactEmail || '',
          jobOpportunities: partner.jobOpportunities?.toString() || '0',
          alumniHired: partner.alumniHired?.toString() || '0',
          hireRate: partner.hireRate?.toString() || '0',
          partnershipSince: partner.partnershipSince
            ? new Date(partner.partnershipSince).toISOString().slice(0, 10)
            : '',
          notes: '', // Not in base type, keeping empty
        });

        setTags(partner.tags || []);
      } else {
        setError(response.error?.message || 'Failed to load partner');
      }
    } catch (err) {
      console.error('Error loading partner:', err);
      setError('Failed to load partner. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleTypeSelect = (type: PartnerType) => {
    setFormData(prev => ({ ...prev, type }));
  };

  const handleStatusSelect = (status: PartnerStatus) => {
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
    if (!formData.name.trim()) {
      return 'Partner name is required';
    }
    if (!formData.contactEmail.trim()) {
      return 'Contact email is required';
    }
    if (!formData.description.trim()) {
      return 'Description is required';
    }
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.contactEmail)) {
      return 'Please enter a valid email address';
    }
    return null;
  };

  const buildPayload = (): Omit<Partner,'id'> => ({
    name: formData.name.trim(),
    type: formData.type,
    status: formData.status,
    logo: formData.logo || undefined,
    description: formData.description.trim(),
    website: formData.website || undefined,
    contactEmail: formData.contactEmail.trim(),
    jobOpportunities: parseInt(formData.jobOpportunities) || 0,
    alumniHired: parseInt(formData.alumniHired) || 0,
    hireRate: parseFloat(formData.hireRate) || 0,
    createdAt: new Date().toISOString(),
    partnershipSince: formData.partnershipSince || new Date().toISOString(),
    tags
  });

  const mutationFn = useCallback(async () => {
    const payload = buildPayload();
    return isEditMode && id ? PartnersService.updatePartner(id, payload) : PartnersService.createPartner(payload);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData, tags, isEditMode, id]);
  const refreshFn = useCallback(async () => PartnersService.getPartners(1,50), []);
  const { run: runMutation } = useMutationWithRefresh<any, any>(mutationFn, refreshFn, {
    onSuccess: ({ mutation }) => {
      if (mutation?.success) {
        addToast({ type: 'success', message: `Partner ${isEditMode ? 'updated' : 'created'} successfully!` });
        navigate('/admin/partners');
      } else if (mutation) {
        const msg = mutation.error?.message || 'Failed to save partner';
        setError(msg);
        addToast({ type: 'error', message: msg });
      }
      setIsSaving(false);
    },
    onError: e => { const msg = e?.message || 'Failed to save partner'; setError(msg); addToast({ type: 'error', message: msg }); setIsSaving(false); }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validateForm();
  if (validationError) { setError(validationError); addToast({ type: 'warning', message: validationError }); return; }
    setIsSaving(true); runMutation();
  };

  const handleClose = () => {
    navigate('/admin/partners');
  };

  // Show loading spinner while loading data
  if (isLoading) {
    return (
      <div className="overlay active">
        <div className="partners-manager">
          <div className="partners-header">
            <h2 className="partners-title">Loading Partner...</h2>
            <button className="close-btn" onClick={handleClose}>
              &times;
            </button>
          </div>
          <div className="partners-body">
            <LoadingSpinner />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="overlay active">
      <div className="partners-manager">
        <div className="partners-header">
          <h2 className="partners-title">
            {isEditMode ? 'Edit Partner' : 'Create New Partner'}
          </h2>
          <button className="close-btn" onClick={handleClose}>
            &times;
          </button>
        </div>

        <div className="partners-body">
          {error && (
            <ErrorMessage error={error} title="Error" />
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              {/* Left Column - Partner Information */}
              <div className="form-section">
                <div className="form-section-title">
                  <div className="form-section-icon"></div>
                  Partner Information
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="partnerName">
                    Partner Name *
                  </label>
                  <input
                    type="text"
                    id="partnerName"
                    className="form-input"
                    placeholder="e.g., TechCorp Solutions"
                    value={formData.name}
                    onChange={e => handleInputChange('name', e.target.value)}
                    required
                    disabled={isSaving}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="partnerDescription">
                    Description *
                  </label>
                  <textarea
                    id="partnerDescription"
                    className="form-input form-textarea large"
                    placeholder="Enter partner description..."
                    value={formData.description}
                    onChange={e =>
                      handleInputChange('description', e.target.value)
                    }
                    required
                    disabled={isSaving}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="partnerLogo">
                    Logo URL
                  </label>
                  <input
                    type="url"
                    id="partnerLogo"
                    className="form-input"
                    placeholder="https://example.com/logo.png"
                    value={formData.logo}
                    onChange={e => handleInputChange('logo', e.target.value)}
                    disabled={isSaving}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label" htmlFor="partnerWebsite">
                      Website
                    </label>
                    <input
                      type="url"
                      id="partnerWebsite"
                      className="form-input"
                      placeholder="https://techcorp.com"
                      value={formData.website}
                      onChange={e =>
                        handleInputChange('website', e.target.value)
                      }
                      disabled={isSaving}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="partnerEmail">
                      Contact Email *
                    </label>
                    <input
                      type="email"
                      id="partnerEmail"
                      className="form-input"
                      placeholder="contact@techcorp.com"
                      value={formData.contactEmail}
                      onChange={e =>
                        handleInputChange('contactEmail', e.target.value)
                      }
                      required
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

                <div className="form-group">
                  <label className="form-label" htmlFor="partnerNotes">
                    Internal Notes
                  </label>
                  <textarea
                    id="partnerNotes"
                    className="form-input form-textarea"
                    placeholder="Internal notes about this partner..."
                    value={formData.notes}
                    onChange={e => handleInputChange('notes', e.target.value)}
                    disabled={isSaving}
                  />
                </div>
              </div>

              {/* Right Column - Partner Settings */}
              <div className="form-section">
                <div className="form-section-title">
                  <div className="form-section-icon"></div>
                  Partnership Details
                </div>

                <div className="form-group">
                  <label className="form-label">Partner Type</label>
                  <div className="status-selector">
                    <div
                      className={`status-option ${formData.type === 'hiring' ? 'selected' : ''} ${isSaving ? 'disabled' : ''}`}
                      onClick={() => !isSaving && handleTypeSelect('hiring')}
                    >
                      <div className="status-option-title">Hiring Partner</div>
                      <div className="status-option-desc">Recruits alumni</div>
                    </div>
                    <div
                      className={`status-option ${formData.type === 'technology' ? 'selected' : ''} ${isSaving ? 'disabled' : ''}`}
                      onClick={() =>
                        !isSaving && handleTypeSelect('technology')
                      }
                    >
                      <div className="status-option-title">
                        Technology Partner
                      </div>
                      <div className="status-option-desc">
                        Tech collaboration
                      </div>
                    </div>
                    <div
                      className={`status-option ${formData.type === 'education' ? 'selected' : ''} ${isSaving ? 'disabled' : ''}`}
                      onClick={() => !isSaving && handleTypeSelect('education')}
                    >
                      <div className="status-option-title">
                        Education Partner
                      </div>
                      <div className="status-option-desc">
                        Learning programs
                      </div>
                    </div>
                    <div
                      className={`status-option ${formData.type === 'startup' ? 'selected' : ''} ${isSaving ? 'disabled' : ''}`}
                      onClick={() => !isSaving && handleTypeSelect('startup')}
                    >
                      <div className="status-option-title">Startup Partner</div>
                      <div className="status-option-desc">
                        Innovation support
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
                        Currently partnering
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
                  <label className="form-label" htmlFor="partnershipSince">
                    Partnership Since
                  </label>
                  <input
                    type="date"
                    id="partnershipSince"
                    className="form-input"
                    value={formData.partnershipSince}
                    onChange={e =>
                      handleInputChange('partnershipSince', e.target.value)
                    }
                    disabled={isSaving}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label" htmlFor="jobOpportunities">
                      Job Opportunities
                    </label>
                    <input
                      type="number"
                      id="jobOpportunities"
                      className="form-input"
                      value={formData.jobOpportunities}
                      onChange={e =>
                        handleInputChange('jobOpportunities', e.target.value)
                      }
                      min="0"
                      disabled={isSaving}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="alumniHired">
                      Alumni Hired
                    </label>
                    <input
                      type="number"
                      id="alumniHired"
                      className="form-input"
                      value={formData.alumniHired}
                      onChange={e =>
                        handleInputChange('alumniHired', e.target.value)
                      }
                      min="0"
                      disabled={isSaving}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="hireRate">
                    Hire Rate (%)
                  </label>
                  <input
                    type="number"
                    id="hireRate"
                    className="form-input"
                    value={formData.hireRate}
                    onChange={e =>
                      handleInputChange('hireRate', e.target.value)
                    }
                    min="0"
                    max="100"
                    step="0.1"
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
                    Save Partner
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
