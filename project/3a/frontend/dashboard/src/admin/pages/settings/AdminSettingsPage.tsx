import { useState } from "react";
import { Check, Shield } from "lucide-react";

export const AdminSettingsPage = () => {
  const [twoFactor, setTwoFactor] = useState(true);
  const [autoApproveMenus, setAutoApproveMenus] = useState(false);
  const [dataRetention, setDataRetention] = useState("180");

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-gray-900">Ajustes</h1>
        <p className="text-gray-600">
          Preferencias de seguridad, aprobación y retención de datos.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card title="Seguridad" description="Refuerza acceso de administradores y gestores.">
          <ToggleRow
            label="Habilitar 2FA para administradores"
            enabled={twoFactor}
            onToggle={() => setTwoFactor(!twoFactor)}
          />
          <ToggleRow
            label="Solo HTTPS para panel administrativo (NFR-04)"
            enabled={true}
            onToggle={() => {}}
            readOnly
          />
        </Card>

        <Card title="Aprobaciones" description="Cumple FR-01.5 y FR-02.3 antes de publicar.">
          <ToggleRow
            label="Auto-aprobar menús enviados por restaurantes"
            enabled={autoApproveMenus}
            onToggle={() => setAutoApproveMenus(!autoApproveMenus)}
          />
          <ToggleRow
            label="Requiere aprobación de registro de restaurante"
            enabled={true}
            onToggle={() => {}}
            readOnly
          />
        </Card>

        <Card title="Retención de datos" description="Controla cuánto tiempo se conservan logs del sistema.">
          <div className="flex items-center gap-3">
            <input
              type="number"
              value={dataRetention}
              onChange={(e) => setDataRetention(e.target.value)}
              className="w-24 rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              min={30}
              max={3650}
            />
            <span className="text-sm text-gray-600">días</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Registros de notificaciones, órdenes y aprobaciones se purgarán después del periodo.
          </p>
        </Card>

        <Card title="Backups y cumplimiento" description="Disponibilidad y privacidad (NFR-01, NFR-07).">
          <ul className="text-sm text-gray-700 space-y-2">
            <li className="flex items-center gap-2">
              <Check size={16} className="text-green-600" /> Respaldo diario cifrado.
            </li>
            <li className="flex items-center gap-2">
              <Check size={16} className="text-green-600" /> Restauración bajo solicitud del administrador.
            </li>
            <li className="flex items-center gap-2">
              <Shield size={16} className="text-blue-600" /> Accesos auditables por rol.
            </li>
          </ul>
        </Card>
      </div>
    </div>
  );
};

interface CardProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

const Card = ({ title, description, children }: CardProps) => (
  <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm space-y-3">
    <div>
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
    <div className="space-y-3">{children}</div>
  </div>
);

interface ToggleRowProps {
  label: string;
  enabled: boolean;
  onToggle: () => void;
  readOnly?: boolean;
}

const ToggleRow = ({ label, enabled, onToggle, readOnly }: ToggleRowProps) => {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-700">{label}</span>
      <button
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          enabled ? "bg-blue-600" : "bg-gray-300"
        } ${readOnly ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
        onClick={() => !readOnly && onToggle()}
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
            enabled ? "translate-x-5" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
};

