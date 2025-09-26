import React from 'react';
import { AlumniExpertiseCard } from './AlumniExpertiseCard';
import { AlumniSpotlightCard } from './AlumniSpotlightCard';
import { CommunityQACard } from './CommunityQACard';
import { EventsCard } from './EventsCard';
import { OpportunityBoardCard } from './OpportunityBoardCard';
import { ImpactScoreCard } from './ImpactScoreCard';
import { StandardQuickActionsCard } from './StandardQuickActionsCard';
import { StandardRegionalChaptersCard } from './StandardRegionalChaptersCard';

export function StandardDashboard() {
  return (
    <div className="standard-dashboard">
      {/* Presentation Note */}
      <div className="presentation-note">
        <strong>AlumniConnect Vision:</strong> This platform embodies Mixo
        Ngoveni's vision of preventing graduates from "scattering"
        post-bootcamp. We're building a sustainable ecosystem that keeps alumni
        connected, engaged, and growing together through structured profiles,
        mentorship, and community-driven learning.
      </div>

      {/* Main Content Grid */}
      <div className="dashboard-grid">
        {/* Left Column */}
        <div className="left-column">
          <ImpactScoreCard />
          <AlumniExpertiseCard />
          <EventsCard />
          <CommunityQACard hideCreate />
        </div>

        {/* Right Column */}
        <div className="right-column">
          <StandardRegionalChaptersCard />
          <OpportunityBoardCard />
          <AlumniSpotlightCard />
          <StandardQuickActionsCard />
        </div>
      </div>

      {/* Key Features Summary */}
      <div className="presentation-note" style={{ marginTop: '32px' }}>
        <strong>Key AlumniConnect Platform Features:</strong>
        <ul style={{ margin: '8px 0 0 20px' }}>
          <li>
            <strong>Impact Score & Gamification:</strong> Earn badges for RSVPs,
            mentoring, Q&A contributions, and career milestones
          </li>
          <li>
            <strong>Available to Share:</strong> Alumni flag expertise topics
            for newcomers (pitching, tech stack, team formation)
          </li>
          <li>
            <strong>RSVP Online with Offline Sync:</strong> Tap to join
            sessions; RSVPs queue and sync when reconnected
          </li>
          <li>
            <strong>Regional Chapters & Forums:</strong> Local sub-communities
            with sponsor support for ongoing networking and collaboration
          </li>
          <li>
            <strong>Spotlight Stories:</strong> On-demand videos of alumni
            interviews, talk highlights, and tutorials
          </li>
          <li>
            <strong>Opportunity Board:</strong> Post and discover gigs,
            collaborations, and job leads from the community
          </li>
          <li>
            <strong>Community Q&A:</strong> Peer expertise sharing through
            structured question-answer format
          </li>
          <li>
            <strong>Structured Profiles:</strong> Showcase bootcamp role, key
            skills, project links, and career milestones
          </li>
          <li>
            <strong>Sponsor Integration:</strong> Events and chapters supported
            by industry partners like Telkom, CompTIA, iWeb, and GitHub
          </li>
        </ul>
      </div>
    </div>
  );
}
