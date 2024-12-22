import React, { useState, useCallback, useEffect } from 'react'
import {
  scanAndConnectBle,
  disconnectBle,
} from '@/services/bluetooth/bluetoothLeService'
import { IconButton } from './iconButton'
import homeStore from '@/features/stores/home'
import { hasLlmApiKey } from '@/features/chat/hasLlmApiKey'
import { BluetoothConfirmPopup } from './bluetooth/BluetoothConfirmPopup'

export const Bluetooth = () => {
  const validateApiKey = homeStore((s) => s.validateApiKey)
  const doNotShowBluetoothPopup = homeStore((s) => s.doNotShowBluetoothPopup)
  const [hasApiKey, setHasApiKey] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showPopup, setShowPopup] = useState(false)

  const handleToggle = async () => {
    try {
      if (isConnected) {
        setIsLoading(true)
        await disconnectBle()
        setIsConnected(false)
      } else {
        if (doNotShowBluetoothPopup) {
          setIsLoading(true)
          await scanAndConnectBle()
          setIsConnected(true)
        } else {
          setShowPopup(true)
        }
      }
    } catch (error) {
      console.error('Bluetooth operation failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleConfirm = async (doNotShowAgain: boolean) => {
    if (doNotShowAgain) {
      homeStore.setState({ doNotShowBluetoothPopup: true })
    }
    setShowPopup(false)
    try {
      setIsLoading(true)
      await scanAndConnectBle()
      setIsConnected(true)
    } catch (error) {
      console.error('Bluetooth connection failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    setShowPopup(false)
  }

  const checkAPIKey = useCallback(async () => {
    setHasApiKey(await hasLlmApiKey())
  }, [])

  useEffect(() => {
    if (validateApiKey) {
      checkAPIKey()
    }
  }, [checkAPIKey, validateApiKey])

  return (
    <>
      <IconButton
        iconName={isLoading ? '24/Roll' : '24/Emoji'}
        className={
          isLoading
            ? ''
            : isConnected
              ? 'bg-secondary hover:bg-secondary-hover active:bg-secondary-press disabled:bg-secondary-disabled'
              : ''
        }
        disabled={!hasApiKey}
        isProcessing={false}
        onClick={handleToggle}
      >
        {isLoading
          ? 'Processing...'
          : isConnected
            ? 'Disconnect'
            : 'Ble Connect'}
      </IconButton>

      {showPopup && (
        <BluetoothConfirmPopup
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      )}
    </>
  )
}
