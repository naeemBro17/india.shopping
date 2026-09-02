import { useState } from 'react'
import { Button, Field, Pill, TextInput } from './ui.jsx'

export default function StoreForm({ initial, onSubmit, onCancel }) {
  const [name, setName] = useState(initial?.name || '')
  const [type, setType] = useState(initial?.type || 'physical')
  const [location, setLocation] = useState(initial?.location || '')
  const [url, setUrl] = useState(initial?.website_url || '')
  const [error, setError] = useState('')

  function submit() {
    if (!name.trim()) {
      setError('Give the store a name')
      return
    }
    onSubmit({ name, type, location, website_url: url })
  }

  return (
    <div className="space-y-4">
      <Field label="Store name">
        <TextInput
          autoFocus
          value={name}
          onChange={(e) => {
            setName(e.target.value)
            setError('')
          }}
          placeholder="e.g. Kama Ayurveda, Select Citywalk"
        />
        {error && <span className="block text-[12px] text-accent-warm mt-1">{error}</span>}
      </Field>

      <Field label="Type">
        <div className="flex gap-2">
          <Pill active={type === 'physical'} onClick={() => setType('physical')} className="flex-1">
            Physical
          </Pill>
          <Pill active={type === 'online'} onClick={() => setType('online')} className="flex-1">
            Online
          </Pill>
        </div>
      </Field>

      <Field label="Location">
        <TextInput
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="e.g. Khan Market, New Delhi"
        />
      </Field>

      <Field label="Website URL">
        <TextInput
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="e.g. https://www.kamaayurveda.in"
        />
      </Field>

      <div className="flex gap-2 pt-1">
        <Button variant="secondary" className="flex-1" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="primary" className="flex-1" onClick={submit}>
          {initial ? 'Save changes' : 'Add store'}
        </Button>
      </div>
    </div>
  )
}
