import {
  Tabs,
  TabList,
  TabTrigger,
  TabSlot,
  TabTriggerSlotProps,
  TabListProps,
} from 'expo-router/ui';
import { Pressable, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '@/constants/theme';

interface TabButtonExtraProps {
  icon: keyof typeof Ionicons.glyphMap;
  activeIcon: keyof typeof Ionicons.glyphMap;
  badge?: string;
}

export default function AppTabs() {
  return (
    <Tabs>
      <TabSlot style={{ height: '100%' }} />
      <TabList asChild>
        <CustomTabList>
          <TabTrigger name="home" href="/" asChild>
            <TabButton icon="hardware-chip-outline" activeIcon="hardware-chip">
              Agents
            </TabButton>
          </TabTrigger>

          <TabTrigger name="conversations" href="/conversations" asChild>
            <TabButton
              icon="chatbubbles-outline"
              activeIcon="chatbubbles"
              badge="3">
              Conversations
            </TabButton>
          </TabTrigger>

          <TabTrigger name="campaigns" href="/campaigns" asChild>
            <TabButton icon="megaphone-outline" activeIcon="megaphone">
              Campaigns
            </TabButton>
          </TabTrigger>

          <TabTrigger name="analytics" href="/analytics" asChild>
            <TabButton icon="trending-up-outline" activeIcon="trending-up">
              Analytics
            </TabButton>
          </TabTrigger>
        </CustomTabList>
      </TabList>
    </Tabs>
  );
}

export function TabButton({
  children,
  isFocused,
  icon,
  activeIcon,
  badge,
  ...props
}: TabTriggerSlotProps & TabButtonExtraProps) {
  const { ref, ...rest } = props as any;
  const activeColor = Theme.colors.primaryContainer;
  const inactiveColor = Theme.colors.onSurfaceVariant;

  return (
    <Pressable
      ref={ref}
      {...rest}
      className={`flex-1 items-center justify-center py-1.5 active:opacity-70`}>
      <View className="relative items-center justify-center">
        <Ionicons
          name={isFocused ? activeIcon : icon}
          size={22}
          color={isFocused ? activeColor : inactiveColor}
        />
        {badge && (
          <View className="absolute -top-1 -right-2.5 min-w-[16px] h-4 rounded-full bg-whatsapp items-center justify-center px-1">
            <Text className="text-white text-[9px] font-extrabold">{badge}</Text>
          </View>
        )}
      </View>
      <Text
        className={`text-[11px] mt-1 ${
          isFocused ? 'font-bold text-primary-container' : 'font-medium text-on-surface-variant'
        }`}>
        {children}
      </Text>
    </Pressable>
  );
}

export function CustomTabList(props: TabListProps) {
  return (
    <View
      {...props}
      className="absolute bottom-0 left-0 right-0 bg-surface/90 border-t border-border-subtle z-50">
      <View className="flex-row h-16 max-w-[600px] mx-auto w-full items-center justify-around px-2">
        {props.children}
      </View>
    </View>
  );
}
