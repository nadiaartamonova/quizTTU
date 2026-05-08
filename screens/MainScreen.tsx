import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
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

const MAX_NAME_LENGTH = 20;
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
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const selectedCategory = categories.find((item) => item.id === selectedCategoryId);

  const normalizeName = (value: string): string => {
    // убираем ведущие пробелы и ограничиваем длину
    const noLeading = value.replace(/^\s+/, '');
    return noLeading.slice(0, MAX_NAME_LENGTH);
  };

  const handleNameChange = (value: string) => {
    onChangePlayerName(normalizeName(value));
  };

  const handleStart = () => {
    const normalized = playerName.trim().slice(0, MAX_NAME_LENGTH);
    onChangePlayerName(normalized.length > 0 ? normalized : 'Player');
    onStart();
  };

  const handleSelectCategory = (categoryId: number) => {
    onSelectCategory(categoryId);
    setIsCategoryOpen(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quiz App</Text>

      <TextInput
        value={playerName}
        onChangeText={handleNameChange}
        placeholder="Your name"
        placeholderTextColor="#888"
        style={styles.input}
        maxLength={MAX_NAME_LENGTH}
        autoCorrect={false}
        autoCapitalize="words"
      />

      <Text style={styles.hint}>
        Name: {playerName.trim().length || 0}/{MAX_NAME_LENGTH}
      </Text>

      <Text style={styles.sectionTitle}>Category</Text>
      <Pressable style={styles.dropdownContainer} onPress={() => setIsCategoryOpen((prev) => !prev)}>
        <Text style={styles.dropdownValue}>{selectedCategory?.label ?? 'Select category'}</Text>
        <Text style={styles.dropdownArrow}>{isCategoryOpen ? '▲' : '▼'}</Text>
      </Pressable>

      {isCategoryOpen && (
        <View style={styles.dropdownList}>
          {categories.map((category) => {
            const active = category.id === selectedCategoryId;
            return (
              <Pressable
                key={category.id}
                style={[styles.dropdownItem, active && styles.dropdownItemActive]}
                onPress={() => handleSelectCategory(category.id)}
              >
                <Text style={[styles.dropdownItemText, active && styles.dropdownItemTextActive]}>
                  {category.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      )}

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

      <Pressable style={styles.startButton} onPress={handleStart}>
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
    marginBottom: 6,
  },
  hint: {
    color: '#888',
    fontSize: 12,
    marginBottom: 12,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  dropdownContainer: {
    backgroundColor: '#1f1f1f',
    borderColor: '#333',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dropdownValue: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  dropdownArrow: {
    color: '#888',
    fontSize: 12,
    marginLeft: 8,
  },
  dropdownList: {
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 20,
  },
  dropdownItem: {
    backgroundColor: '#1f1f1f',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#2c2c2c',
  },
  dropdownItemActive: {
    backgroundColor: '#2a1a18',
  },
  dropdownItemText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  dropdownItemTextActive: {
    color: '#FFB4AE',
    fontWeight: '700',
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
