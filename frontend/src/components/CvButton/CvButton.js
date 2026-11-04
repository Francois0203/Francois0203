import Button from '../Button';
import useCvDownload from '../../hooks/useCvDownload';
import styles from './CvButton.module.css';

const DownloadIcon = () => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M10 3v10M5.5 9 10 13.5 14.5 9M4 16.5h12" />
  </svg>
);

// Downloads the CV from anywhere. Spins while the PDF is built, then ticks or shakes.
const CvButton = ({ size = 'sm', variant = 'primary', tone = 'blue', className = '', children }) => {
  const cv = useCvDownload();
  return (
    <Button
      variant={variant}
      tone={tone}
      size={size}
      icon={<DownloadIcon />}
      status={cv.status}
      disabled={!cv.ready}
      onClick={() => cv.run()}
      className={[styles.cv, className].filter(Boolean).join(' ')}
    >
      {children ?? cv.label}
    </Button>
  );
};

export default CvButton;
