import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { UserPlus, LogIn } from 'lucide-react';

const Auth = ({ onLogin }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('login');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    course: '',
    enrollmentYear: '',
    studentId: '',
    batchYear: '',
    department: '',
    phone: '',
    currentCompany: '',
    currentRole: '',
    linkedIn: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const resetMessages = () => {
    setError('');
    setSuccess('');
  };

  const handleTab = (tab) => {
    setActiveTab(tab);
    resetMessages();
  };

  const getRegisterPayload = () => {
    if (activeTab === 'student') {
      return {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        course: formData.course,
        enrollmentYear: formData.enrollmentYear ? Number(formData.enrollmentYear) : undefined,
        studentId: formData.studentId,
      };
    }

    return {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      batchYear: formData.batchYear ? Number(formData.batchYear) : undefined,
      department: formData.department,
      phone: formData.phone,
      currentCompany: formData.currentCompany,
      currentRole: formData.currentRole,
      linkedIn: formData.linkedIn,
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    resetMessages();
    setLoading(true);

    try {
      const endpoint =
        activeTab === 'login'
          ? '/api/auth/login'
          : activeTab === 'student'
          ? '/api/auth/register/student'
          : '/api/auth/register/alumni';

      const url = `http://localhost:5000${endpoint}`;
      const payload =
        activeTab === 'login'
          ? { email: formData.email, password: formData.password }
          : getRegisterPayload();

      const res = await axios.post(url, payload);

      if (activeTab === 'login') {
        const user = {
          _id: res.data._id,
          name: res.data.name,
          email: res.data.email,
          role: res.data.role,
        };

        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(user));
        onLogin(user);
        navigate('/');
      } else {
        setSuccess('Registration successful! Please wait for admin approval.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { key: 'login', label: 'Login' },
    { key: 'student', label: 'Student Register' },
    { key: 'alumni', label: 'Alumni Register' },
  ];

  return (
    <div className="container" style={{ display: 'flex', justifyContent: 'center', marginTop: '4rem' }}>
      <div className="card" style={{ width: '100%', maxWidth: '450px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '1.5rem' }}>
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => handleTab(tab.key)}
              style={{
                flex: 1,
                padding: '0.85rem 0.9rem',
                border: 'none',
                borderBottom: activeTab === tab.key ? '3px solid #2563eb' : '3px solid transparent',
                backgroundColor: 'transparent',
                color: activeTab === tab.key ? '#1d4ed8' : '#475569',
                fontWeight: activeTab === tab.key ? 700 : 500,
                cursor: 'pointer',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="text-center mb-4">
          <h2 style={{ marginBottom: '0.5rem' }}>
            {activeTab === 'login'
              ? 'Welcome Back'
              : activeTab === 'student'
              ? 'Student Registration'
              : 'Alumni Registration'}
          </h2>
          <p style={{ margin: 0, color: '#6b7280' }}>
            {activeTab === 'login'
              ? 'Sign in to continue'
              : activeTab === 'student'
              ? 'Create a student account and wait for approval'
              : 'Create an alumni account and wait for approval'}
          </p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {success && (
          <div className="alert" style={{ backgroundColor: '#d4edda', color: '#155724', border: '1px solid #c3e6cb' }}>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {activeTab !== 'login' && (
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                name="name"
                className="form-control"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              name="email"
              className="form-control"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              name="password"
              className="form-control"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          {activeTab === 'student' && (
            <>
              <div className="form-group">
                <label className="form-label">Course</label>
                <input
                  type="text"
                  name="course"
                  className="form-control"
                  value={formData.course}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Enrollment Year</label>
                <input
                  type="number"
                  name="enrollmentYear"
                  className="form-control"
                  value={formData.enrollmentYear}
                  onChange={handleChange}
                  min="2000"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Student ID</label>
                <input
                  type="text"
                  name="studentId"
                  className="form-control"
                  value={formData.studentId}
                  onChange={handleChange}
                  required
                />
              </div>
            </>
          )}

          {activeTab === 'alumni' && (
            <>
              <div className="form-group">
                <label className="form-label">Batch Year</label>
                <input
                  type="number"
                  name="batchYear"
                  className="form-control"
                  value={formData.batchYear}
                  onChange={handleChange}
                  min="1900"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Department</label>
                <input
                  type="text"
                  name="department"
                  className="form-control"
                  value={formData.department}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Phone</label>
                <input
                  type="text"
                  name="phone"
                  className="form-control"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Current Company</label>
                <input
                  type="text"
                  name="currentCompany"
                  className="form-control"
                  value={formData.currentCompany}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Current Role</label>
                <input
                  type="text"
                  name="currentRole"
                  className="form-control"
                  value={formData.currentRole}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">LinkedIn URL</label>
                <input
                  type="url"
                  name="linkedIn"
                  className="form-control"
                  value={formData.linkedIn}
                  onChange={handleChange}
                  required
                />
              </div>
            </>
          )}

          <button type="submit" className="btn btn-primary btn-block mt-2" disabled={loading}>
            {activeTab === 'login' ? <LogIn size={18} /> : <UserPlus size={18} />}
            {loading
              ? 'Processing...'
              : activeTab === 'login'
              ? 'Sign In'
              : activeTab === 'student'
              ? 'Register Student'
              : 'Register Alumni'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Auth;
