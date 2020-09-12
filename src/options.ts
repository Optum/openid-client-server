import {BasicType, BasicTypeArray} from './json'
import {LoggerOptions} from 'pino'

import {ClientMetadata} from 'openid-client'

export class OptionsError extends Error {
    constructor(message: string) {
        super(message)
        this.name = 'OptionsError'
    }
}

export interface ClientServerOptions {
    discoveryEndpoint: string
    scope?: string
    enablePKCE: boolean
    enableOauth2: boolean
    signInPath: string
    callbackPath: string
    processCallbackPath: string
    signOutPath: string
    userInfoPath: string
    errorPagePath: string
    signedOutPage?: string
    securedPaths?: string[]
    authorizationEndpoint: string
    tokenEndpoint: string
    userInfoEndpoint?: string
    emitEvents?: boolean
}

export interface SessionOptions {
    sessionName: string
    sessionKeys: string[]
    sameSite: boolean
}

export interface ProxyOptions {
    proxyPaths: string[]
    proxyHosts: string[]
    excludeCookie: boolean[]
    useIdToken: boolean[]
    excludeOriginHeaders: boolean[]
}

export interface Options {
    clientServerOptions: ClientServerOptions
    sessionOptions: SessionOptions
    clientMetadata: ClientMetadata
    loggerOptions: LoggerOptions
    loggerDestination?: NodeJS.WritableStream
    proxyOptions: ProxyOptions
}

type Empty = null

interface EnvMapItem {
    propKey: string
    envKey: string
    /**
     * Should represent the type where typeof can be used to cast/convert
     */
    defaultValue: BasicType | BasicTypeArray
    required: boolean
    skipIfNotRequired?: BasicType | BasicTypeArray | Empty
}

const clientMetadataEnvMapItems: EnvMapItem[] = [
    {
        propKey: 'client_id',
        envKey: 'OPENID_CLIENT_ID',
        defaultValue: '',
        required: true
    },
    {
        propKey: 'client_secret',
        envKey: 'OPENID_CLIENT_SECRET',
        defaultValue: '',
        required: false,
        skipIfNotRequired: true
    },
    {
        propKey: 'id_token_signed_response_alg',
        envKey: 'OPENID_ID_TOKEN_SIGNED_RESPONSE_ALG',
        defaultValue: '',
        required: false,
        skipIfNotRequired: true
    },
    {
        propKey: 'id_token_encrypted_response_alg',
        envKey: 'OPENID_ID_TOKEN_ENCRYPTED_RESPONSE_ALG',
        defaultValue: '',
        required: false,
        skipIfNotRequired: true
    },
    {
        propKey: 'id_token_encrypted_response_enc',
        envKey: 'OPENID_ID_TOKEN_ENCRYPTED_RESPONSE_ENC',
        defaultValue: '',
        required: false,
        skipIfNotRequired: true
    },
    {
        propKey: 'userinfo_signed_response_alg',
        envKey: 'OPENID_USERINFO_SIGNED_RESPONSE_ALG',
        defaultValue: '',
        required: false,
        skipIfNotRequired: true
    },
    {
        propKey: 'userinfo_encrypted_response_alg',
        envKey: 'OPENID_USERINFO_ENCRYPTED_RESPONSE_ALG',
        defaultValue: '',
        required: false,
        skipIfNotRequired: true
    },
    {
        propKey: 'userinfo_encrypted_response_enc',
        envKey: 'OPENID_USERINFO_ENCRYPTED_RESPONSE_ENC',
        defaultValue: '',
        required: false,
        skipIfNotRequired: true
    },
    {
        propKey: 'redirect_uris',
        envKey: 'OPENID_REDIRECT_URIS',
        defaultValue: [],
        required: false,
        skipIfNotRequired: true
    },
    {
        propKey: 'response_types',
        envKey: 'OPENID_RESPONSE_TYPES',
        defaultValue: ['code'],
        required: false,
        skipIfNotRequired: true
    },
    {
        propKey: 'post_logout_redirect_uris',
        envKey: 'OPENID_POST_LOGOUT_REDIRECT_URIS',
        defaultValue: [],
        required: false,
        skipIfNotRequired: true
    },
    {
        propKey: 'default_max_age',
        envKey: 'OPENID_DEFAULT_MAX_AGE',
        defaultValue: 480,
        required: false,
        skipIfNotRequired: true
    },
    {
        propKey: 'require_auth_time',
        envKey: 'OPENID_REQUIRE_AUTH_TIME',
        defaultValue: '',
        required: false,
        skipIfNotRequired: true
    },
    {
        propKey: 'request_object_signing_alg',
        envKey: 'OPENID_REQUEST_OBJECT_SIGNING_ALG',
        defaultValue: '',
        required: false,
        skipIfNotRequired: true
    },
    {
        propKey: 'request_object_encryption_alg',
        envKey: 'OPENID_REQUEST_OBJECT_ENCRYPTION_ALG',
        defaultValue: '',
        required: false,
        skipIfNotRequired: true
    },
    {
        propKey: 'request_object_encryption_enc',
        envKey: 'OPENID_REQUEST_OBJECT_ENCRYPTION_ENC',
        defaultValue: '',
        required: false,
        skipIfNotRequired: true
    },
    {
        propKey: 'token_endpoint_auth_method',
        envKey: 'OPENID_TOKEN_ENDPOINT_AUTH_METHOD',
        defaultValue: '',
        required: false,
        skipIfNotRequired: true
    },
    {
        propKey: 'introspection_endpoint_auth_method',
        envKey: 'OPENID_INTROSPECTION_ENDPOINT_AUTH_METHOD',
        defaultValue: '',
        required: false,
        skipIfNotRequired: true
    },
    {
        propKey: 'revocation_endpoint_auth_method',
        envKey: 'OPENID_REVOCATION_ENDPOINT_AUTH_METHOD',
        defaultValue: '',
        required: false,
        skipIfNotRequired: true
    },
    {
        propKey: 'token_endpoint_auth_signing_alg',
        envKey: 'OPENID_TOKEN_ENDPOINT_AUTH_SIGNING_ALG',
        defaultValue: '',
        required: false,
        skipIfNotRequired: true
    },
    {
        propKey: 'introspection_endpoint_auth_signing_alg',
        envKey: 'OPENID_INTROSPECTION_ENDPOINT_AUTH_SIGNING_ALG',
        defaultValue: '',
        required: false,
        skipIfNotRequired: true
    },
    {
        propKey: 'revocation_endpoint_auth_signing_alg',
        envKey: 'OPENID_REVOCATION_ENDPOINT_AUTH_SIGNING_ALG',
        defaultValue: '',
        required: false,
        skipIfNotRequired: true
    },
    {
        propKey: 'tls_client_certificate_bound_access_tokens',
        envKey: 'OPENID_TLS_CLIENT_CERTIFICATE_BOUND_ACCESS_TOKENS',
        defaultValue: '',
        required: false,
        skipIfNotRequired: true
    }
]

