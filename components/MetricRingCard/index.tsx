import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import { metricStyles } from './styles';
import { MetricRingCardProps } from './types';

const MetricRingCard = ({ label, value, goal, unit, onPress }: MetricRingCardProps) => {
  const percentage = Math.min((value / goal) * 100, 100);
  const isOver = value > goal;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={onPress ? 0.85 : 1}
      style={metricStyles.card}
    >
      <AnimatedCircularProgress
        size={90}
        width={6}
        fill={percentage}
        tintColor={isOver ? '#e63946' : '#38b000'}
        backgroundColor="#333"
        lineCap="round"
        rotation={0}
      >
        {() => (
          <Text style={metricStyles.ringText}>
            {value}/{goal} {unit}
          </Text>
        )}
      </AnimatedCircularProgress>
      <Text style={metricStyles.label}>{label}</Text>
    </TouchableOpacity>
  );
};

export default MetricRingCard;
