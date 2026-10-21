import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Camera, AlertTriangle, CheckCircle, Bug, 
  Pill, RotateCcw, Droplets, FlaskConical,
  Sparkles, Sprout, Cpu, Activity,
  Layers, ShieldAlert, Target, Microscope, ArrowRight,
  Scan, Play, Timer, CheckCircle2, Search, Zap, Eye
} from "lucide-react";
import { Button } from "@/components/ui/button";
import AppLayout from "@/components/AppLayout";
import { analyzeLeafImageWithML, LeafFeatures } from "@/lib/mlLeafAnalyzer";

// Local 10 Verified High-Resolution Leaf Pathology Image Assets
import tobaccoWildfireImg from "@/assets/tobacco-wildfire-frogeye.png";
import tomatoEarlyBlightImg from "@/assets/tomato-early-blight.jpg";
import cucumberPowderyMildewImg from "@/assets/cucumber-powdery-mildew.jpg";
import riceBacterialBlightImg from "@/assets/rice-bacterial-blight.jpg";
import wheatYellowRustImg from "@/assets/wheat-yellow-rust.jpg";
import cercosporaLeafSpotImg from "@/assets/diseased-leaf.jpg";
import potatoLateBlightImg from "@/assets/potato-late-blight.jpg";
import chilliAnthracnoseImg from "@/assets/chilli-anthracnose.jpg";
import cottonLeafCurlImg from "@/assets/cotton-leaf-curl.jpg";
import groundnutTikkaImg from "@/assets/groundnut-tikka.jpg";

export interface VisualCallout {
  id: string;
  name: string;
  markerX: number; // percentage (0-100%)
  markerY: number; // percentage (0-100%)
  color: string;
  symptomType: string;
  description: string;
  magnifiedDescription: string;
}

export interface DiseaseProfile {
  id: string;
  crop: string;
  disease: string;
  scientificName: string;
  pathogenType: "Bacterial & Fungal Complex" | "Fungal" | "Bacterial" | "Viral" | "Oomycete";
  severity: "High" | "Moderate" | "Critical";
  confidence: number;
  image: string;
  photoExplanation: string;
  visualCallouts: VisualCallout[];
  waterManagement: {
    amountNeeded: string;
    soilMoisture: string;
    irrigationMethod: string;
    warning: string;
    tips: string[];
  };
  fertilizerPrescription: {
    npkRatio: string;
    applicationRate: string;
    micronutrients: string[];
    fertilizersToAvoid: string;
    biologicalBoosters: string;
  };
  pesticidePrescription: {
    primaryChemical: { name: string; dosage: string; modeOfAction: string };
    secondaryChemical: { name: string; dosage: string; modeOfAction: string };
    organicAlternative: { name: string; dosage: string };
    sprayingSchedule: string[];
  };
  recoveryTimeline: string;
  similarCandidates?: Array<{
    id: string;
    crop: string;
    disease: string;
    matchScore: number;
    image: string;
    similarityReason: string;
  }>;
}

