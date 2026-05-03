import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { 
  Flame, CheckCircle, Trophy, Clock, Target, CalendarDays, 
  Code, Globe, Music, Terminal, Sun, Moon, Zap, AlertTriangle 
} from 'lucide-react';

const XP_PER_LEVEL = 1000;

export default function CurzyVitality() {
  const [activities, setActivities] = useState([]);
  const [burnoutWarning, setBurnoutWarning] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchActivityData = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await fetch(`http://127.0.0.1:3005/api/activity?date=${today}`);
      if (!response.ok) throw new Error('Daemon Offline or Error');
      const result = await response.json();
      if (result.success) {
        setActivities(result.data);
        setBurnoutWarning(result.burnout_warning || false);
      } else {
        throw new Error('Failed to parse activity data');
      }
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Sentinel Daemon is offline. Waiting for connection...');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivityData();
    const interval = setInterval(fetchActivityData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Calculate XP & Level
  const totalDurationToday = activities.reduce((acc, curr) => acc + curr.duration, 0);
  const totalXP = totalDurationToday * 5;
  const currentLevel = Math.floor(totalXP / XP_PER_LEVEL) + 1;
  const currentLevelXP = totalXP % XP_PER_LEVEL;
  const progressPercent = Math.min((currentLevelXP / XP_PER_LEVEL) * 100, 100);

  // Group top apps
  const appUsage = activities.reduce((acc, curr) => {
    if (!acc[curr.process_name]) {
      acc[curr.process_name] = { category: curr.category, duration: 0 };
    }
    acc[curr.process_name].duration += curr.duration;
    return acc;
  }, {});

  const topApps = Object.entries(appUsage)
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.duration - a.duration)
    .slice(0, 4);

  // Achievement Logic
  const achievements = [
    { 
      id: 'early-bird', 
      name: 'Early Bird', 
      icon: <Sun size={18} />, 
      unlocked: activities.some(a => {
        const hour = new Date(a.timestamp).getHours();
        return hour >= 0 && hour < 7;
      })
    },
    { 
      id: 'night-owl', 
      name: 'Night Owl', 
      icon: <Moon size={18} />, 
      unlocked: activities.some(a => new Date(a.timestamp).getHours() >= 23)
    },
    { 
      id: 'deep-focus', 
      name: 'Deep Focus', 
      icon: <Zap size={18} />, 
      unlocked: activities.some(a => a.category === 'development' && a.duration >= 7200)
    }
  ];

  const formatTime = (seconds) => {
    if (seconds < 60) return `${seconds}s`;
    const m = Math.floor(seconds / 60);
    const h = Math.floor(m / 60);
    if (h > 0) return `${h}h ${m % 60}m`;
    return `${m}m`;
  };

  const timelineData = Array.from({ length: 24 }).map((_, i) => ({
    time: `${i}:00`,
    Development: Math.floor(Math.random() * 40) + 10,
    Entertainment: Math.floor(Math.random() * 20),
    Utility: Math.floor(Math.random() * 15),
  }));

  const quests = [
    { id: 1, title: 'Deep Work Session', xp: 250, completed: true },
    { id: 2, title: 'Review PRs', xp: 150, completed: false },
    { id: 3, title: 'Learn new tech', xp: 200, completed: false },
  ];

  const heatmapDays = Array.from({ length: 30 }).map(() => Math.floor(Math.random() * 4));

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto min-h-screen font-sans relative">
      
      {/* Burnout Guard Notification */}
      <AnimatePresence>
        {burnoutWarning && (
          <motion.div 
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-md"
          >
            <div className="mx-4 p-4 bg-red-500/20 border border-red-500/50 backdrop-blur-xl rounded-xl flex items-center gap-4 shadow-2xl shadow-red-500/20">
              <div className="bg-red-500 p-2 rounded-lg text-white">
                <AlertTriangle size={24} />
              </div>
              <div>
                <h4 className="font-bold text-white">Burnout Warning!</h4>
                <p className="text-sm text-red-200">You've been working for over 3 hours. Take a 15-minute break.</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-brand-neon to-emerald-400">
            Curzy Vitality
          </h1>
          <p className="text-gray-400 mt-1 flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${error ? 'bg-red-500' : 'bg-brand-neon animate-pulse'}`}></span>
            {error ? error : 'Sentinel Active - Monitoring System'}
          </p>
        </div>

        <div className="flex gap-4 items-center">
          <div className="glass-panel px-4 py-2 flex items-center gap-2 text-orange-400 font-semibold shadow-lg">
            <Flame size={20} className="fill-orange-400" />
            14 Day Streak
          </div>
          <div className="glass-panel px-6 py-3 min-w-[280px]">
            <div className="flex justify-between items-end mb-2">
              <div>
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Level {currentLevel}</p>
                <p className="font-bold text-white leading-none">Junior Engineer</p>
              </div>
              <p className="text-brand-neon font-mono text-sm">{currentLevelXP} / {XP_PER_LEVEL} XP</p>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2.5 overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="bg-brand-neon h-2.5 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.8)]"
              ></motion.div>
            </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel p-6">
            <div className="flex items-center gap-2 mb-6">
              <Clock className="text-brand-neon" size={20} />
              <h2 className="text-lg font-semibold">24-Hour Activity Timeline</h2>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timelineData}>
                  <defs>
                    <linearGradient id="colorDev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.5}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="time" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Area type="monotone" dataKey="Development" stroke="#10b981" fillOpacity={1} fill="url(#colorDev)" />
                  <Area type="monotone" dataKey="Entertainment" stroke="#8b5cf6" fillOpacity={0.2} fill="#8b5cf6" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass-panel p-6">
            <div className="flex items-center gap-2 mb-6">
              <Trophy className="text-brand-neon" size={20} />
              <h2 className="text-lg font-semibold">Top Apps Today</h2>
            </div>
            {topApps.length === 0 && !loading && (
              <p className="text-gray-400 italic">No activity recorded yet today.</p>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {topApps.map((app, idx) => (
                <div key={idx} className="glass-panel glass-panel-hover p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/5 rounded-lg text-gray-300">
                      {app.category === 'development' ? <Code size={20} /> :
                       app.category === 'entertainment' ? <Globe size={20} /> :
                       <Terminal size={20} />}
                    </div>
                    <div>
                      <p className="font-semibold text-white capitalize">{app.name}</p>
                      <span className="text-xs px-2 py-0.5 rounded bg-white/10 text-gray-300 uppercase tracking-wider">
                        {app.category}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-brand-neon font-bold">{formatTime(app.duration)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Achievements Badges Section */}
          <div className="glass-panel p-6">
            <div className="flex items-center gap-2 mb-6">
              <Trophy className="text-brand-neon" size={20} />
              <h2 className="text-lg font-semibold">Achievements</h2>
            </div>
            <div className="flex flex-wrap gap-3">
              {achievements.map(achievement => (
                <motion.div
                  key={achievement.id}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className={`p-3 rounded-xl flex items-center gap-2 cursor-default transition-colors ${
                    achievement.unlocked 
                      ? 'bg-brand-neon/20 text-brand-neon border border-brand-neon/50' 
                      : 'bg-white/5 text-gray-600 border border-white/5 grayscale'
                  }`}
                  title={achievement.unlocked ? `${achievement.name} Unlocked` : `${achievement.name} Locked`}
                >
                  {achievement.icon}
                  <span className="text-xs font-bold uppercase tracking-tighter">{achievement.name}</span>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="glass-panel p-6">
            <div className="flex items-center gap-2 mb-6">
              <Target className="text-brand-neon" size={20} />
              <h2 className="text-lg font-semibold">Daily Quests</h2>
            </div>
            <div className="space-y-3">
              {quests.map(quest => (
                <div key={quest.id} className={`flex items-center justify-between p-3 rounded-lg border ${quest.completed ? 'bg-brand-neon/10 border-brand-neon/30' : 'bg-white/5 border-white/5'}`}>
                  <div className="flex items-center gap-3">
                    <CheckCircle size={20} className={quest.completed ? "text-brand-neon" : "text-gray-500"} />
                    <span className={quest.completed ? "text-white line-through opacity-70" : "text-gray-200"}>
                      {quest.title}
                    </span>
                  </div>
                  <span className="text-xs font-mono text-brand-neon bg-brand-neon/10 px-2 py-1 rounded">
                    +{quest.xp} XP
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-panel p-6">
            <div className="flex items-center gap-2 mb-6">
              <CalendarDays className="text-brand-neon" size={20} />
              <h2 className="text-lg font-semibold">Productivity Density</h2>
            </div>
            <div className="grid grid-cols-7 gap-2">
              {heatmapDays.map((level, i) => (
                <div 
                  key={i} 
                  className={`aspect-square rounded-sm ${
                    level === 0 ? 'bg-white/5' : 
                    level === 1 ? 'bg-brand-neon/30' : 
                    level === 2 ? 'bg-brand-neon/60' : 
                    'bg-brand-neon shadow-[0_0_8px_rgba(16,185,129,0.5)]'
                  }`}
                  title={`Activity Level ${level}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
