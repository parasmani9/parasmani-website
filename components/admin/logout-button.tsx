'use client';

import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function LogoutButton() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogout = async () => {
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={isSubmitting}
      className="flex w-full items-center gap-3 px-4 py-3 text-sm text-red-400 hover:text-red-300 transition-colors disabled:opacity-70"
    >
      <LogOut size={16} />
      {isSubmitting ? 'Logging out...' : 'Logout'}
    </button>
  );
}
