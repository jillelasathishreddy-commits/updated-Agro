import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, Droplets, Sun, Sprout, 
  Wheat, CloudSun, AlertTriangle, 
  Sparkles, Leaf 
} from "lucide-react";
import AppLayout from "@/components/AppLayout";

const crops = [
  { id: "rice", name: "Rice (Paddy)", emoji: "🌾", color: "142, 60%, 40%" },
  { id: "wheat", name: "Wheat", emoji: "🌾", color: "45, 80%, 50%" },
  { id: "corn", name: "Corn (Maize)", emoji: "🌽", color: "50, 85%, 50%" },
  { id: "cotton", name: "Cotton", emoji: "☁️", color: "200, 20%, 70%" },
  { id: "sugarcane", name: "Sugarcane", emoji: "🎋", color: "120, 40%, 45%" },
  { id: "tomato", name: "Tomato", emoji: "🍅", color: "0, 75%, 50%" },
  { id: "potato", name: "Potato", emoji: "🥔", color: "30, 50%, 45%" },
  { id: "soybean", name: "Soybean", emoji: "🫘", color: "80, 40%, 45%" },
  { id: "groundnut", name: "Groundnut", emoji: "🥜", color: "30, 60%, 45%" },
  { id: "onion", name: "Onion", emoji: "🧅", color: "300, 30%, 50%" },
  { id: "chilli", name: "Chilli Pepper", emoji: "🌶️", color: "0, 85%, 50%" },
  { id: "turmeric", name: "Turmeric", emoji: "🟡", color: "45, 90%, 50%" },
];

interface CropDetail {
  soilReq: string;
  seedSelection: string;
  watering: string;
  fertilizer: string;
  season: string;
  mistakes: string;
  aiTip: string;
}

const cropDetails: Record<string, CropDetail> = {
  rice: {
    soilReq: "Clay or loamy soil with strong water retention. Ideal pH: 5.5 - 7.0.",
    seedSelection: "Use certified HYV seeds like IR-64 or Pusa Basmati. Soak for 24 hours before sowing.",
    watering: "Requires high water volume. Maintain 2-5 cm standing water during the vegetative stage.",
    fertilizer: "Basal dose of P & K + 1/3 N at transplanting. Top dress remaining N in 2 splits.",
    season: "Kharif (Monsoon). Best sown in June-July.",
    mistakes: "Draining fields too early before harvest; letting soil crack during early growth.",
    aiTip: "Expected rainfall is optimal this week. No additional borewell irrigation needed for the next 4 days."
  },
  wheat: {
    soilReq: "Well-drained loamy to clay loam. Deep plowing recommended. Ideal pH: 6.0 - 7.5.",
    seedSelection: "Use varieties resistant to yellow rust (e.g., HD-2967, PBW-343). Treat seeds with carbendazim.",
    watering: "Requires 5-6 controlled irrigations. Critical at Crown Root Initiation (CRI) 21 days after sowing.",
    fertilizer: "Half N + full P&K as basal input. Add the remaining N at first irrigation and tillering.",
    season: "Rabi (Winter). Best sown in October-November.",
    mistakes: "Delaying the first irrigation beyond 25 days; over-watering mature crops.",
    aiTip: "Temperatures are unusually warm. Look out for early signs of aphids and ensure CRI irrigation is on time."
  },
  cotton: {
    soilReq: "Deep black soil (regur) or well-drained alluvial. Ideal pH: 5.8 - 8.0.",
    seedSelection: "Bt Cotton hybrids are highly recommended. Treat for sucking pests before planting.",
    watering: "Needs moderate water initially, then strict dry periods during boll opening.",
    fertilizer: "Heavy feeder. Split nitrogen application into 3-4 doses to prevent excessive vegetative growth.",
    season: "Kharif. Best sown April-July depending on irrigation availability.",
    mistakes: "Waterlogging during early stages; late sowing leading to pink bollworm attacks.",
    aiTip: "Bollworm activity peaks in your region next month. Prepare preventive pheromone traps now."
  },
  tomato: {
    soilReq: "Fertile, well-drained sandy loam. Cannot tolerate waterlogging. Ideal pH: 6.0 - 7.0.",
    seedSelection: "Choose indeterminate hybrids for greenhouse, or determinate varieties like Arka Rakshak for open fields.",
    watering: "Requires consistent moisture. Drip irrigation preferred to keep leaves dry and prevent blight.",
    fertilizer: "Requires rich calcium and potassium. Use Calcium Nitrate to prevent blossom end rot.",
    season: "Can be grown year-round if temperature remains 15-30°C.",
    mistakes: "Overhead watering right before sunset; planting in soil where potatoes grew last year.",
    aiTip: "Humidity is rising locally. Switch to drip irrigation exclusively to prevent Early Blight spore spread."
  }
};

