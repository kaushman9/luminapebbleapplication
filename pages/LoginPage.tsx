import React, { useState } from 'react';
import { Icon } from '../components/ui/Icons';

interface LoginPageProps {
    onLogin: (emailOrUsername: string, pass: string) => boolean;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
    const [emailOrUsername, setEmailOrUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        const success = onLogin(emailOrUsername, password);
        if (!success) {
            setError('Invalid credentials. Please try again.');
        }
    };

    return (
        <div className="flex min-h-screen flex-col justify-center bg-slate-100 dark:bg-slate-950 py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center">
                    <Icon name="globe-alt" className="h-12 w-12 text-primary-600" />
                </div>
                <div className="mt-4 text-center">
                    <div className="flex justify-center items-baseline space-x-2">
                        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">Atlas</h1>
                        <span className="text-xl font-medium text-slate-500 dark:text-slate-400">by Lumina Pebble</span>
                    </div>
                </div>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white dark:bg-slate-900 py-8 px-4 shadow-sm sm:rounded-lg sm:px-10 border border-slate-200/80 dark:border-slate-800">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {error && (
                            <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4">
                                <p className="text-sm font-medium text-red-800 dark:text-red-300">{error}</p>
                            </div>
                        )}
                        <div>
                            <label htmlFor="emailOrUsername" className="block text-sm font-medium leading-6 text-slate-900 dark:text-slate-200">
                                Email or Username
                            </label>
                            <div className="mt-2">
                                <input
                                    id="emailOrUsername"
                                    name="emailOrUsername"
                                    type="text"
                                    autoComplete="username"
                                    required
                                    value={emailOrUsername}
                                    onChange={(e) => setEmailOrUsername(e.target.value)}
                                    className="block w-full rounded-md border-0 py-1.5 px-3 text-slate-900 dark:text-slate-200 bg-white dark:bg-slate-800 shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium leading-6 text-slate-900 dark:text-slate-200">
                                Password
                            </label>
                            <div className="mt-2">
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full rounded-md border-0 py-1.5 px-3 text-slate-900 dark:text-slate-200 bg-white dark:bg-slate-800 shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6"
                                />
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                className="flex w-full justify-center rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
                            >
                                Sign in
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;