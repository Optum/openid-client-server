import Link from 'next/link'
import {Page, Title} from '../components'

export default function Home() {
    return (
        <Page>
            <Title>Home</Title>
            <a href="/books/123">
                Check out this book =>
            </a>
            <br />
        </Page>
    )
}
