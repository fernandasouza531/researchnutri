import { Toaster } from "sonner";
import { Route, Switch } from "wouter";
import Home from "./pages/Home";
import Admin from "./pages/Admin";
import AdminLogin from "./pages/AdminLogin";
import Comparador from "./pages/Comparador";
import ComparadorDetalhe from "./pages/ComparadorDetalhe";
import BriefingList from "./pages/BriefingList";
import BriefingDetalhe from "./pages/BriefingDetalhe";
import Glp1Hub from "./pages/Glp1Hub";
import Glp1Artigo from "./pages/Glp1Artigo";
import GuiaMala from "./pages/GuiaMala";
import NotFound from "./pages/NotFound";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/comparador" component={Comparador} />
      <Route path="/comparador/:slug" component={ComparadorDetalhe} />
      <Route path="/briefing" component={BriefingList} />
      <Route path="/briefing/:slug" component={BriefingDetalhe} />
      <Route path="/glp1" component={Glp1Hub} />
      <Route path="/glp1/:slug" component={Glp1Artigo} />
      <Route path="/guia-mala" component={GuiaMala} />
      <Route path="/admin" component={Admin} />
      <Route path="/admin/login" component={AdminLogin} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <>
      <Toaster />
      <Router />
    </>
  );
}
