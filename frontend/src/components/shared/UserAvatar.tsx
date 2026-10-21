import { cn } from '@/lib/utils';
import { avatarTint, initialsOf } from '@/lib/avatar';

interface UserAvatarProps {
  name: string;
  /** sm = 32 px, md = 40 px, lg = 64 px (classes .avatar de la maquette). */
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/** Avatar à initiales ; la teinte (1..8) est dérivée du nom. */
export function UserAvatar({ name, size = 'sm', className }: UserAvatarProps) {
  return (
    <span className={cn('avatar', `avatar--${size}`, className)} data-t={avatarTint(name || 'EduPortal')} aria-hidden="true">
      {initialsOf(name)}
    </span>
  );
}
