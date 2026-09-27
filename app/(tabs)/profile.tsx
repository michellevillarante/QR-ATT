import { useCallback, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';

import AppButton from '@/components/AppButton';
import { COLORS } from '@/constants/colors';
import { useAuth, signOut } from '@/lib/auth';
import { getProfile, updateProfile, type Profile } from '@/lib/profiles';

export default function ProfileScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [editing, setEditing] = useState(false);
  const [draftName, setDraftName] = useState('');
  const [saving, setSaving] = useState(false);

  const loadProfile = useCallback(async () => {
    if (!user) return;
    const p = await getProfile(user.id);
    setProfile(p);
    setDraftName(p?.full_name ?? '');
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [loadProfile])
  );

  const handleSaveName = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await updateProfile(user.id, { full_name: draftName.trim() });
    setSaving(false);
    if (error) {
      Alert.alert('Error', error);
    } else {
      setProfile((prev) => (prev ? { ...prev, full_name: draftName.trim() } : prev));
      setEditing(false);
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await signOut();
      router.replace('/login');
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to sign out.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Profile</Text>

      {profile?.role === 'teacher' ? (
        <View style={styles.roleBadge}>
          <Text style={styles.roleBadgeText}>Teacher</Text>
        </View>
      ) : (
        <View style={[styles.roleBadge, styles.roleBadgeStudent]}>
          <Text style={styles.roleBadgeText}>Student</Text>
        </View>
      )}

      {editing ? (
        <View style={styles.nameEditRow}>
          <TextInput
            style={styles.nameInput}
            value={draftName}
            onChangeText={setDraftName}
            placeholder="Your name"
            placeholderTextColor={COLORS.textSecondary}
            editable={!saving}
          />
          <Pressable
            style={[styles.saveButton, saving && styles.saveButtonDisabled]}
            onPress={handleSaveName}
            disabled={saving}
          >
            <Text style={styles.saveButtonText}>{saving ? '...' : 'Save'}</Text>
          </Pressable>
        </View>
      ) : (
        <Pressable onPress={() => setEditing(true)} style={styles.nameRow}>
          <Text style={styles.value}>
            {profile?.full_name || 'Tap to add your name'}
          </Text>
          <Text style={styles.editHint}>Edit</Text>
        </Pressable>
      )}

      {user && (
        <View style={styles.infoCard}>
          <Text style={styles.label}>Email</Text>
          <Text style={styles.value}>{user.email}</Text>

          <Text style={styles.label}>User ID</Text>
          <Text style={styles.valueSmall}>{user.id}</Text>
        </View>
      )}

      <AppButton
        title="Sign Out"
        icon="log-out-outline"
        onPress={handleSignOut}
        disabled={loading}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.primary + '14',
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 16,
  },
  roleBadgeStudent: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
  },
  roleBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
  nameRow: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  editHint: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
  nameEditRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  nameInput: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: COLORS.textPrimary,
    marginRight: 10,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: COLORS.textOnPrimary,
    fontSize: 15,
    fontWeight: '700',
  },
  infoCard: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    padding: 16,
    marginBottom: 24,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 4,
    marginTop: 8,
  },
  value: {
    fontSize: 15,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  valueSmall: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
});
