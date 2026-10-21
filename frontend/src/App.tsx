import { Toaster as Sonner } from "@/components/ui/sonner";
import { MotionConfig } from "framer-motion";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";
import { SvgSprite } from "@/components/shared/SvgSprite";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AppLayout } from "@/components/layout";
import { PublicLayout } from "@/components/public/PublicLayout";
import Home from "./pages/public/Home";
import Formations from "./pages/public/Formations";
import FormationDetail from "./pages/public/FormationDetail";
import Contact from "./pages/public/Contact";
import Faq from "./pages/public/Faq";
import MentionsLegales from "./pages/public/MentionsLegales";
import NotFound from "./pages/public/NotFound";
import { EspaceNotFound } from "@/components/layout/EspaceNotFound";

// Auth Pages
import { Login, Register } from "./pages/auth";

// Formateur Pages
import {
  FormateurDashboard,
  FormateurGroupes,
  FormateurSeances,
  FormateurPlanning,
  FormateurNotes,
  FormateurNotifications,
  FormateurProfile,
} from "./pages/formateur";

// Etudiant Pages
import {
  EtudiantDashboard,
  EtudiantPlanning,
  EtudiantNotes,
  EtudiantNotifications,
  EtudiantCours,
  EtudiantCatalogue,
  EtudiantFormateurs,
  EtudiantProfile,
} from "./pages/etudiant";

// Une erreur 4xx est définitive (inutile de la rejouer) ; les pannes réseau / 5xx sont retentées une fois.
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        const status = isAxiosError(error) ? error.response?.status : undefined;
        return (status === undefined || status >= 500) && failureCount < 1;
      },
    },
  },
});

function SessionLoading() {
  return (
    <div role="status" className="flex min-h-screen items-center justify-center bg-background text-muted-foreground">
      Chargement de votre session…
    </div>
  );
}

// Protected Route Component
function ProtectedRoute({ children, allowedRole }: { children: React.ReactNode; allowedRole?: 'FORMATEUR' | 'ETUDIANT' }) {
  const { isAuthenticated, isFormateur, isEtudiant, isLoading, user } = useAuth();

  if (isLoading) {
    return <SessionLoading />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If user is authenticated but trying to access a route they shouldn't
  if (allowedRole && user) {
    // Formateur trying to access Etudiant routes
    if (allowedRole === 'ETUDIANT' && isFormateur) {
      return <Navigate to="/formateur" replace />;
    }
    // Etudiant trying to access Formateur routes
    if (allowedRole === 'FORMATEUR' && isEtudiant) {
      return <Navigate to="/etudiant" replace />;
    }
  }

  return <>{children}</>;
}

// Auth Route (redirect if already logged in)
function AuthRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isFormateur, isLoading } = useAuth();

  if (isLoading) {
    return <SessionLoading />;
  }

  if (isAuthenticated) {
    return <Navigate to={isFormateur ? '/formateur' : '/etudiant'} replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/formations" element={<Formations />} />
        <Route path="/formations/:id" element={<FormationDetail />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/faq" element={<Faq />} />
        <Route path="/mentions-legales" element={<MentionsLegales />} />
        <Route path="/login" element={<AuthRoute><Login /></AuthRoute>} />
        <Route path="/register" element={<AuthRoute><Register /></AuthRoute>} />
        <Route path="*" element={<NotFound />} />
      </Route>

      {/* Formateur Routes */}
      <Route path="/formateur" element={
        <ProtectedRoute allowedRole="FORMATEUR">
          <AppLayout />
        </ProtectedRoute>
      }>
        <Route index element={<FormateurDashboard />} />
        <Route path="groupes" element={<FormateurGroupes />} />
        <Route path="seances" element={<FormateurSeances />} />
        <Route path="planning" element={<FormateurPlanning />} />
        <Route path="notes" element={<FormateurNotes />} />
        <Route path="notifications" element={<FormateurNotifications />} />
        <Route path="profile" element={<FormateurProfile />} />
        <Route path="*" element={<EspaceNotFound />} />
      </Route>

      {/* Etudiant Routes */}
      <Route path="/etudiant" element={
        <ProtectedRoute allowedRole="ETUDIANT">
          <AppLayout />
        </ProtectedRoute>
      }>
        <Route index element={<EtudiantDashboard />} />
        <Route path="planning" element={<EtudiantPlanning />} />
        <Route path="notes" element={<EtudiantNotes />} />
        <Route path="notifications" element={<EtudiantNotifications />} />
        <Route path="cours" element={<EtudiantCours />} />
        <Route path="catalogue" element={<EtudiantCatalogue />} />
        <Route path="formateurs" element={<EtudiantFormateurs />} />
        <Route path="profile" element={<EtudiantProfile />} />
        <Route path="*" element={<EspaceNotFound />} />
      </Route>

    </Routes>
  );
}

const App = () => (
  <ErrorBoundary>
  <SvgSprite />
  <MotionConfig reducedMotion="user">
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Sonner />
          <BrowserRouter
            future={{
              v7_startTransition: true,
              v7_relativeSplatPath: true,
            }}
          >
            <AppRoutes />
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
  </MotionConfig>
  </ErrorBoundary>
);

export default App;
