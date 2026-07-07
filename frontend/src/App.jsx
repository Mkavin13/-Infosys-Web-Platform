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
  Bar
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
  Car
} from 'lucide-react';

const API_BASE = 'http://localhost:8081/api';

// ─── Google OAuth2 Configuration ──────────────────────────────────────────────
// Replace with your actual Client ID from https://console.cloud.google.com/
// Authorized JavaScript origins: http://localhost:5173
const GOOGLE_CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com';

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

  // Dashboard / Analytics State
  const [summary, setSummary] = useState({
    totalCo2e: 0,
    categoryBreakdown: [],
    momComparison: { userValue: 0, comparisonValue: 0, percentageDifference: 0 },
    peerComparison: { userValue: 0, comparisonValue: 0, percentageDifference: 0 },
    earnedBadges: []
  });
  const [weeklyTrend, setWeeklyTrend] = useState([]);
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

  const loadData = async () => {
    try {
      if (activeTab === 'dashboard') {
        const summaryData = await apiCall('/analytics/summary');
        setSummary(summaryData);
        const trendData = await apiCall('/analytics/weekly-trend');
        setWeeklyTrend(trendData);
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
    // Generate weekly trend dates
    const trendList = [];
    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayName = weekdays[date.getDay()] + ', ' + date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      trendList.push({
        date: dayName,
        amount: Math.round((25 + Math.random() * 35) * 10) / 10
      });
    }

    setWeeklyTrend(trendList);

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
      earnedBadges: ['Eco Pioneer', 'Green Commuter', 'Plant Power']
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

          {(user?.role === 'ORG_ADMIN' || user?.role === 'ADMIN') && (
            <div className={`nav-item ${activeTab === 'corporate' ? 'active' : ''}`} onClick={() => setActiveTab('corporate')}>
              <Briefcase size={18} />
              <span>Corporate Analytics</span>
            </div>
          )}
        </div>

        <div style={{ marginTop: 'auto', borderTop: '1px solid rgba(139, 92, 246, 0.12)', paddingTop: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
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
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '4px' }}>
              {activeTab === 'dashboard' && 'Summary of environmental impacts and green achievements'}
              {activeTab === 'activities' && 'Track and edit your daily carbon emission logs'}
              {activeTab === 'goals' && 'Configure and monitor personal carbon budget limits'}
              {activeTab === 'leaderboard' && 'Rankings of users actively saving emissions'}
              {activeTab === 'corporate' && 'Corporate aggregated carbon metrics and office leaderboards'}
            </p>
          </div>

          {activeTab !== 'corporate' && (
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
                <span className="title">Month change</span>
                <span className="value" style={{ color: summary.momComparison.percentageDifference <= 0 ? 'var(--color-green)' : 'var(--color-rose)' }}>
                  {summary.momComparison.percentageDifference <= 0 ? '' : '+'}{summary.momComparison.percentageDifference}%
                </span>
                <span className="change negative" style={{ color: summary.momComparison.percentageDifference <= 0 ? 'var(--color-green)' : 'var(--color-rose)' }}>
                  {summary.momComparison.percentageDifference <= 0 ? 'Decreased' : 'Increased'} vs last month
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
                      {b === 'Eco Pioneer' && '🍃'}
                      {b === 'Green Commuter' && '🚲'}
                      {b === 'Plant Power' && '🍎'}
                      {b === 'Goal Crusher' && '🏆'}
                      {b === 'Carbon Champion' && '🏅'}
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

              <div className="glass-panel" style={{ height: '380px', display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <TrendingDown size={18} color="var(--color-cyan)" />
                  <span>Weekly trend (kg CO₂e)</span>
                </h3>
                <div style={{ flex: 1, minHeight: 0 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={weeklyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorCo2" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--color-cyan)" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="var(--color-cyan)" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={11} />
                      <YAxis stroke="var(--text-muted)" fontSize={11} />
                      <Tooltip />
                      <Area type="monotone" dataKey="amount" stroke="var(--color-cyan)" strokeWidth={2} fillOpacity={1} fill="url(#colorCo2)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

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
                              <span key={idx} title={b} style={{ fontSize: '1rem' }}>
                                {b === 'Eco Pioneer' && '🍃'}
                                {b === 'Green Commuter' && '🚲'}
                                {b === 'Plant Power' && '🍎'}
                                {b === 'Goal Crusher' && '🏆'}
                                {b === 'Carbon Champion' && '🏅'}
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
                                <span key={idx} title={b} style={{ fontSize: '1rem' }}>
                                  {b === 'Eco Pioneer' && '🍃'}
                                  {b === 'Green Commuter' && '🚲'}
                                  {b === 'Plant Power' && '🍎'}
                                  {b === 'Goal Crusher' && '🏆'}
                                  {b === 'Carbon Champion' && '🏅'}
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
    </div>
  );
}
