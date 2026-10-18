import { useState } from "react";
import { motion } from "framer-motion";
import { FlaskConical, Droplets, Plane, Eye, Building2, Phone, ArrowLeft, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import AppLayout from "@/components/AppLayout";
import droneImg from "@/assets/drone-spray.jpg";
import soilImg from "@/assets/soil-testing.jpg";

const services = [
  {
    id: "soil",
    name: "Soil Testing",
    icon: FlaskConical,
    desc: "Comprehensive soil analysis including NPK levels, pH, organic carbon, and micronutrients. Get personalized fertilizer recommendations.",
    img: soilImg,
    hasContact: true,
  },
  {
    id: "water",
    name: "Water Testing",
    icon: Droplets,
    desc: "Test irrigation water quality for TDS, hardness, pH, and contaminants. Ensure safe water for crops and optimal yield.",
    img: soilImg,
    hasContact: true,
  },
  {
    id: "drone",
    name: "Drone Spraying",
    icon: Plane,
    desc: "Precision pesticide and fertilizer spraying using agricultural drones. Cover large areas efficiently with minimal chemical wastage.",
    img: droneImg,
    hasContact: true,
  },
  {
    id: "monitor",
    name: "Farm Monitoring",
    icon: Eye,
    desc: "AI-powered field monitoring using satellite imagery and IoT sensors. Track crop health, soil moisture, and growth stages in real-time.",
    img: droneImg,
    hasMonitorOptions: true,
  },
  {
    id: "govt",
    name: "Government Schemes",
    icon: Building2,
    desc: "Get guidance on agricultural government schemes like PM-KISAN, crop insurance, subsidies, and loan programs. We help you apply.",
    img: null,
    hasContact: true,
  },
];

const ServicesPage = () => {
  const [selected, setSelected] = useState<string | null>(null);
  const [monitorType, setMonitorType] = useState<string | null>(null);
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState("");

  const service = services.find(s => s.id === selected);

  const handleContact = () => {
    toast.success("Request submitted! Our agent will contact you within 24 hours.");
    setTimeout(() => {
      setSelected(null);
      setMonitorType(null);
      setShowNotes(false);
      setNotes("");
    }, 1500);
  };

  return (
    <AppLayout>
      <div className="max-w-lg mx-auto px-4 py-4">
        {!selected ? (
          <>
            <h1 className="text-xl font-display font-bold text-foreground mb-1">Agricultural Services 🛠️</h1>
            <p className="text-sm text-muted-foreground mb-4">Professional farming services at your fingertip</p>
            <div className="space-y-3">
              {services.map((s, i) => (
                <motion.button
                  key={s.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  onClick={() => setSelected(s.id)}
                  className="w-full glass-card rounded-2xl p-4 flex items-center gap-4 text-left hover:shadow-lg transition-all"
                >
                  <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0">
                    <s.icon className="w-6 h-6" style={{ color: "white" }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-foreground">{s.name}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-2">{s.desc}</p>
                  </div>
                </motion.button>
              ))}
            </div>
          </>
        ) : (
          <>
            <button onClick={() => { setSelected(null); setMonitorType(null); setShowNotes(false); setNotes(""); }} className="flex items-center gap-1 text-sm text-muted-foreground mb-4 hover:text-foreground transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back
            </button>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
                  {service && <service.icon className="w-6 h-6" style={{ color: "white" }} />}
                </div>
                <h1 className="text-xl font-display font-bold text-foreground">{service?.name}</h1>
              </div>

              {service?.img && (
                <img src={service.img} alt={service.name} className="w-full h-40 object-cover rounded-2xl" />
              )}

              <div className="glass-card rounded-2xl p-4">
                <p className="text-sm text-muted-foreground leading-relaxed">{service?.desc}</p>
              </div>

              {service?.hasMonitorOptions && !monitorType && (
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-foreground">Select monitoring type:</p>
                  {[
                    { id: "single", label: "Single-Time Monitoring", desc: "One-time crop health assessment" },
                    { id: "full", label: "Full Lifecycle Monitoring", desc: "Complete crop cycle monitoring from sowing to harvest" },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setMonitorType(opt.id)}
                      className="w-full glass-card rounded-xl p-3 text-left hover:shadow-md transition-all flex items-center gap-3"
                    >
                      <CheckCircle className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-sm font-semibold text-foreground">{opt.label}</p>
                        <p className="text-xs text-muted-foreground">{opt.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {(service?.hasContact || monitorType) && !showNotes && (
                <Button onClick={() => setShowNotes(true)} className="w-full gradient-primary border-0 font-semibold h-12">
                  <Phone className="w-4 h-4 mr-2" /> Contact Agent
                </Button>
              )}

              {showNotes && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                  <p className="text-sm font-semibold text-foreground">Additional Notes</p>
                  <Textarea 
                    value={notes} 
                    onChange={(e) => setNotes(e.target.value)} 
                    placeholder="Enter any specific requirements or details here..." 
                    className="min-h-[100px] bg-muted border-0 resize-none text-sm"
                  />
                  <Button onClick={handleContact} className="w-full gradient-primary border-0 font-semibold h-12">
                    <CheckCircle className="w-4 h-4 mr-2" /> Confirm & Contact Agent
                  </Button>
                </motion.div>
              )}
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
};

export default ServicesPage;
