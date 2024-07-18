import { SafeAreaView, View, Text, TextInput, ScrollView } from 'react-native';
import allPoints from '../../data/points.json';
import { useLocalSearchParams } from 'expo-router';

export default function Selector() {
  const params = useLocalSearchParams();
  console.log(params);

  return (
    <SafeAreaView className="bg-background min-h-screen">
      <View className="flex flex-col">
        <Text className="text-foreground px-5 pt-5 text-3xl font-bold">Pick Point of Origin</Text>

        <TextInput
          className="bg-secondary text-secondary-foreground m-3 rounded-lg p-3 align-top"
          textAlignVertical="center"
          placeholder="Search for exit name or expressway"
        />
      </View>

      <View className="flex flex-1 flex-col pb-16 pt-5">
        <ScrollView>
          {allPoints.map((point) => (
            <View
              className="border-t-secondary flex flex-row items-center justify-between border-t p-5"
              key={point.id}
            >
              <Text className="text-foreground text-2xl font-bold">{point.name}</Text>
              <Text className="text-1xl font-bold text-slate-500">{point.expresway_id}</Text>
            </View>
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
