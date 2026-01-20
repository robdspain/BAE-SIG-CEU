import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Sparkles, Save, X, Plus } from "lucide-react";

export function BrandVoiceSettings() {
    const brandConfig = useQuery(api.brand.get);
    const updateBrand = useMutation(api.brand.update);

    const [formData, setFormData] = useState({
        tone: "Professional",
        forbiddenWords: [] as string[],
        examplePosts: [] as string[],
        customInstructions: ""
    });

    const [newWord, setNewWord] = useState("");

    useEffect(() => {
        if (brandConfig) {
            setFormData({
                tone: brandConfig.tone,
                forbiddenWords: brandConfig.forbiddenWords,
                examplePosts: brandConfig.examplePosts,
                customInstructions: brandConfig.customInstructions || ""
            });
        }
    }, [brandConfig]);

    const handleSave = async () => {
        await updateBrand(formData);
        alert("Brand settings saved!");
    };

    const addWord = () => {
        if (newWord && !formData.forbiddenWords.includes(newWord)) {
            setFormData({...formData, forbiddenWords: [...formData.forbiddenWords, newWord]});
            setNewWord("");
        }
    };

    const removeWord = (word: string) => {
        setFormData({...formData, forbiddenWords: formData.forbiddenWords.filter(w => w !== word)});
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <Sparkles className="text-purple-600" /> Brand Voice & AI Settings
                    </h1>
                    <button 
                        onClick={handleSave}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 shadow-lg transition-all"
                    >
                        <Save size={20} /> Save Configuration
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Tone & Instructions */}
                    <div className="space-y-8">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                            <label className="block text-sm font-bold text-gray-700 mb-4 uppercase tracking-wider">Brand Tone</label>
                            <select 
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                                value={formData.tone}
                                onChange={e => setFormData({...formData, tone: e.target.value})}
                            >
                                <option value="Professional">Professional & Clinical</option>
                                <option value="Friendly">Friendly & Approachable</option>
                                <option value="Bold">Bold & Direct</option>
                                <option value="Academic">Academic & Evidence-Based</option>
                            </select>
                        </div>

                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                            <label className="block text-sm font-bold text-gray-700 mb-4 uppercase tracking-wider">AI Custom Instructions</label>
                            <textarea 
                                rows={6}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                                placeholder="Describe how the AI should talk..."
                                value={formData.customInstructions}
                                onChange={e => setFormData({...formData, customInstructions: e.target.value})}
                            />
                        </div>
                    </div>

                    {/* Forbidden Words */}
                    <div className="space-y-8">
                         <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                            <label className="block text-sm font-bold text-gray-700 mb-4 uppercase tracking-wider">Forbidden Words</label>
                            <div className="flex gap-2 mb-4">
                                <input 
                                    type="text"
                                    className="flex-1 px-4 py-2 rounded-lg border border-gray-200 outline-none"
                                    placeholder="Add word..."
                                    value={newWord}
                                    onChange={e => setNewWord(e.target.value)}
                                    onKeyPress={e => e.key === 'Enter' && addWord()}
                                />
                                <button onClick={addWord} className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                                    <Plus size={20} />
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {formData.forbiddenWords.map(word => (
                                    <span key={word} className="px-3 py-1 bg-red-50 text-red-600 rounded-full text-sm font-medium flex items-center gap-1">
                                        {word}
                                        <X size={14} className="cursor-pointer" onClick={() => removeWord(word)} />
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 text-center py-12">
                            <Sparkles className="mx-auto text-purple-200 mb-4" size={48} />
                            <h3 className="text-gray-900 font-bold mb-1 text-lg">AI Power Ups Coming Soon</h3>
                            <p className="text-gray-500 text-sm">Automated social post generation based on your brand voice is being architected.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
