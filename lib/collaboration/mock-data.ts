// ─────────────────────────────────────────────────────────────────────────────
// RTM OS — Task Collaboration Mock Data
// Realistic examples spanning multiple projects
// ─────────────────────────────────────────────────────────────────────────────

import type {
  TaskCollaboration,
  TaskComment,
  InternalNote,
  ClientNote,
  TaskAttachment,
  TaskWatcher,
  ApprovalStep,
  ActivityEvent,
  TaskDependencyItem,
  CollabNotificationEvent,
  EscalationRecord,
  AICollaborationSummary,
} from "./types";

// ── Shared Team ──────────────────────────────────────────────────────────────

const TEAM = {
  priya:   { id: "u3", name: "Priya Nair",       initials: "PN", color: "#7C3AED" },
  jessica: { id: "u1", name: "Jessica Reyes",     initials: "JR", color: "#1B4FD8" },
  marcus:  { id: "u2", name: "Marcus Webb",       initials: "MW", color: "#059669" },
  daniel:  { id: "u4", name: "Daniel Okonkwo",   initials: "DO", color: "#D97706" },
  sofia:   { id: "u5", name: "Sofia Castillo",   initials: "SC", color: "#DC2626" },
  aaron:   { id: "u6", name: "Aaron Park",       initials: "AP", color: "#0891B2" },
  lily:    { id: "u7", name: "Lily Chen",        initials: "LC", color: "#BE185D" },
  ryan:    { id: "u8", name: "Ryan Torres",      initials: "RT", color: "#065F46" },
};

// ── TASK 1: Horizon Dental — Technical SEO Audit ─────────────────────────────

const comments_t1: TaskComment[] = [
  {
    id: "c-t1-1",
    authorId: TEAM.aaron.id,
    authorName: TEAM.aaron.name,
    authorInitials: TEAM.aaron.initials,
    authorColor: TEAM.aaron.color,
    body: "Kicked off the technical audit today. Screaming Frog crawl is running. Will have initial findings by EOD tomorrow.",
    mentions: [],
    attachments: [],
    status: "Active",
    createdAt: "2025-07-22T09:14:00Z",
    pinned: false,
    resolved: false,
    replies: [],
  },
  {
    id: "c-t1-2",
    authorId: TEAM.priya.id,
    authorName: TEAM.priya.name,
    authorInitials: TEAM.priya.initials,
    authorColor: TEAM.priya.color,
    body: "Great. @Aaron Park — can you also flag any redirect chains? The client mentioned their old site had a lot of them.",
    mentions: [{ id: "m1", kind: "user", label: "@Aaron Park" }],
    attachments: [],
    status: "Active",
    createdAt: "2025-07-22T10:30:00Z",
    pinned: false,
    resolved: false,
    replies: [
      {
        id: "r-c-t1-2-1",
        authorId: TEAM.aaron.id,
        authorName: TEAM.aaron.name,
        authorInitials: TEAM.aaron.initials,
        authorColor: TEAM.aaron.color,
        body: "On it — will include a full redirect map in the audit report.",
        mentions: [],
        createdAt: "2025-07-22T10:45:00Z",
      },
    ],
  },
  {
    id: "c-t1-3",
    authorId: TEAM.marcus.id,
    authorName: TEAM.marcus.name,
    authorInitials: TEAM.marcus.initials,
    authorColor: TEAM.marcus.color,
    body: "Just noticed the audit is now 2 days from its due date. @SEO Manager — do we need to escalate timeline?",
    mentions: [{ id: "m2", kind: "role", label: "@SEO Manager" }],
    attachments: [],
    status: "Pinned",
    createdAt: "2025-07-26T14:00:00Z",
    pinned: true,
    resolved: false,
    replies: [],
  },
  {
    id: "c-t1-4",
    authorId: TEAM.aaron.id,
    authorName: TEAM.aaron.name,
    authorInitials: TEAM.aaron.initials,
    authorColor: TEAM.aaron.color,
    body: "Audit report is complete and uploaded. Identified 47 broken links, 3 redirect chains, and 12 missing meta descriptions. Report attached.",
    mentions: [],
    attachments: [
      { id: "att-c1", fileName: "Horizon-Dental-Technical-Audit-Jul2025.pdf", fileType: "pdf", url: "#" },
    ],
    status: "Active",
    createdAt: "2025-07-28T16:30:00Z",
    pinned: false,
    resolved: false,
    replies: [],
  },
];

const internalNotes_t1: InternalNote[] = [
  {
    id: "in-t1-1",
    authorId: TEAM.priya.id,
    authorName: TEAM.priya.name,
    authorInitials: TEAM.priya.initials,
    authorColor: TEAM.priya.color,
    department: "Account Management",
    priority: "Medium",
    body: "Client is easy to work with but slow to respond to emails. Give 48 hours before follow-up.",
    createdAt: "2025-07-15T09:00:00Z",
  },
  {
    id: "in-t1-2",
    authorId: TEAM.aaron.id,
    authorName: TEAM.aaron.name,
    authorInitials: TEAM.aaron.initials,
    authorColor: TEAM.aaron.color,
    department: "SEO",
    priority: "High",
    body: "Waiting for keyword research tool renewal before completing full audit phase. Tool expires July 31. Need manager to authorize renewal.",
    createdAt: "2025-07-10T09:00:00Z",
  },
  {
    id: "in-t1-3",
    authorId: TEAM.marcus.id,
    authorName: TEAM.marcus.name,
    authorInitials: TEAM.marcus.initials,
    authorColor: TEAM.marcus.color,
    department: "SEO",
    priority: "Urgent",
    body: "Need manager review on the redirect chain recommendations before sending to client. Some changes could impact rankings short-term.",
    createdAt: "2025-07-28T17:00:00Z",
  },
];

const clientNotes_t1: ClientNote[] = [
  {
    id: "cn-t1-1",
    authorId: TEAM.priya.id,
    authorName: TEAM.priya.name,
    authorInitials: TEAM.priya.initials,
    authorColor: TEAM.priya.color,
    source: "Phone Call",
    body: "Client (Dr. Hammond) called to confirm kickoff. He's very focused on local rankings for their third location in Westfield. Mentioned a competitor (ClearSmile Dental) they want to outrank.",
    createdAt: "2025-07-15T11:00:00Z",
  },
  {
    id: "cn-t1-2",
    authorId: TEAM.priya.id,
    authorName: TEAM.priya.name,
    authorInitials: TEAM.priya.initials,
    authorColor: TEAM.priya.color,
    source: "Email",
    body: "Client requested that all audit findings be presented in a simplified summary before the full report. They do not want raw Screaming Frog data — they prefer a narrative format.",
    createdAt: "2025-07-20T10:00:00Z",
  },
];

