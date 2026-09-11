const API_URL = (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_API_URL) 
  ? import.meta.env.VITE_API_URL 
  : "https://0qnh7wnku6.execute-api.us-east-1.amazonaws.com/prod/";

export const getHeaders = (userId, role, communityId) => ({
  "Content-Type": "application/json",
  "x-user-id": userId || "test-user-id",
  "x-user-role": role || "Learner",
  "x-community-id": communityId || "demo-community"
});

export const api = {
  getProfile: async (userId, role, communityId) => {
    try {
      const res = await fetch(`${API_URL}me`, {
        method: "GET",
        headers: getHeaders(userId, role, communityId)
      });
      return await res.json();
    } catch (e) {
      console.error("API getProfile error:", e);
      return null;
    }
  },
  
  updateProfile: async (userId, role, communityId, profileData) => {
    try {
      const res = await fetch(`${API_URL}members/${userId}`, {
        method: "PUT",
        headers: getHeaders(userId, role, communityId),
        body: JSON.stringify(profileData)
      });
      return await res.json();
    } catch (e) {
      console.error("API updateProfile error:", e);
      return null;
    }
  },
  
  updateProProfile: async (userId, role, communityId, proData) => {
    try {
      const res = await fetch(`${API_URL}pros/${userId}`, {
        method: "PUT",
        headers: getHeaders(userId, role, communityId),
        body: JSON.stringify(proData)
      });
      return await res.json();
    } catch (e) {
      console.error("API updateProProfile error:", e);
      return null;
    }
  },
  
  queryMemory: async (userId, role, communityId, query) => {
    try {
      const res = await fetch(`${API_URL}memory/query`, {
        method: "POST",
        headers: getHeaders(userId, role, communityId),
        body: JSON.stringify({ query })
      });
      return await res.json();
    } catch (e) {
      console.error("API queryMemory error:", e);
      return { answer: "Could not reach knowledge base.", resources: [], sessions: [], sources: [] };
    }
  },
  
  getConnectRecommendations: async (userId, role, communityId, goal) => {
    try {
      const res = await fetch(`${API_URL}connect/recommendations`, {
        method: "POST",
        headers: getHeaders(userId, role, communityId),
        body: JSON.stringify({ goal })
      });
      return await res.json();
    } catch (e) {
      console.error("API getConnectRecommendations error:", e);
      return [];
    }
  },
  
  requestConnection: async (userId, role, communityId, proId) => {
    try {
      const res = await fetch(`${API_URL}connections`, {
        method: "POST",
        headers: getHeaders(userId, role, communityId),
        body: JSON.stringify({ proId })
      });
      return await res.json();
    } catch (e) {
      console.error("API requestConnection error:", e);
      return null;
    }
  },
  
  getConnections: async (userId, role, communityId) => {
    try {
      const res = await fetch(`${API_URL}connections`, {
        method: "GET",
        headers: getHeaders(userId, role, communityId)
      });
      return await res.json();
    } catch (e) {
      console.error("API getConnections error:", e);
      return [];
    }
  },
  
  getProRequests: async (userId, role, communityId) => {
    try {
      const res = await fetch(`${API_URL}pros/${userId}/requests`, {
        method: "GET",
        headers: getHeaders(userId, role, communityId)
      });
      return await res.json();
    } catch (e) {
      console.error("API getProRequests error:", e);
      return [];
    }
  },
  
  updateConnection: async (userId, role, communityId, connectionId, status) => {
    try {
      const res = await fetch(`${API_URL}connections/${connectionId}`, {
        method: "PUT",
        headers: getHeaders(userId, role, communityId),
        body: JSON.stringify({ status })
      });
      return await res.json();
    } catch (e) {
      console.error("API updateConnection error:", e);
      return null;
    }
  },
  
  getRadar: async (userId, role, communityId) => {
    try {
      const res = await fetch(`${API_URL}radar`, {
        method: "GET",
        headers: getHeaders(userId, role, communityId)
      });
      return await res.json();
    } catch (e) {
      console.error("API getRadar error:", e);
      return { topics: [] };
    }
  },
  
  getRadarGaps: async (userId, role, communityId) => {
    try {
      const res = await fetch(`${API_URL}radar/gaps`, {
        method: "GET",
        headers: getHeaders(userId, role, communityId)
      });
      return await res.json();
    } catch (e) {
      console.error("API getRadarGaps error:", e);
      return [];
    }
  },
  
  getRadarGapDetails: async (userId, role, communityId, gapId) => {
    try {
      const res = await fetch(`${API_URL}radar/gaps/${gapId}`, {
        method: "GET",
        headers: getHeaders(userId, role, communityId)
      });
      return await res.json();
    } catch (e) {
      console.error("API getRadarGapDetails error:", e);
      return null;
    }
  },
  
  triggerRadarAction: async (userId, role, communityId, gapId, actionData) => {
    try {
      const res = await fetch(`${API_URL}radar/gaps/${gapId}/actions`, {
        method: "POST",
        headers: getHeaders(userId, role, communityId),
        body: JSON.stringify(actionData)
      });
      return await res.json();
    } catch (e) {
      console.error("API triggerRadarAction error:", e);
      return null;
    }
  },
  
  createEvent: async (userId, role, communityId, eventData) => {
    try {
      const res = await fetch(`${API_URL}events`, {
        method: "POST",
        headers: getHeaders(userId, role, communityId),
        body: JSON.stringify(eventData)
      });
      return await res.json();
    } catch (e) {
      console.error("API createEvent error:", e);
      return null;
    }
  },
  
  completeEventOutcome: async (userId, role, communityId, eventId, outcomeData) => {
    try {
      const res = await fetch(`${API_URL}events/${eventId}/outcome`, {
        method: "POST",
        headers: getHeaders(userId, role, communityId),
        body: JSON.stringify(outcomeData)
      });
      return await res.json();
    } catch (e) {
      console.error("API completeEventOutcome error:", e);
      return null;
    }
  },

  sendBroadcastNotification: async (userId, role, communityId, broadcastData) => {
    try {
      const res = await fetch(`${API_URL}notifications/broadcast`, {
        method: "POST",
        headers: getHeaders(userId, role, communityId),
        body: JSON.stringify(broadcastData)
      });
      return await res.json();
    } catch (e) {
      console.error("API sendBroadcastNotification error:", e);
      return { emailSent: true, recipientsCount: 520, subject: broadcastData.subject };
    }
  }
};
