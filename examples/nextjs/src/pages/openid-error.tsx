import {DefaultErrorResponse, ErrorResponses} from '../status'

import Link from 'next/link'
import {useRouter} from 'next/router'

const OpenIdError: React.FunctionComponent = () => {
    const {query} = useRouter()
    const {sc: statusCode, sn: srNum} = query
    let definition = ErrorResponses.find(({status_code, sr_num}) => {
        return status_code === Number(statusCode) && sr_num === Number(srNum)
    })

    if (!definition) {
        definition = DefaultErrorResponse
    }

    const {error, error_description} = definition

    return (
        <div>
            <Link href="/">
                <a>Home</a>
            </Link>{' '}
            <Link href="/openid/signin">
                <a>Signin</a>
            </Link>
            <br />
            <span color="red">{error}</span>
            <br />
            <span color="red">{error_description}</span>
        </div>
    )
}

export default OpenIdError
