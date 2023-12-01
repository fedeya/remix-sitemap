import { singleton } from '../utils/singleton';

const flags = singleton('remix_flags', () => ({
  standalone: false,
  generating: false
}));

export const getFlagsRef = () => flags;
