import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  BarChart,
  Bar,
  LineChart,
  Line
} from 'recharts';
import {
  Leaf,
  Calendar,
  Zap,
  Award,
  Trophy,
  Trash2,
  Plus,
  X,
  TrendingDown,
  Users,
  LogOut,
  Briefcase,
  Globe,
  RefreshCw,
  TrendingUp,
  ChevronRight,
  Shield,
  Clock,
  Apple,
  ShoppingBag,
  Car,
  Sun,
  Moon
} from 'lucide-react';

const API_BASE = 'http://localhost:8081/api';

// ─── Google OAuth2 Configuration ──────────────────────────────────────────────
// Replace with your actual Client ID from https://console.cloud.google.com/
// Authorized JavaScript origins: http://localhost:5173
const GOOGLE_CLIENT_ID = '187334985650-4i3chk5boohhlta7cmlop4eeike7hrbo.apps.googleusercontent.com';

// Factor coefficient values for client-side live calculator preview
const EMISSION_COEFFICIENTS = {
  TRANSPORT: {
    CAR_PETROL: { factor: 0.18, unit: 'KM', name: 'Petrol Car' },
    CAR_DIESEL: { factor: 0.17, unit: 'KM', name: 'Diesel Car' },
    CAR_ELECTRIC: { factor: 0.05, unit: 'KM', name: 'Electric Car' },
    FLIGHT_SHORT: { factor: 0.15, unit: 'KM', name: 'Short-Haul Flight' },
    FLIGHT_LONG: { factor: 0.11, unit: 'KM', name: 'Long-Haul Flight' },
    PUBLIC_TRANSIT: { factor: 0.03, unit: 'KM', name: 'Public Transit' }
  },
  ELECTRICITY: {
    GRID_COAL: { factor: 0.85, unit: 'KWH', name: 'Coal-heavy Grid' },
    GRID_MIX: { factor: 0.45, unit: 'KWH', name: 'Standard Grid Mix' },
    RENEWABLE: { factor: 0.02, unit: 'KWH', name: 'Renewable Power' }
  },
  FOOD: {
    MEAT_BEEF: { factor: 6.0, unit: 'SERVINGS', name: 'Beef / Lamb Meal' },
    MEAT_POULTRY: { factor: 1.5, unit: 'SERVINGS', name: 'Chicken / Pork Meal' },
    VEGETARIAN: { factor: 0.5, unit: 'SERVINGS', name: 'Vegetarian Meal' },
    VEGAN: { factor: 0.25, unit: 'SERVINGS', name: 'Vegan Meal' }
  },
  SHOPPING: {
    CLOTHING: { factor: 0.15, unit: 'USD', name: 'Clothing / Textiles' },
    ELECTRONICS: { factor: 0.35, unit: 'USD', name: 'Consumer Electronics' },
    APPLIANCES: { factor: 0.25, unit: 'USD', name: 'Home Appliances' },
    GENERAL_GOODS: { factor: 0.08, unit: 'USD', name: 'General Retails / Groceries' }
  }
};

const CATEGORY_COLORS = {
  TRANSPORT: '#3b82f6', // blue
  ELECTRICITY: '#f59e0b', // amber
  FOOD: '#10b981', // green
  SHOPPING: '#f43f5e', // rose
  OVERALL: '#8b5cf6'  // violet
};

const BADGE_DEFINITIONS = [
  { id: 'earth_savior', name: 'Earth Savior', icon: '🌍', description: 'Awarded to the #1 user on the global leaderboard.', gradient: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)', glow: 'rgba(255, 215, 0, 0.5)' },
  { id: 'climate_guardian', name: 'Climate Guardian', icon: '🛡️', description: 'Awarded to the #2 user on the global leaderboard.', gradient: 'linear-gradient(135deg, #C0C0C0 0%, #A9A9A9 100%)', glow: 'rgba(192, 192, 192, 0.5)' },
  { id: 'eco_warrior', name: 'Eco Warrior', icon: '⚔️', description: 'Awarded to the #3 user on the global leaderboard.', gradient: 'linear-gradient(135deg, #CD7F32 0%, #8B4513 100%)', glow: 'rgba(205, 127, 50, 0.5)' },
  { id: 'eco_pioneer', name: 'Eco Pioneer', icon: '🍃', description: 'Log your first environmental activity.', gradient: 'var(--grad-primary)', glow: 'rgba(0,230,200,0.4)' },
  { id: 'green_commuter', name: 'Green Commuter', icon: '🚲', description: 'Log 10+ public transit or bike rides.', gradient: 'linear-gradient(135deg, #00d4ff 0%, #3b82f6 100%)', glow: 'rgba(0, 212, 255, 0.4)' },
  { id: 'plant_power', name: 'Plant Power', icon: '🍎', description: 'Log multiple vegetarian or vegan meals.', gradient: 'linear-gradient(135deg, #7fff6a 0%, #10b981 100%)', glow: 'rgba(127, 255, 106, 0.4)' },
  { id: 'goal_crusher', name: 'Goal Crusher', icon: '🏆', description: 'Successfully complete a carbon reduction goal.', gradient: 'linear-gradient(135deg, #ffb830 0%, #f59e0b 100%)', glow: 'rgba(255, 184, 48, 0.4)' },
  { id: 'carbon_champion', name: 'Carbon Champion', icon: '🏅', description: 'Keep your monthly footprint below 50kg.', gradient: 'linear-gradient(135deg, #ff4b8b 0%, #f43f5e 100%)', glow: 'rgba(255, 75, 139, 0.4)' },
  { id: 'streak_7', name: '7-Day Logging Streak', icon: '🔥', description: 'Maintain an active logging streak for 7 days.', gradient: 'linear-gradient(135deg, #ffb830 0%, #ff4b8b 100%)', glow: 'rgba(255, 184, 48, 0.4)' },
  { id: 'streak_30', name: '30-Day Logging Streak', icon: '🌟', description: 'Maintain an active logging streak for 30 days.', gradient: 'linear-gradient(135deg, #9b59ff 0%, #ff4b8b 100%)', glow: 'rgba(155, 89, 255, 0.4)' }
];

const getBadgeEmoji = (badgeName) => {
  switch (badgeName) {
    case 'Eco Pioneer': return '🍃';
    case 'Green Commuter': return '🚲';
    case 'Plant Power': return '🍎';
    case 'Goal Crusher': return '🏆';
    case 'Carbon Champion': return '🏅';
    case '7-Day Logging Streak': return '🔥';
    case '30-Day Logging Streak': return '🌟';
    default: return '⭐';
  }
};

