// ─────────────────────────────────────────────────────────────────────────────
// RTM OS — Task Collaboration Mock Data
// Collaboration records are sidecars layered on top of real engine tasks.
// engineTaskId must match the real Task.id in lib/engine/mock-data.ts.
//
// am-mc011-t2 → Ridgeline Construction LLC — "Set up access & tracking — SEO / GBP" (Waiting)
// am-mc004-t4 → Blue Ridge Plumbing Co.   — "Deliver wireframe/mockup — Website Build" (In Progress)
// ga-1        → Harbor Auto               — "Negative keyword audit — Harbor Auto" (In Progress)
// ─────────────────────────────────────────────────────────────────────────────
import { ENGINE_STORE } from "@/lib/engine/mock-data";
import type { Task } from "@/lib/engine/types";

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
  priya:   { id: "u3", name: "Priya Nair",      initials: "PN", color: "#7C3AED" },
  jessica: { id: "u1", name: "Jessica Reyes",    initials: "JR", color: "#1B4FD8" },
  marcus:  { id: "u2", name: "Marcus Webb",      initials: "MW", color: "#059669" },
  daniel:  { id: "u4", name: "Daniel Okonkwo",  initials: "DO", color: "#D97706" },
  sofia:   { id: "u5", name: "Sofia Castillo",  initials: "SC", color: "#DC2626" },
  aaron:   { id: "u6", name: "Aaron Park",      initials: "AP", color: "#0891B2" },
  lily:    { id: "u7", name: "Lily Chen",       initials: "LC", color: "#BE185D" },
  ryan:    { id: "u8", name: "Ryan Torres",     initials: "RT", color: "#065F46" },
};

// ── TASK 1: Ridgeline Construction LLC — Set up access & tracking (SEO / GBP) ─
// Engine task: am-mc011-t2 — status: Waiting, priority: High
// Project: proj-am-mc011 — Ridgeline Construction LLC — SEO / GBP

const comments_t1: TaskComment[] = [
  {
    id: "c-t1-1",
    authorId: TEAM.priya.id,
    authorName: TEAM.priya.name,
    authorInitials: TEAM.priya.initials,
    authorColor: TEAM.priya.color,
    body: "Access request email sent to Ridgeline's office manager today. Waiting on GA4, Search Console, and GBP admin credentials. Will follow up in 48 hrs if no response.",
    mentions: [],
    attachments: [],
    status: "Active",
    createdAt: "2025-05-16T09:14:00Z",
    pinned: false,
    resolved: false,
    replies: [],
  },
  {
    id: "c-t1-2",
    authorId: TEAM.marcus.id,
    authorName: TEAM.marcus.name,
    authorInitials: TEAM.marcus.initials,
    authorColor: TEAM.marcus.color,
    body: "@Priya Nair — any update from the client? We can't configure the initial SEO / GBP campaign until all three access items are in. This is blocking am-mc011-t3.",
    mentions: [{ id: "m1", kind: "user", label: "@Priya Nair" }],
    attachments: [],
    status: "Pinned",
    createdAt: "2025-05-21T10:30:00Z",
    pinned: true,
    resolved: false,
    replies: [
      {
        id: "r-c-t1-2-1",
        authorId: TEAM.priya.id,
        authorName: TEAM.priya.name,
        authorInitials: TEAM.priya.initials,
        authorColor: TEAM.priya.color,
        body: "Called them this morning — their IT contact is on vacation until May 26. Escalating to department head to decide if we delay the milestone or find a workaround.",
        mentions: [],
        createdAt: "2025-05-21T11:00:00Z",
      },
    ],
  },
  {
    id: "c-t1-3",
    authorId: TEAM.daniel.id,
    authorName: TEAM.daniel.name,
    authorInitials: TEAM.daniel.initials,
    authorColor: TEAM.daniel.color,
    body: "Flagging this for executive visibility. Milestone due date has passed. GBP and Search Console access still outstanding. Ridgeline may need a formal written request to their IT team.",
    mentions: [],
    attachments: [],
    status: "Active",
    createdAt: "2025-05-30T14:00:00Z",
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
    priority: "High",
    body: "Ridgeline's primary contact is Jake Morley (office manager). Their IT person is Derek Hines — he is the one who needs to grant GA4/Search Console access. Derek was on PTO until May 26.",
    createdAt: "2025-05-16T09:00:00Z",
  },
  {
    id: "in-t1-2",
    authorId: TEAM.marcus.id,
    authorName: TEAM.marcus.name,
    authorInitials: TEAM.marcus.initials,
    authorColor: TEAM.marcus.color,
    department: "SEO",
    priority: "Urgent",
    body: "Cannot proceed with campaign configuration (am-mc011-t3) until this task is complete. Milestone ms-am-mc011-1 progress is stuck at 25%. If access not received by June 1, milestone will breach SLA.",
    createdAt: "2025-05-21T09:00:00Z",
  },
  {
    id: "in-t1-3",
    authorId: TEAM.daniel.id,
    authorName: TEAM.daniel.name,
    authorInitials: TEAM.daniel.initials,
    authorColor: TEAM.daniel.color,
    department: "Account Management",
    priority: "Urgent",
    body: "Escalation raised to Account Management dept head. Recommend sending a formal written credential-request letter to Ridgeline's office manager with a 5-business-day deadline. Do not proceed with lower-priority tasks on this project until unblocked.",
    createdAt: "2025-05-30T15:00:00Z",
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
    body: "Spoke with Jake Morley (Ridgeline office manager). He confirmed they want to move forward with SEO and GBP setup. Their IT person Derek Hines is the one who controls Google account access — Jake will have him reach out directly.",
    createdAt: "2025-05-16T11:00:00Z",
  },
  {
    id: "cn-t1-2",
    authorId: TEAM.priya.id,
    authorName: TEAM.priya.name,
    authorInitials: TEAM.priya.initials,
    authorColor: TEAM.priya.color,
    source: "Email",
    body: "Follow-up email sent to Jake Morley and CC'd Derek Hines with step-by-step instructions for granting GA4 and Search Console manager access. Also included GBP owner transfer guide. Awaiting response.",
    createdAt: "2025-05-21T10:00:00Z",
  },
];

