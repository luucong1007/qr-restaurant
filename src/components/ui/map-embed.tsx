'use client'

interface MapEmbedProps {
  lat?: number | null
  lng?: number | null
  name: string
  address?: string | null
  className?: string
}

export function MapEmbed({ lat, lng, name, address, className = 'w-full h-48 rounded-xl' }: MapEmbedProps) {
  const query = [name, address].filter(Boolean).join(', ')

  let src: string
  let mapsUrl: string

  if (lat && lng) {
    const delta = 0.008
    const bbox = `${lng - delta},${lat - delta},${lng + delta},${lat + delta}`
    src = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lng}`
    mapsUrl = `https://www.google.com/maps?q=${lat},${lng}`
  } else {
    src = `https://maps.google.com/maps?q=${encodeURIComponent(query)}&output=embed`
    mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
  }

  return (
    <div className="space-y-1">
      <iframe
        src={src}
        title={`Bản đồ ${name}`}
        className={className}
        loading="lazy"
        referrerPolicy="no-referrer"
      />
      <a
        href={mapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 text-xs text-orange-500 hover:underline"
      >
        📍 Mở Google Maps
      </a>
    </div>
  )
}
