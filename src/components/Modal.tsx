import React from 'react'

type Props = {
  isOpen: boolean
  onClose: () => void
  title?: string
  children?: React.ReactNode
}

export default function Modal({ isOpen, onClose, title, children }: Props) {
  if (!isOpen) return null

  return (
    <div className="modal-overlay" onMouseDown={onClose}>
      <div className="modal-content" onMouseDown={(e) => e.stopPropagation()} role="dialog" aria-modal>
        <div className="modal-header">
          <div className="modal-title">{title}</div>
          <button className="btn" onClick={onClose} aria-label="閉じる">✕</button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  )
}
