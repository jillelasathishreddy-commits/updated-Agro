import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Sprout, Wifi, Cpu, Leaf } from "lucide-react";
import logoImg from "@/assets/logo.png";

const stages = [
  {
    icon: Sprout,
    title: "Traditional Farming",
    desc: "Farmers cultivating lands with generations of knowledge",
    emoji: "🌾",
  },
  {
    icon: Leaf,
    title: "Modern Agriculture",
    desc: "Advanced irrigation & sustainable crop management",
    emoji: "🚜",
  },
  {
    icon: Wifi,
    title: "Smart Monitoring",
    desc: "Drones, sensors & real-time field monitoring",
    emoji: "📡",
  },
  {
    icon: Cpu,
    title: "AI-Powered Farming",
    desc: "Intelligent crop recommendations & disease detection",
    emoji: "🤖",
  },
];

const IntroPage = () => {
  const navigate = useNavigate();
  const [currentStage, setCurrentStage] = useState(0);
  const [showLogo, setShowLogo] = useState(false);

  useEffect(() => {
    const timers = [
      setTimeout(() => setCurrentStage(1), 1500),
      setTimeout(() => setCurrentStage(2), 3000),
      setTimeout(() => setCurrentStage(3), 4500),
      setTimeout(() => setShowLogo(true), 5800),
      setTimeout(() => navigate("/auth"), 7500),
    ];
    return () => timers.forEach(clearTimeout);
  }, [navigate]);

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center overflow-hidden"
      style={{ background: "linear-gradient(135deg, hsl(150,20%,6%), hsl(142,30%,12%), hsl(150,20%,6%))" }}>
      
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: Math.random() * 6 + 2,
            height: Math.random() * 6 + 2,
            background: `hsla(142, 60%, ${40 + Math.random() * 30}%, ${0.2 + Math.random() * 0.3})`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.3, 0.8, 0.3],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
        />
      ))}

      <div className="absolute top-0 left-0 w-full h-1">
        <div className="h-full gradient-primary animate-progress rounded-r-full" />
      </div>

      <AnimatePresence mode="wait">
        {!showLogo && (
          <motion.div
            key={currentStage}
            initial={{ opacity: 0, y: 40, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -40, scale: 0.9 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-center text-center px-6"
          >
            <div className="text-6xl mb-6">{stages[currentStage].emoji}</div>
            <motion.div
              className="w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center mb-6"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {(() => {
                const Icon = stages[currentStage].icon;
                return <Icon className="w-10 h-10" style={{ color: "white" }} />;
              })()}
            </motion.div>
            <h2 className="text-2xl md:text-3xl font-display font-bold mb-3" style={{ color: "hsl(0,0%,95%)" }}>
              {stages[currentStage].title}
            </h2>
            <p className="text-base md:text-lg max-w-md" style={{ color: "hsl(140,10%,60%)" }}>
              {stages[currentStage].desc}
            </p>
          </motion.div>
        )}

        {showLogo && (
          <motion.div
            key="logo"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center"
          >
            <img src={logoImg} alt="FarmAI Logo" className="w-24 h-24 mb-4" />
            <h1 className="text-4xl font-display font-bold" style={{ color: "hsl(0,0%,95%)" }}>
              Farm<span className="text-gradient-primary">AI</span>
            </h1>
            <p className="mt-2" style={{ color: "hsl(140,10%,60%)" }}>Smart Farming, Smarter Future</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute bottom-12 flex gap-2">
        {stages.map((_, i) => (
          <div
            key={i}
            className="h-1.5 rounded-full transition-all duration-500"
            style={{
              width: i === currentStage ? 32 : 8,
              background: i <= currentStage ? "hsl(142,60%,40%)" : "hsl(150,12%,25%)",
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default IntroPage;