const sessionOptionsEnvMapItems: EnvMapItem[] = [
    {
        propKey: 'sessionKeys',
        envKey: 'OPENID_SESSION_KEYS',
        defaultValue: [],
        required: true
    },
    {
        propKey: 'sessionName',
        envKey: 'OPENID_SESSION_NAME',
        defaultValue: 'openid:session',
        required: false
    },
    {
        propKey: 'sameSite',
        envKey: 'OPENID_SESSION_SAME_SITE',
        defaultValue: true,
        required: false
    }
]

const clientServerOptionsEnvMapItems: EnvMapItem[] = [
    {
        propKey: 'discoveryEndpoint',
        envKey: 'OPENID_DISCOVERY_ENDPOINT',
        defaultValue: '',
        required: true
    },
    {
        propKey: 'scope',
        envKey: 'OPENID_SCOPE',
        defaultValue: '',
        required: false,
        skipIfNotRequired: true
    },
    {
        propKey: 'signInPath',
        envKey: 'OPENID_SIGNIN_PATH',
        defaultValue: '/openid/signin',
        required: false
    },
    {
        propKey: 'callbackPath',
        envKey: 'OPENID_CALLBACK_PATH',
        defaultValue: '/openid/callback',
        required: false
    },
    {
        propKey: 'processCallbackPath',
        envKey: 'OPENID_PROCESS_CALLBACK_PATH',
        defaultValue: '/openid/process-callback',
        required: false
    },
    {
        propKey: 'signOutPath',
        envKey: 'OPENID_SIGNOUT_PATH',
        defaultValue: '/openid/signout',
        required: false
    },
    {
        propKey: 'userInfoPath',
        envKey: 'OPENID_USER_INFO_PATH',
        defaultValue: '/openid/userinfo',
        required: false
    },
    {
        propKey: 'errorPagePath',
        envKey: 'OPENID_ERROR_PAGE_PATH',
        defaultValue: '/openid-error',
        required: false
    },
    {
        propKey: 'signedOutPage',
        envKey: 'OPENID_SIGNED_OUT_PAGE',
        defaultValue: '',
        required: false,
        skipIfNotRequired: true
    },
    {
        propKey: 'securedPaths',
        envKey: 'OPENID_SECURED_PATHS',
        defaultValue: [],
        required: false,
        skipIfNotRequired: true
    },
    {
        propKey: 'enablePKCE',
        envKey: 'OPENID_ENABLE_PKCE',
        defaultValue: false,
        required: false
    },
    {
        propKey: 'enableOauth2',
        envKey: 'ENABLE_OAUTH2',
        defaultValue: false,
        required: false
    },
    {
        propKey: 'authorizationEndpoint',
        envKey: 'OAUTH2_AUTH_ENDPOINT',
        defaultValue: '',
        required: false,
        skipIfNotRequired: true
    },
    {
        propKey: 'tokenEndpoint',
        envKey: 'OAUTH2_TOKEN_ENDPOINT',
        defaultValue: '',
        required: false
    },
    {
        propKey: 'userInfoEndpoint',
        envKey: 'OAUTH2_USERINFO_ENDPOINT',
        defaultValue: '',
        required: false
    },
    {
        propKey: 'emitEvents',
        envKey: 'OPENID_REQUEST_LISTENER_EMIT_EVENTS',
        defaultValue: false,
        required: false,
        skipIfNotRequired: true
    }
]

