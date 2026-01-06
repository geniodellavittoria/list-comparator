import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

describe('App Component', () => {
  beforeEach(() => {
    render(<App />);
  });

  describe('Initial Render', () => {
    it('renders the main heading', () => {
      expect(screen.getByText('List Comparator')).toBeInTheDocument();
    });

    it('renders both text areas', () => {
      expect(screen.getByPlaceholderText(/Enter your original list here/)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/Enter your modified list here/)).toBeInTheDocument();
    });

    it('displays empty state message', () => {
      expect(screen.getByText('Ready to Compare')).toBeInTheDocument();
      expect(screen.getByText('Enter your lists above to see the differences')).toBeInTheDocument();
    });

    it('renders action buttons', () => {
      expect(screen.getByText('Load Example')).toBeInTheDocument();
      expect(screen.getByText('Clear All')).toBeInTheDocument();
    });

    it('renders legend', () => {
      expect(screen.getByText('Legend')).toBeInTheDocument();
      expect(screen.getByText('Removed from original')).toBeInTheDocument();
      expect(screen.getByText('Added to modified')).toBeInTheDocument();
      expect(screen.getByText('Repositioned')).toBeInTheDocument();
      expect(screen.getByText('Unchanged')).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('updates left textarea on input', async () => {
      const leftTextarea = screen.getByPlaceholderText(/Enter your original list here/);
      await userEvent.type(leftTextarea, 'Apple\nBanana');
      expect(leftTextarea).toHaveValue('Apple\nBanana');
    });

    it('updates right textarea on input', async () => {
      const rightTextarea = screen.getByPlaceholderText(/Enter your modified list here/);
      await userEvent.type(rightTextarea, 'Cherry\nDate');
      expect(rightTextarea).toHaveValue('Cherry\nDate');
    });

    it('loads example data when Load Example button is clicked', async () => {
      const loadExampleButtons = screen.getAllByText('Load Example');
      await userEvent.click(loadExampleButtons[0]);

      const leftTextarea = screen.getByPlaceholderText(/Enter your original list here/) as HTMLTextAreaElement;
      const rightTextarea = screen.getByPlaceholderText(/Enter your modified list here/) as HTMLTextAreaElement;

      expect(leftTextarea.value).toContain('Apple');
      expect(leftTextarea.value).toContain('Banana');
      expect(rightTextarea.value).toContain('Cherry');
      expect(rightTextarea.value).toContain('Honeydew');
    });

    it('clears both textareas when Clear All button is clicked', async () => {
      const leftTextarea = screen.getByPlaceholderText(/Enter your original list here/);
      const rightTextarea = screen.getByPlaceholderText(/Enter your modified list here/);

      await userEvent.type(leftTextarea, 'Apple');
      await userEvent.type(rightTextarea, 'Banana');

      const clearButton = screen.getByText('Clear All');
      await userEvent.click(clearButton);

      expect(leftTextarea).toHaveValue('');
      expect(rightTextarea).toHaveValue('');
    });
  });

  describe('Comparison Logic', () => {
    it('detects removed items', async () => {
      const leftTextarea = screen.getByPlaceholderText(/Enter your original list here/);
      const rightTextarea = screen.getByPlaceholderText(/Enter your modified list here/);

      await userEvent.type(leftTextarea, 'Apple\nBanana\nCherry');
      await userEvent.type(rightTextarea, 'Apple\nCherry');

      expect(screen.getByText('REMOVED')).toBeInTheDocument();
      expect(screen.getByText('Removed')).toBeInTheDocument();
    });

    it('detects added items', async () => {
      const leftTextarea = screen.getByPlaceholderText(/Enter your original list here/);
      const rightTextarea = screen.getByPlaceholderText(/Enter your modified list here/);

      await userEvent.type(leftTextarea, 'Apple\nBanana');
      await userEvent.type(rightTextarea, 'Apple\nBanana\nCherry');

      expect(screen.getByText('ADDED')).toBeInTheDocument();
    });

    it('detects moved items', async () => {
      const leftTextarea = screen.getByPlaceholderText(/Enter your original list here/);
      const rightTextarea = screen.getByPlaceholderText(/Enter your modified list here/);

      await userEvent.type(leftTextarea, 'Apple\nBanana\nCherry');
      await userEvent.type(rightTextarea, 'Banana\nApple\nCherry');

      const moved = screen.getAllByText('MOVED');
      expect(moved.length).toBeGreaterThan(0);
    });

    it('detects unchanged items', async () => {
      const leftTextarea = screen.getByPlaceholderText(/Enter your original list here/);
      const rightTextarea = screen.getByPlaceholderText(/Enter your modified list here/);

      await userEvent.type(leftTextarea, 'Apple\nBanana');
      await userEvent.type(rightTextarea, 'Apple\nBanana');

      expect(screen.getByText('Comparison Summary')).toBeInTheDocument();
    });
  });

  describe('Statistics Display', () => {
    it('shows statistics when lists are provided', async () => {
      const leftTextarea = screen.getByPlaceholderText(/Enter your original list here/);
      const rightTextarea = screen.getByPlaceholderText(/Enter your modified list here/);

      await userEvent.type(leftTextarea, 'Apple\nBanana\nCherry');
      await userEvent.type(rightTextarea, 'Apple\nDate');

      expect(screen.getByText('Comparison Summary')).toBeInTheDocument();
      const removed = screen.getAllByText('Removed');
      const added = screen.getAllByText('Added');
      const moved = screen.getAllByText('Moved');
      const unchanged = screen.getAllByText('Unchanged');
      expect(removed.length).toBeGreaterThan(0);
      expect(added.length).toBeGreaterThan(0);
      expect(moved.length).toBeGreaterThan(0);
      expect(unchanged.length).toBeGreaterThan(0);
    });

    it('calculates correct statistics for removed items', async () => {
      const leftTextarea = screen.getByPlaceholderText(/Enter your original list here/);
      const rightTextarea = screen.getByPlaceholderText(/Enter your modified list here/);

      await userEvent.type(leftTextarea, 'Apple\nBanana\nCherry');
      await userEvent.type(rightTextarea, 'Apple');

      const stats = screen.getByText('Comparison Summary').parentElement;
      expect(stats).toHaveTextContent('2');
      expect(stats).toHaveTextContent('Removed');
    });

    it('calculates correct statistics for added items', async () => {
      const leftTextarea = screen.getByPlaceholderText(/Enter your original list here/);
      const rightTextarea = screen.getByPlaceholderText(/Enter your modified list here/);

      await userEvent.type(leftTextarea, 'Apple');
      await userEvent.type(rightTextarea, 'Apple\nBanana\nCherry');

      const stats = screen.getByText('Comparison Summary').parentElement;
      expect(stats).toHaveTextContent('2');
      expect(stats).toHaveTextContent('Added');
    });

    it('displays total changes count', async () => {
      const leftTextarea = screen.getByPlaceholderText(/Enter your original list here/);
      const rightTextarea = screen.getByPlaceholderText(/Enter your modified list here/);

      await userEvent.type(leftTextarea, 'Apple\nBanana');
      await userEvent.type(rightTextarea, 'Cherry\nDate');

      expect(screen.getByText(/total changes detected/)).toBeInTheDocument();
    });
  });

  describe('Detailed Comparison Display', () => {
    it('shows detailed comparison when lists are provided', async () => {
      const leftTextarea = screen.getByPlaceholderText(/Enter your original list here/);
      const rightTextarea = screen.getByPlaceholderText(/Enter your modified list here/);

      await userEvent.type(leftTextarea, 'Apple\nBanana');
      await userEvent.type(rightTextarea, 'Apple\nCherry');

      expect(screen.getByText('Detailed Comparison')).toBeInTheDocument();
      expect(screen.getByText('Line-by-line analysis of changes')).toBeInTheDocument();
    });

    it('displays line numbers for changes', async () => {
      const leftTextarea = screen.getByPlaceholderText(/Enter your original list here/);
      const rightTextarea = screen.getByPlaceholderText(/Enter your modified list here/);

      await userEvent.type(leftTextarea, 'Apple\nBanana');
      await userEvent.type(rightTextarea, 'Banana\nApple');

      const lineElements = screen.getAllByText(/Line \d+/);
      expect(lineElements.length).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases', () => {
    it('handles empty lines correctly', async () => {
      const leftTextarea = screen.getByPlaceholderText(/Enter your original list here/);
      const rightTextarea = screen.getByPlaceholderText(/Enter your modified list here/);

      await userEvent.type(leftTextarea, 'Apple\n\n\nBanana');
      await userEvent.type(rightTextarea, 'Apple\nBanana');

      expect(screen.getByText('Comparison Summary')).toBeInTheDocument();
    });

    it('handles lists with only whitespace', async () => {
      const leftTextarea = screen.getByPlaceholderText(/Enter your original list here/);
      const rightTextarea = screen.getByPlaceholderText(/Enter your modified list here/);

      await userEvent.type(leftTextarea, '   \n   \n   ');
      await userEvent.type(rightTextarea, '   ');

      expect(screen.getByText('Ready to Compare')).toBeInTheDocument();
    });

    it('handles identical lists', async () => {
      const leftTextarea = screen.getByPlaceholderText(/Enter your original list here/);
      const rightTextarea = screen.getByPlaceholderText(/Enter your modified list here/);

      await userEvent.type(leftTextarea, 'Apple\nBanana\nCherry');
      await userEvent.type(rightTextarea, 'Apple\nBanana\nCherry');

      const stats = screen.getByText('Comparison Summary').parentElement;
      expect(stats).toHaveTextContent('3');
      expect(stats).toHaveTextContent('Unchanged');
    });

    it('handles completely different lists', async () => {
      const leftTextarea = screen.getByPlaceholderText(/Enter your original list here/);
      const rightTextarea = screen.getByPlaceholderText(/Enter your modified list here/);

      await userEvent.type(leftTextarea, 'Apple\nBanana');
      await userEvent.type(rightTextarea, 'Cherry\nDate');

      const removed = screen.getAllByText('REMOVED');
      const added = screen.getAllByText('ADDED');
      expect(removed.length).toBeGreaterThan(0);
      expect(added.length).toBeGreaterThan(0);
    });
  });

  describe('Complex Scenarios', () => {
    it('handles mixed changes correctly', async () => {
      const leftTextarea = screen.getByPlaceholderText(/Enter your original list here/);
      const rightTextarea = screen.getByPlaceholderText(/Enter your modified list here/);

      await userEvent.type(leftTextarea, 'Apple\nBanana\nCherry\nDate');
      await userEvent.type(rightTextarea, 'Apple\nCherry\nBanana\nEldberry');

      expect(screen.getByText('Comparison Summary')).toBeInTheDocument();
      const removed = screen.getAllByText('REMOVED');
      const added = screen.getAllByText('ADDED');
      const moved = screen.getAllByText('MOVED');
      expect(removed.length).toBeGreaterThan(0);
      expect(added.length).toBeGreaterThan(0);
      expect(moved.length).toBeGreaterThan(0);
    });

    it('example data loads with correct comparison', async () => {
      const loadExampleButtons = screen.getAllByText('Load Example');
      await userEvent.click(loadExampleButtons[0]);

      expect(screen.getByText('Comparison Summary')).toBeInTheDocument();
      expect(screen.getByText('Detailed Comparison')).toBeInTheDocument();
      expect(screen.getByText(/total changes detected/)).toBeInTheDocument();
    });
  });
});
