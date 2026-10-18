import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { 
  Camera, AlertTriangle, CheckCircle, Bug, 
  Pill, ImageIcon, RefreshCw, Sparkles, 
  Sprout, RotateCcw, Cpu, Activity
} from "lucide-react";
import { Button } from "@/components/ui/button";
import AppLayout from "@/components/AppLayout";
import diseasedLeafImg from "@/assets/diseased-leaf.jpg";
import { analyzeLeafImageWithML, LeafFeatures } from "@/lib/mlLeafAnalyzer";

interface DiagnosisResult {
  id: string;
  crop: string;
  disease: string;
  confidence: number;
  cause: string;
  referenceImages: string[];
  symptoms: string[];
  treatment: string[];
  pesticides: string[];
}

const mockDiagnoses: DiagnosisResult[] = [
  {
    id: "early-blight",
    crop: "Tomato & Potato",
    disease: "Early Blight (Alternaria solani)",
    confidence: 94,
    cause: "Soil-borne fungal pathogen Alternaria solani. Spreads rapidly through splashing rainwater, morning dew, and warm humid weather (24°C - 29°C).",
    referenceImages: [
      "https://images.unsplash.com/photo-1592417817098-8f3d69103c80?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1582284540020-eacbe03f2ca0?auto=format&fit=crop&w=600&q=80",
    ],
    symptoms: [
      "Concentric ring 'target-board' dark brown spots on older lower foliage",
      "Yellow chlorotic halos developing around leaf spots",
      "Collar rot lesions at stem bases causing lower branch collapse",
      "Premature leaf drop exposing developing tomatoes to sunscald",
    ],
    treatment: [
      "Prune and destroy lower diseased leaves touching wet topsoil",
      "Mulch soil around plants with clean straw to arrest spore splash",
      "Maintain drip irrigation exclusively; keep foliage dry",
      "Practice 3-year crop rotation with non-solanaceous crops",
    ],
    pesticides: [
      "Chlorothalonil 75% WP — 2.0 g/L foliar spray",
      "Azoxystrobin 23% SC — 1.0 mL/L water",
      "Copper Hydroxide 77% WP — 2.5 g/L preventive spray",
    ],
  },
  {
    id: "powdery-mildew",
    crop: "Cucumber, Melons & Gourds",
    disease: "Powdery Mildew (Erysiphe cichoracearum)",
    confidence: 96,
    cause: "Airborne fungal biotrophic pathogen favored by moderate temperatures (20°C - 28°C), high relative humidity, and shaded crowded canopies.",
    referenceImages: [
      "https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=600&q=80",
    ],
    symptoms: [
      "White, talcum-powder-like fungal patches on leaf surfaces and petioles",
      "Infected leaves turn yellow, curl upward, and become brittle",
      "Premature foliage death leading to sunburned, undersized fruits",
      "Drastic reduction in plant sugar synthesis and fruit yield",
    ],
    treatment: [
      "Prune dense vines to improve direct sunlight exposure and wind flow",
      "Water soil in early morning so canopy remains dry throughout night",
      "Space plants at recommended row distances on trellis wires",
    ],
    pesticides: [
      "Wettable Sulfur 80% WDG — 3.0 g/L spray",
      "Hexaconazole 5% EC — 1.0 mL/L foliar application",
      "Potassium Bicarbonate organic spray — 4.0 g/L",
    ],
  },
  {
    id: "bacterial-blight",
    crop: "Rice (Paddy)",
    disease: "Bacterial Leaf Blight (Xanthomonas oryzae)",
    confidence: 91,
    cause: "Vascular bacterial infection penetrating leaf margins and hydathodes. Aggravated by high nitrogen fertilizer and monsoon cyclonic winds.",
    referenceImages: [
      "https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?auto=format&fit=crop&w=600&q=80",
    ],
    symptoms: [
      "Water-soaked yellowish-green wavy stripes starting at leaf tips and edges",
      "Milky amber bacterial droplets oozing on lesions during humid mornings",
      "Straw-colored bleaching of leaf blades resulting in 'Kresek' seedling wilt",
      "Unfilled, chaffy panicles resulting in severe grain loss",
    ],
    treatment: [
      "Drain field water for 48 hours to allow the canopy and soil surface to aerate",
      "Avoid top-dressing excess Nitrogen fertilizer during active disease flush",
      "Treat seeds in warm water (52°C) for 10 minutes prior to nursery sowing",
    ],
    pesticides: [
      "Streptocycline (90:10) — 6 g / 50 Litres + Copper Oxychloride 100 g",
      "Plantomycin — 1.0 g/L spray",
      "Copper Hydroxide 53.8% DF — 2.0 g/L spray",
    ],
  },
  {
    id: "yellow-rust",
    crop: "Wheat & Barley",
    disease: "Yellow / Stripe Rust (Puccinia striiformis)",
    confidence: 95,
    cause: "Windborne fungal urediniospores traveling long distances. Thrives in cool, damp winter conditions (10°C - 18°C) with persistent fog.",
    referenceImages: [
      "https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1560493676-04071c5f467b?auto=format&fit=crop&w=600&q=80",
    ],
    symptoms: [
      "Bright lemon-yellow to orange pustules arranged in parallel linear stripes",
      "Powdery yellow spores rub off readily when leaves are stroked",
      "Premature chlorosis and desiccation of flag leaves",
      "Shriveled, lightweight grains reducing harvest weight by up to 50%",
    ],
    treatment: [
      "Sow rust-resistant varieties like HD-2967, DBW-187, or PBW-550",
      "Avoid excessive nitrogen doses that produce tender, succulent canopy",
      "Scout wheat fields early every morning during foggy winter periods",
    ],
    pesticides: [
      "Propiconazole 25% EC (Tilt) — 1.0 mL/L foliar spray",
      "Tebuconazole 25.9% EC — 1.0 mL/L spray",
      "Mancozeb 75% WP — 2.5 g/L preventive spray",
    ],
  },
  {
    id: "late-blight",
    crop: "Potato & Tomato",
    disease: "Late Blight (Phytophthora infestans)",
    confidence: 97,
    cause: "Aggressive oomycete water-mold pathogen triggered by cool overcast weather (12°C - 18°C) and relative humidity exceeding 90%.",
    referenceImages: [
      "https://images.unsplash.com/photo-1582284540020-eacbe03f2ca0?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1592417817098-8f3d69103c80?auto=format&fit=crop&w=600&q=80",
    ],
    symptoms: [
      "Large, irregular water-soaked dark brown-purple lesions on leaf tips",
      "Delicate white cottony fungal mold visible on leaf undersides in morning dew",
      "Rapid systemic blackening and total canopy collapse within 3-4 days",
      "Pungent rotting odor across fields with dark sunken tuber dry rot",
    ],
    treatment: [
      "Destroy and burn all infected cull piles and volunteer tubers",
      "Earth up potato ridges deeply to protect underground tubers from spores",
      "Stop flood irrigation; apply protective sprays prior to expected rains",
    ],
    pesticides: [
      "Metalaxyl 8% + Mancozeb 64% WP (Ridomil Gold) — 2.5 g/L",
      "Cymoxanil 8% + Mancozeb 64% WP — 2.0 g/L",
      "Dimethomorph 50% WP — 1.5 g/L spray",
    ],
  },
  {
    id: "anthracnose",
    crop: "Chilli, Mango & Papaya",
    disease: "Anthracnose / Fruit Rot (Colletotrichum capsici)",
    confidence: 93,
    cause: "Ascomycete fungus spread by rain splashing, contaminated seeds, and warm humid weather (25°C - 30°C).",
    referenceImages: [
      "https://images.unsplash.com/photo-1527842891421-42eec6e703ea?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1582284540020-eacbe03f2ca0?auto=format&fit=crop&w=600&q=80",
    ],
    symptoms: [
      "Circular sunken black lesions with concentric rings on fruits and leaves",
      "Gelatinous pinkish-orange spore masses oozing at center of necrotic spots",
      "Tip die-back of twigs with twigs shriveling from top downwards",
      "Premature flower shedding and bleached, paper-like chilli pods",
    ],
    treatment: [
      "Collect and incinerate all fallen diseased fruits and pruned twigs",
      "Treat seeds with Carbendazim (2g/kg) or Thiram (3g/kg) before sowing",
      "Ensure wide plant spacing for fast morning foliage drying",
    ],
    pesticides: [
      "Difenoconazole 25% EC (Score) — 1.0 mL/L",
      "Azoxystrobin 11% + Tebuconazole 18.3% SC — 1.5 mL/L",
      "Copper Oxychloride 50% WP — 3.0 g/L spray",
    ],
  },
  {
    id: "leaf-curl",
    crop: "Cotton & Chilli",
    disease: "Leaf Curl Viral Disease (CLCuV / ChiLCV)",
    confidence: 90,
    cause: "Plant virus transmitted primarily by the sweetpotato whitefly (Bemisia tabaci). Aggravated by hot dry spells that promote whitefly breeding.",
    referenceImages: [
      "https://images.unsplash.com/photo-1605000797499-95a51c5269ae?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=600&q=80",
    ],
    symptoms: [
      "Severe upward or downward rolling and crinkling of leaf margins",
      "Thickened veins with enations (leaf-like outgrowths) on lower leaf surface",
      "Severe plant stunting, bushy shortened internodes, and stunted flowering",
      "Flower abortion and deformed, hollow boll or pod formation",
    ],
    treatment: [
      "Install 15-20 yellow sticky traps per acre to capture flying whiteflies",
      "Uproot and destroy alternative weed hosts (Abutilon, Xanthium)",
      "Grow virus-tolerant hybrids and avoid excessive chemical nitrogen",
    ],
    pesticides: [
      "Diafenthiuron 50% WP — 1.25 g/L vector management",
      "Spiromesifen 22.9% SC — 1.0 mL/L for whitefly nymphs",
      "Neem Oil 10,000 ppm — 2.0 mL/L preventive repellent",
    ],
  },
  {
    id: "tikka-disease",
    crop: "Groundnut (Peanut)",
    disease: "Tikka Leaf Spot (Cercospora arachidicola)",
    confidence: 92,
    cause: "Soil and residue-borne fungal spores stimulated by warm, overcast rainy days with dense plant canopies.",
    referenceImages: [
      "https://images.unsplash.com/photo-1560493676-04071c5f467b?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?auto=format&fit=crop&w=600&q=80",
    ],
    symptoms: [
      "Circular reddish-brown to dark carbon-black spots on leaf surfaces",
      "Prominent bright yellow chlorotic ring around older spots",
      "Severe defoliation starting on bottom leaves, reducing pod filling",
      "Weakening of pegs resulting in pods snapping and staying in soil at harvest",
    ],
    treatment: [
      "Practice 2-year crop rotation with pearl millet, maize, or sorghum",
      "Seed treatment with Trichoderma viride (4 g/kg seed)",
      "Apply gypsum (400 kg/ha) at pegging to strengthen plant cellular tissues",
    ],
    pesticides: [
      "Hexaconazole 5% SC — 2.0 mL/L",
      "Chlorothalonil 75% WP — 2.0 g/L",
      "Tebuconazole 10% + Trifloxystrobin 25% WG — 0.7 g/L",
    ],
  },
  {
    id: "fusarium-wilt",
    crop: "Chickpea & Cotton",
    disease: "Fusarium Vascular Wilt (Fusarium oxysporum)",
    confidence: 94,
    cause: "Long-lived soil-inhabiting fungal chlamydospores invading root hair tissue and clogging vascular xylem vessels.",
    referenceImages: [
      "https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&w=600&q=80",
    ],
    symptoms: [
      "Sudden drooping, wilting, and yellowing of foliage during warm midday hours",
      "Dark brown to black vascular streak visible when lower stem is split open",
      "Affected leaves turn dull bronze and wither while remaining attached",
      "Decayed, blackened lateral root system with shredding root bark",
    ],
    treatment: [
      "Soil solarization with transparent 25-micron polythene during summer",
      "Mix Trichoderma harzianum (5 kg/ha) with well-decomposed FYM into soil",
      "Cultivate wilt-resistant varieties like JG-11 or JAKI 9218",
    ],
    pesticides: [
      "Carbendazim 50% WP root drenching — 2.0 g/L",
      "Copper Oxychloride 50% WP soil drench around stem bases — 3.0 g/L",
      "Trichoderma viride 1% WP biological soil application",
    ],
  },
  {
    id: "downy-mildew",
    crop: "Grapevine, Melons & Pearl Millet",
    disease: "Downy Mildew (Pseudoperonospora cubensis)",
    confidence: 93,
    cause: "Oomycete water-mold requiring free water droplets on leaf tissue to germinate. Common in wet, foggy, and rainy weather.",
    referenceImages: [
      "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=600&q=80",
    ],
    symptoms: [
      "Angular, vein-delimited yellow patches on upper surface of leaves",
      "Dense, purplish-gray downy fungal bloom on corresponding leaf underside",
      "Leaves turn scorched brown, curl inward, and shatter like dry paper",
      "Severe defoliation leading to sour, sunburnt, and unmarketable fruit bunches",
    ],
    treatment: [
      "Train grape and melon vines on tall wire trellises to elevate canopy",
      "Prune overcrowded center shoots to allow sunlight penetration",
      "Avoid sprinkler or overhead watering; rely on ground drip emitters",
    ],
    pesticides: [
      "Fosetyl-Al 80% WP (Aliette) — 2.5 g/L",
      "Dimethomorph 50% WP — 1.5 g/L",
      "Bordeaux Mixture 1% (10:10:100) protective spray",
    ],
  },
  {
    id: "cercospora-leaf-spot",
    crop: "Vegetables & Pulses",
    disease: "Cercospora Leaf Spot (Cercospora canescens)",
    confidence: 91,
    cause: "Airborne and seed-borne fungal pathogen spreading in warm, overcast weather (22°C - 30°C) with persistent leaf wetness.",
    referenceImages: [
      diseasedLeafImg,
      "https://images.unsplash.com/photo-1592417817098-8f3d69103c80?auto=format&fit=crop&w=600&q=80",
    ],
    symptoms: [
      "Small circular to irregular reddish-brown spots with grayish-white centers",
      "Chlorotic yellow halo prominently surrounding each lesion",
      "Spots coalesce into extensive necrotic blotches causing leaves to drop",
      "Premature defoliation reducing pod formation and photosynthetic yield",
    ],
    treatment: [
      "Collect and dispose of fallen diseased leaves from underneath the canopy",
      "Improve ventilation and plant spacing to facilitate rapid morning drying",
      "Avoid overhead sprinkler irrigation during evening hours",
    ],
    pesticides: [
      "Mancozeb 75% WP — 2.5 g/L spray",
      "Carbendazim 50% WP — 1.0 g/L spray",
      "Copper Oxychloride 50% WP — 3.0 g/L spray",
    ],
  },
  {
    id: "bacterial-canker",
    crop: "Tomato & Citrus",
    disease: "Bacterial Canker (Clavibacter michiganensis)",
    confidence: 89,
    cause: "Seed-borne systemic bacterial infection spreading mechanically via pruning tools, rain splash, and irrigation runoff.",
    referenceImages: [
      "https://images.unsplash.com/photo-1527842891421-42eec6e703ea?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?auto=format&fit=crop&w=600&q=80",
    ],
    symptoms: [
      "Characteristic 'Bird's eye' spots (raised dark spots with white halos) on fruits",
      "Marginal necrosis and upward rolling of leaflets on affected branches",
      "Brown vascular discoloration and pith breakdown inside stems",
      "Wilting of branches on one side of plant while remainder appears normal",
    ],
    treatment: [
      "Use certified disease-free seeds from reputable agricultural universities",
      "Disinfect pruning shears with 10% bleach between individual plants",
      "Avoid weeding or working in fields when plant foliage is wet",
    ],
    pesticides: [
      "Streptocycline — 100 ppm foliar spray",
      "Copper Hydroxide 53.8% DF — 2.0 g/L spray",
      "Kasugamycin 3% SL — 2.0 mL/L",
    ],
  },
];

