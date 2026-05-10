import { Link, useLocation } from 'react-router-dom';
import { LogOut, User as UserIcon, Briefcase, Calendar, Search, Heart, BookOpen, MessageSquare, ClipboardList, Shield } from 'lucide-react';

const Navbar = ({ user, onLogout }) => {
  const location = useLocation();

  if (!user) return null; // Only show navbar if logged in

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <nav className="navbar">
      <div className="container navbar-container">
        <Link to="/" className="navbar-brand">
          <BookOpen />
          <span>Alumni Connect</span>
        </Link>
        <ul className="navbar-nav">
          <li>
            <Link to="/" className={`nav-link flex items-center gap-2 ${isActive('/')}`}>
              <MessageSquare size={18} /> Feed
            </Link>
          </li>
          <li>
            <Link to="/directory" className={`nav-link flex items-center gap-2 ${isActive('/directory')}`}>
              <Search size={18} /> Directory
            </Link>
          </li>
          <li>
            <Link to="/jobs" className={`nav-link flex items-center gap-2 ${isActive('/jobs')}`}>
              <Briefcase size={18} /> Jobs
            </Link>
          </li>
          <li>
            <Link to="/events" className={`nav-link flex items-center gap-2 ${isActive('/events')}`}>
              <Calendar size={18} /> Events
            </Link>
          </li>
          <li>
            <Link to="/stories" className={`nav-link flex items-center gap-2 ${isActive('/stories')}`}>
              <UserIcon size={18} /> Stories
            </Link>
          </li>
          <li>
            <Link to="/donations" className={`nav-link flex items-center gap-2 ${isActive('/donations')}`}>
              <Heart size={18} /> Donate
            </Link>
          </li>
          <li>
            <Link to="/surveys" className={`nav-link flex items-center gap-2 ${isActive('/surveys')}`}>
              <ClipboardList size={18} /> Surveys
            </Link>
          </li>
          {user?.role !== 'admin' && (
            <li>
              <Link to="/profile" className={`nav-link flex items-center gap-2 ${isActive('/profile')}`}>
                <UserIcon size={18} /> My Profile
              </Link>
            </li>
          )}
          {user?.role === 'admin' && (
            <li>
              <Link to="/admin" className={`nav-link flex items-center gap-2 ${isActive('/admin')}`} style={{ color: '#c62828' }}>
                <Shield size={18} /> Admin Panel
              </Link>
            </li>
          )}
          <li>
            <button onClick={onLogout} className="btn btn-outline" style={{ marginLeft: '1rem', padding: '0.4rem 0.8rem' }}>
              <LogOut size={16} /> Logout
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
