import { sampleTranslationRows } from "./sample-translations";
import { extraTranslationRows } from "./translation-extras";
export type Language = "en" | "hi" | "mr";

// Interface and sample-plan translations. Official records, URLs and saved values stay unchanged.
const rows = `
How it works|यह कैसे काम करता है|हे कसे कार्य करते
Explore services|सेवाएँ देखें|सेवा पाहा
My roadmaps|मेरे रोडमैप|माझे मार्गक्रम
Admin|प्रशासन|प्रशासन
Sign in|साइन इन करें|साइन इन करा
Try the demo|डेमो आज़माएँ|डेमो वापरून पाहा
Main navigation|मुख्य नेविगेशन|मुख्य नेव्हिगेशन
Mobile navigation|मोबाइल नेविगेशन|मोबाइल नेव्हिगेशन
Open menu|मेनू खोलें|मेनू उघडा
Close menu|मेनू बंद करें|मेनू बंद करा
Toggle colour theme|रंग थीम बदलें|रंग थीम बदला
Search CivicFlow|CivicFlow में खोजें|CivicFlow मध्ये शोधा
CivicFlow AI home|CivicFlow AI मुख्य पृष्ठ|CivicFlow AI मुख्य पान
Skip to content|मुख्य सामग्री पर जाएँ|मुख्य मजकुराकडे जा
Interface language|इंटरफ़ेस भाषा|इंटरफेसची भाषा
Roadmap language|रोडमैप की भाषा|मार्गक्रमाची भाषा
Product|उत्पाद|उत्पादन
Services|सेवाएँ|सेवा
Live demo|इंटरैक्टिव डेमो|परस्परसंवादी डेमो
Trust|विश्वास|विश्वास
About|परिचय|परिचय
Privacy|गोपनीयता|गोपनीयता
Disclaimer|अस्वीकरण|अस्वीकरण
Built for PSWB02 · TSEC Hackathon|PSWB02 · TSEC हैकथॉन के लिए बनाया गया|PSWB02 · TSEC हॅकॅथॉनसाठी तयार केले
Official sources remain the final authority.|आधिकारिक स्रोत ही अंतिम प्राधिकरण हैं।|अधिकृत स्रोत हेच अंतिम प्रमाण आहेत.
A civic navigation prototype. Always verify requirements on the linked official government source before acting.|नागरिक प्रक्रियाओं का एक प्रोटोटाइप। आगे बढ़ने से पहले संबंधित आधिकारिक सरकारी स्रोत पर आवश्यकताएँ जाँचें।|नागरी प्रक्रियांचे एक प्रोटोटाइप. पुढे जाण्यापूर्वी जोडलेल्या अधिकृत सरकारी स्रोतावर अटी तपासा.
Official source links|आधिकारिक स्रोतों के लिंक|अधिकृत स्रोतांचे दुवे
Dependency-aware|निर्भरताओं पर आधारित|पूर्वअटींवर आधारित
Municipal bureaucracy path visualizer|नगरपालिका प्रक्रियाओं का मार्गदर्शक|महापालिकेच्या प्रक्रियांचा मार्गदर्शक
Tell CivicFlow what you need to achieve. It resolves the jurisdiction, assembles official sources, and turns scattered requirements into one executable roadmap.|CivicFlow को अपना लक्ष्य बताएँ। यह अधिकार क्षेत्र, आधिकारिक स्रोतों और आवश्यकताओं को एक कार्ययोग्य रोडमैप में व्यवस्थित करता है।|CivicFlow ला तुमचे उद्दिष्ट सांगा. ते कार्यक्षेत्र, अधिकृत स्रोत आणि अटी एका कृतीयोग्य मार्गक्रमात मांडते.
Build my roadmap|मेरा रोडमैप बनाएँ|माझा मार्गक्रम तयार करा
SAMPLE ROADMAP PREVIEW|नमूना रोडमैप की झलक|नमुना मार्गक्रमाची झलक
Home food business · Mumbai|घरेलू खाद्य व्यवसाय · मुंबई|घरगुती खाद्य व्यवसाय · मुंबई
8 steps|8 चरण|8 टप्पे
official sources|आधिकारिक स्रोत|अधिकृत स्रोत
authorities|प्राधिकरण|प्राधिकरणे
claims labelled|दावों पर स्थिति अंकित|दाव्यांवर स्थिती दर्शवली
From goal to next action|लक्ष्य से अगले काम तक|उद्दिष्टापासून पुढील कृतीपर्यंत
Built for citizen trust|नागरिकों के विश्वास के लिए|नागरिकांच्या विश्वासासाठी
Not another government chatbot.|सरकारी प्रक्रियाओं का कार्ययोग्य मार्गदर्शक।|सरकारी प्रक्रियांचा कृतीयोग्य मार्गदर्शक.
CivicFlow separates verified facts from AI explanations. Every step can show why it exists, where it came from, what unlocks it, and when its source was last checked.|CivicFlow सत्यापित तथ्यों और AI की व्याख्याओं में अंतर रखता है। प्रत्येक चरण का कारण, स्रोत, पूर्वापेक्षाएँ और स्रोत जाँच की स्थिति दिखाई जाती है।|CivicFlow पडताळलेली तथ्ये आणि AI स्पष्टीकरणे वेगळी ठेवते. प्रत्येक टप्प्याचे कारण, स्रोत, पूर्वअटी आणि स्रोत तपासणीची स्थिती दिसते.
Understand your situation|अपनी स्थिति समझें|तुमची परिस्थिती समजून घ्या
Structured intake asks only clarifying questions that materially change your path.|केवल वही प्रश्न पूछे जाते हैं जो आपके रास्ते को बदलते हैं।|तुमचा मार्ग बदलणारेच प्रश्न विचारले जातात.
Compile verified evidence|साक्ष्य व्यवस्थित करें|पुरावे व्यवस्थित करा
Each procedural claim keeps its authority, source URL, freshness and verification state.|हर प्रक्रियात्मक दावे के साथ प्राधिकरण, स्रोत URL और सत्यापन की स्थिति रहती है।|प्रत्येक प्रक्रियेच्या दाव्यासोबत प्राधिकरण, स्रोत URL आणि पडताळणीची स्थिती असते.
Execute in the right order|सही क्रम में आगे बढ़ें|योग्य क्रमाने पुढे जा
Dependencies reveal blockers, parallel tasks, reusable documents and the next best action.|निर्भरताएँ रुकावटें, समानांतर काम, साझा दस्तावेज़ और अगला काम दिखाती हैं।|पूर्वअटी अडथळे, समांतर कामे, सामायिक कागदपत्रे आणि पुढील कृती दाखवतात.
Jurisdiction resolver|अधिकार क्षेत्र निर्धारण|कार्यक्षेत्र निश्चिती
Source registry|स्रोत सूची|स्रोत नोंदणी
Deterministic rule engine|निश्चित नियम इंजन|निश्चित नियम प्रणाली
Human validation workflow|मानवीय समीक्षा प्रक्रिया|मानवी पडताळणी प्रक्रिया
Understand goal|लक्ष्य समझें|उद्दिष्ट समजून घ्या
Resolve jurisdiction|अधिकार क्षेत्र तय करें|कार्यक्षेत्र ठरवा
Verify sources|स्रोत जाँचें|स्रोत तपासा
Build dependencies|निर्भरताएँ बनाएँ|पूर्वअटी मांडून घ्या
Execute roadmap|रोडमैप पर काम करें|मार्गक्रमानुसार काम करा
Mumbai · MCGM|मुंबई · MCGM|मुंबई · MCGM
4 official portals|4 आधिकारिक पोर्टल|4 अधिकृत पोर्टल
2 parallel paths|2 समानांतर रास्ते|2 समांतर मार्ग
Next action ready|अगला काम तैयार|पुढील कृती तयार
Service explorer|सेवा खोज|सेवा शोध
Start with your goal.|अपने लक्ष्य से शुरू करें।|तुमच्या उद्दिष्टापासून सुरुवात करा.
Explore sample workflows with personalized questions, official portal links and progress tracking.|प्रश्नों, आधिकारिक पोर्टल लिंक और प्रगति की सुविधा वाले नमूने देखें।|प्रश्न, अधिकृत पोर्टल दुवे आणि प्रगतीची सुविधा असलेले नमुने पाहा.
Choose a demo|डेमो चुनें|डेमो निवडा
Interactive sample|इंटरैक्टिव नमूना|परस्परसंवादी नमुना
Procedure available|प्रक्रिया उपलब्ध|प्रक्रिया उपलब्ध
View procedure details|प्रक्रिया का विवरण देखें|प्रक्रियेचा तपशील पाहा
Answer a few questions, explore the dependency graph and try saving your progress.|कुछ प्रश्नों के उत्तर दें, निर्भरताएँ देखें और प्रगति सहेजें।|काही प्रश्नांची उत्तरे द्या, पूर्वअटी पाहा आणि प्रगती जतन करा.
Build sample roadmap|नमूना रोडमैप बनाएँ|नमुना मार्गक्रम तयार करा
Start a home food business|घर से खाद्य व्यवसाय शुरू करें|घरगुती खाद्य व्यवसाय सुरू करा
Get a birth certificate|जन्म प्रमाणपत्र प्राप्त करें|जन्म दाखला मिळवा
Register a small business|छोटा व्यवसाय पंजीकृत करें|लघु व्यवसायाची नोंदणी करा
Renew a driving licence|ड्राइविंग लाइसेंस नवीनीकृत करें|वाहनचालक परवान्याचे नूतनीकरण करा
Register property|संपत्ति पंजीकृत करें|मालमत्तेची नोंदणी करा
Register a society|संस्था पंजीकृत करें|संस्थेची नोंदणी करा
Start a home food business in Mumbai|मुंबई में घर से खाद्य व्यवसाय शुरू करें|मुंबईत घरगुती खाद्य व्यवसाय सुरू करा
Mumbai, Maharashtra|मुंबई, महाराष्ट्र|मुंबई, महाराष्ट्र
Maharashtra|महाराष्ट्र|महाराष्ट्र
India · Udyam (MSME)|भारत · उद्यम (MSME)|भारत · उद्यम (MSME)
Maharashtra · Co-operative society|महाराष्ट्र · सहकारी संस्था|महाराष्ट्र · सहकारी संस्था
Choose a sample to try.|आज़माने के लिए नमूना चुनें।|वापरून पाहण्यासाठी नमुना निवडा.
See how CivicFlow works: answer questions, build a roadmap and complete a step. No login is needed, and sample progress stays in this browser.|प्रश्नों के उत्तर दें, रोडमैप बनाएँ और चरण पूरा करें। लॉगिन आवश्यक नहीं है; प्रगति इसी ब्राउज़र में रहती है।|प्रश्नांची उत्तरे द्या, मार्गक्रम तयार करा आणि टप्पा पूर्ण करा. लॉगिन आवश्यक नाही; प्रगती याच ब्राउझरमध्ये राहते.
Looking for service requirements? Browse services|सेवा की आवश्यकताएँ जानने के लिए सेवाएँ देखें|सेवेच्या अटी जाणून घेण्यासाठी सेवा पाहा
Procedure coverage|उपलब्ध प्रक्रियाएँ|उपलब्ध प्रक्रिया
This goal needs another procedure.|इस लक्ष्य के लिए दूसरी प्रक्रिया चाहिए।|या उद्दिष्टासाठी दुसरी प्रक्रिया आवश्यक आहे.
Your goal: “|आपका लक्ष्य: “|तुमचे उद्दिष्ट: “
Choose a supported sample and confirm its jurisdiction before building a roadmap.|उपलब्ध नमूना चुनें और रोडमैप बनाने से पहले अधिकार क्षेत्र की पुष्टि करें।|उपलब्ध नमुना निवडा आणि मार्गक्रम तयार करण्यापूर्वी कार्यक्षेत्राची खात्री करा.
Explore sample workflows|नमूना प्रक्रियाएँ देखें|नमुना प्रक्रिया पाहा
Back to home|मुख्य पृष्ठ पर लौटें|मुख्य पानावर परत जा
AI-assisted civic intake|AI की सहायता से जानकारी|AI च्या मदतीने माहिती
Build a path you can trust.|विश्वसनीय रास्ता बनाएँ।|विश्वासार्ह मार्ग तयार करा.
Offline-safe by design|ऑफ़लाइन नमूना उपलब्ध|ऑफलाइन नमुना उपलब्ध
Interpreted goal|समझा गया लक्ष्य|समजलेले उद्दिष्ट
Deterministic sample · works without AI or backend credentials|निश्चित नमूना · AI या बैकएंड क्रेडेंशियल के बिना चलता है|निश्चित नमुना · AI किंवा बॅकएंड क्रेडेन्शियलशिवाय चालतो
Confirm your sample profile|अपने नमूने की जानकारी तय करें|नमुन्याची माहिती निश्चित करा
We ask only what affects jurisdiction or eligibility. Personal documents are not needed for this demo.|हम केवल अधिकार क्षेत्र या पात्रता से जुड़े प्रश्न पूछते हैं। डेमो में निजी दस्तावेज़ आवश्यक नहीं हैं।|आम्ही कार्यक्षेत्र किंवा पात्रतेशी संबंधित प्रश्नच विचारतो. डेमोसाठी वैयक्तिक कागदपत्रे आवश्यक नाहीत.
Where will you operate?|आप कहाँ काम करेंगे?|तुम्ही कुठे काम करणार?
This selects the applicable municipal authority.|इससे संबंधित नगरपालिका प्राधिकरण तय होता है।|यामुळे संबंधित महापालिका ठरते.
Home premises in Mumbai|मुंबई में घरेलू परिसर|मुंबईतील घरगुती जागा
Commercial premises in Mumbai|मुंबई में व्यावसायिक परिसर|मुंबईतील व्यावसायिक जागा
What will you primarily do?|आपका मुख्य काम क्या होगा?|तुमचे मुख्य काम कोणते असेल?
The activity changes the official eligibility path.|गतिविधि के अनुसार पात्रता का रास्ता बदलता है।|कामानुसार पात्रतेचा मार्ग बदलतो.
Prepare and deliver food|खाना बनाएँ और पहुँचाएँ|अन्न तयार करा आणि पोहोचवा
Package food products|खाद्य उत्पाद पैक करें|खाद्यपदार्थ पॅक करा
Resell packaged goods|पैक किए उत्पाद बेचें|पॅक केलेल्या वस्तू पुन्हा विका
Do you already hold an applicable food registration or licence?|क्या आपके पास लागू खाद्य पंजीकरण या लाइसेंस है?|तुमच्याकडे लागू खाद्य नोंदणी किंवा परवाना आहे का?
Existing approvals can remove redundant steps.|मौजूदा मंज़ूरी से दोहराए गए चरण बच सकते हैं।|असलेल्या मंजुरीमुळे पुन्हा करावे लागणारे टप्पे टाळता येतात.
Your answer personalizes this sample roadmap.|आपके उत्तर से नमूना रोडमैप बदलता है।|तुमच्या उत्तरानुसार नमुना मार्गक्रम बदलतो.
No|नहीं|नाही
Yes|हाँ|होय
Use the|यह उपयोग करें:|हे वापरा:
sample jurisdiction.|नमूना अधिकार क्षेत्र।|नमुना कार्यक्षेत्र.
Compile my roadmap|मेरा रोडमैप बनाएँ|माझा मार्गक्रम तयार करा
Creates a fresh browser-local sample using your answers. Only this service’s sample progress will be replaced. Other saved roadmaps are preserved.|आपके उत्तरों से नया स्थानीय नमूना बनता है। केवल इस सेवा की प्रगति बदलेगी; अन्य रोडमैप सुरक्षित रहेंगे।|तुमच्या उत्तरांवरून नवीन स्थानिक नमुना तयार होतो. फक्त या सेवेची प्रगती बदलेल; इतर मार्गक्रम सुरक्षित राहतील.
Compiling your procedure|आपकी प्रक्रिया तैयार हो रही है|तुमची प्रक्रिया तयार होत आहे
Preparing the seeded sample and applying your answers. No live government crawl runs in this demo.|नमूना और आपके उत्तर लागू किए जा रहे हैं। इस डेमो में सरकारी साइटों का लाइव क्रॉल नहीं होता।|नमुना आणि तुमची उत्तरे लागू केली जात आहेत. या डेमोमध्ये सरकारी साइट्सचे थेट क्रॉलिंग होत नाही.
Understanding your goal|आपका लक्ष्य समझ रहे हैं|तुमचे उद्दिष्ट समजून घेत आहोत
Resolving jurisdiction|अधिकार क्षेत्र तय हो रहा है|कार्यक्षेत्र ठरवत आहोत
Loading sample source catalogue|नमूना स्रोत सूची लोड हो रही है|नमुना स्रोत सूची लोड होत आहे
Applying your demo profile|आपकी जानकारी लागू हो रही है|तुमची माहिती लागू होत आहे
Checking dependencies|निर्भरताएँ जाँच रहे हैं|पूर्वअटी तपासत आहोत
Building your roadmap|आपका रोडमैप बन रहा है|तुमचा मार्गक्रम तयार होत आहे
Your roadmap is ready|आपका रोडमैप तैयार है|तुमचा मार्गक्रम तयार आहे
steps · personalized dependencies · browser-local progress.|चरण · आपकी जानकारी के अनुसार निर्भरताएँ · स्थानीय प्रगति।|टप्पे · तुमच्या माहितीनुसार पूर्वअटी · स्थानिक प्रगती.
Open interactive roadmap|इंटरैक्टिव रोडमैप खोलें|परस्परसंवादी मार्गक्रम उघडा
Edit answers|उत्तर बदलें|उत्तरे बदला
Demo guidance is not legal advice. Confirm current requirements on each linked official portal.|डेमो कानूनी सलाह नहीं है। हर आधिकारिक पोर्टल पर वर्तमान आवश्यकताएँ जाँचें।|डेमो कायदेशीर सल्ला नाही. प्रत्येक अधिकृत पोर्टलवर सध्याच्या अटी तपासा.
Securely interpreting your goal…|आपका लक्ष्य समझा जा रहा है…|तुमचे उद्दिष्ट समजून घेत आहोत…
Goal interpretation failed.|लक्ष्य समझने में समस्या हुई।|उद्दिष्ट समजण्यात अडचण आली.
Retry|फिर कोशिश करें|पुन्हा प्रयत्न करा
Continue your saved sample|सहेजा नमूना जारी रखें|जतन केलेला नमुना पुढे चालू ठेवा
Your progress, notes and preparation checklist are already saved in this browser. Use what-if to change answers while keeping unaffected progress.|आपकी प्रगति, नोट्स और तैयारी सूची सहेजी हुई है। अप्रभावित प्रगति रखने के लिए what-if से उत्तर बदलें।|तुमची प्रगती, नोंदी आणि तयारीची यादी जतन आहे. न बदलणारी प्रगती राखण्यासाठी पर्यायी परिस्थितीत उत्तरे बदला.
Resume saved roadmap|सहेजा रोडमैप जारी रखें|जतन केलेला मार्गक्रम उघडा
Change answers with what-if|वैकल्पिक स्थिति में उत्तर बदलें|पर्यायी परिस्थितीत उत्तरे बदला
Replace this saved sample?|सहेजा नमूना बदलें?|जतन केलेला नमुना बदलायचा?
A fresh roadmap will replace this service’s progress, notes and prepared-document selections. Other services and admin review decisions are preserved.|नया रोडमैप इस सेवा की प्रगति, नोट्स और तैयारी चयन बदल देगा। अन्य सेवाएँ और प्रशासन की समीक्षा सुरक्षित रहेंगी।|नवीन मार्गक्रम या सेवेची प्रगती, नोंदी आणि तयारीचे पर्याय बदलेल. इतर सेवा आणि प्रशासनाचे निर्णय सुरक्षित राहतील.
To keep unaffected progress, cancel and use what-if instead.|अप्रभावित प्रगति रखने के लिए रद्द करें और वैकल्पिक स्थिति का उपयोग करें।|न बदलणारी प्रगती राखण्यासाठी रद्द करा आणि पर्यायी परिस्थिती वापरा.
Keep saved roadmap|सहेजा रोडमैप रखें|जतन केलेला मार्गक्रम ठेवा
Replace and build fresh sample|बदलें और नया नमूना बनाएँ|बदला आणि नवीन नमुना तयार करा
Citizen dashboard|नागरिक डैशबोर्ड|नागरिक डॅशबोर्ड
Your civic workspace.|आपका नागरिक कार्यक्षेत्र।|तुमचे नागरी कार्यक्षेत्र.
Sample workflow progress stays in this browser.|नमूने की प्रगति इसी ब्राउज़र में रहती है।|नमुन्याची प्रगती याच ब्राउझरमध्ये राहते.
New civic goal|नया नागरिक लक्ष्य|नवीन नागरी उद्दिष्ट
Your roadmaps|आपके रोडमैप|तुमचे मार्गक्रम
Sample roadmap|नमूना रोडमैप|नमुना मार्गक्रम
Sample roadmaps|नमूना रोडमैप|नमुना मार्गक्रम
Actions ready|तैयार काम|तयार कृती
Documents to prepare|तैयार करने के दस्तावेज़|तयार करायची कागदपत्रे
of|में से|पैकी
required steps complete ·|ज़रूरी चरण पूरे ·|आवश्यक टप्पे पूर्ण ·
Open roadmap|रोडमैप खोलें|मार्गक्रम उघडा
Source review demonstration|स्रोत समीक्षा का डेमो|स्रोत पुनरावलोकनाचा डेमो
Open review console|समीक्षा कंसोल खोलें|पुनरावलोकन कन्सोल उघडा
Trust summary|विश्वास का सार|विश्वासाचा सारांश
Official portal links identify the responsible authorities. Sample procedural claims have no captured evidence and are not presented as verified requirements.|आधिकारिक लिंक संबंधित प्राधिकरण दिखाते हैं। नमूने के दावे साक्ष्य से सत्यापित आवश्यकताएँ नहीं हैं।|अधिकृत दुवे संबंधित प्राधिकरण दर्शवतात. नमुन्यातील दावे पुराव्याने पडताळलेल्या अटी नाहीत.
Back to dashboard|डैशबोर्ड पर लौटें|डॅशबोर्डवर परत जा
What-if|वैकल्पिक स्थिति|पर्यायी परिस्थिती
Readiness|तैयारी|तयारी
Print / PDF|प्रिंट / PDF|प्रिंट / PDF
Overview|अवलोकन|आढावा
Collapse overview|अवलोकन बंद करें|आढावा बंद करा
Available actions|उपलब्ध काम|उपलब्ध कृती
· parallel|· समानांतर|· समांतर
Open full readiness checklist|पूरी तैयारी सूची खोलें|संपूर्ण तयारीची यादी उघडा
Search roadmap steps|रोडमैप के चरण खोजें|मार्गक्रमातील टप्पे शोधा
Search steps or agencies…|चरण या प्राधिकरण खोजें…|टप्पे किंवा प्राधिकरण शोधा…
Filter step status|चरण की स्थिति छाँटें|टप्प्यांची स्थिती निवडा
All statuses|सभी स्थितियाँ|सर्व स्थिती
Clear filters|फ़िल्टर हटाएँ|फिल्टर काढा
No matching steps. Try another search or clear the filters.|कोई चरण नहीं मिला। दूसरी खोज करें या फ़िल्टर हटाएँ।|टप्पा सापडला नाही. दुसरा शोध करा किंवा फिल्टर काढा.
Procedure dependency graph|प्रक्रिया की निर्भरता का ग्राफ़|प्रक्रियेच्या पूर्वअटींचा आलेख
Steps in dependency order|निर्भरता के क्रम में चरण|पूर्वअटींच्या क्रमाने टप्पे
Sample guidance ·|नमूना मार्गदर्शन ·|नमुना मार्गदर्शन ·
preparation items ready|तैयारी की चीज़ें तैयार|तयारीच्या बाबी तयार
prepared. Preparation status does not verify documents.|तैयार। तैयारी की स्थिति दस्तावेज़ों को सत्यापित नहीं करती।|तयार. तयारीची स्थिती कागदपत्रांची पडताळणी करत नाही.
Update document readiness|दस्तावेज़ की तैयारी बदलें|कागदपत्रांची तयारी बदला
Not verified from an official source|आधिकारिक स्रोत से सत्यापित नहीं|अधिकृत स्रोतावरून पडताळलेले नाही
Sample requirement. The portal link identifies an official authority; no captured evidence supports this sample claim.|नमूना आवश्यकता। लिंक आधिकारिक प्राधिकरण दिखाता है; इस दावे के लिए साक्ष्य दर्ज नहीं है।|नमुना अट. दुवा अधिकृत प्राधिकरण दर्शवतो; या दाव्यासाठी पुरावा नोंदवलेला नाही.
This sample step resolves an eligibility question, prepares shared documents, or unlocks the next planning step. Its dependencies are planning relationships, not verified legal rules.|यह चरण पात्रता, साझा दस्तावेज़ या अगले काम की योजना में मदद करता है। निर्भरताएँ योजना का हिस्सा हैं, सत्यापित कानूनी नियम नहीं।|हा टप्पा पात्रता, सामायिक कागदपत्रे किंवा पुढील कामाच्या नियोजनास मदत करतो. पूर्वअटी नियोजनाचा भाग आहेत, पडताळलेले कायदेशीर नियम नाहीत.
Notes|नोट्स|नोंदी
(browser-local demo)|(ब्राउज़र में स्थानीय डेमो)|(ब्राउझरमधील स्थानिक डेमो)
Avoid personal or sensitive information|निजी या संवेदनशील जानकारी न लिखें|वैयक्तिक किंवा संवेदनशील माहिती लिहू नका
Complete the prerequisites above to unlock this step.|यह चरण खोलने के लिए ऊपर की पूर्वापेक्षाएँ पूरी करें।|हा टप्पा सुरू करण्यासाठी वरील पूर्वअटी पूर्ण करा.
Ask CivicFlow about this step|CivicFlow से इस चरण के बारे में पूछें|CivicFlow ला या टप्प्याबद्दल विचारा
← Back to roadmap|← रोडमैप पर लौटें|← मार्गक्रमावर परत जा
Document readiness|दस्तावेज़ की तैयारी|कागदपत्रांची तयारी
Prepare once, reuse across steps.|एक बार तैयार करें, कई चरणों में उपयोग करें।|एकदा तयार करा, अनेक टप्प्यांत वापरा.
Print / Save as PDF|प्रिंट / PDF सहेजें|प्रिंट / PDF जतन करा
prepared. Readiness is your checklist status; it does not upload or verify documents.|तैयार। यह आपकी सूची की स्थिति है; दस्तावेज़ अपलोड या सत्यापित नहीं होते।|तयार. ही तुमच्या यादीची स्थिती आहे; कागदपत्रे अपलोड किंवा पडताळली जात नाहीत.
· Used by|· उपयोग करने वाले|· वापरणारे
Prepared|तैयार|तयार
Not prepared|तैयार नहीं|तयार नाही
step|चरण|टप्पा
steps|चरण|टप्पे
Show related steps and sources|संबंधित चरण और स्रोत देखें|संबंधित टप्पे आणि स्रोत पाहा
Sample preparation item; requirement verification is pending.|नमूना तैयारी की चीज़; आवश्यकता का सत्यापन बाकी है।|नमुना तयारीची बाब; अटीची पडताळणी बाकी आहे.
Include my local notes|मेरे स्थानीय नोट्स शामिल करें|माझ्या स्थानिक नोंदी समाविष्ट करा
Use your browser’s print dialog to print this report or choose “Save as PDF”. The full checklist prints regardless of collapsed roadmap panels or search filters.|ब्राउज़र के प्रिंट विकल्प से रिपोर्ट छापें या PDF सहेजें। बंद पैनल और फ़िल्टर के बावजूद पूरी सूची छपेगी।|ब्राउझरच्या प्रिंट पर्यायातून अहवाल छापा किंवा PDF जतन करा. बंद पॅनेल आणि फिल्टर असले तरी संपूर्ण यादी छापली जाते.
CivicFlow AI · Roadmap report|CivicFlow AI · रोडमैप रिपोर्ट|CivicFlow AI · मार्गक्रम अहवाल
· Sample version|· नमूना संस्करण|· नमुना आवृत्ती
Progress snapshot:|प्रगति की स्थिति:|प्रगतीची स्थिती:
required steps complete (|ज़रूरी चरण पूरे (|आवश्यक टप्पे पूर्ण (
preparation items marked ready.|तैयारी की चीज़ें तैयार चिह्नित।|तयारीच्या बाबी तयार म्हणून नोंदवल्या.
Procedure checklist|प्रक्रिया की सूची|प्रक्रियेची यादी
Prerequisites:|पूर्वापेक्षाएँ:|पूर्वअटी:
Preparation:|तैयारी:|तयारी:
Local note:|स्थानीय नोट:|स्थानिक नोंद:
Used by:|उपयोग करने वाले:|वापरणारे:
Official sources|आधिकारिक स्रोत|अधिकृत स्रोत
None|कोई नहीं|काही नाही
None listed|कोई दर्ज नहीं|काही नोंदलेले नाही
Online|ऑनलाइन|ऑनलाइन
Physical|प्रत्यक्ष|प्रत्यक्ष
Hybrid|ऑनलाइन / प्रत्यक्ष|ऑनलाइन / प्रत्यक्ष
Check portal|पोर्टल जाँचें|पोर्टल तपासा
Varies|अलग-अलग|बदलते
Milestone|पड़ाव|महत्त्वाचा टप्पा
Browser-local sample planning data, not official approval. Requirement, fee and timeline verification remains pending. Prepared items are self-reported; no documents have been uploaded or verified.|स्थानीय नमूना योजना, आधिकारिक मंज़ूरी नहीं। आवश्यकताओं, शुल्क और समय का सत्यापन बाकी है। तैयारी स्वयं दर्ज की गई है; दस्तावेज़ अपलोड या सत्यापित नहीं हैं।|स्थानिक नमुना नियोजन, अधिकृत मंजुरी नाही. अटी, शुल्क आणि वेळेची पडताळणी बाकी आहे. तयारी स्वतः नोंदवलेली आहे; कागदपत्रे अपलोड किंवा पडताळलेली नाहीत.
What-if comparison|वैकल्पिक स्थिति की तुलना|पर्यायी परिस्थितीची तुलना
Explore another path.|दूसरा रास्ता देखें।|दुसरा मार्ग पाहा.
Preview supported choices without changing your saved roadmap. Apply only when you want to use the scenario. Other locations and eligibility fields are not supported by this procedure yet.|सहेजा रोडमैप बदले बिना विकल्प देखें। पसंद आने पर ही लागू करें। अन्य स्थान और पात्रता विकल्प इस नमूने में उपलब्ध नहीं हैं।|जतन केलेला मार्गक्रम न बदलता पर्याय पाहा. पसंत पडल्यावरच लागू करा. इतर ठिकाणे आणि पात्रतेचे पर्याय या नमुन्यात उपलब्ध नाहीत.
Scenario choices|स्थिति के विकल्प|परिस्थितीचे पर्याय
Reset preview|पूर्वावलोकन रीसेट करें|पूर्वावलोकन रीसेट करा
Current roadmap vs scenario|वर्तमान रोडमैप और वैकल्पिक स्थिति|सध्याचा मार्गक्रम आणि पर्यायी परिस्थिती
Measure|माप|मोजमाप
Current|वर्तमान|सध्याचे
Scenario|वैकल्पिक स्थिति|पर्यायी परिस्थिती
Preview only — saved progress is unchanged.|केवल पूर्वावलोकन — सहेजी प्रगति नहीं बदली है।|केवळ पूर्वावलोकन — जतन केलेली प्रगती बदललेली नाही.
Choose another option to see the differences.|अंतर देखने के लिए दूसरा विकल्प चुनें।|फरक पाहण्यासाठी दुसरा पर्याय निवडा.
Required steps|ज़रूरी चरण|आवश्यक टप्पे
Optional steps|वैकल्पिक चरण|ऐच्छिक टप्पे
Preparation items|तैयारी की चीज़ें|तयारीच्या बाबी
Physical / hybrid steps|प्रत्यक्ष / मिश्रित चरण|प्रत्यक्ष / मिश्र टप्पे
Dependencies|निर्भरताएँ|पूर्वअटी
Progress after applying|लागू करने के बाद प्रगति|लागू केल्यानंतरची प्रगती
Complexity is shown through step, dependency and preparation counts. Fees and waiting times cannot be compared because this sample has no verified values. Physical / hybrid steps are not an appointment count.|जटिलता चरणों, निर्भरताओं और तैयारी की संख्या से दिखाई जाती है। सत्यापित मूल्य न होने से शुल्क और समय की तुलना नहीं होती। प्रत्यक्ष चरण अपॉइंटमेंट की संख्या नहीं हैं।|गुंतागुंत टप्पे, पूर्वअटी आणि तयारीच्या संख्येने दाखवली जाते. पडताळलेली मूल्ये नसल्याने शुल्क व वेळेची तुलना होत नाही. प्रत्यक्ष टप्पे म्हणजे भेटींची संख्या नाही.
Steps added|जोड़े गए चरण|जोडलेले टप्पे
Steps removed|हटाए गए चरण|काढलेले टप्पे
Steps updated|बदले गए चरण|बदललेले टप्पे
Document changes|दस्तावेज़ों में बदलाव|कागदपत्रांतील बदल
Agency changes|प्राधिकरण में बदलाव|प्राधिकरणातील बदल
Completed steps needing review|पूरे चरण जिनकी समीक्षा चाहिए|पुनरावलोकन आवश्यक असलेले पूर्ण टप्पे
Added:|जोड़ा गया:|जोडले:
Removed:|हटाया गया:|काढले:
Removed from checklist:|सूची से हटाया गया:|यादीतून काढले:
completed|पूरे|पूर्ण
step is|चरण|टप्पा
steps are|चरण|टप्पे
retained. Changed steps and affected dependants reopen. Notes and prepared-document selections are retained; items outside the new checklist stay stored for later use.|सुरक्षित हैं। बदले चरण और उन पर निर्भर चरण फिर खुलेंगे। नोट्स और तैयारी चयन सुरक्षित हैं; नई सूची के बाहर की चीज़ें भी सहेजी रहेंगी।|जतन आहेत. बदललेले आणि त्यांवर अवलंबून टप्पे पुन्हा उघडतील. नोंदी आणि तयारीचे पर्याय जतन आहेत; नवीन यादीबाहेरील बाबीही जतन राहतात.
Apply scenario to my roadmap|मेरे रोडमैप पर स्थिति लागू करें|माझ्या मार्गक्रमावर परिस्थिती लागू करा
Discard preview|पूर्वावलोकन छोड़ें|पूर्वावलोकन रद्द करा
No changes|कोई बदलाव नहीं|काही बदल नाही
Premises|परिसर|जागा
Home|घर|घर
Commercial|व्यावसायिक|व्यावसायिक
Activity|गतिविधि|काम
Existing food registration or licence|मौजूदा खाद्य पंजीकरण या लाइसेंस|असलेली खाद्य नोंदणी किंवा परवाना
Open CivicFlow Copilot|CivicFlow सहायक खोलें|CivicFlow सहाय्यक उघडा
Ask CivicFlow|CivicFlow से पूछें|CivicFlow ला विचारा
CivicFlow Copilot|CivicFlow सहायक|CivicFlow सहाय्यक
Close CivicFlow Copilot|CivicFlow सहायक बंद करें|CivicFlow सहाय्यक बंद करा
Assistant conversation|सहायक की बातचीत|सहाय्यकाचा संवाद
Checking the sample context…|नमूने की जानकारी जाँच रहे हैं…|नमुन्याची माहिती तपासत आहोत…
Consulting CivicFlow AI…|CivicFlow AI से जानकारी ले रहे हैं…|CivicFlow AI कडून माहिती घेत आहोत…
Ask about this civic path…|इस नागरिक प्रक्रिया के बारे में पूछें…|या नागरी प्रक्रियेबद्दल विचारा…
Send question|प्रश्न भेजें|प्रश्न पाठवा
No AI claim is treated as official|AI का कोई दावा आधिकारिक नहीं माना जाता|AI चा कोणताही दावा अधिकृत मानला जात नाही
Reset|रीसेट|रीसेट
Explore the service catalogue|सेवा सूची देखें|सेवा सूची पाहा
What should I do next?|मुझे आगे क्या करना चाहिए?|मी पुढे काय करावे?
Which documents can I reuse?|कौन से दस्तावेज़ दोबारा उपयोग कर सकता हूँ?|कोणती कागदपत्रे पुन्हा वापरता येतील?
How is this information verified?|यह जानकारी कैसे सत्यापित होती है?|या माहितीची पडताळणी कशी केली जाते?
I can explain this roadmap, surface the next action, and show which claims still need official verification.|मैं इस रोडमैप और अगले काम को समझा सकता हूँ और बता सकता हूँ कि किन दावों का सत्यापन बाकी है।|मी हा मार्गक्रम आणि पुढील कृती समजावू शकतो आणि कोणत्या दाव्यांची पडताळणी बाकी आहे ते सांगू शकतो.
Sample-context assistant|नमूने की जानकारी वाला सहायक|नमुन्याची माहिती देणारा सहाय्यक
Tell me which civic service you need. I’ll route you to a supported procedure and keep official sources separate from guidance.|मुझे बताएं कि आपको कौन सी नागरिक सेवा चाहिए। मैं आपको समर्थित प्रक्रिया तक ले जाऊँगा और आधिकारिक स्रोतों को मार्गदर्शन से अलग रखूँगा।|तुम्हाला कोणती नागरी सेवा हवी आहे ते सांगा. मी तुम्हाला समर्थित प्रक्रियेकडे नेईन आणि अधिकृत स्रोत मार्गदर्शनापासून वेगळे ठेवीन.
Service catalogue assistant|सेवा सूची सहायक|सेवा सूची सहाय्यक
Current browser-local demo state|ब्राउज़र की वर्तमान डेमो स्थिति|ब्राउझरमधील सध्याची डेमो स्थिती
Service catalogue context|सेवा सूची की जानकारी|सेवा सूचीची माहिती
Sample fallback mode|नमूना विकल्प|नमुना पर्याय
Verified guidance fallback · AI temporarily unavailable|सत्यापित मार्गदर्शन विकल्प · AI अस्थायी रूप से उपलब्ध नहीं|पडताळलेले मार्गदर्शन पर्याय · AI तात्पुरते उपलब्ध नाही
Connection fallback|कनेक्शन का विकल्प|जोडणीचा पर्याय
Close search|खोज बंद करें|शोध बंद करा
Search services and commands|सेवाएँ और आदेश खोजें|सेवा आणि आदेश शोधा
Search services, roadmap tools or themes…|सेवाएँ, रोडमैप या थीम खोजें…|सेवा, मार्गक्रम किंवा थीम शोधा…
Search results|खोज के परिणाम|शोधाचे निकाल
No matching services or commands. Try a service name or “theme”.|कोई सेवा या आदेश नहीं मिला। सेवा का नाम या थीम खोजें।|सेवा किंवा आदेश सापडला नाही. सेवेचे नाव किंवा थीम शोधा.
↑ ↓ to choose · Enter to open · Esc to close · Ctrl / ⌘ K|↑ ↓ चुनें · Enter खोलें · Esc बंद करें · Ctrl / ⌘ K|↑ ↓ निवडा · Enter उघडा · Esc बंद करा · Ctrl / ⌘ K
Navigate|नेविगेशन|नेव्हिगेशन
Roadmap tools|रोडमैप की सुविधाएँ|मार्गक्रमाची साधने
Appearance|दिखावट|स्वरूप
Create a sample goal|नमूना लक्ष्य बनाएँ|नमुना उद्दिष्ट तयार करा
Admin review console|प्रशासन समीक्षा कंसोल|प्रशासन पुनरावलोकन कन्सोल
Roadmap|रोडमैप|मार्गक्रम
Use light theme|हल्की थीम चुनें|फिकट थीम निवडा
Use dark theme|गहरी थीम चुनें|गडद थीम निवडा
Use system theme|सिस्टम थीम चुनें|सिस्टम थीम निवडा
Light|हल्का|फिकट
Dark|गहरा|गडद
System|सिस्टम|सिस्टम
Human validation console|मानवीय समीक्षा कंसोल|मानवी पुनरावलोकन कन्सोल
Source intelligence|स्रोत की जानकारी|स्रोतांची माहिती
Browser-local demo console. No shared backend changes are made.|ब्राउज़र में स्थानीय डेमो कंसोल। साझा बैकएंड नहीं बदलता।|ब्राउझरमधील स्थानिक डेमो कन्सोल. सामायिक बॅकएंड बदलत नाही.
6 sample procedures|6 नमूना प्रक्रियाएँ|6 नमुना प्रक्रिया
ADMIN WORKSPACE|प्रशासन कार्यक्षेत्र|प्रशासन कार्यक्षेत्र
Admin demo sections|प्रशासन डेमो के भाग|प्रशासन डेमोचे विभाग
Changes|बदलाव|बदल
Sources|स्रोत|स्रोत
Claims|दावे|दावे
Procedures|प्रक्रियाएँ|प्रक्रिया
Evaluations|जाँच|तपासणी
Audit log|ऑडिट लॉग|ऑडिट नोंद
Sample source links|नमूना स्रोत लिंक|नमुना स्रोत दुवे
Sample steps|नमूना चरण|नमुना टप्पे
Review pending|समीक्षा बाकी|पुनरावलोकन बाकी
Graph validity|ग्राफ़ की वैधता|आलेखाची वैधता
Pass|सफल|उत्तीर्ण
Fail|असफल|अनुत्तीर्ण
pending|बाकी|बाकी
approved|स्वीकृत|मंजूर
rejected|अस्वीकृत|नामंजूर
Synthetic source change review|काल्पनिक स्रोत बदलाव की समीक्षा|काल्पनिक स्रोत बदलाचे पुनरावलोकन
SEEDED CHANGE-DETECTION DEMO|नमूना बदलाव जाँच डेमो|नमुना बदल तपासणी डेमो
Synthetic source change|काल्पनिक स्रोत बदलाव|काल्पनिक स्रोत बदल
Demonstration only|केवल प्रदर्शन|केवळ प्रात्यक्षिक
The text below is synthetic change data created to demonstrate review mechanics. It does not assert a real government fee change.|नीचे का बदलाव समीक्षा दिखाने के लिए काल्पनिक है। यह वास्तविक सरकारी शुल्क बदलाव नहीं है।|खालील बदल पुनरावलोकन दाखवण्यासाठी काल्पनिक आहे. हा खऱ्या सरकारी शुल्कातील बदल नाही.
SOURCE|स्रोत|स्रोत
IMPACT ANALYSIS · FOOD-BUSINESS SAMPLE ONLY|प्रभाव विश्लेषण · केवल खाद्य व्यवसाय नमूना|परिणाम विश्लेषण · फक्त खाद्य व्यवसाय नमुना
procedure|प्रक्रिया|प्रक्रिया
claims|दावे|दावे
roadmap|रोडमैप|मार्गक्रम
EXACT CONTENT DIFF · SYNTHETIC|सामग्री में अंतर · काल्पनिक|मजकुरातील फरक · काल्पनिक
Previous snapshot|पिछली स्थिति|मागील स्थिती
New snapshot|नई स्थिति|नवीन स्थिती
- Fee value: DEMO ₹500|- शुल्क: DEMO ₹500|- शुल्क: DEMO ₹500
+ Fee value: DEMO ₹750|+ शुल्क: DEMO ₹750|+ शुल्क: DEMO ₹750
Reject change|बदलाव अस्वीकार करें|बदल नामंजूर करा
Approve demo change|डेमो बदलाव स्वीकार करें|डेमो बदल मंजूर करा
Decision recorded|निर्णय दर्ज|निर्णय नोंदवला
Browser-local audit event recorded ·|स्थानीय ऑडिट दर्ज ·|स्थानिक ऑडिट नोंदवले ·
Reset demo|डेमो रीसेट करें|डेमो रीसेट करा
Return to citizen roadmap|नागरिक रोडमैप पर लौटें|नागरिक मार्गक्रमावर परत जा
Browser-local demonstration|ब्राउज़र में स्थानीय प्रदर्शन|ब्राउझरमधील स्थानिक प्रात्यक्षिक
sample procedures,|नमूना प्रक्रियाएँ,|नमुना प्रक्रिया,
official portal links,|आधिकारिक पोर्टल लिंक,|अधिकृत पोर्टल दुवे,
sample planning steps and|नमूना चरण और|नमुना टप्पे आणि
dependency edges are available in the local catalogue.|निर्भरताएँ स्थानीय सूची में उपलब्ध हैं।|पूर्वअटी स्थानिक सूचीमध्ये उपलब्ध आहेत.
Food-business source review:|खाद्य व्यवसाय स्रोत समीक्षा:|खाद्य व्यवसाय स्रोत पुनरावलोकन:
. Food sample version:|. खाद्य नमूना संस्करण:|. खाद्य नमुना आवृत्ती:
Live crawling, authoritative snapshots and backend validation are not connected in this local demo. No production health metric is implied.|स्थानीय डेमो में लाइव क्रॉलिंग, आधिकारिक स्नैपशॉट और बैकएंड सत्यापन नहीं जुड़े हैं। यह उत्पादन की स्थिति नहीं दिखाता।|स्थानिक डेमोमध्ये थेट क्रॉलिंग, अधिकृत स्नॅपशॉट आणि बॅकएंड पडताळणी जोडलेली नाही. हे उत्पादनाची स्थिती दर्शवत नाही.
sample roadmaps are saved in this browser. Each supports scenario comparison, document readiness and printable reports.|नमूना रोडमैप इस ब्राउज़र में सहेजे हैं। प्रत्येक में तुलना, तैयारी और प्रिंट रिपोर्ट हैं।|नमुना मार्गक्रम या ब्राउझरमध्ये जतन आहेत. प्रत्येकात तुलना, तयारी आणि प्रिंट अहवाल आहेत.
Explore all samples|सभी नमूने देखें|सर्व नमुने पाहा
Reference link; no captured requirement snapshot.|संदर्भ लिंक; आवश्यकता का स्नैपशॉट दर्ज नहीं।|संदर्भ दुवा; अटीचा स्नॅपशॉट नोंदवलेला नाही.
Review procedure|समीक्षा की प्रक्रिया|पुनरावलोकनाची प्रक्रिया
Default sample path ·|मूल नमूना रास्ता ·|मूळ नमुना मार्ग ·
Seeded planning example · authority reference:|नमूना योजना · प्राधिकरण संदर्भ:|नमुना नियोजन · प्राधिकरण संदर्भ:
Inspect reference source|संदर्भ स्रोत देखें|संदर्भ स्रोत पाहा
Sample procedure|नमूना प्रक्रिया|नमुना प्रक्रिया
steps ·|चरण ·|टप्पे ·
dependencies ·|निर्भरताएँ ·|पूर्वअटी ·
optional.|वैकल्पिक।|ऐच्छिक.
Open procedure graph|प्रक्रिया का ग्राफ़ खोलें|प्रक्रियेचा आलेख उघडा
Compare scenarios|स्थितियों की तुलना करें|परिस्थितींची तुलना करा
Run the local compiler for every supported intake combination. Check graph references, acyclicity and whether all required steps can be completed. These checks do not assess legal correctness or external AI.|हर समर्थित उत्तर संयोजन पर स्थानीय कंपाइलर चलाएँ। ग्राफ़, चक्र और चरण पूरे होने की जाँच करें। यह कानूनी सहीपन या बाहरी AI नहीं जाँचता।|प्रत्येक समर्थित उत्तर संयोजनासाठी स्थानिक कंपाइलर चालवा. आलेख, चक्र आणि टप्पे पूर्ण होण्याची तपासणी करा. हे कायदेशीर अचूकता किंवा बाह्य AI तपासत नाही.
Run graph checks|ग्राफ़ की जाँच करें|आलेखाची तपासणी करा
scenario variants checked ·|स्थिति विकल्प जाँचे ·|परिस्थितीचे पर्याय तपासले ·
Official reference links use HTTPS:|आधिकारिक संदर्भ लिंक HTTPS उपयोग करते हैं:|अधिकृत संदर्भ दुवे HTTPS वापरतात:
variants ·|विकल्प ·|पर्याय ·
No local review decisions yet. Approve or reject the synthetic food-business change to create a demo audit entry.|अभी कोई स्थानीय निर्णय नहीं। ऑडिट बनाने के लिए काल्पनिक खाद्य व्यवसाय बदलाव स्वीकार या अस्वीकार करें।|अजून स्थानिक निर्णय नाहीत. ऑडिट नोंदीसाठी काल्पनिक खाद्य व्यवसाय बदल मंजूर किंवा नामंजूर करा.
Demo events are stored only in this browser. This is not a server audit trail.|डेमो घटनाएँ केवल इसी ब्राउज़र में रहती हैं। यह सर्वर ऑडिट नहीं है।|डेमो घटना फक्त याच ब्राउझरमध्ये राहतात. हे सर्व्हर ऑडिट नाही.
Explore the sample demo|नमूना डेमो देखें|नमुना डेमो पाहा
The CivicFlow promise|CivicFlow का वादा|CivicFlow चे आश्वासन
AI can explain and organise, but never becomes the source of legal truth.|AI समझा और व्यवस्थित कर सकता है, पर कानूनी सत्य का स्रोत नहीं है।|AI समजावू आणि व्यवस्थित करू शकते, पण कायदेशीर सत्याचा स्रोत नाही.
Every procedural claim displays its evidence and verification state.|हर प्रक्रियात्मक दावा अपना साक्ष्य और सत्यापन दिखाता है।|प्रत्येक प्रक्रियेचा दावा आपला पुरावा आणि पडताळणी दाखवतो.
`;
export const phraseTranslations: Record<string, readonly [string, string]> = Object.fromEntries([rows, sampleTranslationRows, extraTranslationRows].map((part) => part.trim()).join("\n").split("\n").map((row) => { const [en, hi, mr] = row.split("|"); return [en, [hi, mr]]; }));
export function translateText(locale: Language, text: string, values: Record<string, string | number> = {}): string {
  const normalized = text.trim().replace(/\s+/g, " ");
  if (locale !== "en" && (/^https?:\/\//.test(normalized) || normalized === "Food Safety and Standards Authority of India" || normalized === "A user-written note")) return text;
  const profile = /^Demo profile: (home|commercial) premises in Mumbai; (prepare and deliver food|package food products|resell packaged goods)\. Confirm the applicable route with the official authority\.$/.exec(normalized);
  if (locale !== "en" && profile) {
    const premises = translateText(locale, profile[1] === "home" ? "Home premises in Mumbai" : "Commercial premises in Mumbai");
    const activity = translateText(locale, profile[2][0].toUpperCase() + profile[2].slice(1));
    return locale === "hi" ? `नमूने की जानकारी: ${premises}; ${activity}। संबंधित प्राधिकरण से लागू रास्ता जाँचें।` : `नमुन्याची माहिती: ${premises}; ${activity}. संबंधित प्राधिकरणाकडे लागू मार्ग तपासा.`;
  }
  const prefix = /^(Added:|Removed:|Removed from checklist:) (.+)$/.exec(normalized);
  if (locale !== "en" && prefix) return `${translateText(locale, prefix[1])} ${translateText(locale, prefix[2])}`;
  const translated = locale === "en" ? text : phraseTranslations[normalized]?.[locale === "hi" ? 0 : 1] ?? (normalized.includes(" · ") ? normalized.split(" · ").map((part) => translateText(locale, part)).join(" · ") : locale === "hi" ? `मार्गदर्शन: ${text}` : `मार्गदर्शन: ${text}`);
  return translated.replace(/\{(\w+)\}/g, (match, key: string) => String(values[key] ?? match));
}
