import { ReactNode } from "react";
import { cn } from "../model/utils";

interface ContainerProps {
    className?: string,
    children?: ReactNode
}

function Container({ className, children }: ContainerProps) {
    return (
        <div className={cn('px-6 lg:px-48 xl:px-64', className)}>
            {children}
        </div>
    );
}

export default Container;