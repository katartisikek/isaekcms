import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Αυξάνει το όριο προειδοποίησης chunk (το 1.5MB είναι αναμενόμενο)
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      output: {
        // Χωρίζει το bundle σε μικρότερα κομμάτια για γρηγορότερη φόρτωση
        manualChunks: {
          // React core - φορτώνεται πρώτο, cache από browser
          'vendor-react': ['react', 'react-dom'],
          // Lucide icons - μεγάλη βιβλιοθήκη, cache separately
          'vendor-icons': ['lucide-react'],
          // Excel export - μεγάλη βιβλιοθήκη, φορτώνεται μόνο όταν χρειαστεί
          'vendor-xlsx': ['xlsx'],
          // Calendar - φορτώνεται μόνο για το πρόγραμμα μαθημάτων
          'vendor-calendar': ['react-big-calendar'],
          // Supabase client
          'vendor-supabase': ['@supabase/supabase-js'],
        }
      }
    }
  }
})
