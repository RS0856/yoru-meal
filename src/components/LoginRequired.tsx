export default function LoginRequired() {
    return (
        <div className="space-y-3">
            <p>閲覧にはログインが必要です。</p>
            <a className="px-3 py-2 rounded bg-black text-white inline-block" href="/api/auth/login">GitHubでログイン</a>
        </div>
    );
} 