const attachments_t1: TaskAttachment[] = [
  {
    id: "att-t1-1",
    fileName: "Ridgeline-Access-Request-Instructions.pdf",
    fileType: "pdf",
    category: "Access Request",
    uploadedBy: TEAM.priya.name,
    uploadedByInitials: TEAM.priya.initials,
    uploadedByColor: TEAM.priya.color,
    uploadDate: "2025-05-16T12:00:00Z",
    status: "Active",
    sizeKB: 180,
  },
  {
    id: "att-t1-2",
    fileName: "Ridgeline-GBP-Transfer-Guide.pdf",
    fileType: "pdf",
    category: "Access Request",
    uploadedBy: TEAM.priya.name,
    uploadedByInitials: TEAM.priya.initials,
    uploadedByColor: TEAM.priya.color,
    uploadDate: "2025-05-16T12:05:00Z",
    status: "Active",
    sizeKB: 95,
  },
  {
    id: "att-t1-3",
    fileName: "Ridgeline-Onboarding-Kickoff-Notes.docx",
    fileType: "docx",
    category: "Other",
    uploadedBy: TEAM.jessica.name,
    uploadedByInitials: TEAM.jessica.initials,
    uploadedByColor: TEAM.jessica.color,
    uploadDate: "2025-05-15T09:00:00Z",
    status: "Active",
    sizeKB: 75,
  },
];

const watchers_t1: TaskWatcher[] = [
  { id: TEAM.priya.id,   name: TEAM.priya.name,   initials: TEAM.priya.initials,   avatarColor: TEAM.priya.color,   role: "Account Manager",  department: "Account Management", watching: true },
  { id: TEAM.marcus.id,  name: TEAM.marcus.name,  initials: TEAM.marcus.initials,  avatarColor: TEAM.marcus.color,  role: "SEO Specialist",   department: "SEO",                watching: true },
  { id: TEAM.daniel.id,  name: TEAM.daniel.name,  initials: TEAM.daniel.initials,  avatarColor: TEAM.daniel.color,  role: "Department Head",  department: "Account Management", watching: true },
];

const approvals_t1: ApprovalStep[] = [
  {
    id: "appr-t1-1",
    stepName: "Access Verification — GA4 + Search Console",
    approver: TEAM.marcus.name,
    approverInitials: TEAM.marcus.initials,
    approverColor: TEAM.marcus.color,
    reviewer: TEAM.priya.name,
    reviewerInitials: TEAM.priya.initials,
    reviewerColor: TEAM.priya.color,
    status: "Pending Approval",
    notes: "AM to confirm all three access items received before SEO specialist proceeds to campaign configuration.",
    requestedAt: "2025-05-16T08:00:00Z",
  },
];

const activity_t1: ActivityEvent[] = [
  { id: "ev-t1-1", eventType: "Task Created",    userId: TEAM.jessica.id, userName: TEAM.jessica.name, userInitials: TEAM.jessica.initials, userColor: TEAM.jessica.color, timestamp: "2025-05-15T08:00:00Z", notes: "Task generated from blueprint bp-001" },
  { id: "ev-t1-2", eventType: "Task Assigned",   userId: TEAM.jessica.id, userName: TEAM.jessica.name, userInitials: TEAM.jessica.initials, userColor: TEAM.jessica.color, timestamp: "2025-05-15T08:05:00Z", notes: "Assigned to Alex R.", meta: { assignee: "Alex R." } },
  { id: "ev-t1-3", eventType: "Watcher Added",   userId: TEAM.priya.id,   userName: TEAM.priya.name,   userInitials: TEAM.priya.initials,   userColor: TEAM.priya.color,   timestamp: "2025-05-15T09:00:00Z", meta: { watcher: "Priya Nair" } },
  { id: "ev-t1-4", eventType: "Status Changed",  userId: TEAM.priya.id,   userName: TEAM.priya.name,   userInitials: TEAM.priya.initials,   userColor: TEAM.priya.color,   timestamp: "2025-05-16T09:00:00Z", notes: "Open → Waiting (pending client credentials)", meta: { from: "Open", to: "Waiting" } },
  { id: "ev-t1-5", eventType: "Comment Added",   userId: TEAM.priya.id,   userName: TEAM.priya.name,   userInitials: TEAM.priya.initials,   userColor: TEAM.priya.color,   timestamp: "2025-05-16T09:14:00Z" },
  { id: "ev-t1-6", eventType: "Approval Requested", userId: TEAM.priya.id, userName: TEAM.priya.name, userInitials: TEAM.priya.initials,  userColor: TEAM.priya.color,   timestamp: "2025-05-16T08:00:00Z", notes: "Access Verification approval queued — awaiting credentials" },
  { id: "ev-t1-7", eventType: "Blocker Added",   userId: TEAM.marcus.id,  userName: TEAM.marcus.name,  userInitials: TEAM.marcus.initials,  userColor: TEAM.marcus.color,  timestamp: "2025-05-21T10:30:00Z", notes: "Blocking: am-mc011-t3 cannot start" },
  { id: "ev-t1-8", eventType: "Mention Added",   userId: TEAM.marcus.id,  userName: TEAM.marcus.name,  userInitials: TEAM.marcus.initials,  userColor: TEAM.marcus.color,  timestamp: "2025-05-21T10:30:00Z", meta: { mentioned: "@Priya Nair" } },
  { id: "ev-t1-9", eventType: "Note Added",      userId: TEAM.daniel.id,  userName: TEAM.daniel.name,  userInitials: TEAM.daniel.initials,  userColor: TEAM.daniel.color,  timestamp: "2025-05-30T15:00:00Z", notes: "Escalation note added — executive visibility requested" },
];

