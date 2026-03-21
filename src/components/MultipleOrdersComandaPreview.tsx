import React, { useState } from 'react'
import { FileText, Printer, Download, X, Tag, Package } from 'lucide-react'
import type { ServiceOrder, Customer } from '../types'
import logoGamebox from '../assets/logo-gamebox.png'
import { useCompanySettings } from '../hooks'
import { formatDateForPrint, getStatusDisplayName } from '../utils'
import { useAuth } from '../contexts/AuthContext'

interface MultipleOrdersComandaPreviewProps {
  orders: ServiceOrder[]
  customer: Customer
  onClose: () => void
}

const MultipleOrdersComandaPreview: React.FC<MultipleOrdersComandaPreviewProps> = ({ 
  orders, 
  customer, 
  onClose 
}) => {
  const [viewType, setViewType] = useState<'comanda' | 'individual-stickers'>('comanda')
  const { user } = useAuth()
  const { settings } = useCompanySettings()
  
  // Usar logo de configuración si está disponible, sino usar logo por defecto
  const displayLogo = settings?.logo_url || logoGamebox
  const companyName = settings?.company_name || 'GameBox Service'
  const primaryColor = settings?.primary_color || '#0d6efd'
  const secondaryColor = settings?.secondary_color || '#6c757d'
  
  // Obtener sede y teléfono del usuario que recibió la orden o del usuario actual
  const receivedByUser = orders[0]?.received_by || user
  const branchName = receivedByUser?.sede || 'Parque Caldas'
  const branchPhone = receivedByUser?.branch_phone || '3116638302'
  
  // Para las vistas previas, agregar timestamp para evitar cache
  const logoForPreview = displayLogo.includes('supabase') 
    ? `${displayLogo.split('?')[0]}?t=${Date.now()}` 
    : displayLogo
  
  // Validación de datos requeridos
  if (!customer || !orders || orders.length === 0) {
    console.error('❌ MultipleOrdersComandaPreview: Datos incompletos', { customer, orders })
    return (
      <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header bg-danger text-white">
              <h5 className="modal-title">Error</h5>
            </div>
            <div className="modal-body text-center">
              <p>Error: No se pudo cargar la información de la comanda.</p>
              <p className="text-muted small">
                {!customer && 'Información del cliente no disponible. '}
                {(!orders || orders.length === 0) && 'No hay órdenes para mostrar. '}
              </p>
              <button className="btn btn-secondary" onClick={onClose}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  console.log('Ô£à MultipleOrdersComandaPreview: Datos cargados', { 
    customer: customer.full_name, 
    ordersCount: orders.length 
  })

  const handlePrintComanda = () => {
    const printWindow = window.open('', '_blank', 'width=600,height=800')
    
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Comanda Múltiple - ${customer.full_name}</title>
            <meta charset="utf-8">
            <style>
              * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
              }
              body { 
                font-family: 'Arial Black', 'Arial Bold', sans-serif; 
                font-size: 12px; 
                width: 80mm;
                margin: 0;
                padding: 2mm;
                line-height: 1.4;
                background: white;
                font-weight: 900;
              }
              .header {
                text-align: center;
                margin-bottom: 3mm;
                border-bottom: 1px dashed #000;
                padding-bottom: 3mm;
              }
              .logo {
                width: 50mm;
                height: 20mm;
                object-fit: contain;
                margin-bottom: 2mm;
                display: block;
              }
              .title {
                font-weight: bold;
                font-size: 13px;
                margin-bottom: 2mm;
              }
              .content {
                font-size: 11px;
                line-height: 1.5;
                word-wrap: break-word;
                overflow-wrap: break-word;
              }
              .section {
                margin-bottom: 3mm;
                border-bottom: 1px dashed #ccc;
                padding-bottom: 2mm;
              }
              .section > div {
                word-wrap: break-word;
                overflow-wrap: break-word;
                max-width: 76mm;
              }
              .label {
                font-weight: bold;
              }
              .order-item {
                margin-bottom: 4mm;
                padding: 2mm;
                border: 1px solid #ddd;
                word-wrap: break-word;
                overflow-wrap: break-word;
              }
              .order-item > div {
                word-wrap: break-word;
                overflow-wrap: break-word;
                max-width: 100%;
              }
              .footer {
                text-align: center;
                margin-top: 5mm;
                font-size: 11px;
                border-top: 1px dashed #000;
                padding-top: 3mm;
              }
              @media print {
                body { 
                  width: 80mm;
                  margin: 0;
                  padding: 2mm;
                }
                @page {
                  margin: 0;
                  size: 80mm auto;
                }
              }
            </style>
          </head>
          <body>
            <div class="header">
              <img src="${logoForPreview}" alt="${companyName}" class="logo">
              <div class="title">COMANDA MÚLTIPLE DE SERVICIO</div>
            </div>
            
            <div class="content">
              <div class="section">
                <div><span class="label">FECHA:</span> ${formatDateForPrint(orders[0].created_at)}</div>
                <div><span class="label">DISPOSITIVOS:</span> ${orders.length}</div>
                <div><span class="label">SEDE:</span> ${branchName}</div>
                <div><span class="label">TELÉFONO:</span> ${branchPhone}</div>
              </div>
              
              <div class="section">
                <div><span class="label">CLIENTE:</span> ${customer.full_name}</div>
                ${(customer.phone || customer.cedula) ? `<div><span class="label">TEL:</span> ${customer.phone || customer.cedula}</div>` : ''}
                ${customer.cedula ? `<div><span class="label">CÉDULA:</span> ${customer.cedula}</div>` : ''}
              </div>
              
              <div class="section">
                <div class="label">DISPOSITIVOS INGRESADOS:</div>
                ${orders.map((order, index) => `
                  <div class="order-item">
                    <div><span class="label">${index + 1}. ORDEN:</span> ${order.order_number}</div>
                    <div><span class="label">TIPO:</span> ${order.device_type}</div>
                    <div><span class="label">MARCA:</span> ${order.device_brand}</div>
                    <div><span class="label">MODELO:</span> ${order.device_model || 'N/A'}</div>
                    <div><span class="label">SERIE:</span> ${order.serial_number || 'N/A'}</div>
                    <div><span class="label">PROBLEMA:</span> ${order.problem_description}</div>
                    ${order.observations ? `<div><span class="label">OBS:</span> ${order.observations}</div>` : ''}
                    <div><span class="label">ESTADO:</span> ${getStatusDisplayName(order.status)}</div>
                    ${order.completed_by ? `<div><span class="label">FINALIZADO POR:</span> ${order.completed_by.full_name || order.completed_by.email?.split('@')[0] || 'Técnico'}</div>` : ''}
                    ${order.completion_notes ? `<div><span class="label">TRABAJO REALIZADO:</span> ${order.completion_notes}</div>` : ''}
                  </div>
                `).join('')}
              </div>
            </div>
            
            <div class="footer">
              <div class="label">TOTAL: ${orders.length} ÓRDENES</div>
              <div class="label">CONSERVE ESTE COMPROBANTE</div>
            </div>
          </body>
        </html>
      `)
      printWindow.document.close()
      
      setTimeout(() => {
        printWindow.print()
        printWindow.close()
      }, 1000)
    }
  }

  const handlePrintStickers = () => {
    const printWindow = window.open('', '_blank', 'width=600,height=800')
    
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Stickers Individuales - ${customer.full_name}</title>
            <meta charset="utf-8">
            <style>
              * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
              }
                html, body {
                  font-family: 'Arial', sans-serif;
                  margin: 0 !important;
                  padding: 0 !important;
                  background: white;
                  width: 5cm;
                  height: 2.5cm;
                  overflow: hidden;
                }
              .sticker-container {
                width: 5cm;
                height: 2.5cm;
                border: 2px solid #000;
                padding: 2mm;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                box-sizing: border-box;
                position: relative;
                margin: 0;
                page-break-after: always;
                page-break-inside: avoid;
              }
              .logo {
                width: 15mm;
                height: 8mm;
                object-fit: contain;
                margin: 0 auto 1.5mm auto;
                display: none !important;
              }
              .info {
                flex-grow: 1;
                font-size: 10px;
                line-height: 1.3;
                color: #000;
              }
              .info-line {
                margin-bottom: 0.8mm;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
              }
              .info-line strong {
                font-weight: bold;
                color: #000;
              }
              .problem-section {
                margin-top: 0.5mm;
                padding-top: 0;
                font-size: 7.5px;
                line-height: 1;
              }
              .problem-text {
                margin-top: 0;
                font-size: 7.5px;
                line-height: 1;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                max-height: auto;
              }
                @media print {
                  html, body {
                    margin: 0 !important;
                    padding: 0 !important;
                    width: 5cm;
                    height: 2.5cm;
                    overflow: visible;
                  }
                  @page {
                    margin: 0 !important;
                    size: 5cm 2.5cm;
                  }
                  .sticker-container {
                    width: 5cm;
                    height: 2.5cm;
                    margin: 0;
                    page-break-after: always;
                    page-break-inside: avoid;
                  }
                  .sticker-container:last-child {
                    page-break-after: auto;
                  }
                }
            </style>
          </head>
          <body>
            ${orders.map((order) => `
              <div class="sticker-container">
                <div class="info">
                  <div class="info-line"><strong>ORDEN:</strong> ${order.order_number}</div>
                  <div class="info-line"><strong>CLIENTE:</strong> ${customer.full_name.slice(0, 20)}</div>
                  <div class="info-line"><strong>TEL:</strong> ${(customer.phone || customer.cedula || 'N/A').slice(0, 15)}</div>
                  ${customer.cedula ? `<div class="info-line"><strong>CÉDULA:</strong> ${customer.cedula.slice(0, 15)}</div>` : ''}
                  <div class="info-line"><strong>SERIE:</strong> ${(order.serial_number || 'N/A').slice(0, 18)}</div>
                  <div class="problem-section">
                    <div><strong>PROBLEMA:</strong></div>
                    <div class="problem-text">${order.problem_description.slice(0, 120)}${order.problem_description.length > 120 ? '...' : ''}</div>
                  </div>
                </div>
              </div>
            `).join('')}
          </body>
        </html>
      `)
      printWindow.document.close()
      
      setTimeout(() => {
        printWindow.print()
        printWindow.close()
      }, 1000)
    }
  }

  const handleDownloadPDF = () => {
    const title = viewType === 'comanda' ? 'Comanda Múltiple' : 'Stickers Individuales'
    const printWindow = window.open('', '_blank', 'width=600,height=800')
    
    if (printWindow) {
      if (viewType === 'individual-stickers') {
        // Template para stickers individuales optimizado 5cm x 2.5cm
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>${title} - ${customer.full_name}</title>
              <meta charset="utf-8">
              <style>
                * {
                  margin: 0;
                  padding: 0;
                  box-sizing: border-box;
                }
                body { 
                  font-family: 'Arial', sans-serif; 
                  margin: 0;
                  padding: 0;
                  background: white;
                }
                .instructions {
                  background: #e3f2fd;
                  padding: 15px;
                  margin-bottom: 20px;
                  border-radius: 5px;
                  font-family: Arial, sans-serif;
                  font-size: 14px;
                }
                .sticker-container {
                  width: 5cm;
                  height: 2.5cm;
                  border: 2px solid #000;
                  padding: 2mm;
                  display: flex;
                  flex-direction: column;
                  justify-content: space-between;
                  box-sizing: border-box;
                  position: relative;
                  margin: 0 auto 5mm auto;
                  page-break-after: always;
                  page-break-inside: avoid;
                }
                .logo {
                  width: 15mm;
                  height: 8mm;
                  object-fit: contain;
                  margin: 0 auto 1.5mm auto;
                  display: none !important;
                }
                .info {
                  flex-grow: 1;
                  font-size: 10px;
                  line-height: 1.3;
                  color: #000;
                }
                .info-line {
                  margin-bottom: 0.8mm;
                  overflow: hidden;
                  text-overflow: ellipsis;
                  white-space: nowrap;
                }
                .info-line strong {
                  font-weight: bold;
                  color: #000;
                }
                .problem-section {
                  margin-top: 0.5mm;
                  padding-top: 0;
                  font-size: 7.5px;
                  line-height: 1;
                }
                .problem-text {
                  margin-top: 0;
                  font-size: 7.5px;
                  line-height: 1;
                  overflow: hidden;
                  text-overflow: ellipsis;
                  white-space: nowrap;
                  max-height: auto;
                }
                @media print {
                  .instructions {
                    display: none;
                  }
                  body { 
                    margin: 0;
                    padding: 0;
                  }
                  @page {
                    margin: 0;
                    size: 5cm 2.5cm;
                  }
                  .sticker-container {
                    width: 5cm;
                    height: 2.5cm;
                    page-break-after: always;
                    page-break-inside: avoid;
                    margin: 0;
                  }
                  .sticker-container:last-child {
                    page-break-after: auto;
                  }
                }
              </style>
            </head>
            <body>
              <div class="instructions">
                <strong>📄 Para guardar como PDF:</strong><br>
                1. Presiona <strong>Ctrl+P</strong> (o Cmd+P en Mac)<br>
                2. En "Destino" selecciona <strong>"Guardar como PDF"</strong><br>
                3. Haz clic en <strong>"Guardar"</strong><br>
                <strong>📏 Tamaño:</strong> ${orders.length} stickers de 5cm × 2.5cm
              </div>
              ${orders.map((order) => `
                <div class="sticker-container">
                  <div class="info">
                    <div class="info-line"><strong>ORDEN:</strong> ${order.order_number}</div>
                    <div class="info-line"><strong>CLIENTE:</strong> ${customer.full_name.slice(0, 20)}</div>
                    <div class="info-line"><strong>TEL:</strong> ${(customer.phone || customer.cedula || 'N/A').slice(0, 15)}</div>
                    ${customer.cedula ? `<div class="info-line"><strong>CÉDULA:</strong> ${customer.cedula.slice(0, 15)}</div>` : ''}
                    <div class="info-line"><strong>SERIE:</strong> ${(order.serial_number || 'N/A').slice(0, 18)}</div>
                    <div class="problem-section">
                      <div><strong>PROBLEMA:</strong></div>
                      <div class="problem-text">${order.problem_description.slice(0, 120)}${order.problem_description.length > 120 ? '...' : ''}</div>
                    </div>
                  </div>
                </div>
              `).join('')}
            </body>
          </html>
        `)
      } else {
        // Template para comanda múltiple en tirilla
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>${title} - ${customer.full_name}</title>
              <meta charset="utf-8">
              <style>
                * {
                  margin: 0;
                  padding: 0;
                  box-sizing: border-box;
                }
                body { 
                  font-family: 'Arial Black', 'Arial Bold', sans-serif; 
                  font-size: 12px; 
                  width: 80mm;
                  margin: 0;
                  padding: 2mm;
                  line-height: 1.4;
                  background: white;
                  font-weight: 900;
                }
                .instructions {
                  background: #e3f2fd;
                  padding: 10px;
                  margin-bottom: 15px;
                  border-radius: 5px;
                  font-family: Arial, sans-serif;
                  font-size: 12px;
                  width: auto;
                }
                .header {
                  text-align: center;
                  margin-bottom: 3mm;
                  border-bottom: 1px dashed #000;
                  padding-bottom: 3mm;
                }
                .logo {
                  width: 50mm;
                  height: 20mm;
                  object-fit: contain;
                  margin-bottom: 2mm;
                  display: block;
                }
                .title {
                  font-weight: bold;
                  font-size: 13px;
                  margin-bottom: 2mm;
                }
                .content {
                  font-size: 11px;
                  line-height: 1.5;
                  word-wrap: break-word;
                  overflow-wrap: break-word;
                }
                .section {
                  margin-bottom: 3mm;
                  border-bottom: 1px dashed #ccc;
                  padding-bottom: 2mm;
                }
                .section > div {
                  word-wrap: break-word;
                  overflow-wrap: break-word;
                  max-width: 76mm;
                }
                .label {
                  font-weight: bold;
                }
                .order-item {
                  margin-bottom: 4mm;
                  padding: 2mm;
                  border: 1px solid #ddd;
                  word-wrap: break-word;
                  overflow-wrap: break-word;
                }
                .order-item > div {
                  word-wrap: break-word;
                  overflow-wrap: break-word;
                  max-width: 100%;
                }
                .footer {
                  text-align: center;
                  margin-top: 5mm;
                  font-size: 11px;
                  border-top: 1px dashed #000;
                  padding-top: 3mm;
                }
                @media print {
                  .instructions {
                    display: none;
                  }
                  body { 
                    width: 80mm;
                    margin: 0;
                    padding: 2mm;
                  }
                  @page {
                    margin: 0;
                    size: 80mm auto;
                  }
                }
              </style>
            </head>
            <body>
              <div class="instructions">
                <strong>📄 Para guardar como PDF:</strong><br>
                1. Presiona <strong>Ctrl+P</strong> (o Cmd+P en Mac)<br>
                2. En "Destino" selecciona <strong>"Guardar como PDF"</strong><br>
                3. Haz clic en <strong>"Guardar"</strong><br>
                <strong>📏 Formato:</strong> Tirilla 80mm
              </div>
              
              <div class="header">
                <img src="${logoForPreview}" alt="${companyName}" class="logo">
                <div class="title">COMANDA MÚLTIPLE DE SERVICIO</div>
              </div>
              
              <div class="content">
                <div class="section">
                  <div><span class="label">FECHA:</span> ${formatDateForPrint(orders[0].created_at)}</div>
                  <div><span class="label">DISPOSITIVOS:</span> ${orders.length}</div>
                </div>
                
                <div class="section">
                  <div><span class="label">CLIENTE:</span> ${customer.full_name}</div>
                  ${(customer.phone || customer.cedula) ? `<div><span class="label">TEL:</span> ${customer.phone || customer.cedula}</div>` : ''}
                  ${customer.cedula ? `<div><span class="label">CÉDULA:</span> ${customer.cedula}</div>` : ''}
                </div>
                
                <div class="section">
                  <div class="label">DISPOSITIVOS INGRESADOS:</div>
                  ${orders.map((order, index) => `
                    <div class="order-item">
                      <div><span class="label">${index + 1}. ORDEN:</span> ${order.order_number}</div>
                      <div><span class="label">TIPO:</span> ${order.device_type}</div>
                      <div><span class="label">MARCA:</span> ${order.device_brand}</div>
                      <div><span class="label">MODELO:</span> ${order.device_model || 'N/A'}</div>
                      <div><span class="label">SERIE:</span> ${order.serial_number || 'N/A'}</div>
                      <div><span class="label">PROBLEMA:</span> ${order.problem_description}</div>
                      ${order.observations ? `<div><span class="label">OBS:</span> ${order.observations}</div>` : ''}
                      <div><span class="label">ESTADO:</span> ${getStatusDisplayName(order.status)}</div>
                      ${order.completed_by ? `<div><span class="label">FINALIZADO POR:</span> ${order.completed_by.full_name || order.completed_by.email?.split('@')[0] || 'Técnico'}</div>` : ''}
                      ${order.completion_notes ? `<div><span class="label">TRABAJO REALIZADO:</span> ${order.completion_notes}</div>` : ''}
                    </div>
                  `).join('')}
                </div>
              </div>
              
              <div class="footer">
                <div class="label">TOTAL: ${orders.length} ÓRDENES</div>
                <div class="label">CONSERVE ESTE COMPROBANTE</div>
              </div>
            </body>
          </html>
        `)
      }
      
      printWindow.document.close()
      
      setTimeout(() => {
        printWindow.print()
      }, 1000)
    }
  }

  return (
    <>
      {/* Modal Backdrop */}
      <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <div className="modal-dialog modal-xl modal-dialog-centered">
          <div className="modal-content border-0 shadow-lg">
            <div className="modal-header text-white" style={{ backgroundColor: primaryColor }}>
              <h5 className="modal-title d-flex align-items-center">
                <Package size={20} className="me-2" />
                Vista Previa - Múltiples Dispositivos ({orders.length} órdenes)
              </h5>
              <button 
                type="button" 
                className="btn-close btn-close-white" 
                onClick={onClose}
              ></button>
            </div>
            
            <div className="modal-body">
              {/* Selector de tipo de vista */}
              <div className="mb-3">
                <div className="btn-group w-100" role="group">
                  <button
                    type="button"
                    className={`btn ${viewType === 'comanda' ? 'text-white' : ''}`}
                    style={viewType === 'comanda' ? { backgroundColor: primaryColor, borderColor: primaryColor } : { color: primaryColor, borderColor: primaryColor }}
                    onClick={() => setViewType('comanda')}
                  >
                    <FileText className="me-1" size={16} />
                    Comanda Completa ({orders.length} dispositivos)
                  </button>
                  <button
                    type="button"
                    className={`btn ${viewType === 'individual-stickers' ? 'text-white' : ''}`}
                    style={viewType === 'individual-stickers' ? { backgroundColor: primaryColor, borderColor: primaryColor } : { color: primaryColor, borderColor: primaryColor }}
                    onClick={() => setViewType('individual-stickers')}
                  >
                    <Tag className="me-1" size={16} />
                    Stickers Individuales ({orders.length} etiquetas)
                  </button>
                </div>
              </div>

              {/* Preview Area */}
              {viewType === 'individual-stickers' ? (
                // Vista previa de stickers individuales optimizados
                <div style={{ 
                  maxHeight: '500px', 
                  overflowY: 'auto' 
                }}>
                  {orders.map((order) => (
                    <div key={order.id} className="mx-auto border rounded bg-white mb-2" style={{ 
                      width: '280px', 
                      height: '140px', 
                      display: 'flex', 
                      flexDirection: 'column',
                      fontFamily: 'Arial, sans-serif',
                      fontWeight: 700,
                      overflow: 'hidden',
                      boxSizing: 'border-box',
                      padding: '2mm',
                      border: '2px solid #000'
                    }}>
                      <div style={{ 
                        fontSize: '10px', 
                        textAlign: 'left', 
                        flexGrow: 1,
                        lineHeight: '1.2',
                        overflow: 'hidden'
                      }}>
                        <div style={{ marginBottom: '0.8px' }}><strong>ORDEN:</strong> {order.order_number.slice(0, 16)}</div>
                        <div style={{ marginBottom: '0.8px' }}><strong>CLIENTE:</strong> {customer.full_name.slice(0, 16)}</div>
                        <div style={{ marginBottom: '0.8px' }}><strong>TEL:</strong> {(customer.phone || customer.cedula || 'N/A').slice(0, 14)}</div>
                        {customer.cedula && <div style={{ marginBottom: '0.8px' }}><strong>CÉDULA:</strong> {customer.cedula.slice(0, 14)}</div>}
                        <div style={{ marginBottom: '0.8px' }}><strong>SERIE:</strong> {(order.serial_number || 'N/A').slice(0, 16)}</div>
                        <div style={{ fontSize: '8px', marginTop: '0.5px' }}>
                          <strong>PROBLEMA:</strong>
                          <div style={{ marginTop: '0.3px', lineHeight: '1.1', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {order.problem_description.slice(0, 50)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                // Vista previa para comanda múltiple en formato tirilla
                <div className="bg-light p-3 rounded mb-3" style={{ 
                  maxHeight: '500px', 
                  overflowY: 'auto' 
                }}>
                  <div className="mx-auto border rounded p-3 bg-white" style={{ 
                    width: '280px', // Simula 80mm
                    fontFamily: 'Arial Black, Arial Bold, sans-serif',
                    fontSize: '12px',
                    fontWeight: 900
                  }}>
                    {/* Header con logo */}
                    <div className="text-center mb-3 pb-2" style={{ borderBottom: '1px dashed #000' }}>
                      <img src={logoForPreview} alt={companyName} style={{ 
                        width: '180px', 
                        height: '72px',
                        marginBottom: '8px',
                        objectFit: 'contain'
                      }} />
                      <div style={{ fontWeight: 'bold', fontSize: '13px' }}>COMANDA MÚLTIPLE DE SERVICIO</div>
                    </div>
                    
                    {/* Contenido organizado en secciones */}
                    <div style={{ fontSize: '11px', lineHeight: '1.5' }}>
                      <div className="mb-2 pb-2" style={{ borderBottom: '1px dashed #ccc' }}>
                        <div><strong>FECHA:</strong> {formatDateForPrint(orders[0].created_at)}</div>
                        <div><strong>DISPOSITIVOS:</strong> {orders.length}</div>
                        <div><strong>SEDE:</strong> {branchName}</div>
                        <div><strong>TELÉFONO:</strong> {branchPhone}</div>
                      </div>
                      
                      <div className="mb-2 pb-2" style={{ borderBottom: '1px dashed #ccc' }}>
                        <div><strong>CLIENTE:</strong> {customer.full_name}</div>
                        {(customer.phone || customer.cedula) && <div><strong>TEL:</strong> {customer.phone || customer.cedula}</div>}
                        {customer.cedula && <div><strong>CÉDULA:</strong> {customer.cedula}</div>}
                      </div>
                      
                      <div className="mb-2 pb-2" style={{ borderBottom: '1px dashed #ccc' }}>
                        <div style={{ fontWeight: 'bold' }}>DISPOSITIVOS INGRESADOS:</div>
                        {orders.map((order, index) => (
                          <div key={order.id} className="mt-2 p-2" style={{ border: '1px solid #ddd', fontSize: '10px' }}>
                            <div><strong>{index + 1}. ORDEN:</strong> {order.order_number}</div>
                            <div><strong>TIPO:</strong> {order.device_type}</div>
                            <div><strong>MARCA:</strong> {order.device_brand}</div>
                            <div><strong>MODELO:</strong> {order.device_model || 'N/A'}</div>
                            <div><strong>SERIE:</strong> {order.serial_number || 'N/A'}</div>
                            <div><strong>PROBLEMA:</strong> {order.problem_description.slice(0, 30)}...</div>
                            <div><strong>ESTADO:</strong> {getStatusDisplayName(order.status)}</div>
                            {order.completion_notes && (
                              <div><strong>TRABAJO:</strong> {order.completion_notes.slice(0, 35)}...</div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Footer */}
                    <div className="text-center mt-3 pt-2" style={{ 
                      borderTop: '1px dashed #000',
                      fontSize: '11px',
                      fontWeight: 'bold'
                    }}>
                      <div>TOTAL: {orders.length} ÓRDENES</div>
                      <div>CONSERVE ESTE COMPROBANTE</div>
                    </div>
                  </div>
                  
                  <div className="mt-2 text-muted text-center" style={{ fontSize: '12px' }}>
                    📏 <strong>Formato de impresión:</strong> Tirilla 80mm
                  </div>
                </div>
              )}
              
              {/* Action Buttons */}
              <div className="d-flex gap-2 justify-content-center flex-wrap">
                <button
                  className="btn btn-primary"
                  onClick={handlePrintComanda}
                >
                  <Printer size={16} className="me-1" />
                  Imprimir Comanda Completa
                </button>
                
                <button
                  className="btn btn-warning text-dark"
                  onClick={handlePrintStickers}
                >
                  <Tag size={16} className="me-1" />
                  Imprimir {orders.length} Stickers
                </button>
                
                <button
                  className="btn text-white"
                  style={{ backgroundColor: secondaryColor, borderColor: secondaryColor }}
                  onClick={handleDownloadPDF}
                >
                  <Download size={16} className="me-1" />
                  Guardar PDF
                </button>
                
                <button
                  className="btn btn-secondary"
                  onClick={onClose}
                >
                  <X size={16} className="me-1" />
                  Cerrar
                </button>
              </div>

              {/* Info */}
              <div className="alert alert-info mt-3">
                <small>
                  <strong>📋 Comanda Completa:</strong> Un documento con todos los dispositivos del cliente<br />
                  <strong>🏷️ Stickers Individuales:</strong> Etiquetas separadas para marcar cada consola/dispositivo
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default MultipleOrdersComandaPreview
