import { ReactNode } from "react";
import { cn } from "../model/utils";

interface ViewProps {
    className?: string,
    children?: ReactNode
}

function View({ className, children }: ViewProps) {
    return (
        <div className={cn("h-dvh flex flex-col", className)}>
            {children}
        </div>
    );
}

export default View;