const dependencies_t1: TaskDependencyItem[] = [
  {
    id: "dep-t1-1",
    scope: "Task",
    name: "GA4 Access — Ridgeline Construction LLC",
    status: "Blocked",
    blockerReason: "Waiting on Client Access",
    owner: TEAM.priya.name,
    dueDate: "2025-05-30",
    notes: "IT contact (Derek Hines) on PTO until May 26. Access request sent. No response as of May 30.",
  },
  {
    id: "dep-t1-2",
    scope: "Task",
    name: "Search Console + GBP Access — Ridgeline Construction LLC",
    status: "Blocked",
    blockerReason: "Waiting on Client Access",
    owner: TEAM.priya.name,
    dueDate: "2025-05-30",
    notes: "Bundled with GA4 access request. Same IT contact required. Both outstanding.",
  },
];

const notifications_t1: CollabNotificationEvent[] = [
  { id: "notif-t1-1", type: "Comment Added",      taskId: "t-001-2-1", taskName: "Set up access & tracking — SEO / GBP", projectName: "Ridgeline Construction LLC — SEO / GBP", triggeredBy: TEAM.priya.name,  recipient: TEAM.marcus.name, timestamp: "2025-05-16T09:14:00Z", read: true,  message: "Priya Nair updated the access request status on Ridgeline" },
  { id: "notif-t1-2", type: "Mention Added",      taskId: "t-001-2-1", taskName: "Set up access & tracking — SEO / GBP", projectName: "Ridgeline Construction LLC — SEO / GBP", triggeredBy: TEAM.marcus.name, recipient: TEAM.priya.name,  timestamp: "2025-05-21T10:30:00Z", read: false, message: "Marcus Webb mentioned you — access still outstanding, milestone at risk" },
  { id: "notif-t1-3", type: "Dependency Blocked", taskId: "t-001-2-1", taskName: "Set up access & tracking — SEO / GBP", projectName: "Ridgeline Construction LLC — SEO / GBP", triggeredBy: "System",         recipient: TEAM.daniel.name, timestamp: "2025-05-30T14:00:00Z", read: false, message: "Milestone ms-am-mc011-1 blocked — access credentials still not received from Ridgeline" },
];

const escalations_t1: EscalationRecord[] = [
  {
    id: "esc-t1-1",
    level: "L3 - Account Manager",
    assignedTeam: "Account Management",
    assignedRole: "Account Manager",
    assignedUser: TEAM.priya.name,
    assignedUserInitials: TEAM.priya.initials,
    assignedUserColor: TEAM.priya.color,
    trigger: "Client Access Missing",
    status: "Open",
    createdAt: "2025-05-30T14:00:00Z",
    notes: "GA4 + Search Console + GBP access not received from Ridgeline Construction LLC. Due date passed. Milestone ms-am-mc011-1 is blocked. AM must contact client decision-maker directly and set a hard deadline.",
  },
];

const aiSummary_t1: AICollaborationSummary = {
  taskId: "t-001-2-1",
  generatedAt: "2025-05-30T16:00:00Z",
  latestUpdates: [
    { category: "update", text: "Access request sent to Ridgeline Construction LLC on May 16. IT contact (Derek Hines) was on PTO until May 26. No credentials received as of May 30.", urgency: "warn" },
    { category: "update", text: "Downstream task am-mc011-t3 (Configure initial SEO / GBP campaign) cannot start until this task completes.", urgency: "info" },
  ],
  currentBlockers: [
    { category: "blocker", text: "GA4 access not received — Ridgeline's IT contact was on PTO. Access critical before SEO/GBP configuration can start.", urgency: "critical" },
    { category: "blocker", text: "Search Console + GBP admin transfer also outstanding — bundled with GA4 request, same IT contact required.", urgency: "critical" },
  ],
  pendingApprovals: [
    { category: "approval", text: "Access Verification approval queued — Marcus Webb cannot sign off until all three credential items are confirmed received.", urgency: "warn" },
  ],
  recentEscalations: [
    { category: "escalation", text: "Client Access Missing escalation (L3) raised to Priya Nair on May 30. Task due date has passed. Open — no resolution yet.", urgency: "critical" },
  ],
  recommendedActions: [
    { category: "action", text: "Priya Nair should send a formal written deadline to Ridgeline's office manager (Jake Morley) requesting credentials by June 4.", urgency: "critical" },
    { category: "action", text: "If no response by June 4, escalate to L4 Executive — milestone SLA has already been breached.", urgency: "warn" },
  ],
  projectHealthNotes: [
    { category: "health", text: "Project health is RED. Milestone ms-am-mc011-1 is blocked. Campaign configuration cannot start until this task is complete.", urgency: "critical" },
    { category: "health", text: "Downstream task (Configure initial SEO / GBP campaign) is queued but fully blocked by this dependency.", urgency: "warn" },
  ],
};

// ── TASK 2: Blue Ridge Plumbing Co. — Deliver wireframe/mockup (Website Build) ─
// Engine task: am-mc004-t4 — status: In Progress, priority: High
// Project: proj-am-mc004 — Blue Ridge Plumbing Co. — SEO / GBP / Website Build

