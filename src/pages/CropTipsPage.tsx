import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, Droplets, Sun, Sprout, 
  Wheat, CloudSun, AlertTriangle, 
  Sparkles, Search, X, Clock, 
  TrendingUp, ThermometerSun, Filter
} from "lucide-react";
import AppLayout from "@/components/AppLayout";

interface CropItem {
  id: string;
  name: string;
  category: "Grains" | "Pulses" | "Vegetables" | "Spices" | "Cash Crops" | "Fruits" | "Plantation";
  emoji: string;
  color: string;
  duration: string;
}

interface CropDetail {
  category: string;
  growthDuration: string;
  expectedYield: string;
  idealTemperature: string;
  soilReq: string;
  seedSelection: string;
  watering: string;
  fertilizer: string;
  season: string;
  mistakes: string;
  aiTip: string;
}

const CATEGORIES = ["All", "Grains", "Pulses", "Vegetables", "Spices", "Cash Crops", "Fruits", "Plantation"] as const;

const crops: CropItem[] = [
  // Grains & Cereals
  { id: "rice", name: "Rice (Paddy)", category: "Grains", emoji: "🌾", color: "142, 60%, 40%", duration: "120-150 days" },
  { id: "wheat", name: "Wheat", category: "Grains", emoji: "🌾", color: "45, 80%, 50%", duration: "110-140 days" },
  { id: "corn", name: "Corn (Maize)", category: "Grains", emoji: "🌽", color: "50, 85%, 50%", duration: "90-110 days" },
  { id: "barley", name: "Barley (Jau)", category: "Grains", emoji: "🌾", color: "38, 75%, 55%", duration: "100-120 days" },
  { id: "millet", name: "Pearl Millet (Bajra)", category: "Grains", emoji: "🌾", color: "35, 70%, 45%", duration: "80-95 days" },

  // Pulses & Legumes
  { id: "chickpea", name: "Chickpea (Chana)", category: "Pulses", emoji: "🫘", color: "32, 65%, 45%", duration: "90-115 days" },
  { id: "soybean", name: "Soybean", category: "Pulses", emoji: "🫘", color: "80, 40%, 45%", duration: "90-105 days" },
  { id: "groundnut", name: "Groundnut (Peanut)", category: "Pulses", emoji: "🥜", color: "30, 60%, 45%", duration: "100-130 days" },
  { id: "pigeonpea", name: "Pigeon Pea (Tur/Arhar)", category: "Pulses", emoji: "🫘", color: "40, 70%, 40%", duration: "150-180 days" },

  // Vegetables
  { id: "tomato", name: "Tomato", category: "Vegetables", emoji: "🍅", color: "0, 75%, 50%", duration: "90-120 days" },
  { id: "potato", name: "Potato", category: "Vegetables", emoji: "🥔", color: "30, 50%, 45%", duration: "90-110 days" },
  { id: "onion", name: "Onion", category: "Vegetables", emoji: "🧅", color: "300, 30%, 50%", duration: "120-150 days" },
  { id: "chilli", name: "Chilli Pepper", category: "Vegetables", emoji: "🌶️", color: "0, 85%, 50%", duration: "120-160 days" },
  { id: "brinjal", name: "Brinjal (Eggplant)", category: "Vegetables", emoji: "🍆", color: "270, 60%, 45%", duration: "110-140 days" },
  { id: "cucumber", name: "Cucumber", category: "Vegetables", emoji: "🥒", color: "140, 65%, 45%", duration: "50-70 days" },

  // Spices & Oilseeds
  { id: "turmeric", name: "Turmeric", category: "Spices", emoji: "🟡", color: "45, 90%, 50%", duration: "210-270 days" },
  { id: "ginger", name: "Ginger", category: "Spices", emoji: "🫚", color: "35, 60%, 45%", duration: "240-270 days" },
  { id: "garlic", name: "Garlic", category: "Spices", emoji: "🧄", color: "50, 20%, 65%", duration: "130-160 days" },
  { id: "mustard", name: "Mustard (Sarson)", category: "Spices", emoji: "🌼", color: "48, 95%, 48%", duration: "110-130 days" },

  // Cash Crops
  { id: "cotton", name: "Cotton", category: "Cash Crops", emoji: "☁️", color: "200, 20%, 70%", duration: "150-180 days" },
  { id: "sugarcane", name: "Sugarcane", category: "Cash Crops", emoji: "🎋", color: "120, 40%, 45%", duration: "300-360 days" },
  { id: "jute", name: "Jute (Golden Fiber)", category: "Cash Crops", emoji: "🌾", color: "42, 60%, 50%", duration: "120-140 days" },

  // Fruits & Plantation
  { id: "banana", name: "Banana", category: "Fruits", emoji: "🍌", color: "50, 95%, 50%", duration: "11-13 months" },
  { id: "mango", name: "Mango", category: "Fruits", emoji: "🥭", color: "35, 90%, 52%", duration: "Perennial (annual harvest)" },
  { id: "watermelon", name: "Watermelon", category: "Fruits", emoji: "🍉", color: "140, 70%, 40%", duration: "75-90 days" },
  { id: "coffee", name: "Coffee", category: "Plantation", emoji: "☕", color: "25, 60%, 35%", duration: "Perennial (annual berry cycle)" },
];

