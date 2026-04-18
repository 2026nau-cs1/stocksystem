import { useEffect, useState } from 'react';

type SetValue<T> = T | ((currentValue: T) => T);

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch (error) {
      console.error(`读取 localStorage 键 "${key}" 失败:`, error);
      return initialValue;
    }
  });

  const setValue = (value: SetValue<T>) => {
    try {
      const valueToStore =
        typeof value === 'function' ? (value as (currentValue: T) => T)(storedValue) : value;

      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`写入 localStorage 键 "${key}" 失败:`, error);
    }
  };

  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key !== key || event.newValue === null) {
        return;
      }

      try {
        setStoredValue(JSON.parse(event.newValue) as T);
      } catch (error) {
        console.error(`解析 localStorage 键 "${key}" 失败:`, error);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key]);

  return [storedValue, setValue] as const;
}
