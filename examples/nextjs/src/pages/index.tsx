import Link from 'next/link'
export default (): any => (
    <div>
        <Link href="/about">
            <a>About</a>
        </Link>{' '}
        <Link href="/openid/signin">
            <a>Signin</a>
        </Link>
        <br />
        <div>
            Welcome to a basic Next.js Web Application served by the
            openid-client-server module{' '}
        </div>
    </div>
)
