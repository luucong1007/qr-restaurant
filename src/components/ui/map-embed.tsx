'use client'

interface MapEmbedProps {
  lat: number
  lng: number
  name: string
  className?: string
}

export function MapEmbed({ lat, lng, name, className = 'w-full h-48 rounded-xl' }: MapEmbedProps) {
  const delta = 0.008
  const bbox = `${lng - delta},${lat - delta},${lng + delta},${lat + delta}`
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lng}`
  const mapsUrl = `https://www.google.com/maps?q=${lat},${lng}`

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
