# TurnoFácil MVP (Expo SDK 57)

## Ejecutar en iPhone con Expo Go

```bash
npm install
npx expo start
```

Escanea el QR con la cámara del iPhone (Expo Go debe estar instalado y en la misma red Wi-Fi).
Si tu red bloquea la conexión, usa `npx expo start --tunnel`.

## Usuario de prueba

- Correo: `demo@turnofacil.com`
- Contraseña: `123456`

La sesión queda guardada (expo-secure-store). Para salir: pestaña Perfil > Cerrar sesión.

## Qué funciona en esta versión

- Bienvenida > Iniciar sesión > Inicio.
- Login con validación del usuario de prueba, mostrar/ocultar contraseña, mensajes de error.
- Pestañas navegables: Inicio, Servicios, Mis citas, Perfil.
- Búsqueda de servicios en Inicio, "Ver todo" y el botón de filtro llevan a Servicios.
- Reservar (banner, tarjetas o Servicios) agrega la cita a "Mis citas" (en memoria).

Google, Apple, "¿Olvidaste tu contraseña?", "Regístrate" y "Crear cuenta" muestran "Próximamente".

## Imágenes

Las fotos en `assets/images/` se extrajeron de los mockups. Si tienes los originales en alta
resolución, reemplázalos con el mismo nombre de archivo:
`welcome-bg.jpg`, `banner.jpg`, `corte-clasico.jpg`, `degradado.jpg`, `barba.jpg`, `corte-barba.jpg`.

## Dependencias añadidas (versiones oficiales de SDK 57, compatibles con Expo Go)

- `expo-font` (tipografía Poppins)
- `react-native-svg` (iconos)
- `expo-linear-gradient` (degradados)
