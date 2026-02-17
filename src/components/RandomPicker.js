import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { items } from '../data/items';
import { theme } from '../styles/theme';

const { width } = Dimensions.get('window');

export default function RandomPicker() {
  const [selectedItem, setSelectedItem] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const pickRandomItem = () => {
    if (isAnimating) return;

    setIsAnimating(true);

    // Reset animations
    fadeAnim.setValue(0);
    scaleAnim.setValue(0);
    rotateAnim.setValue(0);

    // Pick random item
    const randomIndex = Math.floor(Math.random() * items.length);
    const randomItem = items[randomIndex];
    setSelectedItem(randomItem);

    // Start animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsAnimating(false);
    });
  };

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🎲 Рандомизатор</Text>
        <Text style={styles.subtitle}>
          Нажми на кнопку и узнай, чем заняться сегодня!
        </Text>
      </View>

      <View style={styles.resultContainer}>
        {selectedItem ? (
          <Animated.View
            style={[
              styles.resultCard,
              {
                opacity: fadeAnim,
                transform: [
                  { scale: scaleAnim },
                  { rotate: spin },
                ],
              },
            ]}
          >
            <Text style={styles.resultText}>{selectedItem}</Text>
          </Animated.View>
        ) : (
          <View style={styles.placeholderCard}>
            <Text style={styles.placeholderText}>
              ❓
            </Text>
            <Text style={styles.placeholderSubtext}>
              Выбери случайное занятие
            </Text>
          </View>
        )}
      </View>

      <TouchableOpacity
        style={[
          styles.button,
          isAnimating && styles.buttonDisabled,
        ]}
        onPress={pickRandomItem}
        disabled={isAnimating}
        activeOpacity={0.8}
      >
        <Text style={styles.buttonText}>
          {isAnimating ? 'Выбираю...' : 'Выбрать'}
        </Text>
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Всего вариантов: {items.length}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginTop: theme.spacing.xl,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.textLight,
    textAlign: 'center',
    paddingHorizontal: theme.spacing.md,
  },
  resultContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
  },
  resultCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    width: width - theme.spacing.lg * 2,
    minHeight: 200,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.medium,
  },
  resultText: {
    fontSize: 32,
    fontWeight: '600',
    color: theme.colors.primary,
    textAlign: 'center',
  },
  placeholderCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    width: width - theme.spacing.lg * 2,
    minHeight: 200,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.textLight + '30',
    borderStyle: 'dashed',
  },
  placeholderText: {
    fontSize: 64,
    marginBottom: theme.spacing.sm,
  },
  placeholderSubtext: {
    fontSize: 18,
    color: theme.colors.textLight,
    textAlign: 'center',
  },
  button: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    alignItems: 'center',
    ...theme.shadows.small,
  },
  buttonDisabled: {
    backgroundColor: theme.colors.textLight,
  },
  buttonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.surface,
  },
  footer: {
    alignItems: 'center',
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  footerText: {
    fontSize: 14,
    color: theme.colors.textLight,
  },
});
