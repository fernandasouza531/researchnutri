import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <h1 className="text-4xl font-bold text-gray-300 mb-2">404</h1>
      <p className="text-gray-500 mb-4">Página não encontrada.</p>
      <Link href="/" className="text-green-700 hover:underline text-sm">
        Voltar ao início
      </Link>
    </div>
  );
}
