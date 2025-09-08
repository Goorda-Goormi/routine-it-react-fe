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
    proxy: {
      '/ws': {
        target: 'http://54.180.93.1:8080',
        ws: true, // 웹소켓 프록시 활성화
        //changeOrigin: true, // 호스트 헤더 변경
      },
      '/api': {
        target: 'http://54.180.93.1:8080',
        changeOrigin: true,
      }
    }
  
  },
  define: {
    global: 'window',
  },
});