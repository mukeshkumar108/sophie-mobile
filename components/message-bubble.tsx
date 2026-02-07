import { Colors } from "@/constants/colors";
import { Message } from "@/types";
import React, { useEffect, useRef, useState } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import * as Haptics from "expo-haptics";

interface MessageBubbleProps {
  message: Message;
  onReplayAudio?: (audioUrl: string) => void;
  onCopyText?: (text: string) => void;
  isNew?: boolean;
}

function AnimatedDots() {
  const dot1Opacity = useRef(new Animated.Value(0.3)).current;
  const dot2Opacity = useRef(new Animated.Value(0.3)).current;
  const dot3Opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animateDot = (dot: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(dot, {
            toValue: 0.3,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.delay(600 - delay),
        ]),
      );
    };

    const anim1 = animateDot(dot1Opacity, 0);
    const anim2 = animateDot(dot2Opacity, 200);
    const anim3 = animateDot(dot3Opacity, 400);

    anim1.start();
    anim2.start();
    anim3.start();

    return () => {
      anim1.stop();
      anim2.stop();
      anim3.stop();
    };
  }, [dot1Opacity, dot2Opacity, dot3Opacity]);

  return (
    <View style={styles.dotsContainer}>
      <Animated.View style={[styles.dot, { opacity: dot1Opacity }]} />
      <Animated.View style={[styles.dot, { opacity: dot2Opacity }]} />
      <Animated.View style={[styles.dot, { opacity: dot3Opacity }]} />
    </View>
  );
}

// Line-style speaker icon
function SpeakerIcon() {
  return (
    <View style={styles.iconContainer}>
      <View style={styles.speakerBody} />
      <View style={styles.speakerCone} />
      <View style={[styles.soundWave, styles.soundWave1]} />
      <View style={[styles.soundWave, styles.soundWave2]} />
    </View>
  );
}

// Line-style copy icon
function CopyIcon() {
  return (
    <View style={styles.iconContainer}>
      <View style={styles.copyBack} />
      <View style={styles.copyFront} />
    </View>
  );
}