const defaultDetails = {
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

  const crop = crops.find(c => c.id === selectedCrop);
  const details = selectedCrop ? (cropDetails[selectedCrop] || defaultDetails) : null;

  const sections = details ? [
    { icon: Sprout, title: "Soil Requirements", content: details.soilReq, color: "text-amber-700", bg: "bg-amber-100 dark:bg-amber-900/30" },
    { icon: Wheat, title: "Seed Selection Tips", content: details.seedSelection, color: "text-emerald-600", bg: "bg-emerald-100 dark:bg-emerald-900/30" },
    { icon: Droplets, title: "Watering Schedule", content: details.watering, color: "text-sky-600", bg: "bg-sky-100 dark:bg-sky-900/30" },
    { icon: Sun, title: "Fertilizer Usage", content: details.fertilizer, color: "text-yellow-600", bg: "bg-yellow-100 dark:bg-yellow-900/30" },
    { icon: CloudSun, title: "Best Season to Grow", content: details.season, color: "text-orange-600", bg: "bg-orange-100 dark:bg-orange-900/30" },
    { icon: AlertTriangle, title: "Common Mistakes", content: details.mistakes, color: "text-destructive", bg: "bg-destructive/10" },
  ] : [];

  return (
    <AppLayout>
      <div className="max-w-xl mx-auto px-4 py-4 pb-24">
        <AnimatePresence mode="wait">
          {!selectedCrop ? (
            <motion.div
              key="list-view"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="space-y-4"
            >
              <div>
                <h1 className="text-xl font-display font-bold text-foreground mb-1">Crop Advice & Insights 🌱</h1>
                <p className="text-sm text-muted-foreground">Select a specific crop for tailored AI cultivation guidance.</p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {crops.map((c, i) => (
                  <motion.button
                    key={c.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => setSelectedCrop(c.id)}
                    className="glass-card rounded-2xl p-4 flex flex-col items-center gap-2 hover:shadow-lg transition-all"
                  >
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                      style={{ background: `hsla(${c.color}, 0.15)` }}
                    >
                      {c.emoji}
                    </div>
                    <span className="text-[11px] font-semibold text-foreground text-center leading-tight">{c.name}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="detail-view"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-4"
            >
              <button 
                onClick={() => setSelectedCrop(null)} 
                className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors bg-muted/50 px-3 py-1.5 rounded-full outline-none focus:ring-2 focus:ring-primary"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Library
              </button>

              <div className="flex items-center gap-4 mb-2">
                <div 
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-sm"
                  style={{ background: `hsla(${crop?.color}, 0.15)` }}
                >
                  {crop?.emoji}
                </div>
                <div>
                  <h1 className="text-2xl font-display font-bold text-foreground tracking-tight">{crop?.name} Guide</h1>
                  <p className="text-sm text-muted-foreground">Detailed cultivation advice</p>
                </div>
              </div>

              {/* AI Dynamic Box */}
              <div className="relative overflow-hidden rounded-2xl border border-sky-200 dark:border-sky-900 bg-sky-50 dark:bg-sky-950/20 p-4 shadow-sm">
                <div className="absolute -top-6 -right-6 w-24 h-24 bg-sky-200 dark:bg-sky-900 rounded-full blur-2xl opacity-50" />
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                    <h3 className="text-sm font-bold text-sky-900 dark:text-sky-100">AI Assistant Suggestion</h3>
                  </div>
                  <p className="text-sm text-sky-800 dark:text-sky-200/90 leading-relaxed font-medium">
                    "{details?.aiTip}"
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {sections.map((s, i) => (
                  <motion.div
                    key={s.title}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="glass-card rounded-2xl p-4 border border-border/40 hover:border-border transition-colors group"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${s.bg}`}>
                        <s.icon className={`w-4.5 h-4.5 ${s.color}`} />
                      </div>
                      <h3 className="text-sm font-bold text-foreground">{s.title}</h3>
                    </div>
                    <p className="text-[13px] text-muted-foreground leading-relaxed font-medium">
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
