import { useContext, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import AuthModal from '../../components/AuthModal/AuthModal'
import { Context } from '../../utils/Context'
import { useDocumentMeta } from '../../utils/useDocumentMeta'

function Login() {
    const navigate = useNavigate()
    const { isAuthenticated } = useContext(Context)

    useDocumentMeta({ robots: 'noindex, nofollow' })

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/edit', { replace: true })
        }
    }, [isAuthenticated, navigate])

    const handleClose = () => navigate('/')

    return <AuthModal handleAuthModal={handleClose} authModalDisplay={true} />
}

export default Login
