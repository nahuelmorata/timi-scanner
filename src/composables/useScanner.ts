import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode'
import { nextTick, onBeforeUnmount, ref } from 'vue'

export function useScanner() {
  const codigo = ref('')
  const mostrandoCamara = ref(false)
  const cameraError = ref<string | null>(null)
  const mostrarPlaceholder = ref(true)
  let scanner: Html5Qrcode | null = null

  const stopScanner = async () => {
    if (scanner) {
      try {
        mostrarPlaceholder.value = true
        if (scanner.isScanning) {
          await scanner.stop()
        }
        scanner.clear()
      } catch (err) {
        console.warn('Scanner stop error', err)
      }
    }
    mostrandoCamara.value = false
  }

  const startScanner = async (onSuccess: (text: string) => Promise<void> | void) => {
    cameraError.value = null
    mostrandoCamara.value = true
    await nextTick()

    if (!scanner) {
      scanner = new Html5Qrcode('reader', {
        formatsToSupport: [
          Html5QrcodeSupportedFormats.CODE_128,
          Html5QrcodeSupportedFormats.EAN_13,
          Html5QrcodeSupportedFormats.EAN_8,
        ],
        experimentalFeatures: {
          useBarCodeDetectorIfSupported: true,
        },
        verbose: true,
      })
    }

    try {
      await scanner.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          aspectRatio: 1,
        },
        async (decodedText) => {
          codigo.value = decodedText
          await stopScanner()
          await onSuccess(decodedText)
        },
        () => {},
      )

      try {
        await scanner.applyVideoConstraints({
          width: { min: 640, ideal: 1280, max: 1920 },
          height: { min: 480, ideal: 720, max: 1080 },
          // @ts-expect-error focusMode might not be in standard definitions but supported by some browsers
          focusMode: 'continuous',
        })
      } catch (err) {
        console.warn('Could not apply video constraints', err)
      }

      mostrarPlaceholder.value = false
      await nextTick()
    } catch (err: unknown) {
      console.error(err)
      cameraError.value = (err as Error)?.message ?? 'No se pudo iniciar la cámara'
      mostrandoCamara.value = false
    }
  }

  onBeforeUnmount(() => {
    if (scanner) {
      // Use catch logic directly here to avoid async issues in hook
      try {
        if (scanner.isScanning) {
          scanner.stop().catch((e) => console.warn('Error stopping scanner on unmount', e))
        }
      } catch (e) {
        console.warn('Error clearing scanner', e)
      }
    }
  })

  return {
    codigo,
    mostrandoCamara,
    cameraError,
    mostrarPlaceholder,
    startScanner,
    stopScanner,
  }
}
