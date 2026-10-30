import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '@/constants/theme';
import { mockCampaignSummary } from '@/data/mockData';

export const CampaignStatsGrid: React.FC = () => {
  return (
    <View className="px-4 mt-2">
      <View className="flex-row flex-wrap gap-2">
        {/* Metric 1 */}
        <View className="flex-1 min-w-[47%] bg-surface-lowest p-3 rounded-xl border border-border-subtle shadow-sm">
          <View className="flex-row items-center gap-1">
            <Ionicons
              name="cash-outline"
              size={14}
              color={Theme.colors.secondaryGrowth}
            />
            <Text className="text-[11px] text-on-surface-variant font-semibold">
              Total Revenue
            </Text>
          </View>
          <Text className="text-lg font-extrabold text-on-surface mt-1">
            {mockCampaignSummary.totalRevenue}
          </Text>
          <Text className="text-[10px] font-bold text-secondary-growth mt-0.5">
            {mockCampaignSummary.roiMultiple}
          </Text>
        </View>

        {/* Metric 2 */}
        <View className="flex-1 min-w-[47%] bg-surface-lowest p-3 rounded-xl border border-border-subtle shadow-sm">
          <View className="flex-row items-center gap-1">
            <Ionicons
              name="people-outline"
              size={14}
              color={Theme.colors.tertiary}
            />
            <Text className="text-[11px] text-on-surface-variant font-semibold">
              Audience Pool
            </Text>
          </View>
          <Text className="text-lg font-extrabold text-on-surface mt-1">
            {mockCampaignSummary.audiencePool}
          </Text>
          <Text className="text-[10px] text-on-surface-variant mt-0.5">
            Opted-in WA leads
          </Text>
        </View>

        {/* Metric 3 */}
        <View className="flex-1 min-w-[47%] bg-surface-lowest p-3 rounded-xl border border-border-subtle shadow-sm">
          <View className="flex-row items-center gap-1">
            <Ionicons
              name="checkmark-done"
              size={14}
              color={Theme.colors.whatsappGreen}
            />
            <Text className="text-[11px] text-on-surface-variant font-semibold">
              Open Rate
            </Text>
          </View>
          <Text className="text-lg font-extrabold text-on-surface mt-1">
            {mockCampaignSummary.openRate}
          </Text>
          <Text className="text-[10px] font-bold text-secondary-growth mt-0.5">
            Industry High
          </Text>
        </View>

        {/* Metric 4 */}
        <View className="flex-1 min-w-[47%] bg-surface-lowest p-3 rounded-xl border border-border-subtle shadow-sm">
          <View className="flex-row items-center gap-1">
            <Ionicons
              name="trending-up"
              size={14}
              color={Theme.colors.aiPurple}
            />
            <Text className="text-[11px] text-on-surface-variant font-semibold">
              Conversion
            </Text>
          </View>
          <Text className="text-lg font-extrabold text-on-surface mt-1">
            {mockCampaignSummary.conversionRate}
          </Text>
          <Text className="text-[10px] font-bold text-secondary-growth mt-0.5">
            +6.4% MoM
          </Text>
        </View>
      </View>
    </View>
  );
};
