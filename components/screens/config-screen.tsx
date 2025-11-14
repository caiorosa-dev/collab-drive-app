import { Colors } from '@/constants/theme';
import React from 'react';
import { Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { GyroscopeConfig } from '../../hooks/use-gyroscope-controller';

interface ConfigScreenProps {
  config: GyroscopeConfig;
  onConfigChange: (config: Partial<GyroscopeConfig>) => void;
  onActivate: () => void;
}

export function ConfigScreen({ config, onConfigChange, onActivate }: ConfigScreenProps) {
  const handleNumberChange = (key: keyof GyroscopeConfig, value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      onConfigChange({ [key]: numValue });
    }
  };

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={true}
    >
      <Text style={styles.title}>Configuração do Controle</Text>
      <Text style={styles.subtitle}>Ajuste os parâmetros antes de ativar</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sensibilidade</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Sensibilidade de Aceleração (°)</Text>
          <Text style={styles.description}>Ângulo para frente/trás para 100% de potência</Text>
          <TextInput
            style={styles.input}
            value={config.maxPitch.toString()}
            onChangeText={(v) => handleNumberChange('maxPitch', v)}
            keyboardType="numeric"
            placeholder="35"
            placeholderTextColor={Colors.light.textMuted}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Sensibilidade de Direção (°)</Text>
          <Text style={styles.description}>Ângulo de rotação lateral para curva máxima</Text>
          <TextInput
            style={styles.input}
            value={config.maxRoll.toString()}
            onChangeText={(v) => handleNumberChange('maxRoll', v)}
            keyboardType="numeric"
            placeholder="25"
            placeholderTextColor={Colors.light.textMuted}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Controle Fino</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Suavização (0-1)</Text>
          <Text style={styles.description}>Maior = movimento mais suave, menor = mais responsivo</Text>
          <TextInput
            style={styles.input}
            value={config.smooth.toString()}
            onChangeText={(v) => handleNumberChange('smooth', v)}
            keyboardType="numeric"
            placeholder="0.3"
            placeholderTextColor={Colors.light.textMuted}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Zona Morta - Aceleração (°)</Text>
          <Text style={styles.description}>Ângulo mínimo para começar a acelerar</Text>
          <TextInput
            style={styles.input}
            value={config.pitchThreshold.toString()}
            onChangeText={(v) => handleNumberChange('pitchThreshold', v)}
            keyboardType="numeric"
            placeholder="3"
            placeholderTextColor={Colors.light.textMuted}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Zona Morta - Direção (°)</Text>
          <Text style={styles.description}>Ângulo mínimo para começar a virar</Text>
          <TextInput
            style={styles.input}
            value={config.rollThreshold.toString()}
            onChangeText={(v) => handleNumberChange('rollThreshold', v)}
            keyboardType="numeric"
            placeholder="2"
            placeholderTextColor={Colors.light.textMuted}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Performance</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Intervalo de Atualização (ms)</Text>
          <Text style={styles.description}>Menor = mais rápido, mas mais bateria</Text>
          <TextInput
            style={styles.input}
            value={config.updateInterval.toString()}
            onChangeText={(v) => handleNumberChange('updateInterval', v)}
            keyboardType="numeric"
            placeholder="50"
            placeholderTextColor={Colors.light.textMuted}
          />
        </View>
      </View>

      <TouchableOpacity style={styles.activateButton} onPress={onActivate}>
        <Text style={styles.activateButtonText}>Ativar Controle</Text>
      </TouchableOpacity>

      <Text style={styles.hint}>
        Segure o aparelho em modo paisagem. Após ativar, calibre a posição neutra para melhor controle.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.light.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  section: {
    backgroundColor: Colors.light.backgroundCard,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.light.text,
    marginBottom: 4,
  },
  description: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.light.background,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 8,
    padding: 12,
    color: Colors.light.text,
    fontSize: 16,
  },
  activateButton: {
    backgroundColor: Colors.light.primary,
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: Colors.light.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  activateButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  hint: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    backgroundColor: Colors.light.backgroundCard,
    padding: 16,
    borderRadius: 8,
  },
});

