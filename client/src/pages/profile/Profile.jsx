import { useSelector } from 'react-redux'
import { Link, useParams } from 'react-router-dom'
import { Settings, Music2, UserPlus, UserCheck } from 'lucide-react'
import Avatar from '@/components/ui/Avatar'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import MusicCard from '@/components/music/MusicCard'
import { CardSkeletonGrid } from '@/components/ui/SkeletonGrid'
import { useGetUserQuery, useFollowUserMutation, useUnfollowUserMutation } from '@/services/user.api'
import { useListSongsQuery } from '@/services/song.api'

export default function Profile() {
  const { id } = useParams()
  const currentUser = useSelector((s) => s.auth.user)
  const isOwnProfile = !id || id === currentUser?._id

  const { data: fetchedUser, isLoading } = useGetUserQuery(id, { skip: isOwnProfile })
  const user = isOwnProfile ? currentUser : fetchedUser
  const [followUser] = useFollowUserMutation()
  const [unfollowUser] = useUnfollowUserMutation()
  const { data: topSongs, isLoading: songsLoading } = useListSongsQuery({ limit: 6 })

  if (!isOwnProfile && isLoading) return <CardSkeletonGrid count={6} />
  if (!user) return null

  const isFollowing = currentUser?.following?.includes(user._id)

  return (
    <div className="space-y-10">
      <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 text-center sm:text-left">
        <Avatar name={user.name} src={user.avatarUrl} size="xl" ring />
        <div className="flex-1">
          <Badge variant="current" className="mb-2 capitalize">{user.plan || 'free'}</Badge>
          <h1 className="font-display text-3xl font-bold">{user.name}</h1>
          <p className="text-muted text-sm">{user.handle}</p>
          <p className="text-sm mt-2 max-w-md">{user.bio}</p>
          <div className="flex items-center justify-center sm:justify-start gap-5 mt-3 text-sm">
            <span><strong>{user.followers?.length || 0}</strong> <span className="text-muted">followers</span></span>
            <span><strong>{user.following?.length || 0}</strong> <span className="text-muted">following</span></span>
          </div>
        </div>
        {isOwnProfile ? (
          <Button as={Link} to="/app/profile/edit" variant="ghost"><Settings size={15} /> Edit profile</Button>
        ) : (
          <Button
            variant={isFollowing ? 'subtle' : 'primary'}
            onClick={() => (isFollowing ? unfollowUser(user._id) : followUser(user._id))}
          >
            {isFollowing ? <><UserCheck size={15} /> Following</> : <><UserPlus size={15} /> Follow</>}
          </Button>
        )}
      </div>

      <section>
        <h2 className="font-display text-lg font-semibold mb-4 flex items-center gap-2"><Music2 size={17} /> Popular tracks</h2>
        {songsLoading ? <CardSkeletonGrid count={6} /> : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {topSongs?.results?.map((s) => <MusicCard key={s._id} track={s} />)}
          </div>
        )}
      </section>
    </div>
  )
}
