import React, { useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '@/constants/theme';
import { Header } from '@/components/common/Header';
import { AiStatusBar } from '@/components/conversations/AiStatusBar';
import { ConversationFilterBar } from '@/components/conversations/ConversationFilterBar';
import { UrgentAlertCard } from '@/components/conversations/UrgentAlertCard';
import { ConversationItemCard } from '@/components/conversations/ConversationItemCard';
import { ConversationFilter } from '@/types/conversation.types';
import { mockConversations } from '@/data/mockData';

export default function WhatsAppConversationsScreen() {
  const [filter, setFilter] = useState<ConversationFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const urgentItem = mockConversations.find((c) => c.status === 'attention');
  const regularItems = mockConversations.filter((c) => c.status !== 'attention');

  const filteredItems = regularItems.filter((item) => {
    if (filter === 'booked' && item.status !== 'booked') return false;
    if (filter === 'ai' && item.status !== 'ai_active') return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      return (
        item.patientName.toLowerCase().includes(q) ||
        item.treatment.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <View className="flex-1 bg-surface">
      <Header />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}>
        {/* Status Bar */}
        <AiStatusBar />

        {/* Search Bar */}
        <View className="flex-row items-center bg-surface-lowest mx-4 mt-2 px-3 h-11 rounded-xl border border-border-subtle gap-2 shadow-sm">
          <Ionicons
            name="search-outline"
            size={16}
            color={Theme.colors.onSurfaceVariant}
          />
          <TextInput
            placeholder="Search patient, phone, or treatment..."
            placeholderTextColor={Theme.colors.onSurfaceVariant}
            value={searchQuery}
            onChangeText={setSearchQuery}
            className="flex-1 text-[13px] text-on-surface"
          />
        </View>

        {/* Filter Pills */}
        <ConversationFilterBar
          activeFilter={filter}
          onSelectFilter={setFilter}
        />

        {/* Urgent Attention Lead */}
        {(filter === 'all' || filter === 'attention') && urgentItem && (
          <UrgentAlertCard
            item={urgentItem}
            onTakeover={() =>
              Alert.alert('Chat Taken Over', 'You now have direct control over this patient session.')
            }
            onReview={() =>
              Alert.alert('Protocol Review', 'PRP Anti-Aging Package protocol opened.')
            }
          />
        )}

        {/* Regular Conversations List */}
        <View className="mt-1">
          <View className="flex-row items-center justify-between px-4 mb-1.5">
            <Text className="text-sm font-bold text-on-surface">
              {filter === 'booked'
                ? 'Confirmed Bookings'
                : filter === 'ai'
                ? 'Handled by AI Copilot'
                : 'Recent Conversations'}
            </Text>
            <Text className="text-[11px] text-on-surface-variant font-medium">
              {filteredItems.length} patient threads
            </Text>
          </View>

          {filteredItems.map((item) => (
            <ConversationItemCard
              key={item.id}
              item={item}
              onPress={() =>
                Alert.alert(item.patientName, `Treatment: ${item.treatment}`)
              }
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
