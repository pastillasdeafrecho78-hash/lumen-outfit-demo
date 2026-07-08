# Música del intro — créditos y licencia

## Pista en uso

| Campo | Valor |
|-------|--------|
| **Título** | Relax Beat |
| **Artista** | Arulo |
| **Fuente** | [Mixkit](https://mixkit.co/free-stock-music/ambient/) |
| **Licencia** | [Mixkit Free License](https://mixkit.co/license/#musicFree) |
| **Uso** | Comercial y personal, **sin atribución obligatoria** |
| **Archivo** | `public/video/narration/bg-music.mp3` (recorte ~38 s del original) |

## Dónde bajar más música sin derechos (recomendado)

| Sitio | Licencia | Atribución | Link |
|-------|----------|------------|------|
| **Mixkit** | Gratis comercial | No requerida | https://mixkit.co/free-stock-music/ |
| **Pixabay Music** | Pixabay License | No requerida | https://pixabay.com/music/ |
| **FreePD** | Dominio público (CC0) | No | https://freepd.com/ |
| **Internet Archive** | Varía (revisar cada track) | A veces | https://archive.org/details/audio |

## Regenerar la música del intro

```bash
npm run download:intro-music
```

Eso descarga **Relax Beat** de Mixkit y genera `public/video/narration/bg-music.mp3`.

Para otra pista, edita `TRACK_ID` en `scripts/download-intro-music.mjs` (IDs visibles en la URL de Mixkit, ej. `292` → Relax Beat).
