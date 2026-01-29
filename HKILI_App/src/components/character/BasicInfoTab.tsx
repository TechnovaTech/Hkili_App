import React from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { theme } from '@/theme';
import { CharacterFormData } from '@/types/character';

interface BasicInfoTabProps {
  formData: CharacterFormData;
  updateFormData: (updates: Partial<CharacterFormData>) => void;
  onNext: () => void;
}

export default function BasicInfoTab({ formData, updateFormData, onNext }: BasicInfoTabProps) {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        {/* Name Field */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>
            Name<Text style={styles.required}>*</Text>
          </Text>
          <Text style={styles.description}>
            Enter the name of your child or a random name for the character.
          </Text>
          <TextInput
            style={styles.input}
            value={formData.name}
            onChangeText={(text) => updateFormData({ name: text })}
            placeholder="Name"
            placeholderTextColor={theme.colors.textMuted}
          />
        </View>

        {/* Age Field */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Age</Text>
          <Text style={styles.description}>
            If you like, you can add the age of your children
          </Text>
          <TextInput
            style={styles.input}
            value={formData.age}
            onChangeText={(text) => updateFormData({ age: text })}
            placeholder="Age"
            placeholderTextColor={theme.colors.textMuted}
            keyboardType="numeric"
          />
        </View>

        {/* Gender Field */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>
            Gender<Text style={styles.required}>*</Text>
          </Text>
          <Text style={styles.description}>
            Used for pronouns in the generated story.
          </Text>
          <View style={styles.genderContainer}>
            {(['male', 'female', 'n/a'] as const).map((gender) => (
              <TouchableOpacity
                key={gender}
                style={[
                  styles.genderButton,
                  formData.gender === gender && styles.selectedGenderButton,
                ]}
                onPress={() => updateFormData({ gender })}
              >
                <Text
                  style={[
                    styles.genderText,
                    formData.gender === gender && styles.selectedGenderText,
                  ]}
                >
                  {gender}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Next Button */}
        <TouchableOpacity style={styles.nextButton} onPress={onNext}>
          <Text style={styles.nextButtonText}>Next</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
  },
  fieldContainer: {
    marginBottom: theme.spacing.xl,
  },
  label: {
    ...theme.typography.h3,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  required: {
    color: '#4CAF50',
  },
  description: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    ...theme.typography.body,
    color: theme.colors.text,
    minHeight: 56,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  genderContainer: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  genderButton: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.xl,
    borderWidth: 2,
    borderColor: '#4CAF50',
    alignItems: 'center',
  },
  selectedGenderButton: {
    backgroundColor: '#4CAF50',
  },
  genderText: {
    ...theme.typography.body,
    color: theme.colors.text,
    fontWeight: '600',
  },
  selectedGenderText: {
    color: theme.colors.text,
  },
  nextButton: {
    backgroundColor: '#4CAF50',
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
    marginTop: theme.spacing.lg,
  },
  nextButtonText: {
    ...theme.typography.body,
    color: theme.colors.text,
    fontWeight: '600',
  },
});