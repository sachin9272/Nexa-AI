import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '@/constants/theme';
import { ConversationItem } from '@/types/conversation.types';
import { Badge } from '@/components/common/Badge';

interface ConversationItemCardProps {
  item: ConversationItem;
  onPress?: () => void;
}

export const ConversationItemCard: React.FC<ConversationItemCardProps> = ({
  item,
  onPress,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      className="flex-row items-center bg-surface-lowest mx-4 my-1 p-3 rounded-xl border border-border-subtle shadow-sm">
      {/* Avatar */}
      <View className="w-11 h-11 rounded-full bg-surface-container items-center justify-center mr-2.5">
        <Text className="text-sm font-bold text-primary-container">
          {item.avatarText}
        </Text>
      </View>

      {/* Content */}
      <View className="flex-1">
        <View className="flex-row items-center justify-between">
          <Text className="text-sm font-bold text-on-surface">
            {item.patientName}
          </Text>
          <Text className="text-[11px] text-on-surface-variant">
            {item.timestamp}
          </Text>
        </View>

        <View className="flex-row items-center gap-1.5 my-1">
          <Badge
            label={item.statusLabel}
            variant={
              item.status === 'booked'
                ? 'whatsapp'
                : item.status === 'ai_active'
                ? 'ai'
                : 'neutral'
            }
          />
          <Text className="text-[11px] text-on-surface-variant flex-1" numberOfLines={1}>
            {item.treatment}
          </Text>
        </View>

        <Text className="text-xs text-on-surface-variant leading-tight" numberOfLines={2}>
          {item.lastMessage}
        </Text>
      </View>

      {/* Chevron or Unread Dot */}
      <View className="ml-2">
        {item.unreadCount ? (
          <View className="w-5 h-5 rounded-full bg-whatsapp items-center justify-center">
            <Text className="text-white text-[10px] font-bold">
              {item.unreadCount}
            </Text>
          </View>
        ) : (
          <Ionicons
            name="chevron-forward"
            size={16}
            color={Theme.colors.outlineVariant}
          />
        )}
      </View>
    </TouchableOpacity>
  );
};
