'use client'
import { Table } from '@/types'
import QRCode from 'qrcode'
import { useEffect, useRef } from 'react'
import { Download } from 'lucide-react'

interface Props {
  table: Table
  branchSlug: string
}

export function QRTableCard({ table, branchSlug }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const tableUrl = `${appUrl}/${branchSlug}/table/${table.id}`

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, tableUrl, { width: 120, margin: 1 })
    }
  }, [tableUrl])

  function downloadQR() {
    const canvas = canvasRef.current
    if (!canvas) return
    const link = document.createElement('a')
    link.download = `qr-${branchSlug}-ban${table.number}.png`
    link.href = canvas.toDataURL()
    link.click()
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-3 flex flex-col items-center gap-2 shadow-sm">
      <p className="font-bold text-gray-800">Bàn {table.name}</p>
      <canvas ref={canvasRef} className="rounded-lg" />
      <button
        onClick={downloadQR}
        className="flex items-center gap-1 text-xs text-gray-500 hover:text-orange-500 transition-colors"
      >
        <Download size={12} /> Tải QR
      </button>
    </div>
  )
}
