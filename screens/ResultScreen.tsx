import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import type { GameResult } from '../database/db';

interface Props {
  score: number;
  total: number;
  wrongAnswers: number;
  bestResult: GameResult | null;
  lastResults: GameResult[];
  onRestart: () => void;
}

export default function ResultScreen({
  score,
  total,
  wrongAnswers,
  bestResult,
  lastResults,
  onRestart,
}: Props) {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Tulemus</Text>

      <Text style={styles.totalText}>
        {score}/{total}
      </Text>

      <View style={styles.statsBox}>
        <Text style={styles.correctText}>Õigeid vastuseid: {score}</Text>
        <Text style={styles.wrongText}>Valesid vastuseid: {wrongAnswers}</Text>
      </View>

      <View style={styles.sectionBox}>
        <Text style={styles.sectionTitle}>Parim tulemus</Text>
        {bestResult ? (
          <Text style={styles.bestText}>
            {bestResult.score}/{bestResult.total}
          </Text>
        ) : (
          <Text style={styles.emptyText}>Tulemusi veel ei ole</Text>
        )}
      </View>

      <View style={styles.sectionBox}>
        <Text style={styles.sectionTitle}>Viimased mängud</Text>
        {lastResults.length > 0 ? (
          lastResults.map((item) => (
            <Text key={item.id} style={styles.historyText}>
              {item.score}/{item.total}
            </Text>
          ))
        ) : (
          <Text style={styles.emptyText}>Ajalugu puudub</Text>
        )}
      </View>

      <Pressable style={styles.restartButton} onPress={onRestart}>
        <Text style={styles.restartButtonText}>Alusta uuesti</Text>
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
    paddingVertical: 40,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#fff',
  },
  totalText: {
    fontSize: 32,
    color: '#fff',
    marginBottom: 30,
    fontWeight: 'bold',
  },
  statsBox: {
    width: '100%',
    backgroundColor: '#1e1e1e',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  sectionBox: {
    width: '100%',
    backgroundColor: '#1e1e1e',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  correctText: {
    fontSize: 22,
    color: '#4CAF50',
    marginBottom: 12,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  wrongText: {
    fontSize: 22,
    color: '#F44336',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  bestText: {
    fontSize: 24,
    color: '#FFD54F',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  historyText: {
    fontSize: 20,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 18,
    color: '#aaa',
    textAlign: 'center',
  },
  restartButton: {
    backgroundColor: '#E85A4F',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
    marginTop: 10,
  },
  restartButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});