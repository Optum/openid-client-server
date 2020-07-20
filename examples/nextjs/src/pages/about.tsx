import {useEffect, useState} from 'react'

import Link from 'next/link'
import fetch from 'isomorphic-unfetch'

const Profile: React.FunctionComponent = () => {
    const [profile, setProfile] = useState({})

    useEffect(() => {
        const getProfile = async (): Promise<any> => {
            const response = await fetch('/openid/userinfo')
            const profile = await response.json()
            return profile
        }

        getProfile().then(profile => {
            setProfile(profile)
        })
    }, [])

    return (
        <div>
            <Link href="/">
                <a>Home</a>
            </Link>{' '}
            <Link href="/openid/signin">
                <a>Signin</a>
            </Link>
            <br />
            <pre>{JSON.stringify(profile, null, 4)}</pre>
        </div>
    )
}

export default Profile
