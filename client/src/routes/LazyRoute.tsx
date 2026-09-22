import React, { Suspense, type ComponentType } from 'react';
import { Loader } from '../components/common/Loader';

interface LazyRouteProps {
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

export const LazyRoute: React.FC<LazyRouteProps> = ({
    children,
    fallback = <Loader fullScreen text="Loading..." />,
}) => {
    return <Suspense fallback={fallback}>{children}</Suspense>;
};

export const withLazyLoading = <P extends object>(
    Component: ComponentType<P>,
    customFallback?: React.ReactNode
) => {
    const LazyComponent: React.FC<P> = (props) => (
        <Suspense fallback={customFallback || <Loader fullScreen text="Loading..." />}>
            <Component {...props} />
        </Suspense>
    );

    LazyComponent.displayName = `withLazyLoading(${Component.displayName || Component.name || 'Component'})`;

    return LazyComponent;
};

export default LazyRoute;