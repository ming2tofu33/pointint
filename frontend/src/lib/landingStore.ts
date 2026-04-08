let landingFile: File | null = null;

export function setLandingFile(file: File) {
  landingFile = file;
}

export function getLandingFile(): File | null {
  return landingFile;
}

export function clearLandingFile() {
  landingFile = null;
}
