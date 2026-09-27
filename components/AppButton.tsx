import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { COLORS } from '@/constants/colors';

type Props = {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  theme?: 'primary';
  onPress: () => void;
  disabled?: boolean;
};

export default function AppButton({ title, icon, theme, onPress, disabled = false }: Props) {
  const isPrimary = theme === 'primary';

  return (
    <View style={styles.buttonOuter}>
      <Pressable
        style={[
          styles.buttonInner,
          isPrimary ? styles.primaryFill : styles.secondaryFill,
          disabled && styles.disabledFill,
        ]}
        onPress={onPress}
        disabled={disabled}
      >
        <Ionicons
          name={icon}
          size={22}
          color={
            disabled
              ? COLORS.textSecondary
              : isPrimary
                ? COLORS.textOnPrimary
                : COLORS.textSecondary
          }
          style={styles.icon}
        />
        <Text
          style={[
            styles.label,
            isPrimary && styles.labelPrimary,
            { color: disabled ? COLORS.textSecondary : isPrimary ? COLORS.textOnPrimary : COLORS.textPrimary },
          ]}
        >
          {title}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  buttonOuter: {
    width: '100%',
    marginBottom: 14,
  },
  buttonInner: {
    borderRadius: 10,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  primaryFill: {
    backgroundColor: COLORS.primary,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  secondaryFill: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  disabledFill: {
    opacity: 0.7,
  },
  icon: { paddingRight: 10 },
  label: { fontSize: 17, fontWeight: '600', color: COLORS.textPrimary },
  labelPrimary: { fontWeight: '700' },
});
