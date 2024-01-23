import React from 'react'
import { useUser } from '../contexts/AuthContext'
import { Navigate } from 'react-router'

const AuthChecker = ({ children }: { children: React.ReactNode }) => {
  const { state } = useUser()
  if (state !== 'AUTHENTICATED' && process.env.APP_ENV !== 'development') {
    return <Navigate to="/login" />
  }
  return children
}

export default AuthChecker
