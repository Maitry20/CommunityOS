import React, { useState } from 'react';

/**
 * EmailBroadcastNotification - Displays an animated notification toast & email preview modal 
 * whenever an Organizer adds or modifies an event, question, resource, or link.
 */
export default function EmailBroadcastNotification({ notification, onClose }) {
  const [showPreview, setShowPreview] = useState(false);

  if (!notification) return null;

  return (
    <>
      {/* Toast Notification Banner */}
      <div className="fixed bottom-6 right-6 z-50 max-w-md bg-[#161b24] border border-[#ff9900] shadow-2xl p-4 rounded-sm space-y-2 animate-bounce-short">
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ff9900] animate-ping" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-white">
              📧 AWS SES / SNS Email Broadcast
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white text-sm font-mono leading-none cursor-pointer focus:outline-none"
          >
            &times;
          </button>
        </div>

        <p className="text-xs text-neutral-300 font-sans leading-snug">
          An automated email update was dispatched to all community members following an Organizer action.
        </p>

        <div className="bg-[#0f141c] border border-[#353f4d] p-2 rounded-sm text-[11px] font-mono space-y-1">
          <div className="flex justify-between text-neutral-400">
            <span>Subject:</span>
            <span className="text-[#ff9900] font-bold truncate max-w-[240px]">{notification.subject}</span>
          </div>
          <div className="flex justify-between text-neutral-400">
            <span>Recipients:</span>
            <span className="text-white font-bold">{notification.recipientsCount || 520} AWS Members Notified</span>
          </div>
          <div className="flex justify-between text-neutral-400">
            <span>Service:</span>
            <span className="text-[#0972d3] font-bold">AWS SES & SNS (ap-south-1)</span>
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-1">
          <button
            onClick={() => setShowPreview(true)}
            className="text-[10px] font-mono uppercase font-bold text-[#0972d3] hover:underline bg-[#0972d3]/10 border border-[#0972d3]/30 px-2.5 py-1 rounded-sm cursor-pointer"
          >
            Preview Email Inbox View &rarr;
          </button>
        </div>
      </div>

      {/* Email Inbox Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#161b24] border border-[#353f4d] rounded-sm w-full max-w-xl p-6 space-y-4 shadow-2xl text-sans">
            <div className="flex justify-between items-center border-b border-[#353f4d] pb-3">
              <div className="flex items-center space-x-2">
                <span className="text-base">📬</span>
                <h3 className="text-sm font-mono uppercase tracking-wider text-white font-bold">
                  Email Inbox Preview (Attendee View)
                </h3>
              </div>
              <button
                onClick={() => setShowPreview(false)}
                className="text-neutral-400 hover:text-white text-lg leading-none cursor-pointer focus:outline-none"
              >
                &times;
              </button>
            </div>

            {/* Email Header Metadata */}
            <div className="bg-[#0f141c] border border-[#353f4d] p-3 rounded-sm text-xs font-mono space-y-1.5">
              <div><span className="text-neutral-500">From:</span> <span className="text-white">AWS Community Day Vadodara &lt;notifications@communityos.aws&gt;</span></div>
              <div><span className="text-neutral-500">To:</span> <span className="text-white">all-attendees@aws-community-vadodara.org (520 members)</span></div>
              <div><span className="text-neutral-500">Subject:</span> <span className="text-[#ff9900] font-bold">{notification.subject}</span></div>
              <div><span className="text-neutral-500">Date:</span> <span className="text-neutral-400">Just now ({new Date().toLocaleTimeString()})</span></div>
            </div>

            {/* Email Body Content */}
            <div className="bg-[#0f141c] border border-[#353f4d] p-5 rounded-sm space-y-3 text-xs text-neutral-200 leading-relaxed font-sans">
              <div className="border-b border-[#353f4d] pb-2 font-mono font-bold text-[#ff9900] text-sm">
                AWS Community Day Vadodara Update 🚀
              </div>
              <p>Hello Community Member,</p>
              <p className="text-neutral-300">
                An Organizer just published an update or modification on <strong>CommunityOS</strong>:
              </p>
              <div className="bg-[#161b24] border-l-2 border-[#ff9900] p-3 text-white font-mono text-[11px] rounded-r-sm">
                {notification.body || notification.subject}
              </div>
              <p className="text-neutral-400 text-[11px]">
                Log into your CommunityOS dashboard to view the latest session Q&A, resources, and live attendee connections.
              </p>
              <div className="border-t border-[#353f4d] pt-3 text-[10px] text-neutral-500 font-mono">
                Sent automatically via AWS Simple Email Service (SES) & SNS Pub/Sub | AWS User Group Vadodara
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setShowPreview(false)}
                className="bg-[#353f4d] hover:bg-[#4a5768] text-white px-4 py-1.5 text-xs font-mono uppercase font-bold rounded-sm cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
