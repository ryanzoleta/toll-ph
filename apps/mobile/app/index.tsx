import { Link, router } from 'expo-router';
import { ChevronDown, Moon, Sun, X } from 'lucide-react-native';
import { Pressable, SafeAreaView, ScrollView, Text, View } from 'react-native';
import { useColorScheme } from 'nativewind';
import colors from 'tailwindcss/colors';
import { ReactNode, useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import {
  Point,
  TollSegment,
  useAllPointsStore,
  useReachables,
  useSavedTrips,
  useSelectedPoints,
} from '@/lib/stores';
import tollMatrix from '../data/toll_matrix.json';
import connections from '../data/connections.json';
import Toast from 'react-native-root-toast';
import { formatAmountToCurrency } from '@/lib/utils';
import AsyncStorage from '@react-native-async-storage/async-storage';

function index() {
  const { colorScheme, setColorScheme } = useColorScheme();

  const { origin, destination, setDestination, setOrigin } = useSelectedPoints();
  const { allPoints } = useAllPointsStore();

  const [tollSegments, setTollSegments] = useState<TollSegment[]>([]);
  const [tollFee, setTollFee] = useState(0);
  const [savedResult, setSavedResult] = useState(false);
  const [externalConnections, setExternalConnections] = useState<
    ReturnType<typeof getExternalConnections>
  >([]);
  const { setReachables } = useReachables();

  const { savedTrips, fetchSavedTrips, setSavedTrips } = useSavedTrips();

  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    async function getStoredTheme() {
      const theme = await AsyncStorage.getItem('theme');
      if (theme === 'dark' || theme === 'light') {
        setColorScheme(theme);
      }
    }

    getStoredTheme();
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded && colorScheme) {
      AsyncStorage.setItem('theme', colorScheme);
    }
  }, [colorScheme]);

  useEffect(() => {
    fetchSavedTrips();
  }, []);

  function fetchPoint(id: number) {
    return allPoints.find((p) => p.id === id);
  }

  function queryTollMatrix(origin: Point | undefined, destination: Point) {
    if (!origin) return 0;

    let matrix = tollMatrix.find(
      (tm) =>
        tm.entry_point_id === origin.id &&
        tm.exit_point_id === destination.id &&
        tm.vehicle_class === 1
    );

    if (matrix !== null && matrix !== undefined) return matrix.fee;

    matrix = tollMatrix.find(
      (tm) =>
        tm.entry_point_id === destination.id &&
        tm.exit_point_id === origin.id &&
        tm.reversible &&
        tm.vehicle_class === 1
    );
    return matrix?.fee ?? 0;
  }

  function getExternalConnections(reachablePointIds: number[]) {
    const conn = connections
      .filter((c) => reachablePointIds.includes(c.point_id))
      .map((c) => ({
        reachableConnectedPoint: fetchPoint(c.point_id),
        externalConnectedPoint: fetchPoint(c.connecting_point_id),
      }));

    const connReversed = connections
      .filter((c) => reachablePointIds.includes(c.connecting_point_id))
      .map((c) => ({
        reachableConnectedPoint: fetchPoint(c.connecting_point_id),
        externalConnectedPoint: fetchPoint(c.point_id),
      }));

    return [...conn, ...connReversed];
  }

  function getReachables(pointId: number | undefined) {
    if (!pointId) return [];

    const returnValue = [
      ...tollMatrix
        .filter((tm) => tm.entry_point_id === pointId)
        .map((tm) => allPoints.find((p) => p.id === tm.exit_point_id)),
      ...tollMatrix
        .filter((tm) => tm.exit_point_id === pointId && tm.reversible)
        .map((tm) => allPoints.find((p) => p.id === tm.entry_point_id)),
    ];

    // this is crazy, but this is needed to allow southbound connections to NAIAX (e.g., Skyway Buendia to NAIAX)
    if (pointId === 1) {
      const point1 = allPoints.find((p) => p.id === 1);
      if (point1) {
        returnValue.push(point1);
      }
    }

    return returnValue;
  }

  function calculate() {
    if (!origin || !destination) return;

    let _tollSegments: TollSegment[] = [];
    let _tollFee = 0;

    setSavedResult(false);

    if (origin.toll_network_name === destination.toll_network_name) {
      _tollSegments = [
        {
          entryPoint: { ...origin },
          exitPoint: { ...destination },
          fee: queryTollMatrix(origin, destination),
        },
      ];

      _tollFee = queryTollMatrix(origin, destination);
    } else {
      let currentDestination = destination;
      // const externalConnections = getExternalConnections([origin.id]);

      for (let i = 0; i < externalConnections.length; i++) {
        const conn = { ...externalConnections[i] };

        if (currentDestination.toll_network_name === origin.toll_network_name) {
          const fee = queryTollMatrix(origin, currentDestination);
          _tollSegments = [
            {
              entryPoint: { ...origin },
              exitPoint: { ...currentDestination },
              fee,
            },
            ..._tollSegments,
          ];
          _tollFee += fee;

          break;
        } else {
          const connReachables = getReachables(conn.externalConnectedPoint?.id);
          const connReachableIds = connReachables.map((c) => c?.id);

          if (connReachableIds.includes(currentDestination.id)) {
            const fee = queryTollMatrix(conn.externalConnectedPoint, currentDestination);
            _tollSegments = [
              {
                entryPoint: { ...(conn.externalConnectedPoint as Point) },
                exitPoint: { ...currentDestination },
                fee,
              },
              ..._tollSegments,
            ];
            _tollFee += fee;
            currentDestination = { ...(conn.reachableConnectedPoint as Point) };

            i = -1;
          }
        }
      }
    }

    setTollFee(_tollFee);
    setTollSegments(_tollSegments);

    if (_tollFee === 0 && _tollSegments.length === 0) {
      Toast.show('Destination is unreachable from origin.', {
        backgroundColor: colors.red[800],
        textColor: colors.red[100],
      });
    }
  }

  useEffect(() => {
    const originReachables = getReachables(origin?.id ?? 0);
    const originReachablesPointIds = originReachables.map((c) => c?.id);

    let _externalConnections: typeof externalConnections = [];
    _externalConnections = getExternalConnections(originReachablesPointIds as number[]);
    let tempExternalConnections = [..._externalConnections];

    while (tempExternalConnections.length > 0) {
      const l = [...tempExternalConnections];
      tempExternalConnections = [];
      for (const conn of [...l]) {
        const connReachables = getReachables(conn.externalConnectedPoint?.id);
        const connReachableIds = connReachables.map((c) => c?.id);

        const connExternalConnections = getExternalConnections(connReachableIds as number[]).filter(
          (c) => {
            return !_externalConnections.some(
              (ec) => ec.externalConnectedPoint?.id === c.externalConnectedPoint?.id
            );
          }
        );
        _externalConnections = [..._externalConnections, ...connExternalConnections];
        tempExternalConnections = [...tempExternalConnections, ...connExternalConnections];
      }
    }

    setExternalConnections(_externalConnections);

    const _externalReachables = _externalConnections
      .map((c) => getReachables(c.externalConnectedPoint?.id))
      .reduce((acc, val) => acc.concat(val), []);

    const _reachables = [...originReachables, ..._externalReachables]
      .map((c) => allPoints.find((p) => p.id === c?.id) ?? c)
      .reduce((acc, val) => {
        if (!acc.find((p) => p.id === val?.id)) acc.push(val as Point);
        return acc;
      }, [] as Point[]);

    console.log('reachables', _reachables.length);

    setReachables(_reachables);
  }, [origin, destination]);

  return (
    <SafeAreaView className="bg-background flex min-h-screen flex-col gap-3">
      <View className="flex flex-row items-center justify-between px-5 ">
        <Text className="text-foreground text-4xl font-extrabold tracking-tight">toll.ph</Text>

        <View className="flex h-full flex-row items-center gap-5">
          <Link
            href="/saved"
            className="text-foreground text-lg transition-opacity duration-100 active:opacity-70"
          >
            Saved
          </Link>

          <Pressable
            onPressIn={() => {
              if (colorScheme === 'dark') {
                setColorScheme('light');
              } else {
                setColorScheme('dark');
              }
            }}
            className="flex h-full flex-row items-center px-2 transition-opacity duration-100 active:opacity-50"
          >
            {colorScheme === 'dark' ? (
              <Sun color={colors.slate[500]} />
            ) : (
              <Moon color={colors.slate[500]} />
            )}
          </Pressable>
        </View>
      </View>

      <ScrollView>
        <View className="flex flex-col gap-5 px-5 py-3 pb-10">
          <View>
            <Text className="text-muted">
              Use this to calculate the toll fee for a trip from anywhere in the entire Luzon
              expressway network, form Baguio, to Manila, to Batangas
            </Text>
          </View>

          <View>
            <View className="flex flex-col gap-1">
              <FormLabel>Vehicle Class</FormLabel>

              <Pressable
                className="bg-secondary flex flex-row items-center justify-between rounded-md p-3 transition-opacity duration-100 active:opacity-60 "
                onPress={() => {
                  Toast.show('Currently only supports Class 1 vehicles.', {
                    backgroundColor: colors.red[800],
                    textColor: colors.red[100],
                  });
                }}
              >
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
                  'bg-secondary relative flex flex-row items-center justify-between rounded-md p-3 transition-opacity duration-100 active:opacity-80'
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
                className="bg-secondary relative flex flex-row items-center justify-between rounded-md p-3 transition-opacity duration-100 active:opacity-80"
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
            <Pressable
              className="bg-success rounded-lg p-3 transition-opacity duration-100 active:opacity-90"
              onPress={calculate}
            >
              <Text className="text-success-foreground text-center text-xl font-bold">
                Calculate
              </Text>
            </Pressable>

            <Pressable
              className="bg-secondary rounded-lg p-3 transition-opacity duration-100 active:opacity-90"
              onPress={() => {
                setTollFee(0);
                setTollSegments([]);
                setDestination(null);
                setOrigin(null);
              }}
            >
              <Text className="text-center text-xl font-bold text-slate-500">Clear</Text>
            </Pressable>
          </View>

          {tollFee > 0 && (
            <View className="bg-card mb-10 rounded-lg p-3">
              <View className="flex flex-col gap-3">
                <Text className="text-xl text-slate-500">Total Toll Fee</Text>
                <Text className="text-foreground text-5xl font-extrabold tracking-tighter">
                  {formatAmountToCurrency(tollFee)}
                </Text>

                <View className="flex flex-col gap-1">
                  {tollSegments.map((ts, i) => (
                    <View key={i} className="flex flex-row justify-between">
                      <View className="flex flex-row gap-1">
                        <Text className="text-foreground">{ts.entryPoint.name}</Text>
                        <Text className="text-slate-500">→</Text>
                        <Text className="text-foreground">{ts.exitPoint.name}</Text>
                        <Text className="text-muted">({ts.entryPoint.expresway_id})</Text>
                      </View>

                      <View className="flex flex-row items-center gap-1">
                        <Text className="text-foreground">{formatAmountToCurrency(ts.fee)}</Text>

                        {ts.entryPoint.rfid === 'AUTOSWEEP' ? (
                          <Pressable
                            className="bg-success rounded-lg px-2 py-1"
                            onPressIn={() => {
                              Toast.show('AutoSweep RFID');
                            }}
                          >
                            <Text className=" text-success-foreground text-xs">A</Text>
                          </Pressable>
                        ) : (
                          <Pressable
                            className="bg-easytrip rounded-lg px-2 py-1 "
                            onPressIn={() => {
                              Toast.show('EasyTrip RFID');
                            }}
                          >
                            <Text className=" text-easytrip-foreground text-xs ">E</Text>
                          </Pressable>
                        )}
                      </View>
                    </View>
                  ))}
                </View>

                {savedResult ? (
                  <View className="rounded-lg p-2 transition-opacity duration-100 ">
                    <Text className="text-muted text-center text-lg ">Saved!</Text>
                  </View>
                ) : (
                  <Pressable
                    className="bg-secondary rounded-lg p-2 transition-opacity duration-100 active:opacity-90"
                    onPress={() => {
                      if (savedResult) return;

                      Toast.show('Saved trip');
                      setSavedResult(true);
                      setSavedTrips([
                        ...savedTrips,
                        {
                          id: Math.floor(Date.now() / 1000),
                          totalFee: tollFee,
                          tollSegments,
                          vehicleClass: 1,
                        },
                      ]);
                    }}
                  >
                    <Text className="text-secondary-foreground text-center text-lg font-bold ">
                      Save
                    </Text>
                  </Pressable>
                )}
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function FormLabel({ children }: { children: ReactNode }) {
  return <Text className="text-foreground text-lg font-bold">{children}</Text>;
}

export default index;
