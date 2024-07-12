import { Link } from 'expo-router';
import { SafeAreaView, Text } from 'react-native';

function index() {
  return (
    <SafeAreaView>
      <Text className="text-2xl font-bold text-white underline">index</Text>
      <Link href="/matrix" style={{ color: 'white', fontSize: 50 }}>
        matrix page
      </Link>
    </SafeAreaView>
  );
}

export default index;