const proxyOptionsEnvMapItems: EnvMapItem[] = [
    {
        propKey: 'proxyPaths',
        envKey: 'OPENID_PROXY_PATHS',
        defaultValue: [],
        required: false
    },
    {
        propKey: 'proxyHosts',
        envKey: 'OPENID_PROXY_HOSTS',
        defaultValue: [],
        required: false
    },
    {
        propKey: 'excludeCookie',
        envKey: 'OPENID_PROXY_EXCLUDE_COOKIE',
        defaultValue: [false],
        required: false,
        skipIfNotRequired: true
    },
    {
        propKey: 'useIdToken',
        envKey: 'OPENID_PROXY_USE_ID_TOKEN',
        defaultValue: [false],
        required: false,
        skipIfNotRequired: true
    },
    {
        propKey: 'excludeOriginHeaders',
        envKey: 'OPENID_PROXY_EXCLUDE_ORIGIN_HEADERS',
        defaultValue: [false],
        required: false,
        skipIfNotRequired: true
    }
]

const defaultLoggerOptionsEnvMapItems: EnvMapItem[] = [
    {
        propKey: 'level',
        envKey: 'OPENID_LOG_LEVEL',
        defaultValue: 'info',
        required: false
    },
    {
        propKey: 'prettyPrint',
        envKey: 'OPENID_LOG_PRETTY',
        defaultValue: process.env.NODE_ENV !== 'production',
        required: false
    },
    {
        propKey: 'useLevelLabels',
        envKey: 'OPENID_LOG_USE_LEVEL_LABELS',
        defaultValue: true,
        required: false
    },
    {
        propKey: 'name',
        envKey: 'OPENID_LOG_NAME',
        defaultValue: 'openid-client-server',
        required: false
    }
]

const castValue = (
    defaultValue: BasicType,
    value: string
): string | number | boolean => {
    if (typeof defaultValue === 'number') {
        return parseInt(value, 10)
    }

    if (typeof defaultValue === 'boolean') {
        return value.toLowerCase() === 'true'
    }

    return value
}

interface ParsedOptions {
    options: {[x: string]: any}
    errors: string[]
}

const parseOptions = (envMapItems: EnvMapItem[]): ParsedOptions => {
    const options: {
        [x: string]: any
    } = {}
    const errors: string[] = []
    for (const emi of envMapItems) {
        const value = process.env[emi.envKey]

        if (!value && emi.required) {
            errors.push(`missing required option: ${emi.envKey}`)
            continue
        }

        if (!value && emi.skipIfNotRequired) {
            continue
        }

        if (!value) {
            options[emi.propKey] = emi.defaultValue
            continue
        }

        if (Array.isArray(emi.defaultValue)) {
            const values = value.split(',')
            const castValues: BasicTypeArray = []
            const defaultValueType = typeof emi.defaultValue
            for (const val of values) {
                castValues.push(castValue(defaultValueType, val))
            }

            options[emi.propKey] = castValues
        } else {
            options[emi.propKey] = castValue(emi.defaultValue, value)
        }
    }

    return {
        options,
        errors
    }
}

export const resolveOptions = (): Options => {
    const parsedServerOptions = parseOptions(clientServerOptionsEnvMapItems)
    const parsedSessionOptions = parseOptions(sessionOptionsEnvMapItems)
    const parsedClientMetadata = parseOptions(clientMetadataEnvMapItems)
    const parsedDefaultLogOptions = parseOptions(
        defaultLoggerOptionsEnvMapItems
    )
    const parsedProxyOptions = parseOptions(proxyOptionsEnvMapItems)

    const errors = parsedServerOptions.errors
        .concat(parsedSessionOptions.errors)
        .concat(parsedClientMetadata.errors)
        .concat(parsedDefaultLogOptions.errors)
        .concat(parsedProxyOptions.errors)

    if (errors.length !== 0) {
        throw new OptionsError(`Options Errors:\n${errors.join('\n')}`)
    }

    if (parsedDefaultLogOptions.options.prettyPrint) {
        parsedDefaultLogOptions.options.prettyPrint = {
            levelFirst: true,
            timestampKey: 'time',
            translateTime: true,
            ignore: 'pid,hostname'
        }
    }

    return {
        clientServerOptions: parsedServerOptions.options as ClientServerOptions,
        sessionOptions: parsedSessionOptions.options as SessionOptions,
        clientMetadata: parsedClientMetadata.options as ClientMetadata,
        loggerOptions: parsedDefaultLogOptions.options as LoggerOptions,
        proxyOptions: parsedProxyOptions.options as ProxyOptions
    }
}
