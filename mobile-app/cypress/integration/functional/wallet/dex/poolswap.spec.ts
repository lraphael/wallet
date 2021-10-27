import BigNumber from 'bignumber.js'

function setupWalletForConversion (): void {
  cy.createEmptyWallet(true)
  cy.getByTestID('bottom_tab_dex').click().wait(3000)
  cy.getByTestID('close_dex_guidelines').click()
  cy.sendDFItoWallet()
    .sendDFITokentoWallet().wait(3000)

  cy.getByTestID('bottom_tab_dex').click().wait(3000)
  cy.getByTestID('pool_pair_swap-horiz_dBTC-DFI').click()
  cy.wait(100)
  cy.getByTestID('text_balance_tokenB').contains('20')
}

context('Wallet - DEX - Pool Swap without balance', () => {
  before(function () {
    cy.createEmptyWallet(true)
    cy.getByTestID('bottom_tab_balances').click()
  })

  it('should be able to validate empty form', function () {
    cy.getByTestID('bottom_tab_dex').click()
    cy.getByTestID('close_dex_guidelines').click()
    cy.getByTestID('pool_pair_swap-horiz_dLTC-DFI').click()
    cy.getByTestID('button_submit').should('have.attr', 'aria-disabled')
  })

  it('should not have negative amount', function () {
    cy.getByTestID('swap_button').click()
    cy.getByTestID('text_balance_tokenA').should('have.text', '0.00000000 DFI')
    cy.getByTestID('MAX_amount_button').click()
    cy.getByTestID('text_input_tokenA').should('have.value', '0.00000000')
  })
})

context('Wallet - DEX - Pool Swap with balance', () => {
  before(function () {
    cy.createEmptyWallet(true)
    cy.getByTestID('header_settings').click()
    cy.sendDFItoWallet().sendDFITokentoWallet().sendTokenToWallet(['LTC']).wait(3000)
    cy.fetchWalletBalance()
    cy.getByTestID('bottom_tab_balances').click()
    cy.getByTestID('bottom_tab_dex').click()
    cy.getByTestID('close_dex_guidelines').click()
    cy.getByTestID('pool_pair_swap-horiz_dLTC-DFI').click()
  })

  it('should be able to click swap button', function () {
    cy.getByTestID('text_balance_tokenA').contains('10.00000000 dLTC')
    cy.getByTestID('text_balance_tokenB').contains('20.00000000 DFI')
    cy.getByTestID('swap_button').click().wait(4000)
  })

  it('should be able to validate form', function () {
    // Valid form
    cy.getByTestID('text_input_tokenA').type('1')
    cy.getByTestID('estimated').then(($txt: any) => {
      const tokenValue = $txt[0].textContent.replace(' dLTC', '').replace(',', '')
      cy.getByTestID('text_input_tokenB').should('have.value', new BigNumber(tokenValue).toFixed(8))
      cy.getByTestID('button_submit').should('not.have.attr', 'disabled')

      // Invalid tokenA - NaN, more than Max, zero
      cy.getByTestID('text_input_tokenA_clear_button').click()
      cy.getByTestID('text_input_tokenA').type('a').blur().wait(100)
      cy.getByTestID('text_input_tokenA').should('have.value', '0')
      cy.getByTestID('text_input_tokenB').should('have.value', new BigNumber(0).toFixed(8))
      cy.getByTestID('button_submit').should('have.attr', 'aria-disabled')
      cy.getByTestID('text_input_tokenA_clear_button').click()
      cy.getByTestID('text_input_tokenA').type('15').blur().wait(100)
      cy.getByTestID('conversion_info_text').should('exist')
      cy.getByTestID('button_submit').should('not.have.attr', 'disabled')
      cy.getByTestID('text_input_tokenA_clear_button').click()
      cy.getByTestID('text_input_tokenA').type('0').blur().wait(100)
      cy.getByTestID('button_submit').should('have.attr', 'aria-disabled')
    })
  })

  it('should be able to click max', function () {
    cy.getByTestID('MAX_amount_button').click().wait(3000)
    cy.getByTestID('text_input_tokenA').should('have.value', '19.90000000')
    cy.getByTestID('estimated').then(($txt: any) => {
      const tokenValue = $txt[0].textContent.replace(' dLTC', '').replace(',', '')
      cy.getByTestID('text_input_tokenB').should('have.value', new BigNumber(tokenValue).toFixed(8))
    })
  })

  it('should be able to click half', function () {
    cy.getByTestID('50%_amount_button').click().wait(500)
    cy.getByTestID('text_input_tokenA').should('have.value', '9.95000000').wait(3000)
    cy.getByTestID('estimated').then(($txt: any) => {
      const tokenValue = $txt[0].textContent.replace(' dLTC', '').replace(',', '')
      cy.getByTestID('text_input_tokenB').should('have.value', new BigNumber(tokenValue).toFixed(8))
    })
  })

  it('should be able to use/validate custom slippage tolerance', function () {
    cy.getByTestID('slippage_select').click()
    cy.getByTestID('slippage_1%').should('exist')

    // Slippage warning
    cy.getByTestID('slippage_Custom').click()
    cy.getByTestID('slippage_input').clear().type('21')
    cy.getByTestID('slippage_warning').should('exist')
    cy.getByTestID('slippage_input').clear().type('5')
    cy.getByTestID('slippage_warning').should('not.exist')

    // Slippage validation
    cy.getByTestID('slippage_Custom').click()
    cy.getByTestID('slippage_input').should('have.value', '5')
    cy.getByTestID('slippage_input').clear().type('101').blur().wait(100)
    cy.getByTestID('slippage_input_error').should('have.text', 'This field must be from 0-100%')
    cy.getByTestID('slippage_input').clear()
    cy.getByTestID('slippage_input_error').should('have.text', 'Required field is missing')
    cy.getByTestID('slippage_input').clear().type('-1').blur().wait(100)
    cy.getByTestID('slippage_input_error').should('have.text', 'This field must be from 0-100%')
    cy.getByTestID('slippage_input').clear().type('a1').blur().wait(100)
    cy.getByTestID('slippage_input_error').should('have.text', 'This field must be from 0-100%')
    cy.getByTestID('button_tolerance_submit').should('have.attr', 'disabled')

    cy.getByTestID('slippage_input').clear().type('25').blur().wait(100)
    cy.getByTestID('button_tolerance_submit').click()
  })
})

