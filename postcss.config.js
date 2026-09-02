import { fileURLToPath, URL } from 'node:url'
import tailwindcss from 'tailwindcss'
import autoprefixer from 'autoprefixer'

// Point Tailwind at its config explicitly. Tailwind v3 otherwise only looks
// in process.cwd(), which is not guaranteed to be the project directory on
// some build hosts (e.g. Vercel) — without this the generated CSS silently
// loses almost every utility class.
const tailwindConfig = fileURLToPath(new URL('./tailwind.config.js', import.meta.url))

export default {
  plugins: [tailwindcss({ config: tailwindConfig }), autoprefixer()],
}
