import Widget from "@/shared/ui/Widget";
import { useConsole } from "../model/useConsole";
import { useEffect, useRef } from "react";

function Console() {

    const { logs } = useConsole();
    const consoleRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const consoleElement = consoleRef.current;

        if (consoleElement) {
            consoleElement.scrollTop = consoleElement.scrollHeight;
        }
    }, [logs]);

    return (
        <Widget
            className="basis-72"

            windowMode
            title="Консоль"
            icon={
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#9BA3AE"><path d="M160-160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h640q33 0 56.5 23.5T880-720v480q0 33-23.5 56.5T800-160H160Zm0-80h640v-400H160v400Zm140-40-56-56 103-104-104-104 57-56 160 160-160 160Zm180 0v-80h240v80H480Z" /></svg>
            }
        >
            <div className="h-full w-full overflow-y-auto pb-12 p-4 flex gap-2 flex-col" ref={consoleRef}>
                {logs.map((log, index) => (
                    <div key={index} className="text-sm text-subtext mb-2">
                        {log.message}

                        <div className="text-xs text-[#555]">{log.timestamp.toLocaleTimeString()}</div>
                    </div>
                ))}
            </div>
        </Widget>
    );
}

export default Console;