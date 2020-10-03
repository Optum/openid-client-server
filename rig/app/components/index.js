import styled from 'styled-components'

export const Title = styled.h1`
    font-size: 40px;
    color: rgb(27, 36, 47);
`

const NavContainer = styled.div`
    font-size: 16px;
    background-color: rgb(27, 36, 47);
    display: flex;
    flex-direction: row;
    color: white;
    width: 100%;
    height: 46px;
`

const NavSection = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    color: white;
    width: 100%;
`

const NavSectionRight = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    align-items: center;
    color: white;
    width: 100%;
`

const Link = styled.div`
    display: flex;
    cursor: pointer;
    text-decoration: underline;
    color: white;
    padding: 5px;
    a :visited {
        color: white;
    }
`

const NavLink = ({href, text}) => {
    return (
        <Link>
            <a href={href}>{text}</a>
        </Link>
    )
}

export const NavBar = () => {
    return (
        <NavContainer>
            <NavSection>
                <NavLink href="/" text="Home" />
                <NavLink href="/books" text="Books" />
            </NavSection>
            <NavSectionRight>
                <NavLink href="/user" text="User" />
                <NavLink href="/openid/signin" text="Signin" />
                <NavLink href="/openid/signout" text="Signout" />
            </NavSectionRight>
        </NavContainer>
    )
}

export const Page = styled.div`
    font-size: 16px;
    display: flex;
    flex-direction: column;
    align-items: center;
    color: rgb(27, 36, 47);
    width: 100%;
`

export const JsonViewerFrame = styled.div`
    background-color: rgb(27, 36, 47);
    border-color: #1da1f2;
    border-width: 2px;
    border-style: solid;
    border-radius: 3px;
    padding: 5px;
`

export const JsonViewer = styled.pre`
    background-color: rgb(27, 36, 47);
    color: white;
`
