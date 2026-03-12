import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Pages placeholders
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import MapWeather from './pages/MapWeather';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-transparent flex flex-col relative w-full overflow-hidden">
          <Navbar />
          <main className="flex-1 container mx-auto p-4 z-10 relative mt-4">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              <Route path="/" element={
                 <ProtectedRoute>
                   <Dashboard />
                 </ProtectedRoute>
              } />
              
              <Route path="/map" element={
                 <ProtectedRoute>
                   <MapWeather />
                 </ProtectedRoute>
              } />
              
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
