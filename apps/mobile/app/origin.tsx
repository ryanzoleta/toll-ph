import { SafeAreaView, View, Text } from 'react-native';

export default function SelectOrigin() {
  return (
    <SafeAreaView className="bg-background min-h-screen">
      <View className="flex flex-col gap-5">
        <Text className="text-foreground p-5 text-3xl font-bold">Pick Point of Origin</Text>
      </View>
    </SafeAreaView>
  );
}
