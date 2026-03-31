import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const WEATHER_ICONS = {
  '01d': '☀️', '01n': '🌙',
  '02d': '⛅', '02n': '⛅',
  '03d': '☁️', '03n': '☁️',
  '04d': '☁️', '04n': '☁️',
  '09d': '🌧️', '09n': '🌧️',
  '10d': '🌦️', '10n': '🌧️',
  '11d': '⛈️', '11n': '⛈️',
  '13d': '❄️', '13n': '❄️',
  '50d': '🌫️', '50n': '🌫️',
};

const WeatherBox = () => {
  const { user } = useAuth();
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const { data } = await api.get(`/weather?city=${user?.city || 'Hyderabad'}`);
        setWeather(data);
      } catch (e) {
        setWeather({ city: user?.city || 'Hyderabad', temperature: 32, description: 'Sunny', icon: '01d', humidity: 60, wind_speed: 8 });
      } finally {
        setLoading(false);
      }
    };
    fetchWeather();
    const interval = setInterval(fetchWeather, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, [user?.city]);

  if (loading) return (
    <div className="bg-slate-800/80 border border-slate-700 rounded-2xl px-4 py-3 flex items-center gap-2 animate-pulse">
      <div className="w-8 h-8 bg-slate-600 rounded-full" />
      <div className="space-y-1"><div className="w-16 h-3 bg-slate-600 rounded" /><div className="w-10 h-3 bg-slate-600 rounded" /></div>
    </div>
  );

  const icon = WEATHER_ICONS[weather?.icon] || '🌤️';

  return (
    <div className="bg-gradient-to-br from-blue-900/60 to-slate-800/80 border border-blue-700/40 rounded-2xl px-4 py-3 flex items-center gap-3 shadow-lg backdrop-blur-sm min-w-[160px]">
      <span className="text-3xl leading-none">{icon}</span>
      <div>
        <div className="flex items-baseline gap-1">
          <span className="text-white font-bold text-xl leading-none">{weather?.temperature}°</span>
          <span className="text-slate-400 text-xs">C</span>
        </div>
        <div className="text-slate-300 text-xs font-medium truncate max-w-[90px]">{weather?.city}</div>
        <div className="text-slate-400 text-[10px] capitalize">{weather?.description}</div>
      </div>
      <div className="text-right text-[10px] text-slate-500 leading-4">
        <div>💧 {weather?.humidity}%</div>
        <div>💨 {weather?.wind_speed}m/s</div>
      </div>
    </div>
  );
};

export default WeatherBox;
