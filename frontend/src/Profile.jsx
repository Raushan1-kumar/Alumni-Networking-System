import { useState, useEffect } from 'react';
import axios from 'axios';
import { User as UserIcon, Settings, MessageSquare, Briefcase, Calendar, ClipboardList, PenTool } from 'lucide-react';

const Profile = ({ user }) => {
  const [activeTab, setActiveTab] = useState('details');
  const [profileData, setProfileData] = useState(user || {});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  // History states
  const [myPosts, setMyPosts] = useState([]);
  const [myJobs, setMyJobs] = useState([]);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [myEvents, setMyEvents] = useState([]);
  const [mySurveys, setMySurveys] = useState([]);

  useEffect(() => {
    if (activeTab === 'posts') fetchMyPosts();
    else if (activeTab === 'jobs') fetchMyJobs();
    else if (activeTab === 'events') fetchMyEvents();
    else if (activeTab === 'surveys') fetchMySurveys();
  }, [activeTab]);

  const apiFetch = async (url, setter) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://localhost:5000${url}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setter(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchMyPosts = () => apiFetch(`/api/posts/user/${user._id}`, setMyPosts);
  
  const fetchMyJobs = async () => {
    try {
      const token = localStorage.getItem('token');
      // Fetch jobs posted by me
      const resPosts = await axios.get(`http://localhost:5000/api/jobs/my-posts`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMyJobs(resPosts.data);

      // Fetch all jobs to find which ones I applied to
      const resAll = await axios.get(`http://localhost:5000/api/jobs`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const myApplied = resAll.data.filter(job => 
        job.applicants?.some(a => a.user === user?._id || a.user?._id === user?._id)
      );
      setAppliedJobs(myApplied);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchMyEvents = () => apiFetch(`/api/events/my-registrations`, setMyEvents);
  const fetchMySurveys = () => apiFetch(`/api/surveys/my-responses`, setMySurveys);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const token = localStorage.getItem('token');
      const res = await axios.put('http://localhost:5000/api/users/profile', profileData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage('Profile updated successfully!');
      localStorage.setItem('user', JSON.stringify(res.data.user));
    } catch (error) {
      setMessage(error.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  return (
    <div className="container mt-4">
      <div className="flex gap-4">
        {/* Sidebar Nav */}
        <div style={{ width: '250px' }}>
          <div className="card text-center mb-3">
             <div style={{
              width: '80px', height: '80px', borderRadius: '50%', 
              backgroundColor: 'var(--primary-light)', margin: '0 auto 1rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '2rem', color: 'var(--primary)', fontWeight: 'bold'
            }}>
              {user?.name?.charAt(0)}
            </div>
            <h4>{user?.name}</h4>
            <p className="text-muted" style={{fontSize: '0.85rem'}}>{user?.email}</p>
          </div>
          
          <div className="card" style={{ padding: '0.5rem' }}>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <li>
                <button 
                  onClick={() => setActiveTab('details')}
                  className={`btn btn-block ${activeTab === 'details' ? 'btn-primary' : 'btn-outline'}`}
                  style={{ textAlign: 'left', justifyContent: 'flex-start', border: 'none', marginBottom: '0.5rem' }}
                >
                  <Settings size={18} /> Edit Profile
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActiveTab('posts')}
                  className={`btn btn-block ${activeTab === 'posts' ? 'btn-primary' : 'btn-outline'}`}
                  style={{ textAlign: 'left', justifyContent: 'flex-start', border: 'none', marginBottom: '0.5rem' }}
                >
                  <MessageSquare size={18} /> My Posts
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActiveTab('jobs')}
                  className={`btn btn-block ${activeTab === 'jobs' ? 'btn-primary' : 'btn-outline'}`}
                  style={{ textAlign: 'left', justifyContent: 'flex-start', border: 'none', marginBottom: '0.5rem' }}
                >
                  <Briefcase size={18} /> My Job Listings
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActiveTab('events')}
                  className={`btn btn-block ${activeTab === 'events' ? 'btn-primary' : 'btn-outline'}`}
                  style={{ textAlign: 'left', justifyContent: 'flex-start', border: 'none', marginBottom: '0.5rem' }}
                >
                  <Calendar size={18} /> Event RSVPs
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActiveTab('surveys')}
                  className={`btn btn-block ${activeTab === 'surveys' ? 'btn-primary' : 'btn-outline'}`}
                  style={{ textAlign: 'left', justifyContent: 'flex-start', border: 'none', marginBottom: '0' }}
                >
                  <ClipboardList size={18} /> Survey Responses
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Main Content Area */}
        <div style={{ flex: 1 }}>
          <div className="card" style={{ minHeight: '500px' }}>
            
            {/* DETAILS TAB */}
            {activeTab === 'details' && (
              <div>
                <h3 className="mb-3 flex items-center gap-2"><PenTool size={20} /> Update Personal Details</h3>
                {message && <div className="alert alert-error">{message}</div>}
                
                <form onSubmit={handleProfileUpdate}>
                  <div className="grid grid-cols-2">
                    <div className="form-group mb-2">
                      <label className="form-label">Name</label>
                      <input type="text" name="name" className="form-control" value={profileData.name || ''} onChange={handleChange} required />
                    </div>
                    <div className="form-group mb-2">
                      <label className="form-label">Phone</label>
                      <input type="text" name="phone" className="form-control" value={profileData.phone || ''} onChange={handleChange} />
                    </div>
                    <div className="form-group mb-2">
                      <label className="form-label">Location</label>
                      <input type="text" name="location" className="form-control" value={profileData.location || ''} onChange={handleChange} />
                    </div>
                    <div className="form-group mb-2">
                      <label className="form-label">Industry</label>
                      <input type="text" name="industry" className="form-control" value={profileData.industry || ''} onChange={handleChange} />
                    </div>
                    <div className="form-group mb-2">
                      <label className="form-label">Current Role</label>
                      <input type="text" name="currentRole" className="form-control" value={profileData.currentRole || ''} onChange={handleChange} />
                    </div>
                    <div className="form-group mb-2">
                      <label className="form-label">Current Company</label>
                      <input type="text" name="currentCompany" className="form-control" value={profileData.currentCompany || ''} onChange={handleChange} />
                    </div>
                  </div>
                  
                  <div className="form-group mb-3">
                    <label className="form-label">Short Bio</label>
                    <textarea name="bio" className="form-control" rows="3" value={profileData.bio || ''} onChange={handleChange}></textarea>
                  </div>
                  
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </form>
              </div>
            )}

            {/* POSTS TAB */}
            {activeTab === 'posts' && (
              <div>
                <h3 className="mb-3 flex items-center gap-2"><MessageSquare size={20} /> My Posts</h3>
                {myPosts.length === 0 ? <p className="text-muted">You haven't posted anything yet.</p> : (
                  <div className="flex flex-col gap-3">
                    {myPosts.map(post => (
                      <div key={post._id} style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                        <p>{post.content}</p>
                        <span className="text-muted" style={{ fontSize: '0.8rem' }}>{new Date(post.createdAt).toLocaleDateString()} • {post.likes?.length} Likes • {post.comments?.length} Comments</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* JOBS TAB */}
            {activeTab === 'jobs' && (
              <div>
                <h3 className="mb-3 flex items-center gap-2"><Briefcase size={20} /> My Job Listings & Applications</h3>
                
                <h4 className="mb-2" style={{ color: 'var(--primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Jobs I Posted</h4>
                {myJobs.length === 0 ? <p className="text-muted mb-4">You haven't published any jobs.</p> : (
                  <div className="flex flex-col gap-3 mb-4">
                    {myJobs.map(job => (
                      <div key={job._id} style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                        <div className="flex justify-between items-center">
                          <h4 style={{ margin: 0 }}>{job.title}</h4>
                          <span className="badge">{job.isActive ? 'Active' : 'Closed'}</span>
                        </div>
                        <p className="mb-1 text-muted">{job.company}</p>
                        <span style={{ fontSize: '0.85rem' }}>{job.applicants?.length || 0} Applicants</span>
                      </div>
                    ))}
                  </div>
                )}

                <h4 className="mb-2 mt-4" style={{ color: 'var(--primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Jobs I Applied To</h4>
                {appliedJobs.length === 0 ? <p className="text-muted">You haven't applied to any jobs.</p> : (
                  <div className="flex flex-col gap-3">
                    {appliedJobs.map(job => (
                      <div key={job._id} style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '8px', backgroundColor: 'var(--background)' }}>
                        <div className="flex justify-between items-center">
                          <h4 style={{ margin: 0 }}>{job.title}</h4>
                          <span className="badge" style={{ backgroundColor: 'var(--primary)', color: 'white' }}>Application Sent</span>
                        </div>
                        <p className="mb-1 text-muted">{job.company} • {job.location || 'Remote'}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* EVENTS TAB */}
            {activeTab === 'events' && (
              <div>
                <h3 className="mb-3 flex items-center gap-2"><Calendar size={20} /> Event RSVPs</h3>
                {myEvents.length === 0 ? <p className="text-muted">You haven't registered for any upcoming events.</p> : (
                  <div className="flex flex-col gap-3">
                    {myEvents.map(event => (
                      <div key={event._id} style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                        <h4 style={{ margin: 0, marginBottom: '0.5rem' }}>{event.title}</h4>
                        <span className="text-muted" style={{ fontSize: '0.9rem' }}>
                          Scheduled for: {new Date(event.eventDate).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* SURVEYS TAB */}
            {activeTab === 'surveys' && (
              <div>
                <h3 className="mb-3 flex items-center gap-2"><ClipboardList size={20} /> Completed Surveys</h3>
                {mySurveys.length === 0 ? <p className="text-muted">You haven't filled out any surveys.</p> : (
                  <div className="flex flex-col gap-3">
                    {mySurveys.map(survey => (
                      <div key={survey._id} style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                        <h4 style={{ margin: 0, marginBottom: '0.5rem' }}>{survey.title}</h4>
                        <p className="text-muted mb-2" style={{ fontSize: '0.9rem' }}>You answered {survey.myResponse?.answers?.length} questions.</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
