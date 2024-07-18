import { SafeAreaView, View, Text, TextInput, ScrollView, Pressable } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useAllPointsStore, useOriginStore } from '@/lib/stores';
import { useEffect, useState } from 'react';

export default function Selector() {
  const params = useLocalSearchParams();
  const { allPoints } = useAllPointsStore();
  const { setOrigin } = useOriginStore();

  const [input, setInput] = useState('');
  const [filteredPoints, setFilteredPoints] = useState(allPoints);

  useEffect(() => {
    setFilteredPoints(
      allPoints.filter((point) => point.name.toLowerCase().includes(input.toLowerCase()))
    );
  }, [input]);

  return (
    <SafeAreaView className="bg-background min-h-screen">
      <View className="flex flex-col">
        <Text className="text-foreground px-5 pt-5 text-3xl font-bold">Pick Point of Origin</Text>

        <TextInput
          className="bg-secondary text-secondary-foreground m-3 rounded-lg p-3 align-top"
          textAlignVertical="center"
          placeholder="Search for exit name or expressway"
          value={input}
          onChangeText={(text) => setInput(text)}
        />
      </View>

      <View className="flex flex-1 flex-col pb-16 pt-5">
        <ScrollView>
          {filteredPoints.map((point) => (
            <Pressable
              className="border-t-secondary flex flex-row items-center justify-between border-t p-5"
              key={point.id}
              onPress={() => {
                setOrigin(point);
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
