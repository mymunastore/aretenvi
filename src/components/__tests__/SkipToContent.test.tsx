import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import SkipToContent from '../SkipToContent';

describe('SkipToContent', () => {
  it('renders skip link', () => {
    render(<SkipToContent />);
    const button = screen.getByText('Skip to main content');
    expect(button).toBeInTheDocument();
  });

  it('focuses main content when clicked', () => {
    const mainContent = document.createElement('div');
    mainContent.id = 'main-content';
    mainContent.tabIndex = -1;
    document.body.appendChild(mainContent);

    render(<SkipToContent />);
    const button = screen.getByText('Skip to main content');

    fireEvent.click(button);

    expect(document.activeElement).toBe(mainContent);

    document.body.removeChild(mainContent);
  });
});