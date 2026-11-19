export const colors = {
  bg: '#141414',
  surface: '#1C1C1C',
  card: '#262626',
  input: 'rgba(42, 42, 42, 0.92)',
  border: 'rgba(255, 255, 255, 0.08)',
  gold: '#D4AF37',
  goldSoft: 'rgba(212, 175, 55, 0.16)',
  goldBorder: 'rgba(212, 175, 55, 0.55)',
  white: '#FFFFFF',
  text: '#F2F2F2',
  muted: '#9A9A9A',
  mutedDark: '#6E6E6E',
  dark: '#1A1A1A',
  error: '#E5534B',
  success: '#6CCB72',
};

export const fonts = {
  regular: 'Poppins-Regular',
  medium: 'Poppins-Medium',
  semibold: 'Poppins-SemiBold',
  bold: 'Poppins-Bold',
};

// Imagenes disponibles para los servicios (el admin elige una al crear el servicio)
export const SERVICE_IMAGES = {
  'corte-clasico': require('../assets/images/corte-clasico.jpg'),
  degradado: require('../assets/images/degradado.jpg'),
  barba: require('../assets/images/barba.jpg'),
  'corte-barba': require('../assets/images/corte-barba.jpg'),
  banner: require('../assets/images/banner.jpg'),
};
export const imageFor = (key) => SERVICE_IMAGES[key] || SERVICE_IMAGES['corte-clasico'];

export const BARBERSHOP = {
  name: 'TurnoFácil Barbería',
  address: 'Calle 93 # 13-28, El Chicó, Bogotá',
  latitude: 4.6754,
  longitude: -74.0499,
  hours: 'Lunes a sábado · 9:00 a. m. – 7:00 p. m.',
};

export const STATUS = {
  scheduled: { label: 'Agendada', color: '#6CCB72', bg: 'rgba(76,175,80,0.15)' },
  attended: { label: 'Atendida', color: '#D4AF37', bg: 'rgba(212,175,55,0.16)' },
  no_show: { label: 'No atendida', color: '#E5A04B', bg: 'rgba(229,160,75,0.15)' },
  cancelled: { label: 'Cancelada', color: '#E5534B', bg: 'rgba(229,83,75,0.15)' },
};

export const ROLE_LABEL = { admin: 'Administrador', barber: 'Barbero', client: 'Cliente' };
