import { useState } from "react";
import { motion } from "framer-motion";
import { LogIn, UserPlus, Loader2 } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

export function AuthForm() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isSignUp) await signUp(email, password);
      else await signIn(email, password);
    } catch (err: any) {
      setError(err.message || "Error al autenticar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden"
      style={{
        background: "linear-gradient(180deg, #235DE6 0%, #3B7BFF 100%)",
      }}
    >
      {/* Halo animado de fondo */}
      <motion.div
        className="absolute w-[800px] h-[800px] rounded-full blur-[220px] bg-white/10"
        animate={{ scale: [1, 1.15, 1], opacity: [0.6, 0.9, 0.6] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Contenedor principal translúcido */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="relative z-10 w-full max-w-sm p-8 rounded-3xl backdrop-blur-2xl"
        style={{
          background: "rgba(255, 255, 255, 0.15)",
          boxShadow:
            "0 10px 40px rgba(0,0,0,0.25), inset 0 0 25px rgba(255,255,255,0.08)",
          border: "1px solid rgba(255,255,255,0.25)",
        }}
      >
        {/* Logo grande flotante */}
        <motion.div
          animate={{
            y: [0, -10, 0],
            transition: { duration: 3.5, repeat: Infinity, ease: "easeInOut" },
          }}
          className="flex justify-center mb-6"
        >
          <motion.img
            src="/logopronto.webp"
            alt="Logo Pronto Copec"
            className="w-32 h-32 object-contain select-none"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            style={{
              filter:
                "drop-shadow(0 0 25px rgba(255,255,255,0.8)) drop-shadow(0 0 50px rgba(35,93,230,0.6))",
            }}
          />
        </motion.div>

        {/* Título */}
        <div className="text-center mb-6">
          <h2 className="text-3xl font-extrabold text-white drop-shadow-[0_0_10px_rgba(0,0,0,0.3)]">
            {isSignUp ? "Crear Cuenta" : "Iniciar Sesión"}
          </h2>
          <p className="text-white/75 text-sm mt-2">
            Bienvenid@ a{" "}
            <span className="font-semibold">Vence Pronto</span>
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-white/80 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl bg-white/25 text-white placeholder-white/70 border border-white/30 focus:ring-2 focus:ring-[#69B8FF] outline-none transition-all"
              placeholder="tu@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/80 mb-1">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-3 rounded-xl bg-white/25 text-white placeholder-white/70 border border-white/30 focus:ring-2 focus:ring-[#69B8FF] outline-none transition-all"
              placeholder="••••••"
            />
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 rounded-xl bg-red-500/10 text-red-200 text-sm text-center border border-red-500/30"
            >
              {error}
            </motion.div>
          )}

          {/* Botón principal */}
          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{
              scale: 1.03,
              boxShadow:
                "0 8px 25px rgba(59,123,255,0.6), 0 0 10px rgba(255,255,255,0.3)",
            }}
            whileTap={{ scale: 0.96 }}
            animate={{
              y: [0, -2, 0],
              transition: { duration: 3, repeat: Infinity, ease: "easeInOut" },
            }}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-[#3B7BFF] to-[#235DE6] text-white font-semibold shadow-[0_4px_20px_rgba(35,93,230,0.4)] transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : isSignUp ? (
              <>
                <UserPlus className="w-5 h-5" />
                <span>Crear Cuenta</span>
              </>
            ) : (
              <>
                <LogIn className="w-5 h-5" />
                <span>Iniciar Sesión</span>
              </>
            )}
          </motion.button>
        </form>

        {/* Cambiar entre login/signup */}
        <div className="text-center mt-6">
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-sm text-[#D8E3FF] hover:text-white transition-colors"
          >
            {isSignUp
              ? "¿Ya tienes cuenta? Inicia sesión"
              : "¿No tienes cuenta? Regístrate"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
