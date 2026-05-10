import { useState, useEffect } from 'react';
import axios from 'axios';
import { Star, Award, PenTool, CheckCircle, Clock } from 'lucide-react';

const Stories = ({ user }) => {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitMsg, setSubmitMsg] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    story: '',
    achievement: '',
    category: 'Career',
  });

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/stories', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStories(res.data.filter(s => s.isApproved));
    } catch (error) {
      console.error('Failed to fetch stories', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitMsg('');
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/stories', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSubmitMsg('success');
      setFormData({ title: '', story: '', achievement: '', category: 'Career' });
      setShowForm(false);
    } catch (err) {
      setSubmitMsg('error:' + (err.response?.data?.message || 'Submission failed'));
    } finally {
      setSubmitting(false);
    }
  };

  const categories = ['Career', 'Entrepreneurship', 'Research', 'Social Impact', 'Sports', 'Arts', 'Other'];
  const categoryColors = {
    Career: '#1565c0', Entrepreneurship: '#e65100', Research: '#6a1b9a',
    'Social Impact': '#2e7d32', Sports: '#c62828', Arts: '#f57f17', Other: '#37474f'
  };

  return (
    <div className="container mt-4">
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, var(--primary) 0%, #1b5e20 100%)',
        borderRadius: '16px', padding: '2.5rem 2rem', marginBottom: '2rem',
        textAlign: 'center', color: 'white'
      }}>
        <Star size={40} style={{ marginBottom: '0.75rem', fill: 'white' }} />
        <h2 style={{ color: 'white', margin: '0 0 0.5rem' }}>Inspiring Success Stories</h2>
        <p style={{ margin: '0 0 1.5rem', opacity: 0.85, maxWidth: '550px', marginLeft: 'auto', marginRight: 'auto', color: 'white' }}>
          Discover the incredible milestones of our alumni. Inspired? Share your own journey with the community!
        </p>
        <button
          onClick={() => { setShowForm(!showForm); setSubmitMsg(''); }}
          style={{
            backgroundColor: 'white', color: 'var(--primary)',
            border: 'none', padding: '0.7rem 1.8rem', borderRadius: '8px',
            fontWeight: '600', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px'
          }}
        >
          <PenTool size={17} /> {showForm ? 'Cancel' : 'Share Your Story'}
        </button>
      </div>

      {/* Success/pending message */}
      {submitMsg === 'success' && (
        <div style={{
          backgroundColor: '#e8f5e9', border: '1px solid #a5d6a7',
          borderRadius: '10px', padding: '1rem 1.25rem', marginBottom: '1.5rem',
          display: 'flex', alignItems: 'center', gap: '10px', color: '#2e7d32'
        }}>
          <CheckCircle size={20} />
          <div>
            <strong>Story submitted!</strong>
            <p style={{ margin: 0, fontSize: '0.9rem' }}>Your story is pending admin review and will appear here once approved.</p>
          </div>
        </div>
      )}
      {submitMsg.startsWith('error:') && (
        <div style={{
          backgroundColor: '#ffebee', border: '1px solid #ef9a9a',
          borderRadius: '10px', padding: '1rem 1.25rem', marginBottom: '1.5rem', color: '#c62828'
        }}>
          ❌ {submitMsg.replace('error:', '')}
        </div>
      )}

      {/* Submission Form */}
      {showForm && (
        <div className="card mb-4" style={{ borderLeft: '4px solid var(--primary)' }}>
          <div className="flex items-center gap-2 mb-3">
            <PenTool size={20} style={{ color: 'var(--primary)' }} />
            <h3 style={{ margin: 0 }}>Share Your Achievement</h3>
          </div>
          <p className="text-muted mb-3" style={{ fontSize: '0.9rem' }}>
            Your story will be reviewed by admin before being published. Inspire your fellow alumni!
          </p>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2" style={{ gap: '1rem', marginBottom: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Story Title *</label>
                <input type="text" className="form-control" placeholder="e.g. How I Built My First Startup" required
                  value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Category *</label>
                <select className="form-control" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div className="form-group mb-3">
              <label className="form-label">Key Achievement / Milestone</label>
              <input type="text" className="form-control" placeholder="e.g. Founded a company with 50+ employees"
                value={formData.achievement} onChange={e => setFormData({ ...formData, achievement: e.target.value })} />
            </div>

            <div className="form-group mb-3">
              <label className="form-label">Your Story *</label>
              <textarea className="form-control" rows="6"
                placeholder="Tell your journey — challenges you faced, lessons learned, and advice for fellow alumni..."
                required value={formData.story} onChange={e => setFormData({ ...formData, story: e.target.value })}
              />
            </div>

            <div className="flex gap-2 items-center">
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Submitting...' : '🚀 Submit Story'}
              </button>
              <span className="text-muted" style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Clock size={14} /> Pending admin approval after submission
              </span>
            </div>
          </form>
        </div>
      )}

      {/* Stories Grid */}
      {loading ? (
        <p className="text-center">Loading Stories...</p>
      ) : stories.length === 0 ? (
        <div className="card text-center" style={{ padding: '3rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🌟</div>
          <h4>No approved stories yet</h4>
          <p className="text-muted">Be the first to inspire others — share your story above!</p>
        </div>
      ) : (
        <div className="grid grid-cols-2">
          {stories.map(story => (
            <div className="card" key={story._id} style={{ borderTop: `3px solid ${categoryColors[story.category] || '#2e7d32'}` }}>
              <div className="flex justify-between items-start mb-2">
                <span style={{
                  fontSize: '0.75rem', padding: '0.2rem 0.6rem',
                  backgroundColor: (categoryColors[story.category] || '#2e7d32') + '20',
                  color: categoryColors[story.category] || '#2e7d32',
                  borderRadius: '20px', fontWeight: '600'
                }}>
                  {story.category}
                </span>
                <Award size={18} style={{ color: '#f57f17' }} />
              </div>

              <h3 style={{ color: 'var(--primary-dark)', marginBottom: '0.5rem', fontSize: '1.1rem' }}>
                {story.title}
              </h3>

              <div className="flex items-center gap-2 mb-3" style={{ fontSize: '0.88rem', fontWeight: 500 }}>
                <div style={{
                  width: '26px', height: '26px', borderRadius: '50%',
                  backgroundColor: 'var(--primary)', color: 'white',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.72rem', fontWeight: 'bold', flexShrink: 0
                }}>
                  {story.author?.name?.charAt(0) || '?'}
                </div>
                <span>{story.author?.name || 'Alumni'}</span>
              </div>

              {story.achievement && (
                <div style={{
                  padding: '0.6rem 0.8rem', backgroundColor: 'var(--primary-light)',
                  borderRadius: '8px', borderLeft: '3px solid var(--primary)',
                  marginBottom: '1rem', fontSize: '0.88rem'
                }}>
                  🏆 <strong>Key Milestone:</strong> {story.achievement}
                </div>
              )}

              <p style={{ whiteSpace: 'pre-line', fontSize: '0.92rem', lineHeight: 1.6, color: 'var(--text-secondary)' }}>
                {story.story?.length > 300 ? story.story.substring(0, 300) + '...' : story.story}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Stories;
