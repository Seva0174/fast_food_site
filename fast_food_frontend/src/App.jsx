import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthProvider';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AuthContext } from './context/AuthContext';

// Composants / Pages temporaires (tu les remplaceras plus tard)
const Home = () => <h1 className="p-4 text-2xl font-bold">Carte du Fast Food</h1>;
const Login = () => <h1 className="p-4 text-2xl">Page de Connexion</h1>;
const Register = () => <h1 className="p-4 text-2xl">Page d'Inscription</h1>;
const Cart = () => <h1 className="p-4 text-2xl">Votre Panier</h1>;
const AdminDashboard = () => <h1 className="p-4 text-2xl">Panel Administration</h1>;
const NotFound = () => <h1 className="p-4 text-2xl">404 - Page non trouvée</h1>;

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Routes publiques */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Routes réservées aux utilisateurs connectés */}
          <Route element={<ProtectedRoute allowedRoles={['client', 'admin', 'employe']} />}>
            <Route path="/panier" element={<Cart />} />
          </Route>

          {/* Routes réservées aux Admins & Employés */}
          <Route element={<ProtectedRoute allowedRoles={['admin', 'employe']} />}>
            <Route path="/admin" element={<AdminDashboard />} />
          </Route>

          {/* Route 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;