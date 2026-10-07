import React from "react";
import MobileFrame from "@/components/MobileFrame";
import { useNavigate } from "react-router-dom";
import { intakeStore } from "@/pages/IntakeStore";
import { HandCoins, Shield, Home, UsersRound, HeartCrack, Briefcase } from "lucide-react";

const CATS = [
    { key: "physical", en: "Physical Violence", hi: "शारीरिक हिंसा", Icon: HeartCrack },
    { key: "caste", en: "Caste-based Abuse / Threats", hi: "जाति आधारित दुर्व्यवहार", Icon: Shield },
    { key: "property", en: "Land / Property / Eviction", hi: "भूमि / संपत्ति / बेदखली", Icon: Home },
    { key: "social_boycott", en: "Social Boycott / Economic Harassment", hi: "सामाजिक बहिष्कार", Icon: HandCoins },
    { key: "sexual", en: "Sexual Violence", hi: "यौन हिंसा", Icon: UsersRound },
    { key: "discrimination", en: "Discrimination at Work / School", hi: "कार्यस्थल में भेदभाव", Icon: Briefcase },
];

export default function CategoryPage() {
    const nav = useNavigate();

    const pick = (key) => {
        intakeStore.setField("category", key);
        nav("/intake/consent");
    };

    return (
        <MobileFrame showBack title="Samvedna">
            <div className="px-5 pt-5 pb-24 animate-fade-up">
                <div className="mb-4">
                    <div className="text-[11px] font-semibold uppercase tracking-widest text-brown">Step 1 of 4</div>
                    <h2 className="font-serif font-black text-2xl text-olive leading-tight mt-1">
                        Choose a Category
                    </h2>
                    <div className="hindi text-sm text-brown">श्रेणी चुनें</div>
                </div>

                <div className="space-y-3">
                    {CATS.map(({ key, en, hi, Icon }) => (
                        <button
                            key={key}
                            data-testid={`cat-${key}`}
                            onClick={() => pick(key)}
                            className="press w-full flex items-center gap-3 bg-white border border-sand rounded-2xl p-4 text-left hover:-translate-y-0.5 transition-transform"
                        >
                            <div className="h-11 w-11 rounded-xl bg-cream border border-sand flex items-center justify-center text-olive">
                                <Icon size={20} />
                            </div>
                            <div className="min-w-0">
                                <div className="font-serif font-bold text-olive leading-tight">{en}</div>
                                <div className="hindi text-[12px] text-muted-foreground">{hi}</div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </MobileFrame>
    );
}
