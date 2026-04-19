import { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useLocation, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { customersService } from '@/services/customers.service';

import SuperAdminLayout from '@/layouts/SuperAdminLayout';
import AdminLayout from '@/layouts/AdminLayout';
import CustomerLayout from '@/layouts/CustomerLayout';
import TenantLayout from '@/layouts/TenantLayout';

import Login from '@/pages/auth/Login';
import SuperAdminLogin from '@/pages/auth/SuperAdminLogin';
import Register from '@/pages/auth/Register';
import ForgotPassword from '@/pages/auth/ForgotPassword';
import ResetPassword from '@/pages/auth/ResetPassword';

import SuperAdminDashboard from '@/pages/super-admin/Dashboard';
import SuperAdminEstablishments from '@/pages/super-admin/Establishments';
import EstablishmentForm from '@/pages/super-admin/EstablishmentForm';
import EstablishmentDetail from '@/pages/super-admin/EstablishmentDetail';
import SuperAdminUsers from '@/pages/super-admin/Users';

import AdminDashboard from '@/pages/admin/Dashboard';
import AdminProfessionals from '@/pages/admin/Professionals';
import AdminServices from '@/pages/admin/Services';
import AdminAppointments from '@/pages/admin/Appointments';
import AdminCustomers from '@/pages/admin/Customers';
import AdminSettings from '@/pages/admin/Settings';
import AdminPlans from '@/pages/admin/Plans';
import AdminPortfolio from '@/pages/admin/Portfolio';
import AdminBranches from '@/pages/admin/Branches';
import AdminFinancial from '@/pages/admin/Financial';

import CustomerDashboard from '@/pages/customer/Dashboard';
import CustomerAppointments from '@/pages/customer/Appointments';
import CustomerProfile from '@/pages/customer/Profile';
import CustomerClub from '@/pages/customer/Club';
import CustomerPlan from '@/pages/customer/Plan';

import EstablishmentPage from '@/pages/public/EstablishmentPage';
import BookingFlow from '@/pages/public/BookingFlow';
import TenantLogin from '@/pages/public/TenantLogin';
import TenantRegister from '@/pages/public/TenantRegister';
import TenantPlans from '@/pages/public/TenantPlans';

import NotFound from '@/pages/NotFound';

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
  const { user } = useAuth();
  const [targetSlug, setTargetSlug] = useState(() => localStorage.getItem('activeEstablishmentSlug'));
  const [loading, setLoading] = useState(!targetSlug);

  useEffect(() => {
    if (targetSlug || user?.role !== 'customer') {
      setLoading(false);
      return;
    }

    const load = async () => {
      try {
        const establishments = await customersService.getMyEstablishments();
        const firstSlug = establishments?.[0]?.slug || null;
        if (firstSlug) {
          localStorage.setItem('activeEstablishmentSlug', firstSlug);
          setTargetSlug(firstSlug);
        }
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [targetSlug, user]);

  if (loading) return <LoadingSpinner fullScreen />;
  if (targetSlug) return <Navigate to={`/${targetSlug}/cliente`} replace />;
  return <Navigate to="/login" replace />;
}

function RootRedirect() {
  const { loading, user } = useAuth();

  if (loading) return <LoadingSpinner fullScreen />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'super_admin') return <Navigate to="/super-admin" replace />;
  if (user.role === 'establishment_admin') return <Navigate to={`/${user.establishmentSlug}/admin`} replace />;

  const activeSlug = localStorage.getItem('activeEstablishmentSlug');
  return <Navigate to={activeSlug ? `/${activeSlug}/cliente` : '/minha-conta'} replace />;
}

export default function AppRoutes() {
  return (
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
        <Route path="portfolio" element={<AdminPortfolio />} />
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
  );
}
