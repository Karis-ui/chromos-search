import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { FiArrowLeft, FiLock } from 'react-icons/fi';
import authApi from '../api/endpoints/auth';

export default function ResetPasswordPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token') || '';
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const submit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError('');
        if (!token) {
            setError('This reset link is missing its token. Request a new link.');
            return;
        }
        if (password !== confirmPassword) {
            setError('The passwords do not match.');
            return;
        }

        setIsSubmitting(true);
        try {
            await authApi.confirmPasswordReset({ token, new_password: password });
            navigate('/login', { replace: true, state: { passwordReset: true } });
        } catch (requestError: any) {
            const response = requestError.response?.data;
            setError(response?.message || response?.detail || 'Could not reset your password. Request a fresh link.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main className="flex min-h-screen items-center justify-center bg-gray-950 px-4 text-white">
            <section className="w-full max-w-md border border-cyan-400/20 bg-gray-900/80 p-8 shadow-2xl shadow-cyan-950/30">
                <Link to="/forgot-password" className="mb-8 inline-flex items-center gap-2 text-sm text-cyan-300 hover:text-cyan-200">
                    <FiArrowLeft aria-hidden="true" /> Request a new link
                </Link>
                <h1 className="text-2xl font-semibold">Choose a new password</h1>
                <p className="mt-2 text-sm text-gray-400">Use at least 8 characters, including uppercase, lowercase, a number, and a symbol.</p>
                <form onSubmit={submit} className="mt-6 space-y-4">
                    <label className="block text-sm text-gray-300" htmlFor="new-password">New password</label>
                    <div className="flex items-center gap-3 border border-white/15 bg-black/30 px-3 py-3 focus-within:border-cyan-400">
                        <FiLock className="text-cyan-300" aria-hidden="true" />
                        <input
                            id="new-password"
                            type="password"
                            autoComplete="new-password"
                            required
                            minLength={8}
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            className="min-w-0 flex-1 bg-transparent text-sm outline-none"
                        />
                    </div>
                    <label className="block text-sm text-gray-300" htmlFor="confirm-password">Confirm new password</label>
                    <div className="flex items-center gap-3 border border-white/15 bg-black/30 px-3 py-3 focus-within:border-cyan-400">
                        <FiLock className="text-cyan-300" aria-hidden="true" />
                        <input
                            id="confirm-password"
                            type="password"
                            autoComplete="new-password"
                            required
                            value={confirmPassword}
                            onChange={(event) => setConfirmPassword(event.target.value)}
                            className="min-w-0 flex-1 bg-transparent text-sm outline-none"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-cyan-400 px-4 py-3 text-sm font-semibold text-gray-950 transition hover:bg-cyan-300 disabled:cursor-wait disabled:opacity-60"
                    >
                        {isSubmitting ? 'Updating...' : 'Update password'}
                    </button>
                </form>
                {error && <p role="alert" className="mt-5 text-sm text-red-300">{error}</p>}
            </section>
        </main>
    );
}