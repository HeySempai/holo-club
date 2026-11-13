# Holo Club

Club de suscripción mensual de sobres de Pokémon TCG sellados, con envío a todo México.

## Stack

- **Next.js 15** (App Router) + Tailwind CSS 4, desplegado en **Vercel**
- **Supabase**: base de datos, cuentas y archivos (proyecto `holo-club`, región `us-west-1`)
- **Mercado Pago**: suscripciones (etapa 2)

## Etapas

1. ✅ Sitio con lista de socios fundadores guardada en Supabase
2. Suscripción con Mercado Pago (cuentas, cobro recurrente, webhooks)
3. Panel de administración: cajas, asignación al azar de sobres y envíos
4. Biblioteca, registro de cartas por código de sobre, Holos y muro de aperturas

## Desarrollo local

```bash
cp .env.example .env.local   # completa la llave publicable
npm install
npm run dev
```

## Base de datos

- `public.waitlist`: nombre, correo (único, sin distinguir mayúsculas) y origen. RLS permite solo insertar; nadie puede leer la lista desde la API pública.
- `public.waitlist_count()`: devuelve solo el número de inscritos, para el contador de lugares.
