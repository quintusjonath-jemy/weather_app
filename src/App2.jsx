// WeatherApp.jsx
import React, { useState, useEffect } from 'react';
import {
    Cloud, CloudRain, CloudSnow, Sun, Moon, Wind, Droplets,
    Eye, Gauge, Sunrise, Sunset, MapPin, Search, Navigation,
    CloudDrizzle, CloudFog, Zap, Star, Heart, AlertTriangle,
    Volume2, VolumeX, Settings
} from 'lucide-react';

const API_KEY = "109201f7c2a355f8340d51a1e6046ff8";
const BASE_URL = "https://api.openweathermap.org/data/2.5";
const GEO_URL = "https://api.openweathermap.org/geo/1.0";

// API Functions
const getCurrentWeather = async (city) => {
    const response = await fetch(`${BASE_URL}/weather?q=${city}&appid=${API_KEY}&units=metric`);
    if (!response.ok) throw new Error(response.status === 404 ? 'City not found' : 'Weather service unavailable');
    const data = await response.json();
    if (!data.dt) data.dt = Math.floor(Date.now() / 1000);
    return data;
};

const getCurrentWeatherByCoords = async (lat, lon) => {
    const response = await fetch(`${BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);
    if (!response.ok) throw new Error('Weather service unavailable');
    const data = await response.json();
    if (!data.dt) data.dt = Math.floor(Date.now() / 1000);
    return data;
};

const getWeatherForecast = async (city) => {
    const response = await fetch(`${BASE_URL}/forecast?q=${city}&appid=${API_KEY}&units=metric`);
    if (!response.ok) throw new Error('Forecast unavailable');
    return await response.json();
};

const getWeatherForecastByCoords = async (lat, lon) => {
    const response = await fetch(`${BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);
    if (!response.ok) throw new Error('Forecast unavailable');
    return await response.json();
};

const searchCities = async (query) => {
    const response = await fetch(`${GEO_URL}/direct?q=${query}&limit=5&appid=${API_KEY}`);
    if (!response.ok) throw new Error('Search unavailable');
    const data = await response.json();
    return data.map((city) => ({
        name: city.name,
        lat: city.lat,
        lon: city.lon,
        country: city.country,
        state: city.state || "",
    }));
};

const WeatherApp = () => {
    const [weather, setWeather] = useState(null);
    const [forecast, setForecast] = useState(null);
    const [hourly, setHourly] = useState([]);
    const [city, setCity] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [favorites, setFavorites] = useState([]);
    const [units, setUnits] = useState('metric');
    const [showSettings, setShowSettings] = useState(false);
    const [soundEnabled, setSoundEnabled] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());

    const getWeatherMode = (condition, isNight) => {
        if (isNight) return 'night';
        const lower = condition.toLowerCase();
        if (lower.includes('thunder') || lower.includes('storm')) return 'storm';
        if (lower.includes('rain') || lower.includes('drizzle')) return 'rainy';
        if (lower.includes('snow') || lower.includes('sleet')) return 'snow';
        if (lower.includes('fog') || lower.includes('mist') || lower.includes('haze')) return 'fog';
        if (lower.includes('cloud')) return 'cloudy';
        return 'bright';
    };

    const modeThemes = {
        bright: {
            bg: 'from-amber-400 via-orange-300 to-yellow-200',
            cardBg: 'bg-white/25 backdrop-blur-xl',
            text: 'text-gray-900',
            subtext: 'text-gray-700',
            accent: 'text-orange-600',
            glow: 'shadow-2xl shadow-orange-300/50',
            heroGlow: 'drop-shadow-2xl',
            border: 'border-white/30',
            pulseGradient: 'from-orange-500 via-yellow-500 to-amber-500'
        },
        cloudy: {
            bg: 'from-slate-400 via-gray-400 to-blue-300',
            cardBg: 'bg-white/20 backdrop-blur-xl',
            text: 'text-gray-900',
            subtext: 'text-gray-700',
            accent: 'text-slate-700',
            glow: 'shadow-2xl shadow-slate-400/40',
            heroGlow: 'drop-shadow-xl',
            border: 'border-white/25',
            pulseGradient: 'from-slate-600 via-gray-500 to-blue-500'
        },
        rainy: {
            bg: 'from-slate-700 via-blue-600 to-slate-500',
            cardBg: 'bg-white/10 backdrop-blur-2xl',
            text: 'text-white',
            subtext: 'text-blue-100',
            accent: 'text-cyan-300',
            glow: 'shadow-2xl shadow-blue-500/40',
            heroGlow: 'drop-shadow-2xl',
            border: 'border-white/20',
            pulseGradient: 'from-blue-400 via-cyan-400 to-blue-500'
        },
        storm: {
            bg: 'from-slate-950 via-purple-950 to-indigo-950',
            cardBg: 'bg-white/5 backdrop-blur-3xl',
            text: 'text-white',
            subtext: 'text-purple-200',
            accent: 'text-purple-400',
            glow: 'shadow-2xl shadow-purple-600/50',
            heroGlow: 'drop-shadow-[0_0_30px_rgba(168,85,247,0.8)]',
            border: 'border-purple-500/30',
            pulseGradient: 'from-purple-500 via-pink-500 to-violet-600'
        },
        snow: {
            bg: 'from-blue-200 via-cyan-100 to-slate-100',
            cardBg: 'bg-white/35 backdrop-blur-xl',
            text: 'text-slate-800',
            subtext: 'text-slate-600',
            accent: 'text-blue-600',
            glow: 'shadow-2xl shadow-blue-300/50',
            heroGlow: 'drop-shadow-xl',
            border: 'border-white/40',
            pulseGradient: 'from-blue-400 via-cyan-300 to-sky-400'
        },
        fog: {
            bg: 'from-gray-500 via-slate-400 to-gray-300',
            cardBg: 'bg-white/15 backdrop-blur-2xl',
            text: 'text-gray-900',
            subtext: 'text-gray-700',
            accent: 'text-gray-600',
            glow: 'shadow-2xl shadow-gray-500/40',
            heroGlow: 'drop-shadow-lg',
            border: 'border-white/20',
            pulseGradient: 'from-gray-500 via-slate-400 to-gray-600'
        },
        night: {
            bg: 'from-slate-950 via-indigo-950 to-blue-950',
            cardBg: 'bg-white/5 backdrop-blur-3xl',
            text: 'text-white',
            subtext: 'text-blue-200',
            accent: 'text-blue-400',
            glow: 'shadow-2xl shadow-blue-600/40',
            heroGlow: 'drop-shadow-[0_0_20px_rgba(59,130,246,0.6)]',
            border: 'border-blue-500/20',
            pulseGradient: 'from-blue-500 via-indigo-500 to-purple-500'
        }
    };

    useEffect(() => {
        const saved = JSON.parse(localStorage.getItem('weatherPrefs') || '{}');
        setUnits(saved.units || 'metric');
        setSoundEnabled(saved.sound || false);
        setFavorites(saved.favorites || []);
        fetchWeather(saved.lastCity || 'London');
    }, []);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const savePrefs = (prefs) => {
        const current = JSON.parse(localStorage.getItem('weatherPrefs') || '{}');
        localStorage.setItem('weatherPrefs', JSON.stringify({ ...current, ...prefs }));
    };

    const fetchWeatherByLocation = async () => {
        try {
            setLoading(true);
            const pos = await new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
            });

            const weatherData = await getCurrentWeatherByCoords(pos.coords.latitude, pos.coords.longitude);
            const forecastData = await getWeatherForecastByCoords(pos.coords.latitude, pos.coords.longitude);
            processWeatherData(weatherData, forecastData);
        } catch (err) {
            console.error('Location error:', err);
            setError('Could not get your location');
            setLoading(false);
        }
    };

    const fetchWeather = async (cityName) => {
        try {
            setLoading(true);
            setError('');

            const weatherData = await getCurrentWeather(cityName);
            const forecastData = await getWeatherForecast(cityName);

            processWeatherData(weatherData, forecastData);
            savePrefs({ lastCity: cityName });
        } catch (err) {
            console.error('Weather error:', err);
            setError(err.message);
            setLoading(false);
        }
    };

    const processWeatherData = (weatherData, forecastData) => {
        const daily = forecastData.list.filter((item, i) => i % 8 === 0).slice(0, 7).map(item => ({
            dt: item.dt,
            temp: { max: item.main.temp_max, min: item.main.temp_min },
            weather: item.weather,
            pop: item.pop || 0
        }));

        const hourlyData = forecastData.list.slice(0, 8).map(item => ({
            dt: item.dt,
            temp: item.main.temp,
            weather: item.weather,
            pop: item.pop || 0
        }));

        setWeather(weatherData);
        setForecast({ list: daily });
        setHourly(hourlyData);
        setCity(weatherData.name);
        setLoading(false);
    };

    const handleSearchInput = async (value) => {
        setSearchInput(value);
        if (value.length > 2) {
            try {
                const cities = await searchCities(value);
                setSuggestions(cities);
                setShowSuggestions(true);
            } catch (err) {
                console.error(err);
            }
        } else {
            setSuggestions([]);
            setShowSuggestions(false);
        }
    };

    const handleCitySelect = (cityData) => {
        setSearchInput('');
        setSuggestions([]);
        setShowSuggestions(false);
        fetchWeather(cityData.name);
    };

    const toggleFavorite = () => {
        const newFavs = favorites.includes(city)
        ? favorites.filter(f => f !== city)
        : [...favorites, city];
        setFavorites(newFavs);
        savePrefs({ favorites: newFavs });
    };

    const convertTemp = (temp) => {
        if (units === 'imperial') {
            return Math.round((temp * 9/5) + 32);
        }
        return Math.round(temp);
    };

    const toggleUnits = () => {
        const newUnits = units === 'metric' ? 'imperial' : 'metric';
        setUnits(newUnits);
        savePrefs({ units: newUnits });
    };

    const toggleSound = () => {
        const newSound = !soundEnabled;
        setSoundEnabled(newSound);
        savePrefs({ sound: newSound });
    };

    if (loading || !weather || !forecast) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 flex items-center justify-center">
            <div className="text-center">
            <div className="w-20 h-20 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
            <div className="text-white text-2xl font-light">Loading weather...</div>
            </div>
            </div>
        );
    }

    const isNight = weather.dt < weather.sys.sunrise || weather.dt > weather.sys.sunset;
    const mode = getWeatherMode(weather.weather[0].main, isNight);
    const theme = modeThemes[mode];
    const isSevere = mode === 'storm' || (mode === 'rainy' && weather.wind.speed > 10);

    const WeatherIcon = ({ size = 'w-20 h-20' }) => {
        const icons = {
            storm: <Zap className={size} />,
            rainy: <CloudRain className={size} />,
            snow: <CloudSnow className={size} />,
            night: <Moon className={size} />,
            cloudy: <Cloud className={size} />,
            fog: <CloudFog className={size} />,
            bright: <Sun className={size} />
        };
        return icons[mode] || <Sun className={size} />;
    };

    const AnimatedBackground = () => {
        if (mode === 'rainy' || mode === 'storm') {
            return (
                <>
                {/* Animated clouds */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute w-96 h-96 bg-black/30 rounded-full blur-3xl animate-cloud1" style={{ top: '10%', left: '-10%' }}></div>
                <div className="absolute w-80 h-80 bg-black/20 rounded-full blur-3xl animate-cloud2" style={{ top: '30%', right: '-5%' }}></div>
                <div className="absolute w-72 h-72 bg-black/25 rounded-full blur-3xl animate-cloud3" style={{ top: '50%', left: '20%' }}></div>
                </div>

                {/* Heavy rain */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {Array.from({ length: mode === 'storm' ? 150 : 80 }).map((_, i) => (
                    <div
                    key={i}
                    className="absolute bg-white/30"
                    style={{
                        left: `${Math.random() * 100}%`,
                                                                                    top: `-${Math.random() * 20}%`,
                                                                                    width: '2px',
                                                                                    height: `${Math.random() * 50 + 40}px`,
                                                                                    animation: `rain ${Math.random() * 0.5 + 0.2}s linear infinite`,
                                                                                    animationDelay: `${Math.random() * 2}s`,
                                                                                    transform: 'rotate(15deg)'
                    }}
                    />
                ))}
                </div>

                {/* Lightning flashes for storm */}
                {mode === 'storm' && (
                    <>
                    <div className="absolute inset-0 bg-white/5 animate-lightning1"></div>
                    <div className="absolute inset-0 bg-purple-300/10 animate-lightning2"></div>
                    <div className="absolute inset-0 bg-blue-300/10 animate-lightning3"></div>

                    {/* Lightning bolts */}
                    <div className="absolute top-0 left-1/4 w-1 h-96 bg-gradient-to-b from-white via-blue-200 to-transparent opacity-0 animate-bolt1"></div>
                    <div className="absolute top-0 right-1/3 w-1 h-80 bg-gradient-to-b from-white via-purple-200 to-transparent opacity-0 animate-bolt2"></div>
                    </>
                )}

                {/* Rain ripples */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {Array.from({ length: 20 }).map((_, i) => (
                    <div
                    key={i}
                    className="absolute border-2 border-white/10 rounded-full animate-ripple"
                    style={{
                        left: `${Math.random() * 100}%`,
                                                           bottom: '0',
                                                           animationDelay: `${Math.random() * 3}s`,
                                                           animationDuration: `${Math.random() * 2 + 2}s`
                    }}
                    />
                ))}
                </div>
                </>
            );
        }

        if (mode === 'snow') {
            return (
                <>
                {/* Soft cloudy background */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute w-96 h-96 bg-white/10 rounded-full blur-3xl animate-cloud1" style={{ top: '5%', left: '-10%' }}></div>
                <div className="absolute w-80 h-80 bg-blue-200/10 rounded-full blur-3xl animate-cloud2" style={{ top: '20%', right: '-5%' }}></div>
                <div className="absolute w-72 h-72 bg-white/5 rounded-full blur-3xl animate-cloud3" style={{ bottom: '10%', left: '30%' }}></div>
                </div>

                {/* Snowflakes with depth */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {Array.from({ length: 60 }).map((_, i) => {
                    const size = Math.random() * 8 + 2;
                    const depth = Math.random();
                    return (
                        <div
                        key={i}
                        className="absolute bg-white rounded-full"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `-${Math.random() * 20}%`,
                            width: `${size}px`,
                            height: `${size}px`,
                            opacity: 0.3 + depth * 0.7,
                            animation: `snow ${Math.random() * 8 + 5}s linear infinite`,
                            animationDelay: `${Math.random() * 5}s`,
                            boxShadow: depth > 0.5 ? '0 0 10px rgba(255,255,255,0.5)' : 'none'
                        }}
                        />
                    );
                })}
                </div>

                {/* Falling snow trails */}
                {Array.from({ length: 10 }).map((_, i) => (
                    <div
                    key={i}
                    className="absolute w-px h-20 bg-gradient-to-b from-white/40 to-transparent animate-snowTrail"
                    style={{
                        left: `${Math.random() * 100}%`,
                                                           top: `-10%`,
                                                           animationDelay: `${Math.random() * 4}s`,
                                                           animationDuration: `${Math.random() * 3 + 2}s`
                    }}
                    />
                ))}
                </>
            );
        }

        if (mode === 'fog') {
            return (
                <>
                {/* Multiple fog layers */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {Array.from({ length: 5 }).map((_, i) => (
                    <div
                    key={i}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-400/20 to-transparent"
                    style={{
                        animation: `fog ${20 + i * 5}s ease-in-out infinite`,
                        animationDelay: `${i * 3}s`,
                        opacity: 0.3 + i * 0.1
                    }}
                    />
                ))}
                </div>

                {/* Mist particles */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {Array.from({ length: 30 }).map((_, i) => (
                    <div
                    key={i}
                    className="absolute bg-white/5 rounded-full blur-xl"
                    style={{
                        left: `${Math.random() * 100}%`,
                                                           top: `${Math.random() * 100}%`,
                                                           width: `${Math.random() * 200 + 100}px`,
                                                           height: `${Math.random() * 100 + 50}px`,
                                                           animation: `fogParticle ${Math.random() * 15 + 10}s ease-in-out infinite`,
                                                           animationDelay: `${Math.random() * 5}s`
                    }}
                    />
                ))}
                </div>
                </>
            );
        }

        if (mode === 'night') {
            return (
                <>
                {/* Animated aurora/night sky */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute w-full h-full bg-gradient-to-b from-blue-900/20 via-purple-900/10 to-transparent animate-aurora1"></div>
                <div className="absolute w-full h-full bg-gradient-to-b from-indigo-900/20 via-blue-900/10 to-transparent animate-aurora2"></div>
                </div>

                {/* Twinkling stars with size variation */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {Array.from({ length: 100 }).map((_, i) => {
                    const size = Math.random() * 3 + 1;
                    return (
                        <div
                        key={i}
                        className="absolute bg-white rounded-full"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 80}%`,
                            width: `${size}px`,
                            height: `${size}px`,
                            opacity: Math.random() * 0.5 + 0.3,
                            animation: `twinkle ${Math.random() * 4 + 2}s ease-in-out infinite`,
                            animationDelay: `${Math.random() * 5}s`,
                            boxShadow: size > 2 ? `0 0 ${size * 2}px rgba(255,255,255,0.8)` : 'none'
                        }}
                        />
                    );
                })}
                </div>

                {/* Shooting stars */}
                {Array.from({ length: 3 }).map((_, i) => (
                    <div
                    key={i}
                    className="absolute w-1 h-px bg-gradient-to-r from-white to-transparent animate-shootingStar"
                    style={{
                        left: `${Math.random() * 50}%`,
                                                          top: `${Math.random() * 50}%`,
                                                          animationDelay: `${Math.random() * 10 + 5}s`,
                                                          animationDuration: '1.5s',
                                                          transform: 'rotate(-45deg)'
                    }}
                    />
                ))}

                {/* Moon glow */}
                <div className="absolute top-20 right-20 w-32 h-32 bg-yellow-100/20 rounded-full blur-2xl animate-moonGlow"></div>
                <div className="absolute top-24 right-24 w-24 h-24 bg-white/30 rounded-full blur-xl"></div>
                </>
            );
        }

        if (mode === 'cloudy') {
            return (
                <>
                {/* Moving cloud layers */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute w-full h-96 bg-gradient-to-b from-white/10 to-transparent blur-3xl animate-cloud1" style={{ top: '0' }}></div>
                <div className="absolute w-96 h-96 bg-gray-300/15 rounded-full blur-3xl animate-cloud2" style={{ top: '10%', right: '10%' }}></div>
                <div className="absolute w-80 h-80 bg-white/10 rounded-full blur-3xl animate-cloud3" style={{ top: '40%', left: '20%' }}></div>
                <div className="absolute w-72 h-72 bg-gray-400/10 rounded-full blur-3xl animate-cloud1" style={{ bottom: '10%', right: '30%' }}></div>
                </div>

                {/* Subtle light rays */}
                {Array.from({ length: 5 }).map((_, i) => (
                    <div
                    key={i}
                    className="absolute top-0 w-px h-full bg-gradient-to-b from-white/10 via-transparent to-transparent animate-lightRay"
                    style={{
                        left: `${20 + i * 15}%`,
                        animationDelay: `${i * 0.5}s`,
                        animationDuration: '8s'
                    }}
                    />
                ))}
                </>
            );
        }

        if (mode === 'bright') {
            return (
                <>
                {/* Animated sun rays */}
                <div className="absolute top-20 right-20 w-64 h-64 pointer-events-none">
                {Array.from({ length: 12 }).map((_, i) => (
                    <div
                    key={i}
                    className="absolute top-1/2 left-1/2 w-2 h-32 bg-gradient-to-t from-yellow-300/30 to-transparent animate-sunRay"
                    style={{
                        transform: `rotate(${i * 30}deg) translateY(-50%)`,
                                                           transformOrigin: 'center',
                                                           animationDelay: `${i * 0.1}s`
                    }}
                    />
                ))}
                <div className="absolute top-1/2 left-1/2 w-32 h-32 -translate-x-1/2 -translate-y-1/2 bg-yellow-300/30 rounded-full blur-2xl animate-pulse"></div>
                <div className="absolute top-1/2 left-1/2 w-24 h-24 -translate-x-1/2 -translate-y-1/2 bg-orange-300/40 rounded-full blur-xl animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                </div>

                {/* Floating particles */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {Array.from({ length: 30 }).map((_, i) => (
                    <div
                    key={i}
                    className="absolute bg-white/20 rounded-full blur-sm"
                    style={{
                        left: `${Math.random() * 100}%`,
                                                           top: `${Math.random() * 100}%`,
                                                           width: `${Math.random() * 6 + 2}px`,
                                                           height: `${Math.random() * 6 + 2}px`,
                                                           animation: `floatParticle ${Math.random() * 10 + 5}s ease-in-out infinite`,
                                                           animationDelay: `${Math.random() * 5}s`
                    }}
                    />
                ))}
                </div>

                {/* Warm glow overlay */}
                <div className="absolute inset-0 bg-gradient-radial from-orange-300/10 via-transparent to-transparent animate-pulse pointer-events-none" style={{ animationDuration: '4s' }}></div>
                </>
            );
        }

        return null;
    };

    return (
        <div className={`min-h-screen bg-gradient-to-br ${theme.bg} transition-all duration-1000 relative overflow-hidden`}>
        <AnimatedBackground />

        <style>{`
            @keyframes rain {
                to { transform: translateY(100vh) rotate(15deg); }
            }
            @keyframes snow {
                to {
                    transform: translateY(100vh) translateX(100px);
                    opacity: 0;
                }
            }
            @keyframes snowTrail {
                to {
                    transform: translateY(100vh);
                    opacity: 0;
                }
            }
            @keyframes fog {
                0%, 100% { transform: translateX(-100%); opacity: 0.3; }
                50% { transform: translateX(100%); opacity: 0.6; }
            }
            @keyframes fogParticle {
                0%, 100% {
                    transform: translate(0, 0) scale(1);
                    opacity: 0.1;
                }
                50% {
                    transform: translate(50px, -30px) scale(1.2);
                    opacity: 0.3;
                }
            }
            @keyframes twinkle {
                0%, 100% { opacity: 0.3; transform: scale(1); }
                50% { opacity: 1; transform: scale(1.2); }
            }
            @keyframes float {
                0%, 100% { transform: translateY(0px); }
                50% { transform: translateY(-10px); }
            }
            @keyframes cloud1 {
                0%, 100% { transform: translateX(0); }
                50% { transform: translateX(50px); }
            }
            @keyframes cloud2 {
                0%, 100% { transform: translateX(0); }
                50% { transform: translateX(-30px); }
            }
            @keyframes cloud3 {
                0%, 100% { transform: translateX(0) translateY(0); }
                50% { transform: translateX(40px) translateY(-20px); }
            }
            @keyframes lightning1 {
                0%, 90%, 100% { opacity: 0; }
                91%, 93% { opacity: 0.8; }
            }
            @keyframes lightning2 {
                0%, 80%, 100% { opacity: 0; }
                81%, 82%, 84% { opacity: 0.6; }
            }
            @keyframes lightning3 {
                0%, 70%, 100% { opacity: 0; }
                71% { opacity: 0.9; }
            }
            @keyframes bolt1 {
                0%, 90%, 100% { opacity: 0; transform: scaleY(0); }
                91% { opacity: 1; transform: scaleY(1); }
                93% { opacity: 0; transform: scaleY(1); }
            }
            @keyframes bolt2 {
                0%, 80%, 100% { opacity: 0; transform: scaleY(0); }
                81% { opacity: 1; transform: scaleY(1); }
                84% { opacity: 0; transform: scaleY(1); }
            }
            @keyframes ripple {
                0% {
                    width: 0;
                    height: 0;
                    opacity: 1;
                }
                100% {
                    width: 100px;
                    height: 100px;
                    opacity: 0;
                }
            }
            @keyframes aurora1 {
                0%, 100% { opacity: 0.2; transform: translateY(0); }
                50% { opacity: 0.4; transform: translateY(-20px); }
            }
            @keyframes aurora2 {
                0%, 100% { opacity: 0.3; transform: translateY(0); }
                50% { opacity: 0.5; transform: translateY(-30px); }
            }
            @keyframes shootingStar {
                0% {
                    transform: rotate(-45deg) translateX(0);
                    opacity: 1;
                    width: 100px;
                }
                70% { opacity: 1; }
                100% {
                    transform: rotate(-45deg) translateX(300px);
                    opacity: 0;
                    width: 0;
                }
            }
            @keyframes moonGlow {
                0%, 100% { opacity: 0.3; transform: scale(1); }
                50% { opacity: 0.5; transform: scale(1.1); }
            }
            @keyframes lightRay {
                0%, 100% { opacity: 0; transform: scaleY(0.8); }
                50% { opacity: 0.3; transform: scaleY(1.2); }
            }
            @keyframes sunRay {
                0%, 100% { opacity: 0.3; transform: rotate(var(--rotation)) translateY(-50%) scaleY(1); }
                50% { opacity: 0.6; transform: rotate(var(--rotation)) translateY(-50%) scaleY(1.3); }
            }
            @keyframes floatParticle {
                0%, 100% {
                    transform: translate(0, 0);
                    opacity: 0.2;
                }
                50% {
                    transform: translate(30px, -50px);
                    opacity: 0.5;
                }
            }
            `}</style>

            <div className="relative z-10 container mx-auto px-3 xs:px-4 py-4 xs:py-6 max-w-7xl">
            {/* App Title Header */}
            <div className="text-center mb-6 md:mb-12 px-2">
            <h1 className={`text-3xl xs:text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold mb-2 md:mb-3 ${theme.heroGlow}`} style={{
                animation: 'float 4s ease-in-out infinite',
                fontFamily: 'system-ui, -apple-system, sans-serif',
                letterSpacing: '-0.02em'
            }}>
            <span className={theme.text}>Weather</span>
            <span className={`bg-gradient-to-r ${theme.pulseGradient} bg-clip-text text-transparent animate-pulse`} style={{
                animationDuration: '2s'
            }}>Pulse</span>
            </h1>
            <p className={`text-xs xs:text-sm sm:text-base md:text-xl lg:text-2xl ${theme.subtext} font-light tracking-wide px-2`} style={{
                animation: 'float 4s ease-in-out infinite 0.5s'
            }}>
            Your World, Your Weather
            </p>
            </div>

            {/* Header with Search */}
            <div className="mb-4 xs:mb-6 md:mb-8">
            <div className={`${theme.cardBg} rounded-xl xs:rounded-2xl md:rounded-3xl p-3 xs:p-4 md:p-6 ${theme.glow} border ${theme.border} transition-all duration-500`}>
            <div className="flex flex-col gap-2 xs:gap-3 md:gap-4 mb-2 xs:mb-3 md:mb-4">
            <div className="flex gap-2 xs:gap-3">
            <button
            onClick={fetchWeatherByLocation}
            className={`${theme.accent} bg-white/10 hover:bg-white/20 p-2.5 xs:p-3 md:p-4 rounded-lg xs:rounded-xl md:rounded-2xl transition-all transform hover:scale-105 flex-shrink-0`}
            title="Use my location"
            >
            <Navigation className="w-4 h-4 xs:w-5 xs:h-5 md:w-6 md:h-6" />
            </button>
            <div className="flex-1 relative">
            <input
            type="text"
            value={searchInput}
            onChange={(e) => handleSearchInput(e.target.value)}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            placeholder="Search city..."
            className={`w-full bg-white/10 ${theme.text} placeholder-current/50 border-none rounded-lg xs:rounded-xl md:rounded-2xl px-3 xs:px-4 md:px-6 py-2.5 xs:py-3 md:py-4 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all text-sm xs:text-base md:text-lg`}
            />
            {showSuggestions && suggestions.length > 0 && (
                <div className={`absolute top-full mt-2 w-full ${theme.cardBg} rounded-lg xs:rounded-xl md:rounded-2xl shadow-2xl overflow-hidden z-50 border ${theme.border}`}>
                {suggestions.map((city, i) => (
                    <button
                    key={i}
                    onClick={() => handleCitySelect(city)}
                    className={`w-full text-left px-3 xs:px-4 md:px-6 py-2.5 xs:py-3 md:py-4 ${theme.text} hover:bg-white/10 transition-all`}
                    >
                    <div className="font-semibold text-sm xs:text-base md:text-lg">{city.name}</div>
                    <div className={`text-xs md:text-sm ${theme.subtext}`}>{city.state ? `${city.state}, ` : ''}{city.country}</div>
                    </button>
                ))}
                </div>
            )}
            </div>
            </div>
            <div className="flex gap-2 xs:gap-3">
            <button
            onClick={toggleFavorite}
            className={`flex-1 ${favorites.includes(city) ? 'text-red-500' : theme.accent} bg-white/10 hover:bg-white/20 p-2.5 xs:p-3 md:p-4 rounded-lg xs:rounded-xl md:rounded-2xl transition-all transform hover:scale-105 flex items-center justify-center gap-2`}
            >
            <Heart className="w-4 h-4 xs:w-5 xs:h-5 md:w-6 md:h-6" fill={favorites.includes(city) ? 'currentColor' : 'none'} />
            <span className="text-xs xs:text-sm md:text-base">Favorite</span>
            </button>
            <button
            onClick={() => setShowSettings(!showSettings)}
            className={`flex-1 ${theme.accent} bg-white/10 hover:bg-white/20 p-2.5 xs:p-3 md:p-4 rounded-lg xs:rounded-xl md:rounded-2xl transition-all transform hover:scale-105 flex items-center justify-center gap-2`}
            >
            <Settings className="w-4 h-4 xs:w-5 xs:h-5 md:w-6 md:h-6" />
            <span className="text-xs xs:text-sm md:text-base">Settings</span>
            </button>
            </div>
            </div>

            {showSettings && (
                <div className={`mt-2 xs:mt-3 md:mt-4 pt-2 xs:pt-3 md:pt-4 border-t ${theme.border} flex flex-wrap gap-2 xs:gap-3 md:gap-4 text-xs xs:text-sm md:text-base`}>
                <button onClick={toggleUnits} className={`${theme.text} hover:${theme.accent} transition-all px-3 py-1.5 xs:py-2 bg-white/5 rounded-lg flex-1 min-w-[100px]`}>
                Units: {units === 'metric' ? '°C' : '°F'}
                </button>
                <button onClick={toggleSound} className={`${theme.text} hover:${theme.accent} transition-all flex items-center justify-center gap-2 px-3 py-1.5 xs:py-2 bg-white/5 rounded-lg flex-1 min-w-[100px]`}>
                {soundEnabled ? <Volume2 className="w-3 h-3 md:w-4 md:h-4" /> : <VolumeX className="w-3 h-3 md:w-4 md:h-4" />}
                Sound
                </button>
                </div>
            )}
            </div>
            </div>

            {error && (
                <div className="mb-6 md:mb-8 bg-red-500/20 backdrop-blur-md rounded-xl md:rounded-2xl p-3 md:p-4 text-white border border-red-500/30 text-sm md:text-base">
                {error}
                </div>
            )}

            {/* Hero Weather Section */}
            <div className={`${theme.cardBg} rounded-xl xs:rounded-2xl md:rounded-[2.5rem] p-4 xs:p-6 md:p-8 lg:p-12 ${theme.glow} border ${theme.border} mb-4 xs:mb-6 md:mb-8 transition-all duration-500 transform hover:scale-[1.01]`}>
            <div className="flex items-center gap-1.5 xs:gap-2 md:gap-3 mb-3 xs:mb-4 md:mb-6">
            <MapPin className={`w-4 h-4 xs:w-5 xs:h-5 md:w-6 md:h-6 ${theme.accent} flex-shrink-0`} />
            <h2 className={`text-lg xs:text-xl sm:text-2xl md:text-4xl font-bold ${theme.text} truncate`}>{city}</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-4 xs:gap-6 md:gap-8 items-center mb-4 xs:mb-6 md:mb-8">
            <div>
            <div className={`text-5xl xs:text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-bold ${theme.text} mb-2 xs:mb-3 md:mb-4 ${theme.heroGlow}`} style={{ animation: 'float 3s ease-in-out infinite' }}>
            {convertTemp(weather.main.temp)}°{units === 'metric' ? 'C' : 'F'}
            </div>
            <div className={`text-base xs:text-lg sm:text-xl md:text-3xl ${theme.text} opacity-90 capitalize mb-1 xs:mb-2 md:mb-3`}>
            {weather.weather[0].description}
            </div>
            <div className={`text-sm xs:text-base md:text-xl ${theme.subtext}`}>
            Feels like {convertTemp(weather.main.feels_like)}°{units === 'metric' ? 'C' : 'F'}
            </div>
            </div>
            <div className={`flex justify-center ${theme.accent} ${theme.heroGlow}`} style={{ animation: 'float 3s ease-in-out infinite 0.5s' }}>
            <WeatherIcon size="w-24 h-24 xs:w-32 xs:h-32 sm:w-40 sm:h-40 md:w-48 md:h-48" />
            </div>
            </div>

            {isSevere && (
                <div className="mb-3 xs:mb-4 md:mb-6 bg-red-500/20 border border-red-500/30 rounded-lg xs:rounded-xl md:rounded-2xl p-2.5 xs:p-3 md:p-4 flex items-center gap-2 md:gap-3 animate-pulse">
                <AlertTriangle className="w-4 h-4 xs:w-5 xs:h-5 md:w-6 md:h-6 text-red-400 flex-shrink-0" />
                <span className={`${theme.text} font-semibold text-xs xs:text-sm md:text-base`}>Severe weather alert</span>
                </div>
            )}

            <div className="grid grid-cols-2 gap-2 xs:gap-3 md:gap-6 mb-4 xs:mb-6 md:mb-8">
            {[
                { icon: Droplets, label: 'Humidity', value: `${weather.main.humidity}%` },
                { icon: Wind, label: 'Wind', value: `${weather.wind.speed} ${units === 'metric' ? 'm/s' : 'mph'}` },
                { icon: Gauge, label: 'Pressure', value: `${weather.main.pressure} hPa` },
                { icon: Eye, label: 'Visibility', value: `${(weather.visibility / 1000).toFixed(1)} km` }
            ].map((item, i) => (
                <div key={i} className="bg-white/5 rounded-lg xs:rounded-xl md:rounded-2xl p-2.5 xs:p-3 md:p-4 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all transform hover:scale-105">
                <item.icon className={`w-4 h-4 xs:w-5 xs:h-5 md:w-7 md:h-7 ${theme.accent} mb-1 md:mb-2`} />
                <div className={`text-xs md:text-sm ${theme.subtext} mb-0.5 xs:mb-1`}>{item.label}</div>
                <div className={`text-sm xs:text-base md:text-xl font-bold ${theme.text}`}>{item.value}</div>
                </div>
            ))}
            </div>

            <div className="flex flex-wrap gap-3 xs:gap-4 md:gap-8 pt-3 xs:pt-4 md:pt-6 border-t border-white/10">
            <div className="flex items-center gap-1.5 xs:gap-2 md:gap-3">
            <Sunrise className={`w-4 h-4 xs:w-5 xs:h-5 md:w-7 md:h-7 ${theme.accent} flex-shrink-0`} />
            <div>
            <div className={`text-xs md:text-sm ${theme.subtext}`}>Sunrise</div>
            <span className={`text-xs xs:text-sm md:text-lg font-semibold ${theme.text}`}>
            {new Date(weather.sys.sunrise * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            </div>
            </div>
            <div className="flex items-center gap-1.5 xs:gap-2 md:gap-3">
            <Sunset className={`w-4 h-4 xs:w-5 xs:h-5 md:w-7 md:h-7 ${theme.accent} flex-shrink-0`} />
            <div>
            <div className={`text-xs md:text-sm ${theme.subtext}`}>Sunset</div>
            <span className={`text-xs xs:text-sm md:text-lg font-semibold ${theme.text}`}>
            {new Date(weather.sys.sunset * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            </div>
            </div>
            </div>
            </div>

            {/* Hourly Forecast */}
            <div className={`${theme.cardBg} rounded-xl xs:rounded-2xl md:rounded-3xl p-4 xs:p-6 md:p-8 ${theme.glow} border ${theme.border} mb-4 xs:mb-6 md:mb-8 transition-all duration-500`}>
            <h3 className={`text-base xs:text-lg md:text-2xl font-bold ${theme.text} mb-3 xs:mb-4 md:mb-6`}>Hourly Forecast</h3>
            <div className="flex gap-2 md:gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {hourly.map((hour, i) => {
                const HourIcon = hour.weather[0].main === 'Rain' ? CloudRain : hour.weather[0].main === 'Clear' ? Sun : Cloud;
                return (
                    <div key={i} className="text-center bg-white/5 rounded-lg xs:rounded-xl md:rounded-2xl p-2.5 xs:p-3 md:p-4 backdrop-blur-sm hover:bg-white/10 transition-all transform hover:scale-105 border border-white/10 min-w-[60px] xs:min-w-[70px] flex-shrink-0">
                    <div className={`text-xs md:text-sm ${theme.subtext} mb-1.5 xs:mb-2 md:mb-3 whitespace-nowrap`}>
                    {new Date(hour.dt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <HourIcon className={`${theme.accent} w-5 h-5 xs:w-6 xs:h-6 md:w-8 md:h-8 mx-auto mb-1.5 xs:mb-2 md:mb-3`} />
                    <div className={`text-sm xs:text-base md:text-xl font-bold ${theme.text} mb-1 md:mb-2`}>
                    {convertTemp(hour.temp)}°{units === 'metric' ? 'C' : 'F'}
                    </div>
                    <div className={`text-xs ${theme.subtext}`}>
                    {Math.round(hour.pop * 100)}%
                    </div>
                    </div>
                );
            })}
            </div>
            </div>

            {/* 7-Day Forecast */}
            <div className={`${theme.cardBg} rounded-xl xs:rounded-2xl md:rounded-3xl p-4 xs:p-6 md:p-8 ${theme.glow} border ${theme.border} transition-all duration-500`}>
            <h3 className={`text-base xs:text-lg md:text-2xl font-bold ${theme.text} mb-3 xs:mb-4 md:mb-6`}>7-Day Forecast</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2 xs:gap-3 md:gap-4">
            {forecast.list.map((day, i) => {
                const DayIcon = day.weather[0].main === 'Rain' ? CloudRain : day.weather[0].main === 'Clear' ? Sun : day.weather[0].main === 'Snow' ? CloudSnow : Cloud;
                return (
                    <div key={i} className="text-center bg-white/5 rounded-lg xs:rounded-xl md:rounded-2xl p-3 xs:p-4 md:p-6 backdrop-blur-sm hover:bg-white/10 transition-all transform hover:scale-105 border border-white/10">
                    <div className={`text-xs md:text-sm font-semibold ${theme.subtext} mb-1.5 xs:mb-2 md:mb-3`}>
                    {new Date(day.dt * 1000).toLocaleDateString('en', { weekday: 'short' })}
                    </div>
                    <DayIcon className={`${theme.accent} w-8 h-8 xs:w-10 xs:h-10 md:w-12 md:h-12 mx-auto mb-1.5 xs:mb-2 md:mb-3`} />
                    <div className={`text-lg xs:text-xl md:text-2xl font-bold ${theme.text} mb-0.5 xs:mb-1`}>
                    {convertTemp(day.temp.max)}°{units === 'metric' ? 'C' : 'F'}
                    </div>
                    <div className={`text-sm xs:text-base md:text-lg ${theme.subtext} mb-1 md:mb-2`}>
                    {convertTemp(day.temp.min)}°{units === 'metric' ? 'C' : 'F'}
                    </div>
                    <div className={`text-xs ${theme.subtext}`}>
                    {Math.round(day.pop * 100)}%
                    </div>
                    </div>
                );
            })}
            </div>
            </div>

            {/* Favorites */}
            {favorites.length > 0 && (
                <div className={`${theme.cardBg} rounded-xl xs:rounded-2xl md:rounded-3xl p-4 xs:p-6 md:p-8 ${theme.glow} border ${theme.border} mt-4 xs:mt-6 md:mt-8 transition-all duration-500`}>
                <h3 className={`text-base xs:text-lg md:text-2xl font-bold ${theme.text} mb-3 xs:mb-4 md:mb-6`}>Favorites</h3>
                <div className="flex flex-wrap gap-2 md:gap-3">
                {favorites.map((fav, i) => (
                    <button
                    key={i}
                    onClick={() => fetchWeather(fav)}
                    className={`px-3 xs:px-4 md:px-6 py-1.5 xs:py-2 md:py-3 text-xs xs:text-sm md:text-base ${theme.text} bg-white/10 hover:bg-white/20 rounded-full transition-all transform hover:scale-105 border ${theme.border}`}
                    >
                    {fav}
                    </button>
                ))}
                </div>
                </div>
            )}
            </div>
            </div>
    );
};

export default WeatherApp;
