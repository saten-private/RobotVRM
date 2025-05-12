import { BleClient, BleDevice } from '@capacitor-community/bluetooth-le'

// HC-02におけるSERVICE_UUIDとCHARACTERISTIC_UUID
export const SERVICE_UUID = '49535343-fe7d-4ae5-8fa9-9fafd205e455'
export const CHARACTERISTIC_UUID = '49535343-8841-43f4-a8d4-ecbe34729bb3'

let device: BleDevice | null = null

export const scanAndConnectBle = async (): Promise<void> => {
  try {
    await BleClient.initialize({ androidNeverForLocation: true })
    const scannedDevice = await BleClient.requestDevice({ namePrefix: 'HC-02' })
    if (scannedDevice.name === 'HC-02') {
      await connectToDeviceBle(scannedDevice)
      return
    }
    throw new Error('HC-02 not found')
  } catch (error) {
    console.error('Error scanning for devices', error)
    throw error
  }
}

const connectToDeviceBle = async (scannedDevice: BleDevice): Promise<void> => {
  try {
    await BleClient.connect(scannedDevice.deviceId)
    const services = await BleClient.getServices(scannedDevice.deviceId)
    device = scannedDevice
    console.log('Connected to device', scannedDevice.deviceId)
    logServices(services)
  } catch (error) {
    console.error('Error connecting to device', error)
    throw error
  }
}

const logServices = (services: any[]): void => {
  services.forEach((service) => {
    console.log('GATT Service UUID:', service.uuid)
    service.characteristics.forEach((characteristic: any) => {
      console.log('Characteristic UUID:', characteristic.uuid)
    })
  })
}

export const sendDataBle = async (dataString: string): Promise<void> => {
  if (!device) {
    throw new Error('No device connected')
  }

  try {
    const dataBuffer = stringToArrayBuffer(dataString)
    await BleClient.write(
      device.deviceId,
      SERVICE_UUID,
      CHARACTERISTIC_UUID,
      dataBuffer as unknown as DataView // dataBufferをそのまま送りたいが、DataViewに変換する必要があるため強引に変換
    )
    console.log('Data sent successfully dataString=', dataString)
  } catch (error) {
    console.error('Error sending data', error)
    throw error
  }
}

export const disconnectBle = async (): Promise<void> => {
  if (device) {
    try {
      await BleClient.disconnect(device.deviceId)
      device = null
      console.log('Disconnected from device')
    } catch (error) {
      console.error('Error disconnecting from device', error)
      throw error
    }
  }
}

const stringToArrayBuffer = (str: string): Uint8Array => {
  return new TextEncoder().encode(str)
}

export const isConnectedBle = (): boolean => {
  return device !== null
}
