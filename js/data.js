// ====================
// PM OPS MAP - ALL 17 DEPARTMENTS, 351+ TASKS
// ====================

const orgData = {
  company: "Your Company",
  departments: [
    {
      id: "leasing",
      name: "Leasing & Marketing",
      color: "#1976d2",
      tasks: [
        { name: "Create property listings and syndicate to platforms", owner: "TeamMember6" },
        { name: "Conduct pricing strategy & rent comp analysis", owner: "TeamMember4" },
        { name: "Schedule and conduct showings", owner: "TeamMember6" },
        { name: "Manage prospect communication and lead follow-up", owner: "TeamMember6" },
        { name: "Pre-screen applicants before handoff", owner: "TeamMember6" },
        { name: "Process Notice to Vacate (leasing portion)", owner: "TeamMember6" },
        { name: "Prepare vacancy reporting to owners", owner: "TeamMember6" },
        { name: "Update property status in system", owner: "TeamMember6" },
        { name: "Write property descriptions for listings", owner: "TeamMember6" },
        { name: "Order and schedule professional photos", owner: "UNOWNED" },
        { name: "Coordinate move-in preparation", owner: "TeamMember6" },
        { name: "Post flyer campaigns", owner: "UNOWNED" },
        { name: "Manage social media (TikTok, Instagram, Facebook)", owner: "UNOWNED" },
        { name: "Guest card management", owner: "UNOWNED" },
        { name: "Monitor listing engagement metrics", owner: "UNOWNED" },
        { name: "Website improvements and SEO", owner: "UNOWNED" },
        { name: "Blog content creation", owner: "UNOWNED" },
        { name: "Paid advertising campaigns", owner: "UNOWNED" },
        { name: "Analytics & tracking", owner: "UNOWNED" },
        { name: "Video content creation", owner: "UNOWNED" }
      ]
    },
    {
      id: "applications",
      name: "Applications & Tenant Screening",
      color: "#6a1b9a",
      tasks: [
        { name: "Receive and process applications", owner: "TeamMember6" },
        { name: "Follow up on incomplete applications", owner: "TeamMember6" },
        { name: "Process application fees", owner: "TeamMember6" },
        { name: "Conduct application completeness checks", owner: "TeamMember6" },
        { name: "Perform income verification", owner: "TeamMember6" },
        { name: "Conduct employment verification", owner: "TeamMember6" },
        { name: "Contact previous landlords for references", owner: "TeamMember6" },
        { name: "Verify rental history", owner: "TeamMember6" },
        { name: "Calculate rent-to-income ratios", owner: "TeamMember6" },
        { name: "Process voucher applications (CHA, Section 8)", owner: "TeamMember6" },
        { name: "Run credit & criminal screening", owner: "TeamMember6" },
        { name: "Conduct pet screening", owner: "TeamMember6" },
        { name: "Perform fraud detection", owner: "TeamMember6" },
        { name: "Risk scoring and tenant selection", owner: "TeamMember6" },
        { name: "Generate approval & denial letters", owner: "TeamMember6" },
        { name: "Notify owners of applicant status", owner: "TeamMember6" }
      ]
    },
    {
      id: "move-ins",
      name: "Tenant Onboarding & Move-Ins",
      color: "#00897b",
      tasks: [
        { name: "Prepare move-in packet", owner: "TeamMember6" },
        { name: "Coordinate lease signing", owner: "TeamMember6" },
        { name: "Collect security deposits and first month rent", owner: "TeamMember6" },
        { name: "Collect pet deposits/fees", owner: "TeamMember6" },
        { name: "Process holding deposits", owner: "TeamMember6" },
        { name: "Calculate prorated rent", owner: "TeamMember6" },
        { name: "Set up condition report in Zinspector", owner: "TeamMember2" },
        { name: "Provide utility transfer instructions", owner: "TeamMember6" },
        { name: "Assign keys/lockbox access", owner: "TeamMember2" },
        { name: "Schedule and conduct move-in inspections", owner: "TeamMember2" },
        { name: "Complete inspection reports with photos", owner: "TeamMember2" },
        { name: "Send welcome messages", owner: "TeamMember6" },
        { name: "Update marketing listings (remove from market)", owner: "TeamMember6" }
      ]
    },
    {
      id: "tenant-comms",
      name: "Tenant Communications & Services",
      color: "#00695c",
      tasks: [
        { name: "Handle general tenant inquiries", owner: "TeamMember3" },
        { name: "Answer lease questions", owner: "TeamMember3" },
        { name: "Respond to ledger questions (non-delinquency)", owner: "TeamMember3" },
        { name: "Clarify guest/visitor policy", owner: "TeamMember3" },
        { name: "Process parking requests", owner: "TeamMember3" },
        { name: "Handle pets/ESA requests (after move-in)", owner: "TeamMember3" },
        { name: "Clarify property rules", owner: "TeamMember3" },
        { name: "Triage service requests (non-maintenance)", owner: "TeamMember3" },
        { name: "Answer rent increase questions", owner: "TeamMember3" },
        { name: "Provide move-out instructions", owner: "TeamMember3" }
      ]
    },
    {
      id: "delinquency",
      name: "Delinquency & Collections",
      color: "#c62828",
      tasks: [
        { name: "Review daily delinquencies", owner: "TeamMember3" },
        { name: "Send automated payment reminders", owner: "Carlos" },
        { name: "Set up and track payment plans", owner: "TeamMember3" },
        { name: "Generate and send 5-day notices", owner: "TeamMember3" },
        { name: "Coordinate with process servers", owner: "TeamMember1" },
        { name: "Coordinate posting with Field Tech", owner: "TeamMember2" },
        { name: "Handle eviction filing (admin)", owner: "TeamMember1" },
        { name: "Manage court scheduling (admin)", owner: "TeamMember1" },
        { name: "Perform ledger cleanup & accuracy checks", owner: "TeamMember5" },
        { name: "Track NSF (non-sufficient funds)", owner: "TeamMember5" },
        { name: "Negotiate early move-outs", owner: "TeamMember4" },
        { name: "Issue lease violation notices", owner: "TeamMember3" },
        { name: "Handle smoking violations", owner: "TeamMember3" },
        { name: "Address unauthorized occupants/pets", owner: "TeamMember3" },
        { name: "Prevent utility shutoff situations", owner: "TeamMember3" },
        { name: "Process garnishments or court-ordered payments", owner: "TeamMember5" }
      ]
    },
    {
      id: "maintenance",
      name: "Maintenance Coordination",
      color: "#ff6f00",
      tasks: [
        { name: "Monitor work order queue daily", owner: "TeamMember4" },
        { name: "Triage and prioritize incoming work orders", owner: "TeamMember4" },
        { name: "Receive and edit service requests in Property Meld", owner: "TeamMember4" },
        { name: "Respond to emergency maintenance requests (24/7)", owner: "TeamMember4" },
        { name: "Dispatch emergency services", owner: "TeamMember4" },
        { name: "Coordinate routine maintenance requests", owner: "TeamMember7" },
        { name: "Communicate with tenants about work orders", owner: "TeamMember7" },
        { name: "Follow up on open work orders", owner: "TeamMember7" },
        { name: "Gather invoices & after photos from vendors", owner: "TeamMember7" },
        { name: "Enter completed work orders into Buildium", owner: "TeamMember7" },
        { name: "Handle tenant maintenance complaints", owner: "TeamMember4" },
        { name: "Track maintenance costs per property", owner: "TeamMember4" },
        { name: "Coordinate access for vendors", owner: "TeamMember7" },
        { name: "Document before/after photos for repairs", owner: "TeamMember7" },
        { name: "Get owner approval for repairs ($500-$650 threshold)", owner: "TeamMember4" },
        { name: "Manage preventive maintenance schedules", owner: "UNOWNED" },
        { name: "Coordinate seasonal maintenance", owner: "UNOWNED" },
        { name: "Schedule common area cleaning", owner: "UNOWNED" },
        { name: "Coordinate snow removal", owner: "TeamMember4" },
        { name: "Manage lawn care", owner: "TeamMember4" },
        { name: "HVAC maintenance (fall heat check)", owner: "UNOWNED" },
        { name: "Coordinate appliance replacements", owner: "TeamMember4" },
        { name: "Order parts and supplies", owner: "TeamMember4" },
        { name: "Manage maintenance supply inventory", owner: "UNOWNED" },
        { name: "Respond to code violations or city notices", owner: "TeamMember4" }
      ]
    },
    {
      id: "vendors",
      name: "Vendor Management",
      color: "#388e3c",
      tasks: [
        { name: "Build and maintain vendor list", owner: "TeamMember4" },
        { name: "Vet and onboard new vendors", owner: "TeamMember4" },
        { name: "Verify vendor insurance", owner: "TeamMember4" },
        { name: "Collect W-9 forms", owner: "TeamMember5" },
        { name: "Negotiate rates", owner: "TeamMember4" },
        { name: "Track vendor performance", owner: "TeamMember4" },
        { name: "Conduct annual vendor reviews", owner: "UNOWNED" },
        { name: "Maintain emergency vendor roster", owner: "TeamMember4" },
        { name: "Get multiple bids for major repairs", owner: "TeamMember4" },
        { name: "Process vendor invoices", owner: "TeamMember5" },
        { name: "Match invoices to work orders", owner: "TeamMember5" },
        { name: "Review owner billable expenses", owner: "TeamMember5" },
        { name: "Coordinate payment processing", owner: "TeamMember5" }
      ]
    },
    {
      id: "unit-turns",
      name: "Make-Ready & Unit Turns",
      color: "#f57c00",
      tasks: [
        { name: "Coordinate pre-inspection", owner: "TeamMember4" },
        { name: "Collect scope & estimates", owner: "TeamMember4" },
        { name: "Obtain owner approval", owner: "TeamMember4" },
        { name: "Schedule vendors", owner: "TeamMember7" },
        { name: "Set up key access", owner: "TeamMember2" },
        { name: "Create work orders for all punchlist items", owner: "TeamMember7" },
        { name: "Coordinate trash-out", owner: "TeamMember7" },
        { name: "Schedule painting", owner: "TeamMember7" },
        { name: "Schedule cleaning", owner: "TeamMember7" },
        { name: "Conduct final QC inspection", owner: "TeamMember4" },
        { name: "Confirm lease readiness", owner: "TeamMember4" },
        { name: "Hand off to Leasing when move-in ready", owner: "TeamMember4" },
        { name: "Update property information in Buildium", owner: "TeamMember6" }
      ]
    },
    {
      id: "move-outs",
      name: "Move-Outs & Inspections",
      color: "#00acc1",
      tasks: [
        { name: "Receive Notice to Vacate", owner: "TeamMember6" },
        { name: "Send move-out instructions", owner: "TeamMember3" },
        { name: "Confirm utility transfer", owner: "TeamMember3" },
        { name: "Send pre-move-out reminders", owner: "TeamMember3" },
        { name: "Provide move-out checklist", owner: "TeamMember3" },
        { name: "Schedule move-out inspection", owner: "TeamMember2" },
        { name: "Conduct move-out inspection", owner: "TeamMember2" },
        { name: "Complete inspection reports in Zinspector", owner: "TeamMember2" },
        { name: "Document property condition with photos/notes", owner: "TeamMember2" },
        { name: "Identify maintenance needs", owner: "TeamMember2" },
        { name: "Provide inspection reports to owners and tenants", owner: "TeamMember2" },
        { name: "Hand off to Resident Services for deposit disposition", owner: "UNOWNED" },
        { name: "Schedule and conduct routine inspections", owner: "UNOWNED" },
        { name: "Conduct CHA inspections", owner: "TeamMember4" }
      ]
    },
    {
      id: "field-services",
      name: "Field Services & Access Control",
      color: "#5e35b1",
      tasks: [
        { name: "Post notices (5-day, eviction, etc.)", owner: "TeamMember2" },
        { name: "Install locks", owner: "TeamMember2" },
        { name: "Label keys", owner: "TeamMember2" },
        { name: "Check lock inventory", owner: "TeamMember2" },
        { name: "Take property photos", owner: "TeamMember2" },
        { name: "Deliver/return keys", owner: "TeamMember2" },
        { name: "Install lockboxes", owner: "TeamMember2" },
        { name: "Meet vendors on-site", owner: "TeamMember2" },
        { name: "Conduct property walk-throughs", owner: "TeamMember2" },
        { name: "Perform safety checks", owner: "TeamMember2" },
        { name: "Conduct smoke/CO inspections", owner: "TeamMember2" },
        { name: "Perform basic repairs", owner: "TeamMember2" },
        { name: "Read utility meters", owner: "TeamMember2" },
        { name: "Conduct exterior property checks (vacant units)", owner: "TeamMember2" }
      ]
    },
    {
      id: "utilities",
      name: "Utilities & Insurance",
      color: "#689f38",
      tasks: [
        { name: "Prevent utility shutoff", owner: "UNOWNED" },
        { name: "Switch utilities into company name at vacancy", owner: "UNOWNED" },
        { name: "Switch utilities out at move-in", owner: "UNOWNED" },
        { name: "Track utility bills", owner: "UNOWNED" },
        { name: "Coordinate with Accounting department", owner: "UNOWNED" },
        { name: "Conduct gas/electric checks before move-in", owner: "UNOWNED" },
        { name: "Ensure service is on during turns", owner: "UNOWNED" },
        { name: "Confirm boiler-building exceptions", owner: "UNOWNED" },
        { name: "Handle insurance claims related to property damage", owner: "TeamMember4" }
      ]
    },
    {
      id: "owner-relations",
      name: "Owner Communications & Relations",
      color: "#0277bd",
      tasks: [
        { name: "Handle routine owner questions", owner: "TeamMember3" },
        { name: "Provide rent updates", owner: "TeamMember3" },
        { name: "Send maintenance updates (non-escalated)", owner: "TeamMember3" },
        { name: "Process document requests", owner: "TeamMember3" },
        { name: "Provide showing activity summaries", owner: "TeamMember3" },
        { name: "Send application status updates", owner: "TeamMember3" },
        { name: "Communicate renewal updates", owner: "TeamMember3" },
        { name: "Send monthly owner statements", owner: "TeamMember5" },
        { name: "Handle owner inquiries (calls, emails)", owner: "TeamMember3" },
        { name: "Facilitate owner portal access", owner: "TeamMember3" },
        { name: "Send annual property performance reports", owner: "UNOWNED" },
        { name: "Provide market updates and rental trend analysis", owner: "UNOWNED" },
        { name: "Handle escalation situations", owner: "TeamMember4" },
        { name: "Align owner expectations", owner: "TeamMember4" },
        { name: "Provide strategic pricing recommendations", owner: "TeamMember4" },
        { name: "Review renewal pricing", owner: "TeamMember4" },
        { name: "Plan CapEx projects", owner: "TeamMember4" },
        { name: "Conduct portfolio performance discussions", owner: "TeamMember1" },
        { name: "Manage difficult tenant/owner situations", owner: "TeamMember1" },
        { name: "Conduct owner onboarding calls (high-level clients)", owner: "TeamMember1" }
      ]
    },
    {
      id: "owner-onboarding",
      name: "Owner Onboarding",
      color: "#7b1fa2",
      tasks: [
        { name: "Collect owner documents", owner: "TeamMember3" },
        { name: "Confirm banking information", owner: "TeamMember5" },
        { name: "Set up owner accounts in Buildium", owner: "TeamMember5" },
        { name: "Set up in LeadSimple", owner: "Carlos" },
        { name: "Set up in Property Meld", owner: "Carlos" },
        { name: "Establish owner payment preferences", owner: "TeamMember5" },
        { name: "Create management agreements", owner: "TeamMember3" },
        { name: "Collect initial owner funds", owner: "TeamMember5" },
        { name: "Conduct initial property walkthrough/inspection", owner: "TeamMember4" },
        { name: "Set rental price recommendations", owner: "TeamMember4" },
        { name: "Get owner approval on rental pricing", owner: "TeamMember4" },
        { name: "Check utility account status", owner: "UNOWNED" },
        { name: "Set up lockbox & access", owner: "TeamMember2" },
        { name: "Complete move-in-ready checklist", owner: "TeamMember4" },
        { name: "Verify insurance", owner: "TeamMember3" },
        { name: "Send owner welcome email", owner: "TeamMember3" },
        { name: "Create Notion owner page", owner: "Carlos" }
      ]
    },
    {
      id: "accounting",
      name: "Accounting & Finance",
      color: "#00897b",
      tasks: [
        { name: "Process accounts payable", owner: "TeamMember5" },
        { name: "Process accounts receivable", owner: "TeamMember5" },
        { name: "Reconcile bank accounts monthly", owner: "TeamMember5" },
        { name: "Process owner distributions/payments", owner: "TeamMember5" },
        { name: "Generate financial reports", owner: "TeamMember5" },
        { name: "Handle trust account management", owner: "TeamMember5" },
        { name: "Process refunds (tenant, owner)", owner: "TeamMember5" },
        { name: "Coordinate with CPA/bookkeeper", owner: "TeamMember5" },
        { name: "File sales tax (if applicable)", owner: "TeamMember5" },
        { name: "Manage chart of accounts", owner: "TeamMember5" },
        { name: "Maintain rent roll accuracy", owner: "TeamMember5" },
        { name: "Track reserve accounts", owner: "TeamMember5" },
        { name: "Monitor bank accounts", owner: "TeamMember5" },
        { name: "Audit preparation and support", owner: "TeamMember5" },
        { name: "Process owner draws", owner: "TeamMember5" },
        { name: "Handle reserve requests", owner: "TeamMember5" },
        { name: "Process special funding requests", owner: "TeamMember5" },
        { name: "Manage CapEx fund", owner: "TeamMember5" },
        { name: "Track negative balances", owner: "TeamMember5" },
        { name: "Handle year-end tax prep (1099s, owner statements)", owner: "TeamMember5" },
        { name: "Match vendor invoices to work orders", owner: "TeamMember5" },
        { name: "Review owner billable expenses", owner: "TeamMember5" },
        { name: "Make ledger adjustments", owner: "TeamMember5" },
        { name: "Check invoice accuracy", owner: "TeamMember5" },
        { name: "Process chargebacks to tenants", owner: "TeamMember5" },
        { name: "Receive deposit funds", owner: "TeamMember5" },
        { name: "Assign proper account designation", owner: "TeamMember5" },
        { name: "Track deposit compliance", owner: "TeamMember5" },
        { name: "Adjust ledger after Statement of Damages", owner: "TeamMember5" },
        { name: "Process final refunds", owner: "TeamMember5" }
      ]
    },
    {
      id: "compliance",
      name: "Compliance & Legal",
      color: "#512da8",
      tasks: [
        { name: "Stay updated on local/state landlord-tenant laws", owner: "UNOWNED" },
        { name: "Ensure lease templates comply with regulations", owner: "UNOWNED" },
        { name: "File required business licenses and renewals", owner: "UNOWNED" },
        { name: "Maintain fair housing compliance", owner: "UNOWNED" },
        { name: "Process public records requests", owner: "UNOWNED" },
        { name: "Coordinate with attorney on legal matters", owner: "TeamMember1" },
        { name: "Maintain required insurance policies", owner: "TeamMember1" },
        { name: "Handle eviction filings and court appearances", owner: "UNOWNED" },
        { name: "Process security deposit legal requirements", owner: "UNOWNED" },
        { name: "Ensure lead paint disclosures", owner: "UNOWNED" },
        { name: "Handle ADA compliance issues", owner: "UNOWNED" },
        { name: "File required state/local PM reports", owner: "UNOWNED" },
        { name: "Maintain required trust account documentation", owner: "TeamMember5" }
      ]
    },
    {
      id: "reporting",
      name: "Reporting & KPIs",
      color: "#7b1fa2",
      tasks: [
        { name: "Track and report KPIs", owner: "UNOWNED" },
        { name: "Generate weekly reports", owner: "UNOWNED" },
        { name: "Create monthly summaries", owner: "UNOWNED" },
        { name: "Prepare owner performance reports", owner: "UNOWNED" },
        { name: "Build LeadSimple report views", owner: "Carlos" },
        { name: "Track maintenance metrics", owner: "UNOWNED" },
        { name: "Monitor and report company scorecard", owner: "UNOWNED" }
      ]
    },
    {
      id: "systems",
      name: "Technology & Systems",
      color: "#0277bd",
      tasks: [
        { name: "Configure Buildium settings", owner: "Carlos" },
        { name: "Build LeadSimple workflows", owner: "Carlos" },
        { name: "Adjust Property Meld settings", owner: "Carlos" },
        { name: "Create and update document templates", owner: "Carlos" },
        { name: "Update Knowledge Core (internal wiki)", owner: "Carlos" },
        { name: "Manage user access", owner: "Carlos" },
        { name: "Build system automations (Zapier, etc.)", owner: "Carlos" },
        { name: "Update SOP documentation", owner: "Carlos" },
        { name: "Create process diagrams", owner: "Carlos" },
        { name: "Record tutorial videos", owner: "Carlos" },
        { name: "Build checklists", owner: "Carlos" },
        { name: "Develop role training modules", owner: "Carlos" }
      ]
    }
  ]
};

