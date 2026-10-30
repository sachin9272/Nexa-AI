import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '@/constants/theme';

export const AiStatusBar: React.FC = () => {
  return (
    <View className="flex-row items-center justify-between bg-surface-lowest mx-4 mt-2 p-3 rounded-xl border border-border-subtle shadow-sm">
      <View className="flex-row items-center flex-1 mr-2">
        <View className="w-8 h-8 rounded-full bg-whatsapp-light items-center justify-center mr-2.5">
          <Ionicons
            name="hardware-chip-outline"
            size={16}
            color={Theme.colors.whatsappGreen}
          />
        </View>
        <View>
          <View className="flex-row items-center gap-1.5">
            <Text className="text-[13px] font-bold text-on-surface">
              AI Auto-Reply Active
            </Text>
            <View className="w-1.5 h-1.5 rounded-full bg-whatsapp" />
          </View>
          <Text className="text-[11px] text-on-surface-variant mt-0.5">
            Auto-handling 95% of queries • 3 in doctor review
          </Text>
        </View>
      </View>

      <View className="flex-row items-center gap-1 bg-surface-low px-2 py-1 rounded-full">
        <Ionicons
          name="shield-checkmark"
          size={12}
          color={Theme.colors.primaryContainer}
        />
        <Text className="text-[10px] font-bold text-primary-container">
          Guarded
        </Text>
      </View>
    </View>
  );
};