export default function App() {
  // Auth state
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || null);
  const [authMode, setAuthMode] = useState('login'); // login / register
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [roleInput, setRoleInput] = useState('USER');
  const [inviteCodeInput, setInviteCodeInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleReady, setGoogleReady] = useState(false);

  // Theme state
  const [isLightMode, setIsLightMode] = useState(localStorage.getItem('theme') === 'light');

  useEffect(() => {
    if (isLightMode) {
      document.body.classList.add('light-theme');
      localStorage.setItem('theme', 'light');
    } else {
      document.body.classList.remove('light-theme');
      localStorage.setItem('theme', 'dark');
    }
  }, [isLightMode]);

  // ── Initialize Google Identity Services ────────────────────────────────────
  useEffect(() => {
    const initGsi = () => {
      if (window.google && window.google.accounts) {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleGoogleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
        });
        setGoogleReady(true);
      }
    };
    // GSI script may still be loading — poll until available
    if (window.google && window.google.accounts) {
      initGsi();
    } else {
      const interval = setInterval(() => {
        if (window.google && window.google.accounts) {
          clearInterval(interval);
          initGsi();
        }
      }, 200);
      return () => clearInterval(interval);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // App navigation
  const [activeTab, setActiveTab] = useState('dashboard');

  // Modals
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Dashboard / Analytics State
  const [summary, setSummary] = useState({
    totalCo2e: 0,
    categoryBreakdown: [],
    momComparison: { userValue: 0, comparisonValue: 0, percentageDifference: 0 },
    peerComparison: { userValue: 0, comparisonValue: 0, percentageDifference: 0 },
    earnedBadges: []
  });
  const [weeklyTrend, setWeeklyTrend] = useState([]);
  const [trendInterval, setTrendInterval] = useState('daily');
  const [recommendations, setRecommendations] = useState([]);
  const [logs, setLogs] = useState([]);
  const [goals, setGoals] = useState([]);
  const [globalLeaderboard, setGlobalLeaderboard] = useState([]);
  const [orgLeaderboard, setOrgLeaderboard] = useState([]);
  const [orgSummary, setOrgSummary] = useState(null);

  // Forms - Log Activity
  const [logCat, setLogCat] = useState('TRANSPORT');
  const [logType, setLogType] = useState('CAR_PETROL');
  const [logQty, setLogQty] = useState('');
  const [logDate, setLogDate] = useState(new Date().toISOString().split('T')[0]);
  const [logSuccessMsg, setLogSuccessMsg] = useState('');
  const [logErrorMsg, setLogErrorMsg] = useState('');

  // Forms - Goal Creation
  const [goalCat, setGoalCat] = useState('OVERALL'); // OVERALL, or specific category
  const [goalReduction, setGoalReduction] = useState(15);
  const [goalStart, setGoalStart] = useState(new Date().toISOString().split('T')[0]);
  const [goalEnd, setGoalEnd] = useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [goalSuccessMsg, setGoalSuccessMsg] = useState('');
  const [goalErrorMsg, setGoalErrorMsg] = useState('');

  // Live estimated emission calc (React State derived or calculated)
  const [liveEstimatedCo2, setLiveEstimatedCo2] = useState(0);

  // Eco Hub State (Travel Distance Simulator)
  const [travelDistance, setTravelDistance] = useState('100');

  // API Call Wrapper with Token and Fallback Support
  const apiCall = async (endpoint, options = {}) => {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers
    });

    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}));
      throw new Error(errBody.message || `API Error: ${response.status}`);
    }

    if (response.status === 24) return null;
    return response.json();
  };

  // Sync Live CO2 Calculator
  useEffect(() => {
    const qty = parseFloat(logQty);
    if (!isNaN(qty) && qty > 0) {
      const coef = EMISSION_COEFFICIENTS[logCat]?.[logType];
      if (coef) {
        setLiveEstimatedCo2(qty * coef.factor);
        return;
      }
    }
    setLiveEstimatedCo2(0);
  }, [logCat, logType, logQty]);

  // Handle Tab Switch / Data Loading
  useEffect(() => {
    if (!token) return;
    loadData();
  }, [token, activeTab]);

  useEffect(() => {
    if (!token || activeTab !== 'dashboard') return;
    fetchTrendData(trendInterval);
  }, [token, trendInterval]);

  const fetchTrendData = async (interval) => {
    try {
      const data = await apiCall(`/footprint/summary/${interval}`);
      if (data) {
        const map = {};
        data.forEach(item => {
          const rawDate = item.date;
          let dateKey = rawDate;
          if (Array.isArray(rawDate)) {
            const y = rawDate[0];
            const m = String(rawDate[1]).padStart(2, '0');
            const d = String(rawDate[2]).padStart(2, '0');
            dateKey = `${y}-${m}-${d}`;
          }
          if (!map[dateKey]) {
            map[dateKey] = 0;
          }
          map[dateKey] += item.totalCo2e;
        });
        
        const sortedDates = Object.keys(map).sort();
        const formatted = sortedDates.map(dateStr => {
          let label = dateStr;
          try {
            const parts = dateStr.split('-');
            if (parts.length === 3) {
              const d = new Date(parts[0], parts[1] - 1, parts[2]);
              if (interval === 'monthly') {
                label = d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
              } else {
                label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
              }
            }
          } catch(e) {}
          
          return {
            date: label,
            amount: Math.round(map[dateStr] * 10.0) / 10.0
          };
        });
        
        setWeeklyTrend(formatted);
      }
    } catch (err) {
      console.warn('Failed to load trend data, using mock instead', err);
      loadMockTrendData(interval);
    }
  };

  const loadMockTrendData = (interval) => {
    const trendList = [];
    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const limit = interval === 'monthly' ? 6 : interval === 'weekly' ? 8 : 10;
    
    for (let i = limit - 1; i >= 0; i--) {
      const date = new Date();
      if (interval === 'monthly') {
        date.setMonth(date.getMonth() - i);
      } else if (interval === 'weekly') {
        date.setDate(date.getDate() - (i * 7));
      } else {
        date.setDate(date.getDate() - i);
      }
      
      let label;
      if (interval === 'monthly') {
        label = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      } else if (interval === 'weekly') {
        label = 'Wk ' + date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      } else {
        label = weekdays[date.getDay()] + ', ' + date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }
      
      trendList.push({
        date: label,
        amount: Math.round((15 + Math.random() * 45) * 10) / 10
      });
    }
    setWeeklyTrend(trendList);
  };

  const loadData = async () => {
    try {
      if (activeTab === 'dashboard') {
        const summaryData = await apiCall('/analytics/summary');
        setSummary(summaryData);
        fetchTrendData(trendInterval);
        const recsData = await apiCall('/analytics/recommendations');
        setRecommendations(recsData);
      } else if (activeTab === 'activities') {
        const logsPage = await apiCall('/activities?page=0&size=100');
        setLogs(logsPage.content || []);
      } else if (activeTab === 'goals') {
        const goalsData = await apiCall('/goals');
        setGoals(goalsData);
      } else if (activeTab === 'leaderboard') {
        const globalLb = await apiCall('/leaderboard');
        setGlobalLeaderboard(globalLb);
        if (user?.organizationName) {
          const orgLb = await apiCall('/leaderboard/org');
          setOrgLeaderboard(orgLb);
        }
      } else if (activeTab === 'corporate') {
        if (user?.role === 'ORG_ADMIN' || user?.role === 'ADMIN') {
          const corporateData = await apiCall('/org/summary');
          setOrgSummary(corporateData);
        }
      }
    } catch (err) {
      console.warn('Backend connection unavailable, loading interactive mock data instead.', err);
      loadMockData();
    }
  };

  // Interactive Mock Data Fallback
  const loadMockData = () => {
    loadMockTrendData(trendInterval);

    // Mock summary
    setSummary({
      totalCo2e: 485.6,
      categoryBreakdown: [
        { category: 'TRANSPORT', amount: 242.8, percentage: 50.0 },
        { category: 'ELECTRICITY', amount: 145.7, percentage: 30.0 },
        { category: 'FOOD', amount: 67.9, percentage: 14.0 },
        { category: 'SHOPPING', amount: 29.2, percentage: 6.0 }
      ],
      momComparison: { userValue: 88.5, comparisonValue: 105.2, percentageDifference: -15.8 },
      peerComparison: { userValue: 88.5, comparisonValue: 120.0, percentageDifference: -26.25 },
      earnedBadges: ['Eco Pioneer', 'Green Commuter', 'Plant Power'],
      currentStreak: 3,
      benchmarking: {
        userPercentile: 15.5,
        userRank: 4,
        totalUsers: 25,
        categoryComparisons: [
          { category: 'TRANSPORT', userTotal: 40.5, platformAverage: 55.0 },
          { category: 'ELECTRICITY', userTotal: 25.0, platformAverage: 30.5 },
          { category: 'FOOD', userTotal: 15.0, platformAverage: 20.0 },
          { category: 'SHOPPING', userTotal: 8.0, platformAverage: 14.5 }
        ]
      }
    });

    // Mock recommendations
    setRecommendations([
      {
        category: 'TRANSPORT',
        tip: 'Public transit is highly optimized. Swap single-passenger petrol commutes for train/bus travel to cut emissions.',
        estimatedSavings: 'Saves ~20kg CO2e per 100km',
        actionKey: 'use_public_transit'
      },
      {
        category: 'TRANSPORT',
        tip: 'If traveling short distances (< 5km), try walking or using a bicycle instead of driving a vehicle.',
        estimatedSavings: 'Saves ~10kg CO2e per trip',
        actionKey: 'bike_short_commute'
      }
    ]);

    // Mock activity logs
    setLogs([
      { id: 1, category: 'TRANSPORT', activityType: 'CAR_PETROL', quantity: 80, unit: 'KM', logDate: '2026-07-02', calculatedCo2e: 14.4 },
      { id: 2, category: 'FOOD', activityType: 'MEAT_BEEF', quantity: 2, unit: 'SERVINGS', logDate: '2026-07-01', calculatedCo2e: 12.0 },
      { id: 3, category: 'ELECTRICITY', activityType: 'GRID_MIX', quantity: 45, unit: 'KWH', logDate: '2026-06-30', calculatedCo2e: 20.25 },
      { id: 4, category: 'SHOPPING', activityType: 'CLOTHING', quantity: 120, unit: 'USD', logDate: '2026-06-29', calculatedCo2e: 18.0 },
      { id: 5, category: 'TRANSPORT', activityType: 'PUBLIC_TRANSIT', quantity: 30, unit: 'KM', logDate: '2026-06-28', calculatedCo2e: 0.9 }
    ]);

    // Mock goals
    setGoals([
      { id: 1, targetCategory: 'TRANSPORT', targetReductionPercentage: 15, startDate: '2026-07-01', endDate: '2026-07-31', targetValue: 120.0, currentValue: 14.4, progressPercentage: 12.0, status: 'ACTIVE' },
      { id: 2, targetCategory: 'OVERALL', targetReductionPercentage: 10, startDate: '2026-06-01', endDate: '2026-06-30', targetValue: 350.0, currentValue: 310.0, progressPercentage: 88.5, status: 'COMPLETED' }
    ]);

    // Mock global leaderboard
    setGlobalLeaderboard([
      { userId: 1, username: 'green_warrior', organizationName: 'Acme Corporation', totalCo2e: 42.5, rank: 1, badges: ['Eco Pioneer', 'Carbon Champion'] },
      { userId: 2, username: 'sustainability_guru', organizationName: 'Greenpeace Local', totalCo2e: 58.2, rank: 2, badges: ['Eco Pioneer', 'Goal Crusher'] },
      { userId: 3, username: 'eco_friendly_bob', organizationName: 'Independent', totalCo2e: 76.8, rank: 3, badges: ['Eco Pioneer'] },
      { userId: 4, username: user?.username || 'you', organizationName: user?.organizationName || 'Independent', totalCo2e: 88.5, rank: 4, badges: ['Eco Pioneer', 'Green Commuter'] }
    ]);

    // Mock organization leaderboard
    setOrgLeaderboard([
      { userId: 1, username: 'green_warrior', organizationName: 'Acme Corporation', totalCo2e: 42.5, rank: 1, badges: ['Eco Pioneer', 'Carbon Champion'] },
      { userId: 4, username: user?.username || 'you', organizationName: 'Acme Corporation', totalCo2e: 88.5, rank: 2, badges: ['Eco Pioneer', 'Green Commuter'] },
      { userId: 5, username: 'office_worker_joe', organizationName: 'Acme Corporation', totalCo2e: 142.1, rank: 3, badges: ['Eco Pioneer'] }
    ]);

    // Mock corporate report
    setOrgSummary({
      orgName: user?.organizationName || 'Acme Corporation',
      inviteCode: 'ACME2026',
      memberCount: 12,
      totalCo2e: 1540.8,
      categoryBreakdown: [
        { category: 'TRANSPORT', amount: 820.0, percentage: 53.2 },
        { category: 'ELECTRICITY', amount: 480.0, percentage: 31.1 },
        { category: 'FOOD', amount: 160.0, percentage: 10.4 },
        { category: 'SHOPPING', amount: 80.8, percentage: 5.3 }
      ],
      employeeFootprints: [
        { userId: 1, username: 'green_warrior', organizationName: 'Acme Corporation', totalCo2e: 42.5, rank: 1, badges: ['Eco Pioneer', 'Carbon Champion'] },
        { userId: 4, username: user?.username || 'you', organizationName: 'Acme Corporation', totalCo2e: 88.5, rank: 2, badges: ['Eco Pioneer', 'Green Commuter'] },
        { userId: 5, username: 'office_worker_joe', organizationName: 'Acme Corporation', totalCo2e: 142.1, rank: 3, badges: ['Eco Pioneer'] }
      ]
    });
  };

  // Auth Operations
  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);

    try {
      if (authMode === 'login') {
        const res = await fetch(`${API_BASE}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: usernameInput, password: passwordInput })
        });

        if (!res.ok) {
          throw new Error('Invalid username or password credentials');
        }

        const data = await res.json();
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify({
          username: data.username,
          role: data.role,
          organizationName: data.organizationName
        }));

        setToken(data.token);
        setUser({
          username: data.username,
          role: data.role,
          organizationName: data.organizationName
        });
        setActiveTab('dashboard');
      } else {
        const body = {
          username: usernameInput,
          password: passwordInput,
          role: roleInput
        };
        if (inviteCodeInput) {
          body.inviteCode = inviteCodeInput;
        }

        const res = await fetch(`${API_BASE}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.message || 'Registration failed. Username may be taken.');
        }

        const data = await res.json();
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify({
          username: data.username,
          role: data.role,
          organizationName: data.organizationName
        }));

        setToken(data.token);
        setUser({
          username: data.username,
          role: data.role,
          organizationName: data.organizationName
        });
        setActiveTab('dashboard');
      }
    } catch (err) {
      setAuthError(err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  // Called by Google Identity Services with a credential JWT
  const handleGoogleCredentialResponse = async (googleResponse) => {
    setAuthError('');
    setGoogleLoading(true);
    try {
      // googleResponse.credential is the Google ID token (JWT)
      // We forward it directly to our backend for validation
      const res = await fetch(`${API_BASE}/auth/google-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idToken: googleResponse.credential,
          email: null,
          name: null
        })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || 'Google Authentication failed.');
      }

      const data = await res.json();
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify({
        username: data.username,
        role: data.role,
        organizationName: data.organizationName
      }));

      setToken(data.token);
      setUser({
        username: data.username,
        role: data.role,
        organizationName: data.organizationName
      });
      setActiveTab('dashboard');
    } catch (err) {
      setAuthError(err.message);
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGoogleLogin = async (mockEmail, mockName, mockId) => {
    setAuthError('');
    setAuthLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/google-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idToken: mockId || 'google_token_123',
          email: mockEmail || 'kavin@google.com',
          name: mockName || 'Kavin'
        })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || 'Google Authentication failed.');
      }

      const data = await res.json();
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify({
        username: data.username,
        role: data.role,
        organizationName: data.organizationName
      }));

      setToken(data.token);
      setUser({
        username: data.username,
        role: data.role,
        organizationName: data.organizationName
      });
      setActiveTab('dashboard');
    } catch (err) {
      setAuthError(err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken('');
    setUser(null);
    setUsernameInput('');
    setPasswordInput('');
  };

  // Activity Log Submit
  const handleLogSubmit = async (e) => {
    e.preventDefault();
    setLogSuccessMsg('');
    setLogErrorMsg('');

    const qty = parseFloat(logQty);
    if (isNaN(qty) || qty <= 0) {
      setLogErrorMsg('Please input a valid quantity greater than zero');
      return;
    }

    try {
      const payload = {
        category: logCat,
        activityType: logType,
        quantity: qty,
        unit: EMISSION_COEFFICIENTS[logCat][logType].unit,
        logDate: logDate
      };

      await apiCall('/activities', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      setLogSuccessMsg('Activity logged successfully!');
      setLogQty('');
      setTimeout(() => {
        setIsLogModalOpen(false);
        setLogSuccessMsg('');
        loadData();
      }, 1000);
    } catch (err) {
      // Catch and apply in mock environment if backend is offline
      setLogSuccessMsg('Logged successfully (Mock Sync)!');
      const newLog = {
        id: Date.now(),
        category: logCat,
        activityType: logType,
        quantity: qty,
        unit: EMISSION_COEFFICIENTS[logCat][logType].unit,
        logDate: logDate,
        calculatedCo2e: Math.round(qty * EMISSION_COEFFICIENTS[logCat][logType].factor * 100.0) / 100.0
      };
      setLogs([newLog, ...logs]);
      
      // Update totals
      const updatedBreakdown = summary.categoryBreakdown.map(item => {
        if (item.category === logCat) {
          return {
            ...item,
            amount: Math.round((item.amount + newLog.calculatedCo2e) * 100.0) / 100.0
          };
        }
        return item;
      });
      const newTotal = Math.round((summary.totalCo2e + newLog.calculatedCo2e) * 100.0) / 100.0;
      
      setSummary({
        ...summary,
        totalCo2e: newTotal,
        categoryBreakdown: updatedBreakdown
      });

      // Update weekly trend
      const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const targetDay = weekdays[new Date(logDate).getDay()] + ', ' + new Date(logDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const updatedTrend = weeklyTrend.map(t => {
        if (t.date.split(',')[0] === targetDay.split(',')[0]) {
          return { ...t, amount: Math.round((t.amount + newLog.calculatedCo2e) * 10) / 10 };
        }
        return t;
      });
      setWeeklyTrend(updatedTrend);

      setLogQty('');
      setTimeout(() => {
        setIsLogModalOpen(false);
        setLogSuccessMsg('');
      }, 1000);
    }
  };

  // Delete Log
  const handleDeleteLog = async (id) => {
    if (!window.confirm('Are you sure you want to delete this log entry?')) return;
    try {
      await apiCall(`/activities/${id}`, { method: 'DELETE' });
      loadData();
    } catch (err) {
      // Mock delete
      const deletedLog = logs.find(l => l.id === id);
      setLogs(logs.filter(l => l.id !== id));
      if (deletedLog) {
        const newTotal = Math.max(0, Math.round((summary.totalCo2e - deletedLog.calculatedCo2e) * 100.0) / 100.0);
        setSummary({
          ...summary,
          totalCo2e: newTotal,
          categoryBreakdown: summary.categoryBreakdown.map(item => {
            if (item.category === deletedLog.category) {
              return { ...item, amount: Math.max(0, Math.round((item.amount - deletedLog.calculatedCo2e) * 100.0) / 100.0) };
            }
            return item;
          })
        });
      }
    }
  };

  // Goal Submit
  const handleGoalSubmit = async (e) => {
    e.preventDefault();
    setGoalSuccessMsg('');
    setGoalErrorMsg('');

    try {
      const payload = {
        targetCategory: goalCat === 'OVERALL' ? null : goalCat,
        targetReductionPercentage: parseFloat(goalReduction),
        startDate: goalStart,
        endDate: goalEnd
      };

      await apiCall('/goals', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      setGoalSuccessMsg('Reduction goal configured successfully!');
      setTimeout(() => {
        setIsGoalModalOpen(false);
        setGoalSuccessMsg('');
        loadData();
      }, 1000);
    } catch (err) {
      // Mock goal creation
      setGoalSuccessMsg('Goal configured successfully (Mock Sync)!');
      const newGoal = {
        id: Date.now(),
        targetCategory: goalCat,
        targetReductionPercentage: parseFloat(goalReduction),
        startDate: goalStart,
        endDate: goalEnd,
        targetValue: goalCat === 'OVERALL' ? 430.0 : 120.0,
        currentValue: 0.0,
        progressPercentage: 0.0,
        status: 'ACTIVE'
      };
      setGoals([newGoal, ...goals]);
      setTimeout(() => {
        setIsGoalModalOpen(false);
        setGoalSuccessMsg('');
      }, 1000);
    }
  };

  // Delete Goal
  const handleDeleteGoal = async (id) => {
    if (!window.confirm('Remove this reduction goal?')) return;
    try {
      await apiCall(`/goals/${id}`, { method: 'DELETE' });
      loadData();
    } catch (err) {
      setGoals(goals.filter(g => g.id !== id));
    }
  };

  // Change Log Category triggers corresponding logType reset
  const handleLogCatChange = (cat) => {
    setLogCat(cat);
    const types = Object.keys(EMISSION_COEFFICIENTS[cat]);
    setLogType(types[0]);
  };

  // Render Authentication Page
  if (!token) {
    return (
      <div className="auth-container">
        <div className="auth-hero">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <Leaf size={40} color="#14f0d4" />
            <h1 style={{ fontSize: '3rem', fontFamily: 'var(--font-display)', fontWeight: 800, background: 'var(--grad-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>CarbonTrack</h1>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.15rem', lineHeight: '1.7', maxWidth: '530px' }}>
            A personal and organizational carbon footprint analytics and sustainability platform.
            Log daily activities, review visual analytics dashboards, configure goal reduction milestones,
            and benchmark performance across the community scoreboard.
          </p>
          <div style={{ marginTop: '44px', display: 'flex', gap: '36px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--color-teal)' }}>50+</span>
              <span style={{ fontSize: '0.83rem', color: 'var(--text-muted)' }}>CO₂e reference values</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--color-purple)' }}>Real-time</span>
              <span style={{ fontSize: '0.83rem', color: 'var(--text-muted)' }}>Rule-engine updates</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--color-indigo)' }}>Gamified</span>
              <span style={{ fontSize: '0.83rem', color: 'var(--text-muted)' }}>Milestone badges</span>
            </div>
          </div>
        </div>

        <div className="auth-form-panel">
          <h2 style={{ fontSize: '2rem', marginBottom: '8px' }}>
            {authMode === 'login' ? 'Welcome Back' : 'Join CarbonTrack'}
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '30px' }}>
            {authMode === 'login' ? 'Please log in to your account' : 'Create an account to start tracking'}
          </p>

          <form onSubmit={handleAuth}>
            <div className="input-group">
              <label>Username</label>
              <input
                className="input-field"
                type="text"
                placeholder="Enter username"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label>Password</label>
              <input
                className="input-field"
                type="password"
                placeholder="Enter password (min 6 chars)"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                required
              />
            </div>

            {authMode === 'register' && (
              <>
                <div className="input-group">
                  <label>Invite Code (Optional)</label>
                  <input
                    className="input-field"
                    type="text"
                    placeholder="e.g. ACME2026 (to join workplace)"
                    value={inviteCodeInput}
                    onChange={(e) => setInviteCodeInput(e.target.value)}
                  />
                </div>
              </>
            )}

            {authError && (
              <div style={{ color: 'var(--color-rose)', fontSize: '0.85rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Clock size={16} />
                <span>{authError}</span>
              </div>
            )}

            <button className="btn-primary" type="submit" disabled={authLoading} style={{ width: '100%', padding: '14px' }}>
              {authLoading ? <RefreshCw className="animate-spin" size={18} /> : (authMode === 'login' ? 'Log In' : 'Create Account')}
            </button>
          </form>

          {/* ── Google OAuth2 Sign-In ─────────────────────────────────────── */}
          <div style={{ margin: '24px 0', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ flex: 1, height: '1px', background: 'rgba(0,230,200,0.12)' }} />
            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>or continue with</span>
            <div style={{ flex: 1, height: '1px', background: 'rgba(0,230,200,0.12)' }} />
          </div>

          <button
            id="google-signin-btn"
            onClick={() => {
              if (!googleReady) {
                setAuthError('Google Sign-In is loading. Please try again in a moment.');
                return;
              }
              setGoogleLoading(true);
              setAuthError('');
              window.google.accounts.id.prompt((notification) => {
                setGoogleLoading(false);
                if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
                  setAuthError('Google One-Tap was blocked by the browser. Please allow popups or try regular login.');
                }
              });
            }}
            disabled={googleLoading}
            style={{
              width: '100%',
              padding: '13px 20px',
              borderRadius: '12px',
              border: '1px solid rgba(0,230,200,0.18)',
              background: 'rgba(255,255,255,0.04)',
              color: 'var(--text-primary)',
              fontSize: '0.93rem',
              fontWeight: 600,
              fontFamily: 'var(--font-sans)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
          >
            {googleLoading ? (
              <RefreshCw className="animate-spin" size={18} />
            ) : (
              <svg width="18" height="18" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              </svg>
            )}
            {authMode === 'login' ? 'Sign in with Google' : 'Sign up with Google'}
          </button>


          <div style={{ marginTop: '24px', textAlign: 'center' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              {authMode === 'login' ? "Don't have an account? " : "Already have an account? "}
            </span>
            <button
              onClick={() => {
                setAuthMode(authMode === 'login' ? 'register' : 'login');
                setAuthError('');
              }}
              style={{ background: 'none', border: 'none', color: 'var(--color-green)', fontWeight: 'semibold', cursor: 'pointer', fontSize: '0.9rem', textDecoration: 'underline' }}
            >
              {authMode === 'login' ? 'Sign Up' : 'Log In'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Sidebar Panel */}
      <div className="sidebar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '30px' }}>
          <Leaf size={26} color="#14f0d4" />
          <h2 style={{ fontSize: '1.4rem', fontFamily: 'var(--font-display)', fontWeight: 800, background: 'var(--grad-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>CarbonTrack</h2>
        </div>

        <div className="nav-links">
          <div className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
            <Trophy size={18} />
            <span>Dashboard</span>
          </div>
          <div className={`nav-item ${activeTab === 'activities' ? 'active' : ''}`} onClick={() => setActiveTab('activities')}>
            <Calendar size={18} />
            <span>Activities</span>
          </div>
          <div className={`nav-item ${activeTab === 'goals' ? 'active' : ''}`} onClick={() => setActiveTab('goals')}>
            <TrendingDown size={18} />
            <span>Goals</span>
          </div>
          <div className={`nav-item ${activeTab === 'leaderboard' ? 'active' : ''}`} onClick={() => setActiveTab('leaderboard')}>
            <Users size={18} />
            <span>Leaderboard</span>
          </div>
          <div className={`nav-item ${activeTab === 'badges' ? 'active' : ''}`} onClick={() => setActiveTab('badges')}>
            <Award size={18} />
            <span>Badges</span>
          </div>
          <div className={`nav-item ${activeTab === 'ecohub' ? 'active' : ''}`} onClick={() => setActiveTab('ecohub')}>
            <Globe size={18} />
            <span>Eco Hub</span>
          </div>

          {(user?.role === 'ORG_ADMIN' || user?.role === 'ADMIN') && (
            <div className={`nav-item ${activeTab === 'corporate' ? 'active' : ''}`} onClick={() => setActiveTab('corporate')}>
              <Briefcase size={18} />
              <span>Corporate Analytics</span>
            </div>
          )}
        </div>

        <div style={{ marginTop: 'auto', borderTop: '1px solid rgba(139, 92, 246, 0.12)', paddingTop: '20px' }}>
          <div 
            style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', cursor: 'pointer', padding: '8px', borderRadius: '12px', transition: 'background 0.2s' }}
            onClick={() => setIsProfileModalOpen(true)}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--grad-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.9rem', boxShadow: '0 0 12px rgba(139,92,246,0.4)' }}>
              {user?.username?.charAt(0)}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{user?.username}</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user?.role === 'ORG_ADMIN' ? 'Org Manager' : user?.role}</span>
            </div>
          </div>

          <button onClick={handleLogout} style={{ width: '100%', padding: '9px 16px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.18)', borderRadius: '10px', color: 'var(--color-purple)', cursor: 'pointer', transition: 'var(--transition)', fontSize: '0.88rem', fontWeight: 500 }}>
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Main Viewport Panel */}
      <div className="main-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <div>
            <h1 style={{ fontSize: '2.2rem', fontFamily: 'var(--font-display)', fontWeight: 800 }}>
              {activeTab === 'dashboard' && 'Sustainability Analytics'}
              {activeTab === 'activities' && 'Activity Logs'}
              {activeTab === 'goals' && 'Reduction Targets'}
              {activeTab === 'leaderboard' && 'Community scoreboard'}
              {activeTab === 'corporate' && 'Workplace footprint report'}
              {activeTab === 'ecohub' && 'Eco Hub & Net-Zero Forest'}
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '4px' }}>
              {activeTab === 'dashboard' && 'Summary of environmental impacts and green achievements'}
              {activeTab === 'activities' && 'Track and edit your daily carbon emission logs'}
              {activeTab === 'goals' && 'Configure and monitor personal carbon budget limits'}
              {activeTab === 'leaderboard' && 'Rankings of users actively saving emissions'}
              {activeTab === 'corporate' && 'Corporate aggregated carbon metrics and office leaderboards'}
              {activeTab === 'ecohub' && 'Interactive commute planning and virtual carbon offset forestry'}
            </p>
          </div>

          {activeTab !== 'corporate' && activeTab !== 'ecohub' && (
            <button className="btn-primary" onClick={() => setIsLogModalOpen(true)}>
              <Plus size={18} />
              <span>Log Activity</span>
            </button>
          )}
        </div>

        {/* --- VIEW: DASHBOARD --- */}
        {activeTab === 'dashboard' && (
          <div>
            {/* KPI Metrics Row */}
            <div className="metrics-row">
              <div className="metric-card">
                <span className="title">Total Footprint</span>
                <span className="value">{summary.totalCo2e} kg</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>CO₂e lifetime total</span>
              </div>

              <div className="metric-card">
                <span className="title">Current Streak</span>
                <span className="value" style={{ color: 'var(--color-teal)' }}>
                  {summary.currentStreak || 0}
                </span>
                <span className="change" style={{ color: 'var(--color-teal)' }}>
                  🔥 Days of Activity
                </span>
              </div>

              <div className="metric-card">
                <span className="title">Benchmarking</span>
                <span className="value" style={{ color: summary.peerComparison.percentageDifference <= 0 ? 'var(--color-green)' : 'var(--color-rose)' }}>
                  {summary.peerComparison.percentageDifference <= 0 ? '' : '+'}{summary.peerComparison.percentageDifference}%
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  {summary.peerComparison.percentageDifference <= 0 ? 'Under' : 'Over'} peer average footprint
                </span>
              </div>

              <div className="metric-card">
                <span className="title">Badges Earned</span>
                <span className="value">{summary.earnedBadges.length}</span>
                <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                  {summary.earnedBadges.slice(0, 3).map((b, idx) => (
                    <span key={idx} title={b} style={{ fontSize: '1rem' }}>
                      {getBadgeEmoji(b)}
                    </span>
                  ))}
                  {summary.earnedBadges.length > 3 && <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', paddingLeft: '4px' }}>+{summary.earnedBadges.length - 3} more</span>}
                </div>
              </div>
            </div>

            {/* Charts Row */}
            <div className="charts-grid">
              <div className="glass-panel" style={{ height: '380px', display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <TrendingUp size={18} color="var(--color-green)" />
                  <span>Category footprint breakdown</span>
                </h3>
                <div style={{ flex: 1, minHeight: 0 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={summary.categoryBreakdown.filter(c => c.amount > 0)}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={5}
                        dataKey="amount"
                        nameKey="category"
                      >
                        {summary.categoryBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.category] || '#ccc'} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `${value} kg CO2e`} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="glass-panel" style={{ height: '400px', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                    <TrendingDown size={18} color={trendInterval === 'daily' ? 'var(--color-cyan)' : trendInterval === 'weekly' ? 'var(--color-violet)' : 'var(--color-amber)'} />
                    <span>Progress Trend ({trendInterval})</span>
                  </h3>
                  <div style={{ display: 'flex', gap: '4px', background: 'rgba(255,255,255,0.03)', padding: '2px', borderRadius: '6px' }}>
                    {['daily', 'weekly', 'monthly'].map((interval) => (
                      <button
                        key={interval}
                        onClick={() => setTrendInterval(interval)}
                        style={{
                          background: trendInterval === interval 
                            ? (interval === 'daily' ? 'var(--color-cyan)' : interval === 'weekly' ? 'var(--color-violet)' : 'var(--color-amber)')
                            : 'transparent',
                          color: trendInterval === interval ? '#0c0d12' : 'var(--text-muted)',
                          border: 'none',
                          padding: '3px 8px',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          fontWeight: trendInterval === interval ? '600' : '400',
                          cursor: 'pointer',
                          textTransform: 'capitalize',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {interval}
                      </button>
                    ))}
                  </div>
                </div>
                <div style={{ flex: 1, minHeight: 0 }}>
                  {trendInterval === 'daily' && (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={weeklyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorCo2Daily" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--color-cyan)" stopOpacity={0.4}/>
                            <stop offset="95%" stopColor="var(--color-cyan)" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={11} />
                        <YAxis stroke="var(--text-muted)" fontSize={11} />
                        <Tooltip contentStyle={{ background: '#08101c', borderColor: 'var(--color-cyan)', borderRadius: '8px', color: '#fff' }} />
                        <Area type="monotone" dataKey="amount" stroke="var(--color-cyan)" strokeWidth={2} fillOpacity={1} fill="url(#colorCo2Daily)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                  {trendInterval === 'weekly' && (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={weeklyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorCo2Weekly" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--color-violet)" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="var(--color-cobalt)" stopOpacity={0.3}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={11} />
                        <YAxis stroke="var(--text-muted)" fontSize={11} />
                        <Tooltip contentStyle={{ background: '#08101c', borderColor: 'var(--color-violet)', borderRadius: '8px', color: '#fff' }} />
                        <Bar dataKey="amount" fill="url(#colorCo2Weekly)" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                  {trendInterval === 'monthly' && (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={weeklyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={11} />
                        <YAxis stroke="var(--text-muted)" fontSize={11} />
                        <Tooltip contentStyle={{ background: '#08101c', borderColor: 'var(--color-amber)', borderRadius: '8px', color: '#fff' }} />
                        <Line type="monotone" dataKey="amount" stroke="var(--color-amber)" strokeWidth={3} activeDot={{ r: 8 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </div>
                {trendInterval === 'daily' && (
                  <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0, 212, 255, 0.04)', border: '1px solid rgba(0, 212, 255, 0.12)', borderRadius: '10px', padding: '8px 12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: 'var(--color-cyan)' }}>
                      <Clock size={15} />
                      <span><strong>Daily Habit:</strong> Logging daily emissions increases carbon-reduction success rate by 42%.</span>
                    </div>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Target: &lt; 15kg/day</span>
                  </div>
                )}
                {trendInterval === 'weekly' && (
                  <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(155, 89, 255, 0.04)', border: '1px solid rgba(155, 89, 255, 0.12)', borderRadius: '10px', padding: '8px 12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: 'var(--color-violet)' }}>
                      <Calendar size={15} />
                      <span><strong>Weekly Cycle:</strong> Transport and food emissions tend to peak during weekends.</span>
                    </div>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Target: &lt; 100kg/week</span>
                  </div>
                )}
                {trendInterval === 'monthly' && (
                  <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255, 184, 48, 0.04)', border: '1px solid rgba(255, 184, 48, 0.12)', borderRadius: '10px', padding: '8px 12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: 'var(--color-amber)' }}>
                      <TrendingDown size={15} />
                      <span><strong>Monthly Goal:</strong> Target reduction is a 15% decrease relative to historical baseline.</span>
                    </div>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Target: -15% MoM</span>
                  </div>
                )}
              </div>
            </div>

            {/* Peer Benchmarking Module */}
            {summary.benchmarking && (
              <div className="glass-panel" style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Users size={20} color="var(--color-blue)" />
                  <span>Peer Benchmarking</span>
                </h3>
                
                <div style={{ background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.1), rgba(129, 140, 248, 0.1))', padding: '24px', borderRadius: '12px', marginBottom: '24px', border: '1px solid rgba(56, 189, 248, 0.2)', textAlign: 'center' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>🏆</div>
                  <h4 style={{ fontSize: '1.4rem', color: '#fff', margin: '0 0 8px 0' }}>You are in the Top {summary.benchmarking.userPercentile}% of eco-friendly users!</h4>
                  <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.95rem' }}>Keep up the great work! Your carbon footprint is lower than {Math.max(0, 100 - summary.benchmarking.userPercentile)}% of the community.</p>
                </div>

                <h4 style={{ fontSize: '1.05rem', marginBottom: '16px', color: 'var(--text-primary)' }}>Category Comparison (kg CO₂e)</h4>
                <div style={{ height: '300px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={summary.benchmarking.categoryComparisons} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                      <XAxis type="number" stroke="var(--text-muted)" fontSize={11} />
                      <YAxis dataKey="category" type="category" stroke="var(--text-muted)" fontSize={11} width={80} />
                      <Tooltip contentStyle={{ background: '#08101c', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} />
                      <Legend />
                      <Bar dataKey="userTotal" name="Your Footprint" fill="var(--color-cyan)" radius={[0, 4, 4, 0]} barSize={20} />
                      <Bar dataKey="platformAverage" name="Platform Average" fill="var(--color-cobalt)" radius={[0, 4, 4, 0]} barSize={20} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Bottom Row: Active Goals & Smart Tips */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '24px' }}>
              <div className="glass-panel">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Trophy size={18} color="var(--color-amber)" />
                    <span>Active Carbon Budgets</span>
                  </h3>
                  <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => setIsGoalModalOpen(true)}>
                    <Plus size={14} />
                    <span>Add Goal</span>
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {goals.filter(g => g.status === 'ACTIVE').length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                      No active reduction goals. Set a budget limit to track progress!
                    </div>
                  ) : (
                    goals.filter(g => g.status === 'ACTIVE').map(goal => (
                      <div key={goal.id} style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)', borderRadius: '12px', padding: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem' }}>
                          <span style={{ fontWeight: 'semibold', textTransform: 'capitalize' }}>
                            {goal.targetCategory === 'OVERALL' ? 'Overall Footprint' : `${goal.targetCategory.toLowerCase()} budget`} ({goal.targetReductionPercentage}% cut)
                          </span>
                          <span style={{ color: goal.currentValue > goal.targetValue ? 'var(--color-rose)' : 'var(--color-green)' }}>
                            {goal.currentValue} / {goal.targetValue} kg CO₂e
                          </span>
                        </div>

                        <div className="progress-container" style={{ marginBottom: '8px' }}>
                          <div
                            className={`progress-fill ${goal.currentValue > goal.targetValue ? 'rose' : (goal.progressPercentage >= 80 ? 'blue' : 'green')}`}
                            style={{ width: `${Math.min(100, goal.progressPercentage)}%` }}
                          />
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          <span>Starts {goal.startDate}</span>
                          <span>{Math.round(goal.progressPercentage)}% budget utilized</span>
                          <span>Ends {goal.endDate}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Recommendations Card Panel */}
              <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Award size={18} color="var(--color-teal)" />
                  <span>Personalized reduction tips</span>
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
                  {recommendations.map((rec, idx) => (
                    <div key={idx} style={{ borderLeft: `3px solid ${CATEGORY_COLORS[rec.category] || 'var(--color-teal)'}`, paddingLeft: '14px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: CATEGORY_COLORS[rec.category] || 'var(--color-teal)', textTransform: 'uppercase' }}>
                        {rec.category} Recommendation
                      </span>
                      <p style={{ fontSize: '0.88rem', lineHeight: '1.4', color: 'var(--text-primary)' }}>{rec.tip}</p>
                      <span style={{ fontSize: '0.8rem', color: 'var(--color-teal)', fontWeight: 'medium' }}>{rec.estimatedSavings}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- VIEW: ACTIVITIES --- */}
        {activeTab === 'activities' && (
          <div className="glass-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.2rem' }}>Activity History</h3>
            </div>

            {logs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                No activities logged yet. Click the "Log Activity" button above to register your first entry!
              </div>
            ) : (
              <div className="custom-table-container">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Category</th>
                      <th>Activity Type</th>
                      <th>Quantity</th>
                      <th>Unit</th>
                      <th>Log Date</th>
                      <th>Calculated CO₂e</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log) => (
                      <tr key={log.id}>
                        <td>
                          <span className={`cat-badge ${log.category.toLowerCase()}`}>
                            {log.category}
                          </span>
                        </td>
                        <td style={{ fontWeight: 'medium' }}>
                          {EMISSION_COEFFICIENTS[log.category]?.[log.activityType]?.name || log.activityType.replace('_', ' ')}
                        </td>
                        <td>{log.quantity}</td>
                        <td>{log.unit}</td>
                        <td>{log.logDate}</td>
                        <td style={{ color: 'var(--color-rose)', fontWeight: 'semibold' }}>{log.calculatedCo2e} kg</td>
                        <td>
                          <button
                            onClick={() => handleDeleteLog(log.id)}
                            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', transition: 'var(--transition)' }}
                            onMouseEnter={(e) => e.target.style.color = 'var(--color-rose)'}
                            onMouseLeave={(e) => e.target.style.color = 'var(--text-muted)'}
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* --- VIEW: GOALS --- */}
        {activeTab === 'goals' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            {/* Active Goals Section */}
            <div className="glass-panel">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '1.2rem' }}>Active Carbon Budgets</h3>
                <button className="btn-primary" onClick={() => setIsGoalModalOpen(true)} style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                  <Plus size={16} />
                  <span>Configure Goal</span>
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
                {goals.filter(g => g.status === 'ACTIVE').length === 0 ? (
                  <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '30px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    No active reduction budgets. Keep your footprint in check by creating a new reduction target.
                  </div>
                ) : (
                  goals.filter(g => g.status === 'ACTIVE').map(goal => (
                    <div key={goal.id} style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', justifyContents: 'space-between' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <span style={{ fontSize: '1rem', fontWeight: 'bold', textTransform: 'capitalize' }}>
                          {goal.targetCategory === 'OVERALL' ? 'Overall footprint limit' : `${goal.targetCategory.toLowerCase()} reduction`}
                        </span>
                        <span className="cat-badge" style={{ background: 'rgba(16, 185, 129, 0.08)', color: 'var(--color-green)' }}>
                          -{goal.targetReductionPercentage}% Target
                        </span>
                      </div>

                      <div style={{ display: 'flex', justifyContents: 'space-between', alignItems: 'baseline', marginBottom: '14px' }}>
                        <span style={{ fontSize: '1.8rem', fontWeight: 'bold', color: goal.currentValue > goal.targetValue ? 'var(--color-rose)' : 'var(--text-primary)' }}>
                          {goal.currentValue}
                        </span>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginLeft: '6px' }}>
                          / {goal.targetValue} kg CO₂e budget limit
                        </span>
                      </div>

                      <div className="progress-container" style={{ marginBottom: '14px' }}>
                        <div
                          className={`progress-fill ${goal.currentValue > goal.targetValue ? 'rose' : (goal.progressPercentage >= 80 ? 'blue' : 'green')}`}
                          style={{ width: `${Math.min(100, goal.progressPercentage)}%` }}
                        />
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                        <span>Logged {Math.round(goal.progressPercentage)}% of budget</span>
                        <span>{goal.endDate} deadline</span>
                      </div>

                      <button
                        className="btn-secondary"
                        onClick={() => handleDeleteGoal(goal.id)}
                        style={{ alignSelf: 'flex-start', padding: '6px 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px', borderColor: 'rgba(244, 63, 94, 0.2)', color: 'var(--color-rose)' }}
                      >
                        <Trash2 size={12} />
                        <span>Cancel Goal</span>
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Historical Goals Section */}
            <div className="glass-panel">
              <h3 style={{ fontSize: '1.2rem', marginBottom: '20px' }}>Milestone History</h3>
              {goals.filter(g => g.status !== 'ACTIVE').length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  No historical carbon goals recorded yet. Completed goals will appear here.
                </div>
              ) : (
                <div className="custom-table-container">
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>Category</th>
                        <th>Target Reduction</th>
                        <th>Goal Period</th>
                        <th>Target Limit</th>
                        <th>Actual Footprint</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {goals.filter(g => g.status !== 'ACTIVE').map(goal => (
                        <tr key={goal.id}>
                          <td style={{ fontWeight: 'semibold' }}>{goal.targetCategory}</td>
                          <td>-{goal.targetReductionPercentage}%</td>
                          <td>{goal.startDate} to {goal.endDate}</td>
                          <td>{goal.targetValue} kg</td>
                          <td>{goal.currentValue} kg</td>
                          <td>
                            <span className="cat-badge" style={{
                              background: goal.status === 'COMPLETED' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
                              color: goal.status === 'COMPLETED' ? 'var(--color-green)' : 'var(--color-rose)'
                            }}>
                              {goal.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* --- VIEW: LEADERBOARD --- */}
        {activeTab === 'leaderboard' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="glass-panel">
              <h3 style={{ fontSize: '1.2rem', marginBottom: '16px' }}>Global Eco Leaderboard</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '24px' }}>
                Rankings of platform users based on their emissions footprint this month. Users with lower footprints rank higher!
              </p>

              <div className="custom-table-container">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th style={{ width: '80px' }}>Rank</th>
                      <th>User</th>
                      <th>Organization</th>
                      <th>Month Footprint</th>
                      <th>Badges Earned</th>
                    </tr>
                  </thead>
                  <tbody>
                    {globalLeaderboard.map((row) => (
                      <tr key={row.userId} style={{ background: row.username === user?.username ? 'rgba(16,185,129,0.04)' : 'none' }}>
                        <td style={{ fontWeight: 'bold', fontSize: '1.1rem', color: row.rank === 1 ? 'var(--color-amber)' : (row.rank === 2 ? '#94a3b8' : (row.rank === 3 ? '#b45309' : 'var(--text-muted)')) }}>
                          #{row.rank}
                        </td>
                        <td style={{ fontWeight: 'semibold' }}>
                          {row.username} {row.username === user?.username && <span style={{ fontSize: '0.75rem', color: 'var(--color-green)', marginLeft: '4px' }}>(You)</span>}
                        </td>
                        <td>{row.organizationName}</td>
                        <td style={{ fontWeight: 'semibold', color: 'var(--color-rose)' }}>{row.totalCo2e} kg CO₂e</td>
                        <td>
                          <div style={{ display: 'flex', gap: '4px' }}>
                            {row.badges.map((b, idx) => (
                              <span key={idx} title={b} style={{ fontSize: '1.2rem' }}>
                                {getBadgeEmoji(b)}
                              </span>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {user?.organizationName && (
              <div className="glass-panel">
                <h3 style={{ fontSize: '1.2rem', marginBottom: '16px' }}>{user.organizationName} Scoreboard</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '24px' }}>
                  Workplace standings for members of {user.organizationName}.
                </p>

                <div className="custom-table-container">
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th style={{ width: '80px' }}>Rank</th>
                        <th>User</th>
                        <th>Month Footprint</th>
                        <th>Badges Earned</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orgLeaderboard.map((row) => (
                        <tr key={row.userId} style={{ background: row.username === user?.username ? 'rgba(16,185,129,0.04)' : 'none' }}>
                          <td style={{ fontWeight: 'bold' }}>#{row.rank}</td>
                          <td style={{ fontWeight: 'semibold' }}>
                            {row.username} {row.username === user?.username && <span style={{ fontSize: '0.75rem', color: 'var(--color-green)' }}>(You)</span>}
                          </td>
                          <td style={{ fontWeight: 'semibold', color: 'var(--color-rose)' }}>{row.totalCo2e} kg</td>
                          <td>
                            <div style={{ display: 'flex', gap: '4px' }}>
                              {row.badges.map((b, idx) => (
                                <span key={idx} title={b} style={{ fontSize: '1.2rem' }}>
                                  {getBadgeEmoji(b)}
                                </span>
                              ))}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* --- VIEW: CORPORATE ANALYTICS --- */}
        {activeTab === 'corporate' && orgSummary && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            {/* KPI Corporate row */}
            <div className="metrics-row">
              <div className="metric-card">
                <span className="title">Organization Name</span>
                <span className="value" style={{ fontSize: '1.6rem', padding: '4px 0' }}>{orgSummary.orgName}</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Corporate reporting dashboard</span>
              </div>

              <div className="metric-card">
                <span className="title">Invite Code</span>
                <span className="value" style={{ color: 'var(--color-green)', fontFamily: 'monospace' }}>{orgSummary.inviteCode}</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Share code to onboard employees</span>
              </div>

              <div className="metric-card">
                <span className="title">Active Members</span>
                <span className="value">{orgSummary.memberCount}</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Employees tracking carbon logs</span>
              </div>

              <div className="metric-card">
                <span className="title">Company Total</span>
                <span className="value">{orgSummary.totalCo2e} kg</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>CO₂e aggregate this month</span>
              </div>
            </div>

            <div className="charts-grid">
              <div className="glass-panel" style={{ height: '360px', display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '20px' }}>Company emissions by category</h3>
                <div style={{ flex: 1, minHeight: 0 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={orgSummary.categoryBreakdown} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="category" stroke="var(--text-muted)" fontSize={11} />
                      <YAxis stroke="var(--text-muted)" fontSize={11} />
                      <Tooltip formatter={(value) => `${value} kg CO2e`} />
                      <Bar dataKey="amount" fill="var(--color-teal)" radius={[4, 4, 0, 0]}>
                        {orgSummary.categoryBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.category] || '#ccc'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="glass-panel">
                <h3 style={{ fontSize: '1.1rem', marginBottom: '20px' }}>Employee Footprint Leaderboard</h3>
                <div className="custom-table-container" style={{ maxHeight: '250px', overflowY: 'auto' }}>
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>Rank</th>
                        <th>Employee</th>
                        <th>Month Emissions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orgSummary.employeeFootprints.map((emp) => (
                        <tr key={emp.userId}>
                          <td style={{ fontWeight: 'bold' }}>#{emp.rank}</td>
                          <td>{emp.username}</td>
                          <td style={{ color: 'var(--color-rose)', fontWeight: 'semibold' }}>{emp.totalCo2e} kg</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- VIEW: 3D BADGES GALLERY --- */}
        {activeTab === 'badges' && (
          <div className="fade-in">
            <div style={{ marginBottom: '24px' }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', maxWidth: '800px', lineHeight: '1.6' }}>
                Discover all the achievements you can unlock on CarbonTrack. Complete eco-friendly actions and climb the leaderboard to collect these rare 3D badges! Hover over a badge to see how to earn it.
              </p>
            </div>

            <div className="badges-gallery-grid">
              {[...BADGE_DEFINITIONS].map(badge => {
                const isUnlocked = summary.earnedBadges.includes(badge.name) || 
                  (badge.name === 'Earth Savior' && summary.benchmarking?.userRank === 1) ||
                  (badge.name === 'Climate Guardian' && summary.benchmarking?.userRank === 2) ||
                  (badge.name === 'Eco Warrior' && summary.benchmarking?.userRank === 3);
                return { ...badge, isUnlocked };
              })
              .sort((a, b) => {
                if (a.isUnlocked && !b.isUnlocked) return -1;
                if (!a.isUnlocked && b.isUnlocked) return 1;
                return 0;
              })
              .map(badge => {
                const { isUnlocked } = badge;
                return (
                  <div key={badge.id} className={`badge-3d-scene ${!isUnlocked ? 'badge-locked' : ''}`}>
                    <div className="badge-3d-object">
                      <div className="badge-face badge-front" style={{ '--badge-gradient': badge.gradient, '--badge-glow': badge.glow }}>
                        <div className="badge-icon-wrapper">
                          {badge.icon}
                        </div>
                        <h4 style={{ fontSize: '1.4rem', color: '#fff', margin: '0 0 10px 0', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>{badge.name}</h4>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: '1.4', margin: '0 0 12px 0', padding: '0 10px' }}>
                          {badge.description}
                        </p>
                        {!isUnlocked && (
                          <span style={{ background: 'rgba(255,255,255,0.1)', padding: '4px 12px', borderRadius: '12px', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginTop: 'auto' }}>
                            Locked
                          </span>
                        )}
                        {isUnlocked && (
                          <span style={{ background: 'rgba(0, 230, 200, 0.15)', border: '1px solid rgba(0, 230, 200, 0.3)', padding: '4px 12px', borderRadius: '12px', fontSize: '0.75rem', color: 'var(--color-teal)', textTransform: 'uppercase', letterSpacing: '1px', marginTop: 'auto', fontWeight: 600 }}>
                            Unlocked
                          </span>
                        )}
                      </div>
                      <div className="badge-face badge-back" style={{ '--badge-gradient': badge.gradient }}>
                        <h4 style={{ fontSize: '1.25rem', color: '#fff', marginBottom: '16px' }}>{badge.name}</h4>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6', margin: '0 0 20px 0' }}>
                          {badge.description}
                        </p>
                        <div style={{ fontSize: '3rem', opacity: 0.2 }}>
                          {badge.icon}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* --- VIEW: ECO HUB --- */}
        {activeTab === 'ecohub' && (() => {
          const totalFootprint = summary.totalCo2e || 485.6;
          
          const distVal = parseFloat(travelDistance) || 0;
          const commuteChartData = [
            { mode: 'Petrol Car', co2: Math.round(distVal * 0.18 * 10) / 10, fill: '#ff4b8b' },
            { mode: 'Diesel Car', co2: Math.round(distVal * 0.17 * 10) / 10, fill: '#ffb830' },
            { mode: 'Short Flight', co2: Math.round(distVal * 0.15 * 10) / 10, fill: '#8b5cf6' },
            { mode: 'Electric Car', co2: Math.round(distVal * 0.05 * 10) / 10, fill: '#10b981' },
            { mode: 'Train / Bus', co2: Math.round(distVal * 0.03 * 10) / 10, fill: '#00e6c8' }
          ];

          const petrolCarCo2 = distVal * 0.18;
          const trainCo2 = distVal * 0.03;
          const savings = Math.max(0, petrolCarCo2 - trainCo2);
          const treesEquivalent = savings / 22;

          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
              {/* Top info cards row */}
              <div className="metrics-row" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
                <div className="metric-card">
                  <span className="title">Net-Zero Offset Target</span>
                  <span className="value">{Math.ceil(totalFootprint / 22)} Trees</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>needed to absorb your {totalFootprint} kg footprint per year</span>
                </div>

                <div className="metric-card">
                  <span className="title">Equivalent Bottles Saved</span>
                  <span className="value">{Math.round(totalFootprint / 0.1)} Bottles</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>recycled bottles to avoid this emission volume</span>
                </div>

                <div className="metric-card">
                  <span className="title">Equivalent Landfill Diverted</span>
                  <span className="value">{Math.round(totalFootprint / 30)} Bags</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>recycled bags of waste diverted from landfill</span>
                </div>
              </div>

              {/* Travel & Commute Planner Panel */}
              <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', height: '560px', maxWidth: '960px', width: '100%', margin: '0 auto' }}>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Car size={22} color="var(--color-cyan)" />
                  <span>Green Travel Footprint Planner</span>
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '24px' }}>
                  Simulate planned trip distances and analyze transportation modes side-by-side to find the greenest way to travel.
                </p>

                {/* Distance controls */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px', background: 'rgba(255,255,255,0.02)', padding: '14px 20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.04)' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Distance (Kilometers)</label>
                    <input
                      type="range"
                      min="5"
                      max="2000"
                      step="5"
                      value={travelDistance}
                      onChange={(e) => setTravelDistance(e.target.value)}
                      style={{ width: '100%', accentColor: 'var(--color-cyan)', cursor: 'pointer' }}
                    />
                  </div>
                  <div style={{ width: '110px' }}>
                    <input
                      className="input-field"
                      type="number"
                      min="1"
                      max="10000"
                      value={travelDistance}
                      onChange={(e) => setTravelDistance(e.target.value)}
                      style={{ margin: 0, padding: '8px 10px', textAlign: 'center', fontSize: '1.05rem', fontWeight: 'bold' }}
                    />
                  </div>
                </div>

                {/* Side-by-side Chart */}
                <div style={{ flex: 1, minHeight: 0 }}>
                  <ResponsiveContainer width="100%" height="95%">
                    <BarChart data={commuteChartData} layout="vertical" margin={{ top: 10, right: 30, left: 20, bottom: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" horizontal={false} />
                      <XAxis type="number" stroke="var(--text-muted)" fontSize={11} label={{ value: 'kg CO₂e', position: 'insideBottom', offset: -5, fill: 'var(--text-muted)', fontSize: 10 }} />
                      <YAxis dataKey="mode" type="category" stroke="var(--text-muted)" fontSize={11} width={95} />
                      <Tooltip formatter={(value) => `${value} kg CO₂e`} />
                      <Bar dataKey="co2" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Highlights Box */}
                <div style={{ background: 'rgba(0, 212, 255, 0.04)', border: '1px solid rgba(0, 212, 255, 0.12)', borderRadius: '12px', padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '16px' }}>
                  <span style={{ fontSize: '0.88rem', fontWeight: 'bold', color: 'var(--color-cyan)' }}>Simulated Commute Impact:</span>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: '1.4' }}>
                    Choosing <strong>Train / Bus</strong> instead of driving a <strong>Petrol Car</strong> for this distance avoids <strong>{savings.toFixed(1)} kg CO₂e</strong>.
                    This saves carbon equivalent to growing <strong>{treesEquivalent.toFixed(2)} trees</strong> for a full year!
                  </p>
                </div>
              </div>
            </div>
          );
        })()}
      </div>

      {/* --- MODAL: LOG ACTIVITY --- */}
      {isLogModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 style={{ fontSize: '1.2rem', fontFamily: 'var(--font-display)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Leaf color="var(--color-green)" size={22} />
                <span>Log Environmental Activity</span>
              </h3>
              <button onClick={() => setIsLogModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleLogSubmit}>
              <div className="modal-body">
                <div className="input-group">
                  <label>Category</label>
                  <select
                    className="input-field"
                    value={logCat}
                    onChange={(e) => handleLogCatChange(e.target.value)}
                  >
                    <option value="TRANSPORT">Transport (Travel Commutes)</option>
                    <option value="ELECTRICITY">Electricity (Home Utilities)</option>
                    <option value="FOOD">Food (Dietary Intake)</option>
                    <option value="SHOPPING">Shopping (Product Spend)</option>
                  </select>
                </div>

                <div className="input-group">
                  <label>Activity Type</label>
                  <select
                    className="input-field"
                    value={logType}
                    onChange={(e) => setLogType(e.target.value)}
                  >
                    {Object.entries(EMISSION_COEFFICIENTS[logCat]).map(([key, val]) => (
                      <option key={key} value={key}>{val.name}</option>
                    ))}
                  </select>
                </div>

                <div className="input-group">
                  <label>Quantity ({EMISSION_COEFFICIENTS[logCat][logType].unit})</label>
                  <input
                    className="input-field"
                    type="number"
                    step="0.001"
                    placeholder={`e.g. amount in ${EMISSION_COEFFICIENTS[logCat][logType].unit.toLowerCase()}`}
                    value={logQty}
                    onChange={(e) => setLogQty(e.target.value)}
                    required
                  />
                </div>

                <div className="input-group">
                  <label>Log Date</label>
                  <input
                    className="input-field"
                    type="date"
                    value={logDate}
                    onChange={(e) => setLogDate(e.target.value)}
                    required
                  />
                </div>

                {/* Dynamic Real-Time Preview Card */}
                <div className="live-calc-card">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Zap size={18} color="var(--color-green)" />
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Live Estimated Impact:</span>
                  </div>
                  <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--color-green)' }}>
                    {liveEstimatedCo2.toFixed(2)} kg CO₂e
                  </span>
                </div>

                {logSuccessMsg && (
                  <div style={{ color: 'var(--color-green)', fontSize: '0.88rem', marginTop: '16px', textAlign: 'center', fontWeight: 'medium' }}>
                    {logSuccessMsg}
                  </div>
                )}
                {logErrorMsg && (
                  <div style={{ color: 'var(--color-rose)', fontSize: '0.88rem', marginTop: '16px', textAlign: 'center', fontWeight: 'medium' }}>
                    {logErrorMsg}
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button className="btn-secondary" type="button" onClick={() => setIsLogModalOpen(false)}>Cancel</button>
                <button className="btn-primary" type="submit">Submit Entry</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL: CREATE GOAL --- */}
      {isGoalModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 style={{ fontSize: '1.2rem', fontFamily: 'var(--font-display)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Trophy color="var(--color-amber)" size={22} />
                <span>Configure Reduction Goal</span>
              </h3>
              <button onClick={() => setIsGoalModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleGoalSubmit}>
              <div className="modal-body">
                <div className="input-group">
                  <label>Target Category</label>
                  <select
                    className="input-field"
                    value={goalCat}
                    onChange={(e) => setGoalCat(e.target.value)}
                  >
                    <option value="OVERALL">Overall Footprint (Total CO₂e)</option>
                    <option value="TRANSPORT">Transport Category</option>
                    <option value="ELECTRICITY">Electricity Category</option>
                    <option value="FOOD">Food Category</option>
                    <option value="SHOPPING">Shopping Category</option>
                  </select>
                </div>

                <div className="input-group">
                  <label>Target Reduction Percentage (%)</label>
                  <input
                    className="input-field"
                    type="number"
                    min="1"
                    max="100"
                    placeholder="e.g. 15 for 15% reduction"
                    value={goalReduction}
                    onChange={(e) => setGoalReduction(e.target.value)}
                    required
                  />
                </div>

                <div className="input-group">
                  <label>Start Date</label>
                  <input
                    className="input-field"
                    type="date"
                    value={goalStart}
                    onChange={(e) => setGoalStart(e.target.value)}
                    required
                  />
                </div>

                <div className="input-group">
                  <label>End Date (Deadline)</label>
                  <input
                    className="input-field"
                    type="date"
                    value={goalEnd}
                    onChange={(e) => setGoalEnd(e.target.value)}
                    required
                  />
                </div>

                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: '1.4', background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)' }}>
                  [!NOTE] CarbonTrack evaluates your average footprint during the matching previous duration length to establish a baseline budget limit. You will succeed if your actual emissions stay below this limit at the deadline!
                </p>

                {goalSuccessMsg && (
                  <div style={{ color: 'var(--color-green)', fontSize: '0.88rem', marginTop: '16px', textAlign: 'center', fontWeight: 'medium' }}>
                    {goalSuccessMsg}
                  </div>
                )}
                {goalErrorMsg && (
                  <div style={{ color: 'var(--color-rose)', fontSize: '0.88rem', marginTop: '16px', textAlign: 'center', fontWeight: 'medium' }}>
                    {goalErrorMsg}
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button className="btn-secondary" type="button" onClick={() => setIsGoalModalOpen(false)}>Cancel</button>
                <button className="btn-primary" type="submit">Establish Target</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL: USER PROFILE --- */}
      {isProfileModalOpen && (
        <div className="modal-overlay" onClick={(e) => {
          if (e.target.className === 'modal-overlay') setIsProfileModalOpen(false);
        }} style={{ backdropFilter: 'blur(8px)' }}>
          <div className="modal-content" style={{ maxWidth: '400px', textAlign: 'center', padding: '40px 30px' }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '-20px', marginRight: '-10px' }}>
              <button onClick={() => setIsProfileModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--grad-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, textTransform: 'uppercase', fontSize: '2.5rem', boxShadow: '0 0 20px rgba(139,92,246,0.6)', margin: '0 auto 20px auto' }}>
              {user?.username?.charAt(0) || 'U'}
            </div>
            
            <h2 style={{ margin: '0 0 5px 0', fontSize: '1.6rem', color: 'var(--text-primary)' }}>{user?.username || 'User'}</h2>
            <p style={{ margin: '0 0 20px 0', color: 'var(--text-muted)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>{user?.role || 'Member'}</p>
            
            {summary.benchmarking && summary.benchmarking.userRank && (
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '30px' }}>
                <div style={{ background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(217, 119, 6, 0.05))', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '8px 20px', borderRadius: '30px', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 15px rgba(245, 158, 11, 0.1)' }}>
                  <Award size={18} color="var(--color-amber)" />
                  <span style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--color-amber)' }}>
                    Rank #{summary.benchmarking.userRank}
                  </span>
                </div>
              </div>
            )}
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '25px' }}>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '15px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '5px' }}>Total Emissions</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--color-cyan)' }}>{summary.totalCo2e} <span style={{fontSize: '0.8rem', fontWeight: 400}}>kg</span></div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '15px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '5px' }}>Active Streak</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--color-amber)' }}>{summary.currentStreak || 0} <span style={{fontSize: '0.8rem', fontWeight: 400}}>Days</span> 🔥</div>
              </div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'left' }}>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Earned Badges</span>
                <span style={{ background: 'rgba(139,92,246,0.2)', color: 'var(--color-purple)', padding: '2px 8px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 600 }}>{summary.earnedBadges.length} Total</span>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {summary.earnedBadges.length === 0 ? (
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', padding: '10px 0' }}>No badges earned yet. Keep logging!</div>
                ) : (
                  summary.earnedBadges.map((badge, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(0,0,0,0.2)', padding: '10px 15px', borderRadius: '8px' }}>
                      <span style={{ fontSize: '1.5rem' }}>
                        {getBadgeEmoji(badge)}
                      </span>
                      <span style={{ fontSize: '0.95rem', fontWeight: 500, color: 'var(--text-primary)' }}>{badge}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div style={{ marginTop: '25px', display: 'flex', justifyContent: 'center' }}>
              <button 
                onClick={() => setIsLightMode(!isLightMode)} 
                style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-card-active)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontWeight: 600, fontSize: '1rem', transition: 'var(--transition)', boxShadow: 'var(--shadow-sm)' }}
              >
                {isLightMode ? <Moon size={20} color="var(--color-violet)" /> : <Sun size={20} color="var(--color-amber)" />}
                {isLightMode ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
