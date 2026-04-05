import { Route, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const PrivateRoute = ({ component: Component, ...rest }) => {
    const { user } = useAuth();

    return (
        <Route
            {...rest}
            element={user && user.role === 'admin' ? (
                <Component />
            ) : (
                <Navigate to="/login" />
            )}
        />
    );
};

export default PrivateRoute;