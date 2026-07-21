import Button from './Button'

export default function EmptyState({ icon: Icon, title, description, actionLabel, onAction }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6">
      {Icon && (
        <div className="w-16 h-16 rounded-2xl bg-surface-2 flex items-center justify-center mb-5">
          <Icon size={26} className="text-current-2" />
        </div>
      )}
      <h3 className="font-display text-lg font-semibold mb-1.5">{title}</h3>
      <p className="text-muted text-sm max-w-sm mb-6">{description}</p>
      {actionLabel && (
        <Button onClick={onAction} size="sm">{actionLabel}</Button>
      )}
    </div>
  )
}
