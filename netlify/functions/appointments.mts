import { getStore } from '@netlify/blobs'
import type { Config } from '@netlify/functions'

const STORE_NAME = 'appointments'
const DATA_KEY = 'all-appointments'

export default async (req: Request) => {
  const store = getStore({ name: STORE_NAME, consistency: 'strong' })

  if (req.method === 'GET') {
    const data = await store.get(DATA_KEY, { type: 'json' })
    return Response.json(data || [])
  }

  if (req.method === 'POST') {
    const newApt = await req.json()
    const existing = (await store.get(DATA_KEY, { type: 'json' })) as any[] || []
    existing.push(newApt)
    await store.setJSON(DATA_KEY, existing)
    return Response.json({ ok: true })
  }

  if (req.method === 'PUT') {
    const { id, status } = await req.json()
    const existing = (await store.get(DATA_KEY, { type: 'json' })) as any[] || []
    const apt = existing.find((a: any) => a.id === id)
    if (apt) {
      apt.status = status
      await store.setJSON(DATA_KEY, existing)
      return Response.json({ ok: true })
    }
    return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 })
  }

  return new Response('Method not allowed', { status: 405 })
}

export const config: Config = {
  path: '/api/appointments',
}
