import { useState } from 'react';
import { ConnectWallet } from './ConnectWallet';

interface CredentialsFormProps {
    onSubmit: (data: any) => void;
    onCancel: () => void;
}

interface FormData {
    dateOfBirth: string;
    isEuResident: boolean;
    incomeBracket: 'LOW' | 'MID' | 'HIGH' | '';
    isUniversityGrad: boolean;
    isFrequentTraveler: boolean;
}

const INCOME_BRACKETS = [
    { value: 'LOW', label: 'Low Income' },
    { value: 'MID', label: 'Mid Income' },
    { value: 'HIGH', label: 'High Income' }
];

export const CredentialsForm = ({ onSubmit, onCancel }: CredentialsFormProps) => {
    const [formData, setFormData] = useState<FormData>({
        dateOfBirth: '',
        isEuResident: false,
        incomeBracket: '',
        isUniversityGrad: false,
        isFrequentTraveler: false
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Calculate credentials based on form data
        const credentials = {
            AGE_18_PLUS: isOver18(formData.dateOfBirth),
            EU_RESIDENT: formData.isEuResident,
            INCOME_LOW: formData.incomeBracket === 'LOW',
            INCOME_MID: formData.incomeBracket === 'MID',
            INCOME_HIGH: formData.incomeBracket === 'HIGH',
            UNIVERSITY_GRAD: formData.isUniversityGrad,
            FREQUENT_TRAVELER: formData.isFrequentTraveler
        };

        // Simulate form submission
        setTimeout(() => {
            onSubmit(credentials);
            setIsSubmitting(false);
        }, 1000);
    };

    const isOver18 = (dob: string) => {
        if (!dob) return false;
        const birthDate = new Date(dob);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();

        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            return (age - 1) >= 18;
        }
        return age >= 18;
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
        <div className="h-[calc(100vh-100px)] rounded-2xl bg-white overflow-y-auto border-2 border-black p-6 shadow-xl">
            <div className="max-w-2xl mx-auto">
                <div className="">
                    <div className="flex justify-between mb-6">
                        <h2 className="text-3xl font-black max-w-md text-black mb-2">
                            Verify your creds to be eligible for moca ads rewards
                        </h2>
                        <ConnectWallet />
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Date of Birth - for AGE_18_PLUS verification */}
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
                                <div className="flex justify-between text-xs">
                                    <span className="text-gray-600">
                                        Age: {calculateAge(formData.dateOfBirth)} years old
                                    </span>
                                    <span className={`font-bold ${isOver18(formData.dateOfBirth) ? 'text-green-600' : 'text-red-600'}`}>
                                        {isOver18(formData.dateOfBirth) ? '✓ 18+ Verified' : '✗ Under 18'}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* EU Resident Toggle */}
                        <div className="space-y-3">
                            <label className="block text-black font-bold text-sm">
                                EU RESIDENCY
                            </label>
                            <div className="flex items-center space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, isEuResident: !prev.isEuResident }))}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 border-2 border-black ${formData.isEuResident
                                        ? 'bg-blue-600'
                                        : 'bg-gray-300'
                                        }`}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${formData.isEuResident ? 'translate-x-6' : 'translate-x-1'
                                            }`}
                                    />
                                </button>
                                <span className="text-black text-sm font-medium">
                                    {formData.isEuResident ? 'EU Resident' : 'Non-EU Resident'}
                                </span>
                            </div>
                        </div>

                        {/* Income Bracket */}
                        <div className="space-y-3">
                            <label className="block text-black font-bold text-sm">
                                INCOME BRACKET
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                {INCOME_BRACKETS.map((bracket) => (
                                    <label key={bracket.value} className="flex items-center justify-center space-x-2 p-3 bg-gray-100 border-2 border-gray-300 rounded hover:bg-gray-200 transition-all duration-200 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="incomeBracket"
                                            value={bracket.value}
                                            checked={formData.incomeBracket === bracket.value}
                                            onChange={(e) => setFormData(prev => ({ ...prev, incomeBracket: e.target.value as 'LOW' | 'MID' | 'HIGH' }))}
                                            className="w-4 h-4 text-blue-600 bg-white border-2 border-black focus:ring-blue-500 focus:ring-2"
                                            required
                                        />
                                        <span className="text-sm text-black font-medium">{bracket.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* University Graduate Toggle */}
                        <div className="space-y-3">
                            <label className="block text-black font-bold text-sm">
                                UNIVERSITY EDUCATION
                            </label>
                            <div className="flex items-center space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, isUniversityGrad: !prev.isUniversityGrad }))}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 border-2 border-black ${formData.isUniversityGrad
                                        ? 'bg-blue-600'
                                        : 'bg-gray-300'
                                        }`}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${formData.isUniversityGrad ? 'translate-x-6' : 'translate-x-1'
                                            }`}
                                    />
                                </button>
                                <span className="text-black text-sm font-medium">
                                    {formData.isUniversityGrad ? 'University Graduate' : 'No University Degree'}
                                </span>
                            </div>
                        </div>

                        {/* Frequent Traveler Toggle */}
                        <div className="space-y-3">
                            <label className="block text-black font-bold text-sm">
                                TRAVEL FREQUENCY
                            </label>
                            <div className="flex items-center space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, isFrequentTraveler: !prev.isFrequentTraveler }))}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 border-2 border-black ${formData.isFrequentTraveler
                                        ? 'bg-blue-600'
                                        : 'bg-gray-300'
                                        }`}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${formData.isFrequentTraveler ? 'translate-x-6' : 'translate-x-1'
                                            }`}
                                    />
                                </button>
                                <span className="text-black text-sm font-medium">
                                    {formData.isFrequentTraveler ? 'Frequent Traveler' : 'Occasional Traveler'}
                                </span>
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
                                {isSubmitting ? 'VERIFYING...' : 'VERIFY CREDENTIALS'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}; 