import { lazy, Suspense, useEffect, useState } from 'react';
import { Routes, Route, Navigate, useLocation, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { customersService } from '@/services/customers.service';

const SuperAdminLayout = lazy(() => import('@/layouts/SuperAdminLayout'));
const AdminLayout = lazy(() => import('@/layouts/AdminLayout'));
const CustomerLayout = lazy(() => import('@/layouts/CustomerLayout'));
const TenantLayout = lazy(() => import('@/layouts/TenantLayout'));

const Login = lazy(() => import('@/pages/auth/Login'));
const SuperAdminLogin = lazy(() => import('@/pages/auth/SuperAdminLogin'));
const Register = lazy(() => import('@/pages/auth/Register'));
const ForgotPassword = lazy(() => import('@/pages/auth/ForgotPassword'));
const ResetPassword = lazy(() => import('@/pages/auth/ResetPassword'));

const SuperAdminDashboard = lazy(() => import('@/pages/super-admin/Dashboard'));
const SuperAdminEstablishments = lazy(() => import('@/pages/super-admin/Establishments'));
const EstablishmentForm = lazy(() => import('@/pages/super-admin/EstablishmentForm'));
const EstablishmentDetail = lazy(() => import('@/pages/super-admin/EstablishmentDetail'));
const SuperAdminUsers = lazy(() => import('@/pages/super-admin/Users'));

const AdminDashboard = lazy(() => import('@/pages/admin/Dashboard'));
const AdminProfessionals = lazy(() => import('@/pages/admin/Professionals'));
const AdminServices = lazy(() => import('@/pages/admin/Services'));
const AdminAppointments = lazy(() => import('@/pages/admin/Appointments'));
const AdminCustomers = lazy(() => import('@/pages/admin/Customers'));
const AdminSettings = lazy(() => import('@/pages/admin/Settings'));
const AdminPlans = lazy(() => import('@/pages/admin/Plans'));
const AdminPortfolio = lazy(() => import('@/pages/admin/Portfolio'));
const AdminCustomerScreen = lazy(() => import('@/pages/admin/CustomerScreen'));
const AdminBranches = lazy(() => import('@/pages/admin/Branches'));
const AdminFinancial = lazy(() => import('@/pages/admin/Financial'));

const CustomerDashboard = lazy(() => import('@/pages/customer/Dashboard'));
const CustomerAppointments = lazy(() => import('@/pages/customer/Appointments'));
const CustomerProfile = lazy(() => import('@/pages/customer/Profile'));
const CustomerClub = lazy(() => import('@/pages/customer/Club'));
const CustomerPlan = lazy(() => import('@/pages/customer/Plan'));

const EstablishmentPage = lazy(() => import('@/pages/public/EstablishmentPage'));
const BookingFlow = lazy(() => import('@/pages/public/BookingFlow'));
const TenantLogin = lazy(() => import('@/pages/public/TenantLogin'));
const TenantRegister = lazy(() => import('@/pages/public/TenantRegister'));
const TenantPlans = lazy(() => import('@/pages/public/TenantPlans'));

const NotFound = lazy(() => import('@/pages/NotFound'));

const ACTIVE_ESTABLISHMENT_SLUG_KEY = 'activeEstablishmentSlug';
const CUSTOMER_TENANT_REDIRECT_TIMEOUT_MS = 10000;

function AdminRedirect() {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) return <LoadingSpinner fullScreen />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== 'establishment_admin') return <Navigate to="/" replace />;
  if (!user?.establishmentSlug) return <Navigate to="/login" replace />;

  return <Navigate to={`/${user.establishmentSlug}/admin`} replace />;
}

function PrivateRoute({ children, roles }) {
  const { isAuthenticated, user, loading } = useAuth();
  const params = useParams();
  const location = useLocation();

  if (loading) return <LoadingSpinner fullScreen />;

  if (!isAuthenticated) {
    const tenantLogin = params.slug ? `/${params.slug}/login` : '/login';
    return <Navigate to={tenantLogin} state={{ from: location.pathname }} replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/acesso-negado" replace />;
  }

  if (user.role === 'establishment_admin') {
    if (!user.establishmentSlug) {
      return <Navigate to="/login" replace />;
    }
    if (params.slug && params.slug !== user.establishmentSlug) {
      return <Navigate to={`/${user.establishmentSlug}/admin`} replace />;
    }
  }

  return children;
}

function LegacyTenantRedirect() {
  const { slug, '*': rest } = useParams();
  const suffix = rest ? `/${rest}` : '';
  return <Navigate to={`/${slug}${suffix}`} replace />;
}

function LegacyAdminRedirect() {
  const { slug, '*': rest } = useParams();
  const suffix = rest ? `/${rest}` : '';
  return <Navigate to={`/${slug}/admin${suffix}`} replace />;
}

