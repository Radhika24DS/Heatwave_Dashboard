import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import Logo from '../components/layout/Logo';
import { 
  Map, 
  LayoutDashboard, 
  BarChart3, 
  Bell, 
  ArrowRight, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle2, 
  Sparkles,
  HelpCircle
} from 'lucide-react';

const FEATURES = [
  {
    icon: <Map className="w-6 h-6 text-[#f97316]" />,
    title: 'Real-Time Risk Map',
    desc: 'See current heatwave risk levels color-coded across all 31 districts of Karnataka instantly.',
  },
  {
    icon: <LayoutDashboard className="w-6 h-6 text-[#f97316]" />,
    title: 'Role-Based Dashboards',
    desc: 'Personalized layouts and safety insights tailored for citizens, farmers, travelers, and meteorologists.',
  },
  {
    icon: <BarChart3 className="w-6 h-6 text-[#f97316]" />,
    title: 'AI Explanations',
    desc: 'Understand predictions through advanced SHAP feature contribution charts and confidence ratings.',
  },
  {
    icon: <Bell className="w-6 h-6 text-[#f97316]" />,
    title: 'Instant Alerts',
    desc: 'Automated warnings triggered when extreme heat thresholds are crossed, with direct authority approvals.',
  },
];

const TESTIMONIALS = [
  {
    quote: "This system saved my cotton crops during the intense 2024 heatwave. The night irrigation advice was crucial.",
    name: "Devendra Gowda",
    role: "Farmer",
    district: "Raichur",
    avatarBg: "bg-orange-100 text-orange-600"
  },
  {
    quote: "We use the traveler route planner daily for our delivery fleet to avoid heat hotspots between Bangalore and Mysore.",
    name: "Aisha Rahaman",
    role: "Logistics Manager",
    district: "Bengaluru",
    avatarBg: "bg-red-100 text-red-600"
  },
  {
    quote: "As district meteorologists, being able to edit and instantly dispatch alerts to 50K+ citizens changes the game.",
    name: "Dr. K. Sridhar",
    role: "District Meteorologist",
    district: "Kalaburagi",
    avatarBg: "bg-amber-100 text-amber-600"
  }
];

const FAQS = [
  {
    q: "What is SAMVIT?",
    a: "SAMVIT (संवित्) meaning 'Consciousness or Awareness' is Karnataka's premier AI-powered Heatwave Early Warning System. It provides real-time climate predictions, role-based safety advisories, and instant emergency notifications."
  },
  {
    q: "How accurate are the heat predictions?",
    a: "Predictions are powered by an advanced XGBoost model trained on historical IMD climate data and satellite aerosol observations. The model achieves an overall classification accuracy of 86.3%."
  },
  {
    q: "Who is this platform for?",
    a: "SAMVIT offers customized dashboards for 6 key roles: general citizens (public), agricultural workers (farmers), tourists and commuters (travelers), climate scientists (researchers), municipal coordinators (authorities), and platform engineers (admins)."
  },
  {
    q: "Is my personal data safe?",
    a: "Yes. All user accounts, locations, and preferences are securely stored using industry-standard encryption protocols on our Supabase-powered backend database."
  }
];

