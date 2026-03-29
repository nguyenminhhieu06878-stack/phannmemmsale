import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { ConfigProvider } from 'antd'
import enUS from 'antd/locale/en_US'
import dayjs from 'dayjs'
import 'dayjs/locale/en'
import App from './App.jsx'
import store from './store/index.js'
import './index.css'

// Set dayjs locale to English
dayjs.locale('en')

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <ConfigProvider 
        locale={enUS}
        theme={{
          token: {
            colorPrimary: '#0969da',
            colorSuccess: '#1a7f37',
            colorWarning: '#d1242f',
            colorError: '#cf222e',
            colorInfo: '#0969da',
            borderRadius: 8,
            borderRadiusLG: 12,
            borderRadiusSM: 6,
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif',
            fontSize: 14,
            colorBgContainer: '#ffffff',
            colorBgLayout: '#f6f8fa',
            boxShadow: '0 1px 3px rgba(16, 22, 26, 0.1), 0 1px 2px rgba(16, 22, 26, 0.2)',
            boxShadowSecondary: '0 1px 2px rgba(16, 22, 26, 0.15)',
            colorText: '#24292f',
            colorTextSecondary: '#656d76',
            colorBorder: '#d0d7de',
          },
          components: {
            Layout: {
              headerBg: '#ffffff',
              siderBg: '#24292f',
              bodyBg: '#f6f8fa',
            },
            Menu: {
              itemBorderRadius: 6,
              itemMarginBlock: 2,
              itemMarginInline: 8,
              darkItemBg: 'transparent',
              darkItemSelectedBg: '#21262d',
              darkItemHoverBg: '#30363d',
            },
            Button: {
              borderRadius: 6,
              controlHeight: 32,
              controlHeightSM: 28,
              controlHeightLG: 40,
            },
            Card: {
              borderRadiusLG: 8,
            },
            Table: {
              borderRadiusLG: 8,
            },
            Modal: {
              borderRadiusLG: 8,
            },
            Input: {
              borderRadius: 6,
              controlHeight: 32,
            },
            Select: {
              borderRadius: 6,
              controlHeight: 32,
            }
          }
        }}
      >
        <App />
      </ConfigProvider>
    </Provider>
  </React.StrictMode>,
)