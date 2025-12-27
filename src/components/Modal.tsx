import React, { useEffect, useRef } from 'react'

type Props = {
  isOpen: boolean
  onClose: () => void
  title?: string
  children?: React.ReactNode
}

export default function Modal({ isOpen, onClose, title, children }: Props) {
  const dialogRef = useRef<HTMLDialogElement | null>(null)

  useEffect(() => {
    const dlg = dialogRef.current
    if (!dlg) return

    try {
      if (isOpen) {
        if (!dlg.open) dlg.showModal()
      } else {
        if (dlg.open) dlg.close()
      }
    } catch (err) {
      // Some older browsers may not support showModal; fallback to open attribute
      // We ignore errors here.
    }
  }, [isOpen])

  useEffect(() => {
    const dlg = dialogRef.current
    if (!dlg) return
    const onCloseEvent = () => onClose()
    dlg.addEventListener('close', onCloseEvent)
    return () => dlg.removeEventListener('close', onCloseEvent)
  }, [onClose])

  // Click on backdrop should close
  function onDialogClick(e: React.MouseEvent<HTMLDialogElement>) {
    const dlg = dialogRef.current
    if (!dlg) return
    if (e.target === dlg) {
      dlg.close()
    }
  }

  return (
    <dialog className="modal" ref={dialogRef} onClick={onDialogClick} aria-label={title}>
      <div className="modal__header">
        <div className="modal__title">{title}</div>
        <button className="btn" onClick={() => dialogRef.current?.close()} aria-label="閉じる">✕</button>
      </div>
      <div className="modal__body">{children}</div>
    </dialog>
  )
}
