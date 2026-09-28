import { steps, dependencies, sources, type CivicStep } from "./demo-data";
import type { Dependency } from "./graph";

export type Profile = Record<string, string>;
export type IntakeQuestion = { id: string; label: string; options: readonly (readonly [string, string])[] };
export type Procedure = {
  id: string; title: string; jurisdiction: string; description: string;
  sourceId: string; questions: IntakeQuestion[];
  build: (profile: Profile) => { items: CivicStep[]; edges: readonly Dependency[] };
};
export const procedureSources = [...sources,
  { id: "birth", title: "BMC birth certificate application guidance", authority: "Brihanmumbai Municipal Corporation", url: "https://portal.mcgm.gov.in/irj/servlet/prt/portal/prtroot/com.mcgm.acitizenservices_healthservices.HowToApplyForBirthCertificate", checked: "Official source checked · 28 Sep 2026", status: "Official portal" },
  { id: "sarathi-info", title: "Official driving-licence renewal requirements", authority: "Ministry of Road Transport and Highways", url: "https://mparivahan.parivahan.gov.in/mstatic/english/dl-info-renewal-dl.html", checked: "Official source checked · 28 Sep 2026", status: "Official guidance" },
  { id: "sarathi", title: "Sarathi driving licence services", authority: "Ministry of Road Transport and Highways", url: "https://sarathi.parivahan.gov.in/", checked: "Official portal reference", status: "Official portal" },
  { id: "igr", title: "Maharashtra Property Registration Public Data Entry", authority: "Department of Registration and Stamps, Maharashtra", url: "https://pdeigr.maharashtra.gov.in/frmLogin", checked: "Official service checked · 28 Sep 2026", status: "Official portal" },
  { id: "society", title: "Maharashtra co-operative society registration process", authority: "Commissioner for Co-operation and Registrar of Co-operative Societies", url: "https://sahakarayukta.maharashtra.gov.in/1128/Process", checked: "Official source checked · 28 Sep 2026", status: "Official guidance" },
];

type StepInput = readonly [id: string, title: string, description: string, documents: string[], mode?: CivicStep["mode"], optional?: boolean, sourceOverride?: string];
function plan(sourceId: string, input: StepInput[], edges: readonly Dependency[]) {
  const authority = procedureSources.find((source) => source.id === sourceId)!.authority;
  // Layout follows dependency levels; independent actions appear alongside one another.
  const levels = new Map<string, number>();
  const columns = new Map<number, number>();
  const items = input.map(([id, title, description, documents, mode = "Online", optional = false, sourceOverride]) => {
    const parents = edges.filter(([, to]) => to === id).map(([from]) => from);
    const level = parents.length ? Math.max(...parents.map((parent) => levels.get(parent) ?? 0)) + 1 : 0;
    const column = columns.get(level) ?? 0;
    levels.set(id, level); columns.set(level, column + 1);
    return { id, title, description, documents, mode, agency: authority, sourceId: sourceOverride ?? sourceId,
      status: optional ? "optional" : "ready", verification: "Official source", duration: "Check official source",
      x: column * 230, y: level * 180 } satisfies CivicStep;
  });
  return { items, edges };
}

