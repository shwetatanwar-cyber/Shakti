import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import Landing from "./pages/Landing.tsx";
import PillarPage from "./pages/PillarPage.tsx";
import EvolutionPage from "./pages/EvolutionPage.tsx";
import AlchemyPage from "./pages/AlchemyPage.tsx";
import NotFound from "./pages/NotFound.tsx";
import ShaktiAdmin from "./pages/ShaktiAdmin.tsx";
import OracleFunnel from "./components/OracleFunnel";

const queryClient = new QueryClient();

const GlobalOracle = () => {
  const { pathname } = useLocation();
  // Landing has its own large orb CTA; hide the floating one there.
  if (pathname === "/") return null;
  return <OracleFunnel variant="floating" />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
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
        <GlobalOracle />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