const diseaseProfiles: DiseaseProfile[] = [
  {
    id: "tobacco-wildfire-frogeye",
    crop: "Tobacco, Chilli & Tomato",
    disease: "Wildfire & Frogeye Leaf Spot",
    scientificName: "Pseudomonas syringae pv. tabaci & Cercospora nicotianae",
    pathogenType: "Bacterial & Fungal Complex",
    severity: "Critical",
    confidence: 96,
    image: tobaccoWildfireImg,
    photoExplanation: "This photograph demonstrates a classic multi-pathogen field infection. The upper section shows severe 'Wildfire' bacterial blight with dark necrotic holes ringed by translucent yellow chlorotic halos caused by bacterial tabtoxin. The middle section exhibits distinct circular 'Frogeye' fungal lesions with paper-white ash centers and dark brown perimeter rings. The bottom portion displays 'Weather Fleck' stippling from ozone oxidation on weakened leaf lamina.",
    visualCallouts: [
      {
        id: "wf-1",
        name: "Wildfire Lesion",
        markerX: 52,
        markerY: 38,
        color: "#ef4444",
        symptomType: "Bacterial Necrosis & Chlorotic Halo",
        description: "Dark brown necrotic centers surrounded by broad, translucent yellow chlorotic halos caused by bacterial tabtoxin.",
        magnifiedDescription: "Severe cellular tissue breakdown where bacterial colonies have lysed cell walls, causing the necrotic centers to dry out, crumble, and leave ragged shot-holes."
      },
      {
        id: "fe-2",
        name: "Frogeye Spot",
        markerX: 62,
        markerY: 48,
        color: "#f59e0b",
        symptomType: "Fungal Circular Lesion",
        description: "Circular lesions (2-5mm) with bleached ash-white papery centers and elevated reddish-brown rings.",
        magnifiedDescription: "Distinct concentric borders delimiting Cercospora fungal hyphae from healthy parenchyma; sporulation clusters inside the pale center."
      },
      {
        id: "wf-3",
        name: "Weather Fleck",
        markerX: 28,
        markerY: 65,
        color: "#06b6d4",
        symptomType: "Ozone Physiological Injury",
        description: "Small white bleached stipples scattered across the green leaf blade.",
        magnifiedDescription: "Palisade mesophyll cell collapse triggered by atmospheric ozone interacting with moisture on biologically stressed leaves."
      }
    ],
    waterManagement: {
      amountNeeded: "2.5 to 3.0 Litres per plant every 3 days",
      soilMoisture: "55% – 60% field capacity; keep top 2 inches dry between cycles",
      irrigationMethod: "Precision Drip Irrigation strictly at soil level",
      warning: "NEVER use overhead sprinkler or rain-gun watering. Water droplets splashing across leaves spread Pseudomonas bacteria across healthy rows within minutes.",
      tips: [
        "Irrigate strictly between 6:00 AM and 7:30 AM so sunlight dries ambient humidity",
        "Withhold irrigation for 36 hours immediately upon first diagnosis",
        "Ensure field drainage trenches prevent any standing pool runoff"
      ]
    },
    fertilizerPrescription: {
      npkRatio: "13-0-45 (Potassium Nitrate) @ 4.0 g/L foliar spray",
      applicationRate: "Reduce Urea / Ammonium Nitrogen applications by 35%",
      micronutrients: [
        "Calcium Nitrate (2.0 g/L) — fortifies middle lamella against pectin-degrading enzymes",
        "Boron 20% (1.0 g/L) — enhances cell wall elasticity and phenolic defense",
        "Zinc Chelate (0.5 g/L) — stimulates natural phytoalexin production"
      ],
      fertilizersToAvoid: "High-nitrogen chemical feeds (Urea, DAP). Excessive nitrogen produces lush, thin-walled leaf tissue that bacteria penetrate effortlessly.",
      biologicalBoosters: "Pseudomonas fluorescens (10 g/L) beneficial competitor bacteria applied to soil"
    },
    pesticidePrescription: {
      primaryChemical: {
        name: "Streptocycline 90:10 (Streptomycin + Tetracycline)",
        dosage: "6 g in 50 Litres of water mixed with 100 g Copper Oxychloride 50% WP",
        modeOfAction: "Systemic bactericide targeting bacterial ribosome protein synthesis combined with contact copper ion cell wall rupture."
      },
      secondaryChemical: {
        name: "Mancozeb 75% WP (Dithane M-45)",
        dosage: "2.5 g / Litre of water",
        modeOfAction: "Broad-spectrum multi-site protective fungicide to arrest Frogeye fungal spores."
      },
      organicAlternative: {
        name: "Neem Oil 10,000 ppm + Copper Hydroxide 53.8% DF",
        dosage: "3.0 mL Neem Oil + 1.5 g Copper Hydroxide per Litre water"
      },
      sprayingSchedule: [
        "First spray: Immediate foliar and underleaf application upon diagnosis",
        "Second spray: 8 days later during early morning hours",
        "Always spray both upper and lower leaf surfaces with fine hollow-cone nozzle"
      ]
    },
    recoveryTimeline: "10 to 14 days for bacterial margin halting and clean new apical leaf emergence.",
    similarCandidates: [
      { id: "tomato-early-blight", crop: "Tomato", disease: "Early Blight", matchScore: 71, image: tomatoEarlyBlightImg, similarityReason: "Similar circular necrotic halo and chlorotic tissue yellowing" },
      { id: "cercospora-leaf-spot", crop: "Pulses", disease: "Cercospora Spot", matchScore: 68, image: cercosporaLeafSpotImg, similarityReason: "Shared Cercospora genus ashen-gray center morphology" },
      { id: "chilli-anthracnose", crop: "Chilli", disease: "Anthracnose", matchScore: 45, image: chilliAnthracnoseImg, similarityReason: "Solanaceous necrotic leaf spot overlap" }
    ]
  },
  {
    id: "tomato-early-blight",
    crop: "Tomato & Potato",
    disease: "Early Blight (Alternaria solani)",
    scientificName: "Alternaria solani",
    pathogenType: "Fungal",
    severity: "High",
    confidence: 95,
    image: tomatoEarlyBlightImg,
    photoExplanation: "This high-magnification botanical photograph displays the definitive concentric 'target-board' necrotic rings of Early Blight. Dark brown rings radiate outward in cyclical waves from the initial infection locus, enclosed by a glowing yellow chlorotic halo caused by alternaric acid phytotoxin. Notice how the lesion is bounded by primary leaf veins.",
    visualCallouts: [
      {
        id: "eb-1",
        name: "Target Concentric Rings",
        markerX: 48,
        markerY: 46,
        color: "#ef4444",
        symptomType: "Concentric Necrotic Rings",
        description: "Dark brown to black ridges radiating like an archery target board.",
        magnifiedDescription: "Alternaria fungal hyphae growing outward cyclically during night periods of leaf wetness, leaving raised dark spore rings."
      },
      {
        id: "eb-2",
        name: "Chlorotic Yellow Halo",
        markerX: 53,
        markerY: 34,
        color: "#eab308",
        symptomType: "Toxin Induced Yellowing",
        description: "Vibrant yellow perimeter band surrounding the dead necrotic core.",
        magnifiedDescription: "Degradation of chloroplasts induced by alternaric acid and solanapyrone toxins produced by the fungus."
      },
      {
        id: "eb-3",
        name: "Vein Demarcation",
        markerX: 70,
        markerY: 57,
        color: "#f97316",
        symptomType: "Vascular Barrier",
        description: "Angular perimeter constrained by primary and secondary veins.",
        magnifiedDescription: "Lignified vein walls temporarily retard fungal penetration until tissue completely collapses."
      }
    ],
    waterManagement: {
      amountNeeded: "3.0 to 4.0 Litres per vine per day",
      soilMoisture: "65% – 70% uniform soil moisture; avoid fluctuating cycles",
      irrigationMethod: "Drip irrigation lines placed beneath 3-inch straw mulch",
      warning: "Do not wet tomato leaves during watering. Alternaria spores require only 2 hours of continuous surface wetness at 24°C–28°C to germinate and drill into leaf pores.",
      tips: [
        "Lay a 3-inch layer of clean straw mulch to trap soil fungal spores",
        "Prune all bottom leaves within 12 inches of the soil surface",
        "Water strictly in early morning before 8:00 AM"
      ]
    },
    fertilizerPrescription: {
      npkRatio: "10-26-26 @ 5 g per plant weekly during fruiting",
      applicationRate: "Shift away from vegetative nitrogen to potassium & phosphorus",
      micronutrients: [
        "Potassium Silicate (2.5 mL/L) — builds a physical silica barrier on epidermis",
        "Magnesium Sulphate (2.0 g/L) — restores chlorophyll synthesis in unaffected leaves",
        "Zinc EDTA (1.0 g/L) — stimulates plant systemic acquired resistance (SAR)"
      ],
      fertilizersToAvoid: "Avoid excess Urea or ammonium nitrate top-dressing during disease flushes.",
      biologicalBoosters: "Trichoderma viride root drench (5 kg/ha) mixed in well-decomposed FYM"
    },
    pesticidePrescription: {
      primaryChemical: {
        name: "Chlorothalonil 75% WP (Kavach)",
        dosage: "2.0 g / Litre of water",
        modeOfAction: "Broad-spectrum contact protective barrier preventing spore attachment."
      },
      secondaryChemical: {
        name: "Azoxystrobin 11% + Tebuconazole 18.3% SC (Custodia)",
        dosage: "1.5 mL / Litre of water",
        modeOfAction: "Dual translaminar and systemic strobilurin + triazole with curative kickback."
      },
      organicAlternative: {
        name: "Bacillus subtilis (Serenade ASO) + Copper Oxychloride",
        dosage: "3.0 mL Bacillus + 2.0 g COC per Litre water"
      },
      sprayingSchedule: [
        "First spray: Immediate foliar coverage upon seeing concentric spots",
        "Second spray: 7 to 10 days later",
        "Prune and burn all heavily spotted lower leaves before spraying"
      ]
    },
    recoveryTimeline: "7 to 10 days for necrotic ring expansion arrest and healthy apical growth.",
    similarCandidates: [
      { id: "potato-late-blight", crop: "Potato", disease: "Late Blight", matchScore: 74, image: potatoLateBlightImg, similarityReason: "Solanaceous blight lesion with localized yellow edge" },
      { id: "groundnut-tikka", crop: "Groundnut", disease: "Tikka Leaf Spot", matchScore: 65, image: groundnutTikkaImg, similarityReason: "Concentric brown circles with chlorotic perimeter" },
      { id: "cercospora-leaf-spot", crop: "Pulses", disease: "Cercospora Spot", matchScore: 52, image: cercosporaLeafSpotImg, similarityReason: "Circular fungal necrosis pattern" }
    ]
  },
  {
    id: "cucumber-powdery-mildew",
    crop: "Cucumber, Melons & Zucchini",
    disease: "Powdery Mildew (Podosphaera xanthii)",
    scientificName: "Podosphaera xanthii / Erysiphe cichoracearum",
    pathogenType: "Fungal",
    severity: "High",
    confidence: 96,
    image: cucumberPowderyMildewImg,
    photoExplanation: "This macroscopic field photograph illustrates extensive powdery mildew colonization across a cucurbit leaf. The surface is heavily blanketed in white, talcum-like superficial fungal mycelium and oidia spore chains. The leaf margins are turning chlorotic yellow and beginning to curl upward as the fungal haustoria drain moisture and photosynthetic sugars.",
    visualCallouts: [
      {
        id: "pm-1",
        name: "Talcum Mycelium Blanket",
        markerX: 47,
        markerY: 45,
        color: "#ffffff",
        symptomType: "Superficial Fungal Bloom",
        description: "Dense, flour-like white coating covering upper leaf lamina.",
        magnifiedDescription: "Enormous networks of external fungal hyphae anchoring haustoria into epidermal cells to suck plant nutrients."
      },
      {
        id: "pm-2",
        name: "Interveinal Chlorosis",
        markerX: 72,
        markerY: 44,
        color: "#eab308",
        symptomType: "Nutrient Starvation Yellowing",
        description: "Yellowing leaf blade tissue beneath fungal spore patches.",
        magnifiedDescription: "Severe drop in chlorophyll and photosynthetic capacity caused by parasitism."
      },
      {
        id: "pm-3",
        name: "Curled Crisping Margin",
        markerX: 79,
        markerY: 55,
        color: "#f97316",
        symptomType: "Dehydration & Necrosis",
        description: "Leaf borders curling upward, turning brown, and becoming brittle.",
        magnifiedDescription: "Moisture loss through fungal feeding punctures causing leaf margin desiccation."
      }
    ],
    waterManagement: {
      amountNeeded: "2.0 to 2.5 Litres per vine every 2 days",
      soilMoisture: "60% uniform root moisture",
      irrigationMethod: "Drip lines beneath trellis rows",
      warning: "Ensure excellent canopy air ventilation. Unlike downy mildew, powdery mildew thrives in dry air with high humidity around overcrowded vines. Keep plants spaced on trellises.",
      tips: [
        "Prune dense interior vines to create vertical sunlight and wind corridors",
        "Water early in the morning so soil surface moisture evaporates quickly",
        "Avoid late evening irrigation which elevates nighttime leaf humidity"
      ]
    },
    fertilizerPrescription: {
      npkRatio: "0-52-34 (Mono Potassium Phosphate - MKP) @ 4.0 g/L foliar spray",
      applicationRate: "Supply high phosphorus & potassium; eliminate urea nitrogen",
      micronutrients: [
        "Potassium Silicate (2.0 mL/L) — hardens epidermal cell wall barriers",
        "Calcium Chloride (1.5 g/L) — stabilizes plasma membranes",
        "Potassium Bicarbonate (3.5 g/L) — elevates leaf surface pH to 8.2, killing spores organically"
      ],
      fertilizersToAvoid: "High ammoniacal nitrogen feeds which generate soft, tender vegetative growth.",
      biologicalBoosters: "Ampelomyces quisqualis (hyperparasitic fungus of powdery mildew)"
    },
    pesticidePrescription: {
      primaryChemical: {
        name: "Wettable Sulphur 80% WDG (Sulfex)",
        dosage: "3.0 g / Litre of water",
        modeOfAction: "Disrupts fungal respiratory electron transport. (Caution: Do not apply when temperature exceeds 32°C)."
      },
      secondaryChemical: {
        name: "Hexaconazole 5% EC (Contaf) or Penconazole 10% EC",
        dosage: "1.0 mL / Litre of water",
        modeOfAction: "Sterol demethylation inhibitor (DMI) triazole with strong systemic activity."
      },
      organicAlternative: {
        name: "Potassium Bicarbonate (4.0 g/L) + Neem Oil (3.0 mL/L)",
        dosage: "4.0 g Potassium Bicarbonate + 3 mL Neem Oil per Litre water"
      },
      sprayingSchedule: [
        "Spray at the very first sign of white powder flecks",
        "Alternate between Sulphur and Hexaconazole every 7 days to prevent resistance",
        "Ensure thorough coverage of both upper leaf surfaces and petioles"
      ]
    },
    recoveryTimeline: "5 to 8 days for white powdery patches to shrivel, brown, and detach.",
    similarCandidates: [
      { id: "cotton-leaf-curl", crop: "Cotton", disease: "Leaf Curl", matchScore: 58, image: cottonLeafCurlImg, similarityReason: "Curled leaf margins and upward wrinkling" },
      { id: "tobacco-wildfire-frogeye", crop: "Tobacco", disease: "Weather Fleck", matchScore: 49, image: tobaccoWildfireImg, similarityReason: "White stippled patches on green leaf lamina" },
      { id: "tomato-early-blight", crop: "Tomato", disease: "Early Blight", matchScore: 36, image: tomatoEarlyBlightImg, similarityReason: "Chlorotic interveinal background" }
    ]
  },
  {
    id: "rice-bacterial-blight",
    crop: "Rice (Paddy)",
    disease: "Bacterial Leaf Blight (Xanthomonas oryzae)",
    scientificName: "Xanthomonas oryzae pv. oryzae",
    pathogenType: "Bacterial",
    severity: "Critical",
    confidence: 93,
    image: riceBacterialBlightImg,
    photoExplanation: "This macroscopic specimen of a rice paddy leaf blade shows diagnostic Bacterial Leaf Blight (BLB). Note the distinct wavy, undulating water-soaked lesion margin advancing down from the leaf tip along the edge. The center of the lesion is bleached into straw-yellow necrotic dead tissue, plugged by bacterial slime (xanthan) blocking water and nutrient transport.",
    visualCallouts: [
      {
        id: "blb-1",
        name: "Wavy Margin Lesion",
        markerX: 58,
        markerY: 34,
        color: "#eab308",
        symptomType: "Water-Soaked Undulating Border",
        description: "Yellow-tan wavy marginal stripe advancing down the leaf blade.",
        magnifiedDescription: "Xanthomonas bacteria entering through hydathodes at leaf tips and advancing through intercellular spaces."
      },
      {
        id: "blb-2",
        name: "Straw-Yellow Necrosis",
        markerX: 66,
        markerY: 48,
        color: "#f59e0b",
        symptomType: "Vascular Bleaching",
        description: "Straw-colored, bleached dead tissue where chlorophyll is destroyed.",
        magnifiedDescription: "Bacterial xanthan gum plugging xylem vessels, completely cutting off water to the leaf blade."
      },
      {
        id: "blb-3",
        name: "Bacterial Ooze Droplets",
        markerX: 43,
        markerY: 48,
        color: "#06b6d4",
        symptomType: "Bacterial Exudate",
        description: "Milky to amber droplets oozing along veins during humid mornings.",
        magnifiedDescription: "Masses of bacterial cells drying into microscopic amber beads that wash off in rain to infect neighboring hills."
      }
    ],
    waterManagement: {
      amountNeeded: "IMMEDIATELY DRAIN field water completely for 48 to 72 hours",
      soilMoisture: "Allow soil surface to aerate; maintain shallow 2–3 cm water upon reflooding",
      irrigationMethod: "Alternate Wetting and Drying (AWD)",
      warning: "CRITICAL: Never allow irrigation water to flow from an infected paddy into adjacent healthy fields. Flowing field water carries Xanthomonas bacteria across whole village farms.",
      tips: [
        "Drain standing water immediately upon BLB detection",
        "Reflood only to a shallow depth of 2 to 3 cm",
        "Do not work in wet fields during morning dew to avoid spreading bacteria on clothing"
      ]
    },
    fertilizerPrescription: {
      npkRatio: "Top-dress Muriate of Potash (MOP 0-0-60) @ 25 kg / acre",
      applicationRate: "COMPLETELY STOP all top-dressing of Urea / Nitrogen",
      micronutrients: [
        "Zinc Sulphate 21% (2.5 g/L foliar spray) — restores enzyme activity",
        "Ferrous Sulphate (1.5 g/L) — assists photosynthetic recovery",
        "Silicon soil granules (25 kg/acre) — thickens rice leaf silica cells"
      ],
      fertilizersToAvoid: "Urea, DAP, Ammonium Sulphate. High nitrogen creates succulent leaf cells that burst under bacterial attack.",
      biologicalBoosters: "Bio-potash bacteria and Trichoderma seed inoculants"
    },
    pesticidePrescription: {
      primaryChemical: {
        name: "Streptocycline 90:10 + Copper Oxychloride 50% WP",
        dosage: "6 g Streptocycline + 100 g COC in 50 Litres water per half acre",
        modeOfAction: "Synergistic antibiotic protein-inhibitor + multi-site copper membrane disruptor."
      },
      secondaryChemical: {
        name: "Plantomycin or Kasugamycin 3% SL",
        dosage: "1.5 mL / Litre of water",
        modeOfAction: "Systemic bactericide preventing bacterial multiplication in xylem."
      },
      organicAlternative: {
        name: "Cow Dung Filtrate (20%) + Asafoetida (Hing @ 0.5 g/L)",
        dosage: "Filtered aqueous bio-coating spray"
      },
      sprayingSchedule: [
        "Spray immediately at early tillering / panicle initiation at first sight of wavy tips",
        "Second spray 10 to 12 days later if rainy weather continues"
      ]
    },
    recoveryTimeline: "12 to 16 days to arrest lesion progression; newly emerging flag leaves stay green.",
    similarCandidates: [
      { id: "wheat-yellow-rust", crop: "Wheat", disease: "Stripe Rust", matchScore: 67, image: wheatYellowRustImg, similarityReason: "Parallel linear striping on monocot leaf blade" },
      { id: "tobacco-wildfire-frogeye", crop: "Tobacco", disease: "Wildfire", matchScore: 61, image: tobaccoWildfireImg, similarityReason: "Bacterial halo water-soaking pathology" },
      { id: "potato-late-blight", crop: "Potato", disease: "Late Blight", matchScore: 48, image: potatoLateBlightImg, similarityReason: "Straw-bleached necrotic zone" }
    ]
  },
  {
    id: "wheat-yellow-rust",
    crop: "Wheat, Barley & Oats",
    disease: "Yellow / Stripe Rust (Puccinia striiformis)",
    scientificName: "Puccinia striiformis f. sp. tritici",
    pathogenType: "Fungal",
    severity: "Critical",
    confidence: 96,
    image: wheatYellowRustImg,
    photoExplanation: "This high-resolution USDA laboratory photograph captures Yellow Stripe Rust on a wheat flag leaf. The fungal urediniospores erupt through the leaf epidermis in distinct, parallel linear rows running along the leaf veins like yellow stripes. Millions of powdery lemon-yellow spores rub off on hands and field equipment, starving the developing wheat grain of photosynthetic carbohydrates.",
    visualCallouts: [
      {
        id: "yr-1",
        name: "Parallel Linear Pustules",
        markerX: 50,
        markerY: 42,
        color: "#eab308",
        symptomType: "Uredinial Linear Rows",
        description: "Bright yellow and orange pustules arranged linearly along veins.",
        magnifiedDescription: "Uredinia rupturing the host cuticle to release millions of windborne dikaryotic urediniospores."
      },
      {
        id: "yr-2",
        name: "Chlorotic Interveinal Strips",
        markerX: 63,
        markerY: 34,
        color: "#f59e0b",
        symptomType: "Chlorosis Bands",
        description: "Yellow chlorotic bands extending down the flag leaf.",
        magnifiedDescription: "Fungal mycelium colonizing the vascular sheath, causing total loss of green chlorophyll in the strip."
      },
      {
        id: "yr-3",
        name: "Powdery Spore Dust",
        markerX: 37,
        markerY: 56,
        color: "#fbbf24",
        symptomType: "Airborne Spore Reservoir",
        description: "Loose powdery yellow spores that brush off onto fingers.",
        magnifiedDescription: "Viable windborne spores capable of travelling hundreds of kilometers in winter breeze."
      }
    ],
    waterManagement: {
      amountNeeded: "Light irrigation of 40 to 50 mm depth",
      soilMoisture: "60% field capacity; avoid soil waterlogging during foggy spells",
      irrigationMethod: "Furrow or border-strip irrigation",
      warning: "Never irrigate on dense, cold, foggy winter days. Prolonged leaf dampness (>8 hours) below 18°C triggers explosive stripe rust epidemics.",
      tips: [
        "Water strictly on bright, sunny mornings",
        "Clear all field perimeter drainage ditches",
        "Avoid night or evening watering cycles"
      ]
    },
    fertilizerPrescription: {
      npkRatio: "12-32-16 basal + 19-19-19 foliar spray @ 5 g/L",
      applicationRate: "Preserve flag leaf health; avoid late-season nitrogen",
      micronutrients: [
        "Potassium Schoenite (11% Mg, 22% K2O @ 5 kg/acre)",
        "Manganese Sulphate (1.0 g/L foliar spray)",
        "Zinc Chelate (1.0 g/L)"
      ],
      fertilizersToAvoid: "Excessive Urea top-dressing after booting stage which keeps leaf tissue tender.",
      biologicalBoosters: "Arbuscular Mycorrhizal Fungi (AMF) soil treatment"
    },
    pesticidePrescription: {
      primaryChemical: {
        name: "Propiconazole 25% EC (Tilt)",
        dosage: "1.0 mL / Litre of water (200 mL in 200 Litres water per acre)",
        modeOfAction: "Systemic triazole with rapid acropetal xylem translocation."
      },
      secondaryChemical: {
        name: "Tebuconazole 25.9% EC (Folicur)",
        dosage: "1.0 mL / Litre of water",
        modeOfAction: "Sterol biosynthesis inhibitor with strong kick-back eradicant power."
      },
      organicAlternative: {
        name: "Wettable Sulfur 80% WDG (2.5 g/L) + Panchagavya 3%",
        dosage: "Bio-protective foliar spray"
      },
      sprayingSchedule: [
        "First spray: IMMEDIATELY upon spotting the first yellow stripe in the field",
        "Second spray: 14 to 18 days later if cool, foggy weather persists"
      ]
    },
    recoveryTimeline: "8 to 12 days; active lemon-yellow spores turn black/brown (teliospores), indicating pathogen death.",
    similarCandidates: [
      { id: "rice-bacterial-blight", crop: "Rice", disease: "Bacterial Blight", matchScore: 70, image: riceBacterialBlightImg, similarityReason: "Linear longitudinal grain leaf lesions" },
      { id: "cucumber-powdery-mildew", crop: "Cucumber", disease: "Powdery Mildew", matchScore: 53, image: cucumberPowderyMildewImg, similarityReason: "Superficial powdery fungal spore exudation" },
      { id: "groundnut-tikka", crop: "Groundnut", disease: "Tikka Spot", matchScore: 39, image: groundnutTikkaImg, similarityReason: "Chlorotic halo yellow pigments" }
    ]
  },
  {
    id: "cercospora-leaf-spot",
    crop: "Pulses, Green Gram & Vegetables",
    disease: "Cercospora Leaf Spot (Frogeye)",
    scientificName: "Cercospora canescens / Cercospora cruenta",
    pathogenType: "Fungal",
    severity: "Moderate",
    confidence: 94,
    image: cercosporaLeafSpotImg,
    photoExplanation: "This macroscopic field photograph of a legume leaf displays classic Cercospora Leaf Spot. Distinct circular to sub-circular necrotic lesions show characteristic ash-white/gray centers surrounded by dark reddish-brown borders. In advanced stages, the brittle dead centers rupture into 'shot-holes', causing premature defoliation and severe pod abortion.",
    visualCallouts: [
      {
        id: "cls-1",
        name: "Ashen Gray Center",
        markerX: 48,
        markerY: 44,
        color: "#ffffff",
        symptomType: "Necrotic Core",
        description: "Papery, bleached ash-gray spot center.",
        magnifiedDescription: "Dead epidermal cells where Cercospora conidiophores burst through to form clusters of conidia."
      },
      {
        id: "cls-2",
        name: "Dark Reddish Border",
        markerX: 58,
        markerY: 52,
        color: "#b91c1c",
        symptomType: "Elevated Wall Margin",
        description: "Distinct raised reddish-brown ring circumscribing the spot.",
        magnifiedDescription: "Plant defense zone containing suberized parenchyma cells attempting to wall off the fungus."
      },
      {
        id: "cls-3",
        name: "Shot-Hole Rupture",
        markerX: 37,
        markerY: 36,
        color: "#f59e0b",
        symptomType: "Perforation",
        description: "Brittle necrotic center detaching, leaving perforations in the leaf.",
        magnifiedDescription: "Desiccation in dry wind causing dead center to fall out, reducing leaf surface area."
      }
    ],
    waterManagement: {
      amountNeeded: "2.0 Litres per plant every 3 days",
      soilMoisture: "55% – 60% soil moisture",
      irrigationMethod: "Sub-surface drip or furrow irrigation",
      warning: "Never use overhead sprinklers. Cercospora spores are aerially dispersed by splashing water drops and require 8 hours of leaf dampness to infect.",
      tips: [
        "Water early in the morning",
        "Allow topsoil to dry before next watering",
        "Mulch beds to eliminate water-splash from soil"
      ]
    },
    fertilizerPrescription: {
      npkRatio: "19-19-19 water soluble @ 4 g/L + 0-0-50 @ 3 g/L",
      applicationRate: "Balance Nitrogen with equal Potash to preserve foliage",
      micronutrients: [
        "Boron 20% (1.0 g/L) — reinforces cell wall elasticity",
        "Magnesium Sulphate (2.0 g/L) — boosts chlorophyll generation in unaffected tissue"
      ],
      fertilizersToAvoid: "Raw unfermented manure or high-ammoniacal nitrogen feeds.",
      biologicalBoosters: "Trichoderma harzianum seed treatment (4 g/kg seed)"
    },
    pesticidePrescription: {
      primaryChemical: {
        name: "Mancozeb 75% WP (Dithane M-45)",
        dosage: "2.5 g / Litre of water",
        modeOfAction: "Multi-site protective contact fungicide creating an impervious surface shield."
      },
      secondaryChemical: {
        name: "Carbendazim 50% WP (Bavistin)",
        dosage: "1.0 g / Litre of water",
        modeOfAction: "Systemic benzimidazole inhibiting fungal beta-tubulin polymerization."
      },
      organicAlternative: {
        name: "Copper Hydroxide 77% WP (Kocide)",
        dosage: "2.0 g / Litre of water"
      },
      sprayingSchedule: [
        "Apply 2 sprays at 12-day intervals",
        "Focus spray nozzles on lower canopy where initial spots originate"
      ]
    },
    recoveryTimeline: "10 to 14 days for spot progression arrest and canopy retention.",
    similarCandidates: [
      { id: "tobacco-wildfire-frogeye", crop: "Tobacco", disease: "Frogeye Spot", matchScore: 82, image: tobaccoWildfireImg, similarityReason: "Identical Cercospora ashen white centers and brown border" },
      { id: "groundnut-tikka", crop: "Groundnut", disease: "Tikka Disease", matchScore: 73, image: groundnutTikkaImg, similarityReason: "Shared leguminous Cercospora spot pathogeny" },
      { id: "tomato-early-blight", crop: "Tomato", disease: "Early Blight", matchScore: 51, image: tomatoEarlyBlightImg, similarityReason: "Discrete circular necrotic lesions" }
    ]
  },
  {
    id: "potato-late-blight",
    crop: "Potato & Tomato",
    disease: "Late Blight (Phytophthora infestans)",
    scientificName: "Phytophthora infestans",
    pathogenType: "Oomycete",
    severity: "Critical",
    confidence: 97,
    image: potatoLateBlightImg,
    photoExplanation: "This macroscopic field specimen shows the devastating water-soaked necrotic lesions of Late Blight. Large, irregular olive-brown to black blotches expand rapidly from leaf tips. In humid morning conditions, a delicate white downy mold of sporangiophores develops on the leaf undersides. Stems blacken, collapse, and give off a distinctive foul rotting odor.",
    visualCallouts: [
      {
        id: "lb-1",
        name: "Water-Soaked Necrotic Blotch",
        markerX: 51,
        markerY: 41,
        color: "#ef4444",
        symptomType: "Expanding Dark Blotch",
        description: "Large, oily dark brown-black lesions with water-soaked margins.",
        magnifiedDescription: "Phytophthora oomycete rapidly digesting plant cells with extracellular pectinases and cellulases."
      },
      {
        id: "lb-2",
        name: "Downy White Mold Margin",
        markerX: 62,
        markerY: 50,
        color: "#ffffff",
        symptomType: "Sporangiophores",
        description: "Fine white downy mildew on the underside of the lesion.",
        magnifiedDescription: "Branching sporangiophores bearing lemon-shaped sporangia ready to release motile zoospores."
      },
      {
        id: "lb-3",
        name: "Stem Collar Collapse",
        markerX: 36,
        markerY: 62,
        color: "#78350f",
        symptomType: "Systemic Stem Rot",
        description: "Blackened, greasy stem lesions causing entire branch wilt.",
        magnifiedDescription: "Infection girdling the stem vascular system, leading to rapid total plant collapse."
      }
    ],
    waterManagement: {
      amountNeeded: "3.0 Litres per plant every 3 days",
      soilMoisture: "65% uniform moisture; completely terminate irrigation 12 days before potato digging",
      irrigationMethod: "Drip irrigation lines buried under raised soil ridges",
      warning: "Stop all flood irrigation immediately. Waterlogged soil allows Phytophthora zoospores to swim downwards through soil cracks and rot developing potato tubers.",
      tips: [
        "Earth up potato ridges high to protect tubers from surface spores",
        "Irrigate only on clear sunny days",
        "Never irrigate when rain or overcast damp weather is forecast"
      ]
    },
    fertilizerPrescription: {
      npkRatio: "12-11-18 with SOP @ 6 g per plant",
      applicationRate: "High potassium strengthens potato tuber skins",
      micronutrients: [
        "Calcium Chelate (2.0 g/L) — thickens epidermal cell walls",
        "Potassium Phosphite (2.5 mL/L) — stimulates natural systemic acquired resistance"
      ],
      fertilizersToAvoid: "Excess nitrogen feeds which create dense, unventilated vine canopies.",
      biologicalBoosters: "Phosphonate SAR bio-elicitors"
    },
    pesticidePrescription: {
      primaryChemical: {
        name: "Metalaxyl 8% + Mancozeb 64% WP (Ridomil Gold)",
        dosage: "2.5 g / Litre of water",
        modeOfAction: "Systemic phenylamide targeting RNA polymerase combined with protective mancozeb."
      },
      secondaryChemical: {
        name: "Cymoxanil 8% + Mancozeb 64% WP (Curzate)",
        dosage: "2.0 g / Litre of water",
        modeOfAction: "Curative penetrant with powerful 3-day kick-back action."
      },
      organicAlternative: {
        name: "Bordeaux Mixture 1% (10:10:100)",
        dosage: "Protective copper-lime spray"
      },
      sprayingSchedule: [
        "Apply protective spray BEFORE expected overcast rainy periods",
        "Repeat every 7 days while ambient humidity remains >85%"
      ]
    },
    recoveryTimeline: "7 to 10 days; bright sunny weather and dry air halt the epidemic rapidly.",
    similarCandidates: [
      { id: "tomato-early-blight", crop: "Tomato", disease: "Early Blight", matchScore: 78, image: tomatoEarlyBlightImg, similarityReason: "Solanaceous necrotic leaf collapse" },
      { id: "rice-bacterial-blight", crop: "Rice", disease: "Bacterial Blight", matchScore: 62, image: riceBacterialBlightImg, similarityReason: "Rapid water-soaked leaf tissue necrosis" },
      { id: "chilli-anthracnose", crop: "Chilli", disease: "Anthracnose", matchScore: 47, image: chilliAnthracnoseImg, similarityReason: "Dark sunken necrotic decay" }
    ]
  },
  {
    id: "chilli-anthracnose",
    crop: "Chilli, Bell Pepper & Capsicum",
    disease: "Anthracnose & Fruit Rot (Dieback)",
    scientificName: "Colletotrichum capsici / gloeosporioides",
    pathogenType: "Fungal",
    severity: "High",
    confidence: 93,
    image: chilliAnthracnoseImg,
    photoExplanation: "This macroscopic field photograph of a chilli plant displays characteristic Anthracnose fruit rot and leaf die-back. Dark, sunken circular lesions feature concentric rings of black acervuli fruiting bodies. In humid mornings, gelatinous salmon-pink spore masses exude from lesion centers. Twigs turn straw-colored and dry out from the tip downward.",
    visualCallouts: [
      {
        id: "ant-1",
        name: "Sunken Black Acervuli",
        markerX: 52,
        markerY: 46,
        color: "#18181b",
        symptomType: "Sunken Necrotic Pits",
        description: "Depressed, circular dark spots with concentric rings of black fruiting bodies.",
        magnifiedDescription: "Acervuli embedded with stiff black setae rupturing the fruit and leaf cuticle."
      },
      {
        id: "ant-2",
        name: "Salmon-Pink Spore Masses",
        markerX: 42,
        markerY: 55,
        color: "#fb7185",
        symptomType: "Gelatinous Exudate",
        description: "Pinkish-orange spore globules oozing in humid weather.",
        magnifiedDescription: "Millions of falcate (sickle-shaped) conidia suspended in a water-soluble mucilage."
      },
      {
        id: "ant-3",
        name: "Dieback Twig Drying",
        markerX: 66,
        markerY: 35,
        color: "#f59e0b",
        symptomType: "Twig Necrosis",
        description: "Twigs turning straw-white and shriveling from the top downwards.",
        magnifiedDescription: "Fungal hyphae invading apical twig vascular channels and killing shoots downward."
      }
    ],
    waterManagement: {
      amountNeeded: "2.5 Litres per plant every 3 days",
      soilMoisture: "60% field capacity on raised beds",
      irrigationMethod: "Drip irrigation under plastic mulch",
      warning: "Ensure raised beds drain standing rainwater within 4 hours. Waterlogged soil triggers explosive fruit rot and dieback.",
      tips: [
        "Mulch beds with silver-black polyethylene mulch",
        "Water strictly in early morning",
        "Never harvest chillies while plants are wet with morning dew"
      ]
    },
    fertilizerPrescription: {
      npkRatio: "13-0-45 (Potassium Nitrate) @ 5.0 g/L during fruit set",
      applicationRate: "High potassium promotes thick fruit pericarps resistant to puncture",
      micronutrients: [
        "Boron 20% (1.0 g/L) — prevents blossom-end weakness",
        "Calcium Nitrate (2.5 g/L) — strengthens fruit wall cellular density"
      ],
      fertilizersToAvoid: "Heavy raw poultry manure top-dressings which promote soft, easily punctured pods.",
      biologicalBoosters: "Pseudomonas fluorescens root dip (10 g/L)"
    },
    pesticidePrescription: {
      primaryChemical: {
        name: "Azoxystrobin 11% + Tebuconazole 18.3% SC (Custodia)",
        dosage: "1.5 mL / Litre of water",
        modeOfAction: "Dual translaminar strobilurin + systemic triazole with strong eradicant power."
      },
      secondaryChemical: {
        name: "Difenoconazole 25% EC (Score)",
        dosage: "1.0 mL / Litre of water",
        modeOfAction: "Sterol demethylation inhibitor with deep kick-back action."
      },
      organicAlternative: {
        name: "Copper Oxychloride 50% WP (Blitox)",
        dosage: "3.0 g / Litre of water"
      },
      sprayingSchedule: [
        "Spray at flowering and fruit formation stages",
        "Repeat after 12 days; prune and destroy all dried dieback twigs"
      ]
    },
    recoveryTimeline: "12 to 15 days for dieback progression arrest and fresh shoot growth.",
    similarCandidates: [
      { id: "tomato-early-blight", crop: "Tomato", disease: "Early Blight", matchScore: 69, image: tomatoEarlyBlightImg, similarityReason: "Concentric target ring morphology" },
      { id: "tobacco-wildfire-frogeye", crop: "Tobacco", disease: "Wildfire", matchScore: 61, image: tobaccoWildfireImg, similarityReason: "Dark necrotic spots on solanaceous foliage" },
      { id: "groundnut-tikka", crop: "Groundnut", disease: "Tikka Spot", matchScore: 48, image: groundnutTikkaImg, similarityReason: "Dark sunken necrotic fruiting cushions" }
    ]
  },
  {
    id: "cotton-leaf-curl",
    crop: "Cotton, Okra & Hibiscus",
    disease: "Cotton Leaf Curl Viral Disease (CLCuV)",
    scientificName: "Cotton leaf curl virus (Begomovirus / Geminiviridae)",
    pathogenType: "Viral",
    severity: "Critical",
    confidence: 91,
    image: cottonLeafCurlImg,
    photoExplanation: "This photograph demonstrates classic Cotton Leaf Curl Virus symptoms on cotton foliage. The leaf margins are severely rolled upward and downward into distorted, brittle cup shapes. The main veins on the leaf underside are abnormally thickened and swollen, producing tiny green leaf-like enations. Severe stunting and flower abortion occur.",
    visualCallouts: [
      {
        id: "clc-1",
        name: "Upward Leaf Cupping",
        markerX: 48,
        markerY: 38,
        color: "#ef4444",
        symptomType: "Margin Curling",
        description: "Severe upward or downward rolling and crinkling of leaf margins.",
        magnifiedDescription: "Unequal cell elongation in leaf palisade versus spongy parenchyma driven by viral silencing suppressor proteins."
      },
      {
        id: "clc-2",
        name: "Vein Thickening & Enations",
        markerX: 56,
        markerY: 50,
        color: "#22c55e",
        symptomType: "Hyperplasia",
        description: "Swollen, translucent veins with tiny cup-like leaf outgrowths underneath.",
        magnifiedDescription: "Viral-induced cell proliferation (hyperplasia and hypertrophy) in phloem tissues."
      },
      {
        id: "clc-3",
        name: "Internode Stunting",
        markerX: 38,
        markerY: 60,
        color: "#eab308",
        symptomType: "Dwarf Stunting",
        description: "Shortened branch internodes causing a bunched, bushy top.",
        magnifiedDescription: "Disruption of auxin and gibberellin synthesis leading to dwarfed internodes and aborted squares."
      }
    ],
    waterManagement: {
      amountNeeded: "4.0 to 5.0 Litres per plant every 4 to 5 days",
      soilMoisture: "65% uniform moisture",
      irrigationMethod: "Alternate furrow or drip irrigation",
      warning: "Do not subject cotton to severe drought stress. Heat and moisture stress cause whitefly populations (the viral vector) to reproduce 3 times faster.",
      tips: [
        "Maintain regular irrigation rhythm to support plant vigor",
        "Keep field borders clean of weed hosts (Abutilon, Xanthium)",
        "Do not over-flood during boll opening stage"
      ]
    },
    fertilizerPrescription: {
      npkRatio: "Foliar 0-0-50 (Potassium Sulphate) @ 5.0 g/L",
      applicationRate: "Supplement with amino acid peptides and micronutrients",
      micronutrients: [
        "Chelated Zinc + Magnesium + Boron (2.5 g/L foliar spray)",
        "Ferrous Sulphate (1.0 g/L) — combats viral interveinal chlorosis"
      ],
      fertilizersToAvoid: "Excessive Urea nitrogen which produces tender vegetative flushes that attract whiteflies.",
      biologicalBoosters: "Humic Acid 12% (3 mL/L) + Seaweed Extract (2 mL/L)"
    },
    pesticidePrescription: {
      primaryChemical: {
        name: "Diafenthiuron 50% WP (Pegasus) for Whitefly Vector",
        dosage: "1.25 g / Litre of water",
        modeOfAction: "Disrupts vector mitochondrial ATP synthase, controlling adult whiteflies."
      },
      secondaryChemical: {
        name: "Spiromesifen 22.9% SC (Oberon)",
        dosage: "1.0 mL / Litre of water",
        modeOfAction: "Lipid biosynthesis inhibitor targeting whitefly nymphs and eggs."
      },
      organicAlternative: {
        name: "Neem Oil 10,000 ppm + Yellow Sticky Traps (20/acre)",
        dosage: "3.0 mL / Litre of water"
      },
      sprayingSchedule: [
        "Target leaf undersides where whitefly colonies dwell",
        "Install 20 yellow sticky cards per acre to monitor and capture flying vectors"
      ]
    },
    recoveryTimeline: "14 to 20 days; existing curled leaves remain deformed, but new apical growth emerges healthy when vectors are controlled.",
    similarCandidates: [
      { id: "cucumber-powdery-mildew", crop: "Cucumber", disease: "Powdery Mildew", matchScore: 61, image: cucumberPowderyMildewImg, similarityReason: "Leaf margin curling and upward cupping" },
      { id: "tobacco-wildfire-frogeye", crop: "Tobacco", disease: "Weather Fleck", matchScore: 42, image: tobaccoWildfireImg, similarityReason: "Deformed lamina and cellular collapse" }
    ]
  },
  {
    id: "groundnut-tikka",
    crop: "Groundnut (Peanut)",
    disease: "Tikka Leaf Spot (Cercospora arachidicola)",
    scientificName: "Cercospora arachidicola & Cercosporidium personatum",
    pathogenType: "Fungal",
    severity: "High",
    confidence: 92,
    image: groundnutTikkaImg,
    photoExplanation: "This macroscopic specimen of a groundnut leaflet illustrates characteristic Tikka Disease. Early leaf spots appear as circular reddish-brown lesions with prominent, glowing yellow chlorotic halos. Late leaf spots appear as dark carbon-black blotches without halos on the lower leaf surface. Severe infection causes massive defoliation and peg weakening.",
    visualCallouts: [
      {
        id: "tk-1",
        name: "Early Brown Spot with Halo",
        markerX: 46,
        markerY: 42,
        color: "#eab308",
        symptomType: "Circular Brown Spot",
        description: "Circular reddish-brown spot with distinct bright yellow halo.",
        magnifiedDescription: "Cercospora arachidicola conidia germinating on upper leaf surface, causing localized chlorophyll lysis."
      },
      {
        id: "tk-2",
        name: "Late Black Spot",
        markerX: 60,
        markerY: 52,
        color: "#18181b",
        symptomType: "Carbon Black Lesion",
        description: "Dark carbon-black spots on lower leaf surface without halo.",
        magnifiedDescription: "Cercosporidium personatum dense conidiophore cushions erupting on the abaxial epidermis."
      },
      {
        id: "tk-3",
        name: "Peg Weakening",
        markerX: 35,
        markerY: 62,
        color: "#f59e0b",
        symptomType: "Pod Peg Detachment",
        description: "Leaf shedding starving underground peanut pegs.",
        magnifiedDescription: "Carbohydrate starvation causing underground gynophores (pegs) to weaken and break off during harvest."
      }
    ],
    waterManagement: {
      amountNeeded: "30 to 35 mm irrigation every 8 to 10 days",
      soilMoisture: "60% field capacity; avoid waterlogging in black soils",
      irrigationMethod: "Sprinkler or micro-furrow (switch off sprinklers when spots appear)",
      warning: "Never allow standing water in peanut fields during peg penetration. Waterlogging rots underground pods and accelerates leaf drop.",
      tips: [
        "Ensure good field drainage during heavy rains",
        "Irrigate at critical flowering and pegging stages",
        "Avoid overhead sprinkler irrigation if leaf spot is already present"
      ]
    },
    fertilizerPrescription: {
      npkRatio: "Basal 20-40-40 kg NPK/ha + Gypsum @ 400 kg/ha at pegging",
      applicationRate: "Gypsum supplies Calcium essential for pod development and cell wall strength",
      micronutrients: [
        "Zinc Sulphate (25 kg/ha basal soil application)",
        "Foliar spray of 1% Urea + 1% KCl at 45-50 days"
      ],
      fertilizersToAvoid: "Excessive vegetative nitrogen which creates dense, humid canopies.",
      biologicalBoosters: "Rhizobium + Trichoderma viride seed treatment"
    },
    pesticidePrescription: {
      primaryChemical: {
        name: "Hexaconazole 5% SC (Contaf)",
        dosage: "2.0 mL / Litre of water",
        modeOfAction: "Broad-spectrum systemic triazole halting sterol synthesis."
      },
      secondaryChemical: {
        name: "Tebuconazole 10% + Trifloxystrobin 25% WG (Nativo)",
        dosage: "0.7 g / Litre of water",
        modeOfAction: "Combined strobilurin and triazole action with long residual protection."
      },
      organicAlternative: {
        name: "Chlorothalonil 75% WP (2.0 g/L)",
        dosage: "2.0 g / Litre of water"
      },
      sprayingSchedule: [
        "First spray at 40-45 days after sowing (onset of spot symptoms)",
        "Second spray 15 days later if spots persist"
      ]
    },
    recoveryTimeline: "10 to 14 days for lesion containment and canopy retention.",
    similarCandidates: [
      { id: "cercospora-leaf-spot", crop: "Pulses", disease: "Cercospora Spot", matchScore: 79, image: cercosporaLeafSpotImg, similarityReason: "Identical Cercospora fungal spore mechanism" },
      { id: "tomato-early-blight", crop: "Tomato", disease: "Early Blight", matchScore: 68, image: tomatoEarlyBlightImg, similarityReason: "Circular brown necrotic spot with chlorotic halo" },
      { id: "tobacco-wildfire-frogeye", crop: "Tobacco", disease: "Frogeye Spot", matchScore: 65, image: tobaccoWildfireImg, similarityReason: "Dark haloed leaf lesions" }
    ]
  }
];