context('Wallet - DEX - Pool Swap with balance Confirm Txn', () => {
  beforeEach(function () {
    cy.createEmptyWallet(true)
    cy.getByTestID('header_settings').click()
    cy.sendDFItoWallet().sendDFITokentoWallet().sendTokenToWallet(['LTC']).wait(3000)
    cy.fetchWalletBalance()
    cy.getByTestID('bottom_tab_balances').click()
    cy.getByTestID('bottom_tab_dex').click()
    cy.getByTestID('close_dex_guidelines').click()
    cy.getByTestID('pool_pair_swap-horiz_dLTC-DFI').click()
  })

  it('should be able to swap', function () {
    cy.getByTestID('swap_button').click().wait(4000)
    cy.getByTestID('text_input_tokenA').type('10')
    cy.getByTestID('slippage_select').click()
    cy.getByTestID('slippage_10%').click()
    cy.getByTestID('button_tolerance_submit').click()
    cy.getByTestID('estimated').then(($txt: any) => {
      const tokenValue = $txt[0].textContent.replace(' dLTC', '').replace(',', '')
      cy.getByTestID('button_submit').click()
      cy.getByTestID('slippage_fee').contains('10')
      cy.getByTestID('slippage_fee_suffix').contains('%')
      cy.getByTestID('confirm_title').contains('You are swapping')
      cy.getByTestID('button_confirm_swap').click().wait(3000)
      cy.closeOceanInterface()
      cy.fetchWalletBalance()
      cy.getByTestID('bottom_tab_balances').click()
      cy.getByTestID('balances_row_4').should('exist')

      cy.getByTestID('balances_row_4_amount').then(($txt: any) => {
        const balanceAmount = $txt[0].textContent.replace(' dLTC', '').replace(',', '')
        expect(new BigNumber(balanceAmount).toNumber()).be.gte(new BigNumber(tokenValue).toNumber())
      })
    })
  })

  it('should be able to swap correctly when user cancel a tx and updated some inputs', function () {
    cy.getByTestID('swap_button').click().wait(4000)
    cy.getByTestID('text_input_tokenA').type('1')
    cy.getByTestID('slippage_select').click()
    cy.getByTestID('slippage_1%').click()
    cy.getByTestID('button_tolerance_submit').click()
    cy.getByTestID('estimated').then(($txt: any) => {
      $txt[0].textContent.replace(' dLTC', '').replace(',', '')
      cy.getByTestID('button_submit').click()
      cy.getByTestID('slippage_fee').contains('1')
      cy.getByTestID('slippage_fee_suffix').contains('%')
      cy.getByTestID('confirm_title').contains('You are swapping')
      cy.getByTestID('button_confirm_swap').click().wait(3000)
      // Cancel send on authorisation page
      cy.getByTestID('cancel_authorization').click()
      cy.getByTestID('button_cancel_swap').click()
      // Update input values
      cy.getByTestID('text_input_tokenA_clear_button').click()
      cy.getByTestID('text_input_tokenA').type('10')
      cy.getByTestID('slippage_select').click()
      cy.getByTestID('slippage_10%').click()
      cy.getByTestID('button_tolerance_submit').click()
      cy.getByTestID('estimated').then(($txt: any) => {
        const updatedTokenValue = $txt[0].textContent.replace(' dLTC', '').replace(',', '')
        cy.getByTestID('button_submit').click()
        cy.getByTestID('slippage_fee').contains('10')
        cy.getByTestID('slippage_fee_suffix').contains('%')
        cy.getByTestID('confirm_title').contains('You are swapping')
        cy.getByTestID('button_confirm_swap').click().wait(3000)
        cy.closeOceanInterface()
        cy.fetchWalletBalance()
        cy.getByTestID('bottom_tab_balances').click()
        cy.getByTestID('balances_row_4').should('exist')

        cy.getByTestID('balances_row_4_amount').then(($txt: any) => {
          const balanceAmount = $txt[0].textContent.replace(' dLTC', '').replace(',', '')
          expect(new BigNumber(balanceAmount).toNumber()).be.gte(new BigNumber(updatedTokenValue).toNumber())
        })
      })
    })
  })
})

