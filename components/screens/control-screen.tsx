import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Modal, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/theme';
import { GyroscopeData } from '../../hooks/use-gyroscope-controller';
import { calculateArrowRotation, getThrottleColor } from '../../utils/gyroscope';

interface ControlScreenProps {
  data: GyroscopeData;
  onDeactivate: () => void;
  onCalibrateNeutral: () => void;
}

export function ControlScreen({ data, onDeactivate, onCalibrateNeutral }: ControlScreenProps) {
  const { throttle, steeringAngle } = data;
  const insets = useSafeAreaInsets();
  const [showCalibrationModal, setShowCalibrationModal] = useState(true);

  // Show modal when component mounts (control mode activated)
  useEffect(() => {
    setShowCalibrationModal(true);
  }, []);

  const handleCalibrate = () => {
    onCalibrateNeutral();
    setShowCalibrationModal(false);
  };
  
  const arrowRotation = calculateArrowRotation(throttle, steeringAngle);
  const color = getThrottleColor(throttle);
  const absThrottle = Math.abs(throttle);
  
  // Determine direction text
  let directionText = 'Neutro';
  if (throttle > 10) {
    directionText = 'Frente';
  } else if (throttle < -10) {
    directionText = 'Ré';
  }
  
  // Determine steering text
  let steeringText = 'Centro';
  if (steeringAngle < 80) {
    steeringText = 'Esquerda';
  } else if (steeringAngle > 100) {
    steeringText = 'Direita';
  }

  return (
    <>
      {/* Calibration Modal */}
      <Modal
        visible={showCalibrationModal}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalIcon}>
              <Ionicons name="phone-portrait-outline" size={64} color={Colors.light.primary} />
            </View>
            
            <Text style={styles.modalTitle}>Calibração Necessária</Text>
            
            <Text style={styles.modalText}>
              🎮 Segure o celular em modo paisagem como um volante de corrida.
            </Text>
            
            <Text style={styles.modalSubtext}>
              Incline para os LADOS para virar (como girando um volante) e para FRENTE/TRÁS para acelerar/dar ré. A posição atual será definida como neutro.
            </Text>

            <TouchableOpacity 
              style={styles.modalButton}
              onPress={handleCalibrate}
            >
              <Ionicons name="disc-outline" size={24} color="#fff" />
              <Text style={styles.modalButtonText}>Calibrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <View style={[styles.container, { paddingTop: Math.max(insets.top, 8), paddingBottom: Math.max(insets.bottom, 8) }]}>
        <View style={styles.leftColumn}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTextContainer}>
            <Text style={styles.title}>Modo Controle</Text>
            <Text style={styles.subtitle}>Incline lateralmente para virar, frente/trás para acelerar</Text>
          </View>
          
          {/* Control buttons in header */}
          <View style={styles.headerButtons}>
            <TouchableOpacity 
              style={[styles.button, styles.calibrateButton]} 
              onPress={onCalibrateNeutral}
            >
              <Ionicons name="disc-outline" size={20} color="#fff" />
              <Text style={styles.buttonText}>Calibrar</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.button, styles.deactivateButton]} 
              onPress={onDeactivate}
            >
              <Ionicons name="stop-circle-outline" size={20} color="#fff" />
              <Text style={styles.buttonText}>Desativar</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Main content area - horizontal layout */}
        <View style={styles.mainContent}>
          {/* Visual feedback */}
          <View style={styles.visualFeedbackContainer}>
            <View style={styles.visualFeedback}>
              <View style={[styles.arrowContainer, { transform: [{ rotate: `${arrowRotation}deg` }] }]}>
                <Ionicons 
                  name="arrow-up" 
                  size={80} 
                  color={color}
                />
              </View>
              
              <View style={[styles.centerDot, { backgroundColor: color }]} />
              
              {/* Circular background indicator */}
              <View style={styles.circle} />
            </View>

            {/* Color legend below visual */}
            <View style={styles.legend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: Colors.light.textMuted }]} />
                <Text style={styles.legendText}>Neutro</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: Colors.light.success }]} />
                <Text style={styles.legendText}>Baixo</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#FFC107' }]} />
                <Text style={styles.legendText}>Médio</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: Colors.light.warning }]} />
                <Text style={styles.legendText}>Alto</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: Colors.light.danger }]} />
                <Text style={styles.legendText}>Máximo</Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* Right side - Status information */}
      <View style={styles.statusContainer}>
        <View style={styles.statusCard}>
          <Ionicons name="speedometer-outline" size={24} color={color} />
          <Text style={styles.statusLabel}>Aceleração</Text>
          <Text style={[styles.statusValue, { color }]}>
            {absThrottle}%
          </Text>
          <Text style={styles.statusDirection}>{directionText}</Text>
        </View>

        <View style={styles.statusCard}>
          <Ionicons name="git-compare-outline" size={24} color={color} />
          <Text style={styles.statusLabel}>Direção</Text>
          <Text style={[styles.statusValue, { color }]}>
            {steeringAngle}°
          </Text>
          <Text style={styles.statusDirection}>{steeringText}</Text>
        </View>
      </View>
    </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flex: 1,
    backgroundColor: Colors.light.background,
    paddingHorizontal: 16,
    flexDirection: 'row',
    gap: 16,
  },
  leftColumn: {
    flex: 1,
    flexDirection: 'column',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  headerTextContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 11,
    color: Colors.light.textSecondary,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    minWidth: 100,
  },
  calibrateButton: {
    backgroundColor: Colors.light.primary,
  },
  deactivateButton: {
    backgroundColor: Colors.light.danger,
  },
  buttonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  mainContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  visualFeedbackContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  visualFeedback: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 160,
    height: 160,
    position: 'relative',
    marginBottom: 12,
  },
  circle: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 2,
    borderColor: Colors.light.border,
    backgroundColor: Colors.light.backgroundCard,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  arrowContainer: {
    zIndex: 2,
  },
  centerDot: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    zIndex: 1,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 8,
    maxWidth: 300,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 10,
    color: Colors.light.textSecondary,
  },
  statusContainer: {
    width: '30%',
    gap: 12,
    justifyContent: 'center',
    marginBottom: 12,
  },
  statusCard: {
    backgroundColor: Colors.light.backgroundCard,
    borderRadius: 12,
    padding: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.light.border,
    gap: 6,
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
  statusLabel: {
    fontSize: 11,
    color: Colors.light.textSecondary,
    fontWeight: '500',
  },
  statusValue: {
    fontSize: 36,
    fontWeight: 'bold',
  },
  statusDirection: {
    fontSize: 13,
    color: Colors.light.textSecondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: Colors.light.backgroundCard,
    borderRadius: 16,
    padding: 32,
    maxWidth: 500,
    width: '100%',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.light.primary,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  modalIcon: {
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 16,
    color: Colors.light.text,
    marginBottom: 12,
    textAlign: 'center',
    lineHeight: 24,
  },
  modalSubtext: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 20,
  },
  modalButton: {
    backgroundColor: Colors.light.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    minWidth: 200,
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
  modalButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
