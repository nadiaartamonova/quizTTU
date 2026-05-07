import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import type { GameResult } from '../database/db';

interface Props {
  score: number;
  total: number;
  wrongAnswers: number;
  durationSec: number;
  bestResult: GameResult | null;
  lastResults: GameResult[];
  topResults: GameResult[];
  onRestart: () => void;
  onGoToMenu: () => void;
}

export default function ResultScreen({
  score,
  total,
  wrongAnswers,
  durationSec,
  bestResult,
  lastResults,
  topResults,
  onRestart,
  onGoToMenu,
}: Props) {
  const percentage = total > 0 ? ((score / total) * 100).toFixed(2) : '0.00';

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Result</Text>
      <Text style={styles.totalText}>{score}/{total}</Text>
      <Text style={styles.percentText}>{percentage}%</Text>
      <Text style={styles.timeText}>Time: {durationSec}s</Text>

      <View style={styles.sectionBox}>
        <Text style={styles.sectionTitle}>Best</Text>
        {bestResult ? (
          <Text style={styles.bestText}>
            {bestResult.userName}: {bestResult.percentage}% ({bestResult.durationSec}s)
          </Text>
        ) : (
          <Text style={styles.emptyText}>No data yet</Text>
        )}
      </View>

      <View style={styles.sectionBox}>
        <Text style={styles.sectionTitle}>Leaderboard (Top 5)</Text>
        {topResults.length > 0 ? (
          topResults.map((item, index) => (
            <Text key={item.id} style={styles.historyText}>
              {index + 1}. {item.userName} — {item.percentage}% ({item.durationSec}s)
            </Text>
          ))
        ) : (
          <Text style={styles.emptyText}>No records</Text>
        )}
      </View>

      <View style={styles.sectionBox}>
        <Text style={styles.sectionTitle}>Last games</Text>
        {lastResults.length > 0 ? (
          lastResults.map((item) => (
            <Text key={item.id} style={styles.historyText}>
              {item.userName}: {item.score}/{item.total} ({item.percentage}%)
            </Text>
          ))
        ) : (
          <Text style={styles.emptyText}>No history</Text>
        )}
      </View>

      <Text style={styles.meta}>Wrong answers: {wrongAnswers}</Text>

      <Pressable style={styles.restartButton} onPress={onRestart}>
        <Text style={styles.restartButtonText}>Start again</Text>
      </Pressable>

      <Pressable style={styles.menuButton} onPress={onGoToMenu}>
        <Text style={styles.menuButtonText}>Main menu</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#121212',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 35,
  },
  title: { fontSize: 30, fontWeight: 'bold', marginBottom: 12, color: '#fff' },
  totalText: { fontSize: 32, color: '#fff', fontWeight: 'bold' },
  percentText: { fontSize: 22, color: '#FFD54F', marginTop: 6, fontWeight: 'bold' },
  timeText: { fontSize: 18, color: '#bbb', marginTop: 4, marginBottom: 18 },
  sectionBox: {
    width: '100%',
    backgroundColor: '#1e1e1e',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  bestText: { fontSize: 18, color: '#FFD54F', textAlign: 'center', fontWeight: 'bold' },
  historyText: { fontSize: 16, color: '#fff', textAlign: 'left', marginBottom: 6 },
  emptyText: { fontSize: 16, color: '#aaa', textAlign: 'center' },
  meta: { color: '#aaa', marginBottom: 14 },
  restartButton: {
    backgroundColor: '#E85A4F',
    paddingVertical: 12,
    paddingHorizontal: 26,
    borderRadius: 10,
    marginTop: 8,
  },
  restartButtonText: { color: '#fff', fontSize: 17, fontWeight: '700' },
  menuButton: {
    backgroundColor: '#2C2C2C',
    paddingVertical: 12,
    paddingHorizontal: 26,
    borderRadius: 10,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#444',
  },
  menuButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});