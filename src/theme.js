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
};

export const fonts = {
  regular: 'Poppins-Regular',
  medium: 'Poppins-Medium',
  semibold: 'Poppins-SemiBold',
  bold: 'Poppins-Bold',
};

// Usuario de prueba (unico usuario valido en esta version)
export const TEST_USER = {
  email: 'demo@turnofacil.com',
  password: '123456',
  name: 'Carlos Demo',
};

export const SERVICES = [
  {
    id: 'corte-clasico',
    name: 'Corte clásico',
    price: '$25.000',
    duration: '30 min',
    description: 'Corte tradicional con tijera y máquina, lavado incluido.',
    image: require('../assets/images/corte-clasico.jpg'),
  },
  {
    id: 'degradado',
    name: 'Degradado',
    price: '$30.000',
    duration: '40 min',
    description: 'Fade a medida con acabado a navaja.',
    image: require('../assets/images/degradado.jpg'),
  },
  {
    id: 'barba',
    name: 'Barba',
    price: '$20.000',
    duration: '25 min',
    description: 'Perfilado, toalla caliente y aceite para barba.',
    image: require('../assets/images/barba.jpg'),
  },
  {
    id: 'corte-barba',
    name: 'Corte + Barba',
    price: '$40.000',
    duration: '60 min',
    description: 'El combo completo: corte a elección y arreglo de barba.',
    image: require('../assets/images/corte-barba.jpg'),
  },
];