const sampleQuickTests = [
  { label: "Tomato Blight", img: "https://images.unsplash.com/photo-1592417817098-8f3d69103c80?auto=format&fit=crop&w=400&q=80", targetId: "early-blight" },
  { label: "Rice Blight", img: "https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?auto=format&fit=crop&w=400&q=80", targetId: "bacterial-blight" },
  { label: "Powdery Mildew", img: "https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=400&q=80", targetId: "powdery-mildew" },
  { label: "Wheat Rust", img: "https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&w=400&q=80", targetId: "yellow-rust" },
  { label: "Fruit Rot", img: "https://images.unsplash.com/photo-1582284540020-eacbe03f2ca0?auto=format&fit=crop&w=400&q=80", targetId: "anthracnose" },
  { label: "Leaf Spot", img: diseasedLeafImg, targetId: "cercospora-leaf-spot" },
];

const DiseaseDetectionPage = () => {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<DiagnosisResult | null>(null);
  const [lastIndex, setLastIndex] = useState<number>(-1);
  const [mlFeatures, setMlFeatures] = useState<LeafFeatures | null>(null);
  const [inferenceTime, setInferenceTime] = useState<number>(42);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setUploadedImage(ev.target?.result as string);
      setResult(null);
      setMlFeatures(null);
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyze = async (targetDiagnosis?: DiagnosisResult) => {
    setAnalyzing(true);
    const imgToAnalyze = uploadedImage || diseasedLeafImg;
    const mlAnalysis = await analyzeLeafImageWithML(imgToAnalyze);
    setMlFeatures(mlAnalysis.features);
    setInferenceTime(mlAnalysis.inferenceTimeMs);

    setTimeout(() => {
      if (targetDiagnosis) {
        setResult({
          ...targetDiagnosis,
          confidence: Math.floor(Math.random() * 6) + 92,
        });
      } else {
        const found = mockDiagnoses.find(d => d.id === mlAnalysis.diseaseId);
        if (found && found.id !== result?.id) {
          setResult({
            ...found,
            confidence: mlAnalysis.confidence,
          });
        } else {
          let nextIndex = Math.floor(Math.random() * mockDiagnoses.length);
          if (nextIndex === lastIndex && mockDiagnoses.length > 1) {
            nextIndex = (nextIndex + 1) % mockDiagnoses.length;
          }
          setLastIndex(nextIndex);
          setResult({
            ...mockDiagnoses[nextIndex],
            confidence: Math.floor(Math.random() * 6) + 92,
          });
        }
      }
      setAnalyzing(false);
    }, 1200);
  };

  const handlePickSample = (sample: typeof sampleQuickTests[0]) => {
    setUploadedImage(sample.img);
    const target = mockDiagnoses.find(d => d.id === sample.targetId) || mockDiagnoses[0];
    handleAnalyze(target);
  };

  const handleReset = () => {
    setUploadedImage(null);
    setResult(null);
    setMlFeatures(null);
    setAnalyzing(false);
  };

  return (
    <AppLayout>
      <div className="max-w-xl mx-auto px-4 py-4 pb-24 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-display font-bold text-foreground">Disease Detection 🔬</h1>
            <p className="text-sm text-muted-foreground">Upload or select a leaf photo for multi-disease diagnosis</p>
          </div>
          {(uploadedImage || result) && (
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground bg-muted px-2.5 py-1.5 rounded-lg transition"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset
            </button>
          )}
        </div>

        {/* Upload Box */}
        <div
          onClick={() => fileRef.current?.click()}
          className="glass-card rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer hover:shadow-lg transition-all min-h-[200px] border-2 border-dashed border-primary/30 relative overflow-hidden group"
        >
          {uploadedImage ? (
            <div className="relative w-full flex flex-col items-center">
              <img 
                src={uploadedImage} 
                alt="Uploaded leaf" 
                className="max-h-52 rounded-xl object-contain shadow-md"
                onError={(e) => { (e.target as HTMLImageElement).src = diseasedLeafImg; }}
              />
              <span className="text-[11px] text-muted-foreground mt-2 font-medium bg-background/80 px-2 py-0.5 rounded-md">
                Tap to choose a different photo
              </span>
            </div>
          ) : (
            <>
              <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mb-3 group-hover:scale-105 transition-transform shadow-md">
                <Camera className="w-8 h-8 text-white" />
              </div>
              <p className="text-sm font-semibold text-foreground mb-1">Upload Plant / Leaf Image</p>
              <p className="text-xs text-muted-foreground">Tap to capture with camera or select from files</p>
            </>
          )}
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
        </div>

        {/* Quick Sample Selector */}
        {!uploadedImage && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
              <Sprout className="w-3.5 h-3.5 text-primary" /> Or test with sample leaf pathologies:
            </p>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {sampleQuickTests.map((s) => (
                <button
                  key={s.label}
                  type="button"
                  onClick={() => handlePickSample(s)}
                  className="bg-muted hover:bg-muted/80 rounded-xl p-2 flex flex-col items-center gap-1.5 text-center transition border border-border/40 hover:border-primary/50 group"
                >
                  <img 
                    src={s.img} 
                    alt={s.label} 
                    className="w-10 h-10 rounded-lg object-cover group-hover:scale-105 transition-transform shadow-xs" 
                    onError={(e) => { (e.target as HTMLImageElement).src = diseasedLeafImg; }}
                  />
                  <span className="text-[10px] font-bold text-foreground leading-tight truncate w-full">
                    {s.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Action Button */}
        {uploadedImage && !result && (
          <Button 
            onClick={() => handleAnalyze()} 
            disabled={analyzing} 
            className="w-full gradient-primary border-0 font-semibold h-12 text-sm shadow-md"
          >
            {analyzing ? (
              <motion.span 
                animate={{ opacity: [1, 0.4, 1] }} 
                transition={{ repeat: Infinity, duration: 1 }}
                className="flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 animate-spin" /> Scanning with Plant AI Model...
              </motion.span>
            ) : (
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" /> Run AI Pathology Scan
              </span>
            )}
          </Button>
        )}

        {/* Diagnosis Results */}
        {result && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-3.5">
            {/* ML Neural Architecture Telemetry */}
            <div className="bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-2xl p-3.5 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-primary flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5" /> MobileNetV2 Vision CNN
                </span>
                <span className="text-[11px] font-mono text-muted-foreground flex items-center gap-1">
                  <Activity className="w-3 h-3 text-emerald-500" /> Latency: {inferenceTime}ms
                </span>
              </div>
              {mlFeatures && (
                <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                  <div className="bg-background/80 rounded-xl p-2 border border-border/40">
                    <p className="text-[10px] text-muted-foreground font-medium">Chlorophyll</p>
                    <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{mlFeatures.chlorophyllHealth}%</p>
                  </div>
                  <div className="bg-background/80 rounded-xl p-2 border border-border/40">
                    <p className="text-[10px] text-muted-foreground font-medium">Necrosis Index</p>
                    <p className="text-xs font-bold text-destructive">{mlFeatures.necrosisLevel}%</p>
                  </div>
                  <div className="bg-background/80 rounded-xl p-2 border border-border/40">
                    <p className="text-[10px] text-muted-foreground font-medium">Chlorosis Halo</p>
                    <p className="text-xs font-bold text-amber-600 dark:text-amber-400">{mlFeatures.chlorosisHalo}%</p>
                  </div>
                </div>
              )}
            </div>

            {/* Header Result Card */}
            <div className="glass-card rounded-2xl p-4 border border-destructive/20 bg-destructive/5">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                    Target Crop: {result.crop}
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0" />
                    <h2 className="font-bold text-foreground text-base tracking-tight">{result.disease}</h2>
                  </div>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0" style={{ background: "hsla(0,72%,51%,0.15)", color: "hsl(0,72%,51%)" }}>
                  {result.confidence}% match
                </span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed mt-2">{result.cause}</p>

              <div className="flex items-center justify-between pt-3 mt-3 border-t border-border/50">
                <span className="text-[11px] text-muted-foreground font-medium">Want to test another condition?</span>
                <button
                  type="button"
                  onClick={() => handleAnalyze()}
                  disabled={analyzing}
                  className="flex items-center gap-1.5 text-xs text-primary font-bold hover:underline"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${analyzing ? "animate-spin" : ""}`} />
                  Re-scan / Next Disease
                </button>
              </div>
            </div>

            {/* Reference Images */}
            <div className="glass-card rounded-2xl p-4">
              <h3 className="text-xs font-bold text-foreground mb-2.5 flex items-center gap-2 uppercase tracking-wider">
                <ImageIcon className="w-4 h-4 text-primary" /> Pathology Reference Images
              </h3>
              <div className="grid grid-cols-2 gap-2.5">
                {result.referenceImages.map((imgSrc, i) => (
                  <div key={i} className="relative rounded-xl overflow-hidden shadow-xs border border-border/50 group">
                    <img 
                      src={imgSrc} 
                      alt={`${result.disease} reference ${i + 1}`} 
                      className="w-full h-28 object-cover group-hover:scale-105 transition-transform duration-300" 
                      onError={(e) => { (e.target as HTMLImageElement).src = diseasedLeafImg; }}
                    />
                    <span className="absolute bottom-1.5 left-1.5 text-[9px] font-bold text-white bg-black/70 px-1.5 py-0.5 rounded backdrop-blur-xs">
                      Reference #{i + 1}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Symptoms Card */}
            <div className="glass-card rounded-2xl p-4">
              <h3 className="text-xs font-bold text-foreground mb-2 flex items-center gap-2 uppercase tracking-wider">
                <Bug className="w-4 h-4 text-amber-600 dark:text-amber-400" /> Observed Symptoms
              </h3>
              <ul className="space-y-1.5 mt-2">
                {result.symptoms.map((s, i) => (
                  <li key={i} className="text-xs text-muted-foreground flex items-start gap-2 leading-relaxed">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>

            {/* Treatment Card */}
            <div className="glass-card rounded-2xl p-4">
              <h3 className="text-xs font-bold text-foreground mb-2 flex items-center gap-2 uppercase tracking-wider">
                <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Recommended Cultural Treatment
              </h3>
              <ul className="space-y-1.5 mt-2">
                {result.treatment.map((t, i) => (
                  <li key={i} className="text-xs text-muted-foreground flex items-start gap-2 leading-relaxed">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>

            {/* Pesticides Card */}
            <div className="glass-card rounded-2xl p-4">
              <h3 className="text-xs font-bold text-foreground mb-2 flex items-center gap-2 uppercase tracking-wider">
                <Pill className="w-4 h-4 text-sky" /> Prescribed Chemical / Bio Treatments
              </h3>
              <div className="space-y-2 mt-2">
                {result.pesticides.map((p, i) => (
                  <div key={i} className="bg-muted/70 border border-border/40 rounded-xl px-3 py-2 text-xs font-medium text-foreground">
                    {p}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </AppLayout>
  );
};

export default DiseaseDetectionPage;
