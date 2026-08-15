import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { seedMembers } from './mockData';
import LoginPage from './pages/LoginPage';
import SetupPage from './pages/SetupPage';
import DashboardPage from './pages/DashboardPage';

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();

  // Navigation / Auth State
  const [selectedRole, setSelectedRole] = useState(null); // 'learner' | 'pro' | 'organizer'

  // User Profile State
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    roleTitle: '',
    skills: '',
    focus: '',
    community: '',
    openToMatch: true,
    pic: null,
    linkedin: '',
    password: ''
  });

  const [pastHelp, setPastHelp] = useState([
    { id: 1, topic: 'vector db latency', when: '2 months ago' },
    { id: 2, topic: 'production-evaluation pipeline', when: '5 months ago' }
  ]);
  const [newHelpTopic, setNewHelpTopic] = useState('');
  const [newHelpWhen, setNewHelpWhen] = useState('');
  const [showProfileDrawer, setShowProfileDrawer] = useState(false);

  // Stored users database (localStorage backed)
  const [users, setUsers] = useState(() => {
    const saved = localStorage.getItem('community_os_users');
    return saved ? JSON.parse(saved) : [];
  });

  // Login/Sign In Flow States
  const [loginMode, setLoginMode] = useState('register'); // 'register' | 'signin'

  // Database State (in-memory)
  const [members, setMembers] = useState(seedMembers);
  const [myMatches, setMyMatches] = useState([
    { id: 'm-3', name: 'Devon Chen', role: 'Database Engineer', experienceLine: 'Solved a similar PGVector latency problem 5 months ago' }
  ]);

  // Pro state - matching queue (mock requests)
  const [proMatches, setProMatches] = useState([
    { id: 'req-1', name: 'Aris Thorne', question: 'How do I handle token context size overflow in Llama 3?', status: 'pending' },
    { id: 'req-2', name: 'Mia Lin', question: 'Best practices for chunking hierarchical PDFs cleanly.', status: 'pending' }
  ]);

  // Organizer state
  const [events, setEvents] = useState([
    { id: 'e-1', name: 'GenAI Builders Meetup #2', attendance: 120, questions: 42, topTopic: 'RAG Triad Guardrails', photo: null },
    { id: 'e-2', name: 'Local Inference Workshop', attendance: 85, questions: 29, topTopic: 'vLLM Benchmarks', photo: null },
    { id: 'e-3', name: 'Agentic Design Patterns Sandbox', attendance: 150, questions: 68, topTopic: 'Multi-Agent Routing', photo: null }
  ]);

  // Shared Bulletin Board contributions
  const [sharedContributions, setSharedContributions] = useState(() => {
    const saved = localStorage.getItem('community_os_shared_contributions');
    if (saved) return JSON.parse(saved);
    return [
      {
        id: 'c-1',
        title: 'Guide to AWS Bedrock Latency Optimization',
        type: 'Article/Blog',
        url: 'https://medium.com/aws-builders/bedrock-latency-optimization',
        summary: 'Practical tips on reducing time-to-first-token using streaming and region selector configurations in AWS Bedrock.',
        author: 'Elena Rostova',
        authorRole: 'Staff AI Engineer',
        platform: 'Medium',
        tags: ['bedrock', 'latency', 'genai'],
        date: '1 day ago'
      },
      {
        id: 'c-2',
        title: 'How I scaled PGVector to 50M vectors on RDS Postgres',
        type: 'External Link',
        url: 'https://linkedin.com/posts/devon-chen-db-pgvector',
        summary: 'A detailed breakdown of indexing strategy, memory adjustments, and RDS storage choices to optimize PGVector writes.',
        author: 'Devon Chen',
        authorRole: 'Database Engineer',
        platform: 'LinkedIn',
        tags: ['postgres', 'pgvector', 'rds'],
        date: '3 days ago'
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem('community_os_shared_contributions', JSON.stringify(sharedContributions));
  }, [sharedContributions]);

  // Dynamic community links state
  const [communityLinks, setCommunityLinks] = useState(() => {
    const saved = localStorage.getItem('community_os_links');
    if (saved) return JSON.parse(saved);
    return [
      { id: 'l-1', name: 'Discord Server', type: 'Discord', url: 'https://discord.gg/aws-community', description: 'Join daily Q&A, chat in #rag-prod or #llm-ops, and network with experts.' },
      { id: 'l-2', name: 'AWS User Groups', type: 'Meetup', url: 'https://meetup.com/aws-user-group-builders', description: 'RSVP to local face-to-face meetups, workshops, and multi-agent sandboxes.' },
      { id: 'l-3', name: 'GitHub Repositories', type: 'GitHub', url: 'https://github.com/aws-community-os', description: 'Access open-source templates, code gists, evaluation setups, and tools.' },
      { id: 'l-4', name: 'Slack Workspace', type: 'Slack', url: 'https://slack.com/aws-builders-workspace', description: 'Directly message organizers, schedule pairing sessions, and share updates.' }
    ];
  });

  useEffect(() => {
    localStorage.setItem('community_os_links', JSON.stringify(communityLinks));
  }, [communityLinks]);

  // Redirect if manually browsing to sub-routes without a role
  useEffect(() => {
    const path = location.pathname;
    if ((path === '/setup' || path === '/dashboard') && !selectedRole) {
      navigate('/');
    }
  }, [selectedRole, location.pathname, navigate]);

  const handleLogout = () => {
    setSelectedRole(null);
    setProfile({
      name: '',
      email: '',
      roleTitle: '',
      skills: '',
      focus: '',
      community: '',
      openToMatch: true,
      pic: null,
      linkedin: '',
      password: ''
    });
    setShowProfileDrawer(false);
    navigate('/');
  };

  const handleAddHelpItem = (e) => {
    e.preventDefault();
    if (!newHelpTopic.trim() || !newHelpWhen.trim()) return;
    const newItem = {
      id: Date.now(),
      topic: newHelpTopic.trim(),
      when: newHelpWhen.trim()
    };
    const updatedHelp = [newItem, ...pastHelp];
    setPastHelp(updatedHelp);
    
    // Update experienceLine in members list for the current Pro
    const expLine = `Solved a similar ${newItem.topic} problem ${newItem.when}`;
    setMembers(prev => prev.map(m => {
      if (m.name === profile.name) {
        return { ...m, experienceLine: expLine };
      }
      return m;
    }));
    
    setNewHelpTopic('');
    setNewHelpWhen('');
  };

  const handleRemoveHelpItem = (id) => {
    const updatedHelp = pastHelp.filter(item => item.id !== id);
    setPastHelp(updatedHelp);
    
    const nextItem = updatedHelp[0];
    const expLine = nextItem 
      ? `Solved a similar ${nextItem.topic} problem ${nextItem.when}` 
      : 'Expert in engineering fields';
      
    setMembers(prev => prev.map(m => {
      if (m.name === profile.name) {
        return { ...m, experienceLine: expLine };
      }
      return m;
    }));
  };

  return (
    <div className="min-h-screen bg-[#0f141c] text-[#eaeded] font-sans antialiased">
      {/* Top Navigation - AWS Console Style */}
      <header className="border-b border-[#353f4d] bg-[#1c2733] px-4 py-2 flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <div className="flex flex-col items-start leading-none">
            <div className="flex items-baseline space-x-1.5 cursor-pointer">
              <span className="font-extrabold text-lg text-[#ff9900] tracking-tight">aws</span>
              <span className="font-semibold text-sm text-white tracking-wide">CommunityOS</span>
            </div>
            <div className="w-8 h-1 bg-[#ff9900] rounded-full mt-0.5 ml-0.5"></div>
          </div>
        </div>

        {location.pathname !== '/' ? (
          <div className="flex items-center space-x-4">
            {/* Region Selector */}
            <div className="flex items-center space-x-1.5 text-xs text-neutral-300 font-mono bg-[#2b3947] border border-[#415164] px-2.5 py-1 rounded-sm cursor-pointer hover:border-[#ff9900]">
              <span className="w-1.5 h-1.5 bg-[#0972d3] rounded-full animate-pulse"></span>
              <span>N. Virginia</span>
              <span className="text-[9px] text-[#ff9900] font-bold">us-east-1</span>
            </div>

            <span className="text-xs font-mono bg-[#2b3947] px-2.5 py-1 text-neutral-300 border border-[#415164] uppercase">
              Role: {selectedRole}
            </span>
            <button 
              onClick={handleLogout}
              className="text-xs hover:text-white font-mono uppercase tracking-wider text-neutral-400 border border-transparent hover:border-[#353f4d] px-3 py-1 transition-all focus:outline-none cursor-pointer"
            >
              Sign Out
            </button>
            <button 
              onClick={() => setShowProfileDrawer(true)}
              title="View Profile"
              className="w-8 h-8 rounded-none border border-[#415164] bg-[#2b3947] flex items-center justify-center overflow-hidden hover:border-[#ff9900] focus:outline-none shrink-0 cursor-pointer"
            >
              {profile.pic ? (
                <img src={profile.pic} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="text-xs font-mono text-neutral-300">{profile.name ? profile.name.charAt(0).toUpperCase() : 'P'}</span>
              )}
            </button>
          </div>
        ) : (
          <div className="flex items-center space-x-2 text-xs font-mono text-neutral-400">
            <span>Global</span>
            <span>•</span>
            <span className="text-[#ff9900]">Not Signed In</span>
          </div>
        )}
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <Routes>
          <Route 
            path="/" 
            element={
              <LoginPage 
                users={users}
                setProfile={setProfile}
                setSelectedRole={setSelectedRole}
                setPastHelp={setPastHelp}
                members={members}
                setMembers={setMembers}
                loginMode={loginMode}
                setLoginMode={setLoginMode}
              />
            } 
          />
          <Route 
            path="/setup" 
            element={
              <SetupPage 
                profile={profile}
                setProfile={setProfile}
                selectedRole={selectedRole}
                setSelectedRole={setSelectedRole}
                users={users}
                setUsers={setUsers}
                setMembers={setMembers}
                setPastHelp={setPastHelp}
                setLoginMode={setLoginMode}
              />
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              <DashboardPage 
                profile={profile}
                selectedRole={selectedRole}
                members={members}
                myMatches={myMatches}
                setMyMatches={setMyMatches}
                proMatches={proMatches}
                setProMatches={setProMatches}
                events={events}
                setEvents={setEvents}
                sharedContributions={sharedContributions}
                setSharedContributions={setSharedContributions}
                communityLinks={communityLinks}
                setCommunityLinks={setCommunityLinks}
              />
            } 
          />
        </Routes>
      </main>

      {/* Profile Drawer Overlay */}
      {showProfileDrawer && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div 
            onClick={() => setShowProfileDrawer(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
          />
          {/* Drawer container */}
          <div className="relative w-full max-w-md bg-[#161b24] border-l border-[#353f4d] h-full p-8 overflow-y-auto flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center border-b border-[#353f4d] pb-4 mb-6">
                <h3 className="text-base font-mono uppercase tracking-wider text-white">My Profile</h3>
                <button 
                  onClick={() => setShowProfileDrawer(false)}
                  className="text-neutral-400 hover:text-white font-mono text-xs uppercase focus:outline-none cursor-pointer"
                >
                  Close
                </button>
              </div>

              {selectedRole === 'pro' && (
                <div className="mb-4 text-[11px] font-mono text-neutral-400 bg-[#0f141c] border border-[#353f4d] p-2 flex justify-between rounded-sm">
                  <span>Helped <span className="text-[#0972d3] font-bold">4</span> learners</span>
                  <span className="text-neutral-600">•</span>
                  <span><span className="text-[#0972d3] font-bold">12</span> skill matches</span>
                </div>
              )}

              <form onSubmit={(e) => { e.preventDefault(); setShowProfileDrawer(false); }} className="space-y-4">
                {/* Photo Preview & Edit */}
                <div className="flex items-center space-x-4 mb-4 pb-4 border-b border-[#353f4d]">
                  <div className="w-12 h-12 bg-[#0f141c] border border-[#353f4d] flex items-center justify-center overflow-hidden shrink-0">
                    {profile.pic ? (
                      <img src={profile.pic} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-neutral-600 font-mono text-xs">PIC</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <label className="block text-[10px] font-mono text-neutral-400 uppercase tracking-wider mb-1">Profile Photo</label>
                    <label className="cursor-pointer inline-block border border-[#353f4d] hover:border-[#ff9900] px-3 py-1 font-mono text-xs text-neutral-300 transition-colors rounded-sm">
                      Upload Photo
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            setProfile(prev => ({ ...prev, pic: URL.createObjectURL(file) }));
                          }
                        }}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-neutral-400 uppercase mb-1">Name</label>
                  <input 
                    type="text" 
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className="w-full bg-[#0f141c] border border-[#353f4d] px-3 py-2 text-xs text-white focus:outline-none focus:border-[#ff9900] rounded-sm font-sans"
                  />
                </div>

                {selectedRole === 'pro' && (
                  <>
                    <div>
                      <label className="block text-[10px] font-mono text-neutral-400 uppercase mb-1">Role / Title</label>
                      <input 
                        type="text" 
                        value={profile.roleTitle}
                        onChange={(e) => setProfile({ ...profile, roleTitle: e.target.value })}
                        className="w-full bg-[#0f141c] border border-[#353f4d] px-3 py-2 text-xs text-white focus:outline-none focus:border-[#ff9900] rounded-sm font-sans"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono text-neutral-400 uppercase mb-1">Skills (tag list)</label>
                      <input 
                        type="text" 
                        value={profile.skills}
                        onChange={(e) => setProfile({ ...profile, skills: e.target.value })}
                        className="w-full bg-[#0f141c] border border-[#353f4d] px-3 py-2 text-xs text-white focus:outline-none focus:border-[#ff9900] rounded-sm font-sans"
                      />
                      {profile.skills && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {profile.skills.split(',').map(s => s.trim()).filter(Boolean).map((skill, idx) => (
                            <span key={idx} className="font-mono text-[9px] bg-[#0f141c] text-neutral-300 border border-[#353f4d] px-2 py-0.5 uppercase tracking-wide">
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono text-neutral-400 uppercase mb-1">What I'm focused on</label>
                      <textarea 
                        value={profile.focus}
                        rows={2}
                        onChange={(e) => setProfile({ ...profile, focus: e.target.value })}
                        className="w-full bg-[#0f141c] border border-[#353f4d] px-3 py-2 text-xs text-white focus:outline-none focus:border-[#ff9900] rounded-sm resize-none font-sans"
                      />
                    </div>

                    {/* Things I've helped with before */}
                    <div className="border-t border-[#353f4d] pt-4 space-y-3">
                      <label className="block text-[10px] font-mono text-neutral-400 uppercase">
                        Things I've helped with before
                      </label>
                      
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          placeholder="e.g. Vector db latencies"
                          value={newHelpTopic}
                          onChange={(e) => setNewHelpTopic(e.target.value)}
                          className="flex-1 bg-[#0f141c] border border-[#353f4d] px-2 py-1.5 text-xs text-white focus:outline-none focus:border-[#ff9900] rounded-sm font-sans"
                        />
                        <input 
                          type="text" 
                          placeholder="e.g. 2 months ago"
                          value={newHelpWhen}
                          onChange={(e) => setNewHelpWhen(e.target.value)}
                          className="w-1/3 bg-[#0f141c] border border-[#353f4d] px-2 py-1.5 text-xs text-white focus:outline-none focus:border-[#ff9900] rounded-sm font-sans"
                        />
                        <button
                          type="button"
                          onClick={handleAddHelpItem}
                          className="bg-neutral-800 hover:bg-neutral-700 text-[10px] font-mono uppercase px-3 py-1.5 text-white border border-[#353f4d] focus:outline-none rounded-sm"
                        >
                          Add
                        </button>
                      </div>

                      {pastHelp.length > 0 ? (
                        <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                          {pastHelp.map(item => (
                            <div key={item.id} className="flex justify-between items-center bg-[#0f141c] border border-[#353f4d] p-2 text-xs rounded-sm">
                              <div>
                                <span className="text-white font-medium">{item.topic}</span>
                                <span className="text-neutral-500 text-[10px] ml-2 font-mono">({item.when})</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRemoveHelpItem(item.id)}
                                className="text-neutral-500 hover:text-red-400 font-mono text-[9px] uppercase focus:outline-none cursor-pointer"
                              >
                                Remove
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[10px] text-neutral-500 italic">No past help items recorded yet.</p>
                      )}
                    </div>

                    {/* Matching Toggle */}
                    <div className="flex items-center justify-between border-t border-[#353f4d] pt-4">
                      <span className="text-xs text-neutral-300">Open to being matched with learners</span>
                      <button
                        type="button"
                        onClick={() => setProfile(prev => ({ ...prev, openToMatch: !prev.openToMatch }))}
                        className={`w-10 h-5 flex items-center transition-colors px-0.5 border focus:outline-none cursor-pointer rounded-sm ${
                          profile.openToMatch ? 'bg-[#ff9900] border-[#ff9900]' : 'bg-neutral-800 border-neutral-700'
                        }`}
                      >
                        <div className={`w-4 h-4 bg-black transition-transform ${
                          profile.openToMatch ? 'transform translate-x-5' : ''
                        }`} />
                      </button>
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-[10px] font-mono text-neutral-400 uppercase mb-1">LinkedIn URL</label>
                  <input 
                    type="url" 
                    placeholder="https://linkedin.com/in/username"
                    value={profile.linkedin}
                    onChange={(e) => setProfile({ ...profile, linkedin: e.target.value })}
                    className="w-full bg-[#0f141c] border border-[#353f4d] px-3 py-2 text-xs text-white focus:outline-none focus:border-[#ff9900] rounded-sm font-sans"
                  />
                </div>

                {selectedRole === 'organizer' && (
                  <div>
                    <label className="block text-[10px] font-mono text-neutral-400 uppercase mb-1">Community Name</label>
                    <input 
                      type="text" 
                      value={profile.community}
                      onChange={(e) => setProfile({ ...profile, community: e.target.value })}
                      className="w-full bg-[#0f141c] border border-[#353f4d] px-3 py-2 text-xs text-white focus:outline-none focus:border-[#ff9900] rounded-sm font-sans"
                    />
                  </div>
                )}

                <button 
                  type="submit" 
                  className="w-full bg-[#ff9900] hover:bg-[#ec7211] text-white py-2.5 text-sm font-mono uppercase tracking-wider transition-colors focus:outline-none mt-4 cursor-pointer rounded-sm font-bold"
                >
                  Save Profile
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
