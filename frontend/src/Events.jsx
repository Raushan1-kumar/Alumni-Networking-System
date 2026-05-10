import { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, MapPin, Users, PlusCircle } from 'lucide-react';

const Events = ({ user }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/events', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEvents(res.data);
    } catch (error) {
      console.error('Failed to fetch events', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (eventId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`http://localhost:5000/api/events/${eventId}/register`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchEvents(); // auto updates UI to Attending
    } catch (error) {
      alert(error.response?.data?.message || "Failed to register");
    }
  };

  const handleCancelRegistration = async (eventId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/events/${eventId}/register`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchEvents(); // auto updates UI to default
    } catch (error) {
      alert(error.response?.data?.message || "Failed to cancel");
    }
  };

  return (
    <div className="container mt-4">
      <div className="flex justify-between items-center mb-4">
        <h2>Upcoming Events &amp; Reunions</h2>
        {user?.role === 'admin' && (
          <a href="/admin" className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}>
            <PlusCircle size={18} /> Organize Event
          </a>
        )}
      </div>

      {loading ? (
        <p className="text-center">Loading Events...</p>
      ) : events.length === 0 ? (
        <div className="card text-center text-muted">No upcoming events scheduled.</div>
      ) : (
        <div className="grid grid-cols-2">
          {events.map(event => (
            <div className="card flex flex-col" key={event._id}>
              <div className="flex justify-between mb-2">
                <span className="badge" style={{ backgroundColor: '#fff3cd', color: '#856404' }}>
                  {event.eventType}
                </span>
                <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--primary)' }}>
                  {new Date(event.eventDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
              
              <h3 style={{ marginBottom: '0.5rem' }}>{event.title}</h3>
              <p style={{ fontSize: '0.9rem', marginBottom: '1rem', flexGrow: 1 }}>{event.description}</p>
              
              <div className="flex flex-col gap-1 mb-4 text-muted" style={{ fontSize: '0.85rem' }}>
                <div className="flex items-center gap-2"><MapPin size={14} /> {event.venue || 'Virtual/TBA'}</div>
                <div className="flex items-center gap-2"><Users size={14} /> {event.registeredUsers?.length || 0} Attending</div>
              </div>

              {(() => {
                const isAttending = event.registeredUsers?.some(r => r.user === user?._id || r.user?._id === user?._id);
                return isAttending ? (
                  <button 
                    className="btn btn-outline" 
                    onClick={() => handleCancelRegistration(event._id)}
                  >
                    Attending (Click to Cancel)
                  </button>
                ) : (
                  <button 
                    className="btn btn-primary" 
                    onClick={() => handleRegister(event._id)}
                  >
                    RSVP Now
                  </button>
                );
              })()}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Events;
