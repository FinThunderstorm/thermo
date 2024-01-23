import { useUser } from '../contexts/AuthContext'
import AuthChecker from './AuthChecker'

const Dashboard = () => {
  const { user } = useUser()

  return (
    <AuthChecker>
      <div>
        <h1 className="text-3xl font-bold text-cyan-500">
          Hello {user.username}!
        </h1>
        <p>{process.env.BUILT_AT}</p>
      </div>
    </AuthChecker>
  )
}

export default Dashboard
