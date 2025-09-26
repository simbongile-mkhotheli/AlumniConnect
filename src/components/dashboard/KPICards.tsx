import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { EventsService } from '../../services/eventsService';
import { SponsorsService } from '../../services/sponsorsService';
import ProfilesService from '../../services/profilesService';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ChaptersService } from '../../services/chaptersService';

interface KPIData {
  id: string;
  title: string;
  value: string;
  change: string;
  manageAction: string;
  loading?: boolean;
}

interface KPICardProps {
  data: KPIData;
}

function KPICard({ data }: KPICardProps) {
  const navigate = useNavigate();

  const handleManageClick = () => {
    navigate(data.manageAction);
  };

  return (
    <div className="kpi-card">
      <div className="kpi-header">
        <div className="kpi-title">{data.title}</div>
        <button className="kpi-manage-btn" onClick={handleManageClick}>
          Manage
        </button>
      </div>
      <div className="kpi-value">
        {data.loading ? <LoadingSpinner size="small" /> : data.value}
      </div>
      <div className="kpi-change">
        <span dangerouslySetInnerHTML={{ __html: data.change }} />
      </div>
    </div>
  );
}

export function KPICards() {
  const [kpiData, setKpiData] = useState<KPIData[]>([
    {
      id: 'active-alumni',
      title: 'Active Alumni',
      value: '0',
      change: 'Loading...',
      manageAction: '/admin/profiles',
      loading: true,
    },
    {
      id: 'upcoming-events',
      title: 'Upcoming Events',
      value: '0',
      change: 'Loading...',
      manageAction: '/admin/events',
      loading: true,
    },
    {
      id: 'active-sponsors',
      title: 'Active Sponsors',
      value: '0',
      change: 'Loading...',
      manageAction: '/admin/sponsors',
      loading: true,
    },
    {
      id: 'regional-chapters',
      title: 'Regional Chapters',
      value: '0',
      change: 'Loading...',
      manageAction: '/admin/chapters',
      loading: true,
    },
  ]);

  useEffect(() => {
    const fetchKPIData = async () => {
      console.log('🔄 Fetching KPI data...');

      try {
        // Fetch events data
        const eventsResponse = await EventsService.getEvents(1, 100);
        if (eventsResponse.success && eventsResponse.data) {
          const events = eventsResponse.data;
          const now = new Date();
          const upcomingEvents = events.filter(event => {
            const eventDate = new Date(event.startDate);
            return eventDate >= now;
          });

          setKpiData(prev =>
            prev.map(kpi =>
              kpi.id === 'upcoming-events'
                ? {
                    ...kpi,
                    value: upcomingEvents.length.toString(),
                    change: `📅 ${upcomingEvents.length} events scheduled`,
                    loading: false,
                  }
                : kpi
            )
          );
        }

        // Fetch sponsors data
        const sponsorsResponse = await SponsorsService.getSponsors(1, 100);
        if (sponsorsResponse.success && sponsorsResponse.data) {
          const sponsors = sponsorsResponse.data;
          const activeSponsors = sponsors.filter(
            sponsor => sponsor.status === 'active'
          );

          setKpiData(prev =>
            prev.map(kpi =>
              kpi.id === 'active-sponsors'
                ? {
                    ...kpi,
                    value: activeSponsors.length.toString(),
                    change: `🤝 ${activeSponsors.length} active partnerships`,
                    loading: false,
                  }
                : kpi
            )
          );
        }

        // Fetch chapters data via service (handles both mock and real API envelopes)
        try {
          const chaptersResp = await ChaptersService.getChapters(1, 200);
          const chapters = chaptersResp.data || [];
          const activeChapters = chapters.filter(chapter => chapter.status === 'active');

          setKpiData(prev =>
            prev.map(kpi =>
              kpi.id === 'regional-chapters'
                ? {
                    ...kpi,
                    value: activeChapters.length.toString(),
                    change: `🌍 ${activeChapters.length} active chapters`,
                    loading: false,
                  }
                : kpi
            )
          );
        } catch (error) {
          console.error('Error fetching chapters:', error);
          setKpiData(prev =>
            prev.map(kpi =>
              kpi.id === 'regional-chapters'
                ? {
                    ...kpi,
                    value: '—',
                    change: '🌍 Chapters unavailable',
                    loading: false,
                  }
                : kpi
            )
          );
        }

        // Fetch active alumni via unified ProfilesService
        try {
          const profiles = await ProfilesService.getAllProfiles();
          const activeAlumni = profiles.filter(p => p.status === 'active');
          setKpiData(prev => prev.map(kpi => kpi.id === 'active-alumni' ? {
            ...kpi,
            value: activeAlumni.length.toLocaleString(),
            change: `👥 ${activeAlumni.length} active alumni`,
            loading: false
          } : kpi));
        } catch (error) {
          console.error('Error loading profiles for KPI:', error);
          setKpiData(prev => prev.map(kpi => kpi.id === 'active-alumni' ? {
            ...kpi,
            value: '—',
            change: '👥 Active alumni unavailable',
            loading: false
          } : kpi));
        }

        console.log('✅ KPI data loaded successfully');
      } catch (error) {
        console.error('❌ Error fetching KPI data:', error);

        // Set fallback data
        setKpiData(prev =>
          prev.map(kpi => ({
            ...kpi,
            loading: false,
            change:
              kpi.id === 'active-alumni'
                ? '👥 Active community members'
                : kpi.id === 'upcoming-events'
                  ? '📅 Events scheduled'
                  : kpi.id === 'active-sponsors'
                    ? '🤝 Active partnerships'
                    : '🌍 Regional presence',
          }))
        );
      }
    };

    fetchKPIData();
  }, []);

  return (
    <div className="kpi-grid">
      {kpiData.map(kpi => (
        <KPICard key={kpi.id} data={kpi} />
      ))}
    </div>
  );
}
