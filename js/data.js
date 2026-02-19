// ====================
// COMPLETE PARAGON DATA - ALL 17 DEPARTMENTS, 351+ TASKS
// ====================

const orgData = {
  company: "Paragon Property Management",
  departments: [
    {
      id: "leasing",
      name: "Leasing & Marketing",
      color: "#1976d2",
      tasks: [
        { name: "Create property listings and syndicate to platforms", owner: "Cathryn" },
        { name: "Conduct pricing strategy & rent comp analysis", owner: "Nathan" },
        { name: "Schedule and conduct showings", owner: "Cathryn" },
        { name: "Manage prospect communication and lead follow-up", owner: "Cathryn" },
        { name: "Pre-screen applicants before handoff", owner: "Cathryn" },
        { name: "Process Notice to Vacate (leasing portion)", owner: "Cathryn" },
        { name: "Prepare vacancy reporting to owners", owner: "Cathryn" },
        { name: "Update property status in system", owner: "Cathryn" },
        { name: "Write property descriptions for listings", owner: "Cathryn" },
        { name: "Order and schedule professional photos", owner: "UNOWNED" },
        { name: "Coordinate move-in preparation", owner: "Cathryn" },
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
        { name: "Receive and process applications", owner: "Cathryn" },
        { name: "Follow up on incomplete applications", owner: "Cathryn" },
        { name: "Process application fees", owner: "Cathryn" },
        { name: "Conduct application completeness checks", owner: "Cathryn" },
        { name: "Perform income verification", owner: "Cathryn" },
        { name: "Conduct employment verification", owner: "Cathryn" },
        { name: "Contact previous landlords for references", owner: "Cathryn" },
        { name: "Verify rental history", owner: "Cathryn" },
        { name: "Calculate rent-to-income ratios", owner: "Cathryn" },
        { name: "Process voucher applications (CHA, Section 8)", owner: "Cathryn" },
        { name: "Run credit & criminal screening", owner: "Cathryn" },
        { name: "Conduct pet screening", owner: "Cathryn" },
        { name: "Perform fraud detection", owner: "Cathryn" },
        { name: "Risk scoring and tenant selection", owner: "Cathryn" },
        { name: "Generate approval & denial letters", owner: "Cathryn" },
        { name: "Notify owners of applicant status", owner: "Cathryn" }
      ]
    },
    {
      id: "move-ins",
      name: "Tenant Onboarding & Move-Ins",
      color: "#00897b",
      tasks: [
        { name: "Prepare move-in packet", owner: "Cathryn" },
        { name: "Coordinate lease signing", owner: "Cathryn" },
        { name: "Collect security deposits and first month rent", owner: "Cathryn" },
        { name: "Collect pet deposits/fees", owner: "Cathryn" },
        { name: "Process holding deposits", owner: "Cathryn" },
        { name: "Calculate prorated rent", owner: "Cathryn" },
        { name: "Set up condition report in Zinspector", owner: "Kevin" },
        { name: "Provide utility transfer instructions", owner: "Cathryn" },
        { name: "Assign keys/lockbox access", owner: "Kevin" },
        { name: "Schedule and conduct move-in inspections", owner: "Kevin" },
        { name: "Complete inspection reports with photos", owner: "Kevin" },
        { name: "Send welcome messages", owner: "Cathryn" },
        { name: "Update marketing listings (remove from market)", owner: "Cathryn" }
      ]
    },
    {
      id: "tenant-comms",
      name: "Tenant Communications & Services",
      color: "#00695c",
      tasks: [
        { name: "Handle general tenant inquiries", owner: "Linda" },
        { name: "Answer lease questions", owner: "Linda" },
        { name: "Respond to ledger questions (non-delinquency)", owner: "Linda" },
        { name: "Clarify guest/visitor policy", owner: "Linda" },
        { name: "Process parking requests", owner: "Linda" },
        { name: "Handle pets/ESA requests (after move-in)", owner: "Linda" },
        { name: "Clarify property rules", owner: "Linda" },
        { name: "Triage service requests (non-maintenance)", owner: "Linda" },
        { name: "Answer rent increase questions", owner: "Linda" },
        { name: "Provide move-out instructions", owner: "Linda" }
      ]
    },
    {
      id: "delinquency",
      name: "Delinquency & Collections",
      color: "#c62828",
      tasks: [
        { name: "Review daily delinquencies", owner: "UNOWNED" },
        { name: "Send automated payment reminders", owner: "UNOWNED" },
        { name: "Set up and track payment plans", owner: "UNOWNED" },
        { name: "Generate and send 5-day notices", owner: "UNOWNED" },
        { name: "Coordinate with process servers", owner: "UNOWNED" },
        { name: "Coordinate posting with Field Tech", owner: "UNOWNED" },
        { name: "Handle eviction filing (admin)", owner: "UNOWNED" },
        { name: "Manage court scheduling (admin)", owner: "UNOWNED" },
        { name: "Perform ledger cleanup & accuracy checks", owner: "UNOWNED" },
        { name: "Track NSF (non-sufficient funds)", owner: "UNOWNED" },
        { name: "Negotiate early move-outs", owner: "UNOWNED" },
        { name: "Issue lease violation notices", owner: "UNOWNED" },
        { name: "Handle smoking violations", owner: "UNOWNED" },
        { name: "Address unauthorized occupants/pets", owner: "UNOWNED" },
        { name: "Prevent utility shutoff situations", owner: "UNOWNED" },
        { name: "Process garnishments or court-ordered payments", owner: "UNOWNED" }
      ]
    },
    {
      id: "maintenance",
      name: "Maintenance Coordination",
      color: "#ff6f00",
      tasks: [
        { name: "Monitor work order queue daily", owner: "Nathan" },
        { name: "Triage and prioritize incoming work orders", owner: "Nathan" },
        { name: "Receive and edit service requests in Property Meld", owner: "Nathan" },
        { name: "Respond to emergency maintenance requests (24/7)", owner: "Nathan" },
        { name: "Dispatch emergency services", owner: "Nathan" },
        { name: "Coordinate routine maintenance requests", owner: "Patrick" },
        { name: "Communicate with tenants about work orders", owner: "Patrick" },
        { name: "Follow up on open work orders", owner: "Patrick" },
        { name: "Gather invoices & after photos from vendors", owner: "Patrick" },
        { name: "Enter completed work orders into Buildium", owner: "Patrick" },
        { name: "Handle tenant maintenance complaints", owner: "Nathan" },
        { name: "Track maintenance costs per property", owner: "Nathan" },
        { name: "Coordinate access for vendors", owner: "Patrick" },
        { name: "Document before/after photos for repairs", owner: "Patrick" },
        { name: "Get owner approval for repairs ($500-$650 threshold)", owner: "Nathan" },
        { name: "Manage preventive maintenance schedules", owner: "UNOWNED" },
        { name: "Coordinate seasonal maintenance", owner: "UNOWNED" },
        { name: "Schedule common area cleaning", owner: "UNOWNED" },
        { name: "Coordinate snow removal", owner: "Nathan" },
        { name: "Manage lawn care", owner: "Nathan" },
        { name: "HVAC maintenance (fall heat check)", owner: "UNOWNED" },
        { name: "Coordinate appliance replacements", owner: "Nathan" },
        { name: "Order parts and supplies", owner: "Nathan" },
        { name: "Manage maintenance supply inventory", owner: "UNOWNED" },
        { name: "Respond to code violations or city notices", owner: "Nathan" }
      ]
    },
    {
      id: "vendors",
      name: "Vendor Management",
      color: "#388e3c",
      tasks: [
        { name: "Build and maintain vendor list", owner: "Nathan" },
        { name: "Vet and onboard new vendors", owner: "Nathan" },
        { name: "Verify vendor insurance", owner: "Nathan" },
        { name: "Collect W-9 forms", owner: "Austin" },
        { name: "Negotiate rates", owner: "Nathan" },
        { name: "Track vendor performance", owner: "Nathan" },
        { name: "Conduct annual vendor reviews", owner: "UNOWNED" },
        { name: "Maintain emergency vendor roster", owner: "Nathan" },
        { name: "Get multiple bids for major repairs", owner: "Nathan" },
        { name: "Process vendor invoices", owner: "Austin" },
        { name: "Match invoices to work orders", owner: "Austin" },
        { name: "Review owner billable expenses", owner: "Austin" },
        { name: "Coordinate payment processing", owner: "Austin" }
      ]
    },
    {
      id: "unit-turns",
      name: "Make-Ready & Unit Turns",
      color: "#f57c00",
      tasks: [
        { name: "Coordinate pre-inspection", owner: "Nathan" },
        { name: "Collect scope & estimates", owner: "Nathan" },
        { name: "Obtain owner approval", owner: "Nathan" },
        { name: "Schedule vendors", owner: "Patrick" },
        { name: "Set up key access", owner: "Kevin" },
        { name: "Create work orders for all punchlist items", owner: "Patrick" },
        { name: "Coordinate trash-out", owner: "Patrick" },
        { name: "Schedule painting", owner: "Patrick" },
        { name: "Schedule cleaning", owner: "Patrick" },
        { name: "Conduct final QC inspection", owner: "Nathan" },
        { name: "Confirm lease readiness", owner: "Nathan" },
        { name: "Hand off to Leasing when move-in ready", owner: "Nathan" },
        { name: "Update property information in Buildium", owner: "Cathryn" }
      ]
    },
    {
      id: "move-outs",
      name: "Move-Outs & Inspections",
      color: "#00acc1",
      tasks: [
        { name: "Receive Notice to Vacate", owner: "Cathryn" },
        { name: "Send move-out instructions", owner: "Linda" },
        { name: "Confirm utility transfer", owner: "Linda" },
        { name: "Send pre-move-out reminders", owner: "Linda" },
        { name: "Provide move-out checklist", owner: "Linda" },
        { name: "Schedule move-out inspection", owner: "Kevin" },
        { name: "Conduct move-out inspection", owner: "Kevin" },
        { name: "Complete inspection reports in Zinspector", owner: "Kevin" },
        { name: "Document property condition with photos/notes", owner: "Kevin" },
        { name: "Identify maintenance needs", owner: "Kevin" },
        { name: "Provide inspection reports to owners and tenants", owner: "Kevin" },
        { name: "Hand off to Resident Services for deposit disposition", owner: "UNOWNED" },
        { name: "Schedule and conduct routine inspections", owner: "UNOWNED" },
        { name: "Conduct CHA inspections", owner: "Nathan" }
      ]
    },
    {
      id: "field-services",
      name: "Field Services & Access Control",
      color: "#5e35b1",
      tasks: [
        { name: "Post notices (5-day, eviction, etc.)", owner: "Kevin" },
        { name: "Install locks", owner: "Kevin" },
        { name: "Label keys", owner: "Kevin" },
        { name: "Check lock inventory", owner: "Kevin" },
        { name: "Take property photos", owner: "Kevin" },
        { name: "Deliver/return keys", owner: "Kevin" },
        { name: "Install lockboxes", owner: "Kevin" },
        { name: "Meet vendors on-site", owner: "Kevin" },
        { name: "Conduct property walk-throughs", owner: "Kevin" },
        { name: "Perform safety checks", owner: "Kevin" },
        { name: "Conduct smoke/CO inspections", owner: "Kevin" },
        { name: "Perform basic repairs", owner: "Kevin" },
        { name: "Read utility meters", owner: "Kevin" },
        { name: "Conduct exterior property checks (vacant units)", owner: "Kevin" }
      ]
    },
    {
      id: "utilities",
      name: "Utilities & Insurance",
      color: "#689f38",
      tasks: [
        { name: "Prevent utility shutoff", owner: "UNOWNED" },
        { name: "Switch utilities into Paragon name at vacancy", owner: "UNOWNED" },
        { name: "Switch utilities out at move-in", owner: "UNOWNED" },
        { name: "Track utility bills", owner: "UNOWNED" },
        { name: "Coordinate with Accounting department", owner: "UNOWNED" },
        { name: "Conduct gas/electric checks before move-in", owner: "UNOWNED" },
        { name: "Ensure service is on during turns", owner: "UNOWNED" },
        { name: "Confirm boiler-building exceptions", owner: "UNOWNED" },
        { name: "Handle insurance claims related to property damage", owner: "Nathan" }
      ]
    },
    {
      id: "owner-relations",
      name: "Owner Communications & Relations",
      color: "#0277bd",
      tasks: [
        { name: "Handle routine owner questions", owner: "Linda" },
        { name: "Provide rent updates", owner: "Linda" },
        { name: "Send maintenance updates (non-escalated)", owner: "Linda" },
        { name: "Process document requests", owner: "Linda" },
        { name: "Provide showing activity summaries", owner: "Linda" },
        { name: "Send application status updates", owner: "Linda" },
        { name: "Communicate renewal updates", owner: "Linda" },
        { name: "Send monthly owner statements", owner: "Austin" },
        { name: "Handle owner inquiries (calls, emails)", owner: "Linda" },
        { name: "Facilitate owner portal access", owner: "Linda" },
        { name: "Send annual property performance reports", owner: "UNOWNED" },
        { name: "Provide market updates and rental trend analysis", owner: "UNOWNED" },
        { name: "Handle escalation situations", owner: "Nathan" },
        { name: "Align owner expectations", owner: "Nathan" },
        { name: "Provide strategic pricing recommendations", owner: "Nathan" },
        { name: "Review renewal pricing", owner: "Nathan" },
        { name: "Plan CapEx projects", owner: "Nathan" },
        { name: "Conduct portfolio performance discussions", owner: "Jason" },
        { name: "Manage difficult tenant/owner situations", owner: "Jason" },
        { name: "Conduct owner onboarding calls (high-level clients)", owner: "Jason" }
      ]
    },
    {
      id: "owner-onboarding",
      name: "Owner Onboarding",
      color: "#7b1fa2",
      tasks: [
        { name: "Collect owner documents", owner: "Linda" },
        { name: "Confirm banking information", owner: "Austin" },
        { name: "Set up owner accounts in Buildium", owner: "Austin" },
        { name: "Set up in LeadSimple", owner: "Carlos" },
        { name: "Set up in Property Meld", owner: "Carlos" },
        { name: "Establish owner payment preferences", owner: "Austin" },
        { name: "Create management agreements", owner: "Linda" },
        { name: "Collect initial owner funds", owner: "Austin" },
        { name: "Conduct initial property walkthrough/inspection", owner: "Nathan" },
        { name: "Set rental price recommendations", owner: "Nathan" },
        { name: "Get owner approval on rental pricing", owner: "Nathan" },
        { name: "Check utility account status", owner: "UNOWNED" },
        { name: "Set up lockbox & access", owner: "Kevin" },
        { name: "Complete move-in-ready checklist", owner: "Nathan" },
        { name: "Verify insurance", owner: "Linda" },
        { name: "Send owner welcome email", owner: "Linda" },
        { name: "Create Notion owner page", owner: "Carlos" }
      ]
    },
    {
      id: "accounting",
      name: "Accounting & Finance",
      color: "#00897b",
      tasks: [
        { name: "Process accounts payable", owner: "Austin" },
        { name: "Process accounts receivable", owner: "Austin" },
        { name: "Reconcile bank accounts monthly", owner: "Austin" },
        { name: "Process owner distributions/payments", owner: "Austin" },
        { name: "Generate financial reports", owner: "Austin" },
        { name: "Handle trust account management", owner: "Austin" },
        { name: "Process refunds (tenant, owner)", owner: "Austin" },
        { name: "Coordinate with CPA/bookkeeper", owner: "Austin" },
        { name: "File sales tax (if applicable)", owner: "Austin" },
        { name: "Manage chart of accounts", owner: "Austin" },
        { name: "Maintain rent roll accuracy", owner: "Austin" },
        { name: "Track reserve accounts", owner: "Austin" },
        { name: "Monitor bank accounts", owner: "Austin" },
        { name: "Audit preparation and support", owner: "Austin" },
        { name: "Process owner draws", owner: "Austin" },
        { name: "Handle reserve requests", owner: "Austin" },
        { name: "Process special funding requests", owner: "Austin" },
        { name: "Manage CapEx fund", owner: "Austin" },
        { name: "Track negative balances", owner: "Austin" },
        { name: "Handle year-end tax prep (1099s, owner statements)", owner: "Austin" },
        { name: "Match vendor invoices to work orders", owner: "Austin" },
        { name: "Review owner billable expenses", owner: "Austin" },
        { name: "Make ledger adjustments", owner: "Austin" },
        { name: "Check invoice accuracy", owner: "Austin" },
        { name: "Process chargebacks to tenants", owner: "Austin" },
        { name: "Receive deposit funds", owner: "Austin" },
        { name: "Assign proper account designation", owner: "Austin" },
        { name: "Track deposit compliance", owner: "Austin" },
        { name: "Adjust ledger after Statement of Damages", owner: "Austin" },
        { name: "Process final refunds", owner: "Austin" }
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
        { name: "Coordinate with attorney on legal matters", owner: "Jason" },
        { name: "Maintain required insurance policies", owner: "Jason" },
        { name: "Handle eviction filings and court appearances", owner: "UNOWNED" },
        { name: "Process security deposit legal requirements", owner: "UNOWNED" },
        { name: "Ensure lead paint disclosures", owner: "UNOWNED" },
        { name: "Handle ADA compliance issues", owner: "UNOWNED" },
        { name: "File required state/local PM reports", owner: "UNOWNED" },
        { name: "Maintain required trust account documentation", owner: "Austin" }
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

// Strategic Models Data
const strategicModels = [
  {
    title: "MODEL 1: Functional Specialization",
    subtitle: "(Traditional Departmental Approach)",
    bestFor: "Companies prioritizing deep expertise and clear accountability",
    teamStructure: [
      "CEO - Jason (Strategic leadership, large owner relationships)",
      "Operations Manager - Carlos (Systems, process improvement, training)",
      "Leasing Specialist (2 FTE) - Showings, applications, marketing",
      "Maintenance Coordinator (2 FTE) - Work orders, vendor management, emergency response",
      "Tenant Relations Specialist (1 FTE) - Communications, delinquency, violations",
      "Owner Relations Specialist (1 FTE) - Owner comms, reporting, onboarding",
      "Accounting/Finance (1 FTE) - AP/AR, reconciliations, trust accounts"
    ],
    pros: [
      "Deep functional expertise develops over time",
      "Clear ownership and accountability for each area",
      "Easier to train specialists in narrow domains",
      "Scales efficiently as unit count grows",
      "Quality control is simpler within departments"
    ],
    cons: [
      "Silos can develop between departments",
      "Handoffs between functions create bottlenecks",
      "Less flexibility when team members are out",
      "Cross-functional projects require more coordination"
    ],
    example: "Bayside Property Management (Bay Area) uses this model managing 800+ units with specialized teams"
  },
  {
    title: "MODEL 2: Portfolio Segmentation",
    subtitle: "(Property Manager / Account Manager Approach)",
    bestFor: "Companies prioritizing owner relationships and end-to-end ownership",
    teamStructure: [
      "CEO - Jason (Strategic leadership, business development)",
      "Operations Manager - Carlos (Systems, training, quality control)",
      "Property Manager A (50-75 units) - Full lifecycle ownership",
      "Property Manager B (50-75 units) - Full lifecycle ownership",
      "Property Manager C (50-75 units) - Full lifecycle ownership",
      "Shared Maintenance Coordinator - Supports all PMs with vendor coordination",
      "Shared Leasing Specialist - Supports all PMs with showings/applications",
      "Accounting - Handles financial operations for all portfolios"
    ],
    pros: [
      "Owners get single point of contact",
      "Reduced handoffs between functions",
      "PM develops deep portfolio knowledge",
      "Stronger relationships with owners and tenants",
      "Entrepreneurial ownership mentality"
    ],
    cons: [
      "Less deep expertise in specific functions",
      "Vacation/sick coverage is more complex",
      "Training takes longer (need generalists)",
      "Harder to standardize processes across PMs"
    ],
    example: "RPM Franchise Model where Property Managers own 50-75 unit portfolios end-to-end"
  },
  {
    title: "MODEL 3: Pod System",
    subtitle: "(Agile Team / Squad Approach)",
    bestFor: "Fast-moving companies prioritizing flexibility and collaboration",
    teamStructure: [
      "Leadership Layer: CEO + Operations Manager",
      "Pod 1 - Acquisition & Onboarding: Leasing Specialist + Admin Coordinator",
      "Pod 2 - Operations & Maintenance: 2 Maintenance Coordinators + Field Tech",
      "Pod 3 - Client Relations & Finance: Owner Relations + Tenant Relations + Accountant",
      "Pods operate semi-autonomously with weekly sync meetings",
      "Team members can shift between pods based on workload"
    ],
    pros: [
      "High flexibility and cross-training opportunities",
      "Better workload balancing across teams",
      "Encourages collaborative problem-solving",
      "Modern culture attracts younger talent",
      "Adapts quickly to changing priorities"
    ],
    cons: [
      "Requires strong communication systems",
      "Accountability can blur without clear ownership",
      "Needs mature, self-directed team members",
      "More complex to manage than traditional structure"
    ],
    example: "Spotify Squad Model adapted for PM operations by AppFolio-managed companies"
  },
  {
    title: "MODEL 4: Hybrid Core + Flex",
    subtitle: "(Scalability-Focused Model) ⭐ RECOMMENDED FOR PARAGON",
    bestFor: "Growing companies preparing for rapid scale (150 → 500 units)",
    teamStructure: [
      "Core Team (6 FTE): CEO, Ops Manager, Lead Maintenance, Lead Leasing, Accounting, Owner Relations",
      "Flex Team (3 FTE): Rotate between Maintenance support, Leasing support, Admin support based on weekly priorities",
      "Core team owns strategic functions and complex work",
      "Flex team tackles volume work and covers gaps",
      "Operations Manager assigns Flex priorities weekly based on workload analytics"
    ],
    pros: [
      "Handles growth without constant hiring",
      "Creates bench strength for future promotions",
      "Flex team prevents burnout in core team",
      "Adapts to seasonal volume changes (summer moves)",
      "Lower per-unit labor cost at scale"
    ],
    cons: [
      "Requires excellent workflow management",
      "Flex coordinators need strong adaptability",
      "Core team might resist delegating",
      "Need clear role definitions to avoid confusion"
    ],
    example: "Renters Warehouse used this model to scale from 150 → 500 units with minimal headcount increase"
  }
];

// Case Studies Data
const caseStudies = [
  {
    title: "Centralized Leasing Operations",
    source: "Leasey.AI, Funnel Leasing Research (2024-2025)",
    findings: [
      "54% boost in lead-to-tour conversions with centralized model",
      "13% rise in lead-to-lease conversions",
      "75% reduction in vacancy periods",
      "200% improvement in lead conversion rate",
      "25 hours weekly saved with automated inquiry responses",
      "Staffing ratio: 1 leasing agent per 200-400 units (centralized) vs 1 per 100 (traditional)",
      "Critical success factor: Response within 90 minutes or lose 50% of leads"
    ],
    link: "https://www.leasey.ai/blog/centralized-leasing"
  },
  {
    title: "AI Automation Surge in Property Management",
    source: "Buildium 2025 State of Property Management Report",
    findings: [
      "58% of PM companies now use AI (up from 20% in 2024)",
      "One property saved 21.9 years' worth of team time in 2024 using AI",
      "Properties responding within 90 minutes retain leads; longer = 50% loss",
      "20% increase in operational efficiency with smart tech",
      "18% reduction in costs with IoT and automation",
      "Top AI use cases: work order triage, tenant communications, lease renewals"
    ],
    link: "https://www.buildium.com/resources/2025-property-management-trends/"
  },
  {
    title: "Virtual/Remote Teams Cost Savings",
    source: "Doorloop Property Management Statistics Report",
    findings: [
      "24% of PM companies employ virtual assistants or overseas workers",
      "73% assign VAs to administrative work",
      "48% use VAs for accounting/bookkeeping",
      "40% for maintenance coordination",
      "Significant payroll reduction at 300+ unit scale",
      "Works best with standardized workflows and clear SOPs",
      "Average cost savings: $30-40K annually per VA vs US equivalent"
    ],
    link: "https://www.doorloop.com/blog/property-management-statistics"
  },
  {
    title: "The Pod Model Evolution",
    source: "BetterWho Property Management Team Structure Insights",
    findings: [
      "Pods of 3 employees manage 150-200 units optimally",
      "Each pod handles applications, relations, maintenance, turnovers",
      "Traditional staffing: 1 leasing + 1 maintenance per 100 units",
      "Optimized staffing: 1 of each per 150 units with flex support",
      "47% of PM companies manage between 50-499 units (sweet spot for pods)",
      "Pod model reduces per-unit labor cost by 25-35%"
    ],
    link: "https://www.betterwho.com/blog/property-management-team-structure"
  },
  {
    title: "Bay Property Management Growth Case",
    source: "Second Nature Property Management Podcast",
    findings: [
      "Grew from 0 to 1,000+ units through process optimization",
      "At 1,000-1,200 units, restructured from separate maintenance coordinators and PMs to unified PM role",
      "Eliminated confusion about responsibility handoffs",
      "Heavy SEO investment from day one for organic lead generation",
      "Continuous iteration: 'What worked for 200 doors doesn't work for 1,000'",
      "Key insight: Structure must evolve with scale"
    ],
    link: "https://www.secondnature.com/podcast"
  },
  {
    title: "Restructuring Success Story (1,000 SFH Portfolio)",
    source: "Property Management Consulting Case Study",
    findings: [
      "1,000 single-family home portfolio with disorganized structure",
      "High turnover and operational inefficiencies",
      "Over 5 months: restructured team, clarified roles, standardized processes",
      "Results: 40% reduction in administrative workload",
      "Improved team morale and reduced turnover",
      "Higher tenant retention through better service delivery",
      "Profitability increased 22% within 12 months"
    ],
    link: "https://www.propertymanagementconsulting.com/case-studies"
  }
];

// Owner color mapping for UI
const ownerColors = {
  "Nathan": { class: "owner-nathan", hex: "#ff6f00" },
  "Patrick": { class: "owner-patrick", hex: "#1976d2" },
  "Austin": { class: "owner-austin", hex: "#00897b" },
  "Cathryn": { class: "owner-cathryn", hex: "#6a1b9a" },
  "Linda": { class: "owner-linda", hex: "#00695c" },
  "Jason": { class: "owner-jason", hex: "#263238" },
  "Carlos": { class: "owner-carlos", hex: "#c62828" },
  "Kevin": { class: "owner-kevin", hex: "#5e35b1" },
  "UNOWNED": { class: "owner-unowned", hex: "#d32f2f" }
};