const attachments_t1: TaskAttachment[] = [
  {
    id: "att-t1-1",
    fileName: "Horizon-Dental-Technical-Audit-Jul2025.pdf",
    fileType: "pdf",
    category: "Audit",
    uploadedBy: TEAM.aaron.name,
    uploadedByInitials: TEAM.aaron.initials,
    uploadedByColor: TEAM.aaron.color,
    uploadDate: "2025-07-28T16:30:00Z",
    status: "Active",
    sizeKB: 1840,
  },
  {
    id: "att-t1-2",
    fileName: "Horizon-Dental-Redirect-Map.xlsx",
    fileType: "xlsx",
    category: "Spreadsheet",
    uploadedBy: TEAM.aaron.name,
    uploadedByInitials: TEAM.aaron.initials,
    uploadedByColor: TEAM.aaron.color,
    uploadDate: "2025-07-28T16:35:00Z",
    status: "Active",
    sizeKB: 220,
  },
  {
    id: "att-t1-3",
    fileName: "Kickoff-Call-Notes.docx",
    fileType: "docx",
    category: "Other",
    uploadedBy: TEAM.priya.name,
    uploadedByInitials: TEAM.priya.initials,
    uploadedByColor: TEAM.priya.color,
    uploadDate: "2025-07-15T12:00:00Z",
    status: "Active",
    sizeKB: 95,
  },
];

const watchers_t1: TaskWatcher[] = [
  { id: TEAM.priya.id, name: TEAM.priya.name, initials: TEAM.priya.initials, avatarColor: TEAM.priya.color, role: "Account Manager", department: "Account Management", watching: true },
  { id: TEAM.marcus.id, name: TEAM.marcus.name, initials: TEAM.marcus.initials, avatarColor: TEAM.marcus.color, role: "SEO Specialist", department: "SEO", watching: true },
  { id: TEAM.daniel.id, name: TEAM.daniel.name, initials: TEAM.daniel.initials, avatarColor: TEAM.daniel.color, role: "Department Head", department: "SEO", watching: true },
];

const approvals_t1: ApprovalStep[] = [
  {
    id: "appr-t1-1",
    stepName: "SEO Audit Strategy Approval",
    approver: TEAM.daniel.name,
    approverInitials: TEAM.daniel.initials,
    approverColor: TEAM.daniel.color,
    reviewer: TEAM.marcus.name,
    reviewerInitials: TEAM.marcus.initials,
    reviewerColor: TEAM.marcus.color,
    status: "Approved",
    decision: "Approved with minor notes on redirect handling",
    notes: "Proceed with keyword map. Address redirect chains in phase 2.",
    requestedAt: "2025-07-26T09:00:00Z",
    completedAt: "2025-07-27T14:00:00Z",
  },
  {
    id: "appr-t1-2",
    stepName: "Client Report Approval",
    approver: TEAM.priya.name,
    approverInitials: TEAM.priya.initials,
    approverColor: TEAM.priya.color,
    status: "Pending Approval",
    requestedAt: "2025-07-28T17:00:00Z",
  },
];

const activity_t1: ActivityEvent[] = [
  { id: "ev-t1-1", eventType: "Task Created", userId: TEAM.jessica.id, userName: TEAM.jessica.name, userInitials: TEAM.jessica.initials, userColor: TEAM.jessica.color, timestamp: "2025-07-15T08:00:00Z", notes: "Task created from project template" },
  { id: "ev-t1-2", eventType: "Task Assigned", userId: TEAM.jessica.id, userName: TEAM.jessica.name, userInitials: TEAM.jessica.initials, userColor: TEAM.jessica.color, timestamp: "2025-07-15T08:05:00Z", notes: "Assigned to Aaron Park", meta: { assignee: "Aaron Park" } },
  { id: "ev-t1-3", eventType: "Watcher Added", userId: TEAM.priya.id, userName: TEAM.priya.name, userInitials: TEAM.priya.initials, userColor: TEAM.priya.color, timestamp: "2025-07-15T09:00:00Z", meta: { watcher: "Priya Nair" } },
  { id: "ev-t1-4", eventType: "Status Changed", userId: TEAM.aaron.id, userName: TEAM.aaron.name, userInitials: TEAM.aaron.initials, userColor: TEAM.aaron.color, timestamp: "2025-07-22T09:00:00Z", notes: "Open → In Progress", meta: { from: "Open", to: "In Progress" } },
  { id: "ev-t1-5", eventType: "Comment Added", userId: TEAM.aaron.id, userName: TEAM.aaron.name, userInitials: TEAM.aaron.initials, userColor: TEAM.aaron.color, timestamp: "2025-07-22T09:14:00Z" },
  { id: "ev-t1-6", eventType: "Mention Added", userId: TEAM.priya.id, userName: TEAM.priya.name, userInitials: TEAM.priya.initials, userColor: TEAM.priya.color, timestamp: "2025-07-22T10:30:00Z", meta: { mentioned: "@Aaron Park" } },
  { id: "ev-t1-7", eventType: "Approval Requested", userId: TEAM.aaron.id, userName: TEAM.aaron.name, userInitials: TEAM.aaron.initials, userColor: TEAM.aaron.color, timestamp: "2025-07-26T09:00:00Z", notes: "SEO Audit Strategy Approval requested" },
  { id: "ev-t1-8", eventType: "Approval Completed", userId: TEAM.daniel.id, userName: TEAM.daniel.name, userInitials: TEAM.daniel.initials, userColor: TEAM.daniel.color, timestamp: "2025-07-27T14:00:00Z", notes: "Approved with notes" },
  { id: "ev-t1-9", eventType: "Attachment Uploaded", userId: TEAM.aaron.id, userName: TEAM.aaron.name, userInitials: TEAM.aaron.initials, userColor: TEAM.aaron.color, timestamp: "2025-07-28T16:30:00Z", meta: { file: "Horizon-Dental-Technical-Audit-Jul2025.pdf" } },
  { id: "ev-t1-10", eventType: "Approval Requested", userId: TEAM.aaron.id, userName: TEAM.aaron.name, userInitials: TEAM.aaron.initials, userColor: TEAM.aaron.color, timestamp: "2025-07-28T17:00:00Z", notes: "Client Report Approval requested" },
];

