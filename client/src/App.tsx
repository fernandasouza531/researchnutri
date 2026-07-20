import { Toaster } from "sonner";
import { Route, Switch } from "wouter";
import Home from "./pages/Home";
import Admin from "./pages/Admin";
import AdminLogin from "./pages/AdminLogin";
import NotFound from "./pages/NotFound";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
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
