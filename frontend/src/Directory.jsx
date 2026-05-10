import { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, MapPin, Briefcase } from 'lucide-react';

const Directory = () => {
  const [alumni, setAlumni] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [filters, setFilters] = useState({
    name: '',
    department: '',
    batchYear: '',
    location: ''
  });

  useEffect(() => {
    fetchDirectory();
  }, [filters]); // Refetch on filter change

  const fetchDirectory = async () => {
    try {
      const token = localStorage.getItem('token');
      // Build query string
      let query = '?';
      if (filters.name) query += `name=${filters.name}&`;
      if (filters.department) query += `department=${filters.department}&`;
      if (filters.batchYear) query += `batchYear=${filters.batchYear}&`;
      if (filters.location) query += `location=${filters.location}&`;

      const res = await axios.get(`http://localhost:5000/api/users${query}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAlumni(res.data);
    } catch (error) {
      console.error('Failed to fetch directory', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  return (
    <div className="container mt-4">
      <div className="flex justify-between items-center mb-4">
        <h2>Alumni Directory</h2>
      </div>

      {/* Filters Bar */}
      <div className="card mb-4" style={{ padding: '1rem' }}>
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div>
            <input 
              type="text" name="name" 
              placeholder="Search by name..." 
              className="form-control" 
              value={filters.name} onChange={handleFilterChange} 
            />
          </div>
          <div>
            <input 
              type="text" name="department" 
              placeholder="Department (e.g. CS, Mechanical)" 
              className="form-control" 
              value={filters.department} onChange={handleFilterChange} 
            />
          </div>
          <div>
            <input 
              type="number" name="batchYear" 
              placeholder="Batch Year" 
              className="form-control" 
              value={filters.batchYear} onChange={handleFilterChange} 
            />
          </div>
          <div>
            <input 
              type="text" name="location" 
              placeholder="Location" 
              className="form-control" 
              value={filters.location} onChange={handleFilterChange} 
            />
          </div>
        </div>
      </div>

      {/* Directory Grid */}
      {loading ? (
        <p className="text-center">Loading Directory...</p>
      ) : alumni.length === 0 ? (
        <p className="text-center text-muted card">No alumni match your search.</p>
      ) : (
        <div className="grid grid-cols-3">
          {alumni.map(person => (
            <div className="card text-center" key={person._id}>
              <div style={{
                width: '60px', height: '60px', borderRadius: '50%', 
                backgroundColor: 'var(--primary-light)', margin: '0 auto 1rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.5rem', color: 'var(--primary)', fontWeight: 'bold'
              }}>
                {person.name?.charAt(0)}
              </div>
              <h4>{person.name}</h4>
              <p className="mb-1 text-muted" style={{ fontSize: '0.9rem' }}>Batch of {person.batchYear || 'N/A'} • {person.department || 'General'}</p>
              
              <div className="flex flex-col gap-2 mt-3 text-left">
                {person.currentRole && (
                  <div className="flex items-center gap-2" style={{ fontSize: '0.85rem' }}>
                    <Briefcase size={14} className="text-muted" /> 
                    <span>{person.currentRole} {person.currentCompany && `at ${person.currentCompany}`}</span>
                  </div>
                )}
                {person.location && (
                  <div className="flex items-center gap-2" style={{ fontSize: '0.85rem' }}>
                    <MapPin size={14} className="text-muted" /> 
                    <span>{person.location}</span>
                  </div>
                )}
              </div>
              <button className="btn btn-outline btn-block mt-3" onClick={() => setSelectedUser(person)}>View Profile</button>
            </div>
          ))}
        </div>
      )}

      {/* Profile Modal Overlay */}
      {selectedUser && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div className="card" style={{ width: '90%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>
            <button 
              onClick={() => setSelectedUser(null)}
              style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-muted)' }}
            >
              &times;
            </button>
            <div className="text-center mb-4 mt-2">
              <div style={{
                width: '80px', height: '80px', borderRadius: '50%', 
                backgroundColor: 'var(--primary-light)', margin: '0 auto 1rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '2rem', color: 'var(--primary)', fontWeight: 'bold'
              }}>
                {selectedUser.name?.charAt(0)}
              </div>
              <h3 style={{ margin: '0 0 0.5rem 0' }}>{selectedUser.name}</h3>
              <p className="text-muted mb-0">{selectedUser.email}</p>
              <p className="text-muted mt-1"><MapPin size={14} style={{ display: 'inline', marginRight: '4px', position: 'relative', top: '-1px' }}/> {selectedUser.location || 'Location Not Specified'}</p>
            </div>
            
            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem', textAlign: 'left' }}>
              <div className="mb-3">
                <strong style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--primary)' }}><Briefcase size={16} /> Professional</strong>
                <p className="mb-0 mt-1">{selectedUser.currentRole || 'No Role'} {selectedUser.currentCompany && `at ${selectedUser.currentCompany}`}</p>
                <p className="text-muted" style={{ fontSize: '0.9rem' }}>{selectedUser.industry || 'No Industry Specified'}</p>
              </div>
              <div className="mb-3">
                <strong style={{ color: 'var(--primary)' }}>Education</strong>
                <p className="mb-0 mt-1">Batch of {selectedUser.batchYear || 'N/A'}</p>
                <p className="text-muted" style={{ fontSize: '0.9rem' }}>Department: {selectedUser.department || 'N/A'}</p>
              </div>
              {selectedUser.bio && (
                <div className="mb-3">
                  <strong style={{ color: 'var(--primary)' }}>About</strong>
                  <p className="mt-1 text-muted" style={{ fontSize: '0.95rem', lineHeight: '1.5' }}>{selectedUser.bio}</p>
                </div>
              )}
            </div>
            <div className="flex gap-2 mt-4 pt-3" style={{ borderTop: '1px solid var(--border-color)' }}>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => alert('Messaging feature coming soon!')}>Message</button>
              <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setSelectedUser(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Directory;