const dependencies_t1: TaskDependencyItem[] = [
  {
    id: "dep-t1-1",
    scope: "Task",
    name: "Keyword Gap Analysis",
    status: "Satisfied",
    owner: TEAM.priya.name,
    dueDate: "2025-07-07",
    notes: "Completed on time",
  },
  {
    id: "dep-t1-2",
    scope: "Task",
    name: "Client Access — GA4 + Search Console",
    status: "Satisfied",
    owner: TEAM.priya.name,
    dueDate: "2025-07-18",
    notes: "Access received July 17",
  },
];

const notifications_t1: CollabNotificationEvent[] = [
  { id: "notif-t1-1", type: "Comment Added", taskId: "t-001-2-1", taskName: "Technical SEO Audit", projectName: "Horizon Dental — SEO Launch", triggeredBy: TEAM.aaron.name, recipient: TEAM.priya.name, timestamp: "2025-07-22T09:14:00Z", read: true, message: "Aaron Park commented on Technical SEO Audit" },
  { id: "notif-t1-2", type: "Mention Added", taskId: "t-001-2-1", taskName: "Technical SEO Audit", projectName: "Horizon Dental — SEO Launch", triggeredBy: TEAM.priya.name, recipient: TEAM.aaron.name, timestamp: "2025-07-22T10:30:00Z", read: true, message: "Priya Nair mentioned you in a comment" },
  { id: "notif-t1-3", type: "Approval Requested", taskId: "t-001-2-1", taskName: "Technical SEO Audit", projectName: "Horizon Dental — SEO Launch", triggeredBy: TEAM.aaron.name, recipient: TEAM.priya.name, timestamp: "2025-07-28T17:00:00Z", read: false, message: "Client Report Approval is pending your review" },
];

// ── TASK 2: Maple Ridge — Landing Page Development ────────────────────────────

const comments_t2: TaskComment[] = [
  {
    id: "c-t2-1",
    authorId: TEAM.sofia.id,
    authorName: TEAM.sofia.name,
    authorInitials: TEAM.sofia.initials,
    authorColor: TEAM.sofia.color,
    body: "Wireframes are done. Sharing the Figma link for review before we move to dev. @Account Manager please review client brand guidelines before approving.",
    mentions: [{ id: "m3", kind: "role", label: "@Account Manager" }],
    attachments: [],
    status: "Active",
    createdAt: "2025-07-18T13:00:00Z",
    pinned: false,
    resolved: false,
    replies: [
      {
        id: "r-c-t2-1-1",
        authorId: TEAM.daniel.id,
        authorName: TEAM.daniel.name,
        authorInitials: TEAM.daniel.initials,
        authorColor: TEAM.daniel.color,
        body: "Reviewed. Looks great. Client uses Helvetica Neue and their primary is #1A3D6E. Make sure CTAs match.",
        mentions: [],
        createdAt: "2025-07-18T15:00:00Z",
      },
    ],
  },
  {
    id: "c-t2-2",
    authorId: TEAM.ryan.id,
    authorName: TEAM.ryan.name,
    authorInitials: TEAM.ryan.initials,
    authorColor: TEAM.ryan.color,
    body: "Development started. One blocker — @Billing the client's hosting access hasn't been granted yet. We can't deploy until we have that.",
    mentions: [{ id: "m4", kind: "department", label: "@Billing" }],
    attachments: [],
    status: "Pinned",
    createdAt: "2025-07-20T10:00:00Z",
    pinned: true,
    resolved: false,
    replies: [],
  },
  {
    id: "c-t2-3",
    authorId: TEAM.lily.id,
    authorName: TEAM.lily.name,
    authorInitials: TEAM.lily.initials,
    authorColor: TEAM.lily.color,
    body: "This task is now 3 days overdue. @Department Head escalation needed.",
    mentions: [{ id: "m5", kind: "role", label: "@Department Head" }],
    attachments: [],
    status: "Active",
    createdAt: "2025-07-23T09:00:00Z",
    pinned: false,
    resolved: false,
    replies: [],
  },
];

const internalNotes_t2: InternalNote[] = [
  {
    id: "in-t2-1",
    authorId: TEAM.daniel.id,
    authorName: TEAM.daniel.name,
    authorInitials: TEAM.daniel.initials,
    authorColor: TEAM.daniel.color,
    department: "Account Management",
    priority: "Urgent",
    body: "Waiting for payment. Client's invoice for month 1 is overdue by 7 days. Do NOT deliver the landing page until billing confirms payment or puts account on hold.",
    createdAt: "2025-07-20T08:00:00Z",
  },
  {
    id: "in-t2-2",
    authorId: TEAM.ryan.id,
    authorName: TEAM.ryan.name,
    authorInitials: TEAM.ryan.initials,
    authorColor: TEAM.ryan.color,
    department: "Web Development",
    priority: "High",
    body: "Client's WordPress installation is on an outdated version (5.9). Will need upgrade before launch or there are security risks. Flagging for IT review.",
    createdAt: "2025-07-21T11:30:00Z",
  },
  {
    id: "in-t2-3",
    authorId: TEAM.jessica.id,
    authorName: TEAM.jessica.name,
    authorInitials: TEAM.jessica.initials,
    authorColor: TEAM.jessica.color,
    department: "Account Management",
    priority: "High",
    body: "Waiting for client approval on final design mockups. AM follow-up email sent 2025-07-22. If no response by 2025-07-25, escalate to department head.",
    createdAt: "2025-07-22T09:00:00Z",
  },
];

const clientNotes_t2: ClientNote[] = [
  {
    id: "cn-t2-1",
    authorId: TEAM.daniel.id,
    authorName: TEAM.daniel.name,
    authorInitials: TEAM.daniel.initials,
    authorColor: TEAM.daniel.color,
    source: "Meeting",
    body: "Client (Dr. Singh) requested a launch delay to August 1st. They are running an internal promotion that they want to align with the new landing page launch.",
    createdAt: "2025-07-17T14:00:00Z",
  },
  {
    id: "cn-t2-2",
    authorId: TEAM.daniel.id,
    authorName: TEAM.daniel.name,
    authorInitials: TEAM.daniel.initials,
    authorColor: TEAM.daniel.color,
    source: "Email",
    body: "Client approved the initial wireframes via email. Written approval received and saved. They requested one revision: move the contact form above the fold.",
    createdAt: "2025-07-19T10:00:00Z",
  },
  {
    id: "cn-t2-3",
    authorId: TEAM.daniel.id,
    authorName: TEAM.daniel.name,
    authorInitials: TEAM.daniel.initials,
    authorColor: TEAM.daniel.color,
    source: "Phone Call",
    body: "Client requested content revisions on the hero section. They want to replace stock photography with photos from their clinic. Waiting on client to provide assets.",
    createdAt: "2025-07-22T11:00:00Z",
  },
];

