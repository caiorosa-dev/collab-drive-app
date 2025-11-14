import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React, { useState } from 'react';
import { ActivityIndicator, FlatList, Modal, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBluetoothContext } from '@/contexts/bluetooth-context';
import { StrippedDevice } from '@/types/bluetooth';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { state, startScan, connect, disconnect } = useBluetoothContext();
  const [showDeviceList, setShowDeviceList] = useState(false);

  const handleConnect = async () => {
    await startScan();
    if (state.devices.length > 0 || state.isScanning) {
      setShowDeviceList(true);
    }
  };

  const handleDeviceSelect = async (device: StrippedDevice) => {
    setShowDeviceList(false);
    await connect(device);
  };

  const handleDisconnect = async () => {
    await disconnect();
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  const formatDuration = (timestamp: number | null): string => {
    if (!timestamp) return '--';
    const duration = Date.now() - timestamp;
    const seconds = Math.floor(duration / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  const convertToStrippedDevice = (device: any): StrippedDevice => ({
    name: device.name || 'Unknown Device',
    address: device.address,
    id: device.id,
    bonded: Boolean(device.bonded),
  });

  const renderConnectionButton = () => {
    switch (state.status) {
      case 'disconnected':
        return (
          <TouchableOpacity style={styles.connectButton} onPress={handleConnect}>
            <Ionicons name="bluetooth" size={24} color="#ffffff" />
            <Text style={styles.connectButtonText}>Conectar ao Carrinho</Text>
          </TouchableOpacity>
        );
      
      case 'scanning':
        return (
          <View style={[styles.connectButton, styles.connectButtonDisabled]}>
            <ActivityIndicator size="small" color="#ffffff" />
            <Text style={styles.connectButtonText}>Procurando dispositivos...</Text>
          </View>
        );
      
      case 'connecting':
        return (
          <View style={[styles.connectButton, styles.connectButtonDisabled]}>
            <ActivityIndicator size="small" color="#ffffff" />
            <Text style={styles.connectButtonText}>Conectando...</Text>
          </View>
        );
      
      case 'connected':
        return (
          <TouchableOpacity 
            style={[styles.connectButton, styles.disconnectButton]} 
            onPress={handleDisconnect}
          >
            <Ionicons name="checkmark-circle" size={24} color="#ffffff" />
            <Text style={styles.connectButtonText}>Desconectar</Text>
          </TouchableOpacity>
        );
    }
  };

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        { paddingTop: Math.max(insets.top + 16, 16) }
      ]}
    >
      {/* Header with Logo */}
      <View style={styles.header}>
        <Image
          source={require('@/assets/light-logo.png')}
          style={styles.logo}
          contentFit="contain"
        />
        <Text style={styles.appName}>Collab Drive</Text>
        <Text style={styles.appTagline}>Controle seu carrinho via Bluetooth</Text>
      </View>

      {/* Main Card */}
      <View style={styles.card}>
        {/* Status Section */}
        <View style={styles.statusSection}>
          <View style={styles.statusHeader}>
            <View style={[
              styles.statusIndicator,
              state.status === 'connected' && styles.statusIndicatorConnected
            ]} />
            <Text style={styles.statusText}>
              {state.status === 'connected' ? 'Conectado' : 'Desconectado'}
            </Text>
          </View>

          {state.status === 'connected' && state.connectedDevice && (
            <View style={styles.deviceInfo}>
              <Ionicons name="hardware-chip-outline" size={20} color={Colors.light.textSecondary} />
              <Text style={styles.deviceName}>
                {state.connectedDevice.name || 'Dispositivo Bluetooth'}
              </Text>
            </View>
          )}
        </View>

        {/* Connection Button */}
        {renderConnectionButton()}

        {/* Statistics Section - Show when connected */}
        {state.status === 'connected' && (
          <View style={styles.statsSection}>
            <Text style={styles.statsSectionTitle}>Estatísticas da Conexão</Text>
            
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Ionicons name="time-outline" size={24} color={Colors.light.primary} />
                <Text style={styles.statValue}>{formatDuration(state.stats.connectionTime)}</Text>
                <Text style={styles.statLabel}>Tempo Conectado</Text>
              </View>

              <View style={styles.statCard}>
                <Ionicons name="send-outline" size={24} color={Colors.light.primary} />
                <Text style={styles.statValue}>{state.stats.commandsSent}</Text>
                <Text style={styles.statLabel}>Comandos Enviados</Text>
              </View>

              <View style={styles.statCard}>
                <Ionicons name="cloud-upload-outline" size={24} color={Colors.light.primary} />
                <Text style={styles.statValue}>{formatBytes(state.stats.bytesSent)}</Text>
                <Text style={styles.statLabel}>Dados Enviados</Text>
              </View>

              <View style={styles.statCard}>
                <Ionicons name="flash-outline" size={24} color={Colors.light.primary} />
                <Text style={styles.statValue}>
                  {state.stats.lastCommandAt ? 'Ativo' : 'Parado'}
                </Text>
                <Text style={styles.statLabel}>Status de Envio</Text>
              </View>
            </View>
          </View>
        )}

        {/* Instructions */}
        <View style={styles.instructionsSection}>
          <Text style={styles.instructionsTitle}>Como usar:</Text>
          
          <View style={styles.instructionItem}>
            <View style={styles.instructionNumber}>
              <Text style={styles.instructionNumberText}>1</Text>
            </View>
            <Text style={styles.instructionText}>
              Certifique-se de que o carrinho está ligado
            </Text>
          </View>

          <View style={styles.instructionItem}>
            <View style={styles.instructionNumber}>
              <Text style={styles.instructionNumberText}>2</Text>
            </View>
            <Text style={styles.instructionText}>
              Clique em &quot;Conectar ao Carrinho&quot; para iniciar
            </Text>
          </View>

          <View style={styles.instructionItem}>
            <View style={styles.instructionNumber}>
              <Text style={styles.instructionNumberText}>3</Text>
            </View>
            <Text style={styles.instructionText}>
              Após conectar, vá para a aba &quot;Controle&quot; para pilotar
            </Text>
          </View>
        </View>
      </View>

      {/* Device Selection Modal */}
      <Modal
        visible={showDeviceList}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowDeviceList(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Selecione um Dispositivo</Text>
            <TouchableOpacity
              onPress={() => setShowDeviceList(false)}
              style={styles.modalCloseButton}
            >
              <Ionicons name="close" size={24} color={Colors.light.text} />
            </TouchableOpacity>
          </View>

          {state.isScanning ? (
            <View style={styles.modalLoading}>
              <ActivityIndicator size="large" color={Colors.light.primary} />
              <Text style={styles.modalLoadingText}>Procurando dispositivos...</Text>
            </View>
          ) : state.devices.length === 0 ? (
            <View style={styles.modalEmpty}>
              <Ionicons name="bluetooth-outline" size={64} color={Colors.light.textMuted} />
              <Text style={styles.modalEmptyText}>Nenhum dispositivo encontrado</Text>
              <TouchableOpacity style={styles.rescanButton} onPress={handleConnect}>
                <Ionicons name="refresh" size={20} color="#ffffff" />
                <Text style={styles.rescanButtonText}>Buscar Novamente</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              data={state.devices}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.deviceList}
              renderItem={({ item }) => {
                const stripped = convertToStrippedDevice(item);
                return (
                  <TouchableOpacity
                    style={styles.deviceItem}
                    onPress={() => handleDeviceSelect(stripped)}
                  >
                    <View style={styles.deviceItemIcon}>
                      <Ionicons 
                        name={stripped.bonded ? "bluetooth" : "bluetooth-outline"} 
                        size={24} 
                        color={Colors.light.primary} 
                      />
                    </View>
                    <View style={styles.deviceItemInfo}>
                      <Text style={styles.deviceItemName}>
                        {stripped.name || 'Dispositivo Desconhecido'}
                      </Text>
                      <Text style={styles.deviceItemAddress}>{stripped.address}</Text>
                      {stripped.bonded && (
                        <Text style={styles.deviceItemBonded}>Pareado</Text>
                      )}
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={Colors.light.textMuted} />
                  </TouchableOpacity>
                );
              }}
            />
          )}
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logo: {
    width: 200,
    height: 100,
    marginBottom: 16,
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 4,
  },
  appTagline: {
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
  card: {
    backgroundColor: Colors.light.backgroundCard,
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  statusSection: {
    marginBottom: 24,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.light.textMuted,
    marginRight: 8,
  },
  statusIndicatorConnected: {
    backgroundColor: Colors.light.success,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
  },
  deviceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.background,
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  deviceName: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginLeft: 8,
    fontWeight: '500',
  },
  connectButton: {
    backgroundColor: Colors.light.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    gap: 8,
  },
  connectButtonDisabled: {
    opacity: 0.7,
  },
  disconnectButton: {
    backgroundColor: Colors.light.danger,
  },
  connectButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  instructionsSection: {
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
    paddingTop: 20,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 16,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  instructionNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.light.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  instructionNumberText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  instructionText: {
    flex: 1,
    fontSize: 14,
    color: Colors.light.textSecondary,
    lineHeight: 20,
    paddingTop: 2,
  },
  statsSection: {
    marginTop: 24,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  statsSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: Colors.light.background,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.light.text,
  },
  modalCloseButton: {
    padding: 4,
  },
  modalLoading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalLoadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.light.textSecondary,
  },
  modalEmpty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  modalEmptyText: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    marginTop: 16,
    marginBottom: 24,
  },
  rescanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  rescanButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  deviceList: {
    padding: 16,
  },
  deviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.backgroundCard,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
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
  deviceItemIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.light.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  deviceItemInfo: {
    flex: 1,
  },
  deviceItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 4,
  },
  deviceItemAddress: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    marginBottom: 2,
  },
  deviceItemBonded: {
    fontSize: 11,
    color: Colors.light.primary,
    fontWeight: '500',
  },
});
