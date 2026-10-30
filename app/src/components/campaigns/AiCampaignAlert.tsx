import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '@/constants/theme';

export const AiCampaignAlert: React.FC = () => {
  return (
    <View className="bg-ai-purple-light mx-4 mt-2 p-3 rounded-xl border border-purple-200">
      <View className="flex-row items-center gap-1.5 mb-1">
        <Ionicons name="sparkles" size={14} color={Theme.colors.aiPurple} />
        <Text className="text-[13px] font-bold text-ai-purple-dark">
          2 Campaigns Ready for Approval
        </Text>
      </View>
      <Text className="text-xs text-purple-900 leading-relaxed">
        Grexa AI analyzed calendar festivals & customer churn gaps to curate these high-yield blasts.
      </Text>
    </View>
  );
};
