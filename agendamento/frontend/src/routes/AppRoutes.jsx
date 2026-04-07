import { Routes, Route, Navigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import LoadingSpinner from '@/components/common/LoadingSpinner';

// Layouts
import SuperAdminLayout from '@/layouts/SuperAdminLayout';
import AdminLayout from '@/layouts/AdminLayout';
import CustomerLayout from '@/layouts/CustomerLayout';
import PublicLayout from '@/layouts/PublicLayout';

// Auth pages
import Login from '@/pages/auth/Login';
import SuperAdminLogin from '@/pages/auth/SuperAdminLogin';
import Register from '@/pages/auth/Register';
import ForgotPassword from '@/pages/auth/ForgotPassword';

// Super Admin pages
import SuperAdminDashboard from '@/pages/super-admin/Dashboard';
import SuperAdminEstablishments from '@/pages/super-admin/Establishments';
import EstablishmentForm from '@/pages/super-admin/EstablishmentForm';
import EstablishmentDetail from '@/pages/super-admin/EstablishmentDetail';
import SuperAdminUsers from '@/pages/super-admin/Users';

// Admin pages
import AdminDashboard from '@/pages/admin/Dashboard';
import AdminProfessionals from '@/pages/admin/Professionals';
import AdminServices from '@/pages/admin/Services';
import AdminAppointments from '@/pages/admin/Appointments';
import AdminCustomers from '@/pages/admin/Customers';
import AdminSettings from '@/pages/admin/Settings';

// Customer pages
import CustomerDashboard from '@/pages/customer/Dashboard';

// Public pages
import EstablishmentPage from '@/pages/public/EstablishmentPage';
import BookingFlow from '@/pages/public/BookingFlow';

// Misc
import NotFound from '@/pages/NotFound';

// Redireciona /admin → /admin/:slug do usuário logado
function AdminRedirect() {
  const { user, isAuthenticated, loading } = useAuth();
  if (loading) return <LoadingSpinner fullScreen />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== 'establishment_admin') return <Navigate to="/" replace />;
  if (!user?.establishmentSlug) return <Navigate to="/login" replace />;
  return <Navigate to={`/admin/${user.establishmentSlug}`} replace />;
}

function PrivateRoute({ children, roles }) {
  const { isAuthenticated, user, loading } = useAuth();
  const params = useParams();

  if (loading) return <LoadingSpinner fullScreen />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/acesso-negado" replace />;

  // Garante que admin só acessa o próprio slug
  if (user.role === 'establishment_admin' && params.slug && params.slug !== user.establishmentSlug) {
    return <Navigate to={`/admin/${user.establishmentSlug}`} replace />;
  }

  return children;
}

export default function AppRoutes() {
  const { loading, user } = useAuth();

  if (loading) return <LoadingSpinner fullScreen />;

  const getDefaultRedirect = () => {
    if (!user) return '/login';
    if (user.role === 'super_admin') return '/super-admin';
    if (user.role === 'establishment_admin') return '/admin';
    return '/minha-conta';
  };

  return (
    <Routes>
      {/* Public routes */}
      <Route element={<PublicLayout />}>
        <Route path="/agendamento/:slug" element={<EstablishmentPage />} />
        <Route path="/agendamento/:slug/agendar" element={<BookingFlow />} />
      </Route>

      {/* Auth routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/super-admin/login" element={<SuperAdminLogin />} />
      <Route path="/cadastro" element={<Register />} />
      <Route path="/recuperar-senha" element={<ForgotPassword />} />

      {/* Super Admin routes */}
      <Route
        path="/super-admin"
        element={
          <PrivateRoute roles={['super_admin']}>
            <SuperAdminLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<SuperAdminDashboard />} />
        <Route path="estabelecimentos" element={<SuperAdminEstablishments />} />
        <Route path="estabelecimentos/novo" element={<EstablishmentForm />} />
        <Route path="estabelecimentos/:id" element={<EstablishmentDetail />} />
        <Route path="estabelecimentos/:id/editar" element={<EstablishmentForm />} />
        <Route path="usuarios" element={<SuperAdminUsers />} />
      </Route>

      {/* Admin routes — /admin/:slug/* */}
      <Route
        path="/admin/:slug"
        element={
          <PrivateRoute roles={['establishment_admin']}>
            <AdminLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="profissionais" element={<AdminProfessionals />} />
        <Route path="servicos" element={<AdminServices />} />
        <Route path="agendamentos" element={<AdminAppointments />} />
        <Route path="clientes" element={<AdminCustomers />} />
        <Route path="configuracoes" element={<AdminSettings />} />
      </Route>

      {/* Redirect /admin sem slug para o slug do usuário */}
      <Route path="/admin" element={<AdminRedirect />} />

      {/* Customer routes */}
      <Route
        path="/minha-conta"
        element={
          <PrivateRoute roles={['customer']}>
            <CustomerLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<CustomerDashboard />} />
      </Route>

      {/* Root redirect */}
      <Route path="/" element={<Navigate to={getDefaultRedirect()} replace />} />

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
