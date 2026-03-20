
const MAGIC_BYTES: Record<string, number[][]> = {
  'image/jpeg': [[0xFF, 0xD8, 0xFF]],
  'image/png': [[0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]],
}

export function validateMagicBytes(
  buffer: Buffer,
  declaredType: string
): boolean {
  const signatures = MAGIC_BYTES[declaredType]
  if (!signatures) return false

  return signatures.some((sig) =>
    sig.every((byte, i) => buffer[i] === byte)
  )
}
