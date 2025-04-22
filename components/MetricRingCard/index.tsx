import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import { metricStyles } from './styles';
import { MetricRingCardProps } from './types';

const MetricRingCard = ({ label, value, goal, unit, onPress, size = 'normal' }: MetricRingCardProps) => {
  const percentage = Math.min((value / goal) * 100, 100);
  const isOver = value > goal;

  // Define sizes based on the size prop
  const circleSizes = {
    small: 70,
    normal: 90,
  };

  const circleWidth = {
    small: 5,
    normal: 6,
  };

  // Get the appropriate circle size
  const circleSize = circleSizes[size] || circleSizes.normal;
  const lineWidth = circleWidth[size] || circleWidth.normal;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={onPress ? 0.85 : 1}
      style={[
        metricStyles.card,
        size === 'small' && metricStyles.smallCard,
      ]}
    >
      <AnimatedCircularProgress
        size={circleSize}
        width={lineWidth}
        fill={percentage} // Dynamically set the percentage
        tintColor={isOver ? '#e63946' : '#38b000'}
        backgroundColor="#333"
        lineCap="round"
        rotation={0}
      >
        {() => (
          <Text
            style={[
              metricStyles.ringText,
              size === 'small' && { fontSize: 10 },
            ]}
          >
            {value}/{goal} {unit}
          </Text>
        )}
      </AnimatedCircularProgress>
      <Text
        style={[
          metricStyles.label,
          size === 'small' && { fontSize: 12, marginTop: 6 },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
};

export default MetricRingCard;
