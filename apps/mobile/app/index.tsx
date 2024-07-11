import { Link } from 'expo-router';
import { SafeAreaView, Text } from 'react-native';

function index() {
  return (
    <SafeAreaView>
      <Text style={{ color: 'white' }}>index</Text>
      <Link href="/matrix" style={{ color: 'white', fontSize: 50 }}>
        matrix page
      </Link>
    </SafeAreaView>
  );
}

export default index;
