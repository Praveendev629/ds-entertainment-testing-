"use client";

import { useState, useEffect, useRef, useCallback, useMemo, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Toaster, toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import {
  Search, X, ChevronRight, Loader2, Film, Globe,
  Download, Play, Pause, Volume2, VolumeX, Maximize2, Minimize2,
  Tv, SkipForward, SkipBack, Home, Settings, User, Heart, Mic,
} from "lucide-react";


// ── Types ──────────────────────────────────────────────────────────────────
interface Category { name: string; url: string }
interface Movie { title: string; url: string }
interface LinkItem { name: string; url: string }
interface MovieDetails {
  name: string; url: string;
  items: LinkItem[];
  serverLinks: LinkItem[];
  watchLinks: LinkItem[];
}
interface WatchState { url: string; name: string }

// Breadcrumb stack entry
interface BreadEntry { name: string; url: string }

// Helper function to check if URL needs proxy
function needsProxy(url: string): boolean {
  if (!url.startsWith('http')) return false;
  if (url.includes(window.location.hostname)) return false;
  
  // Check for common video streaming domains and patterns
  const needsProxyPatterns = [
    /dubshare\./i,
    /stream\./i,
    /play\./i,
    /watch\./i,
    /video\./i,
    /cdn\./i,
    /onestream\./i,
    /uptodub\./i,
    /\.mp4$/i,
    /\.m3u8$/i,
    /\.webm$/i,
    /\.mkv$/i,
    /moviesda/i,
    /isaidub/i,
    /downloadpage\.xyz/i,
    /moviespage\.xyz/i,
  ];
  
  return needsProxyPatterns.some(pattern => pattern.test(url));
}

// ── Poster cache ───────────────────────────────────────────────────────────
const posterCache = new Map<string, string | null>();

// ── MoviePoster ────────────────────────────────────────────────────────────
const MoviePoster = memo(function MoviePoster({ title }: { title: string }) {
  const [poster, setPoster] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); observer.disconnect(); } },
      { rootMargin: "200px" }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!inView) return;
    if (posterCache.has(title)) { setPoster(posterCache.get(title) ?? null); setLoading(false); return; }
    let alive = true;
    (async () => {
      try {
        const res = await fetch(`/api/poster?q=${encodeURIComponent(title)}`);
        const data = await res.json();
        if (alive) { setPoster(data.poster); posterCache.set(title, data.poster); }
      } catch { if (alive) setPoster(null); }
      finally { if (alive) setLoading(false); }
    })();
    return () => { alive = false; };
  }, [title, inView]);

  return (
    <div ref={ref} className="absolute inset-0">
      {loading ? (
        <div className="absolute inset-0 bg-white/5 animate-pulse flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-pink-600 animate-spin" />
        </div>
      ) : poster ? (
        <motion.img initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          src={poster} alt={title} loading="lazy" decoding="async"
          className="absolute inset-0 w-full h-full object-cover" />
      ) : (
        <div className="absolute inset-0 bg-zinc-900 flex flex-col items-center justify-center p-4 text-center">
          <Film className="w-12 h-12 text-zinc-800 mb-2" />
          <span className="text-[10px] text-zinc-600 font-bold uppercase line-clamp-2">{title}</span>
        </div>
      )}
    </div>
  );
});

