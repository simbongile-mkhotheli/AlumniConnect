import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { AppProvider } from './contexts/AppContext';
import { UserProvider } from './contexts/UserContext';

// Admin Components
import { AdminLayout } from './components/layout/AdminLayout';
import { AdminDashboard } from './components/dashboard/AdminDashboard';
import { EventsManagementPage } from './components/pages/EventsManagementPage';
import { EventEditorPage } from './components/pages/EventEditorPage';
import { EventDetailsPage } from './components/pages/EventDetailsPage';
import { SponsorsManagementPage } from './components/pages/SponsorsManagementPage';
import { SponsorEditorPage } from './components/pages/SponsorEditorPage';
import { SponsorDetailsPage } from './components/pages/SponsorDetailsPage';
import PartnersManagementPage from './components/pages/PartnersManagementPage';
import { PartnerEditorPage } from './components/pages/PartnerEditorPage';
import { PartnerDetailsPage } from './components/pages/PartnerDetailsPage';
import { ChaptersManagementPage } from './components/pages/ChaptersManagementPage';
import { ChapterEditorPage } from './components/pages/ChapterEditorPage';
import { ChapterDetailsPage } from './components/pages/ChapterDetailsPage';
import { ProfilesManagementPage } from './components/pages/ProfilesManagementPage';
import { ProfileEditorPage } from './components/pages/ProfileEditorPage';
import { OpportunitiesManagementPage } from './components/pages/OpportunitiesManagementPage';
import { OpportunityEditorPage } from './components/pages/OpportunityEditorPage';
import { OpportunityDetailsPage } from './components/pages/OpportunityDetailsPage';
import { MentorshipProgramsPage } from './components/pages/MentorshipProgramsPage';
import { MentorshipManagementPage } from './components/pages/MentorshipManagementPage';
import { MentorshipEditorPage } from './components/pages/MentorshipEditorPage';
import { MentorshipDetailsPage } from './components/pages/MentorshipDetailsPage';
import { QAManagementPage } from './components/pages/QAManagementPage';
import { QAEditorPage } from './components/pages/QAEditorPage';
import { QADetailsPage } from './components/pages/QADetailsPage';
import { SpotlightsManagementPage } from './components/pages/SpotlightsManagementPage';
import { SpotlightEditorPage } from './components/pages/SpotlightEditorPage';
import { SpotlightDetailsPage } from './components/pages/SpotlightDetailsPage';

// Standard Dashboard Components
import { StandardLayout } from './components/layout/StandardLayout';
import { StandardDashboard } from './components/dashboard/StandardDashboard';
import { UpcomingEventsPage } from './components/pages/UpcomingEventsPage';
import { AlumniSpotlightsPage } from './components/pages/AlumniSpotlightsPage';
import { RegionalChaptersPage } from './components/pages/RegionalChaptersPage';
import { OpportunityBoardPage } from './components/pages/OpportunityBoardPage';
import { MyProfilePage } from './components/pages/MyProfilePage';
import { CSSModulesDemo } from './components/common/CSSModulesDemo';

// Import CSS files
import './styles/admin-dashboard.css';
import './styles/profile-details.css';
import './styles/chapter-details.css';
import './styles/sponsor-details.css';
import './styles/event-details.css';
import './styles/spotlight-details.css';
import './styles/partner-details.css';
import './styles/opportunity-details.css';
import './styles/mentorship-details.css';
import './styles/qa-details.css';
import './styles/qa-editor.css';
import './styles/profile-avatar.css';
import './styles/upcoming-events-page.css';
import './styles/my-profile.css';
import './css/main.css';
import './css/components.css';
import ProfileDetailsPage from './components/pages/ProfileDetailsPage';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { ToastProvider } from './contexts/ToastContext';
import { ToastContainer } from './components/common/ToastContainer';