const attachments_t2: TaskAttachment[] = [
  {
    id: "att-t2-1",
    fileName: "MapleRidge-LandingPage-Wireframes-v1.pdf",
    fileType: "pdf",
    category: "Creative Asset",
    uploadedBy: TEAM.sofia.name,
    uploadedByInitials: TEAM.sofia.initials,
    uploadedByColor: TEAM.sofia.color,
    uploadDate: "2025-07-18T12:00:00Z",
    status: "Superseded",
    sizeKB: 3200,
  },
  {
    id: "att-t2-2",
    fileName: "MapleRidge-LandingPage-Wireframes-v2.pdf",
    fileType: "pdf",
    category: "Creative Asset",
    uploadedBy: TEAM.sofia.name,
    uploadedByInitials: TEAM.sofia.initials,
    uploadedByColor: TEAM.sofia.color,
    uploadDate: "2025-07-20T14:00:00Z",
    status: "Active",
    sizeKB: 3400,
  },
  {
    id: "att-t2-3",
    fileName: "MapleRidge-Client-Contract-2025.pdf",
    fileType: "pdf",
    category: "Contract",
    uploadedBy: TEAM.jessica.name,
    uploadedByInitials: TEAM.jessica.initials,
    uploadedByColor: TEAM.jessica.color,
    uploadDate: "2025-07-10T09:00:00Z",
    status: "Active",
    sizeKB: 750,
  },
  {
    id: "att-t2-4",
    fileName: "MapleRidge-Access-Request-Form.pdf",
    fileType: "pdf",
    category: "Access Request",
    uploadedBy: TEAM.ryan.name,
    uploadedByInitials: TEAM.ryan.initials,
    uploadedByColor: TEAM.ryan.color,
    uploadDate: "2025-07-16T10:00:00Z",
    status: "Active",
    sizeKB: 180,
  },
];

const watchers_t2: TaskWatcher[] = [
  { id: TEAM.daniel.id, name: TEAM.daniel.name, initials: TEAM.daniel.initials, avatarColor: TEAM.daniel.color, role: "Account Manager", department: "Account Management", watching: true },
  { id: TEAM.sofia.id, name: TEAM.sofia.name, initials: TEAM.sofia.initials, avatarColor: TEAM.sofia.color, role: "Creative Director", department: "Design", watching: true },
  { id: TEAM.jessica.id, name: TEAM.jessica.name, initials: TEAM.jessica.initials, avatarColor: TEAM.jessica.color, role: "Project Owner", department: "Account Management", watching: true },
  { id: TEAM.lily.id, name: TEAM.lily.name, initials: TEAM.lily.initials, avatarColor: TEAM.lily.color, role: "Department Head", department: "Web Development", watching: true },
  { id: TEAM.marcus.id, name: TEAM.marcus.name, initials: TEAM.marcus.initials, avatarColor: TEAM.marcus.color, role: "Executive", department: "Leadership", watching: false },
];

const approvals_t2: ApprovalStep[] = [
  {
    id: "appr-t2-1",
    stepName: "Landing Page Design Approval",
    approver: TEAM.daniel.name,
    approverInitials: TEAM.daniel.initials,
    approverColor: TEAM.daniel.color,
    reviewer: TEAM.sofia.name,
    reviewerInitials: TEAM.sofia.initials,
    reviewerColor: TEAM.sofia.color,
    status: "Approved",
    decision: "Approved",
    notes: "Client approved wireframes v2. Contact form moved above fold per client request.",
    requestedAt: "2025-07-18T13:00:00Z",
    completedAt: "2025-07-19T10:00:00Z",
  },
  {
    id: "appr-t2-2",
    stepName: "Landing Page Launch Approval",
    approver: TEAM.jessica.name,
    approverInitials: TEAM.jessica.initials,
    approverColor: TEAM.jessica.color,
    status: "Pending Approval",
    notes: "Waiting on billing to confirm payment before launch can proceed.",
    requestedAt: "2025-07-22T09:00:00Z",
  },
  {
    id: "appr-t2-3",
    stepName: "Content Final Approval",
    approver: TEAM.daniel.name,
    approverInitials: TEAM.daniel.initials,
    approverColor: TEAM.daniel.color,
    status: "Needs Revision",
    decision: "Rejected — content needs revision",
    notes: "Client wants clinic photos instead of stock photography. Content team to revise hero section.",
    requestedAt: "2025-07-20T15:00:00Z",
    completedAt: "2025-07-22T11:00:00Z",
  },
];

