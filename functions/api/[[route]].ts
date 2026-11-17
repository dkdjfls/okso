import { Hono } from 'hono'
import { handle } from 'hono/cloudflare-pages'
import { sights } from '../../src/data'

const app = new Hono().basePath('/api')

app.get('/health', (c) => c.json({ ok: true }))
app.get('/sights', (c) => c.json(sights))

export const onRequest = handle(app)
