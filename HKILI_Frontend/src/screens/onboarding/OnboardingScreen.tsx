import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';

const { width, height } = Dimensions.get('window');

const onboardingData = [
  {
    id: 1,
    title: 'Create your own story',
    description: 'Never get bored of the same old tales. Generate your own unique stories with your child.',
    image: '🦊',
    buttonText: "Let's go",
  },
  {
    id: 2,
    title: 'Choose different characters and professions',
    description: 'Your kids can be dragons, unicorns, superheroes, pirates, astronauts - endless options!',
    image: '🦊📖',
    buttonText: 'Continue',
  },
  {
    id: 3,
    title: 'Include family, friends and pets',
    description: 'Make the story personalized and special.',
    image: '🦊👨',
    buttonText: 'What else?',
  },
  {
    id: 4,
    title: "Set up your kids' profiles.",
    description: 'To be able to generate stories, you have to set up your kids profiles.',
    image: '🦊🌙',
    buttonText: "OK, let's Go!",
  },
];

export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const router = useRouter();

  const handleNext = () => {
    if (currentIndex < onboardingData.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      scrollViewRef.current?.scrollTo({
        x: nextIndex * width,
        animated: true,
      });
    } else {
      router.replace('/auth/login');
    }
  };

  const handleSkip = () => {
    router.replace('/auth/login');
  };

  const onScroll = (event: any) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const index = event.nativeEvent.contentOffset.x / slideSize;
    const roundIndex = Math.round(index);
    setCurrentIndex(roundIndex);
  };

  const renderSlide = (item: any, index: number) => (
    <View key={item.id} style={styles.slide}>
      <View style={styles.imageContainer}>
        <View style={styles.imageCircle}>
          <View style={styles.gradientOverlay}>
            <Text style={styles.imageText}>{item.image}</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.contentContainer}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description}>{item.description}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Page Indicators */}
      <View style={styles.indicatorContainer}>
        {onboardingData.map((_, index) => (
          <View
            key={index}
            style={[
              styles.indicator,
              index === currentIndex ? styles.activeIndicator : styles.inactiveIndicator,
            ]}
          />
        ))}
      </View>

      {/* Slides */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        style={styles.scrollView}
      >
        {onboardingData.map((item, index) => renderSlide(item, index))}
      </ScrollView>

      {/* Bottom Section */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity style={styles.button} onPress={handleNext}>
          <Text style={styles.buttonText}>
            {onboardingData[currentIndex].buttonText}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity onPress={handleSkip} style={styles.skipContainer}>
          <Text style={styles.skipText}>
            Already have an account? <Text style={styles.signInText}>Sign in</Text>
          </Text>
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
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 20,
  },
  indicator: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  activeIndicator: {
    backgroundColor: '#4CAF50',
    width: 32,
  },
  inactiveIndicator: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    width: 8,
  },
  scrollView: {
    flex: 1,
  },
  slide: {
    width: width,
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  imageContainer: {
    flex: 0.6,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 40,
  },
  imageCircle: {
    width: 280,
    height: 280,
    borderRadius: 140,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderWidth: 3,
    borderColor: 'rgba(76, 175, 80, 0.2)',
    shadowColor: '#4CAF50',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  gradientOverlay: {
    width: '100%',
    height: '100%',
    borderRadius: 140,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  imageText: {
    fontSize: 100,
    textAlign: 'center',
  },
  contentContainer: {
    flex: 0.4,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 20,
    paddingHorizontal: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 34,
    paddingHorizontal: 10,
  },
  description: {
    fontSize: 16,
    color: '#64B5F6',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 10,
  },
  bottomContainer: {
    paddingHorizontal: 40,
    paddingBottom: 50,
  },
  button: {
    backgroundColor: '#4CAF50',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#4CAF50',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  skipContainer: {
    alignItems: 'center',
  },
  skipText: {
    color: '#81C784',
    fontSize: 14,
  },
  signInText: {
    color: '#2196F3',
    fontWeight: '600',
  },
});