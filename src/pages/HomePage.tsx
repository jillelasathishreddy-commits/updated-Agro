import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CloudSun, Droplets, Wind, Thermometer, Sun, CloudRain,
  MapPin, ChevronRight, BarChart3, TrendingUp, Sprout, Bot, CloudLightning, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AppLayout from "@/components/AppLayout";
import { AiAssistantChat } from "@/components/AiAssistantChat";
import { useAuth } from "@/contexts/AuthContext";
import heroImg from "@/assets/hero-farm.jpg";
import cropsImg from "@/assets/crops-grid.jpg";
import droneImg from "@/assets/drone-spray.jpg";
import soilImg from "@/assets/soil-testing.jpg";

const sliderImages = [
  { src: heroImg, title: "Smart Farming Dashboard", subtitle: "AI-powered insights for your fields" },
  { src: cropsImg, title: "Crop Management", subtitle: "Track and optimize your yields" },
  { src: droneImg, title: "Precision Agriculture", subtitle: "Advanced drone monitoring services" },
  { src: soilImg, title: "Soil Analysis", subtitle: "Data-driven soil health recommendations" },
];
import { toast } from "sonner";

// Replaced static weather forecast with live accurate Open-Meteo API data integration

const CROP_DATABASE = [
  { name: "Rice (Paddy)", idealSoil: ["Alluvial", "Black/Clay", "Loamy"], minPh: 5.0, maxPh: 6.5, waterReq: ["Abundant"], baseYield: "4.5" },
  { name: "Wheat", idealSoil: ["Alluvial", "Black/Clay", "Loamy"], minPh: 6.0, maxPh: 7.5, waterReq: ["Moderate", "Abundant"], baseYield: "3.2" },
  { name: "Sugarcane", idealSoil: ["Alluvial", "Loamy", "Black/Clay"], minPh: 6.0, maxPh: 7.5, waterReq: ["Abundant", "Moderate"], baseYield: "70.0" },
  { name: "Cotton", idealSoil: ["Black/Clay", "Alluvial", "Loamy"], minPh: 5.8, maxPh: 8.0, waterReq: ["Moderate"], baseYield: "1.8" },
  { name: "Soybean", idealSoil: ["Black/Clay", "Loamy", "Alluvial"], minPh: 6.0, maxPh: 7.0, waterReq: ["Moderate"], baseYield: "2.1" },
  { name: "Groundnut", idealSoil: ["Red", "Sandy", "Loamy"], minPh: 5.3, maxPh: 6.6, waterReq: ["Moderate", "Scarce", "Rainfed Only"], baseYield: "1.5" },
  { name: "Millets (Jowar)", idealSoil: ["Red", "Sandy", "Laterite", "Black/Clay"], minPh: 5.5, maxPh: 7.5, waterReq: ["Scarce", "Rainfed Only", "Moderate"], baseYield: "1.2" },
  { name: "Tea", idealSoil: ["Laterite", "Loamy", "Red"], minPh: 4.5, maxPh: 5.5, waterReq: ["Abundant"], baseYield: "2.2" },
  { name: "Coffee", idealSoil: ["Laterite", "Red"], minPh: 5.0, maxPh: 6.0, waterReq: ["Abundant", "Moderate"], baseYield: "1.5" },
  { name: "Tomato", idealSoil: ["Loamy", "Alluvial", "Red"], minPh: 6.0, maxPh: 7.0, waterReq: ["Moderate"], baseYield: "25.0" },
  { name: "Potato", idealSoil: ["Sandy", "Loamy", "Red", "Alluvial"], minPh: 5.0, maxPh: 6.5, waterReq: ["Moderate"], baseYield: "20.0" },
  { name: "Maize (Corn)", idealSoil: ["Loamy", "Red", "Black/Clay", "Alluvial"], minPh: 5.8, maxPh: 7.0, waterReq: ["Moderate", "Abundant"], baseYield: "3.5" },
  { name: "Cashew", idealSoil: ["Laterite", "Red", "Sandy"], minPh: 5.0, maxPh: 6.5, waterReq: ["Moderate", "Rainfed Only"], baseYield: "0.8" },
  { name: "Pulses (Dal)", idealSoil: ["Red", "Laterite", "Black/Clay", "Alluvial", "Sandy"], minPh: 5.5, maxPh: 7.5, waterReq: ["Scarce", "Rainfed Only", "Moderate"], baseYield: "1.1" },
  { name: "Banana", idealSoil: ["Alluvial", "Loamy", "Red"], minPh: 6.5, maxPh: 7.5, waterReq: ["Abundant"], baseYield: "35.0" },
];

