import { Button } from '@/components/ui/button';

const SkipToContent = () => {
  return (
    <Button
      variant="outline"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2"
      onClick={() => {
        const main = document.getElementById('main-content');
        if (main) {
          main.focus();
          main.scrollIntoView({ behavior: 'smooth' });
        }
      }}
    >
      Skip to main content
    </Button>
  );
};

export default SkipToContent;