const cropDetails: Record<string, CropDetail> = {
  rice: {
    category: "Grains & Cereals",
    growthDuration: "120 - 150 days",
    expectedYield: "40 - 55 quintals / hectare",
    idealTemperature: "22°C - 34°C",
    soilReq: "Heavy clay or clay-loam soil with excellent water holding capacity. Optimal pH ranges between 5.5 and 7.0.",
    seedSelection: "Use certified high-yielding varieties (HYV) such as IR-64, Swarna, or Pusa Basmati. Perform salt-water flotation to discard hollow seeds.",
    watering: "High water demand. Maintain 2 to 5 cm shallow standing water during early tillering and panicle development stages.",
    fertilizer: "Apply NPK at 120:60:40 kg/ha. Apply full P & K as basal dose alongside 1/3 N. Top-dress remaining Nitrogen in two splits.",
    season: "Kharif (Monsoon). Best sown in June-July; Rabi season in coastal delta belts.",
    mistakes: "Draining the field prematurely prior to grain maturity; allowing soil cracking during the early vegetative phase.",
    aiTip: "Expected rainfall is favorable this week. Hold off on electric borewell irrigation for the next 3 days to prevent nutrient leaching."
  },
  wheat: {
    category: "Grains & Cereals",
    growthDuration: "110 - 140 days",
    expectedYield: "45 - 55 quintals / hectare",
    idealTemperature: "15°C - 24°C",
    soilReq: "Well-drained fertile loam to clay-loam with moderate moisture retention. Preferred soil pH: 6.0 - 7.5.",
    seedSelection: "Select rust-resistant varieties (HD-2967, PBW-550, DBW-187). Seed-treat with Carbendazim (2g/kg) before sowing.",
    watering: "Requires 5 to 6 scheduled irrigations. Crown Root Initiation (CRI) at 21-25 days post-sowing is the most critical watering window.",
    fertilizer: "Standard NPK recommendation 120:60:40 kg/ha. Apply all P & K and half N at sowing, applying remaining N with first irrigation.",
    season: "Rabi (Winter). Ideal sowing between late October and mid-November.",
    mistakes: "Delaying CRI irrigation beyond 25 days; applying irrigation during heavy winds causing severe lodging.",
    aiTip: "Unseasonal warm spells detected. Inspect flag leaves closely for early aphid clusters and irrigate during calm morning hours."
  },
  corn: {
    category: "Grains & Cereals",
    growthDuration: "90 - 110 days",
    expectedYield: "50 - 65 quintals / hectare",
    idealTemperature: "21°C - 30°C",
    soilReq: "Deep, fertile, well-aerated sandy loam to silt loam. Highly sensitive to waterlogging. Ideal pH: 5.8 - 7.2.",
    seedSelection: "Choose high-yielding single-cross hybrids like Pioneer 3396 or DKC 9108. Treat with Thiamethoxam for shoot fly prevention.",
    watering: "Moderate water requirement (500-600 mm). Peak moisture need occurs during tasseling and silking stages.",
    fertilizer: "Apply NPK 120:60:50 kg/ha + 25 kg Zinc Sulphate. Split nitrogen: 25% basal, 50% knee-high stage, 25% tasseling.",
    season: "Grown in Kharif (June-July) as well as Rabi (October-November) and Spring in irrigated tracts.",
    mistakes: "Allowing water to pool around roots for more than 12 hours; missing the Fall Armyworm scouting in early whorls.",
    aiTip: "Pheromone trap counts indicate Fall Armyworm movement in adjacent tracts. Spray Emamectin Benzoate 5% SG inside plant whorls if leaf holes appear."
  },
  barley: {
    category: "Grains & Cereals",
    growthDuration: "100 - 120 days",
    expectedYield: "35 - 45 quintals / hectare",
    idealTemperature: "12°C - 20°C",
    soilReq: "Tolerates slightly saline and alkaline soils better than wheat. Sandy loam to loam. pH: 6.5 - 8.5.",
    seedSelection: "Choose malt or feed cultivars (e.g., RD-2035, DWRB-123). Treat with Vitavax or Thiram.",
    watering: "Low water requirement. 2 to 3 irrigations at tillering and flowering are usually sufficient.",
    fertilizer: "NPK 60:30:20 kg/ha under irrigated conditions; reduce N for malting barley to keep grain protein moderate.",
    season: "Rabi (Winter crop). Sown in late October to mid-November.",
    mistakes: "Excess nitrogen fertilization which ruins malting quality and invites powdery mildew.",
    aiTip: "Cool dry winds expected. Ideal conditions for barley tillering; do not over-irrigate to keep crown dry."
  },
  millet: {
    category: "Grains & Cereals",
    growthDuration: "80 - 95 days",
    expectedYield: "25 - 35 quintals / hectare",
    idealTemperature: "26°C - 36°C",
    soilReq: "Drought-hardy crop thriving in shallow, sandy to light loam soils with low fertility. pH: 6.5 - 7.5.",
    seedSelection: "Use certified drought-resilient hybrids (HHB-67, Pioneer 86M84). Treat with metalaxyl for downy mildew.",
    watering: "Extremely water-efficient (300-350 mm total). Critical stages: flowering and grain filling.",
    fertilizer: "Apply NPK 80:40:40 kg/ha in irrigated tracts, or 40:20:0 in arid rainfed conditions.",
    season: "Kharif. Sown with the onset of monsoon rains in July.",
    mistakes: "Deep planting; seeds must not be buried deeper than 2-3 cm into loose dry topsoil.",
    aiTip: "Recent rainfall is sufficient for the vegetative phase. No supplementary irrigation required for dryland tracts."
  },
  chickpea: {
    category: "Pulses & Legumes",
    growthDuration: "90 - 115 days",
    expectedYield: "20 - 28 quintals / hectare",
    idealTemperature: "15°C - 25°C",
    soilReq: "Well-drained light-to-medium black or alluvial soils. Sensitive to acidity and waterlogging. pH: 6.0 - 7.5.",
    seedSelection: "Select wilt-tolerant Desi (JG-11, JAKI 9218) or Kabuli (KAK-2) varieties. Treat with Rhizobium & Trichoderma.",
    watering: "Requires 1 to 2 light irrigations at pre-flowering and pod development. Never irrigate during full flowering.",
    fertilizer: "Leguminous nitrogen fixer: Apply basal NPK 20:50:20 kg/ha with 20 kg/ha Sulfur to boost protein synthesis.",
    season: "Rabi. Sown in October-November following Kharif harvest.",
    mistakes: "Irrigating during peak flowering which triggers flower drop; broadcasting seeds without fungicide treatment.",
    aiTip: "Helicoverpa pod borer moths are active. Install 4 pheromone traps per acre and inspect flower buds weekly."
  },
  soybean: {
    category: "Pulses & Legumes",
    growthDuration: "90 - 105 days",
    expectedYield: "22 - 30 quintals / hectare",
    idealTemperature: "22°C - 32°C",
    soilReq: "Rich, well-aerated fertile loamy soil with neutral pH (6.5 - 7.5). Avoid saline or waterlogged soils.",
    seedSelection: "Use JS-335, JS-9560, or NRC-37. Inoculate seeds with Bradyrhizobium japonicum culture before sowing.",
    watering: "Rainfed in most regions. During dry spells, provide life-saving irrigation at pod development.",
    fertilizer: "NPK 20:60:40 kg/ha + 20 kg/ha Sulfur. Supplement with micronutrient Zinc if soil is deficient.",
    season: "Kharif. Sown immediately after onset of southwest monsoon (mid-June to first week of July).",
    mistakes: "Sowing before adequate soil moisture builds (at least 75-100 mm continuous rain); deep seed placement.",
    aiTip: "Maintain broad-bed furrow (BBF) ridges to drain excess storm run-off and keep root zones oxygenated."
  },
  groundnut: {
    category: "Pulses & Legumes",
    growthDuration: "100 - 130 days",
    expectedYield: "25 - 35 quintals / hectare",
    idealTemperature: "22°C - 30°C",
    soilReq: "Friable, loose, sandy loam well-supplied with calcium and organic matter. pH: 6.0 - 7.0.",
    seedSelection: "High-oil bunch varieties (TAG-24, JL-24, Kadiri-6). Treat kernels with Trichoderma viride.",
    watering: "Keep root and pod zone moist. Critical watering at flowering, pegging, and pod filling.",
    fertilizer: "NPK 25:50:40 kg/ha. Apply Gypsum (400-500 kg/ha) at flowering/pegging to ensure calcium for pod shells.",
    season: "Kharif (June-July) and irrigated summer crop (January-February).",
    mistakes: "Compacted hard soils that prevent peg penetration; skipping gypsum application causing hollow pods ('pops').",
    aiTip: "Peg penetration stage has begun. Apply gypsum along rows and perform shallow earthing-up carefully."
  },
  pigeonpea: {
    category: "Pulses & Legumes",
    growthDuration: "150 - 180 days",
    expectedYield: "18 - 25 quintals / hectare",
    idealTemperature: "20°C - 32°C",
    soilReq: "Deep loamy and black soils with good internal drainage. Deep taproot system tolerates moisture stress. pH: 6.5 - 7.5.",
    seedSelection: "Varieties like BDN-711, Asha (ICPL 87119), or Maruthi. Inoculate with Rhizobium culture.",
    watering: "Primarily rainfed. One life-saving irrigation at flower initiation and pod formation drastically boosts yield.",
    fertilizer: "Basal application of NPK 25:50:25 kg/ha + 20 kg Sulfur per hectare.",
    season: "Kharif. Sown June-July, often intercropped with soybean or cotton.",
    mistakes: "Water stagnation in field causing Phytophthora stem blight; neglecting pod fly damage.",
    aiTip: "Flower bud initiation observed. Spray neem oil (1500 ppm) or Chlorantraniliprole to deter blister beetles and pod borers."
  },
  tomato: {
    category: "Vegetables",
    growthDuration: "90 - 120 days",
    expectedYield: "400 - 600 quintals / hectare",
    idealTemperature: "18°C - 28°C",
    soilReq: "Fertile, well-drained sandy loam rich in organic matter. Free from root-knot nematodes. pH: 6.0 - 7.0.",
    seedSelection: "Choose indeterminate hybrids for greenhouse staking, or determinate varieties like Arka Rakshak for open fields.",
    watering: "Consistent moisture via drip irrigation. Avoid flood or overhead sprinklers that wet foliage.",
    fertilizer: "NPK 150:100:120 kg/ha. Supplement with Calcium Nitrate and Boron to prevent blossom end rot and fruit cracking.",
    season: "Grown throughout the year in frost-free regions across autumn, spring, and rainy seasons.",
    mistakes: "Overhead watering before sunset creating early blight; failing to stake heavy fruiting branches.",
    aiTip: "High ambient humidity reported. Switch completely to drip irrigation and prune lower yellowing foliage to facilitate air flow."
  },
  potato: {
    category: "Vegetables",
    growthDuration: "90 - 110 days",
    expectedYield: "250 - 350 quintals / hectare",
    idealTemperature: "15°C - 22°C",
    soilReq: "Loose, friable, well-aerated sandy loam with abundant humus. Free from rocks and clods. pH: 5.2 - 6.4.",
    seedSelection: "Use certified disease-free Seed Potato Tubers (Kufri Jyoti, Kufri Pukhraj, Kufri Bahar). Pre-sprout tubers in diffused light.",
    watering: "Frequent shallow irrigations (every 7-10 days). Tuber formation requires uniform soil moisture.",
    fertilizer: "Heavy feeder: NPK 150:100:120 kg/ha. Earthing up is done with second dose of nitrogen at 30-35 days.",
    season: "Rabi (Winter). Planted in October-November in northern and central plains.",
    mistakes: "Exposing developing tubers to sunlight (turns them green with toxic solanine); late blight negligence.",
    aiTip: "Cloudy humid weather with dew favors Late Blight. Spray protective Mancozeb (2.5 g/L) preventively across the canopy."
  },
  onion: {
    category: "Vegetables",
    growthDuration: "120 - 150 days",
    expectedYield: "250 - 350 quintals / hectare",
    idealTemperature: "15°C - 28°C",
    soilReq: "Well-drained friable sandy loam to clay loam rich in organic matter. Sensitive to alkaline conditions. pH: 6.0 - 7.0.",
    seedSelection: "Select high-pungency, long-storing cultivars (Bhima Super, Agrifound Dark Red, Pusa Red).",
    watering: "Frequent light irrigations. Stop irrigation 15 days before harvest to ensure dry neck and bulb curing.",
    fertilizer: "NPK 100:50:80 kg/ha + 30 kg/ha Sulfur (critical for pungent allyl propyl disulfide compounds).",
    season: "Kharif (June-July), Late Kharif (August-September), and Rabi (October-November).",
    mistakes: "Irrigating right up to harvest date (causes neck rot in storage); planting oversized seedlings causing premature bolting.",
    aiTip: "Thrips attack typically peaks during sunny dry periods. Spray fipronil or spinosad if silver leaf streaks appear."
  },
  chilli: {
    category: "Vegetables",
    growthDuration: "120 - 160 days",
    expectedYield: "20 - 30 quintals / ha (dry) | 100-150 q/ha (green)",
    idealTemperature: "20°C - 30°C",
    soilReq: "Well-aerated fertile loam to clay loam with good drainage. Black cotton soils suitable under rainfed cultivation. pH: 6.5 - 7.5.",
    seedSelection: "Choose viral-resistant hybrids like G-4, Byadagi, or Arka Meghana. Treat with Imidacloprid.",
    watering: "Moderate irrigation. Drought induces flower drop, while water stagnation causes dieback and root rot.",
    fertilizer: "NPK 120:60:60 kg/ha. Top dress nitrogen and potassium in 3 equal splits during flowering and picking.",
    season: "Kharif and summer. Seeds nursery-raised and transplanted after 35-40 days.",
    mistakes: "Excess nitrogen fertilization leading to dense foliage with few fruit sets; ignoring whiteflies and thrips.",
    aiTip: "Leaf curl virus vectors (whiteflies/thrips) active. Install yellow and blue sticky traps (15 each per acre)."
  },
  brinjal: {
    category: "Vegetables",
    growthDuration: "110 - 140 days",
    expectedYield: "300 - 450 quintals / hectare",
    idealTemperature: "21°C - 32°C",
    soilReq: "Rich, well-manured, well-drained silt loam to clay loam. Warm roots support continuous fruiting. pH: 6.0 - 6.8.",
    seedSelection: "High-yielding hybrids like Pusa Purple Long, Pusa Shyamla, or local cluster types. Treat seeds with Trichoderma.",
    watering: "Regular watering every 4-6 days in summer, 8-10 days in winter. Never let soil crack around root crowns.",
    fertilizer: "NPK 100:80:60 kg/ha. Apply farmyard manure (25 t/ha) during land preparation.",
    season: "Autumn-winter and spring-summer. Can be cultivated nearly year-round in tropical climates.",
    mistakes: "Failing to prune wilted shoots infested with Shoot & Fruit Borer (Leucinodes orbonalis).",
    aiTip: "Check growing tips for shoot borer wilting. Clip affected shoots below the wilting point and dispose immediately."
  },
  cucumber: {
    category: "Vegetables",
    growthDuration: "50 - 70 days",
    expectedYield: "120 - 180 quintals / hectare",
    idealTemperature: "22°C - 32°C",
    soilReq: "Sandy loam high in organic matter with loose structure for rapid root extension. pH: 6.0 - 7.0.",
    seedSelection: "Gynoecious parthenocarpic hybrids for polyhouse or open varieties like Poinsette and Japanese Long Green.",
    watering: "High water requirement. Drip irrigation keeps fruit clean and prevents downy mildew on trailing vines.",
    fertilizer: "NPK 80:50:50 kg/ha. Potassium ensures crisp texture and straight fruit development.",
    season: "Summer (February-March) and Rainy season (June-July).",
    mistakes: "Irregular watering causing bitter fruits; letting vines trail directly on damp soil without trellising.",
    aiTip: "Provide trellis nets or wire stakes to lift vines off the ground; this increases marketable grade-A yield by 35%."
  },
  turmeric: {
    category: "Spices & Plantation",
    growthDuration: "210 - 270 days",
    expectedYield: "200 - 250 quintals fresh rhizomes / ha",
    idealTemperature: "20°C - 35°C",
    soilReq: "Well-drained rich loamy or alluvial soil with high organic matter. Cannot tolerate waterlogging. pH: 6.0 - 7.5.",
    seedSelection: "Healthy, disease-free mother or finger rhizomes (Salem, IISR Pratibha, Megha Turmeric-1). Treat with Mancozeb.",
    watering: "Requires 15-20 irrigations in total. Heavy mulching with green leaves retains soil moisture and boosts microbes.",
    fertilizer: "NPK 60:50:120 kg/ha + 25-30 tonnes/ha Farmyard Manure. High potash requirement for bulky rhizome formation.",
    season: "Planting from May to early July with pre-monsoon showers.",
    mistakes: "Inadequate mulching causing soil baking and stunted rhizomes; poorly drained raised beds.",
    aiTip: "Apply second round of green leaf mulch (5 t/ha) now to protect developing rhizomes from direct sun and retain soil moisture."
  },
  ginger: {
    category: "Spices & Plantation",
    growthDuration: "240 - 270 days",
    expectedYield: "150 - 200 quintals fresh rhizomes / ha",
    idealTemperature: "22°C - 32°C",
    soilReq: "Rich sandy or clay loam soil with porous structure and high organic content. Free from bacterial wilt. pH: 5.5 - 6.5.",
    seedSelection: "Use clean seed rhizomes weighing 25-30 grams each with at least one active eye bud (IISR Rejatha, Rio-de-Janeiro).",
    watering: "Shallow frequent irrigations. Waterlogging is fatal and induces rapid soft rot (Pythium aphanidermatum).",
    fertilizer: "NPK 75:50:50 kg/ha accompanied by thick leaf mulch applications at 45 and 90 days.",
    season: "Best planted with pre-monsoon showers during April-May.",
    mistakes: "Continuous cultivation in the same plot without crop rotation; planting in water-retaining clay flats.",
    aiTip: "Drench beds with copper oxychloride or Trichoderma if yellowing leaf margins and water-soaked stems appear."
  },
  garlic: {
    category: "Spices & Plantation",
    growthDuration: "130 - 160 days",
    expectedYield: "80 - 120 quintals / hectare",
    idealTemperature: "13°C - 24°C",
    soilReq: "Rich, friable loamy soil with high organic fertility. Good drainage is paramount. pH: 6.0 - 7.5.",
    seedSelection: "Use outer, plump cloves from certified bulbs (Yamuna Safed, G-282, Bhima Omkar). Avoid small central cloves.",
    watering: "Irrigate every 8-10 days during vegetative growth. Cease watering completely 10 days before harvesting.",
    fertilizer: "NPK 100:50:50 kg/ha + 40 kg/ha Sulfur. Sulfur substantially enhances allicin and storage quality.",
    season: "Rabi. Planted September-November in plains; spring planting in high hills.",
    mistakes: "Planting cloves inverted or too deep; watering past bulb maturity causing splitting and rot.",
    aiTip: "Bulb enlargement phase has started. Maintain weed-free topsoil and stop high-nitrogen fertilizers to prevent loose cloves."
  },
  mustard: {
    category: "Spices & Plantation",
    growthDuration: "110 - 130 days",
    expectedYield: "18 - 25 quintals / hectare",
    idealTemperature: "15°C - 25°C",
    soilReq: "Light to heavy loam soils with fair drainage. Tolerates light saline conditions. pH: 6.0 - 7.5.",
    seedSelection: "Select high-oil hybrid seeds (Pusa Bold, Varuna, Pioneer 45S46). Treat with Apron 35SD against white rust.",
    watering: "Requires only 2 to 3 irrigations: rosette stage (30-35 days) and siliqua (pod) filling (60-65 days).",
    fertilizer: "NPK 80:40:40 kg/ha + 25-30 kg/ha Sulfur (critical for pungent mustard oil content).",
    season: "Rabi (Winter). Best sown October to first week of November.",
    mistakes: "Late sowing beyond November which exposes flowering to severe mustard aphid outbreaks.",
    aiTip: "Scout flower racemes for mustard aphids (Lipaphis erysimi). Spray Dimethoate 30 EC or Oxydemeton-methyl if colonies appear."
  },
  cotton: {
    category: "Cash Crops",
    growthDuration: "150 - 180 days",
    expectedYield: "20 - 30 quintals seed cotton / ha",
    idealTemperature: "21°C - 35°C",
    soilReq: "Deep black clay soils (regur) with high water retention or well-drained alluvial loams. pH: 6.0 - 8.0.",
    seedSelection: "Bt Cotton hybrids with certified bollworm protection. Seed treatment with imidacloprid for early sucking pest control.",
    watering: "Needs moderate water initially. Strict moisture control during boll opening to protect lint quality.",
    fertilizer: "NPK 150:60:60 kg/ha. Split nitrogen into 3-4 doses to balance vegetative growth and boll formation.",
    season: "Kharif. Sown April-June depending on monsoon arrival and canal water availability.",
    mistakes: "Over-watering during late boll maturation; delayed sowing leading to pink bollworm vulnerability.",
    aiTip: "Peak boll formation stage. Install pink bollworm pheromone traps (5/acre) and check green bolls for entry pinholes."
  },
  sugarcane: {
    category: "Cash Crops",
    growthDuration: "300 - 360 days",
    expectedYield: "800 - 1200 quintals / hectare",
    idealTemperature: "24°C - 35°C",
    soilReq: "Deep, well-drained fertile loam or clay loam with high organic humus. Can handle wide soil types. pH: 6.5 - 7.5.",
    seedSelection: "Use three-budded healthy setts from 8-10 month old crop (Co 0238, Co 86032). Dip in Carbendazim solution before planting.",
    watering: "High water consumer (1500-2500 mm). Drip irrigation with fertigation saves 40% water and boosts cane diameter.",
    fertilizer: "NPK 250:100:120 kg/ha. Apply P as basal, Nitrogen in 3 splits up to 120 days. Complete earthing up at 90-100 days.",
    season: "Autumn (Oct-Nov), Spring (Feb-March), and Adsali (June-July in Maharashtra).",
    mistakes: "Planting old diseased setts; failing to trench and earth-up, causing massive wind lodging.",
    aiTip: "Early shoot borer attack peaks in high heat. Provide light irrigation and apply Chlorantraniliprole 0.4G along cane rows."
  },
  jute: {
    category: "Cash Crops",
    growthDuration: "120 - 140 days",
    expectedYield: "28 - 38 quintals fiber / hectare",
    idealTemperature: "24°C - 37°C",
    soilReq: "New alluvial soils enriched annually by silt deposits. Sandy to clay loam. pH: 6.0 - 7.5.",
    seedSelection: "Olitorius (Tossa jute) varieties like JRO-524 (Navin) or JRO-204. Treat with Mancozeb.",
    watering: "Requires high humidity (80%+) and rainfall. One pre-sowing irrigation if soil is dry.",
    fertilizer: "NPK 60:30:30 kg/ha. Foliar spray of urea (2%) at 40-45 days enhances stem height and fiber length.",
    season: "Pre-kharif. Sown March to May with nor'wester rains.",
    mistakes: "Harvesting too early (weak fiber) or too late (coarse brittle fiber). Harvest at small pod stage.",
    aiTip: "Harvesting at 50% flowering stage yields the highest tensile strength fiber. Prepare clean retting water ponds in advance."
  },
  banana: {
    category: "Fruits",
    growthDuration: "11 - 13 months",
    expectedYield: "60 - 90 tonnes / hectare",
    idealTemperature: "20°C - 35°C",
    soilReq: "Deep, rich loamy soil with loose drainage and 1 meter minimum topsoil depth. Highly sensitive to salinity. pH: 6.0 - 7.5.",
    seedSelection: "Tissue-cultured disease-free plantlets (Grand Naine - G9, Robusta, Red Banana) or sword suckers.",
    watering: "Drip irrigation is standard (15-20 liters/plant/day in summer). Cannot survive water stagnation.",
    fertilizer: "NPK 200:50:300 g/plant delivered via fertigation. Potassium is critical for bunch weight and finger sweetness.",
    season: "Planting in June-July or February-March.",
    mistakes: "Leaving excess suckers on mother plant (always de-sucker keeping only one follower); overhead irrigation.",
    aiTip: "Bunch emergence phase underway. Tie protective polypropylene non-woven bunch covers to shield fingers from sunburn and thrips."
  },
  mango: {
    category: "Fruits",
    growthDuration: "Perennial (annual harvest)",
    expectedYield: "8 - 15 tonnes / ha (mature orchard)",
    idealTemperature: "24°C - 36°C",
    soilReq: "Deep, well-drained alluvial, red, or laterite soil with no hard pan within 2 meters. pH: 5.5 - 7.5.",
    seedSelection: "Grafted saplings of commercial cultivars (Alphonso, Dasheri, Kesar, Banganapalli, Totapuri).",
    watering: "Regular irrigation for young trees (1-4 years). Withhold irrigation 2-3 months before flowering to induce flower buds.",
    fertilizer: "1 kg N, 0.5 kg P2O5, 1 kg K2O per tree per year for mature 10+ year orchards alongside 50 kg Farmyard Manure.",
    season: "Planting during monsoon (July-August). Flowering in Dec-Feb, harvest in April-July.",
    mistakes: "Irrigating during flower panicle bloom causing vegetative flush instead of fruit set; ignoring powdery mildew.",
    aiTip: "Flower panicles forming. Spray wettable sulfur (2g/L) to prevent Powdery Mildew and keep hopper nymphs in check."
  },
  watermelon: {
    category: "Fruits",
    growthDuration: "75 - 90 days",
    expectedYield: "300 - 450 quintals / hectare",
    idealTemperature: "24°C - 32°C",
    soilReq: "Warm, fertile sandy loam with excellent drainage. High organic humus accelerates growth. pH: 6.0 - 6.8.",
    seedSelection: "High-Brix sugar hybrids (Sugar Baby, Max, Black Diamond, Saraswati). Treat with Thiram.",
    watering: "Drip irrigation on silver-black mulch beds. Reduce watering 7 days before harvest to concentrate natural fruit sugars.",
    fertilizer: "NPK 100:60:80 kg/ha. Extra Potassium during fruit sizing maximizes sweet sugar brix reading.",
    season: "Zaid (Summer crop). Sown January-February in plains.",
    mistakes: "Excess nitrogen during fruit setting causing split fruits and tasteless white pulp; overhead irrigation.",
    aiTip: "Thumping fruits with dull thud and yellow ground belly spots indicate optimal ripeness. Cut with 2-inch stem attached."
  },
  coffee: {
    category: "Plantation",
    growthDuration: "Perennial (annual berry cycle)",
    expectedYield: "800 - 1500 kg clean bean / ha",
    idealTemperature: "15°C - 28°C",
    soilReq: "Deep, well-drained porous volcanic or forest loam rich in organic matter. Two-tier tree shade. pH: 6.0 - 6.5.",
    seedSelection: "Arabica (S.795, Chandragiri) or Robusta (CxR, S.274) from certified coffee research nurseries.",
    watering: "Blossom showers (25-40 mm) in February-March followed by backing showers ensure uniform berry set.",
    fertilizer: "NPK 120:90:120 kg/ha for mature Arabica, applied in pre-monsoon and post-monsoon splits.",
    season: "Planting in June-August. Harvesting November-January (Arabica) & January-March (Robusta).",
    mistakes: "Excess shade leading to leaf rust (Hemileia vastatrix); poor pruning of water suckers.",
    aiTip: "Inspect undersides of leaves for orange powdery pustules of Coffee Leaf Rust. Spray 0.5% Bordeaux mixture preventively."
  }
};

