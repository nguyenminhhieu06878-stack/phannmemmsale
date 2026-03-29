import React from 'react'
import { useSelector } from 'react-redux'
import { Typography, Space } from 'antd'
import { getRoleDisplayName } from '../utils/permissions'

const { Text } = Typography

const UserInfo = () => {
  const { user } = useSelector(state => state.auth)
  
  if (!user) {
    return (
      <div style={{ 
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <div style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          background: '#faad14',
          animation: 'pulse 2s infinite'
        }} />
        <Text style={{ fontSize: '14px', color: '#656d76' }}>Loading...</Text>
      </div>
    )
  }

  return (
    <div style={{ 
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-end',
      gap: '2px',
      marginRight: '12px'
    }}>
      <Text style={{ 
        fontSize: '14px', 
        fontWeight: '600', 
        color: '#24292f',
        lineHeight: '1.2',
        margin: 0
      }}>
        {user.fullName || user.username || 'User'}
      </Text>
      <Text style={{ 
        fontSize: '12px', 
        color: '#656d76',
        lineHeight: '1.2',
        margin: 0
      }}>
        {getRoleDisplayName(user.role)}
      </Text>
    </div>
  )
}

export default UserInfo