function CustomerTenantRedirect() {
  const { user, logout } = useAuth();
  const [targetSlug, setTargetSlug] = useState(() => localStorage.getItem(ACTIVE_ESTABLISHMENT_SLUG_KEY));
  const [loading, setLoading] = useState(!targetSlug);
  const [unresolved, setUnresolved] = useState(false);

  useEffect(() => {
    if (targetSlug) {
      setLoading(false);
      return;
    }

    if (user?.role !== 'customer') {
      setLoading(false);
      return;
    }

    let active = true;
    setLoading(true);
    setUnresolved(false);

    const resolveWithoutTenant = () => {
      if (!active) return;
      localStorage.removeItem(ACTIVE_ESTABLISHMENT_SLUG_KEY);
      logout();
      setUnresolved(true);
      setLoading(false);
    };

    const timeout = window.setTimeout(resolveWithoutTenant, CUSTOMER_TENANT_REDIRECT_TIMEOUT_MS);

    const load = async () => {
      try {
        const establishments = await customersService.getMyEstablishments();
        if (!active) return;
        const firstSlug = establishments?.[0]?.slug || null;
        if (firstSlug) {
          localStorage.setItem(ACTIVE_ESTABLISHMENT_SLUG_KEY, firstSlug);
          setTargetSlug(firstSlug);
          setLoading(false);
          return;
        }
        resolveWithoutTenant();
      } catch {
        resolveWithoutTenant();
      } finally {
        window.clearTimeout(timeout);
      }
    };

    load();

    return () => {
      active = false;
      window.clearTimeout(timeout);
    };
  }, [targetSlug, user, logout]);

  if (loading) return <LoadingSpinner fullScreen />;
  if (targetSlug) return <Navigate to={`/${targetSlug}/cliente`} replace />;
  if (unresolved) return <Navigate to="/login" replace />;
  return <Navigate to="/login" replace />;
}

function RootRedirect() {
  const { loading, user } = useAuth();

  if (loading) return <LoadingSpinner fullScreen />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'super_admin') return <Navigate to="/super-admin" replace />;
  if (user.role === 'establishment_admin') {
    return <Navigate to={user.establishmentSlug ? `/${user.establishmentSlug}/admin` : '/login'} replace />;
  }

  const activeSlug = localStorage.getItem(ACTIVE_ESTABLISHMENT_SLUG_KEY);
  return <Navigate to={activeSlug ? `/${activeSlug}/cliente` : '/minha-conta'} replace />;
}

export default function AppRoutes() {
  return (
    <Suspense fallback={<LoadingSpinner fullScreen />}>
      <Routes>
        <Route path="/agendamento/:slug/*" element={<LegacyTenantRedirect />} />
        <Route path="/admin/:slug/*" element={<LegacyAdminRedirect />} />

        <Route path="/:slug" element={<TenantLayout />}>
          <Route index element={<EstablishmentPage />} />
          <Route path="agendar" element={<BookingFlow />} />
          <Route path="planos" element={<TenantPlans />} />
          <Route path="login" element={<TenantLogin />} />
          <Route path="cadastro" element={<TenantRegister />} />
        </Route>

        <Route path="/login" element={<Login />} />
        <Route path="/super-admin/login" element={<SuperAdminLogin />} />
        <Route path="/cadastro" element={<Register />} />
        <Route path="/recuperar-senha" element={<ForgotPassword />} />
        <Route path="/redefinir-senha" element={<ResetPassword />} />

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

        <Route
          path="/:slug/admin"
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
          <Route path="clube" element={<AdminPlans />} />
          <Route path="filiais" element={<AdminBranches />} />
          <Route path="financeiro" element={<AdminFinancial />} />
          <Route path="portfolio" element={<Navigate to="../personalizar/portfolio" replace />} />
          <Route path="personalizar/portfolio" element={<AdminPortfolio />} />
          <Route path="personalizar/tela-cliente" element={<AdminCustomerScreen />} />
          <Route path="configuracoes" element={<AdminSettings />} />
        </Route>

        <Route path="/admin" element={<AdminRedirect />} />

        <Route
          path="/minha-conta/*"
          element={
            <PrivateRoute roles={['customer']}>
              <CustomerTenantRedirect />
            </PrivateRoute>
          }
        />

        <Route
          path="/:slug/cliente"
          element={
            <PrivateRoute roles={['customer']}>
              <CustomerLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<CustomerDashboard />} />
          <Route path="agendamentos" element={<CustomerAppointments />} />
          <Route path="perfil" element={<CustomerProfile />} />
          <Route path="clube" element={<CustomerClub />} />
          <Route path="plano" element={<CustomerPlan />} />
        </Route>

        <Route path="/" element={<RootRedirect />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
