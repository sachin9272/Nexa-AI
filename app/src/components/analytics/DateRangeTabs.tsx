import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { DateRange } from '@/types/analytics.types';

interface DateRangeTabsProps {
  selectedRange: DateRange;
  onSelectRange: (range: DateRange) => void;
}

const ranges: { key: DateRange; label: string }[] = [
  { key: '7d', label: 'Last 7 Days' },
  { key: '30d', label: 'Last 30 Days' },
  { key: '90d', label: 'Last 90 Days' },
  { key: 'ytd', label: 'Year to Date' },
];

export const DateRangeTabs: React.FC<DateRangeTabsProps> = ({
  selectedRange,
  onSelectRange,
}) => {
  return (
    <View className="flex-row bg-surface-low mx-4 mt-1 rounded-lg p-1">
      {ranges.map((r) => {
        const isSelected = selectedRange === r.key;
        return (
          <TouchableOpacity
            key={r.key}
            activeOpacity={0.7}
            onPress={() => onSelectRange(r.key)}
            className={`flex-1 py-1.5 items-center rounded-md ${
              isSelected ? 'bg-surface-lowest shadow-sm' : ''
            }`}>
            <Text
              className={`text-[11px] font-semibold ${
                isSelected
                  ? 'text-primary-container font-bold'
                  : 'text-on-surface-variant'
              }`}>
              {r.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};
