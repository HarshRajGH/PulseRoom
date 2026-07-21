import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { createPortal } from 'react-dom'

export default function Drawer({ open, onClose, title, children, side = 'right' }) {
  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100] flex">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}
          />
          <motion.div
            initial={{ x: side === 'right' ? 420 : -420 }}
            animate={{ x: 0 }}
            exit={{ x: side === 'right' ? 420 : -420 }}
            transition={{ type: 'spring', damping: 28, stiffness: 260 }}
            className={`relative ${side === 'right' ? 'ml-auto' : ''} h-full w-full max-w-[420px] glass-solid p-6 overflow-y-auto`}
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display text-lg font-semibold">{title}</h3>
              <button onClick={onClose} className="text-mist hover:text-paper"><X size={18} /></button>
            </div>
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
