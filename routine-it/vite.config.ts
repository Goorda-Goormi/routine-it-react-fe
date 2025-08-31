/*import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
})
*/
// vite.config.ts 또는 vite.config.js

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  plugins: [react()],
  // 3000 포트로 강제 설정
  server: {
    port: 3000,
  },
});