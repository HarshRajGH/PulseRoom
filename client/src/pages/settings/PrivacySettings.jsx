import { Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { useGetPrivacySettingsQuery, useUpdatePrivacySettingsMutation } from '@/services/privacy.api'
import { cn } from '@/utils/cn'

const toggleFields = [
  ['isPrivateAccount', 'Private account', 'Only approved followers can see your profile and playlists.'],
  ['hideListeningActivity', 'Hide listening activity', "Don't show what you're currently playing to others."],
  ['allowFriendRequests', 'Allow friend requests', 'Let other listeners send you friend requests.'],
  ['allowRoomInvites', 'Allow room invites', 'Let friends invite you directly into their rooms.'],
  ['showOnlineStatus', 'Show online status', 'Show a green dot to friends when you\'re active.'],
]

const selectFields = [
  ['profileVisibility', 'Profile visibility', [['public', 'Everyone'], ['friends', 'Friends only'], ['private', 'Only me']]],
  ['messagePermissions', 'Who can message you', [['everyone', 'Everyone'], ['friends', 'Friends only'], ['none', 'No one']]],
]

const notificationFields = [
  ['email', 'Email notifications'], ['push', 'Push notifications'], ['tips', 'Tip alerts'], ['mentions', 'Mentions & replies'],
]

export default function PrivacySettings() {
  const { data: settings, isLoading } = useGetPrivacySettingsQuery()
  const [updateSettings, { isLoading: saving }] = useUpdatePrivacySettingsMutation()

  const persist = async (patch, label) => {
    try {
      await updateSettings(patch).unwrap()
      if (label) toast.success(label)
    } catch (err) {
      toast.error(err.message || 'Could not update privacy settings')
    }
  }

  if (isLoading || !settings) return <div className="flex justify-center py-12"><Loader2 className="animate-spin text-current-2" size={22} /></div>

  return (
    <div className="space-y-5">
      <div className="card p-6 max-w-lg space-y-5">
        <div>
          <h2 className="font-display font-semibold text-lg">Privacy</h2>
          <p className="text-xs text-muted mt-1">Saved to your account — persists across devices and browser refreshes.</p>
        </div>
        {toggleFields.map(([key, label, desc]) => (
          <div key={key} className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm">{label}</p>
              <p className="text-xs text-muted mt-0.5">{desc}</p>
            </div>
            <button
              disabled={saving}
              onClick={() => persist({ [key]: !settings[key] })}
              className={cn('w-11 h-6 rounded-full transition-colors relative shrink-0', settings[key] ? 'bg-current' : 'bg-surface-3')}
            >
              <span className={cn('absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform', settings[key] ? 'translate-x-5' : 'translate-x-0.5')} />
            </button>
          </div>
        ))}
      </div>

      <div className="card p-6 max-w-lg space-y-5">
        <h2 className="font-display font-semibold text-lg">Visibility</h2>
        {selectFields.map(([key, label, options]) => (
          <label key={key} className="block">
            <span className="mb-1.5 block text-xs font-semibold text-muted">{label}</span>
            <select
              value={settings[key]} disabled={saving}
              onChange={(e) => persist({ [key]: e.target.value })}
              className="w-full rounded-xl bg-surface-2 border border-white/10 px-4 py-2.5 text-sm outline-none focus:border-current/60"
            >
              {options.map(([val, optLabel]) => <option key={val} value={val}>{optLabel}</option>)}
            </select>
          </label>
        ))}
      </div>

      <div className="card p-6 max-w-lg space-y-4">
        <h2 className="font-display font-semibold text-lg">Notifications</h2>
        {notificationFields.map(([key, label]) => (
          <div key={key} className="flex items-center justify-between">
            <p className="text-sm">{label}</p>
            <button
              disabled={saving}
              onClick={() => persist({ notificationPreferences: { ...settings.notificationPreferences, [key]: !settings.notificationPreferences[key] } })}
              className={cn('w-11 h-6 rounded-full transition-colors relative shrink-0', settings.notificationPreferences[key] ? 'bg-current' : 'bg-surface-3')}
            >
              <span className={cn('absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform', settings.notificationPreferences[key] ? 'translate-x-5' : 'translate-x-0.5')} />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
