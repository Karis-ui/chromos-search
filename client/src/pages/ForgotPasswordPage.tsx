import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowLeft, FiMail } from 'react-icons/fi';
import authApi from '../api/endpoints/auth';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [resetUrl, setResetUrl] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const submit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError('');
        setMessage('');
        setResetUrl('');
        setIsSubmitting(true);
        try {
            const response = await authApi.requestPasswordReset(email.trim());
            setMessage(response.message);
            setResetUrl(response.reset_url || '');
        } catch (requestError: any) {
            setError(requestError.response?.data?.message || 'Could not request a password reset.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main className="flex min-h-screen items-center justify-center bg-gray-950 px-4 text-white">
            <section className="w-full max-w-md border border-cyan-400/20 bg-gray-900/80 p-8 shadow-2xl shadow-cyan-950/30">
                <Link to="/login" className="mb-8 inline-flex items-center gap-2 text-sm text-cyan-300 hover:text-cyan-200">
                    <FiArrowLeft aria-hidden="true" /> Back to sign in
                </Link>
                <h1 className="text-2xl font-semibold">Reset your password</h1>
                <p className="mt-2 text-sm text-gray-400">Enter the email address on your account.</p>
                <form onSubmit={submit} className="mt-6 space-y-4">
                    <label className="block text-sm text-gray-300" htmlFor="reset-email">Email address</label>
                    <div className="flex items-center gap-3 border border-white/15 bg-black/30 px-3 py-3 focus-within:border-cyan-400">
                        <FiMail className="text-cyan-300" aria-hidden="true" />
                        <input
                            id="reset-email"
                            type="email"
                            autoComplete="email"
                            required
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-gray-600"
                            placeholder="you@example.com"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-cyan-400 px-4 py-3 text-sm font-semibold text-gray-950 transition hover:bg-cyan-300 disabled:cursor-wait disabled:opacity-60"
                    >
                        {isSubmitting ? 'Sending...' : 'Send reset link'}
                    </button>
                </form>
                {message && <p role="status" className="mt-5 text-sm text-green-300">{message}</p>}
                {resetUrl && (
                    <p className="mt-3 break-all text-sm text-cyan-200">
                        Local debug link: <a className="underline" href={resetUrl}>{resetUrl}</a>
                    </p>
                )}
                {error && <p role="alert" className="mt-5 text-sm text-red-300">{error}</p>}
            </section>
        </main>
    );
}