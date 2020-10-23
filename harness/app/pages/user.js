import {JsonViewer, JsonViewerFrame, Page, Title} from '../components'
import {useOCS} from '../components/use-ocs'

export const User = () => {
    const profile = useOCS()

    return (
        <Page>
            <Title>User Info</Title>
            <JsonViewerFrame>
                <JsonViewer>{JSON.stringify(profile, undefined, 4)}</JsonViewer>
            </JsonViewerFrame>
        </Page>
    )
}

export default User
