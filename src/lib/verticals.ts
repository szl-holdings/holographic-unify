export type Occupancy = "MEASURED" | "HOLOGRAM" | "ROADMAP" | "UNAVAILABLE";

export type VerticalDesk = {
  id: string;
  name: string;
  product: string;
  space: string;
  github: string;
  leader: string;
  job: string;
  ours: string;
  status: "HOLOGRAM" | "ROADMAP";
  occupancy: Occupancy;
  data: { label: string; state: Occupancy; note: string }[];
  take: string[];
  refuse: string[];
  next: string;
  organs: string[];
};

export const VERTICALS: VerticalDesk[] = [
  {
    id: "killinchu",
    name: "Killinchu",
    product: "Counter-UAS",
    space: "killinchu",
    github: "szl-holdings/killinchu",
    leader: "Anduril, Palantir",
    job: "Detect, classify, interdict. Every shot is an artifact.",
    ours: "Flagship vertical. DSSE per interdiction. Eye card is ROADMAP. No live fire claimed.",
    status: "HOLOGRAM",
    occupancy: "UNAVAILABLE",
    data: [
      { label: "Field occupancy", state: "UNAVAILABLE", note: "No measured site this week." },
      { label: "Perception card", state: "ROADMAP", note: "KILLINCHU-EYE is CARD_ONLY." },
      { label: "Interdiction receipt", state: "HOLOGRAM", note: "Schema lives. Envelope unsigned until a shot." },
    ],
    take: ["Cue-to-receipt loop", "Deny-by-default before a kinetic claim", "Public COP hologram"],
    refuse: ["YOLO / SAM weight dump", "Live-fire LIVE without a site", "Invented range or Pk"],
    next: "One MEASURED occupancy receipt from a named range. Until then the desk stays a hologram.",
    organs: ["VERTICAL", "YACHAY", "YAWAR"],
  },
  {
    id: "sda",
    name: "SDA",
    product: "Sovereign domain awareness",
    space: "sda",
    github: "szl-holdings/sda",
    leader: "Palantir Gotham COP",
    job: "Common operating picture for an estate, not a war room we do not occupy.",
    ours: "Hologram COP. Tracks are synthetic until a feed is receipted.",
    status: "HOLOGRAM",
    occupancy: "UNAVAILABLE",
    data: [
      { label: "Live tracks", state: "UNAVAILABLE", note: "No fused feed bound." },
      { label: "COP HUD", state: "HOLOGRAM", note: "Layout and doctrine only." },
      { label: "Classified ingest", state: "UNAVAILABLE", note: "We do not claim a SCIF." },
    ],
    take: ["COP job", "Track-to-receipt schema", "Fail-closed when a feed dies"],
    refuse: ["Gotham clone", "Fake AIS / ADS-B LIVE", "Painted green empty map"],
    next: "Bind one public AIS or ADS-B source and stamp UNAVAILABLE when it drops.",
    organs: ["VERTICAL", "NERVOUS", "YAWAR"],
  },
  {
    id: "david-leads",
    name: "David Leads",
    product: "Insurance intelligence",
    space: "david-leads",
    github: "szl-holdings/david-leads",
    leader: "Verisk, LexisNexis Risk",
    job: "Public-data underwriting signals. Not a carrier. Not a credit bureau.",
    ours: "Leads from public records. No FCRA dump. No invented loss ratio.",
    status: "HOLOGRAM",
    occupancy: "UNAVAILABLE",
    data: [
      { label: "Public records bind", state: "HOLOGRAM", note: "Pipeline described. Batch not MEASURED here." },
      { label: "Loss model", state: "ROADMAP", note: "Advisory PAC-Bayes only." },
      { label: "Carrier write-back", state: "UNAVAILABLE", note: "No appointed carrier." },
    ],
    take: ["Public-data feature job", "Receipt per lead bundle", "Human lock on outreach"],
    refuse: ["FCRA / credit dump", "Secret score sold as fact", "Calling it a licensed agency"],
    next: "One county public-record batch with a SHA on the extract.",
    organs: ["VERTICAL", "YUYAY", "KHIPU"],
  },
  {
    id: "szl-quant",
    name: "SZL Quant",
    product: "Paper ledger",
    space: "szl-quant-live",
    github: "szl-holdings/szl-quant",
    leader: "Bloomberg, Two Sigma, Chronos-class forecast",
    job: "Forecast as a notebook, not a fund.",
    ours: "Paper-only. Not advice. Not a live book.",
    status: "HOLOGRAM",
    occupancy: "UNAVAILABLE",
    data: [
      { label: "Live book", state: "UNAVAILABLE", note: "No brokerage bind." },
      { label: "Paper ledger", state: "HOLOGRAM", note: "Formulas and refuse list." },
      { label: "Chronos twin", state: "HOLOGRAM", note: "Take the forecast job, not the weights." },
    ],
    take: ["Forecast job", "Honest UNAVAILABLE PnL", "Research receipt"],
    refuse: ["Live trading claim", "Copied alpha dump", "Financial advice"],
    next: "Keep the paper desk. A live book needs a named account and a measured fill.",
    organs: ["VERTICAL", "KHIPU"],
  },
  {
    id: "szl-real-estate",
    name: "SZL Real Estate",
    product: "Public-records underwriting",
    space: "szl-real-estate",
    github: "szl-holdings/szl-real-estate",
    leader: "Zillow, CoStar, First American",
    job: "Title and tax rolls. Not listings. Not an MLS.",
    ours: "PLUTO cited for Kings/Queens as a public source. Occupancy of a building stays UNAVAILABLE until walked.",
    status: "HOLOGRAM",
    occupancy: "UNAVAILABLE",
    data: [
      { label: "PLUTO Kings/Queens", state: "MEASURED", note: "Public roll cited. Not a Zestimate." },
      { label: "Building occupancy", state: "UNAVAILABLE", note: "No walk / sensor this week." },
      { label: "MLS comps", state: "UNAVAILABLE", note: "We are not a member." },
    ],
    take: ["Public-records job", "Underwriting memo hologram", "Refuse Zillow twin"],
    refuse: ["MLS scrape", "Invented occupancy %", "Calling it a brokerage"],
    next: "One parcel memo with the PLUTO hash and occupancy still stamped UNAVAILABLE.",
    organs: ["VERTICAL", "YUYAY", "YAWAR"],
  },
  {
    id: "szl-sovereign-os",
    name: "Sovereign OS",
    product: "Fail-closed operator kernel",
    space: "szl-sovereign-os",
    github: "szl-holdings/szl-sovereign-os",
    leader: "Kubernetes, Ubuntu, Palantir Gotham",
    job: "The desk the operator lives in. Five organs, five product verticals.",
    ours: "Take the operator-kernel job. Never ship their distro. Hub is a hologram.",
    status: "HOLOGRAM",
    occupancy: "UNAVAILABLE",
    data: [
      { label: "Operator session", state: "HOLOGRAM", note: "This command center is the preview seat." },
      { label: "Cluster bind", state: "UNAVAILABLE", note: "No measured k8s this week." },
      { label: "Five-vertical bus", state: "HOLOGRAM", note: "Doctrine wired. Live occupancy per desk above." },
    ],
    take: ["Fail-closed shell", "Organ bus", "Honest UNAVAILABLE when a vertical is empty"],
    refuse: ["Ubuntu/K8s dump", "Second flagship claim", "Green empty cluster"],
    next: "Keep this Unify seat as the hologram. Cluster LIVE needs a named control plane.",
    organs: ["VERTICAL", "YACHAY", "NERVOUS"],
  },
];

export function occupancyTone(state: Occupancy) {
  if (state === "MEASURED") return "text-accent";
  if (state === "HOLOGRAM") return "text-fg";
  if (state === "ROADMAP") return "text-warn";
  return "text-danger";
}
