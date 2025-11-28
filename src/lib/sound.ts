// Sonido de notificación simple y agradable para admin
export const playNotificationSound = () => {
  try {
    // Usamos Audio API para generar un sonido de notificación
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext
    if (AudioContext) {
      const ctx = new AudioContext()
      const oscillator = ctx.createOscillator()
      const gainNode = ctx.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(ctx.destination)
      
      // Sonido más profesional para admin (tono más bajo y suave)
      oscillator.type = 'sine'
      oscillator.frequency.setValueAtTime(400, ctx.currentTime) // Frecuencia inicial más baja
      oscillator.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.15) // Subir tono
      
      gainNode.gain.setValueAtTime(0.15, ctx.currentTime) // Volumen un poco más alto
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6)
      
      oscillator.start(ctx.currentTime)
      oscillator.stop(ctx.currentTime + 0.6)
      return
    }

    // Fallback
    console.log('AudioContext not supported')
  } catch (error) {
    console.error('Error playing notification sound:', error)
  }
}



