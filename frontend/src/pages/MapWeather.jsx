import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import api from '../services/api';

const customIcon = new L.Icon({
  iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const LocationMarker = ({ setWeather, setError, setLoading }) => {
  const [position, setPosition] = useState(null);

  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setPosition(e.latlng);
      fetchWeatherForLocation(lat, lng);
    },
  });

  const fetchWeatherForLocation = async (lat, lon) => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get(`/weather/current?lat=${lat}&lon=${lon}`);
      setWeather(response.data);
    } catch (err) {
      setError('Could not fetch weather for this location.');
      setWeather(null);
    } finally {
      setLoading(false);
    }
  };

  return position === null ? null : (
    <Marker position={position} icon={customIcon}></Marker>
  );
};

const MapWeather = () => {
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialCenter, setInitialCenter] = useState([51.505, -0.09]); 
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setInitialCenter([pos.coords.latitude, pos.coords.longitude]);
          setMapReady(true);
        },
        () => {
          setMapReady(true);
        }
      );
    } else {
      setMapReady(true);
    }
  }, []);

  if (!mapReady) {
     return (
       <div className="flex justify-center items-center h-[80vh]">
         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
       </div>
     );
  }

  return (
    <div className="flex flex-col lg:flex-row h-[85vh] gap-6 p-4">
      {/* Map Section */}
      <div className="w-full lg:w-2/3 h-[50vh] lg:h-full glassmorphism overflow-hidden relative shadow-2xl">
        <div className="absolute top-4 left-4 z-[1000] bg-white/90 text-slate-800 px-4 py-2 rounded-lg font-medium shadow-md backdrop-blur-sm pointer-events-none">
           Click anywhere on the map to get weather
        </div>
        <MapContainer 
          center={initialCenter} 
          zoom={5} 
          scrollWheelZoom={true} 
          className="w-full h-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker setWeather={setWeather} setError={setError} setLoading={setLoading} />
        </MapContainer>
      </div>

      {/* Info Panel Section */}
      <div className="w-full lg:w-1/3 h-[30vh] lg:h-full glassmorphism p-6 flex flex-col justify-center items-center relative overflow-hidden">
        {loading && (
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-400 mb-4 shadow-lg"></div>
            <p className="text-white/80 font-medium">Fetching weather data...</p>
          </div>
        )}
        
        {error && (
          <div className="text-red-400 bg-red-500/10 border border-red-500/30 p-4 rounded-xl text-center w-full shadow-lg">
            {error}
          </div>
        )}
        
        {!loading && !error && !weather && (
          <div className="text-center opacity-60">
            <svg className="w-20 h-20 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <p className="text-lg">Select a location on the map</p>
          </div>
        )}

        {!loading && weather && (
          <div className="w-full h-full flex flex-col text-center mt-4">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-300 to-indigo-400 bg-clip-text text-transparent mb-1 drop-shadow-md">
              {weather.name || "Unknown Location"}
              {weather.sys?.country && `, ${weather.sys.country}`}
            </h2>
            <p className="text-white/60 mb-6 text-sm">
              {weather.coord.lat.toFixed(2)}&deg; N, {weather.coord.lon.toFixed(2)}&deg; E
            </p>
            
            <div className="flex-1 flex flex-col items-center justify-center">
              <img 
                src={`http://openweathermap.org/img/wn/${weather.weather[0].icon}@4x.png`} 
                alt="weather icon" 
                className="w-32 h-32 filter drop-shadow-xl -my-4"
              />
              <p className="text-6xl font-light tracking-tighter mb-2 drop-shadow-lg">{Math.round(weather.main.temp)}&deg;</p>
              <p className="text-xl capitalize text-white/90 font-medium drop-shadow">{weather.weather[0].description}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-8 pt-6 border-t border-white/20 w-full text-left">
              <div className="bg-white/10 p-4 rounded-xl border border-white/10 shadow-lg">
                <p className="text-xs text-white/60 uppercase">Humidity</p>
                <p className="font-semibold text-lg drop-shadow">{weather.main.humidity}%</p>
              </div>
              <div className="bg-white/10 p-4 rounded-xl border border-white/10 shadow-lg">
                <p className="text-xs text-white/60 uppercase">Wind</p>
                <p className="font-semibold text-lg drop-shadow">{weather.wind.speed} m/s</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MapWeather;
