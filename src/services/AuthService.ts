/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  AssociateSoftwareTokenCommand,
  AuthFlowType,
  ChallengeNameType,
  CognitoIdentityProviderClient,
  GetUserCommand,
  GlobalSignOutCommand,
  InitiateAuthCommand,
  RespondToAuthChallengeCommand,
  VerifySoftwareTokenCommand
} from '@aws-sdk/client-cognito-identity-provider'

export type AuthState =
  | 'INVALID'
  | 'LOGIN'
  | 'AUTHENTICATED'
  | 'ERROR'
  | ChallengeNameType

const client = new CognitoIdentityProviderClient({
  region: process.env.AWS_REGION
})

const getUser = async (accessToken: string) => {
  const command = new GetUserCommand({
    AccessToken: accessToken
  })

  const response = await client.send(command)
  return response
}

export const newPassword = async (
  session: string,
  username: string,
  password: string
) => {
  const respondCommand = new RespondToAuthChallengeCommand({
    ClientId: process.env.AUTH_CLIENT_ID!,
    ChallengeName: 'NEW_PASSWORD_REQUIRED',
    Session: session,
    ChallengeResponses: {
      USERNAME: username,
      NEW_PASSWORD: password
    }
  })
  const respondResponse = await client.send(respondCommand)
  return respondResponse
}

const beginMfaSetup = async (session: string) => {
  const setupCommand = new AssociateSoftwareTokenCommand({
    Session: session
  })
  const setupResponse = await client.send(setupCommand)
  return setupResponse
}

const verifyMfaSetup = async (
  session: string,
  code: string,
  deviceName: string
) => {
  const verifyCommand = new VerifySoftwareTokenCommand({
    Session: session,
    UserCode: code,
    FriendlyDeviceName: deviceName
  })

  const verifyResponse = await client.send(verifyCommand)
  return verifyResponse
}

const verifyMfa = async (session: string, username: string, code: string) => {
  const respondCommand = new RespondToAuthChallengeCommand({
    ClientId: process.env.AUTH_CLIENT_ID!,
    ChallengeName: 'SOFTWARE_TOKEN_MFA',
    Session: session,
    ChallengeResponses: {
      USERNAME: username,
      SOFTWARE_TOKEN_MFA_CODE: code
    }
  })

  const respondResponse = await client.send(respondCommand)
  return respondResponse
}

const signin = async (username: string, password: string) => {
  const authCommand = new InitiateAuthCommand({
    AuthFlow: AuthFlowType.USER_PASSWORD_AUTH,
    AuthParameters: {
      USERNAME: username,
      PASSWORD: password
    },
    ClientId: process.env.AUTH_CLIENT_ID!
  })
  const authResponse = await client.send(authCommand)
  return authResponse
}

const signout = async (accessToken: string) => {
  const command = new GlobalSignOutCommand({
    AccessToken: accessToken
  })

  const response = await client.send(command)
  return response
}

export default {
  signin,
  verifyMfa,
  signout,
  getUser,
  newPassword,
  beginMfaSetup,
  verifyMfaSetup
}
