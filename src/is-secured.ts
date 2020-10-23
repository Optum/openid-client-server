import {AppType} from './types'
import {replace, startsWith} from 'ramda'
import assert from 'assert'
import {pathToRegexp} from 'path-to-regexp'
import {URL} from 'url'
import path from 'path'

const validatePath = (securedPath: string): string => {
    assert(typeof securedPath === 'string', 'securedPath should be a string')
    assert(securedPath.length > 0, 'The securedPath could not be empty')
    assert(
        securedPath[0] === '/',
        'The first character of a securedPath should be `/`'
    )
    return securedPath
}

export const toRegexPaths = (securedPaths: string[]): RegExp[] =>
    securedPaths
        .map(securedPath => validatePath(securedPath))
        .map(rx => pathToRegexp(rx))

const checkRegexUrls = (
    regexUrls: RegExp[],
    requestUrl: string
): {matched: boolean; matches: RegExpExecArray | null} => {
    let matched = false
    // This disable is here because .test on a regex returns RegExpExecArray | null
    // eslint-disable-next-line unicorn/no-null
    let matches: RegExpExecArray | null = null
    for (const regexUrl of regexUrls) {
        const regexMatched = regexUrl.test(requestUrl)
        if (regexMatched) {
            matches = regexUrl.exec(requestUrl)
            matched = regexMatched
            break
        }
    }
    return {
        matched,
        matches
    }
}

const _next_static_chunk = '/_next/static/chunks/pages'
const _next_hmr = '/_next/webpack-hmr?page='
const defaultParseUrl = 'http://localhost:1234'

const checkNextRegex = (
    regexUrls: RegExp[],
    requestUrl: string
): {matched: boolean; matches?: RegExpExecArray | null} => {
    let newUrl

    if (startsWith(_next_static_chunk, requestUrl)) {
        newUrl = replace(_next_static_chunk, '', requestUrl)
    }

    if (startsWith(_next_hmr, requestUrl)) {
        newUrl = replace(_next_hmr, '', newUrl || requestUrl)
    }

    if (newUrl) {
        const {pathname} = new URL(newUrl, defaultParseUrl)

        if (
            path.extname(pathname) === '.js' ||
            startsWith('/_app', pathname) ||
            startsWith('/_document', pathname)
        ) {
            return {
                matched: false
            }
        }

        return checkRegexUrls(regexUrls, pathname)
    }

    return {
        matched: false
    }
}

export const isSecuredFactory = (regexPaths: RegExp[], appType: AppType) => {
    return (requestUrl: string): boolean => {
        const {matched} = checkRegexUrls(regexPaths, requestUrl)

        if (matched) {
            return matched
        }

        if (appType === AppType.NEXTJS) {
            const check = checkNextRegex(regexPaths, requestUrl)
            return check.matched
        }

        return false
    }
}
