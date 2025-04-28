
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./components/MainLayout";
import Landing from "./pages/Landing";
import WebTracker from "./pages/WebTracker";
import MeterReadingRecorder from "./pages/MeterReadingRecorder";
import ViewMeterReadings from "./pages/ViewMeterReadings";
import ExportMeterReadings from "./pages/ExportMeterReadings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <MainLayout>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/web-tracker" element={<WebTracker />} />
            <Route path="/meter-reading" element={<MeterReadingRecorder />} />
            <Route path="/meter-reading/view" element={<ViewMeterReadings />} />
            <Route path="/meter-reading/export" element={<ExportMeterReadings />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </MainLayout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
