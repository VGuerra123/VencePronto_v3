import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Phone,
  Plus,
  Trash2,
  Send,
  AlertTriangle,
  Users,
  X,
  User,
  Home,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";

/* -------------------- Tipos -------------------- */
interface Contact {
  id: string;
  name: string;
  lastname: string;
  position: string;
  phone_number: string;
  is_active: boolean;
}

/* -------------------- Componente principal -------------------- */
export function AutoWhatsAppAlerts() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [newName, setNewName] = useState("");
  const [newLastname, setNewLastname] = useState("");
  const [newPosition, setNewPosition] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  /* -------------------- Cargar contactos -------------------- */
  useEffect(() => {
    loadContacts();
  }, [user]);

  const loadContacts = async () => {
    try {
      // 🔹 Primero intentamos cargar desde backend real
      const data = await api.getContacts?.(); // opcional, si no está en api.ts no falla
      if (data && Array.isArray(data)) {
        setContacts(data);
        localStorage.setItem("vp_contacts", JSON.stringify(data));
      } else {
        // 🔹 Fallback localStorage
        const stored = localStorage.getItem("vp_contacts");
        if (stored) setContacts(JSON.parse(stored));
      }
    } catch (err) {
      console.error("Error loading contacts:", err);
      const stored = localStorage.getItem("vp_contacts");
      if (stored) setContacts(JSON.parse(stored));
    }
  };

  /* -------------------- Agregar contacto -------------------- */
  const addContact = async () => {
    if (!newName || !newLastname || !newPosition || !newPhone) return;

    setLoading(true);
    try {
      const newContact: Contact = {
        id: crypto.randomUUID(),
        name: newName,
        lastname: newLastname,
        position: newPosition,
        phone_number: newPhone,
        is_active: true,
      };

      const updated = [newContact, ...contacts];
      setContacts(updated);
      localStorage.setItem("vp_contacts", JSON.stringify(updated));

      // Si luego conectas tu backend:
      // await api.addContact(newContact);

      setNewName("");
      setNewLastname("");
      setNewPosition("");
      setNewPhone("");
      setShowAddForm(false);
    } catch (err) {
      console.error("Error adding contact:", err);
    } finally {
      setLoading(false);
    }
  };

  /* -------------------- Eliminar contacto -------------------- */
  const deleteContact = async (id: string) => {
    try {
      const filtered = contacts.filter((c) => c.id !== id);
      setContacts(filtered);
      localStorage.setItem("vp_contacts", JSON.stringify(filtered));

      // Cuando tengas backend:
      // await api.deleteContact(id);
    } catch (err) {
      console.error("Error deleting contact:", err);
    }
  };

  /* -------------------- Generar mensaje de ejemplo -------------------- */
  const generateExampleMessage = () => {
    const products = [
      { name: "Galleta Triton Vainilla 126 g", daysLeft: 3 },
      { name: "Jugo Afe 300 ml", daysLeft: 3 },
    ];

    let message = `⚠️ *ALERTA AUTOMÁTICA - VencePronto*\n\n`;
    message += `Se detectaron *${products.length} productos* próximos a vencer:\n\n`;

    products.forEach((p, i) => {
      message += `*${i + 1}. ${p.name}*\n`;
      message += `   Estado: 🟡 ${p.daysLeft} días para vencer\n\n`;
    });

    message += `---\n_Alerta generada automáticamente por VencePronto_ 📦\n`;
    message += `📅 Fecha estimada de vencimiento: en ${products[0].daysLeft} días`;

    return encodeURIComponent(message);
  };

  const handleExampleAlert = () => {
    const encoded = generateExampleMessage();
    const hiddenTarget = "+56974523617";
    const whatsappUrl = `https://wa.me/${hiddenTarget.replace(/\D/g, "")}?text=${encoded}`;
    window.open(whatsappUrl, "_blank");
  };

  const sendToAllContacts = () => {
    const message = generateExampleMessage();
    contacts
      .filter((c) => c.is_active)
      .forEach((contact, index) => {
        setTimeout(() => {
          const cleanNumber = contact.phone_number.replace(/\D/g, "");
          const whatsappUrl = `https://wa.me/${cleanNumber}?text=${message}`;
          window.open(whatsappUrl, "_blank");
        }, index * 1200);
      });
  };

  /* -------------------- Renderizado -------------------- */
  return (
    <div className="space-y-6 pb-10">
      {/* 🌟 Encabezado */}
      <motion.div
        className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl shadow-lg p-6 text-white"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-start gap-4 mb-4">
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold mb-1">Alertas Automáticas</h3>
            <p className="text-red-100 text-sm leading-snug">
              Administra los contactos que recibirán avisos por WhatsApp
              cuando un producto esté próximo a vencer.
            </p>
          </div>
        </div>

        <motion.button
          onClick={handleExampleAlert}
          className="w-full py-3 rounded-xl bg-white hover:bg-red-50 text-red-600 font-bold transition-all flex items-center justify-center gap-2"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Send className="w-5 h-5" />
          <span>Ver ejemplo de alerta</span>
        </motion.button>
      </motion.div>

      {/* 👥 Lista */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
              <Users className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">
                Personas que reciben alertas
              </h3>
              <p className="text-xs text-slate-500">
                {contacts.length} registrados
              </p>
            </div>
          </div>

          <motion.button
            onClick={() => setShowAddForm(!showAddForm)}
            className="p-2 rounded-xl bg-red-500 hover:bg-red-600 text-white transition-all"
            whileTap={{ scale: 0.95 }}
          >
            {showAddForm ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          </motion.button>
        </div>

        {/* 🧾 Formulario */}
        <AnimatePresence>
          {showAddForm && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="p-4 bg-slate-50 border-b border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Nombre"
                  className="px-4 py-3 rounded-xl bg-white border-2 border-slate-200 focus:border-red-500 outline-none"
                />
                <input
                  type="text"
                  value={newLastname}
                  onChange={(e) => setNewLastname(e.target.value)}
                  placeholder="Apellido"
                  className="px-4 py-3 rounded-xl bg-white border-2 border-slate-200 focus:border-red-500 outline-none"
                />
                <input
                  type="text"
                  value={newPosition}
                  onChange={(e) => setNewPosition(e.target.value)}
                  placeholder="Cargo"
                  className="px-4 py-3 rounded-xl bg-white border-2 border-slate-200 focus:border-red-500 outline-none sm:col-span-2"
                />
                <input
                  type="tel"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="+56 9 1234 5678"
                  className="px-4 py-3 rounded-xl bg-white border-2 border-slate-200 focus:border-red-500 outline-none sm:col-span-2"
                />
                <motion.button
                  onClick={addContact}
                  disabled={
                    !newName || !newLastname || !newPosition || !newPhone || loading
                  }
                  className="sm:col-span-2 py-3 rounded-xl bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold shadow-lg shadow-red-500/30 disabled:opacity-50 flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Plus className="w-5 h-5" />
                  <span>Agregar Persona</span>
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 📋 Lista de contactos */}
        <div className="p-4 space-y-3 max-h-[430px] overflow-y-auto">
          {contacts.length === 0 ? (
            <div className="text-center py-10">
              <Phone className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-600 font-medium">
                No hay personas registradas
              </p>
              <p className="text-sm text-slate-400">
                Agrega contactos para enviar alertas automáticas
              </p>
            </div>
          ) : (
            <>
              {contacts.map((contact) => (
                <motion.div
                  key={contact.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-sm">
                        {contact.name} {contact.lastname}
                      </p>
                      <p className="text-xs text-slate-500">
                        {contact.position} • {contact.phone_number}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteContact(contact.id)}
                    className="p-2 rounded-xl bg-red-100 hover:bg-red-200 text-red-600 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </motion.div>
              ))}

              <motion.button
                onClick={sendToAllContacts}
                className="w-full mt-4 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold shadow-lg shadow-green-500/30 flex items-center justify-center gap-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Send className="w-5 h-5" />
                <span>Enviar alerta real a todos</span>
              </motion.button>
            </>
          )}
        </div>
      </div>

      {/* 🔵 Botón volver al inicio */}
      <motion.div
        className="flex justify-center pt-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <button
          onClick={() => navigate("/dashboard")}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-700 text-white font-bold shadow-md hover:shadow-lg hover:scale-105 transition-all flex items-center gap-2"
        >
          <Home className="w-5 h-5" />
          <span>Volver al inicio</span>
        </button>
      </motion.div>
    </div>
  );
}