export const procedures: Procedure[] = [
  { id: "home-food-business", title: "Start a home food business", jurisdiction: "Mumbai, Maharashtra", sourceId: "fssai",
    description: "The team's food-business sample, with premises, FSSAI, optional Udyam and GST planning branches.",
    questions: [], build: () => ({ items: steps.map((step) => ({ ...step })), edges: dependencies }) },
  { id: "birth-certificate", title: "Get a birth certificate", jurisdiction: "Mumbai, Maharashtra", sourceId: "birth",
    description: "Request a copy of a Mumbai birth record, with a ward-office route when the record is unavailable. New or delayed registration needs separate authority guidance.",
    questions: [
      { id: "record", label: "Is the birth already registered with BMC?", options: [["available", "Yes, record details are available"], ["unknown", "Unsure or cannot find the record"]] },
      { id: "channel", label: "How would you prefer to apply?", options: [["online", "Online, if the record is available"], ["ward", "At a ward Citizen Facilitation Centre"]] },
    ], build: (profile) => {
      const ward = profile.record === "unknown" || profile.channel === "ward";
      const route = ward ? "birth-ward" : "birth-search";
      return plan("birth", [
        ["birth-scope", "Confirm the Mumbai certificate route", "This sample requests a copy of an existing BMC birth record. Confirm that BMC holds the record before applying.", []],
        [route, ward ? "Ask the ward Citizen Facilitation Centre to locate the record" : "Locate the registered birth record", ward ? "BMC directs applicants who cannot locate a record to the nearest ward. Ask the CFC to find the existing record and confirm the correct application route." : "Search using the registration number or the BMC-supported details such as date, ward, parents' names or hospital name, then select the correct record.", ["Birth record details"], ward ? "Physical" : "Online"],
        ["birth-details", "Prepare the certificate request details", "Confirm the selected record, number of copies, delivery or ward-collection choice, and only the supporting details requested by BMC.", ["Birth record details", "Application details", "Portal-requested supporting documents"]],
        ["birth-apply", "Preview, submit and pay through BMC", "Preview the application, correct any errors, submit it through the citizen portal or CFC, and pay the fee shown by BMC. Do not treat this planning step as issuance.", ["Application details", "Portal-requested supporting documents"], ward ? "Physical" : "Online"],
        ["birth-receipt", "Keep the transaction number or CFC receipt", "Keep the online transaction number, printable application or CFC fee receipt and follow the authority's delivery instructions.", ["Application acknowledgement", "Payment receipt"]],
        ["birth-ready", "Collect or receive and verify the certificate", "Collect the certificate from the selected ward or receive the chosen delivery, then check the issued details promptly.", ["Issued birth certificate"], "Hybrid"],
      ], [["birth-scope", route], ["birth-scope", "birth-details"], [route, "birth-apply"], ["birth-details", "birth-apply"], ["birth-apply", "birth-receipt"], ["birth-receipt", "birth-ready"]]);
    } },
  { id: "small-business", title: "Register a small business", jurisdiction: "India · Udyam (MSME)", sourceId: "udyam",
    description: "Udyam registration planning for an eligible MSME. This is not company incorporation or a replacement for activity-specific licences.",
    questions: [
      { id: "registration", label: "Which Udyam route do you need?", options: [["new", "New MSME registration"], ["existing", "Review an existing Udyam registration"]] },
      { id: "activity", label: "What is the enterprise's primary activity?", options: [["service", "Services"], ["manufacturing", "Manufacturing"], ["both", "Both"]] },
    ], build: (profile) => {
      const existing = profile.registration === "existing";
      return plan("udyam", [
        ["business-scope", "Confirm MSME classification and registration scope", "Review the current investment-and-turnover classification on the Udyam portal. Udyam is an MSME registration; it does not incorporate an entity or replace activity-specific permissions.", []],
        ["business-identity", "Identify the authorised Aadhaar holder", "Use the portal's organisation-type rules to identify whose Aadhaar is required. Companies, LLPs, co-operative societies, societies and trusts use the organisation or authorised signatory route with PAN and GSTIN as applicable.", ["Authorised applicant details"]],
        ["business-details", `Prepare ${profile.activity === "manufacturing" ? "manufacturing" : profile.activity === "both" ? "manufacturing and service" : "service"} enterprise details`, "Prepare enterprise and activity information. The official registration is paperless; this checklist tracks information readiness, not mandatory document uploads.", ["Enterprise details", "Activity details"]],
        ["business-tax", "Review PAN and GST applicability", "Review the official PAN and GSTIN applicability instructions for the enterprise. No tax threshold is inferred by this demo.", ["Enterprise details", "Tax details as applicable"]],
        ["business-submit", existing ? "Review or update the existing registration" : "Submit the free self-declaration on Udyam", existing ? "Use the official print, verify or update route and do not create a duplicate registration." : "Complete the official paperless form, include all manufacturing and service activities in the one permitted registration, review the declaration and submit without paying an intermediary.", ["Authorised applicant details", "Enterprise details"]],
        ["business-ready", "Download and verify the Udyam certificate", "Keep the permanent registration number and online certificate. The official certificate carries a dynamic QR code and the registration does not require renewal.", ["Udyam certificate"]],
        ["business-other", "Review other activity-specific permissions", "Optionally review separate local or sector-specific requirements with the relevant authority.", [], "Hybrid", true],
      ], [["business-scope", "business-identity"], ["business-scope", "business-details"], ["business-details", "business-tax"], ["business-identity", "business-submit"], ["business-tax", "business-submit"], ["business-submit", "business-ready"], ["business-scope", "business-other"]]);
    } },
  { id: "driving-licence-renewal", title: "Renew a driving licence", jurisdiction: "Maharashtra", sourceId: "sarathi-info",
    description: "A Maharashtra Sarathi renewal flow based on MoRTH guidance. The official service determines eligibility, state requirements, fees and any RTO visit.",
    questions: [
      { id: "category", label: "Which licence category are you renewing?", options: [["private", "Non-transport / private vehicle"], ["transport", "Transport vehicle"]] },
      { id: "expiry", label: "What is your licence status?", options: [["current", "Current or recently expired"], ["older", "Expired for more than one year / unsure"]] },
      { id: "age", label: "Which age group applies to the licence holder?", options: [["under40", "Under 40"], ["40plus", "40 or older"]] },
    ], build: (profile) => {
      const medical = profile.category === "transport" || profile.age === "40plus";
      return plan("sarathi-info", [
        ["licence-scope", "Confirm the renewal window and Maharashtra service", "Official guidance accepts renewal applications up to one year before expiry. Open Sarathi, select Maharashtra, and choose driving-licence renewal.", ["Existing driving licence"]],
        ["licence-eligibility", profile.expiry === "older" ? "Resolve the retest route for a licence expired over one year" : "Confirm the licence can use the standard renewal route", profile.expiry === "older" ? "MoRTH guidance says an applicant more than one year late must undergo a retest for the relevant vehicle categories. Confirm the route with Sarathi or the RTO." : "Confirm the licence particulars and the portal's state-specific eligibility instructions before continuing.", ["Existing driving licence"], "Hybrid"],
        ["licence-docs", "Prepare the official renewal application", "Prepare the existing driving licence, the renewal application requested by the service, and the state-specific supporting information displayed by Sarathi.", ["Existing driving licence", "Renewal application", "Portal-requested supporting information"]],
        ["licence-fitness", medical ? "Obtain Form 1A medical certification" : "Complete the applicable fitness declaration", medical ? "Official guidance requires Form 1A from a certified medical practitioner for transport vehicles and applicants aged above 40. Confirm the current form on Sarathi." : "Official guidance lists the Form 1 self-declaration for non-transport vehicles. Confirm what Sarathi requests for this application.", [medical ? "Form 1A medical certificate" : "Form 1 fitness declaration"], "Hybrid"],
        ["licence-apply", "Submit the renewal application and prescribed fee", "Complete the Maharashtra renewal service on Sarathi, review the application and prescribed charges, pay through the official flow, and retain the application number.", ["Existing driving licence", "Renewal application", "Portal-requested supporting information"], "Online", false, "sarathi"],
        ["licence-visit", "Follow the appointment or RTO instructions", "Use the application status and appointment instructions shown by Sarathi. Attend the RTO only when the official flow requires it.", ["Application acknowledgement"], "Hybrid", false, "sarathi"],
        ["licence-ready", "Track and verify the renewed licence", "Track the application through Sarathi and check the particulars on the renewed licence when issued.", ["Renewed driving licence"], "Online", false, "sarathi"],
      ], [["licence-scope", "licence-eligibility"], ["licence-scope", "licence-docs"], ["licence-eligibility", "licence-fitness"], ["licence-docs", "licence-apply"], ["licence-fitness", "licence-apply"], ["licence-apply", "licence-visit"], ["licence-visit", "licence-ready"]]);
    } },
  { id: "property-registration", title: "Register property", jurisdiction: "Maharashtra", sourceId: "igr",
    description: "Register a sale or gift document through Maharashtra's Public Data Entry and Sub-Registrar process. This workflow does not establish title or complete a separate mutation.",
    questions: [
      { id: "instrument", label: "Which transaction are you planning?", options: [["sale", "Sale / purchase"], ["gift", "Gift"]] },
      { id: "draft", label: "Has the transaction document been prepared?", options: [["no", "Not yet"], ["yes", "Yes, ready for review"]] },
    ], build: (profile) => plan("igr", [
      ["property-scope", `Confirm the ${profile.instrument === "gift" ? "gift" : "sale"} instrument and Sub-Registrar office`, "Confirm the document type, property jurisdiction and appropriate Sub-Registrar office. Registration is distinct from title due diligence and post-registration mutation.", ["Property particulars"], "Hybrid"],
      ["property-draft", profile.draft === "yes" ? "Review the prepared transaction document" : "Prepare and review the transaction document", "Have the instrument, execution details and property particulars reviewed before entering them in the official system.", ["Transaction document", "Property particulars"], "Hybrid"],
      ["property-value", "Confirm valuation, stamp duty and registration fee", "Use the current Maharashtra IGR valuation and payment facilities for the chosen instrument. Confirm concessions and charges in the official service; CivicFlow does not calculate them.", ["Property particulars"], "Online"],
      ["property-parties", "Prepare party, witness and identification details", "Prepare the parties, witnesses, identification and authorisation details required by the Public Data Entry flow and registering office.", ["Party details", "Witness details", "Identification details"]],
      ["property-pde", "Complete Maharashtra Public Data Entry", "Enter general information, property, party, witness and identification details in the official PDE system, then review the pre-registration summary.", ["Transaction document", "Property particulars", "Party details", "Witness details"], "Online"],
      ["property-appointment", "Complete payment and book the registration appointment", "Follow the official PDE instructions for stamp duty, registration fee, data submission and the appointment at the applicable Sub-Registrar office.", ["Payment acknowledgement", "PDE submission acknowledgement"], "Hybrid"],
      ["property-submit", "Present the document for registration", "Attend the registering office with the document and people or authorisations requested by the official flow. Complete verification and retain the registration receipt.", ["Transaction document", "Party details", "Witness details", "Payment acknowledgement"], "Physical"],
      ["property-ready", "Obtain and verify the registered document", "Use the official receipt and service instructions to obtain the registered document, then check its particulars. Handle mutation or other post-registration work separately if applicable.", ["Registered document", "Registration receipt"]],
    ], [["property-scope", "property-draft"], ["property-scope", "property-value"], ["property-scope", "property-parties"], ["property-draft", "property-pde"], ["property-parties", "property-pde"], ["property-value", "property-appointment"], ["property-pde", "property-appointment"], ["property-appointment", "property-submit"], ["property-submit", "property-ready"]]) },
  { id: "society-registration", title: "Register a society", jurisdiction: "Maharashtra · Co-operative society", sourceId: "society",
    description: "Form a Maharashtra co-operative society through the competent Registrar. Charitable societies, trusts and existing-society enrollment use different routes.",
    questions: [
      { id: "category", label: "Which co-operative society are you planning?", options: [["housing", "Housing co-operative"], ["other", "Other co-operative"]] },
      { id: "proposal", label: "Is the formation proposal prepared?", options: [["no", "Not yet"], ["yes", "Yes, ready for review"]] },
    ], build: (profile) => plan("society", [
      ["society-scope", `Confirm the ${profile.category === "housing" ? "housing" : "co-operative"} category and competent Registrar`, "Confirm the society category, area of operation and responsible Taluka, District or Divisional Registrar. This is new society formation, not enrollment of an existing society.", ["Proposed society details"], "Hybrid"],
      ["society-promoters", "Confirm promoter and membership requirements", "Confirm the current category-specific promoter, member and chief-promoter requirements with the competent Registrar.", ["Promoter and member details", "Chief Promoter details"], "Hybrid"],
      ["society-name", "Apply for name reservation and account-opening permission", "The official process starts with the Promoters or Chief Promoter applying to the competent Registrar for name reservation and account opening using the prescribed route.", ["Name reservation application", "Proposed society details"], "Hybrid"],
      ["society-bank", "Open the permitted bank account and obtain the balance certificate", "After permission, the Chief Promoter opens an account in a permitted bank or District Central Co-operative Bank and obtains the balance certificate required for the society type.", ["Account-opening permission", "Bank balance certificate"], "Physical"],
      ["society-proposal", profile.proposal === "yes" ? "Review Form A, the proposal and proposed bye-laws" : "Prepare Form A, the proposal and proposed bye-laws", "Prepare registration Form A, proposed bye-laws and the category-specific documents identified by the Registrar's official process.", ["Form A", "Formation proposal", "Proposed bye-laws", "Registrar-requested supporting documents"], "Hybrid"],
      ["society-submit", "Submit Form A and supporting documents to the Registrar", "Submit the complete registration proposal to the competent Registrar. The official process records the application in Register B; keep the acknowledgement.", ["Form A", "Formation proposal", "Proposed bye-laws", "Promoter and member details", "Bank balance certificate"], "Physical"],
      ["society-review", "Respond to verification, objections or deficiencies", "The Registrar verifies the application and supporting documents and may request missing or corrected material. Respond within the period specified by the authority.", ["Application acknowledgement", "Registrar correspondence"], "Hybrid"],
      ["society-ready", "Obtain the registration certificate and approved bye-laws", "If approved, the Registrar issues the registration notification and certificate and registers the approved bye-laws. Check and retain all official records.", ["Registration certificate", "Approved bye-laws"]],
    ], [["society-scope", "society-promoters"], ["society-scope", "society-name"], ["society-name", "society-bank"], ["society-promoters", "society-proposal"], ["society-bank", "society-proposal"], ["society-proposal", "society-submit"], ["society-submit", "society-review"], ["society-review", "society-ready"]]) },
];

export function getProcedure(id: string) { return procedures.find((procedure) => procedure.id === id); }
export function defaultProfile(procedure: Procedure): Profile {
  return Object.fromEntries(procedure.questions.map((question) => [question.id, question.options[0][0]]));
}
export function resolveProcedure(query: string): Procedure | undefined {
  const exact = getProcedure(query); if (exact) return exact;
  if (/\b(delhi|pune|bangalore|bengaluru|chennai|hyderabad|kolkata|thane|navi mumbai)\b/i.test(query)) return undefined;
  if (/food|kitchen|tiffin|catering|खाद्य|जेवण|भोजन/i.test(query)) return getProcedure("home-food-business");
  if (/birth|जन्म/i.test(query)) return getProcedure("birth-certificate");
  if (/driving|driver|licen[cs]e renewal|renew.*licen[cs]e/i.test(query)) return getProcedure("driving-licence-renewal");
  if (/property|sale deed/i.test(query)) return getProcedure("property-registration");
  if (/society|co-operative|cooperative/i.test(query)) return getProcedure("society-registration");
  if (/small business|msme|udyam/i.test(query)) return getProcedure("small-business");
  return undefined;
}
