/* eslint-disable unicorn/prevent-abbreviations */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {FastifyReply, FastifyRequest} from 'fastify'
import {isEmpty, length} from 'ramda'
import {ContentHandler, FastifyContentHandler} from './types'

export const len = (collection: any[]): number =>
    isEmpty(collection) ? 0 : length(collection)

export const hasX = (collection: any[], count: number): boolean =>
    length(collection) === count

export const hasOneOrMore = (collection: any[]): boolean =>
    length(collection) !== 0

export const hasOne = (collection: any[]): boolean => hasX(collection, 1)

export const withFastifyWrapper = (
    contentHandler: ContentHandler
): FastifyContentHandler => {
    return async (
        request: FastifyRequest,
        reply: FastifyReply
    ): Promise<void> => {
        await contentHandler(request.raw, reply.raw)
        reply.sent = true
    }
}
