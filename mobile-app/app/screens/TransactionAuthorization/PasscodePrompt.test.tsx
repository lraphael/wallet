import { render } from '@testing-library/react-native'
import React from 'react'
import { Status } from './TransactionAuthorization'
import { PasscodePrompt } from './PasscodePrompt'

jest.mock('../../contexts/ThemeProvider')
const StatusTypes: Status[] = ['INIT', 'IDLE', 'BLOCK', 'PIN', 'SIGNING']

describe('transaction authorization screen', () => {
  StatusTypes.forEach(type => {
    it(`should match snapshot of status: ${type}`, async () => {
      const mockTransaction = {
        sign: jest.fn()
      }
      const onCancel = jest.fn
      const onPinInput = jest.fn
      const rendered = render(
        <PasscodePrompt
          onCancel={onCancel}
          message='foo'
          transaction={mockTransaction}
          status={type}
          pinLength={6}
          onPinInput={onPinInput}
          pin='foo'
          loadingMessage='foo'
          isRetry
          attemptsRemaining={3}
          maxPasscodeAttempt={3}
        />
      )
      expect(rendered.toJSON()).toMatchSnapshot()
    })
  })
})