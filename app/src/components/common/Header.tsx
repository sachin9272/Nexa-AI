import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Theme } from '@/constants/theme';
import { mockClinicProfile } from '@/data/mockData';

interface HeaderProps {
  onNotificationPress?: () => void;
  onProfilePress?: () => void;
  onClinicChangePress?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onNotificationPress,
  onProfilePress,
  onClinicChangePress,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="bg-surface/95 border-b border-border-subtle z-50"
      style={{ paddingTop: insets.top || 12 }}>
      <View className="h-[60px] flex-row items-center justify-between px-4">
        {/* Left: Brand + Clinic dropdown */}
        <View className="flex-row items-center flex-1">
          <View className="flex-row items-center bg-primary-container px-2 py-1 rounded-lg mr-2.5">
            <Ionicons name="sparkles" size={15} color={Theme.colors.primaryFixed} />
            <Text className="text-white font-extrabold text-[13px] ml-1 tracking-tight">
              Grexa<Text className="text-primary-fixed">.AI</Text>
            </Text>
          </View>

          <View className="w-[1px] h-6 bg-border-subtle mr-2.5" />

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={onClinicChangePress}
            className="justify-center flex-shrink">
            <View className="flex-row items-center">
              <Text
                className="text-[13px] font-bold text-on-surface max-w-[130px] mr-0.5"
                numberOfLines={1}>
                {mockClinicProfile.name}
              </Text>
              <Ionicons
                name="chevron-down"
                size={14}
                color={Theme.colors.onSurfaceVariant}
              />
            </View>
            <View className="flex-row items-center mt-0.5">
              <View className="w-2 h-2 rounded-full bg-secondary-container items-center justify-center mr-1">
                <View className="w-1.5 h-1.5 rounded-full bg-secondary-growth" />
              </View>
              <Text className="text-[10px] font-bold text-secondary-growth uppercase tracking-wider">
                {mockClinicProfile.status}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Right: Notification + Profile */}
        <View className="flex-row items-center gap-2">
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={onNotificationPress}
            className="w-9 h-9 rounded-full bg-surface-low items-center justify-center relative">
            <Ionicons
              name="notifications-outline"
              size={19}
              color={Theme.colors.onSurface}
            />
            <View className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-600 border border-white" />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onProfilePress}
            className="w-9 h-9 rounded-full border-2 border-primary-fixed-dim overflow-hidden">
            <Image
              source={{ uri: mockClinicProfile.avatarUri }}
              className="w-full h-full"
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};