const generateCropRecommendations = (soil: string, phVal: number, water: string) => {
  return CROP_DATABASE.map(crop => {
    let score = 50;

    if (crop.idealSoil.includes(soil)) score += 25;

    if (crop.waterReq.includes(water)) score += 15;
    else if (water === "Abundant" && crop.waterReq.includes("Moderate")) score += 5;
    else score -= 20;

    if (phVal >= crop.minPh && phVal <= crop.maxPh) score += 10;
    else score -= 15;

    score += (Math.random() * 10 - 5);
    score = Math.max(10, Math.min(99, Math.round(score)));

    return {
      name: crop.name,
      yield: `${crop.baseYield} tons/ha`,
      suitability: score
    };
  })
    .filter(crop => crop.suitability > 45)
    .sort((a, b) => b.suitability - a.suitability)
    .slice(0, 6);
};

const STATES = [
  "Andhra Pradesh", "Bihar", "Gujarat", "Haryana", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Punjab", "Rajasthan",
  "Tamil Nadu", "Telangana", "Uttar Pradesh", "West Bengal"
];

const defaultNPK: Record<string, { n: string, p: string, k: string }> = {
  "Alluvial": { n: "280", p: "15", k: "350" },
  "Black/Clay": { n: "220", p: "20", k: "400" },
  "Red": { n: "150", p: "12", k: "200" },
  "Laterite": { n: "120", p: "10", k: "150" },
  "Sandy": { n: "100", p: "10", k: "120" },
  "Loamy": { n: "250", p: "30", k: "250" },
};

const generateMarkets = (state: string, crop: string) => {
  const basePrices: Record<string, number> = {
    Rice: 2900,
    Wheat: 2500,
    Cotton: 7100,
    Sugarcane: 350,
    Soybean: 4600,
    Tomato: 2500,
  };

  const stateMultipliers: Record<string, number> = {
    "Maharashtra": 1.05, "Punjab": 0.95, "Uttar Pradesh": 0.9, "Karnataka": 1.1,
    "Tamil Nadu": 1.15, "Gujarat": 1.02, "Madhya Pradesh": 0.98, "Haryana": 0.96,
    "Andhra Pradesh": 1.08, "Rajasthan": 1.03, "West Bengal": 1.0, "Bihar": 0.85,
    "Kerala": 1.2, "Telangana": 1.05,
  };

  const mandis: Record<string, string[]> = {
    "Maharashtra": ["Nashik APMC", "Pune Market", "Nagpur Mandi"],
    "Punjab": ["Ludhiana Mandi", "Amritsar APMC", "Jalandhar Market"],
    "Uttar Pradesh": ["Kanpur Mandi", "Lucknow APMC", "Agra Market"],
    "Karnataka": ["Bengaluru APMC", "Hubli Market", "Mysuru Mandi"],
    "Tamil Nadu": ["Chennai Koyambedu", "Madurai Market", "Coimbatore APMC"],
    "Gujarat": ["Ahmedabad APMC", "Rajkot Mandi", "Surat Market"],
    "Madhya Pradesh": ["Indore Mandi", "Bhopal APMC", "Ujjain Market"],
    "Haryana": ["Karnal Mandi", "Hisar APMC", "Rohtak Market"],
    "Andhra Pradesh": ["Vijayawada APMC", "Guntur Market", "Visakhapatnam Mandi"],
    "Rajasthan": ["Jaipur Mandi", "Jodhpur APMC", "Bikaner Market"],
    "West Bengal": ["Kolkata APMC", "Burdwan Market", "Siliguri Mandi"],
    "Bihar": ["Patna Mandi", "Muzaffarpur APMC", "Bhagalpur Market"],
    "Kerala": ["Ernakulam Market", "Trivandrum APMC", "Kozhikode Mandi"],
    "Telangana": ["Hyderabad Bowenpally", "Warangal Mandi", "Nizamabad APMC"]
  };

  if (!state || !crop) return [];

  const basePrice = basePrices[crop] || 2000;
  const multiplier = stateMultipliers[state] || 1.0;
  const stateMandis = mandis[state] || ["Local Market 1", "Local Market 2"];

  const charSum = state.length + crop.length;

  return stateMandis.map((mandi, index) => {
    const variation = 1 + ((charSum + index * 7) % 11 - 5) / 100;
    const finalPrice = Math.round(basePrice * multiplier * variation);
    return {
      name: mandi,
      distance: `${10 + (index * 15 + charSum) % 50} km`,
      price: `₹${finalPrice.toLocaleString('en-IN')}/quintal`
    };
  });
};

