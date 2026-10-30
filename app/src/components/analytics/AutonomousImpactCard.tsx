import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '@/constants/theme';
import { mockAnalyticsSummary } from '@/data/mockData';

export const AutonomousImpactCard: React.FC = () => {
  return (
    <View className="bg-surface-lowest mx-4 mt-2 p-4 rounded-2xl border border-border-subtle shadow-md">
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center gap-1.5">
          <Ionicons
            name="trending-up"
            size={18}
            color={Theme.colors.secondaryGrowth}
          />
          <Text className="text-base font-bold text-on-surface">
            Autonomous Impact
          </Text>
        </View>
        <View className="bg-secondary-container px-2 py-0.5 rounded-full">
          <Text className="text-[10px] font-bold text-on-secondary-container">
            Grexa Autopilot ON
          </Text>
        </View>
      </View>

      {/* Main Metric: Calls Climb */}
      <View className="bg-surface-low p-3 rounded-xl mb-3">
        <Text className="text-[11px] text-on-surface-variant font-semibold">
          Direct Calls from Google Search & Maps
        </Text>
        <View className="flex-row items-center gap-2 my-1">
          <Text className="text-xl font-bold text-on-surface-variant">
            {mockAnalyticsSummary.callsOriginal}
          </Text>
          <Ionicons
            name="arrow-forward"
            size={18}
            color={Theme.colors.onSurfaceVariant}
          />
          <Text className="text-2xl font-extrabold text-on-surface">
            {mockAnalyticsSummary.callsCurrent}
          </Text>
          <View className="bg-whatsapp px-2 py-0.5 rounded-full">
            <Text className="text-white text-xs font-extrabold">
              +{mockAnalyticsSummary.growthPercent}%
            </Text>
          </View>
        </View>
        <Text className="text-[11px] text-on-surface-variant">
          In past 4 months since activating GBP AI
        </Text>
      </View>

      {/* Bottom Dual Telemetry */}
      <View className="flex-row gap-2.5">
        {/* Attributed Revenue */}
        <View className="flex-1 bg-surface-low p-2.5 rounded-xl">
          <Text className="text-[11px] text-on-surface-variant">
            Attributed Revenue
          </Text>
          <Text className="text-base font-extrabold text-secondary-growth mt-0.5">
            {mockAnalyticsSummary.attributedRevenue}
          </Text>
          <Text className="text-[10px] text-on-surface-variant mt-0.5">
            From {mockAnalyticsSummary.bookedConsults} booked consults
          </Text>
        </View>

        {/* Review Standing */}
        <View className="flex-1 bg-surface-low p-2.5 rounded-xl">
          <Text className="text-[11px] text-on-surface-variant">
            GBP Review Standing
          </Text>
          <View className="flex-row items-center gap-1 mt-0.5">
            <Text className="text-base font-extrabold text-on-surface">
              {mockAnalyticsSummary.avgRating}
            </Text>
            <Ionicons name="star" size={14} color="#F59E0B" />
            <Text className="text-[11px] font-bold text-secondary-growth">
              +{mockAnalyticsSummary.reviewsClimbedMonthly} mo
            </Text>
          </View>
          <Text className="text-[10px] text-on-surface-variant mt-0.5">
            {mockAnalyticsSummary.totalReviews} Total reviews audited
          </Text>
        </View>
      </View>
    </View>
  );
};
