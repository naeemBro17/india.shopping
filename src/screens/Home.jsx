import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore.js'
import TopBar from '../components/TopBar.jsx'
import { Button } from '../components/ui.jsx'
import { PlusIcon, SettingsIcon } from '../components/Icons.jsx'

export default function Home() {
  const navigate = useNavigate()
  const products = useStore((s) => s.products)

  const total = products.length
  const mustBuy = products.filter(
    (p) => p.priority === 'must_buy' && !p.is_bought
  ).length
  const bought = products.filter((p) => p.is_bought).length

  return (
    <div>
      <TopBar
        title="Shopping Mission"
        right={
          <button
            onClick={() => navigate('/settings')}
            aria-label="Settings"
            className="w-11 h-11 rounded-full flex items-center justify-center text-text-primary active:bg-surface-2"
          >
            <SettingsIcon size={20} />
          </button>
        }
      />

      <div className="px-5 pt-16 flex flex-col items-center text-center">
        <p className="text-[13.5px] text-text-secondary">
          {total === 0
            ? 'Nothing on the list yet'
            : `${total} product${total === 1 ? '' : 's'} · ${mustBuy} must-buy${
                bought ? ` · ${bought} bought` : ''
              }`}
        </p>

        <Button
          variant="primary"
          className="mt-7 w-full max-w-[300px]"
          onClick={() => navigate('/products?add=1')}
        >
          <PlusIcon size={18} />
          Add Product
        </Button>

        <button
          onClick={() => navigate('/products')}
          className="mt-3.5 text-[14px] font-medium text-accent active:opacity-70"
        >
          View List
        </button>
      </div>
    </div>
  )
}
