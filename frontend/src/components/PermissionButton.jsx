import React from 'react'
import { Button, Tooltip } from 'antd'
import { useSelector } from 'react-redux'
import { canPerformAction } from '../utils/permissions'

const PermissionButton = ({ 
  action, 
  children, 
  tooltip = "You do not have permission to perform this action",
  disabled = false,
  ...props 
}) => {
  const { user } = useSelector(state => state.auth)
  const hasPermission = canPerformAction(user?.role, action)

  if (!hasPermission) {
    return (
      <Tooltip title={tooltip}>
        <Button {...props} disabled={true}>
          {children}
        </Button>
      </Tooltip>
    )
  }

  return (
    <Button {...props} disabled={disabled}>
      {children}
    </Button>
  )
}

export default PermissionButton