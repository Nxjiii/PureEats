export interface MetricRingCardProps {
    label: string;
    value: number;
    goal: number;
    unit: string;
    onPress?: () => void;
    size?: 'normal' | 'small';
  }
  //props