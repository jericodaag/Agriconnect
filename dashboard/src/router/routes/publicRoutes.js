import { lazy } from "react";    
const Login = lazy(()=> import('../../views/auth/Login'))   
const Register = lazy(()=> import('../../views/auth/Register')) 
const AdminLogin = lazy(()=> import('../../views/auth/AdminLogin')) 
const Home = lazy(()=> import('../../views/Home'))   
const UnAuthorized = lazy(()=> import('../../views/UnAuthorized'))   
const Success = lazy(()=> import('../../views/Success'))   
const ForgotPassword = lazy(()=> import('../../views/auth/ForgotPassword'))    // Add this
const ResetPassword = lazy(()=> import('../../views/auth/ResetPassword'))      // Add this

const publicRoutes = [
    {
        path: '/',
        element : <Home/>, 
    },
    {
        path : '/login',
        element : <Login/>
    },
    {
        path : '/register',
        element : <Register/>
    },
    {
        path : '/admin/login',
        element : <AdminLogin/>
    },
    {
        path : '/unauthorized',
        element : <UnAuthorized/>
    },
    {
        path : '/success?',
        element : <Success/>
    },
    // Add these new routes
    {
        path: '/forgot-password',
        element: <ForgotPassword/>
    },
    {
        path: '/reset-password/:token',
        element: <ResetPassword/>
    }
]

export default publicRoutes