// downloadBlob helper: accepts a Blob or response data and triggers a browser download
export function downloadBlob(blob, filename = 'download.bin') {
  try {
    let downloadUrl;
    if (blob instanceof Blob) {
      downloadUrl = URL.createObjectURL(blob);
    } else if (blob && blob.data && blob.data instanceof Blob) {
      downloadUrl = URL.createObjectURL(blob.data);
    } else if (blob && typeof blob === 'object') {
      // axios may return ArrayBuffer in some cases; create a blob
      const b = new Blob([blob], { type: 'application/octet-stream' });
      downloadUrl = URL.createObjectURL(b);
    } else {
      console.error('downloadBlob: unsupported payload', blob);
      return;
    }

    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
  } catch (e) {
    console.error('downloadBlob failed', e);
  }
}
