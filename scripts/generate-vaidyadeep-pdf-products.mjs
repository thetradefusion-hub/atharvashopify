#!/usr/bin/env node
/**
 * Curate Shopify seed JSON from Firecrawl PDF parse of
 * "Vidyadeep All Combined 42 pages.pdf".
 *
 * Merges price + images from scripts/vaidyadeep-products.json when handles match.
 * Run: node scripts/generate-vaidyadeep-pdf-products.mjs
 * Then: node scripts/build-vaidyadeep-pdf-csv.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function htmlBlock({ summary, benefits = [], composition = "", dosage = "", pack = "", form = "" }) {
  const parts = [];
  if (summary) parts.push(`<p>${summary}</p>`);
  if (benefits.length) {
    parts.push(
      `<h4>Benefits</h4><ul>${benefits.map((b) => `<li>${b}</li>`).join("")}</ul>`,
    );
  }
  if (composition) parts.push(`<h4>Composition</h4><p>${composition}</p>`);
  if (dosage) parts.push(`<p><strong>Dosage:</strong> ${dosage}</p>`);
  if (pack) parts.push(`<p><strong>Available Pack:</strong> ${pack}</p>`);
  if (form) parts.push(`<p><strong>Form:</strong> ${form}</p>`);
  parts.push(
    `<p><em>Source: Vaidyadeep Ayurveda catalogue (combined PDF). Always follow label directions and physician advice. Not a substitute for medical care.</em></p>`,
  );
  return parts.join("");
}

function p({
  handle,
  title,
  description,
  benefits,
  composition,
  dosage,
  pack,
  form,
  productType,
  category,
  tags = [],
  sku,
  price = 0,
  compareAtPrice = null,
  imageUrls = [],
}) {
  return {
    handle,
    title,
    description,
    descriptionHtml: htmlBlock({
      summary: description,
      benefits,
      composition,
      dosage,
      pack,
      form,
    }),
    vendor: "Vaidyadeep Ayurveda",
    productType: productType || form || "Ayurvedic",
    sku: sku || undefined,
    tags: ["vaidyadeep", "ayurvedic", category, ...(tags || [])].filter(Boolean),
    price,
    compareAtPrice,
    available: true,
    inventoryQuantity: 50,
    netContent: pack || "",
    form: form || "",
    category: category || "",
    imageUrls,
    collections: ["all-products", category].filter(Boolean),
    source: "Vidyadeep All Combined 42 pages.pdf",
  };
}

const products = [
  p({
    handle: "deep-fungal-capsules",
    title: "Deep Fungal Capsules (Blood Purifier)",
    description:
      "Ayurvedic formula for resistant bacterial & fungal skin infections — blood purification support with Nimboli, Manjistha, Bavachi and classical rasayanas.",
    benefits: [
      "Supports management of fungal & bacterial skin infections",
      "Blood purification and detox support",
      "Useful in eczema, psoriasis-related skin concerns, acne & boils (as directed by physician)",
    ],
    composition:
      "Each 500 mg: Nimboli 50 mg, Manjistha 50 mg, Bavachi 50 mg, Chopchini 25 mg, Kala Jeera 25 mg, Haridra 25 mg, Shuddha Guggul 30 mg, Yashad Bhasma 30 mg, Ras Manikya 25 mg, Shuddha Shilajit 25 mg, Tamra Bhasma 5 mg, Triphala Guggul 60 mg, Gandhak Rasayan 50 mg, Arogyavardhini Vati 50 mg.",
    dosage: "1–2 capsules twice a day with water, or as directed by the physician.",
    pack: "60 Capsules",
    form: "Capsule",
    productType: "Capsule",
    category: "skin-care",
    tags: ["fungal", "blood-purifier", "skin"],
    sku: "VD-FUNG-060",
  }),
  p({
    handle: "deep-stone-tablet",
    title: "Deep Stone Tablet (Kidney Stone Alkalizer)",
    description:
      "Safe Ayurvedic stone crusher & alkalizer for renal calculi, UTI discomfort and uric acid related urinary issues.",
    benefits: [
      "Helps inhibit stone-forming substances",
      "Supports disintegration of calculi & crystals",
      "Relieves burning micturition & ureteric colic discomfort",
    ],
    composition:
      "Each 500 mg: Chandra Prabha Vati 35 mg, Varun Chhal 30 mg, Gokhru 78 mg, Pashanbhed 90 mg, Punarnava 65 mg, Khera beeij 27 mg, Yavkshar 56 mg, Nariken Lavan 27 mg, Shankha Bhasma 35 mg, Shwet Parpati 17 mg, Ber Patthar Bhasma 40 mg.",
    dosage: "1–2 tablets twice a day, or as directed by the physician.",
    pack: "60 Tablets",
    form: "Tablet",
    productType: "Tablet",
    category: "kidney-care",
    tags: ["kidney-stone", "uti"],
    sku: "VD-STONE-TAB-060",
  }),
  p({
    handle: "dermadeep-syrup",
    title: "Dermadeep Ayurvedic Blood Purifier Syrup",
    description:
      "Natural blood purifier syrup for clean, healthy-looking skin — supports acne, dermatitis, urticaria and blood-related skin concerns.",
    benefits: [
      "Purifies blood and supports clearer skin",
      "Improves complexion and glow",
      "Detoxification support for skin rashes & boils",
    ],
    composition:
      "Each 10 ml: Rakta Chandan 250 mg, Nimboli 200 mg, Mahamajisthadi Kwath 500 mg, Sarivadi Him 350 mg, Anant Mool 350 mg, Punarnava 350 mg, Kachnar 350 mg, Rohitak 350 mg, Mehndi 350 mg, Haldi 350 mg.",
    dosage: "10–15 ml twice a day, or as directed by the physician.",
    pack: "See label",
    form: "Syrup",
    productType: "Syrup",
    category: "skin-care",
    tags: ["dermadeep", "blood-purifier", "acne"],
    sku: "VD-DERMA-SYR",
  }),
  p({
    handle: "deep-cardio-capsules",
    title: "Deep Cardio Capsules",
    description:
      "Potent cardioprotective Ayurvedic capsules with Arjuna, Prabhakar Vati and Shilajit to support cholesterol balance and heart function.",
    benefits: [
      "Helps balance elevated cholesterol",
      "Supports heart function & circulation",
      "Cardiovascular wellness support",
    ],
    composition:
      "Each 500 mg: Prabhakar Vati 50 mg, Jawahar Mohara Rajat Yukta 50 mg, Mukta Pishti 50 mg, Shankar Vati 50 mg, Shuddha Shilajit 25 mg, Arjun extract 100 mg, Akeek Pishti 50 mg, Rudraksha 25 mg, Dhaniya 50 mg, Gorkhamundi 50 mg; processed in Adrak Ras 250 mg.",
    dosage: "1–2 capsules twice a day with milk, or as directed by the physician.",
    pack: "60 Capsules",
    form: "Capsule",
    productType: "Capsule",
    category: "heart-care",
    tags: ["cardio", "cholesterol", "arjuna"],
    sku: "VD-CARDIO-CAP-060",
  }),
  p({
    handle: "deep-cardio-syrup",
    title: "Deep Cardio Syrup",
    description:
      "Cardioprotective Ayurvedic syrup with Arjuna bark & extract, Ashwagandha, Brahmi and Shankhpushpi for heart wellness.",
    benefits: [
      "Supports healthy cholesterol levels",
      "Helps reduce angina-related discomfort intensity",
      "Supports smooth blood circulation",
    ],
    composition:
      "Each 10 ml: Arjun Chaal 1000 mg, Arjun Ext. 450 mg, Shuddha Shilajit 200 mg, Ashwagandha 300 mg, Amla 200 mg, Vach 300 mg, Akeek Pishti 200 mg, Brahmi 200 mg, Shankhpushpi 200 mg, Dhaniya 200 mg.",
    dosage: "2–4 spoons twice a day, or as directed by the physician.",
    pack: "See label",
    form: "Syrup",
    productType: "Syrup",
    category: "heart-care",
    tags: ["cardio", "syrup", "arjuna"],
    sku: "VD-CARDIO-SYR",
  }),
  p({
    handle: "deep-swans-capsules",
    title: "Deep Swans Capsules (Bronchial Relaxer)",
    description:
      "Bronchial muscle relaxer capsules for free-flow breathing — supportive in dry/productive cough, bronchial asthma and chronic bronchitis.",
    benefits: [
      "Airway mucoregulator & anti-inflammatory support",
      "Helps reduce frequency of bronchial obstruction episodes",
      "Supports freer breathing",
    ],
    composition:
      "Aak Ext. 75 mg, Dhatura Ext. 95 mg, Somlata Ext. 150 mg, Mulethi Ext. 30 mg, KakdaSingi 20 mg, Tankan Bhasma 50 mg, ShwanshKuthar 30 mg, Jahar Mohra Pishti 30 mg, Sphatik Bhasma 20 mg.",
    dosage: "2 capsules twice a day with warm water, or as directed by the physician.",
    pack: "60 Capsules",
    form: "Capsule",
    productType: "Capsule",
    category: "respiratory",
    tags: ["cough", "asthma", "bronchitis"],
    sku: "VD-SWANS-060",
  }),
  p({
    handle: "deep-stone-syrup",
    title: "Deep Stone Syrup (Kidney Care)",
    description:
      "Ayurvedic proprietary syrup for kidney stone support — Punarnava, Pashanbhed, Varun, Gokshru and classical alkalizers.",
    benefits: [
      "Supportive in kidney / ureter / bladder calculi",
      "Helps with urinary retention discomfort",
      "Renal function wellness support",
    ],
    composition:
      "Each 100 ml blend includes Punarnava 800 mg, Panchtrin Mool 800 mg, Kasni 300 mg, Makoya 250 mg, Guduchi 600 mg, Gokshru 600 mg, Varun 400 mg, Pashanbhed 500 mg, Shuddha Shilajit 300 mg, Pattharchor 300 mg, and other classical herbs (see label).",
    dosage: "2 spoons thrice a day, or as directed by the physician.",
    pack: "300 ml",
    form: "Syrup",
    productType: "Syrup",
    category: "kidney-care",
    tags: ["kidney-stone", "syrup"],
    sku: "VD-STONE-SYR-300",
  }),
  p({
    handle: "deep-cough-syrup",
    title: "Deep Cough Syrup",
    description:
      "Potent mucolytic & demulcent syrup for dry, productive and smoker’s cough, bronchitis and asthma-related cough.",
    benefits: [
      "Natural cough relief",
      "Gentle bronchodilation support",
      "Clears mucus deposits without sedative antihistamine effects",
    ],
    composition:
      "Each 10 ml: Tulsi 400 mg, Adulsa 100 mg, Yastimadhu 250 mg, Bal Haridra 200 mg, Sounth 300 mg, Kusht 100 mg, Somlata 100 mg, Kali Mirch 100 mg, Pippli 100 mg, Kachur 100 mg, and syrup base Q.S.",
    dosage: "10–15 ml twice a day with warm water, or as directed by the physician.",
    pack: "100 ml",
    form: "Syrup",
    productType: "Syrup",
    category: "respiratory",
    tags: ["cough", "cold", "bronchitis"],
    sku: "VD-COUGH-100",
  }),
  p({
    handle: "deep-thyroid-tablet",
    title: "Deep Thyroid Tablet",
    description:
      "Herbal support therapy for thyroid health — Kanchanar-based formula for goiter and subclinical hypothyroidism support.",
    benefits: [
      "Supports normal TSH balance",
      "Useful in goiter / granthi shotha concerns",
      "Thyroid wellness support",
    ],
    composition:
      "Each 275 mg: Kanchanar Chhal 110 mg, Shila Sindoor Ras 25 mg, Prawal Panchamrit 20 mg, Gandanmalakandan Ras 35 mg, Ras Manikya 10 mg, Yashad Bhasma 5 mg, Dhaniya 10 mg, Arogyavardhini 60 mg; processed in Triphala / Varun / Kher / Punarnava Mandour / Gorakhmundi kwath.",
    dosage: "1–2 tablets twice a day, or as directed by the physician.",
    pack: "60 Tablets",
    form: "Tablet",
    productType: "Tablet",
    category: "thyroid-care",
    tags: ["thyroid", "goiter"],
    sku: "VD-THY-060",
  }),
  p({
    handle: "deep-immunity-capsules",
    title: "Deep Immunity Capsules",
    description:
      "Natural immunity booster with Sahajan, Ashwagandha, Spirulina, Guduchi, Bhringaraj and Shilajit for vitality and nutritional support.",
    benefits: [
      "Boosts natural immunity",
      "Supports energy & reduces fatigue",
      "Useful in nutritional anemia & vitamin deficiency support",
    ],
    composition:
      "Each 800 mg: Sahajana 120 mg, Ashwagandha 120 mg, Yasthimadhu 100 mg, Spirulina 80 mg, Guduchi 80 mg, Bhringaraj 100 mg, Jaswant Flower 50 mg, Shuddha Shilajit 50 mg, Kounch Beej 100 mg.",
    dosage: "1–2 capsules twice a day, or as directed by the physician.",
    pack: "60 Capsules",
    form: "Capsule",
    productType: "Capsule",
    category: "immunity",
    tags: ["immunity", "vitality", "ashwagandha"],
    sku: "VD-IMM-060",
  }),
  p({
    handle: "mind-profiters-syrup",
    title: "Mind Profiters Brain Syrup",
    description:
      "Brain tonic & memory stimulant syrup with Shankhpushpi, Brahmi and Rose — for focus, memory, clarity and mental energy.",
    benefits: [
      "Enhances memory, learning & concentration",
      "Strengthens nervous system",
      "Helps manage stress-related mental fatigue",
    ],
    composition:
      "Each 10 ml: Shankhpushpi 700 mg, Brahmi 700 mg, Rose Flower 800 mg, syrup base Q.S.",
    dosage: "2–3 teaspoonfuls two to three times a day, or as directed by the physician.",
    pack: "300 ml",
    form: "Syrup",
    productType: "Syrup",
    category: "brain-care",
    tags: ["memory", "brahmi", "shankhpushpi"],
    sku: "VD-MIND-300",
  }),
  p({
    handle: "deep-hair-capsules",
    title: "Deep Hair Capsules",
    description:
      "Internal hair-nourishment capsules with Bhringraj, Triphala, Sariva and bhasmas to promote hair growth and reduce hair fall.",
    benefits: [
      "Promotes hair growth & reduces hair fall",
      "Nourishes hair from within",
      "Supports scalp & follicle health",
    ],
    composition:
      "Each 500 mg: Bhringraj Ext. 75 mg, Triphala Ext. 95 mg, Sariva 150 mg, Shankh Bhasma 20 mg, Loh Bhasma 10 mg, Ashwagandha 50 mg, Prawal Bhasma 20 mg, Mukta Shukti Bhasma 20 mg, Mandur Bhasma 10 mg, Kukkutandwak Bhasma 20 mg, Shatavari 30 mg; processed in Punarnava, Brahmi, Neem, Yashtimadhu, Giloy kwath.",
    dosage: "1–2 capsules twice a day, or as directed by the physician.",
    pack: "See label",
    form: "Capsule",
    productType: "Capsule",
    category: "skin-hair",
    tags: ["hair-fall", "bhringraj"],
    sku: "VD-HAIR-CAP",
  }),
  p({
    handle: "keshtune-ayurvedic-hair-oil",
    title: "Keshtune Ayurvedic Hair Oil",
    description: "Bhringraj & Amla for stronger, softer, silkier hair",
    benefits: [
      "Nourishes hair roots & scalp",
      "Helps reduce breakage-related hair fall",
      "Improves softness, shine and manageability",
    ],
    composition:
      "Each 10 ml: Bhringraj 700 mg, Gulab 300 mg, Amla 200 mg, Shikakai 100 mg, Neem 200 mg, Karanj 200 mg, Mehndi 25 mg, Jaswant 200 mg, Shankhpushpi 200 mg, Triphala 250 mg, Til Tail 10 ml, fragrance Q.S. For external use only.",
    dosage: "10–15 ml for scalp massage as directed; for external use only.",
    pack: "100 ml",
    form: "Oil",
    productType: "Hair Oil",
    category: "skin-hair",
    tags: ["keshtune", "hair-oil", "best-seller"],
    sku: "VD-KST-100",
  }),
  p({
    handle: "arsh-deep-capsules",
    title: "Arsh Deep Capsules (Piles Care)",
    description:
      "Herbal capsules to help stop bleeding piles discomfort, reduce pain/lumps and support anorectal wellness.",
    benefits: [
      "Helps stop bleeding & related congestion",
      "Reduces pain and lumps",
      "Supports relief in fissure & fistula-associated discomfort",
    ],
    composition:
      "Each 500 mg: Indrayav, Chitrak, Nimba, Surankand, Nagkeshar, Daruharidra, Haritaki, Kahrawa Pishti, Guggul (46 mg each), Lodhra 23 mg, and classical bhasmas; processed in Durva, Kumari, Lajjalu, Aamalki.",
    dosage: "2 capsules twice a day with buttermilk, or as directed by the physician.",
    pack: "60 Capsules",
    form: "Capsule",
    productType: "Capsule",
    category: "piles-care",
    tags: ["piles", "arsh"],
    sku: "VD-ARSH-CAP-060",
  }),
  p({
    handle: "arsh-deep-syrup",
    title: "Arsh Deep Syrup (Piles Care)",
    description:
      "Ayurvedic syrup for bleeding and acquired piles — helps reduce inflammation, arrest bleeding and prevent recurrence.",
    benefits: [
      "Arrests bleeding",
      "Reduces inflammation & pain",
      "Helps prevent recurrence of piles",
    ],
    composition:
      "Each 10 ml: Badi Harad 700 mg, Baheda 700 mg, Amla 200 mg, Surankand 700 mg, Bakyan 350 mg, Nimboli 200 mg, Sanay 700 mg, South 100 mg, Pippali 100 mg, Sounf 300 mg, Gud Q.S.",
    dosage: "10–15 ml twice a day, or as directed by the physician.",
    pack: "300 ml",
    form: "Syrup",
    productType: "Syrup",
    category: "piles-care",
    tags: ["piles", "syrup"],
    sku: "VD-ARSH-SYR-300",
  }),
  p({
    handle: "arsh-deep-ointment",
    title: "Arsh Deep Ointment",
    description:
      "Topical ointment for bleeding and non-bleeding piles, fissure and perianal lumps — stops bleeding, reduces pain, removes lumps.",
    benefits: ["Stops bleeding", "Reduces pain", "Helps shrink lumps"],
    composition:
      "Each 10 gm: Spathik Bhasma 500 mg, Shodhit Harital 125 mg, Yasad Bhasma 200 mg, Daruhaldi 300 mg, Haldi 150 mg, Neem Oil 500 mg, Karanj Oil 400 mg, Kapoor 50 mg, Cow Ghee 3 gm, Beeswax 4.275 gm.",
    dosage:
      "Apply optimum quantity over applicator to the affected area, or as directed by the physician.",
    pack: "30 gm",
    form: "Ointment",
    productType: "Ointment",
    category: "piles-care",
    tags: ["piles", "ointment", "topical"],
    sku: "VD-ARSH-OINT-30",
  }),
  p({
    handle: "deep-slim-capsules",
    title: "Deep Slim Capsules (Weight Management)",
    description:
      "Ayurvedic weight-management capsules with Medohar Guggul, Lehsun, Vai-Vidang and digestive herbs to support metabolism.",
    benefits: [
      "Supports weight control & fat metabolism",
      "Helps activate digestive fire",
      "Reduces fatigue and lethargy associated with excess weight",
    ],
    composition:
      "Each 800 mg: Shankh Vati 50 mg, Aarogyavardhini 50 mg, Triyushnadi Loh 20 mg, Medohar Guggul 75 mg, Ksheer Bilva 100 mg, Kattha 75 mg, Chitrakmool 40 mg, Triphala 50 mg, Nagarmotha 35 mg, Lehsun 100 mg, Rohitak 50 mg, Amla 25 mg, Methi 50 mg, Vai-Vidang 80 mg.",
    dosage: "1 capsule twice a day with warm water, or as directed by the physician.",
    pack: "60 Capsules",
    form: "Capsule",
    productType: "Capsule",
    category: "weight-management",
    tags: ["weight-loss", "medohar"],
    sku: "VD-SLIM-060",
  }),
  p({
    handle: "deep-bone-tablet",
    title: "Deep Bone Tablet (Osteoporosis Support)",
    description:
      "Mineral-support tablets for senile, post-menopausal and drug-induced osteoporosis — Harjod, Mukta Shukti and classical bhasmas.",
    benefits: [
      "Supports bone density",
      "Corrects mineral deficiency support",
      "Useful in osteoporosis care routines",
    ],
    composition:
      "Each 500 mg: Mukta Shukti bhasma 50 mg, Shodhit Lakh Pipal 50 mg, Shodhit Guggul 50 mg, Harjod 75 mg, Arjuna 25 mg, Shankh Bhasma 25 mg, Salai Guggul 25 mg, Amalaki 50 mg, Harsingar 50 mg, Guduchi 50 mg, Bala 50 mg; processed in Dashmool Kwath 250 mg.",
    dosage: "1–2 tablets two or three times a day, or as directed by the physician.",
    pack: "60 Tablets",
    form: "Tablet",
    productType: "Tablet",
    category: "bone-care",
    tags: ["osteoporosis", "bone"],
    sku: "VD-BONE-060",
  }),
  p({
    handle: "vedna-mukt-plus-syrup",
    title: "Vedna Mukt Plus Syrup",
    description:
      "Joint-pain relief syrup with Rasnadi Kwath, Ashwagandha, Gokharo and Bala — for osteoarthritis and inflammatory arthritis support.",
    benefits: [
      "Helps relieve joint pain",
      "Supports mobility in OA / inflammatory arthritis",
      "Useful in gouty discomfort routines",
    ],
    composition:
      "Rasnadi Kwath, Ashwagandha, Gokharo, Erandmool, Devdaru, Punarnava, South (300 mg each), Balapanchang 1000 mg, Amaltas Guda 300 mg, Nagarmotha 300 mg (per labelled serving).",
    dosage: "10–15 ml thrice a day, or as directed by the physician.",
    pack: "300 ml",
    form: "Syrup",
    productType: "Syrup",
    category: "pain-care",
    tags: ["joint-pain", "vedna-mukt"],
    sku: "VD-VEDNA-SYR-300",
  }),
  p({
    handle: "vedna-mukt-gold-capsules",
    title: "Vedna Mukt Gold Capsules",
    description:
      "Traditional herbs for pain and inflammation with Swarna Bhasma, Maha Yograj Guggul and Shallaki — for gout, back pain and musculoskeletal pain.",
    benefits: [
      "Supports pain-free movement",
      "Anti-inflammatory joint support",
      "Useful in OA/RA/ankylosing spondylitis care routines",
    ],
    composition:
      "Each 500 mg: Swarm Bhasma 1 mg, Maha Yograj Guggul 65 mg, Ajmod 65 mg, Ekanveer Ras 32.5 mg, Shuddha Shilajit 32.5 mg, Ashwagandha 19 mg, South 27 mg, Chopchini 16 mg, Shodhit Kupilu 36 mg, Shallaki 65 mg, Meetha Suranjan 19.5 mg, Erand 65 mg, and other classical ingredients.",
    dosage: "1–2 capsules twice a day with warm water, or as directed by the physician.",
    pack: "30 Capsules",
    form: "Capsule",
    productType: "Capsule",
    category: "pain-care",
    tags: ["joint-pain", "swarna", "vedna-mukt"],
    sku: "VD-VEDNA-GOLD-030",
  }),
  p({
    handle: "deep-stree-syrup",
    title: "Deep Stree Syrup (Menstrual Care)",
    description:
      "Prime agent to manage complicated menstrual cycles — Ashok, Shatavari, Lodhra based syrup for DUB, oligomenorrhea and leucorrhoea support.",
    benefits: [
      "Helps regulate menstrual cycles",
      "Reduces heavy menstrual blood loss support",
      "Useful in endometriosis-related discomfort routines",
    ],
    composition:
      "Each 10 ml: Darvyadi Kwath 200 mg, Ashok 400 mg, Shatavari 100 mg, Lodhra 100 mg, Dashmool-group herbs, Ashwagandha 200 mg, Nagkesar 200 mg, Semal chhal 200 mg, syrup base Q.S.",
    dosage: "10–15 ml twice a day, or as directed by the physician. Shake well before use.",
    pack: "300 ml",
    form: "Syrup",
    productType: "Syrup",
    category: "women-care",
    tags: ["menstrual", "ashoka", "stree"],
    sku: "VD-STREE-SYR-300",
  }),
  p({
    handle: "deep-pcos-capsules",
    title: "Deep PCOS Capsules",
    description:
      "Natural menstrual regulator capsules for PCOS/PCOD, irregular menstruation and secondary infertility support — without hormonal side effects.",
    benefits: [
      "Regularizes menstrual cycle",
      "Reduces PCOS symptoms",
      "Supports ovulation & endometrial health",
    ],
    composition:
      "Each 500 mg: Chopchini 40 mg, Pashanbhed 40 mg, Punarnava 40 mg, Vraddhi Vadika Vati 60 mg, Kanchanar Guggul 120 mg, Ras Manikya 25 mg, Saptvishanti Guggul 80 mg, Nityanand Ras 80 mg, Sarvjwarhar Loh 15 mg.",
    dosage: "1–2 capsules two times a day, or as directed by the physician.",
    pack: "See label",
    form: "Capsule",
    productType: "Capsule",
    category: "women-care",
    tags: ["pcos", "pcod", "fertility"],
    sku: "VD-PCOS-CAP",
  }),
  p({
    handle: "deep-lax",
    title: "Deep-Lax Powder",
    description:
      "Herbal digestive powder for healthy gut — effective relief from constipation and support in IBS-related bowel irregularity.",
    benefits: [
      "Effective relief from constipation",
      "Supports healthy digestive system",
      "Helps regulate bowel movement",
    ],
    composition:
      "Each 100 gm: Isabgol Bhusi 10.667 gm, Senna 10.667 gm, Haritaki 10.667 gm, Amalaki 10.667 gm, Sounf 12 gm, Sunthi 8 gm, Saindhav & Suvarchal Lavan 4 gm each, Nishotha 4 gm, Anardana 12 gm, Triphala 1.334 gm, Mishri 12 gm.",
    dosage: "1–2 teaspoonfuls with a glass of warm water at bedtime, or as directed.",
    pack: "100 gm",
    form: "Powder",
    productType: "Powder",
    category: "digestive",
    tags: ["constipation", "laxative", "ibs"],
    sku: "VD-LAX-100",
  }),
  p({
    handle: "deep-digest-syrup",
    title: "Deep Digest Syrup",
    description:
      "Digestive enzyme syrup for GERD, indigestion, heartburn and bloating — Lahsun, Triphala, Trikatu and Punarnava based.",
    benefits: [
      "Freedom from acid reflux & heartburn",
      "Balances digestion",
      "Relieves gas and bloating",
    ],
    composition:
      "Each 10 ml: Lahsun 250 mg, Harad/Baheda/Amla 100 mg each, Hing 50 mg, South/Mirch/Pipal/Ajmod/Bilva 300 mg each, Punarnava 700 mg, salts, Kali Jeera, Nagarmotha 500 mg, Pudina 200 mg, sugar Q.S.",
    dosage: "5–10 ml twice a day, or as directed by the physician.",
    pack: "300 ml",
    form: "Syrup",
    productType: "Syrup",
    category: "digestive",
    tags: ["gerd", "indigestion", "acidity"],
    sku: "VD-DIGEST-300",
  }),
  p({
    handle: "deep-liv-ds-capsules",
    title: "Deep Liv DS Capsules",
    description:
      "Enhanced liver-protection capsules with Kutki, Kalmegh, Giloy and Bhumyamalaki for fatty/alcoholic liver, jaundice and elevated SGPT/SGOT support.",
    benefits: [
      "Supports liver detoxification & cell regeneration",
      "Helps improve appetite",
      "Protects hepatic parenchyma against toxins",
    ],
    composition:
      "Kutki 60 mg, Kalmegh 60 mg, Giloy 60 mg, Bhunimbadi 40 mg, Bharangi 20 mg, Punarnava 20 mg, plus Chavya, Pipalmool, Ajwani, Vach, Amla, Haldi, Dantimool, Lahsun, Sarphonkha, Sendha Namak, Indrayan, Harad, Makoy extracts.",
    dosage: "2 capsules twice a day with buttermilk, or as directed by the physician.",
    pack: "60 Capsules",
    form: "Capsule",
    productType: "Capsule",
    category: "liver-care",
    tags: ["liver", "jaundice", "hepatitis"],
    sku: "VD-LIV-DS-060",
  }),
  p({
    handle: "deep-liv-syrup",
    title: "Deep Liv Syrup",
    description:
      "Liver protection syrup to restore normal liver functions — Kalmegh, Bhui Amla, Sarpunkha, Kutki and Bhringraj based.",
    benefits: [
      "Supports digestion & lipid metabolism in liver",
      "Helps in jaundice & pre-cirrhotic care routines",
      "Improves appetite and immunity during convalescence",
    ],
    composition:
      "Each 10 ml: Vasa 200 mg, Kalmegh 300 mg, Punarnava 226 mg, Bhui Amla 225 mg, Triphala 100 mg, Trikatu 100 mg, Sarpunkha 450 mg, Rohitak 200 mg, Daru Haridra 300 mg, Kutki 100 mg, Makoy 200 mg, Kantkari 225 mg, Bhrungraj 225 mg, and more.",
    dosage: "15–30 ml twice a day with water, or as directed. Shake well before use.",
    pack: "300 ml",
    form: "Syrup",
    productType: "Syrup",
    category: "liver-care",
    tags: ["liver", "syrup"],
    sku: "VD-LIV-SYR-300",
  }),
  p({
    handle: "deep-neuro-capsules",
    title: "Deep Neuro Capsules",
    description:
      "Comprehensive neuro-protector capsules for paralysis-related weakness, neuralgia and whole-body nerve pain support.",
    benefits: [
      "Neuro protection & nerve strength support",
      "Helps in paralysis-related care routines",
      "Supports relief from nerve pain & numbness",
    ],
    composition:
      "Each 500 mg: Shuddha Kapikacchu 40 mg, Lajwanti 15 mg, Rasna 30 mg, Khursani Ajwain 20 mg, Erandmool 15 mg, Lahsun 30 mg, Ashwagandha 15 mg, Nirgundi 15 mg, Dashmool Kwath 150 mg, Triphala 20 mg, Ras Raj Ras / Vrihatvaat Chintamani / Ekangveer / Sutshekhar / Mahayog Raj Guggul / Sameer Pannag Ras.",
    dosage: "1 capsule thrice a day with milk or lukewarm water, or as directed.",
    pack: "60 Capsules",
    form: "Capsule",
    productType: "Capsule",
    category: "neuro-care",
    tags: ["neuro", "paralysis", "nerve"],
    sku: "VD-NEURO-060",
  }),
  p({
    handle: "vedna-mukt-oil",
    title: "Vedna Mukt Pain Oil",
    description:
      "Analgesic & anti-inflammatory massage oil for joint/muscle pain, stiffness and swelling — mustard oil base with Kapoor, Menthol and classical herbs.",
    benefits: [
      "Relieves joint & muscle pain",
      "Reduces stiffness and swelling",
      "Improves local blood circulation",
    ],
    composition:
      "Aak, Indrayan Mool, Kuchla, Ashwagandha, Gokharu, Sunthi, Chitrak, Vacha, Dalchini, Punarnava, Nirgundi, Dhatura, Erandmool, Amba Haldi, Kapoor 500 mg, Menthol 350 mg, Thymol 350 mg, Methyl Salicylate 1.25 ml, Mustard Oil 8.75 ml, and more. For external use.",
    dosage: "Massage gently at the place of pain 2–3 times a day, or as directed.",
    pack: "See label",
    form: "Oil",
    productType: "Pain Oil",
    category: "pain-care",
    tags: ["massage-oil", "joint-pain", "topical"],
    sku: "VD-VEDNA-OIL",
  }),
  p({
    handle: "vedna-mukt-capsules",
    title: "Vedna Mukt Capsules (Arthritis Care)",
    description:
      "Relieves arthritis pains — Shallaki, Guggul, Meetha Suranjan and Ashwagandha to combat joint/muscle pain and morning stiffness.",
    benefits: [
      "Combats joint and muscle pains",
      "Fights morning stiffness",
      "Relaxes muscles and reduces inflammatory swelling",
    ],
    composition:
      "Each 500 mg: Shodhit Sallaki 75 mg, Alsi 34 mg, Kali Mirch 20 mg, Shunthi 20 mg, Moti Pishti 25 mg, Meetha Suranjan 65 mg, Ashwagandha 35 mg, Harshringar 45 mg, Shodhit Guggul 65 mg, Mahayograj Guggul 33.5 mg, Haridra 33.5 mg, Shuddha Kuchala 25 mg.",
    dosage: "1–2 capsules twice a day with warm water, or as directed.",
    pack: "60 Capsules",
    form: "Capsule",
    productType: "Capsule",
    category: "pain-care",
    tags: ["arthritis", "vedna-mukt"],
    sku: "VD-VEDNA-CAP-060",
  }),
  p({
    handle: "deep-stree-capsules",
    title: "Deep Stree Capsules (Women's Health)",
    description:
      "Perfect tone-up aid for women's health — Ashoka, Lodhra and Pradrantak Loh for menstrual irregularity, dysmenorrhoea and leucorrhoea.",
    benefits: [
      "Normalizes menstrual cycle & flow",
      "Antispasmodic uterine support",
      "Helps hormonal balance & ovarian function",
    ],
    composition:
      "Each 500 mg: Ashoka Ext. 100 mg, Rasanjan 40 mg, Vasa 50 mg, Lodhra 50 mg, Sphatika Bhasma 10 mg, Indrayav 30 mg, Mochras 20 mg, Pradrantak Loh 100 mg, Sangjarahat bhasma 50 mg, Abhrak bhasma 20 mg, Vansh Lochan 30 mg.",
    dosage: "1–2 capsules twice a day with fresh milk/water.",
    pack: "60 Capsules",
    form: "Capsule",
    productType: "Capsule",
    category: "women-care",
    tags: ["women", "menstrual", "leucorrhoea"],
    sku: "VD-STREE-CAP-060",
  }),
  p({
    handle: "diabetone-ds-syrup",
    title: "Diabetone DS Syrup",
    description:
      "Ayurvedic diabetes-control syrup with Gudmar, Jamun, Karela, Vijaysar, Methi and Shilajit for effective blood-sugar wellness support.",
    benefits: [
      "Supports effective diabetes control routines",
      "Helps improve insulin response",
      "Useful alongside lifestyle care for diabetic complications support",
    ],
    composition:
      "Each 10 ml includes Gudmar, Bel Phal, Methi, Triphala, Chirayata, Gulvel, Jambhul, Kutki, Halad, Neem, Karela, Shuddha Shilajit, Vijaysar, Paneer Dodi and 30+ classical herbs (see label).",
    dosage: "5–10 teaspoonfuls, 2–3 times a day, or as directed by the physician.",
    pack: "300 ml",
    form: "Syrup",
    productType: "Syrup",
    category: "diabetes-care",
    tags: ["diabetes", "gudmar", "karela"],
    sku: "VD-DIAB-SYR-300",
  }),
  p({
    handle: "diabetone-ds-capsules",
    title: "Diabetone DS Capsules",
    description:
      "Balances sugar naturally — capsules with Gudmar, Karela, Jamun, Trivang Bhasma and Shilajit for healthy insulin response support.",
    benefits: [
      "Supports healthy insulin response",
      "Helps balance blood sugar naturally",
      "Useful in diabetes care routines",
    ],
    composition:
      "Each 750 mg: Trivang Bhasma 28 mg, Kukkutantwak Bhasma 28 mg, Karela beeja 55.5 mg, Gudmar 55.5 mg, Neem/Jamun/Bilva/Amalaki/Gular/Yastimadhu/Haridra/Giloy ~28 mg each, Vijaysar 25 mg, Methi 25.73 mg; processed in Haridra, Guduchi, Amalaki, Karela juice.",
    dosage: "2 capsules twice a day with water before meal, or as directed.",
    pack: "60 Capsules",
    form: "Capsule",
    productType: "Capsule",
    category: "diabetes-care",
    tags: ["diabetes", "capsules"],
    sku: "VD-DIAB-CAP-060",
  }),
  p({
    handle: "urjas-deep-gold-plus-capsules",
    title: "Urjas Deep Gold Plus Capsules",
    description:
      "100% Ayurvedic stamina & energy capsules with Swarna Bhasma, Ashwagandha, Musli and Shilajit for men and women.",
    benefits: [
      "Improves stamina, anxiety resilience & energy",
      "Physical strength and vitality support",
      "No synthetic side-effect profile claimed — classical Ayurvedic",
    ],
    composition:
      "Each 500 mg: Swarna Bhasma 0.05 mg, Abhrak/Vang/Loh/Swarna Makshik Bhasmas, Ashwagandha 45 mg, Vidhara 45 mg, Musli 40 mg, Shuddha Shilajit 65 mg, and classical vitality herbs.",
    dosage: "1–2 capsules twice a day with creamy milk, or as directed.",
    pack: "30 Capsules",
    form: "Capsule",
    productType: "Capsule",
    category: "vitality",
    tags: ["stamina", "energy", "gold-plus"],
    sku: "VD-URJAS-CAP-030",
  }),
  p({
    handle: "urjas-deep-oil",
    title: "Urjas Deep Oil",
    description:
      "Ayurvedic topical oil with Ashwagandha, Shilajit, Akarkara and Til/Chameli tail for stamina & energy-related external care.",
    benefits: ["Stamina & energy support", "100% Ayurvedic topical formula"],
    composition:
      "Each 10 ml: Long 50 mg, Javetri 25 mg, Jaiphal 50 mg, Keshar 10 mg, Ashwagandha 400 mg, Shilajeet 100 mg, Dalchini 100 mg, Akarkara 100 mg, Malkagani 200 mg, Shuddha Kuchala 200 mg, Chameli Tail 5 ml, Til Tail 5 ml.",
    dosage: "As directed on pack / by physician. For external use as labelled.",
    pack: "30 ml",
    form: "Oil",
    productType: "Oil",
    category: "vitality",
    tags: ["stamina", "oil"],
    sku: "VD-URJAS-OIL-030",
  }),
  p({
    handle: "urjas-deep-syrup",
    title: "Urjas Deep Syrup (X-1)",
    description:
      "Strength provider & energy booster syrup with Shatavari, Gokharu, Ashwagandha, Kali Musali and Shilajit.",
    benefits: [
      "Improves stamina & energy level",
      "Aphrodisiac vitality support",
      "Supports mental wellness with physical strength",
    ],
    composition:
      "Each 10 ml: Loung/Elaichi 100 mg, Shuddha Shilajeet Paste 150 mg, Shatvari 800 mg, Gokharu 500 mg, Khajur 350 mg, Ashwagandha 400 mg, Kali Musali 400 mg, Safed Musali, Kounch, Loh & Vang Bhasma 100 mg each, and more.",
    dosage: "15–30 ml twice a day with water, or as directed by the physician.",
    pack: "300 ml",
    form: "Syrup",
    productType: "Syrup",
    category: "vitality",
    tags: ["stamina", "energy", "syrup"],
    sku: "VD-URJAS-SYR-300",
  }),
  p({
    handle: "dermadeep-oil",
    title: "Dermadeep Oil (Fungal Skin Care)",
    description:
      "Ultimate topical combination to clear fungal infections with inflammatory manifestations — Neem, Karanj, Bavchi and classical medicated oils.",
    benefits: [
      "Relieves skin itching",
      "Treats fungal infections effectively",
      "Useful in psoriasis, eczema, dermatitis & secondary infections",
    ],
    composition:
      "Bavchi Oil 0.5 ml, Neem Oil 1.5 ml, Jatyadi Oil 0.5 ml, Nariyal Oil 2.0 ml, Kapoor Oil 0.5 ml, Chandan Oil 0.5 ml, Mahamarichyadi Oil 2.0 ml, Charmrog Nashak Oil 0.5 ml, Karanj Oil 1.5 ml, Kokam Oil 0.5 ml. For external use only.",
    dosage: "Apply on affected skin as directed. For external use only.",
    pack: "See label",
    form: "Oil",
    productType: "Oil",
    category: "skin-care",
    tags: ["fungal", "eczema", "psoriasis", "topical"],
    sku: "VD-DERMA-OIL",
  }),
  p({
    handle: "kumkumadi-glow-face-oil",
    title: "Kumkumadi Glow Face Oil",
    description: "Saffron-rich Ayurvedic oil for radiant, even-toned skin",
    benefits: [
      "Brightens and evens skin tone",
      "Nourishes and hydrates deeply",
      "Helps reduce blemishes, acne scars and pigmentation",
    ],
    composition: "Each 10 ml: Kumkumadi Oil (AFI Part-I) 10 ml. Suitable for all skin types.",
    dosage: "Apply 2–6 drops on face, neck and massage gently; leave 2–3 hours or overnight.",
    pack: "30 ml",
    form: "Oil",
    productType: "Face Oil",
    category: "skin-hair",
    tags: ["kumkumadi", "face-oil", "best-seller"],
    sku: "VD-KUM-030",
  }),
  p({
    handle: "balbuddhi-swarnaprashan",
    title: "Balbuddhi Swarnaprashan",
    description: "Ayurvedic immunity and memory booster drops for kids.",
    benefits: [
      "Boosts immune system",
      "Sharpens memory & mental health",
      "Improves digestion & appetite",
      "Enhances skin tone & overall vitality",
    ],
    composition:
      "Each 10 ml: Swarna Bhasma 7 mg, Brahmi 1 gm, Shankhpushpi 1 mg, Vacha 2 gm, Baheda 9 gm, Guduchi Satwa 10 mg, Saffron 8 mg, Cow Ghee 162 mg, Honey 200 mg, syrup base Q.S.",
    dosage: "0–5 yrs: 1 drop; 5–10 yrs: 2 drops; 10–16 yrs: 3 drops daily (or as directed).",
    pack: "See label",
    form: "Drops",
    productType: "Drops",
    category: "immunity",
    tags: ["kids", "swarnaprashan", "best-seller"],
    sku: "VD-SWARN-030",
  }),
  p({
    handle: "himalayan-shilajit-gold-plus-resin",
    title: "Himalayan Shilajit Gold Plus Resin",
    description: "Himalayan resin with Ashwagandha for stamina & energy",
    benefits: [
      "Increases stamina & performance",
      "Pre & post workout energy",
      "Supports hormonal balance, mood and metabolism",
    ],
    composition:
      "Shilajit 350 mg, Coffee Extract 150 mg, Ashwagandha extract 150 mg, Gokshura extract 100 mg, Haldi extract 50 mg, Kali musli extract 50 mg, Elaichi oil 10 mg, Swarna Bhasma 0.50 mg, excipients Q.S. Net qty 20 g.",
    dosage: "Take a grain-sized amount (200–300 mg) daily as directed.",
    pack: "20 gm",
    form: "Resin",
    productType: "Resin",
    category: "vitality",
    tags: ["shilajit", "stamina", "best-seller"],
    sku: "VD-SHJ-020",
  }),
];

// Merge website scrape prices + images when handles match
const webPath = path.join(__dirname, "vaidyadeep-products.json");
if (fs.existsSync(webPath)) {
  const web = JSON.parse(fs.readFileSync(webPath, "utf-8"));
  const byHandle = Object.fromEntries((web.products || []).map((x) => [x.handle, x]));
  for (const prod of products) {
    const w = byHandle[prod.handle];
    if (!w) continue;
    if (w.price) prod.price = w.price;
    if (w.compareAtPrice) prod.compareAtPrice = w.compareAtPrice;
    if (w.imageUrls?.length) prod.imageUrls = w.imageUrls;
    if (w.descriptionHtml) prod.descriptionHtml = w.descriptionHtml;
    if (w.sku) prod.sku = w.sku;
    prod.tags = [...new Set([...(prod.tags || []), ...(w.tags || [])])];
  }
}

const collections = [
  {
    handle: "all-products",
    title: "All Products",
    description: "Full Vaidyadeep catalogue from combined PDF + web scrape.",
  },
  { handle: "skin-care", title: "Skin Care", description: "Blood purifiers, fungal & dermal oils." },
  { handle: "skin-hair", title: "Skin & Hair", description: "Hair oils, face oils, hair capsules." },
  { handle: "kidney-care", title: "Kidney Care", description: "Stone tablets and syrups." },
  { handle: "heart-care", title: "Heart Care", description: "Cardioprotective capsules and syrups." },
  { handle: "respiratory", title: "Respiratory", description: "Cough, asthma and bronchial care." },
  { handle: "thyroid-care", title: "Thyroid Care", description: "Thyroid support tablets." },
  { handle: "immunity", title: "Immunity", description: "Immunity boosters and Swarnaprashan." },
  { handle: "brain-care", title: "Brain Care", description: "Memory and focus tonics." },
  { handle: "piles-care", title: "Piles Care", description: "Arsh Deep range." },
  {
    handle: "weight-management",
    title: "Weight Management",
    description: "Slimming and metabolism support.",
  },
  { handle: "bone-care", title: "Bone Care", description: "Osteoporosis mineral support." },
  { handle: "pain-care", title: "Pain Care", description: "Vedna Mukt oils, syrups and capsules." },
  { handle: "women-care", title: "Women Care", description: "Menstrual, PCOS and uterine health." },
  { handle: "digestive", title: "Digestive", description: "Deep-Lax and digestive syrups." },
  { handle: "liver-care", title: "Liver Care", description: "Deep Liv DS range." },
  { handle: "neuro-care", title: "Neuro Care", description: "Neuro protector capsules." },
  { handle: "diabetes-care", title: "Diabetes Care", description: "Diabetone DS range." },
  { handle: "vitality", title: "Vitality", description: "Shilajit, Urjas Deep and stamina support." },
];

const out = {
  _comment:
    "Curated from Firecrawl parse of 'Vidyadeep All Combined 42 pages.pdf' (42 pages). Prices/images merged from website scrape where handles match. Products with price 0 are Status=draft in CSV — set MRP before publishing.",
  sourcePdf: "Vidyadeep All Combined 42 pages.pdf",
  sourceWeb: "https://vaidyadeepayurveda.com/products",
  collections,
  products,
};

const outPath = path.join(__dirname, "vaidyadeep-pdf-products.json");
fs.writeFileSync(outPath, JSON.stringify(out, null, 2));
console.log(`✓ Wrote ${outPath}`);
console.log(`  ${products.length} products, ${collections.length} collections`);
const priced = products.filter((x) => x.price > 0).length;
const imaged = products.filter((x) => x.imageUrls?.length).length;
console.log(`  With website price: ${priced}, with images: ${imaged}`);
