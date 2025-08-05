'use client';

import View from '@/shared/ui/View';
import Widget from '@/shared/ui/Widget';
import LevelsList from '@/widgets/ui/LevelsList';

export default function LevelsPage() {
    return (
        <View className="flex justify-center items-center">
            <Widget
                title="Выбор уровней"
                windowMode
                icon={
                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#60a5fa"><path d="M120-240v-80h720v80H120Zm0-200v-80h720v80H120Zm0-200v-80h720v80H120Z" /></svg>
                }
            >
                <LevelsList />
            </Widget>
        </View>
    );
};
