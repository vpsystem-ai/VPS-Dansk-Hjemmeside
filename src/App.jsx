import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { lazy, Suspense, useEffect } from "react";
import Nav from "./components/Nav";
import AnnouncementBar from "./components/AnnouncementBar";
import { Analytics } from "@vercel/analytics/react";

// Lazy load pages for better performance
const Home = lazy(() => import("./pages/Home"));
const Terms = lazy(() => import("./pages/Terms"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Overblik = lazy(() => import("./pages/Overblik"));

// Scroll til toppen ved sideskift – eller til et anker (#id) hvis der er et
function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      let tries = 0;
      const tryScroll = () => {
        const el = document.getElementById(hash.slice(1));
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        } else if (tries++ < 20) {
          setTimeout(tryScroll, 100);
        }
      };
      tryScroll();
      return;
    }
    window.scrollTo(0, 0);
  }, [pathname, hash]);
  return null;
}

// Loading fallback component
const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-accent text-lg">Indlæser...</div>
  </div>
);

export default function App() {
  return (
    <div className="min-h-screen">
      {/* Skip to main content link for accessibility */}
      <a href="#main-content" className="skip-link">
        Spring til hovedindhold
      </a>

      <Router>
        <ScrollToTop />
        <AnnouncementBar />
        <Nav />
        <Suspense fallback={<LoadingFallback />}>
          <main id="main-content" tabIndex={-1}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/betingelser" element={<Terms />} />
              <Route path="/privatliv" element={<Privacy />} />
              <Route path="/overblik" element={<Overblik />} />
            </Routes>
          </main>
        </Suspense>
      </Router>
      <Analytics />
    </div>
  );
}