// strategicModels and caseStudies removed — generic consulting content
// doesn't belong in a neutral operational tool.


// ====================
// DEFAULT AFFINITIES
// ====================
// Maps each employee name to the department IDs they're naturally responsible for.
// The auto-assign engine uses this to route UNOWNED tasks to the right person.
//
// Think of this as a skills matrix: TeamMember4 "knows" maintenance, TeamMember6 "knows" leasing, etc.
// On first load, teamData is seeded from this map. After that, managers can edit
// affinities per-employee in the Team Manager view and changes are saved to localStorage.
const defaultAffinities = {
  "TeamMember4":  ["maintenance", "vendors", "unit-turns", "utilities", "owner-relations", "owner-onboarding"],
  "TeamMember7": ["maintenance", "unit-turns"],
  "TeamMember5":  ["accounting", "vendors", "owner-onboarding", "delinquency"],
  "TeamMember6": ["leasing", "applications", "move-ins", "move-outs", "unit-turns"],
  "TeamMember3":   ["tenant-comms", "delinquency", "move-outs", "owner-relations", "owner-onboarding"],
  "TeamMember2":   ["move-ins", "move-outs", "field-services", "unit-turns", "owner-onboarding"],
  "TeamMember1":   ["delinquency", "compliance", "owner-relations"],
  "Carlos":  ["delinquency", "owner-onboarding", "reporting", "systems"]
};

// Owner color mapping for UI
const ownerColors = {
  "TeamMember4": { class: "owner-teammember4", hex: "#ff6f00" },
  "TeamMember7": { class: "owner-teammember7", hex: "#1976d2" },
  "TeamMember5": { class: "owner-teammember5", hex: "#00897b" },
  "TeamMember6": { class: "owner-teammember6", hex: "#6a1b9a" },
  "TeamMember3": { class: "owner-teammember3", hex: "#00695c" },
  "TeamMember1": { class: "owner-teammember1", hex: "#263238" },
  "Carlos": { class: "owner-carlos", hex: "#c62828" },
  "TeamMember2": { class: "owner-teammember2", hex: "#5e35b1" },
  "UNOWNED": { class: "owner-unowned", hex: "#d32f2f" }
};

if (typeof module !== 'undefined') { module.exports = { orgData, ownerColors, defaultAffinities }; }
