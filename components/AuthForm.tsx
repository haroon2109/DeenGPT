import React, { useState } from 'react';
import { Icons } from '../constants';
import { User } from '../types';

interface AuthFormProps {
    onLogin: (user: User) => void;
    onCancel: () => void;
}

const AuthForm: React.FC<AuthFormProps> = ({ onLogin, onCancel }) => {
    const [isSignUp, setIsSignUp] = useState(false);
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        
        // Simulate API call delay
        setTimeout(() => {
            setLoading(false);
            onLogin({
                id: '123',
                name: name || email.split('@')[0],
                email: email
            });
        }, 1500);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary-dark/30 backdrop-blur-sm">
            <div className="bg-white/90 backdrop-blur-xl rounded-3xl w-full max-w-md p-8 shadow-2xl border border-white/50 relative overflow-hidden">
                <button 
                    onClick={onCancel}
                    className="absolute top-4 right-4 text-secondary-dark hover:text-primary-dark transition-colors"
                >
                    <Icons.X />
                </button>

                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center p-3 bg-primary-light rounded-full shadow-inner mb-4">
                        <Icons.Logo />
                    </div>
                    <h2 className="font-display text-2xl font-bold text-primary-dark">
                        {isSignUp ? 'Create Account' : 'Welcome Back'}
                    </h2>
                    <p className="text-secondary-dark mt-2 text-sm">
                        {isSignUp ? 'Join your companion for faith & knowledge' : 'Sign in to continue your journey'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {isSignUp && (
                        <div>
                            <label className="block text-xs font-semibold text-secondary-dark uppercase tracking-wider mb-1">Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl bg-background/50 border border-secondary-light focus:border-primary-dark focus:ring-2 focus:ring-primary-dark/20 outline-none transition-all"
                                placeholder="Your Name"
                                required={isSignUp}
                            />
                        </div>
                    )}
                    <div>
                        <label className="block text-xs font-semibold text-secondary-dark uppercase tracking-wider mb-1">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-background/50 border border-secondary-light focus:border-primary-dark focus:ring-2 focus:ring-primary-dark/20 outline-none transition-all"
                            placeholder="hello@example.com"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-secondary-dark uppercase tracking-wider mb-1">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-background/50 border border-secondary-light focus:border-primary-dark focus:ring-2 focus:ring-primary-dark/20 outline-none transition-all"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3.5 bg-primary-dark text-white rounded-xl font-semibold shadow-lg shadow-primary-dark/20 hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6"
                    >
                        {loading ? (
                            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                {isSignUp ? 'Sign Up' : 'Sign In'}
                                <Icons.ArrowRight />
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-secondary-dark">
                    {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
                    <button
                        onClick={() => setIsSignUp(!isSignUp)}
                        className="font-semibold text-primary-dark hover:underline"
                    >
                        {isSignUp ? 'Sign In' : 'Sign Up'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AuthForm;
