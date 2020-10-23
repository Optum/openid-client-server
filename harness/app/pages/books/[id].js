import useSWR from 'swr'
import {JsonViewer, JsonViewerFrame, Page, Title} from '../../components'

export const Book = () => {
    const {data, error} = useSWR('/api/books', url =>
        fetch(url).then(res => res.json())
    )

    const books = data ?? []

    return (
        <Page>
            <Title>Book</Title>
            <JsonViewerFrame>
                <JsonViewer>{JSON.stringify(books && books.length !== 0 ? books[0] : {}, undefined, 4)}</JsonViewer>
            </JsonViewerFrame>
        </Page>
    )
}

export default Book
