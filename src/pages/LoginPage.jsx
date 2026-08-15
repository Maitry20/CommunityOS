import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function LoginPage({ 
  users, 
  setProfile, 
  setSelectedRole, 
  setPastHelp, 
  members, 
  setMembers,
  loginMode,
  setLoginMode
}) {
  const navigate = useNavigate();
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [signInError, setSignInError] = useState('');

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    navigate('/setup');
  };

  const handleSignInSubmit = (e) => {
    e.preventDefault();
    setSignInError('');

    const matchedUser = users.find(u => u.email.toLowerCase() === signInEmail.trim().toLowerCase());
    if (!matchedUser) {
      setSignInError('Account with this email not found.');
      return;
    }

    if (matchedUser.password !== signInPassword) {
      setSignInError('Incorrect password.');
      return;
    }

    // Success! Log them in
    setSelectedRole(matchedUser.role);
    setProfile(matchedUser);
    if (matchedUser.role === 'pro') {
      setPastHelp(matchedUser.pastHelp || []);
      // Ensure they are in the active members list for matching
      if (!members.some(m => m.name === matchedUser.name)) {
        const skillsArray = matchedUser.skills || [];
        const expLine = matchedUser.pastHelp && matchedUser.pastHelp[0]
          ? `Solved a similar ${matchedUser.pastHelp[0].topic} problem ${matchedUser.pastHelp[0].when}`
          : 'Expert in engineering fields';
        
        const newPro = {
          id: `m-custom-${Date.now()}`,
          name: matchedUser.name,
          role: matchedUser.roleTitle || 'Expert Pro',
          skills: skillsArray,
          stuck: matchedUser.focus,
          experienceLine: expLine,
          bio: matchedUser.focus,
          roles: ['helping'],
          pic: matchedUser.pic,
          linkedin: matchedUser.linkedin
        };
        setMembers(prev => [newPro, ...prev]);
      }
    }

    setSignInEmail('');
    setSignInPassword('');
    navigate('/dashboard');
  };

  return (
    <div className="text-center py-12 max-w-3xl mx-auto">
      {loginMode === 'register' ? (
        <div className="animate-fade-in">
          <h1 className="text-2xl font-normal text-white mb-2">Which are you here as?</h1>
          <p className="text-sm text-neutral-400 mb-10">Select your workspace role to create a profile.</p>
          
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {/* Learner Card */}
            <button 
              onClick={() => handleRoleSelect('learner')}
              className="bg-[#161b24] border border-[#353f4d] hover:border-[#ff9900] p-8 text-left transition-all group flex flex-col justify-between h-48 focus:outline-none cursor-pointer"
            >
              <div>
                <span className="font-mono text-xs tracking-wider text-[#0972d3] block mb-3 uppercase font-bold">Role 01</span>
                <h3 className="text-lg font-medium text-white mb-2 group-hover:text-[#ff9900] transition-colors">Learner</h3>
                <p className="text-sm text-neutral-400 font-normal leading-relaxed">Learn new topics and ask questions directly to the community experts.</p>
              </div>
            </button>

            {/* Pro Card */}
            <button 
              onClick={() => handleRoleSelect('pro')}
              className="bg-[#161b24] border border-[#353f4d] hover:border-[#ff9900] p-8 text-left transition-all group flex flex-col justify-between h-48 focus:outline-none cursor-pointer"
            >
              <div>
                <span className="font-mono text-xs tracking-wider text-[#0972d3] block mb-3 uppercase font-bold">Role 02</span>
                <h3 className="text-lg font-medium text-white mb-2 group-hover:text-[#ff9900] transition-colors">Pro</h3>
                <p className="text-sm text-neutral-400 font-normal leading-relaxed">Offer your expertise and guide members matching your skillset.</p>
              </div>
            </button>

            {/* Organizer Card */}
            <button 
              onClick={() => handleRoleSelect('organizer')}
              className="bg-[#161b24] border border-[#353f4d] hover:border-[#ff9900] p-8 text-left transition-all group flex flex-col justify-between h-48 focus:outline-none cursor-pointer"
            >
              <div>
                <span className="font-mono text-xs tracking-wider text-[#0972d3] block mb-3 uppercase font-bold">Role 03</span>
                <h3 className="text-lg font-medium text-white mb-2 group-hover:text-[#ff9900] transition-colors">Organizer</h3>
                <p className="text-sm text-neutral-400 font-normal leading-relaxed">Analyze capability gaps, track event engagement, and run operations.</p>
              </div>
            </button>
          </div>

          <button
            onClick={() => { setLoginMode('signin'); setSignInError(''); }}
            className="text-xs font-mono text-[#ff9900] hover:text-[#ec7211] hover:underline focus:outline-none uppercase tracking-wider bg-transparent border-0 cursor-pointer"
          >
            Already have a profile? Sign In
          </button>
        </div>
      ) : (
        <div className="max-w-md mx-auto bg-[#161b24] border border-[#353f4d] p-8 text-left animate-fade-in">
          <h2 className="text-lg font-normal text-white mb-6 border-b border-[#353f4d] pb-4">
            Sign In to CommunityOS Console
          </h2>
          <form onSubmit={handleSignInSubmit} className="space-y-5">
            {signInError && (
              <div className="bg-[#ec7211]/10 border border-[#ec7211]/30 text-[#ec7211] text-xs px-3 py-2 font-mono">
                {signInError}
              </div>
            )}
            <div>
              <label className="block text-xs font-mono text-neutral-400 uppercase tracking-wider mb-2">Email Address</label>
              <input 
                type="email" 
                required
                placeholder="e.g. alex@example.com"
                value={signInEmail}
                onChange={(e) => setSignInEmail(e.target.value)}
                className="w-full bg-[#0f141c] border border-[#353f4d] px-3 py-2 text-sm text-white focus:outline-none focus:border-[#ff9900] rounded-sm font-sans"
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-neutral-400 uppercase tracking-wider mb-2">Password</label>
              <input 
                type="password" 
                required
                placeholder="••••••••"
                value={signInPassword}
                onChange={(e) => setSignInPassword(e.target.value)}
                className="w-full bg-[#0f141c] border border-[#353f4d] px-3 py-2 text-sm text-white focus:outline-none focus:border-[#ff9900] rounded-sm font-sans"
              />
            </div>

            <button 
              type="submit" 
              className="w-full bg-[#ff9900] hover:bg-[#ec7211] text-white py-2.5 text-sm font-mono uppercase tracking-wider transition-colors focus:outline-none cursor-pointer rounded-sm font-bold"
            >
              Sign In
            </button>
          </form>

          <div className="mt-6 text-center border-t border-[#353f4d] pt-4">
            <button
              onClick={() => setLoginMode('register')}
              className="text-xs font-mono text-[#ff9900] hover:text-[#ec7211] hover:underline focus:outline-none uppercase tracking-wider bg-transparent border-0 cursor-pointer"
            >
              Need a profile? Create Account
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
