import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

import "./styles/globals.css"

import { Provider } from 'react-redux';
import { store } from './store/store';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 예: 5분 동안 캐시된 데이터를 신선하게 유지. 이 시간 동안 API 재요청 없음.
      staleTime: 1000 * 60 * 5, 
      // 실패 시 재시도 횟수 설정
      retry: 2,
    },
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}> 
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </Provider>
  </StrictMode>,
)