const activity_t2: ActivityEvent[] = [
  { id: "ev-t2-1", eventType: "Task Created", userId: TEAM.jessica.id, userName: TEAM.jessica.name, userInitials: TEAM.jessica.initials, userColor: TEAM.jessica.color, timestamp: "2025-07-10T08:00:00Z" },
  { id: "ev-t2-2", eventType: "Task Assigned", userId: TEAM.jessica.id, userName: TEAM.jessica.name, userInitials: TEAM.jessica.initials, userColor: TEAM.jessica.color, timestamp: "2025-07-10T08:10:00Z", meta: { assignee: "Ryan Torres & Sofia Castillo" } },
  { id: "ev-t2-3", eventType: "Due Date Changed", userId: TEAM.daniel.id, userName: TEAM.daniel.name, userInitials: TEAM.daniel.initials, userColor: TEAM.daniel.color, timestamp: "2025-07-17T14:00:00Z", notes: "Client requested delay to Aug 1", meta: { from: "2025-07-20", to: "2025-08-01" } },
  { id: "ev-t2-4", eventType: "Attachment Uploaded", userId: TEAM.sofia.id, userName: TEAM.sofia.name, userInitials: TEAM.sofia.initials, userColor: TEAM.sofia.color, timestamp: "2025-07-18T12:00:00Z", meta: { file: "MapleRidge-LandingPage-Wireframes-v1.pdf" } },
  { id: "ev-t2-5", eventType: "Approval Requested", userId: TEAM.sofia.id, userName: TEAM.sofia.name, userInitials: TEAM.sofia.initials, userColor: TEAM.sofia.color, timestamp: "2025-07-18T13:00:00Z", notes: "Landing Page Design Approval requested" },
  { id: "ev-t2-6", eventType: "Approval Completed", userId: TEAM.daniel.id, userName: TEAM.daniel.name, userInitials: TEAM.daniel.initials, userColor: TEAM.daniel.color, timestamp: "2025-07-19T10:00:00Z", notes: "Design approved" },
  { id: "ev-t2-7", eventType: "Status Changed", userId: TEAM.ryan.id, userName: TEAM.ryan.name, userInitials: TEAM.ryan.initials, userColor: TEAM.ryan.color, timestamp: "2025-07-20T10:00:00Z", meta: { from: "Open", to: "In Progress" } },
  { id: "ev-t2-8", eventType: "Blocker Added", userId: TEAM.ryan.id, userName: TEAM.ryan.name, userInitials: TEAM.ryan.initials, userColor: TEAM.ryan.color, timestamp: "2025-07-20T10:05:00Z", notes: "Hosting access not granted" },
  { id: "ev-t2-9", eventType: "Approval Requested", userId: TEAM.sofia.id, userName: TEAM.sofia.name, userInitials: TEAM.sofia.initials, userColor: TEAM.sofia.color, timestamp: "2025-07-20T15:00:00Z", notes: "Content Final Approval requested" },
  { id: "ev-t2-10", eventType: "Approval Completed", userId: TEAM.daniel.id, userName: TEAM.daniel.name, userInitials: TEAM.daniel.initials, userColor: TEAM.daniel.color, timestamp: "2025-07-22T11:00:00Z", notes: "Content rejected — needs revision" },
  { id: "ev-t2-11", eventType: "Status Changed", userId: TEAM.lily.id, userName: TEAM.lily.name, userInitials: TEAM.lily.initials, userColor: TEAM.lily.color, timestamp: "2025-07-23T08:00:00Z", meta: { from: "In Progress", to: "Blocked" } },
];

const dependencies_t2: TaskDependencyItem[] = [
  {
    id: "dep-t2-1",
    scope: "Task",
    name: "Client Hosting Access",
    status: "Blocked",
    blockerReason: "Waiting on Client Access",
    owner: TEAM.daniel.name,
    dueDate: "2025-07-20",
    notes: "Access form sent July 16. No response from client as of July 23.",
  },
  {
    id: "dep-t2-2",
    scope: "Task",
    name: "Billing Payment Confirmation",
    status: "Blocked",
    blockerReason: "Waiting on Billing",
    owner: TEAM.jessica.name,
    dueDate: "2025-07-15",
    notes: "Invoice overdue by 7 days. Launch on hold.",
  },
  {
    id: "dep-t2-3",
    scope: "Task",
    name: "Content Revision — Hero Section",
    status: "Pending",
    blockerReason: "Waiting on Client Access",
    owner: TEAM.sofia.name,
    dueDate: "2025-07-25",
    notes: "Waiting on client to provide clinic photos.",
  },
];

const notifications_t2: CollabNotificationEvent[] = [
  { id: "notif-t2-1", type: "Dependency Blocked", taskId: "t-002-lp", taskName: "Landing Page Development", projectName: "Maple Ridge Clinic — SEO + GBP", triggeredBy: "System", recipient: TEAM.jessica.name, timestamp: "2025-07-20T10:05:00Z", read: false, message: "Task blocked: Hosting access not yet granted" },
  { id: "notif-t2-2", type: "Task Overdue", taskId: "t-002-lp", taskName: "Landing Page Development", projectName: "Maple Ridge Clinic — SEO + GBP", triggeredBy: "System", recipient: TEAM.daniel.name, timestamp: "2025-07-23T08:00:00Z", read: false, message: "Landing Page Development is 3 days overdue" },
  { id: "notif-t2-3", type: "Approval Requested", taskId: "t-002-lp", taskName: "Landing Page Development", projectName: "Maple Ridge Clinic — SEO + GBP", triggeredBy: TEAM.ryan.name, recipient: TEAM.jessica.name, timestamp: "2025-07-22T09:00:00Z", read: false, message: "Landing Page Launch Approval is pending your review" },
  { id: "notif-t2-4", type: "Project Escalated", taskId: "t-002-lp", taskName: "Landing Page Development", projectName: "Maple Ridge Clinic — SEO + GBP", triggeredBy: TEAM.lily.name, recipient: TEAM.marcus.name, timestamp: "2025-07-23T09:00:00Z", read: false, message: "Project escalated — Maple Ridge landing page is blocked and overdue" },
];

// ── TASK 3: PPC Campaign Launch ───────────────────────────────────────────────

const comments_t3: TaskComment[] = [
  {
    id: "c-t3-1",
    authorId: TEAM.marcus.id,
    authorName: TEAM.marcus.name,
    authorInitials: TEAM.marcus.initials,
    authorColor: TEAM.marcus.color,
    body: "Google Ads account created and linked to MCC. Campaign structure built. Waiting on client to approve ad copy before going live.",
    mentions: [],
    attachments: [],
    status: "Active",
    createdAt: "2025-07-19T10:00:00Z",
    pinned: false,
    resolved: false,
    replies: [],
  },
  {
    id: "c-t3-2",
    authorId: TEAM.priya.id,
    authorName: TEAM.priya.name,
    authorInitials: TEAM.priya.initials,
    authorColor: TEAM.priya.color,
    body: "Client approved ad copy via email! Attached is the written approval. @Marcus Webb — you're clear to go live.",
    mentions: [{ id: "m6", kind: "user", label: "@Marcus Webb" }],
    attachments: [
      { id: "att-c3", fileName: "AdCopy-Client-Approval-Email.pdf", fileType: "pdf", url: "#" },
    ],
    status: "Resolved",
    createdAt: "2025-07-21T14:30:00Z",
    pinned: false,
    resolved: true,
    replies: [
      {
        id: "r-c-t3-2-1",
        authorId: TEAM.marcus.id,
        authorName: TEAM.marcus.name,
        authorInitials: TEAM.marcus.initials,
        authorColor: TEAM.marcus.color,
        body: "Campaign is live as of 3 PM. Monitoring performance.",
        mentions: [],
        createdAt: "2025-07-21T15:00:00Z",
      },
    ],
  },
];

