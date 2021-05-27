import { configureStore } from '@reduxjs/toolkit'
import { counterSlice } from './liquidity'

/**
 * RootState for DeFi Wallet App
 *
 * All state reducer in this store must be designed by global use and placed in this
 * directory as such. Reducer that are not meant to be global must not be part of
 * RootState. State should be managed independently within the React Component.
 */
export const store = configureStore({
  reducer: {
    counter: counterSlice.reducer
  }
})

export type RootState = ReturnType<typeof store.getState>