import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthProvider';
import { FournisseurPanier } from './context/ContextePanier';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { MainLayout } from './components/layout/MainLayout';
import { Home } from './pages/Home';
import { PageAuth } from './pages/PageAuth';
import { PageCommande } from './pages/PageCommande';
import { PageUser } from './pages/PageUser';
import { MentionsLegales } from './pages/MentionsLegales';
import { AdminGestionCommandes } from './pages/AdminGestionCommandes';
import AdminPage from './pages/AdminPage';
import { ROLE, ROLES_STAFF } from './lib/roles';

function App() {
  return (
    <AuthProvider>
      <FournisseurPanier>
        <Router>
          <Routes>
            <Route element={<MainLayout />}>
              {/* Routes publiques */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<PageAuth />} />
              <Route path="/register" element={<PageAuth inscription />} />
              <Route path="/mentions-legales" element={<MentionsLegales />} />

              {/* Routes reservees aux utilisateurs connectes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/commander" element={<PageCommande />} />
                <Route path="/user" element={<PageUser />} />
              </Route>

              {/* Gestion des commandes : administrateurs et employes */}
              <Route element={<ProtectedRoute rolesAutorises={ROLES_STAFF} />}>
                <Route path="/commandes" element={<AdminGestionCommandes />} />
              </Route>

              {/* Panneau d'administration : administrateurs uniquement */}
              <Route element={<ProtectedRoute rolesAutorises={[ROLE.ADMIN]} />}>
                <Route path="/admin" element={<AdminPage />} />
              </Route>
            </Route>
          </Routes>
        </Router>
      </FournisseurPanier>
    </AuthProvider>
  );
}

export default App;