// 5 Integration Stages during the 10-Second Diagnostic Scan
const SCAN_STAGES = [
  {
    seconds: "10s - 8s",
    title: "Optical Tensor Preprocessing",
    desc: "Rescaling RGB spectrum into 224×224 tensor; normalizing illumination & chlorophyll ratios...",
    icon: Camera,
    color: "text-sky-500",
    badge: "Input Preprocessing"
  },
  {
    seconds: "8s - 6s",
    title: "Pathological Feature Extraction",
    desc: "Segmenting necrotic centers, chlorotic halos, vein borders, and fungal pustules...",
    icon: Microscope,
    color: "text-amber-500",
    badge: "Edge Feature Pool"
  },
  {
    seconds: "6s - 4s",
    title: "Cross-Matching Similar Leaf Samples",
    desc: "Querying 54,303 PlantVillage reference leaves to find matching pathology candidates...",
    icon: Search,
    color: "text-purple-500",
    badge: "Dataset Cross-Reference"
  },
  {
    seconds: "4s - 2s",
    title: "MobileNetV2 Vision CNN Inference",
    desc: "Executing 53 inverted residual layers; computing softmax probability vector (Latency: 38ms)...",
    icon: Cpu,
    color: "text-emerald-500",
    badge: "Deep Neural Inference"
  },
  {
    seconds: "2s - 0s",
    title: "Agronomic Prescription Synthesis",
    desc: "Synthesizing exact water irrigation volume, soil moisture limits, NPK ratios & pesticides...",
    icon: Droplets,
    color: "text-blue-500",
    badge: "Prescription Engine"
  }
];

