import React from 'react';
import { ScrollView, View, Text, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '@/components/common/Header';
import { CampaignStatsGrid } from '@/components/campaigns/CampaignStatsGrid';
import { AiCampaignAlert } from '@/components/campaigns/AiCampaignAlert';
import { CampaignCard } from '@/components/campaigns/CampaignCard';
import { mockCampaigns } from '@/data/mockData';

export default function WhatsAppCampaignsScreen() {
  const handleApprove = (title: string) => {
    Alert.alert('Campaign Approved', `“${title}” has been scheduled for automated broadcast.`);
  };

  const handlePreview = (title: string) => {
    Alert.alert('Campaign Preview', `Opening message preview & recipient segment for “${title}”`);
  };

  return (
    <View className="flex-1 bg-surface">
      <Header />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}>
        {/* Meta Verified API Banner */}
        <View className="flex-row items-center justify-between bg-surface-lowest mx-4 mt-2 px-3 py-2 rounded-xl border border-border-subtle shadow-sm">
          <View className="flex-row items-center gap-1 bg-sky-100 px-2 py-0.5 rounded-full">
            <Ionicons name="shield-checkmark" size={14} color="#0284C7" />
            <Text className="text-[10px] font-extrabold text-sky-800">
              Meta Verified API
            </Text>
          </View>
          <Text className="text-[11px] text-on-surface-variant font-medium">
            Official WhatsApp Cloud Business Pipeline
          </Text>
        </View>

        {/* Campaign Performance Telemetry */}
        <CampaignStatsGrid />

        {/* AI Recommendations Alert */}
        <AiCampaignAlert />

        {/* Campaigns List */}
        <View className="mt-4">
          <View className="flex-row items-center justify-between px-4 mb-1.5">
            <Text className="text-[15px] font-bold text-on-surface">
              Curated Campaigns
            </Text>
            <Text className="text-[11px] text-on-surface-variant font-medium">
              {mockCampaigns.length} Active Blasts
            </Text>
          </View>

          {mockCampaigns.map((camp) => (
            <CampaignCard
              key={camp.id}
              campaign={camp}
              onApprove={() => handleApprove(camp.title)}
              onPreview={() => handlePreview(camp.title)}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