const internalNotes_t3: InternalNote[] = [
  {
    id: "in-t3-1",
    authorId: TEAM.marcus.id,
    authorName: TEAM.marcus.name,
    authorInitials: TEAM.marcus.initials,
    authorColor: TEAM.marcus.color,
    department: "Meta Ads & PPC",
    priority: "High",
    body: "Client's Google Ads budget is $3,000/mo. They have a $500 setup fee outstanding. Confirm with Billing before increasing spend.",
    createdAt: "2025-07-18T09:00:00Z",
  },
];

const clientNotes_t3: ClientNote[] = [
  {
    id: "cn-t3-1",
    authorId: TEAM.priya.id,
    authorName: TEAM.priya.name,
    authorInitials: TEAM.priya.initials,
    authorColor: TEAM.priya.color,
    source: "Email",
    body: "Client approved SEO strategy and agreed to the keyword list on July 14. Written email confirmation received.",
    createdAt: "2025-07-14T16:00:00Z",
  },
  {
    id: "cn-t3-2",
    authorId: TEAM.priya.id,
    authorName: TEAM.priya.name,
    authorInitials: TEAM.priya.initials,
    authorColor: TEAM.priya.color,
    source: "Phone Call",
    body: "Client approved all ad copy on July 21 via phone. Followed up with email confirmation. Client emphasized they want calls only — no form fills.",
    createdAt: "2025-07-21T14:00:00Z",
  },
];

const attachments_t3: TaskAttachment[] = [
  {
    id: "att-t3-1",
    fileName: "PPC-Campaign-Structure-Q3.xlsx",
    fileType: "xlsx",
    category: "Report",
    uploadedBy: TEAM.marcus.name,
    uploadedByInitials: TEAM.marcus.initials,
    uploadedByColor: TEAM.marcus.color,
    uploadDate: "2025-07-19T09:00:00Z",
    status: "Active",
    sizeKB: 440,
  },
  {
    id: "att-t3-2",
    fileName: "AdCopy-Client-Approval-Email.pdf",
    fileType: "pdf",
    category: "Other",
    uploadedBy: TEAM.priya.name,
    uploadedByInitials: TEAM.priya.initials,
    uploadedByColor: TEAM.priya.color,
    uploadDate: "2025-07-21T14:30:00Z",
    status: "Active",
    sizeKB: 120,
  },
  {
    id: "att-t3-3",
    fileName: "PPC-Performance-Week1-Report.pdf",
    fileType: "pdf",
    category: "Report",
    uploadedBy: TEAM.marcus.name,
    uploadedByInitials: TEAM.marcus.initials,
    uploadedByColor: TEAM.marcus.color,
    uploadDate: "2025-07-28T10:00:00Z",
    status: "Active",
    sizeKB: 680,
  },
];

const watchers_t3: TaskWatcher[] = [
  { id: TEAM.priya.id, name: TEAM.priya.name, initials: TEAM.priya.initials, avatarColor: TEAM.priya.color, role: "Account Manager", department: "Account Management", watching: true },
  { id: TEAM.jessica.id, name: TEAM.jessica.name, initials: TEAM.jessica.initials, avatarColor: TEAM.jessica.color, role: "Department Head", department: "Meta Ads & PPC", watching: true },
];

const approvals_t3: ApprovalStep[] = [
  {
    id: "appr-t3-1",
    stepName: "Ad Copy Approval",
    approver: TEAM.priya.name,
    approverInitials: TEAM.priya.initials,
    approverColor: TEAM.priya.color,
    reviewer: TEAM.marcus.name,
    reviewerInitials: TEAM.marcus.initials,
    reviewerColor: TEAM.marcus.color,
    status: "Approved",
    decision: "Approved — client confirmed via email",
    notes: "Written approval received. Attached as PDF.",
    requestedAt: "2025-07-19T10:00:00Z",
    completedAt: "2025-07-21T14:30:00Z",
  },
  {
    id: "appr-t3-2",
    stepName: "Campaign Launch Approval",
    approver: TEAM.jessica.name,
    approverInitials: TEAM.jessica.initials,
    approverColor: TEAM.jessica.color,
    status: "Approved",
    decision: "Approved",
    requestedAt: "2025-07-21T14:00:00Z",
    completedAt: "2025-07-21T14:45:00Z",
  },
];

const activity_t3: ActivityEvent[] = [
  { id: "ev-t3-1", eventType: "Task Created", userId: TEAM.jessica.id, userName: TEAM.jessica.name, userInitials: TEAM.jessica.initials, userColor: TEAM.jessica.color, timestamp: "2025-07-15T08:00:00Z" },
  { id: "ev-t3-2", eventType: "Task Assigned", userId: TEAM.jessica.id, userName: TEAM.jessica.name, userInitials: TEAM.jessica.initials, userColor: TEAM.jessica.color, timestamp: "2025-07-15T08:05:00Z", meta: { assignee: "Marcus Webb" } },
  { id: "ev-t3-3", eventType: "Status Changed", userId: TEAM.marcus.id, userName: TEAM.marcus.name, userInitials: TEAM.marcus.initials, userColor: TEAM.marcus.color, timestamp: "2025-07-19T10:00:00Z", meta: { from: "Open", to: "In Progress" } },
  { id: "ev-t3-4", eventType: "Approval Requested", userId: TEAM.marcus.id, userName: TEAM.marcus.name, userInitials: TEAM.marcus.initials, userColor: TEAM.marcus.color, timestamp: "2025-07-19T10:00:00Z", notes: "Ad Copy Approval requested" },
  { id: "ev-t3-5", eventType: "Attachment Uploaded", userId: TEAM.priya.id, userName: TEAM.priya.name, userInitials: TEAM.priya.initials, userColor: TEAM.priya.color, timestamp: "2025-07-21T14:30:00Z", meta: { file: "AdCopy-Client-Approval-Email.pdf" } },
  { id: "ev-t3-6", eventType: "Approval Completed", userId: TEAM.priya.id, userName: TEAM.priya.name, userInitials: TEAM.priya.initials, userColor: TEAM.priya.color, timestamp: "2025-07-21T14:30:00Z", notes: "Ad copy approved by client" },
  { id: "ev-t3-7", eventType: "Status Changed", userId: TEAM.marcus.id, userName: TEAM.marcus.name, userInitials: TEAM.marcus.initials, userColor: TEAM.marcus.color, timestamp: "2025-07-21T15:00:00Z", meta: { from: "In Progress", to: "Review" } },
  { id: "ev-t3-8", eventType: "Task Completed", userId: TEAM.jessica.id, userName: TEAM.jessica.name, userInitials: TEAM.jessica.initials, userColor: TEAM.jessica.color, timestamp: "2025-07-21T15:30:00Z" },
];

