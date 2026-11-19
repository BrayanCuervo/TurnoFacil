# TurnoFácil v2 — App de turnos para barbería (Expo + Supabase)

## Cómo correrla
```
npm install
npx expo start
```
Escanea el QR con **Expo Go** (Android o iPhone).

## Roles y pestañas
| Rol | Pestañas | Qué puede hacer |
|---|---|---|
| Cliente | Inicio, Servicios, Mis citas, Ubicación, Perfil | Registrarse, agendar (barbero específico o "cualquiera"), cancelar hasta 12 h antes, ver historial |
| Barbero | Agenda, Ubicación, Perfil | Ver sus citas, marcarlas Atendida / No atendida, pedir cambios al admin |
| Admin | Citas, Servicios, Usuarios, Solicitudes, Perfil | Crear/editar servicios y precios, crear barberos (usuario + contraseña por correo), activar/desactivar usuarios, ver todas las citas, cancelar, resolver solicitudes |

## Backend (Supabase, proyecto `turnofacil`)
- Tablas: `profiles`, `services`, `appointments`, `change_requests`, `email_outbox` con RLS.
- Reglas en el servidor: sin doble reserva (restricción de exclusión), horario lun–sáb 9:00–19:00 (Bogotá), cancelación ≥ 12 h.
- Edge Functions: `auth-public` (registro, código de recuperación), `admin-users` (crear barberos, activar/desactivar), `send-emails` (Gmail).
- pg_cron: recordatorios 24 h antes (cada 10 min) y envío de correos (cada minuto).
- Secreto `GMAIL_APP_PASSWORD` (contraseña de aplicación de turnofacil70@gmail.com).

## Extras
- Sensor: vibración (motor háptico) en cada toque; GPS en la pestaña Ubicación.
- Animaciones: logo animado en bienvenida, entrada deslizante de tarjetas/pestañas, check animado al reservar.
- La sesión se cierra tras 30 minutos sin uso.

Respaldo del código original: `../turnofacil-mvp-respaldo-original/`
