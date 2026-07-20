import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import AdminSupplements from "./admin/AdminSupplements";
import AdminBrands from "./admin/AdminBrands";
import AdminComparisons from "./admin/AdminComparisons";
import AdminBriefings from "./admin/AdminBriefings";

type Tab = "comparador" | "marcas" | "briefing" | "config";

export default function Admin() {
  const [, setLocation] = useLocation();
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("comparador");

  useEffect(() => {
    fetch("/api/admin/me", { credentials: "include" })
      .then(r => r.json())
      .then(data => {
        if (!data) {
          setLocation("/admin/login");
        } else {
          setUser(data);
        }
        setLoading(false);
      })
      .catch(() => {
        setLocation("/admin/login");
      });
  }, [setLocation]);

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST", credentials: "include" });
    setLocation("/admin/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Carregando...</p>
      </div>
    );
  }

  if (!user) return null;

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: "comparador", label: "Comparador", icon: "⚖️" },
    { key: "marcas", label: "Marcas", icon: "🏷️" },
    { key: "briefing", label: "Briefing", icon: "📋" },
    { key: "config", label: "Config", icon: "⚙️" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-green-800 text-white px-4 py-3 flex items-center justify-between">
        <h1 className="text-lg font-bold">Nutri Intel — Admin</h1>
        <button onClick={handleLogout} className="text-sm text-green-200 hover:text-white">
          Sair
        </button>
      </header>

      {/* Content */}
      <main className="p-4 max-w-4xl mx-auto">
        {activeTab === "comparador" && <AdminSupplements />}
        {activeTab === "marcas" && <AdminBrands />}
        {activeTab === "briefing" && <AdminBriefings />}
        {activeTab === "config" && (
          <div className="text-center text-gray-500 py-12">
            <p>Configurações em breve.</p>
          </div>
        )}
      </main>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around py-2 z-50">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex flex-col items-center gap-0.5 px-3 py-1 text-xs ${
              activeTab === tab.key ? "text-green-700 font-semibold" : "text-gray-500"
            }`}
          >
            <span className="text-lg">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
