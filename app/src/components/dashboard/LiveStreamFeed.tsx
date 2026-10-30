import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '@/constants/theme';
import { mockLiveStream } from '@/data/mockData';

export const LiveStreamFeed: React.FC = () => {
  return (
    <View className="px-4 mt-5 mb-8">
      {/* Feed Header */}
      <View className="flex-row items-center justify-between mb-2">
        <View className="flex-row items-center gap-1.5">
          <Ionicons
            name="flash"
            size={18}
            color={Theme.colors.secondaryGrowth}
          />
          <Text className="text-base font-bold text-on-surface">
            Live Agent Stream
          </Text>
        </View>
        <Text className="text-[11px] text-on-surface-variant font-semibold">
          Real-time sync
        </Text>
      </View>

      {/* Timeline List */}
      <View className="bg-surface-lowest rounded-2xl p-3 border border-border-subtle shadow-sm">
        {mockLiveStream.map((item, index) => (
          <View
            key={item.id}
            className={`flex-row items-start py-2.5 ${
              index !== mockLiveStream.length - 1
                ? 'border-b border-surface-subtle'
                : 'pb-0.5'
            }`}>
            <View
              className="w-8 h-8 rounded-full items-center justify-center mr-2.5 mt-0.5"
              style={{ backgroundColor: item.iconBg }}>
              <Ionicons
                name={item.icon as any}
                size={14}
                color={item.iconColor}
              />
            </View>

            <View className="flex-1">
              <View className="flex-row items-center justify-between">
                <Text className="text-[13px] font-bold text-on-surface">
                  {item.title}
                </Text>
                <Text className="text-[10px] text-on-surface-variant">
                  {item.timeAgo}
                </Text>
              </View>
              <Text
                className="text-xs text-on-surface-variant mt-0.5 leading-relaxed"
                numberOfLines={2}>
                {item.description}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};
