// Copy around the photos: the home table, the Bio gallery and the photo viewer.

export const PHOTOS_FIELDS = [
  { key: 'homeTitle', label: 'Home - photos headline (marker on *word*)', type: 'text', default: 'Off the *clock*.' },
  { key: 'homeLede', label: 'Home - photos lede', type: 'textarea', default: 'Where I end up when the laptop closes.' },
  { key: 'homeHint', label: 'Home - hint (mouse)', type: 'text', default: 'Drag them around. Click one to look closer.' },
  { key: 'homeHintTouch', label: 'Home - hint (touch)', type: 'text', default: 'Swipe through, tap one to look closer.' },
  { key: 'homeMore', label: 'Home - link to the Bio gallery', type: 'text', default: 'All my photos' },
  { key: 'bioLede', label: 'Bio - line above the gallery', type: 'text', default: 'A few pictures from outside the office.' },
  { key: 'storyPhotos', label: 'Story - label on a chapter with photos', type: 'text', default: 'photos' },
  { key: 'viewerClose', label: 'Photo viewer - close button (read aloud)', type: 'text', default: 'Close photo' },
  { key: 'viewerNext', label: 'Photo viewer - next button (read aloud)', type: 'text', default: 'Next photo' },
  { key: 'viewerPrev', label: 'Photo viewer - previous button (read aloud)', type: 'text', default: 'Previous photo' },
];
