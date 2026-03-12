import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="glassmorphism sticky top-0 z-50 p-4 border-b border-white/10 flex justify-between items-center rounded-none shadow-none">
      <Link to="/" className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent hover:opacity-80 transition-opacity">
        WeatherDash
      </Link>
      <div className="flex gap-4 items-center">
        {user ? (
          <>
            <Link to="/map" className="hover:text-blue-400 transition-colors">Map</Link>
            
            <button 
              onClick={handleLogout}
              className="bg-red-500/20 text-red-400 border border-red-500/30 px-4 py-2 rounded-lg hover:bg-red-500/30 transition-all font-medium"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="hover:text-blue-400 transition-colors">Login</Link>
            <Link to="/register" className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors font-medium">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
