import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import FormField from '@/components/FormField'
import { createVideoPlayer, VideoView } from 'expo-video'
import { icons } from '@/constants'
import CustomButton from '@/components/CustomButton'
import * as ImagePicker from 'expo-image-picker'
import { router } from 'expo-router'
import { createVideo } from '@/lib/appwrite'
import { useGlobalContext } from '@/context/GlobalProvider'

const Create = () => {
  const { user } = useGlobalContext()
  const [uploading, setUploading] = useState<boolean>(false)
  const [form, setForm] = useState<{
    title: string
    video: { uri: string } | null
    thumbnail: { uri: string } | null
    prompt: string
  }>({
    title: '',
    video: null,
    thumbnail: null,
    prompt: '',
  })
  const [videoUri, setVideoUri] = useState<string>('')

  const player = createVideoPlayer(videoUri)

  useEffect(() => {
    if (videoUri) {
      player.play()
      player.loop = true
    }
  }, [videoUri])

  const uploadVideoToCloudinary = async (videoUri: string) => {
    const data = new FormData()
    data.append('file', {
      uri: videoUri,
      type: 'video/mp4',
      name: 'upload.mp4',
    } as unknown as Blob)
    data.append('upload_preset', 'preset_wan')
    data.append('cloud_name', 'dhs53hznm')
    data.append('resource_type', 'video')

    try {
      let uploadResponse = await fetch(
        'https://api.cloudinary.com/v1_1/dhs53hznm/video/upload',
        {
          method: 'POST',
          body: data,
        },
      )

      let result = await uploadResponse.json()

      return result.secure_url.replace('.mov', '.mp4')
    } catch (error) {
      if (error instanceof Error)
        Alert.alert('Cloudinary upload failed', error.message)
      return null
    }
  }

  const openPicker = async (selectType: string) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images', 'videos'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    })

    if (!result.canceled) {
      if (selectType === 'image')
        setForm({ ...form, thumbnail: result.assets[0] })

      if (selectType === 'video') {
        let selectedAsset = result.assets[0]
        selectedAsset = {
          ...selectedAsset,
          // uri: selectedAsset.uri,
          uri: await uploadVideoToCloudinary(result.assets[0].uri),
        }

        setForm((prevForm) => ({
          ...prevForm,
          video: selectedAsset,
        }))

        setVideoUri(result.assets[0].uri)
      }
    }
  }

  const submit = async () => {
    if (!form.prompt || !form.title || !form.thumbnail || !form.video)
      return Alert.alert('Please fill in all the fields')

    setUploading(true)

    try {
      await createVideo({ ...form, userId: user.$id })

      Alert.alert('Success', 'Post uploaded successfully')

      router.push('/home')
    } catch (error) {
      if (error instanceof Error) Alert.alert('Error', error.message)
    } finally {
      setForm({
        title: '',
        video: null,
        thumbnail: null,
        prompt: '',
      })

      setUploading(false)
    }
  }

  return (
    <SafeAreaView className={'bg-primary h-full'}>
      <ScrollView className={'px-4 my-6'}>
        <Text className={'text-2xl text-white font-psemibold'}>
          Upload Video
        </Text>

        <FormField
          title={'Video Title'}
          value={form.title}
          placeholder={'Give your video a catch title...'}
          handleChangeText={(e) => setForm({ ...form, title: e })}
          otherStyles={'mt-10'}
        />

        <View className={'mt-7 space-y-2'}>
          <Text className={'text-base text-gray-100 font-pmedium'}>
            Upload Video
          </Text>

          <TouchableOpacity
            disabled={!!form.video}
            onPress={() => openPicker('video')}
          >
            {form.video ? (
              <VideoView
                style={{
                  width: '100%',
                  height: 256,
                  borderRadius: 16,
                }}
                player={player}
                nativeControls={true}
                contentFit={'cover'}
              />
            ) : (
              <View
                className={
                  'w-full h-40 px-4 bg-black-100 rounded-2xl justify-center items-center'
                }
              >
                <View
                  className={
                    'w-14 h-14 border border-dashed border-secondary-100 justify-center items-center'
                  }
                >
                  <Image
                    source={icons.upload}
                    resizeMode={'contain'}
                    className={'w-1/2 h-1/2'}
                  />
                </View>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <View className={'mt-7 space-y-2'}>
          <Text className={'text-base text-gray-100 font-pmedium'}>
            Thumbnail Image
          </Text>

          <TouchableOpacity
            disabled={!!form.thumbnail}
            onPress={() => openPicker('image')}
          >
            {form.thumbnail ? (
              <Image
                source={{ uri: form.thumbnail.uri }}
                resizeMode={'cover'}
                className={'w-full h-64 rounded-2xl'}
              />
            ) : (
              <View
                className={
                  'w-full h-16 px-4 bg-black-100 rounded-2xl justify-center items-center border-2 border-black-200 flex-row gap-x-2'
                }
              >
                <Image
                  source={icons.upload}
                  resizeMode={'contain'}
                  className={'w-5 h-5'}
                />

                <Text className={'text-sm text-gray-100 font-pmedium'}>
                  Choose a file
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <FormField
          title={'AI Prompt'}
          value={form.prompt}
          placeholder={'The prompt you used to create this video'}
          handleChangeText={(e) => setForm({ ...form, prompt: e })}
          otherStyles={'mt-7'}
        />

        <CustomButton
          title={'Submit & Publish'}
          handlePress={submit}
          containerStyles={'mt-7'}
          isLoading={uploading}
        />
      </ScrollView>
    </SafeAreaView>
  )
}

export default Create
