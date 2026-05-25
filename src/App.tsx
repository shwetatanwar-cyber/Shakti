import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Landing from "./pages/Landing.tsx";

// Code-split non-initial routes & heavy funnel out of the main bundle
const Index = lazy(() => import("./pages/Index.tsx"));
const PillarPage = lazy(() => import("./pages/PillarPage.tsx"));
const EvolutionPage = lazy(() => import("./pages/EvolutionPage.tsx"));
const AlchemyPage = lazy(() => import("./pages/AlchemyPage.tsx"));
const NotFound = lazy(() => import("./pages/NotFound.tsx"));
const ShaktiAdmin = lazy(() => import("./pages/ShaktiAdmin.tsx"));
const OracleFunnel = lazy(() => import("./components/OracleFunnel"));

const queryClient = new QueryClient();

const GlobalOracle = () => {
  const { pathname } = useLocation();
  // Landing has its own large orb CTA; hide the floating one there.
  if (pathname === "/") return null;
  return (
    <Suspense fallback={null}>
      <OracleFunnel variant="floating" />
    </Suspense>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Suspense fallback={null}>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/shakti" element={<Index />} />
            <Route path="/pillar/evolution" element={<EvolutionPage />} />
            <Route path="/pillar/alchemy" element={<AlchemyPage />} />
            <Route path="/pillar/:slug" element={<PillarPage />} />
            <Route path="/shakti-admin" element={<ShaktiAdmin />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
        <GlobalOracle />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
