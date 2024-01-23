import { ChangeEvent, FormEvent, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useUser } from '../contexts/AuthContext'

const LoginForm = () => {
  const [username, setUsername] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const { signin } = useUser()

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault()
    await signin(username, password)
  }

  return (
    <form onSubmit={handleLogin}>
      <input
        type="text"
        name="username"
        placeholder="Username"
        value={username}
        onChange={(e: ChangeEvent<HTMLInputElement>) =>
          setUsername(e.currentTarget.value)
        }
      />
      <input
        type="password"
        name="password"
        placeholder="Password"
        minLength={15}
        value={password}
        onChange={(e: ChangeEvent<HTMLInputElement>) =>
          setPassword(e.currentTarget.value)
        }
      />
      <button type="submit">Login</button>
    </form>
  )
}

const MfaVerify = () => {
  const [code, setCode] = useState<string>('')
  const { verifyMfa } = useUser()

  const handleCode = async (e: FormEvent) => {
    e.preventDefault()
    verifyMfa(code)
  }

  return (
    <form onSubmit={handleCode}>
      <input
        type="text"
        name="code"
        placeholder="TOPT Code"
        autoComplete="one-time-code"
        value={code}
        onChange={(e: ChangeEvent<HTMLInputElement>) =>
          setCode(e.currentTarget.value)
        }
      />
      <button type="submit">Verify</button>
    </form>
  )
}

const ChangePassword = () => {
  const [password, setPassword] = useState<string>('')
  const [confirmPassword, setConfirmPassword] = useState<string>('')
  const [error, setError] = useState<string>('')
  const { newPassword } = useUser()

  const handleNewPassword = async (e: FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      setError('Passwords needs to match')
      return
    }
    newPassword(password)
  }

  return (
    <form onSubmit={handleNewPassword}>
      <input
        type="password"
        name="password"
        placeholder="New password"
        minLength={15}
        value={password}
        onChange={(e: ChangeEvent<HTMLInputElement>) =>
          setPassword(e.currentTarget.value)
        }
      />
      <input
        type="password"
        name="confirmPassword"
        placeholder="Confirm new password"
        minLength={15}
        value={confirmPassword}
        onChange={(e: ChangeEvent<HTMLInputElement>) =>
          setConfirmPassword(e.currentTarget.value)
        }
      />
      {error && <span style={{ color: 'red' }}>Error: {error}</span>}
      <button type="submit">Submit</button>
    </form>
  )
}

const MfaSetup = () => {
  const [code, setCode] = useState<string>('')
  const [deviceName, setDeviceName] = useState<string>('')
  const { mfaSecretCode, verifyMfaSetup } = useUser()

  const handleVerify = async (e: FormEvent) => {
    e.preventDefault()
    verifyMfaSetup(code, deviceName)
  }

  return (
    <form onSubmit={handleVerify}>
      <p>Secret code: {mfaSecretCode}</p>
      <input
        type="text"
        name="code"
        placeholder="TOPT Code"
        autoComplete="one-time-code"
        value={code}
        onChange={(e: ChangeEvent<HTMLInputElement>) =>
          setCode(e.currentTarget.value)
        }
      />
      <input
        type="text"
        name="deviceName"
        placeholder="Device name"
        value={deviceName}
        onChange={(e: ChangeEvent<HTMLInputElement>) =>
          setDeviceName(e.currentTarget.value)
        }
      />
      <button type="submit">Verify</button>
    </form>
  )
}

const Login = () => {
  const { state } = useUser()
  return (
    <div>
      {state === 'LOGIN' && <LoginForm />}
      {state === 'SOFTWARE_TOKEN_MFA' && <MfaVerify />}
      {state === 'AUTHENTICATED' && <Navigate to="/" />}
      {state === 'MFA_SETUP' && <MfaSetup />}
      {state === 'NEW_PASSWORD_REQUIRED' && <ChangePassword />}
      {state === 'ERROR' && <p>Error happened.</p>}
    </div>
  )
}

export default Login
