import { Link } from 'expo-router';
import { ChevronDown, Moon, Sun } from 'lucide-react-native';
import { Pressable, SafeAreaView, Text, View } from 'react-native';
import { useColorScheme } from 'nativewind';
import colors from 'tailwindcss/colors';

function index() {
  const { colorScheme, toggleColorScheme } = useColorScheme();

  const points = [
    {
      id: 1,
      name: 'Magallanes',
      expresswayId: 'SLEX',
      sequence: 1,
    },
    {
      id: 2,
      name: 'Merville',
      expresswayId: 'SLEX',
      sequence: 2,
    },
    {
      id: 3,
      name: 'Bicutan',
      expresswayId: 'SLEX',
      sequence: 3,
    },
  ];

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

            <PointSelector points={points} />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

import { ReactNode, useState } from 'react';
import { twMerge } from 'tailwind-merge';

function FormLabel({ children }: { children: ReactNode }) {
  return <Text className="text-foreground text-lg font-bold">{children}</Text>;
}

function PointSelector({ points }) {
  const [point, setPoint] = useState<string | null>(null);
  const [setselecting, setSetselecting] = useState(false);

  return (
    <Pressable
      className={twMerge(
        'relative flex flex-row items-center justify-between rounded-md p-3 ',
        point ? 'bg-slate-700' : 'bg-slate-800'
      )}
      onPress={() => setSetselecting(!setselecting)}
    >
      {point ? (
        <Text className="text-foreground text-lg font-bold">{point}</Text>
      ) : (
        <Text className="text-muted text-lg">Select a point</Text>
      )}

      {setselecting && (
        <View className="absolute left-0 top-full z-10 mt-1 w-full rounded-md bg-slate-800">
          {points.map((point) => (
            <Pressable
              key={point.id}
              onPress={() => {
                setPoint(point.name);
                setSetselecting(false);
              }}
              className="rounded-md p-2"
            >
              <Text className="text-foreground text-lg font-bold">{point.name}</Text>
            </Pressable>
          ))}
        </View>
      )}
    </Pressable>
  );
}

export default index;
