import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, RefreshCw, Mail, Lock, User, Phone, CheckSquare } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import authBg from "@/assets/auth-bg.jpg";
import logoImg from "@/assets/logo.png";

const generateCaptcha = () => {
  // Use clear, unambiguous uppercase characters and digits (omits 0, O, 1, I, L)
  const chars = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
  let result = "";
  for (let i = 0; i < 5; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
  return result;
};

const AuthPage = () => {
  const navigate = useNavigate();
  const { login, register, user } = useAuth();
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [showPassword, setShowPassword] = useState(false);
  const [captcha, setCaptcha] = useState(generateCaptcha());
  const [captchaInput, setCaptchaInput] = useState("");

  const [loginEmail, setLoginEmail] = useState("demo@farmai.com");
  const [loginPassword, setLoginPassword] = useState("123456");

  const [regFirst, setRegFirst] = useState("");
  const [regLast, setRegLast] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirm, setRegConfirm] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);

  useEffect(() => {
    if (user) navigate("/home");
  }, [user, navigate]);

  const refreshCaptcha = useCallback(() => {
    setCaptcha(generateCaptcha());
    setCaptchaInput("");
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanInput = captchaInput.trim().toUpperCase();
    const cleanCaptcha = captcha.trim().toUpperCase();

    if (!cleanInput) {
      toast.error("Please enter the CAPTCHA code shown.");
      return;
    }

    if (cleanInput !== cleanCaptcha) {
      toast.error("Invalid CAPTCHA. Please check the code and try again.");
      refreshCaptcha();
      return;
    }

    const emailToUse = loginEmail.trim() || "demo@farmai.com";
    const passToUse = loginPassword.trim() || "123456";
    const success = login(emailToUse, passToUse);
    if (success) {
      toast.success("Welcome back, farmer!");
      navigate("/home");
    } else {
      toast.error("Invalid credentials. Try demo@farmai.com / 123456");
      refreshCaptcha();
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (regPassword !== regConfirm) {
      toast.error("Passwords do not match");
      return;
    }
    if (!agreeTerms) {
      toast.error("Please accept Terms & Conditions");
      return;
    }
    register({ email: regEmail, firstName: regFirst, lastName: regLast, phone: regPhone });
    toast.success("Registration successful!");
    navigate("/home");
  };

  return (
    <div className="min-h-screen flex relative" style={{ background: `hsl(var(--auth-bg))` }}>
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img src={authBg} alt="Farm" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to right, transparent 60%, hsl(220,20%,10%))" }} />
        <div className="relative z-10 flex flex-col justify-end p-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <h2 className="text-4xl font-display font-bold mb-3" style={{ color: "white" }}>
              Grow Smarter with AI
            </h2>
            <p className="text-lg max-w-md" style={{ color: "hsla(0,0%,100%,0.8)" }}>
              AI-powered crop recommendations, disease detection, and market insights for modern farmers.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md"
        >
          <div className="flex items-center gap-3 mb-8">
            <img src={logoImg} alt="FarmAI" className="w-10 h-10" />
            <span className="text-2xl font-display font-bold" style={{ color: "hsl(var(--auth-text))" }}>
              <i>AGRO</i><span className="text-gradient-primary"><i>PEC</i></span>
            </span>
          </div>

          <div className="flex gap-1 p-1 rounded-xl mb-8" style={{ background: "hsl(var(--auth-input))" }}>
            {(["login", "register"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="flex-1 py-2.5 rounded-lg text-sm font-semibold capitalize transition-all"
                style={{
                  background: activeTab === tab ? "hsl(142,60%,40%)" : "transparent",
                  color: activeTab === tab ? "white" : "hsl(var(--auth-muted))",
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          {activeTab === "login" ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block" style={{ color: "hsl(var(--auth-muted))" }}>Email or Phone</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "hsl(var(--auth-muted))" }} />
                  <Input
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="demo@farmai.com"
                    className="pl-10 border-0 h-12"
                    style={{ background: "hsl(var(--auth-input))", color: "hsl(var(--auth-text))" }}
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block" style={{ color: "hsl(var(--auth-muted))" }}>Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "hsl(var(--auth-muted))" }} />
                  <Input
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    type={showPassword ? "text" : "password"}
                    placeholder="123456"
                    className="pl-10 pr-10 border-0 h-12"
                    style={{ background: "hsl(var(--auth-input))", color: "hsl(var(--auth-text))" }}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2">
                    {showPassword ? <EyeOff className="w-4 h-4" style={{ color: "hsl(var(--auth-muted))" }} /> : <Eye className="w-4 h-4" style={{ color: "hsl(var(--auth-muted))" }} />}
                  </button>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-sm font-medium" style={{ color: "hsl(var(--auth-muted))" }}>
                    CAPTCHA Verification
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setCaptchaInput(captcha);
                      toast.info("CAPTCHA auto-filled!");
                    }}
                    className="text-xs text-primary hover:underline font-medium"
                  >
                    Auto-fill CAPTCHA
                  </button>
                </div>
                <div className="flex items-center gap-3 mb-2">
                  <div 
                    onClick={() => {
                      setCaptchaInput(captcha);
                      toast.info("CAPTCHA auto-filled!");
                    }}
                    title="Click to copy / auto-fill"
                    className="cursor-pointer px-4 py-2.5 rounded-lg font-mono text-xl font-bold tracking-[0.3em] select-none hover:opacity-90 transition border border-emerald-500/30 flex items-center justify-center shadow-xs"
                    style={{
                      background: "linear-gradient(135deg, hsl(220,15%,18%), hsl(220,15%,22%))",
                      color: "hsl(142,60%,50%)",
                    }}>
                    {captcha}
                  </div>
                  <button 
                    type="button" 
                    onClick={refreshCaptcha} 
                    title="Generate new CAPTCHA" 
                    className="p-2.5 rounded-lg hover:opacity-80 transition" 
                    style={{ background: "hsl(var(--auth-input))" }}
                  >
                    <RefreshCw className="w-4 h-4" style={{ color: "hsl(var(--auth-muted))" }} />
                  </button>
                </div>
                <Input
                  value={captchaInput}
                  onChange={(e) => setCaptchaInput(e.target.value)}
                  placeholder="Enter 5-character CAPTCHA"
                  className="border-0 h-12 text-sm"
                  style={{ background: "hsl(var(--auth-input))", color: "hsl(var(--auth-text))" }}
                  maxLength={6}
                />
                <span className="text-[11px] block mt-1" style={{ color: "hsl(var(--auth-muted))" }}>
                  Case-insensitive (uppercase or lowercase both accepted)
                </span>
              </div>

              <Button type="submit" className="w-full h-12 text-base font-semibold gradient-primary border-0 shadow-md">
                Sign In
              </Button>

              <div className="flex items-center justify-between text-xs pt-1 px-1">
                <span style={{ color: "hsl(var(--auth-muted))" }}>
                  Demo: demo@farmai.com / 123456
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setLoginEmail("demo@farmai.com");
                    setLoginPassword("123456");
                    setCaptchaInput(captcha);
                    toast.info("Demo credentials & CAPTCHA filled!");
                  }}
                  className="text-primary hover:underline font-semibold"
                >
                  Fill Demo Account
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium mb-1 block" style={{ color: "hsl(var(--auth-muted))" }}>First Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "hsl(var(--auth-muted))" }} />
                    <Input value={regFirst} onChange={(e) => setRegFirst(e.target.value)} placeholder="John" className="pl-10 border-0 h-11" style={{ background: "hsl(var(--auth-input))", color: "hsl(var(--auth-text))" }} required />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block" style={{ color: "hsl(var(--auth-muted))" }}>Last Name</label>
                  <Input value={regLast} onChange={(e) => setRegLast(e.target.value)} placeholder="Doe" className="border-0 h-11" style={{ background: "hsl(var(--auth-input))", color: "hsl(var(--auth-text))" }} required />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: "hsl(var(--auth-muted))" }}>Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "hsl(var(--auth-muted))" }} />
                  <Input value={regEmail} onChange={(e) => setRegEmail(e.target.value)} type="email" placeholder="you@email.com" className="pl-10 border-0 h-11" style={{ background: "hsl(var(--auth-input))", color: "hsl(var(--auth-text))" }} required />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: "hsl(var(--auth-muted))" }}>Phone</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "hsl(var(--auth-muted))" }} />
                  <Input value={regPhone} onChange={(e) => setRegPhone(e.target.value)} placeholder="+91 9876543210" className="pl-10 border-0 h-11" style={{ background: "hsl(var(--auth-input))", color: "hsl(var(--auth-text))" }} required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium mb-1 block" style={{ color: "hsl(var(--auth-muted))" }}>Password</label>
                  <Input value={regPassword} onChange={(e) => setRegPassword(e.target.value)} type="password" placeholder="••••••" className="border-0 h-11" style={{ background: "hsl(var(--auth-input))", color: "hsl(var(--auth-text))" }} required />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block" style={{ color: "hsl(var(--auth-muted))" }}>Confirm</label>
                  <Input value={regConfirm} onChange={(e) => setRegConfirm(e.target.value)} type="password" placeholder="••••••" className="border-0 h-11" style={{ background: "hsl(var(--auth-input))", color: "hsl(var(--auth-text))" }} required />
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer py-1">
                <input type="checkbox" checked={agreeTerms} onChange={(e) => setAgreeTerms(e.target.checked)} className="rounded" />
                <span className="text-xs" style={{ color: "hsl(var(--auth-muted))" }}>I agree to the Terms & Conditions</span>
              </label>
              <Button type="submit" className="w-full h-12 text-base font-semibold gradient-primary border-0">
                Create Account
              </Button>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default AuthPage;
