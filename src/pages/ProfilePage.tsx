import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, Phone, MapPin, Tractor, Droplets, Sprout, History,
  FileText, Bell, Leaf, LogOut, Edit, MapPinned, ChevronDown, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import AppLayout from "@/components/AppLayout";

const ProfilePage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [expandedRecord, setExpandedRecord] = useState<string | null>(null);

  const [profile, setProfile] = useState({
    name: `${user?.firstName || "Demo"} ${user?.lastName || "Farmer"}`,
    phone: user?.phone || "+91 9876543210",
    state: "Maharashtra",
    district: "Nashik",
    village: "Ozar",
    pincode: "422207",
    farmSize: "5 acres",
    soilType: "Black/Clay",
    irrigation: "Drip + Canal",
    currentCrops: "Tomato, Onion",
    cropHistory: "Rice (2024), Wheat (2023), Sugarcane (2023)",
  });

  const [detectingLocation, setDetectingLocation] = useState(false);

  const handleDetectLocation = () => {
    if (!("geolocation" in navigator)) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }
    setDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          const locRes = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`);
          const locData = await locRes.json();
          
          const newState = locData.principalSubdivision || profile.state;
          const newDistrict = locData.city || profile.district;
          const newVillage = locData.locality || locData.subLocality || profile.village;
          const newPincode = locData.postcode || profile.pincode;

          setProfile(p => ({
            ...p,
            state: newState,
            district: newDistrict,
            village: newVillage,
            pincode: newPincode
          }));
          
          toast.success(`Location detected: ${newState}, ${newDistrict}`);
        } catch (err) {
          toast.error("Failed to detect location details");
        } finally {
          setDetectingLocation(false);
        }
      },
      () => {
        setDetectingLocation(false);
        toast.error("Location access denied. Please allow it in your browser.");
      }
    );
  };

  const handleLogout = () => {
    logout();
    navigate("/auth");
  };

  const isNewUser = (user?.firstName || "Demo") === "Demo"; // Simulating new user behavior without records
  
  const records = [
    { id: "soil", icon: FileText, label: "Soil Test Reports", count: isNewUser ? 0 : 3, status: isNewUser ? "No history" : "Last: Jan 2026", details: isNewUser ? [] : ["Jan 15, 2026 - Black/Clay analysis completed", "Oct 12, 2025 - NPK test results normal", "May 5, 2025 - Baseline soil health check"] },
    { id: "water", icon: Droplets, label: "Water Test Reports", count: isNewUser ? 0 : 2, status: isNewUser ? "No history" : "Last: Dec 2025", details: isNewUser ? [] : ["Dec 20, 2025 - Borewell pH 6.8", "Aug 14, 2025 - Canal water quality check"] },
    { id: "service", icon: Bell, label: "Service Requests", count: isNewUser ? 0 : 5, status: isNewUser ? "No active" : "2 Active", details: isNewUser ? [] : ["Mar 25, 2026 - Drone Spraying (Active)", "Mar 20, 2026 - Tractor Rental (Active)", "Jan 10, 2026 - Soil Testing (Completed)"] },
    { id: "disease", icon: Sprout, label: "Disease Detections", count: isNewUser ? 0 : 8, status: isNewUser ? "None" : "Latest: Leaf Spot", details: isNewUser ? [] : ["Mar 12, 2026 - Early Blight on Tomato", "Feb 28, 2026 - Leaf Spot on Wheat", "Jan 5, 2026 - Plant is Healthy"] },
    { id: "tips", icon: Leaf, label: "Crop Tips Viewed", count: isNewUser ? 0 : 12, status: isNewUser ? "None" : "Rice, Wheat, Tomato", details: isNewUser ? [] : ["Mar 29, 2026 - Tomato Fertilizer Guide", "Mar 20, 2026 - Wheat Harvesting best practices", "Feb 15, 2026 - Rice Irrigation Schedule"] },
  ];

  return (
    <AppLayout>
      <div className="max-w-lg mx-auto px-4 py-4 space-y-5">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-display font-bold text-foreground">Profile 👤</h1>
          <Button onClick={() => setEditing(!editing)} variant="outline" size="sm" className="h-8 text-xs">
            <Edit className="w-3 h-3 mr-1" /> {editing ? "Save" : "Edit"}
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center text-2xl font-bold" style={{ color: "white" }}>
            {(user?.firstName?.[0] || "D")}{(user?.lastName?.[0] || "F")}
          </div>
          <div>
            <h2 className="text-lg font-display font-bold text-foreground">{profile.name}</h2>
            <p className="text-sm text-muted-foreground">{user?.email || "demo@farmai.com"}</p>
          </div>
        </div>

        <section className="glass-card rounded-2xl p-4 space-y-3">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <User className="w-4 h-4 text-primary" /> Personal Details
          </h3>
          {[
            { icon: Phone, label: "Phone", key: "phone" as const },
            { icon: MapPin, label: "State", key: "state" as const },
            { icon: MapPin, label: "District", key: "district" as const },
            { icon: MapPin, label: "Village", key: "village" as const },
            { icon: MapPinned, label: "Pincode", key: "pincode" as const },
          ].map((field) => (
            <div key={field.key} className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <field.icon className="w-3.5 h-3.5" />
                {field.label}
              </div>
              {editing ? (
                <Input
                  value={profile[field.key]}
                  onChange={(e) => setProfile(p => ({ ...p, [field.key]: e.target.value }))}
                  className="w-40 h-8 text-sm bg-muted border-0"
                />
              ) : (
                <span className="text-sm font-medium text-foreground">{profile[field.key]}</span>
              )}
            </div>
          ))}
          <Button onClick={handleDetectLocation} disabled={detectingLocation} variant="outline" size="sm" className="w-full mt-4 h-9 text-xs">
            {detectingLocation ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <MapPin className="w-3 h-3 mr-1" />}
            {detectingLocation ? "Detecting..." : "Auto-detect Live Location"}
          </Button>
        </section>

        <section className="glass-card rounded-2xl p-4 space-y-3">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Tractor className="w-4 h-4 text-primary" /> Farm Information
          </h3>
          {[
            { label: "Farm Size", value: profile.farmSize },
            { label: "Soil Type", value: profile.soilType },
            { label: "Irrigation", value: profile.irrigation },
            { label: "Current Crops", value: profile.currentCrops },
            { label: "Crop History", value: profile.cropHistory },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{item.label}</span>
              <span className="text-sm font-medium text-foreground">{item.value}</span>
            </div>
          ))}
        </section>

        <section className="glass-card rounded-2xl p-4 space-y-2">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-2">
            <History className="w-4 h-4 text-primary" /> Records & History
          </h3>
          {records.map((r, i) => (
            <div key={r.id} className="bg-muted rounded-xl overflow-hidden">
              <motion.button
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => setExpandedRecord(expandedRecord === r.id ? null : r.id)}
                className="w-full flex items-center justify-between px-3 py-2.5 bg-transparent border-0 cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                style={{ textAlign: 'left' }}
              >
                <div className="flex items-center gap-2">
                  <r.icon className="w-4 h-4 text-primary" />
                  <div>
                    <p className="text-xs font-semibold text-foreground">{r.label}</p>
                    <p className="text-[10px] text-muted-foreground">{r.status}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">{r.count}</span>
                  <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${expandedRecord === r.id ? "rotate-180" : ""}`} />
                </div>
              </motion.button>
              
              <AnimatePresence>
                {expandedRecord === r.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden bg-background/50"
                  >
                    <div className="p-3 pt-0 space-y-1.5 border-t border-border/10 mt-1">
                      {r.details.length > 0 ? (
                        r.details.map((detail, idx) => (
                          <div key={idx} className="text-xs text-muted-foreground pl-6 relative">
                            <span className="absolute left-2 top-[5px] w-1.5 h-1.5 rounded-full bg-primary/50" />
                            {detail}
                          </div>
                        ))
                      ) : (
                        <div className="text-xs text-muted-foreground text-center italic py-2">
                          No recent records found.
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </section>

        <Button onClick={handleLogout} variant="outline" className="w-full border-destructive/30 text-destructive hover:bg-destructive/10">
          <LogOut className="w-4 h-4 mr-2" /> Sign Out
        </Button>
      </div>
    </AppLayout>
  );
};

export default ProfilePage;
