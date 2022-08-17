import {useEffect, useState} from 'react'
import {useRouter} from 'next/router'

const initialState = {
    isAuthenticated: false,
    name: 'Guest'
}

const fetchProfile = async () => {
    const response = await fetch('/openid/userinfo')

    if (response.status > 299) {
        return initialState
    }

    const profile = await response.json()

    return {isAuthenticated: true, ...profile}
}

export const useOCS = () => {
    // a hook for using the /openid/userinfo endpoint to determine if the user is signed in
    // provides a user "profile" and "isAuthenticated" flag
    // NOTE: possible make this a module to compliment ocs
    const {pathname} = useRouter()
    const [profile, setProfile] = useState(initialState)

    useEffect(() => {
        const runEffect = async () => {
            const newProfile = await fetchProfile()
            if (newProfile) {
                setProfile(newProfile)
            }
        }
        runEffect()
        return () => {
            // release stuff if needed
        }
    }, [pathname])

    return profile
}