const comments_t2: TaskComment[] = [
  {
    id: "c-t2-1",
    authorId: TEAM.sofia.id,
    authorName: TEAM.sofia.name,
    authorInitials: TEAM.sofia.initials,
    authorColor: TEAM.sofia.color,
    body: "Wireframes are done for the Blue Ridge Plumbing homepage and service pages. Sharing the Figma link for review before we move to mockup. @Account Manager please review client brand guidelines first — they use a navy/orange palette.",
    mentions: [{ id: "m3", kind: "role", label: "@Account Manager" }],
    attachments: [],
    status: "Active",
    createdAt: "2025-05-28T13:00:00Z",
    pinned: false,
    resolved: false,
    replies: [
      {
        id: "r-c-t2-1-1",
        authorId: TEAM.daniel.id,
        authorName: TEAM.daniel.name,
        authorInitials: TEAM.daniel.initials,
        authorColor: TEAM.daniel.color,
        body: "Reviewed. Confirmed — navy #0D2D57, accent orange #E87722. Make sure the CTA buttons and service icons match. Client is very focused on the emergency plumbing call button being prominent above the fold.",
        mentions: [],
        createdAt: "2025-05-28T15:00:00Z",
      },
    ],
  },
  {
    id: "c-t2-2",
    authorId: TEAM.sofia.id,
    authorName: TEAM.sofia.name,
    authorInitials: TEAM.sofia.initials,
    authorColor: TEAM.sofia.color,
    body: "Mockup v1 complete and uploaded. Incorporated the navy/orange palette and moved the emergency call button above the fold. Ready for AM and client review before we finalize and hand off to dev.",
    mentions: [],
    attachments: [
      { id: "att-c2", fileName: "BlueRidge-Website-Mockup-v1.pdf", fileType: "pdf", url: "#" },
    ],
    status: "Active",
    createdAt: "2025-06-04T14:00:00Z",
    pinned: false,
    resolved: false,
    replies: [],
  },
  {
    id: "c-t2-3",
    authorId: TEAM.jessica.id,
    authorName: TEAM.jessica.name,
    authorInitials: TEAM.jessica.initials,
    authorColor: TEAM.jessica.color,
    body: "Task is due June 10. Client review meeting scheduled June 6. @Sofia Castillo — can you prepare a 2-slide summary of design decisions for the call? Client is not technical.",
    mentions: [{ id: "m4", kind: "user", label: "@Sofia Castillo" }],
    attachments: [],
    status: "Pinned",
    createdAt: "2025-06-05T09:00:00Z",
    pinned: true,
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
    priority: "High",
    body: "Blue Ridge client contact is Marcus Holt (owner). Very hands-on — expects to see every iteration before sign-off. Build in at least 2 review rounds. He prefers phone calls over email.",
    createdAt: "2025-05-20T08:00:00Z",
  },
  {
    id: "in-t2-2",
    authorId: TEAM.sofia.id,
    authorName: TEAM.sofia.name,
    authorInitials: TEAM.sofia.initials,
    authorColor: TEAM.sofia.color,
    department: "Design",
    priority: "Medium",
    body: "Client provided logo file but it's low-res (72 dpi JPEG). Will need a vector version before final mockup can be used in production. Flagged to AM to request from client.",
    createdAt: "2025-05-27T11:30:00Z",
  },
  {
    id: "in-t2-3",
    authorId: TEAM.jessica.id,
    authorName: TEAM.jessica.name,
    authorInitials: TEAM.jessica.initials,
    authorColor: TEAM.jessica.color,
    department: "Account Management",
    priority: "High",
    body: "Client review meeting set for June 6 at 10 AM. Have mockup v1 ready to present. If client requests revisions, loop in Sofia same day — do not wait. Due date is June 10.",
    createdAt: "2025-06-04T09:00:00Z",
  },
];

const clientNotes_t2: ClientNote[] = [
  {
    id: "cn-t2-1",
    authorId: TEAM.daniel.id,
    authorName: TEAM.daniel.name,
    authorInitials: TEAM.daniel.initials,
    authorColor: TEAM.daniel.color,
    source: "Phone Call",
    body: "Spoke with Marcus Holt (Blue Ridge owner). He wants the website to strongly emphasize emergency plumbing services — that's their highest-margin service. Also requested before/after photos section for past jobs. Will provide photos in a Google Drive folder.",
    createdAt: "2025-05-20T14:00:00Z",
  },
  {
    id: "cn-t2-2",
    authorId: TEAM.daniel.id,
    authorName: TEAM.daniel.name,
    authorInitials: TEAM.daniel.initials,
    authorColor: TEAM.daniel.color,
    source: "Email",
    body: "Client reviewed wireframes and left feedback via email: (1) Move the contact form higher on the homepage. (2) Add a service area map. (3) Include testimonials section. All three incorporated into mockup v1.",
    createdAt: "2025-06-02T10:00:00Z",
  },
];

const attachments_t2: TaskAttachment[] = [
  {
    id: "att-t2-1",
    fileName: "BlueRidge-Website-Wireframes-v1.pdf",
    fileType: "pdf",
    category: "Creative Asset",
    uploadedBy: TEAM.sofia.name,
    uploadedByInitials: TEAM.sofia.initials,
    uploadedByColor: TEAM.sofia.color,
    uploadDate: "2025-05-28T12:00:00Z",
    status: "Superseded",
    sizeKB: 2800,
  },
  {
    id: "att-t2-2",
    fileName: "BlueRidge-Website-Mockup-v1.pdf",
    fileType: "pdf",
    category: "Creative Asset",
    uploadedBy: TEAM.sofia.name,
    uploadedByInitials: TEAM.sofia.initials,
    uploadedByColor: TEAM.sofia.color,
    uploadDate: "2025-06-04T14:00:00Z",
    status: "Active",
    sizeKB: 4200,
  },
  {
    id: "att-t2-3",
    fileName: "BlueRidge-Client-Contract-2025.pdf",
    fileType: "pdf",
    category: "Contract",
    uploadedBy: TEAM.jessica.name,
    uploadedByInitials: TEAM.jessica.initials,
    uploadedByColor: TEAM.jessica.color,
    uploadDate: "2025-05-01T09:00:00Z",
    status: "Active",
    sizeKB: 820,
  },
  {
    id: "att-t2-4",
    fileName: "BlueRidge-Brand-Logo-LowRes.jpg",
    fileType: "jpg",
    category: "Creative Asset",
    uploadedBy: TEAM.sofia.name,
    uploadedByInitials: TEAM.sofia.initials,
    uploadedByColor: TEAM.sofia.color,
    uploadDate: "2025-05-27T11:00:00Z",
    status: "Active",
    sizeKB: 145,
  },
];

const watchers_t2: TaskWatcher[] = [
  { id: TEAM.daniel.id,  name: TEAM.daniel.name,  initials: TEAM.daniel.initials,  avatarColor: TEAM.daniel.color,  role: "Account Manager",  department: "Account Management", watching: true },
  { id: TEAM.sofia.id,   name: TEAM.sofia.name,   initials: TEAM.sofia.initials,   avatarColor: TEAM.sofia.color,   role: "Creative Director", department: "Design",            watching: true },
  { id: TEAM.jessica.id, name: TEAM.jessica.name, initials: TEAM.jessica.initials, avatarColor: TEAM.jessica.color, role: "Project Owner",    department: "Account Management", watching: true },
  { id: TEAM.lily.id,    name: TEAM.lily.name,    initials: TEAM.lily.initials,    avatarColor: TEAM.lily.color,    role: "Department Head",  department: "Web Development",    watching: true },
  { id: TEAM.marcus.id,  name: TEAM.marcus.name,  initials: TEAM.marcus.initials,  avatarColor: TEAM.marcus.color,  role: "Executive",        department: "Leadership",         watching: false },
];

