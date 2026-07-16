import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function LoginPage() {
  const { signInEmail, signUpEmail, signInGoogle, signInAnon } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEmailAuth = async () => {
    setError('');
    if (!email || !password) { setError('이메일과 비밀번호를 입력해주세요.'); return; }
    if (mode === 'signup' && password !== confirmPw) { setError('비밀번호가 일치하지 않습니다.'); return; }
    if (password.length < 6) { setError('비밀번호는 6자 이상이어야 합니다.'); return; }
    setLoading(true);
    try {
      if (mode === 'login') {
        await signInEmail(email, password);
      } else {
        await signUpEmail(email, password);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '오류가 발생했습니다';
      if (msg.includes('user-not-found') || msg.includes('invalid-credential')) setError('등록되지 않은 계정이거나 비밀번호가 틀렸습니다.');
      else if (msg.includes('email-already-in-use')) setError('이미 사용 중인 이메일입니다.');
      else if (msg.includes('invalid-email')) setError('올바른 이메일 형식이 아닙니다.');
      else setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError('');
    setLoading(true);
    try {
      await signInGoogle();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '오류가 발생했습니다';
      if (!msg.includes('popup-closed')) setError('Google 로그인에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnon = async () => {
    setError('');
    setLoading(true);
    try {
      await signInAnon();
    } catch {
      setError('게스트 로그인에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-[400px] space-y-6">
        {/* 로고 */}
        <div className="text-center pt-8">
          <h1 className="text-3xl font-bold text-green-500">슥싹매칭</h1>
          <p className="text-sm text-gray-500 mt-1">Record 365 청소 매칭 서비스</p>
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* 이메일 폼 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-gray-800">
            {mode === 'login' ? '로그인' : '회원가입'}
          </h2>

          <input
            type="email"
            placeholder="이메일"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-300"
          />
          <input
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-300"
          />
          {mode === 'signup' && (
            <input
              type="password"
              placeholder="비밀번호 확인"
              value={confirmPw}
              onChange={(e) => setConfirmPw(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-300"
            />
          )}

          <button
            onClick={handleEmailAuth}
            disabled={loading}
            className="w-full bg-green-500 hover:bg-green-600 active:bg-green-700 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-50"
          >
            {loading ? '처리중...' : mode === 'login' ? '로그인' : '회원가입'}
          </button>

          <button
            onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); }}
            className="w-full text-sm text-gray-500 py-2"
          >
            {mode === 'login' ? '계정이 없으신가요? 회원가입' : '이미 계정이 있으신가요? 로그인'}
          </button>
        </div>

        {/* 소셜 로그인 */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex-1 border-t border-gray-200" />
            <span className="text-xs text-gray-400">또는</span>
            <div className="flex-1 border-t border-gray-200" />
          </div>

          <button
            onClick={handleGoogle}
            disabled={loading}
            className="w-full bg-white border border-gray-300 rounded-xl py-3 flex items-center justify-center gap-3 text-sm font-medium text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition-colors disabled:opacity-50"
          >
            <svg width="18" height="18" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            Google로 계속하기
          </button>

          <button
            onClick={handleAnon}
            disabled={loading}
            className="w-full bg-gray-100 rounded-xl py-3 text-sm font-medium text-gray-600 hover:bg-gray-200 active:bg-gray-300 transition-colors disabled:opacity-50"
          >
            게스트로 둘러보기
          </button>
        </div>

        <p className="text-center text-[11px] text-gray-400 pb-6">
          로그인 시 Record 365의 이용약관 및 개인정보처리방침에 동의합니다.
        </p>
      </div>
    </div>
  );
}
