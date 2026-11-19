import React from 'react';
import Svg, { Circle, Line, Path, Polyline, Rect, G } from 'react-native-svg';

const base = (size, color, width = 1.8) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: color,
  strokeWidth: width,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
});

export const ScissorsIcon = ({ size = 24, color = '#000', strokeWidth = 1.8 }) => (
  <Svg {...base(size, color, strokeWidth)}>
    <Circle cx="6" cy="6" r="3" />
    <Circle cx="6" cy="18" r="3" />
    <Line x1="20" y1="4" x2="8.12" y2="15.88" />
    <Line x1="14.47" y1="14.48" x2="20" y2="20" />
    <Line x1="8.12" y1="8.12" x2="12" y2="12" />
  </Svg>
);

// Tijeras del logo (abiertas en diagonal, como en el diseno)
export const LogoScissors = ({ size = 40, color = '#141414' }) => (
  <Svg width={size} height={size} viewBox="0 0 40 40" fill="none">
    <G stroke={color} strokeWidth={2.6} strokeLinecap="round">
      <Circle cx="11" cy="20" r="4.6" />
      <Circle cx="18.5" cy="28.5" r="4.6" />
      <Line x1="15.2" y1="21.6" x2="33" y2="13" />
      <Line x1="20.2" y1="24.2" x2="27.5" y2="7.5" />
    </G>
  </Svg>
);

export const MailIcon = ({ size = 20, color }) => (
  <Svg {...base(size, color)}>
    <Rect x="3" y="5" width="18" height="14" rx="2.5" />
    <Polyline points="3.5,7 12,13 20.5,7" />
  </Svg>
);

export const LockIcon = ({ size = 20, color }) => (
  <Svg {...base(size, color)}>
    <Rect x="4.5" y="11" width="15" height="10" rx="2.5" />
    <Path d="M8 11V7.5a4 4 0 0 1 8 0V11" />
  </Svg>
);

export const EyeIcon = ({ size = 20, color }) => (
  <Svg {...base(size, color)}>
    <Path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" />
    <Circle cx="12" cy="12" r="3" />
  </Svg>
);

export const EyeOffIcon = ({ size = 20, color }) => (
  <Svg {...base(size, color)}>
    <Path d="M9.9 5.2A9.6 9.6 0 0 1 12 5c6.4 0 10 7 10 7a17.6 17.6 0 0 1-2.6 3.5" />
    <Path d="M6.2 6.6C3.5 8.3 2 12 2 12s3.6 7 10 7a9.8 9.8 0 0 0 5.4-1.6" />
    <Path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
    <Line x1="3" y1="3" x2="21" y2="21" />
  </Svg>
);

export const GoogleIcon = ({ size = 18, color = '#EA4335' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M20 12.2c0-.6-.1-1.1-.2-1.6H12v3.1h4.5a3.9 3.9 0 0 1-1.7 2.5 5.4 5.4 0 0 1-8.2-2.8 5.4 5.4 0 0 1 8.3-6l2.3-2.3A8.6 8.6 0 0 0 3.4 12 8.6 8.6 0 0 0 12 20.6c4.7 0 8-3.3 8-8.4z"
      fill={color}
    />
  </Svg>
);

export const AppleIcon = ({ size = 18, color = '#FFFFFF' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      fill={color}
      d="M16.4 12.7c0-2.5 2-3.6 2.1-3.7-1.2-1.7-3-1.9-3.6-2-1.5-.2-3 .9-3.7.9-.8 0-2-.9-3.2-.8-1.7 0-3.2 1-4 2.4-1.7 3-.4 7.4 1.2 9.8.8 1.2 1.8 2.5 3 2.4 1.2 0 1.7-.8 3.1-.8 1.5 0 1.9.8 3.2.8 1.3 0 2.1-1.2 2.9-2.4.9-1.3 1.3-2.7 1.3-2.7s-2.3-.9-2.3-3.9zM14.1 5.4c.7-.8 1.1-1.9 1-3-1 0-2.1.7-2.8 1.5-.6.7-1.2 1.8-1 2.9 1.1.1 2.1-.6 2.8-1.4z"
    />
  </Svg>
);

export const SearchIcon = ({ size = 22, color }) => (
  <Svg {...base(size, color, 2)}>
    <Circle cx="11" cy="11" r="7" />
    <Line x1="20.5" y1="20.5" x2="16" y2="16" />
  </Svg>
);

export const FilterIcon = ({ size = 22, color }) => (
  <Svg {...base(size, color, 2)}>
    <Line x1="4" y1="7" x2="20" y2="7" />
    <Line x1="4" y1="12" x2="20" y2="12" />
    <Line x1="4" y1="17" x2="20" y2="17" />
    <Line x1="15" y1="5" x2="15" y2="9" />
    <Line x1="9" y1="10" x2="9" y2="14" />
    <Line x1="13" y1="15" x2="13" y2="19" />
  </Svg>
);

export const ClockIcon = ({ size = 14, color }) => (
  <Svg {...base(size, color, 2.2)}>
    <Circle cx="12" cy="12" r="9" />
    <Polyline points="12,7 12,12 15.5,14" />
  </Svg>
);

export const HomeIcon = ({ size = 24, color }) => (
  <Svg {...base(size, color)}>
    <Path d="M4 10.2 12 4l8 6.2V19a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z" />
    <Path d="M9.5 21v-5a2.5 2.5 0 0 1 5 0v5" />
  </Svg>
);

export const CalendarIcon = ({ size = 24, color }) => (
  <Svg {...base(size, color)}>
    <Rect x="3.5" y="5" width="17" height="16" rx="2.5" />
    <Line x1="3.5" y1="10" x2="20.5" y2="10" />
    <Line x1="8" y1="3" x2="8" y2="7" />
    <Line x1="16" y1="3" x2="16" y2="7" />
    <Circle cx="8" cy="13.5" r="0.4" fill={color} />
    <Circle cx="12" cy="13.5" r="0.4" fill={color} />
    <Circle cx="16" cy="13.5" r="0.4" fill={color} />
    <Circle cx="8" cy="17.5" r="0.4" fill={color} />
    <Circle cx="12" cy="17.5" r="0.4" fill={color} />
    <Circle cx="16" cy="17.5" r="0.4" fill={color} />
  </Svg>
);

export const UserIcon = ({ size = 24, color }) => (
  <Svg {...base(size, color)}>
    <Circle cx="12" cy="8" r="4" />
    <Path d="M4.5 21a7.5 7.5 0 0 1 15 0" />
  </Svg>
);

export const ChevronRightIcon = ({ size = 18, color }) => (
  <Svg {...base(size, color, 2)}>
    <Polyline points="9,5 16,12 9,19" />
  </Svg>
);

export const LogoutIcon = ({ size = 20, color }) => (
  <Svg {...base(size, color)}>
    <Path d="M9 21H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3" />
    <Polyline points="16,17 21,12 16,7" />
    <Line x1="21" y1="12" x2="9" y2="12" />
  </Svg>
);

export const BellIcon = ({ size = 20, color }) => (
  <Svg {...base(size, color)}>
    <Path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
    <Path d="M13.7 21a2 2 0 0 1-3.4 0" />
  </Svg>
);

export const HelpIcon = ({ size = 20, color }) => (
  <Svg {...base(size, color)}>
    <Circle cx="12" cy="12" r="9" />
    <Path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3" />
    <Circle cx="12" cy="17" r="0.4" fill={color} />
  </Svg>
);

export const PinIcon = ({ size = 16, color }) => (
  <Svg {...base(size, color)}>
    <Path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z" />
    <Circle cx="12" cy="10" r="3" />
  </Svg>
);
