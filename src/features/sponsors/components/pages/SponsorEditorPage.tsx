import React, { useState, useEffect, useCallback } from 'react';
import { useToast } from '../../../../contexts/ToastContext';
import { useParams, useNavigate } from 'react-router-dom';
import { SponsorsService } from '@features/sponsors/services';
import { useMutationWithRefresh } from '../../../../hooks/useMutationWithRefresh';
import { LoadingSpinner } from '../../../../components/common/LoadingSpinner';
import { ErrorMessage } from '../../../../components/common/ErrorMessage';
import type { Sponsor } from '@features/sponsors/types';

type SponsorTier = 'platinum' | 'gold' | 'silver' | 'bronze';
type SponsorStatus = 'active' | 'pending' | 'inactive' | 'expired';

export const SponsorEditorPage: React.FC = () => {
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
    tier: 'bronze' as SponsorTier,
    status: 'pending' as SponsorStatus,
    logo: '',
    description: '',
    website: '',
    contactEmail: '',
    eventsSponsored: '0',
    chaptersSponsored: '0',
    totalValue: '0',
    partnershipSince: '',
    notes: '',
  });

  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  // Load sponsor data when in edit mode
  useEffect(() => {
    if (isEditMode && id) {
      loadSponsor(id);
    }
  }, [id, isEditMode]);

  const loadSponsor = async (sponsorId: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await SponsorsService.getSponsor(sponsorId);

      if (response.success && response.data) {
        const sponsor = response.data;

        // Map sponsor data to form data
        setFormData({
          name: sponsor.name || '',
          tier: sponsor.tier || 'bronze',
          status: sponsor.status || 'pending',
          logo: sponsor.logo || '',
          description: sponsor.description || '',
          website: sponsor.website || '',
          contactEmail: sponsor.contactEmail || '',
          eventsSponsored: sponsor.eventsSponsored?.toString() || '0',
          chaptersSponsored: sponsor.chaptersSponsored?.toString() || '0',
          totalValue: sponsor.totalValue?.toString() || '0',
          partnershipSince: sponsor.partnershipSince
            ? new Date(sponsor.partnershipSince).toISOString().slice(0, 10)
            : '',
          notes: '', // Not in base type, keeping empty
        });

        setTags(sponsor.tags || []);
      } else {
        setError(response.error?.message || 'Failed to load sponsor');
      }
    } catch (err) {
      console.error('Error loading sponsor:', err);
      setError('Failed to load sponsor. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleTierSelect = (tier: SponsorTier) => {
    setFormData(prev => ({ ...prev, tier }));
  };

  const handleStatusSelect = (status: SponsorStatus) => {
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
      return 'Sponsor name is required';
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

  const buildSponsorPayload = (): Omit<Sponsor, 'id' | 'createdAt'> => ({
    name: formData.name.trim(),
    tier: formData.tier,
    status: formData.status,
    logo: formData.logo || undefined,
    description: formData.description.trim(),
    website: formData.website || undefined,
    contactEmail: formData.contactEmail.trim(),
    eventsSponsored: parseInt(formData.eventsSponsored) || 0,
    chaptersSponsored: parseInt(formData.chaptersSponsored) || 0,
    totalValue: parseFloat(formData.totalValue) || 0,
    partnershipSince: formData.partnershipSince || new Date().toISOString(),
    tags: tags,
  });

  const mutationFn = useCallback(async () => {
    const sponsorData = buildSponsorPayload();
    if (isEditMode && id) {
      return SponsorsService.updateSponsor(id, sponsorData);
    }
    return SponsorsService.createSponsor(sponsorData);
  }, [isEditMode, id, formData, tags]);

  const refreshFn = useCallback(async () => {
    // Lightweight list refresh to ensure UI consistency after navigation
    return SponsorsService.getSponsors(1, 50);
  }, []);

  const { run: runMutation } = useMutationWithRefresh<any, any>(mutationFn, refreshFn, {
    onSuccess: ({ mutation }) => {
      if (mutation?.success) {
        addToast({ type: 'success', message: `Sponsor ${isEditMode ? 'updated' : 'created'} successfully!` });
        navigate('/admin/sponsors');
      } else if (mutation && !mutation.success) {
        const msg = mutation.error?.message || 'Operation failed';
        setError(msg);
        addToast({ type: 'error', message: msg });
      }
      setIsSaving(false);
    },
    onError: (e) => {
      const msg = e?.message || 'Failed to save sponsor';
      setError(msg);
      addToast({ type: 'error', message: msg });
      setIsSaving(false);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      addToast({ type: 'warning', message: validationError });
      return;
    }
    setIsSaving(true);
    runMutation();
  };

  const handleClose = () => {
    navigate('/admin/sponsors');
  };

  // Show loading spinner while loading data
  if (isLoading) {
    return (
      <div className="overlay active">
        <div className="sponsors-manager">
          <div className="sponsors-header">
            <h2 className="sponsors-title">Loading Sponsor...</h2>
            <button className="close-btn" onClick={handleClose}>
              &times;
            </button>
          </div>
          <div className="sponsors-body">
            <LoadingSpinner />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="overlay active">
      <div className="sponsors-manager">
        <div className="sponsors-header">
          <h2 className="sponsors-title">
            {isEditMode ? 'Edit Sponsor' : 'Create New Sponsor'}
          </h2>
          <button className="close-btn" onClick={handleClose}>
            &times;
          </button>
        </div>

        <div className="sponsors-body">
          {error && (
            <ErrorMessage error={error} title="Error" />
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              {/* Left Column - Sponsor Information */}
              <div className="form-section">
                <div className="form-section-title">
                  <div className="form-section-icon"></div>
                  Sponsor Information
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="sponsorName">
                    Sponsor Name *
                  </label>
                  <input
                    type="text"
                    id="sponsorName"
                    className="form-input"
                    placeholder="e.g., TechCorp Solutions"
                    value={formData.name}
                    onChange={e => handleInputChange('name', e.target.value)}
                    required
                    disabled={isSaving}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="sponsorDescription">
                    Description *
                  </label>
                  <textarea
                    id="sponsorDescription"
                    className="form-input form-textarea large"
                    placeholder="Enter sponsor description..."
                    value={formData.description}
                    onChange={e =>
                      handleInputChange('description', e.target.value)
                    }
                    required
                    disabled={isSaving}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="sponsorLogo">
                    Logo URL
                  </label>
                  <input
                    type="url"
                    id="sponsorLogo"
                    className="form-input"
                    placeholder="https://example.com/logo.png"
                    value={formData.logo}
                    onChange={e => handleInputChange('logo', e.target.value)}
                    disabled={isSaving}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label" htmlFor="sponsorWebsite">
                      Website
                    </label>
                    <input
                      type="url"
                      id="sponsorWebsite"
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
                    <label className="form-label" htmlFor="sponsorEmail">
                      Contact Email *
                    </label>
                    <input
                      type="email"
                      id="sponsorEmail"
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
                  <label className="form-label" htmlFor="sponsorNotes">
                    Internal Notes
                  </label>
                  <textarea
                    id="sponsorNotes"
                    className="form-input form-textarea"
                    placeholder="Internal notes about this sponsor..."
                    value={formData.notes}
                    onChange={e => handleInputChange('notes', e.target.value)}
                    disabled={isSaving}
                  />
                </div>
              </div>

              {/* Right Column - Sponsor Settings */}
              <div className="form-section">
                <div className="form-section-title">
                  <div className="form-section-icon"></div>
                  Sponsorship Details
                </div>

                <div className="form-group">
                  <label className="form-label">Sponsor Tier</label>
                  <div className="status-selector">
                    <div
                      className={`status-option ${formData.tier === 'platinum' ? 'selected' : ''} ${isSaving ? 'disabled' : ''}`}
                      onClick={() => !isSaving && handleTierSelect('platinum')}
                    >
                      <div className="status-option-title">Platinum</div>
                      <div className="status-option-desc">
                        Premium tier sponsor
                      </div>
                    </div>
                    <div
                      className={`status-option ${formData.tier === 'gold' ? 'selected' : ''} ${isSaving ? 'disabled' : ''}`}
                      onClick={() => !isSaving && handleTierSelect('gold')}
                    >
                      <div className="status-option-title">Gold</div>
                      <div className="status-option-desc">
                        High tier sponsor
                      </div>
                    </div>
                    <div
                      className={`status-option ${formData.tier === 'silver' ? 'selected' : ''} ${isSaving ? 'disabled' : ''}`}
                      onClick={() => !isSaving && handleTierSelect('silver')}
                    >
                      <div className="status-option-title">Silver</div>
                      <div className="status-option-desc">Mid tier sponsor</div>
                    </div>
                    <div
                      className={`status-option ${formData.tier === 'bronze' ? 'selected' : ''} ${isSaving ? 'disabled' : ''}`}
                      onClick={() => !isSaving && handleTierSelect('bronze')}
                    >
                      <div className="status-option-title">Bronze</div>
                      <div className="status-option-desc">
                        Entry tier sponsor
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
                        Currently sponsoring
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
                    <div
                      className={`status-option ${formData.status === 'expired' ? 'selected' : ''} ${isSaving ? 'disabled' : ''}`}
                      onClick={() => !isSaving && handleStatusSelect('expired')}
                    >
                      <div className="status-option-title">Expired</div>
                      <div className="status-option-desc">
                        Sponsorship expired
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
                    <label className="form-label" htmlFor="eventsSponsored">
                      Events Sponsored
                    </label>
                    <input
                      type="number"
                      id="eventsSponsored"
                      className="form-input"
                      value={formData.eventsSponsored}
                      onChange={e =>
                        handleInputChange('eventsSponsored', e.target.value)
                      }
                      min="0"
                      disabled={isSaving}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="chaptersSponsored">
                      Chapters Sponsored
                    </label>
                    <input
                      type="number"
                      id="chaptersSponsored"
                      className="form-input"
                      value={formData.chaptersSponsored}
                      onChange={e =>
                        handleInputChange('chaptersSponsored', e.target.value)
                      }
                      min="0"
                      disabled={isSaving}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="totalValue">
                    Total Sponsorship Value (R)
                  </label>
                  <input
                    type="number"
                    id="totalValue"
                    className="form-input"
                    value={formData.totalValue}
                    onChange={e =>
                      handleInputChange('totalValue', e.target.value)
                    }
                    min="0"
                    step="0.01"
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
                    Save Sponsor
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
