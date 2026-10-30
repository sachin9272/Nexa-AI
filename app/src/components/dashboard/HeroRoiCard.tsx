import React from 'react';
import { View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '@/constants/theme';
import { mockRoiHeroData } from '@/data/mockData';

export const HeroRoiCard: React.FC = () => {
  return (
    <View className="px-4 mt-2">
      <LinearGradient
        colors={['#004328', '#0D5C3A', '#134E4A']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="rounded-2xl p-4 relative overflow-hidden shadow-lg shadow-primary-container/20">
        {/* Floating Copilot Tag */}
        <View className="absolute top-3 right-3 flex-row items-center bg-white/15 px-2 py-0.5 rounded-full gap-1">
          <Ionicons
            name="sparkles"
            size={12}
            color={Theme.colors.secondaryFixed}
          />
          <Text className="text-white text-[10px] font-bold tracking-tight">
            Live ROI Copilot
          </Text>
        </View>

        {/* Header Metric */}
        <View className="mt-1">
          <Text className="text-primary-fixed text-[10px] font-bold tracking-wider uppercase">
            TOTAL VALUE GENERATED {mockRoiHeroData.timeframe}
          </Text>
          <View className="flex-row items-baseline gap-2 mt-1">
            <Text className="text-white text-3xl font-extrabold tracking-tight">
              {mockRoiHeroData.totalValue}
            </Text>
            <View className="flex-row items-center bg-secondary-container px-1.5 py-0.5 rounded-full gap-0.5">
              <Ionicons
                name="trending-up"
                size={12}
                color={Theme.colors.onSecondaryContainer}
              />
              <Text className="text-on-secondary-container text-[11px] font-bold">
                {mockRoiHeroData.growthPercent}
              </Text>
            </View>
          </View>
        </View>

        {/* Dual Metric Pods */}
        <View className="flex-row gap-2 mt-3 pt-3 border-t border-white/20">
          {/* Pod 1: Google Calls */}
          <View className="flex-1 bg-white/10 rounded-xl p-2.5">
            <View className="flex-row items-center gap-1">
              <Ionicons
                name="call"
                size={14}
                color={Theme.colors.warningAmber}
              />
              <Text className="text-white/85 text-[11px] font-semibold">
                Google Calls
              </Text>
            </View>
            <View className="flex-row items-baseline gap-1 mt-1">
              <Text className="text-white text-lg font-bold">
                {mockRoiHeroData.callsCount}
              </Text>
              <Text className="text-secondary-fixed text-[11px] font-bold">
                ({mockRoiHeroData.callsGrowth})
              </Text>
            </View>
            <Text className="text-white/70 text-[10px] mt-0.5">
              {mockRoiHeroData.callsSubtext}
            </Text>
          </View>

          {/* Pod 2: WhatsApp Bookings */}
          <View className="flex-1 bg-white/10 rounded-xl p-2.5">
            <View className="flex-row items-center gap-1">
              <Ionicons
                name="chatbubble-ellipses"
                size={14}
                color={Theme.colors.whatsappGreen}
              />
              <Text className="text-white/85 text-[11px] font-semibold">
                WA Bookings
              </Text>
            </View>
            <View className="flex-row items-baseline gap-1 mt-1">
              <Text className="text-white text-lg font-bold">
                {mockRoiHeroData.waBookings}
              </Text>
              <Text className="text-secondary-fixed text-[11px] font-semibold">
                {mockRoiHeroData.waStatus}
              </Text>
            </View>
            <Text className="text-white/70 text-[10px] mt-0.5">
              {mockRoiHeroData.waSubtext}
            </Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
};
