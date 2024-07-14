import { Link } from 'expo-router';
import { Moon, Sun } from 'lucide-react-native';
import { Pressable, SafeAreaView, Text, View } from 'react-native';
import { useColorScheme } from 'nativewind';
import colors from 'tailwindcss/colors';

function index() {
  const { colorScheme, toggleColorScheme } = useColorScheme();

  return (
    <SafeAreaView className="bg-background min-h-screen">
      <View className="flex flex-col gap-3 px-5 py-2">
        <View className="flex flex-row items-center justify-between">
          <Text className="text-foreground text-4xl font-extrabold tracking-tight">toll.ph</Text>

          <View className="flex flex-row items-center gap-10">
            <Link
              href="/matrix"
              className="text-foreground text-lg transition-opacity duration-100 active:opacity-70"
            >
              Matrix
            </Link>

            <Pressable
              onPressIn={toggleColorScheme}
              className="transition-opacity duration-100 active:opacity-50"
            >
              {colorScheme === 'dark' ? (
                <Sun color={colors.slate[500]} />
              ) : (
                <Moon color={colors.slate[500]} />
              )}
            </Pressable>
          </View>
        </View>

        <View>
          <Text className="text-muted">
            Use this to calculate the toll fee for a trip from anywhere in the entire Luzon
            expressway network, form Baguio, to Manila, to Batangas
          </Text>
        </View>

        <View>
          <View>
            <FormLabel>Vehicle Class</FormLabel>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

import { ReactNode } from 'react';

function FormLabel({ children }: { children: ReactNode }) {
  return <Text className="text-foreground text-lg font-bold">{children}</Text>;
}

export default index;
