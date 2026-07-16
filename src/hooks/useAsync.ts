import { useState, useEffect, useCallback } from 'react';

/**
 * 비동기 API 호출을 위한 커스텀 훅
 * 기존 동기 api.getXxx() 호출을 async로 전환할 때 사용
 */
export function useAsync<T>(
  asyncFn: () => Promise<T>,
  deps: unknown[] = []
): { data: T | undefined; loading: boolean; error: Error | null; refetch: () => void } {
  const [data, setData] = useState<T | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetch = useCallback(() => {
    setLoading(true);
    asyncFn()
      .then((result) => {
        setData(result);
        setError(null);
      })
      .catch((err) => setError(err))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, error, refetch: fetch };
}

/**
 * 폴링 기반 비동기 데이터 (채팅 목록 등)
 */
export function useAsyncPolling<T>(
  asyncFn: () => Promise<T>,
  intervalMs: number,
  deps: unknown[] = []
): { data: T | undefined; loading: boolean } {
  const [data, setData] = useState<T | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = () => {
      asyncFn().then((result) => {
        if (mounted) {
          setData(result);
          setLoading(false);
        }
      });
    };
    load();
    const timer = setInterval(load, intervalMs);
    return () => {
      mounted = false;
      clearInterval(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, loading };
}