const defaultDetails: CropDetail = {
  category: "General Agriculture",
  growthDuration: "90 - 120 days",
  expectedYield: "Varies by regional variety",
  idealTemperature: "20°C - 30°C",
  soilReq: "Fertile, well-draining soil rich in organic matter. Ideal pH falls between 6.0 - 7.5.",
  seedSelection: "Source from certified nurseries. Select drought-resistant variants if your region expects poor rains.",
  watering: "Moderate irrigation. Ensure the top 2 inches of soil dry out before deep watering again.",
  fertilizer: "Apply a balanced NPK ratio based on recent soil tests. Supplement with organic compost.",
  season: "Typically aligned with the Kharif or local wet season unless greenhouse controlled.",
  mistakes: "Over-fertilizing during the seedling stage; ignoring early signs of pest infestation.",
  aiTip: "Current regional weather is stable. Maintain standard scheduled maintenance and monitor soil moisture."
};

const CropTipsPage = () => {
  const [selectedCrop, setSelectedCrop] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const filteredCrops = useMemo(() => {
    return crops.filter(c => {
      const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "All" || c.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  const crop = crops.find(c => c.id === selectedCrop);
  const details = selectedCrop ? (cropDetails[selectedCrop] || defaultDetails) : null;

  const sections = details ? [
    { icon: Sprout, title: "Soil Requirements", content: details.soilReq, color: "text-amber-700 dark:text-amber-400", bg: "bg-amber-100 dark:bg-amber-900/30" },
    { icon: Wheat, title: "Seed Selection & Sowing", content: details.seedSelection, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-100 dark:bg-emerald-900/30" },
    { icon: Droplets, title: "Watering Schedule", content: details.watering, color: "text-sky-600 dark:text-sky-400", bg: "bg-sky-100 dark:bg-sky-900/30" },
    { icon: Sun, title: "Fertilizer & Nutrition", content: details.fertilizer, color: "text-yellow-600 dark:text-yellow-400", bg: "bg-yellow-100 dark:bg-yellow-900/30" },
    { icon: CloudSun, title: "Best Growing Season", content: details.season, color: "text-orange-600 dark:text-orange-400", bg: "bg-orange-100 dark:bg-orange-900/30" },
    { icon: AlertTriangle, title: "Common Pitfalls & Mistakes", content: details.mistakes, color: "text-destructive", bg: "bg-destructive/10" },
  ] : [];

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto px-4 py-4 pb-24">
        <AnimatePresence mode="wait">
          {!selectedCrop ? (
            <motion.div
              key="list-view"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="space-y-4"
            >
              <div>
                <div className="flex items-center justify-between">
                  <h1 className="text-xl font-display font-bold text-foreground">Crop Advice & Datasets 🌱</h1>
                  <span className="text-xs bg-primary/10 text-primary font-bold px-2.5 py-1 rounded-full">
                    {crops.length} Crops Available
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Explore tailored agronomic datasets, soil tips, and AI irrigation advice.
                </p>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search crops (e.g. Rice, Cotton, Tomato, Mustard)..."
                  className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-border/60 bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                <Filter className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0 ml-1 mr-0.5" />
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`text-xs px-3 py-1.5 rounded-full font-semibold whitespace-nowrap transition-all ${
                      selectedCategory === cat
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Crop Grid */}
              {filteredCrops.length === 0 ? (
                <div className="glass-card rounded-2xl p-8 text-center text-muted-foreground">
                  <p className="text-sm font-semibold">No crops found matching "{searchQuery}"</p>
                  <p className="text-xs mt-1">Try searching for another crop or switch category filter.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {filteredCrops.map((c, i) => (
                    <motion.button
                      key={c.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: Math.min(i * 0.03, 0.3) }}
                      onClick={() => setSelectedCrop(c.id)}
                      className="glass-card rounded-2xl p-3.5 flex flex-col items-center gap-2 hover:shadow-lg transition-all border border-border/40 hover:border-primary/50 text-left group"
                    >
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform shadow-xs"
                        style={{ background: `hsla(${c.color}, 0.15)` }}
                      >
                        {c.emoji}
                      </div>
                      <div className="text-center w-full">
                        <span className="text-xs font-bold text-foreground block truncate">
                          {c.name}
                        </span>
                        <div className="flex items-center justify-center gap-1.5 mt-1">
                          <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-md font-medium">
                            {c.category}
                          </span>
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="detail-view"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              className="space-y-4"
            >
              <button 
                onClick={() => setSelectedCrop(null)} 
                className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors bg-muted/60 px-3 py-1.5 rounded-full outline-none focus:ring-2 focus:ring-primary w-fit"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Crop Library
              </button>

              <div className="flex items-center gap-3.5 mb-1">
                <div 
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-sm flex-shrink-0"
                  style={{ background: `hsla(${crop?.color}, 0.15)` }}
                >
                  {crop?.emoji}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md uppercase tracking-wider">
                      {details?.category || crop?.category}
                    </span>
                  </div>
                  <h1 className="text-2xl font-display font-bold text-foreground tracking-tight mt-0.5">
                    {crop?.name}
                  </h1>
                </div>
              </div>

              {/* Quick Metrics Cards */}
              {details && (
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-muted/70 rounded-xl p-2.5 text-center border border-border/40">
                    <Clock className="w-3.5 h-3.5 mx-auto text-primary mb-1" />
                    <p className="text-[10px] text-muted-foreground font-medium">Duration</p>
                    <p className="text-xs font-bold text-foreground mt-0.5">{details.growthDuration}</p>
                  </div>
                  <div className="bg-muted/70 rounded-xl p-2.5 text-center border border-border/40">
                    <TrendingUp className="w-3.5 h-3.5 mx-auto text-emerald-600 dark:text-emerald-400 mb-1" />
                    <p className="text-[10px] text-muted-foreground font-medium">Expected Yield</p>
                    <p className="text-xs font-bold text-foreground mt-0.5">{details.expectedYield.split("/")[0]}</p>
                  </div>
                  <div className="bg-muted/70 rounded-xl p-2.5 text-center border border-border/40">
                    <ThermometerSun className="w-3.5 h-3.5 mx-auto text-amber-600 dark:text-amber-400 mb-1" />
                    <p className="text-[10px] text-muted-foreground font-medium">Optimal Temp</p>
                    <p className="text-xs font-bold text-foreground mt-0.5">{details.idealTemperature}</p>
                  </div>
                </div>
              )}

              {/* AI Dynamic Advisory Box */}
              <div className="relative overflow-hidden rounded-2xl border border-sky-200 dark:border-sky-900 bg-sky-50/80 dark:bg-sky-950/30 p-4 shadow-sm">
                <div className="absolute -top-6 -right-6 w-24 h-24 bg-sky-200 dark:bg-sky-900 rounded-full blur-2xl opacity-50" />
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Sparkles className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                    <h3 className="text-xs font-bold text-sky-900 dark:text-sky-100 uppercase tracking-wider">
                      AI Agronomist Advisory
                    </h3>
                  </div>
                  <p className="text-sm text-sky-950 dark:text-sky-100 leading-relaxed font-medium">
                    "{details?.aiTip}"
                  </p>
                </div>
              </div>

              {/* Detailed Guidance Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {sections.map((s, i) => (
                  <motion.div
                    key={s.title}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="glass-card rounded-2xl p-4 border border-border/40 hover:border-border transition-colors group"
                  >
                    <div className="flex items-center gap-2.5 mb-2">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${s.bg}`}>
                        <s.icon className={`w-4 h-4 ${s.color}`} />
                      </div>
                      <h3 className="text-sm font-bold text-foreground">{s.title}</h3>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed font-normal">
                      {s.content}
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppLayout>
  );
};

export default CropTipsPage;