const dependencies_t3: TaskDependencyItem[] = [
  {
    id: "dep-t3-1",
    scope: "Task",
    name: "Client Ad Copy Approval",
    status: "Satisfied",
    owner: TEAM.priya.name,
    dueDate: "2025-07-21",
    notes: "Approved via email",
  },
  {
    id: "dep-t3-2",
    scope: "Milestone",
    name: "Billing — Setup Fee Collection",
    status: "Pending",
    blockerReason: "Waiting on Billing",
    owner: TEAM.jessica.name,
    notes: "$500 setup fee outstanding. Not blocking launch but escalate if unpaid by Aug 1.",
  },
];

const notifications_t3: CollabNotificationEvent[] = [
  { id: "notif-t3-1", type: "Approval Completed", taskId: "t-003-ppc", taskName: "PPC Campaign Launch", projectName: "PPC + Landing Page Project", triggeredBy: TEAM.priya.name, recipient: TEAM.marcus.name, timestamp: "2025-07-21T14:30:00Z", read: true, message: "Ad Copy Approval completed — you're clear to launch" },
];

// ── Escalations ──────────────────────────────────────────────────────────────────

const escalations_t1: EscalationRecord[] = [
  {
    id: "esc-t1-1",
    level: "L2 - Department Head",
    assignedTeam: "SEO",
    assignedRole: "SEO Department Head",
    assignedUser: TEAM.daniel.name,
    assignedUserInitials: TEAM.daniel.initials,
    assignedUserColor: TEAM.daniel.color,
    trigger: "Approval Bottleneck",
    status: "Resolved",
    createdAt: "2025-07-26T09:00:00Z",
    resolvedAt: "2025-07-27T14:00:00Z",
    resolvedBy: TEAM.daniel.name,
    notes: "SEO Audit Strategy approval was delayed. Daniel reviewed and approved within 24 hours.",
  },
];

const escalations_t2: EscalationRecord[] = [
  {
    id: "esc-t2-1",
    level: "L2 - Department Head",
    assignedTeam: "Web Development",
    assignedRole: "Department Head",
    assignedUser: TEAM.lily.name,
    assignedUserInitials: TEAM.lily.initials,
    assignedUserColor: TEAM.lily.color,
    trigger: "Task Overdue",
    status: "In Progress",
    createdAt: "2025-07-23T08:00:00Z",
    notes: "Landing page is 3 days overdue. Hosting access not granted. Escalated to Lily Chen.",
  },
  {
    id: "esc-t2-2",
    level: "L3 - Account Manager",
    assignedTeam: "Account Management",
    assignedRole: "Account Manager",
    assignedUser: TEAM.jessica.name,
    assignedUserInitials: TEAM.jessica.initials,
    assignedUserColor: TEAM.jessica.color,
    trigger: "Client Access Missing",
    status: "Open",
    createdAt: "2025-07-23T09:00:00Z",
    notes: "Client has not provided hosting access. AM must contact client decision-maker directly.",
  },
  {
    id: "esc-t2-3",
    level: "L4 - Executive",
    assignedTeam: "Leadership",
    assignedRole: "Executive",
    assignedUser: TEAM.marcus.name,
    assignedUserInitials: TEAM.marcus.initials,
    assignedUserColor: TEAM.marcus.color,
    trigger: "Payment Overdue",
    status: "Open",
    createdAt: "2025-07-23T09:15:00Z",
    notes: "Client invoice overdue by 7 days. Launch on hold. Executive visibility required.",
  },
];

const escalations_t3: EscalationRecord[] = [
  {
    id: "esc-t3-1",
    level: "L1 - Team",
    assignedTeam: "Meta Ads & PPC",
    assignedRole: "PPC Specialist",
    assignedUser: TEAM.marcus.name,
    assignedUserInitials: TEAM.marcus.initials,
    assignedUserColor: TEAM.marcus.color,
    trigger: "Approval Bottleneck",
    status: "Resolved",
    createdAt: "2025-07-19T10:00:00Z",
    resolvedAt: "2025-07-21T14:30:00Z",
    resolvedBy: TEAM.priya.name,
    notes: "Ad copy approval was pending. AM obtained written client approval and resolved within 2 days.",
  },
];

// ── AI Collaboration Summaries ─────────────────────────────────────────────────────────────

const aiSummary_t1: AICollaborationSummary = {
  taskId: "t-001-2-1",
  generatedAt: "2025-07-28T18:00:00Z",
  latestUpdates: [
    { category: "update", text: "Technical SEO Audit report completed and uploaded by Aaron Park (Jul 28). Identified 47 broken links, 3 redirect chains, and 12 missing meta descriptions.", urgency: "info" },
    { category: "update", text: "Screaming Frog crawl completed. Full redirect map included in audit report.", urgency: "info" },
  ],
  currentBlockers: [
    { category: "blocker", text: "Client Report Approval is pending review by Priya Nair. No blockers on technical side.", urgency: "warn" },
  ],
  pendingApprovals: [
    { category: "approval", text: "Client Report Approval requested by Aaron Park — Priya Nair must review and approve before sending to client.", urgency: "warn" },
  ],
  recentEscalations: [
    { category: "escalation", text: "Approval bottleneck escalated to Daniel Okonkwo (L2) on Jul 26. Resolved Jul 27 — SEO strategy approved with notes.", urgency: "info" },
  ],
  recommendedActions: [
    { category: "action", text: "Priya Nair should review and approve the Client Report before Jul 30 to avoid delivery delays.", urgency: "warn" },
    { category: "action", text: "Aaron Park should prepare narrative summary of audit findings as client requested simplified format.", urgency: "info" },
  ],
  projectHealthNotes: [
    { category: "health", text: "Project health is GREEN. Technical audit is complete. One approval pending. No critical blockers.", urgency: "info" },
    { category: "health", text: "Keyword strategy and on-page optimization are queued and depend on audit completion.", urgency: "info" },
  ],
};

