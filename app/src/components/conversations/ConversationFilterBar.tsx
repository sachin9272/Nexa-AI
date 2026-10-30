import React from 'react';
import { ScrollView, TouchableOpacity, Text, View } from 'react-native';
import { ConversationFilter } from '@/types/conversation.types';

interface FilterOption {
  key: ConversationFilter;
  label: string;
  count: number;
  highlight?: boolean;
}

const filterOptions: FilterOption[] = [
  { key: 'all', label: 'All', count: 42 },
  { key: 'ai', label: 'Handled by AI', count: 38 },
  { key: 'attention', label: 'Needs Attention', count: 3, highlight: true },
  { key: 'booked', label: 'Booked Today', count: 11 },
];

interface ConversationFilterBarProps {
  activeFilter: ConversationFilter;
  onSelectFilter: (filter: ConversationFilter) => void;
}

export const ConversationFilterBar: React.FC<ConversationFilterBarProps> = ({
  activeFilter,
  onSelectFilter,
}) => {
  return (
    <View className="my-2">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
        {filterOptions.map((opt) => {
          const isSelected = activeFilter === opt.key;
          return (
            <TouchableOpacity
              key={opt.key}
              activeOpacity={0.7}
              onPress={() => onSelectFilter(opt.key)}
              className={`flex-row items-center px-3 py-1.5 rounded-full border gap-1.5 ${
                isSelected
                  ? 'bg-primary-container border-primary-container'
                  : opt.highlight
                  ? 'bg-warning-amber-light border-warning-amber'
                  : 'bg-surface-lowest border-border-subtle'
              }`}>
              <Text
                className={`text-xs font-semibold ${
                  isSelected
                    ? 'text-white'
                    : opt.highlight
                    ? 'text-amber-900'
                    : 'text-on-surface-variant'
                }`}>
                {opt.label}
              </Text>
              <View
                className={`px-1.5 py-0.5 rounded-full ${
                  isSelected
                    ? 'bg-white/25'
                    : opt.highlight
                    ? 'bg-amber-200'
                    : 'bg-surface-low'
                }`}>
                <Text
                  className={`text-[10px] font-bold ${
                    isSelected
                      ? 'text-white'
                      : opt.highlight
                      ? 'text-amber-900'
                      : 'text-on-surface-variant'
                  }`}>
                  {opt.count}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};
