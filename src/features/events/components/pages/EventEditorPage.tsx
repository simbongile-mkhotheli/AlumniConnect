// CLEAN REBUILD IMPLEMENTATION
import React, { useState, useEffect, useCallback } from 'react';
import { useToast } from '../../../../contexts/ToastContext';
import { useParams, useNavigate } from 'react-router-dom';
import { EventsService } from '@features/events/services';
import { SponsorsService } from '@features/sponsors/services';
import { useMutationWithRefresh } from '../../../../hooks/useMutationWithRefresh';
import { LoadingSpinner } from '../../../../components/common/LoadingSpinner';
import { ErrorMessage } from '../../../../components/common/ErrorMessage';
import type { Event } from '@features/events/types';
import type { Sponsor } from '@features/sponsors/types';

type EventStatus = 'draft' | 'scheduled' | 'published' | 'cancelled';

export const EventEditorPage: React.FC = () => {
  const { addToast } = useToast();
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [sponsorsLoading, setSponsorsLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: '', slug: '', excerpt: '', description: '', coverUrl: '',
    organizer: '', location: '', venue: '', address: '',
    startDate: '', endDate: '', sponsor: '', status: 'draft' as EventStatus,
    isFeatured: false, rsvpUrl: '', sponsorLogo: '', hashtag: '', signupUrl: '',
    rsvpCount: '0', attendanceCount: '0'
  });
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    if (!isEditMode && formData.title) {
      const slug = formData.title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');
      setFormData(p => ({ ...p, slug }));
    }
  }, [formData.title, isEditMode]);

  useEffect(() => {
    const loadSponsors = async () => {
      try { setSponsorsLoading(true); const res = await SponsorsService.getSponsors(1,100); if(res.success) setSponsors(res.data||[]);} catch(e){console.warn('Failed load sponsors', e);} finally { setSponsorsLoading(false);} };
    loadSponsors();
  }, []);

  const loadEvent = useCallback(async (eventId: string) => {
    try { setIsLoading(true); setError(null); const res = await EventsService.getEvent(eventId); if(res.success && res.data){ const ev = res.data; setFormData(p=>({ ...p, title: ev.title||'', slug: ev.slug||'', excerpt: ev.excerpt||'', description: ev.description||'', coverUrl: ev.coverUrl||'', organizer: ev.organizer||'', location: ev.location||'', venue: ev.venue||'', address: ev.address||'', startDate: ev.startDate? new Date(ev.startDate).toISOString().slice(0,16):'', endDate: ev.endDate? new Date(ev.endDate).toISOString().slice(0,16):'', sponsor: ev.sponsor||'', status: (ev.status as EventStatus)||'draft', isFeatured: ev.isFeatured||false, rsvpUrl: ev.rsvpUrl||'', sponsorLogo: ev.sponsorLogo||'', hashtag: ev.hashtag||'', signupUrl: ev.signupUrl||'', rsvpCount: (ev.rsvpCount??0).toString(), attendanceCount: (ev.attendanceCount??0).toString() })); setTags(ev.tags||[]);} else { setError(res.error?.message||'Failed to load event'); } } catch(e){ console.error('Load event failed', e); setError('Failed to load event'); } finally { setIsLoading(false);} }, []);
  useEffect(()=>{ if(isEditMode && id) loadEvent(id); }, [isEditMode, id, loadEvent]);

  const handleInputChange = (field: string, value: string | boolean) => setFormData(p=>({...p,[field]:value}));
  const handleStatusSelect = (status: EventStatus) => setFormData(p=>({...p,status}));
  const handleTagKey = (e: React.KeyboardEvent<HTMLInputElement>) => { if(e.key==='Enter' && tagInput.trim()){ e.preventDefault(); if(!tags.includes(tagInput.trim())) setTags([...tags, tagInput.trim()]); setTagInput(''); } };
  const removeTag = (t:string)=> setTags(tags.filter(tag=>tag!==t));

  const validateForm = () => {
    if(!formData.title.trim()) return 'Event title is required';
    if(!formData.description.trim()) return 'Event description is required';
    if(!formData.startDate) return 'Start date is required';
    if(!formData.organizer.trim()) return 'Organizer is required';
    if(!formData.location.trim()) return 'Location is required';
    if(!formData.venue.trim()) return 'Venue is required';
    if(formData.endDate && new Date(formData.endDate) <= new Date(formData.startDate)) return 'End date must be after start date';
    return null;
  };

  const buildPayload = (): Omit<Event,'id'|'createdAt'|'updatedAt'> => ({
    title: formData.title.trim(),
    slug: (formData.slug.trim() || formData.title.trim().toLowerCase().replace(/[^a-z0-9\s-]/g,'').replace(/\s+/g,'-')),
    excerpt: formData.excerpt.trim(), description: formData.description.trim(), coverUrl: formData.coverUrl || undefined,
    organizer: formData.organizer.trim(), location: formData.location.trim(), venue: formData.venue.trim(), address: formData.address.trim(),
    startDate: new Date(formData.startDate).toISOString(), endDate: formData.endDate ? new Date(formData.endDate).toISOString(): undefined,
    sponsor: formData.sponsor || undefined, sponsorLogo: formData.sponsorLogo || undefined, status: formData.status,
    isFeatured: formData.isFeatured, tags, hashtag: formData.hashtag || undefined, rsvpUrl: formData.rsvpUrl || undefined,
    signupUrl: formData.signupUrl || undefined, rsvpCount: parseInt(formData.rsvpCount)||0, attendanceCount: parseInt(formData.attendanceCount)||0
  });

  const mutationFn = useCallback(async()=>{ const payload = buildPayload(); return isEditMode && id ? EventsService.updateEvent(id, payload) : EventsService.createEvent(payload); }, [formData, tags, isEditMode, id]);
  const refreshFn = useCallback(async()=> EventsService.getEvents(1,50), []);
  const { run: runMutation } = useMutationWithRefresh<any, any>(mutationFn, refreshFn, {
    onSuccess: ({ mutation }) => {
      if (mutation?.success) {
        setSaveSuccess(true);
        addToast({
          type: 'success',
            message: `Event ${isEditMode ? 'updated' : 'created'} successfully!`,
            description: isEditMode ? 'Your changes have been saved.' : 'The event is now created.',
        });
        navigate('/admin/upcoming-events');
      } else if (mutation) {
        const msg = mutation.error?.message || 'Failed to save event';
        setError(msg);
        addToast({ type: 'error', message: 'Save failed', description: msg });
      }
      setIsSaving(false);
    },
    onError: e => {
      const msg = e?.message || 'Failed to save event';
      setError(msg);
      addToast({ type: 'error', message: 'Save failed', description: msg });
      setIsSaving(false);
    }
  });

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); const v = validateForm(); if(v){ setError(v); return; } setIsSaving(true); runMutation(); };
  const handleClose = () => { if(isSaving && !confirm('Save in progress. Close anyway?')) return; navigate('/admin/upcoming-events'); };

  if(isLoading) return (<div className="overlay active"><div className="upcoming-events-manager"><div className="upcoming-events-header"><h2 className="upcoming-events-title">Loading Event...</h2><button className="close-btn" onClick={handleClose}>&times;</button></div><div className="upcoming-events-body"><LoadingSpinner /></div></div></div>);

  return (<div className="overlay active"><div className="upcoming-events-manager"><div className="upcoming-events-header"><h2 className="upcoming-events-title">{isEditMode? 'Edit Event':'Create New Event'}</h2><button className="close-btn" onClick={handleClose}>&times;</button></div><div className="upcoming-events-body">{error && <ErrorMessage error={error} onRetry={()=>setError(null)} />}{saveSuccess && (<div className="success-message"><div className="success-content"><span className="success-icon">✅</span>Event {isEditMode ? 'updated':'created'} successfully!</div></div>)}<form onSubmit={handleSubmit}><div className="form-grid"><div className="form-section"><div className="form-section-title"><div className="form-section-icon"></div>Event Details</div><div className="form-group"><label className="form-label" htmlFor="eventTitle">Event Title *</label><input id="eventTitle" type="text" className="form-input" value={formData.title} onChange={e=>handleInputChange('title', e.target.value)} disabled={isSaving} required /></div><div className="form-group"><label className="form-label" htmlFor="eventSlug">URL Slug</label><input id="eventSlug" type="text" className="form-input" value={formData.slug} onChange={e=>handleInputChange('slug', e.target.value)} disabled={isSaving} /><div className="form-help">Auto-generated from title unless set manually</div></div><div className="form-group"><label className="form-label" htmlFor="eventExcerpt">Event Excerpt</label><textarea id="eventExcerpt" className="form-input form-textarea" value={formData.excerpt} onChange={e=>handleInputChange('excerpt', e.target.value)} disabled={isSaving} /></div><div className="form-group"><label className="form-label" htmlFor="eventDescription">Full Description *</label><textarea id="eventDescription" className="form-input form-textarea large" value={formData.description} onChange={e=>handleInputChange('description', e.target.value)} disabled={isSaving} required /></div><div className="form-group"><label className="form-label" htmlFor="eventCover">Cover Image URL</label><input id="eventCover" type="url" className="form-input" value={formData.coverUrl} onChange={e=>handleInputChange('coverUrl', e.target.value)} disabled={isSaving} /></div><div className="form-group"><label className="form-label" htmlFor="eventRsvp">External RSVP URL</label><input id="eventRsvp" type="url" className="form-input" value={formData.rsvpUrl} onChange={e=>handleInputChange('rsvpUrl', e.target.value)} disabled={isSaving} /><div className="form-help">Leave empty to use built-in RSVP system</div></div></div><div className="form-section"><div className="form-section-title"><div className="form-section-icon"></div>Event Settings</div><div className="form-group"><label className="form-label" htmlFor="eventOrganizer">Organizer *</label><input id="eventOrganizer" type="text" className="form-input" value={formData.organizer} onChange={e=>handleInputChange('organizer', e.target.value)} disabled={isSaving} required /></div><div className="form-group"><label className="form-label" htmlFor="eventLocation">General Location *</label><input id="eventLocation" type="text" className="form-input" value={formData.location} onChange={e=>handleInputChange('location', e.target.value)} disabled={isSaving} required /></div><div className="form-group"><label className="form-label" htmlFor="eventVenue">Venue Name *</label><input id="eventVenue" type="text" className="form-input" value={formData.venue} onChange={e=>handleInputChange('venue', e.target.value)} disabled={isSaving} required /></div><div className="form-group"><label className="form-label" htmlFor="eventAddress">Full Address</label><textarea id="eventAddress" className="form-input form-textarea" value={formData.address} onChange={e=>handleInputChange('address', e.target.value)} disabled={isSaving} /></div><div className="form-row"><div className="form-group"><label className="form-label" htmlFor="eventStart">Start Date & Time *</label><input id="eventStart" type="datetime-local" className="form-input" value={formData.startDate} onChange={e=>handleInputChange('startDate', e.target.value)} disabled={isSaving} required /></div><div className="form-group"><label className="form-label" htmlFor="eventEnd">End Date & Time</label><input id="eventEnd" type="datetime-local" className="form-input" value={formData.endDate} onChange={e=>handleInputChange('endDate', e.target.value)} disabled={isSaving} /></div></div><div className="form-group"><label className="form-label" htmlFor="eventSponsor">Sponsor</label><select id="eventSponsor" className="form-input" value={formData.sponsor} onChange={e=>handleInputChange('sponsor', e.target.value)} disabled={isSaving||sponsorsLoading}><option value="">{sponsorsLoading?'Loading sponsors...':'— No Sponsor —'}</option>{sponsors.filter(s=>s.status==='active').map(s=> <option key={s.id} value={s.id}>{s.name} ({s.tier})</option>)}</select></div><div className="form-group"><label className="form-label">Event Status</label><div className="status-selector">{(['draft','scheduled','published','cancelled'] as EventStatus[]).map(st => (<div key={st} className={`status-option ${formData.status===st?'selected':''} ${isSaving?'disabled':''}`} onClick={()=>!isSaving && handleStatusSelect(st)}><div className="status-option-title">{st.charAt(0).toUpperCase()+st.slice(1)}</div><div className="status-option-desc">{st==='draft'?'Not visible to public': st==='scheduled'?'Scheduled for future': st==='published'?'Live and accepting RSVPs':'Event cancelled'}</div></div>))}</div></div><div className="form-group"><label className="form-label">Tags</label><div className="tag-container">{tags.map(tag => (<span key={tag} className="tag">{tag}<button type="button" className="tag-remove" onClick={()=>removeTag(tag)} disabled={isSaving}>×</button></span>))}<input type="text" className="tag-input" placeholder="Add tags..." value={tagInput} onChange={e=>setTagInput(e.target.value)} onKeyDown={handleTagKey} disabled={isSaving} /></div><div className="form-help">Press Enter to add tags</div></div><div className="form-group"><label className="form-checkbox"><input type="checkbox" checked={formData.isFeatured} onChange={e=>handleInputChange('isFeatured', e.target.checked)} disabled={isSaving} /><span className="form-checkbox-label">Featured Event</span></label><div className="form-help">Featured events appear prominently on the homepage</div></div></div></div><div className="form-actions"><button type="button" className="btn btn-secondary" onClick={handleClose} disabled={isSaving}>Cancel</button><button type="submit" className="btn btn-primary" disabled={isSaving}>{isSaving ? (<><LoadingSpinner size="small" />{isEditMode?'Updating...':'Creating...'}</>) : (<>Save Event</>)}</button></div></form></div></div></div>);
};

export default EventEditorPage;