const aiSummary_t2: AICollaborationSummary = {
  taskId: "t-002-lp",
  generatedAt: "2025-07-23T10:00:00Z",
  latestUpdates: [
    { category: "update", text: "Landing page is currently BLOCKED. Task is 3 days overdue. Dev cannot deploy until hosting access is granted.", urgency: "critical" },
    { category: "update", text: "Content revision needed on hero section — client wants clinic photos instead of stock photography.", urgency: "warn" },
  ],
  currentBlockers: [
    { category: "blocker", text: "Client has not provided hosting access (requested Jul 16). Development cannot deploy.", urgency: "critical" },
    { category: "blocker", text: "Client invoice overdue by 7 days. Launch is on hold per internal policy until billing confirms payment.", urgency: "critical" },
    { category: "blocker", text: "Hero section content pending — waiting on client to provide clinic photographs.", urgency: "warn" },
  ],
  pendingApprovals: [
    { category: "approval", text: "Landing Page Launch Approval awaiting Jessica Reyes — blocked on billing confirmation.", urgency: "critical" },
    { category: "approval", text: "Content Final Approval rejected — needs revision. Client wants clinic photos in hero section.", urgency: "warn" },
  ],
  recentEscalations: [
    { category: "escalation", text: "Task overdue escalation triggered Jul 23. Lily Chen (Department Head) notified. Currently In Progress.", urgency: "warn" },
    { category: "escalation", text: "Client access escalation raised to Account Manager (Jessica Reyes). Open — no resolution yet.", urgency: "warn" },
    { category: "escalation", text: "Payment escalation raised to Executive level (Marcus Webb). Open — executive action required.", urgency: "critical" },
  ],
  recommendedActions: [
    { category: "action", text: "Executive (Marcus Webb) must contact client billing department directly — invoice 7 days overdue.", urgency: "critical" },
    { category: "action", text: "Jessica Reyes should call client to obtain hosting access credentials today.", urgency: "critical" },
    { category: "action", text: "Daniel Okonkwo should follow up on content photo assets from client with 24-hour deadline.", urgency: "warn" },
  ],
  projectHealthNotes: [
    { category: "health", text: "Project health is RED. Three simultaneous blockers: hosting access, payment, and content revision.", urgency: "critical" },
    { category: "health", text: "Revenue impact: monthly retainer at risk if client cancels due to delayed launch.", urgency: "critical" },
  ],
};

const aiSummary_t3: AICollaborationSummary = {
  taskId: "t-003-ppc",
  generatedAt: "2025-07-28T10:00:00Z",
  latestUpdates: [
    { category: "update", text: "Google Ads campaign went live Jul 21. Week 1 performance report uploaded. Campaign generating calls.", urgency: "info" },
    { category: "update", text: "Client approved all ad copy via phone and email on Jul 21. Written approval on file.", urgency: "info" },
  ],
  currentBlockers: [
    { category: "blocker", text: "No active blockers. Campaign is live and performing.", urgency: "info" },
    { category: "blocker", text: "$500 setup fee outstanding — not blocking current operations but should be resolved before Aug 1.", urgency: "warn" },
  ],
  pendingApprovals: [
    { category: "approval", text: "No pending approvals. Both Ad Copy and Campaign Launch approvals completed.", urgency: "info" },
  ],
  recentEscalations: [
    { category: "escalation", text: "No recent escalations. Approval bottleneck resolved quickly on Jul 21.", urgency: "info" },
  ],
  recommendedActions: [
    { category: "action", text: "Marcus Webb should review Week 1 PPC report and prepare client update for this week.", urgency: "info" },
    { category: "action", text: "Follow up with Billing team on $500 outstanding setup fee before Aug 1.", urgency: "warn" },
  ],
  projectHealthNotes: [
    { category: "health", text: "Project health is GREEN. Campaign is live. Client is happy. No critical blockers.", urgency: "info" },
    { category: "health", text: "Client emphasized call-only conversion goal — ensure call extensions and call tracking are active.", urgency: "info" },
  ],
};

// ── Exported Dataset ─────────────────────────────────────────────────────────

export const COLLABORATION_DATA: TaskCollaboration[] = [
  {
    taskId: "t-001-2-1",
    taskName: "Technical SEO Audit",
    projectId: "proj-001",
    projectName: "Horizon Dental — SEO Launch",
    comments: comments_t1,
    internalNotes: internalNotes_t1,
    clientNotes: clientNotes_t1,
    attachments: attachments_t1,
    watchers: watchers_t1,
    approvals: approvals_t1,
    activity: activity_t1,
    dependencies: dependencies_t1,
    notifications: notifications_t1,
    escalations: escalations_t1,
    aiSummary: aiSummary_t1,
  },
  {
    taskId: "t-002-lp",
    taskName: "Landing Page Development",
    projectId: "proj-002",
    projectName: "Maple Ridge Clinic — PPC + Landing Page",
    comments: comments_t2,
    internalNotes: internalNotes_t2,
    clientNotes: clientNotes_t2,
    attachments: attachments_t2,
    watchers: watchers_t2,
    approvals: approvals_t2,
    activity: activity_t2,
    dependencies: dependencies_t2,
    notifications: notifications_t2,
    escalations: escalations_t2,
    aiSummary: aiSummary_t2,
  },
  {
    taskId: "t-003-ppc",
    taskName: "Google Ads Campaign Launch",
    projectId: "proj-003",
    projectName: "Summit HVAC — PPC Campaign",
    comments: comments_t3,
    internalNotes: internalNotes_t3,
    clientNotes: clientNotes_t3,
    attachments: attachments_t3,
    watchers: watchers_t3,
    approvals: approvals_t3,
    activity: activity_t3,
    dependencies: dependencies_t3,
    notifications: notifications_t3,
    escalations: escalations_t3,
    aiSummary: aiSummary_t3,
  },
];

// ── Helper ────────────────────────────────────────────────────────────────────

export function getTaskCollaboration(taskId: string): TaskCollaboration | undefined {
  return COLLABORATION_DATA.find((d) => d.taskId === taskId);
}

// ── All notifications across all tasks (for notification feed) ───────────────

export const ALL_COLLAB_NOTIFICATIONS: CollabNotificationEvent[] = COLLABORATION_DATA.flatMap(
  (d) => d.notifications,
);
