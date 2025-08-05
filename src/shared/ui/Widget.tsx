import { ReactNode } from "react";
import { cn } from "../model/utils";

interface WidgetProps {
    className?: string,
    children?: ReactNode,

    windowMode?: boolean
    title?: string,
    icon?: ReactNode,
}

function Widget({ className, children, title, icon, windowMode = false }: WidgetProps) {
    return (
        <div className={cn('bg-background rounded-3xl border-[2px] border-light overflow-hidden', className)}>
            {windowMode && (
                <div className="py-2 px-6 bg-light flex justify-between items-center">
                    <div className="flex gap-6 items-center">
                        <div className="w-5 h-5 fill-subtext [&>svg]:w-full [&>svg]:h-full [&>svg]:fill-subtext">
                            {icon}
                        </div>
                        <div className="text-subtext text-sm">
                            {title}
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <div className="w-2 h-2 bg-red-400 rounded-full" />
                        <div className="w-2 h-2 bg-yellow-400 rounded-full" />
                        <div className="w-2 h-2 bg-green-400 rounded-full" />
                    </div>
                </div>
            )}

            {children}
        </div>
    );
}

export default Widget;