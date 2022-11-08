import type {TokenSet, UserinfoResponse} from 'openid-client'

export type BasicType = string | number | boolean

export type BasicTypeArray = BasicType[]

// @ts-ignore
export type JsonPropType = BasicType | Date | Json | JsonArray

export type OpenIdType = TokenSet | UserinfoResponse

// @ts-ignore
export type Json = Record<string, JsonPropType | OpenIdType | undefined>

export type JsonArray = Record<string, unknown> &
    Array<JsonPropType | OpenIdType | undefined>
