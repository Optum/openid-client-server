export interface ErrorResponse {
    error: string
    error_description: string
    sr_num: number
    status_code: number
}

export const ErrorResponses: ErrorResponse[] = []

export const DefaultErrorResponse: ErrorResponse = {
    status_code: 500,
    sr_num: 1,
    error: 'server_error',
    error_description: 'There was a problem processing the request'
}

export const AccessDeniedErrorResponse: ErrorResponse = {
    status_code: 401,
    sr_num: 1,
    error: 'access_denied',
    error_description: 'The request is unauthorized'
}

ErrorResponses.push(AccessDeniedErrorResponse)
ErrorResponses.push(DefaultErrorResponse)