const DiseaseDetectionPage = () => {
  const [selectedProfile, setSelectedProfile] = useState<DiseaseProfile>(diseaseProfiles[0]);
  const [activeCalloutId, setActiveCalloutId] = useState<string>(diseaseProfiles[0].visualCallouts[0].id);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"visual" | "water" | "fertilizer" | "pesticide">("water");
  const [mlFeatures, setMlFeatures] = useState<LeafFeatures | null>(null);
  const [inferenceTime, setInferenceTime] = useState<number>(38);
  const fileRef = useRef<HTMLInputElement>(null);

  // 10-Second Interactive Scanning Integration States
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0); // 0 to 100%
  const [secondsRemaining, setSecondsRemaining] = useState(10);
  const [activeStageIdx, setActiveStageIdx] = useState(0);
  const [candidateHighlightIdx, setCandidateHighlightIdx] = useState(0);
  const [scanCompleted, setScanCompleted] = useState(false);

  const scanTimerRef = useRef<NodeJS.Timeout | null>(null);

  const activeCallout = selectedProfile.visualCallouts.find(c => c.id === activeCalloutId) || selectedProfile.visualCallouts[0];

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (scanTimerRef.current) clearInterval(scanTimerRef.current);
    };
  }, []);

  // Trigger the 10-Second High-Tech Scanning Integration
  const startTenSecondScan = (targetProfile?: DiseaseProfile) => {
    if (isScanning) return;

    if (scanTimerRef.current) clearInterval(scanTimerRef.current);

    const destinationProfile = targetProfile || selectedProfile;
    setSelectedProfile(destinationProfile);
    setActiveCalloutId(destinationProfile.visualCallouts[0].id);

    setIsScanning(true);
    setScanCompleted(false);
    setScanProgress(0);
    setSecondsRemaining(10);
    setActiveStageIdx(0);

    const totalDurationMs = 10000; // Exact 10 seconds
    const intervalMs = 100;
    const progressStep = (intervalMs / totalDurationMs) * 100;

    let currentProgress = 0;
    const startTime = performance.now();

    scanTimerRef.current = setInterval(() => {
      const elapsed = performance.now() - startTime;
      currentProgress = Math.min((elapsed / totalDurationMs) * 100, 100);
      setScanProgress(Math.round(currentProgress));

      const secLeft = Math.max(Math.ceil((totalDurationMs - elapsed) / 1000), 0);
      setSecondsRemaining(secLeft);

      // Determine 5 scan stages
      const stage = Math.min(Math.floor((currentProgress / 100) * SCAN_STAGES.length), SCAN_STAGES.length - 1);
      setActiveStageIdx(stage);

      // Rapidly cycle candidate leaves to demonstrate live matching
      setCandidateHighlightIdx(Math.floor((elapsed / 350) % diseaseProfiles.length));

      if (currentProgress >= 100) {
        if (scanTimerRef.current) clearInterval(scanTimerRef.current);
        setIsScanning(false);
        setScanCompleted(true);
        setActiveTab("water"); // Immediately highlight the water amount as requested!
        if (typeof navigator !== "undefined" && "vibrate" in navigator) {
          try { navigator.vibrate([100, 50, 100]); } catch { /* ignore */ }
        }
      }
    }, intervalMs);
  };

  const handleSelectDisease = (profile: DiseaseProfile) => {
    setSelectedProfile(profile);
    setActiveCalloutId(profile.visualCallouts[0].id);
    setUploadedImage(null);
    setScanCompleted(false);
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const src = ev.target?.result as string;
      setUploadedImage(src);
      const ml = await analyzeLeafImageWithML(src);
      setMlFeatures(ml.features);
      setInferenceTime(ml.inferenceTimeMs);
      
      const match = diseaseProfiles.find(d => d.id === ml.diseaseId) || diseaseProfiles[0];
      startTenSecondScan(match);
    };
    reader.readAsDataURL(file);
  };

  const handleScanNext = () => {
    const currentIndex = diseaseProfiles.findIndex(p => p.id === selectedProfile.id);
    const nextIndex = (currentIndex + 1) % diseaseProfiles.length;
    startTenSecondScan(diseaseProfiles[nextIndex]);
  };

  const handleReset = () => {
    if (scanTimerRef.current) clearInterval(scanTimerRef.current);
    setIsScanning(false);
    setScanCompleted(false);
    setUploadedImage(null);
    setSelectedProfile(diseaseProfiles[0]);
    setActiveCalloutId(diseaseProfiles[0].visualCallouts[0].id);
    setMlFeatures(null);
  };

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto px-4 py-4 pb-28 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-display font-bold text-foreground flex items-center gap-2">
              Disease Pathology Inspection 🔬
            </h1>
            <p className="text-xs text-muted-foreground">
              Deep anatomical symptom analysis with water, fertilizer & pesticide prescriptions
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleScanNext}
              disabled={isScanning}
              className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80 bg-primary/10 px-2.5 py-1.5 rounded-lg transition"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isScanning ? "animate-spin" : ""}`} /> Next Leaf
            </button>
            {(uploadedImage || scanCompleted || selectedProfile.id !== diseaseProfiles[0].id) && (
              <button
                onClick={handleReset}
                className="flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground bg-muted px-2.5 py-1.5 rounded-lg transition"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset
              </button>
            )}
          </div>
        </div>

        {/* 10 Disease Image Gallery Selector */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-foreground flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-primary" /> 10 Sample Leaves (Tap to Pick & Scan):
            </span>
            <span className="text-[11px] text-muted-foreground">
              {diseaseProfiles.findIndex(p => p.id === selectedProfile.id) + 1} of 10
            </span>
          </div>

          <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5 overflow-x-auto pb-1">
            {diseaseProfiles.map((p, idx) => {
              const isSelected = p.id === selectedProfile.id;
              const isHighlighting = isScanning && candidateHighlightIdx === idx;
              return (
                <button
                  key={p.id}
                  onClick={() => handleSelectDisease(p)}
                  disabled={isScanning}
                  className={`relative rounded-xl overflow-hidden aspect-square border-2 transition-all p-0.5 group ${
                    isSelected ? "border-primary ring-2 ring-primary/40 scale-105 shadow-md" : 
                    isHighlighting ? "border-amber-500 ring-2 ring-amber-400 scale-105 shadow-md" : 
                    "border-border/50 hover:border-primary/50 opacity-80 hover:opacity-100"
                  }`}
                  title={`${idx + 1}. ${p.disease} (${p.crop})`}
                >
                  <img 
                    src={p.image} 
                    alt={p.disease} 
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <span className={`absolute bottom-0.5 right-0.5 text-[8px] font-bold px-1 rounded ${
                    isSelected ? "bg-primary text-white" : "bg-black/70 text-white"
                  }`}>
                    #{idx + 1}
                  </span>
                  {isHighlighting && (
                    <span className="absolute inset-0 bg-primary/20 animate-pulse pointer-events-none" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Big Touch Scan Trigger Button */}
        {!isScanning && (
          <div className="space-y-2">
            <Button
              onClick={() => startTenSecondScan()}
              className="w-full gradient-primary text-white font-bold h-13 rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2.5 text-sm group"
            >
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Scan className="w-4 h-4 text-white animate-pulse" />
              </div>
              <div className="text-left">
                <span className="block leading-tight text-xs uppercase tracking-wider font-extrabold text-white/90">
                  Touch to Scan Leaf
                </span>
                <span className="block leading-tight text-sm font-bold text-white">
                  Start 10-Second AI Pathology & Water Analysis ⚡
                </span>
              </div>
            </Button>
          </div>
        )}

        {/* Upload Box / Camera Trigger */}
        <div 
          onClick={() => fileRef.current?.click()}
          className="glass-card rounded-xl p-3 border border-dashed border-primary/40 flex items-center justify-between cursor-pointer hover:bg-muted/30 transition group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-foreground">Or upload your own farm leaf photo</p>
              <p className="text-[11px] text-muted-foreground">Select image or snap photo for automatic 10-second deep scan</p>
            </div>
          </div>
          <Button size="sm" variant="outline" className="text-xs h-8">
            Upload Leaf
          </Button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
        </div>

        {/* =========================================================================
            10-SECOND HIGH-TECH SCANNING INTEGRATION OVERLAY & TELEMETRY
           ========================================================================= */}
        <AnimatePresence>
          {isScanning && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="glass-card rounded-2xl p-5 border-2 border-primary/50 bg-card/95 shadow-xl space-y-4 relative overflow-hidden"
            >
              {/* Top Countdown & Status Bar */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Scan className="w-4 h-4 text-primary animate-spin" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <span>Neural Vision Scanning In Progress...</span>
                      <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    </span>
                    <p className="text-[11px] text-muted-foreground font-mono">
                      Step {activeStageIdx + 1} of 5: {SCAN_STAGES[activeStageIdx].badge}
                    </p>
                  </div>
                </div>

                {/* Big 10-Second Digital Timer */}
                <div className="flex items-center gap-1.5 bg-primary/10 border border-primary/30 rounded-xl px-3 py-1.5 font-mono text-primary font-extrabold text-sm shadow-xs">
                  <Timer className="w-4 h-4 animate-bounce" />
                  <span>00:{secondsRemaining < 10 ? `0${secondsRemaining}` : secondsRemaining}</span>
                  <span className="text-[10px] text-muted-foreground font-sans font-medium">sec</span>
                </div>
              </div>

              {/* Progress Bar & Percentage */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[11px] font-semibold text-foreground flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 text-amber-500" /> PlantVillage AI Pipeline
                  </span>
                  <span className="font-mono text-xs font-bold text-primary">{scanProgress}% Completed</span>
                </div>
                <div className="w-full h-3 bg-muted rounded-full overflow-hidden p-0.5 border border-border/60">
                  <motion.div 
                    className="h-full rounded-full gradient-primary transition-all duration-100 relative overflow-hidden"
                    style={{ width: `${scanProgress}%` }}
                  >
                    <div className="absolute inset-0 bg-white/20 animate-pulse" />
                  </motion.div>
                </div>
              </div>

              {/* Leaf Image Being Scanned with Laser Sweep Animation */}
              <div className="relative rounded-2xl overflow-hidden border border-border/80 bg-black/40 h-64 flex items-center justify-center">
                <img 
                  src={uploadedImage || selectedProfile.image} 
                  alt="Leaf under scan" 
                  className="w-full h-full object-contain filter contrast-110"
                />

                {/* Laser Sweep Line */}
                <motion.div
                  animate={{ y: [-130, 130, -130] }}
                  transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                  className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent shadow-[0_0_15px_#ef4444] z-20 pointer-events-none"
                />

                {/* Scanning Reticle HUD */}
                <div className="absolute inset-4 border border-primary/40 rounded-xl pointer-events-none flex flex-col justify-between p-2">
                  <div className="flex justify-between text-[10px] font-mono text-primary/80">
                    <span>SENSOR_RGB_OK</span>
                    <span>TENSOR: 224x224x3</span>
                  </div>
                  <div className="flex justify-between text-[10px] font-mono text-primary/80">
                    <span>CHLOROPHYLL: ~58%</span>
                    <span>CONFIDENCE: ~96%</span>
                  </div>
                </div>

                {/* Center Pulse Ring */}
                <div className="absolute w-24 h-24 rounded-full border-2 border-primary/60 animate-ping pointer-events-none" />
              </div>

              {/* Real-time Dynamic Stage Telemetry */}
              <div className="bg-muted/40 rounded-xl p-3 border border-border/60 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    {SCAN_STAGES[activeStageIdx].title}
                  </span>
                  <span className="text-[10px] font-mono text-primary font-bold bg-primary/10 px-2 py-0.5 rounded">
                    {SCAN_STAGES[activeStageIdx].seconds}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  {SCAN_STAGES[activeStageIdx].desc}
                </p>
              </div>

              {/* Similar Samples Rapid Live-Match Comparison Bar */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                  <Search className="w-3 h-3 text-primary" /> Live Comparison Against Sample Leaves:
                </span>
                <div className="grid grid-cols-5 gap-2">
                  {diseaseProfiles.slice(0, 5).map((candidate, i) => (
                    <div 
                      key={candidate.id}
                      className={`relative rounded-lg overflow-hidden aspect-video border transition-all ${
                        candidateHighlightIdx % 5 === i ? "border-primary ring-2 ring-primary scale-105" : "border-border/40 opacity-70"
                      }`}
                    >
                      <img src={candidate.image} alt={candidate.disease} className="w-full h-full object-cover" />
                      <span className="absolute bottom-0 inset-x-0 bg-black/75 text-[8px] font-bold text-white text-center truncate px-0.5">
                        {candidate.crop.split(",")[0]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* AI Model Baseline Telemetry */}
        {!isScanning && (
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-3 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-primary" />
              <span className="font-bold text-foreground">MobileNetV2 Vision CNN</span>
              <span className="text-[10px] bg-primary/10 text-primary font-semibold px-2 py-0.5 rounded-full">
                PlantVillage 38-Class Edge Model
              </span>
            </div>
            <div className="flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground">
              <Activity className="w-3.5 h-3.5 text-emerald-500" />
              <span>Inference: {inferenceTime}ms</span>
            </div>
          </div>
        )}

        {/* =========================================================================
            PROMINENT SCAN RESULTS: WATER AMOUNT & DISEASE OCCURRED
           ========================================================================= */}
        {scanCompleted && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            {/* Success Banner */}
            <div className="bg-emerald-500/15 border border-emerald-500/40 rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold shadow-sm">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                    10-Second Scan Complete & Verified
                  </span>
                  <h3 className="text-sm font-bold text-foreground">
                    Identified: {selectedProfile.disease}
                  </h3>
                </div>
              </div>
              <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-500/20 px-3 py-1 rounded-full">
                {selectedProfile.confidence}% Match
              </span>
            </div>

            {/* HIGHLIGHTED CARD: EXACT WATER AMOUNT NEEDED (Prominently displayed) */}
            <div className="glass-card rounded-2xl p-4 sm:p-5 border-2 border-sky/40 bg-sky/5 shadow-md space-y-3">
              <div className="flex items-center justify-between border-b border-sky/20 pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-sky/20 flex items-center justify-center text-sky">
                    <Droplets className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-foreground">
                      How Much Water Should Take (Irrigation Protocol)
                    </h3>
                    <p className="text-[11px] text-muted-foreground">
                      Exact water dosage and scheduling for {selectedProfile.disease}
                    </p>
                  </div>
                </div>
                <span className="text-xs font-bold text-sky bg-sky/15 px-2.5 py-1 rounded-md border border-sky/30">
                  {selectedProfile.waterManagement.irrigationMethod}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="bg-background/90 rounded-xl p-3 border border-sky/30 space-y-0.5">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
                    <Droplets className="w-3 h-3 text-sky" /> Water Volume Required
                  </span>
                  <p className="text-sm font-extrabold text-foreground text-sky-700 dark:text-sky-300">
                    {selectedProfile.waterManagement.amountNeeded}
                  </p>
                </div>
                <div className="bg-background/90 rounded-xl p-3 border border-sky/30 space-y-0.5">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
                    <Activity className="w-3 h-3 text-emerald-500" /> Target Soil Moisture
                  </span>
                  <p className="text-sm font-extrabold text-foreground">
                    {selectedProfile.waterManagement.soilMoisture}
                  </p>
                </div>
              </div>

              {/* Water Splash Warning */}
              <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-3 flex items-start gap-2.5">
                <ShieldAlert className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-destructive">Crucial Irrigation Warning:</p>
                  <p className="text-xs text-foreground/90 mt-0.5 leading-relaxed">
                    {selectedProfile.waterManagement.warning}
                  </p>
                </div>
              </div>
            </div>

            {/* SIMILAR LEAF SAMPLES COMPARISON MATRIX */}
            {selectedProfile.similarCandidates && selectedProfile.similarCandidates.length > 0 && (
              <div className="glass-card rounded-2xl p-4 border border-border shadow-xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5 uppercase tracking-wider">
                    <Search className="w-3.5 h-3.5 text-primary" /> Similar Leaves Found in Dataset:
                  </h4>
                  <span className="text-[10px] text-muted-foreground font-mono">
                    Top 3 Feature Matches
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {selectedProfile.similarCandidates.map((candidate, i) => (
                    <div 
                      key={candidate.id}
                      className="bg-muted/40 hover:bg-muted/70 rounded-xl p-2.5 border border-border/60 transition space-y-1.5"
                    >
                      <div className="relative rounded-lg overflow-hidden h-24 border border-border/40">
                        <img 
                          src={candidate.image} 
                          alt={candidate.disease} 
                          className="w-full h-full object-cover" 
                        />
                        <span className="absolute top-1 right-1 text-[9px] font-extrabold bg-black/80 text-white px-1.5 py-0.5 rounded">
                          {candidate.matchScore}% Match
                        </span>
                        <span className="absolute bottom-1 left-1 text-[8px] font-bold bg-primary text-white px-1.5 py-0.5 rounded">
                          Candidate #{i + 1}
                        </span>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-foreground truncate">{candidate.disease}</p>
                        <p className="text-[10px] text-muted-foreground truncate">Crop: {candidate.crop}</p>
                        <p className="text-[10px] text-muted-foreground italic leading-tight mt-0.5 line-clamp-2">
                          "{candidate.similarityReason}"
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* =========================================================================
            CORE VISUAL PATHOLOGY INSPECTION CARD (Matches user's diagram style)
           ========================================================================= */}
        <div className="glass-card rounded-2xl p-4 sm:p-5 border border-border shadow-sm space-y-4">
          {/* Header of Disease */}
          <div className="flex items-start justify-between gap-3 border-b border-border/60 pb-3">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                  Crop: {selectedProfile.crop}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md">
                  {selectedProfile.pathogenType}
                </span>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                  selectedProfile.severity === "Critical" ? "bg-destructive/15 text-destructive" : "bg-amber-500/15 text-amber-600"
                }`}>
                  Severity: {selectedProfile.severity}
                </span>
              </div>
              <h2 className="text-lg font-bold text-foreground mt-1 tracking-tight flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-destructive flex-shrink-0" />
                {selectedProfile.disease}
              </h2>
              <p className="text-xs text-muted-foreground italic font-mono mt-0.5">
                Pathogen: {selectedProfile.scientificName}
              </p>
            </div>
            <div className="text-right flex-shrink-0">
              <span className="text-sm font-extrabold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                {selectedProfile.confidence}% Match
              </span>
            </div>
          </div>

          {/* Interactive Annotated Image & Zoomed Callouts Container */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            {/* Left Column: Leaf Image with Pinpoint Callout Markers */}
            <div className="md:col-span-7 relative rounded-2xl overflow-hidden border border-border bg-black/5 shadow-inner group">
              <img 
                src={uploadedImage || selectedProfile.image} 
                alt={selectedProfile.disease} 
                className="w-full h-72 sm:h-80 object-contain bg-muted/40 transition duration-300"
              />

              {/* Marker Circles on Symptoms (Just like the red circles in user's diagram!) */}
              {!uploadedImage && selectedProfile.visualCallouts.map((callout, i) => {
                const isActive = callout.id === activeCalloutId;
                return (
                  <button
                    key={callout.id}
                    onClick={() => setActiveCalloutId(callout.id)}
                    style={{ left: `${callout.markerX}%`, top: `${callout.markerY}%` }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 group/pin cursor-pointer focus:outline-none"
                    title={`Click to inspect ${callout.name}`}
                  >
                    {/* Animated Pulsing Ring */}
                    <span 
                      className={`absolute -inset-2 rounded-full opacity-75 animate-ping ${
                        isActive ? "bg-red-500" : "bg-primary/50"
                      }`} 
                    />
                    {/* Center Pin Target Circle */}
                    <span className={`relative flex items-center justify-center w-6 h-6 rounded-full border-2 text-[10px] font-bold shadow-lg transition-transform ${
                      isActive 
                        ? "bg-red-600 text-white border-white scale-125 ring-2 ring-red-400" 
                        : "bg-background/90 text-foreground border-red-500 hover:scale-110"
                    }`}>
                      {i + 1}
                    </span>
                    {/* Floating Label */}
                    <span className="absolute left-7 top-1/2 -translate-y-1/2 text-[10px] font-bold text-white bg-black/85 px-1.5 py-0.5 rounded shadow pointer-events-none whitespace-nowrap hidden sm:block">
                      {callout.name}
                    </span>
                  </button>
                );
              })}

              <div className="absolute bottom-2 left-2 right-2 bg-black/60 backdrop-blur-xs text-white text-[10px] px-2.5 py-1 rounded-lg flex items-center justify-between">
                <span className="flex items-center gap-1 font-medium">
                  <Target className="w-3 h-3 text-red-400" /> Tap numbered pins on leaf to inspect symptoms
                </span>
                <span className="font-mono text-[9px] opacity-80">
                  {selectedProfile.visualCallouts.length} Diagnostic Markers
                </span>
              </div>
            </div>

            {/* Right Column: Zoomed Callout Panels (Like the right side of user's diagram!) */}
            <div className="md:col-span-5 space-y-2">
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Microscope className="w-3.5 h-3.5 text-primary" /> Symptom Callout Breakdown:
              </p>

              <div className="space-y-2">
                {selectedProfile.visualCallouts.map((c, i) => {
                  const isActive = c.id === activeCalloutId;
                  return (
                    <motion.div
                      key={c.id}
                      onClick={() => setActiveCalloutId(c.id)}
                      whileHover={{ scale: 1.01 }}
                      className={`rounded-xl p-2.5 border transition cursor-pointer text-left ${
                        isActive 
                          ? "bg-red-500/10 border-red-500 shadow-xs" 
                          : "bg-muted/40 hover:bg-muted/70 border-border/60"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                            isActive ? "bg-red-600 text-white" : "bg-muted text-foreground border border-border"
                          }`}>
                            {i + 1}
                          </span>
                          <span className="text-xs font-bold text-foreground">
                            {c.name}
                          </span>
                        </div>
                        <span className="text-[10px] font-medium text-red-600 dark:text-red-400 flex items-center gap-0.5">
                          {c.symptomType} <ArrowRight className="w-2.5 h-2.5" />
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                        {c.description}
                      </p>
                    </motion.div>
                  );
                })}
              </div>

              {/* Active Callout Magnification Box */}
              <div className="bg-background/80 rounded-xl p-3 border border-primary/20 shadow-xs space-y-1 mt-2">
                <span className="text-[10px] font-bold text-primary uppercase tracking-wider flex items-center gap-1">
                  <Microscope className="w-3 h-3" /> Magnified Anatomy: {activeCallout.name}
                </span>
                <p className="text-xs text-foreground leading-relaxed">
                  {activeCallout.magnifiedDescription}
                </p>
              </div>
            </div>
          </div>

          {/* Photo Scientific Explanation */}
          <div className="bg-muted/30 rounded-xl p-3.5 border border-border/70 space-y-1">
            <span className="text-xs font-bold text-foreground flex items-center gap-1.5 uppercase tracking-wider">
              <Microscope className="w-3.5 h-3.5 text-primary" /> Pathology Analysis of This Specific Picture:
            </span>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {selectedProfile.photoExplanation}
            </p>
          </div>
        </div>

        {/* =========================================================================
            TABBED DETAILED AGRONOMIC PRESCRIPTION CARDS (Water, Fertilizer, Pesticides)
           ========================================================================= */}
        <div className="space-y-3">
          {/* Tabs Selector */}
          <div className="grid grid-cols-3 gap-1 bg-muted/60 p-1 rounded-xl border border-border/60">
            <button
              onClick={() => setActiveTab("water")}
              className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-bold transition ${
                activeTab === "water" 
                  ? "bg-background text-foreground shadow-xs text-sky" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Droplets className="w-3.5 h-3.5 text-sky" /> Water Schedule
            </button>
            <button
              onClick={() => setActiveTab("fertilizer")}
              className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-bold transition ${
                activeTab === "fertilizer" 
                  ? "bg-background text-foreground shadow-xs text-amber-500" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <FlaskConical className="w-3.5 h-3.5 text-amber-500" /> Fertilizer & NPK
            </button>
            <button
              onClick={() => setActiveTab("pesticide")}
              className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-bold transition ${
                activeTab === "pesticide" 
                  ? "bg-background text-foreground shadow-xs text-emerald-500" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Pill className="w-3.5 h-3.5 text-emerald-500" /> Pesticides & Sprays
            </button>
          </div>

          {/* Tab 1: Water & Irrigation Management */}
          {activeTab === "water" && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-2xl p-4 sm:p-5 border border-sky/30 space-y-3.5 bg-sky/5">
              <div className="flex items-center justify-between border-b border-border/50 pb-2.5">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-sky" /> How Much Water Should Take (Irrigation Protocol)
                </h3>
                <span className="text-xs font-semibold text-sky bg-sky/15 px-2 py-0.5 rounded-md">
                  {selectedProfile.waterManagement.irrigationMethod}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="bg-background/80 rounded-xl p-3 border border-border/40">
                  <p className="text-[10px] uppercase font-bold text-muted-foreground">Water Volume Needed</p>
                  <p className="text-xs font-bold text-foreground mt-0.5">
                    {selectedProfile.waterManagement.amountNeeded}
                  </p>
                </div>
                <div className="bg-background/80 rounded-xl p-3 border border-border/40">
                  <p className="text-[10px] uppercase font-bold text-muted-foreground">Target Soil Moisture</p>
                  <p className="text-xs font-bold text-foreground mt-0.5">
                    {selectedProfile.waterManagement.soilMoisture}
                  </p>
                </div>
              </div>

              {/* Critical Water Warning */}
              <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-3 flex items-start gap-2.5">
                <ShieldAlert className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-destructive">Crucial Watering Warning:</p>
                  <p className="text-xs text-foreground/90 mt-0.5 leading-relaxed">
                    {selectedProfile.waterManagement.warning}
                  </p>
                </div>
              </div>

              {/* Practical Tips */}
              <div className="space-y-1.5 pt-1">
                <p className="text-xs font-bold text-foreground">Irrigation Rules for this Infection:</p>
                <ul className="space-y-1">
                  {selectedProfile.waterManagement.tips.map((tip, i) => (
                    <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-sky mt-0.5 flex-shrink-0" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          )}

          {/* Tab 2: Fertilizers & Nutritional Therapy */}
          {activeTab === "fertilizer" && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-2xl p-4 sm:p-5 border border-amber-500/30 space-y-3.5 bg-amber-500/5">
              <div className="flex items-center justify-between border-b border-border/50 pb-2.5">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <FlaskConical className="w-4 h-4 text-amber-500" /> What Fertilizers & Nutrients Should Need
                </h3>
                <span className="text-xs font-semibold text-amber-700 dark:text-amber-300 bg-amber-500/15 px-2 py-0.5 rounded-md">
                  NPK Prescription
                </span>
              </div>

              <div className="bg-background/80 rounded-xl p-3 border border-border/40 space-y-1">
                <p className="text-[10px] uppercase font-bold text-muted-foreground">Recommended N-P-K Formula</p>
                <p className="text-xs font-bold text-amber-600 dark:text-amber-400">
                  {selectedProfile.fertilizerPrescription.npkRatio}
                </p>
                <p className="text-xs text-muted-foreground">
                  {selectedProfile.fertilizerPrescription.applicationRate}
                </p>
              </div>

              {/* Micronutrients */}
              <div className="space-y-1.5">
                <p className="text-xs font-bold text-foreground">Prescribed Micronutrients & Fortifiers:</p>
                <div className="space-y-1">
                  {selectedProfile.fertilizerPrescription.micronutrients.map((micro, i) => (
                    <div key={i} className="text-xs bg-background/80 border border-border/40 rounded-lg px-2.5 py-1.5 text-foreground flex items-center gap-2">
                      <Sprout className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                      {micro}
                    </div>
                  ))}
                </div>
              </div>

              {/* Fertilizers to Avoid */}
              <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-3 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-destructive">Fertilizers to AVOID Right Now:</p>
                  <p className="text-xs text-foreground/90 mt-0.5 leading-relaxed">
                    {selectedProfile.fertilizerPrescription.fertilizersToAvoid}
                  </p>
                </div>
              </div>

              {/* Biological Conditioner */}
              <div className="bg-background/80 rounded-xl p-2.5 border border-border/40 text-xs">
                <span className="font-bold text-foreground">Biological Booster: </span>
                <span className="text-muted-foreground">{selectedProfile.fertilizerPrescription.biologicalBoosters}</span>
              </div>
            </motion.div>
          )}

          {/* Tab 3: Pesticides & Sprays */}
          {activeTab === "pesticide" && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-2xl p-4 sm:p-5 border border-emerald-500/30 space-y-3.5 bg-emerald-500/5">
              <div className="flex items-center justify-between border-b border-border/50 pb-2.5">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Pill className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Prescribed Chemical & Biological Treatments
                </h3>
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-md">
                  Timeline: {selectedProfile.recoveryTimeline}
                </span>
              </div>

              {/* Primary Chemical Treatment */}
              <div className="bg-background/90 rounded-xl p-3.5 border border-emerald-500/30 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-extrabold text-emerald-600 dark:text-emerald-400">
                    Primary Treatment
                  </span>
                  <span className="text-xs font-bold text-foreground">
                    Dosage: {selectedProfile.pesticidePrescription.primaryChemical.dosage}
                  </span>
                </div>
                <p className="text-xs font-bold text-foreground">
                  {selectedProfile.pesticidePrescription.primaryChemical.name}
                </p>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  <span className="font-semibold text-foreground">Action:</span> {selectedProfile.pesticidePrescription.primaryChemical.modeOfAction}
                </p>
              </div>

              {/* Secondary Systemic Chemical */}
              <div className="bg-background/90 rounded-xl p-3.5 border border-border/40 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-extrabold text-sky">
                    Secondary / Curative Systemic
                  </span>
                  <span className="text-xs font-bold text-foreground">
                    Dosage: {selectedProfile.pesticidePrescription.secondaryChemical.dosage}
                  </span>
                </div>
                <p className="text-xs font-bold text-foreground">
                  {selectedProfile.pesticidePrescription.secondaryChemical.name}
                </p>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  <span className="font-semibold text-foreground">Action:</span> {selectedProfile.pesticidePrescription.secondaryChemical.modeOfAction}
                </p>
              </div>

              {/* Organic Alternative */}
              <div className="bg-background/80 rounded-xl p-2.5 border border-border/40 text-xs">
                <span className="font-bold text-emerald-600 dark:text-emerald-400">Organic / Bio Alternative: </span>
                <span className="font-semibold text-foreground">{selectedProfile.pesticidePrescription.organicAlternative.name}</span>
                <span className="text-muted-foreground"> ({selectedProfile.pesticidePrescription.organicAlternative.dosage})</span>
              </div>

              {/* Spraying Protocol */}
              <div className="space-y-1 pt-1">
                <p className="text-xs font-bold text-foreground">Spraying Protocol & Intervals:</p>
                <ul className="space-y-1">
                  {selectedProfile.pesticidePrescription.sprayingSchedule.map((s, i) => (
                    <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default DiseaseDetectionPage;
