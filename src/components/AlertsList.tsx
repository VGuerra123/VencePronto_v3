import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Clock, XCircle, Check } from "lucide-react";
import { GlassCard } from "./GlassCard";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../lib/api"; // ← Punto único de llamadas HTTP (ver api.ts propuesto)

/* -------------------- Tipos -------------------- */
type AlertType = "warning" | "urgent" | "expired";

interface AlertItem {
  id: string;
  inventory_id: string;
  alert_type: AlertType;
  days_until_expiration: number;
  acknowledged: boolean;
  inventory: {
    product: { name: string; brand: string };
    expiration_date: string;
    quantity: number;
    location: string | null;
  };
}

interface AlertsListProps {
  onUpdate: () => void;
}

/* -------------------- Componente -------------------- */
export function AlertsList({ onUpdate: _onUpdate }: AlertsListProps) {
  // _onUpdate evita TS "unused" hasta que conectemos esta acción
  void _onUpdate;

  const { user } = useAuth();
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAlerts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadAlerts = async () => {
    if (!user) {
      setAlerts([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      // 1) Intento contra tu API real (cuando la tengamos)
      //    Debe devolver una lista de inventory con product embebido.
      //    Ejemplo de shape esperado por este componente:
      //    [{ id, expiration_date, quantity, location, product: { name, brand } }, ...]
      const inventory: Array<{
        id: string;
        expiration_date: string;
        quantity: number;
        location: string | null;
        product: { name: string; brand: string };
        status?: string;
        user_id?: string;
      }> = await api.getInventory();

      const computed = computeAlertsFromInventory(inventory);
      setAlerts(computed);
    } catch {
      // 2) Fallback local mientras no exista backend:
      //    Guarda en localStorage bajo "vp_inventory" un arreglo con el mismo shape.
      const raw = localStorage.getItem("vp_inventory");
      const local: Array<{
        id: string;
        expiration_date: string;
        quantity: number;
        location: string | null;
        product: { name: string; brand: string };
        status?: string;
        user_id?: string;
      }> = raw ? JSON.parse(raw) : [];

      // Si quieres separar por usuario, puedes filtrar por user.email o id si lo guardas:
      const filtered = local.filter(
        (row) => !row.status || row.status === "active"
      );

      const computed = computeAlertsFromInventory(filtered);
      setAlerts(computed);
    } finally {
      setLoading(false);
    }
  };

  /* -------------------- Utilidades -------------------- */
  const computeAlertsFromInventory = (
    inventory: Array<{
      id: string;
      expiration_date: string;
      quantity: number;
      location: string | null;
      product: { name: string; brand: string };
    }>
  ): AlertItem[] => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const result: AlertItem[] = [];

    inventory.forEach((item) => {
      const expirationDate = new Date(item.expiration_date);
      expirationDate.setHours(0, 0, 0, 0);

      const daysUntil = Math.floor(
        (expirationDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );

      let alertType: AlertType | null = null;
      if (daysUntil < 0) alertType = "expired";
      else if (daysUntil <= 3) alertType = "urgent";
      else if (daysUntil <= 7) alertType = "warning";

      if (alertType) {
        result.push({
          id: `alert-${item.id}`,
          inventory_id: item.id,
          alert_type: alertType,
          days_until_expiration: daysUntil,
          acknowledged: false,
          inventory: item,
        });
      }
    });

    // Orden: vencen antes primero
    return result.sort(
      (a, b) => a.days_until_expiration - b.days_until_expiration
    );
  };

  const getAlertIcon = (type: AlertType) => {
    switch (type) {
      case "expired":
        return XCircle;
      case "urgent":
        return AlertTriangle;
      case "warning":
        return Clock;
      default:
        return Clock;
    }
  };

  const getAlertColor = (type: AlertType) => {
    switch (type) {
      case "expired":
        return "from-red-500 to-pink-600";
      case "urgent":
        return "from-orange-500 to-red-600";
      case "warning":
        return "from-yellow-500 to-orange-600";
      default:
        return "from-blue-500 to-indigo-600";
    }
  };

  const getAlertBgColor = (type: AlertType) => {
    switch (type) {
      case "expired":
        return "bg-red-50";
      case "urgent":
        return "bg-orange-50";
      case "warning":
        return "bg-yellow-50";
      default:
        return "bg-blue-50";
    }
  };

  const getAlertMessage = (alert: AlertItem) => {
    if (alert.alert_type === "expired") {
      return `Venció hace ${Math.abs(alert.days_until_expiration)} día(s)`;
    }
    return `Vence en ${alert.days_until_expiration} día(s)`;
  };

  /* -------------------- UI -------------------- */
  if (loading) {
    return (
      <GlassCard className="p-6" hover={false}>
        <div className="text-center py-8 text-gray-500">Cargando alertas...</div>
      </GlassCard>
    );
  }

  if (alerts.length === 0) {
    return (
      <GlassCard className="p-6" hover={false}>
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <p className="text-gray-700">No hay alertas pendientes</p>
        </div>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900">Alertas de Vencimiento</h2>
      <div className="space-y-3">
        {alerts.map((alert, index) => {
          const Icon = getAlertIcon(alert.alert_type);
          const color = getAlertColor(alert.alert_type);
          const bgColor = getAlertBgColor(alert.alert_type);

          return (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <GlassCard className="p-4">
                <div className="flex items-start gap-4">
                  <div
                    className={`w-12 h-12 ${bgColor} rounded-xl flex items-center justify-center flex-shrink-0`}
                  >
                    <Icon className="w-6 h-6 text-current" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900">
                      {alert.inventory.product.name}
                    </h3>
                    <p className="text-sm text-gray-700">
                      {alert.inventory.product.brand}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2 text-sm">
                      <span
                        className={`px-3 py-1 rounded-lg font-semibold bg-gradient-to-r ${color} text-white`}
                      >
                        {getAlertMessage(alert)}
                      </span>
                      <span className="px-3 py-1 rounded-lg bg-gray-100 text-gray-700">
                        Cantidad: {alert.inventory.quantity}
                      </span>
                      {alert.inventory.location && (
                        <span className="px-3 py-1 rounded-lg bg-gray-100 text-gray-700">
                          📍 {alert.inventory.location}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
