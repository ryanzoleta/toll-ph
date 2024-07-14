import { Link } from 'expo-router';
import { Moon, Sun } from 'lucide-react-native';
import { Pressable, SafeAreaView, Text, View } from 'react-native';
import { useColorScheme } from 'nativewind';

function index() {
  const { colorScheme, toggleColorScheme } = useColorScheme();

  return (
    <SafeAreaView className="bg-background min-h-screen">
      <View className="px-5 py-2">
        <View className="flex flex-row justify-between">
          <Text className="text-foreground text-4xl font-extrabold tracking-tight underline">
            toll.ph
          </Text>

          <Pressable onPress={toggleColorScheme}>
            {colorScheme === 'dark' ? <Sun /> : <Moon />}
          </Pressable>
        </View>
        <Link href="/matrix" className="text-foreground">
          matrix page
        </Link>
      </View>
    </SafeAreaView>
  );
}

export default index;
