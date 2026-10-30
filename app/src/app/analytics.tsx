import React, { useState } from 'react';
import { ScrollView, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '@/constants/theme';
import { Header } from '@/components/common/Header';
import { DateRangeTabs } from '@/components/analytics/DateRangeTabs';
import { AutonomousImpactCard } from '@/components/analytics/AutonomousImpactCard';
import { KeywordRankCard } from '@/components/analytics/KeywordRankCard';
import { DateRange } from '@/types/analytics.types';

export default function GrowthAnalyticsScreen() {
  const [dateRange, setDateRange] = useState<DateRange>('30d');

  return (
    <View className="flex-1 bg-surface">
      <Header />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}>
        {/* Top Header Strip */}
        <View className="flex-row items-center justify-between px-4 pt-2 pb-1">
          <View>
            <Text className="text-lg font-extrabold text-on-surface tracking-tight">
              GBP Growth Engine
            </Text>
            <View className="flex-row items-center gap-1 mt-0.5">
              <Ionicons
                name="sparkles"
                size={12}
                color={Theme.colors.secondaryGrowth}
              />
              <Text className="text-[11px] font-bold text-secondary-growth">
                Rank #1 Copilot Active
              </Text>
            </View>
          </View>
          <View className="flex-row items-center gap-1 bg-surface-low px-2 py-1 rounded-full">
            <View className="w-1.5 h-1.5 rounded-full bg-whatsapp" />
            <Text className="text-[10px] font-bold text-on-surface-variant">
              Live Data
            </Text>
          </View>
        </View>

        {/* Date Range Selector */}
        <DateRangeTabs
          selectedRange={dateRange}
          onSelectRange={setDateRange}
        />

        {/* Autonomous Impact Card */}
        <AutonomousImpactCard />

        {/* Local SEO Keyword Rankings */}
        <KeywordRankCard />
      </ScrollView>
    </View>
  );
}
