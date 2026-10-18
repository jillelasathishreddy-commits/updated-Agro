import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Upload, Camera, AlertTriangle, CheckCircle, Leaf, Bug, Pill, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import AppLayout from "@/components/AppLayout";
import diseasedLeafImg from "@/assets/diseased-leaf.jpg";

interface DiagnosisResult {
  disease: string;
  confidence: number;
  cause: string;
  symptoms: string[];
  treatment: string[];
  pesticides: string[];
}

const mockDiagnoses: DiagnosisResult[] = [
  {
    disease: "Leaf Spot (Cercospora)",
    confidence: 92,
    cause: "Fungal infection caused by Cercospora species. Thrives in warm, humid conditions with poor air circulation.",
    symptoms: [
      "Brown to dark brown circular spots on leaves",
      "Yellow halo around spots",
      "Premature leaf drop",
      "Spots may merge forming large necrotic areas",
    ],
    treatment: [
      "Remove and destroy infected leaves",
      "Improve air circulation between plants",
      "Avoid overhead irrigation",
      "Apply fungicides at early symptom stage",
    ],
    pesticides: [
      "Mancozeb 75% WP — 2g/L spray",
      "Carbendazim 50% WP — 1g/L spray",
      "Copper oxychloride — 3g/L spray",
    ],
  },
];

const DiseaseDetectionPage = () => {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<DiagnosisResult | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setUploadedImage(ev.target?.result as string);
      setResult(null);
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyze = () => {
    setAnalyzing(true);
    setTimeout(() => {
      setResult(mockDiagnoses[0]);
      setAnalyzing(false);
    }, 2500);
  };

  return (
    <AppLayout>
      <div className="max-w-lg mx-auto px-4 py-4 space-y-5">
        <div>
          <h1 className="text-xl font-display font-bold text-foreground mb-1">Disease Detection 🔬</h1>
          <p className="text-sm text-muted-foreground">Upload a leaf photo for AI-powered diagnosis</p>
        </div>

        <div
          onClick={() => fileRef.current?.click()}
          className="glass-card rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer hover:shadow-lg transition-all min-h-[200px] border-2 border-dashed border-primary/30"
        >
          {uploadedImage ? (
            <img src={uploadedImage} alt="Uploaded leaf" className="max-h-48 rounded-xl object-contain" />
          ) : (
            <>
              <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mb-3">
                <Camera className="w-8 h-8" style={{ color: "white" }} />
              </div>
              <p className="text-sm font-semibold text-foreground mb-1">Upload Plant Image</p>
              <p className="text-xs text-muted-foreground">Tap to capture or select from gallery</p>
            </>
          )}
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
        </div>

        {uploadedImage && !result && (
          <Button onClick={handleAnalyze} disabled={analyzing} className="w-full gradient-primary border-0 font-semibold h-12">
            {analyzing ? (
              <motion.span animate={{ opacity: [1, 0.5, 1] }} transition={{ repeat: Infinity, duration: 1 }}>
                Analyzing with AI...
              </motion.span>
            ) : "Detect Disease"}
          </Button>
        )}

        {result && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
            <div className="glass-card rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                  <h3 className="font-semibold text-foreground">{result.disease}</h3>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: "hsla(0,72%,51%,0.1)", color: "hsl(0,72%,51%)" }}>
                  {result.confidence}% match
                </span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{result.cause}</p>
            </div>

            <div className="glass-card rounded-2xl p-4">
              <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-primary" /> Reference Images
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <img src={diseasedLeafImg} alt="Disease reference" className="rounded-xl w-full h-24 object-cover" />
                <img src={diseasedLeafImg} alt="Disease reference 2" className="rounded-xl w-full h-24 object-cover brightness-110" />
              </div>
            </div>

            <div className="glass-card rounded-2xl p-4">
              <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                <Bug className="w-4 h-4 text-warning" /> Symptoms
              </h3>
              <ul className="space-y-1.5">
                {result.symptoms.map((s, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-warning mt-1.5 flex-shrink-0" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>

            <div className="glass-card rounded-2xl p-4">
              <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-primary" /> Treatment
              </h3>
              <ul className="space-y-1.5">
                {result.treatment.map((t, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                    <CheckCircle className="w-3 h-3 text-primary mt-1 flex-shrink-0" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>

            <div className="glass-card rounded-2xl p-4">
              <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                <Pill className="w-4 h-4 text-sky" /> Recommended Pesticides
              </h3>
              <div className="space-y-2">
                {result.pesticides.map((p, i) => (
                  <div key={i} className="bg-muted rounded-xl px-3 py-2 text-sm text-foreground">{p}</div>
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
