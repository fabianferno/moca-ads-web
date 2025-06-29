import { useState } from 'react';

interface CredentialsFormProps {
    onSubmit: (data: any) => void;
    onCancel: () => void;
}

interface FormData {
    dateOfBirth: string;
    region: string;
    incomeTier: string;
    isCryptoUser: boolean;
    professionalId: string;
    interestCategories: string;
    budgetAmount: string;
    platformActivity: string[];
}

const INCOME_TIERS = [
    { value: 'under-25k', label: 'Under $25,000' },
    { value: '25k-50k', label: '$25,000 - $50,000' },
    { value: '50k-75k', label: '$50,000 - $75,000' },
    { value: '75k-100k', label: '$75,000 - $100,000' },
    { value: '100k-150k', label: '$100,000 - $150,000' },
    { value: 'over-150k', label: 'Over $150,000' }
];

const PLATFORM_OPTIONS = [
    'Social Media',
    'E-commerce',
    'Gaming',
    'Streaming',
    'Professional Networks',
    'News & Media',
    'Finance',
    'Crypto Trading',
    'Online Learning',
    'Entertainment'
];

export const CredentialsForm = ({ onSubmit, onCancel }: CredentialsFormProps) => {
    const [formData, setFormData] = useState<FormData>({
        dateOfBirth: '',
        region: '',
        incomeTier: '',
        isCryptoUser: false,
        professionalId: '',
        interestCategories: '',
        budgetAmount: '',
        platformActivity: []
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Simulate form submission
        setTimeout(() => {
            onSubmit(formData);
            setIsSubmitting(false);
        }, 1000);
    };

    const handlePlatformActivityChange = (platform: string) => {
        setFormData(prev => ({
            ...prev,
            platformActivity: prev.platformActivity.includes(platform)
                ? prev.platformActivity.filter(p => p !== platform)
                : [...prev.platformActivity, platform]
        }));
    };

    const calculateAge = (dob: string) => {
        if (!dob) return '';
        const birthDate = new Date(dob);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();

        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            return (age - 1).toString();
        }
        return age.toString();
    };

    return (
        <div className="h-[calc(100vh-100px)] rounded-2xl bg-white p-4  overflow-y-auto">
            <div className="max-w-2xl mx-auto">
                <div className="bg-white border-2 border-black rounded-2xl p-6 shadow-xl">
                    <div className="text-center mb-6">
                        <h2 className="text-3xl font-black text-black mb-2">
                            PROFILE SETUP
                        </h2>
                        <p className="text-gray-600 text-sm">
                            Complete your profile to get personalized ad experiences
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Age Bracket - Date of Birth */}
                            <div className="space-y-2">
                                <label className="block text-black font-bold text-sm">
                                    DATE OF BIRTH
                                </label>
                                <input
                                    type="date"
                                    value={formData.dateOfBirth}
                                    onChange={(e) => setFormData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                                    className="w-full px-3 py-2 bg-white border-2 border-black rounded text-black focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 text-sm"
                                    required
                                />
                                {formData.dateOfBirth && (
                                    <p className="text-xs text-gray-600">
                                        Age: {calculateAge(formData.dateOfBirth)} years old
                                    </p>
                                )}
                            </div>

                            {/* Region */}
                            <div className="space-y-2">
                                <label className="block text-black font-bold text-sm">
                                    REGION/LOCATION
                                </label>
                                <input
                                    type="text"
                                    value={formData.region}
                                    onChange={(e) => setFormData(prev => ({ ...prev, region: e.target.value }))}
                                    className="w-full px-3 py-2 bg-white border-2 border-black rounded text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 text-sm"
                                    placeholder="e.g., San Francisco, CA"
                                    required
                                />
                            </div>
                        </div>

                        {/* Income Tier */}
                        <div className="space-y-3">
                            <label className="block text-black font-bold text-sm">
                                ANNUAL INCOME RANGE
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {INCOME_TIERS.map((tier) => (
                                    <label key={tier.value} className="flex items-center space-x-2 p-2 bg-gray-100 border-2 border-gray-300 rounded hover:bg-gray-200 transition-all duration-200 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="incomeTier"
                                            value={tier.value}
                                            checked={formData.incomeTier === tier.value}
                                            onChange={(e) => setFormData(prev => ({ ...prev, incomeTier: e.target.value }))}
                                            className="w-4 h-4 text-blue-600 bg-white border-2 border-black focus:ring-blue-500 focus:ring-2"
                                        />
                                        <span className="text-xs text-black font-medium">{tier.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Crypto User Toggle */}
                            <div className="space-y-3">
                                <label className="block text-black font-bold text-sm">
                                    CRYPTO/WEB3 EXPERIENCE
                                </label>
                                <div className="flex items-center space-x-3">
                                    <button
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, isCryptoUser: !prev.isCryptoUser }))}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 border-2 border-black ${formData.isCryptoUser
                                            ? 'bg-blue-600'
                                            : 'bg-gray-300'
                                            }`}
                                    >
                                        <span
                                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${formData.isCryptoUser ? 'translate-x-6' : 'translate-x-1'
                                                }`}
                                        />
                                    </button>
                                    <span className="text-black text-sm font-medium">
                                        {formData.isCryptoUser ? 'Active Crypto User' : 'New to Crypto'}
                                    </span>
                                </div>
                            </div>

                            {/* Professional ID */}
                            <div className="space-y-2">
                                <label className="block text-black font-bold text-sm">
                                    PROFESSIONAL SOCIAL ID
                                </label>
                                <input
                                    type="text"
                                    value={formData.professionalId}
                                    onChange={(e) => setFormData(prev => ({ ...prev, professionalId: e.target.value }))}
                                    className="w-full px-3 py-2 bg-white border-2 border-black rounded text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 text-sm"
                                    placeholder="LinkedIn, Twitter, etc."
                                />
                            </div>
                        </div>

                        {/* Interest Categories */}
                        <div className="space-y-2">
                            <label className="block text-black font-bold text-sm">
                                INTEREST CATEGORIES
                            </label>
                            <textarea
                                value={formData.interestCategories}
                                onChange={(e) => setFormData(prev => ({ ...prev, interestCategories: e.target.value }))}
                                className="w-full px-3 py-2 bg-white border-2 border-black rounded text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 resize-none text-sm"
                                rows={2}
                                placeholder="e.g., Technology, Finance, Gaming, Travel, Fashion..."
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Budget Amount */}
                            <div className="space-y-2">
                                <label className="block text-black font-bold text-sm">
                                    MONTHLY AD BUDGET
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-2 text-gray-600 text-sm font-bold">$</span>
                                    <input
                                        type="number"
                                        value={formData.budgetAmount}
                                        onChange={(e) => setFormData(prev => ({ ...prev, budgetAmount: e.target.value }))}
                                        className="w-full pl-7 pr-3 py-2 bg-white border-2 border-black rounded text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 text-sm"
                                        placeholder="0"
                                        min="0"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Platform Activity */}
                            <div className="space-y-3">
                                <label className="block text-black font-bold text-sm">
                                    PLATFORM ACTIVITY
                                </label>
                                <div className="grid grid-cols-2 gap-1 max-h-32 overflow-y-auto">
                                    {PLATFORM_OPTIONS.map((platform) => (
                                        <label key={platform} className="flex items-center space-x-1 p-1 bg-gray-100 border border-gray-300 rounded hover:bg-gray-200 transition-all duration-200 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={formData.platformActivity.includes(platform)}
                                                onChange={() => handlePlatformActivityChange(platform)}
                                                className="w-3 h-3 text-blue-600 bg-white border-2 border-black rounded focus:ring-blue-500 focus:ring-2"
                                            />
                                            <span className="text-xs text-black font-medium truncate">{platform}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Submit Buttons */}
                        <div className="flex gap-3 pt-4">
                            <button
                                type="button"
                                onClick={onCancel}
                                className="flex-1 px-4 py-2 border-2 border-black text-black rounded hover:bg-gray-100 transition-all duration-200 font-bold text-sm"
                            >
                                CANCEL
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="flex-1 px-4 py-2 bg-red-500 text-white rounded border-2 border-black hover:bg-red-600 transition-all duration-200 font-bold disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                            >
                                {isSubmitting ? 'SAVING...' : 'COMPLETE SETUP'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}; 