context('Wallet - DEX - Pool Swap failed api', () => {
  before(function () {
    cy.createEmptyWallet(true)
  })

  it('should handle failed API calls', function () {
    cy.intercept('**/regtest/poolpairs**', {
      statusCode: 404,
      body: '404 Not Found!',
      headers: {
        'x-not-found': 'true'
      }
    })
    cy.getByTestID('bottom_tab_dex').click()
    cy.getByTestID('close_dex_guidelines').click()
    cy.getByTestID('pool_pair_row').should('not.exist')
  })
})

context('Wallet - DEX - Pool Swap with Conversion', () => {
  beforeEach(function () {
    setupWalletForConversion()
  })

  it('should be able to display conversion info', function () {
    cy.getByTestID('swap_button').click()
    cy.getByTestID('text_balance_tokenA').contains('19.90000000')
    cy.getByTestID('text_input_tokenA').type('11.00000000')
    cy.getByTestID('conversion_info_text').should('exist')
    cy.getByTestID('conversion_info_text').should('contain', 'Conversion will be required. Your passcode will be asked to authorize both transactions.')
    cy.getByTestID('amount_to_convert_label').contains('Amount to be converted')
    cy.getByTestID('amount_to_convert').contains('1.00000000')
    cy.getByTestID('transaction_details_hint_text').contains('Authorize transaction in the next screen to convert')
  })

  it('should trigger convert and add liquidity', function () {
    cy.getByTestID('swap_button').click()
    cy.getByTestID('text_input_tokenA').type('11.00000000')
    cy.getByTestID('button_submit').click()
    cy.getByTestID('txn_authorization_description')
      .contains(`Converting ${new BigNumber('1').toFixed(8)} UTXO to Token`)
    cy.closeOceanInterface().wait(3000)
    cy.getByTestID('conversion_tag').should('exist')

    cy.getByTestID('text_swap_amount').should('contain', '11.00000000')
    cy.getByTestID('button_confirm_swap').click().wait(3000)
    cy.closeOceanInterface()
  })
})
