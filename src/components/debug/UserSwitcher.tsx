import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/UserContext';
import { MockDataLoader } from '../../utils/mockDataLoader';
import { resolveMockEnabled } from '../../services/useMockApi';
import { ApiService } from '@shared/services/apiService';
import { API_ENDPOINTS } from '../../services/endpoints';
import type { DbUser } from '../../types';

interface UserSwitcherProps {
  compact?: boolean;
  devOnly?: boolean; // if true, hides unless local dev
}

export const UserSwitcher: React.FC<UserSwitcherProps> = ({ compact = false, devOnly = true }) => {
  const { user, switchUser } = useAuth();
  const [users, setUsers] = useState<DbUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  if (devOnly && !isDev) return null;

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        
        let allUsers: DbUser[] = [];
        
        if (resolveMockEnabled()) {
          // Use mock data
          allUsers = await MockDataLoader.getUsers();
        } else {
          // Use real API
          const res = await ApiService.getPaginated<DbUser>(API_ENDPOINTS.USERS.BASE, 1, 1000);
          if (res.success && Array.isArray(res.data)) {
            allUsers = res.data as DbUser[];
          }
        }
        
        setUsers(allUsers);
      } catch (e) {
        setError('Failed to load users');
        console.error('UserSwitcher load error:', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSwitch = async (id: string) => {
    await switchUser(id);
  };

  return (
    <div className={`user-switcher ${compact ? 'compact' : ''}`} style={{border:'1px solid #ddd', padding:'8px', borderRadius:4, background:'#fafafa', fontSize:12, margin:'8px 0'}}>
      <div style={{fontWeight:600, marginBottom:4}}>User Switcher {loading && '…'}</div>
      {error && <div style={{color:'red'}}>{error}</div>}
      <div style={{display:'flex', gap:6, flexWrap:'wrap'}}>
        {users.map(u => (
          <button
            key={u.id}
            onClick={() => handleSwitch(u.id)}
            disabled={user?.id === u.id}
            style={{
              padding:'4px 8px',
              border:'1px solid #ccc',
              background: user?.id === u.id ? '#4a7cff' : '#fff',
              color: user?.id === u.id ? '#fff' : '#333',
              cursor: user?.id === u.id ? 'default' : 'pointer',
              borderRadius:4
            }}
            title={`${u.fullName} (${u.email})`}
          >
            {u.fullName.split(' ')[0]}
          </button>
        ))}
      </div>
      {user && (
        <div style={{marginTop:6, opacity:0.8}}>Active: <strong>{user.name}</strong></div>
      )}
    </div>
  );
};
