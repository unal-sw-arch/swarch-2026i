import React, { useState } from 'react';
import { KeyRound, Send, X } from 'lucide-react';
import { changePassword, linkTelegram } from '@/lib/auth';

interface AccountSettingsModalProps {
  open: boolean;
  onClose: () => void;
  username?: string;
  role?: string;
  telegramChatId?: string | null;
}

export const AccountSettingsModal: React.FC<AccountSettingsModalProps> = ({
  open,
  onClose,
  username,
  role,
  telegramChatId: initialChatId,
}) => {
  const [tab, setTab] = useState<'password' | 'telegram'>('password');
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [chatId, setChatId] = useState(initialChatId ?? "");
  const [linked, setLinked] = useState(!!initialChatId);
  const [savingTelegram, setSavingTelegram] = useState(false);
  const [telegramFeedback, setTelegramFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const resetForm = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setFeedback(null);
    setSaving(false);
    setTelegramFeedback(null);
  };

  const close = () => {
    resetForm();
    onClose();
  };

  const handleLinkTelegram = async () => {
    setTelegramFeedback(null);
    setSavingTelegram(true);
    const result = await linkTelegram(chatId.trim() || null);
    setSavingTelegram(false);
    if (result.success) {
      setLinked(!!chatId.trim());
      setTelegramFeedback({ type: 'success', message: result.message });
    } else {
      setTelegramFeedback({ type: 'error', message: result.message });
    }
  };

  const handleUnlinkTelegram = async () => {
    setTelegramFeedback(null);
    setSavingTelegram(true);
    const result = await linkTelegram(null);
    setSavingTelegram(false);
    if (result.success) {
      setChatId("");
      setLinked(false);
      setTelegramFeedback({ type: 'success', message: result.message });
    } else {
      setTelegramFeedback({ type: 'error', message: result.message });
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (newPassword.length < 8) {
      setFeedback({ type: 'error', message: 'La nueva contraseña debe tener al menos 8 caracteres.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setFeedback({ type: 'error', message: 'Las contraseñas no coinciden.' });
      return;
    }

    setSaving(true);
    const result = await changePassword(currentPassword, newPassword);
    setSaving(false);

    if (result.success) {
      setFeedback({ type: 'success', message: result.message });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } else {
      setFeedback({ type: 'error', message: result.message });
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onMouseDown={close}
    >
      <div
        className="w-full max-w-md bg-white rounded-xl shadow-xl"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div>
            <p className="text-sm font-medium text-gray-900">{username || 'Usuario'}</p>
            <p className="text-xs text-gray-500">{role || 'Rol'}</p>
          </div>
          <button onClick={close} title="Cerrar" className="p-1 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setTab('password')}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-medium transition-colors ${
              tab === 'password'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <KeyRound size={15} /> Contraseña
          </button>
          <button
            onClick={() => setTab('telegram')}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-medium transition-colors ${
              tab === 'telegram'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Send size={15} /> Telegram
            {linked && <span className="w-2 h-2 rounded-full bg-green-500" title="Vinculado" />}
          </button>
        </div>

        {/* Tab: Contraseña */}
        {tab === 'password' && (
          <form onSubmit={handleChangePassword} className="px-6 py-5 space-y-4">
            <div>
              <label className="block text-sm text-gray-700 mb-1">Contraseña actual</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Nueva contraseña</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              <p className="mt-1 text-xs text-gray-400">Mínimo 8 caracteres.</p>
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Confirmar nueva contraseña</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
            {feedback && (
              <p className={`text-sm ${feedback.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                {feedback.message}
              </p>
            )}
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={close} className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                Cancelar
              </button>
              <button type="submit" disabled={saving} className="px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-60">
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </form>
        )}

        {/* Tab: Telegram */}
        {tab === 'telegram' && (
          <div className="px-6 py-5 space-y-4">
            <p className="text-sm text-gray-600">
              Vincula tu cuenta de Telegram para recibir notificaciones de pedidos y reservaciones automáticamente.
            </p>

            {linked ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-4 py-3">
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-sm text-green-700 font-medium">Cuenta vinculada</span>
                  <span className="text-xs text-green-600 ml-auto">ID: {chatId}</span>
                </div>
                {telegramFeedback && (
                  <p className={`text-sm ${telegramFeedback.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                    {telegramFeedback.message}
                  </p>
                )}
                <div className="flex justify-end gap-2">
                  <button onClick={close} className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                    Cerrar
                  </button>
                  <button
                    onClick={handleUnlinkTelegram}
                    disabled={savingTelegram}
                    className="px-4 py-2 text-sm text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors disabled:opacity-60"
                  >
                    {savingTelegram ? 'Desvinculando...' : 'Desvincular'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <ol className="text-sm text-gray-500 space-y-1 list-decimal list-inside">
                  <li>Abre Telegram y busca el bot de Click &amp; Munch</li>
                  <li>Presiona <strong>Start</strong></li>
                  <li>Obtén tu Chat ID visitando:<br />
                    <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">api.telegram.org/bot&lt;token&gt;/getUpdates</code>
                  </li>
                  <li>Pega el número en el campo de abajo</li>
                </ol>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Tu Chat ID de Telegram</label>
                  <input
                    type="text"
                    value={chatId}
                    onChange={(e) => setChatId(e.target.value)}
                    placeholder="ej: 7184207241"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
                {telegramFeedback && (
                  <p className={`text-sm ${telegramFeedback.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                    {telegramFeedback.message}
                  </p>
                )}
                <div className="flex justify-end gap-2">
                  <button onClick={close} className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                    Cancelar
                  </button>
                  <button
                    onClick={handleLinkTelegram}
                    disabled={savingTelegram || !chatId.trim()}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-white bg-[#229ED9] hover:bg-[#1a8bbf] rounded-lg transition-colors disabled:opacity-60"
                  >
                    <Send size={14} />
                    {savingTelegram ? 'Vinculando...' : 'Vincular Telegram'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
