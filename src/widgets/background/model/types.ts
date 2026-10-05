export type BackgroundState = {
  imgClassName?: string;
  overlayClassName?: string;
  alt?: string;
  hidden?: boolean;
  overlay?: boolean;
  src?: string;
};

export type BackgroundContextValue = {
  pageState: BackgroundState;
  setBackground: (state: BackgroundState) => void;
};
