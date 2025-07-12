import { describe, it, expect } from 'vitest';
import Hello from './Hello';

describe('Hello component', () => {
    it('renders correctly', () => {
        const { getByText } = render(<Hello />);
        expect(getByText('Hello, World!')).toBeInTheDocument();
    });
});