import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '@/constants/theme';

export type ButtonVariant = 'primary' | 'secondary' | 'whatsapp' | 'purple' | 'ghost';

interface ActionButtonProps {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  icon?: keyof typeof Ionicons.glyphMap;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

export const ActionButton: React.FC<ActionButtonProps> = ({
  label,
  onPress,
  variant = 'primary',
  icon,
  loading = false,
  style,
  textStyle,
  fullWidth = false,
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          containerClass: 'bg-primary-container',
          textClass: 'text-white',
          textColor: Theme.colors.onPrimary,
          bgColor: Theme.colors.primaryContainer,
          border: 'transparent',
        };
      case 'secondary':
        return {
          containerClass: 'bg-surface-low border border-border-subtle',
          textClass: 'text-on-surface',
          textColor: Theme.colors.onSurface,
          bgColor: Theme.colors.surfaceContainerLow,
          border: Theme.colors.borderSubtle,
        };
      case 'whatsapp':
        return {
          containerClass: 'bg-whatsapp',
          textClass: 'text-white',
          textColor: '#FFFFFF',
          bgColor: Theme.colors.whatsappGreen,
          border: 'transparent',
        };
      case 'purple':
        return {
          containerClass: 'bg-ai-purple',
          textClass: 'text-white',
          textColor: '#FFFFFF',
          bgColor: Theme.colors.aiPurple,
          border: 'transparent',
        };
      case 'ghost':
        return {
          containerClass: 'bg-transparent border border-border-medium',
          textClass: 'text-primary-container',
          textColor: Theme.colors.primaryContainer,
          bgColor: 'transparent',
          border: Theme.colors.borderMedium,
        };
      default:
        return {
          containerClass: 'bg-primary-container',
          textClass: 'text-white',
          textColor: Theme.colors.onPrimary,
          bgColor: Theme.colors.primaryContainer,
          border: 'transparent',
        };
    }
  };

  const config = getVariantStyles();

  return (
    <TouchableOpacity
      activeOpacity={0.82}
      onPress={onPress}
      disabled={loading}
      className={`h-11 rounded-lg flex-row items-center justify-center px-3.5 ${fullWidth ? 'flex-1' : ''} ${config.containerClass}`}
      style={[
        {
          backgroundColor: config.bgColor,
          borderColor: config.border !== 'transparent' ? config.border : undefined,
          borderWidth: config.border !== 'transparent' ? 1 : 0,
        },
        style,
      ]}>
      {loading ? (
        <ActivityIndicator size="small" color={config.textColor} />
      ) : (
        <>
          {icon && (
            <Ionicons
              name={icon}
              size={16}
              color={config.textColor}
              style={{ marginRight: 6 }}
            />
          )}
          <Text
            className={`text-[13px] font-semibold tracking-tight ${config.textClass}`}
            style={[{ color: config.textColor }, textStyle]}>
            {label}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};
