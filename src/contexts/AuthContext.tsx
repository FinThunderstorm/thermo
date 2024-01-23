import React, { createContext, useContext, useState } from 'react'
import AuthService, { type AuthState } from '../services/AuthService'

interface User {
  username: string
  email: string
}

interface Tokens {
  access: string
  id: string
  refresh: string
}

interface AuthContext {
  state: AuthState
  user: User
  setUser(user: User): void
  session: string
  setSession(session: string): void
  tokens: Tokens
  setTokens(tokens: Tokens): void
  signin(username: string, password: string): Promise<void>
  verifyMfa(code: string): Promise<void>
  newPassword(password: string): Promise<void>
  mfaSecretCode: string
  setMfaSecretCode(mfaSecretCode: string): void
  verifyMfaSetup(code: string, deviceName: string): Promise<void>
}

const AuthContext = createContext<AuthContext>({
  state: 'INVALID',
  user: { username: 'NOTVALID', email: 'NOTVALID' },
  setUser: () => null,
  session: 'NOTVALID',
  setSession: () => null,
  tokens: { access: 'NOTVALID', id: 'NOTVALID', refresh: 'NOTVALID' },
  setTokens: () => null,
  signin: () =>
    new Promise<void>((resolve) => {
      resolve()
    }),
  verifyMfa: () =>
    new Promise<void>((resolve) => {
      resolve()
    }),
  newPassword: () =>
    new Promise<void>((resolve) => {
      resolve()
    }),
  mfaSecretCode: '',
  setMfaSecretCode: () => null,
  verifyMfaSetup: () =>
    new Promise<void>((resolve) => {
      resolve()
    })
})

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, setState] = useState<AuthState>('LOGIN')
  const [username, setUsername] = useState<string>('')
  const [user, setUser] = useState<User>({ username: '', email: '' })
  const [session, setSession] = useState<string>('')
  const [tokens, setTokens] = useState<Tokens>({
    access: '',
    id: '',
    refresh: ''
  })
  const [mfaSecretCode, setMfaSecretCode] = useState<string>('')

  const handleSetStateSession = (state?: AuthState, session?: string) => {
    if (!state) {
      setState('ERROR')
      return
    }

    if (!session && state !== 'AUTHENTICATED') {
      throw new Error('Session undefined')
    }

    setState(state)
    setSession(session || '')

    if (state === 'MFA_SETUP' && session) {
      AuthService.beginMfaSetup(session).then((response) => {
        if (!response.SecretCode) {
          throw new Error('Error while MFA setup')
        }

        if (!response.Session) {
          throw new Error('Session undefined')
        }

        setSession(response.Session)
        setMfaSecretCode(response.SecretCode || '')
      })
    }

    if (state === 'LOGIN') {
      setSession('')
    }
  }

  const signin = async (username: string, password: string) => {
    try {
      const response = await AuthService.signin(username, password)
      handleSetStateSession(response.ChallengeName, response.Session)
      setUsername(username)
    } catch (error) {
      setState('ERROR')
      console.error(error)
    }
  }

  const verifyMfa = async (code: string) => {
    try {
      if (!session) throw new Error('Session undefined')
      const response = await AuthService.verifyMfa(session, username, code)
      handleSetStateSession('AUTHENTICATED', response.Session)
      setTokens({
        access: response.AuthenticationResult?.AccessToken || '',
        id: response.AuthenticationResult?.IdToken || '',
        refresh: response.AuthenticationResult?.RefreshToken || ''
      })
      const userInfo = await AuthService.getUser(
        response.AuthenticationResult?.AccessToken || ''
      )
      setUser({
        username: userInfo.Username || '',
        email:
          userInfo.UserAttributes?.find((attr) => attr.Name === 'email')
            ?.Value || ''
      })
    } catch (error) {
      setState('ERROR')
      console.error(error)
    }
  }

  const verifyMfaSetup = async (code: string, deviceName: string) => {
    try {
      if (!session) throw new Error('Session undefined')
      const response = await AuthService.verifyMfaSetup(
        session,
        code,
        deviceName
      )
      if (!response) {
        throw new Error('Error while submitting MFA verify')
      }
      handleSetStateSession('LOGIN', response.Session)
    } catch (error) {
      setState('ERROR')
      console.error(error)
    }
  }

  const newPassword = async (password: string) => {
    try {
      if (!session) throw new Error('Session undefined')
      const response = await AuthService.newPassword(
        session,
        username,
        password
      )
      handleSetStateSession(response.ChallengeName, response.Session)
    } catch (error) {
      setState('ERROR')
      console.error(error)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        state,
        user,
        setUser,
        session,
        setSession,
        tokens,
        setTokens,
        signin,
        verifyMfa,
        newPassword,
        mfaSecretCode,
        setMfaSecretCode,
        verifyMfaSetup
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useUser = () => {
  const context = useContext(AuthContext)

  if (context.state === 'INVALID') {
    throw new Error('AuthProvider is not initialized.')
  }

  return context
}

export default AuthProvider
