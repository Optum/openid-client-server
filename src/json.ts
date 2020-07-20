import {TokenSet, UserinfoResponse} from 'openid-client'

export type BasicType = string | number | boolean

export type BasicTypeArray = BasicType[]

export type JsonPropType = BasicType | Date | Json | JsonArray

export type OpenIdType = TokenSet | UserinfoResponse

export interface Json {
    [x: string]: JsonPropType | OpenIdType | null
}

export interface JsonArray extends Array<JsonPropType | OpenIdType | null> {}
