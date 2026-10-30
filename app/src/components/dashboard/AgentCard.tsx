import React from 'react';
import { View, Text, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '@/constants/theme';
import { Agent } from '@/types/agent.types';
import { Badge } from '@/components/common/Badge';
import { ActionButton } from '@/components/common/ActionButton';

interface AgentCardProps {
  agent: Agent;
  onButtonPress?: (buttonLabel: string) => void;
}

export const AgentCard: React.FC<AgentCardProps> = ({ agent, onButtonPress }) => {
  return (
    <View className="bg-surface-lowest rounded-2xl p-4 border border-border-subtle gap-3 shadow-sm">
      {/* Agent Header */}
      <View className="flex-row items-start justify-between">
        <View className="flex-row items-center flex-1 mr-2">
          <View className="w-10 h-10 rounded-xl bg-surface-low items-center justify-center mr-2.5">
            <Ionicons
              name={agent.icon as any}
              size={22}
              color={agent.iconColor}
            />
          </View>
          <View className="flex-1">
            <Text className="text-[15px] font-bold text-on-surface">
              {agent.title}
            </Text>
            <Text className="text-xs text-on-surface-variant mt-0.5">
              {agent.subtitle}
            </Text>
          </View>
        </View>

        <Badge
          label={agent.statusLabel}
          variant={
            agent.status === 'autopilot'
              ? 'autopilot'
              : agent.status === 'active'
              ? 'whatsapp'
              : agent.status === 'scheduled'
              ? 'ai'
              : 'neutral'
          }
          showDot
        />
      </View>

      {/* Specific Content: Metric Callout (GBP) */}
      {agent.metricCallout && (
        <View className="flex-row items-center justify-between bg-surface-low rounded-xl p-2.5">
          <View className="flex-row items-center flex-1 mr-2">
            {agent.metricCallout.climbBadge && (
              <View className="w-7 h-7 rounded-lg bg-surface-lowest items-center justify-center mr-2 shadow-xs">
                <Text className="text-xs font-extrabold text-secondary-growth">
                  {agent.metricCallout.climbBadge}
                </Text>
              </View>
            )}
            <View className="flex-1">
              <Text className="text-xs font-semibold text-on-surface">
                {agent.metricCallout.highlight}
              </Text>
              <Text className="text-[11px] font-bold text-secondary-growth mt-0.5">
                {agent.metricCallout.subtext}
              </Text>
            </View>
          </View>
          <Ionicons
            name="checkmark-circle"
            size={18}
            color={Theme.colors.secondaryGrowth}
          />
        </View>
      )}

      {/* Specific Content: Booking Metrics Strip (Chat AI) */}
      {agent.bookingMetrics && (
        <View className="flex-row gap-2">
          <View className="flex-1 bg-surface-low p-2.5 rounded-xl">
            <Text className="text-[11px] text-on-surface-variant font-medium">
              Today's Bookings
            </Text>
            <Text className="text-[15px] font-extrabold text-on-surface mt-0.5">
              {agent.bookingMetrics.todayBookings}
            </Text>
            <Text className="text-[11px] font-semibold text-whatsapp mt-0.5">
              {agent.bookingMetrics.fillRate}
            </Text>
          </View>
          <View className="flex-1 bg-surface-low p-2.5 rounded-xl">
            <Text className="text-[11px] text-on-surface-variant font-medium">
              Drop-off Rate
            </Text>
            <Text className="text-[15px] font-extrabold text-secondary-growth mt-0.5">
              {agent.bookingMetrics.dropOff}
            </Text>
            <Text className="text-[11px] text-on-surface-variant mt-0.5">
              {agent.bookingMetrics.subNote}
            </Text>
          </View>
        </View>
      )}

      {/* Logs / Autonomous Activities */}
      {agent.logs.length > 0 && (
        <View className="gap-1.5">
          {agent.logs.map((log, index) => (
            <View key={index} className="flex-row items-start">
              <Ionicons
                name={log.icon as any}
                size={14}
                color={Theme.colors.primaryContainer}
                style={{ marginTop: 2, marginRight: 6 }}
              />
              <Text className="text-xs text-on-surface-variant flex-1 leading-relaxed">
                {log.text}
                {log.boldText && (
                  <Text className="font-bold text-on-surface">{log.boldText}</Text>
                )}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Preview Card */}
      {agent.previewCard && (
        <View className="flex-row items-center bg-surface-low rounded-xl p-2 gap-2.5">
          <Image
            source={{ uri: agent.previewCard.imageUri }}
            className="w-11 h-11 rounded-lg bg-surface-container"
          />
          <View className="flex-1">
            <Text className="text-xs font-semibold text-on-surface" numberOfLines={1}>
              {agent.previewCard.title}
            </Text>
            <Text className="text-[11px] text-on-surface-variant mt-0.5" numberOfLines={1}>
              {agent.previewCard.subtext}
            </Text>
          </View>
        </View>
      )}

      {/* Revenue Attribution (Marketing AI) */}
      {agent.revenueAttribution && (
        <View className="flex-row items-center justify-between px-0.5">
          <Text className="text-xs text-on-surface-variant font-medium">
            Last Campaign Revenue:
          </Text>
          <Text className="text-xs font-bold text-secondary-growth">
            {agent.revenueAttribution}
          </Text>
        </View>
      )}

      {/* Action Buttons Grid */}
      <View className="flex-row gap-2 mt-0.5">
        {agent.buttons.map((btn, index) => (
          <ActionButton
            key={index}
            label={btn.label}
            variant={btn.variant}
            icon={btn.icon as any}
            fullWidth
            onPress={() => onButtonPress?.(btn.label)}
          />
        ))}
      </View>
    </View>
  );
};
