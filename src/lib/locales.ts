export const uiCopy = {
  en: {
    progress: "Progress", next: "Next best action", documents: "Document checklist", graph: "Graph", list: "Accessible list",
    title: "Start a home food business", details: "Step details", complete: "Mark step complete", reopen: "Reopen step",
    source: "Open official portal", why: "Why this step?", close: "Close step details", ready: "Ready", blocked: "Blocked", optional: "Optional", done: "Complete",
    open: "Open step", timing: "Timing", mode: "Mode", allDone: "Required steps complete", prerequisites: "Prerequisites", demo: "Sample roadmap",
    saved: "Demo progress stays in this browser. No documents are uploaded.", warning: "Sample planning data, not official approval. Requirements, fees and timelines have not been verified from source snapshots. Confirm each step with the official authority.",
    noNext: "All required planning steps are complete. Keep your approvals and confirm any outstanding official requirements.",
    documentHint: "Mark sample documents as prepared. This checklist does not verify or upload files.",
  },
  hi: {
    progress: "प्रगति", next: "अगला काम", documents: "दस्तावेज़ सूची", graph: "ग्राफ़", list: "चरणों की सूची",
    title: "घर से खाद्य व्यवसाय शुरू करें", details: "चरण का विवरण", complete: "चरण पूरा करें", reopen: "चरण फिर खोलें",
    source: "आधिकारिक पोर्टल खोलें", why: "यह चरण क्यों?", close: "विवरण बंद करें", ready: "तैयार", blocked: "रुका हुआ", optional: "वैकल्पिक", done: "पूरा",
    open: "चरण खोलें", timing: "समय", mode: "माध्यम", allDone: "ज़रूरी चरण पूरे", prerequisites: "पूर्वापेक्षाएँ", demo: "नमूना रोडमैप",
    saved: "डेमो की प्रगति इस ब्राउज़र में रहती है। दस्तावेज़ अपलोड नहीं होते।", warning: "यह नमूना योजना है, आधिकारिक मंज़ूरी नहीं। नियम, शुल्क और समय स्रोत दस्तावेज़ों से सत्यापित नहीं हैं। हर चरण संबंधित प्राधिकरण से जाँचें।",
    noNext: "ज़रूरी योजना के चरण पूरे हैं। मंज़ूरी सुरक्षित रखें और शेष आधिकारिक शर्तों की जाँच करें।", documentHint: "तैयार दस्तावेज़ों पर निशान लगाएँ। यह सूची फ़ाइलें अपलोड या सत्यापित नहीं करती।",
  },
  mr: {
    progress: "प्रगती", next: "पुढील काम", documents: "कागदपत्रांची यादी", graph: "आलेख", list: "टप्प्यांची यादी",
    title: "घरगुती खाद्य व्यवसाय सुरू करा", details: "टप्प्याचा तपशील", complete: "टप्पा पूर्ण करा", reopen: "टप्पा पुन्हा उघडा",
    source: "अधिकृत पोर्टल उघडा", why: "हा टप्पा का?", close: "तपशील बंद करा", ready: "तयार", blocked: "अडकलेला", optional: "ऐच्छिक", done: "पूर्ण",
    open: "टप्पा उघडा", timing: "वेळ", mode: "पद्धत", allDone: "आवश्यक टप्पे पूर्ण", prerequisites: "पूर्वअटी", demo: "नमुना मार्गक्रम",
    saved: "डेमोची प्रगती या ब्राउझरमध्ये राहते. कागदपत्रे अपलोड होत नाहीत.", warning: "हा नमुना आराखडा आहे, अधिकृत मंजुरी नाही. अटी, शुल्क आणि वेळ स्रोत कागदपत्रांवरून पडताळलेले नाहीत. प्रत्येक टप्पा संबंधित प्राधिकरणाकडे तपासा.",
    noNext: "आवश्यक नियोजनाचे टप्पे पूर्ण झाले. मंजुरी सुरक्षित ठेवा आणि उर्वरित अधिकृत अटी तपासा.", documentHint: "तयार कागदपत्रांवर खूण करा. ही यादी फाइल्स अपलोड किंवा पडताळत नाही.",
  },
} as const;

export const stepTitles = {
  hi: { scope: "व्यवसाय की जानकारी तय करें", premises: "परिसर की अनुमतियाँ जाँचें", fssai: "FSSAI का रास्ता तय करें", udyam: "उद्यम पंजीकरण पर विचार करें", docs: "साझा दस्तावेज़ तैयार करें", gst: "GST की लागू शर्तें जाँचें", apply: "लागू आवेदन जमा करें", ready: "संचालन की तैयारी" },
  mr: { scope: "व्यवसायाची माहिती निश्चित करा", premises: "जागेच्या परवानग्या तपासा", fssai: "FSSAI मार्ग ठरवा", udyam: "उद्यम नोंदणीचा विचार करा", docs: "सामायिक कागदपत्रे तयार करा", gst: "GST लागू होतो का ते तपासा", apply: "लागू अर्ज सादर करा", ready: "व्यवसाय सुरू करण्याची तयारी" },
} as const;
