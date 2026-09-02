import { useOnlineStatus } from '../hooks/useOnlineStatus.js'
import { WifiOffIcon } from './Icons.jsx'

export default function OfflineBanner() {
  const online = useOnlineStatus()
  if (online) return null
  return (
    <div className="tint-warning border-b flex items-center justify-center gap-2 py-1.5 text-[12.5px] font-medium">
      <WifiOffIcon size={15} />
      You are offline — changes still save to this device
    </div>
  )
}
