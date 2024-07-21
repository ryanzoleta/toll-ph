import { TripResult, useSavedTrips } from '@/lib/stores';
import { formatAmountToCurrency } from '@/lib/utils';
import { router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { useState } from 'react';
import { Alert, Pressable, SafeAreaView, ScrollView, Text, View } from 'react-native';
import colors from 'tailwindcss/colors';
import SafeViewAndroid from '../components/SafeAreaView';

function index() {
  const { savedTrips } = useSavedTrips();

  return (
    <SafeAreaView
      className="bg-background flex min-h-screen flex-col gap-3"
      style={SafeViewAndroid.AndroidSafeArea}
    >
      <View className="flex flex-row items-center gap-5 px-5 ">
        <Pressable
          className="transition-opacity duration-100 active:opacity-50"
          onPressIn={() => {
            router.back();
          }}
        >
          <ArrowLeft color={colors.slate[500]} />
        </Pressable>
        <Text className="text-foreground text-4xl font-extrabold tracking-tight">Saved Trips</Text>
      </View>

      <ScrollView>
        <View className="flex flex-1 flex-col gap-3 p-5">
          {savedTrips.length === 0 && (
            <View>
              <Text className="text-muted text-center">Your saved trips will appear here</Text>
            </View>
          )}

          {savedTrips.map((trip) => {
            return <Trip trip={trip} key={trip.id} />;
          })}
        </View>
      </ScrollView>

      <View>
        <Text className="text-muted py-3 text-center">
          {'Total: ' +
            formatAmountToCurrency(savedTrips.reduce((acc, val) => acc + val.totalFee, 0))}
        </Text>
      </View>
    </SafeAreaView>
  );
}

type TripProps = {
  trip: TripResult;
};

function Trip({ trip }: TripProps) {
  const [expanded, setExpanded] = useState(false);
  const { savedTrips, setSavedTrips } = useSavedTrips();

  return (
    <View className="tripContainer bg-card flex flex-col gap-5 rounded-lg  p-5 ">
      <View className="flex w-full flex-row items-center justify-between">
        <View className="mr-5 flex flex-1 flex-row items-center justify-between gap-2 text-sm ">
          <View className="flex flex-1 flex-col items-center">
            <Text className="text-muted">{trip.tollSegments[0].entryPoint.expresway_id}</Text>
            <Text className="text-foreground text-center font-bold">
              {trip.tollSegments[0].entryPoint.name}
            </Text>
          </View>

          <Text className="flex-1 text-center text-slate-500">→</Text>

          <View className="flex flex-1 flex-col items-center">
            <Text className="text-muted">
              {trip.tollSegments[trip.tollSegments.length - 1].exitPoint.expresway_id}
            </Text>
            <Text className="text-foreground text-center font-bold">
              {trip.tollSegments[trip.tollSegments.length - 1].exitPoint.name}
            </Text>
          </View>
        </View>

        <View className="flex flex-col items-center">
          <Text className="text-foreground text-right text-lg font-bold">
            {formatAmountToCurrency(trip.totalFee)}
          </Text>

          <Pressable
            className="transition-opacity duration-100 active:opacity-60"
            onPress={() => {
              setExpanded(!expanded);
            }}
          >
            <Text className="text-muted text-sm">{expanded ? 'hide details' : 'see details'}</Text>
          </Pressable>
        </View>
      </View>

      {expanded && (
        <View className="flex w-full flex-col gap-3">
          <View className="flex w-full flex-col text-sm">
            {trip.tollSegments.map((segment, index) => (
              <View className="flex flex-row justify-between" key={index}>
                {segment.entryPoint.id === segment.exitPoint.id ? (
                  <Text className="flex-1 text-center">{segment.entryPoint.name}</Text>
                ) : (
                  <View className="flex flex-row gap-2">
                    <Text className="text-foreground text-sm">{segment.entryPoint.name}</Text>
                    <Text className="text-sm text-slate-500">→</Text>
                    <Text className="text-foreground text-sm">{segment.exitPoint.name}</Text>
                    <Text className="text-sm text-slate-500">
                      ({segment.entryPoint.expresway_id})
                    </Text>
                  </View>
                )}

                <View className="flex flex-1 flex-row items-center gap-2">
                  <Text className="text-muted flex-1 text-right text-sm">
                    {formatAmountToCurrency(segment.fee)}
                  </Text>

                  {segment.entryPoint.rfid === 'AUTOSWEEP' ? (
                    <View className=" ">
                      <Text className="text-right font-mono text-sm text-green-500">A</Text>
                    </View>
                  ) : (
                    <View className="">
                      <Text className="text-right font-mono text-sm text-blue-500">E</Text>
                    </View>
                  )}
                </View>
              </View>
            ))}
          </View>

          <View className="flex flex-row justify-between">
            <Text className="text-muted text-left text-sm">Class {trip.vehicleClass}</Text>

            <Pressable
              className="text-right text-sm transition-opacity duration-100 active:opacity-60"
              onPress={() => {
                Alert.alert('Delete Trip', 'Are you sure you want to delete this trip?', [
                  {
                    text: 'Cancel',
                    style: 'cancel',
                  },

                  {
                    text: 'Delete',
                    onPress: () => {
                      setSavedTrips(savedTrips.filter((t) => t.id !== trip.id));
                    },
                    style: 'destructive',
                  },
                ]);
              }}
            >
              <Text className="text-muted text-sm">Delete</Text>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}

export default index;
