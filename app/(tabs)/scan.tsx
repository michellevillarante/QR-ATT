import { CameraView, useCameraPermissions } from 'expo-camera';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useAuth } from '@/lib/auth';
import { getEventByCode } from '@/lib/events';
import { registerAttendanceForUser } from '@/lib/attendance';


import AppButton from '@/components/AppButton';
import { COLORS } from '@/constants/colors';

export default function ScanScreen() {
  const { user } = useAuth();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [lastData, setLastData] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);



  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Camera Permission Needed</Text>
        <Text style={styles.subtitle}>
          We need access to your camera to scan QR codes.
        </Text>
        <AppButton
          theme="primary"
          title="Grant Permission"
          icon="camera"
          onPress={requestPermission}
        />
      </View>
    );
  }

  const handleBarcodeScanned = async ({ data }: { data: string }) => {
    setScanned(true);
    setLastData(data);
    setMessage(null);

    try {
      const studentId = user?.id;
      if (!studentId) {
        setSuccess(false);
        setMessage('You must be signed in to record attendance.');
        return;
      }

      let parsed: any;
      try {
        parsed = JSON.parse(data);
      } catch {
        setSuccess(false);
        setMessage('Invalid QR code.');
        return;
      }

      const eventCode = parsed?.event ?? parsed?.eventId;
      if (!eventCode) {
        setSuccess(false);
        setMessage('Not an attendance QR code.');
        return;
      }

      const event = await getEventByCode(eventCode);
      if (!event) {
        setSuccess(false);
        setMessage('Event not found. Please create it first.');
        return;
      }

      const now = Date.now();
      const start = new Date(event.start_time).getTime();
      const end = new Date(event.end_time).getTime();

      if (now < start) {
        setSuccess(false);
        setMessage('Event has not started yet.');
        return;
      }

      if (now > end) {
        setSuccess(false);
        setMessage('Event has already ended.');
        return;
      }

      const result = await registerAttendanceForUser(event.id, studentId);
      setSuccess(result.success);
      setMessage(result.message);
    } catch {
      setSuccess(false);
      setMessage('Unable to record attendance. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
      />

      <View style={styles.overlay}>
        <Text style={styles.overlayText}>
          {scanned ? 'QR Code detected!' : 'Point your camera at a QR code'}
        </Text>

        {scanned && message && (
  <Text
    style={[styles.scanResult, success ? styles.success : styles.error]}
  >
    {message}
  </Text>
)}


        {scanned && lastData && (
          <Text style={styles.scanResult}>{lastData}</Text>
        )}

        {scanned && (
          <AppButton
            theme="primary"
            title="Scan Again"
            icon="refresh"
            onPress={() => {
              setScanned(false);
              setLastData(null);
              setMessage(null);
            }}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  camera: {
    ...StyleSheet.absoluteFillObject,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  overlay: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 60,
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
  },
  overlayText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 6,
    textAlign: 'center',
  },
  scanResult: { fontSize: 14, textAlign: 'center', marginBottom: 8, fontWeight: '600' },
success:    { color: '#2E7D32' },   // green — attendance recorded
error:      { color: '#C62828' },   // red — failed / duplicate
scanData:   { fontSize: 12, color: COLORS.textSecondary, textAlign: 'center', marginBottom: 12 },

});
