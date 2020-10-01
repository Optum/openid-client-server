import exampleOpenIdConfig from './example-openid-configuration.json'
// import {Options} from '../../src/types'

export const issuer = 'https://examples.auth0.com'
export const discoveryPath = '/.well-known/openid-configuration'
export const discoveryEndpoint = `${issuer}${discoveryPath}`

// export const testOptions: Options = {
//     clientServerOptions: {
//         discoveryEndpoint,
//         signInPath: '/openid/signin',
//         callbackPath: '/openid/callback',
//         processCallbackPath: '/openid/process-callback',
//         signOutPath: '/openid/signout',
//         userInfoPath: '/openid/userinfo',
//         errorPagePath: '/openid-error',
//         enablePKCE: false,
//         enableOauth2: false,
//         authorizationEndpoint: 'http://not-an-authorization-endpoint.test',
//         tokenEndpoint: 'http://not-a-token-endpoint.test',
//         userInfoEndpoint: 'http://not-a-user-info-endpoint.test',
//         scope: 'user repo'
//     },
//     sessionOptions: {
//         sessionKeys: ['test-session-keys'],
//         sessionName: 'openid:session',
//         sameSite: true
//     },
//     clientMetadata: {
//         client_id: 'test-client-id'
//     },
//     loggerOptions: {
//         level: 'silent',
//         useLevelLabels: true,
//         name: 'openid-client-server'
//     },
//     proxyOptions: {
//         proxyPaths: [],
//         proxyHosts: [],
//         excludeCookie: [],
//         excludeOriginHeaders: [],
//         useIdToken: []
//     }
// }

// export const testOptionsWithEmitEvents: Options = {
//     ...testOptions,
//     clientServerOptions: {
//         ...testOptions.clientServerOptions,
//         emitEvents: true
//     }
// }

// export const testOptionsWithProxy: Options = {
//     ...testOptions,
//     proxyOptions: {
//         proxyPaths: ['/proxy'],
//         proxyHosts: ['https://host.test'],
//         excludeCookie: [false],
//         excludeOriginHeaders: [false],
//         useIdToken: [false]
//     }
// }

// export const testOptionsWithoutScope: Options = {
//     ...testOptions,
//     clientServerOptions: {
//         ...testOptions.clientServerOptions,
//         scope: undefined
//     }
// }

// export const makeOptionsWithSecurePaths = (securedPaths: string[]): Options => {
//     const options = {...testOptions}
//     options.clientServerOptions = {
//         ...testOptions.clientServerOptions,
//         securedPaths
//     }
//     return options
// }

// export const makeOptionsWithScope = (scope: string): Options => {
//     const options = {...testOptions}
//     options.clientServerOptions = {
//         ...testOptions.clientServerOptions,
//         scope
//     }
//     return options
// }

export const openIdDiscoveryConfiguration = exampleOpenIdConfig
