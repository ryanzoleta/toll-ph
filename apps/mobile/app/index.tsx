import { Link, router } from 'expo-router';
import { ChevronDown, Moon, Sun, X } from 'lucide-react-native';
import { Pressable, SafeAreaView, ScrollView, Text, View } from 'react-native';
import { useColorScheme } from 'nativewind';
import colors from 'tailwindcss/colors';
import { ReactNode, useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { Point, useAllPointsStore, useSelectedPoints } from '@/lib/stores';
import tollMatrix from '../data/toll_matrix.json';
import connections from '../data/connections.json';

export type TollSegment = {
  entryPoint: Point;
  exitPoint: Point;
  fee: number;
};

function index() {
  const { colorScheme, toggleColorScheme } = useColorScheme();

  const { origin, destination, setDestination, setOrigin } = useSelectedPoints();
  const { allPoints } = useAllPointsStore();

  const [tollSegments, setTollSegments] = useState<TollSegment[]>([]);
  const [tollFee, setTollFee] = useState(0);
  const [savedResult, setSavedResult] = useState(false);
  const [externalConnections, setExternalConnections] = useState<
    ReturnType<typeof getExternalConnections>
  >([]);

  function formatAmountToCurrency(amount: number, currencySymbol?: string): string {
    const userLang = navigator.language ?? 'en-US';
    const currencyNumber = new Intl.NumberFormat(userLang, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);

    if (currencySymbol) {
      return `${currencySymbol} ${currencyNumber}`;
    }
    return `₱${currencyNumber}`;
  }

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
      console.log('same toll network');
      setTollSegments([
        {
          entryPoint: { ...origin },
          exitPoint: { ...destination },
          fee: queryTollMatrix(origin, destination),
        },
      ]);

      setTollFee(queryTollMatrix(origin, destination));
    } else {
      console.log('different network');
      console.log(externalConnections.length);
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

      setTollFee(_tollFee);
      setTollSegments(_tollSegments);
    }
  }

  useEffect(() => {
    const originReachables = getReachables(origin?.id ?? 0);
    const originReachablesPointIds = originReachables.map((c) => c?.id);
    console.log(originReachablesPointIds);

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
    console.log(_externalConnections);
  }, [origin, destination]);

  return (
    <SafeAreaView className="bg-background flex min-h-screen flex-col gap-3">
      <View className="flex flex-row items-center justify-between px-5 ">
        <Text className="text-foreground text-4xl font-extrabold tracking-tight">toll.ph</Text>

        <View className="flex h-full flex-row items-center gap-5">
          <Link
            href="/matrix"
            className="text-foreground text-lg transition-opacity duration-100 active:opacity-70"
          >
            Matrix
          </Link>

          <Pressable
            onPressIn={toggleColorScheme}
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
            <Pressable
              className="rounded-lg bg-green-800 p-3 transition-all duration-100 active:opacity-90"
              onPress={calculate}
            >
              <Text className="text-center text-xl font-bold text-green-300">Calculate</Text>
            </Pressable>

            <Pressable
              className="bg-secondary  rounded-lg p-3 transition-all duration-100 active:opacity-90"
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
            <View className="mb-10 rounded-lg bg-slate-900 p-3">
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
                      </View>

                      <View className="flex flex-row gap-1">
                        <Text className="text-foreground">{formatAmountToCurrency(ts.fee)}</Text>

                        {ts.entryPoint.rfid === 'AUTOSWEEP' ? (
                          <View className="rounded-lg bg-green-300 px-2 py-1 dark:bg-green-700 ">
                            <Text className=" text-xs text-green-700 dark:text-green-200">A</Text>
                          </View>
                        ) : (
                          <View className="rounded-lg bg-blue-300 px-2 py-1 dark:bg-blue-700 ">
                            <Text className=" text-xs text-blue-700 dark:text-blue-200">E</Text>
                          </View>
                        )}
                      </View>
                    </View>
                  ))}
                </View>

                <Pressable className="bg-secondary rounded-lg p-2 transition-opacity duration-100 active:opacity-90">
                  <Text className="text-secondary-foreground text-center text-lg font-bold ">
                    Save
                  </Text>
                </Pressable>
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
