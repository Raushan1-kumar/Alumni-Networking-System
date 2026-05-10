import { useState, useEffect } from 'react';
import axios from 'axios';
import { Send, ThumbsUp, MessageCircle, Bookmark, Share2, TrendingUp, Users, Award, Bell, Image, Smile } from 'lucide-react';

const Home = ({ user }) => {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [loading, setLoading] = useState(true);
  const [postTag, setPostTag] = useState('');

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/posts', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPosts(res.data);
    } catch (error) {
      console.error('Failed to fetch posts', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    if (!newPost.trim()) return;
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('http://localhost:5000/api/posts',
        { content: newPost, tags: postTag ? [postTag] : [] },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPosts([res.data.post, ...posts]);
      setNewPost('');
      setPostTag('');
    } catch (error) {
      fetchPosts();
    }
  };

  const handleDummyLike = (postId) => {
    setPosts(posts.map(post => {
      if (post._id === postId) {
        const isLiked = post.dummyLiked;
        return { ...post, dummyLiked: !isLiked, likes: isLiked ? (post.likes || []).slice(0, -1) : [...(post.likes || []), 'dummy'] };
      }
      return post;
    }));
  };

  const toggleCommentSection = (postId) => {
    setPosts(posts.map(post => post._id === postId ? { ...post, showComments: !post.showComments } : post));
  };

  const handleDummyComment = (postId, e) => {
    e.preventDefault();
    const text = e.target.elements.commentText.value;
    if (!text.trim()) return;
    setPosts(posts.map(post => {
      if (post._id === postId) {
        return {
          ...post,
          comments: [...(post.comments || []), {
            _id: Math.random().toString(),
            text,
            user: { name: user?.name || 'You' },
            createdAt: new Date().toISOString()
          }]
        };
      }
      return post;
    }));
    e.target.reset();
  };

  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  const trendingTags = ['#CareerAdvice', '#Reunion2025', '#TechTalk', '#Startups', '#Alumni', '#Internship'];
  const quickStats = [
    { label: 'Alumni Network', value: '2,400+', icon: Users, color: '#2e7d32' },
    { label: 'Jobs Posted', value: '340+', icon: Award, color: '#1565c0' },
    { label: 'Events Hosted', value: '80+', icon: TrendingUp, color: '#e65100' },
  ];

  return (
    <div style={{ backgroundColor: 'var(--background)', minHeight: '100vh', paddingBottom: '3rem' }}>
      <div className="container" style={{ paddingTop: '2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr 260px', gap: '1.5rem', alignItems: 'start' }}>

          {/* ── LEFT SIDEBAR ── */}
          <aside>
            {/* Profile Card */}
            <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: '1rem' }}>
              <div style={{
                height: '70px',
                background: 'linear-gradient(135deg, var(--primary) 0%, #1b5e20 100%)',
              }} />
              <div style={{ padding: '0 1.25rem 1.25rem', textAlign: 'center', marginTop: '-30px' }}>
                <div style={{
                  width: '60px', height: '60px', borderRadius: '50%',
                  backgroundColor: 'white', border: '3px solid white',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.5rem', color: 'var(--primary)', fontWeight: 'bold',
                  margin: '0 auto 0.75rem', boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                }}>
                  {user?.name?.charAt(0)}
                </div>
                <h4 style={{ margin: '0 0 0.25rem', fontSize: '1rem' }}>{user?.name}</h4>
                <p style={{ margin: '0 0 0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {user?.currentRole || 'Alumni Member'}
                </p>
                <span className="badge" style={{ fontSize: '0.75rem' }}>
                  {user?.department || 'Engineering'}
                </span>
              </div>
              <div style={{ borderTop: '1px solid var(--border-color)', padding: '0.75rem 1.25rem' }}>
                <div className="flex justify-between items-center" style={{ fontSize: '0.85rem' }}>
                  <span className="text-muted">Connections</span>
                  <strong style={{ color: 'var(--primary)' }}>500+</strong>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="card" style={{ marginBottom: '1rem' }}>
              <h5 style={{ margin: '0 0 1rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>Platform Stats</h5>
              {quickStats.map((stat, i) => (
                <div key={i} className="flex items-center gap-3" style={{ marginBottom: i < quickStats.length - 1 ? '0.75rem' : 0 }}>
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '8px',
                    backgroundColor: stat.color + '20',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                  }}>
                    <stat.icon size={18} style={{ color: stat.color }} />
                  </div>
                  <div>
                    <div style={{ fontWeight: '700', fontSize: '1rem', lineHeight: 1 }}>{stat.value}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Links */}
            <div className="card">
              <h5 style={{ margin: '0 0 0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>Quick Links</h5>
              {[
                { label: '🎓 Alumni Directory', href: '/directory' },
                { label: '💼 Job Portal', href: '/jobs' },
                { label: '📅 Upcoming Events', href: '/events' },
                { label: '🌟 Success Stories', href: '/stories' },
                { label: '💚 Donate to GEC', href: '/donations' },
              ].map((link, i) => (
                <a key={i} href={link.href} style={{
                  display: 'block', padding: '0.4rem 0', fontSize: '0.9rem',
                  color: 'var(--text-primary)', textDecoration: 'none', borderBottom: i < 4 ? '1px solid var(--border-color)' : 'none',
                  transition: 'color 0.2s'
                }}
                  onMouseEnter={e => e.target.style.color = 'var(--primary)'}
                  onMouseLeave={e => e.target.style.color = 'var(--text-primary)'}
                >
                  {link.label}
                </a>
              ))}
            </div>
          </aside>

          {/* ── MAIN FEED ── */}
          <main>
            {/* Create Post Box */}
            <div className="card" style={{ marginBottom: '1.5rem' }}>
              <div className="flex items-center gap-3 mb-3">
                <div style={{
                  width: '42px', height: '42px', borderRadius: '50%', flexShrink: 0,
                  backgroundColor: 'var(--primary-light)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 'bold', color: 'var(--primary)', fontSize: '1.1rem'
                }}>
                  {user?.name?.charAt(0)}
                </div>
                <form onSubmit={handlePostSubmit} style={{ flex: 1 }}>
                  <textarea
                    className="form-control"
                    rows="3"
                    placeholder={`What's on your mind, ${user?.name?.split(' ')[0] || 'Alumni'}?`}
                    value={newPost}
                    onChange={(e) => setNewPost(e.target.value)}
                    style={{ resize: 'none', marginBottom: '0.75rem', borderRadius: '12px' }}
                  />
                  <div className="flex justify-between items-center">
                    <div className="flex gap-2 items-center">
                      <input
                        type="text"
                        placeholder="#tag (optional)"
                        value={postTag}
                        onChange={e => setPostTag(e.target.value.replace(/\s/g, ''))}
                        style={{ padding: '0.3rem 0.6rem', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '0.85rem', width: '130px' }}
                      />
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Image size={14} /> <Smile size={14} />
                      </span>
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={!newPost.trim()} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Send size={16} /> Post
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Posts Feed */}
            {loading ? (
              <div className="card text-center" style={{ padding: '3rem' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⏳</div>
                <p className="text-muted mb-0">Loading your alumni feed...</p>
              </div>
            ) : posts.length === 0 ? (
              <div className="card text-center" style={{ padding: '3rem' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🌱</div>
                <h4>Nothing here yet!</h4>
                <p className="text-muted">Be the first to share an update with the alumni community.</p>
              </div>
            ) : (
              posts.map((post) => (
                <div className="card" key={post._id} style={{ marginBottom: '1.25rem', padding: '1.25rem' }}>
                  {/* Post Header */}
                  <div className="flex items-center gap-3 mb-3">
                    <div style={{
                      width: '46px', height: '46px', borderRadius: '50%', flexShrink: 0,
                      backgroundColor: 'var(--primary-light)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 'bold', color: 'var(--primary)', fontSize: '1.1rem'
                    }}>
                      {post.author?.name?.charAt(0) || '?'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <h5 style={{ margin: 0, fontSize: '0.95rem' }}>{post.author?.name || 'Unknown User'}</h5>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        {post.author?.currentRole || 'Alumni'} • {timeAgo(post.createdAt)}
                      </span>
                    </div>
                    <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px' }}>
                      <Bookmark size={17} />
                    </button>
                  </div>

                  {/* Post Content */}
                  <p style={{ whiteSpace: 'pre-line', lineHeight: '1.6', marginBottom: '0.75rem', fontSize: '0.95rem' }}>
                    {post.content}
                  </p>

                  {/* Tags */}
                  {post.tags?.length > 0 && (
                    <div className="flex gap-2 mb-3" style={{ flexWrap: 'wrap' }}>
                      {post.tags.map((tag, i) => (
                        <span key={i} style={{
                          fontSize: '0.8rem', padding: '0.2rem 0.6rem',
                          backgroundColor: 'var(--primary-light)', color: 'var(--primary)',
                          borderRadius: '20px', fontWeight: '500'
                        }}>#{tag}</span>
                      ))}
                    </div>
                  )}

                  {post.image && (
                    <img src={post.image} alt="Post attachment" style={{ width: '100%', borderRadius: '10px', marginBottom: '1rem' }} />
                  )}

                  {/* Engagement Stats */}
                  <div className="flex gap-3" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-color)' }}>
                    <span>❤ {post.likes?.length || 0} likes</span>
                    <span>💬 {post.comments?.length || 0} comments</span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleDummyLike(post._id)}
                      style={{
                        flex: 1, background: 'none', border: 'none', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                        padding: '0.5rem', borderRadius: '8px', fontSize: '0.88rem', fontWeight: '500',
                        color: post.dummyLiked ? 'var(--primary)' : 'var(--text-muted)',
                        backgroundColor: post.dummyLiked ? 'var(--primary-light)' : 'transparent',
                        transition: 'all 0.2s'
                      }}
                    >
                      <ThumbsUp size={17} fill={post.dummyLiked ? 'var(--primary)' : 'none'} /> Like
                    </button>
                    <button
                      onClick={() => toggleCommentSection(post._id)}
                      style={{
                        flex: 1, background: 'none', border: 'none', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                        padding: '0.5rem', borderRadius: '8px', fontSize: '0.88rem', fontWeight: '500',
                        color: 'var(--text-muted)', transition: 'all 0.2s'
                      }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--background)'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <MessageCircle size={17} /> Comment
                    </button>
                    <button
                      style={{
                        flex: 1, background: 'none', border: 'none', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                        padding: '0.5rem', borderRadius: '8px', fontSize: '0.88rem', fontWeight: '500',
                        color: 'var(--text-muted)', transition: 'all 0.2s'
                      }}
                      onClick={() => navigator.clipboard?.writeText(window.location.href)}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--background)'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <Share2 size={17} /> Share
                    </button>
                  </div>

                  {/* Comments Section */}
                  {post.showComments && (
                    <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                      <div className="flex flex-col gap-2 mb-3">
                        {(post.comments || []).map(c => (
                          <div key={c._id} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                            <div style={{
                              width: '30px', height: '30px', borderRadius: '50%', flexShrink: 0,
                              backgroundColor: 'var(--primary-light)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--primary)'
                            }}>
                              {c.user?.name?.charAt(0) || '?'}
                            </div>
                            <div style={{ backgroundColor: 'var(--background)', borderRadius: '10px', padding: '0.5rem 0.75rem', flex: 1 }}>
                              <strong style={{ fontSize: '0.82rem' }}>{c.user?.name || 'User'}</strong>
                              <p style={{ margin: '0.1rem 0 0', fontSize: '0.88rem' }}>{c.text}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      <form onSubmit={(e) => handleDummyComment(post._id, e)} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <div style={{
                          width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
                          backgroundColor: 'var(--primary-light)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontWeight: 'bold', color: 'var(--primary)', fontSize: '0.9rem'
                        }}>
                          {user?.name?.charAt(0)}
                        </div>
                        <input type="text" name="commentText" className="form-control" placeholder="Write a comment..."
                          style={{ borderRadius: '20px', padding: '0.4rem 0.8rem', fontSize: '0.88rem' }} />
                        <button type="submit" className="btn btn-primary" style={{ padding: '0.4rem 0.8rem', borderRadius: '20px', whiteSpace: 'nowrap' }}>Post</button>
                      </form>
                    </div>
                  )}
                </div>
              ))
            )}
          </main>

          {/* ── RIGHT SIDEBAR ── */}
          <aside>
            {/* Welcome Banner */}
            <div style={{
              background: 'linear-gradient(135deg, var(--primary) 0%, #1b5e20 100%)',
              borderRadius: '12px', padding: '1.25rem', color: 'white', marginBottom: '1rem'
            }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>👋</div>
              <h5 style={{ margin: '0 0 0.5rem', color: 'white' }}>Welcome back!</h5>
              <p style={{ margin: 0, fontSize: '0.85rem', opacity: 0.85 ,color: 'white' }}>
                Stay connected with {' '}<strong>2,400+ alumni</strong> from Government Engineering College.
              </p>
            </div>

            {/* Notifications */}
            <div className="card" style={{ marginBottom: '1rem' }}>
              <div className="flex items-center gap-2 mb-3">
                <Bell size={16} style={{ color: 'var(--primary)' }} />
                <h5 style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Reminders</h5>
              </div>
              {[
                { icon: '📅', text: 'Annual Reunion 2025 – Register now!', color: '#6a1b9a' },
                { icon: '💼', text: 'New jobs posted this week', color: '#e65100' },
                { icon: '💚', text: 'Help fund the new library wing', color: '#2e7d32' },
              ].map((n, i) => (
                <div key={i} style={{
                  display: 'flex', gap: '0.6rem', alignItems: 'flex-start',
                  padding: '0.5rem 0', borderBottom: i < 2 ? '1px solid var(--border-color)' : 'none'
                }}>
                  <span style={{ fontSize: '1rem' }}>{n.icon}</span>
                  <span style={{ fontSize: '0.83rem', color: 'var(--text-primary)', lineHeight: 1.4 }}>{n.text}</span>
                </div>
              ))}
            </div>

            {/* Trending Tags */}
            <div className="card" style={{ marginBottom: '1rem' }}>
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp size={16} style={{ color: 'var(--primary)' }} />
                <h5 style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Trending Tags</h5>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {trendingTags.map((tag, i) => (
                  <span key={i} style={{
                    padding: '0.25rem 0.6rem', borderRadius: '20px',
                    backgroundColor: 'var(--primary-light)', color: 'var(--primary)',
                    fontSize: '0.8rem', fontWeight: '500', cursor: 'pointer'
                  }}>{tag}</span>
                ))}
              </div>
            </div>

            {/* College Info footer widget */}
            <div style={{
              background: 'var(--surface)', border: '1px solid var(--border-color)',
              borderRadius: '12px', padding: '1rem', fontSize: '0.82rem', color: 'var(--text-muted)'
            }}>
              <strong style={{ color: 'var(--primary)', fontSize: '0.85rem' }}>GEC Alumni Connect</strong>
              <p style={{ margin: '0.4rem 0 0' }}>
                Official alumni networking platform of Government Engineering College. Connect, grow, and give back.
              </p>
            </div>
          </aside>

        </div>
      </div>
    </div>
  );
};

export default Home;
