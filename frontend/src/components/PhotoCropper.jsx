import { useState, useCallback } from 'react'
import Cropper from 'react-easy-crop'

function getCroppedImg(imageSrc, crop) {
  return new Promise((resolve) => {
    const image = new Image()
    image.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = crop.width
      canvas.height = crop.height
      const ctx = canvas.getContext('2d')
      ctx.drawImage(image, crop.x, crop.y, crop.width, crop.height, 0, 0, crop.width, crop.height)
      canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.9)
    }
    image.src = imageSrc
  })
}

export default function PhotoCropper({ imageSrc, onCropDone, onCancel }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)

  const onCropComplete = useCallback((_, pixels) => {
    setCroppedAreaPixels(pixels)
  }, [])

  const handleDone = async () => {
    const blob = await getCroppedImg(imageSrc, croppedAreaPixels)
    const reader = new FileReader()
    reader.onload = () => {
      const base64 = reader.result.split(',')[1]
      onCropDone(base64)
    }
    reader.readAsDataURL(blob)
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/80">
      <div className="relative flex-1">
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          aspect={1}
          cropShape="round"
          showGrid={false}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={onCropComplete}
        />
      </div>
      <div className="bg-white p-4 flex items-center gap-4">
        <div className="flex-1">
          <label className="text-xs font-bold text-gray-500 block mb-1">Zoom</label>
          <input
            type="range"
            min={1}
            max={3}
            step={0.1}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="w-full accent-blue-500"
          />
        </div>
        <button onClick={handleDone} className="btn-camp btn-camp-green !text-sm !py-2 !px-6">
          Save
        </button>
        <button onClick={onCancel} className="btn-camp !text-sm !py-2 !px-6 !bg-gray-400">
          Cancel
        </button>
      </div>
    </div>
  )
}
