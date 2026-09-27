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
  { id: "birth", title: "BMC birth certificate guidance", authority: "Brihanmumbai Municipal Corporation", url: "https://portal.mcgm.gov.in/irj/servlet/prt/portal/prtroot/com.mcgm.acitizenservices_healthservices.HowToApplyForBirthCertificate", checked: "Reference checked · 27 Sep 2026", status: "Official portal" },
  { id: "sarathi", title: "Sarathi driving licence services", authority: "Ministry of Road Transport and Highways", url: "https://sarathi.parivahan.gov.in/", checked: "Official portal reference", status: "Official portal" },
  { id: "igr", title: "Maharashtra registration citizen charter", authority: "Department of Registration and Stamps, Maharashtra", url: "https://grievanceigr.maharashtra.gov.in/pdf/Citizen_Charter_English.pdf", checked: "Reference checked · 27 Sep 2026 · historical charter", status: "Official portal" },
  { id: "society", title: "Maharashtra co-operative society services", authority: "Commissioner for Co-operation and Registrar of Co-operative Societies", url: "https://sahakarayukta.maharashtra.gov.in/SITE/Information/Process.aspx", checked: "Reference checked · 27 Sep 2026", status: "Official portal" },
];

type StepInput = readonly [id: string, title: string, description: string, documents: string[], mode?: CivicStep["mode"], optional?: boolean];
function plan(sourceId: string, input: StepInput[], edges: readonly Dependency[]) {
  const authority = procedureSources.find((source) => source.id === sourceId)!.authority;
  // Layout follows dependency levels; independent actions appear alongside one another.
  const levels = new Map<string, number>();
  const columns = new Map<number, number>();
  const items = input.map(([id, title, description, documents, mode = "Online", optional = false]) => {
    const parents = edges.filter(([, to]) => to === id).map(([from]) => from);
    const level = parents.length ? Math.max(...parents.map((parent) => levels.get(parent) ?? 0)) + 1 : 0;
    const column = columns.get(level) ?? 0;
    levels.set(id, level); columns.set(level, column + 1);
    return { id, title, description, documents, mode, agency: authority, sourceId,
      status: optional ? "optional" : "ready", verification: "Not verified", duration: "Check portal",
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
        [route, ward ? "Contact the ward office about the record" : "Locate the registered birth record", ward ? "Ask the ward CFC to locate the record and confirm the application route. A missing record is not treated as a completed registration." : "Use the BMC portal to locate the record using the available registration or birth details.", ["Birth record details"], ward ? "Physical" : "Online"],
        ["birth-details", "Prepare the request details", "Check the registered details and requested number of copies. Use only the details requested by the official form.", ["Birth record details", "Application details"]],
        ["birth-apply", "Review and submit the certificate request", "Review the record and application details on the official portal or with the CFC. Confirm the current fee and collection options there.", ["Application details"], ward ? "Physical" : "Online"],
        ["birth-receipt", "Keep the acknowledgement", "Keep the official receipt or acknowledgement and follow the authority's status instructions.", ["Application acknowledgement"]],
        ["birth-ready", "Collect and check the certificate", "Collect the issued certificate through the agreed channel and check its details. Completion here is your own checklist update.", ["Issued certificate"], "Hybrid"],
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
        ["business-scope", "Confirm the MSME registration scope", "Review the current MSME classification on the Udyam portal. Udyam does not establish a company or grant every operating permission.", []],
        ["business-identity", "Check the authorised identity route", "Check whose Aadhaar and authorisation apply to your organisation type on the official form. Do not enter identifiers into this demo.", ["Authorised applicant details"]],
        ["business-details", `Prepare ${profile.activity === "manufacturing" ? "manufacturing" : profile.activity === "both" ? "manufacturing and service" : "service"} enterprise details`, "Prepare enterprise and activity information. The official registration is paperless; this checklist tracks information readiness, not mandatory document uploads.", ["Enterprise details", "Activity details"]],
        ["business-tax", "Review PAN and GST applicability", "Review the official PAN and GSTIN applicability instructions for the enterprise. No tax threshold is inferred by this demo.", ["Enterprise details", "Tax details as applicable"]],
        ["business-submit", existing ? "Review or update the existing registration" : "Submit through the official Udyam portal", existing ? "Use the official print, verify or update route. Do not create a duplicate registration." : "Complete the official Udyam form and review the declaration before submission. Registration is free on the official portal.", ["Authorised applicant details", "Enterprise details"]],
        ["business-ready", "Keep and verify the Udyam certificate", "Use the portal's certificate verification facility and retain the registration details outside this demo.", ["Udyam certificate"]],
        ["business-other", "Review other activity-specific permissions", "Optionally review separate local or sector-specific requirements with the relevant authority.", [], "Hybrid", true],
      ], [["business-scope", "business-identity"], ["business-scope", "business-details"], ["business-details", "business-tax"], ["business-identity", "business-submit"], ["business-tax", "business-submit"], ["business-submit", "business-ready"], ["business-scope", "business-other"]]);
    } },
  { id: "driving-licence-renewal", title: "Renew a driving licence", jurisdiction: "Maharashtra", sourceId: "sarathi",
    description: "A Maharashtra Sarathi renewal planning flow. The portal determines eligibility, documents, medical requirements and appointments.",
    questions: [
      { id: "category", label: "Which licence category are you renewing?", options: [["private", "Non-transport / private vehicle"], ["transport", "Transport vehicle"]] },
      { id: "expiry", label: "What is your licence status?", options: [["current", "Current or recently expired"], ["older", "Expired for a long time / unsure"]] },
    ], build: (profile) => {
      const medical = profile.category === "transport";
      return plan("sarathi", [
        ["licence-scope", "Select Maharashtra and the renewal service", "Open Sarathi, select Maharashtra and confirm the service and licence particulars. This sample does not decide legal eligibility.", []],
        ["licence-eligibility", profile.expiry === "older" ? "Confirm the route for an older expired licence" : "Check the renewal eligibility window", "Check the portal's current expiry and eligibility instructions. If testing or a different application is required, resolve that with the RTO before continuing.", ["Existing driving licence"], "Hybrid"],
        ["licence-docs", "Prepare the portal's requested information", "Check the state-specific list for your category, age and licence status. Keep personal details and scans outside this demo.", ["Existing driving licence", "Portal-requested supporting information"]],
        ["licence-fitness", medical ? "Confirm the medical certificate requirement" : "Confirm fitness declaration or medical requirements", "Use the current Sarathi instructions to confirm the applicable fitness form and medical certificate. The portal decides what applies to your case.", ["Fitness information as applicable"], "Hybrid"],
        ["licence-apply", "Submit the renewal request and applicable fee", "Review the official application and payment summary, then submit on Sarathi. Keep the application number.", ["Existing driving licence", "Portal-requested supporting information"]],
        ["licence-visit", "Complete any required RTO appointment", "Follow the application status and appointment instructions. Mark this addressed if the official portal confirms no visit is needed.", ["Application acknowledgement"], "Hybrid"],
        ["licence-ready", "Track and check the renewed licence", "Track the application on Sarathi and check the issued licence details.", ["Renewed licence"]],
      ], [["licence-scope", "licence-eligibility"], ["licence-scope", "licence-docs"], ["licence-eligibility", "licence-fitness"], ["licence-docs", "licence-apply"], ["licence-fitness", "licence-apply"], ["licence-apply", "licence-visit"], ["licence-visit", "licence-ready"]]);
    } },
  { id: "property-registration", title: "Register property", jurisdiction: "Maharashtra", sourceId: "igr",
    description: "Plan registration of a property transaction document with Maharashtra IGR. The authority must confirm the instrument, valuation and requirements.",
    questions: [
      { id: "instrument", label: "Which transaction are you planning?", options: [["sale", "Sale / purchase"], ["gift", "Gift"]] },
      { id: "draft", label: "Has the transaction document been prepared?", options: [["no", "Not yet"], ["yes", "Yes, ready for review"]] },
    ], build: (profile) => plan("igr", [
      ["property-scope", `Confirm the ${profile.instrument === "gift" ? "gift" : "sale"} document route`, "Confirm the instrument and jurisdiction with the relevant Sub-Registrar. This sample is document registration planning, not a title guarantee or mutation service.", []],
      ["property-draft", profile.draft === "yes" ? "Review the prepared transaction document" : "Prepare and review the transaction document", "Have the transaction document and property particulars reviewed before submission. Confirm the current requirements with IGR.", ["Transaction document", "Property particulars"], "Hybrid"],
      ["property-value", "Confirm valuation, stamp duty and registration fee", "Use current IGR guidance to confirm valuation and charges for the instrument. This demo does not calculate charges or exemptions.", ["Property particulars"], "Hybrid"],
      ["property-parties", "Prepare party and witness information", "Confirm the identity, appearance and authorisation requirements with the registering office. This checklist stores readiness only.", ["Party details", "Witness details as requested"]],
      ["property-appointment", "Confirm payment and appointment instructions", "Follow the current IGR public data entry, payment and appointment route applicable to the document and office.", ["Transaction document", "Payment acknowledgement"], "Hybrid"],
      ["property-submit", "Present the document for registration", "Follow the office's presentation and verification instructions. Keep the acknowledgement and resolve any deficiencies with the authority.", ["Transaction document", "Party details", "Payment acknowledgement"], "Physical"],
      ["property-ready", "Collect and check the registered document", "Check the registered document and keep official receipts. Track any separate post-registration tasks outside this sample.", ["Registered document"]],
    ], [["property-scope", "property-draft"], ["property-scope", "property-value"], ["property-scope", "property-parties"], ["property-draft", "property-appointment"], ["property-value", "property-appointment"], ["property-appointment", "property-submit"], ["property-parties", "property-submit"], ["property-submit", "property-ready"]]) },
  { id: "society-registration", title: "Register a society", jurisdiction: "Maharashtra · Co-operative society", sourceId: "society",
    description: "A co-operative society formation planning sample. Charitable societies and trusts use different registration routes.",
    questions: [
      { id: "category", label: "Which co-operative society are you planning?", options: [["housing", "Housing co-operative"], ["other", "Other co-operative"]] },
      { id: "proposal", label: "Is the formation proposal prepared?", options: [["no", "Not yet"], ["yes", "Yes, ready for review"]] },
    ], build: (profile) => plan("society", [
      ["society-scope", `Confirm the ${profile.category === "housing" ? "housing" : "co-operative"} society route`, "Confirm the society category and competent registrar with the Co-operation Department. Online enrollment of an existing society is not new society formation.", []],
      ["society-promoters", "Confirm promoter and membership requirements", "Ask the competent registrar for the current category-specific promoter and membership requirements. No minimum member count is assumed by the sample.", ["Promoter and member details"], "Hybrid"],
      ["society-proposal", profile.proposal === "yes" ? "Review the formation proposal and bye-laws" : "Prepare the formation proposal and bye-laws", "Prepare the proposed society information and bye-laws using the authority's current requirements for the selected category.", ["Formation proposal", "Proposed bye-laws"]],
      ["society-office", "Confirm name, address and supporting requirements", "Confirm any name approval, address, banking and supporting information requirements with the registrar.", ["Proposed society details", "Supporting information as requested"], "Hybrid"],
      ["society-submit", "Submit the registration proposal", "Submit the reviewed proposal through the route specified by the registrar and keep the official acknowledgement. Confirm charges at submission.", ["Formation proposal", "Proposed bye-laws", "Promoter and member details"], "Hybrid"],
      ["society-review", "Respond to registrar queries", "Track the application and respond to any official deficiencies or requests. Completion is not automatic approval.", ["Application acknowledgement"], "Hybrid"],
      ["society-ready", "Keep the registration certificate", "After approval, check the certificate and approved bye-laws and retain the official records.", ["Registration certificate", "Approved bye-laws"]],
    ], [["society-scope", "society-promoters"], ["society-scope", "society-proposal"], ["society-scope", "society-office"], ["society-promoters", "society-submit"], ["society-proposal", "society-submit"], ["society-office", "society-submit"], ["society-submit", "society-review"], ["society-review", "society-ready"]]) },
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
