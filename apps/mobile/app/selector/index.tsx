import { SafeAreaView, View, Text, TextInput, ScrollView, Pressable, Platform } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useAllPointsStore, useReachables, useSelectedPoints } from '@/lib/stores';
import { useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import SafeViewAndroid from '../../components/SafeAreaView';
import { ArrowLeft } from 'lucide-react-native';
import colors from 'tailwindcss/colors';

export default function Selector() {
  const params = useLocalSearchParams();
  const { allPoints } = useAllPointsStore();
  const { setOrigin, setDestination } = useSelectedPoints();
  const { reachables } = useReachables();

  const [input, setInput] = useState('');

  const initialPoints =
    reachables.length > 0 ? allPoints.filter((point) => reachables.includes(point)) : allPoints;

  const [filteredPoints, setFilteredPoints] = useState(initialPoints);

  const isOrigin = params.isOrigin === '1';

  useEffect(() => {
    setFilteredPoints(
      initialPoints.filter(
        (point) =>
          point.name.toLowerCase().includes(input.toLowerCase()) ||
          point.expresway_id.toLowerCase().includes(input.toLowerCase())
      )
    );
  }, [input]);

  return (
    <SafeAreaView className="bg-background min-h-screen" style={SafeViewAndroid.AndroidSafeArea}>
      <View className="flex flex-col">
        <View className="flex flex-row items-center gap-3 pt-3">
          {Platform.OS === 'android' && (
            <Pressable
              className="pl-5 transition-opacity duration-100 active:opacity-50"
              onPressIn={() => {
                router.back();
              }}
            >
              <ArrowLeft color={colors.slate[500]} />
            </Pressable>
          )}

          {isOrigin ? (
            <Text className="text-foreground px-5 text-3xl font-bold">Pick Point of Origin</Text>
          ) : (
            <Text className="text-foreground px-5 text-3xl font-bold">Pick Destination</Text>
          )}
        </View>

        <TextInput
          className="bg-secondary text-secondary-foreground placeholder:text-muted m-3 rounded-lg p-3 align-top"
          textAlignVertical="center"
          placeholder="Search for exit name or expressway"
          value={input}
          onChangeText={(text) => setInput(text)}
        />
      </View>

      <View className="flex flex-1 flex-col pb-16 pt-5">
        <ScrollView>
          {filteredPoints.map((point, index) => (
            <Pressable
              className={twMerge(
                'border-t-secondary active:bg-secondary flex flex-row items-center justify-between border-t p-5 transition-all duration-100',
                index === filteredPoints.length - 1 && 'border-b-secondary border-b'
              )}
              key={point.id}
              onPress={() => {
                if (isOrigin) setOrigin(point);
                else setDestination(point);
                router.back();
              }}
            >
              <Text className="text-foreground text-2xl font-bold">{point.name}</Text>
              <Text className="text-1xl font-bold text-slate-500">{point.expresway_id}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
