import { useState } from 'react';
import Button from './Button';
import Alert from './Alert';
import Badge from './Badge';
import { setupMfaAPI, enableMfaAPI, disableMfaAPI } from '../../services/api';
import { toast } from '../../stores/useToastStore';

/**
 * MfaSection — Tarjeta de configuración de autenticación de dos factores.
 *
 * Props:
 *   - mfaEnabled: boolean — estado actual del usuario
 *   - onChange:   () => void — callback para refrescar perfil tras un cambio
 */
export default function MfaSection({ mfaEnabled, onChange }) {
  const [setupData, setSetupData] = useState(null); // { qr, secret }
  const [code, setCode] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  const [confirmandoDesactivar, setConfirmandoDesactivar] = useState(false);

  const iniciarSetup = async () => {
    setError('');
    setCargando(true);
    try {
      const data = await setupMfaAPI();
      setSetupData({ qr: data.qr, secret: data.secret });
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  const confirmarActivacion = async (e) => {
    e?.preventDefault();
    if (!/^\d{6}$/.test(code)) {
      setError('Ingresa el código de 6 dígitos generado por la app.');
      return;
    }
    setError('');
    setCargando(true);
    try {
      await enableMfaAPI(code);
      toast.success('MFA activado', 'Tu cuenta ahora pide un segundo factor al iniciar sesión.');
      setSetupData(null);
      setCode('');
      onChange?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  const desactivar = async (e) => {
    e?.preventDefault();
    if (!/^\d{6}$/.test(code)) {
      setError('Ingresa un código válido para confirmar.');
      return;
    }
    setError('');
    setCargando(true);
    try {
      await disableMfaAPI(code);
      toast.success('MFA desactivado', 'Tu cuenta vuelve a usar solo contraseña.');
      setConfirmandoDesactivar(false);
      setCode('');
      onChange?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="perfil__card card" style={{ marginTop: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>Autenticación de dos factores (MFA)</h3>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--text2)' }}>
            Protege tu cuenta usando Google Authenticator, Authy o similar.
          </p>
        </div>
        <Badge
          texto={mfaEnabled ? 'Activo' : 'Inactivo'}
          tipo={mfaEnabled ? 'green' : 'gray'}
          dot
        />
      </div>

      {error && <Alert tipo="error" onCerrar={() => setError('')}>{error}</Alert>}

      {/* Caso: MFA inactivo y no se está configurando */}
      {!mfaEnabled && !setupData && (
        <Button variante="primary" onClick={iniciarSetup} cargando={cargando}>
          Activar MFA
        </Button>
      )}

      {/* Caso: configurando — mostrar QR */}
      {!mfaEnabled && setupData && (
        <form onSubmit={confirmarActivacion} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <p style={{ margin: 0, fontSize: 13 }}>
            Escanea este código QR con tu app autenticadora:
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', padding: 12, background: '#fff', borderRadius: 8 }}>
            <img src={setupData.qr} alt="QR de configuración MFA" style={{ width: 200, height: 200 }} />
          </div>
          <p style={{ margin: 0, fontSize: 12, color: 'var(--text2)' }}>
            ¿No puedes escanear? Ingresa esta clave manualmente:{' '}
            <code style={{ userSelect: 'all' }}>{setupData.secret}</code>
          </p>
          <div className="field">
            <label className="field__label">Código de verificación</label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              className="field__input"
              placeholder="123456"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              required
            />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Button type="submit" variante="primary" cargando={cargando}>
              Confirmar y activar
            </Button>
            <Button
              type="button"
              variante="ghost"
              onClick={() => { setSetupData(null); setCode(''); setError(''); }}
            >
              Cancelar
            </Button>
          </div>
        </form>
      )}

      {/* Caso: MFA activo */}
      {mfaEnabled && !confirmandoDesactivar && (
        <Button variante="danger" onClick={() => setConfirmandoDesactivar(true)}>
          Desactivar MFA
        </Button>
      )}

      {/* Caso: confirmando desactivación */}
      {mfaEnabled && confirmandoDesactivar && (
        <form onSubmit={desactivar} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <p style={{ margin: 0, fontSize: 13 }}>
            Para desactivar MFA, ingresa un código actual de tu app autenticadora:
          </p>
          <div className="field">
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              className="field__input"
              placeholder="123456"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              required
              autoFocus
            />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Button type="submit" variante="danger" cargando={cargando}>
              Confirmar desactivación
            </Button>
            <Button
              type="button"
              variante="ghost"
              onClick={() => { setConfirmandoDesactivar(false); setCode(''); setError(''); }}
            >
              Cancelar
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
