import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Users, Briefcase, Calendar, Heart, MessageSquare,
  ClipboardList, BookOpen, TrendingUp, Shield, ChevronDown, ChevronUp
} from 'lucide-react';

const Admin = ({ user }) => {
  const [stats, setStats] = useState({
    users: [], jobs: [], events: [], donations: {}, posts: [], surveys: [], stories: [], pendingUsers: []
  });
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('overview');

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };
  const api = (url) => axios.get(`http://localhost:5000${url}`, { headers });

  useEffect(() => {
    if (user?.role !== 'admin') return;
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [users, jobs, events, donations, posts, surveys, stories, pendingUsers] = await Promise.all([
        api('/api/users'),
        api('/api/jobs'),
        api('/api/events'),
        api('/api/donations'),           // admin-only: { totalRaised, count, donations[] }
        api('/api/posts'),
        api('/api/surveys'),
        api('/api/stories'),
        api('/api/users/admin/pending'),
      ]);
      setStats({
        users: users.data,
        jobs: jobs.data,
        events: events.data,
        donations: donations.data,
        posts: posts.data,
        surveys: surveys.data,
        stories: stories.data,
        pendingUsers: pendingUsers.data,
      });
    } catch (e) {
      console.error('Admin fetch failed:', e.message);
    } finally {
      setLoading(false);
    }
  };

  // Remove the separate fetchEvents since events is now in fetchAll

  if (user?.role !== 'admin') {
    return (
      <div className="container mt-4 text-center">
        <div className="card" style={{ padding: '3rem', maxWidth: '400px', margin: '0 auto' }}>
          <Shield size={48} style={{ color: 'var(--primary)', marginBottom: '1rem' }} />
          <h3>Access Denied</h3>
          <p className="text-muted">You do not have admin privileges to access this page.</p>
        </div>
      </div>
    );
  }

  const [surveyForm, setSurveyForm] = useState({ title: '', description: '', questions: [{ questionText: '', questionType: 'text', options: '' }] });
  const [surveyMsg, setSurveyMsg] = useState('');
  const [eventForm, setEventForm] = useState({ title: '', description: '', eventType: 'Seminar', venue: '', eventDate: '', lastDateToRegister: '', maxAttendees: '' });
  const [eventMsg, setEventMsg] = useState('');

  const addQuestion = () => setSurveyForm(f => ({ ...f, questions: [...f.questions, { questionText: '', questionType: 'text', options: '' }] }));
  const updateQuestion = (i, field, val) => {
    const qs = [...surveyForm.questions];
    qs[i][field] = val;
    setSurveyForm(f => ({ ...f, questions: qs }));
  };
  const removeQuestion = (i) => setSurveyForm(f => ({ ...f, questions: f.questions.filter((_, idx) => idx !== i) }));

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    setEventMsg('');
    try {
      await axios.post('http://localhost:5000/api/events', eventForm, { headers });
      setEventMsg('success');
      setEventForm({ title: '', description: '', eventType: 'Seminar', venue: '', eventDate: '', lastDateToRegister: '', maxAttendees: '' });
      fetchAll();
    } catch (err) {
      setEventMsg('error:' + (err.response?.data?.message || 'Failed'));
    }
  };

  const handleApproveStory = async (storyId) => {
    try {
      await axios.put(`http://localhost:5000/api/stories/${storyId}/approve`, {}, { headers });
      fetchAll();
    } catch (err) {
      alert(err.response?.data?.message || 'Approval failed');
    }
  };

  const handleApproveUser = async (userId) => {
    try {
      await axios.put(`http://localhost:5000/api/users/${userId}/approve`, {}, { headers });
      fetchAll();
    } catch (err) {
      alert(err.response?.data?.message || 'Approval failed');
    }
  };

  const handleCreateSurvey = async (e) => {
    e.preventDefault();
    setSurveyMsg('');
    try {
      const questions = surveyForm.questions.map(q => ({
        questionText: q.questionText,
        questionType: q.questionType,
        options: q.questionType === 'multiple-choice' ? q.options.split(',').map(o => o.trim()).filter(Boolean) : [],
        isRequired: true,
      }));
      await axios.post('http://localhost:5000/api/surveys', {
        title: surveyForm.title,
        description: surveyForm.description,
        questions,
      }, { headers });
      setSurveyMsg('✅ Survey created successfully!');
      setSurveyForm({ title: '', description: '', questions: [{ questionText: '', questionType: 'text', options: '' }] });
      fetchAll();
    } catch (err) {
      setSurveyMsg('❌ ' + (err.response?.data?.message || 'Failed to create survey'));
    }
  };

  const StatCard = ({ icon: Icon, label, value, color = 'var(--primary)' }) => (
    <div className="card text-center" style={{ borderTop: `3px solid ${color}` }}>
      <Icon size={28} style={{ color, marginBottom: '0.5rem' }} />
      <h2 style={{ margin: '0 0 0.25rem', color }}>{value}</h2>
      <p className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>{label}</p>
    </div>
  );

  const SectionHeader = ({ title, section }) => (
    <div
      className="flex justify-between items-center"
      style={{ cursor: 'pointer', padding: '1rem', backgroundColor: 'var(--primary-light)', borderRadius: '8px', marginBottom: '1rem' }}
      onClick={() => setActiveSection(activeSection === section ? '' : section)}
    >
      <h3 style={{ margin: 0, color: 'var(--primary)' }}>{title}</h3>
      {activeSection === section ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
    </div>
  );

  return (
    <div className="container mt-4">
      <div className="flex items-center gap-3 mb-4">
        <Shield size={28} style={{ color: 'var(--primary)' }} />
        <div>
          <h2 style={{ margin: 0 }}>Admin Control Panel</h2>
          <p className="text-muted mb-0" style={{ fontSize: '0.85rem' }}>Full platform overview and management</p>
        </div>
      </div>

      {loading ? (
        <p className="text-center">Loading platform data...</p>
      ) : (
        <>
          {/* Stats Overview */}
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            <StatCard icon={Users} label="Total Alumni" value={stats.users?.length || 0} color="#2e7d32" />
            <StatCard icon={Users} label="Pending Approvals" value={stats.pendingUsers?.length || 0} color="#d97706" />
            <StatCard icon={MessageSquare} label="Total Posts" value={stats.posts?.length || 0} color="#1565c0" />
            <StatCard icon={Briefcase} label="Job Listings" value={stats.jobs?.length || 0} color="#e65100" />
            <StatCard icon={Calendar} label="Events" value={stats.events?.length || 0} color="#6a1b9a" />
            <StatCard icon={Heart} label="Donations" value={stats.donations?.count || 0} color="#c62828" />
            <StatCard icon={ClipboardList} label="Surveys" value={stats.surveys?.length || 0} color="#00695c" />
            <StatCard icon={BookOpen} label="Stories" value={stats.stories?.length || 0} color="#f57f17" />
            <StatCard icon={TrendingUp} label="Total Raised" value={`₹${stats.donations?.totalRaised || 0}`} color="#2e7d32" />
          </div>

          {/* Users Section */}
          <div className="mb-4">
            <SectionHeader title={`👥 Alumni Users (${stats.users?.length || 0})`} section="users" />
            {activeSection === 'users' && (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: 'var(--primary-light)', textAlign: 'left' }}>
                      <th style={{ padding: '0.75rem' }}>Name</th>
                      <th style={{ padding: '0.75rem' }}>Email</th>
                      <th style={{ padding: '0.75rem' }}>Batch</th>
                      <th style={{ padding: '0.75rem' }}>Dept</th>
                      <th style={{ padding: '0.75rem' }}>Role</th>
                      <th style={{ padding: '0.75rem' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.users?.map(u => (
                      <tr key={u._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '0.75rem', fontWeight: '500' }}>{u.name}</td>
                        <td style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>{u.email}</td>
                        <td style={{ padding: '0.75rem' }}>{u.batchYear || '—'}</td>
                        <td style={{ padding: '0.75rem' }}>{u.department || '—'}</td>
                        <td style={{ padding: '0.75rem' }}>
                          <span className="badge" style={{ backgroundColor: u.role === 'admin' ? '#c62828' : 'var(--primary-light)', color: u.role === 'admin' ? 'white' : 'var(--primary)' }}>
                            {u.role}
                          </span>
                        </td>
                        <td style={{ padding: '0.75rem' }}>
                          <span style={{ fontSize: '0.8rem', color: u.isApproved ? '#2e7d32' : '#c62828', fontWeight: '600' }}>
                            {u.isApproved ? '✓ Approved' : '⏳ Pending'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Pending Approvals Section */}
          <div className="mb-4">
            <SectionHeader title={`⏳ Pending Approvals (${stats.pendingUsers?.length || 0})`} section="pending" />
            {activeSection === 'pending' && (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: 'var(--primary-light)', textAlign: 'left' }}>
                      <th style={{ padding: '0.75rem' }}>Name</th>
                      <th style={{ padding: '0.75rem' }}>Email</th>
                      <th style={{ padding: '0.75rem' }}>Type</th>
                      <th style={{ padding: '0.75rem' }}>Batch / Enrollment</th>
                      <th style={{ padding: '0.75rem' }}>Dept / Course</th>
                      <th style={{ padding: '0.75rem' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.pendingUsers?.map(u => (
                      <tr key={u._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '0.75rem', fontWeight: '500' }}>{u.name}</td>
                        <td style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>{u.email}</td>
                        <td style={{ padding: '0.75rem' }}>
                          <span className="badge" style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>
                            {u.role}
                          </span>
                        </td>
                        <td style={{ padding: '0.75rem' }}>
                          {u.role === 'student' ? u.enrollmentYear || '—' : u.batchYear || '—'}
                        </td>
                        <td style={{ padding: '0.75rem' }}>
                          {u.role === 'student' ? u.course || '—' : u.department || '—'}
                        </td>
                        <td style={{ padding: '0.75rem' }}>
                          <button
                            className="btn btn-sm btn-primary"
                            style={{ padding: '0.4rem 0.75rem' }}
                            onClick={() => handleApproveUser(u._id)}
                          >
                            Approve
                          </button>
                        </td>
                      </tr>
                    ))}
                    {stats.pendingUsers?.length === 0 && (
                      <tr>
                        <td colSpan="6" style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                          No pending approvals at the moment.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Jobs Section */}
          <div className="mb-4">
            <SectionHeader title={`💼 Job Listings (${stats.jobs?.length || 0})`} section="jobs" />
            {activeSection === 'jobs' && (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: 'var(--primary-light)', textAlign: 'left' }}>
                      <th style={{ padding: '0.75rem' }}>Title</th>
                      <th style={{ padding: '0.75rem' }}>Company</th>
                      <th style={{ padding: '0.75rem' }}>Type</th>
                      <th style={{ padding: '0.75rem' }}>Applicants</th>
                      <th style={{ padding: '0.75rem' }}>Status</th>
                      <th style={{ padding: '0.75rem' }}>Posted</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.jobs?.map(j => (
                      <tr key={j._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '0.75rem', fontWeight: '500' }}>{j.title}</td>
                        <td style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>{j.company}</td>
                        <td style={{ padding: '0.75rem' }}><span className="badge">{j.jobType}</span></td>
                        <td style={{ padding: '0.75rem' }}>{j.applicants?.length || 0}</td>
                        <td style={{ padding: '0.75rem' }}>
                          <span style={{ color: j.isActive ? '#2e7d32' : '#c62828', fontWeight: '600', fontSize: '0.85rem' }}>
                            {j.isActive ? '● Active' : '● Closed'}
                          </span>
                        </td>
                        <td style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>{new Date(j.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Events Section */}
          <div className="mb-4">
            <SectionHeader title={`📅 Events (${stats.events?.length || 0})`} section="events" />
            {activeSection === 'events' && (
              <div>
                {/* Create Event Form */}
                <div className="card mb-4" style={{ backgroundColor: 'var(--primary-light)' }}>
                  <h4 style={{ color: 'var(--primary)', marginBottom: '1rem' }}>➕ Create New Event</h4>
                  {eventMsg === 'success' && <p style={{ color: '#2e7d32', marginBottom: '1rem' }}>✅ Event created successfully!</p>}
                  {eventMsg.startsWith('error:') && <p style={{ color: '#c62828', marginBottom: '1rem' }}>❌ {eventMsg.replace('error:', '')}</p>}
                  <form onSubmit={handleCreateEvent}>
                    <div className="grid grid-cols-2" style={{ gap: '1rem', marginBottom: '1rem' }}>
                      <input type="text" className="form-control" placeholder="Event Title *" required
                        value={eventForm.title} onChange={e => setEventForm(f => ({ ...f, title: e.target.value }))} />
                      <select className="form-control" value={eventForm.eventType} onChange={e => setEventForm(f => ({ ...f, eventType: e.target.value }))}>
                        <option value="Seminar">Seminar</option>
                        <option value="Workshop">Workshop</option>
                        <option value="Reunion">Reunion</option>
                        <option value="Webinar">Webinar</option>
                        <option value="Cultural">Cultural</option>
                        <option value="Sports">Sports</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div className="form-group mb-2">
                      <textarea className="form-control" placeholder="Event Description" rows="2"
                        value={eventForm.description} onChange={e => setEventForm(f => ({ ...f, description: e.target.value }))} />
                    </div>
                    <div className="grid grid-cols-2" style={{ gap: '1rem', marginBottom: '1rem' }}>
                      <input type="text" className="form-control" placeholder="Venue / Location"
                        value={eventForm.venue} onChange={e => setEventForm(f => ({ ...f, venue: e.target.value }))} />
                      <input type="number" className="form-control" placeholder="Max Attendees (optional)"
                        value={eventForm.maxAttendees} onChange={e => setEventForm(f => ({ ...f, maxAttendees: e.target.value }))} />
                    </div>
                    <div className="grid grid-cols-2" style={{ gap: '1rem', marginBottom: '1rem' }}>
                      <div>
                        <label className="form-label" style={{ fontSize: '0.82rem' }}>Event Date *</label>
                        <input type="datetime-local" className="form-control" required
                          value={eventForm.eventDate} onChange={e => setEventForm(f => ({ ...f, eventDate: e.target.value }))} />
                      </div>
                      <div>
                        <label className="form-label" style={{ fontSize: '0.82rem' }}>Registration Deadline</label>
                        <input type="datetime-local" className="form-control"
                          value={eventForm.lastDateToRegister} onChange={e => setEventForm(f => ({ ...f, lastDateToRegister: e.target.value }))} />
                      </div>
                    </div>
                    <button type="submit" className="btn btn-primary">Publish Event</button>
                  </form>
                </div>

                {/* Events List */}
                <div className="grid grid-cols-2">
                  {stats.events?.map(ev => (
                    <div key={ev._id} className="card">
                      <div className="flex justify-between items-start mb-2">
                        <h4 style={{ margin: 0 }}>{ev.title}</h4>
                        <span className="badge">{ev.eventType}</span>
                      </div>
                      <p className="text-muted mb-1" style={{ fontSize: '0.85rem' }}>{ev.venue || 'Virtual'}</p>
                      <p className="mb-1" style={{ fontSize: '0.85rem' }}><strong>Date:</strong> {new Date(ev.eventDate).toLocaleDateString()}</p>
                      <p className="mb-0" style={{ fontSize: '0.85rem' }}><strong>Registrations:</strong> {ev.registeredUsers?.length || 0}</p>
                    </div>
                  ))}
                  {stats.events?.length === 0 && <p className="text-muted">No events found.</p>}
                </div>
              </div>
            )}
          </div>

          {/* Donations Section */}
          <div className="mb-4">
            <SectionHeader title={`💚 Donations — Total Raised: ₹${stats.donations?.totalRaised || 0}`} section="donations" />
            {activeSection === 'donations' && (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: 'var(--primary-light)', textAlign: 'left' }}>
                      <th style={{ padding: '0.75rem' }}>Donor</th>
                      <th style={{ padding: '0.75rem' }}>Amount</th>
                      <th style={{ padding: '0.75rem' }}>Cause</th>
                      <th style={{ padding: '0.75rem' }}>Message</th>
                      <th style={{ padding: '0.75rem' }}>Status</th>
                      <th style={{ padding: '0.75rem' }}>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.donations?.donations?.map(d => (
                      <tr key={d._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '0.75rem', fontWeight: '500' }}>{d.isAnonymous ? 'Anonymous' : d.donor?.name || '—'}</td>
                        <td style={{ padding: '0.75rem', color: '#2e7d32', fontWeight: '600' }}>₹{d.amount}</td>
                        <td style={{ padding: '0.75rem' }}><span className="badge">{d.cause}</span></td>
                        <td style={{ padding: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>{d.message || '—'}</td>
                        <td style={{ padding: '0.75rem' }}>
                          <span style={{ color: '#2e7d32', fontWeight: '600', fontSize: '0.85rem' }}>✓ {d.paymentStatus}</span>
                        </td>
                        <td style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>{new Date(d.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Posts Section */}
          <div className="mb-4">
            <SectionHeader title={`📝 Feed Posts (${stats.posts?.length || 0})`} section="posts" />
            {activeSection === 'posts' && (
              <div className="flex flex-col gap-3">
                {stats.posts?.slice(0, 20).map(p => (
                  <div key={p._id} style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '0.9rem' }}>
                    <div className="flex justify-between items-start mb-1">
                      <strong>{p.author?.name || 'Unknown'}</strong>
                      <span className="text-muted" style={{ fontSize: '0.8rem' }}>{new Date(p.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="mb-1">{p.content}</p>
                    <span className="text-muted" style={{ fontSize: '0.8rem' }}>
                      ❤ {p.likes?.length || 0} Likes  •  💬 {p.comments?.length || 0} Comments
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Surveys Section */}
          <div className="mb-4">
            <SectionHeader title={`📋 Surveys (${stats.surveys?.length || 0})`} section="surveys" />
            {activeSection === 'surveys' && (
              <div>
                {/* Create Survey Form */}
                <div className="card mb-4" style={{ backgroundColor: 'var(--primary-light)' }}>
                  <h4 style={{ color: 'var(--primary)', marginBottom: '1rem' }}>➕ Create New Survey</h4>
                  {surveyMsg && <p style={{ color: surveyMsg.startsWith('✅') ? '#2e7d32' : '#c62828', marginBottom: '1rem' }}>{surveyMsg}</p>}
                  <form onSubmit={handleCreateSurvey}>
                    <div className="grid grid-cols-2" style={{ gap: '1rem', marginBottom: '1rem' }}>
                      <input type="text" className="form-control" placeholder="Survey Title *" required
                        value={surveyForm.title} onChange={e => setSurveyForm(f => ({ ...f, title: e.target.value }))} />
                      <input type="text" className="form-control" placeholder="Short Description"
                        value={surveyForm.description} onChange={e => setSurveyForm(f => ({ ...f, description: e.target.value }))} />
                    </div>
                    <h5 style={{ marginBottom: '0.75rem' }}>Questions:</h5>
                    {surveyForm.questions.map((q, i) => (
                      <div key={i} style={{ padding: '0.75rem', border: '1px solid var(--border-color)', borderRadius: '8px', marginBottom: '0.75rem', backgroundColor: 'white' }}>
                        <div className="grid grid-cols-2" style={{ gap: '0.5rem', marginBottom: '0.5rem' }}>
                          <input type="text" className="form-control" placeholder={`Question ${i+1} text *`} required
                            value={q.questionText} onChange={e => updateQuestion(i, 'questionText', e.target.value)} />
                          <select className="form-control" value={q.questionType} onChange={e => updateQuestion(i, 'questionType', e.target.value)}>
                            <option value="text">Text</option>
                            <option value="multiple-choice">Multiple Choice</option>
                            <option value="rating">Rating (1-5)</option>
                          </select>
                        </div>
                        {q.questionType === 'multiple-choice' && (
                          <input type="text" className="form-control" placeholder="Options: comma separated (e.g. Yes,No,Maybe)"
                            value={q.options} onChange={e => updateQuestion(i, 'options', e.target.value)} />
                        )}
                        {surveyForm.questions.length > 1 && (
                          <button type="button" onClick={() => removeQuestion(i)}
                            style={{ marginTop: '0.5rem', background: 'none', border: 'none', color: '#c62828', cursor: 'pointer', fontSize: '0.85rem' }}>Remove</button>
                        )}
                      </div>
                    ))}
                    <div className="flex gap-2">
                      <button type="button" onClick={addQuestion} className="btn btn-outline">+ Add Question</button>
                      <button type="submit" className="btn btn-primary">Publish Survey</button>
                    </div>
                  </form>
                </div>

                {/* Existing Surveys List */}
                <div className="grid grid-cols-2">
                  {stats.surveys?.map(s => (
                    <div key={s._id} className="card">
                      <h4 style={{ margin: '0 0 0.5rem' }}>{s.title}</h4>
                      <p className="text-muted mb-2" style={{ fontSize: '0.85rem' }}>{s.description}</p>
                      <p className="mb-1" style={{ fontSize: '0.85rem' }}><strong>Questions:</strong> {s.questions?.length || 0}</p>
                      <p className="mb-0" style={{ fontSize: '0.85rem' }}>
                        <strong>Status:</strong>{' '}
                        <span style={{ color: s.isActive ? '#2e7d32' : '#c62828' }}>{s.isActive ? 'Active' : 'Closed'}</span>
                      </p>
                    </div>
                  ))}
                  {stats.surveys?.length === 0 && <p className="text-muted">No surveys created yet.</p>}
                </div>
              </div>
            )}
          </div>

          {/* Stories Section */}
          <div className="mb-4">
            <SectionHeader title={`🌟 Success Stories (${stats.stories?.length || 0}) — ${stats.stories?.filter(s => !s.isApproved).length || 0} Pending`} section="stories" />
            {activeSection === 'stories' && (
              <div className="flex flex-col gap-3">
                {stats.stories?.length === 0 && <p className="text-muted">No stories submitted.</p>}
                {stats.stories?.map(s => (
                  <div key={s._id} style={{ padding: '1rem', border: `2px solid ${s.isApproved ? 'var(--border-color)' : '#f57f17'}`, borderRadius: '8px', fontSize: '0.9rem', backgroundColor: s.isApproved ? 'white' : '#fffde7' }}>
                    <div className="flex justify-between items-start mb-1">
                      <div>
                        <strong style={{ fontSize: '1rem' }}>{s.title}</strong>
                        <p className="mb-0 text-muted" style={{ fontSize: '0.82rem' }}>{s.author?.name || s.alumni?.name || 'Anonymous'} • {s.category}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span style={{ fontSize: '0.8rem', color: s.isApproved ? '#2e7d32' : '#e65100', fontWeight: '600', padding: '0.2rem 0.6rem', borderRadius: '20px', backgroundColor: s.isApproved ? '#e8f5e9' : '#fff3e0' }}>
                          {s.isApproved ? '✓ Approved' : '⏳ Pending Review'}
                        </span>
                        {!s.isApproved && (
                          <button
                            onClick={() => handleApproveStory(s._id)}
                            style={{ padding: '0.3rem 0.8rem', backgroundColor: '#2e7d32', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.82rem', fontWeight: '600' }}
                          >
                            ✓ Approve
                          </button>
                        )}
                      </div>
                    </div>
                    {s.achievement && <p className="mb-1" style={{ fontSize: '0.85rem' }}>🏆 <strong>Achievement:</strong> {s.achievement}</p>}
                    <p className="mb-0" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{s.story}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Admin;
