import React, { useState } from 'react';
import { useToast } from '../../contexts/ToastContext';
import { useParams, useNavigate } from 'react-router-dom';

type ProfileStatus = 'active' | 'pending' | 'inactive' | 'suspended';
type EmploymentStatus = 'employed' | 'seeking' | 'entrepreneur' | 'student';
type MentorshipRole = 'mentor' | 'mentee' | 'both' | 'none';

export const ProfileEditorPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);
  const { addToast } = useToast();

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    linkedIn: '',
    github: '',
    website: '',
    profileImage: '',
    title: '',
    company: '',
    location: '',
    bio: '',
    status: 'pending' as ProfileStatus,
    employmentStatus: 'seeking' as EmploymentStatus,
    mentorshipRole: 'none' as MentorshipRole,
    yearsExperience: '0',
    impactScore: '0',
    graduationYear: '',
    degree: '',
    university: '',
    isAvailableForMentoring: false,
    isSeekingMentorship: false,
    maxMentees: '0',
    preferredMentorshipAreas: '',
    notes: '',
  });

  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');

  const [interests, setInterests] = useState<string[]>([]);
  const [interestInput, setInterestInput] = useState('');

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleStatusSelect = (status: ProfileStatus) => {
    setFormData(prev => ({ ...prev, status }));
  };

  const handleEmploymentSelect = (employmentStatus: EmploymentStatus) => {
    setFormData(prev => ({ ...prev, employmentStatus }));
  };

  const handleMentorshipRoleSelect = (mentorshipRole: MentorshipRole) => {
    setFormData(prev => ({ ...prev, mentorshipRole }));

    // Auto-update mentorship availability based on role
    if (mentorshipRole === 'mentor' || mentorshipRole === 'both') {
      setFormData(prev => ({ ...prev, isAvailableForMentoring: true }));
    } else {
      setFormData(prev => ({ ...prev, isAvailableForMentoring: false }));
    }

    if (mentorshipRole === 'mentee' || mentorshipRole === 'both') {
      setFormData(prev => ({ ...prev, isSeekingMentorship: true }));
    } else {
      setFormData(prev => ({ ...prev, isSeekingMentorship: false }));
    }
  };

  const handleSkillInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && skillInput.trim()) {
      e.preventDefault();
      if (!skills.includes(skillInput.trim())) {
        setSkills([...skills, skillInput.trim()]);
      }
      setSkillInput('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter(skill => skill !== skillToRemove));
  };

  const handleInterestInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && interestInput.trim()) {
      e.preventDefault();
      if (!interests.includes(interestInput.trim())) {
        setInterests([...interests, interestInput.trim()]);
      }
      setInterestInput('');
    }
  };

  const removeInterest = (interestToRemove: string) => {
    setInterests(interests.filter(interest => interest !== interestToRemove));
  };

  const toggleMentoringAvailability = () => {
    setFormData(prev => ({
      ...prev,
      isAvailableForMentoring: !prev.isAvailableForMentoring,
    }));
  };

  const toggleSeekingMentorship = () => {
    setFormData(prev => ({
      ...prev,
      isSeekingMentorship: !prev.isSeekingMentorship,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Profile form submitted:', { ...formData, skills, interests });
    addToast({ type: 'success', message: `Profile ${isEditMode ? 'updated' : 'created'} successfully!` });
    navigate('/admin/profiles');
  };

  const handleClose = () => {
    navigate('/admin/profiles');
  };

  return (
    <div className="overlay active">
      <div className="profiles-manager">
        <div className="profiles-header">
          <h2 className="profiles-title">
            {isEditMode ? 'Edit Profile' : 'Create New Profile'}
          </h2>
          <button className="close-btn" onClick={handleClose}>
            &times;
          </button>
        </div>

        <div className="profiles-body">
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              {/* Left Column - Personal Information */}
              <div className="form-section">
                <div className="form-section-title">
                  <div className="form-section-icon"></div>
                  Personal Information
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="profileName">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="profileName"
                    className="form-input"
                    placeholder="e.g., Sarah Mthembu"
                    value={formData.name}
                    onChange={e => handleInputChange('name', e.target.value)}
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label" htmlFor="profileEmail">
                      Email *
                    </label>
                    <input
                      type="email"
                      id="profileEmail"
                      className="form-input"
                      placeholder="sarah@example.com"
                      value={formData.email}
                      onChange={e => handleInputChange('email', e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="profilePhone">
                      Phone
                    </label>
                    <input
                      type="tel"
                      id="profilePhone"
                      className="form-input"
                      placeholder="+27 82 123 4567"
                      value={formData.phone}
                      onChange={e => handleInputChange('phone', e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="profileImage">
                    Profile Image URL
                  </label>
                  <input
                    type="url"
                    id="profileImage"
                    className="form-input"
                    placeholder="https://example.com/profile.jpg"
                    value={formData.profileImage}
                    onChange={e =>
                      handleInputChange('profileImage', e.target.value)
                    }
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="profileBio">
                    Bio *
                  </label>
                  <textarea
                    id="profileBio"
                    className="form-input form-textarea large"
                    placeholder="Tell us about yourself..."
                    value={formData.bio}
                    onChange={e => handleInputChange('bio', e.target.value)}
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label" htmlFor="profileLinkedIn">
                      LinkedIn
                    </label>
                    <input
                      type="url"
                      id="profileLinkedIn"
                      className="form-input"
                      placeholder="https://linkedin.com/in/sarah-mthembu"
                      value={formData.linkedIn}
                      onChange={e =>
                        handleInputChange('linkedIn', e.target.value)
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="profileGithub">
                      GitHub
                    </label>
                    <input
                      type="url"
                      id="profileGithub"
                      className="form-input"
                      placeholder="https://github.com/sarah-mthembu"
                      value={formData.github}
                      onChange={e =>
                        handleInputChange('github', e.target.value)
                      }
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="profileWebsite">
                    Personal Website
                  </label>
                  <input
                    type="url"
                    id="profileWebsite"
                    className="form-input"
                    placeholder="https://sarahmthembu.dev"
                    value={formData.website}
                    onChange={e => handleInputChange('website', e.target.value)}
                  />
                </div>
              </div>

              {/* Right Column - Professional Information */}
              <div className="form-section">
                <div className="form-section-title">
                  <div className="form-section-icon"></div>
                  Professional Information
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label" htmlFor="profileTitle">
                      Job Title
                    </label>
                    <input
                      type="text"
                      id="profileTitle"
                      className="form-input"
                      placeholder="e.g., Senior Developer"
                      value={formData.title}
                      onChange={e => handleInputChange('title', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="profileCompany">
                      Company
                    </label>
                    <input
                      type="text"
                      id="profileCompany"
                      className="form-input"
                      placeholder="e.g., TechCorp Solutions"
                      value={formData.company}
                      onChange={e =>
                        handleInputChange('company', e.target.value)
                      }
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label" htmlFor="profileLocation">
                      Location
                    </label>
                    <input
                      type="text"
                      id="profileLocation"
                      className="form-input"
                      placeholder="e.g., Cape Town, South Africa"
                      value={formData.location}
                      onChange={e =>
                        handleInputChange('location', e.target.value)
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="yearsExperience">
                      Years Experience
                    </label>
                    <input
                      type="number"
                      id="yearsExperience"
                      className="form-input"
                      value={formData.yearsExperience}
                      onChange={e =>
                        handleInputChange('yearsExperience', e.target.value)
                      }
                      min="0"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label" htmlFor="graduationYear">
                      Graduation Year
                    </label>
                    <input
                      type="number"
                      id="graduationYear"
                      className="form-input"
                      placeholder="2020"
                      value={formData.graduationYear}
                      onChange={e =>
                        handleInputChange('graduationYear', e.target.value)
                      }
                      min="1950"
                      max="2030"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="impactScore">
                      Impact Score
                    </label>
                    <input
                      type="number"
                      id="impactScore"
                      className="form-input"
                      value={formData.impactScore}
                      onChange={e =>
                        handleInputChange('impactScore', e.target.value)
                      }
                      min="0"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label" htmlFor="degree">
                      Degree
                    </label>
                    <input
                      type="text"
                      id="degree"
                      className="form-input"
                      placeholder="e.g., BSc Computer Science"
                      value={formData.degree}
                      onChange={e =>
                        handleInputChange('degree', e.target.value)
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="university">
                      University
                    </label>
                    <input
                      type="text"
                      id="university"
                      className="form-input"
                      placeholder="e.g., University of Cape Town"
                      value={formData.university}
                      onChange={e =>
                        handleInputChange('university', e.target.value)
                      }
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Profile Status</label>
                  <div className="status-selector">
                    <div
                      className={`status-option ${formData.status === 'active' ? 'selected' : ''}`}
                      onClick={() => handleStatusSelect('active')}
                    >
                      <div className="status-option-title">Active</div>
                      <div className="status-option-desc">Profile is live</div>
                    </div>
                    <div
                      className={`status-option ${formData.status === 'pending' ? 'selected' : ''}`}
                      onClick={() => handleStatusSelect('pending')}
                    >
                      <div className="status-option-title">Pending</div>
                      <div className="status-option-desc">
                        Awaiting verification
                      </div>
                    </div>
                    <div
                      className={`status-option ${formData.status === 'inactive' ? 'selected' : ''}`}
                      onClick={() => handleStatusSelect('inactive')}
                    >
                      <div className="status-option-title">Inactive</div>
                      <div className="status-option-desc">
                        Not currently active
                      </div>
                    </div>
                    <div
                      className={`status-option ${formData.status === 'suspended' ? 'selected' : ''}`}
                      onClick={() => handleStatusSelect('suspended')}
                    >
                      <div className="status-option-title">Suspended</div>
                      <div className="status-option-desc">
                        Account suspended
                      </div>
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Employment Status</label>
                  <div className="status-selector">
                    <div
                      className={`status-option ${formData.employmentStatus === 'employed' ? 'selected' : ''}`}
                      onClick={() => handleEmploymentSelect('employed')}
                    >
                      <div className="status-option-title">Employed</div>
                      <div className="status-option-desc">
                        Currently working
                      </div>
                    </div>
                    <div
                      className={`status-option ${formData.employmentStatus === 'seeking' ? 'selected' : ''}`}
                      onClick={() => handleEmploymentSelect('seeking')}
                    >
                      <div className="status-option-title">Job Seeking</div>
                      <div className="status-option-desc">
                        Looking for opportunities
                      </div>
                    </div>
                    <div
                      className={`status-option ${formData.employmentStatus === 'entrepreneur' ? 'selected' : ''}`}
                      onClick={() => handleEmploymentSelect('entrepreneur')}
                    >
                      <div className="status-option-title">Entrepreneur</div>
                      <div className="status-option-desc">
                        Running own business
                      </div>
                    </div>
                    <div
                      className={`status-option ${formData.employmentStatus === 'student' ? 'selected' : ''}`}
                      onClick={() => handleEmploymentSelect('student')}
                    >
                      <div className="status-option-title">Student</div>
                      <div className="status-option-desc">
                        Currently studying
                      </div>
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Mentorship Role</label>
                  <div className="status-selector">
                    <div
                      className={`status-option ${formData.mentorshipRole === 'mentor' ? 'selected' : ''}`}
                      onClick={() => handleMentorshipRoleSelect('mentor')}
                    >
                      <div className="status-option-title">Mentor</div>
                      <div className="status-option-desc">
                        Provides mentorship
                      </div>
                    </div>
                    <div
                      className={`status-option ${formData.mentorshipRole === 'mentee' ? 'selected' : ''}`}
                      onClick={() => handleMentorshipRoleSelect('mentee')}
                    >
                      <div className="status-option-title">Mentee</div>
                      <div className="status-option-desc">Seeks mentorship</div>
                    </div>
                    <div
                      className={`status-option ${formData.mentorshipRole === 'both' ? 'selected' : ''}`}
                      onClick={() => handleMentorshipRoleSelect('both')}
                    >
                      <div className="status-option-title">Both</div>
                      <div className="status-option-desc">
                        Mentor and mentee
                      </div>
                    </div>
                    <div
                      className={`status-option ${formData.mentorshipRole === 'none' ? 'selected' : ''}`}
                      onClick={() => handleMentorshipRoleSelect('none')}
                    >
                      <div className="status-option-title">None</div>
                      <div className="status-option-desc">
                        No mentorship role
                      </div>
                    </div>
                  </div>
                </div>

                {(formData.mentorshipRole === 'mentor' ||
                  formData.mentorshipRole === 'both') && (
                  <div className="form-group">
                    <label className="form-label" htmlFor="maxMentees">
                      Max Mentees
                    </label>
                    <input
                      type="number"
                      id="maxMentees"
                      className="form-input"
                      value={formData.maxMentees}
                      onChange={e =>
                        handleInputChange('maxMentees', e.target.value)
                      }
                      min="0"
                      max="20"
                    />
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Skills</label>
                  <div className="tag-container">
                    {skills.map(skill => (
                      <span key={skill} className="tag">
                        {skill}
                        <button
                          type="button"
                          className="tag-remove"
                          onClick={() => removeSkill(skill)}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                    <input
                      type="text"
                      className="tag-input"
                      placeholder="Add skills..."
                      value={skillInput}
                      onChange={e => setSkillInput(e.target.value)}
                      onKeyDown={handleSkillInput}
                    />
                  </div>
                  <div className="form-help">Press Enter to add skills</div>
                </div>

                <div className="form-group">
                  <label className="form-label">Interests</label>
                  <div className="tag-container">
                    {interests.map(interest => (
                      <span key={interest} className="tag">
                        {interest}
                        <button
                          type="button"
                          className="tag-remove"
                          onClick={() => removeInterest(interest)}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                    <input
                      type="text"
                      className="tag-input"
                      placeholder="Add interests..."
                      value={interestInput}
                      onChange={e => setInterestInput(e.target.value)}
                      onKeyDown={handleInterestInput}
                    />
                  </div>
                  <div className="form-help">Press Enter to add interests</div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="profileNotes">
                    Internal Notes
                  </label>
                  <textarea
                    id="profileNotes"
                    className="form-input form-textarea"
                    placeholder="Internal notes about this profile..."
                    value={formData.notes}
                    onChange={e => handleInputChange('notes', e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleClose}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
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
                Save Profile
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
