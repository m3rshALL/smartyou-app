import Console from "@/features/ui/Console";
import Container from "@/shared/ui/Container";
import EnhancedGame from "@/features/ui/EnhancedGame";
import Header from "@/shared/ui/Header";
import { ReactNode } from "react";
import View from "@/shared/ui/View";
import { cn } from "@/shared/model/utils";

interface LevelProps {
    className?: string,
    children: ReactNode
}

function LevelView({ className, children }: LevelProps) {
    return (
        <View className={cn("gap-3 py-6", className)}>

            <Header />

            <Container className="grow grid grid-cols-1 md:grid-cols-2 gap-3 pb-12">
                {children}

                <div className="flex flex-col gap-3">
                    <EnhancedGame />
                    <Console />
                </div>
            </Container>

        </View>
    );
}

export default LevelView;