const approvals_t2: ApprovalStep[] = [
  {
    id: "appr-t2-1",
    stepName: "Wireframe Review — AM Sign-Off",
    approver: TEAM.daniel.name,
    approverInitials: TEAM.daniel.initials,
    approverColor: TEAM.daniel.color,
    reviewer: TEAM.sofia.name,
    reviewerInitials: TEAM.sofia.initials,
    reviewerColor: TEAM.sofia.color,
    status: "Approved",
    decision: "Approved",
    notes: "Wireframes v1 reviewed. Brand colours confirmed. Client feedback incorporated — contact form, service area map, and testimonials added.",
    requestedAt: "2025-05-28T13:00:00Z",
    completedAt: "2025-06-02T10:00:00Z",
  },
  {
    id: "appr-t2-2",
    stepName: "Mockup Client Approval — Blue Ridge",
    approver: TEAM.jessica.name,
    approverInitials: TEAM.jessica.initials,
    approverColor: TEAM.jessica.color,
    status: "Pending Approval",
    notes: "Mockup v1 delivered June 4. Client review call scheduled June 6. Approval needed before handoff to dev.",
    requestedAt: "2025-06-04T14:00:00Z",
  },
];

const activity_t2: ActivityEvent[] = [
  { id: "ev-t2-1", eventType: "Task Created",      userId: TEAM.jessica.id, userName: TEAM.jessica.name, userInitials: TEAM.jessica.initials, userColor: TEAM.jessica.color, timestamp: "2025-05-01T08:00:00Z" },
  { id: "ev-t2-2", eventType: "Task Assigned",     userId: TEAM.jessica.id, userName: TEAM.jessica.name, userInitials: TEAM.jessica.initials, userColor: TEAM.jessica.color, timestamp: "2025-05-01T08:10:00Z", meta: { assignee: "Casey L. (Design)" } },
  { id: "ev-t2-3", eventType: "Status Changed",    userId: TEAM.sofia.id,   userName: TEAM.sofia.name,   userInitials: TEAM.sofia.initials,   userColor: TEAM.sofia.color,   timestamp: "2025-05-20T10:00:00Z", meta: { from: "Open", to: "In Progress" } },
  { id: "ev-t2-4", eventType: "Attachment Uploaded", userId: TEAM.sofia.id, userName: TEAM.sofia.name,   userInitials: TEAM.sofia.initials,   userColor: TEAM.sofia.color,   timestamp: "2025-05-28T12:00:00Z", meta: { file: "BlueRidge-Website-Wireframes-v1.pdf" } },
  { id: "ev-t2-5", eventType: "Approval Requested", userId: TEAM.sofia.id,  userName: TEAM.sofia.name,   userInitials: TEAM.sofia.initials,   userColor: TEAM.sofia.color,   timestamp: "2025-05-28T13:00:00Z", notes: "Wireframe Review — AM Sign-Off requested" },
  { id: "ev-t2-6", eventType: "Approval Completed", userId: TEAM.daniel.id, userName: TEAM.daniel.name,  userInitials: TEAM.daniel.initials,  userColor: TEAM.daniel.color,  timestamp: "2025-06-02T10:00:00Z", notes: "Wireframes approved — client feedback incorporated" },
  { id: "ev-t2-7", eventType: "Attachment Uploaded", userId: TEAM.sofia.id, userName: TEAM.sofia.name,   userInitials: TEAM.sofia.initials,   userColor: TEAM.sofia.color,   timestamp: "2025-06-04T14:00:00Z", meta: { file: "BlueRidge-Website-Mockup-v1.pdf" } },
  { id: "ev-t2-8", eventType: "Approval Requested", userId: TEAM.sofia.id,  userName: TEAM.sofia.name,   userInitials: TEAM.sofia.initials,   userColor: TEAM.sofia.color,   timestamp: "2025-06-04T14:00:00Z", notes: "Mockup Client Approval requested — pending client review call June 6" },
];

const dependencies_t2: TaskDependencyItem[] = [
  {
    id: "dep-t2-1",
    scope: "Task",
    name: "Client Brand Assets — Vector Logo",
    status: "Pending",
    blockerReason: "Waiting on Client Access",
    owner: TEAM.daniel.name,
    dueDate: "2025-06-06",
    notes: "Logo provided is low-res JPEG (72 dpi). AM requested vector version from client. Needed before mockup is production-ready.",
  },
  {
    id: "dep-t2-2",
    scope: "Task",
    name: "Client Mockup Approval",
    status: "Pending",
    blockerReason: "Waiting on Approval",
    owner: TEAM.jessica.name,
    dueDate: "2025-06-07",
    notes: "Review call scheduled June 6. Approval required before dev handoff. Task due June 10.",
  },
  {
    id: "dep-t2-3",
    scope: "Task",
    name: "Client Photo Assets — Job Photos Google Drive",
    status: "Pending",
    blockerReason: "Waiting on Client Access",
    owner: TEAM.daniel.name,
    dueDate: "2025-06-08",
    notes: "Client promised a Google Drive folder of before/after job photos. Not yet received. Needed for the gallery section.",
  },
];