// ── VideoPlayer ────────────────────────────────────────────────────────────
function VideoPlayer({ url, title, onClose }: { url: string; title: string; onClose: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [buffering, setBuffering] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Block popups and new tabs
  useEffect(() => {
    const originalWindowOpen = window.open;
    window.open = function() {
      console.log('Blocked popup attempt');
      return null;
    };

    const preventPopup = (e: MouseEvent) => {
      if (e.ctrlKey || e.metaKey || e.button === 1) {
        e.preventDefault();
      }
    };

    document.addEventListener('click', preventPopup, true);

    return () => {
      window.open = originalWindowOpen;
      document.removeEventListener('click', preventPopup, true);
    };
  }, []);

  useEffect(() => {
    const onFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  const togglePlay = useCallback(() => {
    if (!videoRef.current) return;
    playing ? videoRef.current.pause() : videoRef.current.play();
    setPlaying(!playing);
  }, [playing]);

  const toggleMute = useCallback(() => {
    if (!videoRef.current) return;
    const m = !muted; videoRef.current.muted = m; setMuted(m);
  }, [muted]);

  const seek = useCallback((s: number) => { if (videoRef.current) videoRef.current.currentTime += s; }, []);

  const seekForward = useCallback(() => { if (videoRef.current) videoRef.current.currentTime += 10; }, []);
  const seekBackward = useCallback(() => { if (videoRef.current) videoRef.current.currentTime -= 10; }, []);

  const toggleFullscreen = useCallback(() => {
    const container = videoRef.current?.parentElement;
    if (!container) return;
    if (document.fullscreenElement) document.exitFullscreen();
    else container.requestFullscreen?.();
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((document.activeElement as HTMLElement)?.tagName === "INPUT") return;
      switch (e.key.toLowerCase()) {
        case " ": case "k": e.preventDefault(); togglePlay(); break;
        case "f": e.preventDefault(); toggleFullscreen(); break;
        case "m": e.preventDefault(); toggleMute(); break;
        case "arrowright": seek(5); break;
        case "arrowleft": seek(-5); break;
        case "l": e.preventDefault(); seekForward(); break;
        case "j": e.preventDefault(); seekBackward(); break;
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [togglePlay, toggleMute, toggleFullscreen, seek, seekForward, seekBackward]);

  useEffect(() => {
    const show = () => {
      setShowControls(true);
      if (hideTimer.current) clearTimeout(hideTimer.current);
      hideTimer.current = setTimeout(() => { if (playing) setShowControls(false); }, 3000);
    };
    window.addEventListener("mousemove", show);
    window.addEventListener("touchstart", show);
    return () => {
      window.removeEventListener("mousemove", show);
      window.removeEventListener("touchstart", show);
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, [playing]);

  const fmt = (t: number) => {
    const h = Math.floor(t / 3600), m = Math.floor((t % 3600) / 60), s = Math.floor(t % 60);
    return `${h > 0 ? h + ":" : ""}${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  return (
    <div className={`relative group w-full bg-black overflow-hidden border border-white/5 shadow-2xl transition-all duration-300 ${isFullscreen ? "fixed inset-0 z-[100] rounded-none" : "aspect-video rounded-2xl"}`}>
      {buffering && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 text-pink-600 animate-spin" />
            <p className="text-zinc-400 font-medium animate-pulse text-sm">Buffering High Quality Stream...</p>
          </div>
        </div>
      )}
      <video ref={videoRef} src={url} className="w-full h-full object-contain"
        crossOrigin="anonymous"
        onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)}
        onTimeUpdate={() => { if (videoRef.current) { setCurrentTime(videoRef.current.currentTime); setProgress(videoRef.current.currentTime / videoRef.current.duration * 100); } }}
        onLoadedData={() => { setBuffering(false); setDuration(videoRef.current?.duration || 0); }}
        onLoadedMetadata={() => { setBuffering(false); setDuration(videoRef.current?.duration || 0); }}
        onCanPlay={() => { setBuffering(false); }}
        onWaiting={() => { setBuffering(true); }}
        onCanPlayThrough={() => { setBuffering(false); }}
        onError={(e) => { 
          setBuffering(false); 
          console.error('Video error:', e);
          toast.error("Stream unavailable. Try downloading instead."); 
        }}
        onClick={togglePlay} playsInline 
        controlsList="nodownload" />
      <AnimatePresence>
        {showControls && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/60 flex flex-col justify-between p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="flex flex-col max-w-[80%]">
                <h3 className="text-white font-bold text-base sm:text-lg drop-shadow-lg line-clamp-1">{title}</h3>
                <span className="text-pink-500 text-[8px] sm:text-[10px] font-black uppercase tracking-widest">Watching Online • DS Entertainment Zone</span>
              </div>
              <button onClick={onClose} className="p-2 bg-white/10 hover:bg-pink-600 rounded-full transition-colors backdrop-blur-md">
                <X className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </button>
            </div>
            
            {/* Top Control Bar */}
            <div className="flex items-center justify-center gap-4 mb-4">
              <button onClick={seekBackward} className="text-white hover:text-pink-500 transition-colors p-2" title="Skip backward 10 seconds">
                <SkipBack className="w-5 h-5" />
              </button>
              <button onClick={togglePlay} className="text-white hover:text-pink-500 transition-colors p-2 bg-white/10 rounded-full">
                {playing ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current" />}
              </button>
              <button onClick={seekForward} className="text-white hover:text-pink-500 transition-colors p-2" title="Skip forward 10 seconds">
                <SkipForward className="w-5 h-5" />
              </button>
            </div>

            {/* Video and Bottom Controls */}
            <div className="space-y-3 sm:space-y-4">
              <div className="relative h-1 sm:h-1.5 w-full bg-white/20 rounded-full cursor-pointer overflow-hidden">
                <div className="absolute inset-y-0 left-0 bg-pink-600 transition-all duration-100" style={{ width: `${progress}%` }} />
                <input type="range" min="0" max="100" value={progress}
                  onChange={(e) => { if (videoRef.current) { videoRef.current.currentTime = parseFloat(e.target.value) / 100 * videoRef.current.duration; setProgress(parseFloat(e.target.value)); } }}
                  className="absolute inset-0 opacity-0 cursor-pointer" />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 sm:gap-6">
                  <div className="hidden sm:flex items-center gap-3">
                    <button onClick={toggleMute} className="text-white hover:text-pink-500 transition-colors">
                      {muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                    </button>
                    <input type="range" min="0" max="1" step="0.1" value={muted ? 0 : volume}
                      onChange={(e) => { const v = parseFloat(e.target.value); setVolume(v); if (videoRef.current) videoRef.current.volume = v; setMuted(v === 0); }}
                      className="w-16 sm:w-20 h-1 bg-white/20 rounded-full accent-red-600" />
                  </div>
                  <span className="text-white/70 text-[10px] sm:text-sm font-mono">{fmt(currentTime)} / {fmt(duration)}</span>
                </div>
                <button onClick={toggleFullscreen} className="text-white hover:text-pink-500 transition-colors p-1">
                  {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function HomePage() {
  const router = useRouter();
  const [splash, setSplash] = useState(() => {
    // Check if intro has already been shown in this session
    if (typeof window !== 'undefined') {
      const hasSeenIntro = sessionStorage.getItem('hasSeenIntro');
      return !hasSeenIntro; // Show splash only if not seen before
    }
    return true;
  });
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [moviesLoading, setMoviesLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [site, setSite] = useState<"moviesda" | "isaidub" | "animesalt">("moviesda");

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [breadcrumb, setBreadcrumb] = useState<BreadEntry[]>([]);
  const [details, setDetails] = useState<MovieDetails | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [subSearch, setSubSearch] = useState("");
  const [watching, setWatching] = useState<WatchState | null>(null);
  
  // Bottom navigation state
  const [activeNav, setActiveNav] = useState("home");
  const [showBubble, setShowBubble] = useState<string | null>(null);

  useEffect(() => {
    // Check URL parameters for site selection
    const urlParams = new URLSearchParams(window.location.search);
    const siteParam = urlParams.get('site') as "moviesda" | "isaidub" | null;
    
    if (siteParam && (siteParam === "moviesda" || siteParam === "isaidub")) {
      setSite(siteParam);
      loadCategories(siteParam);
    } else {
      loadCategories(site);
    }
    
    // Only show intro if it hasn't been shown in this session
    if (splash) {
      const t = setTimeout(() => {
        setSplash(false);
        // Mark intro as seen for this session
        sessionStorage.setItem('hasSeenIntro', 'true');
      }, 2500);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Global popup and ad blocker
  useEffect(() => {
    // Override window.open to prevent new tabs
    const originalWindowOpen = window.open;
    window.open = function() {
      console.log('Blocked global popup attempt');
      return null;
    };

    // Block message-based popup attempts
    const handleMessage = (event: MessageEvent) => {
      if (event.data && typeof event.data === 'object') {
        if (event.data.type === 'open' || event.data.action === 'open') {
          event.preventDefault();
          console.log('Blocked message-based popup');
        }
      }
    };

    // Block ctrl+click and middle click
    const preventNewTab = (e: MouseEvent) => {
      if (e.ctrlKey || e.metaKey || e.button === 1) {
        e.preventDefault();
        console.log('Blocked new tab attempt');
      }
    };

    window.addEventListener('message', handleMessage);
    document.addEventListener('click', preventNewTab, true);

    return () => {
      window.open = originalWindowOpen;
      window.removeEventListener('message', handleMessage);
      document.removeEventListener('click', preventNewTab, true);
    };
  }, []);

  const loadCategories = async (s: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/home?site=${s}`);
      const data = await res.json();
      setCategories(data.categories || []);
    } catch { setCategories([]); }
    finally { setLoading(false); }
  };

  const switchSite = (s: "moviesda" | "isaidub" | "animesalt") => {
    setSite(s); setSelectedCategory(null); setSearch(""); loadCategories(s);
  };

  const openCategory = useCallback(async (cat: Category) => {
    setSelectedCategory(cat); setMoviesLoading(true); setMovies([]); setSearch("");
    try {
      const res = await fetch(`/api/category?url=${encodeURIComponent(cat.url)}&site=${site}`);
      const data = await res.json();
      setMovies(data);
    } catch { setMovies([]); }
    finally { setMoviesLoading(false); }
  }, [site]);

  // Open details modal and fetch details for a given URL
  const openDetails = useCallback(async (name: string, url: string, newBreadcrumb?: BreadEntry[]) => {
    setModalOpen(true);
    setDetailsLoading(true);
    setDetails(null);
    setSubSearch("");
    setWatching(null);
    const crumbs = newBreadcrumb ?? [{ name, url }];
    setBreadcrumb(crumbs);
    try {
      const res = await fetch(`/api/details?url=${encodeURIComponent(url)}&site=${site}`);
      const data = await res.json();
      setDetails({ name, url, ...data });
    } catch { setDetails(null); toast.error("Failed to load details."); }
    finally { setDetailsLoading(false); }
  }, [site]);

  // Navigate deeper in modal
  const drillDown = useCallback((item: LinkItem) => {
    const newCrumbs = [...breadcrumb, { name: item.name, url: item.url }];
    openDetails(item.name, item.url, newCrumbs);
  }, [breadcrumb, openDetails]);

  // Navigate back in breadcrumb
  const breadcrumbBack = useCallback((index: number) => {
    const crumbs = breadcrumb.slice(0, index + 1);
    const entry = crumbs[crumbs.length - 1];
    openDetails(entry.name, entry.url, crumbs);
  }, [breadcrumb, openDetails]);

  const closeModal = useCallback(() => {
    setModalOpen(false); setDetails(null); setWatching(null);
    setBreadcrumb([]); setSubSearch("");
  }, []);

  const filteredCategories = useMemo(
    () => categories.filter((c) => c.name.toLowerCase().includes(search.toLowerCase())),
    [categories, search]
  );
  const filteredMovies = useMemo(
    () => movies.filter((m) => m.title.toLowerCase().includes(search.toLowerCase())),
    [movies, search]
  );

  // Detect if category is a "collection" type (shows sub-categories, not movie cards)
  const isLetterCollection = useMemo(() => {
    const n = selectedCategory?.name.toLowerCase() || "";
    return n.includes("a to z") || n.includes("a-z") || n.includes("atoz");
  }, [selectedCategory]);

  const isYearCollection = useMemo(() => {
    const n = selectedCategory?.name.toLowerCase() || "";
    return n.includes("yearly") || n.includes("year-wise");
  }, [selectedCategory]);

  const isCollectionView = isYearCollection || (isLetterCollection && movies.every(m => /^[A-Z]$/.test(m.title)));

  // When movies are all single-letter (A-Z), show as letter buttons
  const isAlphaList = useMemo(() =>
    movies.length > 0 && movies.every(m => /^[A-Z]$/.test(m.title)),
    [movies]
  );

  // ── Splash ──────────────────────────────────────────────────────────────
  if (splash) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black overflow-hidden">
      
      {/* Optional: Subtle Tech Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(236,72,153,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(236,72,153,0.03)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)]"></div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }} 
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }} 
        className="text-center relative z-10 w-full max-w-md px-6"
      >
        {/* Logo Container with Float Animation */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative mb-8"
        >
          {/* Animated Glow Behind Logo */}
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{ 
              duration: 3, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
            className="absolute inset-0 w-64 h-64 mx-auto rounded-full bg-pink-600 blur-[80px]"
          />
          
          {/* Logo Image */}
          <motion.img
            animate={{ y: [0, -10, 0] }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            src="/ds-logo.png"
            alt="DS Entertainment Zone Logo" 
            className="w-64 h-64 mx-auto object-contain relative z-10 drop-shadow-[0_0_15px_rgba(236,72,153,0.5)]" 
          />
        </motion.div>
         
        {/* Loading Bar Container */}
        <div className="w-full max-w-[200px] mx-auto mb-8">
          <motion.div 
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 2.5, ease: "circOut" }}
            className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden shadow-[0_0_10px_rgba(255,255,255,0.1)]"
          >
            <div className="h-full bg-gradient-to-r from-pink-500 via-purple-500 to-pink-500 w-full shadow-[0_0_15px_rgba(236,72,153,0.8)]"></div>
          </motion.div>
        </div>

        {/* Designed Typography Section */}
        <div className="flex flex-col items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="relative"
          >
             {/* Main Logo Text */}
             <h1 className="font-black text-4xl md:text-5xl tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white via-pink-100 to-pink-500 drop-shadow-lg">
              DS
            </h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, letterSpacing: "0.5em" }}
            animate={{ opacity: 1, letterSpacing: "0.2em" }}
            transition={{ duration: 1, delay: 0.8 }}
            className="mt-2"
          >
            <p className="text-[10px] md:text-xs text-pink-400/90 font-medium uppercase tracking-[0.3em] border-t border-pink-500/30 pt-3">
              Entertainment Zone
            </p>
          </motion.div>
        </div>

      </motion.div>
    </div>
  );
}
  // ── Main App ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-pink-500/30">
      <Toaster position="top-right" toastOptions={{ style: { background: "#111", color: "#fff", border: "1px solid rgba(236,72,153,0.2)" } }} />

      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-black/50 border-b border-pink-600/10">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <div onClick={() => { setSelectedCategory(null); setSearch(""); }}
            className="flex items-center gap-2 cursor-pointer shrink-0 group">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <img src="/ds-logo.png"
                alt="DS Entertainment Zone Logo" className="w-16 h-16 object-contain drop-shadow-lg" />
            </motion.div>
            <motion.span 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
              className="text-xl font-bold tracking-tight hidden sm:inline bg-gradient-to-r from-pink-500 via-pink-600 to-purple-600 bg-clip-text text-transparent"
            >
              DS <span className="font-black">ENTERTAINMENT</span> ZONE
            </motion.span>
          </div>
          {/* Desktop search */}
          <div className="relative group flex-1 max-w-xl hidden sm:block">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-pink-600 transition-colors" />
            <input type="text"
              placeholder={selectedCategory ? `Search in ${selectedCategory.name}...` : "Search categories or movies..."}
              value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-600/30 focus:border-pink-600/30 transition-all placeholder:text-zinc-600 text-sm" />
          </div>
          {/* Mobile DS - Entertainment Zone text */}
          <div className="sm:hidden flex-1 text-center">
            <motion.span 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 300 }}
              className="text-xl font-bold tracking-tight bg-gradient-to-r from-pink-500 via-pink-600 to-purple-600 bg-clip-text text-transparent"
            >
              DS <span className="font-black">ENTERTAINMENT</span> ZONE
            </motion.span>
          </div>
        </div>
      </header>

      
      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {selectedCategory ? (
          /* ── Category / Movie List View ── */
          <div className="space-y-8">
            {/* Header row */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <button onClick={() => { setSelectedCategory(null); setSearch(""); }}
                  className="p-2 hover:bg-white/5 rounded-xl border border-white/5 text-zinc-400 hover:text-white transition-colors">
                  <ChevronRight className="w-5 h-5 rotate-180" />
                </button>
                <div className="flex flex-col">
                  <h2 className="text-2xl font-bold text-pink-600 line-clamp-1">{selectedCategory.name}</h2>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-[0.2em] font-black mt-1">
                    {filteredMovies.length} {isAlphaList ? "Letters" : "Movies"} {search && `Match "${search}"`}
                  </p>
                </div>
              </div>
              {!isAlphaList && (
                <div className="relative group flex-1 max-w-md">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                  <input type="text" placeholder={`Search in ${selectedCategory.name}...`}
                    value={search} onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-11 pr-12 py-3 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-600/30 transition-all placeholder:text-zinc-600 text-sm font-medium" />
                  {search && <button onClick={() => setSearch("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"><X className="w-4 h-4" /></button>}
                </div>
              )}
            </div>

            {moviesLoading ? (
              <div className="flex flex-col items-center justify-center py-32 space-y-4">
                <Loader2 className="w-10 h-10 text-pink-600 animate-spin" />
                <p className="text-zinc-500 font-medium">Powering up the DS Entertainment Zone engine...</p>
              </div>
            ) : isAlphaList ? (
              /* A-Z letter buttons */
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                <AnimatePresence mode="popLayout">
                  {filteredMovies.map((movie, i) => (
                    <motion.button key={movie.url} layout
                      initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }} transition={{ delay: 0.01 * i }}
                      onClick={() => {
                        // Opening a letter: load movies for that letter
                        openCategory({ name: `${selectedCategory.name} - ${movie.title}`, url: movie.url });
                      }}
                      className="flex items-center justify-center py-8 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-pink-600/50 rounded-2xl transition-all group">
                      <span className="text-2xl font-black text-zinc-300 group-hover:text-pink-500 transition-colors">{movie.title}</span>
                    </motion.button>
                  ))}
                </AnimatePresence>
              </div>
            ) : isCollectionView ? (
              /* Collection/year sub-category buttons */
              <div className={`grid ${isYearCollection ? "grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3" : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"}`}>
                <AnimatePresence mode="popLayout">
                  {filteredMovies.map((movie, i) => {
                    const yearMatch = movie.title.match(/\d{4}/);
                    return (
                      <motion.button key={movie.url} layout
                        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }} transition={{ delay: 0.005 * i }}
                        onClick={() => openDetails(movie.title, movie.url)}
                        className={`flex items-center ${isYearCollection ? "justify-center py-8" : "justify-between p-4"} bg-white/5 hover:bg-white/10 border border-white/5 hover:border-pink-600/50 rounded-2xl transition-all group text-left`}>
                        <span className={`${isYearCollection ? "text-2xl" : "text-sm"} font-black text-zinc-300 group-hover:text-pink-500 transition-colors line-clamp-1`}>
                          {isYearCollection && yearMatch ? yearMatch[0] : movie.title}
                        </span>
                        {!isYearCollection && <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-pink-600 transition-all group-hover:translate-x-1" />}
                      </motion.button>
                    );
                  })}
                </AnimatePresence>
              </div>
            ) : (
              /* Normal movie grid with posters */
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                <AnimatePresence mode="popLayout">
                  {filteredMovies.map((movie, i) => (
                    <motion.div key={movie.url} layout
                      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }} transition={{ delay: 0.003 * i }}
                      onClick={() => openDetails(movie.title, movie.url)}
                      className="group cursor-pointer">
                      <div className="relative aspect-[2/3] bg-white/5 rounded-2xl border border-white/5 overflow-hidden group-hover:border-pink-600/50 transition-all shadow-xl shadow-black">
                        <MoviePoster title={movie.title} />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4">
                          <div className="w-12 h-12 bg-pink-600 rounded-full flex items-center justify-center shadow-lg shadow-pink-600/40 transform scale-75 group-hover:scale-100 transition-transform">
                            <Play className="w-6 h-6 text-white" />
                          </div>
                        </div>
                      </div>
                      <p className="mt-3 text-sm font-medium text-zinc-400 group-hover:text-pink-500 transition-colors line-clamp-2">{movie.title}</p>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        ) : (
          /* ── Home / categories ── */
          <div className="space-y-12">
            <section>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {loading
                  ? Array.from({ length: 12 }).map((_, i) => <div key={i} className="h-24 bg-white/5 rounded-2xl animate-pulse" />)
                  : filteredCategories.filter(cat => !["Latest Movies Updates", "Download Now"].includes(cat.name)).map((cat, i) => (
                      <motion.button key={cat.url}
                        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.01 * i }}
                        onClick={() => openCategory(cat)}
                        className="p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 hover:border-pink-600/50 transition-all text-left group relative overflow-hidden">
                        <div className="relative z-10">
                          <span className="text-sm font-semibold text-zinc-400 group-hover:text-white transition-colors line-clamp-2">{cat.name}</span>
                          <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-pink-600 mt-2 transition-all group-hover:translate-x-1" />
                        </div>
                        <div className="absolute top-0 right-0 w-16 h-16 bg-pink-600/5 blur-2xl rounded-full translate-x-8 -translate-y-8" />
                      </motion.button>
                    ))}
              </div>
            </section>
          </div>
        )}
      </main>

      {/* ── Details Modal ── */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={closeModal}
              className="absolute inset-0 bg-black/95 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-[#080808] border border-pink-600/10 rounded-3xl overflow-hidden shadow-2xl shadow-pink-600/5 flex flex-col max-h-[90vh]">

              {/* Modal header */}
              <div className="p-6 border-b border-white/5 flex items-start justify-between shrink-0">
                <div className="flex-1 min-w-0 mr-4">
                  {/* Breadcrumb */}
                  {breadcrumb.length > 1 && (
                    <div className="flex items-center flex-wrap gap-1 mb-2">
                      {breadcrumb.map((crumb, idx) => (
                        <span key={idx} className="flex items-center gap-1">
                          {idx < breadcrumb.length - 1 ? (
                            <button onClick={() => breadcrumbBack(idx)}
                              className="text-[10px] text-zinc-500 hover:text-pink-500 transition-colors">
                              {crumb.name.length > 20 ? crumb.name.slice(0, 20) + "…" : crumb.name}
                            </button>
                          ) : (
                            <span className="text-[10px] text-pink-500 font-bold">
                              {crumb.name.length > 25 ? crumb.name.slice(0, 25) + "…" : crumb.name}
                            </span>
                          )}
                          {idx < breadcrumb.length - 1 && <ChevronRight className="w-2 h-2 text-zinc-700" />}
                        </span>
                      ))}
                    </div>
                  )}
                  <h3 className="font-bold text-lg line-clamp-1 text-pink-500">
                    {details?.name || breadcrumb[breadcrumb.length - 1]?.name || "Loading..."}
                  </h3>
                  <p className="text-[10px] text-zinc-500 mt-1 uppercase tracking-widest font-black">DS Entertainment Zone link extractor</p>
                </div>
                <button onClick={closeModal} className="p-2 hover:bg-white/5 rounded-xl text-zinc-500 hover:text-white transition-colors shrink-0">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Sub search (if many items) */}
              {details && details.items.length > 5 && !watching && (
                <div className="px-6 py-4 border-b border-white/5 bg-black/20 shrink-0">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 pointer-events-none" />
                    <input type="text" placeholder={`Search in ${details.name}...`}
                      value={subSearch} onChange={(e) => setSubSearch(e.target.value)}
                      className="w-full pl-11 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-1 focus:ring-pink-600/30 transition-all placeholder:text-zinc-700 text-sm" />
                    {subSearch && <button onClick={() => setSubSearch("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-white"><X className="w-4 h-4" /></button>}
                  </div>
                </div>
              )}

              {/* Modal body */}
              <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                {watching ? (
                  <div className="space-y-4">
                    <VideoPlayer url={watching.url} title={watching.name} onClose={() => setWatching(null)} />
                    <button onClick={() => setWatching(null)}
                      className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-sm font-bold text-zinc-400 hover:text-white transition-all">
                      ← Back to Links
                    </button>
                  </div>
                ) : detailsLoading ? (
                  <div className="py-12 flex flex-col items-center gap-4">
                    <Loader2 className="w-8 h-8 text-pink-600 animate-spin" />
                    <p className="text-sm text-zinc-400">Extracting direct links...</p>
                  </div>
                ) : details ? (
                  <div className="space-y-6">

                    {/* Watch Online Links */}
                    {details.watchLinks && details.watchLinks.length > 0 && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 mb-4">
                          <Play className="w-4 h-4 text-pink-600" />
                          <span className="text-xs font-black uppercase tracking-widest text-zinc-500">Watch Online</span>
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                          {details.watchLinks.filter((link, index) => {
                              // Filter out duplicate "Server 1" - only keep the second occurrence
                              const linkName = link.name.toLowerCase();
                              if (linkName.includes('server 1')) {
                                // Check if this is the first occurrence of "server 1"
                                const previousServer1Count = details.watchLinks.slice(0, index).filter(prevLink => 
                                  prevLink.name.toLowerCase().includes('server 1')
                                ).length;
                                return previousServer1Count > 0; // Only show if there was a previous server 1
                              }
                              return true;
                            }).map((link, i) => (
                            <button key={i}
                              onClick={async () => {
                              try {
                                let finalUrl = link.url;
                                
                                // If this is a stream-resolve URL, resolve it first
                                if (link.url.includes('/api/stream-resolve')) {
                                  const res = await fetch(link.url);
                                  const data = await res.json();
                                  if (data.videoUrl) {
                                    finalUrl = data.videoUrl;
                                    console.log('Resolved stream URL:', finalUrl);
                                  } else if (data.error) {
                                    console.error('Stream resolve error:', data.error);
                                    toast.error('Could not resolve video stream: ' + data.error);
                                    return;
                                  } else {
                                    toast.error('Could not resolve video stream');
                                    return;
                                  }
                                }
                                
                                // Use proxy for external streaming URLs to avoid CORS issues
                                const videoUrl = needsProxy(finalUrl) ? `/api/proxy?url=${encodeURIComponent(finalUrl)}` : finalUrl;
                                setWatching({ url: videoUrl, name: details.name });
                              } catch (error) {
                                console.error('Error resolving stream:', error);
                                toast.error('Failed to resolve video stream');
                              }
                            }}
                              className="flex items-center justify-between p-4 bg-pink-600/5 hover:bg-pink-600/10 border border-pink-600/10 hover:border-pink-600/50 rounded-2xl transition-all group">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-pink-600 rounded-lg flex items-center justify-center shadow-lg shadow-pink-600/20">
                                  <Play className="w-4 h-4 text-white fill-current" />
                                </div>
                                <span className="font-bold text-sm text-zinc-200 group-hover:text-white text-left">{link.name}</span>
                              </div>
                              <ChevronRight className="w-4 h-4 text-pink-600/50 group-hover:text-pink-600 transition-transform group-hover:translate-x-1 shrink-0" />
                            </button>
                          ))}
                        </div>
                        <div className="h-px bg-white/5 my-4" />
                      </div>
                    )}

                    {/* Download / Sub-items */}
                    <div className="space-y-3">
                      {details.serverLinks.length > 0 ? (
                        <>
                          <div className="flex items-center gap-2 mb-4">
                            <Download className="w-4 h-4 text-zinc-500" />
                            <span className="text-xs font-black uppercase tracking-widest text-zinc-500">Download Links</span>
                          </div>
                          <div className="p-4 bg-pink-600/10 border border-pink-600/20 rounded-2xl text-center mb-4">
                            <p className="text-xs text-pink-500 font-black uppercase tracking-widest">Server 2 Gateway Bypassed ✓</p>
                          </div>
                          {details.serverLinks.map((link, i) => (
                            <a key={i} href={link.url} target="_blank" rel="noopener noreferrer"
                              className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-pink-600/50 rounded-2xl transition-all group">
                              <span className="font-semibold text-zinc-300 group-hover:text-white text-sm text-left">{link.name}</span>
                              <div className="w-10 h-10 bg-pink-600/10 rounded-xl flex items-center justify-center group-hover:bg-pink-600 transition-colors shrink-0 ml-2">
                                <Download className="w-5 h-5 text-pink-600 group-hover:text-white" />
                              </div>
                            </a>
                          ))}
                        </>
                      ) : details.items.length > 0 ? (
                        <>
                          <div className="flex items-center gap-2 mb-4">
                            <Download className="w-4 h-4 text-zinc-500" />
                            <span className="text-xs font-black uppercase tracking-widest text-zinc-500">
                              {details.items[0].url.includes("/download/") ? "Download Files" : "Select Quality / Version"}
                            </span>
                          </div>
                          {details.items
                            .filter(item => item.name.toLowerCase().includes(subSearch.toLowerCase()))
                            .map((item, i) => (
                              <button key={i} onClick={() => drillDown(item)}
                                className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-pink-600/50 rounded-2xl transition-all group">
                                <span className="text-sm font-medium text-zinc-300 group-hover:text-white text-left">{item.name}</span>
                                <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-pink-600 transition-transform group-hover:translate-x-1 shrink-0" />
                              </button>
                            ))}
                          {details.items.filter(i => i.name.toLowerCase().includes(subSearch.toLowerCase())).length === 0 && subSearch && (
                            <div className="py-12 text-center">
                              <Search className="w-8 h-8 text-zinc-800 mx-auto mb-4" />
                              <p className="text-zinc-600 text-sm">No results for &quot;{subSearch}&quot;</p>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="py-12 text-center">
                          <Film className="w-10 h-10 text-zinc-800 mx-auto mb-4" />
                          <p className="text-zinc-500 text-sm font-medium">No links found</p>
                          <p className="text-zinc-700 text-xs mt-1">Try navigating back and selecting a different option</p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : null}
              </div>

              {/* Modal footer */}
              <div className="p-4 bg-pink-600 text-center shrink-0">
                <p className="text-[10px] text-white uppercase tracking-widest font-black">Powered by DS Entertainment Zone engine</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Bottom Navigation */}
      <motion.nav 
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed bottom-0 left-0 right-0 z-50 bg-black/60 backdrop-blur-xl border-t border-pink-600/30 shadow-2xl"
      >
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex justify-around items-center">
            {[
              { id: "tamil-movies", icon: Film, label: "Tamil Movies", action: () => { switchSite("moviesda"); setSelectedCategory(null); setSearch(""); setActiveNav("tamil-movies"); } },
              { id: "tamil-dubbed", icon: Mic, label: "Tamil Dubbed", action: () => { switchSite("isaidub"); setSelectedCategory(null); setSearch(""); setActiveNav("tamil-dubbed"); } },
              { id: "anime-collection", icon: Tv, label: "Anime Collection", action: () => { router.push("/anime"); setActiveNav("anime-collection"); } },
              { id: "everything", icon: Globe, label: "Everything", action: () => { router.push("/everything"); setActiveNav("everything"); } },
            ].map((item) => (
              <motion.div key={item.id} className="relative">
                <motion.button
                  whileHover={{ 
                    scale: 1.15, 
                    y: -5,
                    transition: { type: "spring", stiffness: 400, damping: 10 }
                  }}
                  whileTap={{ 
                    scale: 0.9,
                    transition: { type: "spring", stiffness: 600, damping: 15 }
                  }}
                  onClick={() => {
                    item.action();
                    setShowBubble(item.label);
                    setTimeout(() => setShowBubble(null), 2000);
                  }}
                  className={`p-4 rounded-2xl transition-all duration-300 relative backdrop-blur-sm ${
                    activeNav === item.id 
                      ? "bg-gradient-to-br from-pink-500 to-pink-700 text-white shadow-2xl shadow-pink-500/50 border border-pink-400/50" 
                      : "bg-white/10 text-zinc-300 hover:bg-white/20 hover:text-pink-400 border border-white/10 hover:border-pink-500/30"
                  }`}
                >
                  <motion.div
                    animate={{ 
                      rotate: activeNav === item.id ? 360 : 0,
                      transition: { duration: 0.6, ease: "easeInOut" }
                    }}
                  >
                    <item.icon className="w-6 h-6" />
                  </motion.div>
                </motion.button>
                
                {/* Bubble Tooltip */}
                <AnimatePresence>
                  {showBubble === item.label && (
                    <motion.div
                      initial={{ opacity: 0, y: 15, scale: 0.5 }}
                      animate={{ opacity: 1, y: -50, scale: 1 }}
                      exit={{ opacity: 0, y: 15, scale: 0.5 }}
                      transition={{ type: "spring", stiffness: 500, damping: 25 }}
                      className="absolute left-1/2 -translate-x-1/2 bg-gradient-to-r from-pink-600 to-purple-600 text-white px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap shadow-2xl backdrop-blur-md"
                      style={{ top: "-60px" }}
                    >
                      {item.label}
                      <motion.div 
                        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-pink-600 rotate-45 transform translate-y-1/2"
                        animate={{ 
                          scale: [1, 1.2, 1],
                          transition: { duration: 0.5, repeat: Infinity, repeatDelay: 1 }
                        }}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.nav>
    </div>
  );
}
