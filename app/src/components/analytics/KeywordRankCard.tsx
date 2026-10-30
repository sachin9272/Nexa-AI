import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '@/constants/theme';
import { mockKeywords } from '@/data/mockData';

export const KeywordRankCard: React.FC = () => {
  return (
    <View className="bg-surface-lowest mx-4 mt-2 mb-8 p-4 rounded-2xl border border-border-subtle shadow-sm">
      <View className="flex-row items-center justify-between mb-2.5">
        <View className="flex-row items-center gap-1.5">
          <Ionicons
            name="search-circle"
            size={20}
            color={Theme.colors.primaryContainer}
          />
          <Text className="text-[15px] font-bold text-on-surface">
            Keyword Rank Tracker
          </Text>
        </View>
        <Text className="text-[11px] text-on-surface-variant font-medium">
          Local SEO Engine
        </Text>
      </View>

      <View className="bg-surface-low rounded-xl px-3">
        {mockKeywords.map((kw, index) => (
          <View
            key={kw.id}
            className={`flex-row items-center py-2.5 ${
              index !== mockKeywords.length - 1
                ? 'border-b border-border-subtle'
                : ''
            }`}>
            {/* Rank Bubble */}
            <View
              className={`w-8 h-8 rounded-lg items-center justify-center mr-2.5 ${
                kw.rank === 1 ? 'bg-secondary-container' : 'bg-surface-container'
              }`}>
              <Text
                className={`text-sm font-extrabold ${
                  kw.rank === 1
                    ? 'text-on-secondary-container'
                    : 'text-primary-container'
                }`}>
                #{kw.rank}
              </Text>
            </View>

            {/* Keyword Details */}
            <View className="flex-1">
              <Text className="text-[13px] font-bold text-on-surface">
                {kw.keyword}
              </Text>
              <View className="flex-row items-center mt-0.5 gap-1">
                <Text className="text-[11px] text-on-surface-variant">
                  {kw.searchVolume}
                </Text>
                <Text className="text-[10px] text-outline-variant">•</Text>
                <Text className="text-[11px] text-primary-container font-semibold">
                  {kw.category}
                </Text>
              </View>
            </View>

            {/* Climb Delta */}
            <View className="flex-row items-center bg-whatsapp-light px-1.5 py-0.5 rounded-full gap-0.5">
              <Ionicons
                name="arrow-up"
                size={12}
                color={Theme.colors.secondaryGrowth}
              />
              <Text className="text-[11px] font-bold text-whatsapp-dark">
                +{kw.rankChange}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};
