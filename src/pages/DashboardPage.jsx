import React, { useState, useEffect } from 'react';
import { seedResources } from '../mockData';
import { api } from '../api';
import ParallaxCard from '../components/ParallaxCard';
import ParallaxDepthSection, { ParallaxHeroSection } from '../components/ParallaxDepthSection';
import EmailBroadcastNotification from '../components/EmailBroadcastNotification';

export default function DashboardPage({
  profile,
  selectedRole,
  members,
  myMatches,
  setMyMatches,
  proMatches,
  setProMatches,
  events,
  setEvents,
  sharedContributions = [],
  setSharedContributions,
  communityLinks = [],
  setCommunityLinks
}) {
  // Learner Dashboard Local States
  const [learnerQuestion, setLearnerQuestion] = useState('');
  const [showLearnerResults, setShowLearnerResults] = useState(false);
  const [learnerResults, setLearnerResults] = useState({ resources: [], helpers: [] });

  // Email Notification Broadcast State
  const [broadcastNotification, setBroadcastNotification] = useState(null);

  // Organizer Dashboard Local States
  const [sortKey, setSortKey] = useState('attendance');
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [questionText, setQuestionText] = useState('');
  const [questionOptions, setQuestionOptions] = useState(['', '', '', '']);

  // Custom email broadcast form state for Organizer
  const [customBroadcastSubject, setCustomBroadcastSubject] = useState('');
  const [customBroadcastBody, setCustomBroadcastBody] = useState('');

  // Organizer form state for managing community links
  const [newLinkName, setNewLinkName] = useState('');
  const [newLinkType, setNewLinkType] = useState('Discord');
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [newLinkDesc, setNewLinkDesc] = useState('');

  // Shared Bulletin board Form State
  const [shareType, setShareType] = useState('Article/Blog');
  const [shareTitle, setShareTitle] = useState('');
  const [shareUrl, setShareUrl] = useState('');
  const [sharePlatform, setSharePlatform] = useState('Medium');
  const [shareSummary, setShareSummary] = useState('');
  const [shareTags, setShareTags] = useState('');

  // Load connections and matching requests on mount
  useEffect(() => {
    const fetchConnections = async () => {
      const userId = profile.id || (selectedRole === 'pro' ? 'm-1' : 'm-11');
      if (selectedRole === 'pro') {
        const reqs = await api.getProRequests(userId, selectedRole, 'demo-community');
        if (reqs && Array.isArray(reqs)) {
          setProMatches(reqs.map(r => ({
            id: r.connectionId || r.id,
            name: r.name || 'Learner',
            question: r.question || 'How do I handle token context size overflow in Llama 3?',
            status: r.status || 'pending'
          })));
        }
      } else {
        const conns = await api.getConnections(userId, selectedRole, 'demo-community');
        if (conns && Array.isArray(conns)) {
          const activeMatches = conns.filter(c => c.status === 'accepted' || c.status === 'pending');
          if (activeMatches.length > 0) {
            setMyMatches(activeMatches.map(c => ({
              id: c.connectionId,
              name: c.name || 'Devon Chen',
              role: c.role || 'Database Engineer',
              experienceLine: c.experienceLine || 'Solved a similar PGVector latency problem 5 months ago'
            })));
          }
        }
      }
    };
    fetchConnections();
  }, [profile, selectedRole]);

  // Learner: Search Matchmaking
  const handleLearnerSubmit = async (e) => {
    e.preventDefault();
    if (!learnerQuestion.trim()) return;
    
    const userId = profile.id || 'test-user-id';
    
    // Call backend API queryMemory
    const memoryRes = await api.queryMemory(userId, selectedRole, 'demo-community', learnerQuestion);
    
    // Call backend API connectRecommendations
    const recs = await api.getConnectRecommendations(userId, selectedRole, 'demo-community', learnerQuestion);
    
    const recsList = Array.isArray(recs) ? recs : (recs && Array.isArray(recs.matches) ? recs.matches : []);
    const resourcesList = (memoryRes && Array.isArray(memoryRes.resources)) ? memoryRes.resources : [];

    setLearnerResults({
      resources: resourcesList,
      helpers: recsList.map(r => ({
        id: r.memberId || r.id || 'm-1',
        name: r.name || 'Community Pro',
        role: r.title || r.role || 'Pro',
        experienceLine: r.reason || r.relevantExperience || 'Solved a similar problem previously'
      }))
    });
    setShowLearnerResults(true);
  };

  const handleConnectHelper = async (helper) => {
    const userId = profile.id || 'test-user-id';
    await api.requestConnection(userId, selectedRole, 'demo-community', helper.id);
    
    if (!myMatches.some(m => m.id === helper.id)) {
      setMyMatches(prev => [...prev, helper]);
    }
  };

  // Pro: Accept / Decline matching requests
  const handleProAction = async (id, action) => {
    const userId = profile.id || 'test-user-id';
    await api.updateConnection(userId, selectedRole, 'demo-community', id, action === 'accept' ? 'accepted' : 'declined');
    
    setProMatches(prev => prev.map(m => {
      if (m.id === id) {
        return { ...m, status: action };
      }
      return m;
    }));
  };

  // Organizer: Upload photo
  const handlePhotoUpload = (eventId, e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setEvents(prev => prev.map(evt => {
        if (evt.id === eventId) {
          return { ...evt, photo: url };
        }
      }));
    }
  };

  // Helper to trigger AWS SES/SNS email broadcast notification
  const triggerBroadcastEmail = async (subject, bodyText) => {
    const userId = profile.id || 'test-user-id';
    const res = await api.sendBroadcastNotification(userId, selectedRole, 'demo-community', {
      subject,
      body: bodyText,
      actionType: 'ORGANIZER_UPDATE'
    });
    setBroadcastNotification({
      subject: res?.subject || subject,
      body: bodyText,
      recipientsCount: res?.recipientsCount || 520,
      timestamp: Date.now()
    });
  };

  const handleShareSubmit = (e) => {
    e.preventDefault();
    if (!shareTitle.trim()) return;

    const newContribution = {
      id: `c-custom-${Date.now()}`,
      title: shareTitle.trim(),
      type: shareType,
      url: shareType === 'Discussion Note' ? '' : shareUrl.trim(),
      summary: shareSummary.trim(),
      author: profile.name || 'Anonymous',
      authorRole: profile.roleTitle || (selectedRole === 'pro' ? 'Expert Pro' : selectedRole === 'learner' ? 'Learner' : 'Organizer'),
      platform: shareType === 'External Link' ? sharePlatform : (shareType === 'Code Repository' ? 'GitHub' : 'CommunityOS'),
      tags: shareTags.split(',').map(t => t.trim().toLowerCase()).filter(Boolean),
      date: 'Just now'
    };

    setSharedContributions([newContribution, ...sharedContributions]);

    // Dispatch email notification to all members
    if (selectedRole === 'organizer') {
      triggerBroadcastEmail(
        `[AWS Community Board] New Resource Posted: ${shareTitle.trim()}`,
        `${profile.name || 'An Organizer'} posted a new ${shareType} on the community board: "${shareSummary.trim() || shareTitle.trim()}"`
      );
    }

    // reset fields
    setShareTitle('');
    setShareUrl('');
    setShareSummary('');
    setShareTags('');
  };

  const handleAddLinkSubmit = (e) => {
    e.preventDefault();
    if (!newLinkName.trim() || !newLinkUrl.trim()) return;

    const newLink = {
      id: `l-custom-${Date.now()}`,
      name: newLinkName.trim(),
      type: newLinkType,
      url: newLinkUrl.trim(),
      description: newLinkDesc.trim()
    };

    setCommunityLinks([...communityLinks, newLink]);

    // Dispatch email notification to all members
    triggerBroadcastEmail(
      `[AWS Community Day Vadodara] New Community Link Added: ${newLinkName.trim()}`,
      `The Organizer added a new community platform link for ${newLinkName.trim()} (${newLinkType}). Visit the dashboard to connect!`
    );

    setNewLinkName('');
    setNewLinkUrl('');
    setNewLinkDesc('');
  };

  const handleRemoveLink = (linkId) => {
    const removedLink = communityLinks.find(l => l.id === linkId);
    setCommunityLinks(communityLinks.filter(l => l.id !== linkId));

    if (removedLink) {
      triggerBroadcastEmail(
        `[AWS Community Day Vadodara] Community Link Updated`,
        `The Organizer updated the community quick links registry (${removedLink.name} removed).`
      );
    }
  };

  const handleOptionChange = (index, value) => {
    const updated = [...questionOptions];
    updated[index] = value;
    setQuestionOptions(updated);
  };

  const handleQuestionSubmit = (e) => {
    e.preventDefault();
    if (!questionText.trim()) return;

    // Dispatch email notification to all members
    triggerBroadcastEmail(
      `[AWS Community Day Vadodara] New Interactive Question Added by Organizer`,
      `Organizer question added to event: "${questionText.trim()}". Log in to submit your answer!`
    );

    setQuestionText('');
    setQuestionOptions(['', '', '', '']);
    setShowQuestionModal(false);
  };

  const handleCustomBroadcastSubmit = (e) => {
    e.preventDefault();
    if (!customBroadcastSubject.trim() || !customBroadcastBody.trim()) return;

    triggerBroadcastEmail(customBroadcastSubject.trim(), customBroadcastBody.trim());
    setCustomBroadcastSubject('');
    setCustomBroadcastBody('');
  };

  const sortedEvents = [...events].sort((a, b) => b[sortKey] - a[sortKey]);

  return (
    <div className="animate-fade-in space-y-4">
      {/* Top Workspace Hero Section - Recedes into 3D Depth on Scroll */}
      <ParallaxHeroSection>
        {/* Learner Dashboard */}
        {selectedRole === 'learner' && (
          <div className="space-y-10 max-w-2xl mx-auto">
            {/* Input Form */}
            <ParallaxCard className="bg-[#161b24] border border-[#353f4d] p-3.5 rounded-sm">
              <div className="flex items-center justify-between border-b border-[#353f4d] pb-2 mb-2.5">
                <h3 className="text-sm font-mono uppercase tracking-wider text-white font-bold">
                  Ask Community Memory
                </h3>
                <span className="text-[10px] font-mono text-[#ff9900] bg-[#ff9900]/10 border border-[#ff9900]/30 px-2 py-0.5 font-semibold rounded-sm">
                  AI & Peer Search
                </span>
              </div>
              <form onSubmit={handleLearnerSubmit} className="space-y-3">
                <label className="block text-xs text-neutral-300 font-sans">
                  What are you working on or stuck on?
                </label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={learnerQuestion}
                    onChange={(e) => setLearnerQuestion(e.target.value)}
                    placeholder="e.g. RAG evaluation metrics or local Ollama sandboxes"
                    className="flex-1 bg-[#0f141c] border border-[#353f4d] px-3 py-2 text-sm text-white focus:outline-none focus:border-[#ff9900] rounded-sm font-sans"
                  />
                  <button 
                    type="submit" 
                    className="bg-[#ff9900] hover:bg-[#ec7211] text-white px-5 py-2 font-mono text-sm uppercase tracking-wider transition-colors focus:outline-none cursor-pointer rounded-sm border border-[#ff9900] font-bold"
                  >
                    Ask
                  </button>
                </div>
              </form>
            </ParallaxCard>

            {/* Revealed Match Results */}
            {showLearnerResults && (
              <div className="space-y-8">
                {/* Related to your question */}
                <div className="space-y-4">
                  <h3 className="text-xs font-mono uppercase tracking-wider text-neutral-400 border-b border-[#353f4d] pb-2">
                    Related to your question
                  </h3>
                  {learnerResults.resources.length > 0 ? (
                    <div className="grid gap-3">
                      {learnerResults.resources.map(res => (
                        <ParallaxCard key={res.id} className="bg-[#161b24] border border-[#353f4d] p-3 rounded-sm">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="text-sm font-medium text-white font-sans">{res.title}</h4>
                            <span className="font-mono text-[10px] bg-[#0f141c] border border-[#353f4d] px-2 py-0.5 uppercase text-[#ff9900] font-semibold">
                              {res.type}
                            </span>
                          </div>
                          <p className="text-xs text-neutral-400 font-sans">Shared in {res.source}</p>
                        </ParallaxCard>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-neutral-500 font-sans">No sessions or resources found matching your tags directly.</p>
                  )}
                </div>

                {/* People who can help */}
                <div className="space-y-4">
                  <h3 className="text-xs font-mono uppercase tracking-wider text-neutral-400 border-b border-[#353f4d] pb-2">
                    People who can help
                  </h3>
                  <div className="grid gap-4">
                    {learnerResults.helpers.map(helper => {
                      const isConnected = myMatches.some(m => m.id === helper.id);
                      return (
                        <ParallaxCard key={helper.id} className="bg-[#161b24] border border-[#353f4d] p-3 space-y-2.5 bg-gradient-to-r from-[#161b24] to-[#161b24]/40 rounded-sm">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-[#0f141c] border border-[#353f4d] flex items-center justify-center overflow-hidden rounded-none shrink-0 text-neutral-600 font-mono text-xs">
                                {helper.pic || (helper.name === profile.name && profile.pic) ? (
                                  <img src={helper.pic || profile.pic} alt="Helper" className="w-full h-full object-cover" />
                                ) : (
                                  <span>{helper.name.charAt(0)}</span>
                                )}
                              </div>
                              <div>
                                <div className="flex items-center space-x-2">
                                  <span className="text-sm font-medium text-white font-sans">{helper.name}</span>
                                  <span className="text-xs text-neutral-400 font-sans">— {helper.role}</span>
                                  {(helper.linkedin || (helper.name === profile.name && profile.linkedin)) && (
                                    <a 
                                      href={helper.linkedin || profile.linkedin} 
                                      target="_blank" 
                                      rel="noreferrer"
                                      className="text-[10px] text-[#0972d3] font-mono hover:underline ml-1 font-bold"
                                    >
                                      [LinkedIn]
                                    </a>
                                  )}
                                </div>
                                <p className="text-xs text-[#ff9900] mt-1 font-mono font-semibold">{helper.experienceLine}</p>
                              </div>
                            </div>

                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleConnectHelper(helper)}
                                disabled={isConnected}
                                className={`px-3 py-1.5 font-mono text-xs uppercase tracking-wider transition-colors border focus:outline-none cursor-pointer rounded-sm ${
                                  isConnected 
                                    ? 'border-[#353f4d] text-neutral-500 cursor-default bg-transparent' 
                                    : 'border-[#0972d3] text-[#0972d3] hover:bg-[#0972d3] hover:text-white font-bold'
                                }`}
                              >
                                {isConnected ? 'Connected' : 'Connect'}
                              </button>
                            </div>
                          </div>
                        </ParallaxCard>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Persistent matches list */}
            <div className="space-y-4 border-t border-[#353f4d] pt-6">
              <h3 className="text-xs font-mono uppercase tracking-wider text-neutral-400">
                My matches
              </h3>
              {myMatches.length > 0 ? (
                <div className="space-y-3">
                  {myMatches.map(m => {
                    return (
                      <ParallaxCard key={m.id} className="bg-[#161b24] border border-[#353f4d] p-2.5 space-y-2 text-xs rounded-sm">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-3">
                            <div className="w-7 h-7 bg-[#0f141c] border border-[#353f4d] flex items-center justify-center overflow-hidden rounded-none text-[10px] text-neutral-500 font-mono">
                              {m.pic || (m.name === profile.name && m.pic) ? (
                                <img src={m.pic || profile.pic} alt="Match" className="w-full h-full object-cover" />
                              ) : (
                                <span>{m.name.charAt(0)}</span>
                              )}
                            </div>
                            <div>
                              <span className="text-white font-medium font-sans">{m.name}</span>
                              <span className="text-neutral-400 font-sans"> ({m.role})</span>
                              {(m.linkedin || (m.name === profile.name && m.linkedin)) && (
                                <a 
                                  href={m.linkedin || profile.linkedin} 
                                  target="_blank" 
                                  rel="noreferrer"
                                  className="text-[9px] text-[#0972d3] font-mono ml-2 hover:underline inline-block font-bold"
                                >
                                  [LinkedIn]
                                </a>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <span className="text-neutral-500 font-mono text-[10px]">Previously matched</span>
                          </div>
                        </div>
                      </ParallaxCard>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-neutral-500 font-sans">No active matches yet.</p>
              )}
            </div>
          </div>
        )}

        {/* Pro Dashboard */}
        {selectedRole === 'pro' && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="space-y-6">
              <h3 className="text-sm font-mono uppercase tracking-wider text-neutral-400 border-b border-[#353f4d] pb-2">
                People asking for help
              </h3>
              
              <div className="space-y-4">
                {proMatches.map(req => (
                  <ParallaxCard key={req.id} className="bg-[#161b24] border border-[#353f4d] p-3 space-y-2.5 rounded-sm">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-xs text-[#0972d3] block font-mono font-bold">LEARNER</span>
                        <span className="text-sm font-medium text-white font-sans">{req.name}</span>
                      </div>
                      {req.status !== 'pending' && (
                        <span className={`text-[10px] font-mono border px-2 py-0.5 uppercase rounded-sm ${
                          req.status === 'accepted' ? 'border-[#0972d3] text-[#0972d3] font-bold' : 'border-neutral-700 text-neutral-500'
                        }`}>
                          {req.status}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-white bg-[#0f141c] border border-[#353f4d] p-3 leading-relaxed font-sans rounded-sm">
                      "{req.question}"
                    </p>

                    {req.status === 'pending' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleProAction(req.id, 'accepted')}
                          className="flex-1 bg-transparent hover:bg-[#0972d3] text-[#0972d3] hover:text-white border border-[#0972d3] py-1.5 text-xs font-mono uppercase tracking-wider transition-colors text-center focus:outline-none cursor-pointer rounded-sm font-bold"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleProAction(req.id, 'declined')}
                          className="flex-1 bg-transparent hover:bg-[#0f141c] text-neutral-400 border border-[#353f4d] py-1.5 text-xs font-mono uppercase tracking-wider transition-colors text-center focus:outline-none cursor-pointer rounded-sm"
                        >
                          Not now
                        </button>
                      </div>
                    )}
                  </ParallaxCard>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Organizer Dashboard */}
        {selectedRole === 'organizer' && (
          <div className="space-y-10">
            {/* Top counters */}
            <ParallaxCard className="grid grid-cols-3 gap-3 border border-[#353f4d] bg-[#161b24] p-3 text-center rounded-sm">
              <div>
                <span className="text-xs font-mono text-neutral-400 uppercase tracking-wider block">Gaps Detected</span>
                <span className="text-xl font-mono text-[#ec7211] font-bold">02</span>
              </div>
              <div className="border-x border-[#353f4d]">
                <span className="text-xs font-mono text-neutral-400 uppercase tracking-wider block">Emerging Topics</span>
                <span className="text-xl font-mono text-[#ff9900] font-bold">02</span>
              </div>
              <div>
                <span className="text-xs font-mono text-neutral-400 uppercase tracking-wider block">Community Strengths</span>
                <span className="text-xl font-mono text-[#0972d3] font-bold">02</span>
              </div>
            </ParallaxCard>

            {/* Gap detail */}
            <div className="space-y-4">
              <h3 className="text-xs font-mono uppercase tracking-wider text-neutral-400">Community gaps</h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                {/* Gap Card 1 */}
                <ParallaxCard className="bg-[#161b24] border border-[#ec7211]/50 p-3 space-y-2.5 rounded-sm">
                  <div className="flex justify-between items-start">
                    <h4 className="text-sm font-medium text-white font-sans">Production RAG Evaluation</h4>
                    <span className="text-xs font-mono text-[#ec7211] bg-[#ec7211]/10 border border-[#ec7211]/30 px-2 py-0.5 font-bold rounded-sm">
                      Demand: 18
                    </span>
                  </div>
                  <p className="text-xs text-neutral-300 font-sans">
                    Members are asking about evaluations more than the community currently covers.
                  </p>
                  <div className="border-t border-[#353f4d] pt-2">
                    <span className="text-[10px] font-mono text-neutral-400 block uppercase mb-1">Suggested Experts to Feature</span>
                    <div className="space-y-1 text-xs text-white font-sans">
                      <div>Elena Rostova — <span className="text-neutral-400">Staff AI Engineer</span></div>
                    </div>
                  </div>
                </ParallaxCard>

                {/* Gap Card 2 */}
                <ParallaxCard className="bg-[#161b24] border border-[#ec7211]/50 p-3 space-y-2.5 rounded-sm">
                  <div className="flex justify-between items-start">
                    <h4 className="text-sm font-medium text-white font-sans">Prompt Injection Protection</h4>
                    <span className="text-xs font-mono text-[#ec7211] bg-[#ec7211]/10 border border-[#ec7211]/30 px-2 py-0.5 font-bold rounded-sm">
                      Demand: 14
                    </span>
                  </div>
                  <p className="text-xs text-neutral-300 font-sans">
                    High curiosity regarding Deepseek jailbreaks with minimal expert-answered guides.
                  </p>
                  <div className="border-t border-[#353f4d] pt-3">
                    <span className="text-[10px] font-mono text-neutral-400 block uppercase mb-2">Suggested Experts to Feature</span>
                    <div className="space-y-1 text-xs text-white font-sans">
                      <div>Sarah Jenkins — <span className="text-neutral-400">Security Researcher</span></div>
                    </div>
                  </div>
                </ParallaxCard>
              </div>
            </div>

            {/* Manage Community Links (Organizer Only) */}
            <ParallaxCard className="space-y-3.5 border border-[#353f4d] bg-[#161b24] p-4 rounded-sm">
              <div>
                <h3 className="text-sm font-mono uppercase tracking-wider text-neutral-300 font-bold border-b border-[#353f4d] pb-2">
                  Manage Community Links
                </h3>
                <p className="text-xs text-neutral-400 mt-1">Configure the Discord, Slack, GitHub, or Meetup links shown at the bottom of all dashboards.</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6 pt-2">
                {/* Form */}
                <form onSubmit={handleAddLinkSubmit} className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-mono text-neutral-400 uppercase mb-1">Link Name</label>
                      <input 
                        type="text" 
                        required
                        placeholder="e.g. YouTube Channel"
                        value={newLinkName}
                        onChange={(e) => setNewLinkName(e.target.value)}
                        className="w-full bg-[#0f141c] border border-[#353f4d] px-2 py-1 text-xs text-white focus:outline-none focus:border-[#ff9900] rounded-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono text-neutral-400 uppercase mb-1">Platform Type</label>
                      <select 
                        value={newLinkType}
                        onChange={(e) => setNewLinkType(e.target.value)}
                        className="w-full bg-[#0f141c] border border-[#353f4d] px-2 py-1.5 text-xs text-white focus:outline-none focus:border-[#ff9900] rounded-sm"
                      >
                        <option value="Discord">Discord</option>
                        <option value="Meetup">Meetup</option>
                        <option value="GitHub">GitHub</option>
                        <option value="Slack">Slack</option>
                        <option value="Website">Website</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono text-neutral-400 uppercase mb-1">URL</label>
                    <input 
                      type="url" 
                      required
                      placeholder="https://..."
                      value={newLinkUrl}
                      onChange={(e) => setNewLinkUrl(e.target.value)}
                      className="w-full bg-[#0f141c] border border-[#353f4d] px-2 py-1 text-xs text-white focus:outline-none focus:border-[#ff9900] rounded-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono text-neutral-400 uppercase mb-1">Brief Description</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Watch session recordings here"
                      value={newLinkDesc}
                      onChange={(e) => setNewLinkDesc(e.target.value)}
                      className="w-full bg-[#0f141c] border border-[#353f4d] px-2 py-1 text-xs text-white focus:outline-none focus:border-[#ff9900] rounded-sm"
                    />
                  </div>

                  <button 
                    type="submit" 
                    className="bg-[#0972d3] hover:bg-[#0073bb] text-white px-3 py-1.5 text-xs font-mono uppercase font-bold rounded-sm border border-[#0972d3] cursor-pointer"
                  >
                    Add Link
                  </button>
                </form>

                {/* Current Active Links List */}
                <div className="space-y-2 border-l border-[#353f4d]/60 pl-6">
                  <span className="block text-[10px] font-mono text-neutral-400 uppercase">Active Links</span>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {communityLinks.map(link => (
                      <div key={link.id} className="flex justify-between items-center bg-[#0f141c] border border-[#353f4d] p-2 text-xs rounded-sm">
                        <div className="truncate mr-2">
                          <span className="text-white font-bold">{link.name}</span>
                          <span className="text-[10px] text-neutral-500 font-mono ml-2 uppercase">({link.type})</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveLink(link.id)}
                          className="text-neutral-500 hover:text-red-400 font-mono text-[9px] uppercase focus:outline-none cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </ParallaxCard>

            {/* Instant Email Broadcast Panel (Organizer Only) */}
            <ParallaxCard className="space-y-3.5 border border-[#ff9900]/50 bg-[#161b24] p-4 rounded-sm">
              <div className="flex justify-between items-center border-b border-[#353f4d] pb-3">
                <div>
                  <h3 className="text-sm font-mono uppercase tracking-wider text-white font-bold flex items-center gap-2">
                    <span>📧</span> Instant Email Broadcast Announcement
                  </h3>
                  <p className="text-xs text-neutral-400 mt-1">
                    Send an automated email notification via AWS SES & SNS to all registered attendees and speakers.
                  </p>
                </div>
                <span className="text-[10px] font-mono text-[#ff9900] bg-[#ff9900]/10 border border-[#ff9900]/30 px-2.5 py-1 font-semibold rounded-sm shrink-0">
                  520 Members Notified
                </span>
              </div>

              <form onSubmit={handleCustomBroadcastSubmit} className="space-y-3">
                <div>
                  <label className="block text-[10px] font-mono text-neutral-400 uppercase mb-1">Broadcast Email Subject</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. [AWS Community Day Vadodara] Keynote Room & Schedule Update"
                    value={customBroadcastSubject}
                    onChange={(e) => setCustomBroadcastSubject(e.target.value)}
                    className="w-full bg-[#0f141c] border border-[#353f4d] px-3 py-2 text-xs text-white focus:outline-none focus:border-[#ff9900] rounded-sm font-sans"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-neutral-400 uppercase mb-1">Email Announcement Body</label>
                  <textarea 
                    rows={3}
                    required
                    placeholder="Write the announcement message to send to all members..."
                    value={customBroadcastBody}
                    onChange={(e) => setCustomBroadcastBody(e.target.value)}
                    className="w-full bg-[#0f141c] border border-[#353f4d] px-3 py-2 text-xs text-white focus:outline-none focus:border-[#ff9900] rounded-sm resize-none font-sans"
                  />
                </div>

                <button 
                  type="submit" 
                  className="bg-[#ff9900] hover:bg-[#ec7211] text-white px-5 py-2 text-xs font-mono uppercase tracking-wider font-bold rounded-sm border border-[#ff9900] cursor-pointer"
                >
                  📧 Dispatch Email Broadcast to All Members
                </button>
              </form>
            </ParallaxCard>

            {/* Event engagement */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-mono uppercase tracking-wider text-neutral-400">Event engagement</h3>
                <div className="flex items-center space-x-2 text-xs">
                  <span className="text-neutral-500 font-mono">Sort by:</span>
                  <button 
                    onClick={() => setSortKey('attendance')}
                    className={`font-mono px-2 py-0.5 focus:outline-none cursor-pointer rounded-sm ${sortKey === 'attendance' ? 'text-white border border-[#353f4d] bg-[#2b3947]' : 'text-neutral-400 border border-transparent'}`}
                  >
                    Attendance
                  </button>
                  <button 
                    onClick={() => setSortKey('questions')}
                    className={`font-mono px-2 py-0.5 focus:outline-none cursor-pointer rounded-sm ${sortKey === 'questions' ? 'text-white border border-[#353f4d] bg-[#2b3947]' : 'text-neutral-400 border border-transparent'}`}
                  >
                    Questions
                  </button>
                  <button 
                    onClick={() => setShowQuestionModal(true)}
                    className="font-mono px-2 py-0.5 focus:outline-none cursor-pointer rounded-sm text-[#ff9900] border border-[#ff9900]/40 hover:border-[#ff9900] text-[10px] uppercase tracking-wider"
                  >
                    + Add Question
                  </button>
                </div>
              </div>

              <div className="border border-[#353f4d] overflow-hidden rounded-sm">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#161b24] border-b border-[#353f4d] text-neutral-300 font-mono">
                      <th className="p-3 font-normal">Event Name</th>
                      <th className="p-3 font-normal">Attendance</th>
                      <th className="p-3 font-normal">Questions</th>
                      <th className="p-3 font-normal">Top Topic</th>
                      <th className="p-3 font-normal">Photos</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#353f4d]">
                    {sortedEvents.map(evt => (
                      <tr key={evt.id} className="hover:bg-[#161b24]/50 transition-colors">
                        <td className="p-3 text-white font-medium">{evt.name}</td>
                        <td className="p-3 text-neutral-300 font-mono">{evt.attendance}</td>
                        <td className="p-3 text-neutral-300 font-mono">{evt.questionsCount}</td>
                        <td className="p-3 text-[#ff9900] font-mono text-[11px]">{evt.topTopic}</td>
                        <td className="p-3">
                          {evt.photo ? (
                            <img src={evt.photo} alt={evt.name} className="w-8 h-8 object-cover rounded-sm border border-[#353f4d]" />
                          ) : (
                            <label className="text-[10px] font-mono text-neutral-400 hover:text-white cursor-pointer bg-[#0f141c] border border-[#353f4d] px-2 py-1 rounded-sm inline-block">
                              + Upload
                              <input type="file" accept="image/*" className="hidden" onChange={(e) => handlePhotoUpload(evt.id, e)} />
                            </label>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      {/* Modal for adding a question */}
      {showQuestionModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="relative bg-[#161b24] border border-[#353f4d] rounded-sm w-full max-w-md p-6 space-y-5">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-mono uppercase tracking-wider text-white">Create Question</h3>
              <button 
                onClick={() => setShowQuestionModal(false)}
                className="text-neutral-400 hover:text-white text-lg leading-none cursor-pointer focus:outline-none"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleQuestionSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-mono text-neutral-400 uppercase tracking-wider mb-1">
                  Question
                </label>
                <textarea
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  placeholder="Type your question here..."
                  rows={3}
                  className="w-full bg-[#0f141c] border border-[#353f4d] px-3 py-2 text-xs text-white focus:outline-none focus:border-[#ff9900] rounded-sm resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-mono text-neutral-400 uppercase tracking-wider">
                  Options
                </label>
                {questionOptions.map((opt, idx) => (
                  <div key={idx} className="flex items-center space-x-2">
                    <span className="text-[10px] font-mono text-neutral-500 w-4">{String.fromCharCode(65 + idx)}.</span>
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => handleOptionChange(idx, e.target.value)}
                      placeholder={`Option ${idx + 1}`}
                      className="flex-1 bg-[#0f141c] border border-[#353f4d] px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#ff9900] rounded-sm"
                    />
                  </div>
                ))}
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowQuestionModal(false)}
                  className="font-mono text-xs uppercase tracking-wider text-neutral-400 border border-[#353f4d] px-3 py-1.5 rounded-sm hover:bg-[#0f141c] cursor-pointer focus:outline-none"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="font-mono text-xs uppercase tracking-wider text-white bg-[#ff9900] border border-[#ff9900] px-3 py-1.5 rounded-sm hover:bg-[#ec7211] font-bold cursor-pointer focus:outline-none"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </ParallaxHeroSection>

      {/* Stage 2: AWS Community Hub & Share Resource Form */}
      <ParallaxDepthSection className="mt-8 pt-10 border-t border-[#353f4d] space-y-6 max-w-2xl mx-auto">
        <div className="text-center">
          <h2 className="text-xl font-bold text-white tracking-wide">AWS Community Hub</h2>
          <p className="text-sm text-neutral-400">Share tutorials, slides, repos, or links from other platforms with the community.</p>
        </div>

        {/* Share Form Panel */}
        <ParallaxCard className="bg-[#161b24] border border-[#353f4d] p-3.5 rounded-sm space-y-3 max-w-2xl mx-auto text-left">
          <h3 className="text-sm font-mono uppercase tracking-wider text-neutral-300 font-bold border-b border-[#353f4d] pb-2">
            Share a Resource
          </h3>
          <form onSubmit={handleShareSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-mono text-neutral-400 uppercase mb-1">Content Type</label>
                <select 
                  value={shareType}
                  onChange={(e) => setShareType(e.target.value)}
                  className="w-full bg-[#0f141c] border border-[#353f4d] px-3 py-2 text-xs text-white focus:outline-none focus:border-[#ff9900] rounded-sm font-sans"
                >
                  <option value="Article/Blog">Article/Blog</option>
                  <option value="External Link">External Platform Link</option>
                  <option value="Code Repository">Code Repository (GitHub/GitLab)</option>
                  <option value="Discussion Note">Discussion Note / Update</option>
                </select>
              </div>

              {shareType === 'External Link' ? (
                <div>
                  <label className="block text-[11px] font-mono text-neutral-400 uppercase mb-1">Platform</label>
                  <select 
                    value={sharePlatform}
                    onChange={(e) => setSharePlatform(e.target.value)}
                    className="w-full bg-[#0f141c] border border-[#353f4d] px-3 py-2 text-xs text-white focus:outline-none focus:border-[#ff9900] rounded-sm font-sans"
                  >
                    <option value="LinkedIn">LinkedIn</option>
                    <option value="Twitter/X">Twitter / X</option>
                    <option value="Medium">Medium</option>
                    <option value="Substack">Substack</option>
                    <option value="Other">Other Platform</option>
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block text-[11px] font-mono text-neutral-400 uppercase mb-1">Tags (comma separated)</label>
                  <input 
                    type="text" 
                    placeholder="e.g. embeddings, ecs, performance"
                    value={shareTags}
                    onChange={(e) => setShareTags(e.target.value)}
                    className="w-full bg-[#0f141c] border border-[#353f4d] px-3 py-2 text-xs text-white focus:outline-none focus:border-[#ff9900] rounded-sm font-sans"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-[11px] font-mono text-neutral-400 uppercase mb-1">Title / Caption</label>
              <input 
                type="text" 
                required
                placeholder="e.g. Scaling vector embeddings on AWS ECS"
                value={shareTitle}
                onChange={(e) => setShareTitle(e.target.value)}
                className="w-full bg-[#0f141c] border border-[#353f4d] px-3 py-2 text-xs text-white focus:outline-none focus:border-[#ff9900] rounded-sm font-sans"
              />
            </div>

            {shareType !== 'Discussion Note' && (
              <div>
                <label className="block text-[11px] font-mono text-neutral-400 uppercase mb-1">Resource URL</label>
                <input 
                  type="url" 
                  required
                  placeholder="https://example.com/my-resource"
                  value={shareUrl}
                  onChange={(e) => setShareUrl(e.target.value)}
                  className="w-full bg-[#0f141c] border border-[#353f4d] px-3 py-2 text-xs text-white focus:outline-none focus:border-[#ff9900] rounded-sm font-sans"
                />
              </div>
            )}

            <div>
              <label className="block text-[11px] font-mono text-neutral-400 uppercase mb-1">Summary / Description</label>
              <textarea 
                rows={3}
                placeholder="Write a brief overview of what this resource is about..."
                value={shareSummary}
                onChange={(e) => setShareSummary(e.target.value)}
                className="w-full bg-[#0f141c] border border-[#353f4d] px-3 py-2 text-xs text-white focus:outline-none focus:border-[#ff9900] rounded-sm resize-none font-sans"
              />
            </div>

            <button 
              type="submit" 
              className="bg-[#ff9900] hover:bg-[#ec7211] text-white px-6 py-2 text-xs font-mono uppercase tracking-wider transition-colors focus:outline-none cursor-pointer rounded-sm font-bold border border-[#ff9900]"
            >
              Post to Board
            </button>
          </form>
        </ParallaxCard>
      </ParallaxDepthSection>

      {/* Stage 3: Community Shared Feed & Connect Links - Parallax Depth Entrance on Scroll */}
      <ParallaxDepthSection className="mt-12 pt-10 border-t border-[#353f4d] space-y-8">
        {/* Contributions Feed Panel */}
        <div className="space-y-4">
          <div className="flex justify-between items-center border-b border-[#353f4d] pb-2">
            <h3 className="text-base font-bold text-white tracking-wide">
              Community Shared Feed
            </h3>
            <span className="text-xs font-mono text-[#ff9900] bg-[#ff9900]/10 border border-[#ff9900]/30 px-2 py-0.5 font-semibold rounded-sm">
              Live Contributions
            </span>
          </div>
          
          {sharedContributions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sharedContributions.map(item => (
                <ParallaxCard key={item.id} className="bg-[#161b24] border border-[#353f4d] p-3 rounded-sm flex flex-col justify-between min-h-[135px] space-y-1.5">
                  <div>
                    <div className="flex justify-between items-start mb-1.5">
                      <div className="flex flex-wrap gap-1">
                        <span className="font-mono text-[9px] bg-[#0f141c] text-[#ff9900] border border-[#353f4d] px-2 py-0.5 uppercase tracking-wide font-bold">
                          {item.type}
                        </span>
                        {item.platform && (
                          <span className="font-mono text-[9px] bg-[#0f141c] text-[#0972d3] border border-[#353f4d] px-2 py-0.5 uppercase tracking-wide font-bold">
                            {item.platform}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-neutral-500 font-mono shrink-0 ml-1">{item.date}</span>
                    </div>
                    
                    <h4 className="text-sm font-bold text-white font-sans mb-1.5 leading-snug">{item.title}</h4>

                    {item.summary && (
                      <p className="text-xs text-neutral-300 font-sans leading-relaxed line-clamp-3 mb-2">
                        {item.summary}
                      </p>
                    )}
                  </div>

                  <div>
                    {item.tags && item.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {item.tags.map((tag, idx) => (
                          <span key={idx} className="font-mono text-[9px] bg-[#0f141c] text-neutral-400 border border-[#353f4d] px-1.5 py-0.5 uppercase tracking-wide rounded-sm">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex justify-between items-center border-t border-[#353f4d]/60 pt-2 text-[10px]">
                      <div className="text-neutral-400 font-mono truncate mr-1">
                        By <span className="text-white font-bold">{item.author}</span>
                      </div>
                      {item.url && (
                        <a 
                          href={item.url} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="font-mono font-bold text-[#0972d3] hover:underline shrink-0"
                        >
                          Open &rarr;
                        </a>
                      )}
                    </div>
                  </div>
                </ParallaxCard>
              ))}
            </div>
          ) : (
            <p className="text-xs text-neutral-500 font-sans italic">No shared contributions on the board yet.</p>
          )}
        </div>

        {/* Join the Community Cards Section */}
        <div className="mt-8 bg-[#161b24] border border-[#353f4d] p-3.5 rounded-sm space-y-3">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-[#353f4d]/60 pb-2.5">
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide">Connect & Join the AWS Community</h3>
              <p className="text-xs text-neutral-400">Join our platforms to engage in real-time discussions, access code repositories, and attend upcoming local meetups.</p>
            </div>
            <span className="text-xs font-mono text-neutral-500 mt-2 md:mt-0 font-bold bg-[#0f141c] px-2 py-0.5 border border-[#353f4d]">Quick Links</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {communityLinks.map(link => (
              <ParallaxCard key={link.id} className="bg-[#0f141c] border border-[#353f4d] hover:border-[#ff9900] p-3 transition-all rounded-sm group text-left flex flex-col justify-between min-h-[110px]">
                <a 
                  href={link.url} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="block h-full cursor-pointer"
                >
                  <div>
                    <span className="text-[10px] font-mono text-[#ff9900] block mb-1 font-bold uppercase">{link.type}</span>
                    <h4 className="text-sm font-bold text-white group-hover:text-[#ff9900] transition-colors mb-1">{link.name}</h4>
                    <p className="text-xs text-neutral-400 leading-relaxed">{link.description || 'Visit the community link to connect.'}</p>
                  </div>
                </a>
              </ParallaxCard>
            ))}
            {communityLinks.length === 0 && (
              <p className="text-xs text-neutral-500 italic col-span-full">No active community links configured by the organizer.</p>
            )}
          </div>
        </div>
      </ParallaxDepthSection>

      {/* Automated Email Broadcast Toast & Inbox Preview Modal */}
      <EmailBroadcastNotification 
        notification={broadcastNotification} 
        onClose={() => setBroadcastNotification(null)} 
      />
    </div>
  );
}