const notifications_t2: CollabNotificationEvent[] = [
  { id: "notif-t2-1", type: "Approval Requested",  taskId: "t-002-lp", taskName: "Deliver wireframe/mockup — Website Build", projectName: "Blue Ridge Plumbing Co. — SEO / GBP / Website Build", triggeredBy: TEAM.sofia.name, recipient: TEAM.jessica.name, timestamp: "2025-06-04T14:00:00Z", read: false, message: "Mockup Client Approval awaiting review — client call June 6" },
  { id: "notif-t2-2", type: "Dependency Blocked",   taskId: "t-002-lp", taskName: "Deliver wireframe/mockup — Website Build", projectName: "Blue Ridge Plumbing Co. — SEO / GBP / Website Build", triggeredBy: "System",         recipient: TEAM.daniel.name, timestamp: "2025-06-05T08:00:00Z", read: false, message: "Vector logo and photo assets still outstanding — task at risk of missing June 10 due date" },
];

const escalations_t2: EscalationRecord[] = [
  {
    id: "esc-t2-1",
    level: "L2 - Department Head",
    assignedTeam: "Design",
    assignedRole: "Design Department Head",
    assignedUser: TEAM.lily.name,
    assignedUserInitials: TEAM.lily.initials,
    assignedUserColor: TEAM.lily.color,
    trigger: "Approval Bottleneck",
    status: "Open",
    createdAt: "2025-06-05T09:00:00Z",
    notes: "Mockup Client Approval pending since June 4. Client review call June 6. Task due June 10 — no room for extended revision cycles. Design dept head flagged for awareness.",
  },
];

const aiSummary_t2: AICollaborationSummary = {
  taskId: "t-002-lp",
  generatedAt: "2025-06-05T10:00:00Z",
  latestUpdates: [
    { category: "update", text: "Wireframes reviewed and approved by AM (Jun 2). Client feedback incorporated: contact form, service area map, and testimonials added. Mockup v1 delivered June 4.", urgency: "info" },
    { category: "update", text: "Client review call scheduled June 6. Mockup Client Approval pending. Task due June 10 — 4 business days remain.", urgency: "warn" },
  ],
  currentBlockers: [
    { category: "blocker", text: "Vector logo not yet received from client — low-res JPEG only. Required before mockup is production-ready.", urgency: "warn" },
    { category: "blocker", text: "Job photo assets (Google Drive folder) promised by client but not delivered. Needed for gallery section.", urgency: "warn" },
    { category: "blocker", text: "Mockup Client Approval outstanding — review call June 6. Approval needed before dev handoff.", urgency: "warn" },
  ],
  pendingApprovals: [
    { category: "approval", text: "Mockup Client Approval awaiting Jessica Reyes after June 6 client call. Task at risk if client requests significant revisions given June 10 due date.", urgency: "warn" },
  ],
  recentEscalations: [
    { category: "escalation", text: "Approval Bottleneck escalation (L2) raised to Lily Chen (Design Department Head) Jun 5 — tight timeline flagged for awareness.", urgency: "warn" },
  ],
  recommendedActions: [
    { category: "action", text: "Jessica Reyes should request vector logo and photo assets from Marcus Holt (Blue Ridge owner) before the June 6 call.", urgency: "warn" },
    { category: "action", text: "If client requests major revisions on June 6, escalate to department head immediately — due date is June 10.", urgency: "warn" },
    { category: "action", text: "Sofia Castillo should prepare a 2-slide summary of design decisions for the June 6 client call per AM request.", urgency: "info" },
  ],
  projectHealthNotes: [
    { category: "health", text: "Project health is YELLOW. Mockup is complete and on track but client asset gaps and tight due date create risk.", urgency: "warn" },
    { category: "health", text: "If client approves on June 6 with no major revisions, dev handoff can proceed on time.", urgency: "info" },
  ],
};

// ── TASK 3: Harbor Auto — Negative keyword audit ─────────────────────────────
// Engine task: ga-1 — status: In Progress, priority: High
// Project: proj-wt-ppc — Harbor Auto — Google Ads

const comments_t3: TaskComment[] = [
  {
    id: "c-t3-1",
    authorId: TEAM.marcus.id,
    authorName: TEAM.marcus.name,
    authorInitials: TEAM.marcus.initials,
    authorColor: TEAM.marcus.color,
    body: "Starting the negative keyword audit for Harbor Auto's Google Ads account. Pulling the search terms report for the last 90 days. Initial pass shows a lot of irrelevant job-seeker queries (\"auto mechanic jobs\", \"car dealership jobs\") burning through budget. Will have a clean list by June 5.",
    mentions: [],
    attachments: [],
    status: "Active",
    createdAt: "2025-06-02T10:00:00Z",
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
    body: "Good catch on the job-seeker terms. @Marcus Webb — Harbor Auto mentioned they also get a lot of clicks from out-of-state queries. Check if geographic targeting is set correctly and flag any geo-level negatives we should add.",
    mentions: [{ id: "m6", kind: "user", label: "@Marcus Webb" }],
    attachments: [],
    status: "Active",
    createdAt: "2025-06-03T09:00:00Z",
    pinned: false,
    resolved: false,
    replies: [
      {
        id: "r-c-t3-2-1",
        authorId: TEAM.marcus.id,
        authorName: TEAM.marcus.name,
        authorInitials: TEAM.marcus.initials,
        authorColor: TEAM.marcus.color,
        body: "Geo-targeting was set to \"Presence or interest\" instead of \"Presence only\". That explains the out-of-state clicks. Fixing that and adding the job-seeker negatives. Combined change should meaningfully improve CTR and reduce wasted spend.",
        mentions: [],
        createdAt: "2025-06-03T11:00:00Z",
      },
    ],
  },
  {
    id: "c-t3-3",
    authorId: TEAM.marcus.id,
    authorName: TEAM.marcus.name,
    authorInitials: TEAM.marcus.initials,
    authorColor: TEAM.marcus.color,
    body: "Audit complete. Added 47 negative keywords across 3 match types. Geo-targeting corrected to Presence Only. Negative keyword list uploaded. Recommend reviewing performance in 7 days to confirm wasted spend drops.",
    mentions: [],
    attachments: [
      { id: "att-c3", fileName: "HarborAuto-NegativeKeywords-Jun2025.xlsx", fileType: "xlsx", url: "#" },
    ],
    status: "Active",
    createdAt: "2025-06-05T16:00:00Z",
    pinned: false,
    resolved: false,
    replies: [],
  },
];

