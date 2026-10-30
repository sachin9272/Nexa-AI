import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '@/constants/theme';
import { mockClinicProfile } from '@/data/mockData';

interface GreetingBannerProps {
  onSyncPress?: () => void;
}

export const GreetingBanner: React.FC<GreetingBannerProps> = ({ onSyncPress }) => {
  return (
    <View className="flex-row items-center justify-between px-4 pt-4 pb-2">
      <View className="flex-1 pr-2">
        <Text className="text-xl font-bold text-on-surface tracking-tight">
          Good morning, {mockClinicProfile.doctorName}! 👋
        </Text>
        <View className="flex-row items-center mt-1">
          <View className="w-2 h-2 rounded-full bg-whatsapp mr-1.5" />
          <Text className="text-xs text-on-surface-variant font-medium">
            {mockClinicProfile.name} • {mockClinicProfile.agentCount} Agents Running autonomously
          </Text>
        </View>
      </View>

      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onSyncPress}
        className="w-9 h-9 rounded-xl bg-surface-container items-center justify-center">
        <Ionicons name="sync" size={18} color={Theme.colors.primaryContainer} />
      </TouchableOpacity>
    </View>
  );
};
