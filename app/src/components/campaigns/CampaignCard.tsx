import React from 'react';
import { View, Text, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CampaignItem } from '@/types/campaign.types';
import { Badge } from '@/components/common/Badge';
import { ActionButton } from '@/components/common/ActionButton';

interface CampaignCardProps {
  campaign: CampaignItem;
  onApprove?: () => void;
  onPreview?: () => void;
}

export const CampaignCard: React.FC<CampaignCardProps> = ({
  campaign,
  onApprove,
  onPreview,
}) => {
  return (
    <View className="bg-surface-lowest mx-4 my-1.5 p-4 rounded-2xl border border-border-subtle shadow-sm gap-2.5">
      {/* Header */}
      <View className="flex-row items-start justify-between">
        <View className="flex-1 mr-2">
          <Text className="text-[15px] font-bold text-on-surface">
            {campaign.title}
          </Text>
          <Text className="text-[11px] text-on-surface-variant mt-0.5">
            {campaign.scheduledTime}
          </Text>
        </View>
        <Badge
          label={campaign.statusLabel}
          variant={
            campaign.status === 'ready'
              ? 'warning'
              : campaign.status === 'scheduled'
              ? 'ai'
              : 'growth'
          }
        />
      </View>

      {/* Target Audience */}
      <View className="flex-row items-center gap-1.5 bg-surface-low px-2 py-1.5 rounded-lg">
        <Ionicons name="people" size={14} color="#60646C" />
        <Text className="text-[11px] text-on-surface-variant flex-1" numberOfLines={1}>
          Target: {campaign.targetAudience}
        </Text>
      </View>

      {/* Visual Image & Offer Details */}
      {campaign.imageUri && (
        <View className="flex-row items-center bg-surface-low rounded-xl p-2 gap-2.5">
          <Image
            source={{ uri: campaign.imageUri }}
            className="w-12 h-12 rounded-lg bg-surface-container"
          />
          <View className="flex-1">
            <Text className="text-[13px] font-bold text-on-surface">
              {campaign.offerText}
            </Text>
            <Text className="text-[11px] font-semibold text-secondary-growth mt-0.5">
              {campaign.predictedBookings}
            </Text>
          </View>
        </View>
      )}

      {/* If Completed */}
      {campaign.revenueGenerated && (
        <View className="flex-row items-center justify-between bg-whatsapp-light p-2.5 rounded-xl">
          <View>
            <Text className="text-[10px] font-semibold text-whatsapp-dark">
              Actualized Revenue
            </Text>
            <Text className="text-[15px] font-extrabold text-whatsapp-dark">
              {campaign.revenueGenerated}
            </Text>
          </View>
          {campaign.openRate && (
            <View className="items-end">
              <Text className="text-[10px] font-semibold text-whatsapp-dark">
                Open Rate
              </Text>
              <Text className="text-sm font-extrabold text-whatsapp-dark">
                {campaign.openRate}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Actions */}
      <View className="flex-row gap-2 mt-0.5">
        {campaign.status === 'ready' && (
          <>
            <ActionButton
              label="Approve & Schedule"
              variant="primary"
              icon="checkmark-circle-outline"
              fullWidth
              onPress={onApprove}
            />
            <ActionButton
              label="Edit Draft"
              variant="secondary"
              icon="create-outline"
              fullWidth
              onPress={onPreview}
            />
          </>
        )}
        {campaign.status === 'scheduled' && (
          <>
            <ActionButton
              label="Preview Blast"
              variant="secondary"
              icon="eye-outline"
              fullWidth
              onPress={onPreview}
            />
            <ActionButton
              label="Reschedule"
              variant="secondary"
              icon="calendar-outline"
              fullWidth
            />
          </>
        )}
        {campaign.status === 'completed' && (
          <ActionButton
            label="View Attribution Analytics"
            variant="secondary"
            icon="bar-chart-outline"
            fullWidth
          />
        )}
      </View>
    </View>
  );
};