interface WeatherData {
  current: {
    temperature_2m: number;
    relative_humidity_2m: number;
    precipitation: number;
    wind_speed_10m: number;
    weather_code: number;
  };
  daily: {
    time: string[];
    weather_code: number[];
    temperature_2m_max: number[];
    precipitation_probability_max: number[];
  };
}

const HomePage = () => {
  const { user } = useAuth();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [soilType, setSoilType] = useState("");
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [userLocationStr, setUserLocationStr] = useState("Locating...");
  const [locationError, setLocationError] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % sliderImages.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchLocationData = async (lat: number, lon: number) => {
      try {
        const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,weather_code&daily=weather_code,temperature_2m_max,precipitation_probability_max&timezone=auto`);
        const weatherData = await weatherRes.json();
        setWeatherData(weatherData);

        const locRes = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`);
        const locData = await locRes.json();
        
        const city = locData.city || locData.locality || "";
        const principal = locData.principalSubdivision || "";
        const country = locData.countryCode || "";
        
        if (city && principal) setUserLocationStr(`${city}, ${principal}`);
        else if (city) setUserLocationStr(`${city}, ${country}`);
        else if (principal) setUserLocationStr(`${principal}, ${country}`);
        else setUserLocationStr("Location Established");
        
      } catch (err) {
        console.error("Failed to fetch location data", err);
        setUserLocationStr("Location data unavailable");
      } finally {
        setWeatherLoading(false);
      }
    };

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocationError(false);
          fetchLocationData(position.coords.latitude, position.coords.longitude);
        },
        () => {
          setLocationError(true);
          setWeatherLoading(false);
          setUserLocationStr("Location Required");
        }
      );
    } else {
      setLocationError(true);
      setWeatherLoading(false);
      setUserLocationStr("Location not supported");
    }
  }, []);

  const getWeatherIcon = (code: number) => {
    if (code === 0) return Sun;
    if (code >= 1 && code <= 48) return CloudSun;
    if (code >= 51 && code <= 82) return CloudRain;
    if (code >= 95) return CloudLightning;
    return Sun;
  };
  
  const getWeatherDesc = (code: number) => {
    if (code === 0) return "Clear Sky";
    if (code >= 1 && code <= 3) return "Partly Cloudy";
    if (code >= 45 && code <= 48) return "Foggy";
    if (code >= 51 && code <= 67) return "Rain";
    if (code >= 80 && code <= 82) return "Showers";
    if (code >= 95) return "Thunderstorms";
    return "Variable";
  };

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [moisture, setMoisture] = useState("");
  const [ph, setPh] = useState("");
  const [nValue, setNValue] = useState("");
  const [pValue, setPValue] = useState("");
  const [kValue, setKValue] = useState("");
  const [water, setWater] = useState("");
  const [location, setLocation] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [dynamicCrops, setDynamicCrops] = useState<{ name: string; yield: string; suitability: number }[]>([]);
  const [detectingLocation, setDetectingLocation] = useState(false);

  const handleAutoDetectLocation = () => {
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
          const city = locData.city || locData.locality || "";
          const principal = locData.principalSubdivision || "";
          const finalLoc = city && principal ? `${city}, ${principal}` : city || principal || "Unknown Location";
          setLocation(finalLoc);
          toast.success("Location detected successfully!");
        } catch (err) {
          toast.error("Failed to detect location name");
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

  const handleSoilTypeChange = (val: string) => {
    setSoilType(val);
    if (defaultNPK[val]) {
      setNValue(defaultNPK[val].n);
      setPValue(defaultNPK[val].p);
      setKValue(defaultNPK[val].k);
    }
  };

  const [marketLocation, setMarketLocation] = useState("");
  const [marketCrop, setMarketCrop] = useState("");
  const [showMarket, setShowMarket] = useState(false);

  const handleAnalyze = (e: React.FormEvent) => {
    e.preventDefault();
    if (!soilType || !moisture || !ph || !nValue || !pValue || !kValue || !water || !location) {
      toast.error("Please fill in all analysis fields to get accurate recommendations.");
      return;
    }
    const phNumber = parseFloat(ph);
    if (isNaN(phNumber)) {
      toast.error("Please enter a valid numeric pH value.");
      return;
    }

    const newRecs = generateCropRecommendations(soilType, phNumber, water);
    setDynamicCrops(newRecs);
    setShowResults(true);
  };

  return (
    <AppLayout>
      <div className="max-w-lg mx-auto px-4 py-4 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Welcome back,</p>
            <h1 className="text-xl font-display font-bold text-foreground">
              {user?.firstName || "Farmer"} 👋
            </h1>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="w-3 h-3" />
            <span>{userLocationStr}</span>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative rounded-2xl overflow-hidden h-40 bg-muted group"
        >
          <AnimatePresence mode="wait">
            <motion.img
              key={currentSlide}
              src={sliderImages[currentSlide].src}
              alt={sliderImages[currentSlide].title}
              className="absolute inset-0 w-full h-full object-cover"
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            />
          </AnimatePresence>
          <div className="absolute inset-0" style={{ background: "linear-gradient(to right, hsla(142,40%,15%,0.85), hsla(142,40%,15%,0.2))" }} />
          
          <AnimatePresence mode="wait">
            <motion.div 
              key={currentSlide}
              className="absolute inset-0 flex flex-col justify-center px-5"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <h2 className="text-lg font-display font-bold text-white drop-shadow-md">{sliderImages[currentSlide].title}</h2>
              <p className="text-xs mt-1 text-white/90 drop-shadow-md">{sliderImages[currentSlide].subtitle}</p>
            </motion.div>
          </AnimatePresence>

          <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-10">
            {sliderImages.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentSlide(idx)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === currentSlide ? "w-4 bg-white" : "w-1.5 bg-white/50 hover:bg-white/80"
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </motion.div>

        <section>
          <h2 className="text-lg font-display font-semibold text-foreground mb-3 flex items-center gap-2">
            <CloudSun className="w-5 h-5 text-sky" /> Today's Weather
          </h2>
          
          {locationError ? (
            <div className="glass-card rounded-2xl p-6 flex flex-col items-center justify-center min-h-[200px] text-center border border-destructive/20 bg-destructive/5">
              <MapPin className="w-8 h-8 text-destructive/80 mb-3" />
              <p className="text-sm font-semibold text-foreground">Location Access Required</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-[250px]">Please enable location services in your browser to view your live weather forecast.</p>
            </div>
          ) : weatherLoading || !weatherData ? (
            <div className="glass-card rounded-2xl p-6 flex flex-col items-center justify-center min-h-[200px]">
              <Loader2 className="w-8 h-8 text-primary animate-spin mb-3" />
              <p className="text-sm text-muted-foreground">Loading exact location weather...</p>
            </div>
          ) : (
            <>
              <div className="glass-card rounded-2xl p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-display font-bold text-foreground">
                        {Math.round(weatherData.current.temperature_2m)}°
                      </span>
                      <span className="text-sm text-muted-foreground">C</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {getWeatherDesc(weatherData.current.weather_code)}
                    </p>
                  </div>
                  {(() => {
                    const CurrentIcon = getWeatherIcon(weatherData.current.weather_code);
                    return <CurrentIcon className="w-14 h-14 text-accent" />;
                  })()}
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { icon: Droplets, label: "Humidity", value: `${Math.round(weatherData.current.relative_humidity_2m)}%` },
                    { icon: Wind, label: "Wind", value: `${Math.round(weatherData.current.wind_speed_10m)} km/h` },
                    { icon: CloudRain, label: "Rain", value: `${weatherData.current.precipitation} mm` },
                  ].map((item) => (
                    <div key={item.label} className="bg-muted rounded-xl p-2.5 text-center">
                      <item.icon className="w-4 h-4 mx-auto mb-1 text-primary" />
                      <p className="text-xs text-muted-foreground">{item.label}</p>
                      <p className="text-sm font-semibold text-foreground">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-3 glass-card rounded-2xl p-4">
                <h3 className="text-sm font-semibold text-foreground mb-3">7-Day Forecast</h3>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {weatherData.daily.time.slice(0, 7).map((dateStr: string, i: number) => {
                    const DayIcon = getWeatherIcon(weatherData.daily.weather_code[i]);
                    const date = new Date(dateStr);
                    const dayName = i === 0 ? "Today" : date.toLocaleDateString("en-US", { weekday: 'short' });
                    
                    return (
                      <div key={i} className="flex-shrink-0 bg-muted rounded-xl px-3 py-2 text-center min-w-[65px]">
                        <p className="text-xs text-muted-foreground">{dayName}</p>
                        <DayIcon className="w-5 h-5 mx-auto my-1.5 text-accent" />
                        <p className="text-sm font-semibold text-foreground">{Math.round(weatherData.daily.temperature_2m_max[i])}°</p>
                        <div className="flex items-center gap-0.5 justify-center mt-1">
                          <Droplets className="w-2.5 h-2.5 text-sky" />
                          <span className="text-[10px] text-muted-foreground">{weatherData.daily.precipitation_probability_max[i]}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </section>

        <section>
          <h2 className="text-lg font-display font-semibold text-foreground mb-3 flex items-center gap-2">
            <Sprout className="w-5 h-5 text-primary" /> Soil & Water Analysis
          </h2>
          <form onSubmit={handleAnalyze} className="glass-card rounded-2xl p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Soil Type</label>
                <Select value={soilType} onValueChange={handleSoilTypeChange}>
                  <SelectTrigger className="h-10 bg-muted border-0"><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {["Alluvial", "Black/Clay", "Red", "Laterite", "Sandy", "Loamy"].map(s => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Moisture (%)</label>
                <Input value={moisture} onChange={(e) => setMoisture(e.target.value)} placeholder="e.g. 45" className="h-10 bg-muted border-0" />
              </div>
              <div>
                <label className="text-xs text-muted-foregro
                und mb-1 block">pH Value</label>
                <Input value={ph} onChange={(e) => setPh(e.target.value)} placeholder="e.g. 6.5" className="h-10 bg-muted border-0" />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="text-xs text-muted-foreground mb-1 block">N / P / K (kg/ha)</label>
                <div className="flex gap-2">
                  <Input type="number" min="0" step="any" value={nValue} onChange={(e) => setNValue(e.target.value)} placeholder="N" className="h-10 bg-muted border-0 text-center px-2" title="Nitrogen" />
                  <Input type="number" min="0" step="any" value={pValue} onChange={(e) => setPValue(e.target.value)} placeholder="P" className="h-10 bg-muted border-0 text-center px-2" title="Phosphorus" />
                  <Input type="number" min="0" step="any" value={kValue} onChange={(e) => setKValue(e.target.value)} placeholder="K" className="h-10 bg-muted border-0 text-center px-2" title="Potassium" />
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Water Availability</label>
                <Select value={water} onValueChange={setWater}>
                  <SelectTrigger className="h-10 bg-muted border-0"><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {["Abundant", "Moderate", "Scarce", "Rainfed Only"].map(w => (
                      <SelectItem key={w} value={w}>{w}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 flex items-center justify-between">
                  <span>Location</span>
                </label>
                <div className="relative">
                  <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Village/City" className="h-10 bg-muted border-0 pr-10" />
                  <button type="button" onClick={handleAutoDetectLocation} disabled={detectingLocation} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors disabled:opacity-50" title="Auto Detect Location">
                    {detectingLocation ? <Loader2 className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
            <Button type="submit" className="w-full gradient-primary border-0 font-semibold">
              Analyze & Recommend Crops
            </Button>
          </form>

          {showResults && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-3 glass-card rounded-2xl p-4">
              <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" /> Recommended Crops
              </h3>
              <div className="space-y-2.5">
                {dynamicCrops.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic text-center py-2">No highly suitable crops found for these exact conditions.</p>
                ) : dynamicCrops.map((crop) => (
                  <div key={crop.name} className="flex items-center justify-between bg-muted rounded-xl px-3 py-2.5">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{crop.name}</p>
                      <p className="text-xs text-muted-foreground">Expected: {crop.yield}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 rounded-full bg-border overflow-hidden">
                        <div className="h-full rounded-full gradient-primary" style={{ width: `${crop.suitability}%` }} />
                      </div>
                      <span className="text-xs font-semibold text-primary">{crop.suitability}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </section>

        <section>
          <h2 className="text-lg font-display font-semibold text-foreground mb-3 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-accent" /> Crop Market Prices
          </h2>
          <div className="glass-card rounded-2xl p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Location</label>
                <Select value={marketLocation} onValueChange={setMarketLocation}>
                  <SelectTrigger className="h-10 bg-muted border-0"><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {STATES.map(s => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Crop</label>
                <Select value={marketCrop} onValueChange={setMarketCrop}>
                  <SelectTrigger className="h-10 bg-muted border-0"><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {["Rice", "Wheat", "Cotton", "Sugarcane", "Soybean", "Tomato"].map(c => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button onClick={() => setShowMarket(true)} className="w-full gradient-primary border-0 font-semibold">
              Find Market Prices
            </Button>
          </div>

          {showMarket && marketLocation && marketCrop && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-3 space-y-2">
              {generateMarkets(marketLocation, marketCrop).map((m) => (
                <div key={m.name} className="glass-card rounded-xl p-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{m.name}</p>
                    <p className="text-xs text-muted-foreground">{m.distance}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-primary">{m.price}</p>
                    <ChevronRight className="w-4 h-4 text-muted-foreground ml-auto" />
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </section>
      </div>

      <AiAssistantChat isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />

      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsChatOpen(!isChatOpen)}
        className="fixed bottom-24 right-5 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center cursor-pointer border-none"
        style={{
          background: "linear-gradient(135deg, hsl(142,60%,40%), hsl(120,45%,45%))",
          boxShadow: "0 8px 16px -4px hsla(142, 60%, 40%, 0.5)"
        }}
      >
        <Bot className="w-7 h-7 text-white" />
      </motion.button>
    </AppLayout>
  );
};

export default HomePage;
