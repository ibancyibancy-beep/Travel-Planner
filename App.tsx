
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Plane, Map, Calendar, List, Plus, Search, 
  Settings, Heart, Sun, Moon, MapPin, 
  Trash2, ExternalLink, ArrowRight, DollarSign,
  Briefcase, Activity as ActivityIcon, Info, ChevronRight
} from 'lucide-react';
import { ViewState, Trip, DestinationInfo } from './types';
import { fetchDestinationDetails } from './services/geminiService';
import Landing from './components/Landing';
import Explorer from './components/Explorer';
import Planner from './components/Planner';
import MyTrips from './components/MyTrips';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('landing');
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeTripId, setActiveTripId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDestination, setSelectedDestination] = useState<DestinationInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize trips from localStorage
  useEffect(() => {
    const savedTrips = localStorage.getItem('wanderlust_trips');
    if (savedTrips) {
      setTrips(JSON.parse(savedTrips));
    }
    
    // Check dark mode preference
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDarkMode(true);
    }
  }, []);

  // Save trips to localStorage
  useEffect(() => {
    localStorage.setItem('wanderlust_trips', JSON.stringify(trips));
  }, [trips]);

  // Dark mode toggle
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('bg-slate-950', 'text-white');
      document.body.classList.remove('bg-slate-50', 'text-slate-900');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('bg-slate-950', 'text-white');
      document.body.classList.add('bg-slate-50', 'text-slate-900');
    }
  }, [isDarkMode]);

  const handleSearch = async (query: string) => {
    if (!query.trim()) return;
    setSearchQuery(query);
    setIsLoading(true);
    try {
      const details = await fetchDestinationDetails(query);
      setSelectedDestination(details);
      setView('explorer');
    } catch (error) {
      alert("Error finding destination. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const createTripFromDest = (dest: DestinationInfo) => {
    const newTrip: Trip = {
      id: Math.random().toString(36).substr(2, 9),
      destination: dest.name,
      country: dest.country,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      itinerary: [],
      expenses: [],
      notes: '',
      aiInsights: dest
    };
    setTrips([...trips, newTrip]);
    setActiveTripId(newTrip.id);
    setView('planner');
  };

  const deleteTrip = (id: string) => {
    if (confirm("Delete this trip?")) {
      setTrips(trips.filter(t => t.id !== id));
      if (activeTripId === id) setActiveTripId(null);
    }
  };

  const updateTrip = (updatedTrip: Trip) => {
    setTrips(trips.map(t => t.id === updatedTrip.id ? updatedTrip : t));
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
      {/* Navbar */}
      <nav className={`sticky top-0 z-50 px-4 py-3 border-b ${isDarkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white/80 border-slate-200'} backdrop-blur-md`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div 
            className="flex items-center gap-2 cursor-pointer group" 
            onClick={() => setView('landing')}
          >
            <div className="bg-indigo-600 p-2 rounded-lg group-hover:bg-indigo-500 transition-colors">
              <Plane className="text-white w-6 h-6" />
            </div>
            <span className="text-xl font-bold tracking-tight">Wanderlust</span>
          </div>

          <div className="hidden md:flex items-center gap-6">
            <button 
              onClick={() => setView('landing')}
              className={`text-sm font-medium transition-colors hover:text-indigo-500 ${view === 'landing' ? 'text-indigo-600' : ''}`}
            >
              Home
            </button>
            <button 
              onClick={() => setView('my-trips')}
              className={`text-sm font-medium transition-colors hover:text-indigo-500 ${view === 'my-trips' ? 'text-indigo-600' : ''}`}
            >
              My Trips ({trips.length})
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-2 rounded-full transition-colors ${isDarkMode ? 'hover:bg-slate-800' : 'hover:bg-slate-100'}`}
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            {view !== 'landing' && (
              <button 
                onClick={() => setView('landing')}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-md active:scale-95"
              >
                Plan New Trip
              </button>
            )}
          </div>
        </div>
      </nav>

      <main className="transition-all duration-300">
        {isLoading && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-2xl flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="font-semibold text-lg">Wanderlust AI is exploring...</p>
              <p className="text-sm text-slate-500 text-center max-w-[200px]">Generating destination insights and travel guides.</p>
            </div>
          </div>
        )}

        {view === 'landing' && <Landing onSearch={handleSearch} />}
        {view === 'explorer' && selectedDestination && (
          <Explorer 
            destination={selectedDestination} 
            onStartPlanning={createTripFromDest}
            onBack={() => setView('landing')}
          />
        )}
        {view === 'planner' && activeTripId && (
          <Planner 
            trip={trips.find(t => t.id === activeTripId)!} 
            onUpdate={updateTrip}
            onBack={() => setView('my-trips')}
          />
        )}
        {view === 'my-trips' && (
          <MyTrips 
            trips={trips} 
            onSelect={(id) => { setActiveTripId(id); setView('planner'); }} 
            onDelete={deleteTrip} 
          />
        )}
      </main>

      {/* Footer */}
      <footer className={`py-12 mt-20 border-t ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-200'}`}>
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Plane className="text-indigo-600" />
            <span className="text-xl font-bold">Wanderlust</span>
          </div>
          <p className={`mb-6 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            Your AI-powered travel companion for seamless adventures.
          </p>
          <div className="flex justify-center gap-4 text-sm font-medium">
            <a href="#" className="hover:text-indigo-600 transition-colors">Privacy</a>
            <a href="#" className="hover:text-indigo-600 transition-colors">Terms</a>
            <a href="#" className="hover:text-indigo-600 transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
