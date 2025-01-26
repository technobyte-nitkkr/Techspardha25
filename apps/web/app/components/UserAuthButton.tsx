"use client";
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useAuth } from '../lib/context/auth-context';
import { signInWithGoogle, signOutUser } from '../lib/actions';
import { useRouter } from 'next/navigation'
import { doc, getDoc, setDoc, getFirestore } from 'firebase/firestore';
import firebase_app from '../lib/firebase';
import { Menu } from 'lucide-react';

const db = getFirestore(firebase_app);

export default function UserAuthButton() {
    const { user } = useAuth();
    const [isLoginPopupOpen, setIsLoginPopupOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        mobile: '',
        collegeName: '',
        year: ''
    });
    const [showProfileCompletion, setShowProfileCompletion] = useState(false);
    const [userData, setUserData] = useState({
        email: '',
        mobile: '',
        collegeName: '',
        year: ''
    });

    const router = useRouter()

    useEffect(() => {
        const fetchUserData = async () => {
            if (!user) return;
    
            try {
                const userDocRef = doc(db, 'users', user.uid);
                const userDoc = await getDoc(userDocRef);
    
                if (userDoc.exists()) {
                    const data = userDoc.data();
                    setUserData({
                        email: data.email || user.email || '',
                        mobile: data.mobile || '',
                        collegeName: data.collegeName || '',
                        year: data.year || ''
                    });
                    setFormData({
                        mobile: data.mobile || '',
                        collegeName: data.collegeName || '',
                        year: data.year || ''
                    });
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };
    
        if (showProfileCompletion) {
            fetchUserData();
        }
    }, [user, showProfileCompletion]);

    const handleGoogleSignIn = async () => {
        try {
            setIsLoading(true)
            setError('')
            const result = await signInWithGoogle()

            if (result.success) {
                setIsLoginPopupOpen(false)
                setShowProfileCompletion(true)
            } else {
                setError(result.error || 'Failed to sign in')
            }
        } catch (err) {
            setError('An unexpected error occurred')
        } finally {
            setIsLoading(false)
        }
    }

    const handleProfileSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        try {
            const userDocRef = doc(db, 'users', user.uid);
            await setDoc(userDocRef, {
                mobile: formData.mobile || userData.mobile,
                collegeName: formData.collegeName || userData.collegeName,
                year: formData.year || userData.year
            }, { merge: true });

            setShowProfileCompletion(false);
            router.push('/');
        } catch (error) {
            console.error('Error updating profile:', error);
            setError('Failed to update profile');
        }
    }

    const handleLogout = async () => {
        try {
            const result = await signOutUser();
            if (result.success) {
                router.push('/');
                setIsUserMenuOpen(false);
            }
        } catch (error) {
            console.error("Logout failed:", error);
        }
    }

    const renderProfileCompletionPopup = () => (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="rounded-3xl w-[80%] max-w-[648px] h-[80vh] max-h-[651px] flex items-center justify-center bg-ocean-blue/60 shadow-xl">
                <div className="w-full max-w-md p-8">
                    <div className="flex justify-center mb-6">
                        <Image
                            src="/logo.svg"
                            alt="Logo"
                            width={48}
                            height={48}
                            className="w-12 h-12"
                        />
                    </div>

                    <div className="text-center mb-6">
                        <h2 className="text-lg md:text-xl text-[#6F8294] mb-4">Complete Your Profile</h2>
                        <div className="flex items-center justify-center space-x-3 mb-4">
                            <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-[#367CFF]">
                                <Image
                                    src={user?.photoURL || "/placeholder.svg"}
                                    alt="Profile Picture"
                                    width={30}
                                    height={30}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <h1 className="text-2xl md:text-3xl text-[#AEBCCA] font-semibold">
                                {user?.displayName}
                            </h1>
                        </div>
                    </div>

                    <form onSubmit={handleProfileSubmit} className="space-y-6 flex flex-col justify-center items-center">
                        <div className="space-y-2 border w-[90%] md:w-[521px] border-light-ocean-blue bg-light-ocean-blue rounded-2xl py-3 px-4">
                            <label htmlFor="email" className="block text-sm md:text-base text-[#515F73]">
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                readOnly
                                value={userData.email || user?.email || ''}
                                className="w-full h-[15px] bg-light-ocean-blue text-xs md:text-base text-gray-200 focus:outline-none"
                            />
                        </div>


                        <div className="space-y-2 border w-[90%] md:w-[521px] border-light-ocean-blue bg-light-ocean-blue rounded-2xl py-3 px-4">
                            <label htmlFor="mobile" className="block text-sm md:text-base text-[#515F73]">
                                Mobile No.
                            </label>
                            <input
                                id="mobile"
                                type="tel"
                                value={formData.mobile}
                                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                                className="w-full h-[15px] bg-light-ocean-blue text-xs md:text-base text-gray-200 focus:outline-none"
                                placeholder="Enter your mobile number"
                            />
                        </div>


                        <div className="space-y-2 border w-[90%] md:w-[521px] border-light-ocean-blue bg-light-ocean-blue rounded-2xl py-3 px-4">
                            <label htmlFor="collegeName" className="block text-sm md:text-base text-[#515F73]">
                                College Name
                            </label>
                            <input
                                id="collegeName"
                                type="text"
                                value={formData.collegeName}
                                onChange={(e) => setFormData({ ...formData, collegeName: e.target.value })}
                                className="w-full h-[15px] bg-light-ocean-blue text-xs md:text-base text-gray-200 focus:outline-none"
                                placeholder="Enter your college name"
                            />
                        </div>


                        <div className="space-y-2 border w-[90%] md:w-[521px] border-light-ocean-blue bg-light-ocean-blue rounded-2xl py-3 px-4">
                            <label htmlFor="year" className="block text-sm md:text-base text-[#515F73]">
                                Year
                            </label>
                            <input
                                id="year"
                                type="text"
                                value={formData.year}
                                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                                className="w-full h-[15px] bg-light-ocean-blue text-xs md:text-base text-gray-200 focus:outline-none"
                                placeholder="Enter your year"
                            />
                        </div>

                        {error && (
                            <div className="text-red-500 text-sm text-center">{error}</div>
                        )}

                        <button
                            type="submit"
                            className="w-[70%] max-w-[130px] h-[36px] px-0 rounded-3xl bg-light-ocean-blue text-sm md:text-base"
                        >
                            Save
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );

    if (showProfileCompletion) {
        return renderProfileCompletionPopup();
    }

    if (user) {
        return (
            <>

                <div className="hidden md:flex items-center gap-3 mt-[-20px]">
                    <div className="flex items-center gap-2 bg-white/10 backdrop-blur-lg rounded-full px-4 py-2">
                        <Image
                            src={user.photoURL || "/default-avatar.png"}
                            alt="Profile"
                            width={32}
                            height={32}
                            className="rounded-full"
                            priority
                        />
                        <span className="text-white text-sm">{user.displayName}</span>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="bg-[#296E93] hover:bg-[#3A8AB8] text-white px-4 py-2 rounded-full text-sm"
                    >
                        Logout
                    </button>
                </div>


                <div className="md:hidden relative">
                    <button
                        onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                        className="text-white"
                    >
                        <Menu size={24} />
                    </button>

                    {isUserMenuOpen && (
                        <div className="fixed inset-0 z-50 bg-[#001926]/75 backdrop-blur-sm flex items-center justify-center">
                            <div className="bg-[#001926] border border-[#296E93]/30 rounded-lg shadow-2xl p-6 w-[90%] max-w-sm">
                                <div className="flex items-center gap-4 mb-4">
                                    <Image
                                        src={user.photoURL || "/default-avatar.png"}
                                        alt="Profile"
                                        width={48}
                                        height={48}
                                        className="rounded-full"
                                        priority
                                    />
                                    <div>
                                        <span className="text-lg font-semibold block text-white">{user.displayName}</span>
                                        <span className="text-[#296E93] text-sm">{user.email}</span>
                                    </div>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="w-full bg-[#296E93] hover:bg-[#3A8AB8] text-white px-4 py-3 rounded-full text-sm mb-3"
                                >
                                    Logout
                                </button>
                                <button
                                    onClick={() => setIsUserMenuOpen(false)}
                                    className="w-full bg-white/10 hover:bg-white/20 text-white px-4 py-3 rounded-full text-sm"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </>
        );
    }

    return (
        <>
            <button
                onClick={() => setIsLoginPopupOpen(true)}
                className="bg-[#296E93] hover:bg-[#3A8AB8] text-white px-4 py-2 rounded-full text-sm"
            >
                Login
            </button>

            {isLoginPopupOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="rounded-3xl w-[80%] max-w-[648px] h-[80vh] max-h-[651px] flex items-center justify-center bg-ocean-blue/60 shadow-xl relative">
                        <button
                            onClick={() => setIsLoginPopupOpen(false)}
                            className="absolute top-4 right-4 text-white text-2xl"
                        >
                            &times;
                        </button>
                        <div className="w-full max-w-md p-8">
                            <div className="flex justify-center mb-6">
                                <Image
                                    src="/logo.svg"
                                    alt="Logo"
                                    width={48}
                                    height={48}
                                    className="w-12 h-12"
                                />
                            </div>

                            <div className="text-center">
                                <h2 className="text-lg md:text-xl text-[#6F8294] mb-4">Hey there,</h2>
                                <div className="flex items-center justify-center space-x-3 mb-4">
                                    <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-[#367CFF]">
                                        <Image
                                            src="/placeholder.svg"
                                            alt="Profile Picture"
                                            width={300}
                                            height={300}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <h1 className="text-2xl md:text-3xl text-[#AEBCCA] font-semibold">Welcome to Techspardha</h1>
                                </div>
                            </div>

                            <div className="space-y-6 flex flex-col justify-center items-center">
                                <div className="w-[90%] md:w-[521px] flex items-center">
                                    <div className="flex-grow border-t border-gray-300"></div>
                                    <span className="px-4 text-sm text-gray-500"></span>
                                    <div className="flex-grow border-t border-gray-300"></div>
                                </div>

                                <button
                                    onClick={handleGoogleSignIn}
                                    disabled={isLoading}
                                    className="w-[90%] md:w-[521px] h-[36px] rounded-3xl bg-white text-sm md:text-base text-gray-700 hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
                                >
                                    {isLoading ? (
                                        <div className="animate-spin">⌛</div>
                                    ) : (
                                        <>
                                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                                <path
                                                    fill="currentColor"
                                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                                />
                                                <path
                                                    fill="currentColor"
                                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                                />
                                                <path
                                                    fill="currentColor"
                                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                                />
                                                <path
                                                    fill="currentColor"
                                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                                />
                                                Continue with Google
                                            </svg>
                                        </>
                                    )}
                                </button>

                                {error && (
                                    <div className="text-red-500 text-sm text-center">{error}</div>
                                )}

                                <div className="text-center text-sm text-gray-500">
                                    Sign In with Google{' '}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </>
    )
}