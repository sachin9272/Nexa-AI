import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ConversationItem } from '@/types/conversation.types';
import { ActionButton } from '@/components/common/ActionButton';

interface UrgentAlertCardProps {
  item: ConversationItem;
  onTakeover?: () => void;
  onReview?: () => void;
}

export const UrgentAlertCard: React.FC<UrgentAlertCardProps> = ({
  item,
  onTakeover,
  onReview,
}) => {
  return (
    <View className="bg-surface-lowest mx-4 mt-1 mb-2 p-4 rounded-2xl border-2 border-amber-200 shadow-md">
      {/* Alert Header */}
      <View className="flex-row items-center justify-between mb-2.5">
        <View className="flex-row items-center bg-amber-100 px-2 py-0.5 rounded-full">
          <Ionicons
            name="warning"
            size={13}
            color="#B45309"
            style={{ marginRight: 4 }}
          />
          <Text className="text-[11px] font-bold text-amber-800">
            Action Required • Lead Pending
          </Text>
        </View>
        <Text className="text-[11px] text-on-surface-variant">
          {item.timestamp}
        </Text>
      </View>

      {/* Patient & Request */}
      <View className="flex-row items-center gap-2.5 mb-2">
        <View className="w-9 h-9 rounded-full bg-amber-100 items-center justify-center">
          <Text className="text-sm font-bold text-amber-800">
            {item.avatarText}
          </Text>
        </View>
        <View className="flex-1">
          <Text className="text-sm font-bold text-on-surface">
            {item.patientName}
          </Text>
          <Text className="text-[11px] text-on-surface-variant">
            {item.phone}
          </Text>
        </View>
      </View>

      <Text className="text-xs text-on-surface leading-relaxed bg-surface-low p-2.5 rounded-xl mb-3">
        {item.lastMessage}
      </Text>

      {/* Action Buttons */}
      <View className="flex-row gap-2">
        <ActionButton
          label="Take Over Chat"
          variant="primary"
          icon="headset"
          fullWidth
          onPress={onTakeover}
        />
        <ActionButton
          label="Review"
          variant="secondary"
          icon="eye-outline"
          fullWidth
          onPress={onReview}
        />
      </View>
    </View>
  );
};
