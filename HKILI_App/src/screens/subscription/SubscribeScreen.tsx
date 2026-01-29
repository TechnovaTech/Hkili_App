import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function SubscribeScreen() {
  const [activeTab, setActiveTab] = useState('subscribe');

  const handleSubscribe = () => {
    console.log('Subscribe clicked');
  };

  const handleBuyCoins = () => {
    console.log('Buy coins clicked');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A1929" />
      
      <View style={styles.fixedHeader}>
        <View style={styles.headerSpacer} />
        <Text style={styles.headerTitle}>Subscribe</Text>
        <View style={styles.coinsContainer}>
          <Text style={styles.coinsText}>2</Text>
          <Ionicons name="layers-outline" size={20} color="#4CAF50" />
        </View>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'subscribe' && styles.activeTab]}
          onPress={() => setActiveTab('subscribe')}
        >
          <Text style={[styles.tabText, activeTab === 'subscribe' && styles.activeTabText]}>
            Subscribe
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'buycoins' && styles.activeTab]}
          onPress={() => setActiveTab('buycoins')}
        >
          <Text style={[styles.tabText, activeTab === 'buycoins' && styles.activeTabText]}>
            Buy coins
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {activeTab === 'subscribe' ? (
          <View style={styles.subscribeContent}>
            <View style={styles.characterContainer}>
              <View style={styles.foxCircle}>
                <Text style={styles.foxEmoji}>🦊</Text>
              </View>
            </View>

            <Text style={styles.upgradeTitle}>Upgrade to Premium now!</Text>

            <View style={styles.featuresContainer}>
              <View style={styles.feature}>
                <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                <Text style={styles.featureText}>unlimited stories</Text>
              </View>
              <View style={styles.feature}>
                <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                <Text style={styles.featureText}>unlimited audio stories</Text>
              </View>
              <View style={styles.feature}>
                <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                <Text style={styles.featureText}>cancel anytime</Text>
              </View>
            </View>

            <View style={styles.plansContainer}>
              <TouchableOpacity style={styles.monthlyPlan}>
                <Text style={styles.planTitle}>Monthly Premium</Text>
                <Text style={styles.planPrice}>₹399.00 / month</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.annualPlan}>
                <View style={styles.annualHeader}>
                  <Text style={styles.annualTitle}>Annual Premium</Text>
                  <View style={styles.saveTag}>
                    <Text style={styles.saveText}>Save 16%</Text>
                  </View>
                </View>
                <Text style={styles.annualPrice}>₹3,999.00 / year</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.subscribeButton} onPress={handleSubscribe}>
              <Text style={styles.subscribeButtonText}>Subscribe</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.buyCoinsContent}>
            <View style={styles.characterContainer}>
              <View style={styles.foxCircle}>
                <Text style={styles.foxEmoji}>🦊</Text>
              </View>
            </View>

            <Text style={styles.coinInfo}>1 coin = 1 story</Text>

            <View style={styles.coinPackage}>
              <Text style={styles.packageTitle}>Oscar Basic</Text>
              <Text style={styles.packagePrice}>5 coins for ₹230.00</Text>
              
              <View style={styles.packageFeatures}>
                <View style={styles.feature}>
                  <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                  <Text style={styles.packageFeatureText}>5 stories</Text>
                </View>
                <View style={styles.feature}>
                  <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                  <Text style={styles.packageFeatureText}>consumable coins</Text>
                </View>
              </View>

              <Text style={styles.packageDescription}>
                Buy coins to generate stories. You will only be charged once.
              </Text>
            </View>

            <TouchableOpacity style={styles.buyButton} onPress={handleBuyCoins}>
              <Text style={styles.buyButtonText}>Buy</Text>
            </TouchableOpacity>
          </View>
        )}

        <Text style={styles.termsText}>
          This app generates personalized stories offering AI. We do not guarantee the quality of the stories generated and we do not take responsibility for their content. Please review the stories before sharing them with your children. By using this app, you agree to our Terms of Service and Privacy Policy.
        </Text>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A1929',
    paddingBottom: 80,
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#4CAF50',
  },
  tabText: {
    fontSize: 16,
    color: '#81C784',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  subscribeContent: {
    alignItems: 'center',
  },
  buyCoinsContent: {
    alignItems: 'center',
  },
  characterContainer: {
    marginBottom: 24,
  },
  foxCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(76, 175, 80, 0.3)',
  },
  foxEmoji: {
    fontSize: 60,
  },
  upgradeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 24,
  },
  coinInfo: {
    fontSize: 18,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 24,
  },
  featuresContainer: {
    alignItems: 'flex-start',
    marginBottom: 32,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  featureText: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  plansContainer: {
    width: '100%',
    marginBottom: 24,
  },
  monthlyPlan: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  planTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  planPrice: {
    fontSize: 16,
    color: '#81C784',
  },
  annualPlan: {
    backgroundColor: '#2196F3',
    borderRadius: 12,
    padding: 20,
    marginBottom: 12,
  },
  annualHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  annualTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  saveTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  saveText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  annualPrice: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  subscribeButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    paddingVertical: 18,
    paddingHorizontal: 40,
    width: '100%',
    alignItems: 'center',
    marginBottom: 24,
  },
  subscribeButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  coinPackage: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  packageTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  packagePrice: {
    fontSize: 18,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
  },
  packageFeatures: {
    marginBottom: 16,
  },
  packageFeatureText: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  packageDescription: {
    fontSize: 14,
    color: '#81C784',
    textAlign: 'center',
    lineHeight: 20,
  },
  buyButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    paddingVertical: 18,
    paddingHorizontal: 40,
    width: '100%',
    alignItems: 'center',
    marginBottom: 24,
  },
  buyButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  termsText: {
    fontSize: 12,
    color: '#64B5F6',
    textAlign: 'center',
    lineHeight: 16,
    marginBottom: 20,
  },
  bottomSpacing: {
    height: 20,
  },
});