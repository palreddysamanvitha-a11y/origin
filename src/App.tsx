import React, { useState, useRef, useCallback } from 'react';
import { 
  Camera, 
  Upload, 
  Sparkles, 
  User, 
  CheckCircle2, 
  ArrowRight, 
  ShoppingBag, 
  Palette, 
  RotateCcw,
  Loader2,
  ChevronRight,
  Info,
  TrendingUp,
  Save,
  History
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { getStylingAdvice, StylingResult } from './services/gemini';
import { SkinToneDetector } from './components/SkinToneDetector';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const [image, setImage] = useState<string | null>(null);
  const [gender, setGender] = useState<'Male' | 'Female'>('Male');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<StylingResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [detectedTone, setDetectedTone] = useState<{ category: string; rgb: { r: number; g: number; b: number } } | null>(null);
  const [userName, setUserName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setError(null);
        setResult(null);
        setDetectedTone(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setError(null);
        setResult(null);
        setDetectedTone(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSkinToneDetected = useCallback((category: string, rgb: { r: number; g: number; b: number }) => {
    setDetectedTone({ category, rgb });
  }, []);

  const processStyling = async () => {
    if (!image) return;
    setIsProcessing(true);
    setError(null);
    try {
      const advice = await getStylingAdvice(image, gender, detectedTone?.category);
      setResult(advice);
      // Scroll to results
      setTimeout(() => {
        document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const saveProfile = async () => {
    if (!userName || !result) return;
    setIsSaving(true);
    try {
      const response = await fetch('/api/profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: userName,
          gender,
          skin_tone: result.skinTone
        })
      });
      if (response.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err) {
      console.error("Failed to save profile", err);
    } finally {
      setIsSaving(false);
    }
  };

  const reset = () => {
    setImage(null);
    setResult(null);
    setError(null);
    setDetectedTone(null);
    setSaveSuccess(false);
  };

  return (
    <div className="min-h-screen bg-[#fdfcfb] text-slate-900 font-sans selection:bg-rose-100">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-rose-500 rounded-lg flex items-center justify-center">
              <Sparkles className="text-white w-5 h-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">StyleAI</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#" className="hover:text-rose-500 transition-colors">Home</a>
            <a href="#features" className="hover:text-rose-500 transition-colors">Features</a>
            <a href="#try-it" className="hover:text-rose-500 transition-colors">Try It</a>
            <a href="#trends" className="hover:text-rose-500 transition-colors">Trends</a>
          </div>
          <button 
            onClick={() => document.getElementById('try-it')?.scrollIntoView({ behavior: 'smooth' })}
            className="bg-slate-900 text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-slate-800 transition-all active:scale-95"
          >
            Get Started
          </button>
        </div>
      </nav>

      <main className="pt-16">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-24 md:py-32">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-rose-100/50 blur-[120px] rounded-full" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-100/50 blur-[120px] rounded-full" />
          </div>

          <div className="max-w-7xl mx-auto px-6 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 text-rose-600 text-xs font-bold uppercase tracking-wider mb-6">
                <Sparkles className="w-3 h-3" />
                Next-Gen Fashion Advisor
              </span>
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-slate-900 mb-8 leading-[1.1]">
                Your Personal AI <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-orange-500">Fashion Stylist</span>
              </h1>
              <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto mb-12 leading-relaxed">
                Upload your photo and get professional styling recommendations based on your unique skin tone, gender, and current fashion trends.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button 
                  onClick={() => document.getElementById('try-it')?.scrollIntoView({ behavior: 'smooth' })}
                  className="w-full sm:w-auto bg-rose-500 text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-rose-200 hover:bg-rose-600 transition-all flex items-center justify-center gap-2 group"
                >
                  Start Styling Now
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <div className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-white border border-slate-100 shadow-sm">
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map((i) => (
                      <img 
                        key={i}
                        src={`https://picsum.photos/seed/user-${i}/100/100`} 
                        className="w-8 h-8 rounded-full border-2 border-white object-cover"
                        alt="User"
                        referrerPolicy="no-referrer"
                      />
                    ))}
                  </div>
                  <span className="text-sm font-medium text-slate-500">Trusted by 10k+ users</span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose StyleAI?</h2>
              <p className="text-slate-500">Advanced technology meets personal style.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {[
                { icon: Camera, title: "Instant Analysis", desc: "Upload a photo and get AI-powered results in seconds." },
                { icon: Palette, title: "Color Matching", desc: "Recommendations perfectly matched to your skin tone." },
                { icon: ShoppingBag, title: "Curated Links", desc: "Direct shopping links to top retailers like Myntra & Zara." },
                { icon: TrendingUp, title: "Trend Detection", desc: "Stay ahead with advice based on 2024-2025 trends." }
              ].map((feature, idx) => (
                <div key={idx} className="p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:shadow-xl hover:shadow-slate-100 transition-all group">
                  <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <feature.icon className="w-6 h-6 text-rose-500" />
                  </div>
                  <h3 className="text-lg font-bold mb-3">{feature.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Try It Section */}
        <section id="try-it" className="py-24 bg-[#fdfcfb]">
          <div className="max-w-4xl mx-auto px-6">
            <div className="bg-white rounded-[40px] p-8 md:p-12 shadow-2xl shadow-slate-200 border border-slate-100">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4">Let's Style You</h2>
                <p className="text-slate-500">Select your gender and upload a clear frontal photo.</p>
              </div>

              <div className="space-y-8">
                {/* Gender Selection */}
                <div className="flex flex-col items-center gap-4">
                  <label className="text-sm font-bold text-slate-400 uppercase tracking-widest">I am:</label>
                  <div className="flex p-1 bg-slate-100 rounded-2xl w-full max-w-xs">
                    {(['Male', 'Female'] as const).map((g) => (
                      <button
                        key={g}
                        onClick={() => setGender(g)}
                        className={cn(
                          "flex-1 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2",
                          gender === g 
                            ? "bg-white text-slate-900 shadow-sm" 
                            : "text-slate-500 hover:text-slate-700"
                        )}
                      >
                        <User className="w-4 h-4" />
                        {g}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Upload Area */}
                <div 
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  className={cn(
                    "relative aspect-video md:aspect-[21/9] rounded-3xl border-2 border-dashed transition-all flex flex-col items-center justify-center gap-4 cursor-pointer overflow-hidden group",
                    image ? "border-rose-500 bg-rose-50/30" : "border-slate-200 hover:border-rose-300 hover:bg-slate-50"
                  )}
                  onClick={() => !image && fileInputRef.current?.click()}
                >
                  {image ? (
                    <>
                      <img src={image} className="absolute inset-0 w-full h-full object-cover opacity-80" alt="Preview" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col items-center justify-end p-8">
                        <button 
                          onClick={(e) => { e.stopPropagation(); reset(); }}
                          className="bg-white/20 backdrop-blur-md text-white px-4 py-2 rounded-full text-xs font-bold hover:bg-white/30 transition-all flex items-center gap-2"
                        >
                          <RotateCcw className="w-3 h-3" />
                          Change Photo
                        </button>
                      </div>
                      <SkinToneDetector imageSrc={image} onDetected={onSkinToneDetected} />
                    </>
                  ) : (
                    <>
                      <div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Upload className="w-8 h-8 text-rose-500" />
                      </div>
                      <div className="text-center">
                        <p className="font-bold text-slate-700">Drag & Drop Your Photo</p>
                        <p className="text-xs text-slate-400 mt-1">or click to browse (JPG, PNG, WEBP)</p>
                      </div>
                    </>
                  )}
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleImageUpload} 
                    className="hidden" 
                    accept="image/*" 
                  />
                </div>

                {error && (
                  <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 text-sm flex items-center gap-3">
                    <Info className="w-5 h-5 shrink-0" />
                    {error}
                  </div>
                )}

                <button
                  disabled={!image || isProcessing}
                  onClick={processStyling}
                  className={cn(
                    "w-full py-5 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-3",
                    !image || isProcessing 
                      ? "bg-slate-100 text-slate-400 cursor-not-allowed" 
                      : "bg-slate-900 text-white hover:bg-slate-800 shadow-xl shadow-slate-200 active:scale-[0.98]"
                  )}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin" />
                      Analyzing your style...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-6 h-6" />
                      Get My Styling Advice
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Results Section */}
        <AnimatePresence>
          {result && (
            <motion.section 
              id="results"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              className="py-24 bg-white"
            >
              <div className="max-w-7xl mx-auto px-6">
                <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
                  <div>
                    <h2 className="text-4xl font-bold mb-4">Your Personalized Style Profile</h2>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-bold">
                        <User className="w-3 h-3" />
                        {gender}
                      </div>
                      <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 text-rose-600 text-xs font-bold">
                        <CheckCircle2 className="w-3 h-3" />
                        Analysis Complete
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={reset}
                      className="flex items-center gap-2 text-slate-400 hover:text-slate-600 text-sm font-bold transition-colors"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Try Again
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                  {/* Left Column: Skin Tone & Visuals */}
                  <div className="space-y-8">
                    <div className="bg-slate-50 rounded-[32px] p-8 border border-slate-100">
                      <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Skin Tone Analysis</h3>
                      <div className="flex items-center gap-6">
                        <div 
                          className="w-24 h-24 rounded-full shadow-inner border-4 border-white"
                          style={{ 
                            backgroundColor: detectedTone ? `rgb(${detectedTone.rgb.r}, ${detectedTone.rgb.g}, ${detectedTone.rgb.b})` : '#ccc' 
                          }}
                        />
                        <div>
                          <p className="text-2xl font-bold text-slate-900">{result.skinTone}</p>
                          <p className="text-sm text-slate-500">Detected by StyleAI</p>
                        </div>
                      </div>
                    </div>

                    {/* Trends Section */}
                    <div id="trends" className="bg-rose-50 rounded-[32px] p-8 border border-rose-100">
                      <h3 className="text-sm font-bold text-rose-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" />
                        Current Trends
                      </h3>
                      <ul className="space-y-4">
                        {result.trends.map((trend, i) => (
                          <li key={i} className="flex items-start gap-3">
                            <div className="w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                              {i + 1}
                            </div>
                            <span className="text-sm font-medium text-slate-700">{trend}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Save Profile Section */}
                    <div className="bg-slate-900 rounded-[32px] p-8 text-white">
                      <h3 className="text-sm font-bold text-white/40 uppercase tracking-widest mb-6 flex items-center gap-2">
                        <Save className="w-4 h-4" />
                        Save Profile
                      </h3>
                      <div className="space-y-4">
                        <input 
                          type="text" 
                          placeholder="Enter your name"
                          value={userName}
                          onChange={(e) => setUserName(e.target.value)}
                          className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-rose-500 transition-colors"
                        />
                        <button 
                          onClick={saveProfile}
                          disabled={!userName || isSaving}
                          className={cn(
                            "w-full py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2",
                            saveSuccess ? "bg-emerald-500 text-white" : "bg-white text-slate-900 hover:bg-slate-100"
                          )}
                        >
                          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : saveSuccess ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                          {saveSuccess ? "Saved!" : "Save to History"}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Middle Column: Detailed Recommendations */}
                  <div className="lg:col-span-2 space-y-8">
                    <div className="prose prose-slate max-w-none bg-white rounded-[32px] p-8 md:p-12 border border-slate-100 shadow-sm">
                      <div className="markdown-body">
                        <Markdown>{result.recommendations}</Markdown>
                      </div>
                    </div>

                    {/* Shopping Section */}
                    <div>
                      <h3 className="text-2xl font-bold mb-8 flex items-center gap-3">
                        <ShoppingBag className="text-rose-500" />
                        Shop Your Style
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {result.shoppingLinks.map((item, idx) => (
                          <a 
                            key={idx} 
                            href={item.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="group bg-white rounded-3xl p-4 border border-slate-100 hover:shadow-xl hover:shadow-slate-100 transition-all flex gap-4"
                          >
                            <div className="w-24 h-24 rounded-2xl overflow-hidden bg-slate-50 shrink-0">
                              <img 
                                src={`${item.image}?sig=${idx}`} 
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                                alt={item.title}
                                referrerPolicy="no-referrer"
                              />
                            </div>
                            <div className="flex flex-col justify-between py-1">
                              <div>
                                <h4 className="font-bold text-slate-900 line-clamp-1">{item.title}</h4>
                                <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-bold">{item.retailer}</p>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-rose-500 font-bold">{item.price}</span>
                                <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-rose-500 group-hover:text-white transition-colors">
                                  <ChevronRight className="w-4 h-4" />
                                </div>
                              </div>
                            </div>
                          </a>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 bg-rose-500 rounded-lg flex items-center justify-center">
                  <Sparkles className="text-white w-5 h-5" />
                </div>
                <span className="text-xl font-bold tracking-tight">StyleAI</span>
              </div>
              <p className="text-slate-400 max-w-sm leading-relaxed">
                Empowering individuals to look and feel their best through the power of artificial intelligence and personalized fashion guidance.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-6">Links</h4>
              <ul className="space-y-4 text-slate-400 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Home</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-6">Contact</h4>
              <ul className="space-y-4 text-slate-400 text-sm">
                <li>support@styleai.com</li>
                <li>+1 (555) 000-0000</li>
                <li>San Francisco, CA</li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500 font-medium uppercase tracking-widest">
            <p>© 2024 StyleAI. Powered by Advanced AI Technology.</p>
            <div className="flex items-center gap-6">
              <a href="#" className="hover:text-white transition-colors">Twitter</a>
              <a href="#" className="hover:text-white transition-colors">Instagram</a>
              <a href="#" className="hover:text-white transition-colors">LinkedIn</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
