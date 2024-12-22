import {
  Filesystem,
  Directory,
  Encoding,
  WriteFileResult,
} from '@capacitor/filesystem'

export const writeFile = async (
  data: string,
  directory: Directory,
  path: string
) => {
  return await Filesystem.writeFile({
    path: path,
    data: data,
    directory: directory,
    encoding: Encoding.UTF8,
  })
}

export const readFileToData = async (directory: Directory, path: string) => {
  const result = await Filesystem.readFile({
    path: path,
    directory: directory,
    encoding: Encoding.UTF8,
  })
  return result.data as string
}

export const deleteFile = async (directory: Directory, path: string) => {
  await Filesystem.deleteFile({
    path: path,
    directory: directory,
  })
}

export const writeNodeTypeFile = async (
  file: File,
  directory: Directory,
  path: string
): Promise<WriteFileResult> => {
  // FileReaderを使用してファイルの内容を読み取る
  const reader = new FileReader()
  reader.readAsDataURL(file)

  return new Promise((resolve, reject) => {
    reader.onload = async () => {
      try {
        // ファイルの内容をbase64形式で取得
        const data = reader.result as string

        // Filesystemプラグインを使用してファイルを保存
        const savedFile = await writeFile(data, directory, path)

        console.log('File saved:', savedFile.uri)
        resolve(savedFile)
      } catch (error) {
        console.error('Error saving file:', error)
        reject(error)
      }
    }
    reader.onerror = (error) => reject(error)
  })
}

export const readFileToBlob = async (directory: Directory, path: string) => {
  try {
    // ファイルを読み取る
    const data = await readFileToData(directory, path)

    // dataをBlobに変換
    const response = await fetch(data)
    const blob = await response.blob()

    return blob
  } catch (error) {
    console.error('Error reading file or converting to Blob:', error)
    throw error
  }
}
