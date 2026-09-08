import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthProvider";
import { FournisseurPanier } from "./context/ContextePanier";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { MainLayout } from "./components/MainLayout";
import { Home } from "./pages/Home";

const Login = () => <h1 className="text-2xl font-bold">Page de Connexion</h1>;
const Register = () => <h1 className="text-2xl font-bold">Page d'Inscription</h1>;
const PageCommande = () => <h1 className="text-2xl font-bold">Page de Commande</h1>;
const AdminDashboard = () => <h1 className="text-2xl font-bold">Panel Administration</h1>;

function App() {
  return (
    <AuthProvider>
      <FournisseurPanier>
        <Router>
          <Routes>
            <Route element={<MainLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/commander" element={<PageCommande />} />
              
              <Route element={<ProtectedRoute allowedRoles={['admin', 'employe']} />}>
                <Route path="/admin" element={<AdminDashboard />} />
              </Route>
            </Route>
          </Routes>
        </Router>
      </FournisseurPanier>
    </AuthProvider>
  );
}

export default App;