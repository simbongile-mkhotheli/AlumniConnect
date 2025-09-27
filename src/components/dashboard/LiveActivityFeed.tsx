import React, { useState, useEffect } from 'react';
import { Avatar } from '../common/Avatar';

interface ActivityItem {
  id: string;
  type: 'user-joined' | 'event-created' | 'mentorship' | 'achievement' | 'content' | 'system';
  user: {
    name: string;
    avatar: string;
    role?: string;
  };
  action: string;
  target?: string;
  timestamp: Date;
  metadata?: any;
}

interface ActivityItemComponentProps {
  activity: ActivityItem;
}

function ActivityItemComponent({ activity }: ActivityItemComponentProps) {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user-joined': return '👋';
      case 'event-created': return '📅';
      case 'mentorship': return '🤝';
      case 'achievement': return '🏆';
      case 'content': return '📝';
      case 'system': return '⚙️';
      default: return '📊';
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'user-joined': return 'activity-success';
      case 'event-created': return 'activity-primary';
      case 'mentorship': return 'activity-info';
      case 'achievement': return 'activity-warning';
      case 'content': return 'activity-secondary';
      case 'system': return 'activity-neutral';
      default: return 'activity-neutral';
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 60000);
    if (diff < 1) return 'Just now';
    if (diff < 60) return `${diff}m ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    return `${Math.floor(diff / 1440)}d ago`;
  };

  return (
    <div className={`activity-item ${getActivityColor(activity.type)}`}>
      <div className="activity-avatar">
        <Avatar 
          src={activity.user.avatar}
          alt={activity.user.name}
          size={40}
        />
        <div className="activity-type-icon">{getActivityIcon(activity.type)}</div>
      </div>
      
      <div className="activity-content">
        <div className="activity-text">
          <span className="user-name">{activity.user.name}</span>
          {activity.user.role && (
            <span className="user-role">({activity.user.role})</span>
          )}
          <span className="activity-action"> {activity.action}</span>
          {activity.target && (
            <span className="activity-target"> "{activity.target}"</span>
          )}
        </div>
        <div className="activity-timestamp">
          {formatTimeAgo(activity.timestamp)}
        </div>
      </div>

      <div className="activity-actions">
        <button className="activity-btn">View</button>
      </div>
    </div>
  );
}

export function LiveActivityFeed() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLive, setIsLive] = useState(true);

  // Mock real-time activity data
  useEffect(() => {
    const mockActivities: ActivityItem[] = [
      {
        id: '1',
        type: 'user-joined',
        user: { name: 'Sarah Mitchell', avatar: '/avatars/sarah.jpg', role: 'Alumni' },
        action: 'joined',
        target: 'Tech Professionals Chapter',
        timestamp: new Date(Date.now() - 2 * 60000)
      },
      {
        id: '2',
        type: 'event-created',
        user: { name: 'James Kumar', avatar: '/avatars/james.jpg', role: 'Chapter Lead' },
        action: 'created event',
        target: 'React Native Workshop',
        timestamp: new Date(Date.now() - 5 * 60000)
      },
      {
        id: '3',
        type: 'mentorship',
        user: { name: 'Aisha Tembani', avatar: '/avatars/aisha.jpg', role: 'Mentor' },
        action: 'completed mentorship session with',
        target: 'David Okoye',
        timestamp: new Date(Date.now() - 12 * 60000)
      },
      {
        id: '4',
        type: 'achievement',
        user: { name: 'Michael Zulu', avatar: '/avatars/michael.jpg', role: 'Alumni' },
        action: 'earned badge',
        target: 'Mentor Excellence',
        timestamp: new Date(Date.now() - 18 * 60000)
      },
      {
        id: '5',
        type: 'content',
        user: { name: 'Nomsa Khumalo', avatar: '/avatars/nomsa.jpg', role: 'Content Creator' },
        action: 'published spotlight',
        target: 'From Bootcamp to CTO',
        timestamp: new Date(Date.now() - 25 * 60000)
      },
      {
        id: '6',
        type: 'system',
        user: { name: 'System', avatar: '/vite.svg' },
        action: 'processed',
        target: '47 new RSVP confirmations',
        timestamp: new Date(Date.now() - 35 * 60000)
      }
    ];

    setActivities(mockActivities);

    // Simulate real-time updates
    const interval = setInterval(() => {
      if (Math.random() > 0.7) { // 30% chance of new activity
        const newActivity: ActivityItem = {
          id: Date.now().toString(),
          type: ['user-joined', 'event-created', 'mentorship', 'achievement'][Math.floor(Math.random() * 4)] as any,
          user: { 
            name: ['Alex Chen', 'Priya Patel', 'John Smith', 'Lisa Wong'][Math.floor(Math.random() * 4)],
            avatar: '/vite.svg',
            role: 'Alumni'
          },
          action: 'joined platform',
          timestamp: new Date()
        };
        
        setActivities(prev => [newActivity, ...prev.slice(0, 9)]); // Keep latest 10
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getActivityStats = () => {
    const last24h = activities.filter(a => 
      Date.now() - a.timestamp.getTime() < 24 * 60 * 60 * 1000
    ).length;
    
    const onlineUsers = 247; // Mock data
    
    return { last24h, onlineUsers };
  };

  const stats = getActivityStats();

  return (
    <div className="live-activity-feed">
      <div className="feed-header">
        <div className="header-content">
          <h3 className="feed-title">
            <span className="title-icon">📊</span>
            Live Platform Activity
          </h3>
          <div className="activity-controls">
            <button 
              className={`live-toggle ${isLive ? 'active' : ''}`}
              onClick={() => setIsLive(!isLive)}
            >
              <span className="live-dot"></span>
              {isLive ? 'Live' : 'Paused'}
            </button>
          </div>
        </div>
        
        <div className="activity-stats">
          <div className="stat-item">
            <span className="stat-value">{stats.onlineUsers}</span>
            <span className="stat-label">online now</span>
          </div>
          <div className="stat-divider">•</div>
          <div className="stat-item">
            <span className="stat-value">{stats.last24h}</span>
            <span className="stat-label">activities today</span>
          </div>
        </div>
      </div>

      <div className="activity-stream">
        {activities.length > 0 ? (
          activities.map(activity => (
            <ActivityItemComponent key={activity.id} activity={activity} />
          ))
        ) : (
          <div className="empty-activity">
            <div className="empty-icon">📭</div>
            <p>No recent activity</p>
          </div>
        )}
      </div>

      <div className="feed-footer">
        <button className="view-all-btn">
          View All Activity
          <span className="btn-arrow">→</span>
        </button>
      </div>
    </div>
  );
}