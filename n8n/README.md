# Asistente n8n

El chat de `/asistente` manda cada mensaje a un webhook de n8n (si `VITE_N8N_WEBHOOK_URL` está configurada). Si n8n no responde, el chat cae solo al modo demo (respuestas locales) — nunca se rompe.

## 1. Instalar Docker Desktop (Windows, una sola vez)

1. **WSL2** (requisito): PowerShell **como administrador** →
   ```powershell
   wsl --install
   ```
   Reiniciar la PC cuando lo pida.
2. **Docker Desktop**:
   ```powershell
   winget install -e --id Docker.DockerDesktop
   ```
   (o descargar de https://www.docker.com/products/docker-desktop/)
3. Abrir Docker Desktop, aceptar el asistente, dejarlo corriendo (ícono de ballena en la bandeja).
4. Verificar: `docker --version`.

## 2. Levantar n8n

Desde esta carpeta (`n8n/`):
```powershell
docker compose up -d
```
- Primera vez: descarga la imagen (~1 min).
- Abrir **http://localhost:5678** → crear la cuenta local (es solo tuya, en tu máquina).
- Apagar: `docker compose down` (los datos quedan en el volumen `n8n_data`).

## 3. Importar el workflow

1. En n8n: **Workflows → ⋯ → Import from File** → elegir `workflow.json`.
2. Abrir el workflow "Asistente Emi" y **activarlo** (toggle arriba a la derecha).
3. La URL del webhook queda: `http://localhost:5678/webhook/asistente`.

> Ojo: con el workflow **inactivo**, n8n solo escucha en `webhook-test/...` mientras apretás "Listen". Activalo para la URL estable.

## 4. Conectar el sitio

```powershell
# en la raíz del proyecto
Copy-Item .env.example .env.local
```
Editar `.env.local` y descomentar:
```
VITE_N8N_WEBHOOK_URL=http://localhost:5678/webhook/asistente
```
Reiniciar `npm run dev` (Vite lee el env al arrancar). El header del chat pasa de "modo demo" a **● conectado a n8n**.

Prueba rápida sin el sitio:
```powershell
Invoke-RestMethod -Method Post -Uri "http://localhost:5678/webhook/asistente" -ContentType "application/json" -Body '{"message":"hola","intent":"chat","sessionId":"test"}'
```

## 5. Hosting público (para después)

El Docker local **solo responde mientras tu PC está prendida**. El sitio deployado en Vercel necesita un webhook accesible desde internet. Opciones, de menos a más esfuerzo:

| Opción | Costo | Notas |
|---|---|---|
| **Fallback canned (hoy)** | $0 | Sin n8n público el chat funciona igual, en modo demo. Cero urgencia. |
| **Cloudflare Tunnel** | $0 | Expone tu n8n local con URL pública. Ideal para demos; sigue dependiendo de tu PC prendida. |
| **VPS chico (Hetzner/Contabo, ~4 €/mes)** | ~$5 | `docker compose up -d` en el VPS y listo. Control total, el más usado para n8n self-host. |
| **Railway / Render** | ~$5+/mes | Deploy de la imagen n8n administrado; menos control, setup fácil. |
| **n8n Cloud** | ~20 €+/mes | Oficial, cero mantenimiento, soporte. Caro para un chiste de portfolio. |

Cuando elijas hosting: misma importación del workflow, y en Vercel se setea `VITE_N8N_WEBHOOK_URL=https://tu-n8n.tudominio.com/webhook/asistente` (Environment Variables del proyecto) + redeploy. En el nodo Webhook conviene cambiar `allowedOrigins` de `*` al dominio real del portfolio.

## Extender el workflow (ideas)

- Rama del `intent: greeting` → nodo **Gmail/Telegram** para avisarte cada saludo.
- Reemplazar el nodo Code por un **AI Agent** (OpenAI/Anthropic) con system prompt humorístico — mismo contrato: responder `{ "reply": "..." }`.
- **Google Sheets** para loguear mensajes y ver qué te escriben.
