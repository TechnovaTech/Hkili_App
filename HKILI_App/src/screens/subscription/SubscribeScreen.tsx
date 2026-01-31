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
import { router, useFocusEffect } from 'expo-router';
import { planService, Plan } from '../../services/planService';
import { authService } from '../../services/authService';

export default function SubscribeScreen() {
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
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A1929" />
      
      <View style={styles.fixedHeader}>
        <View style={styles.headerSpacer} />
        <Text style={styles.headerTitle}>Plans</Text>
        <View style={styles.coinsContainer}>
          <Text style={styles.coinsText}>{coins}</Text>
          <Ionicons name="layers-outline" size={20} color="#4CAF50" />
        </View>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.characterContainer}>
          <View style={styles.foxCircle}>
            <Text style={styles.foxEmoji}>🦊</Text>
          </View>
        </View>

        <Text style={styles.upgradeTitle}>Choose Your Plan</Text>

        {loading ? (
          <ActivityIndicator size="large" color="#4CAF50" style={{ marginTop: 20 }} />
        ) : (
          <View style={styles.plansRow}>
            {plans.map((plan) => (
              <TouchableOpacity
                key={plan._id}
                style={[
                  styles.planCard,
                  selectedPlanId === plan._id && styles.selectedPlanCard
                ]}
                onPress={() => setSelectedPlanId(plan._id)}
              >
                <View style={styles.coinContainer}>
                  <Text style={styles.coinText}>{plan.coins}</Text>
                  <Ionicons name="layers" size={24} color="#FFD700" />
                </View>
                
                <View style={styles.priceContainer}>
                  <Text style={styles.originalPrice}>₹{plan.originalPrice}</Text>
                  <Text style={styles.discountPrice}>₹{plan.discountPrice}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.buyButton} onPress={handleBuy}>
          <Text style={styles.buyButtonText}>Buy</Text>
        </TouchableOpacity>
      </View>
    </View>
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
    paddingBottom: 20,
    backgroundColor: '#0A1929',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  coinsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  coinsText: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: '600',
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
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(76, 175, 80, 0.3)',
  },
  foxEmoji: {
    fontSize: 50,
  },
  upgradeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 30,
  },
  plansRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 10,
  },
  planCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    height: 140,
    justifyContent: 'space-between',
  },
  selectedPlanCard: {
    backgroundColor: 'rgba(76, 175, 80, 0.15)',
    borderColor: '#4CAF50',
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
    color: '#4CAF50',
  },
  footer: {
    padding: 20,
    paddingBottom: 100,
    backgroundColor: '#0A1929',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  buyButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    paddingVertical: 16,
    width: '100%',
    alignItems: 'center',
  },
  buyButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});