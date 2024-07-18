import { Link, router } from 'expo-router';
import { ChevronDown, Moon, Sun, X } from 'lucide-react-native';
import { Pressable, SafeAreaView, Text, View } from 'react-native';
import { useColorScheme } from 'nativewind';
import colors from 'tailwindcss/colors';
import { ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';
import { useSelectedPoints } from '@/lib/stores';

function index() {
  const { colorScheme, toggleColorScheme } = useColorScheme();

  const { origin, destination, setDestination, setOrigin } = useSelectedPoints();

  return (
    <SafeAreaView className="bg-background min-h-screen">
      <View className="flex flex-col gap-7 px-5 py-2">
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
          <View className="flex flex-col gap-1">
            <FormLabel>Vehicle Class</FormLabel>

            <Pressable className="flex flex-row items-center justify-between rounded-md bg-slate-700 p-3">
              <Text className="text-foreground text-lg font-bold">Class 1</Text>

              <ChevronDown color={colors.slate[500]} size={20} />
            </Pressable>
          </View>
        </View>

        <View>
          <View className="flex flex-col gap-1">
            <FormLabel>Origin</FormLabel>

            <Pressable
              className={twMerge(
                'relative flex flex-row items-center justify-between rounded-md p-3 transition-opacity duration-100 active:opacity-80',
                origin ? 'bg-slate-700' : 'bg-slate-800'
              )}
              onPress={() => router.push({ pathname: '/selector', params: { isOrigin: 1 } })}
            >
              {origin ? (
                <>
                  <Text className="text-foreground text-lg font-bold">{origin.name}</Text>
                  <Pressable
                    onPress={() => {
                      setOrigin(null);
                    }}
                    className="active:bg-secondary rounded-full p-1"
                  >
                    <X color={colors.slate[500]} size={15} />
                  </Pressable>
                </>
              ) : (
                <Text className="text-muted text-lg">Select entry point</Text>
              )}
            </Pressable>
          </View>
        </View>

        <View>
          <View className="flex flex-col gap-1">
            <FormLabel>Destination</FormLabel>

            <Pressable
              className={twMerge(
                'relative flex flex-row items-center justify-between rounded-md p-3 transition-opacity duration-100 active:opacity-80',
                destination ? 'bg-slate-700' : 'bg-slate-800'
              )}
              onPress={() => router.push({ pathname: '/selector', params: { isOrigin: 0 } })}
            >
              {destination ? (
                <>
                  <Text className="text-foreground text-lg font-bold">{destination.name}</Text>
                  <Pressable
                    onPress={() => {
                      setDestination(null);
                    }}
                    className="active:bg-secondary rounded-full p-1"
                  >
                    <X color={colors.slate[500]} size={15} />
                  </Pressable>
                </>
              ) : (
                <Text className="text-muted text-lg">Select exit point</Text>
              )}
            </Pressable>
          </View>
        </View>

        <View className="flex flex-col gap-3">
          <Pressable className="rounded-lg bg-green-800 p-3 transition-all duration-100 active:opacity-90">
            <Text className="text-center text-xl font-bold text-green-300">Calculate</Text>
          </Pressable>

          <Pressable
            className="bg-secondary  rounded-lg p-3 transition-all duration-100 active:opacity-90"
            onPress={() => {
              setDestination(null);
              setOrigin(null);
            }}
          >
            <Text className="text-center text-xl font-bold text-slate-500">Clear</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

function FormLabel({ children }: { children: ReactNode }) {
  return <Text className="text-foreground text-lg font-bold">{children}</Text>;
}

export default index;