function App() {
  return (
    <UserProvider>
      <AppProvider>
        <ToastProvider>
          <Router>
            <div className="App">
            <Routes>
              {/* Redirect root to standard dashboard */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />

              {/* Standard Dashboard Routes */}
              <Route path="/dashboard" element={<StandardLayout />}>
                <Route index element={<StandardDashboard />} />
                <Route
                  path="upcoming-events"
                  element={<UpcomingEventsPage />}
                />
                <Route
                  path="mentorship"
                  element={<MentorshipProgramsPage />}
                />
                <Route
                  path="opportunities"
                  element={<OpportunityBoardPage />}
                />
                <Route
                  path="qa"
                  element={<div>Community Q&A (Coming Soon)</div>}
                />
                <Route
                  path="expertise"
                  element={<div>Alumni Expertise (Coming Soon)</div>}
                />
                <Route
                  path="spotlights"
                  element={<AlumniSpotlightsPage />}
                />
                <Route
                  path="chapters"
                  element={<RegionalChaptersPage />}
                />
                <Route
                  path="profile"
                  element={<MyProfilePage />}
                />
                <Route
                  path="css-demo"
                  element={<CSSModulesDemo />}
                />
                <Route
                  path="help"
                  element={<div>Help & Support (Coming Soon)</div>}
                />
              </Route>

              {/* Admin Routes wrapped with ErrorBoundary for resilience */}
              <Route
                path="/admin"
                element={
                  <ErrorBoundary showDetails={import.meta.env.DEV}>
                    <AdminLayout />
                  </ErrorBoundary>
                }
              >
                <Route index element={<AdminDashboard />} />

                {/* Events Management - Supporting both /events and /upcoming-events paths */}
                <Route path="events" element={<EventsManagementPage />} />
                <Route path="events/create" element={<EventEditorPage />} />
                <Route path="events/edit/:id" element={<EventEditorPage />} />
                <Route path="events/view/:id" element={<EventDetailsPage />} />

                {/* Upcoming Events Management - Alias for events */}
                <Route
                  path="upcoming-events"
                  element={<EventsManagementPage />}
                />
                <Route
                  path="upcoming-events/create"
                  element={<EventEditorPage />}
                />
                <Route
                  path="upcoming-events/edit/:id"
                  element={<EventEditorPage />}
                />
                <Route
                  path="upcoming-events/view/:id"
                  element={<EventDetailsPage />}
                />

                {/* Sponsors Management */}
                <Route path="sponsors" element={<SponsorsManagementPage />} />
                <Route path="sponsors/create" element={<SponsorEditorPage />} />
                <Route
                  path="sponsors/edit/:id"
                  element={<SponsorEditorPage />}
                />
                <Route
                  path="sponsors/view/:id"
                  element={<SponsorDetailsPage />}
                />

                {/* Partners Management */}
                <Route path="partners" element={<PartnersManagementPage />} />
                <Route path="partners/create" element={<PartnerEditorPage />} />
                <Route
                  path="partners/edit/:id"
                  element={<PartnerEditorPage />}
                />
                <Route
                  path="partners/view/:id"
                  element={<PartnerDetailsPage />}
                />

                {/* Chapters Management */}
                <Route path="chapters" element={<ChaptersManagementPage />} />
                <Route path="chapters/create" element={<ChapterEditorPage />} />
                <Route
                  path="chapters/edit/:id"
                  element={<ChapterEditorPage />}
                />
                <Route
                  path="chapters/view/:id"
                  element={<ChapterDetailsPage />}
                />

                {/* Profiles Management */}
                <Route path="profiles" element={<ProfilesManagementPage />} />
                <Route path="profiles/create" element={<ProfileEditorPage />} />
                <Route
                  path="profiles/edit/:id"
                  element={<ProfileEditorPage />}
                />
                <Route
                  path="profiles/view/:id"
                  element={<ProfileDetailsPage />}
                />

                {/* Opportunities Management */}
                <Route
                  path="opportunities"
                  element={<OpportunitiesManagementPage />}
                />
                <Route
                  path="opportunities/create"
                  element={<OpportunityEditorPage />}
                />
                <Route
                  path="opportunities/edit/:id"
                  element={<OpportunityEditorPage />}
                />
                <Route
                  path="opportunities/view/:id"
                  element={<OpportunityDetailsPage />}
                />

                {/* Mentorship Management */}
                <Route
                  path="mentorship"
                  element={<MentorshipManagementPage />}
                />
                <Route
                  path="mentorship/create"
                  element={<MentorshipEditorPage />}
                />
                <Route
                  path="mentorship/edit/:id"
                  element={<MentorshipEditorPage />}
                />
                <Route
                  path="mentorship/view/:id"
                  element={<MentorshipDetailsPage />}
                />

                {/* Q&A Management */}
                <Route path="qa" element={<QAManagementPage />} />
                <Route path="qa/create" element={<QAEditorPage />} />
                <Route path="qa/edit/:id" element={<QAEditorPage />} />
                <Route path="qa/view/:id" element={<QADetailsPage />} />

                {/* Spotlights Management */}
                <Route
                  path="spotlights"
                  element={<SpotlightsManagementPage />}
                />
                <Route
                  path="spotlights/create"
                  element={<SpotlightEditorPage />}
                />
                <Route
                  path="spotlights/edit/:id"
                  element={<SpotlightEditorPage />}
                />
                <Route
                  path="spotlights/view/:id"
                  element={<SpotlightDetailsPage />}
                />

                {/* Analytics Routes */}
                <Route
                  path="analytics"
                  element={<div>Analytics Dashboard (Coming Soon)</div>}
                />
              </Route>

              {/* Catch all route - redirect to standard dashboard */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
            <ToastContainer />
          </div>
          </Router>
        </ToastProvider>
      </AppProvider>
    </UserProvider>
  );
}

export default App;
