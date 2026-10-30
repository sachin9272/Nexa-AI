import React from 'react';
import { ScrollView, TouchableOpacity, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { mockQuickActions } from '@/data/mockData';

interface QuickActionsBarProps {
  onActionPress?: (actionId: string) => void;
}

export const QuickActionsBar: React.FC<QuickActionsBarProps> = ({
  onActionPress,
}) => {
  return (
    <View className="my-2">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
        {mockQuickActions.map((action) => (
          <TouchableOpacity
            key={action.id}
            activeOpacity={0.75}
            onPress={() => onActionPress?.(action.id)}
            className="flex-row items-center bg-surface-lowest px-3 py-2.5 rounded-xl border border-border-subtle shadow-sm">
            <Ionicons
              name={action.icon as any}
              size={16}
              color={action.color}
              style={{ marginRight: 6 }}
            />
            <Text className="text-[13px] font-semibold text-on-surface">
              {action.title}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};