const internalNotes_t3: InternalNote[] = [
  {
    id: "in-t3-1",
    authorId: TEAM.marcus.id,
    authorName: TEAM.marcus.name,
    authorInitials: TEAM.marcus.initials,
    authorColor: TEAM.marcus.color,
    department: "PPC",
    priority: "High",
    body: "Harbor Auto's Google Ads monthly budget is $4,200/mo. Wasted spend from bad keywords estimated at ~18% (~$756/mo). After negatives are applied, reallocate budget to top-performing auto service terms. Do not reduce total budget — shift allocation.",
    createdAt: "2025-06-02T09:00:00Z",
  },
  {
    id: "in-t3-2",
    authorId: TEAM.priya.id,
    authorName: TEAM.priya.name,
    authorInitials: TEAM.priya.initials,
    authorColor: TEAM.priya.color,
    department: "Account Management",
    priority: "Medium",
    body: "Harbor Auto owner (Tony Salazar) is very metrics-focused. Prepare a before/after comparison showing impression share, CTR, and avg CPC changes after the negative keyword cleanup. He'll want to see it on the next monthly call.",
    createdAt: "2025-06-03T08:00:00Z",
  },
];

const clientNotes_t3: ClientNote[] = [
  {
    id: "cn-t3-1",
    authorId: TEAM.priya.id,
    authorName: TEAM.priya.name,
    authorInitials: TEAM.priya.initials,
    authorColor: TEAM.priya.color,
    source: "Phone Call",
    body: "Spoke with Tony Salazar (Harbor Auto owner). He noticed a spike in clicks last month but no increase in calls. Mentioned getting a few \"job inquiry\" calls — that's the job-seeker query problem. He's aware the audit is in progress and expects a summary of changes by end of week.",
    createdAt: "2025-06-02T14:00:00Z",
  },
];

const attachments_t3: TaskAttachment[] = [
  {
    id: "att-t3-1",
    fileName: "HarborAuto-SearchTerms-90Day-Report.xlsx",
    fileType: "xlsx",
    category: "Report",
    uploadedBy: TEAM.marcus.name,
    uploadedByInitials: TEAM.marcus.initials,
    uploadedByColor: TEAM.marcus.color,
    uploadDate: "2025-06-02T09:30:00Z",
    status: "Active",
    sizeKB: 520,
  },
  {
    id: "att-t3-2",
    fileName: "HarborAuto-NegativeKeywords-Jun2025.xlsx",
    fileType: "xlsx",
    category: "Report",
    uploadedBy: TEAM.marcus.name,
    uploadedByInitials: TEAM.marcus.initials,
    uploadedByColor: TEAM.marcus.color,
    uploadDate: "2025-06-05T16:00:00Z",
    status: "Active",
    sizeKB: 180,
  },
];

const watchers_t3: TaskWatcher[] = [
  { id: TEAM.priya.id,   name: TEAM.priya.name,   initials: TEAM.priya.initials,   avatarColor: TEAM.priya.color,   role: "Account Manager", department: "Account Management", watching: true },
  { id: TEAM.jessica.id, name: TEAM.jessica.name, initials: TEAM.jessica.initials, avatarColor: TEAM.jessica.color, role: "Department Head",  department: "PPC",               watching: true },
];

const approvals_t3: ApprovalStep[] = [
  {
    id: "appr-t3-1",
    stepName: "Negative Keyword List — AM Review",
    approver: TEAM.priya.name,
    approverInitials: TEAM.priya.initials,
    approverColor: TEAM.priya.color,
    reviewer: TEAM.marcus.name,
    reviewerInitials: TEAM.marcus.initials,
    reviewerColor: TEAM.marcus.color,
    status: "Pending Approval",
    notes: "Marcus to submit final negative keyword list for AM review before applying changes to live account.",
    requestedAt: "2025-06-05T16:00:00Z",
  },
];

const activity_t3: ActivityEvent[] = [
  { id: "ev-t3-1", eventType: "Task Created",      userId: TEAM.jessica.id, userName: TEAM.jessica.name, userInitials: TEAM.jessica.initials, userColor: TEAM.jessica.color, timestamp: "2025-06-01T08:00:00Z" },
  { id: "ev-t3-2", eventType: "Task Assigned",     userId: TEAM.jessica.id, userName: TEAM.jessica.name, userInitials: TEAM.jessica.initials, userColor: TEAM.jessica.color, timestamp: "2025-06-01T08:05:00Z", meta: { assignee: "Alex R. (PPC)" } },
  { id: "ev-t3-3", eventType: "Status Changed",    userId: TEAM.marcus.id,  userName: TEAM.marcus.name,  userInitials: TEAM.marcus.initials,  userColor: TEAM.marcus.color,  timestamp: "2025-06-02T10:00:00Z", meta: { from: "Open", to: "In Progress" } },
  { id: "ev-t3-4", eventType: "Comment Added",     userId: TEAM.marcus.id,  userName: TEAM.marcus.name,  userInitials: TEAM.marcus.initials,  userColor: TEAM.marcus.color,  timestamp: "2025-06-02T10:00:00Z" },
  { id: "ev-t3-5", eventType: "Mention Added",     userId: TEAM.priya.id,   userName: TEAM.priya.name,   userInitials: TEAM.priya.initials,   userColor: TEAM.priya.color,   timestamp: "2025-06-03T09:00:00Z", meta: { mentioned: "@Marcus Webb" } },
  { id: "ev-t3-6", eventType: "Attachment Uploaded", userId: TEAM.marcus.id, userName: TEAM.marcus.name,  userInitials: TEAM.marcus.initials,  userColor: TEAM.marcus.color,  timestamp: "2025-06-05T16:00:00Z", meta: { file: "HarborAuto-NegativeKeywords-Jun2025.xlsx" } },
  { id: "ev-t3-7", eventType: "Approval Requested", userId: TEAM.marcus.id, userName: TEAM.marcus.name,  userInitials: TEAM.marcus.initials,  userColor: TEAM.marcus.color,  timestamp: "2025-06-05T16:05:00Z", notes: "Negative Keyword List — AM Review requested" },
];

