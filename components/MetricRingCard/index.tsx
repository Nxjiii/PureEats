import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import { MetricRingCardProps } from './types';
import { metricStyles as styles } from './styles';

const MetricRingCard: React.FC<MetricRingCardProps> = ({
  label,
  value,
  goal,
  unit,
  onPress,
  size = 'normal',
}) => {
  const percentage = goal > 0 ? Math.min((value / goal) * 100, 100) : 0;
  const isOver = value > goal && goal > 0;

  const circleSizes: Record<'small' | 'normal', number> = {
    small: 70,
    normal: 90,
  };

  const circleWidths: Record<'small' | 'normal', number> = {
    small: 5,
    normal: 6,
  };

  const circleSize = circleSizes[size];
  const lineWidth = circleWidths[size];

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={onPress ? 0.85 : 1}
      style={[
        styles.card,
        size === 'small' && styles.smallCard,
      ]}
    >
      <AnimatedCircularProgress
        size={circleSize}
        width={lineWidth}
        fill={percentage}
        tintColor={isOver ? '#e63946' : '#38b000'}
        backgroundColor="#333"
        lineCap="round"
        rotation={0}
      >
        {() => (
          <Text
            style={styles.ringText}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {value}/{goal} {unit}
          </Text>
        )}
      </AnimatedCircularProgress>
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
};

export default MetricRingCard;
