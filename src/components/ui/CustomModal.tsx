import React from 'react'
import { useCompanySettings } from '../../hooks'

interface CustomModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm?: () => void
  title: string
  message: string
  type?: 'success' | 'error' | 'warning' | 'info' | 'confirm'
  confirmText?: string
  cancelText?: string
  showCancel?: boolean
  showTextInput?: boolean
  textInputValue?: string
  onTextInputChange?: (value: string) => void
  textInputPlaceholder?: string
  textInputRequired?: boolean
}

export const CustomModal: React.FC<CustomModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type = 'info',
  confirmText = 'Aceptar',
  cancelText = 'Cancelar',
  showCancel = false,
  showTextInput = false,
  textInputValue = '',
  onTextInputChange,
  textInputPlaceholder = 'Escribe aquí...',
  textInputRequired = false
}) => {
  const { settings } = useCompanySettings()
  const primaryColor = settings?.primary_color || '#0d6efd'
  const secondaryColor = settings?.secondary_color || '#6c757d'

  if (!isOpen) return null

  const getIconAndColor = () => {
    switch (type) {
      case 'success':
        return {
          icon: '✅',
          headerStyle: { backgroundColor: primaryColor, color: '#fff' },
          iconStyle: { color: primaryColor }
        }
      case 'error':
        return {
          icon: '❌',
          headerStyle: { backgroundColor: '#dc3545', color: '#fff' },
          iconStyle: { color: '#dc3545' }
        }
      case 'warning':
        return {
          icon: '⚠️',
          headerStyle: { backgroundColor: secondaryColor, color: '#fff' },
          iconStyle: { color: secondaryColor }
        }
      case 'confirm':
        return {
          icon: '❓',
          headerStyle: { backgroundColor: primaryColor, color: '#fff' },
          iconStyle: { color: primaryColor }
        }
      default:
        return {
          icon: 'ℹ️',
          headerStyle: { backgroundColor: primaryColor, color: '#fff' },
          iconStyle: { color: primaryColor }
        }
    }
  }

  const { icon, headerStyle, iconStyle } = getIconAndColor()

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const handleConfirm = () => {
    if (textInputRequired && showTextInput && (!textInputValue || !textInputValue.trim())) {
      return // Don't proceed if required text is empty
    }
    if (onConfirm) {
      onConfirm()
    }
    // Cerrar modal después de ejecutar onConfirm
    onClose()
  }

  return (
    <div 
      className="modal fade show d-block" 
      style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1055 }}
      onClick={handleBackdropClick}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content shadow-lg border-0">
          <div className="modal-header border-0" style={headerStyle}>
            <h5 className="modal-title d-flex align-items-center">
              <span className="me-2" style={{ fontSize: '1.2rem' }}>{icon}</span>
              {title}
            </h5>
            <button 
              type="button" 
              className="btn-close btn-close-white" 
              onClick={onClose}
              aria-label="Close"
            ></button>
          </div>
          <div className="modal-body text-center py-4">
            {!showTextInput && (
              <div className="mb-3" style={{ fontSize: '3rem', ...iconStyle }}>
                {icon}
              </div>
            )}
            <p className="mb-3 fs-6">{message}</p>
            
            {showTextInput && (
              <div className="mt-3">
                <textarea
                  className={`form-control ${textInputRequired && (!textInputValue || !textInputValue.trim()) ? 'is-invalid' : ''}`}
                  rows={4}
                  placeholder={textInputPlaceholder}
                  value={textInputValue}
                  onChange={(e) => onTextInputChange?.(e.target.value)}
                  autoFocus
                />
                {textInputRequired && (!textInputValue || !textInputValue.trim()) && (
                  <div className="invalid-feedback text-start">
                    Este campo es requerido
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="modal-footer border-0 justify-content-center">
            {showCancel && (
              <button 
                type="button" 
                className="btn btn-outline-secondary me-2"
                style={{ color: secondaryColor, borderColor: secondaryColor }}
                onClick={onClose}
              >
                {cancelText}
              </button>
            )}
            <button 
              type="button" 
              className={`btn ${textInputRequired && showTextInput && (!textInputValue || !textInputValue.trim()) ? 'disabled' : ''}`}
              style={{
                backgroundColor: type === 'error' ? '#dc3545' : (type === 'warning' ? secondaryColor : primaryColor),
                borderColor: type === 'error' ? '#dc3545' : (type === 'warning' ? secondaryColor : primaryColor),
                color: '#fff'
              }}
              onClick={handleConfirm}
              disabled={textInputRequired && showTextInput && (!textInputValue || !textInputValue.trim())}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}