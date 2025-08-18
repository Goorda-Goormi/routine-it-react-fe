import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindPostcss from '@tailwindcss/postcss';
import autoprefixer from 'autoprefixer';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  css: {
    postcss: {
      plugins: [
        // 'tailwindPostcss' 변수를 여기에 추가하여 플러그인으로 사용합니다.
        tailwindPostcss(), 
        autoprefixer(),
      ],
    }
  },
})
