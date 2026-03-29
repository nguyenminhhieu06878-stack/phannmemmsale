import React from 'react'
import { Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { Result, Button } from 'antd'
import { hasMenuAccess } from '../utils/permissions'

const ProtectedRoute = ({ children, requiredPath }) => {
  const { user, isAuthenticated } = useSelector(state => state.auth)

  // Check if user is authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // Check if user has access to this route
  if (requiredPath && !hasMenuAccess(user?.role, requiredPath)) {
    return (
      <Result
        status="403"
        title="403"
        subTitle="Sorry, you do not have permission to access this page."
        extra={
          <Button type="primary" onClick={() => window.history.back()}>
            Back
          </Button>
        }
      />
    )
  }

  return children
}

export default ProtectedRoute