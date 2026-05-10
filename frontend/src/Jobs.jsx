import { useState, useEffect } from 'react';
import axios from 'axios';
import { Briefcase, MapPin, Building, Calendar, DollarSign } from 'lucide-react';

const Jobs = ({ user }) => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '', company: '', location: '', jobType: 'Full-time', description: '', requirements: '', salary: ''
  });

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/jobs', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setJobs(res.data);
    } catch (error) {
      console.error('Failed to fetch jobs', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePostJob = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/jobs', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowForm(false);
      setFormData({ title: '', company: '', location: '', jobType: 'Full-time', description: '', requirements: '', salary: '' });
      fetchJobs();
    } catch (error) {
      console.error('Failed to post job', error);
    }
  };

  const handleApply = async (jobId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`http://localhost:5000/api/jobs/${jobId}/apply`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchJobs(); // Update the UI to show 'Applied'
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to apply');
    }
  };

  return (
    <div className="container mt-4">
      <div className="flex justify-between items-center mb-4">
        <h2>Job Portal</h2>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : 'Post a Job'}
        </button>
      </div>

      {showForm && (
        <div className="card mb-4" style={{ backgroundColor: 'var(--primary-light)' }}>
          <h3>Post a New Job Opportunity</h3>
          <form className="mt-3" onSubmit={handlePostJob}>
            <div className="grid grid-cols-2">
              <div className="form-group mb-2">
                <input type="text" placeholder="Job Title" required className="form-control" 
                  value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
              </div>
              <div className="form-group mb-2">
                <input type="text" placeholder="Company Name" required className="form-control" 
                  value={formData.company} onChange={e => setFormData({ ...formData, company: e.target.value })} />
              </div>
              <div className="form-group mb-2">
                <input type="text" placeholder="Location" className="form-control" 
                  value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} />
              </div>
              <div className="form-group mb-2">
                <select className="form-control" value={formData.jobType} onChange={e => setFormData({ ...formData, jobType: e.target.value })}>
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Internship">Internship</option>
                  <option value="Remote">Remote</option>
                </select>
              </div>
            </div>
            <div className="form-group mb-2">
              <textarea placeholder="Job Description" required className="form-control" rows="3"
                value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}></textarea>
            </div>
            <div className="form-group mb-3">
               <input type="text" placeholder="Salary (Optional)" className="form-control" 
                  value={formData.salary} onChange={e => setFormData({ ...formData, salary: e.target.value })} />
            </div>
            <button type="submit" className="btn btn-primary">Publish Job</button>
          </form>
        </div>
      )}

      {loading ? (
        <p className="text-center">Loading Opportunities...</p>
      ) : jobs.length === 0 ? (
        <div className="card text-center text-muted">No jobs posted yet.</div>
      ) : (
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
          {jobs.map(job => (
            <div className="card flex-col justify-between" key={job._id}>
              <div>
                <div className="flex justify-between items-start mb-2">
                  <h4 style={{ margin: 0, color: 'var(--primary-dark)' }}>{job.title}</h4>
                  <span className="badge">{job.jobType}</span>
                </div>
                
                <div className="flex flex-col gap-1 mb-3" style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                  <div className="flex items-center gap-2"><Building size={14}/> {job.company}</div>
                  <div className="flex items-center gap-2"><MapPin size={14}/> {job.location || 'Remote'}</div>
                  <div className="flex items-center gap-2"><DollarSign size={14}/> {job.salary || 'Not disclosed'}</div>
                </div>
                
                <p style={{ fontSize: '0.9rem', marginBottom: '1.5rem', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {job.description}
                </p>
              </div>
              
              <div className="flex justify-between items-center" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  <Calendar size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }}/>
                  Posted {new Date(job.createdAt).toLocaleDateString()}
                </span>
                {(() => {
                  if (!job.isActive) return <button className="btn btn-outline" disabled style={{ padding: '0.3rem 0.8rem' }}>Closed</button>;
                  const hasApplied = job.applicants?.some(a => a.user === user?._id || a.user?._id === user?._id);
                  if (hasApplied) return <button className="btn btn-outline" disabled style={{ padding: '0.3rem 0.8rem', borderColor: 'var(--primary)', color: 'var(--primary)' }}>Applied</button>;
                  if (job.postedBy?._id === user?._id || job.postedBy === user?._id) return <button className="btn btn-outline" disabled style={{ padding: '0.3rem 0.8rem' }}>Your Job</button>;
                  return <button className="btn btn-primary" onClick={() => handleApply(job._id)} style={{ padding: '0.3rem 0.8rem' }}>Apply</button>;
                })()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Jobs;
