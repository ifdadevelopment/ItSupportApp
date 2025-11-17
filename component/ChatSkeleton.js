import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated, Dimensions, LinearGradient } from "react-native";

const SCREEN_WIDTH = Dimensions.get("window").width;

export default function ChatSkeleton({ lines = 6 }) {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const translateX = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-SCREEN_WIDTH, SCREEN_WIDTH],
  });

  return (
    <View style={styles.container}>
      {Array.from({ length: lines }).map((_, i) => {
        const isMine = i % 2 === 0;
        return (
          <View key={i} style={[styles.row, { justifyContent: isMine ? "flex-end" : "flex-start" }]}>
            {!isMine && <View style={styles.avatar} />}
            <View
              style={[
                styles.bubble,
                { width: `${Math.floor(Math.random() * 25 + 60)}%` },
              ]}
            >
              <Animated.View
                style={[
                  styles.shimmer,
                  { transform: [{ translateX }] },
                ]}
              />
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 8,
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#e6e6e6",
    marginRight: 8,
  },
  bubble: {
    height: 100,
    borderRadius: 16,
    backgroundColor: "#e6e6e6",
    overflow: "hidden",
  },
  shimmer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.5)",
  },
});
