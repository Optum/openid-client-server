import useSWR from 'swr'
import {JsonViewer, JsonViewerFrame, Page, Title} from '../components'

export const User = () => {
    const {data, error} = useSWR('/openid/userinfo', url =>
        fetch(url).then(res => res.json())
    )

    const user = data ?? {}

    return (
        <Page>
            <Title>User Info</Title>
            <JsonViewerFrame>
                <JsonViewer>{JSON.stringify(user, undefined, 4)}</JsonViewer>
            </JsonViewerFrame>
        </Page>
    )
}

export default User
