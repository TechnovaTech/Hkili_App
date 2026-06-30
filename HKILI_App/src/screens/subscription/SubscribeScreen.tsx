import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useFocusEffect } from 'expo-router';
import { planService, Plan } from '../../services/planService';
import { authService } from '../../services/authService';
import { ScreenBackground } from '../../components/ui/ScreenBackground';
import { theme } from '../../theme';
import { useTranslation } from 'react-i18next';
import { useRTL } from '../../hooks/useRTL';

export default function SubscribeScreen() {
  const { t } = useTranslation();
  const { isRTL, textAlign, flexDirection } = useRTL();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [coins, setCoins] = useState(0);

  useEffect(() => {
    loadPlans();
  }, []);

  const fetchUserCoins = useCallback(async () => {
    try {
      const res = await authService.getCurrentUser();
      if (res.success && res.data) {
        setCoins(res.data.coins || 0);
      }
    } catch (error) {
      console.error('Error fetching user coins:', error);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchUserCoins();
    }, [fetchUserCoins])
  );

  const loadPlans = async () => {
    try {
      const response = await planService.getAll();
      if (response.success && response.data) {
        setPlans(response.data);
        if (response.data.length > 0) {
          setSelectedPlanId(response.data[0]._id);
        }
      }
    } catch (error) {
      console.error('Error loading plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBuy = () => {
    // No function as requested
  };

  return (
    <ScreenBackground>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      <View style={[styles.fixedHeader, { flexDirection }]}>
        <View style={styles.headerSpacer} />
        <Text style={styles.headerTitle}>{t('subscription.title')}</Text>
        <LinearGradient
          colors={theme.gradients.gold}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.coinsContainer, { flexDirection }]}
        >
          <Text style={styles.coinsText}>{coins}</Text>
          <Ionicons name="layers" size={18} color="#5D4037" />
        </LinearGradient>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.characterContainer}>
          <LinearGradient
            colors={theme.gradients.highlight}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.foxCircle}
          >
            <Text style={styles.foxEmoji}>🦊</Text>
          </LinearGradient>
        </View>

        <Text style={[styles.upgradeTitle, { textAlign }]}>{t('subscription.choosePlan')}</Text>

        {loading ? (
          <ActivityIndicator size="large" color="#00E676" style={{ marginTop: 20 }} />
        ) : (
          <View style={[styles.plansRow, { flexDirection }]}>
            {plans.map((plan) => {
              const isSelected = selectedPlanId === plan._id;
              return (
                <TouchableOpacity
                  key={plan._id}
                  style={[
                    styles.planCardWrapper,
                    isSelected && styles.selectedPlanCardWrapper
                  ]}
                  onPress={() => setSelectedPlanId(plan._id)}
                  activeOpacity={0.85}
                >
                  <LinearGradient
                    colors={isSelected ? theme.gradients.highlight : theme.gradients.card}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[styles.planCard, isSelected && styles.selectedPlanCard]}
                  >
                    <View style={styles.coinContainer}>
                      <Text style={styles.coinText}>{plan.coins}</Text>
                      <Ionicons name="layers" size={24} color="#FFD700" />
                    </View>

                    <View style={styles.priceContainer}>
                      <Text style={styles.originalPrice}>₹{plan.originalPrice}</Text>
                      <Text style={styles.discountPrice}>₹{plan.discountPrice}</Text>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.buyButtonWrapper} onPress={handleBuy} activeOpacity={0.85}>
          <LinearGradient
            colors={theme.gradients.gold}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.buyButton}
          >
            <Ionicons name="sparkles" size={20} color="#5D4037" />
            <Text style={styles.buyButtonText}>{t('subscription.buy')}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A1929',
  },
  fixedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 18,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(129, 199, 132, 0.15)',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  coinsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    ...theme.shadows.glowGold,
  },
  coinsText: {
    fontSize: 15,
    color: '#5D4037',
    fontWeight: '800',
  },
  headerSpacer: {
    width: 32,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    alignItems: 'center',
  },
  characterContainer: {
    marginBottom: 24,
    marginTop: 10,
  },
  foxCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(0, 230, 118, 0.35)',
    ...theme.shadows.glow,
  },
  foxEmoji: {
    fontSize: 50,
  },
  upgradeTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 0.5,
    marginBottom: 30,
  },
  plansRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 10,
  },
  planCardWrapper: {
    flex: 1,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(129, 199, 132, 0.18)',
    overflow: 'hidden',
    ...theme.shadows.md,
  },
  selectedPlanCardWrapper: {
    borderColor: '#00E676',
    overflow: 'visible',
    ...theme.shadows.glow,
  },
  planCard: {
    borderRadius: 18,
    padding: 12,
    alignItems: 'center',
    height: 140,
    justifyContent: 'space-between',
  },
  selectedPlanCard: {
    borderRadius: 18,
    overflow: 'hidden',
  },
  coinContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  coinText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  priceContainer: {
    alignItems: 'center',
    width: '100%',
  },
  originalPrice: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.5)',
    textDecorationLine: 'line-through',
    marginBottom: 2,
  },
  discountPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00E676',
  },
  footer: {
    padding: 20,
    paddingBottom: 100,
    borderTopWidth: 1,
    borderTopColor: 'rgba(129, 199, 132, 0.15)',
  },
  buyButtonWrapper: {
    borderRadius: 16,
    overflow: 'visible',
    ...theme.shadows.glowGold,
  },
  buyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderRadius: 16,
    paddingVertical: 16,
    width: '100%',
  },
  buyButtonText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#5D4037',
    letterSpacing: 0.5,
  },
});