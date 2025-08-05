
const getDifficultyColor = (difficulty: 'easy' | 'medium' | 'hard') => {
    switch (difficulty) {
        case 'easy':
            return { diffColor: 'text-green-300', diffBg: 'bg-green-900/40' };
        case 'medium':
            return { diffColor: 'text-yellow-300', diffBg: 'bg-yellow-900/40' };
        case 'hard':
        default:
            return { diffColor: 'text-red-300', diffBg: 'bg-red-900/40' };
    }
}


export {
    getDifficultyColor
};