export default function LandingPage() {
  const { isAuthenticated } = useAuthStore();
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [openFaq, setOpenFaq] = useState(null);

  if (isAuthenticated()) {
    return <Navigate to="/app/dashboard" replace />;
  }

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fafaf9] text-[#1c1917]" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* ── Header / Navbar ── */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-6 md:px-12 py-4 bg-white/90 backdrop-blur-md border-b border-[#d6ccc4]/60">
        <div className="flex items-center gap-3">
          <div className="p-1 bg-[#f97316]/10 rounded-xl border border-[#f97316]/25">
            <Logo className="h-9 w-9" />
          </div>
          <span className="text-2xl font-black text-[#9d4300] tracking-tight">SAMVIT</span>
        </div>
        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-stone-600">
          <a href="#features" className="hover:text-[#f97316] transition-colors">Features</a>
          <a href="#testimonials" className="hover:text-[#f97316] transition-colors">Testimonials</a>
          <a href="#faq" className="hover:text-[#f97316] transition-colors">About & FAQ</a>
        </nav>
        <div className="flex items-center gap-3">
          <Link to="/login" className="px-4 py-2 text-sm font-bold text-[#9d4300] hover:bg-[#f97316]/10 rounded-full transition-all duration-200">
            Sign In
          </Link>
          <Link to="/register" className="px-5 py-2.5 bg-gradient-to-r from-[#f97316] to-[#dc2626] hover:from-[#d97706] hover:to-[#b45309] text-white text-sm font-bold rounded-full transition-all duration-300 shadow-md hover:-translate-y-0.5">
            Get Started
          </Link>
        </div>
      </header>

      {/* ── Hero Section ── */}
      <section className="relative flex flex-col items-center justify-center text-center px-6 pt-20 pb-24 overflow-hidden bg-gradient-to-b from-[#fef3c7] via-[#fed7aa]/50 to-[#fafaf9]">
        {/* Animated heatwave ripples background */}
        <div className="absolute inset-0 pointer-events-none opacity-40">
          <div className="absolute top-[10%] left-[5%] w-[400px] h-[400px] rounded-full bg-gradient-to-r from-[#fed7aa] to-[#fef3c7] filter blur-3xl animate-pulse" />
          <div className="absolute bottom-[10%] right-[5%] w-[500px] h-[500px] rounded-full bg-gradient-to-r from-[#fef3c7] to-[#fed7aa] filter blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
          {/* Subtle wavy vector background simulation */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#f97316_1px,transparent_1px)] [background-size:24px_24px]" />
        </div>

        <div className="relative max-w-4xl flex flex-col items-center z-10">
          {/* Tagline Badge */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full text-xs font-black mb-8 bg-[#fed7aa] text-[#b45309] border border-[#f97316]/20 shadow-sm animate-heat-wave">
            <Sparkles className="w-3.5 h-3.5" />
            LIVE TEMPERATURE MONITORING & ML WARNINGS FOR KARNATAKA
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-[#1c1917] leading-[1.1] mb-6">
            Predict Heatwaves.<br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#d97706] via-[#f97316] to-[#dc2626]">
              Save Lives.
            </span>
          </h1>

          <p className="text-base sm:text-xl text-stone-700 max-w-2xl mx-auto leading-relaxed mb-12 font-medium">
            Real-time AI-powered early warnings and tailored advisories to protect citizens, farmers, and travelers across Karnataka.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
            <Link to="/register" className="w-full sm:w-auto px-8 py-4 bg-[#f97316] hover:bg-[#d97706] text-white text-lg font-bold rounded-full transition-all duration-300 shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 hover:-translate-y-0.5">
              Join Now <ArrowRight size={20} />
            </Link>
            <a href="#features" className="w-full sm:w-auto px-8 py-4 border-2 border-stone-800 hover:bg-[#1c1917]/5 text-stone-800 text-lg font-bold rounded-full transition-all duration-300 flex items-center justify-center">
              Learn More
            </a>
          </div>
        </div>

        {/* Floating Sun Graphic with Glow */}
        <div className="mt-16 w-32 h-32 relative flex items-center justify-center bg-white rounded-full shadow-2xl border border-orange-100 animate-spin-slow duration-10000">
          <div className="absolute inset-0 bg-[#f97316] opacity-5 rounded-full blur-xl animate-pulse" />
          <Logo className="w-20 h-20" />
        </div>
      </section>

      {/* ── Features Section ── */}
      <section id="features" className="py-24 px-6 md:px-12 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs font-black uppercase tracking-widest text-[#f97316] bg-[#f97316]/10 px-3.5 py-1.5 rounded-full">
              Innovative Features
            </span>
            <h2 className="text-3xl md:text-5xl font-black mt-4 mb-4 text-[#1c1917]">
              Protecting Communities via Climate Intelligence
            </h2>
            <p className="text-base sm:text-lg max-w-2xl mx-auto text-stone-600 font-medium">
              Everything you need to stay safe during Karnataka summers, backed by custom XGBoost models.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((f, i) => (
              <div 
                key={i} 
                className="p-6 rounded-2xl bg-[#f5f1ed] border border-[#d6ccc4]/40 hover:bg-white hover:border-[#f97316]/30 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-white border border-[#d6ccc4]/30 flex items-center justify-center mb-5 shadow-sm">
                  {f.icon}
                </div>
                <h3 className="text-lg font-bold mb-3 text-[#1c1917]">{f.title}</h3>
                <p className="text-sm leading-relaxed text-stone-600">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials Section ── */}
      <section id="testimonials" className="py-24 px-6 md:px-12 bg-[#f5f1ed]/50">
        <div className="max-w-4xl mx-auto text-center">
          <span className="text-xs font-black uppercase tracking-widest text-[#9d4300] bg-orange-100 px-3.5 py-1.5 rounded-full">
            Real Impact
          </span>
          <h2 className="text-3xl md:text-5xl font-black mt-4 mb-16 text-[#1c1917]">
            Trusted Across Karnataka
          </h2>

          <div className="bg-white rounded-3xl p-8 md:p-12 border border-[#d6ccc4]/60 shadow-md relative">
            {/* Quote Icon */}
            <span className="absolute -top-6 left-12 text-7xl text-[#f97316]/20 font-serif">“</span>

            <p className="text-lg md:text-xl text-stone-800 italic leading-relaxed mb-8">
              {TESTIMONIALS[activeTestimonial].quote}
            </p>

            <div className="flex flex-col items-center gap-3">
              <div className={`w-12 h-12 rounded-full ${TESTIMONIALS[activeTestimonial].avatarBg} flex items-center justify-center font-black text-lg border border-orange-200 shadow-inner`}>
                {TESTIMONIALS[activeTestimonial].name.charAt(0)}
              </div>
              <div>
                <h4 className="font-bold text-[#1c1917]">{TESTIMONIALS[activeTestimonial].name}</h4>
                <p className="text-xs font-semibold text-stone-500 uppercase tracking-widest">
                  {TESTIMONIALS[activeTestimonial].role} · {TESTIMONIALS[activeTestimonial].district} District
                </p>
              </div>
            </div>

            {/* Slider Dots */}
            <div className="flex justify-center gap-2 mt-8">
              {TESTIMONIALS.map((_, i) => (
                <button 
                  key={i}
                  onClick={() => setActiveTestimonial(i)}
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${activeTestimonial === i ? 'w-6 bg-[#f97316]' : 'bg-[#d6ccc4]'}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ Section ── */}
      <section id="faq" className="py-24 px-6 md:px-12 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs font-black uppercase tracking-widest text-[#f97316] bg-[#f97316]/10 px-3.5 py-1.5 rounded-full">
              Got Questions?
            </span>
            <h2 className="text-3xl md:text-5xl font-black mt-4 mb-4 text-[#1c1917]">
              Frequently Asked Questions
            </h2>
            <p className="text-sm sm:text-base text-stone-600 font-medium">
              Everything you need to know about the platform and deployment details.
            </p>
          </div>

          <div className="space-y-4">
            {FAQS.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div 
                  key={idx} 
                  className="rounded-2xl border border-[#d6ccc4]/60 bg-[#fafaf9] overflow-hidden transition-all duration-300"
                >
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full px-6 py-5 text-left flex items-center justify-between font-bold text-stone-800 hover:text-[#9d4300]"
                  >
                    <span className="flex items-center gap-2.5">
                      <HelpCircle size={18} className="text-[#f97316]" />
                      {faq.q}
                    </span>
                    {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-6 text-sm text-stone-600 leading-relaxed border-t border-[#d6ccc4]/30 pt-4 bg-white">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── CTA / Signup Section ── */}
      <section className="py-20 px-6 text-center bg-gradient-to-r from-[#f97316] via-[#d97706] to-[#dc2626] text-white">
        <div className="max-w-2xl mx-auto">
          <CheckCircle2 size={48} className="mx-auto mb-6 opacity-90 animate-bounce" />
          <h2 className="text-3xl sm:text-4xl font-black mb-5">Be Aware. Stay Protected.</h2>
          <p className="text-base sm:text-lg mb-8 opacity-90 font-medium">
            Join the platform today to monitor districts, get route safety insights, and receive real-time notifications.
          </p>
          <Link to="/register" className="inline-block px-10 py-4 bg-white text-[#9d4300] hover:bg-orange-50 text-lg font-bold rounded-full shadow-lg shadow-black/10 hover:shadow-black/20 hover:-translate-y-0.5 transition-all duration-300">
            Create Free Account
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="py-8 px-6 md:px-12 flex flex-col sm:flex-row items-center justify-between gap-6 bg-[#1c1917] text-stone-400 border-t border-stone-800">
        <div className="flex items-center gap-3">
          <div className="p-1 bg-white/10 rounded-lg">
            <Logo className="h-6 w-6" />
          </div>
          <span className="font-black text-white text-lg tracking-tight">SAMVIT</span>
        </div>
        <p className="text-xs text-stone-500 font-medium">
          SAMVIT Heatwave Early Warning System · Karnataka, India · AI-Powered Climate Intelligence
        </p>
        <div className="flex items-center gap-4 text-xs font-semibold">
          <Link to="/login" className="hover:text-white transition-colors">Sign In</Link>
          <span>·</span>
          <Link to="/register" className="hover:text-white transition-colors">Register</Link>
        </div>
      </footer>
    </div>
  );
}

