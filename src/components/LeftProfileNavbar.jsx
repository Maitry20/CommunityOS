import React, { useState } from 'react';

/**
 * LeftProfileNavbar Component
 * 
 * Collapsible & Hidable left sidebar navigation for managing profile details,
 * role stats, skill tags, and quick actions on the dashboard layout.
 */
export default function LeftProfileNavbar({
  isOpen,
  onToggle,
  profile,
  setProfile,
  selectedRole,
  pastHelp,
  setPastHelp,
  handleLogout
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(profile.name || '');
  const [editRoleTitle, setEditRoleTitle] = useState(profile.roleTitle || '');
  const [editSkills, setEditSkills] = useState(profile.skills || '');
  const [editFocus, setEditFocus] = useState(profile.focus || '');
  const [editLinkedin, setEditLinkedin] = useState(profile.linkedin || '');

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setProfile(prev => ({
      ...prev,
      name: editName,
      roleTitle: editRoleTitle,
      skills: editSkills,
      focus: editFocus,
      linkedin: editLinkedin
    }));
    setIsEditing(false);
  };

  return (
    <>
      {/* Floating Arrow Tab Handle when Navbar is Collapsed */}
      {!isOpen && (
        <button
          onClick={onToggle}
          className="fixed top-20 left-0 z-40 bg-[#161b24] hover:bg-[#2b3947] text-[#ff9900] border border-l-0 border-[#353f4d] hover:border-[#ff9900] px-2.5 py-3 rounded-r-md transition-all shadow-2xl focus:outline-none cursor-pointer flex items-center justify-center font-mono text-sm group animate-fade-in"
          title="Open Profile Navbar"
        >
          <span className="group-hover:translate-x-0.5 transition-transform font-bold">▶</span>
        </button>
      )}

      {/* Profile Navbar Sidebar Panel */}
      <aside 
        className={`bg-[#161b24] border-r border-[#353f4d] flex flex-col justify-between transition-all duration-300 ease-in-out select-none relative z-30 shrink-0 ${
          isOpen ? 'w-72 p-4 opacity-100' : 'w-0 p-0 border-r-0 opacity-0 overflow-hidden'
        }`}
      >
        {/* Sidebar Top Header & Toggle Handle */}
        {isOpen && (
          <div>
            <div className="flex items-center justify-between mb-4 border-b border-[#353f4d] pb-3">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 bg-[#ff9900] rounded-full animate-pulse"></span>
                <h2 className="text-xs font-mono uppercase tracking-wider text-white font-bold">
                  Profile Console
                </h2>
              </div>
              
              <button
                onClick={onToggle}
                className="text-neutral-400 hover:text-[#ff9900] bg-[#0f141c] hover:bg-[#2b3947] border border-[#353f4d] hover:border-[#ff9900] px-2 py-1 rounded-sm transition-colors focus:outline-none cursor-pointer text-xs font-mono flex items-center gap-1"
                title="Hide Profile Sidebar"
              >
                <span>◀</span>
                <span className="text-[10px] uppercase">Hide</span>
              </button>
            </div>

            {/* Expanded State Full Profile Controls */}
            <div className="space-y-4 animate-fade-in">
            {/* User Identity Card */}
            <div className="bg-[#0f141c] border border-[#353f4d] p-3 rounded-sm relative group">
              <div className="flex items-center space-x-3">
                <div className="w-11 h-11 bg-[#161b24] border border-[#415164] flex items-center justify-center overflow-hidden shrink-0 text-white font-mono text-sm rounded-sm">
                  {profile.pic ? (
                    <img src={profile.pic} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span>{profile.name ? profile.name.charAt(0).toUpperCase() : 'P'}</span>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-white truncate font-sans">
                      {profile.name || 'Anonymous User'}
                    </h3>
                  </div>
                  <p className="text-[11px] text-neutral-400 truncate font-sans">
                    {profile.email || 'user@communityos.aws'}
                  </p>
                  <div className="flex items-center space-x-1.5 mt-1">
                    <span className="text-[9px] font-mono text-[#ff9900] bg-[#ff9900]/10 border border-[#ff9900]/30 px-1.5 py-0.5 uppercase font-bold rounded-sm">
                      {selectedRole}
                    </span>
                    {profile.roleTitle && (
                      <span className="text-[10px] text-neutral-400 font-sans truncate">
                        • {profile.roleTitle}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {!isEditing && (
                <button
                  onClick={() => {
                    setEditName(profile.name || '');
                    setEditRoleTitle(profile.roleTitle || '');
                    setEditSkills(profile.skills || '');
                    setEditFocus(profile.focus || '');
                    setEditLinkedin(profile.linkedin || '');
                    setIsEditing(true);
                  }}
                  className="mt-2.5 w-full bg-[#161b24] hover:bg-[#2b3947] text-neutral-300 hover:text-white border border-[#353f4d] hover:border-[#ff9900] py-1 text-[11px] font-mono uppercase tracking-wider transition-colors cursor-pointer rounded-sm"
                >
                  ✏️ Edit Profile Navbar
                </button>
              )}
            </div>

            {/* Inline Profile Editing Mode */}
            {isEditing ? (
              <form onSubmit={handleSaveProfile} className="bg-[#0f141c] border border-[#ff9900]/40 p-3 space-y-3 rounded-sm">
                <div className="flex justify-between items-center border-b border-[#353f4d] pb-1.5">
                  <span className="text-[10px] font-mono text-[#ff9900] uppercase font-bold">Edit Profile Info</span>
                  <button 
                    type="button" 
                    onClick={() => setIsEditing(false)}
                    className="text-[10px] text-neutral-400 hover:text-white font-mono"
                  >
                    Cancel
                  </button>
                </div>

                <div>
                  <label className="block text-[9px] font-mono text-neutral-400 uppercase mb-0.5">Name</label>
                  <input 
                    type="text" 
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full bg-[#161b24] border border-[#353f4d] px-2 py-1 text-xs text-white focus:outline-none focus:border-[#ff9900] rounded-sm font-sans"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-mono text-neutral-400 uppercase mb-0.5">Role / Title</label>
                  <input 
                    type="text" 
                    value={editRoleTitle}
                    onChange={(e) => setEditRoleTitle(e.target.value)}
                    className="w-full bg-[#161b24] border border-[#353f4d] px-2 py-1 text-xs text-white focus:outline-none focus:border-[#ff9900] rounded-sm font-sans"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-mono text-neutral-400 uppercase mb-0.5">Skills (comma separated)</label>
                  <input 
                    type="text" 
                    value={editSkills}
                    onChange={(e) => setEditSkills(e.target.value)}
                    className="w-full bg-[#161b24] border border-[#353f4d] px-2 py-1 text-xs text-white focus:outline-none focus:border-[#ff9900] rounded-sm font-sans"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-mono text-neutral-400 uppercase mb-0.5">Current Focus</label>
                  <textarea 
                    rows={2}
                    value={editFocus}
                    onChange={(e) => setEditFocus(e.target.value)}
                    className="w-full bg-[#161b24] border border-[#353f4d] px-2 py-1 text-xs text-white focus:outline-none focus:border-[#ff9900] rounded-sm resize-none font-sans"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-mono text-neutral-400 uppercase mb-0.5">LinkedIn URL</label>
                  <input 
                    type="url" 
                    value={editLinkedin}
                    onChange={(e) => setEditLinkedin(e.target.value)}
                    className="w-full bg-[#161b24] border border-[#353f4d] px-2 py-1 text-xs text-white focus:outline-none focus:border-[#ff9900] rounded-sm font-sans"
                  />
                </div>

                <button 
                  type="submit" 
                  className="w-full bg-[#ff9900] hover:bg-[#ec7211] text-white py-1.5 text-xs font-mono uppercase font-bold rounded-sm border border-[#ff9900] cursor-pointer"
                >
                  Save Changes
                </button>
              </form>
            ) : (
              <>
                {/* Current Focus & Bio */}
                {profile.focus && (
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block">Current Focus</span>
                    <p className="text-xs text-neutral-300 bg-[#0f141c] border border-[#353f4d] p-2 rounded-sm font-sans leading-relaxed">
                      "{profile.focus}"
                    </p>
                  </div>
                )}

                {/* Skill Badges */}
                {profile.skills && (
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block">Expertise Skills</span>
                    <div className="flex flex-wrap gap-1">
                      {(typeof profile.skills === 'string' ? profile.skills.split(',') : profile.skills).map(s => String(s).trim()).filter(Boolean).map((skill, idx) => (
                        <span 
                          key={idx} 
                          className="font-mono text-[9px] bg-[#0f141c] text-[#ff9900] border border-[#353f4d] px-2 py-0.5 uppercase tracking-wider font-semibold rounded-sm"
                        >
                          #{skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Social & Contact */}
                {profile.linkedin && (
                  <div className="pt-1">
                    <a 
                      href={profile.linkedin}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-mono text-[#0972d3] hover:underline flex items-center gap-1 font-semibold"
                    >
                      <span>🔗 LinkedIn Profile</span>
                    </a>
                  </div>
                )}

                {/* Matching Availability Switcher */}
                <div className="border-t border-[#353f4d] pt-3 flex items-center justify-between">
                  <span className="text-[11px] text-neutral-300 font-sans">Open to Peer Matching</span>
                  <button
                    type="button"
                    onClick={() => setProfile(prev => ({ ...prev, openToMatch: !prev.openToMatch }))}
                    className={`w-9 h-4.5 flex items-center transition-colors px-0.5 border focus:outline-none cursor-pointer rounded-sm ${
                      profile.openToMatch !== false ? 'bg-[#ff9900] border-[#ff9900]' : 'bg-neutral-800 border-neutral-700'
                    }`}
                  >
                    <div className={`w-3.5 h-3.5 bg-black transition-transform ${
                      profile.openToMatch !== false ? 'transform translate-x-4' : ''
                    }`} />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Sidebar Footer & Actions */}
      {isOpen && (
        <div className="border-t border-[#353f4d] pt-3 space-y-2 animate-fade-in">
          <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400">
            <span>Community:</span>
            <span className="text-white font-semibold">{profile.community || 'demo-community'}</span>
          </div>

          <button
            onClick={handleLogout}
            className="w-full bg-[#0f141c] hover:bg-red-500/10 text-neutral-400 hover:text-red-400 border border-[#353f4d] hover:border-red-500/40 py-1.5 text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer rounded-sm font-semibold flex items-center justify-center gap-1.5"
          >
            <span>🚪</span>
            <span>Sign Out</span>
          </button>
        </div>
      )}
    </aside>
  </>
);
}