const dependencies_t3: TaskDependencyItem[] = [
  {
    id: "dep-t3-1",
    scope: "Task",
    name: "AM Approval — Negative Keyword List",
    status: "Pending",
    blockerReason: "Waiting on Approval",
    owner: TEAM.priya.name,
    dueDate: "2025-06-06",
    notes: "Final list submitted June 5. AM must approve before changes are applied to the live account.",
  },
];

const notifications_t3: CollabNotificationEvent[] = [
  { id: "notif-t3-1", type: "Approval Requested", taskId: "t-003-ppc", taskName: "Negative keyword audit — Harbor Auto", projectName: "Harbor Auto — Google Ads", triggeredBy: TEAM.marcus.name, recipient: TEAM.priya.name, timestamp: "2025-06-05T16:05:00Z", read: false, message: "Negative Keyword List ready for AM review before applying to live account" },
];

const escalations_t3: EscalationRecord[] = [
  {
    id: "esc-t3-1",
    level: "L1 - Team",
    assignedTeam: "PPC",
    assignedRole: "PPC Specialist",
    assignedUser: TEAM.marcus.name,
    assignedUserInitials: TEAM.marcus.initials,
    assignedUserColor: TEAM.marcus.color,
    trigger: "Approval Bottleneck",
    status: "Open",
    createdAt: "2025-06-05T16:05:00Z",
    notes: "Negative keyword list ready for AM review. Applying changes to live Harbor Auto account requires AM sign-off. Flagged for same-day resolution — changes should be applied before weekend traffic peak.",
  },
];

const aiSummary_t3: AICollaborationSummary = {
  taskId: "t-003-ppc",
  generatedAt: "2025-06-05T17:00:00Z",
  latestUpdates: [
    { category: "update", text: "Negative keyword audit complete — 47 negative keywords added across 3 match types. Geo-targeting corrected from Presence or Interest to Presence Only.", urgency: "info" },
    { category: "update", text: "Estimated ~18% wasted spend (~$756/mo) from job-seeker queries and out-of-state clicks being addressed. Changes pending AM approval before applying to live account.", urgency: "warn" },
  ],
  currentBlockers: [
    { category: "blocker", text: "AM approval (Priya Nair) required before negative keyword list is applied to Harbor Auto's live Google Ads account.", urgency: "warn" },
  ],
  pendingApprovals: [
    { category: "approval", text: "Negative Keyword List — AM Review: submitted June 5. Priya Nair must approve before changes go live. Weekend traffic peak makes same-day resolution important.", urgency: "warn" },
  ],
  recentEscalations: [
    { category: "escalation", text: "Approval Bottleneck escalation (L1 Team) opened June 5 to flag urgency of same-day AM review. Open.", urgency: "warn" },
  ],
  recommendedActions: [
    { category: "action", text: "Priya Nair should review and approve the negative keyword list today (June 5) so changes can be applied before the weekend traffic peak.", urgency: "warn" },
    { category: "action", text: "After changes are applied, schedule a 7-day performance check-in to confirm CTR improvement and wasted spend reduction.", urgency: "info" },
    { category: "action", text: "Prepare a before/after comparison (impression share, CTR, avg CPC) for Harbor Auto owner Tony Salazar's next monthly call.", urgency: "info" },
  ],
  projectHealthNotes: [
    { category: "health", text: "Project health is YELLOW. Audit is complete and quality is good — blocked only on AM sign-off. Low risk once approved.", urgency: "info" },
    { category: "health", text: "Client (Tony Salazar) is metrics-focused and aware the audit is in progress. Expects a change summary by end of week.", urgency: "info" },
  ],
};

// ── Exported Dataset ─────────────────────────────────────────────────────────

export const COLLABORATION_DATA: TaskCollaboration[] = [
  {
    taskId: "t-001-2-1",
    // Real engine task: am-mc011-t2 — "Set up access & tracking — SEO / GBP" (Waiting, High)
    // Real client: Ridgeline Construction LLC
    taskName: "Set up access & tracking — SEO / GBP",
    projectId: "proj-am-mc011",
    projectName: "Ridgeline Construction LLC — SEO / GBP",
    engineTaskId: "am-mc011-t2" as string,
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
    // Real engine task: am-mc004-t4 — "Deliver wireframe/mockup — Website Build" (In Progress, High)
    // Real client: Blue Ridge Plumbing Co.
    taskName: "Deliver wireframe/mockup — Website Build",
    projectId: "proj-am-mc004",
    projectName: "Blue Ridge Plumbing Co. — SEO / GBP / Website Build",
    engineTaskId: "am-mc004-t4" as string,
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
    // Real engine task: ga-1 — "Negative keyword audit — Harbor Auto" (In Progress, High)
    // Real client: Harbor Auto
    taskName: "Negative keyword audit — Harbor Auto",
    projectId: "proj-wt-ppc",
    projectName: "Harbor Auto — Google Ads",
    engineTaskId: "ga-1" as string,
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

// ── Helpers ───────────────────────────────────────────────────────────────────

export function getTaskCollaboration(taskId: string): TaskCollaboration | undefined {
  return COLLABORATION_DATA.find((d) => d.taskId === taskId);
}

/**
 * Returns the real engine Task record linked to a collaboration entry.
 * Uses engineTaskId when set; otherwise returns undefined.
 */
export function getEngineTaskForCollab(collab: TaskCollaboration): Task | undefined {
  const id = collab.engineTaskId;
  if (!id) return undefined;
  return ENGINE_STORE.tasks.find((t) => t.id === id);
}

/**
 * Returns the collaboration entry whose engineTaskId matches a given engine task ID.
 */
export function getCollabForEngineTask(engineTaskId: string): TaskCollaboration | undefined {
  return COLLABORATION_DATA.find((d) => d.engineTaskId === engineTaskId);
}

// ── All notifications across all tasks (for notification feed) ───────────────

export const ALL_COLLAB_NOTIFICATIONS: CollabNotificationEvent[] = COLLABORATION_DATA.flatMap(
  (d) => d.notifications,
);
