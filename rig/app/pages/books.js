import useSWR from 'swr'
import {JsonViewer, JsonViewerFrame, Page, Title} from '../components'

export const Books = () => {
    const {data, error} = useSWR('/api/books', url =>
        fetch(url).then(res => res.json())
    )

    const books = data ?? []

    return (
        <Page>
            <Title>Books</Title>
            <JsonViewerFrame>
                <JsonViewer>{JSON.stringify(books, undefined, 4)}</JsonViewer>
            </JsonViewerFrame>
        </Page>
    )
}

export default Books
