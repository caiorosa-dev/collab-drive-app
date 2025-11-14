import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React, { useState } from 'react';
import { ActivityIndicator, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type ConnectionStatus = 'disconnected' | 'scanning' | 'connecting' | 'connected';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');

  const handleConnect = () => {
    // Mock connection flow
    setConnectionStatus('scanning');
    
    setTimeout(() => {
      setConnectionStatus('connecting');
      setTimeout(() => {
        setConnectionStatus('connected');
      }, 1500);
    }, 2000);
  };

  const handleDisconnect = () => {
    setConnectionStatus('disconnected');
  };

  const renderConnectionButton = () => {
    switch (connectionStatus) {
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
            <Text style={styles.connectButtonText}>Procurando dispositivo...</Text>
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
              connectionStatus === 'connected' && styles.statusIndicatorConnected
            ]} />
            <Text style={styles.statusText}>
              {connectionStatus === 'connected' ? 'Conectado' : 'Desconectado'}
            </Text>
          </View>

          {connectionStatus === 'connected' && (
            <View style={styles.deviceInfo}>
              <Ionicons name="hardware-chip-outline" size={20} color={Colors.light.textSecondary} />
              <Text style={styles.deviceName}>Collab Drive Controller</Text>
            </View>
          )}
        </View>

        {/* Connection Button */}
        {renderConnectionButton()}

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
  infoCards: {
    flexDirection: 'row',
    gap: 12,
  },
  infoCard: {
    flex: 1,
    backgroundColor: Colors.light.backgroundCard,
    borderRadius: 12,
    padding: 16,
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
  infoCardIcon: {
    marginBottom: 12,
  },
  infoCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 4,
  },
  infoCardText: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    lineHeight: 16,
  },
});
