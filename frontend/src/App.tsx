import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import { AppLayout } from "@/components/AppLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AuthProvider } from "@/context/AuthContext";
import { LoginPage } from "@/features/auth/LoginPage";
import { DashboardPage } from "@/features/dashboard/DashboardPage";
import { GeographyPage } from "@/features/geography/GeographyPage";
import { OffenderDetailPage } from "@/features/offenders/OffenderDetailPage";
import { OffendersListPage } from "@/features/offenders/OffendersListPage";
import { RolesAccessPage } from "@/features/roles/RolesAccessPage";
import { MyVisitsPage } from "@/features/visits/MyVisitsPage";
import { VisitSchedulesPage } from "@/features/visits/VisitSchedulesPage";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route
                index
                element={
                  <ProtectedRoute requirePermission="dashboard.view">
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="offenders"
                element={
                  <ProtectedRoute requirePermission="offender.view">
                    <OffendersListPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="offenders/:id"
                element={
                  <ProtectedRoute requirePermission="offender.view">
                    <OffenderDetailPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="visits"
                element={
                  <ProtectedRoute requirePermission="visit.view">
                    <VisitSchedulesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="my-visits"
                element={
                  <ProtectedRoute requirePermission="visit.submit">
                    <MyVisitsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="roles"
                element={
                  <ProtectedRoute requirePermission="role.view">
                    <RolesAccessPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="geography"
                element={
                  <ProtectedRoute requirePermission="geography.manage">
                    <GeographyPage />
                  </ProtectedRoute>
                }
              />
            </Route>
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
