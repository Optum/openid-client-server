import Ajv from 'ajv'
import {Options} from './types'
import {hasOneOrMore} from './util'

class OptionsTypeError extends TypeError {
    validationErrors: Ajv.ErrorObject[]
    constructor(validationErrors: Ajv.ErrorObject[]) {
        super('OptionsTypeError::ValidationError')
        this.validationErrors = validationErrors
    }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const validator = (schema: any): Ajv.ValidateFunction =>
    new Ajv({allErrors: true}).compile(schema)

const format = (
    options: Options,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    schema: any
): {errors: Ajv.ErrorObject[] | undefined | null; isValid: boolean} => {
    const validate = validator(schema)
    const isValid = validate(options) as boolean
    return {
        errors: validate.errors,
        isValid
    }
}

const optionsSchema = {
    $schema: 'http://json-schema.org/draft-07/schema#',
    type: 'object',
    required: ['appType', 'issuer', 'clientMetadata', 'sessionOptions'],
    properties: {
        dev: {
            type: 'boolean'
        },
        appType: {
            type: 'integer',
            minimum: 0,
            maximum: 1,
            description: 'The numeric form of the AppType enum value.'
        },
        clientMetadata: {
            type: 'object',
            required: ['client_id', 'client_secret', 'redirect_uris'],
            properties: {
                client_id: {
                    type: 'string',
                    minLength: 1
                },
                client_secret: {
                    type: 'string',
                    minLength: 1
                },
                redirect_uris: {
                    type: 'array',
                    items: {
                        type: 'string',
                        format: 'uri'
                    },
                    minItems: 1,
                    maxItems: 1
                },
                response_types: {
                    type: 'array',
                    items: {
                        type: 'string',
                        enum: ['code']
                    },
                    minItems: 1,
                    maxItems: 1
                }
            }
        },
        openidRoutes: {
            type: 'object',
            required: [],
            properties: {
                userinfo: {
                    type: 'string',
                    minLength: 1
                },
                signout: {
                    type: 'string',
                    minLength: 1
                },
                signin: {
                    type: 'string',
                    minLength: 1
                },
                error: {
                    type: 'string',
                    minLength: 1
                },
                callback: {
                    type: 'string',
                    minLength: 1
                },
                signedOut: {
                    type: 'string',
                    minLength: 1
                }
            }
        },
        proxyOptions: {
            type: 'array',
            items: {
                type: 'object',
                required: ['upstream', 'prefix'],
                properties: {
                    upstream: {
                        type: 'string',
                        format: 'uri'
                    },
                    prefix: {
                        type: 'string',
                        minLength: 1
                    },
                    useIdToken: {
                        type: 'boolean'
                    }
                }
            }
        },
        securedPaths: {
            type: 'object',
            properties: {
                securedPaths: {
                    type: 'array',
                    items: {
                        type: 'string'
                    },
                    minItems: 1
                },
                securedAsAllowedPaths: {
                    type: 'boolean'
                },
                useStartsWithCompare: {
                    type: 'boolean'
                }
            }
        },
        issuer: {
            type: 'string',
            format: 'uri'
        },
        scope: {
            type: 'string'
        },
        enableCodeChallenge: {
            type: 'boolean'
        },
        sessionOptions: {
            type: 'object',
            required: ['cookieName'],
            properties: {
                cookieName: {
                    type: 'string',
                    minLength: 1
                },
                key: {
                    oneOf: [{type: 'string'}, {type: 'object'}]
                },
                secret: {
                    type: 'string',
                    minLength: 1
                },
                salt: {
                    type: 'string',
                    minLength: 1
                },
                cookie: {
                    type: 'object',
                    properties: {
                        path: {type: 'string'},
                        sameSite: {
                            oneOf: [
                                {type: 'boolean'},
                                {
                                    type: 'string',
                                    enum: ['lax', 'strict', 'none']
                                }
                            ]
                        },
                        httpOnly: {type: 'boolean'},
                        domain: {type: 'string'},
                        maxAge: {type: 'number'},
                        secure: {type: 'boolean'}
                    }
                }
            }
        }
    }
}

export function validate(options: Options): void {
    const {errors, isValid} = format(options, optionsSchema)
    if (!isValid && Array.isArray(errors) && hasOneOrMore(errors)) {
        throw new OptionsTypeError(errors)
    }
}
