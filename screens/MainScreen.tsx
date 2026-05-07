import { Pressable, StyleSheet, Text, View, TextInput } from 'react-native';
import { TriviaQuestionType } from '../services/triviaApi';

interface CategoryOption {
  id: number;
  label: string;
}

interface Props {
  playerName: string;
  selectedCategoryId: number;
  selectedDifficulty: 'easy' | 'medium' | 'hard';
  selectedQuestionType: TriviaQuestionType;
  categories: CategoryOption[];
  onChangePlayerName: (value: string) => void;
  onSelectCategory: (categoryId: number) => void;
  onSelectDifficulty: (difficulty: 'easy' | 'medium' | 'hard') => void;
  onSelectQuestionType: (type: TriviaQuestionType) => void;
  onStart: () => void;
}

const difficulties: Array<'easy' | 'medium' | 'hard'> = ['easy', 'medium', 'hard'];
const questionTypes: TriviaQuestionType[] = ['any', 'multiple', 'boolean'];

export default function MainScreen({
  playerName,
  selectedCategoryId,
  selectedDifficulty,
  selectedQuestionType,
  categories,
  onChangePlayerName,
  onSelectCategory,
  onSelectDifficulty,
  onSelectQuestionType,
  onStart,
}: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quiz App</Text>

      <TextInput
        value={playerName}
        onChangeText={onChangePlayerName}
        placeholder="Your name"
        placeholderTextColor="#888"
        style={styles.input}
      />

      <Text style={styles.sectionTitle}>Category</Text>
      <View style={styles.optionsWrap}>
        {categories.map((category) => {
          const active = category.id === selectedCategoryId;
          return (
            <Pressable
              key={category.id}
              style={[styles.optionButton, active && styles.optionButtonActive]}
              onPress={() => onSelectCategory(category.id)}
            >
              <Text style={[styles.optionText, active && styles.optionTextActive]}>
                {category.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.sectionTitle}>Difficulty</Text>
      <View style={styles.optionsWrap}>
        {difficulties.map((item) => {
          const active = item === selectedDifficulty;
          return (
            <Pressable
              key={item}
              style={[styles.optionButton, active && styles.optionButtonActive]}
              onPress={() => onSelectDifficulty(item)}
            >
              <Text style={[styles.optionText, active && styles.optionTextActive]}>
                {item.toUpperCase()}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.sectionTitle}>Question type</Text>
      <View style={styles.optionsWrap}>
        {questionTypes.map((item) => {
          const active = item === selectedQuestionType;
          return (
            <Pressable
              key={item}
              style={[styles.optionButton, active && styles.optionButtonActive]}
              onPress={() => onSelectQuestionType(item)}
            >
              <Text style={[styles.optionText, active && styles.optionTextActive]}>
                {item.toUpperCase()}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Pressable style={styles.startButton} onPress={onStart}>
        <Text style={styles.startButtonText}>Start Quiz</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    paddingHorizontal: 20,
    paddingTop: 90,
  },
  title: {
    color: '#fff',
    fontSize: 34,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 18,
  },
  input: {
    backgroundColor: '#1f1f1f',
    borderColor: '#333',
    borderWidth: 1,
    borderRadius: 10,
    color: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 18,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  optionsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  optionButton: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: '#1f1f1f',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#333',
  },
  optionButtonActive: {
    borderColor: '#E85A4F',
    backgroundColor: '#2a1a18',
  },
  optionText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  optionTextActive: {
    color: '#FFB4AE',
  },
  startButton: {
    marginTop: 10,
    backgroundColor: '#E85A4F',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  startButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
});