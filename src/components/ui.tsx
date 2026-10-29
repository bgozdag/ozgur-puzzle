import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View, type StyleProp, type TextProps, type TextStyle, type ViewStyle } from 'react-native';
import Svg, { Circle, Path, Polygon, Rect } from 'react-native-svg';

import { COLORS, FONTS } from '../theme';

export function Txt({ style, bold, ...rest }: TextProps & { bold?: boolean; style?: StyleProp<TextStyle> }) {
  return <Text {...rest} style={[{ fontFamily: bold ? FONTS.bold : FONTS.regular, color: COLORS.text }, style]} />;
}

type ButtonProps = {
  label?: string;
  onPress: () => void;
  color?: string;
  shade?: string;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  children?: ReactNode;
  accessibilityLabel?: string;
};

/** Çocuklar için büyük, "basılabilir" görünümlü buton */
export function BigButton({ label, onPress, color = COLORS.orange, shade = COLORS.orangeDark, disabled, style, textStyle, children, accessibilityLabel }: ButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: disabled ? COLORS.lock : color, borderBottomColor: disabled ? '#B3AAC6' : shade },
        pressed && !disabled && styles.pressed,
        style,
      ]}
    >
      {children}
      {label ? (
        <Txt bold style={[styles.buttonText, textStyle]}>
          {label}
        </Txt>
      ) : null}
    </Pressable>
  );
}

export function RoundIconButton({ onPress, children, label }: { onPress: () => void; children: ReactNode; label: string }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={10}
      style={({ pressed }) => [styles.round, pressed && styles.pressed]}
    >
      {children}
    </Pressable>
  );
}

export function BackIcon({ size = 26, color = COLORS.text }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M 15 4 L 7 12 L 15 20" stroke={color} strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </Svg>
  );
}

const STAR_POINTS = '12,1.5 15,8.6 22.6,9.2 16.8,14.2 18.6,21.7 12,17.6 5.4,21.7 7.2,14.2 1.4,9.2 9,8.6';

export function StarIcon({ size = 20, filled = true }: { size?: number; filled?: boolean }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Polygon
        points={STAR_POINTS}
        fill={filled ? COLORS.yellow : '#E9E3F2'}
        stroke={filled ? '#E0A800' : '#CFC8DE'}
        strokeWidth={1.6}
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function StarRow({ count, size = 18, max = 3 }: { count: number; size?: number; max?: number }) {
  return (
    <View style={{ flexDirection: 'row', gap: 2 }}>
      {Array.from({ length: max }, (_, i) => (
        <StarIcon key={i} size={size} filled={i < count} />
      ))}
    </View>
  );
}

export function LockIcon({ size = 36 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 40 40">
      <Path d="M 12 18 L 12 13 Q 12 5 20 5 Q 28 5 28 13 L 28 18" stroke="#6E6487" strokeWidth={4.5} fill="none" strokeLinecap="round" />
      <Rect x={7} y={17} width={26} height={19} rx={5} fill="#FFC94D" stroke="#6E6487" strokeWidth={3} />
      <Circle cx={20} cy={25} r={3} fill="#6E6487" />
      <Rect x={18.6} y={25} width={2.8} height={6} rx={1.4} fill="#6E6487" />
    </Svg>
  );
}

export function CheckBadge({ size = 30 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 30 30">
      <Circle cx={15} cy={15} r={13.5} fill={COLORS.green} stroke="#FFFFFF" strokeWidth={3} />
      <Path d="M 8.5 15.5 L 13 20 L 21.5 10.5" stroke="#FFFFFF" strokeWidth={3.6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function ScorePill({ score }: { score: number }) {
  return (
    <View style={styles.pill}>
      <StarIcon size={20} />
      <Txt bold style={styles.pillText}>
        {score}
      </Txt>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 58,
    paddingHorizontal: 22,
    borderRadius: 22,
    borderBottomWidth: 6,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  pressed: { transform: [{ scale: 0.96 }], opacity: 0.92 },
  buttonText: { color: '#FFFFFF', fontSize: 22, lineHeight: 30 },
  round: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 4,
    borderBottomColor: '#E6D8B5',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.card,
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 20,
    borderBottomWidth: 4,
    borderBottomColor: '#E6D8B5',
  },
  pillText: { fontSize: 20, lineHeight: 28 },
});
