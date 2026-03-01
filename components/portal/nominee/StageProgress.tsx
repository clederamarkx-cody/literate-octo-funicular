import React from 'react';

interface StageProgressProps {
    stage1Progress: number;
    stage2Progress: number;
    stage3Progress: number;
    nomineeData: any;
}

const StageProgress: React.FC<StageProgressProps> = ({ stage1Progress, stage2Progress, stage3Progress, nomineeData }) => {
    const circumference = 226.2;

    const getProgress = (round: number) => {
        if (round === 1) return stage1Progress;
        if (round === 2) return stage2Progress;
        return stage3Progress;
    };

    const renderProgressBar = (round: number) => {
        const progress = getProgress(round);
        const label = round === 1 ? 'SUBMISSION' : round === 2 ? 'DOCUMENT EVALUATION' : 'SUBMISSION OF DEFICIENCIES';
        const colorClass = round === 1 ? 'bg-gkk-gold' : round === 2 ? 'bg-blue-600' : 'bg-gkk-navy';
        const locked = round === 2 ? !nomineeData?.round2Unlocked : round === 3 ? !nomineeData?.round3Unlocked : false;

        return (
            <div className={`w-full ${locked ? 'opacity-40' : ''}`}>
                <div className="flex justify-between items-center mb-1.5">
                    <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">STAGE {round} ({label})</span>
                    <span className="text-[9px] font-bold text-gkk-navy">{progress}%</span>
                </div>
                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div
                        className={`h-full ${colorClass} transition-all duration-1000 ease-out`}
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>
        );
    };

    return (
        <div id="readiness-meter" className="md:w-80 bg-gradient-to-br from-gray-50 to-white rounded-3xl p-8 flex flex-col justify-center border border-gray-100 shadow-inner space-y-6">
            <div className="text-center">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Submission Progress</p>
                <div className="relative w-28 h-28 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="36" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-gray-100" />
                        <circle cx="50" cy="50" r="36" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-gkk-gold transition-all duration-1000" strokeDasharray={circumference} strokeDashoffset={circumference - (circumference * stage1Progress) / 100} strokeLinecap="round" />
                    </svg>
                    <span className="absolute text-2xl font-bold text-gkk-navy">{stage1Progress}%</span>
                </div>
                <div className="inline-flex items-center gap-2 bg-gkk-navy text-white px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest">Stage 1 Readiness</div>
            </div>
            <div className="space-y-4 pt-4 border-t border-gray-100">
                {renderProgressBar(2)}
                {renderProgressBar(3)}
            </div>
        </div>
    );
};

export default StageProgress;
