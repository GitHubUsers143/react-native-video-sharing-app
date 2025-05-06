import {
  Account,
  Avatars,
  Client,
  Databases,
  ID,
  ImageGravity,
  Query,
  Storage,
} from 'react-native-appwrite'
import type { Models } from 'react-native-appwrite'

export const config = {
  endpoint: 'https://cloud.appwrite.io/v1',
  // platform: 'com.dm.dmaroa',
  platform: 'com.dm.aora',
  projectId: '67ab2450001180d6dbf8',
  databaseId: '67ab2560001650faef37',
  userCollectionId: '67ab26070005dec210e3',
  videoCollectionId: '67ab2625001a688eb656',
  storageId: '67ab28c100364df92098',
}

const { databaseId, videoCollectionId, storageId } = config

const client = new Client()

client
  .setEndpoint(config.endpoint)
  .setProject(config.projectId)
  .setPlatform(config.platform)

const account = new Account(client)
const avatars = new Avatars(client)
const databases = new Databases(client)
const storage = new Storage(client)

type Post = {
  $id: string
  title: string
  thumbnail: string
  video: string
  prompt: string
  creator: {
    username: string
    avatar: string
  }
}

type FileType = {
  uri: string
  mimeType: string
  fileSize: number
}

type FormData = {
  title: string
  thumbnail: FileType
  video: FileType
  prompt: string
  userId: string
}

export const createUser = async (
  email: string,
  password: string,
  username: string,
) => {
  const newAccount = await account.create(
    ID.unique(),
    email,
    password,
    username,
  )

  if (!newAccount) throw new Error('Account creation failed')

  const avatarUrl = avatars.getInitials(username)

  await account.createEmailPasswordSession(email, password)

  return await databases.createDocument(
    config.databaseId,
    config.userCollectionId,
    ID.unique(),
    {
      accountId: newAccount.$id,
      email,
      username,
      avatar: avatarUrl,
    },
  )
}

export const signIn = async (email: string, password: string) => {
  try {
    return await account.createEmailPasswordSession(email, password)
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message)
    }
  }
}

export const getCurrentUser = async () => {
  try {
    const currentAccount = await account.get()

    const currentUser = await databases.listDocuments(
      config.databaseId,
      config.userCollectionId,
      [Query.equal('accountId', currentAccount.$id)],
    )

    return currentUser.documents[0]
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message)
    }
  }
}

export const getAllPosts = async (): Promise<Post[]> => {
  try {
    const posts = await databases.listDocuments(databaseId, videoCollectionId, [
      Query.orderDesc('$createdAt'),
    ])

    return posts.documents.map((doc: Models.Document) => ({
      $id: doc.$id,
      title: doc.title,
      thumbnail: doc.thumbnail,
      video: doc.video,
      prompt: doc.prompt,
      creator: doc.creator,
    }))
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message)
    }
    return []
  }
}

export const getLatestPosts = async (): Promise<Post[]> => {
  try {
    const posts = await databases.listDocuments(databaseId, videoCollectionId, [
      Query.orderDesc('$createdAt'),
      Query.limit(7),
    ])

    return (
      posts?.documents.map((doc) => ({
        $id: doc.$id,
        title: doc.title,
        thumbnail: doc.thumbnail,
        video: doc.video,
        prompt: doc.prompt,
        creator: doc.creator,
      })) ?? []
    )
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message)
    }
    return []
  }
}

export const searchPosts = async (query: string): Promise<Post[]> => {
  try {
    const posts = await databases.listDocuments(databaseId, videoCollectionId, [
      Query.search('title', query),
    ])

    return posts.documents.map((doc: Models.Document) => ({
      $id: doc.$id,
      title: doc.title,
      thumbnail: doc.thumbnail,
      video: doc.video,
      prompt: doc.prompt,
      creator: doc.creator,
    }))
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message)
    }
    return []
  }
}

export const getUserPosts = async (userId: string): Promise<Post[]> => {
  try {
    const posts = await databases.listDocuments(databaseId, videoCollectionId, [
      Query.equal('creator', userId),
      Query.orderDesc('$createdAt'),
    ])

    return posts.documents.map((doc: Models.Document) => ({
      $id: doc.$id,
      title: doc.title,
      thumbnail: doc.thumbnail,
      video: doc.video,
      prompt: doc.prompt,
      creator: doc.creator,
    }))
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message)
    }

    return []
  }
}

export const signOut = async () => {
  try {
    return await account.deleteSession('current')
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message)
    }
  }
}

export const getFilePreview = async (
  fileId: string,
  type: 'video' | 'image',
) => {
  let fileUrl

  try {
    if (type === 'video') fileUrl = storage.getFilePreview(storageId, fileId)
    else if (type === 'image')
      fileUrl = storage.getFilePreview(
        storageId,
        fileId,
        2000,
        2000,
        ImageGravity.Top,
        100,
      )
    // else throw new Error('Invalid file type')
    //
    // if (!fileUrl) throw new Error('Failed to generate file preview')

    return fileUrl
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message)
    }
  }
}

export const uploadFile = async (file: FileType, type: 'video' | 'image') => {
  if (!file) return

  const asset = {
    name: 'imageFile',
    type: file.mimeType,
    size: file.fileSize,
    uri: file.uri,
  }

  try {
    const uploadedFile = await storage.createFile(storageId, ID.unique(), asset)

    const fileUrl = await getFilePreview(uploadedFile.$id, type)

    return fileUrl
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message)
    }
  }
}

export const createVideo = async (form: FormData) => {
  try {
    const [thumbnailUrl] = await Promise.all([
      uploadFile(form.thumbnail, 'image'),
    ])

    let newUrl = new URL(thumbnailUrl ?? '')
    newUrl.pathname = newUrl.pathname.replace('/preview', '/view')
    newUrl.searchParams.delete('width')
    newUrl.searchParams.delete('height')
    newUrl.searchParams.delete('gravity')
    newUrl.searchParams.delete('quality')

    return await databases.createDocument(
      databaseId,
      videoCollectionId,
      ID.unique(),
      {
        title: form.title,
        thumbnail: newUrl.toString(),
        video: form.video.uri,
        prompt: form.prompt,
        creator: form.userId,
      },
    )
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message)
    }
  }
}
