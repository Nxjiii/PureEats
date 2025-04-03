import { useNavigation } from '@react-navigation/native';
import { TouchableOpacity } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';

const BackButton = () => {
  const navigation = useNavigation();

  return (
    <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 8 }}>
      <ArrowLeft size={20} color="white" />
    </TouchableOpacity>
  );
};

export default BackButton;
