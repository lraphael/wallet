import { CTransactionSegWit, TransactionSegWit } from '@defichain/jellyfish-transaction/dist'
import { WhaleWalletAccount } from '@defichain/whale-api-wallet'
import { NavigationProp, StackActions, useNavigation } from '@react-navigation/native'
import { StackScreenProps } from '@react-navigation/stack'
import BigNumber from 'bignumber.js'
import React, { Dispatch, useEffect, useState } from 'react'
import { ScrollView } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import { Logging } from '../../../../../api'
import {
  ConfirmTitle,
  NumberRow,
  SubmitButtonGroup,
  TokenBalanceRow
} from '../../../../../components/ConfirmComponents'
import { SectionTitle } from '../../../../../components/SectionTitle'
import { RootState } from '../../../../../store'
import { hasTxQueued, transactionQueue } from '../../../../../store/transaction_queue'
import { tailwind } from '../../../../../tailwind'
import { translate } from '../../../../../translations'
import { BalanceParamList } from '../BalancesNavigator'
import { ConversionMode } from './ConvertScreen'

type Props = StackScreenProps<BalanceParamList, 'ConvertConfirmationScreen'>

export function ConvertConfirmationScreen ({ route }: Props): JSX.Element {
  const { sourceUnit, sourceBalance, targetUnit, targetBalance, mode, amount, fee } = route.params
  const hasPendingJob = useSelector((state: RootState) => hasTxQueued(state.transactionQueue))
  const dispatch = useDispatch()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigation = useNavigation<NavigationProp<BalanceParamList>>()
  const [isOnPage, setIsOnPage] = useState<boolean>(true)
  const postAction = (): void => {
    if (isOnPage) {
      navigation.dispatch(StackActions.popToTop())
    }
  }

  useEffect(() => {
    setIsOnPage(true)
    return () => {
      setIsOnPage(false)
    }
  }, [])

  async function onSubmit (): Promise<void> {
    if (hasPendingJob) {
      return
    }
    setIsSubmitting(true)
    await constructSignedConversionAndSend({ mode, amount }, dispatch, postAction)
    setIsSubmitting(false)
  }

  function onCancel (): void {
    if (!isSubmitting) {
      navigation.navigate({
        name: 'Convert',
        params: {
          mode
        },
        merge: true
      })
    }
  }

  return (
    <ScrollView style={tailwind('bg-gray-100 pb-4')}>
      <ConfirmTitle
        title={translate('screens/ConvertConfirmationScreen', 'YOU ARE CONVERTING')}
        testID='text_convert_amount' amount={amount}
        suffix={` ${mode === 'utxosToAccount' ? 'DFI (UTXO)' : 'DFI (Token)'}`}
      />
      <SectionTitle
        text={translate('screens/ConvertConfirmationScreen', 'AFTER CONVERSION, YOU WILL HAVE:')}
        testID='title_conversion_detail'
      />
      <TokenBalanceRow
        iconType={sourceUnit === 'UTXO' ? '_UTXO' : 'DFI'}
        lhs={translate('screens/ConvertConfirmationScreen', sourceUnit)}
        rhs={{ value: sourceBalance.toFixed(8), testID: 'source_amount' }}
      />
      <TokenBalanceRow
        iconType={targetUnit === 'UTXO' ? '_UTXO' : 'DFI'}
        lhs={translate('screens/ConvertConfirmationScreen', targetUnit)}
        rhs={{ value: targetBalance.toFixed(8), testID: 'target_amount' }}
      />
      <NumberRow
        lhs={translate('screens/ConvertConfirmationScreen', 'Estimated fee')}
        rhs={{ value: fee.toFixed(8), suffix: ' DFI (UTXO)', testID: 'text_fee' }}
      />
      <SubmitButtonGroup
        onSubmit={onSubmit} onCancel={onCancel} title='convert'
        label={translate('screens/SendConfirmationScreen', 'CONVERT')}
        isDisabled={isSubmitting || hasPendingJob}
      />
    </ScrollView>
  )
}

async function constructSignedConversionAndSend ({
  mode,
  amount
}: { mode: ConversionMode, amount: BigNumber }, dispatch: Dispatch<any>, postAction: () => void): Promise<void> {
  try {
    const signer = async (account: WhaleWalletAccount): Promise<CTransactionSegWit> => {
      const script = await account.getScript()
      const builder = account.withTransactionBuilder()
      let signed: TransactionSegWit
      if (mode === 'utxosToAccount') {
        signed = await builder.account.utxosToAccount({
          to: [{
            script,
            balances: [
              { token: 0, amount }
            ]
          }]
        }, script)
      } else {
        signed = await builder.account.accountToUtxos({
          from: script,
          balances: [
            { token: 0, amount }
          ],
          mintingOutputsStart: 2 // 0: DfTx, 1: change, 2: minted utxos (mandated by jellyfish-tx)
        }, script)
      }
      return new CTransactionSegWit(signed)
    }

    dispatch(transactionQueue.actions.push({
      sign: signer,
      title: `${translate('screens/ConvertScreen', 'Converting DFI')}`,
      description: `${translate('screens/ConvertScreen', `Converting ${amount.toFixed(8)} ${mode === 'utxosToAccount' ? 'UTXO to Token' : 'Token to UTXO'}`)}`,
      postAction
    }))
  } catch (e) {
    Logging.error(e)
  }
}