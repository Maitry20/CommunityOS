import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ParallaxCard from '../components/ParallaxCard';

export default function SetupPage({ 
  profile, 
  setProfile, 
  selectedRole, 
  setSelectedRole,
  users, 
  setUsers, 
  setMembers, 
  setPastHelp,
  setLoginMode
}) {
  const navigate = useNavigate();
  const [setupPassword, setSetupPassword] = useState('');

  const handleSetupSubmit = (e) => {
    e.preventDefault();
    if (!profile.name.trim() || !profile.email.trim() || !setupPassword.trim()) return;
    
    // Check if email already exists
    if (users.some(u => u.email.toLowerCase() === profile.email.trim().toLowerCase())) {
      alert('A user with this email address already exists. Please sign in instead.');
      return;
    }

    const skillsArray = profile.skills.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
    const defaultPastHelp = selectedRole === 'pro' ? [
      { id: 1, topic: 'vector db latency', when: '2 months ago' },
      { id: 2, topic: 'production-evaluation pipeline', when: '5 months ago' }
    ] : [];

    const newUser = {
      name: profile.name.trim(),
      email: profile.email.trim(),
      password: setupPassword.trim(),
      role: selectedRole,
      roleTitle: profile.roleTitle || (selectedRole === 'pro' ? 'Expert Pro' : selectedRole === 'learner' ? 'Learner' : 'Organizer'),
      skills: skillsArray,
      focus: profile.focus,
      community: profile.community,
      pic: profile.pic,
      linkedin: profile.linkedin,
      openToMatch: profile.openToMatch,
      pastHelp: defaultPastHelp
    };

    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    localStorage.setItem('community_os_users', JSON.stringify(updatedUsers));

    // Add to in-memory member database if Pro
    if (selectedRole === 'pro') {
      const newPro = {
        id: `m-custom-${Date.now()}`,
        name: newUser.name,
        role: newUser.roleTitle,
        skills: skillsArray,
        stuck: newUser.focus,
        experienceLine: defaultPastHelp.length > 0 ? `Solved a similar ${defaultPastHelp[0].topic} problem ${defaultPastHelp[0].when}` : 'Expert in engineering fields',
        bio: newUser.focus,
        roles: ['helping'],
        pic: newUser.pic,
        linkedin: newUser.linkedin
      };
      setMembers(prev => [newPro, ...prev]);
      setPastHelp(defaultPastHelp);
    }
    
    setProfile(newUser);
    setSetupPassword('');
    navigate('/dashboard');
  };

  return (
    <ParallaxCard className="max-w-sm mx-auto bg-[#161b24] border border-[#353f4d] p-4 animate-fade-in rounded-sm">
      <h2 className="text-sm font-normal text-white mb-4 border-b border-[#353f4d] pb-2.5">
        Complete your {selectedRole || 'user'} profile
      </h2>
      <form onSubmit={handleSetupSubmit} className="space-y-3.5">
        {/* Profile Photo Upload */}
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-[#0f141c] border border-[#353f4d] flex items-center justify-center overflow-hidden shrink-0">
            {profile.pic ? (
              <img src={profile.pic} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <span className="text-neutral-600 font-mono text-xs">PIC</span>
            )}
          </div>
          <div className="flex-1">
            <label className="block text-[10px] font-mono text-neutral-400 uppercase tracking-wider mb-1">Profile Photo</label>
            <label className="cursor-pointer inline-block border border-[#353f4d] hover:border-[#ff9900] px-3 py-1 font-mono text-xs text-neutral-300 transition-colors">
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
          <label className="block text-xs font-mono text-neutral-400 uppercase tracking-wider mb-2">Your Name</label>
          <input 
            type="text" 
            required
            placeholder="e.g. Alex Rivera"
            value={profile.name}
            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
            className="w-full bg-[#0f141c] border border-[#353f4d] px-3 py-2 text-sm text-white focus:outline-none focus:border-[#ff9900] rounded-sm font-sans"
          />
        </div>

        <div>
          <label className="block text-xs font-mono text-neutral-400 uppercase tracking-wider mb-2">Email Address</label>
          <input 
            type="email" 
            required
            placeholder="e.g. alex@example.com"
            value={profile.email}
            onChange={(e) => setProfile({ ...profile, email: e.target.value })}
            className="w-full bg-[#0f141c] border border-[#353f4d] px-3 py-2 text-sm text-white focus:outline-none focus:border-[#ff9900] rounded-sm font-sans"
          />
        </div>

        <div>
          <label className="block text-xs font-mono text-neutral-400 uppercase tracking-wider mb-2">Password</label>
          <input 
            type="password" 
            required
            placeholder="Choose a password"
            value={setupPassword}
            onChange={(e) => setSetupPassword(e.target.value)}
            className="w-full bg-[#0f141c] border border-[#353f4d] px-3 py-2 text-sm text-white focus:outline-none focus:border-[#ff9900] rounded-sm font-sans"
          />
        </div>

        {selectedRole === 'pro' && (
          <>
            <div>
              <label className="block text-xs font-mono text-neutral-400 uppercase tracking-wider mb-2">Role / Title</label>
              <input 
                type="text" 
                placeholder="e.g. Staff MLOps Engineer"
                value={profile.roleTitle}
                onChange={(e) => setProfile({ ...profile, roleTitle: e.target.value })}
                className="w-full bg-[#0f141c] border border-[#353f4d] px-3 py-2 text-sm text-white focus:outline-none focus:border-[#ff9900] rounded-sm font-sans"
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-neutral-400 uppercase tracking-wider mb-2">Skills (comma separated)</label>
              <input 
                type="text" 
                placeholder="e.g. rag, vector-db, pgvector"
                value={profile.skills}
                onChange={(e) => setProfile({ ...profile, skills: e.target.value })}
                className="w-full bg-[#0f141c] border border-[#353f4d] px-3 py-2 text-sm text-white focus:outline-none focus:border-[#ff9900] rounded-sm font-sans"
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
              <label className="block text-xs font-mono text-neutral-400 uppercase tracking-wider mb-2">What I'm focused on</label>
              <input 
                type="text" 
                placeholder="e.g. Scaling vector queries under high concurrency"
                value={profile.focus}
                onChange={(e) => setProfile({ ...profile, focus: e.target.value })}
                className="w-full bg-[#0f141c] border border-[#353f4d] px-3 py-2 text-sm text-white focus:outline-none focus:border-[#ff9900] rounded-sm font-sans"
              />
            </div>
          </>
        )}

        {/* LinkedIn URL for all roles */}
        <div>
          <label className="block text-xs font-mono text-neutral-400 uppercase tracking-wider mb-2">LinkedIn URL</label>
          <input 
            type="url" 
            placeholder="https://linkedin.com/in/username"
            value={profile.linkedin}
            onChange={(e) => setProfile({ ...profile, linkedin: e.target.value })}
            className="w-full bg-[#0f141c] border border-[#353f4d] px-3 py-2 text-sm text-white focus:outline-none focus:border-[#ff9900] rounded-sm font-sans"
          />
        </div>

        {selectedRole === 'organizer' && (
          <div>
            <label className="block text-xs font-mono text-neutral-400 uppercase tracking-wider mb-2">Community Name</label>
            <input 
              type="text" 
              placeholder="e.g. GenAI Builders Guild"
              value={profile.community}
              onChange={(e) => setProfile({ ...profile, community: e.target.value })}
              className="w-full bg-[#0f141c] border border-[#353f4d] px-3 py-2 text-sm text-white focus:outline-none focus:border-[#ff9900] rounded-sm font-sans"
            />
          </div>
        )}

        <button 
          type="submit" 
          className="w-full bg-[#ff9900] hover:bg-[#ec7211] text-white py-2.5 text-sm font-mono uppercase tracking-wider transition-colors focus:outline-none cursor-pointer rounded-sm font-bold"
        >
          Access Dashboard
        </button>

        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => {
              setLoginMode('signin');
              setSelectedRole(null);
              navigate('/');
            }}
            className="text-xs font-mono text-[#ff9900] hover:text-[#ec7211] hover:underline focus:outline-none uppercase tracking-wider bg-transparent border-0 cursor-pointer"
          >
            Already have a profile? Sign In
          </button>
        </div>
      </form>
    </ParallaxCard>
  );
}