export function MessageBubble({
  message,
  onReplayAudio,
  onCopyText,
  isNew = false,
}: MessageBubbleProps) {
  const isUser = message.role === "user";
  const [phase, setPhase] = useState<"dots" | "typing" | "complete">(
    isNew && !isUser ? "dots" : "complete",
  );
  const [displayedWords, setDisplayedWords] = useState<string[]>([]);
  const [showCopiedToast, setShowCopiedToast] = useState(false);
  const words = message.content.split(" ");
  const typingSpeed = 80; // ms per word

  useEffect(() => {
    if (!isNew || isUser) {
      setPhase("complete");
      return;
    }

    // Phase 1: Show dots for 2 seconds
    const dotsTimer = setTimeout(() => {
      setPhase("typing");
    }, 2000);

    return () => clearTimeout(dotsTimer);
  }, [isNew, isUser]);

  useEffect(() => {
    if (phase !== "typing") return;

    // Phase 2: Reveal words one by one
    let wordIndex = 0;
    setDisplayedWords([]);

    const typingInterval = setInterval(() => {
      if (wordIndex < words.length) {
        setDisplayedWords((prev) => [...prev, words[wordIndex]]);
        wordIndex++;
      } else {
        clearInterval(typingInterval);
        setPhase("complete");
      }
    }, typingSpeed);

    return () => clearInterval(typingInterval);
  }, [phase, words.length]);

  const handleCopy = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onCopyText?.(message.content);
    setShowCopiedToast(true);
    setTimeout(() => setShowCopiedToast(false), 1500);
  };

  const handleReplay = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onReplayAudio?.(message.audioUrl!);
  };

  const renderContent = () => {
    if (phase === "dots") {
      return <AnimatedDots />;
    }

    const textToShow =
      phase === "typing" ? displayedWords.join(" ") : message.content;

    return (
      <Text
        style={[styles.text, isUser ? styles.userText : styles.assistantText]}
      >
        {textToShow}
        {phase === "typing" && <Text style={styles.cursor}>|</Text>}
      </Text>
    );
  };

  const showActions = phase === "complete" && !isUser;

  return (
    <View
      style={[
        styles.container,
        isUser ? styles.userContainer : styles.assistantContainer,
      ]}
    >
      <View
        style={[
          styles.bubble,
          isUser ? styles.userBubble : styles.assistantBubble,
          phase === "dots" && styles.bubbleDots,
        ]}
      >
        {renderContent()}
      </View>

      {showActions && (
        <View style={styles.actionsContainer}>
          {message.audioUrl && onReplayAudio && (
            <Pressable
              onPress={handleReplay}
              style={styles.actionButton}
              hitSlop={8}
            >
              <SpeakerIcon />
            </Pressable>
          )}
          <Pressable
            onPress={handleCopy}
            style={styles.actionButton}
            hitSlop={8}
          >
            <CopyIcon />
          </Pressable>
          {showCopiedToast && (
            <View style={styles.toast}>
              <Text style={styles.toastText}>Copied</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 6,
    marginHorizontal: 16,
  },
  userContainer: {
    alignItems: "flex-end",
  },
  assistantContainer: {
    alignItems: "flex-start",
  },
  bubble: {
    maxWidth: "80%",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 20,
  },
  bubbleDots: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  userBubble: {
    backgroundColor: "#EBEBF0",
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    backgroundColor: Colors.sophieBubble,
    borderBottomLeftRadius: 4,
    shadowColor: "rgba(0,0,0,0.1)",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 3,
  },
  text: {
    fontSize: 16,
    lineHeight: 24,
  },
  userText: {
    color: Colors.userBubbleText,
  },
  assistantText: {
    color: Colors.sophieBubbleText,
  },
  cursor: {
    color: Colors.sophieBubbleText,
    opacity: 0.6,
  },
  dotsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    height: 24,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.sophieBubbleText,
  },
  actionsContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    marginLeft: 8,
    gap: 8,
  },
  actionButton: {
    padding: 4,
    opacity: 0.5,
  },
  iconContainer: {
    width: 20,
    height: 20,
    position: "relative",
  },
  // Speaker icon styles
  speakerBody: {
    position: "absolute",
    left: 2,
    top: 6,
    width: 5,
    height: 8,
    backgroundColor: Colors.textSecondary,
    borderRadius: 1,
  },
  speakerCone: {
    position: "absolute",
    left: 5,
    top: 4,
    width: 0,
    height: 0,
    borderTopWidth: 6,
    borderBottomWidth: 6,
    borderLeftWidth: 6,
    borderTopColor: "transparent",
    borderBottomColor: "transparent",
    borderLeftColor: Colors.textSecondary,
  },
  soundWave: {
    position: "absolute",
    borderWidth: 1.5,
    borderColor: Colors.textSecondary,
    borderLeftColor: "transparent",
    borderRadius: 10,
  },
  soundWave1: {
    left: 12,
    top: 5,
    width: 6,
    height: 10,
  },
  soundWave2: {
    left: 15,
    top: 3,
    width: 6,
    height: 14,
  },
  // Copy icon styles
  copyBack: {
    position: "absolute",
    left: 4,
    top: 0,
    width: 12,
    height: 14,
    borderWidth: 1.5,
    borderColor: Colors.textSecondary,
    borderRadius: 2,
    backgroundColor: Colors.background,
  },
  copyFront: {
    position: "absolute",
    left: 0,
    top: 4,
    width: 12,
    height: 14,
    borderWidth: 1.5,
    borderColor: Colors.textSecondary,
    borderRadius: 2,
    backgroundColor: Colors.background,
  },
  toast: {
    position: "absolute",
    left: 50,
    top: -4,
    backgroundColor: Colors.sophieBubble,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  toastText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: "500",
  },
});
