import React from 'react';
import { Link } from 'react-router-dom';

interface ExpertiseItem {
  id: string;
  title: string;
  expert: string;
  experience: string;
  tags: string[];
}

export function AlumniExpertiseCard() {
  const expertiseItems: ExpertiseItem[] = [
    {
      id: '1',
      title: 'Pitching & Fundraising',
      expert: 'Sarah M.',
      experience: '3 years experience',
      tags: ['Pitch Decks', 'VC Relations'],
    },
    {
      id: '2',
      title: 'React & Frontend',
      expert: 'James K.',
      experience: '5 years experience',
      tags: ['React', 'TypeScript'],
    },
    {
      id: '3',
      title: 'Team Formation',
      expert: 'Aisha T.',
      experience: '4 years experience',
      tags: ['Leadership', 'Agile'],
    },
    {
      id: '4',
      title: 'Product Strategy',
      expert: 'David O.',
      experience: '6 years experience',
      tags: ['Product', 'Strategy'],
    },
  ];

  return (
    <div className="card feature-highlight">
      <div className="card-header">
        <div className="card-title">Available to Share</div>
        <div className="card-subtitle">
          Alumni offering expertise to newcomers
        </div>
        <div style={{ marginLeft: 'auto', fontSize: '12px', color: '#6c757d' }}>
          12 experts online
        </div>
      </div>
      <div className="card-body">
        <div className="expertise-grid">
          {expertiseItems.map(item => (
            <div key={item.id} className="expertise-item">
              <div className="expertise-title">{item.title}</div>
              <div className="expertise-expert">
                {item.expert} • {item.experience}
              </div>
              <div className="expertise-tags">
                {item.tags.map((tag, index) => (
                  <span key={index} className="skill-tag">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div style={{ padding: '16px 0', textAlign: 'center' }}>
          <Link to="/expertise" className="btn btn-outline">
            View all expertise →
          </Link>
        </div>
      </div>
    </div>
  );
}
