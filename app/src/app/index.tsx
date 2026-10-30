import React, { useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  RefreshControl,
  Alert,
} from 'react-native';
import { Theme } from '@/constants/theme';
import { Header } from '@/components/common/Header';
import { GreetingBanner } from '@/components/dashboard/GreetingBanner';
import { HeroRoiCard } from '@/components/dashboard/HeroRoiCard';
import { QuickActionsBar } from '@/components/dashboard/QuickActionsBar';
import { AgentCard } from '@/components/dashboard/AgentCard';
import { LiveStreamFeed } from '@/components/dashboard/LiveStreamFeed';
import { mockAgents } from '@/data/mockData';

export default function AgentsDashboardScreen() {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const handleActionPress = (actionId: string) => {
    Alert.alert('AI Agent Action Triggered', `Triggered: ${actionId}`);
  };

  const handleAgentButtonPress = (agentTitle: string, buttonLabel: string) => {
    Alert.alert(agentTitle, `Action: ${buttonLabel}`);
  };

  return (
    <View className="flex-1 bg-surface">
      <Header
        onNotificationPress={() => Alert.alert('Notifications', 'You have 3 unread lead events')}
        onClinicChangePress={() => Alert.alert('Clinic Switcher', 'Switch clinic location')}
        onProfilePress={() => Alert.alert('Doctor Profile', 'Dr. Priya • Chief Medical Director')}
      />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={Theme.colors.primaryContainer}
          />
        }>
        {/* Top Greeting */}
        <GreetingBanner onSyncPress={handleRefresh} />

        {/* AI ROI Impact Hero Card */}
        <HeroRoiCard />

        {/* Quick Growth Action Chips */}
        <QuickActionsBar onActionPress={handleActionPress} />

        {/* 3 AI Marketing Agents Section */}
        <View className="px-4 mt-4">
          <View className="flex-row items-center justify-between mb-2">
            <View className="flex-row items-center gap-1.5">
              <Text className="text-[17px] font-bold text-on-surface">
                Your 3 AI Marketing Agents
              </Text>
              <View className="w-5 h-5 rounded-full bg-secondary-container items-center justify-center">
                <Text className="text-[11px] font-extrabold text-on-secondary-container">
                  {mockAgents.length}
                </Text>
              </View>
            </View>
            <Text className="text-[11px] font-bold text-secondary-growth uppercase tracking-wider">
              All Active
            </Text>
          </View>

          <View className="gap-3">
            {mockAgents.map((agent) => (
              <AgentCard
                key={agent.id}
                agent={agent}
                onButtonPress={(btn) => handleAgentButtonPress(agent.title, btn)}
              />
            ))}
          </View>
        </View>

        {/* Live Autonomous Activity Feed */}
        <LiveStreamFeed />
      </ScrollView>
    </View>
  );
}
