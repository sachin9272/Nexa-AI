import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '@/constants/theme';

export type BadgeVariant =
  | 'autopilot'
  | 'active'
  | 'scheduled'
  | 'warning'
  | 'whatsapp'
  | 'ai'
  | 'neutral'
  | 'growth';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  icon?: keyof typeof Ionicons.glyphMap;
  showDot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'neutral',
  icon,
  showDot = false,
}) => {
  const getStyles = () => {
    switch (variant) {
      case 'autopilot':
      case 'growth':
        return {
          containerClass: 'bg-secondary-container',
          textClass: 'text-secondary-dark',
          textColor: Theme.colors.onSecondaryContainer,
          dotColor: Theme.colors.secondaryGrowth,
        };
      case 'active':
      case 'whatsapp':
        return {
          containerClass: 'bg-whatsapp-light',
          textClass: 'text-whatsapp-dark',
          textColor: Theme.colors.whatsappGreenDark,
          dotColor: Theme.colors.whatsappGreen,
        };
      case 'scheduled':
      case 'ai':
        return {
          containerClass: 'bg-ai-purple-light',
          textClass: 'text-ai-purple-dark',
          textColor: Theme.colors.aiPurpleDark,
          dotColor: Theme.colors.aiPurple,
        };
      case 'warning':
        return {
          containerClass: 'bg-warning-amber-light',
          textClass: 'text-amber-800',
          textColor: '#92400E',
          dotColor: Theme.colors.warningAmber,
        };
      default:
        return {
          containerClass: 'bg-surface-low',
          textClass: 'text-on-surface-variant',
          textColor: Theme.colors.onSurfaceVariant,
          dotColor: Theme.colors.outline,
        };
    }
  };

  const styleConfig = getStyles();

  return (
    <View
      className={`flex-row items-center px-2 py-0.5 rounded-full self-start ${styleConfig.containerClass}`}
      style={{ backgroundColor: variant === 'autopilot' || variant === 'growth' ? Theme.colors.secondaryContainer : undefined }}>
      {showDot && (
        <View
          className="w-1.5 h-1.5 rounded-full mr-1.5"
          style={{ backgroundColor: styleConfig.dotColor }}
        />
      )}
      {icon && (
        <Ionicons
          name={icon}
          size={12}
          color={styleConfig.textColor}
          style={{ marginRight: 4 }}
        />
      )}
      <Text
        className="text-[11px] font-bold tracking-tight"
        style={{ color: styleConfig.textColor }}>
        {label}
      </Text>
    </View>
  );
};
